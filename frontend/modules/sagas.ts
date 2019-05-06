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
import usersSaga from './users/users.sagas';
import gisSaga from './gis/gis.sagas';
import viewerSaga from './viewer/viewer.sagas';
import viewpointsSaga from './viewpoints/viewpoints.sagas';
import risksSaga from './risks/risks.sagas';
import groupsSaga from './groups/groups.sagas';
import treeSaga from './tree/tree.sagas';
import bimSaga from './bim/bim.sagas';
import starredMetaSaga from './starredMeta/starredMeta.sagas';
import measureSaga from './measure/measure.sagas';
import issuesSaga from './issues/issues.sagas';
import compareSaga from './compare/compare.sagas';
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
		fork(usersSaga),
		fork(gisSaga),
		fork(viewerSaga),
		fork(risksSaga),
		fork(viewpointsSaga),
		fork(groupsSaga),
		fork(treeSaga),
		fork(bimSaga),
		fork(starredMetaSaga),
		fork(measureSaga),
		fork(issuesSaga),
		fork(compareSaga)// <-- INJECT MODULE SAGA -->
	]);
}
