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

import { connectRouter } from 'connected-react-router';
import { combineReducers } from 'redux';

import v5Reducers from '@/v5/store/reducers';

import { reducer as activitiesReducer } from './activities/activities.redux';
import { reducer as bimReducer } from './bim/bim.redux';
import { reducer as boardReducer } from './board/board.redux';
import { reducer as canvasHistoryReducer } from './canvasHistory/canvasHistory.redux';
import { reducer as chatReducer } from './chat/chat.redux';
import { reducer as commentsReducer } from './comments/comments.redux';
import { reducer as compareReducer } from './compare/compare.redux';
import { reducer as currentUserReducer } from './currentUser/currentUser.redux';
import { reducer as dialogReducer } from './dialog/dialog.redux';
import { reducer as gisReducer } from './gis/gis.redux';
import { reducer as groupsReducer } from './groups/groups.redux';
import { reducer as issuesReducer } from './issues/issues.redux';
import { reducer as jobsReducer } from './jobs/jobs.redux';
import { reducer as legendReducer } from './legend/legend.redux';
import { reducer as measurementsReducer } from './measurements/measurements.redux';
import { reducer as modelReducer } from './model/model.redux';
import { reducer as notificationsReducer } from './notifications/notifications.redux';
import { reducer as risksReducer } from './risks/risks.redux';
import { reducer as sequencesReducer } from './sequences/sequences.redux';
import { reducer as snackbarReducer } from './snackbar/snackbar.redux';
import { reducer as starredReducer } from './starred/starred.redux';
import { reducer as teamspaceReducer } from './teamspace/teamspace.redux';
import { reducer as teamspacesReducer } from './teamspaces/teamspaces.redux';
import { reducer as treeReducer } from './tree/tree.redux';
import { reducer as userManagementReducer } from './userManagement/userManagement.redux';
import { reducer as viewerReducer } from './viewer/viewer.redux';
import { reducer as viewerGuiReducer } from './viewerGui/viewerGui.redux';
import { reducer as viewpointsReducer } from './viewpoints/viewpoints.redux';
// <-- IMPORT MODULE REDUCER -->

export default function createReducer(history) {
	return combineReducers({
		router: connectRouter(history),
		canvasHistory: canvasHistoryReducer,
		activities: activitiesReducer,
		bim: bimReducer,
		board: boardReducer,
		chat: chatReducer,
		comments: commentsReducer,
		compare: compareReducer,
		currentUser: currentUserReducer,
		dialog: dialogReducer,
		gis: gisReducer,
		groups: groupsReducer,
		issues: issuesReducer,
		jobs: jobsReducer,
		legend: legendReducer,
		measurements: measurementsReducer,
		model: modelReducer,
		notifications: notificationsReducer,
		risks: risksReducer,
		sequences: sequencesReducer,
		snackbar: snackbarReducer,
		starred: starredReducer,
		teamspace: teamspaceReducer,
		teamspaces: teamspacesReducer,
		tree: treeReducer,
		userManagement: userManagementReducer,
		viewer: viewerReducer,
		viewerGui: viewerGuiReducer,
		viewpoints: viewpointsReducer,
		...v5Reducers, // <-- INJECT MODULE REDUCER -->
	});
}
