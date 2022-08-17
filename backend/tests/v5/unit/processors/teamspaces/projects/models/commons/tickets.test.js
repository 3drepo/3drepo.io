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

const { src } = require('../../../../../../helper/path');
const { generateRandomString, generateTemplate, generateTicket } = require('../../../../../../helper/services');

const Tickets = require(`${src}/processors/teamspaces/projects/models/commons/tickets`);

const { propTypes } = require(`${src}/schemas/tickets/templates.constants`);

jest.mock('../../../../../../../../src/v5/models/tickets');
const TicketsModel = require(`${src}/models/tickets`);
const { TICKETS_RESOURCES_COL } = require(`${src}/models/tickets.constants`);

jest.mock('../../../../../../../../src/v5/services/filesManager');
const FilesManager = require(`${src}/services/filesManager`);

const imageTest = async (isView) => {
	const teamspace = generateRandomString();
	const project = generateRandomString();
	const model = generateRandomString();

	const expectedOutput = generateRandomString();

	const propName = generateRandomString();
	const moduleName = generateRandomString();

	const propTypeToTest = isView ? propTypes.VIEW : propTypes.IMAGE;

	const template = {
		properties: [
			{
				name: propName,
				type: propTypeToTest,
			},
		],
		modules: [
			{
				name: moduleName,
				properties: [
					{
						name: propName,
						type: propTypeToTest,
					},
				],
			},
		],
	};

	const propBuffer = Buffer.from(generateRandomString());
	const modPropBuffer = Buffer.from(generateRandomString());

	const generatePropData = (buffer) => (isView ? { screenshot: buffer } : buffer);

	const ticket = {
		title: generateRandomString(),
		properties: {
			[propName]: generatePropData(propBuffer),
		},
		modules: {
			[moduleName]: {
				[propName]: generatePropData(modPropBuffer),
			},
		},
	};

	TicketsModel.addTicket.mockResolvedValueOnce(expectedOutput);

	await expect(Tickets.addTicket(teamspace, project, model, ticket, template))
		.resolves.toEqual(expectedOutput);

	expect(TicketsModel.addTicket).toHaveBeenCalledTimes(1);
	const processedTicket = TicketsModel.addTicket.mock.calls[0][3];

	const propRef = isView ? processedTicket.properties[propName].screenshot
		: processedTicket.properties[propName];
	const modPropRef = isView ? processedTicket.modules[moduleName][propName].screenshot
		: processedTicket.modules[moduleName][propName];

	expect(TicketsModel.addTicket).toHaveBeenCalledWith(teamspace, project, model,
		{
			...ticket,
			properties: { [propName]: generatePropData(propRef) },
			modules: {
				[moduleName]: {
					[propName]: generatePropData(modPropRef),
				},
			},
		});

	expect(FilesManager.storeFile).toHaveBeenCalledTimes(2);

	const meta = { teamspace, project, model };

	expect(FilesManager.storeFile).toHaveBeenCalledWith(
		teamspace, TICKETS_RESOURCES_COL, propRef, propBuffer, meta,
	);
	expect(FilesManager.storeFile).toHaveBeenCalledWith(
		teamspace, TICKETS_RESOURCES_COL, modPropRef, modPropBuffer, meta,
	);
};

const testAddTicket = () => {
	describe('Add ticket', () => {
		test('should call addTicket in model and return whatever it returns', async () => {
			const teamspace = generateRandomString();
			const project = generateRandomString();
			const model = generateRandomString();
			const template = generateTemplate();
			const ticket = generateTicket(template);

			const expectedOutput = generateRandomString();

			TicketsModel.addTicket.mockResolvedValueOnce(expectedOutput);

			await expect(Tickets.addTicket(teamspace, project, model, ticket, template))
				.resolves.toEqual(expectedOutput);

			expect(TicketsModel.addTicket).toHaveBeenCalledTimes(1);
			expect(TicketsModel.addTicket).toHaveBeenCalledWith(teamspace, project, model, ticket);

			expect(FilesManager.storeFile).not.toHaveBeenCalled();
		});

		test('should process image and store a ref', () => imageTest());
		test('should process screenshot from view data and store a ref', () => imageTest(true));
	});
};

describe('processors/teamspaces/projects/models/commons/tickets', () => {
	testAddTicket();
});
