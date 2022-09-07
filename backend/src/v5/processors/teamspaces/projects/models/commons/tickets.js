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

const { addTicket, getTicketById, updateTicket } = require('../../../../../models/tickets');
const { getFileWithMetaAsStream, storeFile } = require('../../../../../services/filesManager');
const FilesManager = require('../../../../../services/filesManager');
const { TICKETS_RESOURCES_COL } = require('../../../../../models/tickets.constants');
const { generateUUID } = require('../../../../../utils/helper/uuids');
const { propTypes } = require('../../../../../schemas/tickets/templates.constants');

const Tickets = {};

const removeExistingFiles = async (teamspace, template, oldTicket, updatedTicket) => {
	const promises = [];

	const removeFiles = (templateProperties, oldProperties, newProperties) => {
		templateProperties.forEach(({ type, name }) => {
			let oldProp; 
			let	newProp;
			if (type === propTypes.IMAGE) {
				oldProp = oldProperties[name];
				newProp = newProperties[name];
			} else if (type === propTypes.VIEW) {
				oldProp = oldProperties[name]?.screenshot;
				newProp = newProperties[name];
			}

			if (oldProp && newProp !== undefined) {
				promises.push(FilesManager.removeFile(teamspace, TICKETS_RESOURCES_COL, oldProp));
			}
		});
	};

	removeFiles(template.properties, oldTicket.properties, updatedTicket.properties);

	template.modules.forEach(({ properties, name, type }) => {
		const id = name ?? type;
		const oldModule = oldTicket.modules?.[id];
		const updatedModule = updatedTicket.modules?.[id];
		if (oldModule && updatedModule) {
			removeFiles(properties, oldModule, updatedModule);
		}
	});

	await Promise.all(promises);
};

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
		const module = ticket.modules?.[id];

		if (module) {
			replaceBinaryDataWithRef(module, properties);
		}
	});

	return binaryData;
};

const storeFiles = (teamspace, project, model, ticket, binaryData) => Promise.all(
	binaryData.map(({ ref, data }) => storeFile(
		teamspace, TICKETS_RESOURCES_COL, ref, data, { teamspace, project, model, ticket },
	)),
);

Tickets.addTicket = async (teamspace, project, model, ticket, template) => {
	const binaryData = extractEmbeddedBinary(ticket, template);
	const res = await addTicket(teamspace, project, model, ticket);
	await storeFiles(teamspace, project, model, res, binaryData);
	return res;
};

Tickets.updateTicket = async (teamspace, project, model, template, oldTicket, updateData) => {
	await removeExistingFiles(teamspace, template, oldTicket, updateData);
	const binaryData = extractEmbeddedBinary(updateData, template);
	const ticketId = oldTicket._id;
	await updateTicket(teamspace, ticketId, updateData);
	await storeFiles(teamspace, project, model, ticketId, binaryData);
};

Tickets.getTicketResourceAsStream = (teamspace, project, model, ticket, resource) => getFileWithMetaAsStream(
	teamspace, TICKETS_RESOURCES_COL, resource, { teamspace, project, model, ticket },
);

Tickets.getTicketById = getTicketById;

module.exports = Tickets;
