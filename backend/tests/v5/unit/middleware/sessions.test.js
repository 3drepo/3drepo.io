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

jest.mock('../../../../src/v5/utils/responder');
const Responder = require(`${src}/utils/responder`);

jest.mock('../../../../src/v5/utils/permissions/permissions');
const { templates } = require(`${src}/utils/responseCodes`);
const config = require(`${src}/utils/config`);
jest.mock('../../../../src/v5/utils/helper/strings');
const StringsHelper = require(`${src}/utils/helper/strings`);
jest.mock('../../../../src/v5/utils/helper/userAgent');
const UserAgentHelper = require(`${src}/utils/helper/userAgent`);
jest.mock('../../../../src/v5/services/eventsManager/eventsManager');
const EventsManager = require(`${src}/services/eventsManager/eventsManager`);
jest.mock('../../../../src/v5/services/eventsManager/eventsManager.constants');
const { events } = require(`${src}/services/eventsManager/eventsManager.constants`);
const { SOCKET_HEADER } = require(`${src}/services/chat/chat.constants`);

// Need to mock these 2 to ensure we are not trying to create a real session configuration
jest.mock('express-session', () => () => {});
jest.mock('../../../../src/v5/handler/db', () => ({
	...jest.requireActual('../../../../src/v5/handler/db'),
	getSessionStore: () => {},
}));

jest.mock('../../../../src/v5/services/sessions');
const SessionService = require(`${src}/services/sessions`);

const sessionMiddleware = jest.fn().mockImplementation((req, res, next) => next());

SessionService.session = Promise.resolve({ middleware: sessionMiddleware });

const Sessions = require(`${src}/middleware/sessions`);

// Mock respond function to just return the resCode
Responder.respond.mockImplementation((req, res, errCode) => errCode);

const webBrowserUserAgent = 'web browser user agent';
const urlDomain = 'url domain';

UserAgentHelper.isFromWebBrowser.mockImplementation((userAgent) => userAgent === webBrowserUserAgent);
StringsHelper.getURLDomain.mockImplementation(() => urlDomain);

const testCreateSession = () => {
	const checkResults = (request) => {
		expect(Responder.respond).toHaveBeenCalledTimes(1);
		expect(Responder.respond.mock.results[0].value.code).toBe(templates.ok.code);
		expect(EventsManager.publish).toHaveBeenCalledTimes(1);
		expect(EventsManager.publish).toHaveBeenCalledWith(events.SESSION_CREATED,
			{
				username: request.body.user,
				sessionID: request.sessionID,
				ipAddress: request.ips[0] || request.ip,
				userAgent: request.headers['user-agent'],
				referer: request?.session?.user?.referer,
				socketId: request.headers[SOCKET_HEADER],
			});
	};

	const req = {
		session: { regenerate: (callback) => { callback(); }, cookie: { domain: undefined } },
		body: { user: 'user1' },
		sessionID: '123',
		ips: ['0.1.2.3'],
		ip: '0.1.2.3',
		headers: {},
	};

	describe('Regenerate auth session', () => {
		test('Should regenerate session', async () => {
			config.cookie.maxAge = 100;
			await Sessions.createSession(req, {});
			checkResults(req);
		});

		test('Should regenerate session with request with referer', async () => {
			const reqWithReferer = { ...req, headers: { ...req.headers, referer: 'http://abc.com/' } };
			await Sessions.createSession(reqWithReferer, {});
			checkResults(reqWithReferer);
		});

		test('Should regenerate session with request with socket id', async () => {
			const reqWithSocket = { ...req, headers: { ...req.headers, [SOCKET_HEADER]: 'socketsdlfkdsj' } };
			await Sessions.createSession(reqWithSocket, {});
			checkResults(reqWithSocket);
		});

		test('Should regenerate session with request with user agent', async () => {
			const reqWithUserAgent = { ...req, headers: { ...req.headers, 'user-agent': 'some user agent' } };
			await Sessions.createSession(reqWithUserAgent, {});
			checkResults(reqWithUserAgent);
		});

		test('Should regenerate session with request with web user agent', async () => {
			const reqWithWebUserAgent = { ...req, headers: { ...req.headers, 'user-agent': webBrowserUserAgent } };
			await Sessions.createSession(reqWithWebUserAgent, {});
			checkResults(reqWithWebUserAgent);
		});

		test('Should regenerate session without cookie.maxAge', async () => {
			config.cookie.maxAge = undefined;
			await Sessions.createSession(req, {});
			checkResults(req);
		});

		test('Should regenerate session and respond with user data if v4 is flagged', async () => {
			await Sessions.createSession({ ...req, v4: true }, {});
			checkResults(req);
		});

		test('Should regenerate session wit request with empty ips array', async () => {
			const emptyIpsRequest = { ...req, ips: [] };
			await Sessions.createSession(emptyIpsRequest, {});
			checkResults(emptyIpsRequest);
		});

		test('Should respond with error if the session cannot be regenerated', async () => {
			await Sessions.createSession({ ...req, session: { regenerate: (callback) => { callback(1); } } }, {});
			expect(Responder.respond.mock.calls.length).toBe(1);
			expect(Responder.respond.mock.results[0].value.code).toBe(templates.unknown.code);
		});
	});
};

const testCreateSessionSso = () => {
	const req = {
		session: { regenerate: (callback) => { callback(); }, cookie: { domain: undefined } },
		body: { user: 'user1' },
		sessionID: '123',
		ips: ['0.1.2.3'],
		ip: '0.1.2.3',
		headers: {},
	};

	describe('Regenerate auth session using SSO', () => {
		test('Should regenerate session and call next()', async () => {
			const mockCB = jest.fn(() => {});
			config.cookie.maxAge = 100;
			await Sessions.createSessionSso(req, {}, mockCB);
			expect(Responder.respond).not.toHaveBeenCalled();
			expect(EventsManager.publish).toHaveBeenCalledTimes(1);
			expect(EventsManager.publish).toHaveBeenCalledWith(events.SESSION_CREATED,
				{
					username: req.body.user,
					sessionID: req.sessionID,
					ipAddress: req.ips[0] || req.ip,
					userAgent: req.headers['user-agent'],
					referer: req?.session?.user?.referer,
					socketId: req.headers[SOCKET_HEADER],
				});
			expect(mockCB).toHaveBeenCalledTimes(1);
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
			await Sessions.manageSessions({ }, {}, fn);
			expect(sessionMiddleware).toBeCalled();
			expect(fn).toBeCalled();
		});
	});
};

describe('middleware/sessions', () => {
	testCreateSession();
	testDestroySession();
	testManageSession();
	testCreateSessionSso();
});
