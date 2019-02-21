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

import { put, takeLatest } from 'redux-saga/effects';

import * as API from '../../services/api';
import { GroupsTypes, GroupsActions } from './groups.redux';
import { DialogActions } from '../dialog';

export function* fetchGroups({teamspace, modelId, revision}) {
	yield put(GroupsActions.togglePendingState(true));
	try {
		const {data} = yield API.getGroups(teamspace, modelId, revision);
		console.log('fetched', data);
		yield put(GroupsActions.fetchGroupsSuccess(data));
	} catch (error) {
		yield put(DialogActions.showErrorDialog('get', 'groups', error));
	}
	console.log('changed to false?');
	yield put(GroupsActions.togglePendingState(false));
}


export default function* GroupsSaga() {
	yield takeLatest(GroupsTypes.FETCH_GROUPS, fetchGroups);
}
