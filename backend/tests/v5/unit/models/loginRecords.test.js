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

jest.mock('../../../../src/v5/handler/db');
const DBHandler = require(`${src}/handler/db`);
const { INTERNAL_DB } = require(`${src}/handler/db.constants`);
jest.mock('../../../../src/v5/utils/helper/userAgent');
const UserAgentHelper = require(`${src}/utils/helper/userAgent`);

jest.mock('../../../../src/v5/services/eventsManager/eventsManager');
const EventsManager = require(`${src}/services/eventsManager/eventsManager`);

const { events } = require(`${src}/services/eventsManager/eventsManager.constants`);
UserAgentHelper.getUserAgentInfo.mockImplementation(() => ({ data: 'plugin ua data' }));

const LoginRecord = require(`${src}/models/loginRecords`);

const loginRecordsCol = 'loginRecords';

const testSaveRecordHelper = () => {
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

		formattedLoginRecord._id = sessionId;

		return formattedLoginRecord;
	};

	const callFunction = (user, id, ip, userAgent, ref) => LoginRecord.saveSuccessfulLoginRecord(
		user, id, ip, userAgent, ref);

	const checkResults = (fn, user, expectedResult) => {
		expect(fn).toHaveBeenCalledTimes(1);
		const { loginTime } = fn.mock.calls[0][2];
		const baseProps = { loginTime };
		const loginRecord = { ...expectedResult, ...baseProps };
		expect(fn).toHaveBeenCalledWith(INTERNAL_DB, loginRecordsCol, { ...loginRecord, user });

		expect(EventsManager.publish).toHaveBeenCalledTimes(1);
		expect(EventsManager.publish).toHaveBeenCalledWith(
			events.SUCCESSFUL_LOGIN_ATTEMPT, { username: user, loginRecord },
		);
	};

	test('Should save a new login record if user agent is from plugin', async () => {
		await callFunction(username, sessionId, ipAddress, pluginUserAgent, referrer);
		const formattedLoginRecord = formatLoginRecord(UserAgentHelper.getUserAgentInfo(),
			referrer);
		checkResults(DBHandler.insertOne, username, formattedLoginRecord);
	});

	test('Should save a new login record if user agent is from browser', async () => {
		await callFunction(username, sessionId, ipAddress, browserUserAgent, referrer);
		const formattedLoginRecord = formatLoginRecord(UserAgentHelper.getUserAgentInfo(),
			referrer);
		checkResults(DBHandler.insertOne, username, formattedLoginRecord);
	});

	test('Should save a new login record if user agent empty', async () => {
		await callFunction(username, sessionId, ipAddress, '', referrer);
		const formattedLoginRecord = formatLoginRecord(UserAgentHelper.getUserAgentInfo(),
			referrer);
		checkResults(DBHandler.insertOne, username, formattedLoginRecord);
	});

	test('Should save a new login record if there is no referrer', async () => {
		await callFunction(username, sessionId, ipAddress, browserUserAgent);
		const formattedLoginRecord = formatLoginRecord(UserAgentHelper.getUserAgentInfo());
		checkResults(DBHandler.insertOne, username, formattedLoginRecord);
	});

	test('Should save a new login record if there is no location', async () => {
		await callFunction(username, sessionId, '0.0.0.0', browserUserAgent);
		const formattedLoginRecord = formatLoginRecord(UserAgentHelper.getUserAgentInfo(),
			undefined, '0.0.0.0');
		checkResults(DBHandler.insertOne, username, formattedLoginRecord);
	});
};

const testSaveLoginRecord = () => {
	describe('Save new login record', () => {
		testSaveRecordHelper();
	});
};

const testRemoveAllUserRecords = () => {
	describe('Remove all user login records', () => {
		test('Should delete user loginRecords', async () => {
			const user = generateRandomString();
			await expect(LoginRecord.removeAllUserRecords(user)).resolves.toBeUndefined();

			expect(DBHandler.deleteMany).toHaveBeenCalledTimes(1);
			expect(DBHandler.deleteMany).toHaveBeenCalledWith(INTERNAL_DB, loginRecordsCol, { user });
		});
	});
};

const testGetLastLoginDate = () => {
	describe('Get last login date', () => {
		test('should return the last login date in record', async () => {
			const expectedDate = new Date();
			DBHandler.findOne.mockResolvedValueOnce({ loginTime: expectedDate });

			const user = generateRandomString();
			await expect(LoginRecord.getLastLoginDate(user)).resolves.toEqual(expectedDate);

			expect(DBHandler.findOne).toHaveBeenCalledTimes(1);
			expect(DBHandler.findOne).toHaveBeenCalledWith(INTERNAL_DB, loginRecordsCol,
				{ user, failed: { $ne: true } }, { loginTime: 1 }, { loginTime: -1 });
		});

		test('should return undefined if the user has no login record', async () => {
			const user = generateRandomString();
			await expect(LoginRecord.getLastLoginDate(user)).resolves.toBeUndefined();

			expect(DBHandler.findOne).toHaveBeenCalledTimes(1);
			expect(DBHandler.findOne).toHaveBeenCalledWith(INTERNAL_DB, loginRecordsCol,
				{ user, failed: { $ne: true } }, { loginTime: 1 }, { loginTime: -1 });
		});
	});
};

const testInitialise = () => {
	describe('Initialise', () => {
		test('should ensure indices exist', async () => {
			await LoginRecord.initialise();
			expect(DBHandler.createIndex).toHaveBeenCalledTimes(1);
			expect(DBHandler.createIndex).toHaveBeenCalledWith(INTERNAL_DB, loginRecordsCol,
				{ user: 1, loginTime: -1, failed: 1 }, { runInBackground: true });
		});
		test('should fail gracefully if there has been an error', async () => {
			const err = { message: generateRandomString() };
			DBHandler.createIndex.mockRejectedValueOnce(err);
			await LoginRecord.initialise();
			expect(DBHandler.createIndex).toHaveBeenCalledTimes(1);
			expect(DBHandler.createIndex).toHaveBeenCalledWith(INTERNAL_DB, loginRecordsCol,
				{ user: 1, loginTime: -1, failed: 1 }, { runInBackground: true });
		});
	});
};

describe('models/loginRecords', () => {
	testSaveLoginRecord();
	testRemoveAllUserRecords();
	testGetLastLoginDate();
	testInitialise();
});
