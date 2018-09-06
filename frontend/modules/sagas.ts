import { all, fork } from 'redux-saga/effects';
import teamspaceSaga from './teamspace/teamspace.sagas';
import usersSaga from './users/users.sagas';
// <-- IMPORT MODULE SAGA -->

export default function* rootSaga() {
	yield all([
		fork(teamspaceSaga),
		fork(usersSaga)// <-- INJECT MODULE SAGA -->
	]);
}
