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
const { getTeamspaceByAccount, addUserToAccount, createAccount, getAllUsersInAccount } = require(`${v5Path}/services/sso/frontegg`);

const { logger } = require(`${v5Path}/utils/logger`);
const { updateUserId } = require(`${v5Path}/models/users`);
const { splitArrayIntoChunks } = require(`${v5Path}/utils/helper/arrays`);
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

	const memberChunks = splitArrayIntoChunks(membersInTs, 10);

	for (const memberSubList of memberChunks) {
		let retryCount = 0;
		try {
		// eslint-disable-next-line no-await-in-loop
			await Promise.all(memberSubList.map(async ({
				user, customData: { email, userId, firstName, lastName } }) => {
				if (!emailToUserId[email]) {
					logger.logInfo(`\tAdding ${user} to frontegg account...`);
					// eslint-disable-next-line no-param-reassign
					userMapping[user] = await addUserToAccount(refId, email, [firstName, lastName].join(' '));
				} else {
					// eslint-disable-next-line no-param-reassign
					userMapping[user] = emailToUserId[email];
				}

				if (userId !== userMapping[user]) {
					logger.logInfo(`\tUpdating ${user}'s user ID...`);
					await updateUserId(user, userMapping[user]);
				}
			}));
		} catch (err) {
			if (err.message.includes('429')) {
				if (retryCount > 3) { throw err; }
				logger.logInfo('Rate limit reached with frontegg... retrying in 60s..');
				// eslint-disable-next-line no-await-in-loop
				await new Promise((r) => setTimeout(r, 60000));
				++retryCount;
			}
		}
	}
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
