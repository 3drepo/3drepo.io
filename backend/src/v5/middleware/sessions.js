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

const config = require('../utils/config');
const { events } = require('../services/eventsManager/eventsManager.constants');
const { getURLDomain } = require('../utils/helper/strings');
const { isFromWebBrowser } = require('../utils/helper/userAgent');
const { logger } = require('../utils/logger');
const { publish } = require('../services/eventsManager/eventsManager');
const { respond } = require('../utils/responder');
const { templates } = require('../utils/responseCodes');

const Sessions = {};

Sessions.createSession = (req, res) => {
	req.session.regenerate((err) => {
		if (err) {
			logger.logError(`Failed to regenerate session: ${err.message}`);
			respond(req, res, err);
		} else {
			const updatedUser = { ...req.loginData, webSession: false };

			if (req.headers['user-agent']) {
				updatedUser.webSession = isFromWebBrowser(req.headers['user-agent']);
			}

			if (req.headers.referer) {
				updatedUser.referer = getURLDomain(req.headers.referer);
			}

			req.session.user = updatedUser;
			req.session.cookie.domain = config.cookie_domain;

			if (config.cookie.maxAge) {
				req.session.cookie.maxAge = config.cookie.maxAge;
			}

			publish(events.SESSION_CREATED, { username: req.body.user,
				sessionID: req.sessionID,
				ipAddress: req.ips[0] || req.ip,
				userAgent: req.headers['user-agent'],
				socketId: req.headers['x-socket-id'],
				referer: req.headers.referer });

			respond(req, res, templates.ok, req.v4 ? updatedUser : undefined);
		}
	});
};

Sessions.destroySession = (req, res) => {
	const username = req.session?.user?.username;
	try {
		req.session.destroy(() => {
			res.clearCookie('connect.sid', { domain: config.cookie_domain, path: '/' });
			const session = { user: { username } };
			respond({ ...req, session }, res, templates.ok);
		});
	} catch (err) {
		// istanbul ignore next
		respond(req, res, err);
	}
};

module.exports = Sessions;
