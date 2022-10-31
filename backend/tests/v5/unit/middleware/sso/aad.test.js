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

const { createResponseCode } = require('../../../../../src/v5/utils/responseCodes');
const { generateRandomString, generateRandomURL } = require('../../../helper/services');
const { providers, errorCodes } = require('../../../../../src/v5/services/sso/sso.constants');
const { src } = require('../../../helper/path');

jest.mock('../../../../../src/v5/utils/responder');
const Responder = require(`${src}/utils/responder`);

jest.mock('../../../../../src/v5/services/sso/aad');
const AadServices = require(`${src}/services/sso/aad`);

jest.mock('../../../../../src/v5/models/users');
const UsersModel = require(`${src}/models/users`);

const Aad = require(`${src}/middleware/sso/aad`);
const { templates } = require(`${src}/utils/responseCodes`);

jest.mock('../../../../../src/v5/middleware/sso/pkce');
const Sso = require(`${src}/middleware/sso/pkce`);

Sso.addPkceProtection.mockImplementation((req, res, next) => next());

// Mock respond function to just return the resCode
Responder.respond.mockImplementation((req, res, errCode) => errCode);

const addPkceCodes = (req) => {
	req.session = { pkceCodes: { challenge: generateRandomString(), challengeMethod: generateRandomString() } };
};

const testVerifyNewUserDetails = () => {
	describe('Get user details and check email availability', () => {
		const aadUserDetails = {
			data: {
				mail: 'example@email.com',
				givenName: generateRandomString(),
				surname: generateRandomString(),
				id: generateRandomString(),
			},
		};

		const redirectUri = generateRandomURL();
		const res = { redirect: jest.fn() };
		const req = {
			query: {
				code: generateRandomString(),
				state: JSON.stringify({ username: generateRandomString(), redirectUri }),
			},
			session: { pkceCodes: { verifier: generateRandomString() } },
		};

		test(`should respond with error code ${errorCodes.emailExists} if the email already exists`, async () => {
			AadServices.getUserDetails.mockResolvedValueOnce(aadUserDetails);
			UsersModel.getUserByEmail.mockResolvedValueOnce({ customData: {} });
			const mockCB = jest.fn();
			await Aad.verifyNewUserDetails(req, res, mockCB);
			expect(mockCB).not.toHaveBeenCalled();
			expect(res.redirect).toHaveBeenCalledTimes(1);
			expect(res.redirect).toHaveBeenCalledWith(`${redirectUri}?error=${errorCodes.emailExists}`);
		});

		test(`should respond with error code ${errorCodes.emailExistsWithSSO} if the email already exists (SSO user)`, async () => {
			AadServices.getUserDetails.mockResolvedValueOnce(aadUserDetails);
			UsersModel.getUserByEmail.mockResolvedValueOnce({ customData: { sso: { _id: generateRandomString() } } });
			const mockCB = jest.fn();
			await Aad.verifyNewUserDetails(req, res, mockCB);
			expect(mockCB).not.toHaveBeenCalled();
			expect(res.redirect).toHaveBeenCalledTimes(1);
			expect(res.redirect).toHaveBeenCalledWith(`${redirectUri}?error=${errorCodes.emailExistsWithSSO}`);
		});

		test(`should respond with ${templates.invalidArguments.code} if state is empty`, async () => {
			const mockCB = jest.fn();
			const reqWithNoState = { ...req, query: { code: generateRandomString() } };
			await Aad.verifyNewUserDetails(reqWithNoState, res, mockCB);
			expect(mockCB).not.toHaveBeenCalled();
			expect(Responder.respond).toHaveBeenCalledTimes(1);
			expect(Responder.respond).toHaveBeenCalledWith(reqWithNoState, res, createResponseCode(templates.unkown));
		});

		test('should call next if email is available', async () => {
			AadServices.getUserDetails.mockResolvedValueOnce(aadUserDetails);
			UsersModel.getUserByEmail.mockRejectedValueOnce(templates.userNotFound);
			const mockCB = jest.fn();
			await Aad.verifyNewUserDetails(req, res, mockCB);
			expect(mockCB).toHaveBeenCalledTimes(1);
			expect(res.redirect).not.toHaveBeenCalled();
			expect(req.body).toEqual(
				{
					...JSON.parse(req.query.state),
					redirectUri: undefined,
					email: aadUserDetails.data.mail,
					firstName: aadUserDetails.data.givenName,
					lastName: aadUserDetails.data.surname,
					sso: { type: providers.AAD, id: aadUserDetails.data.id },
				},
			);
		});
	});
};

