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

const { times } = require('lodash');
const { src } = require('../../../../../../helper/path');
const { generateRandomString, generateTemplate, generateTicket, generateGroup } = require('../../../../../../helper/services');

const Tickets = require(`${src}/processors/teamspaces/projects/models/commons/tickets`);

const { basePropertyLabels, modulePropertyLabels, presetModules, propTypes } = require(`${src}/schemas/tickets/templates.constants`);

const { isUUID } = require(`${src}/utils/helper/typeCheck`);

jest.mock('../../../../../../../../src/v5/models/tickets');
const TicketsModel = require(`${src}/models/tickets`);

jest.mock('../../../../../../../../src/v5/models/tickets.groups');
const TicketGroupsModel = require(`${src}/models/tickets.groups`);

jest.mock('../../../../../../../../src/v5/schemas/tickets/templates');
const TemplatesModel = require(`${src}/schemas/tickets/templates`);

const { TICKETS_RESOURCES_COL } = require(`${src}/models/tickets.constants`);

jest.mock('../../../../../../../../src/v5/services/filesManager');
const FilesManager = require(`${src}/services/filesManager`);

const generatePropData = (buffer, isView) => (isView
	? {
		screenshot: buffer,
		camera: {
			position: [0, 0, 0],
			up: [0, 0, 1],
			forward: [1, 1, 0],
		},
	} : buffer);

const generateImageTestData = (isView) => {
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
			{
				type: 'safetibase',
				properties: [],
			},
		],
	};

	const propBuffer = Buffer.from(generateRandomString());
	const modPropBuffer = Buffer.from(generateRandomString());

	const ticket = {
		_id: generateRandomString(),
		title: generateRandomString(),
		properties: {
			[propName]: generatePropData(propBuffer, isView),
		},
		modules: {
			[moduleName]: {
				[propName]: generatePropData(modPropBuffer, isView),
			},
		},
	};

	return { template, ticket, propName, moduleName, propBuffer, modPropBuffer };
};

const addTicketImageTest = async (isView) => {
	const teamspace = generateRandomString();
	const project = generateRandomString();
	const model = generateRandomString();
	const expectedOutput = generateRandomString();
	const imageTestData = generateImageTestData(isView);

	TicketsModel.addTicket.mockResolvedValueOnce(expectedOutput);
	TemplatesModel.generateFullSchema.mockImplementationOnce((t) => t);

	await expect(Tickets.addTicket(teamspace, project, model, imageTestData.template,
		imageTestData.ticket)).resolves.toEqual(expectedOutput);

	const processedTicket = TicketsModel.addTicket.mock.calls[0][3];
	const propRef = isView ? processedTicket.properties[imageTestData.propName].screenshot
		: processedTicket.properties[imageTestData.propName];
	const modPropRef = isView ? processedTicket.modules[imageTestData.moduleName][imageTestData.propName].screenshot
		: processedTicket.modules[imageTestData.moduleName][imageTestData.propName];

	expect(TicketsModel.addTicket).toHaveBeenCalledTimes(1);
	expect(TicketsModel.addTicket).toHaveBeenCalledWith(teamspace, project, model,
		{
			...imageTestData.ticket,
			properties: { [imageTestData.propName]: generatePropData(propRef, isView) },
			modules: {
				[imageTestData.moduleName]: {
					[imageTestData.propName]: generatePropData(modPropRef, isView),
				},
			},
		});

	expect(TemplatesModel.generateFullSchema).toHaveBeenCalledTimes(1);
	expect(TemplatesModel.generateFullSchema).toHaveBeenCalledWith(imageTestData.template);

	const meta = { teamspace, project, model, ticket: expectedOutput };
	expect(FilesManager.storeFile).toHaveBeenCalledTimes(2);
	expect(FilesManager.storeFile).toHaveBeenCalledWith(
		teamspace, TICKETS_RESOURCES_COL, propRef, imageTestData.propBuffer, meta,
	);
	expect(FilesManager.storeFile).toHaveBeenCalledWith(
		teamspace, TICKETS_RESOURCES_COL, modPropRef, imageTestData.modPropBuffer, meta,
	);
};

