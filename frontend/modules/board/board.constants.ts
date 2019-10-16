/**
 *  Copyright (C) 2017 3D Repo Ltd
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

import { values } from 'lodash';

export const BOARD_TYPES = {
	ISSUES: 'issues',
	RISKS: 'risks'
};

export const FILTER_PROPS = {
	status: {
		value: 'status',
		name: 'Status'
	},
	priority: {
		value: 'priority',
		name: 'Priority'
	},
	topic_type: {
		value: 'topic_type',
		name: 'Topic Type'
	},
	assigned_roles: {
		value: 'assigned_roles',
		name: 'Assigned To'
	},
	owner: {
		value: 'owner',
		name: 'Created By'
	},
};

export const FILTERS = values(FILTER_PROPS);
