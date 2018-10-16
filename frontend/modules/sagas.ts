import { all, fork } from 'redux-saga/effects';
import teamspaceSaga from './teamspace/teamspace.sagas';
import userManagementSaga from './userManagement/userManagement.sagas';
import jobsSaga from './jobs/jobs.sagas';
import billingSaga from './billing/billing.sagas';
import projectsSaga from './projects/projects.sagas';
// <-- IMPORT MODULE SAGA -->

export default function* rootSaga() {
	yield all([
		fork(teamspaceSaga),
		fork(userManagementSaga),
		fork(jobsSaga),
		fork(billingSaga),
		fork(projectsSaga)// <-- INJECT MODULE SAGA -->
	]);
}
