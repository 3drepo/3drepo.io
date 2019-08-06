/**
 *  Copyright (C) 2017 3D Repo Ltd
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

import { createSelector } from 'reselect';

export const selectAuthDomain = (state) => ({...state.auth});

export const selectIsAuthenticated = createSelector(
	selectAuthDomain, (state) => state.isAuthenticated
);

export const selectActiveSession = createSelector(
	selectAuthDomain, () => JSON.parse(window.localStorage.getItem('loggedIn'))
);

export const selectIsPending = createSelector(
	selectAuthDomain, (state) => state.isPending
);

export const selectMessage = createSelector(
	selectAuthDomain, (state) => state.message
);
