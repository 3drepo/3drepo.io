/**
 *  Copyright (C) 2014 3D Repo Ltd
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

"use strict";

const { v5Path } = require("../../interop");
const { publish: publishV5Event} = require(`${v5Path}/services/eventsManager/eventsManager`);
const EventsV5 = require(`${v5Path}/services/eventsManager/eventsManager.constants`).events;
const expressSession = require("express-session");
const db = require("../handler/db");
const config = require("../config");
const C = require("../constants");
const utils = require("../utils");
const { systemLogger } = require("../logger");
const store = db.getSessionStore(expressSession);
const useragent = require("useragent");

const initialiseSession = () => {
	const isSSL = config.public_protocol === "https";
	return expressSession({
		secret: config.cookie.secret,
		resave: true,
		rolling: true,
		saveUninitialized: false,
		cookie: {
			maxAge: config.cookie.maxAge,
			domain: config.cookie.domain,
			path: "/",
			secure: isSSL,
			// None can only applied with secure set to true, which requires SSL.
			// None is required for embeddable viewer to work.
			sameSite:  isSSL ? "None" : "Lax"
		},
		store: store
	});
};

const SessionService = {};

SessionService.session = initialiseSession();

SessionService.regenerateAuthSession = (req, user) => {
	return new Promise((resolve, reject) => {
		req.session.regenerate(async (err) => {
			systemLogger.logDebug(`Creating session for ${user.username}`);
			if(err) {
				reject(err);
				return;
			}

			user = {...user, webSession: false};

			if (req.headers && req.headers["user-agent"]) {
				const ua = useragent.is(req.headers["user-agent"]);
				user.webSession = ["webkit", "opera", "ie", "chrome", "safari", "mobile_safari", "firefox", "mozilla", "android"].
					some(browserType => ua[browserType]); // If any of these browser types matches then is a websession
			}

			if (req.headers.referer) {
				user.referer = utils.getURLDomain(req.headers.referer);
			}

			req.session[C.REPO_SESSION_USER] = user;
			req.session.cookie.domain = config.cookie_domain;

			if (config.cookie.maxAge) {
				req.session.cookie.maxAge = config.cookie.maxAge;
			}

			publishV5Event(EventsV5.SESSION_CREATED, {
				username: user.username,
				sessionID: req.sessionID,
				ipAddress: req.ips[0] || req.ip,
				userAgent: req.headers["user-agent"],
				socketId: req.headers[C.HEADER_SOCKET_ID],
				referer: user.referer });
			resolve(req.session);

		});
	});
};

SessionService.getSessionsByUsername = (username) => {
	const query = {
		"session.user.username": username
	};

	return db.find("admin", "sessions", query);
};

module.exports = SessionService;
