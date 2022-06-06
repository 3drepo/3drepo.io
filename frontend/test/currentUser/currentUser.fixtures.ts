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

import * as faker from 'faker';
import { ICurrentUser, UpdatePersonalData } from '@/v5/store/currentUser/currentUser.types';

export const currentUserMockFactory = (overrides?: Partial<ICurrentUser>): ICurrentUser => ({
	username:  faker.random.word(),
	firstName:  faker.random.word(),
	lastName:  faker.random.word(),
	email:  faker.random.word(),
	apiKey:  faker.datatype.uuid(),
	company:  faker.random.word(),
	countryCode:  faker.random.word(),
	hasAvatar: faker.datatype.boolean(),
	...overrides,
});

export const generatePersonlData = (): UpdatePersonalData => ({
	firstName: faker.name.firstName(),
	lastName: faker.name.lastName(),
	email: faker.internet.email(),
	company: faker.company.companyName(),
	countryCode: faker.address.countryCode(),
});

export const generateFakeAvatarFile = (): File => new File([], 'avatar.png');

export const generateFakeAvatarUrl = () => 'blob:https://stackoverflow.com/3044f1cf-d41b-4e6d-ae79-b995342e7000';

export const generateFakeApiKey = () => ({ apiKey: faker.datatype.uuid() });
