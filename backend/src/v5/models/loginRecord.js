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
const { getLocationFromIPAddress, getUserAgentInfoFromBrowser, getUserAgentInfoFromPlugin,
	isUserAgentFromPlugin } = require('../utils/helper/strings');
const db = require('../handler/db');

const LoginRecord = {};

LoginRecord.saveLoginRecord = async (username, sessionId, ipAddress, userAgent, referer) => {
	let loginRecord = { _id: sessionId, loginTime: new Date(), ipAddr: ipAddress };

	const uaInfo = isUserAgentFromPlugin(userAgent)
		? getUserAgentInfoFromPlugin(userAgent) : getUserAgentInfoFromBrowser(userAgent);

	loginRecord = { ...loginRecord, ...uaInfo };

	const { country, city } = getLocationFromIPAddress(loginRecord.ipAddr);
	loginRecord.location = { country, city };

	if (referer) {
		loginRecord.referrer = referer;
	}

	await db.insertOne('loginRecords', username, loginRecord);
	return loginRecord;
};

module.exports = LoginRecord;
