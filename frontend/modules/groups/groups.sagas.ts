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

import { all, put, select, takeLatest } from 'redux-saga/effects';

import { CHAT_CHANNELS } from '../../constants/chat';
import { GROUPS_TYPES } from '../../constants/groups';
import { getRandomColor, hexToGLColor } from '../../helpers/colors';
import { normalizeGroup, prepareGroup } from '../../helpers/groups';
import { searchByFilters } from '../../helpers/searching';
import { calculateTotalMeshes } from '../../helpers/tree';
import * as API from '../../services/api';
import { MultiSelect } from '../../services/viewer/multiSelect';
import { Viewer } from '../../services/viewer/viewer';
import { ChatActions } from '../chat';
import { selectCurrentUser } from '../currentUser';
import { DialogActions } from '../dialog';
import { SnackbarActions } from '../snackbar';
import { dispatch, getState } from '../store';
import { TreeActions } from '../tree';
import { ViewpointsActions } from '../viewpoints';
import { GroupsActions, GroupsTypes, INITIAL_CRITERIA_FIELD_STATE } from './groups.redux';
import {
	selectActiveGroupDetails,
	selectActiveGroupId,
	selectColorOverrides,
	selectFilteredGroups,
	selectGroups,
	selectGroupsMap,
	selectIsAllOverridden,
	selectNewGroupDetails,
	selectSelectedFilters,
	selectShowDetails,
	selectUnalteredActiveGroupDetails
} from './groups.selectors';

function* fetchGroups({teamspace, modelId, revision}) {
	yield put(GroupsActions.togglePendingState(true));
	try {
		const {data} = yield API.getGroups(teamspace, modelId, revision);
		const preparedGroups = data.map(prepareGroup);
		yield put(GroupsActions.fetchGroupsSuccess(preparedGroups));
	} catch (error) {
		yield put(DialogActions.showErrorDialog('get', 'groups', error));
	}
	yield put(GroupsActions.togglePendingState(false));
}

