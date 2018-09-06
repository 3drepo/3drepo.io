import { createActions, createReducer } from 'reduxsauce';

export const { Types: TeamspaceTypes, Creators: TeamspaceActions } = createActions({
	fetchUser: ['username'],
	fetchUserSuccess: ['userData'],
	fetchUserError: ['error'],

	setPendingState: ['pendingState'],
	updateButtonText: ['value']
}, { prefix: 'TEAMSPACE_' });

export const INITIAL_STATE = {
	currentTeamspace: '',
	currentUser: {},
	isPending: true
};

const setPendingState = (state = INITIAL_STATE, { pendingState }) => {
	return Object.assign({}, state, { isPending: pendingState });
};

const fetchUserSuccess = (state = INITIAL_STATE, { userData }) => {
	return {
		...state,
		currentTeamspace: userData.username,
		currentUser: userData
	};
};

const fetchUserError = (state = INITIAL_STATE, { error }) => {
	console.error(error);
};

export const reducer = createReducer(INITIAL_STATE, {
	[TeamspaceTypes.FETCH_USER_SUCCESS]: fetchUserSuccess,
	[TeamspaceTypes.FETCH_USER_ERROR]: fetchUserError,
	[TeamspaceTypes.SET_PENDING_STATE]: setPendingState
});
