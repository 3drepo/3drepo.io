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

jest.mock('../../../../src/v5/models/users');
const Users = require(`${src}/models/users`);

const { CSRF_HEADER, CSRF_COOKIE } = require(`${src}/utils/sessions.constants`);

jest.mock('../../../../src/v5/models/loginRecords');
const LoginRecords = require(`${src}/models/loginRecords`);

const { templates } = require(`${src}/utils/responseCodes`);

const AuthMiddlewares = require(`${src}/middleware/auth`);

// Mock respond function to just return the resCode
Responder.respond.mockImplementation((req, res, errCode) => errCode);

const token = generateRandomString();
const session = { user: { referer: 'http://abc.com' } };
const cookies = { [CSRF_COOKIE]: token };
const headers = { referer: 'http://abc.com/', [CSRF_HEADER]: token };

const testValidSession = () => {
	describe('Valid sessions', () => {
		test('next() should be called if the session is valid', () => {
			const mockCB = jest.fn(() => {});
			AuthMiddlewares.validSession(
				{ headers, session, cookies },
				{},
				mockCB,
			);
			expect(mockCB.mock.calls.length).toBe(1);
		});

		test('next() should be called if there is an apiKey session ', () => {
			const mockCB = jest.fn(() => {});
			AuthMiddlewares.validSession(
				{ headers, session: { user: { referer: 'http://abc.com', isAPIKey: true } } },
				{},
				mockCB,
			);
			expect(mockCB.mock.calls.length).toBe(1);
		});

		test('should respond with notLoggedIn errCode if the referrer mismatched', () => {
			const mockCB = jest.fn(() => {});
			AuthMiddlewares.validSession(
				{ headers: { ...headers, referer: 'http://xyz.com' }, session, cookies },
				{},
				mockCB,
			);
			expect(mockCB.mock.calls.length).toBe(0);
			expect(Responder.respond.mock.calls.length).toBe(1);
			expect(Responder.respond.mock.results[0].value).toEqual(templates.notLoggedIn);
		});

		test('should respond with notLoggedIn errCode if csrf token mismatched', () => {
			const mockCB = jest.fn(() => {});
			AuthMiddlewares.validSession(
				{ headers: { ...headers, [CSRF_HEADER]: generateRandomString() }, session, cookies },
				{},
				mockCB,
			);
			expect(mockCB.mock.calls.length).toBe(0);
			expect(Responder.respond.mock.calls.length).toBe(1);
			expect(Responder.respond.mock.results[0].value).toEqual(templates.notLoggedIn);
		});
	});
};

const testNotLoggedIn = () => {
	describe('Not logged in middleware', () => {
		test('next() should be called if the session is invalid', () => {
			const mockCB = jest.fn(() => {});
			AuthMiddlewares.notLoggedIn(
				{ headers: { referer: 'http://xyz.com' }, session, cookies },
				{},
				mockCB,
			);
			expect(mockCB.mock.calls.length).toBe(1);
		});

		test('next() should be called if there is no session in the req', () => {
			const mockCB = jest.fn(() => {});
			AuthMiddlewares.notLoggedIn(
				{ headers: { referer: 'http://xyz.com' }, cookies },
				{},
				mockCB,
			);
			expect(mockCB.mock.calls.length).toBe(1);
		});

		test('next() should be called if the session is invalid and there is an API key', () => {
			const mockCB = jest.fn(() => {});
			AuthMiddlewares.notLoggedIn(
				{ headers: { referer: 'http://xyz.com' }, session: { user: { referer: 'http://abc.com', isAPIKey: true } } },
				{},
				mockCB,
			);
			expect(mockCB.mock.calls.length).toBe(1);
		});

		test('should respond with alreadyLoggedIn errCode if the session is valid', () => {
			const mockCB = jest.fn(() => {});
			AuthMiddlewares.notLoggedIn(
				{ headers, session, cookies },
				{},
				mockCB,
			);
			expect(mockCB.mock.calls.length).toBe(0);
			expect(Responder.respond.mock.calls.length).toBe(1);
			expect(Responder.respond.mock.results[0].value).toEqual(templates.alreadyLoggedIn);
		});
	});
};

