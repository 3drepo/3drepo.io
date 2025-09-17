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

const { cloneDeep, times, isBuffer } = require('lodash');
const { src } = require('../../../../../../helper/path');
const { generateRandomObject, generateUUID, generateRandomString, generateTemplate, generateTicket, generateGroup, generateRandomNumber, determineTestGroup, generateUUIDString } = require('../../../../../../helper/services');
const { supportedPatterns } = require('../../../../../../../../src/v5/schemas/tickets/templates.constants');

const { deleteIfUndefined } = require(`${src}/utils/helper/objects`);
const { queryOperators, specialQueryFields } = require(`${src}/schemas/tickets/tickets.filters`);

const { statuses, statusTypes } = require(`${src}/schemas/tickets/templates.constants`);

const Tickets = require(`${src}/processors/teamspaces/projects/models/commons/tickets`);

const { basePropertyLabels, modulePropertyLabels, presetModules, propTypes, viewGroups } = require(`${src}/schemas/tickets/templates.constants`);

jest.mock('../../../../../../../../src/v5/services/eventsManager/eventsManager');
const EventsManager = require(`${src}/services/eventsManager/eventsManager`);
const { events } = require(`${src}/services/eventsManager/eventsManager.constants`);

jest.mock('../../../../../../../../src/v5/models/tickets');
const TicketsModel = require(`${src}/models/tickets`);

jest.mock('../../../../../../../../src/v5/models/modelSettings');
const ModelSettings = require(`${src}/models/modelSettings`);

jest.mock('../../../../../../../../src/v5/models/tickets.templates');
const TemplatesModel = require(`${src}/models/tickets.templates`);

jest.mock('../../../../../../../../src/v5/processors/teamspaces/projects/models/commons/tickets.comments');
const CommentsProcessor = require(`${src}/processors/teamspaces/projects/models/commons/tickets.comments`);

jest.mock('../../../../../../../../src/v5/processors/teamspaces/projects/models/commons/tickets.groups');
const GroupsProcessor = require(`${src}/processors/teamspaces/projects/models/commons/tickets.groups`);

jest.mock('../../../../../../../../src/v5/schemas/tickets/templates', () => ({
	...jest.requireActual('../../../../../../../../src/v5/schemas/tickets/templates'),
	generateFullSchema: jest.fn(),
}));
const TemplatesSchema = require(`${src}/schemas/tickets/templates`);

const { TICKETS_RESOURCES_COL } = require(`${src}/models/tickets.constants`);

jest.mock('../../../../../../../../src/v5/services/filesManager');
const FilesManager = require(`${src}/services/filesManager`);

const generatePropData = (buffer, propType) => {
	if (propType === propTypes.VIEW) {
		return {
			screenshot: buffer,
			camera: {
				position: [0, 0, 0],
				up: [0, 0, 1],
				forward: [1, 1, 0],
			},
		};
	}

	if (propType === propTypes.IMAGE_LIST) {
		return buffer ? times(3, () => buffer) : null;
	}

	return buffer;
};

const generateImageTestData = (isRef, propType, tickets = 1) => {
	const propName = generateRandomString();
	const moduleName = generateRandomString();

	const template = {
		properties: [
			{
				name: propName,
				type: propType,
			},
		],
		modules: [
			{
				name: moduleName,
				properties: [
					{
						name: propName,
						type: propType,
					},
				],
			},
			{
				type: 'safetibase',
				properties: [],
			},
		],
	};

	const data = times(tickets, () => {
		const propBuffer = isRef ? generateUUID() : Buffer.from(generateRandomString());
		const modPropBuffer = isRef ? generateUUID() : Buffer.from(generateRandomString());

		const ticket = {
			_id: generateRandomString(),
			title: generateRandomString(),
			properties: {
				[propName]: generatePropData(propBuffer, propType),
			},
			modules: {
				[moduleName]: {
					[propName]: generatePropData(modPropBuffer, propType),
				},
			},
		};

		return { ticket, propBuffer, modPropBuffer };
	});

	return { template, propName, moduleName, data };
};

const insertTicketsImageTest = async (isImport, propType) => {
	const teamspace = generateRandomString();
	const project = generateRandomString();
	const model = generateRandomString();
	const author = generateRandomString();
	const imageTestData = generateImageTestData(false, propType, isImport ? 10 : 1);
	const tickets = [];
	const expectedOutput = imageTestData.data.map(({ ticket }) => {
		tickets.push(ticket);
		const _id = generateRandomString();
		return { ...ticket, _id };
	});

	TicketsModel.addTicketsWithTemplate.mockResolvedValueOnce(expectedOutput);
	TemplatesSchema.generateFullSchema.mockImplementationOnce((t) => t);

	if (isImport) {
		await expect(Tickets.importTickets(teamspace, project, model, imageTestData.template,
			tickets, author)).resolves.toEqual(expectedOutput.map(({ _id }) => _id));
	} else {
		await expect(Tickets.addTicket(teamspace, project, model, imageTestData.template,
			tickets[0])).resolves.toEqual(expectedOutput[0]._id);
	}

	const processedTickets = TicketsModel.addTicketsWithTemplate.mock.calls[0][4];

	const refFiles = [];

	const ticketsToInsert = processedTickets.map((proTick, i) => {
		const prop = proTick.properties[imageTestData.propName];
		const modProp = proTick.modules[imageTestData.moduleName][imageTestData.propName];

		const expectedTicket = cloneDeep(tickets[i]);
		const meta = { ticket: expectedOutput[i]._id, teamspace, project, model };

		if (propType === propTypes.VIEW) {
			expectedTicket.properties[imageTestData.propName].screenshot = prop.screenshot;
			expectedTicket.modules[imageTestData.moduleName][imageTestData.propName].screenshot = modProp.screenshot;

			refFiles.push({ id: prop.screenshot, data: imageTestData.data[i].propBuffer, meta });
			refFiles.push({ id: modProp.screenshot, data: imageTestData.data[i].modPropBuffer, meta });
		} else {
			expectedTicket.properties[imageTestData.propName] = prop;
			expectedTicket.modules[imageTestData.moduleName][imageTestData.propName] = modProp;

			refFiles.push(...(propType === propTypes.IMAGE
				? [{ id: prop, data: imageTestData.data[i].propBuffer, meta }]
				: prop.map((p) => ({ id: p, data: imageTestData.data[i].propBuffer, meta }))));
			refFiles.push(...(propType === propTypes.IMAGE
				? [{ id: modProp, data: imageTestData.data[i].modPropBuffer, meta }]
				: modProp.map((p) => ({ id: p, data: imageTestData.data[i].modPropBuffer, meta }))));
		}

		return expectedTicket;
	});

	expect(TicketsModel.addTicketsWithTemplate).toHaveBeenCalledTimes(1);
	expect(TicketsModel.addTicketsWithTemplate).toHaveBeenCalledWith(teamspace, project, model,
		imageTestData.template._id, ticketsToInsert);

	expect(TemplatesSchema.generateFullSchema).toHaveBeenCalledTimes(1);
	expect(TemplatesSchema.generateFullSchema).toHaveBeenCalledWith(imageTestData.template);

	expect(FilesManager.storeFiles).toHaveBeenCalledTimes(1);
	expect(FilesManager.storeFiles).toHaveBeenCalledWith(teamspace, TICKETS_RESOURCES_COL, refFiles);

	expect(EventsManager.publish).toHaveBeenCalledTimes(1);
	if (isImport) {
		expect(EventsManager.publish).toHaveBeenCalledWith(events.TICKETS_IMPORTED,
			{ teamspace,
				project,
				model,
				author,
				tickets: expectedOutput });
	} else {
		expect(EventsManager.publish).toHaveBeenCalledWith(events.NEW_TICKET,
			{ teamspace,
				project,
				model,
				ticket: expectedOutput[0] });
	}
};

