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

const { src } = require('../../../../../helper/path');

jest.mock('../../../../../../../src/v5/utils/responder');
const Responder = require(`${src}/utils/responder`);
jest.mock('../../../../../../../src/v5/utils/permissions/permissions');
const { cloneDeep } = require(`${src}/utils/helper/objects`);
const { templates } = require(`${src}/utils/responseCodes`);

jest.mock('../../../../../../../src/v5/models/users');
const UserModel = require(`${src}/models/users`);
const admin = require(`${src}/middleware/dataConverter/inputs/admin`);
const { SYSTEM_ROLES,
	SYSTEM_ADMIN,
	LICENSE_ADMIN,
	SUPPORT_ADMIN,
} = require(`${src}/utils/permissions/permissions.constants`);

// Mock respond function to just return the resCode
Responder.respond.mockImplementation((req, res, errCode) => errCode);

const nonExistingUsername = 'nonExistingUser';
const existingUsername = 'existingUsername';

UserModel.getUserByQuery.mockImplementation((query) => {
	if (query.$or[0].user === nonExistingUsername) {
		throw templates.userNotFound;
	}

	return { user: existingUsername };
});

const testValidateUsersAndRoles = () => {
	describe.each([
		[{ body: { user: existingUsername, roles: [] } }, false, 'with no roles', templates.invalidArguments],
		[{ body: { user: existingUsername } }, false, 'with missing roles', templates.invalidArguments],
		[{ body: { user: existingUsername, roles: 'invalid_role' } }, false, 'with invalid rolename', templates.invalidArguments],
		[{ body: { user: existingUsername, roles: SYSTEM_ROLES } }, true, 'with valid user and all roles'],
		[{ body: { user: existingUsername, roles: SYSTEM_ADMIN } }, true, 'with valid user and SYSTEM_ADMIN'],
		[{ body: { user: existingUsername, roles: LICENSE_ADMIN } }, true, 'with valid user and LICENSE_ADMIN'],
		[{ body: { user: existingUsername, roles: SUPPORT_ADMIN } }, true, 'with valid user and SUPPORT_ADMIN'],

		[{ body: { user: nonExistingUsername, roles: SYSTEM_ROLES } }, false, 'with invalid username', templates.invalidArguments],
		[{ body: { user: nonExistingUsername, roles: [] } }, false, 'with invalid username, and empty roles', templates.invalidArguments],
		[{ body: { user: nonExistingUsername } }, false, 'with invalid username, and missing roles', templates.invalidArguments],
		[{ body: undefined }, false, 'with undefined body', templates.invalidArguments],
		[{ body: {} }, false, 'with empty body', templates.invalidArguments],

		// [{ body: { user: 1, password: '123' } }, false, 'with invalid username', templates.invalidArguments],
		// [{ body: { user: '123' } }, false, 'with no username', templates.invalidArguments],
		// [{ body: { user: existingUsername, password: 123 } }, false, 'with invalid password', templates.invalidArguments],
		// [{ body: { user: nonExistingUsername, password: 'validPassword' } }, false, 'with user that does not exist',
		//  templates.incorrectUsernameOrPassword],
		// [{ body: {} }, false, 'with empty body', templates.invalidArguments],
		// [{ body: undefined }, false, 'with undefined body', templates.invalidArguments],
		// [{ body: { user: existingUsername, password: 'validPassword' } }, true, 'with user that exists'],
		// [{ body: { user: 'existing@email.com', password: 'validPassword' } }, true, 'with user that exists using email'],
	])('Check if req arguments for loggin in are valid', (data, shouldPass, desc, expectedError) => {
		test(`${desc} ${shouldPass ? ' should call next()' : `should respond with ${expectedError.code}`}`, async () => {
			const mockCB = jest.fn();
			const req = { ...cloneDeep(data) };
			await admin.validatePayload(req, {}, mockCB);
			if (shouldPass) {
				expect(mockCB.mock.calls.length).toBe(1);
				expect(req.body.user).toEqual(existingUsername);
			} else {
				expect(mockCB.mock.calls.length).toBe(0);
				expect(Responder.respond.mock.calls.length).toBe(1);
				expect(Responder.respond.mock.results[0].value.code).toEqual(expectedError.code);
			}
		});
	});
};

describe('middleware/dataConverter/inputs/admin', () => {
	testValidateUsersAndRoles();
});
