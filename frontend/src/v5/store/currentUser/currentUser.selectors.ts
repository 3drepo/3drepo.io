/**
 *  Copyright (C) 2022 3D Repo Ltd
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
import { pick } from 'lodash';

const selectCurrentUserDomain = (state) => (state.currentUser2);

export const selectCurrentUser = createSelector(
	selectCurrentUserDomain, (state) => state.currentUser || {},
);

export const selectUsername: (state) => string = createSelector(
	selectCurrentUser, (state) => state.username || '',
);

// TODO - check this merge conflicts (Errors and ApiKey are mine, firstname is from staging)
export const selectErrors: (state) => { avatarError?: string, passwordError?: string } = createSelector(
	selectCurrentUser, (state) => pick(state, 'avatarError', 'passwordError'),
);

export const selectApiKey: (state) => string = createSelector(
	selectCurrentUser, (state) => state.apiKey || '',
);

export const selectFirstName: (state) => string = createSelector(
	selectCurrentUser, (state) => state.firstName || '',
);
