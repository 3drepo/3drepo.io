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

const { CLASH_TYPES, clashObjectIdTypes } = require('../../../../../models/clashes.constants');
const { UUIDToString, stringToUUID } = require('../../../../../utils/helper/uuids');
const {
	basePropertyLabels,
	idTypeLabels,
	modulePropertyLabels,
	presetModules,
	statusTypes,
	viewGroups,
} = require('../../../../../schemas/tickets/templates.constants');
const { cloneDeep, isEmpty, isEqual } = require('../../../../../utils/helper/objects');
const { convertArrayUnits, units } = require('../../../../../utils/helper/units');
const { getClosedStatuses, getStatusDefinition } = require('../../../../../schemas/tickets/templates');
const { importTickets, updateManyTickets } = require('./tickets');
const { CameraType } = require('../../../../../schemas/tickets/validators');
const { getFederationById } = require('../../../../../models/modelSettings');
const { getMeshesWithParentIds } = require('./scenes');
const { getTicketsByQuery } = require('../../../../../models/tickets');
const { validateTickets } = require('../../../../../schemas/tickets');

const TicketsClashes = {};
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

const getClashIdToTicket = async (teamspace, project, federation, template, planId) => {
	const tickets = await getTicketsByQuery(teamspace, project, federation, {
		type: template._id,
		[`modules.${CLOUD_CLASH}.${CLASH_PLAN_ID}`]: UUIDToString(planId),
	}, {
		_id: 1,
		[`properties.${DEFAULT_VIEW}`]: 1,
		[`properties.${PIN}`]: 1,
		[`properties.${STATUS}`]: 1,
		[`modules.${CLOUD_CLASH}`]: 1,
	});

	const clashIdToTicket = {};
	tickets.forEach((ticket) => {
		const clashId = ticket.modules?.[CLOUD_CLASH]?.[CLASH_ID];
		if (clashId !== undefined) clashIdToTicket[String(clashId)] = ticket;
	});

	return clashIdToTicket;
};

const updateClashPinAndDistance = (ticket, clashContext, clash, existingTicket) => {
	let distance = 0;
	const [pointA, pointB] = clash.positions;
	const clashPoint = convertArrayUnits(pointA, units.MM, clashContext.federationUnits);
	const existingCloudClash = existingTicket?.modules?.[CLOUD_CLASH];

	if (clashContext.clashType === CLASH_TYPES.CLEARANCE) {
		const distanceInMm = Math.sqrt(
			(pointA[0] - pointB[0]) ** 2
				+ (pointA[1] - pointB[1]) ** 2
				+ (pointA[2] - pointB[2]) ** 2,
		);
		[distance] = convertArrayUnits([distanceInMm], units.MM, units.M);
	}

	if (clashContext.pinEnabled && !isEqual(existingTicket?.properties?.[PIN], clashPoint)) {
		/* eslint-disable no-param-reassign */
		ticket.properties = ticket.properties ?? {};
		ticket.properties[PIN] = clashPoint;
		/* eslint-enable no-param-reassign */
	}

	if (!isEqual(existingCloudClash?.[DISTANCE_M], distance)) {
		/* eslint-disable no-param-reassign */
		ticket.modules = ticket.modules ?? {};
		ticket.modules[CLOUD_CLASH] = ticket.modules[CLOUD_CLASH] ?? {};
		ticket.modules[CLOUD_CLASH][DISTANCE_M] = distance;
		/* eslint-enable no-param-reassign */
	}
};

const createViewpoint = ({ min, max }) => {
	const fov = 60 * 0.0174533; // deg-2-radians
	const dim = min.map((value, i) => max[i] - value);
	const magnitude = Math.sqrt(dim.reduce((sum, value) => sum + value ** 2, 0));
	const distance = magnitude / Math.tan(fov / 2);
	const center = min.map((value, i) => (value + max[i]) / 2);

	// These vectors define the camera orientation. In the viewer they are based
	// on the current camera position, but externally generated views need an
	// arbitrary orientation.
	const up = [0.3728146553039551, 0.8944026231765747, -0.2470894455909729];
	const forward = [0.7455270290374756, -0.4472627639770508, -0.49411076307296753];

	return {
		position: center.map((value, i) => value - forward[i] * distance),
		up,
		forward,
		type: CameraType.PERSPECTIVE,
	};
};

