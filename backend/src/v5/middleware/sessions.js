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

const { getUserAgentInfo, isFromWebBrowser } = require('../utils/helper/userAgent');

const { CSRF_COOKIE } = require('../utils/sessions.constants');
const { SOCKET_HEADER } = require('../services/chat/chat.constants');
const config = require('../utils/config');
const { deleteIfUndefined } = require('../utils/helper/objects');
const { events } = require('../services/eventsManager/eventsManager.constants');
const { generateUUIDString } = require('../utils/helper/uuids');
const { getURLDomain } = require('../utils/helper/strings');
const { session: initSession } = require('../services/sessions');
const { logger } = require('../utils/logger');
const { publish } = require('../services/eventsManager/eventsManager');
const { respond } = require('../utils/responder');
const { templates } = require('../utils/responseCodes');
const { validateMany } = require('./common');

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
		updatedUser.applicationName = getUserAgentInfo(userAgent).application.name;
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

const createSession = (req, res) => {
	req.session.regenerate((err) => {
		if (err) {
			logger.logError(`Failed to regenerate session: ${err.message}`);
			respond(req, res, err);
		} else {
			const session = updateSessionDetails(req);
			respond(req, res, templates.ok, req.v4 ? session.user : undefined);
		}
	});
};

const removeCSRFToken = async (req, res, next) => {
	const { domain } = config.cookie;
	res.clearCookie(CSRF_COOKIE, { domain });
	await next();
};

const destroySession = (req, res) => {
	const username = req.session?.user?.username;
	try {
		req.session.destroy(() => {
			res.clearCookie('connect.sid', { domain: config.cookie_domain, path: '/' });
			const sessionData = { user: { username } };

			publish(events.SESSIONS_REMOVED, {
				ids: [req.sessionID],
				elective: true,
			});

			respond({ ...req, session: sessionData }, res, templates.ok, req.v4 ? { username } : undefined);
		});
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

Sessions.createSession = validateMany([Sessions.appendCSRFToken, createSession]);
Sessions.destroySession = validateMany([removeCSRFToken, destroySession]);

module.exports = Sessions;
