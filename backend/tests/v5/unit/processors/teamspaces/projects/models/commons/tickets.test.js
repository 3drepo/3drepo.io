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

const { cloneDeep, times } = require('lodash');
const { src } = require('../../../../../../helper/path');
const { generateUUID, generateRandomString, generateTemplate, generateTicket, generateGroup } = require('../../../../../../helper/services');

const Tickets = require(`${src}/processors/teamspaces/projects/models/commons/tickets`);

const { basePropertyLabels, modulePropertyLabels, presetModules, propTypes, viewGroups } = require(`${src}/schemas/tickets/templates.constants`);

const { isUUID } = require(`${src}/utils/helper/typeCheck`);

const { templates } = require(`${src}/utils/responseCodes`);

jest.mock('../../../../../../../../src/v5/services/eventsManager/eventsManager');
const EventsManager = require(`${src}/services/eventsManager/eventsManager`);
const { events } = require(`${src}/services/eventsManager/eventsManager.constants`);

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

const generateImageTestData = (isView, tickets = 1) => {
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

	const data = times(tickets, () => {
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

		return { ticket, propBuffer, modPropBuffer };
	});

	return { template, propName, moduleName, data };
};

const addTicketImageTest = async (isView) => {
	const teamspace = generateRandomString();
	const project = generateRandomString();
	const model = generateRandomString();
	const expectedOutput = { _id: generateRandomString() };
	const imageTestData = generateImageTestData(isView);

	TicketsModel.addTicketsWithTemplate.mockResolvedValueOnce([expectedOutput]);
	TemplatesModel.generateFullSchema.mockImplementationOnce((t) => t);

	await expect(Tickets.addTicket(teamspace, project, model, imageTestData.template,
		imageTestData.data[0].ticket)).resolves.toEqual(expectedOutput._id);

	const [processedTicket] = TicketsModel.addTicketsWithTemplate.mock.calls[0][4];

	const propRef = isView ? processedTicket.properties[imageTestData.propName].screenshot
		: processedTicket.properties[imageTestData.propName];
	const modPropRef = isView ? processedTicket.modules[imageTestData.moduleName][imageTestData.propName].screenshot
		: processedTicket.modules[imageTestData.moduleName][imageTestData.propName];

	expect(TicketsModel.addTicketsWithTemplate).toHaveBeenCalledTimes(1);
	expect(TicketsModel.addTicketsWithTemplate).toHaveBeenCalledWith(teamspace, project, model,
		imageTestData.template._id,
		[{
			...imageTestData.data[0].ticket,
			properties: { [imageTestData.propName]: generatePropData(propRef, isView) },
			modules: {
				[imageTestData.moduleName]: {
					[imageTestData.propName]: generatePropData(modPropRef, isView),
				},
			},
		}]);

	expect(TemplatesModel.generateFullSchema).toHaveBeenCalledTimes(1);
	expect(TemplatesModel.generateFullSchema).toHaveBeenCalledWith(imageTestData.template);

	const meta = { teamspace, project, model, ticket: expectedOutput._id };
	expect(FilesManager.storeFile).toHaveBeenCalledTimes(2);
	expect(FilesManager.storeFile).toHaveBeenCalledWith(
		teamspace, TICKETS_RESOURCES_COL, propRef, imageTestData.data[0].propBuffer, meta,
	);
	expect(FilesManager.storeFile).toHaveBeenCalledWith(
		teamspace, TICKETS_RESOURCES_COL, modPropRef, imageTestData.data[0].modPropBuffer, meta,
	);
};

