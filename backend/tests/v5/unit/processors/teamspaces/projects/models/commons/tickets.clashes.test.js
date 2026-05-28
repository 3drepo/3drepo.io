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

const TicketsClashes = require(`${src}/processors/teamspaces/projects/models/commons/tickets.clashes`);

const {
	basePropertyLabels,
	modulePropertyLabels,
	presetModules,
	statuses,
	statusTypes,
} = require(`${src}/schemas/tickets/templates.constants`);

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

const getClash = (index = generateRandomString(), distance) => ({
	index,
	a: { idType: 'internal', id: generateRandomString() },
	b: { idType: 'ifc_guids', id: generateRandomString() },
	positions: [
		[[1, 2, 3], [4, 6, 3]],
	],
	...(distance === undefined ? {} : { distance }),
});

const getContext = () => ({
	planId: generateUUIDString(),
	planName: generateRandomString(),
	runId: generateUUIDString(),
	clashType: generateRandomString(),
});

const getCloudClashData = (clash, context, distance) => ({
	[CLASH_PLAN_ID]: context.planId,
	[CLASH_RUN_ID]: context.runId,
	[CLASH_ID]: String(clash.index),
	[CLASH_PLAN_NAME]: context.planName,
	[CLASH_TYPE]: context.clashType,
	[CLASH_POINT]: [1, 2, 3],
	[DISTANCE_M]: distance,
	[OBJECT_A_ID_TYPE]: '3D Repo ID',
	[OBJECT_A_ID]: clash.a.id,
	[OBJECT_B_ID_TYPE]: 'IFC',
	[OBJECT_B_ID]: clash.b.id,
});

describe(determineTestGroup(__filename), () => {
	const teamspace = generateRandomString();
	const project = generateRandomString();
	const federation = generateUUIDString();

	beforeEach(() => {
		jest.clearAllMocks();
	});

	test('Should prepare ticket data for new clashes', async () => {
		const template = getTemplate();
		const clash = getClash(generateRandomString(), 0.25);
		const context = getContext();
		const customModule = generateRandomString();
		const customProperty = generateRandomString();
		const customValue = generateRandomString();
		const priority = generateRandomString();
		const status = generateRandomString();
		const results = { new: [clash], active: [], resolved: [] };

		TicketsModel.getTicketsByQuery.mockResolvedValueOnce([]);

		const output = await TicketsClashes.processClashResults(teamspace, project, federation, template, results, {
			...context,
			defaultValues: [
				{ property: basePropertyLabels.PRIORITY, value: priority },
				{ module: customModule, property: customProperty, value: customValue },
				{ module: CLOUD_CLASH, property: CLASH_ID, value: generateRandomString() },
			],
			defaultStatuses: { onNew: status },
		});

		expect(TicketsModel.getTicketsByQuery).toHaveBeenCalledTimes(1);
		expect(TicketsModel.getTicketsByQuery).toHaveBeenCalledWith(teamspace, project, federation, {
			type: template._id,
			[`modules.${CLOUD_CLASH}.${CLASH_PLAN_ID}`]: context.planId,
		}, {
			_id: 1,
			[`modules.${CLOUD_CLASH}.${CLASH_ID}`]: 1,
		});

		expect(output).toEqual({
			clashesToUpdate: [],
			clashesToCreate: [{
				title: `[${context.planName}] Clash`,
				properties: {
					[basePropertyLabels.PRIORITY]: priority,
					[STATUS]: status,
				},
				modules: {
					[customModule]: { [customProperty]: customValue },
					[CLOUD_CLASH]: getCloudClashData(clash, context, clash.distance),
				},
			}],
		});
	});

	test('Should prepare ticket updates for reopened clashes using the template default status', async () => {
		const defaultStatus = generateRandomString();
		const template = getTemplate(defaultStatus);
		const clash = getClash();
		const context = getContext();
		const existingTicket = {
			_id: generateUUIDString(),
			modules: {
				[CLOUD_CLASH]: {
					[CLASH_ID]: String(clash.index),
				},
			},
		};
		const results = { new: [clash], active: [], resolved: [] };

		TicketsModel.getTicketsByQuery.mockResolvedValueOnce([existingTicket]);

		const output = await TicketsClashes.processClashResults(teamspace, project, federation, template, results, {
			...context,
			defaultValues: [{ property: basePropertyLabels.PRIORITY, value: generateRandomString() }],
			defaultStatuses: {},
		});

		expect(output).toEqual({
			clashesToCreate: [],
			clashesToUpdate: [{
				_id: existingTicket._id,
				data: {
					properties: {
						[STATUS]: defaultStatus,
					},
					modules: {
						[CLOUD_CLASH]: getCloudClashData(clash, context, 5),
					},
				},
			}],
		});
	});

	test('Should prepare ticket updates for resolved clashes using the configured resolved status', async () => {
		const template = getTemplate();
		const clash = getClash();
		const context = getContext();
		const resolvedStatus = generateRandomString();
		const existingTicket = {
			_id: generateUUIDString(),
			modules: {
				[CLOUD_CLASH]: {
					[CLASH_ID]: String(clash.index),
				},
			},
		};
		const results = { new: [], active: [], resolved: [String(clash.index)] };

		TicketsModel.getTicketsByQuery.mockResolvedValueOnce([existingTicket]);

		const output = await TicketsClashes.processClashResults(teamspace, project, federation, template, results, {
			...context,
			defaultStatuses: { onResolved: resolvedStatus },
		});

		expect(output).toEqual({
			clashesToCreate: [],
			clashesToUpdate: [{
				_id: existingTicket._id,
				data: {
					properties: {
						[STATUS]: resolvedStatus,
					},
				},
			}],
		});
	});

	test('Should prepare ticket updates for resolved clashes using the first done status', async () => {
		const doneStatus = generateRandomString();
		const template = getTemplate(generateRandomString(), [doneStatus, generateRandomString()]);
		const clash = getClash();
		const context = getContext();
		const existingTicket = {
			_id: generateUUIDString(),
			modules: {
				[CLOUD_CLASH]: {
					[CLASH_ID]: String(clash.index),
				},
			},
		};
		const results = { new: [], active: [], resolved: [clash] };

		TicketsModel.getTicketsByQuery.mockResolvedValueOnce([existingTicket]);

		const output = await TicketsClashes.processClashResults(teamspace, project, federation, template, results, {
			...context,
			defaultStatuses: {},
		});

		expect(output).toEqual({
			clashesToCreate: [],
			clashesToUpdate: [{
				_id: existingTicket._id,
				data: {
					properties: {
						[STATUS]: doneStatus,
					},
				},
			}],
		});
	});

	test('Should prepare ticket updates for resolved clashes using the default done status', async () => {
		const template = getTemplateWithoutCustomStatus();
		const clash = getClash();
		const context = getContext();
		const existingTicket = {
			_id: generateUUIDString(),
			modules: {
				[CLOUD_CLASH]: {
					[CLASH_ID]: String(clash.index),
				},
			},
		};
		const results = { new: [], active: [], resolved: [clash] };

		TicketsModel.getTicketsByQuery.mockResolvedValueOnce([existingTicket]);

		const output = await TicketsClashes.processClashResults(teamspace, project, federation, template, results, {
			...context,
			defaultStatuses: {},
		});

		expect(output).toEqual({
			clashesToCreate: [],
			clashesToUpdate: [{
				_id: existingTicket._id,
				data: {
					properties: {
						[STATUS]: statuses.CLOSED,
					},
				},
			}],
		});
	});
});
