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

jest.mock('../../../../../../../../src/v5/schemas/tickets');
const TicketSchema = require(`${src}/schemas/tickets`);

const TicketsClashes = require(`${src}/processors/teamspaces/projects/models/commons/tickets.clashes`);

const {
	basePropertyLabels,
	modulePropertyLabels,
	presetModules,
	statuses,
	statusTypes,
} = require(`${src}/schemas/tickets/templates.constants`);
const { CLASH_TYPES } = require(`${src}/models/clashes.constants`);

const { CLOUD_CLASH } = presetModules;
const {
	CLASH_ID,
	CLASH_PLAN_ID,
	CLASH_PLAN_NAME,
	CLASH_POINT,
	CLASH_RUN_ID,
	CLASH_TYPE,
	DISTANCE_M,
	OBJECT_A_ID,
	OBJECT_A_ID_TYPE,
	OBJECT_B_ID,
	OBJECT_B_ID_TYPE,
} = modulePropertyLabels[CLOUD_CLASH];
const { STATUS } = basePropertyLabels;

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
	a: { idType: 'internal', id: generateRandomString() },
	b: { idType: 'ifc_guids', id: generateRandomString() },
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
});

const getProcessOptions = (context, tickets = {}) => ({
	runId: context.runId,
	plan: {
		_id: context.planId,
		name: context.planName,
		type: context.clashType,
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
	[CLASH_POINT]: [1, 2, 3],
	[DISTANCE_M]: distance,
	[OBJECT_A_ID_TYPE]: '3D Repo ID',
	[OBJECT_A_ID]: clash.a.id,
	[OBJECT_B_ID_TYPE]: 'IFC',
	[OBJECT_B_ID]: clash.b.id,
});

const getCloudClashUpdateData = (clash, distance) => ({
	[CLASH_POINT]: [1, 2, 3],
	[DISTANCE_M]: distance,
});

describe(determineTestGroup(__filename), () => {
	const teamspace = generateRandomString();
	const project = generateRandomString();
	const federation = generateUUIDString();

	beforeEach(() => {
		jest.clearAllMocks();
		TicketsModel.addTicketsWithTemplate.mockResolvedValue([]);
		TicketsModel.updateTickets.mockResolvedValue([]);
		const mockValidation = (t, p, m, tem, tickets, { existingData, processValidatedData = true } = {}) => (
			Promise.resolve(tickets.map((ticket, i) => ({
				newTicket: ticket,
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
				[CLOUD_CLASH]: getCloudClashData(clash, context, 0),
			},
		};

		expect(TicketsModel.getTicketsByQuery).toHaveBeenCalledTimes(1);
		expect(TicketsModel.getTicketsByQuery).toHaveBeenCalledWith(teamspace, project, federation, {
			type: template._id,
			[`modules.${CLOUD_CLASH}.${CLASH_PLAN_ID}`]: context.planId,
		}, {
			_id: 1,
			[`properties.${STATUS}`]: 1,
			[`modules.${CLOUD_CLASH}.${CLASH_ID}`]: 1,
		});

		expect(TicketSchema.validateTickets).toHaveBeenCalledTimes(4);
		expect(TicketSchema.validateTickets).toHaveBeenNthCalledWith(1, teamspace, project, federation, template,
			[{
				properties: {
					[basePropertyLabels.PRIORITY]: priority,
					[STATUS]: status,
				},
				modules: {},
			}],
			{ existingData: [{}], processValidatedData: false });
		expect(TicketSchema.validateTickets).toHaveBeenNthCalledWith(4, teamspace, project, federation, template,
			[expectedTicket], { author: context.creator });
		expect(TicketsModel.addTicketsWithTemplate).toHaveBeenCalledTimes(1);
		expect(TicketsModel.addTicketsWithTemplate).toHaveBeenCalledWith(teamspace, project,
			federation, template._id, [expectedTicket]);
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
		expect(createdTickets[0].modules[CLOUD_CLASH]).toEqual(getCloudClashData(clash, context, 5));
		expect(TicketsModel.updateTickets).not.toHaveBeenCalled();
	});

	test('Should use the original id type for unknown clash id types and Unknown when missing', async () => {
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
		expect(cloudClashData[OBJECT_A_ID_TYPE]).toEqual(customIdType);
		expect(cloudClashData[OBJECT_B_ID_TYPE]).toEqual('Unknown');
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
				return Promise.resolve(tickets.map((ticket) => ({ newTicket: ticket })));
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
		expect(createdTickets[0].properties).toEqual({
			[basePropertyLabels.PRIORITY]: priority,
			[STATUS]: defaultStatus,
		});
		expect(TicketSchema.validateTickets).toHaveBeenCalledTimes(3);
		expect(TicketSchema.validateTickets).toHaveBeenLastCalledWith(teamspace, project, federation, template,
			createdTickets, { author: context.creator });
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
				[CLOUD_CLASH]: getCloudClashUpdateData(clash, 0),
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
				},
			},
		};
		const results = { new: [clash], active: [], resolved: [] };

		TicketsModel.getTicketsByQuery.mockResolvedValueOnce([existingTicket]);
		TicketsModel.getTicketsByQuery.mockResolvedValueOnce([existingTicket]);

		await TicketsClashes.processClashResults(teamspace, project, federation, template, results,
			getProcessOptions(context, { defaultStatuses: { onReopened: reopenedStatus } }));

		const updateData = TicketsModel.updateTickets.mock.calls[0][4];
		expect(updateData[0].properties).toEqual({ [STATUS]: reopenedStatus });
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
				[CLOUD_CLASH]: getCloudClashUpdateData(clash, 0),
			},
		};
		expect(TicketsModel.updateTickets).toHaveBeenCalledTimes(1);
		expect(TicketsModel.updateTickets).toHaveBeenCalledWith(teamspace, project, federation,
			[existingTicket], [expectedUpdate], context.creator);
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
