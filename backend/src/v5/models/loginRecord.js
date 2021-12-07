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

// detects edge as browser but not device
const { getUserAgentInfoFromBrowser, getUserAgentInfoFromPlugin, 
	isUserAgentFromPlugin } = require('../utils/helper/userAgent');
const db = require('../handler/db');
const { events } = require('../services/eventsManager/eventsManager.constants');
const { publish } = require('../services/eventsManager/eventsManager');
const geoip = require('geoip-lite');

const LoginRecord = {};

LoginRecord.saveLoginRecord = async (username, sessionId, ipAddress, userAgent, referer) => {
	const uaInfo = isUserAgentFromPlugin(userAgent)
		? getUserAgentInfoFromPlugin(userAgent) : getUserAgentInfoFromBrowser(userAgent);

	const loginRecord = { 
		_id: sessionId,
		loginTime: new Date(),
		ipAddr: ipAddress,
		...uaInfo 
	};

	const location = geoip.lookup(ipAddress);
	loginRecord.location = {
		country: location?.country ?? 'unknown',
		city: location?.city ?? 'unknown',
	};

	if (referer) {
		loginRecord.referrer = referer;
	}

	await db.insertOne('loginRecords', username, loginRecord);

	publish(events.LOGIN_RECORD_CREATED, { username, loginRecord });
};

module.exports = LoginRecord;
