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
const Users = require(`${src}/models/users`);
const Auth = require(`${src}/middleware/dataConverter/inputs/auth`);

// Mock respond function to just return the resCode
Responder.respond.mockImplementation((req, res, errCode) => errCode);

const existingUsername = 'existingUser';
Users.getUserByUsername.mockImplementation((username) => {
	if (username !== existingUsername) {
		throw templates.userNotFound;
	}
});

const testValidateLoginData = () => {
	describe.each([
		[{ body: { username: existingUsername } }, false, 'with no password'],
		[{ body: { username: 1, password: '123' } }, false, 'with invalid username'],
		[{ body: { password: '123' } }, false, 'with no username'],
		[{ body: { username: existingUsername, password: 123 } }, false, 'with invalid password'],
		[{ body: { username: 'nonExistingUsername', password: 123 } }, false, 'with user that does not exist'],
		[{ body: {} }, false, 'with empty body'],
		[{ body: undefined }, false, 'with undefined body'],
		[{ body: { username: existingUsername, password: 'validPassword' } }, true, 'with user that exists'],
	])('Check if req arguments for loggin in are valid', (data, shouldPass, desc) => {
		test(`${desc} ${shouldPass ? ' should call next()' : 'should respond with invalidArguments'}`, async () => {
			const mockCB = jest.fn();
			const req = { ...cloneDeep(data) };
			await Auth.validateLoginData(req, {}, mockCB);
			if (shouldPass) {
				expect(mockCB.mock.calls.length).toBe(1);
			} else {
				expect(mockCB.mock.calls.length).toBe(0);
				expect(Responder.respond.mock.calls.length).toBe(1);
				expect(Responder.respond.mock.results[0].value.code).toEqual(templates.invalidArguments.code);
			}
		});
	});
};

describe('middleware/dataConverter/inputs/auth', () => {
	testValidateLoginData();
});