const updateImagesTestHelper = async (updateMany, propType) => {
	const teamspace = generateRandomString();
	const project = generateRandomString();
	const model = generateRandomString();
	const author = generateRandomString();
	const nTickets = updateMany ? 2 : 1;

	TemplatesSchema.generateFullSchema.mockImplementationOnce((t) => t);
	const response = [];

	const imageTestData = generateImageTestData(true, propType, nTickets);

	const tickets = [];

	const updateData = times(nTickets, (i) => {
		let updatePropBuffer = i % 2 === 0 ? Buffer.from(generateRandomString()) : null;
		let updateModPropBuffer = i % 2 === 0 ? Buffer.from(generateRandomString()) : null;

		if (propType === propTypes.IMAGE_LIST && i % 3 === 0) {
			updatePropBuffer = generateUUID();
			updateModPropBuffer = generateUUID();
		}

		tickets.push(imageTestData.data[i].ticket);
		response.push({ ...generateRandomObject(), changes: generateRandomObject() });

		return {
			properties: {
				[imageTestData.propName]: generatePropData(updatePropBuffer, propType),
			},
			modules: {
				[imageTestData.moduleName]: {
					[imageTestData.propName]: generatePropData(updateModPropBuffer, propType),
				},
			},
		};
	});

	TicketsModel.updateTickets.mockResolvedValueOnce(response);

	if (updateMany) {
		await expect(Tickets.updateManyTickets(teamspace, project, model, imageTestData.template,
			cloneDeep(tickets), cloneDeep(updateData), author)).resolves.toBeUndefined();
	} else {
		await expect(Tickets.updateTicket(teamspace, project, model, imageTestData.template,
			cloneDeep(tickets[0]), cloneDeep(updateData[0]), author)).resolves.toBeUndefined();
	}

	const processedTickets = TicketsModel.updateTickets.mock.calls[0][4];

	const refsToDelete = [];
	const refFiles = [];

	const expectedUpdateData = processedTickets.map(({ properties, modules }, i) => {
		let propRef;
		let modPropRef;
		let propBuffer;
		let modPropBuffer;
		let oldPropRef;
		let oldModPropRef;

		if (propType === propTypes.VIEW) {
			propRef = properties[imageTestData.propName]?.screenshot;
			modPropRef = modules[imageTestData.moduleName][imageTestData.propName]?.screenshot;

			propBuffer = updateData[i].properties[imageTestData.propName]?.screenshot;
			modPropBuffer = updateData[i].modules[imageTestData.moduleName][imageTestData.propName]?.screenshot;

			oldPropRef = tickets[i].properties[imageTestData.propName].screenshot;
			oldModPropRef = tickets[i].modules[imageTestData.moduleName][imageTestData.propName].screenshot;
		} else {
			propRef = properties[imageTestData.propName];
			modPropRef = modules[imageTestData.moduleName][imageTestData.propName];

			propBuffer = updateData[i].properties[imageTestData.propName];
			modPropBuffer = updateData[i].modules[imageTestData.moduleName][imageTestData.propName];

			oldPropRef = tickets[i].properties[imageTestData.propName];
			oldModPropRef = tickets[i].modules[imageTestData.moduleName][imageTestData.propName];
		}

		const meta = { ticket: tickets[i]._id, project, teamspace, model };
		if (propType === propTypes.IMAGE_LIST) {
			if (propRef) {
				for (let j = 0; j < propRef.length; j++) {
					if (isBuffer(propBuffer[j])) {
						refFiles.push({ meta, id: propRef[j], data: propBuffer[j] });
						refFiles.push({ meta, id: modPropRef[j], data: modPropBuffer[j] });
					}
				}
			}
			refsToDelete.push(...oldPropRef, ...oldModPropRef);
		} else {
			if (propRef) {
				refFiles.push({ meta, id: propRef, data: propBuffer });
				refFiles.push({ meta, id: modPropRef, data: modPropBuffer });
			}

			refsToDelete.push(oldPropRef, oldModPropRef);
		}

		return {
			properties: { [imageTestData.propName]: propType === propTypes.IMAGE_LIST
				? propRef
				: generatePropData(propRef, propType) },
			modules: {
				[imageTestData.moduleName]: {
					[imageTestData.propName]: propType === propTypes.IMAGE_LIST
						? modPropRef
						: generatePropData(modPropRef, propType),
				},
			},
		};
	});

	expect(TicketsModel.updateTickets).toHaveBeenCalledTimes(1);
	expect(TicketsModel.updateTickets).toHaveBeenCalledWith(teamspace, project, model, tickets,
		expectedUpdateData, author);

	expect(TemplatesSchema.generateFullSchema).toHaveBeenCalledTimes(1);
	expect(TemplatesSchema.generateFullSchema).toHaveBeenCalledWith(imageTestData.template);

	if (refFiles.length) {
		expect(FilesManager.storeFiles).toHaveBeenCalledTimes(1);
		expect(FilesManager.storeFiles).toHaveBeenCalledWith(teamspace, TICKETS_RESOURCES_COL,
			expect.arrayContaining(refFiles));
	}

	expect(FilesManager.removeFiles).toHaveBeenCalledTimes(1);
	expect(FilesManager.removeFiles).toHaveBeenCalledWith(
		teamspace, TICKETS_RESOURCES_COL, refsToDelete);

	expect(EventsManager.publish).toHaveBeenCalledTimes(response.length);
	response.forEach((res) => {
		expect(EventsManager.publish).toHaveBeenCalledWith(events.UPDATE_TICKET,
			{ teamspace,
				project,
				model,
				...res });
	});
};

const generateGroupsTestData = (useGroupsUUID = false, nTickets = 1) => {
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
			[viewGroups.COLORED]: times(3, () => ({ group: useGroupsUUID ? generateUUID()
				: generateGroup(true, { hasId: false }) })),
			[viewGroups.HIDDEN]: times(3, () => ({ group: useGroupsUUID ? generateUUID()
				: generateGroup(false, { hasId: false }) })),
			[viewGroups.TRANSFORMED]: times(3, () => ({ group: useGroupsUUID ? generateUUID()
				: generateGroup(false, { hasId: false }) })),
		} }
	);

	const tickets = times(nTickets, () => ({
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
	}));

	return { template, tickets, propName, moduleName };
};

