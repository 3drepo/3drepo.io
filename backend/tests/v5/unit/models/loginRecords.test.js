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
const { times } = require('lodash');
const { src } = require('../../helper/path');
const { generateRandomString } = require('../../helper/services');

const db = require(`${src}/handler/db`);
const { INTERNAL_DB } = require(`${src}/handler/db.constants`);
jest.mock('../../../../src/v5/utils/helper/userAgent');
const UserAgentHelper = require(`${src}/utils/helper/userAgent`);

jest.mock('../../../../src/v5/services/eventsManager/eventsManager');
const EventsManager = require(`${src}/services/eventsManager/eventsManager`);

const { events } = require(`${src}/services/eventsManager/eventsManager.constants`);
const { loginPolicy } = require(`${src}/utils/config`);

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
		? LoginRecord.recordFailedAttempt(user, ip, userAgent, ref)
		: LoginRecord.saveSuccessfulLoginRecord(user, id, ip, userAgent, ref));

	const checkResults = (fn, user, expectedResult) => {
		expect(fn).toHaveBeenCalledTimes(1);
		const { loginTime, _id } = fn.mock.calls[0][2];
		const baseProps = testFailed ? { failed: true, _id, loginTime } : { loginTime };
		const loginRecord = { ...expectedResult, ...baseProps };
		expect(fn).toHaveBeenCalledWith(INTERNAL_DB, loginRecordsCol, { ...loginRecord, user });

		if (testFailed) {
			expect(EventsManager.publish).not.toHaveBeenCalled();
		} else {
			expect(EventsManager.publish).toHaveBeenCalledTimes(1);
			expect(EventsManager.publish).toHaveBeenCalledWith(
				events.SUCCESSFUL_LOGIN_ATTEMPT, { username: user, loginRecord },
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

		test(`Should emit ${events.ACCOUNT_LOCKED} event if the account becomes locked`, async () => {
			// for last login time
			jest.spyOn(db, 'findOne').mockResolvedValueOnce(undefined);

			let date = Date.now();
			const records = times(loginPolicy.maxUnsuccessfulLoginAttempts, () => {
				date -= 60000;
				return { loginTime: new Date(date) };
			});

			const user = generateRandomString();

			// for all failed login since last login
			jest.spyOn(db, 'find').mockResolvedValueOnce(records);
			await LoginRecord.recordFailedAttempt(user,
				generateRandomString(), generateRandomString(), generateRandomString());

			expect(EventsManager.publish).toHaveBeenCalledTimes(1);
			expect(EventsManager.publish).toHaveBeenCalledWith(
				events.ACCOUNT_LOCKED, { user },
			);
		});
	});
};

