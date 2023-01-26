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

const { INTERNAL_DB } = require('../handler/db.constants');
const db = require('../handler/db');
const { events } = require('../services/eventsManager/eventsManager.constants');
const { generateUUIDString } = require('../utils/helper/uuids');
const geoip = require('geoip-lite');
const { getUserAgentInfo } = require('../utils/helper/userAgent');
const { loginPolicy } = require('../utils/config');
const { publish } = require('../services/eventsManager/eventsManager');

const LoginRecords = {};
const LOGIN_RECORDS_COL = 'loginRecords';

LoginRecords.getLastLoginDate = async (user) => {
	const lastRecord = await db.findOne(INTERNAL_DB, LOGIN_RECORDS_COL,
		{ user, failed: { $ne: true } }, { loginTime: 1 }, { loginTime: -1 });
	return lastRecord?.loginTime;
};

LoginRecords.removeAllUserRecords = async (user) => {
	await db.deleteMany(INTERNAL_DB, LOGIN_RECORDS_COL, { user });
};

const getFailedAttemptsSince = async (user, limit, dateFrom) => {
	const query = { user, failed: true };

	if (dateFrom) {
		query.loginTime = { $gt: dateFrom };
	}

	const res = await db.find(INTERNAL_DB, LOGIN_RECORDS_COL,
		query, { loginTime: 1 }, { loginTime: -1 }, limit);

	return res.map(({ loginTime }) => loginTime);
};

LoginRecords.isAccountLocked = async (user) => {
	const lastLogin = await LoginRecords.getLastLoginDate(user);
	const {
		maxUnsuccessfulLoginAttempts: maxAttempts,
		lockoutDuration,
	} = loginPolicy;

	const nFailedAttempts = await getFailedAttemptsSince(user, maxAttempts, lastLogin);

	if (nFailedAttempts.length === maxAttempts) {
		let lastAttempt = new Date();
		for (const time of nFailedAttempts) {
			if ((lastAttempt - time) >= lockoutDuration) {
				return false;
			}

			lastAttempt = time;
		}
		return true;
	}
	return false;
};

const generateRecord = (_id, ipAddr, userAgent, referer) => {
	const uaInfo = getUserAgentInfo(userAgent);

	const loginRecord = {
		_id,
		loginTime: new Date(),
		ipAddr,
		...uaInfo,
	};

	const location = geoip.lookup(ipAddr);

	loginRecord.location = {
		country: location?.country ?? 'unknown',
		city: location?.city ?? 'unknown',
	};

	if (referer) {
		loginRecord.referrer = referer;
	}

	return loginRecord;
};

LoginRecords.saveSuccessfulLoginRecord = async (user, sessionId, ipAddress, userAgent, referer) => {
	const loginRecord = generateRecord(sessionId, ipAddress, userAgent, referer);
	await db.insertOne(INTERNAL_DB, LOGIN_RECORDS_COL, { user, ...loginRecord });

	publish(events.SUCCESSFUL_LOGIN_ATTEMPT, { username: user, loginRecord });
};

LoginRecords.recordFailedAttempt = async (user, ipAddress, userAgent, referer) => {
	const loginRecord = generateRecord(generateUUIDString(), ipAddress, userAgent, referer);

	await db.insertOne(INTERNAL_DB, LOGIN_RECORDS_COL, { failed: true, user, ...loginRecord });

	if (await (LoginRecords.isAccountLocked(user))) {
		publish(events.ACCOUNT_LOCKED, { user });
	}
};

LoginRecords.initialise = () => db.createIndex(INTERNAL_DB, LOGIN_RECORDS_COL,
	{ user: 1, loginTime: -1, failed: 1 }, { runInBackground: true });

module.exports = LoginRecords;
