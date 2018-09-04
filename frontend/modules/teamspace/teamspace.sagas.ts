import { put, takeLatest } from 'redux-saga/effects';

import { TeamspaceTypes, TeamspaceActions } from './teamspace.redux';

export function* fetchTeamspaces() {
  yield true;
}

export default function* maintainersSaga() {
  yield takeLatest(MaintainersTypes.FETCH, fetchMaintainers);
}