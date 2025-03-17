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

const { cloneDeep } = require('lodash');
const { src } = require('../../helper/path');
const { determineTestGroup, generateRandomString } = require('../../helper/services');

jest.mock('../../../../src/v5/utils/responder');
const Responder = require(`${src}/utils/responder`);

jest.mock('../../../../src/v5/utils/permissions');
const { templates } = require(`${src}/utils/responseCodes`);
const config = require(`${src}/utils/config`);
jest.mock('../../../../src/v5/utils/helper/userAgent');
const UserAgentHelper = require(`${src}/utils/helper/userAgent`);
const { CSRF_COOKIE } = require(`${src}/utils/sessions.constants`);
jest.mock('../../../../src/v5/services/eventsManager/eventsManager');
const EventsManager = require(`${src}/services/eventsManager/eventsManager`);
jest.mock('../../../../src/v5/services/eventsManager/eventsManager.constants');
const { events } = require(`${src}/services/eventsManager/eventsManager.constants`);
const { SOCKET_HEADER } = require(`${src}/services/chat/chat.constants`);

// Need to mock these 2 to ensure we are not trying to create a real session configuration
jest.mock('express-session', () => () => { });
jest.mock('../../../../src/v5/handler/db');

jest.mock('../../../../src/v5/utils/helper/strings', () => ({
	...jest.requireActual('../../../../src/v5/utils/helper/strings'),
	getURLDomain: () => 'abc.com',
}));

jest.mock('../../../../src/v5/services/sessions');
const SessionService = require(`${src}/services/sessions`);

const sessionMiddleware = jest.fn().mockImplementation((req, res, next) => next());

SessionService.session = Promise.resolve({ middleware: sessionMiddleware });

const Sessions = require(`${src}/middleware/sessions`);

// Mock respond function to just return the resCode
Responder.respond.mockImplementation((req, res, errCode) => errCode);

const pluginAgent = generateRandomString();
const webBrowserUserAgent = generateRandomString();

UserAgentHelper.isFromWebBrowser.mockImplementation((userAgent) => userAgent === webBrowserUserAgent);
const testDestroySession = () => {
	const req = {
		session: { destroy: (callback) => { callback(); }, user: { username: 'user1' } },
		body: { user: 'user1' },
		ips: ['0.1.2.3'],
	};

	const res = { clearCookie: () => { } };

	describe('Destroy session', () => {
		test('Should destroy session', async () => {
			await Sessions.destroySession(req, res);
			expect(Responder.respond).toHaveBeenCalledTimes(1);
			expect(Responder.respond.mock.results[0].value.code).toBe(templates.ok.code);

			expect(EventsManager.publish).toHaveBeenCalledTimes(1);
			expect(EventsManager.publish).toHaveBeenCalledWith(events.SESSIONS_REMOVED,
				{
					ids: [req.sessionID],
					elective: true,
				});
		});

		test('Should destroy session (v4)', async () => {
			await Sessions.destroySession({ ...req, v4: true }, res);
			expect(Responder.respond).toHaveBeenCalledTimes(1);
			expect(Responder.respond.mock.results[0].value.code).toBe(templates.ok.code);
			expect(Responder.respond.mock.calls[0][3]).toEqual({ username: req.session.user.username });

			expect(EventsManager.publish).toHaveBeenCalledTimes(1);
			expect(EventsManager.publish).toHaveBeenCalledWith(events.SESSIONS_REMOVED,
				{
					ids: [req.sessionID],
					elective: true,
				});
		});
	});
};

const testManageSession = () => {
	describe('Manage session', () => {
		test('Should call next() immedately if session was already established', async () => {
			const fn = jest.fn();
			await Sessions.manageSessions({ session: {} }, {}, fn);
			expect(sessionMiddleware).not.toBeCalled();
			expect(fn).toBeCalled();
		});
		test('Should call next() after trying to establish a session', async () => {
			const fn = jest.fn();
			await Sessions.manageSessions({}, {}, fn);
			expect(sessionMiddleware).toBeCalled();
			expect(fn).toBeCalled();
		});
	});
};

