/**
 *  Copyright (C) 2022 3D Repo Ltd
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

const { generateRandomString } = require('../../../helper/services');
const { src } = require('../../../helper/path');

jest.mock('../../../../../src/v5/utils/responder');
const Responder = require(`${src}/utils/responder`);

jest.mock('../../../../../src/v5/models/users');
const UsersModel = require(`${src}/models/users`);

const Sso = require(`${src}/middleware/sso`);

const { templates } = require(`${src}/utils/responseCodes`);

// Mock respond function to just return the resCode
Responder.respond.mockImplementation((req, res, errCode) => errCode);

// Need to mock these 2 to ensure we are not trying to create a real session configuration
jest.mock('express-session', () => () => { });
jest.mock('../../../../../src/v5/handler/db', () => ({
	...jest.requireActual('../../../../../src/v5/handler/db'),
	getSessionStore: () => { },
}));

const testIsSsoUser = () => {
	describe('Check if a user is an SSO user', () => {
		test(`should respond with ${templates.userNotFound.code} if user is not found`, async () => {
			UsersModel.isSsoUser.mockRejectedValueOnce(templates.userNotFound);
			const mockCB = jest.fn();
			await Sso.isSsoUser({}, {}, mockCB);
			expect(mockCB).not.toHaveBeenCalled();
			expect(Responder.respond).toHaveBeenCalledTimes(1);
			expect(Responder.respond).toHaveBeenCalledWith({}, {}, templates.userNotFound);
		});

		test(`should respond with ${templates.nonSsoUser.code} if user is not an SSO user`, async () => {
			UsersModel.isSsoUser.mockResolvedValueOnce(false);
			const mockCB = jest.fn();
			await Sso.isSsoUser({}, {}, mockCB);
			expect(mockCB).not.toHaveBeenCalled();
			expect(Responder.respond).toHaveBeenCalledTimes(1);
			expect(Responder.respond).toHaveBeenCalledWith({}, {}, templates.nonSsoUser);
		});

		test('should call next if user is an SSO user', async () => {
			UsersModel.isSsoUser.mockResolvedValueOnce(true);
			const mockCB = jest.fn();
			await Sso.isSsoUser({}, {}, mockCB);
			expect(mockCB).toHaveBeenCalledTimes(1);
			expect(Responder.respond).not.toHaveBeenCalled();
		});
	});
};

const testIsNonSsoUser = () => {
	describe('Check if a user is a non SSO user', () => {
		test(`should respond with ${templates.userNotFound.code} if user is not found`, async () => {
			UsersModel.isSsoUser.mockRejectedValueOnce(templates.userNotFound);
			const mockCB = jest.fn();
			await Sso.isNonSsoUser({}, {}, mockCB);
			expect(mockCB).not.toHaveBeenCalled();
			expect(Responder.respond).toHaveBeenCalledTimes(1);
			expect(Responder.respond).toHaveBeenCalledWith({}, {}, templates.userNotFound);
		});

		test(`should respond with ${templates.ssoUser.code} if user is an SSO user`, async () => {
			UsersModel.isSsoUser.mockResolvedValueOnce(true);
			const mockCB = jest.fn();
			await Sso.isNonSsoUser({}, {}, mockCB);
			expect(mockCB).not.toHaveBeenCalled();
			expect(Responder.respond).toHaveBeenCalledTimes(1);
			expect(Responder.respond).toHaveBeenCalledWith({}, {}, templates.ssoUser);
		});

		test('should call next if user is a non SSO user', async () => {
			UsersModel.isSsoUser.mockResolvedValueOnce(false);
			const mockCB = jest.fn();
			await Sso.isNonSsoUser({}, {}, mockCB);
			expect(mockCB).toHaveBeenCalledTimes(1);
			expect(Responder.respond).not.toHaveBeenCalled();
		});
	});
};

const testUnlinkData = () => {
	describe.each([
		[{ body: { password: generateRandomString() } }, true, 'with valid password'],
		[{ body: { password: generateRandomString(1) } }, false, 'with weak password'],
		[{ body: { password: generateRandomString(), [generateRandomString()]: generateRandomString() } }, false, 'with extra properties'],
		[{ body: {} }, false, 'with empty body'],
		[{ body: undefined }, false, 'with undefined body'],
	])('Check if req arguments for verifying user are valid', (req, shouldPass, desc) => {
		test(`${desc} ${shouldPass ? ' should call next()' : `should respond with ${templates.invalidArguments.code}`}`, async () => {
			const mockCB = jest.fn();
			await Sso.validateUnlinkData(req, {}, mockCB);
			if (shouldPass) {
				expect(mockCB).toHaveBeenCalledTimes(1);
			} else {
				expect(mockCB).toHaveBeenCalledTimes(0);
				expect(Responder.respond).toHaveBeenCalledTimes(1);
				expect(Responder.respond.mock.results[0].value.code).toEqual(templates.invalidArguments.code);
			}
		});
	});
};

describe('middleware/sso', () => {
	testIsSsoUser();
	testIsNonSsoUser();
	testUnlinkData();
});
