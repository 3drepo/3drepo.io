import { createSelector } from 'reselect';

const selectTeamspaceDomain = (state) => Object.assign({}, state.teamspace);

export const selectButtonText = createSelector(
	selectTeamspaceDomain, (state) => state.buttonText
);
