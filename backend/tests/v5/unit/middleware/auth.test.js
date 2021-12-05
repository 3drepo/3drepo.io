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
const { templates } = require(`${src}/utils/responseCodes`);

const AuthMiddlewares = require(`${src}/middleware/auth`);

// Mock respond function to just return the resCode
Responder.respond.mockImplementation((req, res, errCode) => errCode);

const testValidSession = () => {
	describe('Valid sessions', () => {
		test('next() should be called if the session is valid', () => {
			const mockCB = jest.fn(() => {});
			AuthMiddlewares.validSession(
				{ header: { referer: 'http://abc.com/' }, session: { user: { referer: 'http://abc.com' } } },
				{},
				mockCB,
			);
			expect(mockCB.mock.calls.length).toBe(1);
		});

		test('should respond with notLoggedIn errCode if the session is invalid', () => {
			const mockCB = jest.fn(() => {});
			AuthMiddlewares.validSession(
				{ header: { referer: 'http://xyz.com' }, session: { user: { referer: 'http://abc.com' } } },
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
	describe('Not valid sessions', () => {
		test('next() should be called if the session is not valid', () => {
			const mockCB = jest.fn(() => {});
			AuthMiddlewares.notLoggedIn(
				{ header: { referer: 'http://xyz.com' }, session: { user: { referer: 'http://abc.com' } } },
				{},
				mockCB,
			);
			expect(mockCB.mock.calls.length).toBe(1);
		});

		test('should respond with alreadyLoggedIn errCode if the session is valid', () => {
			const mockCB = jest.fn(() => {});
			AuthMiddlewares.notLoggedIn(
				{ header: { referer: 'http://abc.com/' }, session: { user: { referer: 'http://abc.com' } } },
				{},
				mockCB,
			);
			expect(mockCB.mock.calls.length).toBe(0);
			expect(Responder.respond.mock.calls.length).toBe(1);
			expect(Responder.respond.mock.results[0].value).toEqual(templates.alreadyLoggedIn);
		});
	});
};

describe('middleware/auth', () => {
	testValidSession();
	testNotLoggedIn();
});
