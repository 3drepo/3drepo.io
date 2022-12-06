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

 import { EMPTY_VIEW } from '@/v5/store/store.helpers';
import { ITemplate, ITicket } from '@/v5/store/tickets/tickets.types';
import * as faker from 'faker';
import { times } from 'lodash';

export const ticketMockFactory = (overrides?: ITicket): ITicket => ({
	_id: faker.datatype.uuid(),
	number: faker.datatype.number(),
	type: faker.random.word(),
	properties: {
		owner: faker.random.word(),
		defaultView: EMPTY_VIEW,
		pin: [],
		status: faker.random.arrayElement(['None', 'Low', 'Medium', 'High']),
		priority : faker.random.arrayElement(['Open', 'In progress', 'For approval', 'Closed', 'Void']),
		assignes: [],
		...overrides?.properties,
	},
	modules: {},
	...overrides,
});

export const templateMockFactory = (overrides?: ITemplate): ITemplate => ({
	_id: faker.datatype.uuid(),
	name: faker.random.word(),
	code: faker.random.alpha({ count: 5, upcase: true }),
	...overrides,
});

export const mockRiskCategories = (): string[] => times(5, () => faker.random.word())