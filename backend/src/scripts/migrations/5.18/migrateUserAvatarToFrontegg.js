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

const FormData = require('form-data');
const { createReadStream } = require('fs');
const { v5Path } = require('../../../interop');
const { getTeamspaceList } = require('../../utils');

const FSHandler = require(`${v5Path}/handler/fs`);
const { logger } = require(`${v5Path}/utils/logger`);
const { fileExists } = require(`${v5Path}/services/filesManager`);
const { getRefEntry } = require(`${v5Path}/models/fileRefs`);
const { getUserByEmail } = require(`${v5Path}/models/users`);
const { getTeamspaceRefId } = require(`${v5Path}/models/teamspaceSettings`);
const { getTeamspaceInvites } = require(`${v5Path}/models/teamspaceSettings`);
const { AVATARS_COL_NAME, USERS_DB_NAME } = require(`${v5Path}/models/users.constants`);
const { getAllUsersInAccount, updateUserDetails, uploadAvatar } = require(`${v5Path}/services/sso/frontegg`);

const migratedUsersAvatars = new Set();

const migrateAvatars = async (ts) => {
	const refId = await getTeamspaceRefId(ts);
	const members = await getAllUsersInAccount(refId);
	const invitations = await getTeamspaceInvites(ts);

	const overlap = members.filter((member) => !invitations.some((invite) => invite._id === member.email));

	for (const member of overlap) {
		if (!migratedUsersAvatars.has(member.id)) {
			try {
				const projection = {
					user: 1,
				};
				// eslint-disable-next-line no-await-in-loop
				const { user } = await getUserByEmail(member.email, projection);
				// eslint-disable-next-line no-await-in-loop
				const hasAvatar = await fileExists(USERS_DB_NAME, AVATARS_COL_NAME, user);

				// eslint-disable-next-line no-await-in-loop
				if (hasAvatar) {
				// eslint-disable-next-line no-await-in-loop
					const { size, mimeType, link } = await getRefEntry(USERS_DB_NAME, AVATARS_COL_NAME, user);
					const path = FSHandler.getFullPath(link);

					const formData = new FormData();
					formData.append('image', createReadStream(path), {
						contentType: mimeType,
						knownLength: size,
					});
					// eslint-disable-next-line no-await-in-loop
					const profilePictureURL = await uploadAvatar(
						member.id,
						refId,
						formData,
					);
					// eslint-disable-next-line no-await-in-loop
					await updateUserDetails(member.id, { profilePictureURL });
				}

				migratedUsersAvatars.add(member.id);
			} catch (error) {
				logger.logInfo(`Failed to migrate users because: ${error.message}`);
				throw error;
			}
		}
	}
};

const run = async () => {
	const teamspaces = await getTeamspaceList();
	for (const ts of teamspaces) {
		logger.logInfo(`Migrating avatars for teamspace: ${ts}`);
		// eslint-disable-next-line no-await-in-loop
		await migrateAvatars(ts);
	}
};

module.exports = run;
