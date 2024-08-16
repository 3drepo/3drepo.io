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

const { v4Path } = require(`${src}/../interop`);

const SessionUtils = require(`${src}/utils/sessions`);
const { CSRF_COOKIE, CSRF_HEADER } = require(`${src}/utils/sessions.constants`);
const apiUrls = require(`${v4Path}/config`).apiUrls.all;

const testIsSessionValid = () => {
	const token = generateRandomString();
	const session = { user: { referer: 'http://abc.com' }, token };
	const cookies = { [CSRF_COOKIE]: token };
	const headers = { referer: 'http://abc.com', [CSRF_HEADER]: token };
	describe.each([
		['a valid session', session, cookies, headers, true],
		['a valid session but the CRSF token is in lower case', session, cookies, { ...headers, [CSRF_HEADER.toLowerCase()]: token }, true],
		['a valid session but the CRSF token is in upper case', session, cookies, { ...headers, [CSRF_HEADER.toUpperCase()]: token }, true],
		['a valid session but with mismatched CRSF token', session, cookies, { ...headers, [CSRF_HEADER]: generateRandomString() }, false],
		['a valid session but no csrf cookie', { user: session.user }, {}, headers, false],
		['a valid session with a matching domain in the referer', session, cookies, { ...headers, referer: 'http://abc.com/xyz' }, true],
		['a valid session with a mismatched referer', session, cookies, { ...headers, referer: 'http://xyz.com' }, false],
		['a valid session with no referer in the request', session, cookies, { ...headers, referer: undefined }, true],
		['a valid session with the referer being one of the api URLS', session, cookies, { ...headers, referer: apiUrls[0] }, true],
		['an invalid session', { user: {} }, cookies, { ...headers, referer: 'https://abc.com' }, false],
		['an API key session with a referer', { user: { isAPIKey: true } }, cookies, headers, true],
		['an API Key session without a referer', { user: { isAPIKey: true } }, {}, {}, true],
		['all parameters undefined', undefined, undefined, undefined, false],
		['session as an empty object', {}, cookies, headers, false],
		['session with no referrer with a request that also has no referer', { user: {}, token }, cookies, { ...headers, referer: undefined }, true],
	])('Is session valid', (desc, _session, _cookies, _headers, res) => {
		test(`${desc} should return ${res}`, () => {
			expect(SessionUtils.isSessionValid(_session, _cookies, _headers)).toBe(res);
		});
	});
};

const testGetUserFromSession = () => {
	describe.each([
		[undefined, undefined],
		[{}, undefined],
		[{ user: {} }, undefined],
		[{ user: { username: 'user' } }, 'user'],
	])('Get username from session', (session, user) => {
		test(`${JSON.stringify(session)} should return ${user || 'undefined'}`, () => {
			expect(SessionUtils.getUserFromSession(session)).toEqual(user);
		});
	});
};

describe('utils/sessions', () => {
	testIsSessionValid();
	testGetUserFromSession();
});
