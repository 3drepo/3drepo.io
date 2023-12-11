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

const { UUIDToString, generateUUID, stringToUUID } = require('../../../../../utils/helper/uuids');
const { addTicket, getAllTickets, getTicketById, updateTicket } = require('../../../../../models/tickets');
const {
	basePropertyLabels,
	modulePropertyLabels,
	presetModules,
	propTypes,
	viewGroups,
} = require('../../../../../schemas/tickets/templates.constants');
const { createResponseCode, templates } = require('../../../../../utils/responseCodes');
const { deleteGroups, getGroupsByIds } = require('../../../../../models/tickets.groups');
const { getFileWithMetaAsStream, removeFile, storeFile } = require('../../../../../services/filesManager');
const { getNestedProperty, setNestedProperty } = require('../../../../../utils/helper/objects');
const { TICKETS_RESOURCES_COL } = require('../../../../../models/tickets.constants');
const { addGroups } = require('./tickets.groups');
const { generateFullSchema } = require('../../../../../schemas/tickets/templates');
const { getArrayDifference } = require('../../../../../utils/helper/arrays');
const { isUUID } = require('../../../../../utils/helper/typeCheck');

const Tickets = {};

const processGroupsUpdate = (oldData, newData, fields, groupsState) => {
	fields.forEach((fieldName) => {
		const oldProp = getNestedProperty(oldData, fieldName) ?? [];
		const newProp = getNestedProperty(newData, fieldName) ?? [];

		oldProp.forEach(({ group }) => {
			groupsState.old.add(UUIDToString(group));

			if (newData === undefined || (newData && newData.state === undefined)) {
				// New data is not specified so we are preserving the old ones
				groupsState.stillUsed.add(UUIDToString(group));
			}
		});

		newProp.forEach((propData) => {
			const { group } = propData;
			if (isUUID(group)) {
				groupsState.stillUsed.add(UUIDToString(group));
			} else {
				const groupId = generateUUID();
				groupsState.toAdd.push({ ...group, _id: groupId });
				// eslint-disable-next-line no-param-reassign
				propData.group = groupId;
			}
		});
	});
};

/**
 * Special properties:
 *  Images - images comes in as a base64 string within the JSON object, but we store this separate. A UUID reference is created and replaces thes the image entry, and
 *           the image itself will be stored via filesManager
 *  Groups - Groups will come in embedded, however we will store the group separately with a group id as reference
 */
const processSpecialProperties = (template, oldTicket, updatedTicket) => {
	const fullTemplate = generateFullSchema(template);

	const res = {
		binaries: {
			toRemove: [],
			toAdd: [],
		},
		groups: {
			toAdd: [],
			old: new Set(),
			stillUsed: new Set(),
		},
	};

	const updateReferences = (templateProperties, oldProperties = {}, updatedProperties = {}) => {
		templateProperties.forEach(({ type, name }) => {
			const processImageUpdate = (field) => {
				const oldProp = field ? getNestedProperty(oldProperties[name], field) : oldProperties[name];
				const newProp = field ? getNestedProperty(updatedProperties[name], field) : updatedProperties[name];

				if (oldProp && newProp !== undefined) {
					res.binaries.toRemove.push(oldProp);
				}

				if (newProp) {
					const ref = generateUUID();
					if (field) {
						setNestedProperty(updatedProperties[name], field, ref);
					} else {
						// eslint-disable-next-line no-param-reassign
						updatedProperties[name] = ref;
					}
					res.binaries.toAdd.push({ ref, data: newProp });
				}
			};

			if (type === propTypes.IMAGE) {
				processImageUpdate();
			} else if (type === propTypes.VIEW) {
				// Make constants out of these
				processImageUpdate('screenshot');
				processGroupsUpdate(oldProperties[name], updatedProperties[name],
					Object.values(viewGroups).map((groupName) => `state.${groupName}`),
					res.groups);
			}
		});
	};

	updateReferences(fullTemplate.properties, oldTicket?.properties, updatedTicket.properties);

	fullTemplate.modules.forEach(({ properties, name, type }) => {
		const id = name ?? type;
		updateReferences(properties, oldTicket?.modules?.[id], updatedTicket?.modules?.[id]);
	});

	res.groups.toRemove = getArrayDifference(Array.from(res.groups.stillUsed),
		Array.from(res.groups.old)).map(stringToUUID);

	delete res.groups.old;

	return res;
};

