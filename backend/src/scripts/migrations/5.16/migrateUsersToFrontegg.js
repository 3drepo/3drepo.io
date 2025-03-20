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

const { getTeamspaceList } = require('../../utils');

const { getTeamspaceRefId, setTeamspaceRefId, getAllUsersInTeamspace } = require(`${v5Path}/models/teamspaceSettings`);
const { getTeamspaceByAccount, doesUserExist, addUserToAccount, createAccount, createUser, getAllUsersInAccount } = require(`${v5Path}/services/sso/frontegg`);

const { logger } = require(`${v5Path}/utils/logger`);
const { updateUserId } = require(`${v5Path}/models/users`);
const processTeamspace = async (ts, userMapping) => {
	let refId = await getTeamspaceRefId(ts);

	const isNew = !refId || await getTeamspaceByAccount(refId).then(() => false).catch(() => true);
	if (isNew) {
		logger.logInfo('\t creating Frontegg account...');
		refId = await createAccount(ts);
		await setTeamspaceRefId(ts, refId);
	}

	const projection = {
		user: 1,
		'customData.email': 1,
		'customData.userId': 1,
		'customData.firstName': 1,
		'customData.lastName': 1,
	};

	const [membersKnown, membersInTs] = await Promise.all([
		isNew ? Promise.resolve([]) : getAllUsersInAccount(refId),
		getAllUsersInTeamspace(ts, projection),
	]);

	const emailToUserId = {};

	membersKnown.forEach(({ id, email }) => {
		emailToUserId[email] = id;
	});

	await Promise.all(membersInTs.map(async ({ user, customData: { email, userId, firstName, lastName } }) => {
		if (!emailToUserId[email]) {
			let newUserId = userMapping[user] || await doesUserExist(email);

			if (!newUserId) {
				logger.logInfo(`\tCreating user entry for ${user}`);
				newUserId = await createUser(refId, email, [firstName, lastName].join(' '), undefined, undefined, true);
			} else {
				logger.logInfo(`\tUser entry found for ${user}, adding them to the account...`);
				await addUserToAccount(refId, newUserId, false);
			}
			// eslint-disable-next-line no-param-reassign
			userMapping[user] = newUserId;
		} else {
			// eslint-disable-next-line no-param-reassign
			userMapping[user] = emailToUserId[email];
		}

		if (userId !== userMapping[user]) {
			await updateUserId(user, userMapping[user]);
		}
	}));
};

const run = async () => {
	const teamspaces = await getTeamspaceList();
	const userMapping = {};
	for (const teamspace of teamspaces) {
		logger.logInfo(`-${teamspace}`);
		// eslint-disable-next-line no-await-in-loop
		await processTeamspace(teamspace, userMapping);
	}
};

module.exports = run;