const importTicketsImageTest = async (isView) => {
	const teamspace = generateRandomString();
	const project = generateRandomString();
	const model = generateRandomString();
	const imageTestData = generateImageTestData(isView, 1);
	const tickets = [];
	const expectedOutput = imageTestData.data.map(({ ticket }) => {
		tickets.push(ticket);
		const _id = generateRandomString();
		return { ...ticket, _id };
	});

	TicketsModel.addTicketsWithTemplate.mockResolvedValueOnce(expectedOutput);
	TemplatesModel.generateFullSchema.mockImplementationOnce((t) => t);

	await expect(Tickets.importTickets(teamspace, project, model, imageTestData.template,
		tickets)).resolves.toEqual(expectedOutput.map(({ _id }) => _id));

	const processedTickets = TicketsModel.addTicketsWithTemplate.mock.calls[0][4];

	const refFiles = [];

	const ticketsToInsert = processedTickets.map((proTick, i) => {
		const prop = proTick.properties[imageTestData.propName];
		const modProp = proTick.modules[imageTestData.moduleName][imageTestData.propName];

		const expectedTicket = cloneDeep(tickets[i]);

		if (isView) {
			expectedTicket.properties[imageTestData.propName].screenshot = prop.screenshot;
			expectedTicket.modules[imageTestData.moduleName][imageTestData.propName].screenshot = modProp.screenshot;

			refFiles.push({ ref: prop.screenshot,
				buffer: imageTestData.data[i].propBuffer,
				ticket: expectedOutput[i]._id });
			refFiles.push({ ref: modProp.screenshot,
				buffer: imageTestData.data[i].modPropBuffer,
				ticket: expectedOutput[i]._id });
		} else {
			expectedTicket.properties[imageTestData.propName] = prop;
			expectedTicket.modules[imageTestData.moduleName][imageTestData.propName] = modProp;

			refFiles.push({ ref: prop, buffer: imageTestData.data[i].propBuffer, ticket: expectedOutput[i]._id });
			refFiles.push({ ref: modProp, buffer: imageTestData.data[i].modPropBuffer, ticket: expectedOutput[i]._id });
		}

		return expectedTicket;
	});

	expect(TicketsModel.addTicketsWithTemplate).toHaveBeenCalledTimes(1);
	expect(TicketsModel.addTicketsWithTemplate).toHaveBeenCalledWith(teamspace, project, model,
		imageTestData.template._id, ticketsToInsert);

	expect(TemplatesModel.generateFullSchema).toHaveBeenCalledTimes(1);
	expect(TemplatesModel.generateFullSchema).toHaveBeenCalledWith(imageTestData.template);

	expect(FilesManager.storeFile).toHaveBeenCalledTimes(refFiles.length);

	refFiles.forEach(({ ref, buffer, ticket }) => {
		const meta = { teamspace, project, model, ticket };
		expect(FilesManager.storeFile).toHaveBeenCalledWith(
			teamspace, TICKETS_RESOURCES_COL, ref, buffer, meta,
		);
	});
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
		imageTestData.data[0].ticket, updateData, author)).resolves.toBeUndefined();

	const processedTicket = TicketsModel.updateTicket.mock.calls[0][4];
	const propRef = isView ? processedTicket.properties[imageTestData.propName].screenshot
		: processedTicket.properties[imageTestData.propName];
	const modPropRef = isView ? processedTicket.modules[imageTestData.moduleName][imageTestData.propName].screenshot
		: processedTicket.modules[imageTestData.moduleName][imageTestData.propName];

	expect(TicketsModel.updateTicket).toHaveBeenCalledTimes(1);
	expect(TicketsModel.updateTicket).toHaveBeenCalledWith(teamspace, project, model, imageTestData.data[0].ticket,
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

	const meta = { teamspace, project, model, ticket: imageTestData.data[0].ticket._id };
	expect(FilesManager.storeFile).toHaveBeenCalledTimes(2);
	expect(FilesManager.storeFile).toHaveBeenCalledWith(
		teamspace, TICKETS_RESOURCES_COL, propRef, updatePropBuffer, meta,
	);
	expect(FilesManager.storeFile).toHaveBeenCalledWith(
		teamspace, TICKETS_RESOURCES_COL, modPropRef, updateModPropBuffer, meta,
	);
	expect(FilesManager.removeFile).toHaveBeenCalledTimes(2);
	expect(FilesManager.removeFile).toHaveBeenCalledWith(
		teamspace, TICKETS_RESOURCES_COL, imageTestData.data[0].propBuffer,
	);
	expect(FilesManager.removeFile).toHaveBeenCalledWith(
		teamspace, TICKETS_RESOURCES_COL, imageTestData.data[0].propBuffer,
	);
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

const addTicketGroupTests = () => {
	describe('Groups', () => {
		test('should be extracted and replaced with a group UUID', async () => {
			const teamspace = generateRandomString();
			const project = generateRandomString();
			const model = generateRandomString();

			const testData = generateGroupsTestData();
			const expectedOutput = { _id: generateRandomString() };

			TicketsModel.addTicketsWithTemplate.mockResolvedValueOnce([expectedOutput]);
			TemplatesModel.generateFullSchema.mockImplementationOnce((t) => t);

			await expect(Tickets.addTicket(teamspace, project, model, testData.template,
				testData.tickets[0])).resolves.toEqual(expectedOutput._id);

			expect(TicketsModel.addTicketsWithTemplate).toHaveBeenCalledTimes(1);
			expect(TicketsModel.addTicketsWithTemplate).toHaveBeenCalledWith(teamspace, project, model,
				testData.template._id, expect.any(Array));

			const newGroups = [];

			const [processedTicket] = TicketsModel.addTicketsWithTemplate.mock.calls[0][4];
			const propData = processedTicket.properties[testData.propName];
			const modPropData = processedTicket.modules[testData.moduleName][testData.propName];

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
			expect(TicketGroupsModel.addGroups).toHaveBeenCalledWith(teamspace, project,
				model, expectedOutput._id, expect.any(Array));

			const groupIDsToSave = TicketGroupsModel.addGroups.mock.calls[0][4].map(({ _id }) => _id);

			expect(groupIDsToSave.length).toBe(newGroups.length);
			expect(groupIDsToSave).toEqual(expect.arrayContaining(newGroups));
			expect(TicketGroupsModel.deleteGroups).not.toHaveBeenCalled();
		});
	});
};

const importTicketsGroupTests = () => {
	describe('Groups', () => {
		test('should be extracted and replaced with a group UUID', async () => {
			const teamspace = generateRandomString();
			const project = generateRandomString();
			const model = generateRandomString();

			const testData = generateGroupsTestData(false, 10);

			const expectedOutput = testData.tickets.map((tickets) => ({ ...tickets, _id: generateUUID() }));

			TicketsModel.addTicketsWithTemplate.mockResolvedValueOnce(expectedOutput);
			TemplatesModel.generateFullSchema.mockImplementationOnce((t) => t);

			await expect(Tickets.importTickets(teamspace, project, model, testData.template,
				testData.tickets)).resolves.toEqual(expectedOutput.map(({ _id }) => _id));

			expect(TicketsModel.addTicketsWithTemplate).toHaveBeenCalledTimes(1);
			expect(TicketsModel.addTicketsWithTemplate).toHaveBeenCalledWith(teamspace, project, model,
				testData.template._id, expect.any(Array));

			const processedTickets = TicketsModel.addTicketsWithTemplate.mock.calls[0][4];

			const newGroups = processedTickets.map((proTick, i) => {
				const propData = proTick.properties[testData.propName];
				const modPropData = proTick.modules[testData.moduleName][testData.propName];
				const groups = { ticket: expectedOutput[i]._id, groupIds: [] };

				[propData, modPropData].forEach(({ state }) => {
					Object.keys(state).forEach((key) => {
						state[key].forEach(({ group }) => {
							expect(isUUID(group)).toBeTruthy();
							groups.groupIds.push(group);
						});
					});
				});
				return groups;
			});

			expect(TemplatesModel.generateFullSchema).toHaveBeenCalledTimes(1);
			expect(TemplatesModel.generateFullSchema).toHaveBeenCalledWith(testData.template);

			expect(TicketGroupsModel.addGroups).toHaveBeenCalledTimes(newGroups.length);

			const expectedGroupIds = [];

			newGroups.forEach(({ ticket, groupIds }) => {
				expect(TicketGroupsModel.addGroups).toHaveBeenCalledWith(teamspace, project,
					model, ticket, expect.any(Array));
				expectedGroupIds.push(...groupIds);
			});

			const groupIDsToSave = TicketGroupsModel.addGroups.mock.calls.flatMap((call) => call[4].map(
				({ _id }) => _id));

			expect(groupIDsToSave.length).toBe(expectedGroupIds.length);
			expect(groupIDsToSave).toEqual(expect.arrayContaining(expectedGroupIds));
			expect(TicketGroupsModel.deleteGroups).not.toHaveBeenCalled();
		});
	});
};

const updateTicketGroupTests = () => {
	describe('Groups', () => {
		// update when we have some to remove
		// update when we delete them all
		test('New groups should be extracted and replaced with a group UUID', async () => {
			const teamspace = generateRandomString();
			const project = generateRandomString();
			const model = generateRandomString();

			const testData = generateGroupsTestData();

			const toUpdate = {
				properties: {
					[testData.propName]: testData.tickets[0].properties[testData.propName],
				},
				modules: {
					[testData.moduleName]: {
						[testData.propName]: testData.tickets[0].modules[testData.moduleName][testData.propName],
					},
				},
			};

			delete testData.tickets[0].properties[testData.propName];
			delete testData.tickets[0].modules[testData.moduleName][testData.propName];

			TemplatesModel.generateFullSchema.mockImplementationOnce((t) => t);

			await expect(Tickets.updateTicket(teamspace, project, model, testData.template,
				testData.tickets[0], toUpdate)).resolves.toBeUndefined();

			expect(TicketsModel.updateTicket).toHaveBeenCalledTimes(1);
			expect(TicketsModel.updateTicket).toHaveBeenCalledWith(teamspace, project, model,
				testData.tickets[0], expect.any(Object), undefined);

			const newGroups = [];

			const processedTicket = TicketsModel.updateTicket.mock.calls[0][4];
			const propData = processedTicket.properties[testData.propName];
			const modPropData = processedTicket.modules[testData.moduleName][testData.propName];

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
			expect(TicketGroupsModel.addGroups).toHaveBeenCalledWith(teamspace, project, model,
				testData.tickets[0]._id, expect.any(Array));

			const groupIDsToSave = TicketGroupsModel.addGroups.mock.calls[0][4].map(({ _id }) => _id);

			expect(groupIDsToSave.length).toBe(newGroups.length);
			expect(groupIDsToSave).toEqual(expect.arrayContaining(newGroups));
			expect(TicketGroupsModel.deleteGroups).not.toHaveBeenCalled();
		});

		test('Old groups are removed when the state is deleted', async () => {
			const teamspace = generateRandomString();
			const project = generateRandomString();
			const model = generateRandomString();

			const testData = generateGroupsTestData(true);

			const toUpdate = {
				properties: {
					[testData.propName]: null,
				},
				modules: {
					[testData.moduleName]: {
						[testData.propName]: null,
					},
				},
			};

			const groupsToRemove = [];

			TemplatesModel.generateFullSchema.mockImplementationOnce((t) => t);

			await expect(Tickets.updateTicket(teamspace, project, model, testData.template,
				testData.tickets[0], toUpdate)).resolves.toBeUndefined();

			expect(TicketsModel.updateTicket).toHaveBeenCalledTimes(1);
			expect(TicketsModel.updateTicket).toHaveBeenCalledWith(teamspace, project, model,
				testData.tickets[0], toUpdate, undefined);

			const propData = testData.tickets[0].properties[testData.propName];
			const modPropData = testData.tickets[0].modules[testData.moduleName][testData.propName];

			[propData, modPropData].forEach(({ state }) => {
				Object.keys(state).forEach((key) => {
					state[key].forEach(({ group }) => {
						expect(isUUID(group)).toBeTruthy();
						groupsToRemove.push(group);
					});
				});
			});

			expect(TemplatesModel.generateFullSchema).toHaveBeenCalledTimes(1);
			expect(TemplatesModel.generateFullSchema).toHaveBeenCalledWith(testData.template);

			expect(TicketGroupsModel.addGroups).not.toHaveBeenCalled();

			expect(TicketGroupsModel.deleteGroups).toHaveBeenCalledTimes(1);
			expect(TicketGroupsModel.deleteGroups).toHaveBeenCalledWith(teamspace, project, model,
				testData.tickets[0]._id, groupsToRemove);
		});

		test('Old groups are removed if they are no longer referenced and new groups should be added', async () => {
			const teamspace = generateRandomString();
			const project = generateRandomString();
			const model = generateRandomString();

			const testData = generateGroupsTestData(true);

			const newGroups = [];
			const toRemove = [];

			const updatedPropData = cloneDeep(testData.tickets[0].properties[testData.propName]);
			const updatedModPropData = cloneDeep(testData.tickets[0].modules[testData.moduleName][testData.propName]);

			TicketGroupsModel.getGroupsByIds.mockImplementationOnce(
				(ts, proj, mod, ticket, ids) => Promise.resolve(ids.map(
					(_id) => ({ _id }))));

			Object.keys(updatedPropData.state).forEach((key) => {
				const groupArr = updatedPropData.state[key];

				toRemove.push(groupArr[0].group);
				groupArr[0].group = generateGroup(true, { hasId: false });
			});

			Object.keys(updatedModPropData.state).forEach((key) => {
				const groupArr = updatedModPropData.state[key];

				toRemove.push(groupArr[0].group);
				groupArr[0].group = generateGroup(true, { hasId: false });
			});

			const toUpdate = {
				properties: {
					[testData.propName]: updatedPropData,
				},
				modules: {
					[testData.moduleName]: {
						[testData.propName]: updatedModPropData,
					},
				},
			};

			TemplatesModel.generateFullSchema.mockImplementationOnce((t) => t);

			await expect(Tickets.updateTicket(teamspace, project, model, testData.template,
				testData.tickets[0], toUpdate)).resolves.toBeUndefined();

			expect(TicketsModel.updateTicket).toHaveBeenCalledTimes(1);
			expect(TicketsModel.updateTicket).toHaveBeenCalledWith(teamspace, project, model,
				testData.tickets[0], expect.any(Object), undefined);

			const processedTicket = TicketsModel.updateTicket.mock.calls[0][4];
			const propData = processedTicket.properties[testData.propName];
			const modPropData = processedTicket.modules[testData.moduleName][testData.propName];

			[propData, modPropData].forEach(({ state }) => {
				Object.keys(state).forEach((key) => {
					newGroups.push(state[key][0].group);
				});
			});

			expect(TemplatesModel.generateFullSchema).toHaveBeenCalledTimes(1);
			expect(TemplatesModel.generateFullSchema).toHaveBeenCalledWith(testData.template);

			expect(TicketGroupsModel.addGroups).toHaveBeenCalledTimes(1);
			expect(TicketGroupsModel.addGroups).toHaveBeenCalledWith(teamspace, project, model,
				testData.tickets[0]._id, expect.any(Array));

			const groupIDsToSave = TicketGroupsModel.addGroups.mock.calls[0][4].map(({ _id }) => _id);

			expect(groupIDsToSave.length).toBe(newGroups.length);
			expect(groupIDsToSave).toEqual(expect.arrayContaining(newGroups));

			expect(TicketGroupsModel.deleteGroups).toHaveBeenCalledTimes(1);
			expect(TicketGroupsModel.deleteGroups).toHaveBeenCalledWith(teamspace, project, model,
				testData.tickets[0]._id, toRemove);
		});
		test('Old groups are retained if the update doesn\'t update the field', async () => {
			const teamspace = generateRandomString();
			const project = generateRandomString();
			const model = generateRandomString();

			const testData = generateGroupsTestData(true);

			const newGroups = [];
			const toRemove = [];

			const updatedPropData = cloneDeep(testData.tickets[0].properties[testData.propName]);

			TicketGroupsModel.getGroupsByIds.mockImplementationOnce(
				(ts, proj, mod, ticket, ids) => Promise.resolve(ids.map(
					(_id) => ({ _id }))));

			Object.keys(updatedPropData.state).forEach((key) => {
				const groupArr = updatedPropData.state[key];

				toRemove.push(groupArr[0].group);
				groupArr[0].group = generateGroup(true, { hasId: false });
			});

			const toUpdate = {
				properties: {
					[testData.propName]: updatedPropData,
				},
			};

			TemplatesModel.generateFullSchema.mockImplementationOnce((t) => t);

			await expect(Tickets.updateTicket(teamspace, project, model, testData.template,
				testData.tickets[0], toUpdate)).resolves.toBeUndefined();

			expect(TicketsModel.updateTicket).toHaveBeenCalledTimes(1);
			expect(TicketsModel.updateTicket).toHaveBeenCalledWith(teamspace, project, model,
				testData.tickets[0], expect.any(Object), undefined);

			const processedTicket = TicketsModel.updateTicket.mock.calls[0][4];
			const propData = processedTicket.properties[testData.propName];
			[propData].forEach(({ state }) => {
				Object.keys(state).forEach((key) => {
					newGroups.push(state[key][0].group);
				});
			});

			expect(TemplatesModel.generateFullSchema).toHaveBeenCalledTimes(1);
			expect(TemplatesModel.generateFullSchema).toHaveBeenCalledWith(testData.template);

			expect(TicketGroupsModel.addGroups).toHaveBeenCalledTimes(1);
			expect(TicketGroupsModel.addGroups).toHaveBeenCalledWith(teamspace, project, model,
				testData.tickets[0]._id, expect.any(Array));

			const groupIDsToSave = TicketGroupsModel.addGroups.mock.calls[0][4].map(({ _id }) => _id);

			expect(groupIDsToSave.length).toBe(newGroups.length);
			expect(groupIDsToSave).toEqual(expect.arrayContaining(newGroups));

			expect(TicketGroupsModel.deleteGroups).toHaveBeenCalledTimes(1);
			expect(TicketGroupsModel.deleteGroups).toHaveBeenCalledWith(teamspace, project, model,
				testData.tickets[0]._id, toRemove);
		});

		test('Throw an error if retained groups contains group ids that does not exist', async () => {
			const teamspace = generateRandomString();
			const project = generateRandomString();
			const model = generateRandomString();

			const testData = generateGroupsTestData(true);

			const toRemove = [];

			const updatedPropData = cloneDeep(testData.tickets[0].properties[testData.propName]);
			const updatedModPropData = cloneDeep(testData.tickets[0].modules[testData.moduleName][testData.propName]);

			Object.keys(updatedPropData.state).forEach((key) => {
				const groupArr = updatedPropData.state[key];

				toRemove.push(groupArr[0].group);
				groupArr[0].group = generateGroup(true, { hasId: false });
			});

			Object.keys(updatedModPropData.state).forEach((key) => {
				const groupArr = updatedModPropData.state[key];

				toRemove.push(groupArr[0].group);
				groupArr[0].group = generateGroup(true, { hasId: false });
			});

			const toUpdate = {
				properties: {
					[testData.propName]: updatedPropData,
				},
				modules: {
					[testData.moduleName]: {
						[testData.propName]: updatedModPropData,
					},
				},
			};

			TicketGroupsModel.getGroupsByIds.mockImplementationOnce(
				(ts, proj, mod, ticket, ids) => Promise.resolve([{ _id: ids[0] }]));

			TemplatesModel.generateFullSchema.mockImplementationOnce((t) => t);

			await expect(Tickets.updateTicket(teamspace, project, model, testData.template,
				testData.tickets[0], toUpdate)).rejects.toEqual(
				expect.objectContaining({ code: templates.invalidArguments.code }));
		});
	});
};

const testAddTicket = () => {
	describe('Add ticket', () => {
		const template = generateTemplate();
		const ticket = generateTicket(template);
		test('should call addTicketsWithTemplate in model and return whatever it returns', async () => {
			const teamspace = generateRandomString();
			const project = generateRandomString();
			const model = generateRandomString();

			const expectedOutput = { ...ticket, _id: generateRandomString() };

			TicketsModel.addTicketsWithTemplate.mockResolvedValueOnce([expectedOutput]);
			TemplatesModel.generateFullSchema.mockImplementationOnce((t) => t);

			await expect(Tickets.addTicket(teamspace, project, model, template, ticket))
				.resolves.toEqual(expectedOutput._id);

			expect(TemplatesModel.generateFullSchema).toHaveBeenCalledTimes(1);
			expect(TemplatesModel.generateFullSchema).toHaveBeenCalledWith(template);

			expect(TicketsModel.addTicketsWithTemplate).toHaveBeenCalledTimes(1);
			expect(TicketsModel.addTicketsWithTemplate).toHaveBeenCalledWith(teamspace, project, model,
				template._id, [ticket]);

			expect(FilesManager.storeFile).not.toHaveBeenCalled();

			expect(EventsManager.publish).toHaveBeenCalledTimes(1);
			expect(EventsManager.publish).toHaveBeenCalledWith(events.NEW_TICKET,
				{ teamspace,
					project,
					model,
					ticket: { ...ticket, ...expectedOutput } });
		});

		test('should process image and store a ref', () => addTicketImageTest());
		test('should process screenshot from view data and store a ref', () => addTicketImageTest(true));

		addTicketGroupTests();
	});
};

const testImportTickets = () => {
	describe('Import ticket', () => {
		const template = generateTemplate();
		const tickets = times(10, () => generateTicket(template));
		test('should call addTicketsWithTemplate in model and return whatever it returns', async () => {
			const teamspace = generateRandomString();
			const project = generateRandomString();
			const model = generateRandomString();

			const expectedOutput = tickets.map((ticketData) => ({ ...ticketData, _id: generateRandomString() }));

			TicketsModel.addTicketsWithTemplate.mockResolvedValueOnce(expectedOutput);
			TemplatesModel.generateFullSchema.mockImplementationOnce((t) => t);

			await expect(Tickets.importTickets(teamspace, project, model, template, tickets))
				.resolves.toEqual(expectedOutput.map(({ _id }) => _id));

			expect(TemplatesModel.generateFullSchema).toHaveBeenCalledTimes(1);
			expect(TemplatesModel.generateFullSchema).toHaveBeenCalledWith(template);

			expect(TicketsModel.addTicketsWithTemplate).toHaveBeenCalledTimes(1);
			expect(TicketsModel.addTicketsWithTemplate).toHaveBeenCalledWith(teamspace, project, model,
				template._id, tickets);

			expect(FilesManager.storeFile).not.toHaveBeenCalled();

			expect(EventsManager.publish).toHaveBeenCalledTimes(expectedOutput.length);
			expectedOutput.forEach((ticket) => expect(EventsManager.publish).toHaveBeenCalledWith(events.NEW_TICKET,
				{ teamspace,
					project,
					model,
					ticket }));
		});

		test('should process images and store refs', () => importTicketsImageTest());
		test('should process screenshots from view data and store refs', () => importTicketsImageTest(true));

		importTicketsGroupTests();
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

		updateTicketGroupTests();
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
	const moduleName = generateRandomString();

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
	])('Get ticket list', (desc, filters, customProjection, updatedSince, { sortBy, sortDesc } = {}) => {
		test(`Should call getAllTickets in model with ${desc}`, async () => {
			const teamspace = generateRandomString();
			const project = generateRandomString();
			const model = generateRandomString();

			const expectedOutput = generateRandomString();

			TicketsModel.getAllTickets.mockResolvedValueOnce(expectedOutput);

			await expect(Tickets.getTicketList(teamspace, project, model, { filters, updatedSince, sortBy, sortDesc }))
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

			expect(TicketsModel.getAllTickets).toHaveBeenCalledTimes(1);
			expect(TicketsModel.getAllTickets).toHaveBeenCalledWith(teamspace, project, model,
				{ projection, updatedSince, sort });
		});
	});
};

describe('processors/teamspaces/projects/models/commons/tickets', () => {
	testAddTicket();
	testImportTickets();
	testGetTicketResourceAsStream();
	testGetTicketById();
	testUpdateTicket();
	testGetTicketList();
});
