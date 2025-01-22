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

const { v5Path } = require('../../../interop');
const DBHandler = require('../../../v5/handler/db');
const { createJob, deleteJob } = require('../../../v5/models/jobs');
const { getAllTemplates } = require('../../../v5/models/tickets.templates');
const { basePropertyLabels, presetEnumValues, propTypes } = require('../../../v5/schemas/tickets/templates.constants');
const { getArrayDifference } = require('../../../v5/utils/helper/arrays');
const { deleteIfUndefined, isEmpty } = require('../../../v5/utils/helper/objects');
const { isArray } = require('../../../v5/utils/helper/typeCheck');
const { UUIDToString, stringToUUID } = require('../../../v5/utils/helper/uuids');
const { getTeamspaceList } = require('../../utils');

const { logger } = require(`${v5Path}/utils/logger`);
const { getJobs } = require(`${v5Path}/models/jobs`);

const updateTicketProperties = async (teamspace, jobNamesToIds) => {
	const templates = await getAllTemplates(teamspace, true, { properties: 1, modules: 1, config: 1 });
	const templateToJobProps = {};

	const addJobProps = (properties, templateId, moduleName) => {
		properties.forEach((prop) => {
			if ((prop.type === propTypes.ONE_OF || prop.type === propTypes.MANY_OF)
				&& prop.values === presetEnumValues.JOBS_AND_USERS) {
				templateToJobProps[templateId].push(deleteIfUndefined({ moduleName, propertyName: prop.name }));
			}
		});
	};

	templates.forEach((template) => {
		const templateId = UUIDToString(template._id);
		templateToJobProps[templateId] = [];

		if (template.config.issueProperties) {
			templateToJobProps[templateId].push({ propertyName: basePropertyLabels.ASSIGNEES });
		}

		addJobProps(template.properties, templateId);
		template.modules.forEach((mod) => addJobProps(mod.properties, templateId, mod.name));
	});

	const templatesToQuery = Object.keys(templateToJobProps)
		.flatMap((key) => (templateToJobProps[key].length ? stringToUUID(key) : []));

	const tickets = await DBHandler.find(teamspace, 'tickets', { teamspace, type: { $in: templatesToQuery } }, { type: 1, properties: 1, modules: 1 });

	const updates = [];

	tickets.forEach((ticket) => {
		const ticketUpdate = {};

		const jobProps = templateToJobProps[UUIDToString(ticket.type)];
		jobProps.forEach(({ moduleName, propertyName }) => {
			const propValue = moduleName ? ticket.modules[moduleName][propertyName] : ticket.properties[propertyName];

			if (!propValue) {
				return;
			}

			const propPath = moduleName ? `modules.${moduleName}.${propertyName}` : `properties.${propertyName}`;

			if (isArray(propValue)) {
				const updatedValue = [];

				propValue.forEach((valueItem) => {
					const jobId = jobNamesToIds[valueItem];
					updatedValue.push(jobId || valueItem);
				});

				if (getArrayDifference(propValue, updatedValue).length) {
					ticketUpdate[propPath] = updatedValue;
				}
			} else {
				const jobId = jobNamesToIds[propValue];
				if (jobId) {
					ticketUpdate[propPath] = stringToUUID(jobId);
				}
			}
		});

		if (!isEmpty(ticketUpdate)) {
			updates.push({ updateOne: { filter: { _id: ticket._id }, update: { $set: ticketUpdate } } });
		}
	});

	if (updates.length) {
		await DBHandler.bulkWrite(teamspace, 'tickets', updates);
	}
};

const addNamesToJobs = async (teamspace) => {
	const jobNamesToIds = {};
	const jobs = await getJobs(teamspace, {});
	const addPromises = [];
	const deletePromises = [];

	jobs.forEach((job) => {
		const newJobData = deleteIfUndefined({ ...job, name: job._id, _id: undefined });

		addPromises.push(
			createJob(teamspace, newJobData)
				.then((_id) => { jobNamesToIds[newJobData.name] = _id; }),
		);

		deletePromises.push(deleteJob(teamspace, job._id));
	});

	await Promise.all(addPromises);
	await Promise.all(deletePromises);

	return jobNamesToIds;
};

const run = async () => {
	const teamspaces = await getTeamspaceList();
	for (const teamspace of teamspaces) {
		logger.logInfo(`-${teamspace}`);
		// eslint-disable-next-line no-await-in-loop
		const jobNamesToIds = await addNamesToJobs(teamspace);

		// eslint-disable-next-line no-await-in-loop
		await updateTicketProperties(teamspace, jobNamesToIds);
	}
};

module.exports = run;
