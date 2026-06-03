/**
 *  Copyright (C) 2026 3D Repo Ltd
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

const { determineTestGroup } = require('../../../../../../helper/utils');
const { src } = require('../../../../../../helper/path');
const { generateRandomString, generateUUIDString } = require('../../../../../../helper/services');

jest.mock('../../../../../../../../src/v5/models/tickets');
const TicketsModel = require(`${src}/models/tickets`);

jest.mock('../../../../../../../../src/v5/models/modelSettings');
const ModelSettingsModel = require(`${src}/models/modelSettings`);

jest.mock('../../../../../../../../src/v5/schemas/tickets');
const TicketSchema = require(`${src}/schemas/tickets`);

jest.mock('../../../../../../../../src/v5/processors/teamspaces/projects/models/commons/tickets.groups');
const TicketsGroups = require(`${src}/processors/teamspaces/projects/models/commons/tickets.groups`);

jest.mock('../../../../../../../../src/v5/processors/teamspaces/projects/models/commons/scenes');
const Scenes = require(`${src}/processors/teamspaces/projects/models/commons/scenes`);

jest.mock('../../../../../../../../src/v5/services/eventsManager/eventsManager');
const EventsManager = require(`${src}/services/eventsManager/eventsManager`);
const { events } = require(`${src}/services/eventsManager/eventsManager.constants`);

const TicketsClashes = require(`${src}/processors/teamspaces/projects/models/commons/tickets.clashes`);

const {
	basePropertyLabels,
	idTypeLabels,
	modulePropertyLabels,
	presetModules,
	statuses,
	statusTypes,
	viewGroups,
} = require(`${src}/schemas/tickets/templates.constants`);
const { CLASH_TYPES, clashObjectIdTypes } = require(`${src}/models/clashes.constants`);
const { convertArrayUnits, units } = require(`${src}/utils/helper/units`);
const { CameraType } = require(`${src}/schemas/tickets/validators`);
const { stringToUUID } = require(`${src}/utils/helper/uuids`);

const { CLOUD_CLASH } = presetModules;
const {
	CLASH_ID,
	CLASH_PLAN_ID,
	CLASH_PLAN_NAME,
	CLASH_RUN_ID,
	CLASH_TYPE,
	DISTANCE_M,
	OBJECT_A_ID,
	OBJECT_A_ID_TYPE,
	OBJECT_B_ID,
	OBJECT_B_ID_TYPE,
} = modulePropertyLabels[CLOUD_CLASH];
const { DEFAULT_VIEW, PIN, STATUS } = basePropertyLabels;

const getTemplate = (defaultStatus = generateRandomString(), doneStatuses = []) => ({
	_id: generateUUIDString(),
	name: generateRandomString(),
	code: generateRandomString(3),
	config: {
		status: {
			values: [
				{ name: defaultStatus, type: statusTypes.OPEN },
				{ name: generateRandomString(), type: statusTypes.OPEN },
				...doneStatuses.map((name) => ({ name, type: statusTypes.DONE })),
			],
			default: defaultStatus,
		},
	},
	properties: [],
	modules: [{ type: CLOUD_CLASH, properties: [] }],
});

const getTemplateWithoutCustomStatus = () => ({
	_id: generateUUIDString(),
	name: generateRandomString(),
	code: generateRandomString(3),
	properties: [],
	modules: [{ type: CLOUD_CLASH, properties: [] }],
});

const getClash = (index = generateRandomString()) => ({
	index,
	a: { container: generateUUIDString(), idType: clashObjectIdTypes.INTERNAL, id: generateUUIDString() },
	b: { container: generateUUIDString(), idType: clashObjectIdTypes.IFC, id: generateRandomString(22) },
	positions: [
		[1, 2, 3],
		[4, 6, 3],
	],
});

const getContext = () => ({
	planId: generateUUIDString(),
	planName: generateRandomString(),
	runId: generateUUIDString(),
	clashType: CLASH_TYPES.HARD,
	creator: generateRandomString(),
	selectionA: { container: generateUUIDString(), revision: generateUUIDString() },
	selectionB: { container: generateUUIDString(), revision: generateUUIDString() },
});

const getProcessOptions = (context, tickets = {}) => ({
	runId: context.runId,
	plan: {
		_id: context.planId,
		name: context.planName,
		type: context.clashType,
		selectionA: context.selectionA,
		selectionB: context.selectionB,
		tickets: {
			creator: context.creator,
			...tickets,
		},
	},
});

const getCloudClashData = (clash, context, distance) => ({
	[CLASH_PLAN_ID]: context.planId,
	[CLASH_RUN_ID]: context.runId,
	[CLASH_ID]: clash.index,
	[CLASH_PLAN_NAME]: context.planName,
	[CLASH_TYPE]: context.clashType,
	[DISTANCE_M]: distance,
	[OBJECT_A_ID_TYPE]: '3D Repo ID',
	[OBJECT_A_ID]: clash.a.id,
	[OBJECT_B_ID_TYPE]: 'IFC',
	[OBJECT_B_ID]: clash.b.id,
});

const getCloudClashUpdateData = (distance) => ({
	[DISTANCE_M]: distance,
});

const createViewpoint = ({ min, max }) => {
	const fov = 60 * 0.0174533;
	const dim = min.map((value, i) => max[i] - value);
	const magnitude = Math.sqrt(dim.reduce((sum, value) => sum + value ** 2, 0));
	const distance = magnitude / Math.tan(fov / 2);
	const center = min.map((value, i) => (value + max[i]) / 2);
	const forward = [0.7455270290374756, -0.4472627639770508, -0.49411076307296753];

	return {
		position: center.map((value, i) => value - forward[i] * distance),
		up: [0.3728146553039551, 0.8944026231765747, -0.2470894455909729],
		forward,
		type: CameraType.PERSPECTIVE,
	};
};

describe(determineTestGroup(__filename), () => {
	const teamspace = generateRandomString();
	const project = generateRandomString();
	const federation = generateUUIDString();

	beforeEach(() => {
		jest.clearAllMocks();
		TicketsModel.addTicketsWithTemplate.mockImplementation((...args) => {
			const tickets = args[4];
			return Promise.resolve(tickets.map((ticket) => ({ ...ticket, _id: generateUUIDString() })));
		});
		TicketsModel.updateTickets.mockResolvedValue([]);
		ModelSettingsModel.getFederationById.mockResolvedValue({ properties: { unit: units.MM } });
		Scenes.getMeshesWithParentIds.mockImplementation((ts, p, container, revision, ids) => Promise.resolve(ids));
		TicketsGroups.commitGroupChanges.mockResolvedValue();
		TicketsGroups.processGroupsUpdate.mockImplementation((oldData, newData, fields, groupsState) => {
			fields.forEach((fieldName) => {
				const [, groupType] = fieldName.split('.');
				newData?.state?.[groupType]?.forEach((entry) => {
					groupsState.toAdd.push(entry.group);
				});
			});
		});
		const mockValidation = (t, p, m, tem, tickets, { existingData, processValidatedData = true } = {}) => (
			Promise.resolve(tickets.map((ticket, i) => ({
				newTicket: processValidatedData && !existingData?.[i] ? { ...ticket, type: tem._id } : ticket,
				...(processValidatedData ? { existingData: existingData?.[i] } : {}),
			})))
		);
		TicketSchema.validateTickets.mockImplementation(mockValidation);
	});

	test('Should create tickets for new clashes', async () => {
		const template = getTemplate();
		const clash = getClash(generateRandomString());
		const context = getContext();
		const customModule = generateRandomString();
		const customProperty = generateRandomString();
		const customValue = generateRandomString();
		const customCloudClashProperty = generateRandomString();
		const customCloudClashValue = generateRandomString();
		const priority = generateRandomString();
		const defaultClashId = generateRandomString();
		const status = generateRandomString();
		const results = { new: [clash], active: [], resolved: [] };
		template.config.status.values.push({ name: status, type: statusTypes.OPEN });

		TicketsModel.getTicketsByQuery.mockResolvedValueOnce([]);

		await TicketsClashes.processClashResults(teamspace, project, federation, template, results,
			getProcessOptions(context, {
				valuesAtCreation: [
					{ property: basePropertyLabels.PRIORITY, value: priority },
					{ module: customModule, property: customProperty, value: customValue },
					{ module: CLOUD_CLASH, property: CLASH_ID, value: defaultClashId },
					{ module: CLOUD_CLASH, property: customCloudClashProperty, value: customCloudClashValue },
				],
				defaultStatuses: { onNew: status },
			}));

		const expectedTicket = {
			title: `[${context.planName}] Clash`,
			properties: {
				[basePropertyLabels.PRIORITY]: priority,
				[STATUS]: status,
			},
			modules: {
				[customModule]: { [customProperty]: customValue },
				[CLOUD_CLASH]: {
					...getCloudClashData(clash, context, 0),
					[customCloudClashProperty]: customCloudClashValue,
				},
			},
		};
		const expectedSavedTicket = { ...expectedTicket, type: template._id };

		expect(TicketsModel.getTicketsByQuery).toHaveBeenCalledTimes(1);
		expect(TicketsModel.getTicketsByQuery).toHaveBeenCalledWith(teamspace, project, federation, {
			type: template._id,
			[`modules.${CLOUD_CLASH}.${CLASH_PLAN_ID}`]: context.planId,
		}, {
			_id: 1,
			[`properties.${DEFAULT_VIEW}`]: 1,
			[`properties.${PIN}`]: 1,
			[`properties.${STATUS}`]: 1,
			[`modules.${CLOUD_CLASH}`]: 1,
		});

		expect(TicketSchema.validateTickets).toHaveBeenCalledTimes(5);
		expect(TicketSchema.validateTickets).toHaveBeenNthCalledWith(1, teamspace, project, federation, template,
			[{
				properties: {
					[basePropertyLabels.PRIORITY]: priority,
					[STATUS]: status,
				},
				modules: {},
			}],
			{ existingData: [{}], processValidatedData: false });
		expect(TicketSchema.validateTickets).toHaveBeenNthCalledWith(5, teamspace, project, federation, template,
			[expectedTicket], { author: context.creator });
		expect(TicketsModel.addTicketsWithTemplate).toHaveBeenCalledTimes(1);
		expect(TicketsModel.addTicketsWithTemplate).toHaveBeenCalledWith(teamspace, project,
			federation, template._id, [expectedSavedTicket]);
		expect(EventsManager.publish).toHaveBeenCalledTimes(1);
		expect(EventsManager.publish).toHaveBeenCalledWith(events.TICKETS_IMPORTED,
			{
				teamspace,
				project,
				model: federation,
				tickets: expect.arrayContaining([expect.objectContaining(expectedSavedTicket)]),
				author: context.creator,
			});
		expect(TicketsModel.updateTickets).not.toHaveBeenCalled();
	});

	test('Should calculate the distance for new clearance clash tickets', async () => {
		const template = getTemplate();
		const clash = getClash(generateRandomString());
		const context = { ...getContext(), clashType: CLASH_TYPES.CLEARANCE };
		const results = { new: [clash], active: [], resolved: [] };

		TicketsModel.getTicketsByQuery.mockResolvedValueOnce([]);

		await TicketsClashes.processClashResults(teamspace, project, federation, template, results,
			getProcessOptions(context));

		const createdTickets = TicketsModel.addTicketsWithTemplate.mock.calls[0][4];
		expect(createdTickets[0].modules[CLOUD_CLASH]).toEqual(getCloudClashData(clash, context, 0.005));
		expect(TicketsModel.updateTickets).not.toHaveBeenCalled();
	});

	test.each(Object.values(units))(
		'Should convert clash positions from mm to federation units for %s federation pins',
		async (unit) => {
			const template = getTemplate();
			const clash = getClash(generateRandomString());
			const context = getContext();
			const results = { new: [clash], active: [], resolved: [] };
			template.config.pin = true;

			ModelSettingsModel.getFederationById.mockResolvedValueOnce({ properties: { unit } });
			TicketsModel.getTicketsByQuery.mockResolvedValueOnce([]);

			await TicketsClashes.processClashResults(teamspace, project, federation, template, results,
				getProcessOptions(context));

			const createdTickets = TicketsModel.addTicketsWithTemplate.mock.calls[0][4];
			expect(createdTickets[0].properties[PIN]).toEqual(convertArrayUnits(clash.positions[0], units.MM, unit));
		},
	);

	test('Should set the default pin from the clash position for new clash tickets if enabled', async () => {
		const template = getTemplate();
		const clash = getClash(generateRandomString());
		const context = getContext();
		const unit = units.M;
		const results = { new: [clash], active: [], resolved: [] };
		template.config.pin = true;

		ModelSettingsModel.getFederationById.mockResolvedValueOnce({ properties: { unit } });
		TicketsModel.getTicketsByQuery.mockResolvedValueOnce([]);

		await TicketsClashes.processClashResults(teamspace, project, federation, template, results,
			getProcessOptions(context));

		const clashPoint = convertArrayUnits(clash.positions[0], units.MM, unit);
		const createdTicket = TicketsModel.addTicketsWithTemplate.mock.calls[0][4][0];
		expect(createdTicket.properties[PIN]).toEqual(clashPoint);
	});

	test('Should create object override groups in the default view for new clash tickets if enabled', async () => {
		const template = getTemplate();
		const clash = getClash(generateRandomString());
		const context = getContext();
		const savedTicketId = generateUUIDString();
		const meshIds = [generateUUIDString(), generateUUIDString()];
		const results = { new: [clash], active: [], resolved: [] };
		template.config.defaultView = true;

		TicketsModel.getTicketsByQuery.mockResolvedValueOnce([]);
		TicketsModel.addTicketsWithTemplate.mockResolvedValueOnce([{ _id: savedTicketId }]);
		Scenes.getMeshesWithParentIds.mockResolvedValueOnce(meshIds);

		await TicketsClashes.processClashResults(teamspace, project, federation, template, results,
			getProcessOptions(context));

		const expectedView = {
			state: {
				[viewGroups.COLORED]: [
					{
						group: {
							name: 'Object A',
							objects: [{
								container: clash.a.container,
								_ids: meshIds,
							}],
						},
						color: [255, 0, 0],
					},
					{
						group: {
							name: 'Object B',
							objects: [{
								container: clash.b.container,
								[clashObjectIdTypes.IFC]: [clash.b.id],
							}],
						},
						color: [0, 255, 0],
					},
				],
			},
		};

		expect(TicketsGroups.processGroupsUpdate).toHaveBeenCalledTimes(1);
		expect(Scenes.getMeshesWithParentIds).toHaveBeenCalledTimes(1);
		expect(Scenes.getMeshesWithParentIds).toHaveBeenCalledWith(teamspace, project, clash.a.container,
			context.selectionA.revision, [stringToUUID(clash.a.id)], true);
		expect(TicketsGroups.processGroupsUpdate).toHaveBeenCalledWith(undefined, expectedView,
			Object.values(viewGroups).map((groupName) => `state.${groupName}`),
			expect.objectContaining({
				old: expect.any(Set),
				stillUsed: expect.any(Set),
				toAdd: expect.any(Array),
			}));
		expect(TicketsGroups.commitGroupChanges).toHaveBeenCalledTimes(1);
		expect(TicketsGroups.commitGroupChanges).toHaveBeenCalledWith(teamspace, project, federation, savedTicketId,
			expect.objectContaining({ toAdd: expect.any(Array) }));
	});

	test('Should create a default view camera from the clash bounding box for new tickets if enabled', async () => {
		const template = getTemplate();
		const clash = getClash(generateRandomString());
		const context = getContext();
		const results = { new: [clash], active: [], resolved: [] };
		template.config.defaultView = true;
		clash.bbox = { min: [0, 0, 0], max: [10, 10, 10] };

		TicketsModel.getTicketsByQuery.mockResolvedValueOnce([]);

		await TicketsClashes.processClashResults(teamspace, project, federation, template, results,
			getProcessOptions(context));

		const createdTicket = TicketsModel.addTicketsWithTemplate.mock.calls[0][4][0];
		expect(createdTicket.properties[DEFAULT_VIEW].camera).toEqual(createViewpoint(clash.bbox));
	});

	test('Should create default view groups with revit ids for new clash tickets if enabled', async () => {
		const template = getTemplate();
		const clash = getClash(generateRandomString());
		const context = getContext();
		const revitId = 12345;
		const results = { new: [clash], active: [], resolved: [] };
		template.config.defaultView = true;
		clash.a = { container: generateUUIDString(), idType: clashObjectIdTypes.REVIT, id: String(revitId) };

		TicketsModel.getTicketsByQuery.mockResolvedValueOnce([]);

		await TicketsClashes.processClashResults(teamspace, project, federation, template, results,
			getProcessOptions(context));

		const defaultView = TicketsGroups.processGroupsUpdate.mock.calls[0][1];
		expect(defaultView.state[viewGroups.COLORED][0].group.objects).toEqual([{
			container: clash.a.container,
			[clashObjectIdTypes.REVIT]: [clash.a.id],
		}]);
	});

	test('Should use 3D Repo ID for unknown or missing clash id types', async () => {
		const template = getTemplate();
		const clash = getClash(generateRandomString());
		const context = getContext();
		const customIdType = generateRandomString();
		clash.a.idType = customIdType;
		delete clash.b.idType;
		const results = { new: [clash], active: [], resolved: [] };

		TicketsModel.getTicketsByQuery.mockResolvedValueOnce([]);

		await TicketsClashes.processClashResults(teamspace, project, federation, template, results,
			getProcessOptions(context));

		const cloudClashData = TicketsModel.addTicketsWithTemplate.mock.calls[0][4][0].modules[CLOUD_CLASH];
		expect(cloudClashData[OBJECT_A_ID_TYPE]).toEqual(idTypeLabels['3_D_REPO_ID']);
		expect(cloudClashData[OBJECT_B_ID_TYPE]).toEqual(idTypeLabels['3_D_REPO_ID']);
		expect(TicketsModel.updateTickets).not.toHaveBeenCalled();
	});

	test('Should handle empty results and missing ticket options', async () => {
		const template = getTemplate();
		const context = getContext();
		TicketsModel.getTicketsByQuery.mockResolvedValueOnce([{ modules: { [CLOUD_CLASH]: {} } }]);

		await TicketsClashes.processClashResults(teamspace, project, federation, template, {},
			{
				runId: context.runId,
				plan: {
					_id: context.planId,
					name: context.planName,
					type: context.clashType,
				},
			});

		expect(TicketsModel.addTicketsWithTemplate).not.toHaveBeenCalled();
		expect(TicketsModel.updateTickets).not.toHaveBeenCalled();
	});

	test('Should not create tickets when validation filters them out', async () => {
		const template = getTemplate();
		const clash = getClash(generateRandomString());
		const context = getContext();
		const results = { new: [clash], active: [], resolved: [] };

		TicketsModel.getTicketsByQuery.mockResolvedValueOnce([]);
		TicketSchema.validateTickets.mockResolvedValueOnce([]);

		await TicketsClashes.processClashResults(teamspace, project, federation, template, results,
			getProcessOptions(context));

		expect(TicketsModel.addTicketsWithTemplate).not.toHaveBeenCalled();
		expect(TicketsModel.updateTickets).not.toHaveBeenCalled();
	});

	test('Should drop invalid default values when creating tickets', async () => {
		const defaultStatus = generateRandomString();
		const template = getTemplate(defaultStatus);
		const clash = getClash(generateRandomString());
		const context = getContext();
		const priority = generateRandomString();
		const invalidProperty = generateRandomString();
		const results = { new: [clash], active: [], resolved: [] };

		TicketsModel.getTicketsByQuery.mockResolvedValueOnce([]);
		TicketSchema.validateTickets.mockImplementation((t, p, m, tem, tickets, options = {}) => {
			if (options.processValidatedData !== false) {
				return Promise.resolve(tickets.map((ticket) => ({ newTicket: { ...ticket, type: tem._id } })));
			}

			if (tickets[0].properties?.[invalidProperty]) return Promise.reject(new Error());
			return Promise.resolve(tickets.map((ticket) => ({ newTicket: ticket })));
		});

		await TicketsClashes.processClashResults(teamspace, project, federation, template, results,
			getProcessOptions(context, {
				valuesAtCreation: [
					{ property: basePropertyLabels.PRIORITY, value: priority },
					{ property: invalidProperty, value: generateRandomString() },
				],
				defaultStatuses: {},
			}));

		const createdTickets = TicketsModel.addTicketsWithTemplate.mock.calls[0][4];
		const [{ type, ...ticketBeforeValidation }] = createdTickets;
		expect(createdTickets[0].properties).toEqual({
			[basePropertyLabels.PRIORITY]: priority,
			[STATUS]: defaultStatus,
		});
		expect(TicketSchema.validateTickets).toHaveBeenCalledTimes(3);
		expect(TicketSchema.validateTickets).toHaveBeenLastCalledWith(teamspace, project, federation, template,
			[ticketBeforeValidation], { author: context.creator });
		expect(TicketsModel.addTicketsWithTemplate).toHaveBeenCalledWith(teamspace, project,
			federation, template._id, createdTickets);
	});

	test('Should update reopened clashes using the template default status', async () => {
		const defaultStatus = generateRandomString();
		const doneStatus = generateRandomString();
		const template = getTemplate(defaultStatus, [doneStatus]);
		const clash = getClash();
		const context = getContext();
		const existingTicket = {
			_id: generateUUIDString(),
			type: template._id,
			properties: { [STATUS]: doneStatus },
			modules: {
				[CLOUD_CLASH]: {
					[CLASH_ID]: clash.index,
				},
			},
		};
		const results = { new: [clash], active: [], resolved: [] };

		TicketsModel.getTicketsByQuery.mockResolvedValueOnce([existingTicket]);
		TicketsModel.getTicketsByQuery.mockResolvedValueOnce([existingTicket]);

		await TicketsClashes.processClashResults(teamspace, project, federation, template, results,
			getProcessOptions(context, {
				valuesAtCreation: [{ property: basePropertyLabels.PRIORITY, value: generateRandomString() }],
				defaultStatuses: {},
			}));

		const expectedUpdate = {
			properties: {
				[STATUS]: defaultStatus,
			},
			modules: {
				[CLOUD_CLASH]: getCloudClashUpdateData(0),
			},
		};
		expect(TicketSchema.validateTickets).toHaveBeenCalledTimes(2);
		expect(TicketSchema.validateTickets).toHaveBeenCalledWith(teamspace, project, federation, template,
			[expectedUpdate], { author: context.creator, existingData: [existingTicket] });
		expect(TicketsModel.updateTickets).toHaveBeenCalledTimes(1);
		expect(TicketsModel.updateTickets).toHaveBeenCalledWith(teamspace, project, federation,
			[existingTicket], [expectedUpdate], context.creator);
		expect(TicketsModel.addTicketsWithTemplate).not.toHaveBeenCalled();
	});

	test('Should update reopened clashes using the configured reopened status', async () => {
		const defaultStatus = generateRandomString();
		const doneStatus = generateRandomString();
		const reopenedStatus = generateRandomString();
		const template = getTemplate(defaultStatus, [doneStatus]);
		template.config.status.values.push({ name: reopenedStatus, type: statusTypes.OPEN });
		const clash = getClash();
		const context = getContext();
		const existingTicket = {
			_id: generateUUIDString(),
			type: template._id,
			properties: { [STATUS]: doneStatus },
			modules: {
				[CLOUD_CLASH]: {
					[CLASH_ID]: clash.index,
					[DISTANCE_M]: 0,
				},
			},
		};
		const results = { new: [clash], active: [], resolved: [] };

		TicketsModel.getTicketsByQuery.mockResolvedValueOnce([existingTicket]);
		TicketsModel.getTicketsByQuery.mockResolvedValueOnce([existingTicket]);

		await TicketsClashes.processClashResults(teamspace, project, federation, template, results,
			getProcessOptions(context, { defaultStatuses: { onReopened: reopenedStatus } }));

		const updateData = TicketsModel.updateTickets.mock.calls[0][4];
		expect(updateData[0]).toEqual({ properties: { [STATUS]: reopenedStatus } });
		expect(TicketsModel.updateTickets).toHaveBeenCalledWith(teamspace, project, federation,
			[existingTicket], updateData, context.creator);
		expect(TicketsModel.addTicketsWithTemplate).not.toHaveBeenCalled();
	});

	test('Should update active clashes without reopening tickets that are not closed', async () => {
		const defaultStatus = generateRandomString();
		const template = getTemplate(defaultStatus, [generateRandomString()]);
		const clash = getClash();
		const context = getContext();
		const existingTicket = {
			_id: generateUUIDString(),
			type: template._id,
			properties: { [STATUS]: defaultStatus },
			modules: {
				[CLOUD_CLASH]: {
					[CLASH_ID]: clash.index,
				},
			},
		};
		const results = { new: [], active: [clash], resolved: [] };

		TicketsModel.getTicketsByQuery.mockResolvedValueOnce([existingTicket]);
		TicketsModel.getTicketsByQuery.mockResolvedValueOnce([existingTicket]);

		await TicketsClashes.processClashResults(teamspace, project, federation, template, results,
			getProcessOptions(context, { defaultStatuses: {} }));

		const expectedUpdate = {
			modules: {
				[CLOUD_CLASH]: getCloudClashUpdateData(0),
			},
		};
		expect(TicketsModel.updateTickets).toHaveBeenCalledTimes(1);
		expect(TicketsModel.updateTickets).toHaveBeenCalledWith(teamspace, project, federation,
			[existingTicket], [expectedUpdate], context.creator);
		expect(TicketsModel.addTicketsWithTemplate).not.toHaveBeenCalled();
	});

	test('Should not update active clashes when distance has not changed and pin is disabled', async () => {
		const defaultStatus = generateRandomString();
		const template = getTemplate(defaultStatus, [generateRandomString()]);
		const clash = getClash();
		const context = getContext();
		const existingTicket = {
			_id: generateUUIDString(),
			type: template._id,
			properties: { [STATUS]: defaultStatus },
			modules: {
				[CLOUD_CLASH]: {
					[CLASH_ID]: clash.index,
					[DISTANCE_M]: 0,
				},
			},
		};
		const results = { new: [], active: [clash], resolved: [] };

		TicketsModel.getTicketsByQuery.mockResolvedValueOnce([existingTicket]);

		await TicketsClashes.processClashResults(teamspace, project, federation, template, results,
			getProcessOptions(context, { defaultStatuses: {} }));

		expect(TicketsModel.getTicketsByQuery).toHaveBeenCalledTimes(1);
		expect(TicketSchema.validateTickets).not.toHaveBeenCalled();
		expect(TicketsModel.updateTickets).not.toHaveBeenCalled();
		expect(TicketsModel.addTicketsWithTemplate).not.toHaveBeenCalled();
	});

	test('Should only update changed distance field for active clashes', async () => {
		const defaultStatus = generateRandomString();
		const template = getTemplate(defaultStatus, [generateRandomString()]);
		const clash = getClash();
		const context = getContext();
		const existingTicket = {
			_id: generateUUIDString(),
			type: template._id,
			properties: { [STATUS]: defaultStatus },
			modules: {
				[CLOUD_CLASH]: {
					[CLASH_ID]: clash.index,
					[DISTANCE_M]: 1,
				},
			},
		};
		const results = { new: [], active: [clash], resolved: [] };

		TicketsModel.getTicketsByQuery.mockResolvedValueOnce([existingTicket]);
		TicketsModel.getTicketsByQuery.mockResolvedValueOnce([existingTicket]);

		await TicketsClashes.processClashResults(teamspace, project, federation, template, results,
			getProcessOptions(context, { defaultStatuses: {} }));

		const expectedUpdate = {
			modules: {
				[CLOUD_CLASH]: {
					[DISTANCE_M]: 0,
				},
			},
		};
		expect(TicketsModel.updateTickets).toHaveBeenCalledTimes(1);
		expect(TicketsModel.updateTickets).toHaveBeenCalledWith(teamspace, project, federation,
			[existingTicket], [expectedUpdate], context.creator);
		expect(TicketsModel.addTicketsWithTemplate).not.toHaveBeenCalled();
	});

	test('Should update the default pin when the clash position changes and pin is enabled', async () => {
		const defaultStatus = generateRandomString();
		const template = getTemplate(defaultStatus, [generateRandomString()]);
		const clash = getClash();
		const context = getContext();
		const existingTicket = {
			_id: generateUUIDString(),
			type: template._id,
			properties: { [PIN]: [10, 20, 30], [STATUS]: defaultStatus },
			modules: {
				[CLOUD_CLASH]: {
					[CLASH_ID]: clash.index,
					[DISTANCE_M]: 0,
				},
			},
		};
		const results = { new: [], active: [clash], resolved: [] };
		template.config.pin = true;

		TicketsModel.getTicketsByQuery.mockResolvedValueOnce([existingTicket]);
		TicketsModel.getTicketsByQuery.mockResolvedValueOnce([existingTicket]);

		await TicketsClashes.processClashResults(teamspace, project, federation, template, results,
			getProcessOptions(context, { defaultStatuses: {} }));

		const expectedUpdate = {
			properties: {
				[PIN]: clash.positions[0],
			},
		};
		expect(TicketsModel.updateTickets).toHaveBeenCalledTimes(1);
		expect(TicketsModel.updateTickets).toHaveBeenCalledWith(teamspace, project, federation,
			[existingTicket], [expectedUpdate], context.creator);
		expect(TicketsModel.addTicketsWithTemplate).not.toHaveBeenCalled();
	});

	test('Should update the default view camera when the clash bounding box changes', async () => {
		const defaultStatus = generateRandomString();
		const template = getTemplate(defaultStatus, [generateRandomString()]);
		const clash = getClash();
		const context = getContext();
		const existingTicket = {
			_id: generateUUIDString(),
			type: template._id,
			properties: {
				[DEFAULT_VIEW]: {
					camera: createViewpoint({ min: [10, 10, 10], max: [20, 20, 20] }),
				},
				[STATUS]: defaultStatus,
			},
			modules: {
				[CLOUD_CLASH]: {
					[CLASH_ID]: clash.index,
					[DISTANCE_M]: 0,
				},
			},
		};
		const results = { new: [], active: [clash], resolved: [] };
		template.config.defaultView = true;
		clash.bbox = { min: [0, 0, 0], max: [10, 10, 10] };

		TicketsModel.getTicketsByQuery.mockResolvedValueOnce([existingTicket]);
		TicketsModel.getTicketsByQuery.mockResolvedValueOnce([existingTicket]);

		await TicketsClashes.processClashResults(teamspace, project, federation, template, results,
			getProcessOptions(context, { defaultStatuses: {} }));

		const expectedUpdate = {
			properties: {
				[DEFAULT_VIEW]: {
					camera: createViewpoint(clash.bbox),
				},
			},
		};
		expect(TicketsModel.updateTickets).toHaveBeenCalledTimes(1);
		expect(TicketsModel.updateTickets).toHaveBeenCalledWith(teamspace, project, federation,
			[existingTicket], [expectedUpdate], context.creator);
		expect(TicketsModel.addTicketsWithTemplate).not.toHaveBeenCalled();
	});

	test('Should not update the default view camera when the clash bounding box has not changed', async () => {
		const defaultStatus = generateRandomString();
		const template = getTemplate(defaultStatus, [generateRandomString()]);
		const clash = getClash();
		const context = getContext();
		clash.bbox = { min: [0, 0, 0], max: [10, 10, 10] };
		const existingTicket = {
			_id: generateUUIDString(),
			type: template._id,
			properties: {
				[DEFAULT_VIEW]: {
					camera: createViewpoint(clash.bbox),
				},
				[STATUS]: defaultStatus,
			},
			modules: {
				[CLOUD_CLASH]: {
					[CLASH_ID]: clash.index,
					[DISTANCE_M]: 0,
				},
			},
		};
		const results = { new: [], active: [clash], resolved: [] };
		template.config.defaultView = true;

		TicketsModel.getTicketsByQuery.mockResolvedValueOnce([existingTicket]);

		await TicketsClashes.processClashResults(teamspace, project, federation, template, results,
			getProcessOptions(context, { defaultStatuses: {} }));

		expect(TicketsModel.getTicketsByQuery).toHaveBeenCalledTimes(1);
		expect(TicketsModel.updateTickets).not.toHaveBeenCalled();
		expect(TicketsModel.addTicketsWithTemplate).not.toHaveBeenCalled();
	});

	test('Should not update tickets when validation filters updates out', async () => {
		const defaultStatus = generateRandomString();
		const template = getTemplate(defaultStatus, [generateRandomString()]);
		const clash = getClash();
		const context = getContext();
		const existingTicket = {
			_id: generateUUIDString(),
			type: template._id,
			properties: { [STATUS]: defaultStatus },
			modules: {
				[CLOUD_CLASH]: {
					[CLASH_ID]: clash.index,
				},
			},
		};
		const results = { new: [], active: [clash], resolved: [] };

		TicketsModel.getTicketsByQuery.mockResolvedValueOnce([existingTicket]);
		TicketsModel.getTicketsByQuery.mockResolvedValueOnce([existingTicket]);
		TicketSchema.validateTickets.mockResolvedValueOnce([]);

		await TicketsClashes.processClashResults(teamspace, project, federation, template, results,
			getProcessOptions(context, { defaultStatuses: {} }));

		expect(TicketsModel.updateTickets).not.toHaveBeenCalled();
		expect(TicketsModel.addTicketsWithTemplate).not.toHaveBeenCalled();
	});

	test('Should update resolved clashes using the configured resolved status', async () => {
		const clash = getClash();
		const context = getContext();
		const resolvedStatus = generateRandomString();
		const template = getTemplate(generateRandomString(), [resolvedStatus]);
		const existingTicket = {
			_id: generateUUIDString(),
			type: template._id,
			properties: {},
			modules: {
				[CLOUD_CLASH]: {
					[CLASH_ID]: clash.index,
				},
			},
		};
		const results = { new: [], active: [], resolved: [{ index: clash.index }] };

		TicketsModel.getTicketsByQuery.mockResolvedValueOnce([existingTicket]);
		TicketsModel.getTicketsByQuery.mockResolvedValueOnce([existingTicket]);

		await TicketsClashes.processClashResults(teamspace, project, federation, template, results,
			getProcessOptions(context, { defaultStatuses: { onResolved: resolvedStatus } }));

		const expectedUpdate = { properties: { [STATUS]: resolvedStatus } };
		expect(TicketsModel.updateTickets).toHaveBeenCalledTimes(1);
		expect(TicketsModel.updateTickets).toHaveBeenCalledWith(teamspace, project, federation,
			[existingTicket], [expectedUpdate], context.creator);
		expect(TicketsModel.addTicketsWithTemplate).not.toHaveBeenCalled();
	});

	test('Should ignore resolved clashes without matching tickets', async () => {
		const template = getTemplateWithoutCustomStatus();
		const clash = getClash();
		const context = getContext();
		const results = { new: [], active: [], resolved: [clash] };

		TicketsModel.getTicketsByQuery.mockResolvedValueOnce([]);

		await TicketsClashes.processClashResults(teamspace, project, federation, template, results,
			getProcessOptions(context, { defaultStatuses: {} }));

		expect(TicketsModel.updateTickets).not.toHaveBeenCalled();
		expect(TicketsModel.addTicketsWithTemplate).not.toHaveBeenCalled();
	});

	test('Should update unmatched clash tickets as resolved', async () => {
		const clash = getClash();
		const context = getContext();
		const resolvedStatus = generateRandomString();
		const template = getTemplate(generateRandomString(), [resolvedStatus]);
		const existingTicket = {
			_id: generateUUIDString(),
			type: template._id,
			properties: {},
			modules: {
				[CLOUD_CLASH]: {
					[CLASH_ID]: clash.index,
				},
			},
		};
		const results = { new: [], active: [], resolved: [] };

		TicketsModel.getTicketsByQuery.mockResolvedValueOnce([existingTicket]);
		TicketsModel.getTicketsByQuery.mockResolvedValueOnce([existingTicket]);

		await TicketsClashes.processClashResults(teamspace, project, federation, template, results,
			getProcessOptions(context, { defaultStatuses: { onResolved: resolvedStatus } }));

		const expectedUpdate = { properties: { [STATUS]: resolvedStatus } };
		expect(TicketsModel.updateTickets).toHaveBeenCalledTimes(1);
		expect(TicketsModel.updateTickets).toHaveBeenCalledWith(teamspace, project, federation,
			[existingTicket], [expectedUpdate], context.creator);
		expect(TicketsModel.addTicketsWithTemplate).not.toHaveBeenCalled();
	});

	test('Should ignore unmatched clash tickets that are already using the resolved status', async () => {
		const clash = getClash();
		const context = getContext();
		const resolvedStatus = generateRandomString();
		const template = getTemplate();
		const existingTicket = {
			_id: generateUUIDString(),
			type: template._id,
			properties: { [STATUS]: resolvedStatus },
			modules: {
				[CLOUD_CLASH]: {
					[CLASH_ID]: clash.index,
				},
			},
		};
		const results = { new: [], active: [], resolved: [] };
		template.config.status.values.push({ name: resolvedStatus, type: statusTypes.OPEN });

		TicketsModel.getTicketsByQuery.mockResolvedValueOnce([existingTicket]);

		await TicketsClashes.processClashResults(teamspace, project, federation, template, results,
			getProcessOptions(context, { defaultStatuses: { onResolved: resolvedStatus } }));

		expect(TicketsModel.updateTickets).not.toHaveBeenCalled();
		expect(TicketsModel.addTicketsWithTemplate).not.toHaveBeenCalled();
	});

	test.each([
		['closed', statusTypes.DONE],
		['void', statusTypes.VOID],
	])('Should ignore unmatched clash tickets that are already %s', async (desc, statusType) => {
		const status = generateRandomString();
		const template = getTemplate();
		const clash = getClash();
		const context = getContext();
		const existingTicket = {
			_id: generateUUIDString(),
			type: template._id,
			properties: { [STATUS]: status },
			modules: {
				[CLOUD_CLASH]: {
					[CLASH_ID]: clash.index,
				},
			},
		};
		const results = { new: [], active: [], resolved: [] };
		template.config.status.values.push({ name: status, type: statusType });

		TicketsModel.getTicketsByQuery.mockResolvedValueOnce([existingTicket]);

		await TicketsClashes.processClashResults(teamspace, project, federation, template, results,
			getProcessOptions(context, { defaultStatuses: {} }));

		expect(TicketsModel.updateTickets).not.toHaveBeenCalled();
		expect(TicketsModel.addTicketsWithTemplate).not.toHaveBeenCalled();
	});

	test('Should ignore resolved clashes that are already closed', async () => {
		const closedStatus = generateRandomString();
		const template = getTemplate(generateRandomString(), [closedStatus]);
		const clash = getClash();
		const context = getContext();
		const existingTicket = {
			_id: generateUUIDString(),
			type: template._id,
			properties: { [STATUS]: closedStatus },
			modules: {
				[CLOUD_CLASH]: {
					[CLASH_ID]: clash.index,
				},
			},
		};
		const results = { new: [], active: [], resolved: [clash] };

		TicketsModel.getTicketsByQuery.mockResolvedValueOnce([existingTicket]);

		await TicketsClashes.processClashResults(teamspace, project, federation, template, results,
			getProcessOptions(context, { defaultStatuses: {} }));

		expect(TicketsModel.updateTickets).not.toHaveBeenCalled();
		expect(TicketsModel.addTicketsWithTemplate).not.toHaveBeenCalled();
	});

	test('Should update resolved clashes using the first done status', async () => {
		const doneStatus = generateRandomString();
		const template = getTemplate(generateRandomString(), [doneStatus, generateRandomString()]);
		const clash = getClash();
		const context = getContext();
		const existingTicket = {
			_id: generateUUIDString(),
			type: template._id,
			properties: {},
			modules: {
				[CLOUD_CLASH]: {
					[CLASH_ID]: clash.index,
				},
			},
		};
		const results = { new: [], active: [], resolved: [clash] };

		TicketsModel.getTicketsByQuery.mockResolvedValueOnce([existingTicket]);
		TicketsModel.getTicketsByQuery.mockResolvedValueOnce([existingTicket]);

		await TicketsClashes.processClashResults(teamspace, project, federation, template, results,
			getProcessOptions(context, { defaultStatuses: {} }));

		const expectedUpdate = { properties: { [STATUS]: doneStatus } };
		expect(TicketsModel.updateTickets).toHaveBeenCalledTimes(1);
		expect(TicketsModel.updateTickets).toHaveBeenCalledWith(teamspace, project, federation,
			[existingTicket], [expectedUpdate], context.creator);
	});

	test('Should update resolved clashes using the default done status', async () => {
		const template = getTemplateWithoutCustomStatus();
		const clash = getClash();
		const context = getContext();
		const existingTicket = {
			_id: generateUUIDString(),
			type: template._id,
			properties: {},
			modules: {
				[CLOUD_CLASH]: {
					[CLASH_ID]: clash.index,
				},
			},
		};
		const results = { new: [], active: [], resolved: [clash] };

		TicketsModel.getTicketsByQuery.mockResolvedValueOnce([existingTicket]);
		TicketsModel.getTicketsByQuery.mockResolvedValueOnce([existingTicket]);

		await TicketsClashes.processClashResults(teamspace, project, federation, template, results,
			getProcessOptions(context, { defaultStatuses: {} }));

		const expectedUpdate = { properties: { [STATUS]: statuses.CLOSED } };
		expect(TicketsModel.updateTickets).toHaveBeenCalledTimes(1);
		expect(TicketsModel.updateTickets).toHaveBeenCalledWith(teamspace, project, federation,
			[existingTicket], [expectedUpdate], context.creator);
	});
});
