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
import { ICurrentUserState } from './currentUser.redux';
import { ICurrentUser } from './currentUser.types';

const selectCurrentUserDomain = (state) => (state.currentUser2 as ICurrentUserState);

export const selectCurrentUser = createSelector(
	selectCurrentUserDomain, (state) => state.currentUser || {} as ICurrentUser,
);

export const selectUsername = createSelector(
	selectCurrentUser, (state) => state.username || '',
);

export const selectFirstName = createSelector(
	selectCurrentUser, (state) => state.firstName || '',
);

export const selectApiKey = createSelector(
	selectCurrentUser, (state) => state.apiKey || '',
);

export const selectApiKeyIsUpdating = createSelector(
	selectCurrentUser, (state) => !!(state.apiKeyIsUpdating),
);
