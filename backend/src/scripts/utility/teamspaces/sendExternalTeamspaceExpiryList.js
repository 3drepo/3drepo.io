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

const { sendEmail } = require(`${v5Path}/services/mailer`);
const { getTeamspaceSetting } = require(`${v5Path}/models/teamspaceSettings`);
const { templates } = require(`${v5Path}/services/mailer/mailer.constants`);
const { getUsersByQuery } = require(`${v5Path}/models/users`);

const run = async () => {
	const teamspaces = await getTeamspaceList();
	const currentDate = new Date();
	const startOfCurrentDay = new Date(currentDate.setHours(0, 0, 0, 0));
	const endOfCurrentDay = new Date(currentDate.setHours(23, 59, 59, 999));
	const expiryThreshold = new Date();
	expiryThreshold.setDate(currentDate.getDate() + 30);
	expiryThreshold.setHours(23, 59, 59, 999);

	const listOfTeamspaces = await Promise.all(
		teamspaces.map((teamspace) => getTeamspaceSetting(teamspace, { _id: 1, permissions: 1, subscriptions: 1 })),
	);
	const teamspacesOfInterest = listOfTeamspaces.filter(
		(ts) => !!ts
        && ts.subscriptions
        && Object.values(ts.subscriptions).some((sub) => sub.expiryDate
          && new Date(sub.expiryDate) <= expiryThreshold && sub.expiryDate >= startOfCurrentDay,
        ),
	);

	const processedTeamspacesOfInterest = await Promise.all(teamspacesOfInterest.map(async (ts) => ({
		admins: await getUsersByQuery(
			{ 'customData.userId': { $in: ts.permissions.filter(({ permissions }) => permissions.includes('teamspace_admin')).map(({ user }) => user) } },
			{ 'customData.firstName': 1, 'customData.email': 1 },
		),
		teamspace: ts._id,
		expiryDate: Object.values(ts.subscriptions)[0].expiryDate,
	}),
	));

	const teamspacesToExpire = processedTeamspacesOfInterest.filter((ts) => ts.expiryDate > currentDate);
	const teamspacesExpiredNow = processedTeamspacesOfInterest
		.filter((ts) => ts.expiryDate >= startOfCurrentDay
        && ts.expiryDate <= endOfCurrentDay);

	await Promise.all(teamspacesToExpire.map(async (ts) => {
		await Promise.all(ts.admins.map(({ customData: { firstName, email } }) => sendEmail(
			templates.EXTERNAL_TEAMSPACE_EXPIRY_LIST.name,
			email,
			{ firstName, teamspace_name: ts.teamspace, expiry_date: ts.expiryDate },
		)));
	},
	));

	await Promise.all(teamspacesExpiredNow.map(async (ts) => {
		await Promise.all(ts.admins.map(({ customData: { firstName, email } }) => sendEmail(
			templates.EXTERNAL_TEAMSPACE_EXPIRED_LIST.name,
			email,
			{ firstName, teamspace_name: ts.teamspace, expiry_date: ts.expiryDate },
		)));
	},
	));
};

const genYargs = /* istanbul ignore next */(yargs) => {
	const commandName = Path.basename(__filename, Path.extname(__filename));
	return yargs.command(commandName,
		'Send external teamspace expiry email',
		() => { },
		() => run());
};

module.exports = {
	run,
	genYargs,
};
