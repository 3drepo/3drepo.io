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
const { destroySession, isSessionValid } = require('../utils/sessions');
const { CSRF_COOKIE } = require('../utils/sessions.constants');
const { USER_AGENT_HEADER } = require('../utils/sessions.constants');
const config = require('../utils/config');
const { logger } = require('../utils/logger');
const { respond } = require('../utils/responder');
const { templates } = require('../utils/responseCodes');
const { validateMany } = require('./common');

const AuthMiddleware = {};

const destroySessionIfExists = (req, res) => new Promise((resolve) => {
	destroySession(req.session, res, () => resolve());
});

const validSessionDetails = async (req, res, next) => {
	if (!req.session.user.isAPIKey) {
		const { id: sessionId, ipAddress, user: { userAgent } } = req.session;
		const reqUserAgent = req.headers[USER_AGENT_HEADER];

		const ipMatch = ipAddress === (req.ips[0] || req.ip);
		const userAgentMatch = reqUserAgent === userAgent;

		if (!ipMatch || !userAgentMatch) {
			await destroySessionIfExists(req, res);
			logger.logInfo(`Session ${sessionId} destroyed due to IP or user agent mismatch`);
			respond(req, res, templates.notLoggedIn);
			return;
		}
	}

	await next();
};

const checkValidSession = async (req, res, ignoreAPIKey = false) => {
	const { headers, session, cookies } = req;
	const isValid = await isSessionValid(session, cookies, headers, ignoreAPIKey);

	// extend the CSRF cookie if applicable
	if (session.token) {
		const { domain, maxAge } = config.cookie;
		res.cookie(CSRF_COOKIE, session.token, { httpOnly: false, secure: true, sameSite: 'Strict', maxAge, domain });
	}

	return isValid;
};

const validSession = async (req, res, next) => {
	if (await checkValidSession(req, res)) {
		await next();
	} else {
		respond(req, res, templates.notLoggedIn);
	}
};

AuthMiddleware.isLoggedIn = async (req, res, next) => {
	if (await checkValidSession(req, res, true)) {
		await next();
	} else {
		respond(req, res, templates.notLoggedIn);
	}
};

AuthMiddleware.notLoggedIn = async (req, res, next) => {
	if (await checkValidSession(req, res, true)) {
		respond(req, res, templates.alreadyLoggedIn);
	} else {
		await next();
	}
};

AuthMiddleware.validSession = validateMany([validSession, validSessionDetails]);

module.exports = AuthMiddleware;
