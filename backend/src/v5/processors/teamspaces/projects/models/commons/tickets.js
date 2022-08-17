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
const { TICKETS_RESOURCES_COL } = require('../../../../../models/tickets.constants');
const { addTicket } = require('../../../../../models/tickets');
const { generateUUIDString } = require('../../../../../utils/helper/uuids');
const { propTypes } = require('../../../../../schemas/tickets/templates.constants');
const { storeFile } = require('../../../../../services/filesManager');

const Tickets = {};

const extractEmbeddedBinary = (ticket, template) => {
	const binaryData = [];

	const replaceBinaryDataWithRef = (properties, propTemplate) => {
		propTemplate.forEach(({ type, name }) => {
			if (properties[name]) {
				const data = properties[name];
				if (type === propTypes.IMAGE) {
					const ref = generateUUIDString();
					// eslint-disable-next-line no-param-reassign
					properties[name] = ref;
					binaryData.push({ ref, data });
				} else if (type === propTypes.VIEW && data.screenshot) {
					const ref = generateUUIDString();
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
	const [res] = await Promise.all([
		addTicket(teamspace, project, model, ticket),
		...binaryData.map(({ ref, data }) => storeFile(
			teamspace, TICKETS_RESOURCES_COL, ref, data, { teamspace, project, model },
		)),
	]);

	return res;
};

module.exports = Tickets;
