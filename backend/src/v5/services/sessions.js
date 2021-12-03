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

const { getCollection, getSessionStore } = require('../handler/db');
const expressSession = require('express-session');
const { getURLDomain } = require('../utils/helper/strings');

const store = getSessionStore(expressSession);
const useragent = require('useragent');

const Sessions = {};

// istanbul ignore next
Sessions.session = (config) => {
	const isSSL = config.public_protocol === 'https';
	return expressSession({
		secret: config.cookie.secret,
		resave: true,
		rolling: true,
		saveUninitialized: false,
		cookie: {
			maxAge: config.cookie.maxAge,
			domain: config.cookie.domain,
			path: '/',
			secure: isSSL,
			// None can only applied with secure set to true, which requires SSL.
			// None is required for embeddable viewer to work.
			sameSite: isSSL ? 'None' : 'Lax',
		},
		store,
	});
};

Sessions.regenerateAuthSession = (req, config, user) => new Promise((resolve, reject) => {
	req.session.regenerate((err) => {
		if (err) {
			reject(err);
		} else {
			const updatedUser = { ...user, socketId: req.headers['x-socket-id'], webSession: false };

			if (req.headers && req.headers['user-agent']) {
				const ua = useragent.is(req.headers['user-agent']);
				updatedUser.webSession = ['webkit', 'opera', 'ie', 'chrome', 'safari', 'mobile_safari', 'firefox', 'mozilla', 'android']
					.some((browserType) => ua[browserType]); // If any of these browser types matches then is a websession
			}

			if (req.headers.referer) {
				updatedUser.referer = getURLDomain(req.headers.referer);
			}

			req.session.user = updatedUser;
			req.session.cookie.domain = config.cookie_domain;

			if (config.cookie.maxAge) {
				req.session.cookie.maxAge = config.cookie.maxAge;
			}

			resolve(req.session);
		}
	});
});

Sessions.getSessionsByUsername = (username) => getCollection('admin', 'sessions').then((_dbCol) => _dbCol.find({ 'session.user.username': username }).toArray());

Sessions.removeSessions = (sessionIds) => getCollection('admin', 'sessions').then((_dbCol) => _dbCol.deleteMany({ _id: { $in: sessionIds } }));

module.exports = Sessions;
