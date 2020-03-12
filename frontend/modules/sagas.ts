import { all, fork } from 'redux-saga/effects';
import authSaga from './auth/auth.sagas';
import billingSaga from './billing/billing.sagas';
import bimSaga from './bim/bim.sagas';
import boardSaga from './board/board.sagas';
import chatSaga from './chat/chat.sagas';
import compareSaga from './compare/compare.sagas';
import currentUserSaga from './currentUser/currentUser.sagas';
import dialogSaga from './dialog/dialog.sagas';
import groupsSaga from './groups/groups.sagas';
import issuesSaga from './issues/issues.sagas';
import jobsSaga from './jobs/jobs.sagas';
import measureSaga from './measure/measure.sagas';
import modelSaga from './model/model.sagas';
import notificationsSaga from './notifications/notifications.sagas';
import risksSaga from './risks/risks.sagas';
import sequencesSaga from './sequences/sequences.sagas';
import starredSaga from './starred/starred.sagas';
import startupSaga from './startup/startup.sagas';
import teamspacesSaga from './teamspaces/teamspaces.sagas';
import treeSaga from './tree/tree.sagas';
import userManagementSaga from './userManagement/userManagement.sagas';
import usersSaga from './users/users.sagas';
import viewerSaga from './viewer/viewer.sagas';
import viewerGuiSaga from './viewerGui/viewerGui.sagas';
import viewpointsSaga from './viewpoints/viewpoints.sagas';
// <-- IMPORT MODULE SAGA -->

export default function* rootSaga() {
	yield all([
		fork(startupSaga),
		fork(currentUserSaga),
		fork(userManagementSaga),
		fork(jobsSaga),
		fork(billingSaga),
		fork(teamspacesSaga),
		fork(modelSaga),
		fork(authSaga),
		fork(notificationsSaga),
		fork(usersSaga),
		fork(viewerSaga),
		fork(risksSaga),
		fork(viewpointsSaga),
		fork(groupsSaga),
		fork(treeSaga),
		fork(bimSaga),
		fork(starredSaga),
		fork(measureSaga),
		fork(issuesSaga),
		fork(compareSaga),
		fork(chatSaga),
		fork(viewerGuiSaga),
		fork(dialogSaga),
		fork(boardSaga),
		fork(sequencesSaga)
		// <-- INJECT MODULE SAGA -->
	]);
}
