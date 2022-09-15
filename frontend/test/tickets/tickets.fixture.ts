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
import { ITemplate, ITemplateDetails, ITicket } from '@/v5/store/tickets/tickets.types';
import * as faker from 'faker';

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
	deprecated: faker.datatype.boolean(),
	...overrides,
});

export const templateDetailsMockFactory = (overrides?: ITemplateDetails): ITemplateDetails => ({
	config: {
		comments: faker.datatype.boolean(),
		issueProperties: faker.datatype.boolean(),
		defaultView: faker.datatype.boolean(),
		defaultImage: faker.datatype.boolean(),
		pin: faker.datatype.boolean(),
	},
	properties: [{
		name: faker.random.word(),
		type: faker.random.word(),
		deprecated: faker.datatype.boolean(),
		required: faker.datatype.boolean(),
		values: [faker.random.word()],
	}],
	modules: [{
		name: faker.random.word(),
		type: faker.random.word(),
		deprecated: faker.datatype.boolean(),
		properties: [{
			name: faker.random.word(),
			type: faker.random.word(),
			deprecated: faker.datatype.boolean(),
			required: faker.datatype.boolean(),
			values: [faker.random.word()],
		}],
	}],
	...overrides,
});
