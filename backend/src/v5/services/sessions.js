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

const db = require('../handler/db');

const { events } = require('./eventsManager/eventsManager.constants');
const expressSession = require('express-session');
const { publish } = require('./eventsManager/eventsManager');

const Sessions = {};

// istanbul ignore next
Sessions.session = (config) => {
	const store = db.getSessionStore(expressSession);
	const secure = config.public_protocol === 'https';
	const { secret, maxAge, domain } = config.cookie;
	return expressSession({
		secret,
		resave: true,
		rolling: true,
		saveUninitialized: false,
		cookie: {
			maxAge,
			domain,
			path: '/',
			secure,
			// None can only applied with secure set to true, which requires SSL.
			// None is required for embeddable viewer to work.
			sameSite: secure ? 'None' : 'Lax',
		},
		store,
	});
};

Sessions.getSessions = (query, projection, sort) =>
	db.find('admin', 'sessions', query, projection, sort);

Sessions.removeOldSessions = async (username, currentSessionID, referrer) => {
	if (!referrer) return;
	const query = {
		'session.user.username': username,
		'session.user.webSession': true,
		'session.user.referer': referrer,
		_id: { $ne: currentSessionID },
	};

	const sessionsToRemove = await Sessions.getSessions(query, { _id: 1 });

	const sessionIds = sessionsToRemove.map((s) =>
		s._id);

	await db.deleteMany('admin', 'sessions', { _id: { $in: sessionIds } });
	publish(events.SESSIONS_REMOVED, { ids: sessionIds });
};

module.exports = Sessions;
