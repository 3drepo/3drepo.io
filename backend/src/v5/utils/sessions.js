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

const { CSRF_COOKIE, CSRF_HEADER, SESSION_HEADER } = require('./sessions.constants');
const { cookie, cookie_domain } = require('./config');
const { destroyAllSessions, validateToken } = require('../services/sso/frontegg');
const { escapeRegexChrs, getURLDomain } = require('./helper/strings');
const { apiUrls } = require('./config');
const { deleteIfUndefined } = require('./helper/objects');
const { events } = require('../services/eventsManager/eventsManager.constants');
const { logger } = require('./logger');
const { publish } = require('../services/eventsManager/eventsManager');

const referrerMatch = (sessionReferrer, headerReferrer) => {
	const domain = getURLDomain(headerReferrer);
	return domain === sessionReferrer
			|| apiUrls.all.some((api) => api.match(escapeRegexChrs(domain)));
};

const SessionUtils = {};

const validateCookie = async (session, cookies, headers) => {
	const referrerMatched = !headers.referer || referrerMatch(session.user.referer, headers.referer);
	const headerToken = headers[CSRF_HEADER] || headers[CSRF_HEADER.toLowerCase()];

	const csrfMatched = !!session.token && (headerToken === session.token);

	const internalSessionValid = csrfMatched && referrerMatched;

	if (internalSessionValid) {
		try {
			await validateToken(session.user.auth.tokenInfo, session.user.auth.userId);
			return true;
		} catch (err) {
			logger.logInfo(`Session ${session.id} was invalid due to an invalid JWT token`);
			return false;
		}
	}

	logger.logInfo(`Session ${session.id} was invalid due to ${csrfMatched ? 'referrer' : 'CSRF'} mismatch`);
	return false;
};

SessionUtils.isSessionValid = async (session, cookies, headers, ignoreApiKey = false) => {
	const user = session?.user;
	if (user) {
		const res = session.user.isAPIKey ? !ignoreApiKey
			: await validateCookie(session, cookies, headers);

		return res;
	}

	return false;
};

SessionUtils.setCSRFCookie = (token, res) => {
	const { domain, maxAge } = cookie;
	res.cookie(CSRF_COOKIE, token, { httpOnly: false, secure: true, sameSite: 'Strict', maxAge, domain });
};

SessionUtils.getUserFromSession = ({ user } = {}) => (user ? user.username : undefined);

SessionUtils.destroySession = (session, res, callback, elective) => {
	session.destroy(async () => {
		res.clearCookie(CSRF_COOKIE, { domain: cookie.domain });
		res.clearCookie(SESSION_HEADER, { domain: cookie_domain, path: '/' });

		const userId = session?.user?.auth?.userId;
		if (userId) {
			await destroyAllSessions(userId).catch(() => {
				// if it failed, we don't really care, keep going and destroy the 3DR session.
			});
		}

		publish(events.SESSIONS_REMOVED, deleteIfUndefined({ ids: [session.id], elective }));

		callback();
	});
};

module.exports = SessionUtils;
