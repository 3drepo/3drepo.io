import { combineReducers } from 'redux';

import { reducer as teamspaceReducer } from './teamspace/teamspace.redux';
import { reducer as usersReducer } from './users/users.redux';
// <-- IMPORT MODULE REDUCER -->

export default function createReducer() {
	return combineReducers({
		teamspace: teamspaceReducer,
		users: usersReducer// <-- INJECT MODULE REDUCER -->
	});
}
