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

import * as faker from 'faker';
import { ICurrentUser, UpdatePersonalData } from '@/v5/store/currentUser/currentUser.types';
import { getUrl } from '@/v5/services/api/default';
import { pick } from 'lodash';
import { IUser } from '@/v5/store/users/users.redux';

export const generateFakeApiKey = () => faker.datatype.uuid();

export const currentUserMockFactory = (overrides?: Partial<ICurrentUser>): ICurrentUser => ({
	username:  faker.random.word(),
	firstName:  faker.random.word(),
	lastName:  faker.random.word(),
	email:  faker.random.word(),
	apiKey:  generateFakeApiKey(),
	company:  faker.random.word(),
	countryCode:  faker.random.word(),
	hasAvatar: faker.datatype.boolean(),
	...overrides,
});

export const userFromCurrentUser = (currentUser: Partial<ICurrentUser>) => ({
	...pick(currentUser, ['company', 'firstName', 'lastName', 'email', 'hasAvatar', 'avatarUrl']),
	user: currentUser.username,
}) as IUser;

export const generatePersonalData = (): UpdatePersonalData => ({
	firstName: faker.name.firstName(),
	lastName: faker.name.lastName(),
	company: faker.company.companyName(),
	countryCode: faker.address.countryCode(),
});

export const generateFakeAvatarFile = (): File => new File([], 'avatar.png');

export const generateFakeAvatarUrl = () => getUrl(`user/avatar?${Date.now()}`);