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
const { events } = require('../services/eventsManager/eventsManager.constants');
const expressSession = require('express-session');
const { getURLDomain } = require('../utils/helper/strings');
const useragent = require('useragent');
const { publish } = require('../services/eventsManager/eventsManager');
const Device = require('device');
const UaParserJs = require('ua-parser-js');
const geoip = require('geoip-lite');
const Sessions = {};

// istanbul ignore next
Sessions.session = (config) => {
	const store = db.getSessionStore(expressSession);
	const secure = config.public_protocol === 'https';
	const {secret, maxAge, domain} = config.cookie; 
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

Sessions.regenerateAuthSession = (req, config, user) => new Promise((resolve, reject) => {
	req.session.regenerate((err) => {
		if (err) {
			reject(err);
		} else {
			const updatedUser = { ...user, socketId: req.headers['x-socket-id'], webSession: false };

			if (req?.headers['user-agent']) {
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

Sessions.getSessions = async (query, projection, sort) => { 
	return await db.find('admin', 'sessions', query, projection, sort);
}

Sessions.removeOldSessions = async (username, currentSessionID) =>{
	const query = {
		'session.user.username': username,
		'session.user.webSession': true,
		_id: { '$ne': currentSessionID }
	}
	const sessionsToRemove = await Sessions.getSessions(query, { _id: 1, 'session.user.socketId': 1 });

	await db.deleteMany('admin', 'sessions', { _id: { $in: sessionsToRemove.map(s => s._id) } });
	publish(events.SESSIONS_REMOVED, { removedSessions: sessionsToRemove });
} 

// Format:
// PLUGIN: {OS Name}/{OS Version} {Host Software Name}/{Host Software Version} {Plugin Type}/{Plugin Version}
// Example:
// PLUGIN: Windows/10.0.19042.0 REVIT/2021.1 PUBLISH/4.15.0
Sessions.getUserAgentInfoFromPlugin = (userAgentString) => {
	const [osInfo, appInfo, engineInfo] = userAgentString.replace('PLUGIN: ', '').split(' ');

	const osInfoComponents = osInfo.split('/');
	const appInfoComponents = appInfo.split('/');
	const engineInfoComponents = engineInfo.split('/');

	const userAgentInfo = {
		application: {
			name: appInfoComponents[0],
			version: appInfoComponents[1],
			type: 'plugin',
		},
		engine: {
			name: '3drepoplugin',
			version: engineInfoComponents[1],
		},
		os: {
			name: osInfoComponents[0],
			version: osInfoComponents[1],
		},
		device: 'desktop',
	};

	return userAgentInfo;
};

Sessions.getUserAgentInfoFromBrowser = (userAgentString) => {
	const { browser, engine, os } = UaParserJs(userAgentString);
	const userAgentInfo = {
		application: browser.name ? { ...browser, type: 'browser' } : { type: 'unknown' },
		engine,
		os,
		device: userAgentString ? Device(userAgentString).type : 'unknown',
	};

	return userAgentInfo;
};

Sessions.isUserAgentFromPlugin = (userAgent) => userAgent.split(' ')[0] === 'PLUGIN:';

Sessions.getLocationFromIPAddress = (ipAddress) => geoip.lookup(ipAddress);

module.exports = Sessions;