const storeFiles = (teamspace, project, model, ticket, binaryData) => Promise.all(
	binaryData.map(({ ref, data }) => storeFile(
		teamspace, TICKETS_RESOURCES_COL, ref, data, { teamspace, project, model, ticket },
	)),
);

const processExternalData = async (teamspace, project, model, ticketId, { binaries, groups }) => {
	const stillUsed = Array.from(groups.stillUsed);
	if (stillUsed.length) {
		const existingGroups = await getGroupsByIds(teamspace, project, model, ticketId,
			stillUsed.map(stringToUUID), { _id: 1 });

		if (existingGroups.length !== stillUsed.length) {
			const notFoundGroups = getArrayDifference(existingGroups.map(({ _id }) => UUIDToString(_id)),
				stillUsed);
			throw createResponseCode(templates.invalidArguments, `The following groups are not found: ${notFoundGroups.join(',')}`);
		}
	}

	await Promise.all([
		binaries.toRemove.map((ref) => removeFile(teamspace, TICKETS_RESOURCES_COL, ref)),
		storeFiles(teamspace, project, model, ticketId, binaries.toAdd),
		groups.toAdd.length ? addGroups(teamspace, project, model, ticketId, groups.toAdd) : Promise.resolve(),
		groups.toRemove.length ? deleteGroups(teamspace, project, model, ticketId, groups.toRemove) : Promise.resolve(),
	]);
};

Tickets.addTicket = async (teamspace, project, model, template, ticket) => {
	const externalDataDelta = processSpecialProperties(template, undefined, ticket);
	const res = await addTicket(teamspace, project, model, ticket);
	await processExternalData(teamspace, project, model, res, externalDataDelta);
	return res;
};

Tickets.updateTicket = async (teamspace, project, model, template, oldTicket, updateData, author) => {
	const externalDataDelta = processSpecialProperties(template, oldTicket, updateData);
	await updateTicket(teamspace, project, model, oldTicket, updateData, author);
	await processExternalData(teamspace, project, model, oldTicket._id, externalDataDelta);
};

Tickets.getTicketResourceAsStream = (teamspace, project, model, ticket, resource) => getFileWithMetaAsStream(
	teamspace, TICKETS_RESOURCES_COL, resource, { teamspace, project, model, ticket },
);

Tickets.getTicketById = getTicketById;

const filtersToProjection = (filters) => {
	const projectionObject = {};

	filters.forEach((name) => {
		if (name) {
			if (name.includes('.')) {
				const [moduleName, moduleProp] = name.split('.');
				if (moduleName && moduleProp) {
					projectionObject[`modules.${name}`] = 1;
				}
			} else {
				projectionObject[`properties.${name}`] = 1;
			}
		}
	});

	return projectionObject;
};

Tickets.getTicketList = (teamspace, project, model, filters = []) => {
	const { SAFETIBASE, SEQUENCING } = presetModules;
	const {
		[SAFETIBASE]: safetibaseProps,
		[SEQUENCING]: seqProps,
	} = modulePropertyLabels;

	const projection = {
		_id: 1,
		title: 1,
		number: 1,
		type: 1,
		...filtersToProjection(filters),
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

	const sort = { [`properties.${basePropertyLabels.Created_AT}`]: -1 };

	return getAllTickets(teamspace, project, model, projection, sort);
};

module.exports = Tickets;
