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
const { destroySession, isSessionValid, setCSRFCookie } = require('../utils/sessions');
const { USER_AGENT_HEADER } = require('../utils/sessions.constants');
const { logger } = require('../utils/logger');
const { respond } = require('../utils/responder');
const { templates } = require('../utils/responseCodes');

const AuthMiddleware = {};

const destroySessionIfExists = (req, res) => new Promise((resolve) => {
	destroySession(req.session, res, () => resolve());
});

const checkValidSession = async (req, res, ignoreAPIKey) => {
	const { headers, session, cookies } = req;
	if (!await isSessionValid(session, cookies, headers, ignoreAPIKey)) {
		return false;
	}

	if (!session.user.isAPIKey) {
		const { id: sessionId, ipAddress, user: { userAgent } } = session;
		const reqUserAgent = headers[USER_AGENT_HEADER];

		const ipMatch = ipAddress === (req.ips[0] || req.ip);
		const userAgentMatch = reqUserAgent === userAgent;

		if (!ipMatch || !userAgentMatch) {
			await destroySessionIfExists(req, res);
			logger.logInfo(`Session ${sessionId} destroyed due to IP or user agent mismatch`);
			return false;
		}

		// extend the CSRF cookie with the existing token
		setCSRFCookie(session.token, res);
	}

	return true;
};

const validSession = (ignoreAPIKey) => async (req, res, next) => {
	if (await checkValidSession(req, res, ignoreAPIKey)) {
		await next();
	} else {
		respond(req, res, templates.notLoggedIn);
	}
};

AuthMiddleware.validSession = validSession(false);

AuthMiddleware.isLoggedIn = validSession(true);

AuthMiddleware.notLoggedIn = async (req, res, next) => {
	if (await checkValidSession(req, res, true)) {
		respond(req, res, templates.alreadyLoggedIn);
	} else {
		await next();
	}
};

module.exports = AuthMiddleware;
