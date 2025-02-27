/**
 *  Copyright (C) 2023 3D Repo Ltd
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
const { addUserToAccount, createAccount, createUser, getAllUsersInAccount } = require(`${v5Path}/services/sso/frontegg`);

const { logger } = require(`${v5Path}/utils/logger`);
const { updateUserId } = require(`${v5Path}/models/users`);

const processTeamspace = async (ts) => {
	let refId = await getTeamspaceRefId(ts);
	const isNew = !refId;
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
		if (emailToUserId[email]) {
			// This user is a registered user of the frontegg account

			if (emailToUserId[email] !== userId) {
				throw new Error(`User ID mismatched for ${user}. Expected ${userId}, found ${emailToUserId}`);
			}
		} else if (!userId) {
			// user does not exist in frontegg, we need to create an entry
			logger.logInfo(`\tCreating ${user}...`);
			const newUserId = await createUser(refId, email, [firstName, lastName].join(' '));
			console.log(newUserId);
			if (newUserId) await updateUserId(user, newUserId);
		} else {
			logger.logInfo(`\tAdding ${user} to account...`);
			await addUserToAccount(refId, userId, false);
		}
	}));
};

const run = async () => {
	const teamspaces = await getTeamspaceList();
	for (const teamspace of teamspaces) {
		logger.logInfo(`-${teamspace}`);
		// eslint-disable-next-line no-await-in-loop
		await processTeamspace(teamspace);
	}
};

module.exports = run;