const insertTicketsGroupTests = (isImport) => {
	describe('Groups', () => {
		const iterations = 10;
		test('should be call ticket groups processor to process and store the groups', async () => {
			const teamspace = generateRandomString();
			const project = generateRandomString();
			const model = generateRandomString();
			const author = generateRandomString();

			const testData = generateGroupsTestData(false, isImport ? iterations : 1);

			const expectedOutput = testData.tickets.map((tickets) => ({ ...tickets, _id: generateUUID() }));

			TicketsModel.addTicketsWithTemplate.mockResolvedValueOnce(expectedOutput);
			TemplatesSchema.generateFullSchema.mockImplementationOnce((t) => t);

			if (isImport) {
				await expect(Tickets.importTickets(teamspace, project, model, testData.template,
					testData.tickets, author)).resolves.toEqual(expectedOutput.map(({ _id }) => _id));
			} else {
				await expect(Tickets.addTicket(teamspace, project, model, testData.template,
					testData.tickets[0])).resolves.toEqual(expectedOutput[0]._id);
			}

			expect(TicketsModel.addTicketsWithTemplate).toHaveBeenCalledTimes(1);
			expect(TicketsModel.addTicketsWithTemplate).toHaveBeenCalledWith(teamspace, project, model,
				testData.template._id, expect.any(Array));

			expect(GroupsProcessor.processGroupsUpdate).toHaveBeenCalledTimes(isImport ? 2 * iterations : 2);
			expect(GroupsProcessor.commitGroupChanges).toHaveBeenCalledTimes(isImport ? iterations : 1);

			expect(TemplatesSchema.generateFullSchema).toHaveBeenCalledTimes(1);
			expect(TemplatesSchema.generateFullSchema).toHaveBeenCalledWith(testData.template);

			expect(EventsManager.publish).toHaveBeenCalledTimes(1);
			if (isImport) {
				expect(EventsManager.publish).toHaveBeenCalledWith(events.TICKETS_IMPORTED,
					{ teamspace,
						project,
						model,
						author,
						tickets: expectedOutput });
			} else {
				expect(EventsManager.publish).toHaveBeenCalledWith(events.NEW_TICKET,
					{ teamspace,
						project,
						model,
						ticket: expectedOutput[0] });
			}
		});
	});
};

const updateGroupTestsHelper = (updateMany) => {
	describe('Groups', () => {
		const teamspace = generateRandomString();
		const project = generateRandomString();
		const model = generateRandomString();
		const nTickets = updateMany ? 10 : 1;

		const runTest = async (response, template, tickets, propName, moduleName, toUpdate) => {
			TemplatesSchema.generateFullSchema.mockImplementationOnce((t) => t);
			TicketsModel.updateTickets.mockResolvedValueOnce(response);
			await expect(Tickets.updateManyTickets(teamspace, project, model, template,
				tickets, toUpdate)).resolves.toBeUndefined();

			expect(TicketsModel.updateTickets).toHaveBeenCalledTimes(1);
			expect(TicketsModel.updateTickets).toHaveBeenCalledWith(teamspace, project, model,
				tickets, expect.any(Object), undefined);

			expect(TemplatesSchema.generateFullSchema).toHaveBeenCalledTimes(1);
			expect(TemplatesSchema.generateFullSchema).toHaveBeenCalledWith(template);

			expect(GroupsProcessor.processGroupsUpdate).toHaveBeenCalledTimes(updateMany ? 2 * nTickets : 2);
			expect(GroupsProcessor.commitGroupChanges).toHaveBeenCalledTimes(updateMany ? nTickets : 1);

			expect(EventsManager.publish).toHaveBeenCalledTimes(response.length);
			response.forEach((res) => {
				expect(EventsManager.publish).toHaveBeenCalledWith(events.UPDATE_TICKET,
					{ teamspace,
						project,
						model,
						...res });
			});
		};

		test('New groups should be extracted and replaced with a group UUID', async () => {
			const { template, tickets, propName, moduleName } = generateGroupsTestData(false, nTickets);
			const response = [];

			const toUpdate = tickets.map(({ modules, properties }) => {
				const data = {
					properties: {
						[propName]: properties[propName],
					},
					modules: {
						[moduleName]: {
							[propName]: modules[moduleName][propName],
						},
					},
				};

				/* eslint-disable no-param-reassign */
				delete properties[propName];
				delete modules[moduleName][propName];
				/* eslint-enable no-param-reassign */

				response.push({ ...generateRandomObject(), changes: generateRandomObject() });

				return data;
			});

			await runTest(response, template, tickets, propName, moduleName, toUpdate);
		});
	});
};

const insertTicketsTestHelper = (isImport) => {
	const template = generateTemplate();
	const tickets = times(isImport ? 10 : 1, () => generateTicket(template));
	test('should call addTicketsWithTemplate in model and return whatever it returns', async () => {
		const teamspace = generateRandomString();
		const project = generateRandomString();
		const model = generateRandomString();
		const author = generateRandomString();

		const expectedOutput = tickets.map((ticketData) => ({ ...ticketData, _id: generateRandomString() }));

		TicketsModel.addTicketsWithTemplate.mockResolvedValueOnce(expectedOutput);
		TemplatesSchema.generateFullSchema.mockImplementationOnce((t) => t);

		if (isImport) {
			await expect(Tickets.importTickets(teamspace, project, model, template, tickets, author))
				.resolves.toEqual(expectedOutput.map(({ _id }) => _id));
		} else {
			await expect(Tickets.addTicket(teamspace, project, model, template, tickets[0]))
				.resolves.toEqual(expectedOutput[0]._id);
		}

		expect(TemplatesSchema.generateFullSchema).toHaveBeenCalledTimes(1);
		expect(TemplatesSchema.generateFullSchema).toHaveBeenCalledWith(template);

		expect(TicketsModel.addTicketsWithTemplate).toHaveBeenCalledTimes(1);
		expect(TicketsModel.addTicketsWithTemplate).toHaveBeenCalledWith(teamspace, project, model,
			template._id, tickets);

		expect(FilesManager.storeFiles).not.toHaveBeenCalled();
		expect(CommentsProcessor.importComments).not.toHaveBeenCalled();

		expect(EventsManager.publish).toHaveBeenCalledTimes(1);
		if (isImport) {
			expect(EventsManager.publish).toHaveBeenCalledWith(events.TICKETS_IMPORTED,
				{ teamspace,
					project,
					model,
					author,
					tickets: expectedOutput });
		} else {
			expect(EventsManager.publish).toHaveBeenCalledWith(events.NEW_TICKET,
				{ teamspace,
					project,
					model,
					ticket: expectedOutput[0] });
		}
	});

	test('should process images and store refs (image property type)', () => insertTicketsImageTest(isImport, propTypes.IMAGE));
	test('should process images and store refs (image list property type)', () => insertTicketsImageTest(isImport, propTypes.IMAGE_LIST));
	test('should process screenshots from view data and store refs', () => insertTicketsImageTest(isImport, propTypes.VIEW));

	insertTicketsGroupTests(isImport);
};

const testAddTicket = () => {
	describe('Add ticket', () => {
		insertTicketsTestHelper(false);
	});
};