const testAuthenticate = () => {
	describe('Add PKCE codes and redirect to MS authentication page', () => {
		const redirectUri = generateRandomString();
		const res = { redirect: () => { } };

		test(`should respond with ${templates.invalidArguments.code} if req.query has no redirectUri`, async () => {
			const req = { query: {} };
			addPkceCodes(req);

			await Aad.authenticate(redirectUri)(req, res);
			expect(Sso.addPkceProtection).toHaveBeenCalledTimes(1);
			expect(Responder.respond).toHaveBeenCalledTimes(1);
			expect(Responder.respond).toHaveBeenCalledWith(req, res,
				createResponseCode(templates.invalidArguments, 'redirectUri(query string) is required'));
		});

		test(`should respond with ${templates.ssoNotAvailable.code} if getAuthenticationCodeUrl throws ${templates.ssoNotAvailable.code}`, async () => {
			const req = { query: { redirectUri: generateRandomString() } };
			addPkceCodes(req);
			AadServices.getAuthenticationCodeUrl.mockRejectedValueOnce(templates.ssoNotAvailable);

			await Aad.authenticate(redirectUri)(req, res);
			expect(Sso.addPkceProtection).toHaveBeenCalledTimes(1);
			expect(Responder.respond).toHaveBeenCalledTimes(1);
			expect(Responder.respond).toHaveBeenCalledWith(req, res,
				createResponseCode(templates.ssoNotAvailable));
		});

		test('should set authParams and reqirect to ms authentication page if req has no body', async () => {
			const req = { query: { redirectUri: generateRandomString() } };
			addPkceCodes(req);

			await Aad.authenticate(redirectUri)(req, res);
			expect(Sso.addPkceProtection).toHaveBeenCalledTimes(1);
			expect(Responder.respond).not.toHaveBeenCalled();
			expect(req.authParams).toEqual({
				redirectUri,
				state: JSON.stringify({ redirectUri: req.query.redirectUri }),
				codeChallenge: req.session.pkceCodes.challenge,
				codeChallengeMethod: req.session.pkceCodes.challengeMethod,
			});
		});

		test('should set authParams and reqirect to ms authentication page if req has body', async () => {
			const req = {
				query: { redirectUri: generateRandomString() },
				body: { username: generateRandomString() },
			};
			addPkceCodes(req);

			await Aad.authenticate(redirectUri)(req, res);
			expect(Sso.addPkceProtection).toHaveBeenCalledTimes(1);
			expect(Responder.respond).not.toHaveBeenCalled();
			expect(req.authParams).toEqual({
				redirectUri,
				state: JSON.stringify({ redirectUri: req.query.redirectUri, username: req.body.username }),
				codeChallenge: req.session.pkceCodes.challenge,
				codeChallengeMethod: req.session.pkceCodes.challengeMethod,
			});
		});
	});
};

const testRedirectToStateURL = () => {
	describe('Redirect to state url', () => {
		test('Res.redirect to have been called with the redirect url', () => {
			const redirectUri = generateRandomURL();
			const req = {
				query: { state: JSON.stringify({ redirectUri }) },
			};
			const res = {
				redirect: jest.fn(),
			};

			Aad.redirectToStateURL(req, res);

			expect(res.redirect).toHaveBeenCalledTimes(1);
			expect(res.redirect).toHaveBeenCalledWith(redirectUri);

			expect(Responder.respond).not.toHaveBeenCalled();
		});

		test('Responder should be called if something went wrong', () => {
			const res = {
				redirect: jest.fn(),
			};

			Aad.redirectToStateURL({}, res);

			expect(res.redirect).not.toHaveBeenCalled();

			expect(Responder.respond).toHaveBeenCalledTimes(1);
			expect(Responder.respond).toHaveBeenCalledWith({}, res, templates.unknown);
		});
	});
};

