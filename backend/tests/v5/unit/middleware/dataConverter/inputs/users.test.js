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
jest.mock('../../../../../../src/v5/utils/permissions/permissions');
const { cloneDeep } = require(`${src}/utils/helper/objects`);
const { templates } = require(`${src}/utils/responseCodes`);

jest.mock('../../../../../../src/v5/services/mailer');
const Mailer = require(`${src}/services/mailer`);
const { templates: mailTemplates } = require(`${src}/services/mailer/mailer.constants`);

const { providers, getProviderLabel } = require(`${src}/services/sso/sso.constants`);

jest.mock('../../../../../../src/v5/models/users');
const UsersModel = require(`${src}/models/users`);

const { formatPronouns } = require(`${src}/utils/helper/strings`);
const Users = require(`${src}/middleware/dataConverter/inputs/users`);
const { generateRandomString } = require('../../../../helper/services');

const config = require(`${src}/utils/config`);

// Mock respond function to just return the resCode
Responder.respond.mockImplementation((req, res, errCode) => errCode);
WebRequests.post.mockImplementation(() => Promise.resolve({
	data: { success: true },
}));

const availableUsername = 'nonExistingUser';
const existingUsername = 'existingUsername';
const ssoUsername = generateRandomString();
const availableEmail = 'availableEmail@email.com';
const existingEmail = 'existingEmail@email.com';
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
		[{ body: { user: availableUsername, password: 'validPassword' } }, false, 'with user that does not exist',
			templates.incorrectUsernameOrPassword],
		[{ body: {} }, false, 'with empty body', templates.invalidArguments],
		[{ body: undefined }, false, 'with undefined body', templates.invalidArguments],
		[{ body: { user: existingUsername, password: 'validPassword' } }, true, 'with user that exists'],
		[{ body: { user: ssoUsername, password: 'validPassword' } }, false, 'with SSO user that exists', templates.incorrectUsernameOrPassword],
		[{ body: { user: existingEmail, password: 'validPassword' } }, true, 'with user that exists using email'],
		[{ body: { user: existingUsername, password: 'validPassword', extraProp: 'extra' } }, false, 'with extra properties', templates.invalidArguments],
	])('Check if req arguments for login in are valid', (data, shouldPass, desc, expectedError) => {
		test(`${desc} ${shouldPass ? ' should call next()' : `should respond with ${expectedError.code}`}`, async () => {
			UsersModel.getUserByUsernameOrEmail.mockImplementationOnce((usernameOrEmail) => {
				if (usernameOrEmail === existingUsername || usernameOrEmail === existingEmail) {
					return { user: existingUsername, customData: {} };
				} if (usernameOrEmail === ssoUsername) {
					return { user: existingUsername, customData: { sso: { id: generateRandomString() } } };
				}

				throw templates.userNotFound;
			});

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
			// some test cases do not call the function, reset to ensure it doesn't trickle down to the next test.
			UsersModel.getUserByUsernameOrEmail.mockReset();
		});
	});
};

