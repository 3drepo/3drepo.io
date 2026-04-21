/**
 *  Copyright (C) 2026 3D Repo Ltd
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

const { v5Path } = require('../../../interop');

const { getTeamspaceList } = require('../../utils');

const config = require(`${v5Path}/utils/config`);
const { sendEmail } = require(`${v5Path}/services/mailer`);
const { getTeamspaceSettingByExpiry } = require(`${v5Path}/models/teamspaceSettings`);
const { templates } = require(`${v5Path}/services/mailer/mailer.constants`);
const { getUsersByQuery } = require(`${v5Path}/models/users`);
const { TEAMSPACE_ADMIN } = require(`${v5Path}/utils/permissions/permissions.constants`);

const currentDate = new Date();
const startOfCurrentDay = new Date(currentDate.setHours(0, 0, 0, 0));
const endOfCurrentDay = new Date(currentDate.setHours(23, 59, 59, 999));
const expiryThreshold = new Date();
expiryThreshold.setDate(currentDate.getDate() + 30);
expiryThreshold.setHours(23, 59, 59, 999);

const getTeamspaces = async (startOfExpiry, endOfExpiry) => {
	const teamspaces = await getTeamspaceList();
	const teamspacesWithExpiry = await Promise.all(
		teamspaces.map((teamspace) => getTeamspaceSettingByExpiry(
			teamspace,
			startOfExpiry,
			endOfExpiry,
			{ _id: 1, permissions: 1, subscriptions: 1 },
		)),
	);
	return teamspacesWithExpiry.flat();
};

const runExternal = async () => {
	const listOfTeamspaces = await getTeamspaces(startOfCurrentDay, expiryThreshold);

	const teamspacesWithAdminsAndExpiry = await Promise.all(
		listOfTeamspaces.map(async (ts) => {
			const listOfAdmins = ts.permissions.filter(
				({ permissions }) => permissions.includes(TEAMSPACE_ADMIN)).map(({ user }) => user);

			const admins = await getUsersByQuery(
				{ user: { $in: listOfAdmins } },
				{ 'customData.firstName': 1, 'customData.email': 1 },
			);

			const earliestExpiryDate = Object.values(ts.subscriptions).reduce((earliest, sub) => {
				const expiryDate = new Date(sub.expiryDate);
				if (expiryDate < startOfCurrentDay || expiryDate > expiryThreshold) return earliest;

				return (!earliest || expiryDate < earliest) ? expiryDate : earliest;
			}, null);

			return {
				admins,
				teamspace: ts._id,
				expiryDate: earliestExpiryDate,
			};
		},
		),
	);

	const teamspacesToExpire = teamspacesWithAdminsAndExpiry
		.filter((ts) => ts.expiryDate > currentDate);
	const teamspacesExpiredNow = teamspacesWithAdminsAndExpiry
		.filter((ts) => ts.expiryDate >= startOfCurrentDay && ts.expiryDate <= endOfCurrentDay);

	await Promise.all(teamspacesToExpire.map(async ({ teamspace, expiryDate, admins }) => {
		await Promise.all(admins.map(({ customData: { firstName, email } }) => {
			sendEmail(
				templates.TEAMSPACE_EXPIRING_SOON.name,
				email,
				{ firstName, teamspace, expiryDate },
			);
		}));
	},
	));

	await Promise.all(teamspacesExpiredNow.map(async (ts) => {
		await Promise.all(ts.admins.map(({ customData: { firstName, email } }) => sendEmail(
			templates.TEAMSPACE_EXPIRING_TODAY.name,
			email,
			{ firstName, teamspace: ts.teamspace, expiryDate: ts.expiryDate },
		)));
	},
	));
};

const runInternal = async () => {
	const listOfTeamspaces = await getTeamspaces(currentDate, expiryThreshold);

	const teamspacesToExpire = listOfTeamspaces.filter((ts) => !!ts
		&& ts.subscriptions
		&& Object
			.values(ts.subscriptions)
			.some((sub) => sub.expiryDate && new Date(sub.expiryDate) <= expiryThreshold),
	).map((ts) => {
		const subscriptionExpiryDates = Object.values(ts.subscriptions)
			.map((sub) => (sub && sub.expiryDate ? new Date(sub.expiryDate) : null))
			.filter((expiryDate) => expiryDate && expiryDate >= currentDate && expiryDate <= expiryThreshold);
		const earliestExpiryDate = subscriptionExpiryDates.reduce(
			(earliest, current) => (earliest && earliest <= current ? earliest : current),
			null,
		);

		return {
			teamspace: ts._id,
			expiryDate: earliestExpiryDate,
		};
	});

	if (teamspacesToExpire.length) {
		await sendEmail(templates.TEAMSPACE_EXPIRY_DIGEST.name, config.contact.support, { firstName: 'Support', teamspacesToExpire });
	}
};

const run = async (target) => {
	if (target === 'internal') {
		await runInternal();
	} else {
		await runExternal();
	}
};

const genYargs = /* istanbul ignore next */(yargs) => {
	const commandName = Path.basename(__filename, Path.extname(__filename));
	const argsSpec = (subYargs) => subYargs.options('target',
		{
			describe: 'Specify if the emails should be sent to support (internal) or to the admins of the teamspace (external)',
			type: 'string',
			choices: ['internal', 'external'],
			demandOption: true,
		},
	);
	return yargs.command(commandName,
		'Check teamspaces with upcoming expiry and send out emails to admins',
		argsSpec,
		({ target }) => run(target));
};

module.exports = {
	run,
	genYargs,
};