function* setActiveGroup({ group, revision }) {
	try {
		const filteredGroups = yield select(selectFilteredGroups);
		const activeGroupId = yield select(selectActiveGroupId);
		if (group && group._id === activeGroupId) {
			return;
		}

		yield all([
			put(GroupsActions.selectGroup(group, filteredGroups, revision)),
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
		const color = group.color ? hexToGLColor(group.color) : Viewer.getDefaultHighlightColor();
		yield put(GroupsActions.addToHighlighted(group._id));

		if (group.objects && group.objects.length > 0) {
			yield put(TreeActions.showNodesBySharedIds(group.objects));
			yield put(TreeActions.selectNodesBySharedIds(group.objects, color));
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
		yield put(GroupsActions.setComponentState({ highlightedGroups: [] }));
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

function* toggleColorOverride({ groupId }) {
	try {
		const colorOverrides = yield select(selectColorOverrides);
		const hasColorOverride = colorOverrides.includes(groupId);

		if (!hasColorOverride) {
			yield put(GroupsActions.addColorOverride(groupId));
		} else {
			yield put(GroupsActions.removeColorOverride(groupId));
		}
	} catch (error) {
		yield put(DialogActions.showErrorDialog('toggle', 'color override', error));
	}
}

function* deleteGroups({ teamspace, modelId, groups }) {
	try {
		yield API.deleteGroups(teamspace, modelId, groups);

		const groupsToDelete = groups.split(',');
		const colorOverrides = yield select(selectColorOverrides);
		const groupsMap = yield select(selectGroupsMap);
		const isShowDetails = yield select(selectShowDetails);
		const activeGroupId = yield select(selectActiveGroupId);

		yield all(groupsToDelete.map((groupId) => {
			const overriddenGroup = colorOverrides[groupId];
			const group = groupsMap[groupId];

			const actions = [
				put(GroupsActions.dehighlightGroup(group)),
				put(GroupsActions.deleteGroupsSuccess([groupId]))
			];

			if (overriddenGroup) {
				actions.push(put(GroupsActions.removeColorOverride(groupId)));
			}

			return actions;
		}));

		if (isShowDetails && groupsToDelete.includes(activeGroupId)) {
			yield put(GroupsActions.setComponentState({ activeGroup: null, showDetails: false }));
			const { name } = yield select(selectActiveGroupDetails);
			yield put(SnackbarActions.show(`Group ${name} removed.`));
		}
	} catch (error) {
		yield put(DialogActions.showErrorDialog('delete', 'groups', error));
	}
}

function* isolateGroup({ group }) {
	try {
		yield put(GroupsActions.clearSelectionHighlights(true));
		yield put(TreeActions.isolateNodesBySharedIds(group.objects));
	} catch (error) {
		yield put(DialogActions.showErrorDialog('delete', 'groups', error));
	}
}

function* downloadGroups({ teamspace, modelId }) {
	try {
		const groups = yield select(selectGroups);
		const filters = yield select(selectSelectedFilters);
		const filteredGroups = searchByFilters(groups, filters, false);
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

function* showDetails({ group, revision }) {
	try {
		yield put(GroupsActions.clearSelectionHighlights());
		yield put(GroupsActions.highlightGroup(group));
		yield put(GroupsActions.setComponentState({
			showDetails: true,
			newGroup: {...group},
			criteriaFieldState: INITIAL_CRITERIA_FIELD_STATE
		}));
	} catch (error) {
		yield put(DialogActions.showErrorDialog('display', 'group details', error));
	}
}

function* closeDetails() {
	try {
		const activeGroup = yield select(selectUnalteredActiveGroupDetails);
		yield put(GroupsActions.highlightGroup(activeGroup));
		yield put(GroupsActions.setComponentState({ showDetails: false }));

	} catch (error) {
		yield put(DialogActions.showErrorDialog('close', 'group details', error));
	}
}

function* createGroup({ teamspace, modelId, revision }) {
	yield put(GroupsActions.toggleDetailsPendingState(true));
	try {
		const isAllOverridden = yield select(selectIsAllOverridden);
		const currentUser = yield select(selectCurrentUser);
		const newGroupDetails = yield select(selectNewGroupDetails);
		const objectsStatus = yield Viewer.getObjectsStatus();

		const date = new Date();
		const timestamp = date.getTime();
		const group = {
			...normalizeGroup(newGroupDetails),
			createdAt: timestamp,
			updatedAt: timestamp,
			updatedBy: currentUser.username
		} as any;

		if (group.objects && objectsStatus.highlightedNodes && objectsStatus.highlightedNodes.length) {
			group.totalSavedMeshes = calculateTotalMeshes(objectsStatus.highlightedNodes);
			group.objects = objectsStatus.highlightedNodes;
		}

		const {data} = yield API.createGroup(teamspace, modelId, revision, group);

		const preparedGroup = prepareGroup(data);

		if (isAllOverridden) {
			yield put(GroupsActions.addColorOverride(preparedGroup._id));
		}

		yield put(GroupsActions.updateGroupSuccess(preparedGroup));
		yield put(GroupsActions.highlightGroup(preparedGroup));
		yield put(GroupsActions.showDetails(preparedGroup));
		yield put(SnackbarActions.show('Group created'));
	} catch (error) {
		yield put(DialogActions.showEndpointErrorDialog('create', 'group', error));
	}
	yield put(GroupsActions.toggleDetailsPendingState(false));
}

function* updateGroup({ teamspace, modelId, revision, groupId }) {
	yield put(GroupsActions.toggleDetailsPendingState(true));
	try {
		const groupDetails = yield select(selectActiveGroupDetails);

		const groupToSave = {
			...normalizeGroup(groupDetails)
		} as any;

		const isNormalGroup = groupDetails.type === GROUPS_TYPES.NORMAL;
		const objectsStatus = yield Viewer.getObjectsStatus();

		if (isNormalGroup) {
			groupToSave.objects = objectsStatus.highlightedNodes;
		}

		const { data } = yield API.updateGroup(teamspace, modelId, revision, groupId, groupToSave);
		const preparedGroup = prepareGroup(data);

		yield put(GroupsActions.updateGroupSuccess(preparedGroup));
		yield put(GroupsActions.highlightGroup(preparedGroup));
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
		const newGroup = prepareGroup({
			author: currentUser.username,
			name: `Untitled group ${groupNumber}`,
			color: getRandomColor(),
			description: ''
		});

		yield put(GroupsActions.setComponentState({
			showDetails: true,
			activeGroup: null,
			totalMeshes: 0,
			newGroup,
			criteriaFieldState: INITIAL_CRITERIA_FIELD_STATE
		}));
	} catch (error) {
		yield put(DialogActions.showErrorDialog('set', 'new group', error));
	}
}

function * clearColorOverrides() {
	yield put(GroupsActions.clearColorOverridesSuccess());
	yield put(ViewpointsActions.setSelectedViewpoint(null));
}

function * setOverrideAll({overrideAll}) {
	if (!overrideAll) {
		yield put(GroupsActions.clearColorOverrides());
	} else {
		yield put(GroupsActions.setOverrideAllSuccess());
	}
}

const onUpdated = (updatedGroup) => {
	const group = prepareGroup(updatedGroup);
	const state = getState();
	const isShowingDetails = selectShowDetails(state);
	const activeGroupId = selectActiveGroupId(state);

	if (isShowingDetails && activeGroupId === group._id) {
		dispatch(GroupsActions.showUpdateInfo());

		setTimeout(() => {
			dispatch(GroupsActions.updateGroupSuccess(group));
		}, 5000);
	} else {
		dispatch(GroupsActions.updateGroupSuccess(group));
	}
};

const onCreated = (createdGroup) => {
	dispatch(GroupsActions.updateGroupSuccess(prepareGroup(createdGroup)));
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
	const activeGroup = yield select(selectUnalteredActiveGroupDetails);
	activeGroup.rules = (activeGroup || { rules: [] }).rules;

	yield all([
		put(GroupsActions.selectGroup(activeGroup)),
		put(GroupsActions.setComponentState({ newGroup: activeGroup }))
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
	yield takeLatest(GroupsTypes.TOGGLE_COLOR_OVERRIDE, toggleColorOverride);
	yield takeLatest(GroupsTypes.DELETE_GROUPS, deleteGroups);
	yield takeLatest(GroupsTypes.ISOLATE_GROUP, isolateGroup);
	yield takeLatest(GroupsTypes.DOWNLOAD_GROUPS, downloadGroups);
	yield takeLatest(GroupsTypes.SHOW_DETAILS, showDetails);
	yield takeLatest(GroupsTypes.CLOSE_DETAILS, closeDetails);
	yield takeLatest(GroupsTypes.CREATE_GROUP, createGroup);
	yield takeLatest(GroupsTypes.UPDATE_GROUP, updateGroup);
	yield takeLatest(GroupsTypes.SET_NEW_GROUP, setNewGroup);
	yield takeLatest(GroupsTypes.SUBSCRIBE_ON_CHANGES, subscribeOnChanges);
	yield takeLatest(GroupsTypes.UNSUBSCRIBE_FROM_CHANGES, unsubscribeFromChanges);
	yield takeLatest(GroupsTypes.RESET_TO_SAVED_SELECTION, resetToSavedSelection);
	yield takeLatest(GroupsTypes.CLEAR_COLOR_OVERRIDES, clearColorOverrides);
	yield takeLatest(GroupsTypes.SET_OVERRIDE_ALL, setOverrideAll);
}
