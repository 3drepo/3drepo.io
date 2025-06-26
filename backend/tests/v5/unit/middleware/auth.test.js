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
const { determineTestGroup, generateRandomString } = require('../../helper/services');

jest.mock('../../../../src/v5/utils/responder');

const Responder = require(`${src}/utils/responder`);

const { CSRF_HEADER, CSRF_COOKIE } = require(`${src}/utils/sessions.constants`);

jest.mock('../../../../src/v5/utils/sessions');
const SessionUtils = require(`${src}/utils/sessions`);

const { templates } = require(`${src}/utils/responseCodes`);

const AuthMiddlewares = require(`${src}/middleware/auth`);

const { USER_AGENT_HEADER } = require(`${src}/utils/sessions.constants`);

// Mock respond function to just return the resCode
Responder.respond.mockImplementation((req, res, errCode) => errCode);

SessionUtils.destroySession.mockImplementation((arg1, arg2, callback) => callback());

const ipAddress = generateRandomString();
const token = generateRandomString();
const userAgent = generateRandomString();
const sessionID = generateRandomString();
const session = { user: { referer: 'http://abc.com', userAgent }, id: sessionID, token, ipAddress, destroy: (callback) => { callback(); } };
const cookies = { [CSRF_COOKIE]: token };
const headers = { referer: 'http://abc.com/', [CSRF_HEADER]: token, [USER_AGENT_HEADER]: userAgent };

const testValidSession = () => {
	describe('Valid sessions', () => {
		test('next() should be called if the session is valid', async () => {
			SessionUtils.isSessionValid.mockResolvedValueOnce(true);
			const mockCB = jest.fn(() => {});
			const res = {};
			await AuthMiddlewares.validSession(
				{ ips: [ipAddress], headers, session, cookies },
				res,
				mockCB,
			);
			expect(mockCB).toHaveBeenCalledTimes(1);

			expect(SessionUtils.setCSRFCookie).toHaveBeenCalledTimes(1);
			expect(SessionUtils.setCSRFCookie).toHaveBeenCalledWith(token, res);
		});

		test('next() should be called if there is an apiKey session', async () => {
			const mockCB = jest.fn(() => {});
			SessionUtils.isSessionValid.mockResolvedValueOnce(true);
			await AuthMiddlewares.validSession(
				{ headers, session: { user: { referer: 'http://abc.com', isAPIKey: true }, ipAddress } },
				{},
				mockCB,
			);
			expect(mockCB).toHaveBeenCalledTimes(1);
			expect(SessionUtils.setCSRFCookie).not.toHaveBeenCalled();
		});

		test('should respond with notLoggedIn errCode if the ip address mismatched', async () => {
			SessionUtils.isSessionValid.mockResolvedValueOnce(true);
			const mockCB = jest.fn(() => {});
			await AuthMiddlewares.validSession(
				{ ips: [],
					ip: generateRandomString(),
					headers,
					session,
					cookies,
					sessionID },
				{ clearCookie: () => {} },
				mockCB,
			);
			expect(mockCB).not.toHaveBeenCalled();
			expect(Responder.respond).toHaveBeenCalledTimes(1);
			expect(Responder.respond.mock.results[0].value).toEqual(templates.notLoggedIn);
			expect(SessionUtils.setCSRFCookie).not.toHaveBeenCalled();
		});

		test('should respond with notLoggedIn errCode if the user agent mismatched', async () => {
			SessionUtils.isSessionValid.mockResolvedValueOnce(true);
			const mockCB = jest.fn(() => {});

			await AuthMiddlewares.validSession(
				{
					ips: [ipAddress],
					headers: { ...headers, [USER_AGENT_HEADER]: generateRandomString() },
					session,
					cookies,
					sessionID,
				},
				{ clearCookie: () => {} },
				mockCB,
			);
			expect(mockCB).not.toHaveBeenCalled();
			expect(Responder.respond).toHaveBeenCalledTimes(1);
			expect(Responder.respond.mock.results[0].value).toEqual(templates.notLoggedIn);
			expect(SessionUtils.setCSRFCookie).not.toHaveBeenCalled();
		});
	});
};

const testNotLoggedIn = () => {
	describe('Not logged in middleware', () => {
		const res = {};
		test('next() should be called if the session is invalid', async () => {
			SessionUtils.isSessionValid.mockResolvedValueOnce(false);
			const req = {};
			const mockCB = jest.fn(() => {});
			await AuthMiddlewares.notLoggedIn(
				req, res, mockCB,
			);
			expect(mockCB).toHaveBeenCalledTimes(1);
			expect(Responder.respond).not.toHaveBeenCalled();
		});

		test('should respond with alreadyLoggedIn errCode if the session is valid', async () => {
			SessionUtils.isSessionValid.mockResolvedValueOnce(true);
			const mockCB = jest.fn(() => {});

			const req = { ips: [ipAddress], headers, session, cookies };
			await AuthMiddlewares.notLoggedIn(
				req, res, mockCB,
			);
			expect(mockCB).not.toHaveBeenCalled();
			expect(Responder.respond).toHaveBeenCalledTimes(1);
			expect(Responder.respond).toHaveBeenCalledWith(req, res, templates.alreadyLoggedIn);
		});
	});
};

const testIsLoggedIn = () => {
	describe('Is logged in middleware', () => {
		const req = { ips: [ipAddress], headers, session, cookies };
		const res = {};
		test('next() should be called if the session is valid', async () => {
			const mockCB = jest.fn(() => {});
			SessionUtils.isSessionValid.mockResolvedValueOnce(true);
			await AuthMiddlewares.isLoggedIn(req, res, mockCB);

			expect(SessionUtils.isSessionValid).toHaveBeenCalledTimes(1);
			expect(SessionUtils.isSessionValid).toHaveBeenCalledWith(session, cookies, headers, true);
			expect(mockCB).toHaveBeenCalledTimes(1);
		});

		test('should respond with notLoggedIn errCode if the session is invalid', async () => {
			const mockCB = jest.fn(() => {});
			SessionUtils.isSessionValid.mockResolvedValueOnce(false);
			await AuthMiddlewares.isLoggedIn(req, res, mockCB);

			expect(SessionUtils.isSessionValid).toHaveBeenCalledTimes(1);
			expect(SessionUtils.isSessionValid).toHaveBeenCalledWith(session, cookies, headers, true);
			expect(mockCB).not.toHaveBeenCalled();
			expect(Responder.respond).toHaveBeenCalledTimes(1);
			expect(Responder.respond).toHaveBeenCalledWith(req, res, templates.notLoggedIn);
		});

		test('should respond with notLoggedIn errCode if there is no session', async () => {
			const mockCB = jest.fn(() => {});
			SessionUtils.isSessionValid.mockResolvedValueOnce(false);
			const { session: ses, ...reqNoSession } = req;
			await AuthMiddlewares.isLoggedIn(reqNoSession, res, mockCB);

			expect(SessionUtils.isSessionValid).toHaveBeenCalledTimes(1);
			expect(SessionUtils.isSessionValid).toHaveBeenCalledWith(undefined, cookies, headers, true);
			expect(mockCB).not.toHaveBeenCalled();
			expect(Responder.respond).toHaveBeenCalledTimes(1);
			expect(Responder.respond).toHaveBeenCalledWith(reqNoSession, res, templates.notLoggedIn);
		});
	});
};

describe(determineTestGroup(__filename), () => {
	testValidSession();
	testNotLoggedIn();
	testIsLoggedIn();
});