const testImportTickets = () => {
	describe('Import ticket', () => {
		insertTicketsTestHelper(true);
		describe('Import tickets with comments', () => {
			const template = generateTemplate();
			const tickets = times(10, () => ({ ...generateTicket(template),
				comments: times(10, generateRandomObject) }));
			const teamspace = generateRandomString();
			const project = generateRandomString();
			const model = generateRandomString();
			const author = generateRandomString();
			test('should call importComments if there are comments', async () => {
				const expectedOutput = tickets.map(({ comments, ...ticketData }) => ({ ...ticketData,
					_id: generateRandomString() }));

				TicketsModel.addTicketsWithTemplate.mockResolvedValueOnce(expectedOutput);
				TemplatesSchema.generateFullSchema.mockImplementationOnce((t) => t);

				await expect(Tickets.importTickets(teamspace, project, model, template, tickets, author))
					.resolves.toEqual(expectedOutput.map(({ _id }) => _id));

				expect(TemplatesSchema.generateFullSchema).toHaveBeenCalledTimes(1);
				expect(TemplatesSchema.generateFullSchema).toHaveBeenCalledWith(template);

				expect(TicketsModel.addTicketsWithTemplate).toHaveBeenCalledTimes(1);
				expect(TicketsModel.addTicketsWithTemplate).toHaveBeenCalledWith(teamspace, project, model,
					template._id, tickets.map(({ comments, ...others }) => others));

				expect(FilesManager.storeFiles).not.toHaveBeenCalled();

				expect(EventsManager.publish).toHaveBeenCalledTimes(1);
				expect(EventsManager.publish).toHaveBeenCalledWith(events.TICKETS_IMPORTED,
					{ teamspace,
						project,
						model,
						author,
						tickets: expectedOutput });

				const ticketsComments = tickets.map(({ comments }, i) => ({ ticket: expectedOutput[i]._id, comments }));
				expect(CommentsProcessor.importComments).toHaveBeenCalledTimes(1);
				expect(CommentsProcessor.importComments).toHaveBeenCalledWith(teamspace, project,
					model, ticketsComments, author);
			});
		});
	});
};

const testUpdateTicket = () => {
	describe('Update ticket', () => {
		const template = generateTemplate();
		const ticket = generateTicket(template);
		test('should call updateTicket in model', async () => {
			const teamspace = generateRandomString();
			const project = generateRandomString();
			const model = generateRandomString();
			const updateData = {
				title: generateRandomString(),
				properties: {},
			};
			const author = generateRandomString();
			TemplatesSchema.generateFullSchema.mockImplementationOnce((t) => t);
			const response = generateRandomObject();
			TicketsModel.updateTickets.mockResolvedValueOnce([response]);

			await expect(Tickets.updateTicket(teamspace, project, model, template, ticket,
				updateData, author))
				.resolves.toBeUndefined();

			expect(TicketsModel.updateTickets).toHaveBeenCalledTimes(1);
			expect(TicketsModel.updateTickets).toHaveBeenCalledWith(teamspace, project, model, [ticket],
				[updateData], author);
			expect(TemplatesSchema.generateFullSchema).toHaveBeenCalledTimes(1);
			expect(TemplatesSchema.generateFullSchema).toHaveBeenCalledWith(template);

			expect(FilesManager.storeFiles).not.toHaveBeenCalled();
			expect(FilesManager.removeFiles).not.toHaveBeenCalled();

			expect(EventsManager.publish).toHaveBeenCalledTimes(1);
			expect(EventsManager.publish).toHaveBeenCalledWith(events.UPDATE_TICKET,
				{ teamspace, project, model, ...response });
		});

		test('should not trigger event if there was no change', async () => {
			const teamspace = generateRandomString();
			const project = generateRandomString();
			const model = generateRandomString();
			const updateData = {
				title: generateRandomString(),
				properties: {},
			};
			const author = generateRandomString();
			TemplatesSchema.generateFullSchema.mockImplementationOnce((t) => t);
			TicketsModel.updateTickets.mockResolvedValueOnce([]);

			await expect(Tickets.updateTicket(teamspace, project, model, template, ticket,
				updateData, author))
				.resolves.toBeUndefined();

			expect(TicketsModel.updateTickets).toHaveBeenCalledTimes(1);
			expect(TicketsModel.updateTickets).toHaveBeenCalledWith(teamspace, project, model, [ticket],
				[updateData], author);
			expect(TemplatesSchema.generateFullSchema).toHaveBeenCalledTimes(1);
			expect(TemplatesSchema.generateFullSchema).toHaveBeenCalledWith(template);

			expect(FilesManager.storeFiles).not.toHaveBeenCalled();
			expect(FilesManager.removeFiles).not.toHaveBeenCalled();

			expect(EventsManager.publish).not.toHaveBeenCalled();
		});

		test('should process image and store a ref (image property type)', () => updateImagesTestHelper(false, propTypes.IMAGE));
		test('should process image and store a ref (image list property type)', () => updateImagesTestHelper(false, propTypes.IMAGE_LIST));
		test('should process screenshot from view data and store a ref', () => updateImagesTestHelper(false, propTypes.VIEW));

		updateGroupTestsHelper(false);
	});
};

