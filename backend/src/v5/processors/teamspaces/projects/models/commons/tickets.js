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
const { addGroups, deleteGroups, getGroupsByIds } = require('./tickets.groups');
const { addTicketsWithTemplate, getAllTickets, getTicketById, updateTickets } = require('../../../../../models/tickets');
const {
	basePropertyLabels,
	modulePropertyLabels,
	presetModules,
	propTypes,
	viewGroups,
} = require('../../../../../schemas/tickets/templates.constants');
const { createResponseCode, templates } = require('../../../../../utils/responseCodes');
const { deleteIfUndefined, isEmpty } = require('../../../../../utils/helper/objects');
const { getFileWithMetaAsStream, removeFiles, storeFiles } = require('../../../../../services/filesManager');
const { getNestedProperty, setNestedProperty } = require('../../../../../utils/helper/objects');
const { TICKETS_RESOURCES_COL } = require('../../../../../models/tickets.constants');
const { events } = require('../../../../../services/eventsManager/eventsManager.constants');
const { generateFullSchema } = require('../../../../../schemas/tickets/templates');
const { getArrayDifference } = require('../../../../../utils/helper/arrays');
const { importComments } = require('./tickets.comments');
const { isUUID } = require('../../../../../utils/helper/typeCheck');
const { publish } = require('../../../../../services/eventsManager/eventsManager');

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
const processSpecialProperties = (template, oldTickets, updatedTickets) => {
	const fullTemplate = generateFullSchema(template);

	const res = [];

	const updateReferences = (templateProperties, externalReferences, oldProperties = {}, updatedProperties = {}) => {
		templateProperties.forEach(({ type, name }) => {
			const processImageUpdate = (field) => {
				const oldProp = field ? getNestedProperty(oldProperties[name], field) : oldProperties[name];
				const newProp = field ? getNestedProperty(updatedProperties[name], field) : updatedProperties[name];

				if (oldProp && newProp !== undefined) {
					externalReferences.binaries.toRemove.push(oldProp);
				}

				if (newProp) {
					const ref = generateUUID();
					if (field) {
						setNestedProperty(updatedProperties[name], field, ref);
					} else {
						// eslint-disable-next-line no-param-reassign
						updatedProperties[name] = ref;
					}
					externalReferences.binaries.toAdd.push({ ref, data: newProp });
				}
			};

			if (type === propTypes.IMAGE) {
				processImageUpdate();
			} else if (type === propTypes.VIEW) {
				// Make constants out of these
				processImageUpdate('screenshot');
				processGroupsUpdate(oldProperties[name], updatedProperties[name],
					Object.values(viewGroups).map((groupName) => `state.${groupName}`),
					externalReferences.groups);
			}
		});
	};

	const isUpdate = !!oldTickets?.length;
	updatedTickets.forEach((updateData, i) => {
		const externalReferences = {
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

		updateReferences(fullTemplate.properties, externalReferences,
			isUpdate ? oldTickets[i]?.properties : undefined, updateData.properties);

		res.push(externalReferences);
	});

	fullTemplate.modules.forEach(({ properties, name, type }) => {
		const id = name ?? type;
		updatedTickets.forEach((updateData, i) => {
			updateReferences(properties, res[i],
				isUpdate ? oldTickets[i]?.modules?.[id] : undefined, updateData?.modules?.[id]);
		});
	});

	return res.map(({ groups: { toRemove, old, stillUsed, ...otherGroups }, ...others }) => {
		const toRemoveCalculated = getArrayDifference(Array.from(stillUsed),
			Array.from(old)).map(stringToUUID);

		return { groups: { toRemove: toRemoveCalculated, stillUsed, ...otherGroups }, ...others };
	});
};

const processExternalData = async (teamspace, project, model, ticketIds, data) => {
	const refsToRemove = [];
	const binariesToSave = [];
	await Promise.all(ticketIds.map(async (ticketId, i) => {
		const { binaries, groups } = data[i];

		if (groups.stillUsed.size) {
			const stillUsed = Array.from(groups.stillUsed);
			const existingGroups = await getGroupsByIds(teamspace, project, model, ticketId,
				stillUsed.map(stringToUUID), { _id: 1 });

			if (existingGroups.length !== stillUsed.length) {
				const notFoundGroups = getArrayDifference(existingGroups.map(({ _id }) => UUIDToString(_id)),
					stillUsed);
				throw createResponseCode(templates.invalidArguments, `The following groups are not found: ${notFoundGroups.join(',')}`);
			}
		}

		refsToRemove.push(...binaries.toRemove);

		binariesToSave.push(...binaries.toAdd.map(({ ref, data: bin }) => ({
			id: ref, data: bin, meta: { teamspace, project, model, ticket: ticketId } })));

		await Promise.all([
			groups.toAdd.length ? addGroups(teamspace, project, model, ticketId, groups.toAdd) : Promise.resolve(),
			groups.toRemove.length ? deleteGroups(teamspace, project, model, ticketId,
				groups.toRemove) : Promise.resolve(),
		]);
	}));

	const promsToWait = [];

	if (refsToRemove.length) promsToWait.push(removeFiles(teamspace, TICKETS_RESOURCES_COL, refsToRemove));
	if (binariesToSave.length) promsToWait.push(storeFiles(teamspace, TICKETS_RESOURCES_COL, binariesToSave));

	await Promise.all(promsToWait);
};

const processNewTickets = async (teamspace, project, model, template, tickets) => {
	const externalDataDelta = processSpecialProperties(template, undefined, tickets);
	const res = await addTicketsWithTemplate(teamspace, project, model, template._id, tickets);
	await processExternalData(teamspace, project, model, res.map(({ _id }) => _id), externalDataDelta);
	return res;
};

Tickets.importTickets = async (teamspace, project, model, template, tickets, author) => {
	const savedTickets = await processNewTickets(teamspace, project, model, template,
		tickets.map(({ comments, ...others }) => others));

	const ids = [];
	const commentsByTickets = tickets.flatMap(({ comments }, i) => {
		ids.push(savedTickets[i]._id);
		return comments?.length ? { ticket: savedTickets[i]._id, comments } : [];
	});

	if (commentsByTickets.length) await importComments(teamspace, project, model, commentsByTickets, author);

	publish(events.TICKETS_IMPORTED,
		{ teamspace,
			project,
			model,
			tickets: savedTickets,
			author,
		});

	return ids;
};

Tickets.addTicket = async (teamspace, project, model, template, ticket) => {
	const [savedTicket] = await processNewTickets(teamspace, project, model, template, [ticket]);
	publish(events.NEW_TICKET,
		{ teamspace,
			project,
			model,
			ticket: savedTicket,
		});
	return savedTicket._id;
};

Tickets.updateTicket = async (teamspace, project, model, template, oldTicket, updateData, author) => {
	const externalDataDelta = processSpecialProperties(template, [oldTicket], [updateData]);
	const changeSet = await updateTickets(teamspace, project, model, [oldTicket], [updateData], author);
	await processExternalData(teamspace, project, model, [oldTicket._id], externalDataDelta);

	if (changeSet.length) {
		const data = changeSet[0];
		publish(events.UPDATE_TICKET, {
			teamspace,
			project,
			model,
			...data });
	}
};

Tickets.updateManyTickets = async (teamspace, project, model, template, oldTickets, updateData, author) => {
	const commentsByTickets = [];
	const dataWithoutComments = updateData.map(({ comments, _id, ...others }, i) => {
		if (comments?.length) {
			commentsByTickets.push({ ticket: oldTickets[i]._id, comments });
		}

		return others;
	});

	const commentsPromises = commentsByTickets.length
		? importComments(teamspace, project, model, commentsByTickets, author) : Promise.resolve();

	const externalDataDelta = processSpecialProperties(template, oldTickets, dataWithoutComments);
	const changeSet = await updateTickets(teamspace, project, model, oldTickets, dataWithoutComments, author);
	await Promise.all([
		processExternalData(teamspace, project, model, oldTickets.map(({ _id }) => _id), externalDataDelta),
		commentsPromises,
	]);

	changeSet.forEach((data) => {
		if (!isEmpty(data.changes)) {
			publish(events.UPDATE_TICKET, {
				teamspace,
				project,
				model,
				...data });
		}
	});
};

Tickets.getTicketResourceAsStream = (teamspace, project, model, ticket, resource) => getFileWithMetaAsStream(
	teamspace, TICKETS_RESOURCES_COL, resource, { teamspace, project, model, ticket },
);

Tickets.getTicketById = getTicketById;

const propertyToFilterName = (property) => {
	if (property.includes('.')) {
		const [moduleName, moduleProp] = property.split('.');
		if (moduleName && moduleProp) {
			return `modules.${property}`;
		}
		return undefined;
	}
	return `properties.${property}`;
};

const filtersToProjection = (filters) => {
	const projectionObject = {};

	filters.forEach((name) => {
		if (name) {
			const nameSanitised = propertyToFilterName(name);
			if (nameSanitised) projectionObject[nameSanitised] = 1;
		}
	});

	return projectionObject;
};

Tickets.getTicketList = (teamspace, project, model,
	{ filters = [], updatedSince, sortBy, sortDesc }) => {
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
	let sort;

	if (sortBy && propertyToFilterName(sortBy)) {
		sort = { [propertyToFilterName(sortBy)]: sortDesc ? -1 : 1 };
	}

	return getAllTickets(teamspace, project, model, deleteIfUndefined({ projection, updatedSince, sort }));
};

module.exports = Tickets;
