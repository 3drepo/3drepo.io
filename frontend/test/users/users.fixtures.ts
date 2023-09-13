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

import { getMemberImgSrc } from '@/v5/store/users/users.helpers';
import { IUser } from '@/v5/store/users/users.redux';
import * as faker from 'faker';

const mockUser = (overrides?: Partial<IUser>) => ({
	user: faker.random.word(),
	firstName: faker.random.word(),
	lastName: faker.random.word(),
	company: faker.random.word(),
	job: faker.random.word(),
	email: faker.internet.email(),
	...overrides,
}); 

export const userWithoutAvatarMockFactory = (overrides?: Partial<IUser>): IUser => ({
	...mockUser(overrides),
	hasAvatar: false,
	avatarUrl: '',
});

export const userWithAvatarMockFactory = (teamspace, overrides?: Partial<IUser>): IUser => {
	const user = mockUser(overrides);
	return ({
		...user,
		hasAvatar: true,
		avatarUrl: getMemberImgSrc(teamspace, user.user),
	});
};
