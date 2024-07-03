/**
 *  Copyright (C) 2021 3D Repo Ltd
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

import { all, fork } from 'redux-saga/effects';
import containersSaga from '@/v5/store/containers/containers.sagas';
import federationsSaga from '@/v5/store/federations/federations.sagas';
import projectsSaga from '@/v5/store/projects/projects.sagas';
import teamspaces2Saga from '@/v5/store/teamspaces/teamspaces.sagas';
import currentUser2Saga from '@/v5/store/currentUser/currentUser.sagas';
import auth2Saga from '@/v5/store/auth/auth.sagas';
import usersSaga from '@/v5/store/users/users.sagas';
import revisionsSaga from '@/v5/store/revisions/revisions.sagas';
import ticketsSaga from '@/v5/store/tickets/tickets.sagas';
import ticketCommentsSaga from '@/v5/store/tickets/comments/ticketComments.sagas';
import viewer2Saga from '@/v5/store/viewer/viewer.sagas';
import ticketsCardSaga from '@/v5/store/tickets/card/ticketsCard.sagas';
import activitiesSaga from './activities/activities.sagas';
import authSaga from './auth/auth.sagas';
import bimSaga from './bim/bim.sagas';
import boardSaga from './board/board.sagas';
import chatSaga from './chat/chat.sagas';
import commentsSaga from './comments/comments.sagas';
import compareSaga from './compare/compare.sagas';
import currentUserSaga from './currentUser/currentUser.sagas';
import dialogSaga from './dialog/dialog.sagas';
import groupsSaga from './groups/groups.sagas';
import issuesSaga from './issues/issues.sagas';
import jobsSaga from './jobs/jobs.sagas';
import legendSaga from './legend/legend.sagas';
import measurementsSaga from './measurements/measurements.sagas';
import modelSaga from './model/model.sagas';
import notificationsSaga from './notifications/notifications.sagas';
import risksSaga from './risks/risks.sagas';
import sequencesSaga from './sequences/sequences.sagas';
import starredSaga from './starred/starred.sagas';
import teamspaceSaga from './teamspace/teamspace.sagas';
import teamspacesSaga from './teamspaces/teamspaces.sagas';
import treeSaga from './tree/tree.sagas';
import userManagementSaga from './userManagement/userManagement.sagas';
import viewerSaga from './viewer/viewer.sagas';
import viewerGuiSaga from './viewerGui/viewerGui.sagas';
import viewpointsSaga from './viewpoints/viewpoints.sagas';

// <-- IMPORT MODULE SAGA -->

export default function* rootSaga() {
	yield all([
		fork(activitiesSaga),
		fork(authSaga),
		fork(bimSaga),
		fork(boardSaga),
		fork(chatSaga),
		fork(commentsSaga),
		fork(compareSaga),
		fork(currentUserSaga),
		fork(dialogSaga),
		fork(groupsSaga),
		fork(issuesSaga),
		fork(jobsSaga),
		fork(legendSaga),
		fork(measurementsSaga),
		fork(modelSaga),
		fork(notificationsSaga),
		fork(risksSaga),
		fork(sequencesSaga),
		fork(starredSaga),
		fork(teamspaceSaga),
		fork(teamspacesSaga),
		fork(treeSaga),
		fork(userManagementSaga),
		fork(viewerSaga),
		fork(viewerGuiSaga),
		fork(viewpointsSaga),

		fork(auth2Saga),
		fork(containersSaga),
		fork(currentUser2Saga),
		fork(federationsSaga),
		fork(projectsSaga),
		fork(revisionsSaga),
		fork(ticketsSaga),
		fork(ticketsCardSaga),
		fork(ticketCommentsSaga),
		fork(teamspaces2Saga),
		fork(usersSaga),
		fork(viewer2Saga),
		// <-- INJECT MODULE SAGA -->
	]);
}
