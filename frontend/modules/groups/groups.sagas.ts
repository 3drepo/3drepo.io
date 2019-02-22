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

import * as API from '../../services/api';
import { GroupsTypes, GroupsActions } from './groups.redux';
import { DialogActions } from '../dialog';
import {
	selectActiveGroupId,
	selectGroupsMap
} from './groups.selectors';

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
			put(GroupsActions.highlightGroup(group, filteredGroups, revision)),
			put(GroupsActions.setComponentState({ activeGroup: group._id }))
		]);
	} catch (error) {
		yield put(DialogActions.showErrorDialog('set', 'group as active', error));
	}
}

export function* highlightGroup({ group, filteredGroups, revision }) {
	try {
		console.log('Highlight group')
	} catch (error) {
		yield put(DialogActions.showErrorDialog('higlight', 'group', error));
	}
}

export default function* GroupsSaga() {
	yield takeLatest(GroupsTypes.FETCH_GROUPS, fetchGroups);
	yield takeLatest(GroupsTypes.SET_ACTIVE_GROUP, setActiveGroup);
	yield takeLatest(GroupsTypes.HIGHLIGHT_GROUP, highlightGroup);
}
