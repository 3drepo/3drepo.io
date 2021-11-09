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
import { ContainerStatuses, FetchContainerStatsResponse, IContainer } from '@/v5/store/containers/containers.types';

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
	units: 'mm',
	isFavourite: faker.datatype.boolean(),
	hasStatsPending: true,
	...overrides,
});

export const prepareMockStatsReply = (container: IContainer): FetchContainerStatsResponse => ({
	revisions: {
		total: container.revisionsCount,
		lastUpdated: container.lastUpdated.valueOf(),
		latestRevision: container.latestRevision,
	},
	type: container.type,
	status: container.status,
	code: container.code,
	units: container.units,
});
