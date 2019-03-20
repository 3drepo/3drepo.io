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

import { values } from 'lodash';
import { put, takeLatest, takeEvery, select, all } from 'redux-saga/effects';
import { getAngularService, dispatch } from '../../helpers/migration';
import { calculateTotalMeshes } from '../../helpers/tree';

import * as API from '../../services/api';
import { GroupsTypes, GroupsActions, INITIAL_CRITERIA_FIELD_STATE } from './groups.redux';
import { DialogActions } from '../dialog';
import {
	selectColorOverrides,
	selectGroups,
	selectGroupsMap,
	selectFilteredGroups,
	selectNewGroupDetails,
	selectActiveGroupDetails,
	selectSelectedFilters,
	selectShowDetails,
	selectIsAllOverrided
} from './groups.selectors';
import { Viewer } from '../../services/viewer/viewer';
import { MultiSelect } from '../../services/viewer/multiSelect';
import { prepareGroup, normalizeGroup } from '../../helpers/groups';
import { selectCurrentUser } from '../currentUser';
import { getRandomColor, hexToGLColor } from '../../helpers/colors';
import { SnackbarActions } from '../snackbar';
import { TreeActions } from '../tree';
import { searchByFilters } from '../../helpers/searching';
import { GROUPS_TYPES } from '../../constants/groups';

