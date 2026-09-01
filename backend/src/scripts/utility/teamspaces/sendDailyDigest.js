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

const { getPlansByQuery } = require(`${v5Path}/models/clashes.plans`);
const { clashRunStatus } = require(`${v5Path}/models/clashes.constants`);
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

const { sendEmail } = require(`${v5Path}/services/mailer`);
const { templates } = require(`${v5Path}/services/mailer/mailer.constants`);
const tz = require('countries-and-timezones');

// this processes the list of project/model/ticket ids into their names
const getContextDataLookUp = async (contextData) => {
	const dataLookUp = {};

	await Promise.all(contextData.map(async ({ _id: teamspace, data }) => {
		dataLookUp[teamspace] = { projects: {}, models: {}, tickets: {}, plans: {} };

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

		await Promise.all(
			projectsData.map(async ({ _id, name }) => {
				const idStr = UUIDToString(_id);
				const plans = await getPlansByQuery(teamspace, _id, { }, { name: 1 });

				dataLookUp[teamspace].projects[idStr] = {
					name,
					plans: Object.fromEntries(
						plans.map(({ _id: planId, name: planName }) => [UUIDToString(planId), planName]),
					),
				};
			}),
		);

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
	const usersData = await getUsersByQuery({ user: { $in: users } },
		{ 'customData.email': 1, 'customData.firstName': 1, 'customData.billing.billingInfo.countryCode': 1, user: 1 });

	const userLUT = {};

	usersData.forEach(({ user, customData: { email, firstName,
		billing: { billingInfo: { countryCode } = {} } = {} } }) => {
		userLUT[user] = { email, firstName, countryCode };
	});

	return userLUT;
};

const generateEmails = (emailData, dataRef, usersToUserInfo) => Promise.all(
	emailData.map(async ({ _id: { teamspace, user }, data: notificationData }) => {
		const userInfo = usersToUserInfo[user];
		const tsData = dataRef[teamspace];

		if (!userInfo || !tsData) return;

		const notifications = notificationData.flatMap((notification) => {
			const projectIDStr = UUIDToString(notification.project);
			const project = tsData.projects[projectIDStr];

			if (!project) return [];

			const clashData = notification.clashData.flatMap(({ plan, runs }) => {
				const planName = project.plans[UUIDToString(plan)];

				if (!planName) return [];

				const formattedRuns = runs.flatMap(({ data, type }) => {
					const timeZone = tz.getTimezonesForCountry(userInfo.countryCode)?.[0]?.name ?? 'UTC';
					// 'sv-SE' is used as it produces a date with ISO format
					const triggeredAt = `${data.triggeredAt.toLocaleString('sv-SE', { timeZone })} ${timeZone}`;

					switch (type) {
					case notificationTypes.CLASH_RUN_SUCCEEDED:
						return { ...data, triggeredAt, status: clashRunStatus.COMPLETED };
					case notificationTypes.CLASH_RUN_FAILED:
						return { ...data, triggeredAt, status: clashRunStatus.FAILED };
					case notificationTypes.CLASH_RUN_ABORTED:
						return { ...data, triggeredAt, status: clashRunStatus.ABORTED };
					default:
						return [];
					}
				});

				return formattedRuns.length ? { planName, runs: formattedRuns } : [];
			});

			const ticketData = notification.ticketData.flatMap(({ model: modelID, data }) => {
				const modelIDStr = UUIDToString(modelID);
				const model = tsData.models[modelIDStr];

				if (!model) return [];

				const tickets = {};
				const uri = `/v5/viewer/${teamspace}/${projectIDStr}/${modelIDStr}`;

				data.forEach(({ type, tickets: ticketsArr }) => {
					const ticketCodes = ticketsArr.flatMap(
						(ticketId) => tsData.tickets[(UUIDToString(ticketId))] ?? []);
					if (!ticketCodes.length) return;
					const tickData = { count: ticketCodes.length, link: `${uri}?ticketSearch=${ticketCodes.join(',')}` };
					switch (type) {
					case notificationTypes.TICKET_UPDATED:
						tickets.updated = tickData;
						break;
					case notificationTypes.TICKET_CLOSED:
						tickets.closed = tickData;
						tickets.closed.link = `${tickets.closed.link}&ticketCompleted=true`;
						break;
					case notificationTypes.TICKET_ASSIGNED:
						tickets.assigned = tickData;
						break;
					default:
						logger.logInfo(`Unrecognised notification type ${type}, ignoring...`);
					}
				});

				return Object.keys(tickets).length ? { model, tickets } : [];
			});

			return { ...notification, project: project.name, ticketData, clashData };
		});

		if (notifications.length) {
			logger.logInfo(`Sending email to ${user} for ${teamspace}`);
			await sendEmail(templates.DAILY_DIGEST.name, userInfo.email,
				{ username: user, firstName: userInfo.firstName, teamspace, notifications },
			);
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
