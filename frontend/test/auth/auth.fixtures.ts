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

import { IAuthState } from '@/v5/store/auth/auth.redux';
import faker from 'faker';

export const authMockFactory = (overrides?: Partial<IAuthState>): IAuthState => ({
    isAuthenticated: faker.datatype.boolean(),
	isAuthenticationPending: faker.datatype.boolean(),
	authenticatedTeamspace: faker.datatype.string(),
	returnUrl: {
		pathname: faker.internet.url(),
	},
	...overrides,
});
