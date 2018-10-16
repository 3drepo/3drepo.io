import { combineReducers } from 'redux';

import { reducer as teamspaceReducer } from './teamspace/teamspace.redux';
import { reducer as userManagementReducer } from './userManagement/userManagement.redux';
import { reducer as dialogReducer } from './dialog/dialog.redux';
import { reducer as jobsReducer } from './jobs/jobs.redux';
import { reducer as snackbarReducer } from './snackbar/snackbar.redux';
import { reducer as billingReducer } from './billing/billing.redux';
import { reducer as projectsReducer } from './projects/projects.redux';
import { reducer as notificationsReducer } from './notifications/notifications.redux';
// <-- IMPORT MODULE REDUCER -->

export default function createReducer() {
	return combineReducers({
		teamspace: teamspaceReducer,
		userManagement: userManagementReducer,
		dialog: dialogReducer,
		jobs: jobsReducer,
		snackbar: snackbarReducer,
		billing: billingReducer,
		projects: projectsReducer,
		notifications: notificationsReducer// <-- INJECT MODULE REDUCER -->
	});
}
