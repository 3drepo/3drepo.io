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

import { put, takeLatest, select, all} from 'redux-saga/effects';
import { getAngularService } from '../../helpers/migration';

import * as API from '../../services/api';
import { GroupsTypes, GroupsActions } from './groups.redux';
import { DialogActions } from '../dialog';
import {
	selectActiveGroupId,
	selectGroupsMap
} from './groups.selectors';
import { Viewer } from '../../services/viewer/viewer';
import { MultiSelect } from '../../services/viewer/multiSelect';

export function* fetchGroups({teamspace, modelId, revision}) {
	yield put(GroupsActions.togglePendingState(true));
	try {
		const {data} = yield API.getGroups(teamspace, modelId, revision);
		yield put(GroupsActions.fetchGroupsSuccess(data));
	} catch (error) {
		yield put(DialogActions.showErrorDialog('get', 'groups', error));
	}
	yield put(GroupsActions.togglePendingState(false));
}

export function* setActiveGroup({ group, filteredGroups, revision }) {
	try {
		console.log('Set active group')

		const activeGroupId = yield select(selectActiveGroupId);
		const groupsMap = yield select(selectGroupsMap);

		// if (activeGroupId !== group._id) {
		// 	if (activeGroupId) {
		// 		toggleRiskPin(risksMap[activeRiskId], false);
		// 	}
		// 	toggleRiskPin(risk, true);
		// }
		yield all([
			put(GroupsActions.selectGroup(group, filteredGroups, revision)),
			put(GroupsActions.setComponentState({ activeGroup: group._id }))
		]);
	} catch (error) {
		yield put(DialogActions.showErrorDialog('set', 'group as active', error));
	}
}

export function* highlightGroup({ group }) {
	try {
		const color = group.color ? group.color.map((c) => c / 255) :
		Viewer.getDefaultHighlightColor();
		
		yield put(GroupsActions.addToHighlighted(group._id));

		const TreeService = getAngularService('TreeService') as any;

		if (group.objects && group.objects.length > 0) {
			return TreeService.showNodesBySharedIds(group.objects).then(() => {
				return TreeService.selectNodesBySharedIds(group.objects, color);
			});
		}
	} catch (error) {
		yield put(DialogActions.showErrorDialog('higlight', 'group', error));
	}
}

export function* dehighlightGroup({ group }) {
	try {
		yield put(GroupsActions.removeFromHighlighted(group._id));

		const TreeService = getAngularService('TreeService') as any;

		TreeService.getNodesFromSharedIds(group.objects)
			.then((nodes) => {
				TreeService.deselectNodes(nodes).then((meshes) => {
					// this.setTotalSavedMeshes(group);
				});
			});
	} catch (error) {
		yield put(DialogActions.showErrorDialog('dehiglight', 'group', error));
	}
}

export function* clearSelectionHighlights() {
	try {
		yield put(GroupsActions.setComponentState({ highlightedGroups: [] }));
		const TreeService = getAngularService('TreeService') as any;
		TreeService.clearCurrentlySelected();
	} catch (error) {
		yield put(DialogActions.showErrorDialog('clear', 'highlighted groups', error));
	}
}

export function* selectGroup({ group }) {
	try {
		const addGroup = MultiSelect.isAccumMode()
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

export default function* GroupsSaga() {
	yield takeLatest(GroupsTypes.FETCH_GROUPS, fetchGroups);
	yield takeLatest(GroupsTypes.SET_ACTIVE_GROUP, setActiveGroup);
	yield takeLatest(GroupsTypes.SELECT_GROUP, selectGroup);
	yield takeLatest(GroupsTypes.HIGHLIGHT_GROUP, highlightGroup);
	yield takeLatest(GroupsTypes.DEHIGHLIGHT_GROUP, dehighlightGroup);
	yield takeLatest(GroupsTypes.CLEAR_SELECTION_HIGHLIGHTS, clearSelectionHighlights);
}
