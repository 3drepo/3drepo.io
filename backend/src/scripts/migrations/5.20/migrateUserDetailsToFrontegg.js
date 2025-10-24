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
const { fileExtensionFromBuffer } = require('../../../v5/utils/helper/typeCheck');
const { getTeamspaceList } = require('../../utils');

const { fileExists, getFile } = require(`${v5Path}/services/filesManager`);
const { deleteIfUndefined } = require(`${v5Path}/utils/helper/objects`);
const { logger } = require(`${v5Path}/utils/logger`);
const { getRefEntry } = require(`${v5Path}/models/fileRefs`);
const { getUserByEmail, updateProfile } = require(`${v5Path}/models/users`);
const { getTeamspaceRefId } = require(`${v5Path}/models/teamspaceSettings`);
const { getTeamspaceInvites } = require(`${v5Path}/models/teamspaceSettings`);
const { splitArrayIntoChunks } = require(`${v5Path}/utils/helper/arrays`);
const { AVATARS_COL_NAME, USERS_DB_NAME } = require(`${v5Path}/models/users.constants`);
const { getAllUsersInAccount, updateUserDetails, uploadAvatar } = require(`${v5Path}/services/sso/frontegg`);

const ACCEPTABLE_CHUNK_SIZE = 50;

const updateUserDetailsOnFrontegg = async (member) => {
	const { user, customData: { firstName, lastName, billing, migrated } } = await getUserByEmail(member.email,
		{ user: 1, 'customData.firstName': 1, 'customData.lastName': 1, 'customData.billing': 1, 'customData.migrated': 1 });

	if (!migrated) {
		try {
			const hasAvatar = await fileExists(USERS_DB_NAME, AVATARS_COL_NAME, user);
			if (hasAvatar) {
				const { mimeType } = await getRefEntry(USERS_DB_NAME, AVATARS_COL_NAME, user);
				const buffer = await getFile(USERS_DB_NAME, AVATARS_COL_NAME, user);
				const fileObj = {
					buffer,
					mimetype: mimeType,
					originalname: `avatar.${await fileExtensionFromBuffer(buffer) || 'png'}`,
				};

				await uploadAvatar(
					member.id,
					fileObj,
				);
			}

			const countryCode = billing?.billingInfo?.countryCode;
			const company = billing?.billingInfo?.company;

			await updateUserDetails(member.id, deleteIfUndefined({ firstName, lastName, countryCode, company }));

			await updateProfile(user, { migrated: true });
		} catch (error) {
			logger.logError(`Failed to migrate users because: ${error.message}`);
		}
	}
};

const processTeamspace = async (teamspace) => {
	logger.logInfo(`Migrating avatars for teamspace: ${teamspace}`);
	const [refId, invitations] = await Promise.all([getTeamspaceRefId(teamspace), getTeamspaceInvites(teamspace)]);
	const members = await getAllUsersInAccount(refId);
	const activeMembers = members.filter((member) => !invitations.some((invite) => invite._id === member.email));
	const chunks = splitArrayIntoChunks(activeMembers, ACCEPTABLE_CHUNK_SIZE);

	for (const chunk of chunks) {
		// eslint-disable-next-line no-await-in-loop
		await Promise.all(chunk.map(updateUserDetailsOnFrontegg));
	}
};

const run = async () => {
	const teamspaces = await getTeamspaceList();
	for (const ts of teamspaces) {
		// eslint-disable-next-line no-await-in-loop
		await processTeamspace(ts);
	}
};

module.exports = run;
