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

const { generateRandomString } = require('../../../../../../helper/services');
const { src } = require('../../../../../../helper/path');
const { aad } = require('../../../../../../../../src/v5/services/sso/sso.constants');
const { authenticateRedirectUri, signupRedirectUri } = require('../../../../../../../../src/v5/services/sso/aad/aad.constants');

jest.mock('../../../../../../../../src/v5/utils/responder');
const Responder = require(`${src}/utils/responder`);

jest.mock('../../../../../../../../src/v5/services/sso/aad');
const AadServices = require(`${src}/services/sso/aad`);

jest.mock('../../../../../../../../src/v5/models/users');
const UsersModel = require(`${src}/models/users`);

const Aad = require(`${src}/middleware/dataConverter/inputs/sso/aad`);
const { templates } = require(`${src}/utils/responseCodes`);

// Mock respond function to just return the resCode
Responder.respond.mockImplementation((req, res, errCode) => errCode);

const aadUserDetails = {
	data: {
		mail: 'example@email.com',
		givenName: generateRandomString(),
		surname: generateRandomString(),
		id: generateRandomString(),
	},
};

const testGetUserDetailsAndCheckEmailAvailability = () => {
	describe('Get user details and check email availability', () => {
		const req = {
			query: {
				code: generateRandomString(),
				state: JSON.stringify({ username: generateRandomString() }),
			},
			session: { pkceCodes: { verifier: generateRandomString() } },
		};

		test(`should respond with ${templates.invalidArguments.code} if the email already exists`, async () => {
			AadServices.getUserDetails.mockResolvedValueOnce(aadUserDetails);
			UsersModel.getUserByQuery.mockResolvedValueOnce({ customData: {} });
			const mockCB = jest.fn();
			await Aad.getUserDetailsAndCheckEmailAvailability(req, {}, mockCB);
			expect(mockCB.mock.calls.length).toBe(0);
			expect(Responder.respond).toHaveBeenCalledTimes(1);
			expect(Responder.respond.mock.results[0].value.code).toEqual(templates.invalidArguments.code);
			expect(Responder.respond.mock.results[0].value.message).toEqual('Email already exists');
		});

		test(`should respond with ${templates.invalidArguments.code} if the email already exists`, async () => {
			AadServices.getUserDetails.mockResolvedValueOnce(aadUserDetails);
			UsersModel.getUserByQuery.mockResolvedValueOnce({ customData: { sso: { _id: generateRandomString() } } });
			const mockCB = jest.fn();
			await Aad.getUserDetailsAndCheckEmailAvailability(req, {}, mockCB);
			expect(mockCB.mock.calls.length).toBe(0);
			expect(Responder.respond).toHaveBeenCalledTimes(1);
			expect(Responder.respond.mock.results[0].value.code).toEqual(templates.invalidArguments.code);
			expect(Responder.respond.mock.results[0].value.message).toEqual('Email already exists from SSO user');
		});

		test('should call next if email is available', async () => {
			AadServices.getUserDetails.mockResolvedValueOnce(aadUserDetails);
			UsersModel.getUserByQuery.mockRejectedValueOnce(templates.userNotFound);
			const mockCB = jest.fn();
			await Aad.getUserDetailsAndCheckEmailAvailability(req, {}, mockCB);
			expect(mockCB).toHaveBeenCalledTimes(1);
			expect(Responder.respond).toHaveBeenCalledTimes(0);
			expect(req.body).toEqual(
				{
					...JSON.parse(req.query.state),
					email: aadUserDetails.data.mail,
					firstName: aadUserDetails.data.givenName,
					lastName: aadUserDetails.data.surname,
					sso: { type: aad, id: aadUserDetails.data.id },
				},
			);
		});
	});
};

const testSetAuthenticateAuthParams = () => {
	describe('Set auth params for authenticate endpoint', () => {
		const req = {
			query: { signupUri: generateRandomString() },
			session: { pkceCodes: { challenge: generateRandomString(), challengeMethod: generateRandomString() } },
		};

		test('should set authParams and call next', async () => {
			const mockCB = jest.fn();
			await Aad.setAuthenticateAuthParams(req, {}, mockCB);
			expect(mockCB).toHaveBeenCalledTimes(1);
			expect(req.authParams).toEqual({
				redirectUri: authenticateRedirectUri,
				state: JSON.stringify({ redirectUri: req.query.signupUri }),
				codeChallenge: req.session.pkceCodes.challenge,
				codeChallengeMethod: req.session.pkceCodes.challengeMethod,
			});
		});
	});
};

const testSetSignupAuthParams = () => {
	describe('Set auth params for signup endpoint', () => {
		const req = {
			body: {
				username: generateRandomString(),
				countryCode: generateRandomString(),
				company: generateRandomString(),
				mailListAgreed: true,
			},
			session: { pkceCodes: { challenge: generateRandomString(), challengeMethod: generateRandomString() } },
		};

		test('should set authParams and call next', async () => {
			const mockCB = jest.fn();
			await Aad.setSignupAuthParams(req, {}, mockCB);
			expect(mockCB).toHaveBeenCalledTimes(1);
			expect(req.authParams).toEqual({
				redirectUri: signupRedirectUri,
				state: JSON.stringify({
					username: req.body.username,
					countryCode: req.body.countryCode,
					company: req.body.company,
					mailListAgreed: req.body.mailListAgreed,
				}),
				codeChallenge: req.session.pkceCodes.challenge,
				codeChallengeMethod: req.session.pkceCodes.challengeMethod,
			});
		});
	});
};

const testSetAuthenticationCodeUrl = () => {
	describe('Get authentication code url', () => {
		const req = { };

		test('should call set authParams and call next', async () => {
			const mockCB = jest.fn();
			const authenticationCodeUrl = generateRandomString();
			AadServices.getAuthenticationCodeUrl.mockResolvedValueOnce(authenticationCodeUrl);
			await Aad.setAuthenticationCodeUrl(req, {}, mockCB);
			expect(mockCB).toHaveBeenCalledTimes(1);
			expect(req.authenticationCodeUrl).toEqual(authenticationCodeUrl);
		});
	});
};

describe('middleware/dataConverter/inputs/teamspaces', () => {
	testGetUserDetailsAndCheckEmailAvailability();
	testSetAuthenticateAuthParams();
	testSetSignupAuthParams();
	testSetAuthenticationCodeUrl();
});
