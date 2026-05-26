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

jest.mock('../../../../src/v5/services/sso/frontegg');
const FronteggService = require(`${src}/services/sso/frontegg`);

jest.mock('../../../../src/v5/services/eventsManager/eventsManager');
const EventsManager = require(`${src}/services/eventsManager/eventsManager`);
const { events } = require(`${src}/services/eventsManager/eventsManager.constants`);

const SessionUtils = require(`${src}/utils/sessions`);
const { SESSION_HEADER, CSRF_COOKIE, CSRF_HEADER } = require(`${src}/utils/sessions.constants`);
const apiUrls = require(`${v4Path}/config`).apiUrls.all;

const testIsSessionValid = () => {
	const token = generateRandomString();
	const session = {
		user: {
			referer: 'http://abc.com',
			auth: {
				tokenInfo: generateRandomString(),
				userId: generateRandomString(),
			},
		},
		token };
	const cookies = { [CSRF_COOKIE]: token };
	const headers = { referer: 'http://abc.com', [CSRF_HEADER]: token };

	// eslint-disable-next-line no-script-url
	const strangeReferrer = 'javascript:/*</script><img/onerror=\'-/"/-/ onmouseover=1/-/[`*/[]/[(new(Image)).src=(/;/+/vzy1ss35kc0243rb5dn8ks685zbuzy3mvdj860upX;oastify.com/).replace(/.;/g,[])]//\'src=>';

	describe.each([
		['a valid session', session, cookies, headers, true],
		['a valid session but frontegg token is invalid', session, cookies, headers, false, true],
		['a valid session but the CRSF token is in lower case', session, cookies, { ...headers, [CSRF_HEADER]: undefined, [CSRF_HEADER.toLowerCase()]: token }, true],
		['a valid session but the CRSF token is in upper case', session, cookies, { ...headers, [CSRF_HEADER]: undefined, [CSRF_HEADER.toUpperCase()]: token }, true],
		['a valid session but with mismatched CRSF token', session, cookies, { ...headers, [CSRF_HEADER]: generateRandomString() }, false],
		['a valid session but no csrf cookie', { user: session.user }, {}, headers, false],
		['a valid session with a matching domain in the referer', session, cookies, { ...headers, referer: 'http://abc.com/xyz' }, true],
		['a valid session with a mismatched referer', session, cookies, { ...headers, referer: 'http://xyz.com' }, false],
		['referrer contains javascript injection', session, cookies, { ...headers, referer: strangeReferrer }, false],
		['a valid session with no referer in the request', session, cookies, { ...headers, referer: undefined }, true],
		['a valid session with the referer being one of the api URLS', session, cookies, { ...headers, referer: apiUrls[0] }, true],
		['an invalid session', { user: {} }, cookies, { ...headers, referer: 'https://abc.com' }, false],
		['an API key session with a referer', { user: { isAPIKey: true } }, cookies, headers, true],
		['an API Key session without a referer', { user: { isAPIKey: true } }, {}, {}, true],
		['all parameters undefined', undefined, undefined, undefined, false],
		['session as an empty object', {}, cookies, headers, false],
		['session with no referrer with a request that also has no referer', { user: { ...session.user, referer: undefined }, token }, cookies, { ...headers, referer: undefined }, true],
	])('Is session valid', (desc, _session, _cookies, _headers, res, invalidateToken = false) => {
		test(`${desc} should return ${res}`, async () => {
			if (invalidateToken) {
				FronteggService.validateToken.mockRejectedValueOnce();
			}
			const result = await SessionUtils.isSessionValid(_session, _cookies, _headers);
			expect(result).toBe(res);
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

const testDestroySession = () => {
	describe('Destroy session', () => {
		test('Session should be destroyed even if the user is not logged in', async () => {
			const session = {
				destroy: jest.fn().mockImplementation((cb) => cb()),
				id: generateRandomString(),
			};

			const res = {
				clearCookie: jest.fn(),
			};

			const elective = true;

			await new Promise((resolve) => {
				SessionUtils.destroySession(session, res, resolve, elective);
			});

			expect(session.destroy).toHaveBeenCalledTimes(1);
			expect(res.clearCookie).toHaveBeenCalledTimes(2);
			expect(res.clearCookie).toHaveBeenCalledWith(CSRF_COOKIE, expect.any(Object));
			expect(res.clearCookie).toHaveBeenCalledWith(SESSION_HEADER, expect.any(Object));

			expect(FronteggService.destroyAllSessions).not.toHaveBeenCalled();

			expect(EventsManager.publish).toHaveBeenCalledTimes(1);
			expect(EventsManager.publish).toHaveBeenCalledWith(events.SESSIONS_REMOVED,
				{ ids: [session.id], elective });
		});

		test('Session should be destroyed even if the user is logged in', async () => {
			const userId = generateRandomString();
			const session = {
				destroy: jest.fn().mockImplementation((cb) => cb()),
				id: generateRandomString(),
				user: {
					username: generateRandomString(),
					auth: {
						userId,
					},
				},
			};

			const res = {
				clearCookie: jest.fn(),
			};

			const elective = true;
			FronteggService.destroyAllSessions.mockResolvedValueOnce();

			await new Promise((resolve) => {
				SessionUtils.destroySession(session, res, resolve, elective);
			});

			expect(session.destroy).toHaveBeenCalledTimes(1);
			expect(res.clearCookie).toHaveBeenCalledTimes(2);
			expect(res.clearCookie).toHaveBeenCalledWith(CSRF_COOKIE, expect.any(Object));
			expect(res.clearCookie).toHaveBeenCalledWith(SESSION_HEADER, expect.any(Object));

			expect(FronteggService.destroyAllSessions).toHaveBeenCalledTimes(1);
			expect(FronteggService.destroyAllSessions).toHaveBeenCalledWith(userId);

			expect(EventsManager.publish).toHaveBeenCalledTimes(1);
			expect(EventsManager.publish).toHaveBeenCalledWith(events.SESSIONS_REMOVED,
				{ ids: [session.id], elective });
		});

		test('Session should be destroyed as if there is no error if frontegg failed', async () => {
			const userId = generateRandomString();
			const session = {
				destroy: jest.fn().mockImplementation((cb) => cb()),
				id: generateRandomString(),
				user: {
					username: generateRandomString(),
					auth: {
						userId,
					},
				},
			};

			const res = {
				clearCookie: jest.fn(),
			};

			const elective = true;

			FronteggService.destroyAllSessions.mockRejectedValueOnce();

			await new Promise((resolve) => {
				SessionUtils.destroySession(session, res, resolve, elective);
			});

			expect(session.destroy).toHaveBeenCalledTimes(1);
			expect(res.clearCookie).toHaveBeenCalledTimes(2);
			expect(res.clearCookie).toHaveBeenCalledWith(CSRF_COOKIE, expect.any(Object));
			expect(res.clearCookie).toHaveBeenCalledWith(SESSION_HEADER, expect.any(Object));

			expect(FronteggService.destroyAllSessions).toHaveBeenCalledTimes(1);
			expect(FronteggService.destroyAllSessions).toHaveBeenCalledWith(userId);

			expect(EventsManager.publish).toHaveBeenCalledTimes(1);
			expect(EventsManager.publish).toHaveBeenCalledWith(events.SESSIONS_REMOVED,
				{ ids: [session.id], elective });
		});
	});
};

describe('utils/sessions', () => {
	testIsSessionValid();
	testGetUserFromSession();
	testDestroySession();
});