const testValidateUpdateData = () => {
	describe.each([
		[{ body: { firstName: generateRandomString(100) } }, false, false, 'with too large firstName', templates.invalidArguments],
		[{ body: { firstName: generateRandomString() } }, true, false, 'with firstName (SSO user)', templates.invalidArguments],
		[{ body: { lastName: generateRandomString(100) } }, false, false, 'with too large lastName', templates.invalidArguments],
		[{ body: { lastName: generateRandomString() } }, true, false, 'with lastName (SSO user)', templates.invalidArguments],
		[{ body: { email: 'invalid email' } }, false, false, 'with invalid email', templates.invalidArguments],
		[{ body: { email: existingEmail } }, false, false, 'with email that already exists', templates.invalidArguments],
		[{ body: { email: availableEmail } }, false, true, 'with email that is available'],
		[{ body: { email: availableEmail, extraProp: 'extra' } }, false, false, 'with extra properties', templates.invalidArguments],
		[{ body: { email: availableEmail } }, true, false, 'with email that is available (SSO user)', templates.invalidArguments],
		[{ body: { company: '' } }, false, false, 'with empty company', templates.invalidArguments],
		[{ body: { company: generateRandomString() } }, false, true, 'with company'],
		[{ body: { company: generateRandomString() } }, true, true, 'with company (SSO user)'],
		[{ body: { countryCode: 'invalid country' } }, false, false, 'with invalid country', templates.invalidArguments],
		[{ body: { countryCode: 'GB' } }, false, true, 'with valid country'],
		[{ body: { countryCode: 'GB' } }, true, true, 'with valid country (SSO user)'],
		[{ body: { oldPassword: validPassword } }, false, false, 'with oldPassword but not newPassword', templates.invalidArguments],
		[{ body: { newPassword: 'Abcdef123456!' } }, false, false, 'with newPassword but not oldPassword', templates.invalidArguments],
		[{ body: { oldPassword: validPassword, newPassword: 'abc' } }, false, false, 'with short newPassword', templates.invalidArguments],
		[{ body: { oldPassword: validPassword, newPassword: 'abcdefghi' } }, false, false, 'with weak newPassword', templates.invalidArguments],
		[{ body: { oldPassword: validPassword, newPassword: 'Abcdef123!Abcdef123!Abcdef123!Abcdef123!Abcdef123!Abcdef123!Abcdef' } }, false, false, 'with too long newPassword', templates.invalidArguments],
		[{ body: { oldPassword: validPassword, newPassword: validPassword } }, false, false, 'with newPassword same as old', templates.invalidArguments],
		[{ body: { oldPassword: validPassword, newPassword: 'Abcdef12345!!' } }, false, true, 'with strong newPassword'],
		[{ body: { oldPassword: 'invalid password', newPassword: 'Abcdef123456!' } }, false, false, 'with wrong oldPassword', templates.incorrectPassword],
		[{ body: { oldPassword: validPassword, newPassword: 'Abcdef12345!!' } }, false, true, 'with password (SSO user)', templates.invalidArguments],
		[{ body: {} }, false, false, 'with empty body', templates.invalidArguments],
		[{ body: undefined }, false, false, 'with undefined body', templates.invalidArguments],
	])('Check if req arguments for updating profile are valid', (data, isSso, shouldPass, desc, expectedError) => {
		test(`${desc} ${shouldPass ? ' should call next()' : `should respond with ${expectedError.code}`}`, async () => {
			const mockCB = jest.fn();
			const req = { ...cloneDeep(data), session: { user: { username: existingUsername } } };
			UsersModel.isSsoUser.mockResolvedValueOnce(isSso);

			await Users.validateUpdateData(req, {}, mockCB);

			if (shouldPass) {
				expect(mockCB).toHaveBeenCalledTimes(1);
			} else {
				expect(mockCB).not.toHaveBeenCalled();
				expect(Responder.respond).toHaveBeenCalledTimes(1);
				expect(Responder.respond.mock.results[0].value.code).toEqual(expectedError.code);
			}

			expect(UsersModel.isSsoUser).toHaveBeenCalledTimes(1);
			expect(UsersModel.isSsoUser).toHaveBeenCalledWith(existingUsername);
		});
	});
};

