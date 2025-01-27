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

jest.mock('../../../../src/v5/utils/responder');
const Responder = require(`${src}/utils/responder`);

jest.mock('../../../../src/v5/utils/permissions/permissions');
const { templates } = require(`${src}/utils/responseCodes`);
const config = require(`${src}/utils/config`);
jest.mock('../../../../src/v5/utils/helper/userAgent');
const UserAgentHelper = require(`${src}/utils/helper/userAgent`);
jest.mock('../../../../src/v5/services/eventsManager/eventsManager');
const EventsManager = require(`${src}/services/eventsManager/eventsManager`);
jest.mock('../../../../src/v5/services/eventsManager/eventsManager.constants');
const { events } = require(`${src}/services/eventsManager/eventsManager.constants`);
const { SOCKET_HEADER } = require(`${src}/services/chat/chat.constants`);
const { CSRF_COOKIE } = require(`${src}/utils/sessions.constants`);
const { USER_AGENT_HEADER } = require(`${src}/utils/sessions.constants`);

// Need to mock these 2 to ensure we are not trying to create a real session configuration
jest.mock('express-session', () => () => { });
jest.mock('../../../../src/v5/handler/db', () => ({
	...jest.requireActual('../../../../src/v5/handler/db'),
	getSessionStore: () => { },
}));

jest.mock('../../../../src/v5/services/sessions');

jest.mock('../../../../src/v5/utils/helper/strings', () => ({
	...jest.requireActual('../../../../src/v5/utils/helper/strings'),
	getURLDomain: () => 'abc.com',
}));

const SessionService = require(`${src}/services/sessions`);

const sessionMiddleware = jest.fn().mockImplementation((req, res, next) => next());

SessionService.session = Promise.resolve({ middleware: sessionMiddleware });

const Sessions = require(`${src}/middleware/sessions`);

// Mock respond function to just return the resCode
Responder.respond.mockImplementation((req, res, errCode) => errCode);

const pluginAgent = generateRandomString();
const webBrowserUserAgent = generateRandomString();

UserAgentHelper.isFromWebBrowser.mockImplementation((userAgent) => userAgent === webBrowserUserAgent);

const checkCSRFCookieCreated = (cookieFn) => {
	const { maxAge, domain } = config.cookie;
	expect(cookieFn).toHaveBeenCalledWith(CSRF_COOKIE, expect.any(String),
		{ httpOnly: false, secure: true, sameSite: 'Strict', maxAge, domain },
	);
};

const testCreateSession = () => {
	const checkResults = (request) => {
		expect(Responder.respond).toHaveBeenCalledTimes(1);
		expect(Responder.respond.mock.results[0].value.code).toBe(templates.ok.code);
		expect(EventsManager.publish).toHaveBeenCalledTimes(1);
		expect(EventsManager.publish).toHaveBeenCalledWith(events.SESSION_CREATED,
			{
				username: request.loginData.username,
				sessionID: request.sessionID,
				ipAddress: request.ips[0] || request.ip,
				userAgent: request.headers[USER_AGENT_HEADER],
				referer: request?.session?.user?.referer,
				socketId: request.headers[SOCKET_HEADER],
			});
	};

	const req = {
		loginData: { username: generateRandomString() },
		session: { regenerate: (callback) => { callback(); }, cookie: { domain: undefined } },
		body: { user: 'user1' },
		sessionID: '123',
		ips: ['0.1.2.3'],
		ip: '0.1.2.3',
		headers: {},
	};

	describe('Regenerate auth session', () => {
		describe.each([
			['the request has a referer', true, { ...req, headers: { ...req.headers, referer: 'http://abc.com/' } }],
			['the request has socket id', true, { ...req, headers: { ...req.headers, [SOCKET_HEADER]: 'socketsdlfkdsj' } }],
			['the request has user agent', true, { ...req, headers: { ...req.headers, [USER_AGENT_HEADER]: 'some user agent' } }],
			['the request has web user agent', true, { ...req, headers: { ...req.headers, [USER_AGENT_HEADER]: webBrowserUserAgent } }],
			['the request has empty ips array', true, { ...req, ips: [] }],
			['v4 is flagged', true, { ...req, v4: true }],
			['the session cannot be regenerated', false, { ...req, session: { regenerate: (callback) => { callback(1); } } }, 1],
		])('Regenerate Session', (desc, success, request, error) => {
			test(`should ${success ? 'succeed if' : `fail with ${error}`} if ${desc}`, async () => {
				const res = { cookie: jest.fn() };

				if (request.headers[USER_AGENT_HEADER]) {
					UserAgentHelper.getUserAgentInfo.mockImplementationOnce(() => ({
						application: { name: generateRandomString() },
					}));
				}

				await Sessions.createSession(request, res);
				if (success) {
					checkResults(request);
				} else {
					expect(Responder.respond).toHaveBeenCalledTimes(1);
					expect(Responder.respond).toHaveBeenCalledWith(request, res, 1);
				}
				expect(res.cookie).toHaveBeenCalledTimes(1);
				checkCSRFCookieCreated(res.cookie);
			});
		});

		test('Should regenerate session with cookie.maxAge', async () => {
			const initialMaxAge = config.cookie.maxAge;
			config.cookie.maxAge = 100;
			const res = { cookie: jest.fn() };
			await Sessions.createSession(req, res);
			checkResults(req);
			expect(res.cookie).toHaveBeenCalledTimes(1);
			checkCSRFCookieCreated(res.cookie);
			config.cookie.maxAge = initialMaxAge;
		});

		test('Should regenerate session without cookie.maxAge', async () => {
			const initialMaxAge = config.cookie.maxAge;
			config.cookie.maxAge = undefined;
			const res = { cookie: jest.fn() };
			await Sessions.createSession(req, res);
			checkResults(req);
			expect(res.cookie).toHaveBeenCalledTimes(1);
			checkCSRFCookieCreated(res.cookie);
			config.cookie.maxAge = initialMaxAge;
		});
	});
};

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