const updateTicketImageTest = async (isView) => {
	const teamspace = generateRandomString();
	const project = generateRandomString();
	const model = generateRandomString();
	const author = generateRandomString();

	TemplatesModel.generateFullSchema.mockImplementationOnce((t) => t);

	const imageTestData = generateImageTestData(isView);
	const updatePropBuffer = Buffer.from(generateRandomString());
	const updateModPropBuffer = Buffer.from(generateRandomString());
	const updateData = {
		properties: {
			[imageTestData.propName]: generatePropData(updatePropBuffer, isView),
		},
		modules: {
			[imageTestData.moduleName]: {
				[imageTestData.propName]: generatePropData(updateModPropBuffer, isView),
			},
		},
	};

	await expect(Tickets.updateTicket(teamspace, project, model, imageTestData.template,
		imageTestData.ticket, updateData, author)).resolves.toBeUndefined();

	const processedTicket = TicketsModel.updateTicket.mock.calls[0][4];
	const propRef = isView ? processedTicket.properties[imageTestData.propName].screenshot
		: processedTicket.properties[imageTestData.propName];
	const modPropRef = isView ? processedTicket.modules[imageTestData.moduleName][imageTestData.propName].screenshot
		: processedTicket.modules[imageTestData.moduleName][imageTestData.propName];

	expect(TicketsModel.updateTicket).toHaveBeenCalledTimes(1);
	expect(TicketsModel.updateTicket).toHaveBeenCalledWith(teamspace, project, model, imageTestData.ticket,
		{
			properties: { [imageTestData.propName]: generatePropData(propRef, isView) },
			modules: {
				[imageTestData.moduleName]: {
					[imageTestData.propName]: generatePropData(modPropRef, isView),
				},
			},
		},
		author);

	expect(TemplatesModel.generateFullSchema).toHaveBeenCalledTimes(1);
	expect(TemplatesModel.generateFullSchema).toHaveBeenCalledWith(imageTestData.template);

	const meta = { teamspace, project, model, ticket: imageTestData.ticket._id };
	expect(FilesManager.storeFile).toHaveBeenCalledTimes(2);
	expect(FilesManager.storeFile).toHaveBeenCalledWith(
		teamspace, TICKETS_RESOURCES_COL, propRef, updatePropBuffer, meta,
	);
	expect(FilesManager.storeFile).toHaveBeenCalledWith(
		teamspace, TICKETS_RESOURCES_COL, modPropRef, updateModPropBuffer, meta,
	);
	expect(FilesManager.removeFile).toHaveBeenCalledTimes(2);
	expect(FilesManager.removeFile).toHaveBeenCalledWith(
		teamspace, TICKETS_RESOURCES_COL, imageTestData.propBuffer,
	);
	expect(FilesManager.removeFile).toHaveBeenCalledWith(
		teamspace, TICKETS_RESOURCES_COL, imageTestData.propBuffer,
	);
};