const updateDefaultView = async (teamspace, project, ticket, clashContext, clash, existingTicket) => {
	if (!clashContext.defaultViewEnabled) return;

	const generateGroupObject = async (name, color, { container, idType, id }, selections) => {
		const { revision } = selections.find((selection) => selection.container === container);
		let ids = [id];
		if (idType === clashObjectIdTypes.INTERNAL) {
			// Return strings because validateTickets deserialises view group _ids before committing groups.
			ids = await getMeshesWithParentIds(teamspace, project, container, revision, [stringToUUID(id)], true);
		}

		return {
			group: {
				name,
				objects: [{ container, [idType]: ids }],
			},
			color,
		};
	};

	/* eslint-disable no-param-reassign */
	if (!existingTicket) {
		const coloredGroups = await Promise.all([
			generateGroupObject('Object A', [255, 0, 0], clash.a, clashContext.selectionA),
			generateGroupObject('Object B', [0, 255, 0], clash.b, clashContext.selectionB),
		]);

		ticket.properties[DEFAULT_VIEW] = ticket.properties[DEFAULT_VIEW] ?? {};
		ticket.properties[DEFAULT_VIEW].state = ticket.properties[DEFAULT_VIEW].state ?? {};
		ticket.properties[DEFAULT_VIEW].state[viewGroups.COLORED] = coloredGroups;
	}

	if (clash.bbox) {
		const camera = createViewpoint(clash.bbox);
		if (!isEqual(existingTicket?.properties?.[DEFAULT_VIEW]?.camera, camera)) {
			ticket.properties = ticket.properties ?? {};
			ticket.properties[DEFAULT_VIEW] = ticket.properties[DEFAULT_VIEW] ?? {};
			ticket.properties[DEFAULT_VIEW].camera = camera;
		}
	}
	/* eslint-enable no-param-reassign */
};

const generateBaseNewTicket = async (teamspace, project, federation, template, defaultValues = [], status) => {
	const ticket = {
		properties: { [STATUS]: status },
		modules: {},
	};

	const constructTicketChange = ({ module, property, value }, ticketToReturn) => {
		/* eslint-disable no-param-reassign */
		if (!module) {
			ticketToReturn.properties[property] = value;
		} else {
			ticketToReturn.modules[module] = ticketToReturn.modules[module] ?? {};
			ticketToReturn.modules[module][property] = value;
		}
		/* eslint-enable no-param-reassign */

		return ticketToReturn;
	};

	const validateDefaultValues = (ticketToTest) => validateTickets(
		teamspace,
		project,
		federation,
		template,
		[ticketToTest],
		{ existingData: [{}], processValidatedData: false });

	if (defaultValues.length) {
		for (const defaultValue of defaultValues) {
			const ticketChangeToTest = constructTicketChange(defaultValue, cloneDeep(ticket));
			try {
				// eslint-disable-next-line no-await-in-loop
				await validateDefaultValues(ticketChangeToTest);
				constructTicketChange(defaultValue, ticket);
			} catch {
				// do not add the default value if it is invalid
			}
		}
	}

	return ticket;
};

