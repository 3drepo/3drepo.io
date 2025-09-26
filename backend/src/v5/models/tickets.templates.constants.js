/**
 *  Copyright (C) 2024 3D Repo Ltd
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

const { presetModules, statusTypes } = require('../schemas/tickets/templates.constants');
const { stringToUUID } = require('../utils/helper/uuids');
const { validate } = require('../schemas/tickets/templates');

const TemplateConsts = {};

const defaultTemplates = [
	{
		_id: stringToUUID('6d8bca8e-cb85-44f7-b04f-72d2954ddd67'),
		name: 'Clash (Default template)',
		code: 'CSH',
		config: {
			comments: true,
			issueProperties: true,
			defaultView: true,
			pin: true,
			status: {
				values: [
					{ name: 'Active', type: statusTypes.OPEN },
					{ name: 'Reviewed', type: statusTypes.REVIEW },
					{ name: 'Approved', type: statusTypes.REVIEW },
					{ name: 'Resolved', type: statusTypes.DONE },
				],
				default: 'Active',
			},
			tabular: {
				columns: [
					{ property: '#ID' },
					{ property: 'TITLE' },
					{ property: 'FEDERATION/CONTAINER' },
					{ property: 'CREATED AT' },
					{ property: 'ASIGNEES' },
					{ property: 'OWNER' },
					{ property: 'DUE DATE' },
					{ property: 'PRIORITY' },
					{ property: 'STATUS' }],
			},
		},
		modules: [
			{ type: presetModules.CLASH },
		],
	},
];

TemplateConsts.defaultTemplates = defaultTemplates.map(({ _id, ...template }) => ({ ...validate(template), _id }));

module.exports = TemplateConsts;