const groupTests = () => {
	const generateGroupsTestData = () => {
		const propName = generateRandomString();
		const moduleName = generateRandomString();

		const template = {
			properties: [
				{
					name: propName,
					type: propTypes.VIEW,
				},
			],
			modules: [
				{
					name: moduleName,
					properties: [
						{
							name: propName,
							type: propTypes.VIEW,
						},
					],
				},
				{
					type: 'safetibase',
					properties: [],
				},
			],
		};

		const generateStatesData = () => (
			{ state: {
				colored: times(3, () => ({ group: generateGroup(true, { hasId: false }) })),
				hidden: times(3, () => ({ group: generateGroup(false, { hasId: false }) })),
				transformed: times(3, () => ({ group: generateGroup(false, { hasId: false }) })),
			} }
		);

		const ticket = {
			_id: generateRandomString(),
			title: generateRandomString(),
			properties: {
				[propName]: generateStatesData(),
			},
			modules: {
				[moduleName]: {
					[propName]: generateStatesData(),
				},
			},
		};

		return { template, ticket, propName, moduleName };
	};

	describe('Test group state', () => {
		test('Groups should be extracted and replaced with a group UUID', async () => {
			const teamspace = generateRandomString();
			const project = generateRandomString();
			const model = generateRandomString();

			const testData = generateGroupsTestData();
			const expectedOutput = generateRandomString();

			TicketsModel.addTicket.mockResolvedValueOnce(expectedOutput);
			TemplatesModel.generateFullSchema.mockImplementationOnce((t) => t);

			await expect(Tickets.addTicket(teamspace, project, model, testData.template,
				testData.ticket)).resolves.toEqual(expectedOutput);

			expect(TicketsModel.addTicket).toHaveBeenCalledTimes(1);
			expect(TicketsModel.addTicket).toHaveBeenCalledWith(teamspace, project, model, expect.any(Object));

			const newGroups = [];

			const processedTicket = TicketsModel.addTicket.mock.calls[0][3];
			const propData = processedTicket.properties[testData.propName];
			const modPropData = processedTicket.modules[testData.moduleName][testData.propName];

			console.dir(propData, { depth: null });

			[propData, modPropData].forEach(({ state }) => {
				Object.keys(state).forEach((key) => {
					state[key].forEach(({ group }) => {
						expect(isUUID(group)).toBeTruthy();
						newGroups.push(group);
					});
				});
			});

			expect(TemplatesModel.generateFullSchema).toHaveBeenCalledTimes(1);
			expect(TemplatesModel.generateFullSchema).toHaveBeenCalledWith(testData.template);

			expect(TicketGroupsModel.addGroups).toHaveBeenCalledTimes(1);
			expect(TicketGroupsModel.addGroups).toHaveBeenCalledWith(teamspace, project, model, expect.any(Array));

			const groupIDsToSave = TicketGroupsModel.addGroups.mock.calls[0][3].map(({ _id }) => _id);

			expect(groupIDsToSave.length).toBe(newGroups.length);
			expect(groupIDsToSave).toEqual(expect.arrayContaining(newGroups));
			expect(TicketGroupsModel.deleteGroups).not.toHaveBeenCalled();
		});
	});
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
			TemplatesModel.generateFullSchema.mockImplementationOnce((t) => t);

			await expect(Tickets.addTicket(teamspace, project, model, template, ticket))
				.resolves.toEqual(expectedOutput);

			expect(TemplatesModel.generateFullSchema).toHaveBeenCalledTimes(1);
			expect(TemplatesModel.generateFullSchema).toHaveBeenCalledWith(template);

			expect(TicketsModel.addTicket).toHaveBeenCalledTimes(1);
			expect(TicketsModel.addTicket).toHaveBeenCalledWith(teamspace, project, model, ticket);

			expect(FilesManager.storeFile).not.toHaveBeenCalled();
		});

		test('should process image and store a ref', () => addTicketImageTest());
		test('should process screenshot from view data and store a ref', () => addTicketImageTest(true));

		groupTests();
	});
};

const testUpdateTicket = () => {
	describe('Update ticket', () => {
		test('should call updateTicket in model', async () => {
			const teamspace = generateRandomString();
			const project = generateRandomString();
			const model = generateRandomString();
			const template = generateTemplate();
			const ticket = generateTicket(template);
			const updateData = {
				title: generateRandomString(),
				properties: {},
			};
			const author = generateRandomString();
			TemplatesModel.generateFullSchema.mockImplementationOnce((t) => t);

			await expect(Tickets.updateTicket(teamspace, project, model, template, ticket,
				updateData, author))
				.resolves.toBeUndefined();

			expect(TicketsModel.updateTicket).toHaveBeenCalledTimes(1);
			expect(TicketsModel.updateTicket).toHaveBeenCalledWith(teamspace, project, model, ticket,
				updateData, author);
			expect(TemplatesModel.generateFullSchema).toHaveBeenCalledTimes(1);
			expect(TemplatesModel.generateFullSchema).toHaveBeenCalledWith(template);

			expect(FilesManager.storeFile).not.toHaveBeenCalled();
			expect(FilesManager.removeFile).not.toHaveBeenCalled();
		});

		test('should process image and store a ref', () => updateTicketImageTest());
		test('should process screenshot from view data and store a ref', () => updateTicketImageTest(true));
	});
};