const processClashes = async (teamspace, project, federation, template, clashes, clashContext) => {
	const ticketsToUpdate = [];
	const ticketsToCreate = [];

	if (clashes.length === 0) return { ticketsToUpdate: [], ticketsToCreate: [] };

	const baseNewTicket = await generateBaseNewTicket(
		teamspace, project, federation, template, clashContext.valuesAtCreation,
		clashContext.statusInfo.defaultStatuses.onNew);
	const defaultClashIdType = idTypeLabels['3_D_REPO_ID'];
	const clashIdTypeToTicketType = {
		[clashObjectIdTypes.INTERNAL]: defaultClashIdType,
		[clashObjectIdTypes.IFC]: idTypeLabels.IFC,
		[clashObjectIdTypes.REVIT]: idTypeLabels.REVIT,
	};
	const { clashIdToTicket } = clashContext;

	for (const clash of clashes) {
		const clashId = clash.index;
		const existingTicket = clashIdToTicket[clashId];
		if (existingTicket) {
			delete clashIdToTicket[clashId];
			const ticketStatus = existingTicket?.properties?.[STATUS];

			// update the status of the ticket if it's closed
			const update = clashContext.statusInfo.closedStatuses[ticketStatus]
				? { properties: { [STATUS]: clashContext.statusInfo.defaultStatuses.onReopened } } : {};

			updateClashPinAndDistance(update, clashContext, clash, existingTicket);
			// eslint-disable-next-line no-await-in-loop
			await updateDefaultView(teamspace, project, update, clashContext, clash, existingTicket);

			if (!isEmpty(update)) {
				ticketsToUpdate.push({
					_id: existingTicket._id,
					data: update,
				});
			}
		} else {
			const newTicket = cloneDeep(baseNewTicket);
			const objectAIdType = clashIdTypeToTicketType[clash.a?.idType] ?? defaultClashIdType;
			const objectBIdType = clashIdTypeToTicketType[clash.b?.idType] ?? defaultClashIdType;
			newTicket.title = `[${clashContext.planName}] Clash`;
			newTicket.modules[CLOUD_CLASH] = newTicket.modules[CLOUD_CLASH] ?? {};
			newTicket.modules[CLOUD_CLASH][CLASH_PLAN_ID] = clashContext.planId;
			newTicket.modules[CLOUD_CLASH][CLASH_RUN_ID] = clashContext.runId;
			newTicket.modules[CLOUD_CLASH][CLASH_TYPE] = clashContext.clashType;
			newTicket.modules[CLOUD_CLASH][CLASH_ID] = clashId;
			newTicket.modules[CLOUD_CLASH][CLASH_PLAN_NAME] = clashContext.planName;
			newTicket.modules[CLOUD_CLASH][OBJECT_A_ID_TYPE] = objectAIdType;
			newTicket.modules[CLOUD_CLASH][OBJECT_A_ID] = clash.a?.id;
			newTicket.modules[CLOUD_CLASH][OBJECT_B_ID_TYPE] = objectBIdType;
			newTicket.modules[CLOUD_CLASH][OBJECT_B_ID] = clash.b?.id;
			updateClashPinAndDistance(newTicket, clashContext, clash);
			// eslint-disable-next-line no-await-in-loop
			await updateDefaultView(teamspace, project, newTicket, clashContext, clash);

			ticketsToCreate.push(newTicket);
		}
	}

	return { ticketsToUpdate, ticketsToCreate };
};

const resolveTickets = (tickets, clashContext) => (
	tickets
		.flatMap((ticket) => {
			const ticketStatus = ticket?.properties?.[STATUS];

			if (ticketStatus !== clashContext.statusInfo.defaultStatuses.onResolved
				&& !clashContext.statusInfo.closedStatuses[ticketStatus]
				&& !clashContext.statusInfo.voidStatuses[ticketStatus]) {
				return [{
					_id: ticket._id,
					data: { properties: { [STATUS]: clashContext.statusInfo.defaultStatuses.onResolved } },
				}];
			}

			return [];
		})
);

const determineStatusInfo = (template, configuredDefaultStatuses) => {
	const templateStatuses = getStatusDefinition(template);

	const res = { closedStatuses: {}, voidStatuses: {} };
	const templateDefaultStatus = templateStatuses.default;
	const templateStatusValues = new Set(templateStatuses.values.map(({ name }) => name));
	const getDefaultStatus = (status, fallback) => (templateStatusValues.has(status) ? status : fallback);

	templateStatuses.values.forEach(({ name, type }) => {
		if (type === statusTypes.DONE) res.closedStatuses[name] = true;
		if (type === statusTypes.VOID) res.voidStatuses[name] = true;
	});

	res.defaultStatuses = {
		onNew: getDefaultStatus(configuredDefaultStatuses?.onNew, templateDefaultStatus),
		onResolved: getDefaultStatus(configuredDefaultStatuses?.onResolved, getClosedStatuses(template, false)[0]),
		onReopened: getDefaultStatus(configuredDefaultStatuses?.onReopened, templateDefaultStatus),
	};

	return res;
};

