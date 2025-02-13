/**
 *  Copyright (C) 2025 3D Repo Ltd
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

const { getTeamspaceList, getCollectionsEndsWith } = require('../../utils');

const { v5Path } = require('../../../interop');

const DBHandler = require(`${v5Path}/handler/db`);
const { getAllTemplates } = require(`${v5Path}/models/tickets.templates`);
const { basePropertyLabels, presetEnumValues, propTypes } = require(`${v5Path}/schemas/tickets/templates.constants`);
const { deleteIfUndefined, isEmpty } = require(`${v5Path}/utils/helper/objects`);
const { isArray } = require(`${v5Path}/utils/helper/typeCheck`);
const { UUIDToString, stringToUUID } = require(`${v5Path}/utils/helper/uuids`);
const { createRoles, getRoles, createIndex } = require(`${v5Path}/models/roles`);
const { generateUUID } = require(`${v5Path}/utils/helper/uuids`);
const { logger } = require(`${v5Path}/utils/logger`);
const { actions } = require(`${v5Path}/teamspaces.audits.constants`);

const updateActivityLogs = async (teamspace, roleNamesToIds) => {
	const logUpdates = [];
	const query = { $and: [{ action: { $in: [actions.INVITATION_ADDED, actions.INVITATION_REVOKED] } }, { 'data.job': { $exists: true } }] };
	const logs = await DBHandler.find(teamspace, 'auditing', query, { data: 1 });

	logs.forEach(({ _id, data }) => {
		if (roleNamesToIds[data.job]) {
			logUpdates.push({ updateOne: { filter: { _id }, update: { $set: { 'data.role': roleNamesToIds[data.job] }, $unset: { 'data.job': 1 } } } });
		}
	});

	if (logUpdates.length) {
		await DBHandler.bulkWrite(teamspace, 'auditing', logUpdates);
	}
};

const updateTicketLogs = async (teamspace, ticketIds, ticketsToTemplates, templateToRoleProps, roleNamesToIds) => {
	const logUpdates = [];
	const logs = await DBHandler.find(teamspace, 'tickets.logs', { ticket: { $in: ticketIds } });

	const addLogUpdate = (propValue, propPath, logUpdate) => {
		if (isArray(propValue)) {
			let roleConverted = false;

			const updatedValue = propValue.map((valueItem) => {
				roleConverted = roleConverted || roleNamesToIds[valueItem];
				return roleNamesToIds[valueItem] || valueItem;
			});

			if (roleConverted) {
				// eslint-disable-next-line no-param-reassign
				logUpdate[propPath] = updatedValue;
			}
		} else {
			const roleId = roleNamesToIds[propValue];
			if (roleId) {
				// eslint-disable-next-line no-param-reassign
				logUpdate[propPath] = stringToUUID(roleId);
			}
		}
	};

	logs.forEach((log) => {
		const logUpdate = {};

		const template = ticketsToTemplates[UUIDToString(log.ticket)];
		const roleProps = templateToRoleProps[template];

		roleProps.forEach(({ moduleName, propertyName }) => {
			const propValue = moduleName
				? log.changes?.modules?.[moduleName]?.[propertyName]
				: log.changes?.properties?.[propertyName];

			if (!propValue) {
				return;
			}
			const propPath = `changes.${moduleName ? `modules.${moduleName}` : 'properties'}.${propertyName}`;

			addLogUpdate(propValue.from, `${propPath}.from`, logUpdate);
			addLogUpdate(propValue.to, `${propPath}.to`, logUpdate);
		});

		if (!isEmpty(logUpdate)) {
			logUpdates.push({ updateOne: { filter: { _id: log._id }, update: { $set: logUpdate } } });
		}
	});

	if (logUpdates.length) {
		await DBHandler.bulkWrite(teamspace, 'tickets.logs', logUpdates);
	}
};

const updateTicketProperties = async (teamspace, templateToRoleProps, roleNamesToIds) => {
	const ticketsToTemplates = {};
	const ticketIds = [];
	const ticketUpdates = [];

	const affectedTickets = await DBHandler.find(teamspace, 'tickets',
		{ teamspace, type: { $in: Object.keys(templateToRoleProps).map(stringToUUID) } },
		{ type: 1, properties: 1, modules: 1 });

	affectedTickets.forEach((ticket) => {
		ticketIds.push(ticket._id);
		ticketsToTemplates[UUIDToString(ticket._id)] = UUIDToString(ticket.type);

		const ticketUpdate = {};

		const roleProps = templateToRoleProps[UUIDToString(ticket.type)];
		roleProps.forEach(({ moduleName, propertyName }) => {
			const propValue = moduleName ? ticket.modules[moduleName]?.[propertyName] : ticket.properties[propertyName];

			if (!propValue) {
				return;
			}

			const propPath = moduleName ? `modules.${moduleName}.${propertyName}` : `properties.${propertyName}`;

			if (isArray(propValue)) {
				let roleConverted = false;

				const updatedValue = propValue.map((valueItem) => {
					roleConverted = roleConverted || roleNamesToIds[valueItem];
					return roleNamesToIds[valueItem] || valueItem;
				});

				if (roleConverted) {
					ticketUpdate[propPath] = updatedValue;
				}
			} else {
				const roleId = roleNamesToIds[propValue];
				if (roleId) {
					ticketUpdate[propPath] = roleId;
				}
			}
		});

		if (!isEmpty(ticketUpdate)) {
			ticketUpdates.push({ updateOne: { filter: { _id: ticket._id }, update: { $set: ticketUpdate } } });
		}
	});

	if (ticketUpdates.length) {
		await DBHandler.bulkWrite(teamspace, 'tickets', ticketUpdates);
	}

	return { ticketIds, ticketsToTemplates };
};

const updateTemplateProperties = async (teamspace) => {
	const templates = await getAllTemplates(teamspace, true, { properties: 1, modules: 1, config: 1 });
	const templateToRoleProps = {};

	const templateUpdates = [];

	const updateTemplateProps = (templateId, moduleName, moduleIndex, properties, templateUpdate) => {
		properties.forEach((prop, index) => {
			if ((prop.type === propTypes.ONE_OF || prop.type === propTypes.MANY_OF) && prop.values === 'jobsAndUsers') {
				if (!templateToRoleProps[templateId]) {
					templateToRoleProps[templateId] = [];
				}

				templateToRoleProps[templateId].push(deleteIfUndefined({ moduleName, propertyName: prop.name }));

				const path = moduleName ? `modules.${moduleIndex}.properties.${index}.values` : `properties.${index}.values`;
				// eslint-disable-next-line no-param-reassign
				templateUpdate[path] = presetEnumValues.ROLES_AND_USERS;
			}
		});
	};

	templates.forEach((template) => {
		const templateUpdate = {};
		const templateId = UUIDToString(template._id);

		if (template.config.issueProperties) {
			templateToRoleProps[templateId] = [{ propertyName: basePropertyLabels.ASSIGNEES }];
		}

		updateTemplateProps(templateId, undefined, undefined, template.properties, templateUpdate);
		template.modules.forEach(({ name, type, properties }, index) => updateTemplateProps(templateId,
			name ?? type, index, properties, templateUpdate));

		if (!isEmpty(templateUpdate)) {
			templateUpdates.push({ updateOne: { filter: { _id: template._id }, update: { $set: templateUpdate } } });
		}
	});

	if (templateUpdates.length) {
		await DBHandler.bulkWrite(teamspace, 'templates', templateUpdates);
	}

	return templateToRoleProps;
};

const updateTickets = async (teamspace, roleNamesToIds) => {
	const templateToRoleProps = await updateTemplateProperties(teamspace);
	const { ticketIds, ticketsToTemplates } = await updateTicketProperties(teamspace,
		templateToRoleProps, roleNamesToIds);
	await updateTicketLogs(teamspace, ticketIds, ticketsToTemplates, templateToRoleProps, roleNamesToIds);
};

const updateIssuesAndRisks = async (teamspace, roleNamesToIds) => {
	const issueCollections = await getCollectionsEndsWith(teamspace, '.issues');
	const riskCollections = await getCollectionsEndsWith(teamspace, '.risks');

	const processCollection = async (colName) => {
		const colUpdates = [];

		const colItems = await DBHandler.find(teamspace, colName,
			{ },
			{ assigned_roles: 1, creator_role: 1, comments: 1 });

		colItems.forEach(({ _id, creator_role, assigned_roles, comments }) => {
			const itemUpdate = {};

			const newAssignedRole = roleNamesToIds[assigned_roles[0]];
			if (newAssignedRole) {
				itemUpdate.assigned_roles = [newAssignedRole];
			}

			const newCreatorRole = roleNamesToIds[creator_role];
			if (newCreatorRole) {
				itemUpdate.creator_role = newCreatorRole;
			}

			comments?.forEach(({ action }, index) => {
				if (action.property === 'assigned_roles' || action.property === 'creator_role') {
					const newFrom = roleNamesToIds[action.from];
					if (newFrom) {
						itemUpdate[`comments.${index}.action.from`] = newFrom;
					}

					const newTo = roleNamesToIds[action.to];
					if (newTo) {
						itemUpdate[`comments.${index}.action.to`] = newTo;
					}
				}
			});

			if (!isEmpty(itemUpdate)) {
				colUpdates.push({
					updateOne: { filter: { _id }, update: { $set: itemUpdate } },
				});
			}
		});

		if (colUpdates.length) {
			await DBHandler.bulkWrite(teamspace, colName, colUpdates);
		}
	};

	await Promise.all([...issueCollections, ...riskCollections].flatMap(({ name }) => processCollection(name)));
};

const replaceJobsWithRoles = async (teamspace) => {
	const existingRoles = await getRoles(teamspace, { _id: 0, name: 1 });
	const existingRolesMap = {};
	existingRoles.forEach(({ name }) => { existingRolesMap[name] = true; });

	const roleNamesToIds = {};
	const jobs = await DBHandler.find(teamspace, 'jobs');
	const newRoles = [];

	jobs.forEach((job) => {
		if (!existingRolesMap[job._id]) {
			const role = { ...job, name: job._id, _id: generateUUID() };
			newRoles.push(role);
			roleNamesToIds[role.name] = role._id;
		}
	});

	if (newRoles.length) {
		await createRoles(teamspace, newRoles);
	}

	return roleNamesToIds;
};

const run = async () => {
	const teamspaces = await getTeamspaceList();
	for (const teamspace of teamspaces) {
		logger.logInfo(`-${teamspace}`);

		// eslint-disable-next-line no-await-in-loop
		await createIndex(teamspace);

		// eslint-disable-next-line no-await-in-loop
		const roleNamesToIds = await replaceJobsWithRoles(teamspace);

		// eslint-disable-next-line no-await-in-loop
		await Promise.all([
			updateIssuesAndRisks(teamspace, roleNamesToIds),
			updateTickets(teamspace, roleNamesToIds),
			updateActivityLogs(teamspace, roleNamesToIds),
		]);
	}
};

module.exports = run;
