/**
 *  Copyright (C) 2021 3D Repo Ltd
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

const { ADMIN_DB } = require('../handler/db.constants');

const UserConstants = {};

UserConstants.AVATARS_COL_NAME = 'avatars.ref';
UserConstants.USERS_DB_NAME = ADMIN_DB;
UserConstants.USERS_COL = 'system.users';

UserConstants.USERNAME_BLACKLIST = [
	'payment',
	'test',
	'config',
	'os',
	'info',
	'contact',
	'config',
	'cookies',
	'password-change',
	'password-forgot',
	'pricing',
	'privacy',
	'register-request',
	'register-verify',
	'signUp',
	'termsAndConditions',
	'false',
	'admin',
	'local',
	'root',
	'notifications',
	'loginRecords',
	'sessions',
	'internal',
];

module.exports = UserConstants;
