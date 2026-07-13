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
const { SUBSCRIPTION_TYPES } = require('../../../v5/models/teamspaces.constants');
const { sendSystemEmail } = require('../../../v5/services/mailer');

const { sendEmail } = require(`${v5Path}/services/mailer`);
const { getTeamspaceSettingsByQuery } = require(`${v5Path}/models/teamspaceSettings`);
const { templates } = require(`${v5Path}/services/mailer/mailer.constants`);
const { getUsersByQuery } = require(`${v5Path}/models/users`);
const { TEAMSPACE_ADMIN } = require(`${v5Path}/utils/permissions/permissions.constants`);

const currentDate = new Date();
const startOfCurrentDay = new Date(currentDate.setHours(0, 0, 0, 0));
const endOfCurrentDay = new Date(currentDate.setHours(23, 59, 59, 999));
const endOf30Days = new Date();
endOf30Days.setDate(currentDate.getDate() + 30);
endOf30Days.setHours(23, 59, 59, 999);
const startOf30thDay = new Date(startOfCurrentDay);
startOf30thDay.setDate(startOf30thDay.getDate() + 30);

const getTeamspaceSettingByExpiry = (teamspace, expiryStart, expiryEnd, projection) => {
	const query = {
		_id: teamspace,
		$or: Object.values(SUBSCRIPTION_TYPES).map((type) => ({
			[`subscriptions.${type}.expiryDate`]: {
				$gte: expiryStart,
				$lte: expiryEnd,
			},
		})),
	};
	return getTeamspaceSettingsByQuery(teamspace, query, projection);
};

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

const runExternal = async (teamspaces) => {
	const teamspacesToAdminsInfo = {};

	const findAdminPromise = Promise.all(teamspaces.map(async (ts) => {
		const listOfAdmins = ts.permissions.filter(
			({ permissions }) => permissions.includes(TEAMSPACE_ADMIN)).map(({ user }) => user);

		const admins = await getUsersByQuery(
			{ user: { $in: listOfAdmins } },
			{ 'customData.firstName': 1, 'customData.email': 1 },
		);

		teamspacesToAdminsInfo[ts._id] = admins.map(({ customData: { firstName, email } }) => ({ firstName, email }));
	}));

	const expireNow = [];
	const expireIn30Days = [];

	teamspaces.forEach((ts) => {
		Object.values(ts.subscriptions).forEach((sub) => {
			if (sub?.expiryDate) {
				if (sub.expiryDate >= startOfCurrentDay && sub.expiryDate <= endOfCurrentDay) {
					expireNow.push({
						teamspace: ts._id,
						expiryDate: sub.expiryDate,
					});
				} else if (sub.expiryDate >= startOf30thDay && sub.expiryDate <= endOf30Days) {
					expireIn30Days.push({
						teamspace: ts._id,
						expiryDate: sub.expiryDate,
					});
				}
			}
		});
	});

	await findAdminPromise;

	await Promise.all([
		...expireNow.map(async ({ teamspace, expiryDate }) => {
			const admins = teamspacesToAdminsInfo[teamspace];
			await Promise.all(admins.map(async ({ firstName, email }) => {
				await sendEmail(
					templates.TEAMSPACE_EXPIRING_TODAY.name,
					email,
					{ firstName, teamspace, expiryDate },
				);
			}));
		}),
		...expireIn30Days.map(async ({ teamspace, expiryDate }) => {
			const admins = teamspacesToAdminsInfo[teamspace];
			await Promise.all(admins.map(async ({ firstName, email }) => {
				await sendEmail(
					templates.TEAMSPACE_EXPIRING_SOON.name,
					email,
					{ firstName, teamspace, expiryDate },
				);
			}));
		}),
	]);
};

const runInternal = async (teamspaces) => {
	const teamspacesToExpire = teamspaces.map((ts) => {
		let expiryDate = null;
		Object.values(ts.subscriptions)
			.forEach((sub) => {
				const subExpiryDate = sub?.expiryDate;
				if (subExpiryDate >= startOfCurrentDay && subExpiryDate <= endOf30Days) {
					if (!expiryDate || subExpiryDate < expiryDate) {
						expiryDate = subExpiryDate;
					}
				}
			});

		return {
			name: ts._id,
			expiryDate,
		};
	});

	if (teamspacesToExpire.length) {
		await sendSystemEmail(templates.TEAMSPACE_EXPIRY_DIGEST.name, { teamspaces: teamspacesToExpire });
	}
};

const run = async (target) => {
	const teamspaces = await getTeamspaces(startOfCurrentDay, endOf30Days);
	if (target === 'internal') {
		await runInternal(teamspaces);
	} else {
		await runExternal(teamspaces);
	}
};

const genYargs = /* istanbul ignore next */(yargs) => {
	const commandName = Path.basename(__filename, Path.extname(__filename));
	const argsSpec = (subYargs) => subYargs.options('target',
		{
			describe: 'Specify if we wish to send alerts to internal support or external teamspace admins',
			type: 'string',
			choices: ['internal', 'external'],
			demandOption: true,
		},
	);
	return yargs.command(commandName,
		'Check teamspaces with upcoming expiry and send out relevant alerts. Internal is designed to be ran weekly, and external is designed to be ran daily.',
		argsSpec,
		({ target }) => run(target));
};

module.exports = {
	run,
	genYargs,
};