const testSaveLoginRecord = () => {
	describe('Save new login record', () => {
		testSaveRecordHelper();
	});
};
const testIsAccountLocked = () => {
	describe('Is account locked', () => {
		const user = generateRandomString();
		test('Should return false if there is no failed login records', async () => {
			const findLastLoginFn = jest.spyOn(db, 'findOne').mockResolvedValueOnce(undefined);
			const findRecordsFn = jest.spyOn(db, 'find').mockResolvedValueOnce([]);
			await expect(LoginRecord.isAccountLocked(user)).resolves.toBeFalsy();

			expect(findLastLoginFn).toHaveBeenCalledTimes(1);

			expect(findRecordsFn).toHaveBeenCalledTimes(1);
			expect(findRecordsFn).toHaveBeenCalledWith(INTERNAL_DB, loginRecordsCol,
				{ user, failed: true }, { loginTime: 1 }, { loginTime: -1 }, loginPolicy.maxUnsuccessfulLoginAttempts);
		});

		test('Should only search through failed records since the last successful login', async () => {
			const date = new Date();
			const findLastLoginFn = jest.spyOn(db, 'findOne').mockResolvedValueOnce({ loginTime: date });
			const findRecordsFn = jest.spyOn(db, 'find').mockResolvedValueOnce([]);
			await expect(LoginRecord.isAccountLocked(user)).resolves.toBeFalsy();

			expect(findLastLoginFn).toHaveBeenCalledTimes(1);

			expect(findRecordsFn).toHaveBeenCalledTimes(1);
			expect(findRecordsFn).toHaveBeenCalledWith(INTERNAL_DB, loginRecordsCol,
				{ user, failed: true, loginTime: { $gt: date } }, { loginTime: 1 },
				{ loginTime: -1 }, loginPolicy.maxUnsuccessfulLoginAttempts);
		});

		test(`Should return true if there has been ${loginPolicy.maxUnsuccessfulLoginAttempts} failed attempts without timeouts`, async () => {
			jest.spyOn(db, 'findOne').mockResolvedValueOnce(undefined);

			let ts = Date.now();
			const records = times(loginPolicy.maxUnsuccessfulLoginAttempts, () => {
				ts -= 60000;
				return { loginTime: new Date(ts) };
			});

			jest.spyOn(db, 'find').mockResolvedValueOnce(records);

			await expect(LoginRecord.isAccountLocked(user)).resolves.toBeTruthy();
		});

		test(`Should return false if there has been less than ${loginPolicy.maxUnsuccessfulLoginAttempts} failed attempts without timeouts`, async () => {
			jest.spyOn(db, 'findOne').mockResolvedValueOnce(undefined);

			let ts = Date.now();
			const records = times(loginPolicy.maxUnsuccessfulLoginAttempts - 1, () => {
				ts -= 60000;
				return { loginTime: new Date(ts) };
			});

			jest.spyOn(db, 'find').mockResolvedValueOnce(records);

			await expect(LoginRecord.isAccountLocked(user)).resolves.toBeFalsy();
		});

		test('Should return false if sufficient time has lapsed since the account has been locked', async () => {
			jest.spyOn(db, 'findOne').mockResolvedValueOnce(undefined);

			let ts = Date.now() - loginPolicy.lockoutDuration;
			const records = times(loginPolicy.maxUnsuccessfulLoginAttempts, () => {
				ts -= 60000;
				return { loginTime: new Date(ts) };
			});

			jest.spyOn(db, 'find').mockResolvedValueOnce(records);

			await expect(LoginRecord.isAccountLocked(user)).resolves.toBeFalsy();
		});

		test('Should return false if sufficient time has lapsed in between attempts', async () => {
			jest.spyOn(db, 'findOne').mockResolvedValueOnce(undefined);

			let ts = Date.now() - loginPolicy.lockoutDuration;
			const records = times(loginPolicy.maxUnsuccessfulLoginAttempts, () => {
				ts -= loginPolicy.lockoutDuration;
				return { loginTime: new Date(ts) };
			});

			jest.spyOn(db, 'find').mockResolvedValueOnce(records);

			await expect(LoginRecord.isAccountLocked(user)).resolves.toBeFalsy();
		});
	});
};

const testRemoveAllUserRecords = () => {
	describe('Remove all user login records', () => {
		test('Should just drop the user collection within loginRecords', async () => {
			const fn = jest.spyOn(db, 'deleteMany').mockResolvedValue(undefined);

			const user = generateRandomString();
			await expect(LoginRecord.removeAllUserRecords(user)).resolves.toBeUndefined();

			expect(fn).toHaveBeenCalledTimes(1);
			expect(fn).toHaveBeenCalledWith(INTERNAL_DB, loginRecordsCol, { user });
		});
	});
};

const testGetLastLoginDate = () => {
	describe('Get last login date', () => {
		test('should return the last login date in record', async () => {
			const expectedDate = new Date();
			const fn = jest.spyOn(db, 'findOne').mockResolvedValueOnce({ loginTime: expectedDate });

			const user = generateRandomString();
			await expect(LoginRecord.getLastLoginDate(user)).resolves.toEqual(expectedDate);

			expect(fn).toHaveBeenCalledTimes(1);
			expect(fn).toHaveBeenCalledWith(INTERNAL_DB, loginRecordsCol,
				{ user, failed: { $ne: true } }, { loginTime: 1 }, { loginTime: -1 });
		});

		test('should return undefined if the user has no login record', async () => {
			const fn = jest.spyOn(db, 'findOne').mockResolvedValueOnce(undefined);

			const user = generateRandomString();
			await expect(LoginRecord.getLastLoginDate(user)).resolves.toBeUndefined();

			expect(fn).toHaveBeenCalledTimes(1);
			expect(fn).toHaveBeenCalledWith(INTERNAL_DB, loginRecordsCol,
				{ user, failed: { $ne: true } }, { loginTime: 1 }, { loginTime: -1 });
		});
	});
};

const testInitialise = () => {
	describe('Initialise', () => {
		test('should ensure indices exist', async () => {
			const fn = jest.spyOn(db, 'createIndex').mockResolvedValueOnce(undefined);
			await LoginRecord.initialise();
			expect(fn).toHaveBeenCalledTimes(1);
			expect(fn).toHaveBeenCalledWith(INTERNAL_DB, loginRecordsCol,
				{ user: 1, loginTime: -1, failed: 1 }, { runInBackground: true });
		});
	});
};

describe('models/loginRecords', () => {
	testSaveLoginRecord();
	testRecordFailedAttempt();
	testRemoveAllUserRecords();
	testGetLastLoginDate();
	testIsAccountLocked();
	testInitialise();
});
