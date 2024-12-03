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

const { CSRF_COOKIE, SESSION_HEADER, USER_AGENT_HEADER } = require('../utils/sessions.constants');
const { cookie, cookie_domain } = require('../utils/config');
const { events } = require('../services/eventsManager/eventsManager.constants');
const { isAccountActive } = require('../models/users');
const { isAccountLocked } = require('../models/loginRecords');
const { isSessionValid } = require('../utils/sessions');
const { logger } = require('../utils/logger');
const { publish } = require('../services/eventsManager/eventsManager');
const { respond } = require('../utils/responder');
const { templates } = require('../utils/responseCodes');
const { validateMany } = require('./common');

const AuthMiddleware = {};

const validSessionDetails = async (req, res, next) => {
	if (!req.session.user.isAPIKey) {
		const { ipAddress, user: { userAgent } } = req.session;
		const reqUserAgent = req.headers[USER_AGENT_HEADER];

		const ipMatch = ipAddress === (req.ips[0] || req.ip);
		const userAgentMatch = reqUserAgent === userAgent;

		if (!ipMatch || !userAgentMatch) {
			try {
				req.session.destroy(() => {
					logger.logInfo(`Session ${req.sessionID} destroyed due to IP or user agent mismatch`);

					res.clearCookie(CSRF_COOKIE, { domain: cookie.domain });
					res.clearCookie(SESSION_HEADER, { domain: cookie_domain, path: '/' });

					publish(events.SESSIONS_REMOVED, { ids: [req.sessionID] });

					respond(req, res, templates.notLoggedIn);
				});
			} catch (err) {
				respond(req, res, err);
			}

			return;
		}
	}

	await next();
};

const validSession = async (req, res, next) => {
	const { headers, session, cookies } = req;
	if (isSessionValid(session, cookies, headers)) {
		await next();
	} else {
		respond(req, res, templates.notLoggedIn);
	}
};

AuthMiddleware.isLoggedIn = async (req, res, next) => {
	const { headers, session, cookies } = req;
	if (isSessionValid(session, cookies, headers, true)) {
		await next();
	} else {
		respond(req, res, templates.notLoggedIn);
	}
};

AuthMiddleware.notLoggedIn = async (req, res, next) => {
	const { headers, session, cookies } = req;
	if (isSessionValid(session, cookies, headers, true)) {
		respond(req, res, templates.alreadyLoggedIn);
	} else {
		await next();
	}
};

const accountActive = async (req, res, next) => {
	const { user } = req.body;
	try {
		if (!await isAccountActive(user)) {
			throw templates.userNotVerified;
		}
		await next();
	} catch (err) {
		respond(req, res, err);
	}
};

const accountNotLocked = async (req, res, next) => {
	const { user } = req.body;
	try {
		if (await isAccountLocked(user)) {
			throw templates.tooManyLoginAttempts;
		}
		await next();
	} catch (err) {
		respond(req, res, err);
	}
};

AuthMiddleware.canLogin = validateMany([AuthMiddleware.notLoggedIn, accountActive, accountNotLocked]);
AuthMiddleware.validSession = validateMany([validSession, validSessionDetails]);

module.exports = AuthMiddleware;
