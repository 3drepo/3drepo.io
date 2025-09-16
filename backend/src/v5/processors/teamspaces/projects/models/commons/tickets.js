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

const { TICKETS_RESOURCES_COL, operatorToQuery } = require('../../../../../models/tickets.constants');
const { UUIDToString, generateUUID, stringToUUID } = require('../../../../../utils/helper/uuids');
const { addTicketsWithTemplate, getAllTickets, getTicketById, getTicketsByFilter, getTicketsByQuery, getTicketsByTemplateId, updateTickets } = require('../../../../../models/tickets');
const {
	basePropertyLabels,
	modulePropertyLabels,
	presetModules,
	supportedPatterns,
} = require('../../../../../schemas/tickets/templates.constants');
const { commitGroupChanges, processGroupsUpdate } = require('./tickets.groups');
const { cloneDeep, deleteIfUndefined, isEmpty } = require('../../../../../utils/helper/objects');
const { getAllTemplates, getTemplatesByQuery } = require('../../../../../models/tickets.templates');
const { getNestedProperty, setNestedProperty } = require('../../../../../utils/helper/objects');
const { propTypes, viewGroups } = require('../../../../../schemas/tickets/templates.constants');
const { removeFiles, storeFiles } = require('../../../../../services/filesManager');
const { events } = require('../../../../../services/eventsManager/eventsManager.constants');
const { generateFullSchema } = require('../../../../../schemas/tickets/templates');
const { getArrayDifference } = require('../../../../../utils/helper/arrays');
const { getClosedStatuses } = require('../../../../../schemas/tickets/templates');
const { getFileWithMetaAsStream } = require('../../../../../services/filesManager');
const { importComments } = require('./tickets.comments');
const { isBuffer } = require('../../../../../utils/helper/typeCheck');
const { publish } = require('../../../../../services/eventsManager/eventsManager');
const { specialQueryFields } = require('../../../../../schemas/tickets/tickets.filters');
const { getModelById } = require('../../../../../models/modelSettings');

const Tickets = {};

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
			const processImageUpdate = (isArray, field) => {
				const oldProp = field ? getNestedProperty(oldProperties[name], field) : oldProperties[name];
				const newProp = field ? getNestedProperty(updatedProperties[name], field) : updatedProperties[name];

				if (oldProp && newProp !== undefined) {
					const idsToRemove = isArray
						? getArrayDifference(newProp?.map(UUIDToString), oldProp.map(UUIDToString)).map(stringToUUID)
						: [oldProp];

					externalReferences.binaries.toRemove.push(...idsToRemove);
				}

				if (newProp) {
					const getRefFromBuffer = (data) => {
						if (isBuffer(data)) {
							const ref = generateUUID();
							externalReferences.binaries.toAdd.push({ ref, data });
							return ref;
						}

						return data;
					};

					if (isArray) {
						// eslint-disable-next-line no-param-reassign
						updatedProperties[name] = newProp.map(getRefFromBuffer);
					} else if (field) {
						setNestedProperty(updatedProperties[name], field, getRefFromBuffer(newProp));
					} else {
						// eslint-disable-next-line no-param-reassign
						updatedProperties[name] = getRefFromBuffer(newProp);
					}
				}
			};

			if (type === propTypes.IMAGE) {
				processImageUpdate();
			} else if (type === propTypes.VIEW) {
				// Make constants out of these
				processImageUpdate(false, 'screenshot');
				processGroupsUpdate(oldProperties[name], updatedProperties[name],
					Object.values(viewGroups).map((groupName) => `state.${groupName}`),
					externalReferences.groups);
			} else if (type === propTypes.IMAGE_LIST) {
				processImageUpdate(true);
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

	return res;
};

