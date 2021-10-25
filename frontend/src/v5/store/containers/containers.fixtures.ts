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
import { times } from 'lodash';
import { ContainerStatuses, IContainer, IRevisions } from '@/v5/store/containers/containers.types';
import { IUser } from '@/v5/store/teamspaces/teamspaces.redux';

export const userMockFactory = (overrides?: Partial<IRevisions>): IUser => ({
	user: faker.name.findName(),
	firstName: faker.name.firstName(),
	lastName: faker.name.lastName(),
	...overrides,
});

export const revisionsMockFactory = (overrides?: Partial<IRevisions>): IRevisions => ({
	timestamp: faker.date.past(2),
	tag: faker.random.words(1),
	author: userMockFactory(),
	desc: faker.random.words(3),
	void: faker.datatype.boolean(),
	...overrides,
});

export const containerMockFactory = (overrides?: Partial<IContainer>): IContainer => ({
	_id: faker.datatype.uuid(),
	latestRevision: faker.random.words(2),
	revisionsCount: faker.datatype.number({ min: 10, max: 1200 }),
	lastUpdated: faker.date.past(2),
	name: faker.random.words(3),
	role: faker.random.arrayElement(['admin', 'collaborator']),
	type: faker.random.word(),
	status: ContainerStatuses.OK,
	code: faker.datatype.uuid(),
	isFavourite: faker.datatype.boolean(),
	revisions: times(10, () => revisionsMockFactory()),
	isPending: faker.datatype.boolean(),
	...overrides,
});
