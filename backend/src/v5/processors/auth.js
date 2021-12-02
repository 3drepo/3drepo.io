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
const { getSessionsByUsername, regenerateAuthSession } = require('../services/sessions');
const { getUserByEmail, getUserByUsername, login } = require('../models/users');
const config = require('../utils/config');
const { events } = require('../services/eventsManager/eventsManager.constants');
const { hasEmailFormat } = require('../utils/helper/strings');
const { publish } = require('../services/eventsManager/eventsManager');

const Auth = {};
const { templates } = require('../utils/responseCodes');

const isAccountLocked = (user) => {
	const currentTime = new Date();

	return user && user.customData && user.customData.loginInfo
		&& user.customData.loginInfo.failedLoginCount && user.customData.loginInfo.lastFailedLoginAt
		&& user.customData.loginInfo.failedLoginCount >= config.loginPolicy.maxUnsuccessfulLoginAttempts
		&& currentTime - user.customData.loginInfo.lastFailedLoginAt < config.loginPolicy.lockoutDuration;
};

Auth.login = async (userNameOrEmail, password, req) => {
	let user = null;
	if (hasEmailFormat(userNameOrEmail)) {
		user = await getUserByEmail(userNameOrEmail);
	} else {
		user = await getUserByUsername(userNameOrEmail);
	}

	if (isAccountLocked(user)) {
		throw templates.tooManyLoginAttempts;
	}

	const loginData = await login(user, password);
	await regenerateAuthSession(req, config, loginData);

	const sessions = req.session?.user?.webSession ? await getSessionsByUsername(user.user) : null;
	publish(events.USER_LOGGED_IN, { username: user.user,
		sessionID: req.sessionID,
		ipAddress: req.ips[0] || req.ip,
		userAgent: req.headers['user-agent'],
		referer: req.headers.referer,
		oldSessions: sessions });
};

Auth.getUserByUsername = getUserByUsername;

module.exports = Auth;
