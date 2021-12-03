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
jest.mock('../../../../src/v5/utils/helper/strings');
const StringHelper = require(`${src}/utils/helper/strings`);

StringHelper.isUserAgentFromPlugin.mockImplementation((userAgent) => userAgent.split(' ')[0] === 'PLUGIN:');

StringHelper.getLocationFromIPAddress.mockImplementation((ipAddr) => {
	if (ipAddr === '0.0.0.0') {
		return null;
	}

	return {
		country: 'United Kingdom',
		city: 'London',
	};
});

StringHelper.getUserAgentInfoFromBrowser.mockImplementation(() => ({
	application: {
		name: 'ua name',
		version: '1',
		type: 'browser',
	},
	engine: {
		name: 'some browser',
		version: '1',
	},
	os: {
		name: 'os name',
		version: '1',
	},
	device: 'desktop',
}));

StringHelper.getUserAgentInfoFromPlugin.mockImplementation(() => ({
	application: {
		name: 'ua name',
		version: '1',
		type: 'plugin',
	},
	engine: {
		name: '3drepoplugin',
		version: '1',
	},
	os: {
		name: 'os name',
		version: '1',
	},
	device: 'desktop',
}));

const sessionId = '123456';
const username = 'someUsername';
const ipAddress = '290.241.146.180';
const browserUserAgent = 'browser user agent';
const pluginUserAgent = 'PLUGIN: plugin user agent';
const referrer = 'www.google.com';
const LoginRecord = require(`${src}/models/loginRecord`);

const testSaveLoginRecord = () => {
	const formatLoginRecord = (userAgentInfo, loginTime, referer, ipAddr = ipAddress) => {
		const formattedLoginRecord = {
			_id: sessionId,
			loginTime,
			ipAddr,
			...userAgentInfo,
			location: {
				country: ipAddr === '0.0.0.0' ? 'unknown' : 'United Kingdom',
				city: ipAddr === '0.0.0.0' ? 'unknown' : 'London',
			},
		};

		if (referer) {
			formattedLoginRecord.referrer = referer;
		}

		return formattedLoginRecord;
	};

	const checkResults = (fn, user, dataInserted) => {
		expect(fn.mock.calls.length).toBe(1);
		expect(fn.mock.calls[0][1]).toEqual(user);
		expect(fn.mock.calls[0][2]).toEqual(dataInserted);
	};

	describe('Save new login record', () => {
		test('Should save a new login record if user agent is from plugin', async () => {
			const fn = jest.spyOn(db, 'insertOne').mockResolvedValue(undefined);
			const res = await LoginRecord.saveLoginRecord(username, sessionId, ipAddress, pluginUserAgent, referrer);
			checkResults(fn, username, res);
			const formattedLoginRecord = formatLoginRecord(StringHelper.getUserAgentInfoFromPlugin(),
				res.loginTime, referrer);
			expect(res).toEqual(formattedLoginRecord);
		});

		test('Should save a new login record if user agent is from browser', async () => {
			const fn = jest.spyOn(db, 'insertOne').mockResolvedValue(undefined);
			const res = await LoginRecord.saveLoginRecord(username, sessionId, ipAddress, browserUserAgent, referrer);
			checkResults(fn, username, res);
			const formattedLoginRecord = formatLoginRecord(StringHelper.getUserAgentInfoFromBrowser(),
				res.loginTime, referrer);
			expect(res).toEqual(formattedLoginRecord);
		});

		test('Should save a new login record if there is no referrer', async () => {
			const fn = jest.spyOn(db, 'insertOne').mockResolvedValue(undefined);
			const res = await LoginRecord.saveLoginRecord(username, sessionId, ipAddress, browserUserAgent);
			checkResults(fn, username, res);
			const formattedLoginRecord = formatLoginRecord(StringHelper.getUserAgentInfoFromBrowser(), res.loginTime);
			expect(res).toEqual(formattedLoginRecord);
		});

		test('Should save a new login record if there is no location', async () => {
			const fn = jest.spyOn(db, 'insertOne').mockResolvedValue(undefined);
			const res = await LoginRecord.saveLoginRecord(username, sessionId, '0.0.0.0', browserUserAgent);
			checkResults(fn, username, res);
			const formattedLoginRecord = formatLoginRecord(StringHelper.getUserAgentInfoFromBrowser(), res.loginTime,
				undefined, '0.0.0.0');
			expect(res).toEqual(formattedLoginRecord);
		});
	});
};

describe('models/loginRecord', () => {
	testSaveLoginRecord();
});
