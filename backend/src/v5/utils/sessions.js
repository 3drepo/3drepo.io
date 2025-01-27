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
const { escapeRegexChrs, getURLDomain } = require('./helper/strings');
const { deleteIfUndefined } = require('./helper/objects');
const { events } = require('../services/eventsManager/eventsManager.constants');
const { publish } = require('../services/eventsManager/eventsManager');
const { v4Path } = require('../../interop');

// FIXME: can remove the disable once we migrated config
// eslint-disable-next-line
const { apiUrls } = require(`${v4Path}/config`);

const referrerMatch = (sessionReferrer, headerReferrer) => {
	const domain = getURLDomain(headerReferrer);
	return domain === sessionReferrer
			|| apiUrls.all.some((api) => api.match(escapeRegexChrs(domain)));
};

const SessionUtils = {};

const validateCookie = (session, cookies, headers) => {
	const referrerMatched = !headers.referer || referrerMatch(session.user.referer, headers.referer);

	const headerToken = headers[CSRF_HEADER] || headers[CSRF_HEADER.toLowerCase()];

	const csrfMatched = !!session.token && (headerToken === session.token);

	return csrfMatched && referrerMatched;
};

SessionUtils.isSessionValid = (session, cookies, headers, ignoreApiKey = false) => {
	const user = session?.user;

	if (user) {
		const validSession = session.user.isAPIKey ? !ignoreApiKey
			: validateCookie(session, cookies, headers);
		return validSession;
	}

	return false;
};

SessionUtils.getUserFromSession = ({ user } = {}) => (user ? user.username : undefined);

SessionUtils.destroySession = (session, res, callback, elective) => {
	session.destroy(() => {
		res.clearCookie(CSRF_COOKIE, { domain: cookie.domain });
		res.clearCookie(SESSION_HEADER, { domain: cookie_domain, path: '/' });

		publish(events.SESSIONS_REMOVED, deleteIfUndefined({ ids: [session.id], elective }));

		callback();
	});
};

module.exports = SessionUtils;
