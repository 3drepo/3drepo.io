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
const DayJS = require('dayjs');

DayJS.extend(require('dayjs/plugin/utc'));
DayJS.extend(require('dayjs/plugin/timezone'));

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
				const plans = await getPlansByQuery(teamspace, _id, { },
					{ name: 1, tickets: { template: 1, federation: 1 } });

				dataLookUp[teamspace].projects[idStr] = {
					_id,
					name,
					plans: Object.fromEntries(
						plans.map(({ _id: planId, ...others }) => [UUIDToString(planId), others]),
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
		billing: { billingInfo: { countryCode } } } }) => {
		userLUT[user] = { email, firstName, countryCode };
	});

	return userLUT;
};

const clashStatusMapping = {
	[notificationTypes.CLASH_RUN_SUCCEEDED]: clashRunStatus.COMPLETED,
	[notificationTypes.CLASH_RUN_ABORTED]: clashRunStatus.ABORTED,
	[notificationTypes.CLASH_RUN_FAILED]: clashRunStatus.FAILED,
};

const formatDate = (date, timeZone) => {
	const timeZoneAbbr = new Intl.DateTimeFormat('en-US', { timeZone, timeZoneName: 'short' })
		.formatToParts(date).find(({ type }) => type === 'timeZoneName').value;

	return `${DayJS(date).tz(timeZone).format('YYYY-MM-DD HH:mm')} (${timeZoneAbbr})`;
};

const generateClashData = ({ plan, notifications: runNotifications }, teamspace, project, userInfo) => {
	const planDetails = project.plans[UUIDToString(plan)];

	if (!planDetails) return undefined;

	const formattedRuns = runNotifications.flatMap(({ data, type }) => {
		const timeZone = tz.getTimezonesForCountry(userInfo.countryCode)?.[0]?.name ?? 'UTC';
		const triggeredAt = formatDate(data.triggeredAt, timeZone);

		const status = clashStatusMapping[type];

		if (!status) {
			logger.logInfo(`Unrecognised clash notification type ${type}, ignoring...`);
			return [];
		}

		const results = status === clashRunStatus.COMPLETED
			? { stats: data.results?.stats }
			: { error: data.error };

		return { results, triggeredAt, status };
	});

	let link;
	if (planDetails.tickets) {
		link = `/v5/dashboard/${teamspace}/${UUIDToString(project._id)}/t/tickets/${UUIDToString(planDetails.tickets.template)}?models=${planDetails.tickets.federation}`;
	}

	return { planName: planDetails.name, link, runs: formattedRuns };
};

const generateTicketData = ({ model: modelID, notifications: ticketNotifications },
	tsData, teamspace, projectIDStr) => {
	const modelIDStr = UUIDToString(modelID);
	const model = tsData.models[modelIDStr];

	if (!model) return undefined;

	const groupedTickets = ticketNotifications.reduce((acc, { type, data }) => {
		if (!acc[type]) acc[type] = new Set();
		acc[type].add(UUIDToString(data.ticket));
		return acc;
	}, {});

	const tickets = {};
	const uri = `/v5/viewer/${teamspace}/${projectIDStr}/${modelIDStr}`;

	Object.entries(groupedTickets).forEach(([type, ticketsArr]) => {
		const ticketCodes = Array.from(ticketsArr).flatMap(
			(ticketId) => tsData.tickets[ticketId] ?? []);

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

	return Object.keys(tickets).length ? { model, tickets } : undefined;
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
			const clashData = [];
			const ticketData = [];

			notification.data.forEach((data) => {
				if (data.plan) {
					const clash = generateClashData(data, teamspace, project, userInfo);
					if (clash) clashData.push(clash);
				} else {
					const ticket = generateTicketData(data, tsData, teamspace, projectIDStr);
					if (ticket) ticketData.push(ticket);
				}
			});

			if (ticketData.length === 0 && clashData.length === 0) return [];

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
