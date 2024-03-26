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
const { generateRandomObject, generateUUID, generateUUIDString, generateRandomString, generateTemplate, generateTicket, generateGroup } = require('../../../../../../helper/services');

const Tickets = require(`${src}/processors/teamspaces/projects/models/commons/tickets`);

const { basePropertyLabels, modulePropertyLabels, presetModules, propTypes, viewGroups } = require(`${src}/schemas/tickets/templates.constants`);

const { isUUID } = require(`${src}/utils/helper/typeCheck`);
const { UUIDToString, stringToUUID } = require(`${src}/utils/helper/uuids`);

const { templates } = require(`${src}/utils/responseCodes`);

jest.mock('../../../../../../../../src/v5/services/eventsManager/eventsManager');
const EventsManager = require(`${src}/services/eventsManager/eventsManager`);
const { events } = require(`${src}/services/eventsManager/eventsManager.constants`);

jest.mock('../../../../../../../../src/v5/models/tickets');
const TicketsModel = require(`${src}/models/tickets`);

jest.mock('../../../../../../../../src/v5/processors/teamspaces/projects/models/commons/tickets.comments');
const CommentsProcessor = require(`${src}/processors/teamspaces/projects/models/commons/tickets.comments`);

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

const generateImageTestData = (isRef, isView, tickets = 1) => {
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
		const propBuffer = isRef ? generateUUIDString() : Buffer.from(generateRandomString());
		const modPropBuffer = isRef ? generateUUIDString() : Buffer.from(generateRandomString());

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

const insertTicketsImageTest = async (isImport, isView) => {
	const teamspace = generateRandomString();
	const project = generateRandomString();
	const model = generateRandomString();
	const imageTestData = generateImageTestData(false, isView, isImport ? 10 : 1);
	const tickets = [];
	const expectedOutput = imageTestData.data.map(({ ticket }) => {
		tickets.push(ticket);
		const _id = generateRandomString();
		return { ...ticket, _id };
	});

	TicketsModel.addTicketsWithTemplate.mockResolvedValueOnce(expectedOutput);
	TemplatesModel.generateFullSchema.mockImplementationOnce((t) => t);

	if (isImport) {
		await expect(Tickets.importTickets(teamspace, project, model, imageTestData.template,
			tickets)).resolves.toEqual(expectedOutput.map(({ _id }) => _id));
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

	expect(EventsManager.publish).toHaveBeenCalledTimes(1);
	if (isImport) {
		expect(EventsManager.publish).toHaveBeenCalledWith(events.TICKETS_IMPORTED,
			{ teamspace,
				project,
				model,
				tickets: expectedOutput });
	} else {
		expect(EventsManager.publish).toHaveBeenCalledWith(events.NEW_TICKET,
			{ teamspace,
				project,
				model,
				ticket: expectedOutput[0] });
	}
};

const updateImagesTestHelper = async (updateMany, isView) => {
	const teamspace = generateRandomString();
	const project = generateRandomString();
	const model = generateRandomString();
	const author = generateRandomString();
	const nTickets = updateMany ? 10 : 1;

	TemplatesModel.generateFullSchema.mockImplementationOnce((t) => t);
	const response = [];

	const imageTestData = generateImageTestData(true, isView, nTickets);

	const tickets = [];

	const fileEntries = [];
	const updateData = times(nTickets, (i) => {
		const updatePropBuffer = Buffer.from(generateRandomString());
		const updateModPropBuffer = Buffer.from(generateRandomString());
		tickets.push(imageTestData.data[i].ticket);
		response.push({ ...generateRandomObject(), changes: generateRandomObject() });

		return {
			properties: {
				[imageTestData.propName]: generatePropData(updatePropBuffer, isView),
			},
			modules: {
				[imageTestData.moduleName]: {
					[imageTestData.propName]: generatePropData(updateModPropBuffer, isView),
				},
			},
		};
	});

	if (updateMany) {
		TicketsModel.updateManyTickets.mockResolvedValueOnce(response);
	} else {
		TicketsModel.updateTicket.mockResolvedValueOnce(response[0]);
	}

	if (updateMany) {
		await expect(Tickets.updateManyTickets(teamspace, project, model, imageTestData.template,
			cloneDeep(tickets), cloneDeep(updateData), author)).resolves.toBeUndefined();
	} else {
		await expect(Tickets.updateTicket(teamspace, project, model, imageTestData.template,
			cloneDeep(tickets[0]), cloneDeep(updateData[0]), author)).resolves.toBeUndefined();
	}

	const processedTickets = updateMany ? TicketsModel.updateManyTickets.mock.calls[0][4]
		: [TicketsModel.updateTicket.mock.calls[0][4]];

	const expectedUpdateData = processedTickets.map(({ properties, modules }, i) => {
		let propRef;
		let modPropRef;
		let propBuffer;
		let modPropBuffer;
		let oldPropRef;
		let oldModPropRef;

		if (isView) {
			propRef = properties[imageTestData.propName].screenshot;
			modPropRef = modules[imageTestData.moduleName][imageTestData.propName].screenshot;

			propBuffer = updateData[i].properties[imageTestData.propName].screenshot;
			modPropBuffer = updateData[i].modules[imageTestData.moduleName][imageTestData.propName].screenshot;

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
		fileEntries.push({ ticket: tickets[i]._id, ref: propRef, buffer: propBuffer, oldRef: oldPropRef });
		fileEntries.push({ ticket: tickets[i]._id, ref: modPropRef, buffer: modPropBuffer, oldRef: oldModPropRef });

		return {
			properties: { [imageTestData.propName]: generatePropData(propRef, isView) },
			modules: {
				[imageTestData.moduleName]: {
					[imageTestData.propName]: generatePropData(modPropRef, isView),
				},
			},
		};
	});

	if (updateMany) {
		expect(TicketsModel.updateManyTickets).toHaveBeenCalledTimes(1);
		expect(TicketsModel.updateManyTickets).toHaveBeenCalledWith(teamspace, project, model, tickets,
			expectedUpdateData, author);
	} else {
		expect(TicketsModel.updateTicket).toHaveBeenCalledTimes(1);
		expect(TicketsModel.updateTicket).toHaveBeenCalledWith(teamspace, project, model, tickets[0],
			expectedUpdateData[0], author);
	}

	expect(TemplatesModel.generateFullSchema).toHaveBeenCalledTimes(1);
	expect(TemplatesModel.generateFullSchema).toHaveBeenCalledWith(imageTestData.template);

	expect(FilesManager.storeFile).toHaveBeenCalledTimes(fileEntries.length);
	expect(FilesManager.removeFile).toHaveBeenCalledTimes(fileEntries.length);

	fileEntries.forEach(({ ticket, ref, buffer, oldRef }) => {
		const meta = { teamspace, project, model, ticket };
		expect(FilesManager.storeFile).toHaveBeenCalledWith(
			teamspace, TICKETS_RESOURCES_COL, ref, buffer, meta,
		);
		expect(FilesManager.removeFile).toHaveBeenCalledWith(
			teamspace, TICKETS_RESOURCES_COL, oldRef,
		);
	});

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
		test('should be extracted and replaced with a group UUID', async () => {
			const teamspace = generateRandomString();
			const project = generateRandomString();
			const model = generateRandomString();

			const testData = generateGroupsTestData(false, isImport ? 10 : 1);

			const expectedOutput = testData.tickets.map((tickets) => ({ ...tickets, _id: generateUUID() }));

			TicketsModel.addTicketsWithTemplate.mockResolvedValueOnce(expectedOutput);
			TemplatesModel.generateFullSchema.mockImplementationOnce((t) => t);

			if (isImport) {
				await expect(Tickets.importTickets(teamspace, project, model, testData.template,
					testData.tickets)).resolves.toEqual(expectedOutput.map(({ _id }) => _id));
			} else {
				await expect(Tickets.addTicket(teamspace, project, model, testData.template,
					testData.tickets[0])).resolves.toEqual(expectedOutput[0]._id);
			}

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
			expect(EventsManager.publish).toHaveBeenCalledTimes(1);
			if (isImport) {
				expect(EventsManager.publish).toHaveBeenCalledWith(events.TICKETS_IMPORTED,
					{ teamspace,
						project,
						model,
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
			TemplatesModel.generateFullSchema.mockImplementationOnce((t) => t);
			if (updateMany) TicketsModel.updateManyTickets.mockResolvedValueOnce(response);
			else TicketsModel.updateTicket.mockResolvedValueOnce(response[0]);
			if (updateMany) {
				await expect(Tickets.updateManyTickets(teamspace, project, model, template,
					tickets, toUpdate)).resolves.toBeUndefined();
			} else {
				await expect(Tickets.updateTicket(teamspace, project, model, template,
					tickets[0], toUpdate[0])).resolves.toBeUndefined();
			}

			if (updateMany) {
				expect(TicketsModel.updateManyTickets).toHaveBeenCalledTimes(1);
				expect(TicketsModel.updateManyTickets).toHaveBeenCalledWith(teamspace, project, model,
					tickets, expect.any(Object), undefined);
			} else {
				expect(TicketsModel.updateTicket).toHaveBeenCalledTimes(1);
				expect(TicketsModel.updateTicket).toHaveBeenCalledWith(teamspace, project, model,
					tickets[0], expect.any(Object), undefined);
			}

			const processedTickets = updateMany ? TicketsModel.updateManyTickets.mock.calls[0][4]
				: [TicketsModel.updateTicket.mock.calls[0][4]];

			const groupsCreated = [];
			const groupsRemoved = [];
			processedTickets.forEach(({ properties, modules }, i) => {
				const propData = properties?.[propName] || {};
				const modPropData = modules?.[moduleName]?.[propName] || {};

				const oldPropData = properties?.[propName] === null || Object.keys(propData).length
					? tickets[i].properties[propName] || {} : {};
				const oldModPropData = modules?.[moduleName]?.[propName] === null || Object.keys(modPropData).length
					? tickets[i].modules[moduleName][propName] || {} : {};
				const newGroups = [];

				const existingGroups = new Set();

				[oldPropData, oldModPropData].forEach(({ state = {} } = {}) => {
					Object.keys(state).forEach((key) => {
						state[key].forEach(({ group }) => {
							expect(isUUID(group)).toBeTruthy();
							existingGroups.add(UUIDToString(group));
						});
					});
				});

				[propData, modPropData].forEach(({ state = {} }) => {
					Object.keys(state).forEach((key) => {
						state[key].forEach(({ group }) => {
							expect(isUUID(group)).toBeTruthy();
							if (existingGroups.has(UUIDToString(group))) {
								existingGroups.delete(UUIDToString(group));
							} else {
								newGroups.push(group);
							}
						});
					});
				});

				const removedGroups = Array.from(existingGroups).map(stringToUUID);

				if (removedGroups.length) groupsRemoved.push({ removedGroups, ticket: tickets[i]._id });
				if (newGroups.length) groupsCreated.push({ newGroups, ticket: tickets[i]._id });
			});

			expect(TemplatesModel.generateFullSchema).toHaveBeenCalledTimes(1);
			expect(TemplatesModel.generateFullSchema).toHaveBeenCalledWith(template);

			if (groupsCreated.length) {
				expect(TicketGroupsModel.addGroups).toHaveBeenCalledTimes(groupsCreated.length);
				groupsCreated.forEach(({ ticket }) => {
					expect(TicketGroupsModel.addGroups).toHaveBeenCalledWith(teamspace, project, model,
						ticket, expect.any(Array));
				});

				TicketGroupsModel.addGroups.mock.calls.forEach(([,,, ticket, groupData]) => {
					const groupIDsToSave = groupData.map(({ _id }) => _id);
					const newGroupsEntry = groupsCreated.find(({ ticket: id }) => ticket === id);

					expect(newGroupsEntry).not.toBeUndefined();

					expect(groupIDsToSave.length).toBe(newGroupsEntry.newGroups.length);
					expect(groupIDsToSave).toEqual(expect.arrayContaining(newGroupsEntry.newGroups));
				});
			} else {
				expect(TicketGroupsModel.addGroups).not.toHaveBeenCalled();
			}

			if (groupsRemoved.length) {
				expect(TicketGroupsModel.deleteGroups).toHaveBeenCalledTimes(groupsRemoved.length);
				groupsRemoved.forEach(({ ticket, removedGroups }) => {
					expect(TicketGroupsModel.deleteGroups).toHaveBeenCalledWith(teamspace, project, model,
						ticket, removedGroups);
				});
			} else {
				expect(TicketGroupsModel.deleteGroups).not.toHaveBeenCalled();
			}

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

		test('Old groups are removed when the state is deleted', async () => {
			const { template, tickets, propName, moduleName } = generateGroupsTestData(true, nTickets);

			const response = [];

			const toUpdate = times(nTickets, () => {
				const data = {
					properties: {
						[propName]: null,
					},
					modules: {
						[moduleName]: {
							[propName]: null,
						},
					},
				};

				response.push({ ...generateRandomObject(), changes: generateRandomObject() });

				return data;
			});
			await runTest(response, template, tickets, propName, moduleName, toUpdate);
		});

		test('Old groups are removed if they are no longer referenced and new groups should be added', async () => {
			const { template, tickets, propName, moduleName } = generateGroupsTestData(true, nTickets);

			const response = [];

			const toUpdate = times(nTickets, (i) => {
				const updatedPropData = cloneDeep(tickets[i].properties[propName]);
				const updatedModPropData = cloneDeep(tickets[i].modules[moduleName][propName]);

				Object.keys(updatedPropData.state).forEach((key) => {
					const groupArr = updatedPropData.state[key];

					groupArr[0].group = generateGroup(true, { hasId: false });
				});

				Object.keys(updatedModPropData.state).forEach((key) => {
					const groupArr = updatedModPropData.state[key];

					groupArr[0].group = generateGroup(true, { hasId: false });
				});

				const data = {
					properties: {
						[propName]: updatedPropData,
					},
					modules: {
						[moduleName]: {
							[propName]: updatedModPropData,
						},
					},
				};

				response.push({ ...generateRandomObject(), changes: generateRandomObject() });

				return data;
			});

			TicketGroupsModel.getGroupsByIds.mockImplementation(
				(ts, proj, mod, ticket, ids) => Promise.resolve(ids.map(
					(_id) => ({ _id }))));

			await runTest(response, template, tickets, propName, moduleName, toUpdate);
		});

		test('Old groups are retained if the update doesn\'t update the field', async () => {
			const { template, tickets, propName, moduleName } = generateGroupsTestData(true, nTickets);

			const response = [];

			const toUpdate = times(nTickets, (i) => {
				const updatedPropData = cloneDeep(tickets[i].properties[propName]);

				Object.keys(updatedPropData.state).forEach((key) => {
					const groupArr = updatedPropData.state[key];
					groupArr[0].group = generateGroup(true, { hasId: false });
				});

				const data = {
					properties: {
						[propName]: updatedPropData,
					},
				};
				response.push({ ...generateRandomObject(), changes: generateRandomObject() });
				return data;
			});

			TicketGroupsModel.getGroupsByIds.mockImplementation(
				(ts, proj, mod, ticket, ids) => Promise.resolve(ids.map(
					(_id) => ({ _id }))));

			await runTest(response, template, tickets, propName, moduleName, toUpdate);
		});

		test('Throw an error if retained groups contains group ids that does not exist', async () => {
			const testData = generateGroupsTestData(true, nTickets);

			const toUpdate = times(nTickets, (i) => {
				const updatedPropData = cloneDeep(testData.tickets[i].properties[testData.propName]);
				const updatedModPropData = cloneDeep(testData.tickets[i]
					.modules[testData.moduleName][testData.propName]);

				Object.keys(updatedPropData.state).forEach((key) => {
					const groupArr = updatedPropData.state[key];

					groupArr[0].group = generateGroup(true, { hasId: false });
				});

				Object.keys(updatedModPropData.state).forEach((key) => {
					const groupArr = updatedModPropData.state[key];

					groupArr[0].group = generateGroup(true, { hasId: false });
				});

				return {
					properties: {
						[testData.propName]: updatedPropData,
					},
					modules: {
						[testData.moduleName]: {
							[testData.propName]: updatedModPropData,
						},
					},
				};
			});

			TicketGroupsModel.getGroupsByIds.mockImplementation(
				(ts, proj, mod, ticket, ids) => Promise.resolve([{ _id: ids[0] }]));

			TemplatesModel.generateFullSchema.mockImplementationOnce((t) => t);

			if (updateMany) {
				await expect(Tickets.updateManyTickets(teamspace, project, model, testData.template,
					testData.tickets, toUpdate)).rejects.toEqual(
					expect.objectContaining({ code: templates.invalidArguments.code }));
			} else {
				await expect(Tickets.updateTicket(teamspace, project, model, testData.template,
					testData.tickets[0], toUpdate[0])).rejects.toEqual(
					expect.objectContaining({ code: templates.invalidArguments.code }));
			}

			expect(EventsManager.publish).not.toHaveBeenCalled();
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

		const expectedOutput = tickets.map((ticketData) => ({ ...ticketData, _id: generateRandomString() }));

		TicketsModel.addTicketsWithTemplate.mockResolvedValueOnce(expectedOutput);
		TemplatesModel.generateFullSchema.mockImplementationOnce((t) => t);

		if (isImport) {
			await expect(Tickets.importTickets(teamspace, project, model, template, tickets))
				.resolves.toEqual(expectedOutput.map(({ _id }) => _id));
		} else {
			await expect(Tickets.addTicket(teamspace, project, model, template, tickets[0]))
				.resolves.toEqual(expectedOutput[0]._id);
		}

		expect(TemplatesModel.generateFullSchema).toHaveBeenCalledTimes(1);
		expect(TemplatesModel.generateFullSchema).toHaveBeenCalledWith(template);

		expect(TicketsModel.addTicketsWithTemplate).toHaveBeenCalledTimes(1);
		expect(TicketsModel.addTicketsWithTemplate).toHaveBeenCalledWith(teamspace, project, model,
			template._id, tickets);

		expect(FilesManager.storeFile).not.toHaveBeenCalled();
		expect(CommentsProcessor.importComments).not.toHaveBeenCalled();

		expect(EventsManager.publish).toHaveBeenCalledTimes(1);
		if (isImport) {
			expect(EventsManager.publish).toHaveBeenCalledWith(events.TICKETS_IMPORTED,
				{ teamspace,
					project,
					model,
					tickets: expectedOutput });
		} else {
			expect(EventsManager.publish).toHaveBeenCalledWith(events.NEW_TICKET,
				{ teamspace,
					project,
					model,
					ticket: expectedOutput[0] });
		}
	});

	test('should process images and store refs', () => insertTicketsImageTest(isImport));
	test('should process screenshots from view data and store refs', () => insertTicketsImageTest(isImport, true));

	insertTicketsGroupTests();
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
				TemplatesModel.generateFullSchema.mockImplementationOnce((t) => t);

				await expect(Tickets.importTickets(teamspace, project, model, template, tickets, author))
					.resolves.toEqual(expectedOutput.map(({ _id }) => _id));

				expect(TemplatesModel.generateFullSchema).toHaveBeenCalledTimes(1);
				expect(TemplatesModel.generateFullSchema).toHaveBeenCalledWith(template);

				expect(TicketsModel.addTicketsWithTemplate).toHaveBeenCalledTimes(1);
				expect(TicketsModel.addTicketsWithTemplate).toHaveBeenCalledWith(teamspace, project, model,
					template._id, tickets.map(({ comments, ...others }) => others));

				expect(FilesManager.storeFile).not.toHaveBeenCalled();

				expect(EventsManager.publish).toHaveBeenCalledTimes(1);
				expect(EventsManager.publish).toHaveBeenCalledWith(events.TICKETS_IMPORTED,
					{ teamspace,
						project,
						model,
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
			TemplatesModel.generateFullSchema.mockImplementationOnce((t) => t);
			const response = generateRandomObject();
			TicketsModel.updateTicket.mockResolvedValueOnce(response);

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

			expect(EventsManager.publish).toHaveBeenCalledTimes(1);
			expect(EventsManager.publish).toHaveBeenCalledWith(events.UPDATE_TICKET,
				{ teamspace,
					project,
					model,
					...response });
		});

		test('should process image and store a ref', () => updateImagesTestHelper(false));
		test('!!!should process screenshot from view data and store a ref', () => updateImagesTestHelper(false, true));

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
			TemplatesModel.generateFullSchema.mockReset();
			TemplatesModel.generateFullSchema.mockImplementationOnce((t) => t);
			TicketsModel.updateManyTickets.mockResolvedValueOnce(response);

			await expect(Tickets.updateManyTickets(teamspace, project, model, template, tickets,
				updateData, author))
				.resolves.toBeUndefined();

			expect(TicketsModel.updateManyTickets).toHaveBeenCalledTimes(1);
			expect(TicketsModel.updateManyTickets).toHaveBeenCalledWith(teamspace, project, model, tickets,
				updateData, author);
			expect(TemplatesModel.generateFullSchema).toHaveBeenCalledTimes(1);
			expect(TemplatesModel.generateFullSchema).toHaveBeenCalledWith(template);

			expect(FilesManager.storeFile).not.toHaveBeenCalled();
			expect(FilesManager.removeFile).not.toHaveBeenCalled();

			expect(EventsManager.publish).toHaveBeenCalledTimes(ticketCount);
			response.forEach((res) => {
				expect(EventsManager.publish).toHaveBeenCalledWith(events.UPDATE_TICKET,
					{ teamspace,
						project,
						model,
						...res });
			});
		});

		test('should process image and store a ref', () => updateImagesTestHelper(true));
		test('should process screenshot from view data and store a ref', () => updateImagesTestHelper(true, true));

		updateGroupTestsHelper(true);

		describe('Update tickets with comments', () => {
			test('should call importComments if there are comments', async () => {
				const updateData = [];
				const response = [];

				const tickets = times(ticketCount, () => {
					updateData.push({
						title: generateRandomString(),
						properties: {},
						comments: times(ticketCount, generateRandomObject) });

					response.push({ ...generateRandomObject(), changes: generateRandomObject() });
					return generateTicket(template);
				});

				TemplatesModel.generateFullSchema.mockReset();
				TemplatesModel.generateFullSchema.mockImplementationOnce((t) => t);
				TicketsModel.updateManyTickets.mockResolvedValueOnce(response);

				await expect(Tickets.updateManyTickets(teamspace, project, model, template, tickets,
					updateData, author))
					.resolves.toBeUndefined();

				expect(TicketsModel.updateManyTickets).toHaveBeenCalledTimes(1);
				expect(TicketsModel.updateManyTickets).toHaveBeenCalledWith(teamspace, project, model, tickets,
					updateData.map(({ comments, ...others }) => others), author);
				expect(TemplatesModel.generateFullSchema).toHaveBeenCalledTimes(1);
				expect(TemplatesModel.generateFullSchema).toHaveBeenCalledWith(template);

				expect(FilesManager.storeFile).not.toHaveBeenCalled();
				expect(FilesManager.removeFile).not.toHaveBeenCalled();

				expect(EventsManager.publish).toHaveBeenCalledTimes(ticketCount);
				response.forEach((res) => {
					expect(EventsManager.publish).toHaveBeenCalledWith(events.UPDATE_TICKET,
						{ teamspace,
							project,
							model,
							...res });
				});

				expect(CommentsProcessor.importComments).toHaveBeenCalledTimes(tickets.length);
				tickets.forEach(({ _id }, i) => {
					expect(CommentsProcessor.importComments).toHaveBeenCalledWith(teamspace, project, model, _id,
						updateData[i].comments, author);
				});
			});

			test(`should not trigger ${events.UPDATE_TICKET} events if there are only comments update`, async () => {
				const updateData = [];
				const response = [];

				const tickets = times(ticketCount, () => {
					updateData.push({
						properties: {},
						comments: times(ticketCount, generateRandomObject) });

					response.push({ ...generateRandomObject(), changes: {} });
					return generateTicket(template);
				});

				TemplatesModel.generateFullSchema.mockReset();
				TemplatesModel.generateFullSchema.mockImplementationOnce((t) => t);
				TicketsModel.updateManyTickets.mockResolvedValueOnce(response);

				await expect(Tickets.updateManyTickets(teamspace, project, model, template, tickets,
					updateData, author))
					.resolves.toBeUndefined();

				expect(TicketsModel.updateManyTickets).toHaveBeenCalledTimes(1);
				expect(TicketsModel.updateManyTickets).toHaveBeenCalledWith(teamspace, project, model, tickets,
					updateData.map(({ comments, ...others }) => others), author);
				expect(TemplatesModel.generateFullSchema).toHaveBeenCalledTimes(1);
				expect(TemplatesModel.generateFullSchema).toHaveBeenCalledWith(template);

				expect(FilesManager.storeFile).not.toHaveBeenCalled();
				expect(FilesManager.removeFile).not.toHaveBeenCalled();

				expect(EventsManager.publish).not.toHaveBeenCalled();

				expect(CommentsProcessor.importComments).toHaveBeenCalledTimes(tickets.length);
				tickets.forEach(({ _id }, i) => {
					expect(CommentsProcessor.importComments).toHaveBeenCalledWith(teamspace, project, model, _id,
						updateData[i].comments, author);
				});
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
	testUpdateManyTickets();
	testGetTicketList();
});
