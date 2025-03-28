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
const { errCodes } = require('../handler/db.constants');
const { events } = require('../services/eventsManager/eventsManager.constants');
const geoip = require('geoip-lite');
const { getUserAgentInfo } = require('../utils/helper/userAgent');
const { logger } = require('../utils/logger');
const { templates: mailTemplates } = require('../services/mailer/mailer.constants');
const { publish } = require('../services/eventsManager/eventsManager');
const { sendSystemEmail } = require('../services/mailer');

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

	// This is something we're trying to debug adding more info in the log so we can track
	// Not worth adding more test cases for.
	/* istanbul ignore next */
	try {
		await db.insertOne(INTERNAL_DB, LOGIN_RECORDS_COL, { user, ...loginRecord });
	} catch (err) {
		// Post ISSUE #5356: This can happen when we reauthenticate against a teamspace.
		// reAuth is flagged in the session data to avoid this from happening, but
		// for some reason express session (or mongo-connect, not sure which one is at fault here)
		// doesn't seem to always commit the data, making it trigger this situation more often
		// This seems to happen more often with a replica set, so most likely mongo-connect.
		if (!err.code === errCodes.DUPLICATE_KEY) {
			throw err;
		}
	}

	publish(events.SUCCESSFUL_LOGIN_ATTEMPT, { username: user, loginRecord });
};

LoginRecords.initialise = async () => {
	try {
		await db.createIndex(INTERNAL_DB, LOGIN_RECORDS_COL,
			{ user: 1, loginTime: -1, failed: 1 }, { runInBackground: true });
	} catch (err) {
		logger.logError(`Failed to create index in login records: ${err.message}`);
	}
};
module.exports = LoginRecords;
