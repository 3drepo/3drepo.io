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
const { getTeamspaceSettingByExpiry } = require(`${v5Path}/models/teamspaceSettings`);
const { templates } = require(`${v5Path}/services/mailer/mailer.constants`);
const { getUsersByQuery } = require(`${v5Path}/models/users`);
const { TEAMSPACE_ADMIN } = require(`${v5Path}/utils/permissions/permissions.constants`);

const run = async () => {
	const teamspaces = await getTeamspaceList();
	const currentDate = new Date();
	const startOfCurrentDay = new Date(currentDate.setHours(0, 0, 0, 0));
	const endOfCurrentDay = new Date(currentDate.setHours(23, 59, 59, 999));
	const expiryThreshold = new Date();
	expiryThreshold.setDate(currentDate.getDate() + 30);
	expiryThreshold.setHours(23, 59, 59, 999);

	const listOfTeamspaces = await Promise.all(
		teamspaces.map((teamspace) => getTeamspaceSettingByExpiry(teamspace, startOfCurrentDay, expiryThreshold, { _id: 1, permissions: 1, subscriptions: 1 })),
	);

	const teamspacesWithAdminsAndExpiry = await Promise.all(
		listOfTeamspaces.map(async (ts) => {
			const admins = await getUsersByQuery(
				{ userId: { $in: ts.permissions.filter(({ permissions }) => permissions.includes(TEAMSPACE_ADMIN)).map(({ user }) => user) } },
				{ 'customData.firstName': 1, 'customData.email': 1 },
			);
			const subscriptionExpiryDates = Object.values(ts.subscriptions)
				.map((sub) => sub && sub.expiryDate ? new Date(sub.expiryDate) : null)
				.filter((expiryDate) => expiryDate && expiryDate >= startOfCurrentDay && expiryDate <= expiryThreshold);
			const earliestExpiryDate = subscriptionExpiryDates.reduce((earliest, current) => (earliest && earliest <= current ? earliest : current), null);;

			return {
				admins,
				teamspace: ts._id,
				expiryDate: earliestExpiryDate,
			}
		}),
	);


	const teamspacesToExpire = teamspacesWithAdminsAndExpiry.filter((ts) => ts.expiryDate > currentDate);
	const teamspacesExpiredNow = teamspacesWithAdminsAndExpiry
		.filter((ts) => ts.expiryDate >= startOfCurrentDay
			&& ts.expiryDate <= endOfCurrentDay);

	await Promise.all(teamspacesToExpire.map(async (ts) => {
		await Promise.all(ts.admins.map(({ customData: { firstName, email } }) => sendEmail(
			templates.EXTERNAL_TEAMSPACE_EXPIRING_WITHIN_THRESHOLD_LIST.name,
			email,
			{ firstName, teamspace: ts.teamspace, expiryDate: ts.expiryDate },
		)));
	},
	));

	await Promise.all(teamspacesExpiredNow.map(async (ts) => {
		await Promise.all(ts.admins.map(({ customData: { firstName, email } }) => sendEmail(
			templates.EXTERNAL_TEAMSPACE_EXPIRING_TODAY_LIST.name,
			email,
			{ firstName, teamspace: ts.teamspace, expiryDate: ts.expiryDate },
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
