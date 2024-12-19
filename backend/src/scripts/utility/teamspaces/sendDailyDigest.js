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

const Path = require('path');
const { getTeamspaceList } = require('../../utils');
const { v5Path } = require('../../../interop');

const { composeDailyDigests } = require(`${v5Path}/models/notifications`);
const { getAddOns } = require(`${v5Path}/models/teamspaceSettings`);
const { ADD_ONS } = require(`${v5Path}/models/teamspaceSettings.constants`);

const { logger } = require(`${v5Path}/utils/logger`);

const { sendEmail } = require(`${v5Path}/services/mailer`);
const { templates } = require(`${v5Path}/services/mailer/mailer.constants`);

// this processes the list of project/model/ticket ids into their names
const getContextDataLUT = async (contextData) => {
	const dataLookUp = {};

	await Promise.all(contextData.map(async ({ _id: teamspace, data }) => {
		dataLookUp[teamspace] = {};
		const projects = [];
		const models = [];

		const ticketProcessingProm = data.map(async ({ project, model, tickets }) => {
			projects.push(project);
			models.push(model);
		});
	}));

	return dataLookUp;
};

const run = async (teamspace) => {
	const teamspaces = teamspace ? [teamspace] : await getTeamspaceList();
	const teamspacesWithDDEnabled = await Promise.all(teamspaces.flatMap(async (ts) => {
		const addOns = await getAddOns(ts);
		return addOns[ADD_ONS.DAILY_DIGEST] ? ts : [];
	}));

	const { contextData, digestData } = await composeDailyDigests(teamspacesWithDDEnabled);

	await sendEmail(templates.DAILY_DIGEST.name, 'cfan@asite.com',
		{
			username: 'carmen',
			teamspace: 'carmen',
			firstName: 'Carmen',
			notifications: [{
				project: 'Asite',
				model: 'Clinic',
				tickets: {
					updated: { count: 10, link: 'http://www.google.com' },
					//					assigned: { count: 10, link: 'http://www.google.com' },
					closed: { count: 10, link: 'http://www.google.com' },
				},
			}],
		});
};

const genYargs = /* istanbul ignore next */(yargs) => {
	const commandName = Path.basename(__filename, Path.extname(__filename));
	const argsSpec = (subYargs) => subYargs.option('teamspace',
		{
			describe: 'teamspace to send notifications for',
			type: 'string',
		});
	return yargs.command(commandName,
		'Send daily digests to any users subscribed',
		argsSpec,
		({ teamspace }) => run(teamspace));
};

module.exports = {
	run,
	genYargs,
};