const processNewClashTickets = async (teamspace, project, federation, template, ticketsToCreate, creator) => {
	if (ticketsToCreate.length === 0) return;

	// run it through a validation pass to ensure we have all the default values set, and also
	// we're not creating tickets with invalid data (e.g. if there's a unique/read only property we're setting incorrectly)
	const validatedTicketsToCreate = (await validateTickets(teamspace, project, federation, template,
		ticketsToCreate, { author: creator })).map(({ newTicket }) => newTicket);

	if (validatedTicketsToCreate.length) {
		await importTickets(teamspace, project, federation, template, validatedTicketsToCreate, creator);
	}
};

const processTicketUpdates = async (teamspace, project, federation, template, ticketsToUpdate, creator) => {
	if (ticketsToUpdate.length === 0) return;
	const existingTicketsData = await getTicketsByQuery(teamspace, project, federation, {
		_id: { $in: ticketsToUpdate.map(({ _id }) => _id) },
	});

	const ticketDataById = {};
	existingTicketsData.forEach((ticket) => {
		ticketDataById[UUIDToString(ticket._id)] = ticket;
	});

	const dataUpdates = [];
	const existingDataList = [];

	ticketsToUpdate.forEach(({ _id, data }) => {
		const existingTicketData = ticketDataById[UUIDToString(_id)];
		dataUpdates.push(data);
		existingDataList.push(existingTicketData);
	});

	const updates = await validateTickets(teamspace, project, federation, template,
		dataUpdates, {
			author: creator,
			existingData: existingDataList,
		});

	if (updates.length) {
		await updateManyTickets(teamspace, project, federation, template,
			updates.map(({ existingData }) => existingData),
			updates.map(({ newTicket }) => newTicket),
			creator);
	}
};

TicketsClashes.processClashResults = async (
	teamspace,
	project,
	federation,
	template,
	results,
	{ plan, runId },
) => {
	const { new: newClashes = [], active: activeClashes = [] } = results;
	const {
		_id: planId,
		name: planName,
		type: clashType,
		selectionA,
		selectionB,
		tickets: {
			valuesAtCreation,
			defaultStatuses: configuredDefaultStatuses,
			creator,
		} = {},
	} = plan;

	const clashIdToTicket = await getClashIdToTicket(teamspace, project, federation, template, planId);
	const { properties: { unit: federationUnits } } = await getFederationById(
		teamspace, federation, { 'properties.unit': 1 });

	const statusInfo = determineStatusInfo(template, configuredDefaultStatuses);

	const clashContext = {
		planId: UUIDToString(planId),
		planName,
		runId: UUIDToString(runId),
		clashType,
		statusInfo,
		clashIdToTicket,
		valuesAtCreation,
		federationUnits,
		pinEnabled: template.config?.pin,
		defaultViewEnabled: template.config?.defaultView,
		selectionA,
		selectionB,
	};
	const processedClashes = await processClashes(
		teamspace, project, federation, template, [...newClashes, ...activeClashes], clashContext);
	const ticketsToProcess = {
		ticketsToUpdate: [
			...processedClashes.ticketsToUpdate,
			...resolveTickets(Object.values(clashIdToTicket), clashContext),
		],
		ticketsToCreate: processedClashes.ticketsToCreate,
	};

	await Promise.all([
		processNewClashTickets(teamspace, project, federation, template, ticketsToProcess.ticketsToCreate, creator),
		processTicketUpdates(teamspace, project, federation, template, ticketsToProcess.ticketsToUpdate, creator),

	]);
};

module.exports = TicketsClashes;
