import { createSelector } from 'reselect';

const selectTeamspaceDomain = (state) => state.get('teamspace');

export const selectTeamspace = createSelector(
	selectTeamspaceDomain, (state) => state
);