const testForgotPasswordData = () => {
	const genUserData = (sso) => ({
		user: existingUsername,
		customData: {
			firstName: generateRandomString(),
			email: generateRandomString(),
			...(sso ? { sso: { id: generateRandomString(), type: providers.AAD } } : {}),
		},
	});
	describe.each([
		[{ body: { user: existingUsername } }, genUserData(), true, 'with valid username'],
		[{ body: { user: availableUsername } }, undefined, false, 'with invalid username', templates.ok],
		[{ body: { user: ssoUsername } }, genUserData(true), false, 'with sso user username', templates.ok],
		[{ body: { user: existingEmail } }, genUserData(), true, 'with valid email'],
		[{ body: { user: existingEmail, extra: 'extra' } }, genUserData(), false, 'with extra properties', templates.invalidArguments],
		[{ body: {} }, undefined, false, 'with empty body', templates.invalidArguments],
		[{ body: undefined }, undefined, false, 'with undefined body', templates.invalidArguments],
	])('Forgot password data validation', (req, userData, shouldPass, desc, expectedResponse) => {
		test(`${desc} ${shouldPass ? ' should call next()' : `should respond with ${expectedResponse.code}`}`, async () => {
			UsersModel.getUserByUsernameOrEmail.mockImplementationOnce(() => {
				if (!userData) return Promise.reject(templates.userNotFound);
				return Promise.resolve(userData);
			});

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

			if (userData?.customData?.sso) {
				expect(Mailer.sendEmail).toHaveBeenCalledTimes(1);
				expect(Mailer.sendEmail).toHaveBeenCalledWith(
					mailTemplates.FORGOT_PASSWORD_SSO.name,
					userData.customData.email,
					{
						username: userData.user,
						firstName: userData.customData.firstName,
						ssoType: getProviderLabel(userData.customData.sso.type),
					},
				);
			} else {
				expect(Mailer.sendEmail).not.toHaveBeenCalled();
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
		[{ body: { token: 'abc', newPassword: validPassword, user: availableUsername } }, false, 'with user that doesnt exist', templates.invalidArguments],
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

const testValidateSignUpData = () => {
	const newUserData = {
		username: availableUsername,
		email: availableEmail,
		password: generateRandomString(),
		firstName: generateRandomString(),
		lastName: generateRandomString(),
		countryCode: 'GB',
		company: generateRandomString(),
		mailListAgreed: true,
	};

	describe.each([
		[{ body: { ...newUserData } }, true, 'with valid data'],
		[{ body: { ...newUserData, company: undefined } }, true, 'with empty company'],
		[{ body: { ...newUserData, username: existingUsername } }, false, 'with username that already exists', templates.invalidArguments],
		[{ body: { ...newUserData, username: '_*., +-=' } }, false, 'with invalid username', templates.invalidArguments],
		[{ body: { ...newUserData, email: existingEmail } }, false, 'with email that already exists', templates.invalidArguments],
		[{ body: { ...newUserData, email: generateRandomString() } }, false, 'with invalid email', templates.invalidArguments],
		[{ body: { ...newUserData, username: generateRandomString(64) } }, false, 'with too large username', templates.invalidArguments],
		[{ body: { ...newUserData, firstName: generateRandomString(50) } }, false, 'with too large firstName', templates.invalidArguments],
		[{ body: { ...newUserData, lastName: generateRandomString(50) } }, false, 'with too large lastName', templates.invalidArguments],
		[{ body: { ...newUserData, countryCode: generateRandomString() } }, false, 'with invalid country', templates.invalidArguments],
		[{ body: { ...newUserData, password: generateRandomString(3) } }, false, 'with short password', templates.invalidArguments],
		[{ body: { ...newUserData, password: 'abcdefghi' } }, false, 'with weak newPassword', templates.invalidArguments],
		[{ body: {} }, false, 'with empty body', templates.invalidArguments],
		[{ body: undefined }, false, 'with undefined body', templates.invalidArguments],
	])('Validate user sign up data', (req, shouldPass, desc, expectedError) => {
		test(`${desc} ${shouldPass ? ' should call next()' : `should respond with ${expectedError.code}`}`, async () => {
			const mockCB = jest.fn();
			const bodyBefore = { ...req.body };
			await Users.validateSignUpData(req, {}, mockCB);
			if (shouldPass) {
				expect(mockCB).toHaveBeenCalledTimes(1);
				expect(req.body.firstName).toEqual(formatPronouns(bodyBefore.firstName));
				expect(req.body.lastName).toEqual(formatPronouns(bodyBefore.lastName));
			} else {
				expect(mockCB).toHaveBeenCalledTimes(0);
				expect(Responder.respond).toHaveBeenCalledTimes(1);
				expect(Responder.respond.mock.results[0].value.code).toEqual(expectedError.code);
			}
		});
	});

	test('with captcha enabled it should call next', async () => {
		config.auth.captcha = true;
		config.captcha = {};

		const mockCB = jest.fn();
		await Users.validateSignUpData({ body: { ...newUserData, captcha: generateRandomString() } }, {}, mockCB);
		expect(mockCB).toHaveBeenCalledTimes(1);

		config.auth.captcha = false;
		config.captcha = null;
	});

	test('with captcha enabled but not provided it should respond with invalidArguments', async () => {
		config.auth.captcha = true;
		config.captcha = {};

		const mockCB = jest.fn();
		await Users.validateSignUpData({ body: newUserData }, {}, mockCB);
		expect(mockCB).toHaveBeenCalledTimes(0);
		expect(Responder.respond).toHaveBeenCalledTimes(1);
		expect(Responder.respond.mock.results[0].value.code).toEqual(templates.invalidArguments.code);

		config.auth.captcha = false;
		config.captcha = null;
	});
};

const testValidateSsoSignUpData = () => {
	const newUserData = {
		username: availableUsername,
		countryCode: 'GB',
		company: generateRandomString(),
		mailListAgreed: true,
	};

	describe.each([
		[{ body: { ...newUserData } }, true, 'with valid data'],
		[{ body: { ...newUserData, company: undefined } }, true, 'with empty company'],
		[{ body: { ...newUserData, username: existingUsername } }, false, 'with username that already exists', templates.invalidArguments],
		[{ body: { ...newUserData, username: '_*., +-=' } }, false, 'with invalid username', templates.invalidArguments],
		[{ body: { ...newUserData, username: generateRandomString(64) } }, false, 'with too large username', templates.invalidArguments],
		[{ body: { ...newUserData, countryCode: generateRandomString() } }, false, 'with invalid country', templates.invalidArguments],
		[{ body: {} }, false, 'with empty body', templates.invalidArguments],
		[{ body: undefined }, false, 'with undefined body', templates.invalidArguments],
	])('Check if req arguments for signing up user are valid', (req, shouldPass, desc, expectedError) => {
		test(`${desc} ${shouldPass ? ' should call next()' : `should respond with ${expectedError.code}`}`, async () => {
			const mockCB = jest.fn();
			await Users.validateSsoSignUpData(req, {}, mockCB);
			if (shouldPass) {
				expect(mockCB).toHaveBeenCalledTimes(1);
			} else {
				expect(mockCB).toHaveBeenCalledTimes(0);
				expect(Responder.respond).toHaveBeenCalledTimes(1);
				expect(Responder.respond.mock.results[0].value.code).toEqual(expectedError.code);
			}
		});
	});

	test('with captcha enabled it should call next', async () => {
		config.auth.captcha = true;
		config.captcha = {};

		const mockCB = jest.fn();
		await Users.validateSsoSignUpData({ body: { ...newUserData, captcha: generateRandomString() } }, {}, mockCB);
		expect(mockCB).toHaveBeenCalledTimes(1);

		config.auth.captcha = false;
		config.captcha = null;
	});

	test('with captcha enabled but not provided it should respond with invalidArguments', async () => {
		config.auth.captcha = true;
		config.captcha = {};

		const mockCB = jest.fn();
		await Users.validateSsoSignUpData({ body: newUserData }, {}, mockCB);
		expect(mockCB).toHaveBeenCalledTimes(0);
		expect(Responder.respond).toHaveBeenCalledTimes(1);
		expect(Responder.respond.mock.results[0].value.code).toEqual(templates.invalidArguments.code);

		config.auth.captcha = false;
		config.captcha = null;
	});
};

const testVerifyData = () => {
	describe.each([
		[{ body: { username: existingUsername, token: generateRandomString() } }, true, 'with valid data'],
		[{ body: { username: existingUsername } }, false, 'without token', templates.invalidArguments],
		[{ body: { username: availableUsername, token: generateRandomString() } }, false, 'with non existing username', templates.invalidArguments],
		[{ body: {} }, false, 'with empty body', templates.invalidArguments],
		[{ body: undefined }, false, 'with undefined body', templates.invalidArguments],
	])('Check if req arguments for verifying user are valid', (req, shouldPass, desc, expectedError) => {
		test(`${desc} ${shouldPass ? ' should call next()' : `should respond with ${expectedError.code}`}`, async () => {
			const mockCB = jest.fn();
			await Users.validateVerifyData(req, {}, mockCB);
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

describe('middleware/dataConverter/inputs/users', () => {
	testValidateLoginData();
	testValidateUpdateData();
	testForgotPasswordData();
	testResetingPasswordData();
	testValidateSignUpData();
	testValidateSsoSignUpData();
	testVerifyData();
});
