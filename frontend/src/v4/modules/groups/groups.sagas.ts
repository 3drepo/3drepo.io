/**
 *  Copyright (C) 2017 3D Repo Ltd
 *
 *  This program is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU Affero General Public License as
 *  published by the Free Software Foundation, either version 3 of the
 *  License, or (at your option) any later version.
 *
 *  This program is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU Affero General Public License for more details.
 *
 *  You should have received a copy of the GNU Affero General Public License
 *  along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

import { cloneDeep } from 'lodash';
import { call, all, put, select, take, takeLatest } from 'redux-saga/effects';

import { takeEveryInOrder } from '@/v5/helpers/sagas.helpers';
import { dispatch, getState } from '@/v5/helpers/redux.helpers';
import { getRandomRgbColor, hexToGLColor } from '@/v5/helpers/colors.helper';
import { CHAT_CHANNELS } from '../../constants/chat';
import { GROUPS_TYPES } from '../../constants/groups';
import { normalizeGroup, prepareGroup, prepareGroupWithCount } from '../../helpers/groups';
import { calculateTotalMeshes } from '../../helpers/tree';
import * as API from '../../services/api';
import { MultiSelect } from '../../services/viewer/multiSelect';
import { Viewer } from '../../services/viewer/viewer';
import { ChatActions } from '../chat';
import { selectCurrentUser } from '../currentUser';
import { DialogActions } from '../dialog';
import { SnackbarActions } from '../snackbar';
import { TreeActions, TreeTypes } from '../tree';
import { ViewpointsActions } from '../viewpoints';
import { selectNodesBySharedIds, showNodesBySharedIds } from '../tree/tree.sagas';
import { GroupsActions, GroupsTypes, INITIAL_CRITERIA_FIELD_STATE } from './groups.redux';
import {
	selectActiveGroupDetails,
	selectActiveGroupId,
	selectGroupsColourOverrides,
	selectEditingGroupDetails,
	selectFilteredGroups,
	selectGroups,
	selectGroupsMap,
	selectIsAllOverridden,
	selectShowDetails
} from './groups.selectors';

function* fetchGroups({teamspace, modelId, revision}) {
	yield put(GroupsActions.togglePendingState(true));
	try {
		yield take(TreeTypes.UPDATE_DATA_REVISION);
		const {data} = yield API.getGroups(teamspace, modelId, revision);
		const preparedGroups = yield all(data.map(prepareGroupWithCount));
		yield put(GroupsActions.fetchGroupsSuccess(preparedGroups));
	} catch (error) {
		yield put(DialogActions.showErrorDialog('get', 'groups', error));
	}
	yield put(GroupsActions.togglePendingState(false));
}

function* setActiveGroup({ group }) {
	try {
		const activeGroupId = yield select(selectActiveGroupId);
		if (group && group._id === activeGroupId) {
			return;
		}

		yield all([
			put(GroupsActions.selectGroup(group)),
			put(GroupsActions.setComponentState({ activeGroup: group ? group._id : null }))
		]);

	} catch (error) {
		yield put(DialogActions.showErrorDialog('set', 'group as active', error));
	}
}

function* resetActiveGroup() {
	try {
		const showDetailsEnabled = yield select(selectShowDetails);
		yield all([
			!showDetailsEnabled ? put(GroupsActions.setComponentState({ activeGroup: null })) : null,
			put(GroupsActions.clearSelectionHighlights(true))
		]);
	} catch (error) {
		yield put(DialogActions.showErrorDialog('reset', ' active group', error));
	}
}

function* highlightGroup({ group }) {
	try {
		const colour = group.color ? hexToGLColor(group.color) : Viewer.getDefaultHighlightColor();
		yield put(GroupsActions.addToHighlighted(group._id));

		if (group.objects && group.objects.length > 0) {
			const { objects } = group;
			yield call(showNodesBySharedIds, { objects });
			yield call(selectNodesBySharedIds, { objects, colour });
		}
	} catch (error) {
		yield put(DialogActions.showErrorDialog('higlight', 'group', error));
	}
}

function* dehighlightGroup({ group }) {
	try {
		yield put(GroupsActions.removeFromHighlighted(group._id));
		yield put(TreeActions.deselectNodesBySharedIds(group.objects));
	} catch (error) {
		yield put(DialogActions.showErrorDialog('dehiglight', 'group', error));
	}
}

function* clearSelectionHighlights({ shouldClearTree = true }) {
	try {
		yield put(GroupsActions.setComponentState({ highlightedGroups: new Set() }));
		if (shouldClearTree) {
			yield put(TreeActions.clearCurrentlySelected());
		}
	} catch (error) {
		yield put(DialogActions.showErrorDialog('clear', 'highlighted groups', error));
	}
}

function* selectGroup({ group = {} }) {
	try {
		yield Viewer.isViewerReady();

		const addGroup = MultiSelect.isAccumMode();
		const removeGroup = MultiSelect.isDecumMode();
		const multiSelect = addGroup || removeGroup;

		if (!multiSelect) {
			yield put(GroupsActions.clearSelectionHighlights(true));
		}

		if (removeGroup) {
			yield put(GroupsActions.dehighlightGroup(group));
		} else {
			yield put(GroupsActions.highlightGroup(group));
		}
	} catch (error) {
		yield put(DialogActions.showErrorDialog('select', 'group', error));
	}
}

function* deleteGroups({ teamspace, modelId, groups }) {
	try {
		yield API.deleteGroups(teamspace, modelId, groups);

		const groupsToDelete = groups.split(',');
		const colorOverrides = yield select(selectGroupsColourOverrides);
		const groupsMap = yield select(selectGroupsMap);
		const isShowDetails = yield select(selectShowDetails);
		const activeGroupId = yield select(selectActiveGroupId);

		const actions = [];

		groupsToDelete.forEach((groupId) => {
			const overriddenGroup = colorOverrides[groupId];
			const group = groupsMap[groupId];

			actions.push(put(GroupsActions.dehighlightGroup(group)));
			actions.push(put(GroupsActions.deleteGroupsSuccess([groupId])));

			if (overriddenGroup) {
				actions.push(put(GroupsActions.removeColorOverride(groupId)));
			}
		});

		yield all(actions);
		if (isShowDetails && groupsToDelete.includes(activeGroupId)) {
			yield put(GroupsActions.setComponentState({ activeGroup: null, showDetails: false }));
			const { name } = yield select(selectEditingGroupDetails);
			yield put(SnackbarActions.show(`Group ${name} removed.`));
		}
	} catch (error) {
		yield put(DialogActions.showErrorDialog('delete', 'groups', error));
	}
}

function* isolateGroups({ groupIds }) {
	try {
		const groupsMap = yield select(selectGroupsMap);

		const objects = groupIds.reduce((accumObjects, id) => {
			const group = groupsMap[id] || {objects: []};
			return [...accumObjects, ...group.objects];
		}, []);

		yield put(GroupsActions.clearSelectionHighlights(true));
		yield put(TreeActions.isolateNodesBySharedIds(objects));
	} catch (error) {
		yield put(DialogActions.showErrorDialog('isolate', 'groups', error));
	}
}

function* downloadGroups({ teamspace, modelId }) {
	try {
		const filteredGroups = yield select(selectFilteredGroups);
		const ids = filteredGroups.map((group) => group._id).join(',');
		const endpointBase =
			`${teamspace}/${modelId}/revision/master/head/groups/?noIssues=true&noRisks=true&noViews=true`;
		const endpoint = ids ? `${endpointBase}&ids=${ids}` : endpointBase;
		const modelName = Viewer.settings ? Viewer.settings.name : '';
		yield API.downloadJSON('groups', modelName, `${endpoint}&convertCoords=true`);
	} catch (error) {
		yield put(DialogActions.showErrorDialog('download', 'groups', error));
	}
}

function* exportGroups({ teamspace, modelId}) {
	try {
		const filteredGroups = yield select(selectFilteredGroups);
		const ids = filteredGroups.map(({_id}) => _id);
		const endpoint =
			`${teamspace}/${modelId}/groups/export`;
		const modelName = Viewer.settings ? Viewer.settings.name : '';
		yield API.downloadJSONHttpPost('groups', modelName, endpoint, {groups: ids});
	} catch (error) {
		yield put(DialogActions.showErrorDialog('export', 'groups', error));
	}
}

function* importGroups({ teamspace, modelId, file}) {
	try {
		const endpoint =
			`${teamspace}/${modelId}/groups/import`;
		const reader = new FileReader();
		reader.readAsText(file)

		yield new Promise((resolve, reject) => {
			reader.addEventListener("load", () => {
				API.default.post(endpoint, JSON.parse(reader.result as string)).then(resolve).catch(reject);
			}, false);
		});


	} catch (error) {
		yield put(DialogActions.showErrorDialog('import', 'groups', error));
	}
}


function* showDetails({ group }) {
	try {
		yield call(clearSelectionHighlights, {});
		yield call(highlightGroup, { group });
		yield put(GroupsActions.setComponentState({
			activeGroup: group._id,
			showDetails: true,
			editingGroup: cloneDeep(group),
			criteriaFieldState: INITIAL_CRITERIA_FIELD_STATE
		}));
	} catch (error) {
		yield put(DialogActions.showErrorDialog('display', 'group details', error));
	}
}

function* closeDetails() {
	try {
		const activeGroup = yield select(selectActiveGroupDetails);
		yield put(GroupsActions.highlightGroup(activeGroup));
		yield put(GroupsActions.setComponentState({ showDetails: false }));

	} catch (error) {
		yield put(DialogActions.showErrorDialog('close', 'group details', error));
	}
}

function* updateGroupFromChatService({group}) {
	const preparedGroup = yield prepareGroupWithCount(group);
	yield put(GroupsActions.updateGroupSuccess(preparedGroup));
}

function* createGroup({ teamspace, modelId, revision }) {
	yield put(GroupsActions.toggleDetailsPendingState(true));
	try {
		const isAllOverridden = yield select(selectIsAllOverridden);
		const currentUser = yield select(selectCurrentUser);
		const editingGroupDetails = yield select(selectEditingGroupDetails);
		const objectsStatus = yield Viewer.getObjectsStatus();

		const date = new Date();
		const timestamp = date.getTime();
		const group = {
			...normalizeGroup(editingGroupDetails),
			createdAt: timestamp,
			updatedAt: timestamp,
			updatedBy: currentUser.username
		};

		if (group.objects && objectsStatus.highlightedNodes && objectsStatus.highlightedNodes.length) {
			group.totalSavedMeshes = calculateTotalMeshes(objectsStatus.highlightedNodes);
			group.objects = objectsStatus.highlightedNodes;
		}

		const {data} = yield API.createGroup(teamspace, modelId, revision, group);

		const preparedGroup = yield prepareGroupWithCount(data);

		if (isAllOverridden) {
			yield put(GroupsActions.addColorOverride(preparedGroup._id));
		}

		yield put(GroupsActions.updateGroupSuccess(preparedGroup));
		yield put(GroupsActions.showDetails(preparedGroup));
		yield put(GroupsActions.setActiveGroup(preparedGroup));
		yield put(SnackbarActions.show('Group created'));
	} catch (error) {
		yield put(DialogActions.showEndpointErrorDialog('create', 'group', error));
	}
	yield put(GroupsActions.toggleDetailsPendingState(false));
}

function* updateGroup({ teamspace, modelId, revision, groupId }) {
	yield put(GroupsActions.toggleDetailsPendingState(true));
	try {
		const groupDetails = yield select(selectEditingGroupDetails);

		const groupToSave = {
			...normalizeGroup(groupDetails)
		};

		const isNormalGroup = groupDetails.type === GROUPS_TYPES.NORMAL;
		const objectsStatus = yield Viewer.getObjectsStatus();

		if (isNormalGroup) {
			groupToSave.objects = objectsStatus.highlightedNodes;
		}

		const { data } = yield API.updateGroup(teamspace, modelId, revision, groupId, groupToSave);
		const preparedGroup = yield prepareGroupWithCount(data);

		yield put(GroupsActions.updateGroupSuccess(preparedGroup));
		yield put(GroupsActions.showDetails(preparedGroup));
		yield put(SnackbarActions.show('Group updated'));
	} catch (error) {
		yield put(DialogActions.showEndpointErrorDialog('update', 'group', error));
	}
	yield put(GroupsActions.toggleDetailsPendingState(false));
}

function* setNewGroup() {
	const currentUser = yield select(selectCurrentUser);
	const groups = yield select(selectGroups);
	const groupNumber = groups.length + 1;

	try {
		const editingGroup = prepareGroup({
			author: currentUser.username,
			name: `Untitled group ${groupNumber}`,
			color: getRandomRgbColor(),
			description: ''
		});

		yield put(GroupsActions.setComponentState({
			showDetails: true,
			editingGroup,
			criteriaFieldState: INITIAL_CRITERIA_FIELD_STATE
		}));
	} catch (error) {
		yield put(DialogActions.showErrorDialog('set', 'new group', error));
	}
}

function * setOverrideAll({overrideAll}) {
	if (!overrideAll) {
		yield put(GroupsActions.clearColorOverridesSuccess());
		yield put(ViewpointsActions.setSelectedViewpoint(null));
	} else {
		yield put(GroupsActions.setOverrideAllSuccess());
	}
}

function * setShowSmartGroups({enabled}) {

	if (enabled) {
		yield put(GroupsActions.setShowSmartGroupsSuccess());
	} else {
		yield put(GroupsActions.clearShowSmartGroupsSuccess());
	}
}

function * setShowStandardGroups({enabled}) {
	if (enabled) {
		yield put(GroupsActions.setShowStandardGroupsSuccess());
	} else {
		yield put(GroupsActions.clearShowStandardGroupsSuccess());
	}
}

const onUpdated = (group) => {
	const state = getState();
	const isShowingDetails = selectShowDetails(state);
	const activeGroupId = selectActiveGroupId(state);

	if (isShowingDetails && activeGroupId === group._id) {
		dispatch(GroupsActions.showUpdateInfo());

		setTimeout(() => {
			dispatch(GroupsActions.updateGroupFromChatService(group));
		}, 5000);
	} else {
		dispatch(GroupsActions.updateGroupFromChatService(group));
	}
};

const onCreated = (createdGroup) => {
	dispatch(GroupsActions.updateGroupFromChatService(createdGroup));
};

const onDeleted = (deletedGroupIds) => {
	dispatch(GroupsActions.showDeleteInfo(deletedGroupIds));

	setTimeout(() => {
		dispatch(GroupsActions.setComponentState({
			showDetails: false,
			activeGroup: null
		}));
		dispatch(GroupsActions.deleteGroupsSuccess(deletedGroupIds));
	}, 5000);
};

function* subscribeOnChanges({ teamspace, modelId }) {
	yield put(ChatActions.callChannelActions(CHAT_CHANNELS.GROUPS, teamspace, modelId, {
		subscribeToUpdated: onUpdated,
		subscribeToCreated: onCreated,
		subscribeToDeleted: onDeleted
	}));
}

function* unsubscribeFromChanges({ teamspace, modelId }) {
	yield put(ChatActions.callChannelActions(CHAT_CHANNELS.GROUPS, teamspace, modelId, {
		unsubscribeToUpdated: onUpdated,
		unsubscribeToCreated: onCreated,
		unsubscribeToDeleted: onDeleted
	}));
}

function* resetToSavedSelection({ groupId }) {
	const activeGroup = yield select(selectActiveGroupDetails);
	activeGroup.rules = (activeGroup || { rules: [] }).rules;

	yield all([
		put(GroupsActions.selectGroup(activeGroup))
	]);
}

export default function* GroupsSaga() {
	yield takeLatest(GroupsTypes.FETCH_GROUPS, fetchGroups);
	yield takeLatest(GroupsTypes.SET_ACTIVE_GROUP, setActiveGroup);
	yield takeLatest(GroupsTypes.RESET_ACTIVE_GROUP, resetActiveGroup);
	yield takeLatest(GroupsTypes.SELECT_GROUP, selectGroup);
	yield takeLatest(GroupsTypes.HIGHLIGHT_GROUP, highlightGroup);
	yield takeLatest(GroupsTypes.DEHIGHLIGHT_GROUP, dehighlightGroup);
	yield takeLatest(GroupsTypes.CLEAR_SELECTION_HIGHLIGHTS, clearSelectionHighlights);
	yield takeLatest(GroupsTypes.DELETE_GROUPS, deleteGroups);
	yield takeLatest(GroupsTypes.ISOLATE_GROUPS, isolateGroups);
	yield takeLatest(GroupsTypes.DOWNLOAD_GROUPS, downloadGroups);
	yield takeLatest(GroupsTypes.EXPORT_GROUPS, exportGroups);
	yield takeLatest(GroupsTypes.IMPORT_GROUPS, importGroups);
	yield takeEveryInOrder(GroupsTypes.SHOW_DETAILS, showDetails);
	yield takeLatest(GroupsTypes.CLOSE_DETAILS, closeDetails);
	yield takeLatest(GroupsTypes.CREATE_GROUP, createGroup);
	yield takeLatest(GroupsTypes.UPDATE_GROUP, updateGroup);
	yield takeLatest(GroupsTypes.SET_NEW_GROUP, setNewGroup);
	yield takeLatest(GroupsTypes.SUBSCRIBE_ON_CHANGES, subscribeOnChanges);
	yield takeLatest(GroupsTypes.UNSUBSCRIBE_FROM_CHANGES, unsubscribeFromChanges);
	yield takeLatest(GroupsTypes.RESET_TO_SAVED_SELECTION, resetToSavedSelection);
	yield takeLatest(GroupsTypes.SET_OVERRIDE_ALL, setOverrideAll);
	yield takeLatest(GroupsTypes.SET_SHOW_SMART_GROUPS, setShowSmartGroups);
	yield takeLatest(GroupsTypes.SET_SHOW_STANDARD_GROUPS, setShowStandardGroups);
	yield takeLatest(GroupsTypes.UPDATE_GROUP_FROM_CHAT_SERVICE, updateGroupFromChatService);
}
