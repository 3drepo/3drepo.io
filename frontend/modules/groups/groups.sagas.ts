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

import { put, takeLatest, takeEvery, select, all, call} from 'redux-saga/effects';
import { delay } from 'redux-saga';
import {omit} from 'lodash';
import { getAngularService, dispatch } from '../../helpers/migration';

import * as API from '../../services/api';
import { GroupsTypes, GroupsActions, INITIAL_CRITERIA_FIELD_STATE } from './groups.redux';
import { DialogActions } from '../dialog';
import {
	selectAreAllOverrided,
	selectColorOverrides,
	selectGroups,
	selectGroupsMap,
	selectFilteredGroups,
	selectNewGroupDetails,
	selectActiveGroupDetails
} from './groups.selectors';
import { Viewer } from '../../services/viewer/viewer';
import { MultiSelect } from '../../services/viewer/multiSelect';
import { prepareGroup } from '../../helpers/groups';
import { selectCurrentUser } from '../currentUser';
import { getRandomColor, hexToGLColor } from '../../helpers/colors';
import { SnackbarActions } from '../snackbar';
import { TreeActions } from '../tree';

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

const calculateTotalMeshes = (objectsStatus) => {
	return objectsStatus.highlightedNodes
		.map((x) => x.shared_ids.length)
		.reduce((acc, val) => acc + val);
};

