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

const { src } = require('../../helper/path');
const { generateRandomString } = require('../../helper/services');

const db = require(`${src}/handler/db`);
jest.mock('../../../../src/v5/utils/helper/userAgent');
const UserAgentHelper = require(`${src}/utils/helper/userAgent`);

jest.mock('../../../../src/v5/services/eventsManager/eventsManager');
const EventsManager = require(`${src}/services/eventsManager/eventsManager`);

const { events } = require(`${src}/services/eventsManager/eventsManager.constants`);

UserAgentHelper.getUserAgentInfo.mockImplementation(() => ({ data: 'plugin ua data' }));

const LoginRecord = require(`${src}/models/loginRecords`);

const loginRecordsCol = 'loginRecords';

const testSaveRecordHelper = (testFailed = false) => {
	const sessionId = generateRandomString();
	const username = generateRandomString();
	const ipAddress = generateRandomString();
	const browserUserAgent = generateRandomString();
	const pluginUserAgent = `PLUGIN: ${generateRandomString()}`;
	const referrer = generateRandomString();

	const formatLoginRecord = (userAgentInfo, referer, ipAddr = ipAddress) => {
		const formattedLoginRecord = {
			ipAddr,
			...userAgentInfo,
			location: { country: 'unknown', city: 'unknown' },
		};

		if (referer) {
			formattedLoginRecord.referrer = referer;
		}

		if (!testFailed) {
			formattedLoginRecord._id = sessionId;
		}

		return formattedLoginRecord;
	};

	const callFunction = (user, id, ip, userAgent, ref) => (testFailed
		? LoginRecord.recordFailedAttempt(username, ip, userAgent, ref)
		: LoginRecord.saveLoginRecord(username, id, ip, userAgent, ref));

	const checkResults = (fn, user, expectedResult) => {
		expect(fn).toHaveBeenCalledTimes(1);
		const { loginTime, _id } = fn.mock.calls[0][2];
		const baseProps = testFailed ? { failed: true, _id, loginTime } : { loginTime };
		const loginRecord = { ...expectedResult, ...baseProps };
		expect(fn).toHaveBeenCalledWith(db.INTERNAL_DB, loginRecordsCol, { ...loginRecord, user });

		if (!testFailed) {
			expect(EventsManager.publish).toHaveBeenCalledWith(
				events.LOGIN_RECORD_CREATED, { username: user, loginRecord },
			);
		}
	};

	const fn = jest.spyOn(db, 'insertOne').mockResolvedValue(undefined);

	test('Should save a new login record if user agent is from plugin', async () => {
		await callFunction(username, sessionId, ipAddress, pluginUserAgent, referrer);
		const formattedLoginRecord = formatLoginRecord(UserAgentHelper.getUserAgentInfo(),
			referrer);
		checkResults(fn, username, formattedLoginRecord);
	});

	test('Should save a new login record if user agent is from browser', async () => {
		await callFunction(username, sessionId, ipAddress, browserUserAgent, referrer);
		const formattedLoginRecord = formatLoginRecord(UserAgentHelper.getUserAgentInfo(),
			referrer);
		checkResults(fn, username, formattedLoginRecord);
	});

	test('Should save a new login record if user agent empty', async () => {
		await callFunction(username, sessionId, ipAddress, '', referrer);
		const formattedLoginRecord = formatLoginRecord(UserAgentHelper.getUserAgentInfo(),
			referrer);
		checkResults(fn, username, formattedLoginRecord);
	});

	test('Should save a new login record if there is no referrer', async () => {
		await callFunction(username, sessionId, ipAddress, browserUserAgent);
		const formattedLoginRecord = formatLoginRecord(UserAgentHelper.getUserAgentInfo());
		checkResults(fn, username, formattedLoginRecord);
	});

	test('Should save a new login record if there is no location', async () => {
		await callFunction(username, sessionId, '0.0.0.0', browserUserAgent);
		const formattedLoginRecord = formatLoginRecord(UserAgentHelper.getUserAgentInfo(),
			undefined, '0.0.0.0');
		checkResults(fn, username, formattedLoginRecord);
	});
};

const testRecordFailedAttempt = () => {
	describe('Record failed login record', () => {
		testSaveRecordHelper(true);
	});
};

const testSaveLoginRecord = () => {
	describe('Save new login record', () => {
		testSaveRecordHelper();
	});
};

const testRemoveAllUserRecords = () => {
	describe('Remove all user login records', () => {
		test('Should just drop the user collection within loginRecords', async () => {
			const fn = jest.spyOn(db, 'deleteMany').mockResolvedValue(undefined);

			const user = generateRandomString();
			await expect(LoginRecord.removeAllUserRecords(user)).resolves.toBeUndefined();

			expect(fn).toHaveBeenCalledTimes(1);
			expect(fn).toHaveBeenCalledWith(db.INTERNAL_DB, 'loginRecords', { user });
		});
	});
};

const testGetLastLoginDate = () => {
	describe('Get last login date', () => {
		test('should return the last login date in record', async () => {
			const expectedDate = new Date();
			const fn = jest.spyOn(db, 'findOne').mockResolvedValue({ loginTime: expectedDate });

			const user = generateRandomString();
			await expect(LoginRecord.getLastLoginDate(user)).resolves.toEqual(expectedDate);

			expect(fn).toHaveBeenCalledTimes(1);
			expect(fn).toHaveBeenCalledWith(db.INTERNAL_DB, 'loginRecords', { user, failed: { $ne: true } }, { loginTime: 1 }, { loginTime: -1 });
		});

		test('should return undefined if the user has no login record', async () => {
			const fn = jest.spyOn(db, 'findOne').mockResolvedValue(undefined);

			const user = generateRandomString();
			await expect(LoginRecord.getLastLoginDate(user)).resolves.toBeUndefined();

			expect(fn).toHaveBeenCalledTimes(1);
			expect(fn).toHaveBeenCalledWith(db.INTERNAL_DB, 'loginRecords', { user, failed: { $ne: true } }, { loginTime: 1 }, { loginTime: -1 });
		});
	});
};

describe('models/loginRecords', () => {
	testSaveLoginRecord();
	testRecordFailedAttempt();
	testRemoveAllUserRecords();
	testGetLastLoginDate();
});
