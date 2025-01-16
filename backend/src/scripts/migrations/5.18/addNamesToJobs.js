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
const { createJob, deleteJob } = require('../../../v5/models/jobs');
const { getAllTemplates } = require('../../../v5/models/tickets.templates');
const { deleteIfUndefined } = require('../../../v5/utils/helper/objects');
const { UUIDToString } = require('../../../v5/utils/helper/uuids');
const { getTeamspaceList } = require('../../utils');

const { logger } = require(`${v5Path}/utils/logger`);
const { getJobs } = require(`${v5Path}/models/jobs`);

const updateTicketsProperties = async (teamspace) => {
	const templates = await getAllTemplates(teamspace);
	const templateToJobProps = {};

	templates.forEach((template) => {
		const templateKey = UUIDToString(template._id);
		templateToJobProps[templateKey] = [];

		if (template.config.issueProperties) {
			templateToJobProps[templateKey].push(Assignees);
		}
	});

	await Promise.all(addPromises);
	await Promise.all(deletePromises);
};

const addNamesToJobs = async (teamspace) => {
	const jobs = await getJobs(teamspace);
	const addPromises = [];
	const deletePromises = [];

	jobs.forEach((job) => {
		const newJobData = deleteIfUndefined({ ...job, name: job._id, _id: undefined });
		addPromises.push(createJob(teamspace, newJobData));
		deletePromises.push(deleteJob(teamspace, job._id));
	});

	await Promise.all(addPromises);
	await Promise.all(deletePromises);
};

const run = async () => {
	const teamspaces = await getTeamspaceList();
	for (const teamspace of teamspaces) {
		logger.logInfo(`-${teamspace}`);
		// eslint-disable-next-line no-await-in-loop
		await addNamesToJobs(teamspace);
	}
};

module.exports = run;
