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

export const NOT_DEFINED_PROP = 'not defined';

export const ISSUE_FILTER_PROPS = {
	status: {
		value: 'status',
		name: 'Status',
		draggable: true
	},
	priority: {
		value: 'priority',
		name: 'Priority',
		draggable: true
	},
	topic_type: {
		value: 'topic_type',
		name: 'Topic Type',
		draggable: true
	},
	assigned_roles: {
		value: 'assigned_roles',
		name: 'Assigned To',
		draggable: true
	},
	creator_role: {
		value: 'creator_role',
		name: 'Created By',
	},
	due_date: {
		value: 'due_date',
		name: 'Due date',
		notDefinedLabel: 'No due date'
	}
};

export const RISK_FILTER_PROPS = {
	level_of_risk: {
		value: 'level_of_risk',
		name: 'Level of risk',
	},
	residual_level_of_risk: {
		value: 'residual_level_of_risk',
		name: 'Level of mitigated risk'
	},
	category: {
		value: 'category',
		name: 'Category',
		draggable: true
	},
	mitigation_status: {
		value: 'mitigation_status',
		name: 'Mitigation status',
		draggable: true
	},
	assigned_roles: {
		value: 'assigned_roles',
		name: 'Owner',
		draggable: true
	},
	creator_role: {
		value: 'creator_role',
		name: 'Created By'
	}
};

export const ISSUE_FILTER_VALUES = values(ISSUE_FILTER_PROPS);
export const RISK_FILTER_VALUES = values(RISK_FILTER_PROPS);
