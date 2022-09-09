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
import { EMPTY_VIEW } from '../store.helpers';
import { ITicket } from './tickets.types';

// eslint-ignore
// TODO - delete me when endpoint is developed
export const fakeTickets: ITicket[] = [
	{
		_id: 'ticket id',
		title: 'type 1',
		number: 1,
		type: 'RISK',
		properties: {
			owner: 'owner name',
			createdAt: new Date(),
			defaultView: EMPTY_VIEW,
			dueDate: new Date(),
			pin: [],
			status: 'Open',
			priority: 'High',
			assignes: [],
		},
		modules: {
			safetibase: {
				'Level of Risk': 'High',
				'Treated Level of Risk': 'Low',
				'Treatment Status': 'Proposed',
			},
		},
	},
	{
		_id: 'ticket id2',
		title: 'type 2',
		number: 2,
		type: 'CLASH',
		properties: {
			owner: 'owner name',
			createdAt: new Date(),
			defaultView: EMPTY_VIEW,
			dueDate: new Date(),
			pin: [],
			status: 'In progress',
			priority: 'Low',
			assignes: [],
		},
		modules: {
			safetibase: {
				'Level of Risk': 'Low',
				'Treated Level of Risk': 'High',
				'Treatment Status': 'Proposed',
			},
		},
	},
	{
		_id: 'ticket id3',
		title: 'type 3',
		number: 3,
		type: 'CLASH',
		properties: {
			owner: 'owner name',
			createdAt: new Date(),
			defaultView: EMPTY_VIEW,
			dueDate: new Date(),
			pin: [],
			status: 'In progress',
			priority: 'Low',
			assignes: [],
		},
		modules: {
			safetibase: {
				'Level of Risk': 'Low',
				'Treated Level of Risk': 'High',
				'Treatment Status': 'Proposed',
			},
		},
	},
	{
		_id: 'ticket id4',
		title: 'type 4',
		number: 4,
		type: 'CONSTRUCTABILITY',
		properties: {
			owner: 'owner name',
			createdAt: new Date(),
			defaultView: EMPTY_VIEW,
			dueDate: new Date(),
			pin: [],
			status: 'In progress',
			priority: 'Low',
			assignes: [],
		},
		modules: {
			safetibase: {
				'Level of Risk': 'Low',
				'Treated Level of Risk': 'High',
				'Treatment Status': 'Proposed',
			},
		},
	},
];
