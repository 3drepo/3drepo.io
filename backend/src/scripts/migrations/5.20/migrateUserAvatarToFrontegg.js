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

const FSHandler = require(`${v5Path}/handler/fs`);
const { logger } = require(`${v5Path}/utils/logger`);
const { fileExists } = require(`${v5Path}/services/filesManager`);
const { getRefEntry } = require(`${v5Path}/models/fileRefs`);
const { getUserByEmail, updateProfile } = require(`${v5Path}/models/users`);
const { getTeamspaceRefId } = require(`${v5Path}/models/teamspaceSettings`);
const { getTeamspaceInvites } = require(`${v5Path}/models/teamspaceSettings`);
const { splitArrayIntoChunks } = require(`${v5Path}/utils/helper/arrays`);
const { AVATARS_COL_NAME, USERS_DB_NAME } = require(`${v5Path}/models/users.constants`);
const { getAllUsersInAccount, updateUserDetails, uploadAvatar } = require(`${v5Path}/services/sso/frontegg`);

const ACCEPTABLE_CHUNK_SIZE = 50;

const migrateUserAvatar = (membersChunk) => {
	membersChunk.map(async (member) => {
		// eslint-disable-next-line no-await-in-loop
		const { user, customData: { firstName, lastName, migrated } } = await getUserByEmail(member.email);

		if (!migrated) {
			try {
				// eslint-disable-next-line no-await-in-loop
				const hasAvatar = await fileExists(USERS_DB_NAME, AVATARS_COL_NAME, user);
				if (hasAvatar) {
					// eslint-disable-next-line no-await-in-loop
					const { link, mimeType } = await getRefEntry(USERS_DB_NAME, AVATARS_COL_NAME, user);
					const path = FSHandler.getFullPath(link);
					// eslint-disable-next-line no-await-in-loop
					await uploadAvatar(
						member.id,
						path,
						mimeType,
					);
				}
				if (member.name !== `${firstName} ${lastName}`) {
					// eslint-disable-next-line no-await-in-loop
					await updateUserDetails(member.id, { name: `${firstName} ${lastName}` });
				}
				// eslint-disable-next-line no-await-in-loop
				await updateProfile(user, { migrated: true });
			} catch (error) {
				logger.logError(`Failed to migrate users because: ${error.message}`);
			}
		}
	},
	);
};

const run = async () => {
	const teamspaces = await getTeamspaceList();
	for (const ts of teamspaces) {
		logger.logInfo(`Migrating avatars for teamspace: ${ts}`);
		// eslint-disable-next-line no-await-in-loop
		const [refId, invitations] = await Promise.all([getTeamspaceRefId(ts), getTeamspaceInvites(ts)]);
		// eslint-disable-next-line no-await-in-loop
		const members = await getAllUsersInAccount(refId);
		const overlap = members.filter((member) => !invitations.some((invite) => invite._id === member.email));
		const chunks = splitArrayIntoChunks(overlap, ACCEPTABLE_CHUNK_SIZE);

		for (const chunk of chunks) {
			// eslint-disable-next-line no-await-in-loop
			await migrateUserAvatar(chunk);
		}
	}
};

module.exports = run;
