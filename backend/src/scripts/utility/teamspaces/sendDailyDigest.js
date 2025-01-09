/**
 *  Copyright (C) 2024 3D Repo Ltd
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
const { notificationTypes } = require(`${v5Path}/models/notifications.constants`);
const { getAddOns } = require(`${v5Path}/models/teamspaceSettings`);
const { ADD_ONS } = require(`${v5Path}/models/teamspaces.constants`);
const { getTicketsByQuery } = require(`${v5Path}/models/tickets`);
const { getProjectList } = require(`${v5Path}/models/projectSettings`);
const { getAllTemplates } = require(`${v5Path}/models/tickets.templates`);
const { findModels } = require(`${v5Path}/models/modelSettings`);
const { getUsersByQuery } = require(`${v5Path}/models/users`);

const { logger } = require(`${v5Path}/utils/logger`);
const { UUIDToString } = require(`${v5Path}/utils/helper/uuids`);
const { uniqueElements } = require(`${v5Path}/utils/helper/arrays`);

const { sendEmail } = require(`${v5Path}/services/mailer`);
const { templates } = require(`${v5Path}/services/mailer/mailer.constants`);

// this processes the list of project/model/ticket ids into their names
const getContextDataLookUp = async (contextData) => {
	const dataLookUp = {};

	await Promise.all(contextData.map(async ({ _id: teamspace, data }) => {
		dataLookUp[teamspace] = { projects: {}, models: {}, tickets: {} };

		const [ticketTemplates, projectsData, modelsData] = await Promise.all([
			getAllTemplates(teamspace, true, { code: 1, _id: 1 }),
			getProjectList(teamspace, { name: 1 }),
			findModels(teamspace, {}, { name: 1 }),
		]);

		const templateIdToCode = {};

		ticketTemplates.forEach(({ _id, code }) => {
			const idStr = UUIDToString(_id);
			templateIdToCode[idStr] = code;
		});

		projectsData.forEach(({ _id, name }) => {
			const idStr = UUIDToString(_id);
			dataLookUp[teamspace].projects[idStr] = name;
		});

		modelsData.forEach(({ _id, name }) => {
			const idStr = UUIDToString(_id);
			dataLookUp[teamspace].models[idStr] = name;
		});

		const ticketProcessingProm = data.map(async ({ project, model, tickets }) => {
			const ticketsData = await getTicketsByQuery(
				teamspace, project, model, { _id: { $in: tickets } }, { type: 1, number: 1 });

			ticketsData.forEach(({ _id, number, type }) => {
				const code = templateIdToCode[UUIDToString(type)];
				if (code) dataLookUp[teamspace].tickets[UUIDToString(_id)] = `${code}:${number}`;
			});
		});
		await Promise.all(ticketProcessingProm);
	}));

	return dataLookUp;
};

const getUserDetails = async (users) => {
	const usersData = await getUsersByQuery({ user: { $in: users } }, { 'customData.email': 1, 'customData.firstName': 1, user: 1 });

	const userLUT = {};

	usersData.forEach(({ user, customData: { email, firstName } }) => {
		userLUT[user] = { email, firstName };
	});

	return userLUT;
};

const generateEmails = (data, dataRef, usersToUserInfo) => Promise.all(
	data.map(async ({ _id: { teamspace, user }, data: modelList }) => {
		const userInfo = usersToUserInfo[user];
		const tsData = dataRef[teamspace];

		if (!userInfo || !tsData) return;
		const notifications = modelList.flatMap(({ model: modelID, project: projectID, data: notifData }) => {
			const modelIDStr = UUIDToString(modelID);
			const projectIDStr = UUIDToString(projectID);
			const model = tsData.models[modelIDStr];
			const project = tsData.projects[projectIDStr];

			if (!model || !project) return [];

			const tickets = {};
			const uri = `/v5/viewer/${teamspace}/${projectIDStr}/${modelIDStr}`;

			notifData.forEach(({ type, tickets: ticketsArr, count }) => {
				const ticketCodes = uniqueElements(ticketsArr.flatMap(
					(ticketId) => tsData.tickets[(UUIDToString(ticketId))] ?? []));
				if (!ticketCodes.length) return;
				switch (type) {
				case notificationTypes.TICKET_UPDATED:
					tickets.updated = { count, link: `${uri}?ticketSearch=${ticketCodes.join(',')}` };
					break;
				case notificationTypes.TICKET_CLOSED:
					tickets.closed = { count, link: `${uri}?ticketSearch=${ticketCodes.join(',')}` };
					break;
				case notificationTypes.TICKET_ASSIGNED:
					tickets.assigned = { count, link: `${uri}?ticketSearch=${ticketCodes.join(',')}` };
					break;
				default:
					logger.logInfo(`Unrecognised notification type ${type}, ignoring...`);
				}
			});

			return Object.keys(tickets).length ? { project, model, tickets } : [];
		});

		if (notifications.length) {
			const emailData = {
				username: user,
				firstName: userInfo.firstName,
				teamspace,
				notifications,
			};

			logger.logInfo(`Sending email to ${user} for ${teamspace}`);
			await sendEmail(templates.DAILY_DIGEST.name, userInfo.email, emailData);
		}
	}));

const run = async (teamspace) => {
	const teamspaces = teamspace ? [teamspace] : await getTeamspaceList();
	const teamspacesWithDDEnabled = await Promise.all(teamspaces.map(async (ts) => {
		const addOns = await getAddOns(ts);
		return addOns[ADD_ONS.DAILY_DIGEST] ? ts : undefined;
	}));

	const teamspacesToProcess = teamspacesWithDDEnabled.filter((ts) => !!ts);

	if (teamspacesToProcess?.length) {
		const { contextData, recipients, digestData } = await composeDailyDigests(teamspacesToProcess);
		const [
			dataLookUp, usersToUserInfo,
		] = await Promise.all([
			getContextDataLookUp(contextData),
			getUserDetails(recipients),
		]);

		await generateEmails(digestData, dataLookUp, usersToUserInfo);
	}
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
