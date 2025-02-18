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

const { CSRF_COOKIE } = require('../utils/sessions.constants');
const { SOCKET_HEADER } = require('../services/chat/chat.constants');
const config = require('../utils/config');
const { deleteIfUndefined } = require('../utils/helper/objects');
const { destroySession } = require('../utils/sessions');
const { events } = require('../services/eventsManager/eventsManager.constants');
const { generateUUIDString } = require('../utils/helper/uuids');
const { getURLDomain } = require('../utils/helper/strings');
const { session: initSession } = require('../services/sessions');
const { isFromWebBrowser } = require('../utils/helper/userAgent');
const { publish } = require('../services/eventsManager/eventsManager');
const { respond } = require('../utils/responder');
const { templates } = require('../utils/responseCodes');

const Sessions = {};

Sessions.manageSessions = async (req, res, next) => {
	// In case other middleware sets the session
	if (req.session) {
		next();
		return;
	}

	const { middleware } = await initSession;

	middleware(req, res, next);
};

const updateSessionDetails = (req) => {
	const updatedUser = { ...req.loginData, webSession: false };
	const { session } = req;
	let userAgent = req.headers['user-agent'];

	const { ssoInfo } = req.session;
	if (ssoInfo) {
		userAgent = ssoInfo.userAgent;
		if (ssoInfo.referer) {
			updatedUser.referer = ssoInfo.referer;
		}

		delete req.session.ssoInfo;
	} else if (req.headers.referer) {
		updatedUser.referer = getURLDomain(req.headers.referer);
	}

	if (userAgent) {
		updatedUser.webSession = isFromWebBrowser(userAgent);
		updatedUser.userAgent = userAgent;
	}

	if (req.token) {
		session.token = req.token;
	}

	session.user = deleteIfUndefined(updatedUser);
	session.cookie.domain = config.cookie_domain;

	if (config.cookie.maxAge) {
		session.cookie.maxAge = config.cookie.maxAge;
	}

	const ipAddress = req.ips[0] || req.ip;
	session.ipAddress = ipAddress;

	publish(events.SESSION_CREATED, {
		username: updatedUser.username,
		sessionID: req.sessionID,
		ipAddress,
		userAgent,
		socketId: req.headers[SOCKET_HEADER],
		referer: updatedUser.referer });

	return session;
};

Sessions.destroySession = (req, res) => {
	const username = req.session?.user?.username;

	try {
		const sessionData = { user: { username: req.session?.user?.username } };
		const callback = () => respond({ ...req, session: sessionData }, res, templates.ok,
			req.v4 ? { username } : undefined);
		destroySession(req.session, res, callback, true);
	} catch (err) {
		// istanbul ignore next
		respond(req, res, err);
	}
};

Sessions.appendCSRFToken = async (req, res, next) => {
	const { domain, maxAge } = config.cookie;
	const token = generateUUIDString();
	res.cookie(CSRF_COOKIE, token, { httpOnly: false, secure: true, sameSite: 'Strict', maxAge, domain });
	req.token = token;
	await next();
};

Sessions.updateSession = async (req, res, next) => {
	updateSessionDetails(req);
	await next();
};

module.exports = Sessions;