const testAppendCSRFToken = () => {
	describe('Append CSRF token', () => {
		test('Should set the cookie and store the token in the session', async () => {
			const req = { session: {} };
			const res = { cookie: jest.fn() };
			const next = jest.fn();

			await Sessions.appendCSRFToken(req, res, next);

			expect(next).toHaveBeenCalledTimes(1);
			expect(req.token).not.toBeUndefined();

			expect(res.cookie).toHaveBeenCalledTimes(1);
			expect(res.cookie).toHaveBeenCalledWith(CSRF_COOKIE, req.token, expect.any(Object));
		});

		test('Should do nothing if it is a reAuth', async () => {
			const req = { session: { reAuth: true } };
			const res = { cookie: jest.fn() };
			const next = jest.fn();

			await Sessions.appendCSRFToken(req, res, next);

			expect(next).toHaveBeenCalledTimes(1);
			expect(req.token).toBeUndefined();

			expect(res.cookie).not.toHaveBeenCalled();
		});
	});
};

const testUpdateSession = () => {
	const checkResults = (request, userAgent, mockCB, expectEvent = true) => {
		expect(mockCB).toHaveBeenCalledTimes(1);

		if (expectEvent) {
			expect(EventsManager.publish).toHaveBeenCalledTimes(1);
			expect(EventsManager.publish).toHaveBeenCalledWith(events.SESSION_CREATED,
				{
					username: request.loginData.username,
					sessionID: request.sessionID,
					ipAddress: request.ips[0] || request.ip,
					...(userAgent ? { userAgent } : { }),
					referer: request.session?.user?.referer,
					socketId: request.headers[SOCKET_HEADER],
				});
		} else {
			expect(EventsManager.publish).not.toHaveBeenCalled();
		}
		expect(request.session?.ssoInfo).toEqual(undefined);
	};

	const req = {
		loginData: { username: generateRandomString() },
		session: { cookie: { domain: generateRandomString() }, ssoInfo: { referer: 'http://abc.com/' } },
		body: { user: 'user1' },
		sessionID: '123',
		ips: ['0.1.2.3'],
		ip: '0.1.2.3',
		headers: {},
	};

	describe('Update session', () => {
		describe.each([
			['the request has a referer', cloneDeep(req)],
			['the request has socket id', { ...cloneDeep(req), headers: { ...req.headers, [SOCKET_HEADER]: 'socketsdlfkdsj' } }],
			['the request has user agent from the plugin (SSO)', { ...cloneDeep(req), session: { ...req.session, ssoInfo: { userAgent: pluginAgent } } }, pluginAgent],
			['the request has web user agent (SSO)', { ...cloneDeep(req), session: { ...req.session, ssoInfo: { userAgent: webBrowserUserAgent } } }, webBrowserUserAgent],
			['the request has empty ips array', { ...cloneDeep(req), ips: [] }],
		])('', (desc, request, userAgent) => {
			test(`should update session if ${desc}`, async () => {
				const mockCB = jest.fn();

				if (userAgent) {
					UserAgentHelper.getUserAgentInfo.mockImplementationOnce(() => ({
						application: { name: generateRandomString() },
					}));
				}

				await Sessions.updateSession(request, {}, mockCB);
				checkResults(request, userAgent, mockCB);
			});
		});

		test('Should not trigger an event if it is an reauthentication', async () => {
			const mockCB = jest.fn();
			const request = cloneDeep(req);
			request.session.reAuth = true;
			await Sessions.updateSession(request, {}, mockCB);
			checkResults(request, undefined, mockCB, false);
		});

		test('Should update session with cookie.maxAge', async () => {
			const mockCB = jest.fn();
			const initialMaxAge = config.cookie.maxAge;
			config.cookie.maxAge = 100;
			const request = cloneDeep(req);
			await Sessions.updateSession(request, {}, mockCB);
			checkResults(request, undefined, mockCB);
			config.cookie.maxAge = initialMaxAge;
		});

		test('Should update session without cookie.maxAge', async () => {
			const mockCB = jest.fn();
			const initialMaxAge = config.cookie.maxAge;
			config.cookie.maxAge = undefined;
			const request = cloneDeep(req);
			await Sessions.updateSession(request, {}, mockCB);
			checkResults(request, undefined, mockCB);
			config.cookie.maxAge = initialMaxAge;
		});

		test('Should set the token if it is available', async () => {
			const mockCB = jest.fn();
			const request = cloneDeep(req);
			request.token = generateRandomString();
			await Sessions.updateSession(request, {}, mockCB);
			expect(request.session.token).toEqual(request.token);
		});
	});
};

describe(determineTestGroup(__filename), () => {
	testDestroySession();
	testManageSession();
	testUpdateSession();
	testAppendCSRFToken();
});
