import { all, fork } from 'redux-saga/effects';
import currentUserSaga from './currentUser/currentUser.sagas';
import userManagementSaga from './userManagement/userManagement.sagas';
import jobsSaga from './jobs/jobs.sagas';
import billingSaga from './billing/billing.sagas';
import teamspacesSaga from './teamspaces/teamspaces.sagas';
import modelSaga from './model/model.sagas';
import authSaga from './auth/auth.sagas';
import notificationsSaga from './notifications/notifications.sagas';
import staticPagesSaga from './staticPages/staticPages.sagas';
import gisSaga from './gis/gis.sagas';
import viewerSaga from './viewer/viewer.sagas';
import viewpointsSaga from './viewpoints/viewpoints.sagas';
import viewsSaga from './views/views.sagas';
// <-- IMPORT MODULE SAGA -->

export default function* rootSaga() {
	yield all([
		fork(currentUserSaga),
		fork(userManagementSaga),
		fork(jobsSaga),
		fork(billingSaga),
		fork(teamspacesSaga),
		fork(modelSaga),
		fork(authSaga),
		fork(notificationsSaga),
		fork(staticPagesSaga),
		fork(gisSaga),
		fork(viewerSaga),
		fork(viewpointsSaga),
		fork(viewsSaga)// <-- INJECT MODULE SAGA -->
	]);
}
