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

const { addTicket, getAllTickets, getTicketById, updateTicket } = require('../../../../../models/tickets');
const { basePropertyLabels, modulePropertyLabels, presetModules, propTypes } = require('../../../../../schemas/tickets/templates.constants');
const { getFileWithMetaAsStream, removeFile, storeFile } = require('../../../../../services/filesManager');
const { TICKETS_RESOURCES_COL } = require('../../../../../models/tickets.constants');
const { generateFullSchema } = require('../../../../../schemas/tickets/templates');
const { generateUUID } = require('../../../../../utils/helper/uuids');

const Tickets = {};

/**
 * Special properties:
 *  Images - images comes in as a base64 string within the JSON object, but we store this separate. A UUID reference is created and replaces thes the image entry, and
 *           the image itself will be stored via filesManager
 *  Groups - Groups will come in embedded, however we will store the group separately with a group id as reference
 */
const processSpecialProperties = (template, oldTicket, updatedTicket) => {
	const toRemove = [];
	const toAdd = [];

	const fullTemplate = generateFullSchema(template);

	const updateReferences = (templateProperties, oldProperties = {}, updatedProperties = {}) => {
		templateProperties.forEach(({ type, name }) => {
			const processUpdate = (oldProp, newProp) => {
				if (oldProp && newProp !== undefined) {
					toRemove.push(oldProp);
				}

				if (newProp) {
					const ref = generateUUID();
					// eslint-disable-next-line no-param-reassign
					updatedProperties[name] = type === propTypes.IMAGE
						? ref : { ...updatedProperties[name], screenshot: ref };
					toAdd.push({ ref, data: newProp });
				}
			};

			if (type === propTypes.IMAGE) {
				processUpdate(oldProperties[name], updatedProperties[name]);
			} else if (type === propTypes.VIEW) {
				processUpdate(oldProperties[name]?.screenshot, updatedProperties[name]?.screenshot);
			}
		});
	};

	updateReferences(fullTemplate.properties, oldTicket?.properties, updatedTicket.properties);

	fullTemplate.modules.forEach(({ properties, name, type }) => {
		const id = name ?? type;
		updateReferences(properties, oldTicket?.modules?.[id], updatedTicket?.modules?.[id]);
	});

	return { toRemove, toAdd };
};

const storeFiles = (teamspace, project, model, ticket, binaryData) => Promise.all(
	binaryData.map(({ ref, data }) => storeFile(
		teamspace, TICKETS_RESOURCES_COL, ref, data, { teamspace, project, model, ticket },
	)),
);

Tickets.addTicket = async (teamspace, project, model, template, ticket) => {
	const { toAdd } = processSpecialProperties(template, undefined, ticket);
	const res = await addTicket(teamspace, project, model, ticket);
	await storeFiles(teamspace, project, model, res, toAdd);
	return res;
};

Tickets.updateTicket = async (teamspace, project, model, template, oldTicket, updateData, author) => {
	const { toAdd, toRemove } = processSpecialProperties(template, oldTicket, updateData);
	await updateTicket(teamspace, project, model, oldTicket, updateData, author);
	await Promise.all([
		toRemove.map((ref) => removeFile(teamspace, TICKETS_RESOURCES_COL, ref)),
		storeFiles(teamspace, project, model, oldTicket._id, toAdd),
	]);
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