const processExternalData = async (teamspace, project, model, ticketIds, data) => {
	const refsToRemove = [];
	const binariesToSave = [];

	await Promise.all(ticketIds.map(async (ticketId, i) => {
		const { binaries, groups } = data[i];

		refsToRemove.push(...binaries.toRemove);

		binariesToSave.push(...binaries.toAdd.map(({ ref, data: bin }) => ({
			id: ref, data: bin, meta: { teamspace, project, model, ticket: ticketId },
		})));

		await commitGroupChanges(teamspace, project, model, ticketId, groups);
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
		{
			teamspace,
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
		{
			teamspace,
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
			...data,
		});
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
				...data,
			});
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

const getQueryInfoFromQueryFilters = async (teamspace, queryFilters) => {
	const queries = [];
	let templateQuery;
	let ticketCodeQuery;

	queryFilters.forEach(({ propertyName, operator, value }) => {
		if (propertyName === specialQueryFields.TEMPLATE) {
			templateQuery = operatorToQuery[operator]('code', value);
		} else if (propertyName === specialQueryFields.TICKET_CODE) {
			ticketCodeQuery = operatorToQuery[operator](propertyName, value);
		} else {
			queries.push({ ...operatorToQuery[operator](propertyName, value) });
		}
	});

	if (templateQuery) {
		const temps = await getTemplatesByQuery(teamspace, templateQuery, { _id: 1 });
		queries.push({ type: { $in: temps.map(({ _id }) => _id) } });
	}

	return {
		query: queries.length ? { $and: queries } : {},
		ticketCodeQuery,
	};
};

Tickets.getTicketList = async (teamspace, project, model,
	{ filters = [], queryFilters = [], updatedSince, sortBy, sortDesc, limit, skip }) => {
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
	if (queryFilters.length) {
		const queryInfo = await getQueryInfoFromQueryFilters(teamspace, queryFilters);

		return getTicketsByFilter(teamspace, project, model,
			deleteIfUndefined({ projection, updatedSince, sort, limit, skip, ...queryInfo }));
	}

	return getAllTickets(teamspace, project, model,
		deleteIfUndefined({ projection, updatedSince, sort, limit, skip }));
};

Tickets.getOpenTicketsCount = async (teamspace, project, model) => {
	const tickets = await getAllTickets(teamspace, project, model, {
		projection: { type: 1, [`properties.${basePropertyLabels.STATUS}`]: 1 },
	});

	let openTicketsCount = 0;

	const allTemplates = await getAllTemplates(teamspace, true, { _id: 1, config: 1 });

	const templateToClosedStatuses = allTemplates.reduce((obj, { _id, config }) => {
		const closedStatuses = getClosedStatuses({ config });

		return { ...obj, [UUIDToString(_id)]: closedStatuses };
	}, {});

	for (let i = 0; i < tickets.length; i++) {
		const ticket = tickets[i];

		if (!templateToClosedStatuses[UUIDToString(ticket.type)].includes(ticket.properties.Status)) {
			openTicketsCount++;
		}
	}

	return openTicketsCount;
};

// placeholdersToFind should be left undfined if we want to replace all placeholders
const findPropertiesToUpdate = (template, placeholdersToFind) => {
	const propertiesToUpdate = [];

	const findProps = (props, moduleName) => {
		const modulePrefix = moduleName ? `modules.${moduleName}.` : 'properties.';
		props.forEach(({ name, value }) => {
			if (value !== undefined) {
				if (placeholdersToFind) {
					const found = placeholdersToFind.some((ph) => value.includes(`{${ph}}`));
					if (found) {
						propertiesToUpdate.push({ name: `${modulePrefix}${name}`, value });
					}
				} else {
					propertiesToUpdate.push({ name: `${modulePrefix}${name}`, value });
				}
			}
		});
	};

	findProps(template.properties);
	template.modules.forEach(({ name, properties }) => {
		findProps(properties, name);
	});

	return propertiesToUpdate;
};

const updatePropertiesWithAutomatedValue = async (teamspace, tickets, template, propertiesToUpdate) => {
	const patternToVal = {};
	const updatedTickets = tickets.map((ticket) => cloneDeep(ticket));

	const modelIdToName = {};
	const modelToUpdates = {};

	patternToVal[supportedPatterns.TEMPLATE_CODE] = template.code;

	for (let i = 0; i < tickets.length; i++) {
		const ticket = tickets[i];
		const ticketData = {};
		patternToVal[supportedPatterns.TICKET_NUMBER] = ticket.number;
		if (!modelIdToName[ticket.model]) {
			// eslint-disable-next-line no-await-in-loop
			const model = await getModelById(teamspace, ticket.model, { name: 1 });

			modelIdToName[ticket.model] = model.name;
			modelToUpdates[ticket.model] = {
				project: ticket.project,
				model: ticket.model,
				tickets: [],
				update: [],
			};
		}
		patternToVal[supportedPatterns.MODEL_NAME] = modelIdToName[ticket.model];

		propertiesToUpdate.forEach(({ name, value }) => {
			let updatedVal = value;
			Object.keys(patternToVal).forEach((patternVal) => {
				updatedVal = updatedVal.replaceAll(`{${patternVal}}`, patternToVal[patternVal]);
			});
			setNestedProperty(ticketData, name, updatedVal);
			setNestedProperty(updatedTickets[i], name, updatedVal);
		});
		modelToUpdates[ticket.model].update.push(ticketData);
		modelToUpdates[ticket.model].tickets.push(ticket);
	}

	await Promise.all(Object.values(modelToUpdates).map(
		async ({ project, model, tickets: oldTickets, update: updateData }) => {
			await updateTickets(teamspace, project, model, oldTickets, updateData, 'system');
		}));

	return updatedTickets;
};

const updatePropertiesWithPattern = async (teamspace, project, model, template, pattern) => {
	const propertiesToUpdate = findPropertiesToUpdate(template, [pattern]);

	if (propertiesToUpdate.length) {
		const projection = { _id: 1, number: 1, project: 1, model: 1 };
		let tickets;
		if (project && model) {
			tickets = await getTicketsByQuery(teamspace, project, model,
				{ type: template._id }, projection);
		} else {
			tickets = await getTicketsByTemplateId(teamspace, template._id, projection);
		}

		if (tickets.length) {
			await updatePropertiesWithAutomatedValue(teamspace,
				tickets, template, propertiesToUpdate);
		}
	}
};

Tickets.onModelNameUpdated = async (teamspace, project, model) => {
	const templates = await getTemplatesByQuery(teamspace, { $or: [
		{ 'properties.value': { $regex: `{${supportedPatterns.MODEL_NAME}}` } },
		{ 'modules.properties.value': { $regex: `{${supportedPatterns.MODEL_NAME}}` } },
	] });

	await Promise.all(templates.map(async (template) => {
		await updatePropertiesWithPattern(teamspace, project, model, template, supportedPatterns.MODEL_NAME);
	}));
};

Tickets.onTemplateCodeUpdated = async (teamspace, template) => {
	await updatePropertiesWithPattern(teamspace, undefined, undefined, template, supportedPatterns.TEMPLATE_CODE);
};

Tickets.initialiseAutomatedProperties = async (teamspace, project, model, tickets, template) => {
	const propertiesToUpdate = findPropertiesToUpdate(template);
	if (propertiesToUpdate.length) {
		const updatedTickets = await updatePropertiesWithAutomatedValue(
			teamspace, tickets.map((ticket) => ({ project, model, ...ticket })), template, propertiesToUpdate);
		return updatedTickets;
	}

	return tickets;
};

module.exports = Tickets;
