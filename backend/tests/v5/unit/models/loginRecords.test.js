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

const db = require(`${src}/handler/db`);
jest.mock('../../../../src/v5/utils/helper/userAgent');
const UserAgentHelper = require(`${src}/utils/helper/userAgent`);

UserAgentHelper.isUserAgentFromPlugin.mockImplementation((userAgent) =>
	userAgent.split(' ')[0] === 'PLUGIN:');
UserAgentHelper.getUserAgentInfoFromBrowser.mockImplementation(() =>
	({ data: 'browser ua data' }));
UserAgentHelper.getUserAgentInfoFromPlugin.mockImplementation(() =>
	({ data: 'plugin ua data' }));

const sessionId = '123456';
const username = 'someUsername';
const ipAddress = '290.241.146.180';
const browserUserAgent = 'browser user agent';
const pluginUserAgent = 'PLUGIN: plugin user agent';
const referrer = 'www.google.com';
const LoginRecord = require(`${src}/models/loginRecord`);

const testSaveLoginRecord = () => {
	const formatLoginRecord = (userAgentInfo, referer, ipAddr = ipAddress) => {
		const formattedLoginRecord = {
			_id: sessionId,
			ipAddr,
			...userAgentInfo,
			location: { country: 'unknown', city: 'unknown' },
		};

		if (referer) {
			formattedLoginRecord.referrer = referer;
		}

		return formattedLoginRecord;
	};

	const checkResults = (fn, user, expectedResult) => {
		expect(fn.mock.calls.length).toBe(1);
		expect(fn.mock.calls[0][1]).toEqual(user);
		const result = fn.mock.calls[0][2];
		expect(result).toEqual({ ...expectedResult, loginTime: result.loginTime });
	};

	describe('Save new login record', () => {
		const fn = jest.spyOn(db, 'insertOne').mockResolvedValue(undefined);

		test('Should save a new login record if user agent is from plugin', async () => {
			await LoginRecord.saveLoginRecord(username, sessionId, ipAddress, pluginUserAgent, referrer);
			const formattedLoginRecord = formatLoginRecord(UserAgentHelper.getUserAgentInfoFromPlugin(),
				referrer);
			checkResults(fn, username, formattedLoginRecord);
		});

		test('Should save a new login record if user agent is from browser', async () => {
			await LoginRecord.saveLoginRecord(username, sessionId, ipAddress, browserUserAgent, referrer);
			const formattedLoginRecord = formatLoginRecord(UserAgentHelper.getUserAgentInfoFromBrowser(),
				referrer);
			checkResults(fn, username, formattedLoginRecord);
		});

		test('Should save a new login record if there is no referrer', async () => {
			await LoginRecord.saveLoginRecord(username, sessionId, ipAddress, browserUserAgent);
			const formattedLoginRecord = formatLoginRecord(UserAgentHelper.getUserAgentInfoFromBrowser());
			checkResults(fn, username, formattedLoginRecord);
		});

		test('Should save a new login record if there is no location', async () => {
			await LoginRecord.saveLoginRecord(username, sessionId, '0.0.0.0', browserUserAgent);
			const formattedLoginRecord = formatLoginRecord(UserAgentHelper.getUserAgentInfoFromBrowser(),
				undefined, '0.0.0.0');
			checkResults(fn, username, formattedLoginRecord);
		});
	});
};

describe('models/loginRecord', () => {
	testSaveLoginRecord();
});
