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

const { addTicket, getAllTickets, getTicketById } = require('../../../../../models/tickets');
const { basePropertyLabels, modulePropertyLabels, presetModules, propTypes } = require('../../../../../schemas/tickets/templates.constants');
const { getFileWithMetaAsStream, storeFile } = require('../../../../../services/filesManager');
const { TICKETS_RESOURCES_COL } = require('../../../../../models/tickets.constants');
const { generateUUID } = require('../../../../../utils/helper/uuids');

const Tickets = {};

const extractEmbeddedBinary = (ticket, template) => {
	const binaryData = [];

	const replaceBinaryDataWithRef = (properties, propTemplate) => {
		propTemplate.forEach(({ type, name }) => {
			if (properties[name]) {
				const data = properties[name];
				if (type === propTypes.IMAGE) {
					const ref = generateUUID();
					// eslint-disable-next-line no-param-reassign
					properties[name] = ref;
					binaryData.push({ ref, data });
				} else if (type === propTypes.VIEW && data.screenshot) {
					const ref = generateUUID();
					const buffer = data.screenshot;
					data.screenshot = ref;
					binaryData.push({ ref, data: buffer });
				}
			}
		});
	};

	replaceBinaryDataWithRef(ticket.properties, template.properties);

	template.modules.forEach(({ properties, name, type }) => {
		const id = name ?? type;
		const module = ticket.modules[id];

		if (module) {
			replaceBinaryDataWithRef(module, properties);
		}
	});

	return binaryData;
};

Tickets.addTicket = async (teamspace, project, model, ticket, template) => {
	const binaryData = extractEmbeddedBinary(ticket, template);
	const res = await addTicket(teamspace, project, model, ticket);
	await Promise.all(
		binaryData.map(({ ref, data }) => storeFile(
			teamspace, TICKETS_RESOURCES_COL, ref, data, { teamspace, project, model, ticket: res },
		)),
	);

	return res;
};

Tickets.getTicketResourceAsStream = (teamspace, project, model, ticket, resource) => getFileWithMetaAsStream(
	teamspace, TICKETS_RESOURCES_COL, resource, { teamspace, project, model, ticket },
);

Tickets.getTicketById = getTicketById;

Tickets.getTicketList = (teamspace, project, model) => {
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

	const sort = { [`properties.${basePropertyLabels.Created_AT}`]: -1 };

	return getAllTickets(teamspace, project, model, projection, sort);
};

module.exports = Tickets;
