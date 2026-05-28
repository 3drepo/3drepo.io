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

const {
	basePropertyLabels,
	modulePropertyLabels,
	presetModules,
} = require('../../../../../schemas/tickets/templates.constants');
const { getClosedStatuses, getStatusDefinition } = require('../../../../../schemas/tickets/templates');
const { UUIDToString } = require('../../../../../utils/helper/uuids');
const { getTicketsByQuery } = require('../../../../../models/tickets');

const TicketsClashes = {};
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

const clashIdTypeToTicketType = {
	internal: '3D Repo ID',
	ifc_guids: 'IFC',
	revit_ids: 'Revit',
};

const getObjectIdType = (idType) => clashIdTypeToTicketType[idType] ?? idType ?? 'Unknown';

const isPosition = (position) => Array.isArray(position)
	&& position.length === 3
	&& position.every((coord) => typeof coord === 'number');

const getFirstPositionPair = (positions) => {
	const firstPosition = positions?.[0];
	if (isPosition(firstPosition?.[0]) && isPosition(firstPosition?.[1])) return firstPosition;
	if (isPosition(positions?.[0]) && isPosition(positions?.[1])) return positions;
	return undefined;
};

const getFirstPosition = (positions) => {
	const firstPosition = positions?.[0];
	if (isPosition(firstPosition)) return firstPosition;
	if (isPosition(firstPosition?.[0])) return firstPosition[0];
	return undefined;
};

const getClashPoint = (clash) => {
	if (isPosition(clash.point)) return clash.point;
	if (isPosition(clash.position)) return clash.position;

	return getFirstPosition(clash.positions);
};

const getClashDistance = (clash) => {
	if (clash.distance !== undefined) return clash.distance;

	const positionPair = getFirstPositionPair(clash.positions);
	if (!positionPair) return undefined;

	let sum = 0;
	positionPair[0].forEach((coord, i) => {
		const diff = coord - positionPair[1][i];
		sum += diff ** 2;
	});

	return Math.sqrt(sum);
};

const setValue = (ticket, property, value, module) => {
	if (value === undefined) return;

	if (!module || module === 'properties') {
		// eslint-disable-next-line no-param-reassign
		ticket.properties = ticket.properties ?? {};
		// eslint-disable-next-line no-param-reassign
		ticket.properties[property] = value;
		return;
	}

	// eslint-disable-next-line no-param-reassign
	ticket.modules = ticket.modules ?? {};
	// eslint-disable-next-line no-param-reassign
	ticket.modules[module] = ticket.modules[module] ?? {};
	// eslint-disable-next-line no-param-reassign
	ticket.modules[module][property] = value;
};

const applyDefaultValues = (ticket, defaultValues) => {
	defaultValues?.forEach(({ property, module, value }) => {
		setValue(ticket, property, value, module);
	});
};

const getCloudClashProperties = (clash, { planId, planName, runId, clashType }) => {
	const clashId = String(clash.index);

	return {
		[CLASH_PLAN_ID]: UUIDToString(planId),
		[CLASH_RUN_ID]: UUIDToString(runId),
		[CLASH_ID]: clashId,
		[CLASH_PLAN_NAME]: planName,
		[CLASH_TYPE]: clashType,
		[CLASH_POINT]: getClashPoint(clash),
		[DISTANCE_M]: getClashDistance(clash),
		[OBJECT_A_ID_TYPE]: getObjectIdType(clash.a?.idType),
		[OBJECT_A_ID]: clash.a?.id,
		[OBJECT_B_ID_TYPE]: getObjectIdType(clash.b?.idType),
		[OBJECT_B_ID]: clash.b?.id,
	};
};

const applyCloudClashProperties = (ticket, clash, clashContext) => {
	const properties = getCloudClashProperties(clash, clashContext);
	Object.entries(properties).forEach(([property, value]) => {
		setValue(ticket, property, value, CLOUD_CLASH);
	});
};

const applyStatus = (ticket, status) => {
	setValue(ticket, STATUS, status);
};

const generateTicket = (clash, clashContext, defaultValues, status) => {
	const ticket = {
		title: `[${clashContext.planName}] Clash`,
		properties: {},
		modules: {},
	};

	applyDefaultValues(ticket, defaultValues);
	applyCloudClashProperties(ticket, clash, clashContext);
	applyStatus(ticket, status);

	return ticket;
};

const generateStatusUpdate = (status) => {
	const ticket = {
		properties: {},
	};

	applyStatus(ticket, status);

	return ticket;
};

const generateTicketUpdate = (clash, clashContext, status) => {
	const ticket = {
		properties: {},
		modules: {},
	};

	applyCloudClashProperties(ticket, clash, clashContext);
	applyStatus(ticket, status);

	return ticket;
};

const getClashIdToTicket = async (teamspace, project, federation, template, planId) => {
	const clashIdProp = `modules.${CLOUD_CLASH}.${CLASH_ID}`;
	const tickets = await getTicketsByQuery(teamspace, project, federation, {
		type: template._id,
		[`modules.${CLOUD_CLASH}.${CLASH_PLAN_ID}`]: UUIDToString(planId),
	}, {
		_id: 1,
		[clashIdProp]: 1,
	});

	const clashIdToTicket = {};
	tickets.forEach((ticket) => {
		const clashId = ticket.modules?.[CLOUD_CLASH]?.[CLASH_ID];
		if (clashId !== undefined) clashIdToTicket[String(clashId)] = ticket._id;
	});

	return clashIdToTicket;
};

TicketsClashes.processClashResults = async (
	teamspace,
	project,
	federation,
	template,
	results,
	{ planId, planName, runId, clashType, defaultValues, defaultStatuses },
) => {
	const { new: newClashes, resolved: resolvedClashes } = results;
	const clashIdToTicket = await getClashIdToTicket(teamspace, project, federation, template, planId);
	const clashContext = { planId, planName, runId, clashType };
	const defaultStatus = getStatusDefinition(template)?.default;
	const resolvedStatus = defaultStatuses?.onResolved ?? getClosedStatuses(template, false)[0];

	const clashesToUpdate = [];
	const clashesToCreate = [];

	newClashes.forEach((clash) => {
		const clashId = String(clash.index);
		if (Object.hasOwn(clashIdToTicket, clashId)) {
			clashesToUpdate.push({
				_id: clashIdToTicket[clashId],
				data: generateTicketUpdate(clash, clashContext, defaultStatuses?.reopen ?? defaultStatus),
			});
			return;
		}

		clashesToCreate.push(generateTicket(clash, clashContext, defaultValues, defaultStatuses?.onNew));
	});

	resolvedClashes.forEach((clash) => {
		if (resolvedStatus === undefined) return;

		const clashId = String(clash.index);
		if (Object.hasOwn(clashIdToTicket, clashId)) {
			clashesToUpdate.push({
				_id: clashIdToTicket[clashId],
				data: generateStatusUpdate(resolvedStatus),
			});
		}
	});

	return { clashesToUpdate, clashesToCreate };
};

module.exports = TicketsClashes;
