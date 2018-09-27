import { createSelector } from 'reselect';

const selectTeamspaceDomain = (state) => Object.assign({}, state.teamspace);

export const selectCurrentTeamspace = createSelector(
	selectTeamspaceDomain, (state) => state.currentTeamspace
);

export const selectCurrentUser = createSelector(
	selectTeamspaceDomain, (state) => state.currentUser
);

export const selectCurrentUserTeamspaces = createSelector(
	selectCurrentUser, (state) => state.accounts
);

export const selectIsPending = createSelector(
	selectTeamspaceDomain, (state) => state.isPending
);
