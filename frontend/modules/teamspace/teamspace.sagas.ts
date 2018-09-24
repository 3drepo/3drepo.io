import { put, takeLatest, all, call } from 'redux-saga/effects';

import * as API from '../../services/api';
import { TeamspaceTypes, TeamspaceActions } from './teamspace.redux';

export function* fetchUser({ username }) {
	try {
		yield put(TeamspaceActions.setPendingState(true));

		const { data } = yield call(API.fetchTeamspace, [username]);

		return yield all([
			put(TeamspaceActions.fetchUserSuccess({...data, username})),
			put(TeamspaceActions.setPendingState(false))
		]);
	} catch (e) {
		if (e.response) {
			return yield all([
				put(TeamspaceActions.fetchUserError(e.response.data)),
				put(TeamspaceActions.setPendingState(false))
			]);
		}
	}
}

export default function* teamspaceSaga() {
	yield takeLatest(TeamspaceTypes.FETCH_USER, fetchUser);
}
