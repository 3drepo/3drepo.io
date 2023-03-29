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

const { getUserByUsername } = require('../../models/users');
const { logger } = require('../../utils/logger');

/* eslint-disable */
const { v4Path } = require('../../../interop');
const { unpack } = require(`${v4Path}/models/invitations`);
/* eslint-enable */

const Invitations = {};

Invitations.unpack = async (username) => {
	try {
		const user = await getUserByUsername(username);
		await unpack(user);
	} catch (err) {
		logger.logError(`Failed to process invitations for ${username}: ${err.message}`);
	}
};

module.exports = Invitations;
