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

const { src, modelFolder, imagesFolder } = require('../../../../helper/path');

jest.mock('../../../../../../src/v5/utils/responder');
const Responder = require(`${src}/utils/responder`);
jest.mock('../../../../../../src/v5/utils/permissions/permissions');
const { cloneDeep } = require(`${src}/utils/helper/objects`);
const { templates } = require(`${src}/utils/responseCodes`);

jest.mock('../../../../../../src/v5/models/users');
const UsersModel = require(`${src}/models/users`);
const Users = require(`${src}/middleware/dataConverter/inputs/users`);
const MockExpressRequest = require('mock-express-request');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

// Mock respond function to just return the resCode
Responder.respond.mockImplementation((req, res, errCode) => errCode);

const nonExistingUsername = 'nonExistingUser';
const existingUsername = 'existingUsername';
const nonExistingEmail = 'nonExistingEmail@email.com';
const existingEmail = 'existingEmail@email.com';
const validPassword = 'Abcdef12345!';

UsersModel.getUserByQuery.mockImplementation((query) => {
	if ((query.$or && query.$or[0]?.user === nonExistingUsername) || query['customData.email'] === nonExistingEmail) {
		throw templates.userNotFound;
	}

	if (query.user === nonExistingUsername) {
		throw templates.userNotFound;
	}

	return { user: existingUsername };
});

UsersModel.getUserByUsernameOrEmail.mockImplementation((usernameOrEmail) => {
	if (usernameOrEmail === nonExistingUsername || usernameOrEmail === nonExistingEmail) {
		throw templates.userNotFound;
	}

	return { user: existingUsername };
});