const testIsLoggedIn = () => {
	describe('Is logged in middleware', () => {
		test('next() should be called if the session is valid', () => {
			const mockCB = jest.fn(() => {});
			AuthMiddlewares.isLoggedIn(
				{ headers, session, cookies },
				{},
				mockCB,
			);
			expect(mockCB.mock.calls.length).toBe(1);
		});

		test('should respond with notLoggedIn errCode if the session is invalid', () => {
			const mockCB = jest.fn(() => {});
			AuthMiddlewares.isLoggedIn(
				{ headers: { ...headers, referer: 'http://xyz.com' }, session, cookies },
				{},
				mockCB,
			);
			expect(mockCB.mock.calls.length).toBe(0);
			expect(Responder.respond.mock.calls.length).toBe(1);
			expect(Responder.respond.mock.results[0].value).toEqual(templates.notLoggedIn);
		});

		test('should respond with notLoggedIn errCode if the session is invalid and there is an API key', () => {
			const mockCB = jest.fn(() => {});
			AuthMiddlewares.isLoggedIn(
				{ headers, session: { user: { referer: 'http://abc.com', isAPIKey: true } } },
				{},
				mockCB,
			);
			expect(mockCB.mock.calls.length).toBe(0);
			expect(Responder.respond.mock.calls.length).toBe(1);
			expect(Responder.respond.mock.results[0].value).toEqual(templates.notLoggedIn);
		});
	});
};

const testCanLogin = () => {
	describe('Can login', () => {
		test('next() should be called if account is active and not locked', async () => {
			const mockCB = jest.fn();
			Users.isAccountActive.mockResolvedValueOnce(true);
			LoginRecords.isAccountLocked.mockResolvedValueOnce(false);
			const user = generateRandomString();
			await AuthMiddlewares.canLogin(
				{ body: { user }, headers: {} },
				{},
				mockCB,
			);
			expect(mockCB).toHaveBeenCalledTimes(1);

			expect(Users.isAccountActive).toHaveBeenCalledTimes(1);
			expect(Users.isAccountActive).toHaveBeenCalledWith(user);

			expect(LoginRecords.isAccountLocked).toHaveBeenCalledTimes(1);
			expect(LoginRecords.isAccountLocked).toHaveBeenCalledWith(user);

			expect(Responder.respond).not.toHaveBeenCalled();
		});

		test(`should respond with ${templates.userNotVerified.code} if account is inactive`, async () => {
			const mockCB = jest.fn();
			Users.isAccountActive.mockResolvedValueOnce(false);
			const user = generateRandomString();
			const req = { body: { user }, headers: {} };
			const res = {};
			await AuthMiddlewares.canLogin(
				req,
				res,
				mockCB,
			);

			expect(Users.isAccountActive).toHaveBeenCalledTimes(1);
			expect(Users.isAccountActive).toHaveBeenCalledWith(user);
			expect(mockCB).not.toHaveBeenCalled();

			expect(Responder.respond).toHaveBeenCalledTimes(1);
			expect(Responder.respond).toHaveBeenCalledWith(req, res, templates.userNotVerified);
		});

		test(`should respond with ${templates.tooManyLoginAttempts.code} if account is locked`, async () => {
			const mockCB = jest.fn();
			Users.isAccountActive.mockResolvedValueOnce(true);
			LoginRecords.isAccountLocked.mockResolvedValueOnce(true);
			const user = generateRandomString();
			const req = { body: { user }, headers: {} };
			const res = {};
			await AuthMiddlewares.canLogin(
				req,
				res,
				mockCB,
			);

			expect(Users.isAccountActive).toHaveBeenCalledTimes(1);
			expect(Users.isAccountActive).toHaveBeenCalledWith(user);

			expect(LoginRecords.isAccountLocked).toHaveBeenCalledTimes(1);
			expect(LoginRecords.isAccountLocked).toHaveBeenCalledWith(user);

			expect(mockCB).not.toHaveBeenCalled();

			expect(Responder.respond).toHaveBeenCalledTimes(1);
			expect(Responder.respond).toHaveBeenCalledWith(req, res, templates.tooManyLoginAttempts);
		});
	});
};

describe('middleware/auth', () => {
	testValidSession();
	testNotLoggedIn();
	testIsLoggedIn();
	testCanLogin();
});