export function* setActiveGroup({ group, revision }) {
	try {
		const filteredGroups = select(selectFilteredGroups);

		yield all([
			put(GroupsActions.selectGroup(group, filteredGroups, revision)),
			put(GroupsActions.setComponentState({
				activeGroup: group._id,
				newGroup: group
			}))
		]);

	} catch (error) {
		yield put(DialogActions.showErrorDialog('set', 'group as active', error));
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
			const currentSelectedNodes = yield TreeService.currentSelectedNodes;
			yield put(TreeActions.setSelectedNodes(currentSelectedNodes));

			yield call(delay, 0);
			const objectsStatus = yield Viewer.getObjectsStatus();

			if (objectsStatus.highlightedNodes && objectsStatus.highlightedNodes.length) {
				const totalMeshes = calculateTotalMeshes(objectsStatus);
				yield put(GroupsActions.setComponentState({ totalMeshes }));
			}
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
		// this.setTotalSavedMeshes(group);
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

export function* selectGroup({ group }) {
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

export function* addColorOverride({ group }) {
	try {
		const color = hexToGLColor(group.color);
		const TreeService = getAngularService('TreeService') as any;
		const treeMap = yield TreeService.getMap();

		if (treeMap) {
			const nodes = yield TreeService.getNodesFromSharedIds(group.objects);

			if (nodes) {
				const filteredNodes = nodes.filter((n) => n !== undefined);
				const models = yield TreeService.getMeshMapFromNodes(filteredNodes);

				Object.keys(models).forEach((key) => {
					const meshIds = models[key].meshes;
					const [account, model] = key.split('@');
					Viewer.overrideMeshColor(account, model, meshIds, color);
				});

				const colorOverride = { models, color };
				yield put(GroupsActions.addToOverrided(group._id, colorOverride));
			}
		}
	} catch (error) {
		yield put(DialogActions.showErrorDialog('color', 'override', error));
	}
}

export function* removeColorOverride({ groupId, overridedGroup }) {
	try {
		if (overridedGroup) {
			Object.keys(overridedGroup.models).forEach((key) => {
				const meshIds = overridedGroup.models[key].meshes;
				const [account, model] = key.split('@');
				Viewer.resetMeshColor(account, model, meshIds);
			});
			yield put(GroupsActions.removeFromOverrided(groupId));
		}
	} catch (error) {
		yield put(DialogActions.showErrorDialog('toggle', 'color override', error));
	}
}

export function* toggleColorOverride({ group }) {
	try {
		const colorOverrides = yield select(selectColorOverrides);
		const hasColorOverride = colorOverrides[group._id];

		if (!hasColorOverride) {
			yield put(GroupsActions.addColorOverride(group));
		} else {
			const overridedGroup = colorOverrides[group._id];
			yield put(GroupsActions.removeColorOverride(group._id, overridedGroup));
		}
	} catch (error) {
		yield put(DialogActions.showErrorDialog('toggle', 'color override', error));
	}
}

export function* toggleColorOverrideAll() {
	try {
		const allOverrided = yield select(selectAreAllOverrided);

		if (allOverrided) {
			const colorOverrides = yield select(selectColorOverrides);
			yield all(
				Object.keys(colorOverrides).map((groupId) => {
					return put(GroupsActions.removeColorOverride(groupId, colorOverrides[groupId]));
				})
			);
			yield put(GroupsActions.setComponentState({ overrideAll: false }));
		} else {
			const groups = yield select(selectGroups);
			yield all(groups.map((group) => {
				return put(GroupsActions.addColorOverride(group));
			}));
			yield put(GroupsActions.setComponentState({ overrideAll: true }));
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

			return [
				put(GroupsActions.removeColorOverride(groupId, overridedGroup)),
				put(GroupsActions.dehighlightGroup(group))
				// put(GroupsActions.deleteGroupSuccess(groupId))
			];
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
		const endpoint = `${teamspace}/${modelId}/groups/revision/master/head/?noIssues=true&noRisks=true`;
		const modelName = Viewer.viewer && Viewer.viewer.settings ? Viewer.viewer.settings.name : '';
		yield API.downloadJSON('groups', modelName, endpoint);

	} catch (error) {
		yield put(DialogActions.showErrorDialog('download', 'groups', error));
	}
}

export function* showDetails({ group, revision }) {
	try {
		yield put(GroupsActions.setActiveGroup(group, revision));
		yield put(GroupsActions.setComponentState({
			showDetails: true,
			criteriaFieldState: INITIAL_CRITERIA_FIELD_STATE
		}));
	} catch (error) {
		yield put(DialogActions.showErrorDialog('display', 'group details', error));
	}
}

export function* closeDetails() {
	try {
		yield put(GroupsActions.setComponentState({ activeGroup: null, showDetails: false }));
	} catch (error) {
		yield put(DialogActions.showErrorDialog('close', 'group details', error));
	}
}

export function* createGroup({ teamspace, modelId }) {
	try {
		const currentUser = yield select(selectCurrentUser);
		const newGroupDetails = yield select(selectNewGroupDetails);
		const objectsStatus = yield Viewer.getObjectsStatus();

		const date = new Date();
		const timestamp = date.getTime();
		const group = {
			author: currentUser.username,
			createdAt: timestamp,
			updatedAt: timestamp,
			updatedBy: currentUser.username,
			totalSavedMeshes: 0,
			objects: [],
			...newGroupDetails
		};

		if (objectsStatus.highlightedNodes && objectsStatus.highlightedNodes.length) {
			group.totalSavedMeshes = calculateTotalMeshes(objectsStatus);
			group.objects = objectsStatus.highlightedNodes;
		}

		const {data} = yield API.createGroup(teamspace, modelId, group);
		const newGroup = {
			...group,
			_id: data._id
		};
		// yield put(GroupsActions.updateGroupSuccess(newGroup));
		yield put(GroupsActions.highlightGroup(newGroup));
		yield put(GroupsActions.showDetails(newGroup));
		yield put(SnackbarActions.show('Group created'));
	} catch (error) {
		yield put(DialogActions.showErrorDialog('create', 'group', error));
	}
}

export function* updateGroup({ teamspace, modelId, groupId }) {
	try {
		const currentUser = yield select(selectCurrentUser);
		const updatedGroupDetails = yield select(selectNewGroupDetails);
		const groupDetails = yield select(selectActiveGroupDetails);
		const objectsStatus = yield Viewer.getObjectsStatus();
		const date = new Date();
		const timestamp = date.getTime();
		const details = updatedGroupDetails.rules.length ? updatedGroupDetails : omit(updatedGroupDetails, ['rules']);

		const group = {
			updatedAt: timestamp,
			updatedBy: currentUser.username,
			totalSavedMeshes: 0,
			objects: [],
			...details
		};

		if (objectsStatus.highlightedNodes && objectsStatus.highlightedNodes.length) {
			group.totalSavedMeshes = calculateTotalMeshes(objectsStatus);
			group.objects = objectsStatus.highlightedNodes;
		}

		const {data} = yield API.updateGroup(teamspace, modelId, groupId, group);
		const updatedGroup = {
			...group,
			_id: data._id,
			author: groupDetails.author,
			name: groupDetails.name
		};
		// yield put(GroupsActions.updateGroupSuccess(updatedGroup));
		yield put(GroupsActions.highlightGroup(updatedGroup));
		yield put(SnackbarActions.show('Group updated'));
	} catch (error) {
		yield put(DialogActions.showErrorDialog('update', 'group', error));
	}
}

export function* setNewGroup() {
	const groups = yield select(selectGroups);
	const groupNumber = groups.length + 1;

	try {
		const newGroup = prepareGroup({
			name: `Untitled group ${groupNumber}`,
			color: getRandomColor(),
			description: '(No description)',
			rules: []
		});

		yield put(GroupsActions.setComponentState({
			showDetails: true,
			activeGroup: null,
			totalMeshes: 0,
			newGroup,
			criteriaFieldState: INITIAL_CRITERIA_FIELD_STATE
		}));
	} catch (error) {
		yield put(DialogActions.showErrorDialog('prepare', 'new risk', error));
	}
}

const onUpdated = (updatedGroup) => {
	dispatch(GroupsActions.updateGroupSuccess(updatedGroup));
};

const onCreated = (createdGroup) => {
	dispatch(GroupsActions.updateGroupSuccess(createdGroup));
};

const onDeleted = (deletedGroupId) => {
	dispatch(GroupsActions.deleteGroupSuccess(deletedGroupId));
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

export default function* GroupsSaga() {
	yield takeLatest(GroupsTypes.FETCH_GROUPS, fetchGroups);
	yield takeLatest(GroupsTypes.SET_ACTIVE_GROUP, setActiveGroup);
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
}
