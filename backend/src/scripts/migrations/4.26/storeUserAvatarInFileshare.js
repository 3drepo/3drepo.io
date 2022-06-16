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
const { uploadAvatar } = require('../../../v5/processors/users');

const db = require(`${v5Path}/handler/db`);
const { logger } = require(`${v5Path}/utils/logger`);

const storeUserAvatarInFileshare = async (username, avatarBuffer) => {
	await db.updateOne('admin', 'system.users', { user: username }, { $unset: { 'customData.avatar': 1 } });
	await uploadAvatar(username, avatarBuffer);	
};

const processTeamspace = async (teamspace) => {	
	const user = await db.find('admin', 'system.users', { user: teamspace, 'customData.avatar': { $type: 'object' } },
		{ 'customData.avatar': 1, user: 1 });

	if(user){
		await storeUserAvatarInFileshare(user.user, user.customData.avatar.data.buffer);
	}	
};


const run = async () => {
	const teamspaces = await getTeamspaceList();
	for (let i = 0; i < teamspaces.length; ++i) {
		logger.logInfo(`\t\t-${teamspaces[i]}`);
		// eslint-disable-next-line no-await-in-loop
		await processTeamspace(teamspaces[i]);
	}
};

module.exports = run;
