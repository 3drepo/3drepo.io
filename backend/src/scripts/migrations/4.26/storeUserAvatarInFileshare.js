/**
 *  Copyright (C) 2022 3D Repo Ltd
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
const { storeAvatarFile } = require('../../../v4/models/fileRef');
const db = require(`${v5Path}/handler/db`);
const { logger } = require(`${v5Path}/utils/logger`);

const storeUserAvatarInFileshare = async (username, avatarBuffer) => {
	await db.updateOne('admin', 'system.users', { user: username }, { $unset: { 'customData.avatar': 1 } });
	await storeAvatarFile(username, avatarBuffer);
};

const run = async () => {
	const usersWithAvatarsInDb = await db.find('admin', 'system.users', { 'customData.avatar': { $type: 'object' } },
		{ 'customData.avatar': 1, user: 1 });

	await Promise.all(usersWithAvatarsInDb.map(async (user) => {
		logger.logInfo(`\t\t-${user.user}`);
		await storeUserAvatarInFileshare(user.user, user.customData.avatar.data.buffer);
	}));
};

module.exports = run;
