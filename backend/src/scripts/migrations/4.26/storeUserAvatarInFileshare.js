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
const { getTeamspaceList } = require('../../utils');

const db = require(`${v5Path}/handler/db`);
const { logger } = require(`${v5Path}/utils/logger`);

const storeUserAvatarInFileshare = async (username) => {
	const { user, customData } = await db.findOneAndUpdate('admin', 'system.users', 
		{ user: username, 'customData.avatar': { $type: 'object' } },		
		{ $unset: { 'customData.avatar': 1 } },
		{ 'customData.avatar': 1, user: 1 });

	if(user){
		console.log(user);
		await uploadAvatar(user, customData.avatar.data.buffer);	
	}
};

const run = async () => {
	const teamspaces = await getTeamspaceList();
	for (let i = 0; i < teamspaces.length; ++i) {
		logger.logInfo(`\t\t-${teamspaces[i]}`);
		// eslint-disable-next-line no-await-in-loop
		await storeUserAvatarInFileshare(teamspaces[i]);
	}
};

module.exports = run;
