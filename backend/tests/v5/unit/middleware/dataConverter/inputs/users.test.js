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
jest.mock('../../../../../../src/v5/utils/webRequests');
const WebRequests = require(`${src}/utils/webRequests`);
jest.mock('../../../../../../src/v5/utils/permissions');
const { cloneDeep } = require(`${src}/utils/helper/objects`);
const { templates } = require(`${src}/utils/responseCodes`);

jest.mock('../../../../../../src/v5/models/users');
const UsersModel = require(`${src}/models/users`);

const Users = require(`${src}/middleware/dataConverter/inputs/users`);
const { determineTestGroup, generateRandomString } = require('../../../../helper/services');

// Mock respond function to just return the resCode
Responder.respond.mockImplementation((req, res, errCode) => errCode);
WebRequests.post.mockImplementation(() => Promise.resolve({
	data: { success: true },
}));

const availableUsername = 'nonExistingUser';
const existingUsername = 'existingUsername';
const availableEmail = 'availableEmail@email.com';
const validPassword = 'Abcdef12345!';

UsersModel.getUserByQuery.mockImplementation((query) => {
	if ((query.$or && query.$or[0]?.user === availableUsername) || query['customData.email'] === availableEmail) {
		throw templates.userNotFound;
	}

	if (query.user === availableUsername) {
		throw templates.userNotFound;
	}

	return { user: existingUsername };
});

UsersModel.getUserByUsername.mockImplementation((username) => {
	if (username === existingUsername) {
		return { user: existingUsername };
	}
	throw templates.userNotFound;
});

UsersModel.getUserByEmail.mockImplementation((email) => {
	if (email === availableEmail) {
		throw templates.userNotFound;
	}
});

const testValidateUpdateData = () => {
	describe.each([
		[{ body: { firstName: generateRandomString(100) } }, false, false, 'with too large firstName', templates.invalidArguments],
		[{ body: { lastName: generateRandomString(100) } }, false, false, 'with too large lastName', templates.invalidArguments],
		[{ body: { email: availableEmail, extraProp: 'extra' } }, false, false, 'with extra properties', templates.invalidArguments],
		[{ body: { company: '' } }, false, false, 'with empty company', templates.invalidArguments],
		[{ body: { company: generateRandomString() } }, false, true, 'with company'],
		[{ body: { countryCode: 'invalid country' } }, false, false, 'with invalid country', templates.invalidArguments],
		[{ body: { countryCode: 'GB' } }, false, true, 'with valid country'],
		[{ body: { oldPassword: validPassword } }, false, false, 'with oldPassword but not newPassword', templates.invalidArguments],
		[{ body: { newPassword: 'Abcdef123456!' } }, false, false, 'with newPassword but not oldPassword', templates.invalidArguments],
		[{ body: { oldPassword: validPassword, newPassword: 'abc' } }, false, false, 'with short newPassword', templates.invalidArguments],
		[{ body: { oldPassword: validPassword, newPassword: 'abcdefghi' } }, false, false, 'with weak newPassword', templates.invalidArguments],
		[{ body: { oldPassword: validPassword, newPassword: 'Abcdef123!Abcdef123!Abcdef123!Abcdef123!Abcdef123!Abcdef123!Abcdef' } }, false, false, 'with too long newPassword', templates.invalidArguments],
		[{ body: { oldPassword: validPassword, newPassword: validPassword } }, false, false, 'with newPassword same as old', templates.invalidArguments],
		[{ body: { oldPassword: validPassword, newPassword: 'Abcdef12345!!' } }, false, true, 'with strong newPassword'],
		[{ body: {} }, false, false, 'with empty body', templates.invalidArguments],
		[{ body: undefined }, false, false, 'with undefined body', templates.invalidArguments],
	])('Check if req arguments for updating profile are valid', (data, isSso, shouldPass, desc, expectedError) => {
		test(`${desc} ${shouldPass ? ' should call next()' : `should respond with ${expectedError.code}`}`, async () => {
			const mockCB = jest.fn();
			const req = { ...cloneDeep(data), session: { user: { username: existingUsername } } };

			await Users.validateUpdateData(req, {}, mockCB);

			if (shouldPass) {
				expect(mockCB).toHaveBeenCalledTimes(1);
			} else {
				expect(mockCB).not.toHaveBeenCalled();
				expect(Responder.respond).toHaveBeenCalledTimes(1);
				expect(Responder.respond.mock.results[0].value.code).toEqual(expectedError.code);
			}
		});
	});
};

describe(determineTestGroup(__filename), () => {
	testValidateUpdateData();
});
