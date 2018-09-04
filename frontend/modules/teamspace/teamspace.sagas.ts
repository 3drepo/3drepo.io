import { put, takeLatest } from 'redux-saga/effects';

import { TeamspaceTypes, TeamspaceActions } from './teamspace.redux';

export function* fetchTeamspaces() {
	console.log('Sample saga!');
}

export default function* teamspaceSaga() {
	yield takeLatest(TeamspaceTypes.FETCH, fetchTeamspaces);
}