const testUpdateSession = () => {
	const checkResults = (request, userAgent, mockCB) => {
		expect(mockCB).toHaveBeenCalledTimes(1);
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
		expect(request.session?.ssoInfo).toEqual(undefined);
	};

	const req = {
		loginData: { username: generateRandomString() },
		session: { cookie: { domain: generateRandomString() } },
		body: { user: 'user1' },
		sessionID: '123',
		ips: ['0.1.2.3'],
		ip: '0.1.2.3',
		headers: {},
	};

	describe.each([
		['the request has a referer (SSO)', { ...req, session: { ...req.session, ssoInfo: { referer: 'http://abc.com/' } } }],
		['the session has a referer', { ...req, headers: { ...req.headers, referer: generateRandomString() } }],
		['the request has socket id', { ...req, headers: { ...req.headers, [SOCKET_HEADER]: 'socketsdlfkdsj' } }],
		['the request has user agent from the plugin', { ...req, headers: { ...req.headers, [USER_AGENT_HEADER]: pluginAgent } }, pluginAgent],
		['the request has user agent from the plugin (SSO)', { ...req, session: { ...req.session, ssoInfo: { userAgent: pluginAgent } } }, pluginAgent],
		['the request has web user agent', { ...req, headers: { ...req.headers, [USER_AGENT_HEADER]: webBrowserUserAgent } }, webBrowserUserAgent],
		['the request has web user agent (SSO)', { ...req, session: { ...req.session, ssoInfo: { userAgent: webBrowserUserAgent } } }, webBrowserUserAgent],
		['the request has empty ips array', { ...req, ips: [] }],
	])('Update Session', (desc, request, userAgent) => {
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

	test('Should update session with cookie.maxAge', async () => {
		const mockCB = jest.fn();
		const initialMaxAge = config.cookie.maxAge;
		config.cookie.maxAge = 100;
		await Sessions.updateSession(req, {}, mockCB);
		checkResults(req, undefined, mockCB);
		config.cookie.maxAge = initialMaxAge;
	});

	test('Should update session without cookie.maxAge', async () => {
		const mockCB = jest.fn();
		const initialMaxAge = config.cookie.maxAge;
		config.cookie.maxAge = undefined;
		await Sessions.updateSession(req, {}, mockCB);
		checkResults(req, undefined, mockCB);
		config.cookie.maxAge = initialMaxAge;
	});
};

describe('middleware/sessions', () => {
	testCreateSession();
	testDestroySession();
	testManageSession();
	testUpdateSession();
});
