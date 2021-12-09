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

const { src } = require('../../../../helper/path');

jest.mock('../../../../../../src/v5/utils/responder');
const Responder = require(`${src}/utils/responder`);
jest.mock('../../../../../../src/v5/utils/permissions/permissions');
const { cloneDeep } = require(`${src}/utils/helper/objects`);
const { templates } = require(`${src}/utils/responseCodes`);

jest.mock('../../../../../../src/v5/models/users');
const UsersModel = require(`${src}/models/users`);
const Users = require(`${src}/middleware/dataConverter/inputs/users`);

// Mock respond function to just return the resCode
Responder.respond.mockImplementation((req, res, errCode) => errCode);

const nonExistingUsername = 'nonExistingUser';
const existingUsername = 'existingUsername';

UsersModel.getUserByQuery.mockImplementation((query) => {
	if(query['$or'][0].user === nonExistingUsername){
		throw templates.userNotFound;
	}

	return { user: existingUsername };
});

const testValidateLoginData = () => {
	describe.each([
		[{ body: { user: existingUsername } }, false, 'with no password', templates.invalidArguments],
		[{ body: { user: 1, password: '123' } }, false, 'with invalid username', templates.invalidArguments],
		[{ body: { user: '123' } }, false, 'with no username', templates.invalidArguments],
		[{ body: { user: existingUsername, password: 123 } }, false, 'with invalid password', templates.invalidArguments],
		[{ body: { user: nonExistingUsername, password: 'validPassword' } }, false, 'with user that does not exist',
			templates.incorrectUsernameOrPassword],
		[{ body: {} }, false, 'with empty body', templates.invalidArguments],
		[{ body: undefined }, false, 'with undefined body', templates.invalidArguments],
		[{ body: { user: existingUsername, password: 'validPassword' } }, true, 'with user that exists'],
		[{ body: { user: 'existing@email.com', password: 'validPassword' } }, true, 'with user that exists using email'],
	])('Check if req arguments for loggin in are valid', (data, shouldPass, desc, expectedError) => {
		test(`${desc} ${shouldPass ? ' should call next()' : `should respond with ${expectedError.code}`}`, async () => {
			const mockCB = jest.fn();
			const req = { ...cloneDeep(data) };
			await Users.validateLoginData(req, {}, mockCB);
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

describe('middleware/dataConverter/inputs/users', () => {
	testValidateLoginData();
});
