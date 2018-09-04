import { combineReducers } from 'redux';

import { reducer as teamspaceReducer } from './teamspace/teamspace.redux';
// <-- IMPORT MODULE REDUCER -->

export default function createReducer() {
	return combineReducers({
		teamspace: teamspaceReducer
		// <-- INJECT MODULE REDUCER -->
	});
}