export function* fetchGroups({teamspace, modelId, revision}) {
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

export function* setActiveGroup({ group, revision }) {
	try {
		const filteredGroups = select(selectFilteredGroups);

		yield all([
			put(GroupsActions.selectGroup(group, filteredGroups, revision)),
			put(GroupsActions.setComponentState({ activeGroup: group ? group._id : null }))
		]);

	} catch (error) {
		yield put(DialogActions.showErrorDialog('set', 'group as active', error));
	}
}

export function* resetActiveGroup() {
	try {
		const showDetailsEnabled = yield select(selectShowDetails);
		yield all([
			!showDetailsEnabled ? put(GroupsActions.setComponentState({ activeGroup: null })) : null,
			put(GroupsActions.clearSelectionHighlights())
		]);
	} catch (error) {
		yield put(DialogActions.showErrorDialog('reset', ' active group', error));
	}
}

export function* highlightGroup({ group }) {
	try {
		const color = group.color ? hexToGLColor(group.color) :
		Viewer.getDefaultHighlightColor();
		yield put(GroupsActions.addToHighlighted(group._id));

		if (group.objects && group.objects.length > 0) {
			const TreeService = getAngularService('TreeService') as any;

			yield TreeService.showNodesBySharedIds(group.objects);
			yield TreeService.selectNodesBySharedIds(group.objects, color);
			yield put(TreeActions.getSelectedNodes());
		}
	} catch (error) {
		yield put(DialogActions.showErrorDialog('higlight', 'group', error));
	}
}

export function* dehighlightGroup({ group }) {
	try {
		yield put(GroupsActions.removeFromHighlighted(group._id));

		const TreeService = getAngularService('TreeService') as any;
		const nodes = yield TreeService.getNodesFromSharedIds(group.objects);

		yield TreeService.deselectNodes(nodes);
	} catch (error) {
		yield put(DialogActions.showErrorDialog('dehiglight', 'group', error));
	}
}

export function* clearSelectionHighlights() {
	try {
		yield put(GroupsActions.setComponentState({ highlightedGroups: [] }));
		const TreeService = getAngularService('TreeService') as any;
		yield TreeService.clearCurrentlySelected();
		yield put(TreeActions.clearSelectedNodes());
	} catch (error) {
		yield put(DialogActions.showErrorDialog('clear', 'highlighted groups', error));
	}
}

export function* selectGroup({ group = {} }) {
	try {
		yield Viewer.isViewerReady();

		const addGroup = MultiSelect.isAccumMode();
		const removeGroup = MultiSelect.isDecumMode();
		const multiSelect = addGroup || removeGroup;

		if (!multiSelect) {
			yield put(GroupsActions.clearSelectionHighlights());
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

export function* addColorOverride({ groups = [], renderOnly }) {
	try {
		const TreeService = getAngularService('TreeService') as any;
		const overridedToAdd = {};

		for (let i = 0; i < groups.length; i++) {
			const group = groups[i];
			const color = hexToGLColor(group.color);
			const treeMap = yield TreeService.getMap();

			if (treeMap) {
				const nodes = yield TreeService.getNodesFromSharedIds(group.objects);

				if (nodes) {
					const filteredNodes = nodes.filter((n) => n !== undefined);
					const modelsMap = yield TreeService.getMeshMapFromNodes(filteredNodes);
					const modelsList = Object.keys(modelsMap);

					for (let j = 0; j < modelsList.length; j++) {
						const modelKey = modelsList[j];
						const meshIds = modelsMap[modelKey].meshes;
						const [account, model] = modelKey.split('@');
						Viewer.overrideMeshColor(account, model, meshIds, color);
					}

					const colorOverride = { models: modelsMap, color, id: group._id };
					overridedToAdd[group._id] = colorOverride;
				}
			}
		}

		if (!renderOnly) {
			yield put(GroupsActions.addToOverrided(overridedToAdd));
		}
	} catch (error) {
		yield put(DialogActions.showErrorDialog('color', 'override', error));
	}
}

export function* removeColorOverride({ groups, renderOnly = false }) {
	try {
		for (let i = 0; i < groups.length; i++) {
			const group = groups[i];

			Object.keys(group.models).forEach((key) => {
				const meshIds = group.models[key].meshes;
				const [account, model] = key.split('@');
				Viewer.resetMeshColor(account, model, meshIds);
			});
		}

		if (!renderOnly) {
			const overridedToRemove = groups.map(({ id }) => id);
			yield put(GroupsActions.removeFromOverrided(overridedToRemove));
		}
	} catch (error) {
		yield put(DialogActions.showErrorDialog('toggle', 'color override', error));
	}
}

export function* toggleColorOverride({ group, render }) {
	try {
		const colorOverrides = yield select(selectColorOverrides);
		const hasColorOverride = colorOverrides[group._id];

		if (!hasColorOverride) {
			yield put(GroupsActions.addColorOverride([group]));
		} else {
			const overridedGroup = colorOverrides[group._id];
			yield put(GroupsActions.removeColorOverride([overridedGroup]));
		}
	} catch (error) {
		yield put(DialogActions.showErrorDialog('toggle', 'color override', error));
	}
}

export function* toggleColorOverrideAll({ overrideAll = true }) {
	try {
		if (!overrideAll) {
			const colorOverrides = yield select(selectColorOverrides);
			yield put(GroupsActions.removeColorOverride(values(colorOverrides)));
		} else {
			const groups = yield select(selectGroups);
			yield put(GroupsActions.addColorOverride(groups));
		}
	} catch (error) {
		yield put(DialogActions.showErrorDialog('toggle', 'color override', error));
	}
}

export function* deleteGroups({ teamspace, modelId, groups }) {
	try {
		yield API.deleteGroups(teamspace, modelId, groups);

		const groupsToDelete = groups.split(',');
		const colorOverrides = yield select(selectColorOverrides);
		const groupsMap = yield select(selectGroupsMap);

		yield all(groupsToDelete.map((groupId) => {
			const overridedGroup = colorOverrides[groupId];
			const group = groupsMap[groupId];

			const actions = [
				put(GroupsActions.dehighlightGroup(group)),
				put(GroupsActions.deleteGroupsSuccess([groupId]))
			];

			if (overridedGroup) {
				actions.push(put(GroupsActions.removeColorOverride([overridedGroup])));
			}

			return actions;
		}));
	} catch (error) {
		yield put(DialogActions.showErrorDialog('delete', 'groups', error));
	}
}

export function* isolateGroup({ group }) {
	try {
		yield put(GroupsActions.clearSelectionHighlights());
		const TreeService = getAngularService('TreeService') as any;
		TreeService.isolateNodesBySharedIds(group.objects);
	} catch (error) {
		yield put(DialogActions.showErrorDialog('delete', 'groups', error));
	}
}

export function* downloadGroups({ teamspace, modelId }) {
	try {
		const groups = yield select(selectGroups);
		const filters = yield select(selectSelectedFilters);
		const filteredGroups = searchByFilters(groups, filters, false);
		const ids = filteredGroups.map((group) => group._id).join(',');
		const endpointBase =
			`${teamspace}/${modelId}/revision/master/head/groups/?noIssues=true&noRisks=true`;
		const endpoint = ids ? `${endpointBase}&ids=${ids}` : endpointBase;
		const modelName = Viewer.viewer && Viewer.viewer.settings ? Viewer.viewer.settings.name : '';
		yield API.downloadJSON('groups', modelName, `${endpoint}&convertCoords=true`);
	} catch (error) {
		yield put(DialogActions.showErrorDialog('download', 'groups', error));
	}
}

export function* showDetails({ group, revision }) {
	try {
		yield put(GroupsActions.clearSelectionHighlights());
		const objectsStatus = yield Viewer.getObjectsStatus();

		if (group.objects && objectsStatus.highlightedNodes && objectsStatus.highlightedNodes.length) {
			group.totalSavedMeshes = calculateTotalMeshes(objectsStatus.highlightedNodes);
			group.objects = objectsStatus.highlightedNodes;
		}

		const colorOverrides = yield select(selectColorOverrides);
		const overridedGroup = colorOverrides[group._id];
		if (overridedGroup) {
			yield put(GroupsActions.removeColorOverride([overridedGroup], true));
		}

		yield put(GroupsActions.setActiveGroup(group, revision));
		yield put(GroupsActions.setComponentState({
			showDetails: true,
			newGroup: group,
			criteriaFieldState: INITIAL_CRITERIA_FIELD_STATE
		}));
	} catch (error) {
		yield put(DialogActions.showErrorDialog('display', 'group details', error));
	}
}

export function* closeDetails() {
	try {
		const activeGroup = yield select(selectActiveGroupDetails);

		const colorOverrides = yield select(selectColorOverrides);
		const overridedGroup = colorOverrides[activeGroup._id];
		if (overridedGroup) {
			yield put(GroupsActions.addColorOverride([activeGroup], true));
		}

		yield put(GroupsActions.highlightGroup(activeGroup));
		yield put(GroupsActions.setComponentState({ showDetails: false }));
	} catch (error) {
		yield put(DialogActions.showErrorDialog('close', 'group details', error));
	}
}

export function* createGroup({ teamspace, modelId, revision }) {
	try {
		const isAllOverrided = yield select(selectIsAllOverrided);
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

		if (isAllOverrided) {
			yield put(GroupsActions.addColorOverride([preparedGroup]));
		}

		yield put(GroupsActions.updateGroupSuccess(preparedGroup));
		yield put(GroupsActions.highlightGroup(preparedGroup));
		yield put(GroupsActions.showDetails(preparedGroup));
		yield put(SnackbarActions.show('Group created'));
	} catch (error) {
		yield put(DialogActions.showEndpointErrorDialog('create', 'group', error));
	}
}

export function* updateGroup({ teamspace, modelId, revision, groupId }) {
	try {
		const groupDetails = yield select(selectActiveGroupDetails);

		const groupToSave = {
			...normalizeGroup(groupDetails)
		} as any;

		const isNormalGroup = groupDetails.type === GROUPS_TYPES.NORMAL;
		const objectsStatus = yield Viewer.getObjectsStatus();
		if (isNormalGroup && objectsStatus.highlightedNodes && objectsStatus.highlightedNodes.length) {
			groupToSave.totalSavedMeshes = calculateTotalMeshes(objectsStatus.highlightedNodes);
			groupToSave.objects = objectsStatus.highlightedNodes;
		}

		const { data } = yield API.updateGroup(teamspace, modelId, revision, groupId, groupToSave);
		const preparedGroup = prepareGroup(data);

		if (isNormalGroup) {
			preparedGroup.totalSavedMeshes = groupToSave.totalSavedMeshes;
		}

		yield put(TreeActions.getSelectedNodes());
		yield put(GroupsActions.updateGroupSuccess(preparedGroup));
		yield put(GroupsActions.highlightGroup(preparedGroup));
		yield put(SnackbarActions.show('Group updated'));
	} catch (error) {
		yield put(DialogActions.showEndpointErrorDialog('update', 'group', error));
	}
}

export function* setNewGroup() {
	const currentUser = yield select(selectCurrentUser);
	const groups = yield select(selectGroups);
	const groupNumber = groups.length + 1;

	try {
		const newGroup = prepareGroup({
			author: currentUser.username,
			name: `Untitled group ${groupNumber}`,
			color: getRandomColor(),
			description: '(No description)'
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

const onUpdated = (updatedGroup) => {
	dispatch(GroupsActions.showUpdateInfo());

	setTimeout(() => {
		dispatch(GroupsActions.updateGroupSuccess(prepareGroup(updatedGroup)));
	}, 5000);
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

export function* subscribeOnChanges({ teamspace, modelId }) {
	const ChatService = yield getAngularService('ChatService');
	const groupsNotifications = yield ChatService.getChannel(teamspace, modelId).groups;

	groupsNotifications.subscribeToUpdated(onUpdated, this);
	groupsNotifications.subscribeToCreated(onCreated, this);
	groupsNotifications.subscribeToDeleted(onDeleted, this);
}

export function* unsubscribeFromChanges({ teamspace, modelId }) {
	const ChatService = yield getAngularService('ChatService');
	const groupsNotifications = yield ChatService.getChannel(teamspace, modelId).groups;

	groupsNotifications.unsubscribeFromUpdated(onUpdated);
	groupsNotifications.unsubscribeFromCreated(onCreated);
	groupsNotifications.unsubscribeFromDeleted(onDeleted);
}

export function* getFieldNames({ teamspace, modelId }) {
	try {
		const { data } = yield API.getFieldNames(teamspace, modelId);
		yield put(GroupsActions.getFieldNamesSuccess(data));
	} catch (error) {
		yield put(DialogActions.showErrorDialog('get', 'field names', error));
	}
}

export function* resetToSavedSelection({ groupId }) {
	const groups = yield select(selectGroupsMap);
	const activeGroup = yield select(selectActiveGroupDetails);
	const initialGroupState = groups[groupId] || activeGroup;
	activeGroup.rules = (groups[groupId] || { rules: [] }).rules;

	yield all([
		put(GroupsActions.selectGroup(initialGroupState)),
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
	yield takeEvery(GroupsTypes.ADD_COLOR_OVERRIDE, addColorOverride);
	yield takeEvery(GroupsTypes.REMOVE_COLOR_OVERRIDE, removeColorOverride);
	yield takeLatest(GroupsTypes.TOGGLE_COLOR_OVERRIDE, toggleColorOverride);
	yield takeLatest(GroupsTypes.TOGGLE_COLOR_OVERRIDE_ALL, toggleColorOverrideAll);
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
	yield takeLatest(GroupsTypes.GET_FIELD_NAMES, getFieldNames);
	yield takeLatest(GroupsTypes.RESET_TO_SAVED_SELECTION, resetToSavedSelection);
}