const testUpdateManyTickets = () => {
	describe('Update many tickets', () => {
		const template = generateTemplate();
		const ticketCount = 10;
		const teamspace = generateRandomString();
		const project = generateRandomString();
		const model = generateRandomString();
		const author = generateRandomString();

		test('should call updateManyTickets in model', async () => {
			const updateData = [];
			const response = [];

			const tickets = times(ticketCount, () => {
				updateData.push({
					title: generateRandomString(),
					properties: {},
				});

				response.push({ ...generateRandomObject(), changes: generateRandomObject() });
				return generateTicket(template);
			});
			TemplatesSchema.generateFullSchema.mockReset();
			TemplatesSchema.generateFullSchema.mockImplementationOnce((t) => t);
			TicketsModel.updateTickets.mockResolvedValueOnce(response);

			await expect(Tickets.updateManyTickets(teamspace, project, model, template, tickets,
				updateData, author))
				.resolves.toBeUndefined();

			expect(TicketsModel.updateTickets).toHaveBeenCalledTimes(1);
			expect(TicketsModel.updateTickets).toHaveBeenCalledWith(teamspace, project, model, tickets,
				updateData, author);
			expect(TemplatesSchema.generateFullSchema).toHaveBeenCalledTimes(1);
			expect(TemplatesSchema.generateFullSchema).toHaveBeenCalledWith(template);

			expect(FilesManager.storeFiles).not.toHaveBeenCalled();
			expect(FilesManager.removeFiles).not.toHaveBeenCalled();

			expect(EventsManager.publish).toHaveBeenCalledTimes(ticketCount);
			response.forEach((res) => {
				expect(EventsManager.publish).toHaveBeenCalledWith(events.UPDATE_TICKET,
					{ teamspace,
						project,
						model,
						...res });
			});
		});

		test('should process image and store a ref (image property type)', () => updateImagesTestHelper(true, propTypes.IMAGE));
		test('should process image and store a ref (image list property type)', () => updateImagesTestHelper(true, propTypes.IMAGE_LIST));
		test('should process screenshot from view data and store a ref', () => updateImagesTestHelper(true, propTypes.VIEW));

		updateGroupTestsHelper(true);

		describe('Update tickets with comments', () => {
			test('should call importComments if there are comments', async () => {
				const updateData = [];
				const response = [];
				const commentsByTickets = [];

				const tickets = times(ticketCount, () => {
					const comments = times(ticketCount, generateRandomObject);
					updateData.push({
						title: generateRandomString(),
						properties: {},
						comments });

					response.push({ ...generateRandomObject(), changes: generateRandomObject() });
					const ticket = generateTicket(template);

					commentsByTickets.push({ ticket: ticket._id, comments });
					return ticket;
				});

				TemplatesSchema.generateFullSchema.mockReset();
				TemplatesSchema.generateFullSchema.mockImplementationOnce((t) => t);
				TicketsModel.updateTickets.mockResolvedValueOnce(response);

				await expect(Tickets.updateManyTickets(teamspace, project, model, template, tickets,
					updateData, author))
					.resolves.toBeUndefined();

				expect(TicketsModel.updateTickets).toHaveBeenCalledTimes(1);
				expect(TicketsModel.updateTickets).toHaveBeenCalledWith(teamspace, project, model, tickets,
					updateData.map(({ comments, ...others }) => others), author);
				expect(TemplatesSchema.generateFullSchema).toHaveBeenCalledTimes(1);
				expect(TemplatesSchema.generateFullSchema).toHaveBeenCalledWith(template);

				expect(FilesManager.storeFiles).not.toHaveBeenCalled();
				expect(FilesManager.removeFiles).not.toHaveBeenCalled();

				expect(EventsManager.publish).toHaveBeenCalledTimes(ticketCount);
				response.forEach((res) => {
					expect(EventsManager.publish).toHaveBeenCalledWith(events.UPDATE_TICKET,
						{ teamspace,
							project,
							model,
							...res });
				});

				expect(CommentsProcessor.importComments).toHaveBeenCalledTimes(1);
				expect(CommentsProcessor.importComments).toHaveBeenCalledWith(teamspace,
					project, model, commentsByTickets, author);
			});

			test(`should not trigger ${events.UPDATE_TICKET} events if there are only comments update`, async () => {
				const updateData = [];
				const response = [];
				const commentsByTickets = [];

				const tickets = times(ticketCount, () => {
					const comments = times(ticketCount, generateRandomObject);
					updateData.push({ comments });
					const ticket = generateTicket(template);

					response.push({});
					commentsByTickets.push({ ticket: ticket._id, comments });
					return ticket;
				});

				TemplatesSchema.generateFullSchema.mockReset();
				TemplatesSchema.generateFullSchema.mockImplementationOnce((t) => t);
				TicketsModel.updateTickets.mockResolvedValueOnce(response);

				await expect(Tickets.updateManyTickets(teamspace, project, model, template, tickets,
					updateData, author))
					.resolves.toBeUndefined();

				expect(TicketsModel.updateTickets).toHaveBeenCalledTimes(1);
				expect(TicketsModel.updateTickets).toHaveBeenCalledWith(teamspace, project, model, tickets,
					updateData.map(({ comments, ...others }) => others), author);
				expect(TemplatesSchema.generateFullSchema).toHaveBeenCalledTimes(1);
				expect(TemplatesSchema.generateFullSchema).toHaveBeenCalledWith(template);

				expect(FilesManager.storeFiles).not.toHaveBeenCalled();
				expect(FilesManager.removeFiles).not.toHaveBeenCalled();

				expect(EventsManager.publish).not.toHaveBeenCalled();

				expect(CommentsProcessor.importComments).toHaveBeenCalledTimes(1);
				expect(CommentsProcessor.importComments).toHaveBeenCalledWith(teamspace, project, model,
					commentsByTickets, author);
			});
		});
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
	const propertyName = generateRandomString();
	const propertyName2 = generateRandomString();
	const moduleName = generateRandomString();
	const propertyValue = generateRandomString();
	const propertyValue2 = generateRandomString();
	const propertyNumberValue = generateRandomNumber();
	const ticketTemplates = times(5, () => generateTemplate());

	describe.each([
		['the default projection (undefined filter)', undefined, {}],
		['the default projection (empty filter)', [], {}],
		['the default projection (filter with empty property)', [''], {}],
		['the default projection (filter with empty module)', ['.'], {}],
		['custom projection (filter with one valid and one empty property)', [propertyName, ''], { [`properties.${propertyName}`]: 1 }],
		['custom projection (filter with one valid and one empty module)', [`${moduleName}.${propertyName}`, '.'], { [`modules.${moduleName}.${propertyName}`]: 1 }],
		['custom projection (filter with property)', [propertyName], { [`properties.${propertyName}`]: 1 }],
		['custom projection (filter with module)', [`${moduleName}.${propertyName}`], { [`modules.${moduleName}.${propertyName}`]: 1 }],
		['custom projection (filter with module and property)', [`${moduleName}.${propertyName}`, propertyName], { [`properties.${propertyName}`]: 1, [`modules.${moduleName}.${propertyName}`]: 1 }],
		['updatedSince provided', [], {}, new Date()],
		['sortBy is provided', [], {}, undefined, { sortBy: generateRandomString() }],
		['sortDesc is provided', [], {}, undefined, { sortDesc: false }],
		['sortBy and sortDesc is provided', [], {}, undefined, { sortBy: generateRandomString(), sortDesc: true }],
		['limit is provided', [], {}, undefined, { limit: generateRandomNumber() }],
		['skip is provided', [], {}, undefined, { skip: generateRandomNumber() }],
		[`${queryOperators.EXISTS} query filter`, [], {}, undefined, { }, {
			queryFilters: [{ propertyName, operator: queryOperators.EXISTS }],
			expectedQuery: { $and: [{ [propertyName]: { $exists: true } }] },
		}],
		[`${queryOperators.NOT_EXISTS} query filter`, [], {}, undefined, { }, {
			queryFilters: [{ propertyName, operator: queryOperators.NOT_EXISTS }],
			expectedQuery: { $and: [{ [propertyName]: { $not: { $exists: true } } }] },
		}],
		[`${queryOperators.IS} query filter`, [], {}, undefined, { }, {
			queryFilters: [{ propertyName, operator: queryOperators.IS, value: [propertyValue, propertyValue2] }],
			expectedQuery: { $and: [{ [propertyName]: { $in: [propertyValue, propertyValue2] } }] },
		}],
		[`${queryOperators.EQUALS} query filter and boolean value`, [], {}, undefined, { }, {
			queryFilters: [{ propertyName, operator: queryOperators.EQUALS, value: ['true'] }],
			expectedQuery: { $and: [{ [propertyName]: { $in: [true] } }] },
		}],
		[`${queryOperators.EQUALS} query filter and number value`, [], {}, undefined, { }, {
			queryFilters: [{ propertyName, operator: queryOperators.EQUALS, value: [`${propertyNumberValue}`] }],
			expectedQuery: {
				$and: [{ [propertyName]: { $in: [propertyNumberValue, new Date(propertyNumberValue)] } }],
			},
		}],
		[`${queryOperators.NOT_IS} query filter`, [], {}, undefined, { }, {
			queryFilters: [
				{ propertyName, operator: queryOperators.NOT_IS, value: [propertyValue, propertyValue2] },
			],
			expectedQuery: { $and: [{ [propertyName]: { $not: { $in: [propertyValue, propertyValue2] } } }] },
		}],
		[`${queryOperators.NOT_EQUALS} query filter and boolean value`, [], {}, undefined, { }, {
			queryFilters: [{ propertyName, operator: queryOperators.NOT_EQUALS, value: ['true'] }],
			expectedQuery: { $and: [{ [propertyName]: { $not: { $in: [true] } } }] },
		}],
		[`${queryOperators.NOT_EQUALS} query filter and number value`, [], {}, undefined, { }, {
			queryFilters: [{ propertyName, operator: queryOperators.NOT_EQUALS, value: [`${propertyNumberValue}`] }],
			expectedQuery: {
				$and: [{ [propertyName]: { $not: { $in: [propertyNumberValue, new Date(propertyNumberValue)] } } }],
			},
		}],
		[`${queryOperators.CONTAINS} query filter`, [], {}, undefined, { }, {
			queryFilters: [{ propertyName, operator: queryOperators.CONTAINS, value: [propertyValue, propertyValue2] }],
			expectedQuery: { $and: [{ $or: [{ [propertyName]: { $regex: propertyValue, $options: 'i' } }, { [propertyName]: { $regex: propertyValue2, $options: 'i' } }] }] },
		}],
		[`${queryOperators.NOT_CONTAINS} query filter`, [], {}, undefined, { }, {
			queryFilters: [
				{ propertyName, operator: queryOperators.NOT_CONTAINS, value: [propertyValue, propertyValue2] },
			],
			expectedQuery: { $and: [{ $nor: [{ [propertyName]: { $regex: propertyValue, $options: 'i' } }, { [propertyName]: { $regex: propertyValue2, $options: 'i' } }] }] },
		}],
		[`${queryOperators.RANGE} query filter`, [], {}, undefined, { }, {
			queryFilters: [{ propertyName, operator: queryOperators.RANGE, value: [[0, 10], [20, 30]] }],
			expectedQuery: { $and: [{ $or: [
				{ [propertyName]: { $gte: 0, $lte: 10 } },
				{ [propertyName]: { $gte: new Date(0), $lte: new Date(10) } },
				{ [propertyName]: { $gte: 20, $lte: 30 } },
				{ [propertyName]: { $gte: new Date(20), $lte: new Date(30) } },
			] }] },
		}],
		[`${queryOperators.NOT_IN_RANGE} query filter`, [], {}, undefined, { }, {
			queryFilters: [{ propertyName, operator: queryOperators.NOT_IN_RANGE, value: [[0, 10], [20, 30]] }],
			expectedQuery: { $and: [{ $nor: [
				{ [propertyName]: { $gte: 0, $lte: 10 } },
				{ [propertyName]: { $gte: new Date(0), $lte: new Date(10) } },
				{ [propertyName]: { $gte: 20, $lte: 30 } },
				{ [propertyName]: { $gte: new Date(20), $lte: new Date(30) } },
			] }] },
		}],
		[`${queryOperators.GREATER_OR_EQUAL_TO} query filter`, [], {}, undefined, { }, {
			queryFilters: [{ propertyName, operator: queryOperators.GREATER_OR_EQUAL_TO, value: propertyNumberValue }],
			expectedQuery: { $and: [{ $or: [
				{ [propertyName]: { $gte: propertyNumberValue } },
				{ [propertyName]: { $gte: new Date(propertyNumberValue) } },
			] }] },
		}],
		[`${queryOperators.LESSER_OR_EQUAL_TO} query filter`, [], {}, undefined, { }, {
			queryFilters: [{ propertyName, operator: queryOperators.LESSER_OR_EQUAL_TO, value: propertyNumberValue }],
			expectedQuery: { $and: [{ $or: [
				{ [propertyName]: { $lte: propertyNumberValue } },
				{ [propertyName]: { $lte: new Date(propertyNumberValue) } },
			] }] },
		}],
		['multiple query filters', [], {}, undefined, { }, {
			queryFilters: [
				{ propertyName, operator: queryOperators.IS, value: [propertyValue, propertyValue2] },
				{ propertyName: propertyName2,
					operator: queryOperators.LESSER_OR_EQUAL_TO,
					value: propertyNumberValue },
			],
			expectedQuery: { $and: [
				{ [propertyName]: { $in: [propertyValue, propertyValue2] } },
				{ $or: [
					{ [propertyName2]: { $lte: propertyNumberValue } },
					{ [propertyName2]: { $lte: new Date(propertyNumberValue) } },
				] },
			] },
		}],
		['template filter', [], {}, undefined, { }, {
			isTemplateQuery: true,
			queryFilters: [
				{ propertyName: specialQueryFields.TEMPLATE, operator: queryOperators.IS, value: [propertyValue] },
				{ propertyName, operator: queryOperators.IS, value: [propertyValue, propertyValue2] },
			],
			expectedQuery: { $and: [
				{ [propertyName]: { $in: [propertyValue, propertyValue2] } },
				{ type: { $in: ticketTemplates.map((t) => t._id) } },
			],
			},
		}],
		['ticket code filter', [], {}, undefined, { }, {
			isTemplateQuery: true,
			queryFilters: [
				{ propertyName: specialQueryFields.TICKET_CODE,
					operator: queryOperators.IS,
					value: [propertyValue] },
			],
			ticketCodeQuery: { ticketCode: { $in: [propertyValue] } },
			expectedQuery: {},
		}],
		['ticket code filter with multiple filters', [], {}, undefined, { }, {
			isTemplateQuery: true,
			queryFilters: [
				{ propertyName: specialQueryFields.TICKET_CODE,
					operator: queryOperators.IS,
					value: [propertyValue] },
				{ propertyName, operator: queryOperators.IS, value: [propertyValue, propertyValue2] },
			],
			expectedQuery: { $and: [
				{ [propertyName]: { $in: [propertyValue, propertyValue2] } },
			] },
			ticketCodeQuery: { ticketCode: { $in: [propertyValue] } },
		}],
	])('Get ticket list', (desc, filters, customProjection, updatedSince, { sortBy, sortDesc, limit, skip } = {}, { queryFilters, expectedQuery, ticketCodeQuery, isTemplateQuery } = {}) => {
		test(`Should call getAllTickets/getTicketsByFilter in model with ${desc}`, async () => {
			const teamspace = generateRandomString();
			const project = generateRandomString();
			const model = generateRandomString();
			const expectedOutput = generateRandomString();

			if (queryFilters?.length) {
				TicketsModel.getTicketsByFilter.mockResolvedValueOnce(expectedOutput);
				if (isTemplateQuery) {
					TemplatesModel.getTemplatesByQuery.mockResolvedValueOnce(ticketTemplates);
				}
			} else {
				TicketsModel.getAllTickets.mockResolvedValueOnce(expectedOutput);
			}

			await expect(Tickets.getTicketList(teamspace, project, model,
				{ filters, updatedSince, sortBy, limit, skip, sortDesc, queryFilters }))
				.resolves.toEqual(expectedOutput);

			const { SAFETIBASE, SEQUENCING } = presetModules;
			const { [SAFETIBASE]: safetibaseProps } = modulePropertyLabels;
			const { [SEQUENCING]: seqProps } = modulePropertyLabels;
			const projection = {
				_id: 1,
				title: 1,
				number: 1,
				type: 1,
				...customProjection,
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
				[`modules.${SEQUENCING}.${seqProps.START_TIME}`]: 1,
				[`modules.${SEQUENCING}.${seqProps.END_TIME}`]: 1,
			};

			let sort;
			if (sortBy) {
				const sortOrder = sortDesc ? -1 : 1;
				sort = { [`properties.${sortBy}`]: sortOrder };
			}

			if (queryFilters?.length) {
				expect(TicketsModel.getTicketsByFilter).toHaveBeenCalledTimes(1);
				expect(TicketsModel.getTicketsByFilter).toHaveBeenCalledWith(teamspace, project, model,
					deleteIfUndefined({ projection,
						updatedSince,
						sort,
						limit,
						skip,
						query: expectedQuery,
						ticketCodeQuery }));
			} else {
				expect(TicketsModel.getAllTickets).toHaveBeenCalledTimes(1);
				expect(TicketsModel.getAllTickets).toHaveBeenCalledWith(teamspace, project, model,
					deleteIfUndefined({ projection, updatedSince, sort, limit, skip }));
			}
		});
	});
};

const testGetOpenTicketsCount = () => {
	describe('Get the number of open tickets', () => {
		const teamspace = generateRandomString();
		const project = generateRandomString();
		const model = generateRandomString();

		test('should return 0 if getAllTickets returns no tickets', async () => {
			TicketsModel.getAllTickets.mockResolvedValueOnce([]);
			TemplatesModel.getAllTemplates.mockResolvedValueOnce([]);

			await expect(Tickets.getOpenTicketsCount(teamspace, project, model))
				.resolves.toEqual(0);

			expect(TicketsModel.getAllTickets).toHaveBeenCalledTimes(1);
			expect(TicketsModel.getAllTickets).toHaveBeenCalledWith(teamspace, project, model,
				{ projection: { type: 1, [`properties.${basePropertyLabels.STATUS}`]: 1 } });
			expect(TemplatesModel.getAllTemplates).toHaveBeenCalledTimes(1);
			expect(TemplatesModel.getAllTemplates).toHaveBeenCalledWith(teamspace, true, { _id: 1, config: 1 });
		});

		test('should return the number of open tickets with no custom status', async () => {
			const template = generateTemplate();
			const tickets = Object.values(statuses).map((status) => {
				const ticket = generateTicket(template);
				ticket.properties.Status = status;
				return ticket;
			});

			TicketsModel.getAllTickets.mockResolvedValueOnce(tickets);
			TemplatesModel.getAllTemplates.mockResolvedValueOnce([template]);

			await expect(Tickets.getOpenTicketsCount(teamspace, project, model)).resolves.toEqual(3);

			expect(TicketsModel.getAllTickets).toHaveBeenCalledTimes(1);
			expect(TicketsModel.getAllTickets).toHaveBeenCalledWith(teamspace, project, model,
				{ projection: { type: 1, [`properties.${basePropertyLabels.STATUS}`]: 1 } });
			expect(TemplatesModel.getAllTemplates).toHaveBeenCalledTimes(1);
			expect(TemplatesModel.getAllTemplates).toHaveBeenCalledWith(teamspace, true, { _id: 1, config: 1 });
		});

		test('should return the number of open tickets with custom status', async () => {
			const customStatuses = [
				{ name: generateRandomString(), type: statusTypes.OPEN },
				{ name: generateRandomString(), type: statusTypes.ACTIVE },
				{ name: generateRandomString(), type: statusTypes.VOID },
				{ name: generateRandomString(), type: statusTypes.DONE },
			];

			const template = generateTemplate(false, false, {
				status: {
					values: customStatuses,
					default: customStatuses[0].name,
				},
			});

			const tickets = customStatuses.map((status) => {
				const ticket = generateTicket(template);
				ticket.properties.Status = status.name;
				return ticket;
			});

			TicketsModel.getAllTickets.mockResolvedValueOnce(tickets);
			TemplatesModel.getAllTemplates.mockResolvedValueOnce([template]);

			await expect(Tickets.getOpenTicketsCount(teamspace, project, model)).resolves.toEqual(2);

			expect(TicketsModel.getAllTickets).toHaveBeenCalledTimes(1);
			expect(TicketsModel.getAllTickets).toHaveBeenCalledWith(teamspace, project, model,
				{ projection: { type: 1, [`properties.${basePropertyLabels.STATUS}`]: 1 } });
			expect(TemplatesModel.getAllTemplates).toHaveBeenCalledTimes(1);
			expect(TemplatesModel.getAllTemplates).toHaveBeenCalledWith(teamspace, true, { _id: 1, config: 1 });
		});
	});
};

const testInitialiseAutomatedProperties = () => {
	const teamspace = generateRandomString();
	const project = generateRandomString();
	const model = generateRandomString();
	const modelName = generateRandomString();
	const moduleName = generateRandomString();
	const temCode = generateRandomString(3);
	const ticketNum = generateRandomNumber();
	const propName = generateRandomString();
	describe.each([
		['Should not update anything if there is no automated fields', {}],
		['Should update the field if it is automated', { value: 'xyz' }, 'xyz'],
		['Should update the field if it is automated (model name)', { value: `{${supportedPatterns.MODEL_NAME}}` }, modelName],
		['Should update the field if it is automated (template code)', { value: 'code{template_code}' }, `code${temCode}`],
		['Should update the field if it is automated (ticket number)', { value: 'code{ticket_number}' }, `code${ticketNum}`],
		['Should update the field if it is automated (mutliple properties)', { value: '{model_name}:{template_code}:{ticket_number}' }, `${modelName}:${temCode}:${ticketNum}`],

	])('Initialise automated fields', (desc, config, value) => {
		test(desc, async () => {
			const property = { name: propName, type: propTypes.TEXT, ...config };
			const template = {
				_id: generateUUIDString(),
				name: generateRandomString(),
				code: temCode,
				properties: [property],
				modules: [{
					name: moduleName,
					properties: [property],
				}],
			};
			const nTickets = 5;
			const expectedData = [];
			const tickets = times(nTickets, () => {
				const ticket = {
					model,
					project,
					title: generateRandomString(),
					number: ticketNum,
					properties: {},
					modules: { [moduleName]: {} },
				};
				const resTicket = cloneDeep(ticket);

				if (value !== undefined) {
					resTicket.properties[propName] = value;
					resTicket.modules[moduleName][propName] = value;
				}
				expectedData.push(resTicket);

				return ticket;
			});

			if (value !== undefined) {
				ModelSettings.getModelById.mockResolvedValueOnce({ name: modelName });
			}

			await expect(Tickets.initialiseAutomatedProperties(teamspace, project, model, tickets, template))
				.resolves.toEqual(expectedData);

			const updateData = {
				properties: { [propName]: value },
				modules: { [moduleName]: { [propName]: value } },
			};

			if (value === undefined) {
				expect(TicketsModel.updateTickets).not.toHaveBeenCalled();
			} else {
				expect(TicketsModel.updateTickets).toHaveBeenCalledTimes(1);
				expect(TicketsModel.updateTickets).toHaveBeenCalledWith(teamspace, project, model,
					tickets, times(tickets.length, () => updateData), 'system');

				expect(ModelSettings.getModelById).toHaveBeenCalledTimes(1);
				expect(ModelSettings.getModelById).toHaveBeenCalledWith(teamspace, model, { name: 1 });
			}
		});
	});
};

const testOnTemplateCodeUpdated = () => {
	const teamspace = generateRandomString();
	const modelName = generateRandomString();
	const moduleName = generateRandomString();
	const temCode = generateRandomString(3);
	const ticketNum = generateRandomNumber();
	const propName = generateRandomString();
	describe.each([
		['Should do nothing if there is no ticket associated with the template', { value: `code{${supportedPatterns.TEMPLATE_CODE}}` }, undefined, false],
		['Should do nothing if the template does not contain automated properties', { }, undefined],
		['Should do nothing if the template automated property does not contain {template_code}', { value: 'xyz' }, undefined],
		[`Should update the field if it is automated (${supportedPatterns.TEMPLATE_CODE})`, { value: `code{${supportedPatterns.TEMPLATE_CODE}}` }, `code${temCode}`],
		['Should update the field if it is automated (mutliple properties)',
			{ value: `code{${supportedPatterns.MODEL_NAME}}:{${supportedPatterns.TEMPLATE_CODE}}:{${supportedPatterns.TICKET_NUMBER}}` }, `code${modelName}:${temCode}:${ticketNum}`],

	])('On template code updated', (desc, config, value, hasTickets = true) => {
		test(desc, async () => {
			const property = { name: propName, type: propTypes.TEXT, ...config };
			const template = {
				_id: generateUUIDString(),
				name: generateRandomString(),
				code: temCode,
				properties: [property],
				modules: [{
					name: moduleName,
					properties: [property],
				}],
			};
			const project = generateRandomString();
			const models = times(2, () => generateRandomString());
			const nTickets = hasTickets ? 6 : 0;
			const expectedData = [];
			const tickets = times(nTickets, (i) => {
				const ticket = {
					title: generateRandomString(),
					project,
					model: models[i % 2],
					number: ticketNum,
					properties: {},
					modules: { [moduleName]: {} },
				};
				const resTicket = cloneDeep(ticket);

				if (value !== undefined) {
					resTicket.properties[propName] = value;
					resTicket.modules[moduleName][propName] = value;
				}
				expectedData.push(resTicket);

				return ticket;
			});

			if (value !== undefined) {
				models.forEach(() => {
					ModelSettings.getModelById.mockResolvedValueOnce({ name: modelName });
				});
			}

			const fetchedTickets = config.value?.includes(`{${supportedPatterns.TEMPLATE_CODE}}`);

			if (fetchedTickets) {
				TicketsModel.getTicketsByTemplateId.mockResolvedValueOnce(tickets);
			}

			await Tickets.onTemplateCodeUpdated(teamspace, template);

			if (fetchedTickets) {
				expect(TicketsModel.getTicketsByTemplateId).toHaveBeenCalledTimes(1);
				expect(TicketsModel.getTicketsByTemplateId).toHaveBeenCalledWith(teamspace,
					template._id, { number: 1, _id: 1, project: 1, model: 1 });
			} else {
				expect(TicketsModel.getTicketsByTemplateId).not.toHaveBeenCalled();
			}

			const updateData = {
				properties: { [propName]: value },
				modules: { [moduleName]: { [propName]: value } },
			};

			if (value === undefined) {
				expect(TicketsModel.updateTickets).not.toHaveBeenCalled();
			} else {
				expect(TicketsModel.updateTickets).toHaveBeenCalledTimes(models.length);
				models.forEach((model) => {
					expect(TicketsModel.updateTickets).toHaveBeenCalledWith(teamspace,
						project, model, tickets.filter(({ model: ticketModel }) => model === ticketModel),
						times(tickets.length / models.length, () => updateData), 'system');
				});

				expect(ModelSettings.getModelById).toHaveBeenCalledTimes(models.length);
				models.forEach((model) => {
					expect(ModelSettings.getModelById).toHaveBeenCalledWith(teamspace, model, { name: 1 });
				});
			}
		});
	});
};

const testOnModelNameUpdated = () => {
	const teamspace = generateRandomString();
	const project = generateRandomString();
	const model = generateRandomString();
	const modelName = generateRandomString();
	const moduleName = generateRandomString();
	const propName = generateRandomString();
	describe.each([
		['Should do nothing if there is no ticket associated with the templates', { value: `code{${supportedPatterns.MODEL_NAME}}` }, undefined, true, false],
		['Should do nothing if there is no templates', { value: `code{${supportedPatterns.MODEL_NAME}}` }, undefined, false, false],
		['Should do nothing if the template does not contain automated properties', { }],
		[`Should do nothing if the template automated property does not contain ${supportedPatterns.MODEL_NAME}`, { value: 'xyz' }],
		[`Should update the field if it is automated (${supportedPatterns.MODEL_NAME})`, { value: `code{${supportedPatterns.MODEL_NAME}}` }, `code${modelName}`],
	])('On model name updated', (desc, config, value, hasTemplates = true, hasTickets = true) => {
		test(desc, async () => {
			const property = { name: propName, type: propTypes.TEXT, ...config };
			const templates = times(hasTemplates ? 2 : 0, () => ({
				_id: generateUUIDString(),
				name: generateRandomString(),
				properties: [property],
				modules: [{
					name: moduleName,
					properties: [property],
				}],
			}));
			const nTickets = hasTickets ? 5 : 0;
			const expectedData = [];
			const tickets = times(nTickets, () => {
				const ticket = {
					title: generateRandomString(),
					project,
					model,
					properties: {},
					modules: { [moduleName]: {} },
				};
				const resTicket = cloneDeep(ticket);

				if (value !== undefined) {
					resTicket.properties[propName] = value;
					resTicket.modules[moduleName][propName] = value;
				}
				expectedData.push(resTicket);

				return ticket;
			});
			TemplatesModel.getTemplatesByQuery.mockResolvedValueOnce(templates);

			if (value !== undefined) {
				templates.forEach(() => {
					ModelSettings.getModelById.mockResolvedValueOnce({ name: modelName });
				});
			}

			const fetchedTickets = config.value?.includes(`{${supportedPatterns.MODEL_NAME}}`);

			if (fetchedTickets) {
				templates.forEach(() => {
					TicketsModel.getTicketsByQuery.mockResolvedValueOnce(tickets);
				});
			}

			await expect(Tickets.onModelNameUpdated(teamspace, project, model))
				.resolves.toBeUndefined();

			expect(TemplatesModel.getTemplatesByQuery).toHaveBeenCalledTimes(1);
			expect(TemplatesModel.getTemplatesByQuery).toHaveBeenCalledWith(teamspace,
				{ $or: [
					{ 'properties.value': { $regex: `{${supportedPatterns.MODEL_NAME}}` } },
					{ 'modules.properties.value': { $regex: `{${supportedPatterns.MODEL_NAME}}` } },
				] });

			if (fetchedTickets) {
				expect(TicketsModel.getTicketsByQuery).toHaveBeenCalledTimes(templates.length);
				templates.forEach((template) => {
					expect(TicketsModel.getTicketsByQuery).toHaveBeenCalledWith(teamspace, project, model,
						{ type: template._id }, { number: 1, _id: 1, project: 1, model: 1 });
				});
			} else {
				expect(TicketsModel.getTicketsByQuery).not.toHaveBeenCalled();
			}

			const updateData = {
				properties: { [propName]: value },
				modules: { [moduleName]: { [propName]: value } },
			};

			if (value === undefined) {
				expect(TicketsModel.updateTickets).not.toHaveBeenCalled();
			} else {
				expect(TicketsModel.updateTickets).toHaveBeenCalledTimes(templates.length);
				expect(TicketsModel.updateTickets).toHaveBeenCalledWith(teamspace, project, model,
					tickets, times(tickets.length, () => updateData), 'system');

				expect(ModelSettings.getModelById).toHaveBeenCalledTimes(templates.length);
				expect(ModelSettings.getModelById).toHaveBeenCalledWith(teamspace, model, { name: 1 });
			}
		});
	});
};

describe(determineTestGroup(__filename), () => {
	beforeEach(() => {
		jest.resetAllMocks();
	});
	testAddTicket();
	testImportTickets();
	testGetTicketResourceAsStream();
	testGetTicketById();
	testUpdateTicket();
	testUpdateManyTickets();
	testGetTicketList();
	testGetOpenTicketsCount();
	testInitialiseAutomatedProperties();
	testOnTemplateCodeUpdated();
	testOnModelNameUpdated();
});