UsersModel.authenticate.mockImplementation((username, password) => {
	// eslint-disable-next-line security/detect-possible-timing-attacks
	if (password !== validPassword) {
		throw templates.incorrectUsernameOrPassword;
	}
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
		[{ body: { user: existingUsername, password: 'validPassword', extraProp: 'extra' } }, false, 'with extra properties', templates.invalidArguments],
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

const testValidateUpdateData = () => {
	describe.each([
		[{ body: { firstName: 'this is a very very large string that should fail' } }, false, 'with too large firstName', templates.invalidArguments],
		[{ body: { lastName: 'this is a very very large string that should fail' } }, false, 'with too large lastName', templates.invalidArguments],
		[{ body: { email: 'invalid email' } }, false, 'with invalid email', templates.invalidArguments],
		[{ body: { email: existingEmail } }, false, 'with email that already exists', templates.invalidArguments],
		[{ body: { email: nonExistingEmail } }, true, 'with email that is available'],
		[{ body: { email: nonExistingEmail, extraProp: 'extra' } }, false, 'with extra properties', templates.invalidArguments],
		[{ body: { company: '' } }, false, 'with empty company', templates.invalidArguments],
		[{ body: { company: 'Some company' } }, true, 'with company'],
		[{ body: { countryCode: 'invalid country' } }, false, 'with invalid country', templates.invalidArguments],
		[{ body: { countryCode: 'GB' } }, true, 'with valid country'],
		[{ body: { oldPassword: validPassword } }, false, 'with oldPassword but not newPassword', templates.invalidArguments],
		[{ body: { newPassword: 'Abcdef123456!' } }, false, 'with newPassword but not oldPassword', templates.invalidArguments],
		[{ body: { oldPassword: validPassword, newPassword: 'abc' } }, false, 'with short newPassword', templates.invalidArguments],
		[{ body: { oldPassword: validPassword, newPassword: 'abcdefghi' } }, false, 'with weak newPassword', templates.invalidArguments],
		[{ body: { oldPassword: validPassword, newPassword: 'Abcdef123!Abcdef123!Abcdef123!Abcdef123!Abcdef123!Abcdef123!Abcdef' } }, false, 'with too long newPassword', templates.invalidArguments],
		[{ body: { oldPassword: validPassword, newPassword: validPassword } }, false, 'with newPassword same as old', templates.invalidArguments],
		[{ body: { oldPassword: validPassword, newPassword: 'Abcdef12345!!' } }, true, 'with strong newPassword'],
		[{ body: { oldPassword: 'invalid password', newPassword: 'Abcdef123456!' } }, false, 'with wrong oldPassword', templates.incorrectPassword],
		[{ body: {} }, false, 'with empty body', templates.invalidArguments],
		[{ body: undefined }, false, 'with undefined body', templates.invalidArguments],
	])('Check if req arguments for updating profile are valid', (data, shouldPass, desc, expectedError) => {
		test(`${desc} ${shouldPass ? ' should call next()' : `should respond with ${expectedError.code}`}`, async () => {
			const mockCB = jest.fn();
			const req = { ...cloneDeep(data), session: { user: { username: existingUsername } } };
			await Users.validateUpdateData(req, {}, mockCB);
			if (shouldPass) {
				expect(mockCB.mock.calls.length).toBe(1);
			} else {
				expect(mockCB.mock.calls.length).toBe(0);
				expect(Responder.respond.mock.calls.length).toBe(1);
				expect(Responder.respond.mock.results[0].value.code).toEqual(expectedError.code);
			}
		});
	});
};

const createRequestWithFile = (filename = 'valid.png', extraProp = false) => {
	const form = new FormData();
	if (filename) {
		let fileFolder = imagesFolder;

		if (!filename.endsWith('.png')) {
			fileFolder = modelFolder;
		}

		form.append('file', fs.createReadStream(path.join(fileFolder, filename)));
	}

	if (extraProp) form.append('extraProp', 'extra');

	const req = new MockExpressRequest({
		method: 'PUT',
		host: 'localhost',
		url: '/user/avatar',
		headers: form.getHeaders(),
	});

	form.pipe(req);
	return req;
};

const testValidateAvatarData = () => {
	describe.each([
		['with valid file', true],
		['with unsupported file', false, 'dummy.obj', false, templates.unsupportedFileFormat],
		['with corrupt file', false, 'corrupted.png', false, templates.unsupportedFileFormat],
		['with no file', false, null, false, templates.invalidArguments],
		['with too large file', false, 'tooBig.png', false, templates.maxSizeExceeded],
		['with extra property', true, 'valid.png', true],
	])('Check if req arguments for new avatar upload are valid', (desc, shouldPass, filename, extraProp, expectedError) => {
		test(`${desc} ${shouldPass ? ' should call next()' : `should respond with ${expectedError.code}`}`, async () => {
			const mockCB = jest.fn();
			const req = createRequestWithFile(filename, extraProp);
			await Users.validateAvatarFile(req, {}, mockCB);
			if (shouldPass) {
				expect(mockCB.mock.calls.length).toBe(1);
			} else {
				expect(mockCB.mock.calls.length).toBe(0);
				expect(Responder.respond.mock.calls.length).toBe(1);
				expect(Responder.respond.mock.results[0].value.code).toEqual(expectedError.code);
			}
		});
	});
};

const testForgotPasswordData = () => {
	describe.each([
		[{ body: { user: existingUsername } }, true, 'with valid username'],
		[{ body: { user: nonExistingUsername } }, false, 'with invalid username', templates.ok],
		[{ body: { user: existingEmail } }, true, 'with valid email'],
		[{ body: { user: existingEmail, extra: 'extra' } }, false, 'with extra properties', templates.invalidArguments],
		[{ body: {} }, false, 'with empty body', templates.invalidArguments],
		[{ body: undefined }, false, 'with undefined body', templates.invalidArguments],
	])('Check if req arguments for requesting a reset password email are valid', (req, shouldPass, desc, expectedResponse) => {
		test(`${desc} ${shouldPass ? ' should call next()' : `should respond with ${expectedResponse.code}`}`, async () => {
			const mockCB = jest.fn();
			await Users.validateForgotPasswordData(req, {}, mockCB);
			if (shouldPass) {
				expect(mockCB.mock.calls.length).toBe(1);
				expect(req.body.user).toEqual(existingUsername);
			} else {
				expect(mockCB.mock.calls.length).toBe(0);
				expect(Responder.respond.mock.calls.length).toBe(1);
				expect(Responder.respond.mock.results[0].value.code).toEqual(expectedResponse.code);
			}
		});
	});
};

const testResetingPasswordData = () => {
	describe.each([
		[{ body: { newPassword: validPassword, user: 'some user' } }, false, 'without token', templates.invalidArguments],
		[{ body: { token: 'someToken', user: 'some user' } }, false, 'without new password', templates.invalidArguments],
		[{ body: { token: 'someToken', newPassword: validPassword } }, false, 'without user', templates.invalidArguments],
		[{ body: { token: 'abc', newPassword: '123', user: 'some user' } }, false, 'with weak new password', templates.invalidArguments],
		[{ body: { token: 'abc', newPassword: 'Abcdef123!Abcdef123!Abcdef123!Abcdef123!Abcdef123!Abcdef123!Abcdef', user: 'some user' } }, false, 'with too long new password', templates.invalidArguments],
		[{ body: { token: 'abc', newPassword: validPassword, user: nonExistingUsername } }, false, 'with user that doesnt exist', templates.invalidArguments],
		[{ body: { token: 'someToken', newPassword: validPassword, user: 'some user' } }, true, 'with token and valid new password'],
		[{ body: { token: 'someToken', newPassword: validPassword, user: 'some user', extra: 'extra' } }, false, 'with extra properties', templates.invalidArguments],
		[{ body: {} }, false, 'with empty body', templates.invalidArguments, templates.invalidArguments],
		[{ body: undefined }, false, 'with undefined body', templates.invalidArguments, templates.invalidArguments],
	])('Check if req arguments for resseting a password are valid', (req, shouldPass, desc, expectedError) => {
		test(`${desc} ${shouldPass ? ' should call next()' : `should respond with ${expectedError.code}`}`, async () => {
			const mockCB = jest.fn();
			await Users.validateResetPasswordData(req, {}, mockCB);
			if (shouldPass) {
				expect(mockCB.mock.calls.length).toBe(1);
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
	testValidateUpdateData();
	testValidateAvatarData();
	testForgotPasswordData();
	testResetingPasswordData();
});
