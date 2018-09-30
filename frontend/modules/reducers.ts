import { combineReducers } from 'redux';

import { reducer as teamspaceReducer } from './teamspace/teamspace.redux';
import { reducer as userManagementReducer } from './userManagement/userManagement.redux';
import { reducer as dialogReducer } from './dialog/dialog.redux';
import { reducer as jobsReducer } from './jobs/jobs.redux';
// <-- IMPORT MODULE REDUCER -->

export default function createReducer() {
	return combineReducers({
		teamspace: teamspaceReducer,
		userManagement: userManagementReducer,
		dialog: dialogReducer,
		jobs: jobsReducer// <-- INJECT MODULE REDUCER -->
	});
}