const testGetTicketResourceAsStream = () => {
	describe('Get ticket resource', () => {
		const teamspace = generateRandomString();
		const project = generateRandomString();
		const model = generateRandomString();
		const resource = generateRandomString();
		const ticket = generateRandomString();
		test('Should call getFileWithMetaAsStream and return whatever it returns', async () => {
			const expectedOutput = generateRandomString();
			FilesManager.getFileWithMetaAsStream.mockResolvedValueOnce(expectedOutput);

			await expect(Tickets.getTicketResourceAsStream(teamspace,
				project, model, ticket, resource)).resolves.toEqual(expectedOutput);

			expect(FilesManager.getFileWithMetaAsStream).toHaveBeenCalledTimes(1);
			expect(FilesManager.getFileWithMetaAsStream).toHaveBeenCalledWith(teamspace,
				TICKETS_RESOURCES_COL, resource, { teamspace, project, model, ticket });
		});

		test('Should throw whatever error getFileWithMetaAsStream thrown', async () => {
			const expectedOutput = generateRandomString();
			FilesManager.getFileWithMetaAsStream.mockRejectedValueOnce(expectedOutput);

			await expect(Tickets.getTicketResourceAsStream(teamspace,
				project, model, ticket, resource)).rejects.toEqual(expectedOutput);
		});
	});
};

const testGetTicketById = () => {
	describe('Get ticket by Id', () => {
		test('should call getTicketById in model and return whatever it returns', async () => {
			const teamspace = generateRandomString();
			const project = generateRandomString();
			const model = generateRandomString();
			const ticket = generateRandomString();

			const expectedOutput = generateRandomString();

			TicketsModel.getTicketById.mockResolvedValueOnce(expectedOutput);

			await expect(Tickets.getTicketById(teamspace, project, model, ticket))
				.resolves.toEqual(expectedOutput);

			expect(TicketsModel.getTicketById).toHaveBeenCalledTimes(1);
			expect(TicketsModel.getTicketById).toHaveBeenCalledWith(teamspace, project, model, ticket);
		});
	});
};

const testGetTicketList = () => {
	describe('Get ticket list', () => {
		test('should call getAllTickets in model with the expected projection', async () => {
			const teamspace = generateRandomString();
			const project = generateRandomString();
			const model = generateRandomString();

			const expectedOutput = generateRandomString();

			TicketsModel.getAllTickets.mockResolvedValueOnce(expectedOutput);

			await expect(Tickets.getTicketList(teamspace, project, model))
				.resolves.toEqual(expectedOutput);

			const { SAFETIBASE } = presetModules;
			const { [SAFETIBASE]: safetibaseProps } = modulePropertyLabels;
			const projection = {
				_id: 1,
				title: 1,
				number: 1,
				type: 1,
				[`properties.${basePropertyLabels.OWNER}`]: 1,
				[`properties.${basePropertyLabels.CREATED_AT}`]: 1,
				[`properties.${basePropertyLabels.DEFAULT_VIEW}`]: 1,
				[`properties.${basePropertyLabels.DUE_DATE}`]: 1,
				[`properties.${basePropertyLabels.PIN}`]: 1,
				[`properties.${basePropertyLabels.STATUS}`]: 1,
				[`properties.${basePropertyLabels.PRIORITY}`]: 1,
				[`properties.${basePropertyLabels.ASSIGNEES}`]: 1,
				[`modules.${SAFETIBASE}.${safetibaseProps.LEVEL_OF_RISK}`]: 1,
				[`modules.${SAFETIBASE}.${safetibaseProps.TREATED_LEVEL_OF_RISK}`]: 1,
				[`modules.${SAFETIBASE}.${safetibaseProps.TREATMENT_STATUS}`]: 1,

			};

			expect(TicketsModel.getAllTickets).toHaveBeenCalledTimes(1);
			expect(TicketsModel.getAllTickets).toHaveBeenCalledWith(teamspace, project, model, projection, { [`properties.${basePropertyLabels.Created_AT}`]: -1 });
		});
	});
};

describe('processors/teamspaces/projects/models/commons/tickets', () => {
	testAddTicket();
	testGetTicketResourceAsStream();
	testGetTicketById();
	testUpdateTicket();
	testGetTicketList();
});
