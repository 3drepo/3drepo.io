import { all, fork } from 'redux-saga/effects';
import teamspaceSaga from './teamspace/teamspace.sagas';
import userManagementSaga from './userManagement/userManagement.sagas';
// <-- IMPORT MODULE SAGA -->

export default function* rootSaga() {
	yield all([
		fork(teamspaceSaga),
		fork(userManagementSaga)// <-- INJECT MODULE SAGA -->
	]);
}
