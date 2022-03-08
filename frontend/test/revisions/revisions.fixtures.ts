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
import { CreateRevisionBody, IRevision } from '@/v5/store/revisions/revisions.types';

export const revisionsMockFactory = (overrides?: Partial<IRevision>): IRevision => ({
	_id: faker.datatype.uuid(),
	timestamp: faker.date.past(2),
	tag: faker.random.words(1),
	author: faker.name.findName(),
	desc: faker.random.words(3),
	void: faker.datatype.boolean(),
	...overrides,
});

export const mockCreateRevisionBody = (overrides?: Partial<CreateRevisionBody>): CreateRevisionBody => ({
	revisionTag: faker.random.words(1),
	revisionDesc: faker.random.words(3),
	file: new File(['file'], 'filename.obj'),
	importAnimations: false,
	timezone: 'Europe/London',
	containerName: faker.random.words(1),
	containerType: 'Other',
	containerUnit: 'cm',
	containerDesc: faker.random.words(3),
	containerCode: faker.random.words(1),
	...overrides,
});