const testHasAssociatedAccount = () => {
	describe('Check if Microsoft account is linked to 3D repo', () => {
		const aadUserDetails = {
			data: {
				mail: 'example@email.com',
				givenName: generateRandomString(),
				surname: generateRandomString(),
				id: generateRandomString(),
			},
		};

		const redirectUri = generateRandomURL();
		const res = { redirect: jest.fn() };
		const req = {
			body:{},
			query: {
				code: generateRandomString(),
				state: JSON.stringify({ redirectUri }),
			},
			session: { pkceCodes: { verifier: generateRandomString() } },
		};
		const mockCB = jest.fn();

		test(`should respond with ${templates.unknown.code} if state is empty`, async () => {
			const reqWithNoState = { ...req, query: { code: generateRandomString() } };

			await Aad.testHasAssociatedAccount(reqWithNoState, res, mockCB);
			expect(mockCB).not.toHaveBeenCalled();
			expect(res.redirect).not.toHaveBeenCalled();
			expect(Responder.respond).toHaveBeenCalledTimes(1);
			expect(Responder.respond).toHaveBeenCalledWith(reqWithNoState, res, templates.unknown);
		});

		test(`should respond with ${templates.unknown.code} if getUserDetails fails`, async () => {
			AadServices.getUserDetails.mockRejectedValueOnce(new Error());
			await Aad.testHasAssociatedAccount(req, res, mockCB);
			expect(mockCB).not.toHaveBeenCalled();
			expect(res.redirect).not.toHaveBeenCalled();
			expect(Responder.respond).toHaveBeenCalledTimes(1);
			expect(Responder.respond).toHaveBeenCalledWith(req, res, templates.unknown);
		});

		test(`should redirect with ${errorCodes.userNotFound} if user does not exist`, async () => {
			AadServices.getUserDetails.mockResolvedValueOnce(aadUserDetails);
			UsersModel.getUserByEmail.mockRejectedValueOnce(templates.userNotFound);
			await Aad.testHasAssociatedAccount(req, res, mockCB);
			expect(mockCB).not.toHaveBeenCalled();
			expect(Responder.respond).not.toHaveBeenCalled();
			expect(res.redirect).toHaveBeenCalledTimes(1);
			expect(res.redirect).toHaveBeenCalledWith(`${redirectUri}?error=${errorCodes.userNotFound}`);
		});

		test(`should redirect with ${errorCodes.nonSsoUser} if user is a non SSO user`, async () => {
			AadServices.getUserDetails.mockResolvedValueOnce(aadUserDetails);
			UsersModel.getUserByEmail.mockResolvedValueOnce({ customData: { sso: { id: generateRandomString() } } });
			await Aad.testHasAssociatedAccount(req, res, mockCB);
			expect(mockCB).not.toHaveBeenCalled();
			expect(Responder.respond).not.toHaveBeenCalled();
			expect(res.redirect).toHaveBeenCalledTimes(1);
			expect(res.redirect).toHaveBeenCalledWith(`${redirectUri}?error=${errorCodes.nonSsoUser}`);
		});

		test('should set req loginData and call next if MS user is linked to 3D repo ', async () => {
			const user = generateRandomString();
			AadServices.getUserDetails.mockResolvedValueOnce(aadUserDetails);
			UsersModel.getUserByEmail.mockResolvedValueOnce({ customData: { sso: { id: aadUserDetails.data.id } }, user });			
			const loginData = { [generateRandomString()]: generateRandomString() };
			UsersModel.recordSuccessfulAuthAttempt.mockResolvedValueOnce(loginData);
			await Aad.testHasAssociatedAccount(req, res, mockCB);
			expect(mockCB).toHaveBeenCalledTimes(1);			
			expect(UsersModel.recordSuccessfulAuthAttempt).toHaveBeenCalledTimes(1);
			expect(UsersModel.recordSuccessfulAuthAttempt).toHaveBeenCalledWith(user);
			expect(Responder.respond).not.toHaveBeenCalled();
			expect(res.redirect).not.toHaveBeenCalled();
			expect(req.loginData).toEqual(loginData);
		});
	});
};

describe('middleware/sso/aad', () => {
	testVerifyNewUserDetails();
	testAuthenticate();
	testRedirectToStateURL();
	testHasAssociatedAccount();
});
