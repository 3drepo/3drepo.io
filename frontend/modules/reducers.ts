import { combineReducers } from 'redux';

import { reducer as teamspaceReducer } from './teamspace/teamspace.redux';

export default function createReducer() {
	return combineReducers({
		teamspace: teamspaceReducer
	});
}
