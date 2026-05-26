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
import { DASHBOARD_ROUTE } from '@/v5/ui/routes/routes.constants';
import { createSelector } from 'reselect';
import { IAuthState } from './auth.redux';

const selectAuthDomain = (state): IAuthState => state.auth2;

export const selectIsAuthenticated = createSelector(
	selectAuthDomain, (state) => !!state.isAuthenticated,
);

export const selectAuthenticatedTeamspace = createSelector(
	selectAuthDomain, (state) => state.authenticatedTeamspace,
);

export const selectSessionAuthenticatedTeamspace = createSelector(
	selectAuthDomain, (state) => state.sessionAuthenticatedTeamspace,
);

export const selectAuthenticationFetched = createSelector(
	selectAuthDomain, (state) => !(state.isAuthenticated === null),
);

export const selectIsAuthenticationPending = createSelector(
	selectAuthDomain, (state) => state.isAuthenticationPending,
);

export const selectReturnUrl = createSelector(
	selectAuthDomain, (state) => state.returnUrl || ({ pathname: DASHBOARD_ROUTE, search: '' }),
);

export const selectAuthedTeamspaceMatchesSessionOne = createSelector(
	selectAuthenticatedTeamspace,
	selectSessionAuthenticatedTeamspace,
	(authedTeamspace, sessionAuthedTeamspace) => (
		authedTeamspace
		&& sessionAuthedTeamspace
		&& sessionAuthedTeamspace === authedTeamspace
	),
);
