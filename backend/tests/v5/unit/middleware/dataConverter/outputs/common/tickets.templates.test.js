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

const { cloneDeep } = require('lodash');

const { generateRandomString } = require('../../../../../helper/services');
const { src } = require('../../../../../helper/path');

const { generateUUID, UUIDToString } = require(`${src}/utils/helper/uuids`);

const { propTypes, presetModules } = require(`${src}/schemas/tickets/templates.constants`);

const TicketSchemaUtils = require(`${src}/middleware/dataConverter/outputs/common/tickets.templates`);

const testSerialiseTicketTemplate = () => {
	describe('Serialising ticket template', () => {
		const templateData = {
			_id: generateUUID(),
			properties: [
				{
					name: generateRandomString(),
					type: propTypes.TEXT,
					default: generateRandomString(),
					deprecated: true,
				},
				{
					name: generateRandomString(),
					type: propTypes.DATE,
					default: new Date(),
				},
				{
					name: generateRandomString(),
					type: propTypes.DATE,
				},

			],
			modules: [{
				name: generateRandomString(),
				properties: [
					{
						name: generateRandomString(),
						type: propTypes.TEXT,
						default: generateRandomString(),
					},
					{
						name: generateRandomString(),
						type: propTypes.DATE,
						default: new Date(),
					},
					{
						name: generateRandomString(),
						type: propTypes.DATE,
						deprecated: true,
					},
				] },
			{
				type: presetModules.SAFETIBASE,
				deprecated: true,
				properties: [],
			},
			],

		};

		test('should convert all appropriate fields', () => {
			const expectedOutput = cloneDeep(templateData);
			expectedOutput._id = UUIDToString(templateData._id);
			expectedOutput.properties[1].default = expectedOutput.properties[1].default.getTime();
			expectedOutput.modules[0].properties[1].default = expectedOutput.modules[0].properties[1].default.getTime();

			expect(TicketSchemaUtils.serialiseTicketTemplate(templateData)).toEqual(expectedOutput);
		});

		test('should convert all appropriate fields and prune deprecated properties', () => {
			const expectedOutput = cloneDeep(templateData);
			expectedOutput._id = UUIDToString(templateData._id);
			expectedOutput.properties[1].default = expectedOutput.properties[1].default.getTime();
			expectedOutput.modules[0].properties[1].default = expectedOutput.modules[0].properties[1].default.getTime();

			expectedOutput.properties = expectedOutput.properties.filter(({ deprecated }) => !deprecated);
			expectedOutput.modules = expectedOutput.modules.filter(({ deprecated }) => !deprecated);

			expectedOutput.modules.forEach((mod) => {
				// eslint-disable-next-line no-param-reassign
				mod.properties = mod.properties.filter(({ deprecated }) => !deprecated);
			});

			expect(TicketSchemaUtils.serialiseTicketTemplate(templateData, true)).toEqual(expectedOutput);
		});
	});
};

describe('middleware/dataConverter/outputs/common/tickets.templates', () => {
	testSerialiseTicketTemplate();
});
