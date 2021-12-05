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
const { authenticate, canLogIn, getUserByUsername } = require('../models/users');
const { getSessionsByUsername, regenerateAuthSession } = require('../services/sessions');
const config = require('../utils/config');
const { events } = require('../services/eventsManager/eventsManager.constants');
const { publish } = require('../services/eventsManager/eventsManager');

const Auth = {};

Auth.login = async (username, password, req) => {
	await canLogIn(username);

	const loginData = await authenticate(username, password);
	await regenerateAuthSession(req, config, loginData);

	const sessions = req.session?.user?.webSession ? await getSessionsByUsername(username) : null;
	publish(events.USER_LOGGED_IN, { username,
		sessionID: req.sessionID,
		ipAddress: req.ips[0] || req.ip,
		userAgent: req.headers['user-agent'],
		referer: req.headers.referer,
		oldSessions: sessions });
};

Auth.getUserByUsername = getUserByUsername;

module.exports = Auth;
