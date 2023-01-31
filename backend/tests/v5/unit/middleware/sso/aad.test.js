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
	describe('Get user MS details, check email availability and assign details to body', () => {
		const aadUserDetails = {
			email: 'example@email.com',
			firstName: generateRandomString(),
			lastName: generateRandomString(),
			id: generateRandomString(),
		};

		const redirectUri = generateRandomURL();
		const res = { redirect: jest.fn() };
		const getRequest = () => ({
			query: {
				code: generateRandomString(),
				state: JSON.stringify({ username: generateRandomString(), redirectUri }),
			},
			session: { pkceCodes: { verifier: generateRandomString() } },
		});

		test(`should respond ${templates.invalidArguments.code} if state is not valid JSON`, async () => {
			const req = getRequest();
			req.query.state = generateRandomString();
			const mockCB = jest.fn();
			await Aad.verifyNewUserDetails(req, res, mockCB);
			expect(mockCB).not.toHaveBeenCalled();
			expect(Responder.respond).toHaveBeenCalledTimes(1);
			expect(Responder.respond).toHaveBeenCalledWith(req, res, {
				...templates.invalidArguments, message: 'state(query string) is required and must be valid JSON',
			});
		});

		test(`should respond with error code ${errorCodes.UNKNOWN} if the user details cannot be fetched`, async () => {
			AadServices.getUserDetails.mockRejectedValueOnce(errorCodes.UNKNOWN);
			const mockCB = jest.fn();
			await Aad.verifyNewUserDetails(getRequest(), res, mockCB);
			expect(mockCB).not.toHaveBeenCalled();
			expect(res.redirect).toHaveBeenCalledTimes(1);
			expect(res.redirect).toHaveBeenCalledWith(`${redirectUri}?error=${errorCodes.UNKNOWN}`);
		});

		test(`should respond with error code ${errorCodes.EMAIL_EXISTS} if the email already exists`, async () => {
			AadServices.getUserDetails.mockResolvedValueOnce(aadUserDetails);
			UsersModel.getUserByEmail.mockResolvedValueOnce({ customData: {} });
			const mockCB = jest.fn();
			await Aad.verifyNewUserDetails(getRequest(), res, mockCB);
			expect(mockCB).not.toHaveBeenCalled();
			expect(res.redirect).toHaveBeenCalledTimes(1);
			expect(res.redirect).toHaveBeenCalledWith(`${redirectUri}?error=${errorCodes.EMAIL_EXISTS}`);
		});

		test(`should respond with error code ${errorCodes.EMAIL_EXISTS_WITH_SSO} if the email already exists (SSO user)`, async () => {
			AadServices.getUserDetails.mockResolvedValueOnce(aadUserDetails);
			UsersModel.getUserByEmail.mockResolvedValueOnce({ customData: { sso: { _id: generateRandomString() } } });
			const mockCB = jest.fn();
			await Aad.verifyNewUserDetails(getRequest(), res, mockCB);
			expect(mockCB).not.toHaveBeenCalled();
			expect(res.redirect).toHaveBeenCalledTimes(1);
			expect(res.redirect).toHaveBeenCalledWith(`${redirectUri}?error=${errorCodes.EMAIL_EXISTS_WITH_SSO}`);
		});

		test('should call next if email is available', async () => {
			AadServices.getUserDetails.mockResolvedValueOnce(aadUserDetails);
			UsersModel.getUserByEmail.mockRejectedValueOnce(templates.userNotFound);
			const mockCB = jest.fn();
			const req = getRequest();
			await Aad.verifyNewUserDetails(req, res, mockCB);
			const reqStateJson = JSON.parse(req.query.state);
			expect(mockCB).toHaveBeenCalledTimes(1);
			expect(res.redirect).not.toHaveBeenCalled();
			expect(req.body).toEqual(
				{
					...reqStateJson,
					redirectUri: undefined,
					email: aadUserDetails.email,
					firstName: aadUserDetails.firstName,
					lastName: aadUserDetails.lastName,
					sso: { type: providers.AAD, id: aadUserDetails.id },
				},
			);
			expect(req.state).toEqual(reqStateJson);
		});
	});
};

const testEmailNotUsed = () => {
	describe('Get user MS email, check email availability and assign email and SSO id to body', () => {
		const aadUserDetails = {
			email: 'example@email.com',
			id: generateRandomString(),
			firstName: generateRandomString(),
			lastName: generateRandomString(),
		};
		const redirectUri = generateRandomURL();
		const res = { redirect: jest.fn() };

		const getRequest = () => ({
			query: {
				code: generateRandomString(),
				state: JSON.stringify({ username: generateRandomString(), redirectUri }),
			},
			session: { pkceCodes: { verifier: generateRandomString() } },
		});

		test(`should respond ${templates.invalidArguments.code} if state is not valid JSON`, async () => {
			const mockCB = jest.fn();
			const req = getRequest();
			req.query.state = generateRandomString();

			await Aad.emailNotUsed(req, res, mockCB);
			expect(mockCB).not.toHaveBeenCalled();
			expect(Responder.respond).toHaveBeenCalledTimes(1);
			expect(Responder.respond).toHaveBeenCalledWith(req, res, {
				...templates.invalidArguments, message: 'state(query string) is required and must be valid JSON',
			});
		});

		test(`should respond with error code ${errorCodes.UNKNOWN} if the user details cannot be fetched`, async () => {
			AadServices.getUserDetails.mockRejectedValueOnce(errorCodes.UNKNOWN);
			const mockCB = jest.fn();
			await Aad.emailNotUsed(getRequest(), res, mockCB);
			expect(mockCB).not.toHaveBeenCalled();
			expect(res.redirect).toHaveBeenCalledTimes(1);
			expect(res.redirect).toHaveBeenCalledWith(`${redirectUri}?error=${errorCodes.UNKNOWN}`);
		});

		test(`should respond with error code ${errorCodes.UNKNOWN} if the user details cannot be fetched`, async () => {
			AadServices.getUserDetails.mockRejectedValueOnce(errorCodes.UNKNOWN);
			const mockCB = jest.fn();
			await Aad.emailNotUsed(getRequest(), res, mockCB);
			expect(mockCB).not.toHaveBeenCalled();
			expect(res.redirect).toHaveBeenCalledTimes(1);
			expect(res.redirect).toHaveBeenCalledWith(`${redirectUri}?error=${errorCodes.UNKNOWN}`);
		});

		test(`should respond with error code ${errorCodes.EMAIL_EXISTS} if the email already exists by another user`, async () => {
			AadServices.getUserDetails.mockResolvedValueOnce(aadUserDetails);
			UsersModel.getUserByQuery.mockResolvedValueOnce({ customData: {} });
			const mockCB = jest.fn();
			await Aad.emailNotUsed(getRequest(), res, mockCB);
			expect(mockCB).not.toHaveBeenCalled();
			expect(res.redirect).toHaveBeenCalledTimes(1);
			expect(res.redirect).toHaveBeenCalledWith(`${redirectUri}?error=${errorCodes.EMAIL_EXISTS}`);
		});

		test('should call next if email is available', async () => {
			AadServices.getUserDetails.mockResolvedValueOnce(aadUserDetails);
			UsersModel.getUserByQuery.mockRejectedValueOnce(templates.userNotFound);
			const mockCB = jest.fn();
			const req = getRequest();
			await Aad.emailNotUsed(req, res, mockCB);
			expect(mockCB).toHaveBeenCalledTimes(1);
			expect(res.redirect).not.toHaveBeenCalled();
			expect(req.body).toEqual(
				{
					email: aadUserDetails.email,
					sso: { type: providers.AAD, id: aadUserDetails.id },
					firstName: aadUserDetails.firstName,
					lastName: aadUserDetails.lastName,
				},
			);
		});
	});
};

const testAuthenticate = () => {
	describe('Authenticate', () => {
		const redirectUri = generateRandomString();
		const res = { redirect: () => { } };

		test(`should respond with ${templates.invalidArguments.code} if req.query has no redirectUri`, async () => {
			const req = { query: {}, headers: {} };
			addPkceCodes(req);

			await Aad.authenticate(redirectUri)(req, res);
			expect(Sso.addPkceProtection).toHaveBeenCalledTimes(1);
			expect(Responder.respond).toHaveBeenCalledTimes(1);
			expect(Responder.respond).toHaveBeenCalledWith(req, res,
				createResponseCode(templates.invalidArguments, 'redirectUri(query string) is required'));
		});

		test(`should respond with ${templates.ssoNotAvailable.code} if getAuthenticationCodeUrl throws ${templates.ssoNotAvailable.code}`, async () => {
			const req = { query: { redirectUri: generateRandomString() }, headers: {} };
			addPkceCodes(req);
			AadServices.getAuthenticationCodeUrl.mockRejectedValueOnce(templates.ssoNotAvailable);

			await Aad.authenticate(redirectUri)(req, res);
			expect(Sso.addPkceProtection).toHaveBeenCalledTimes(1);
			expect(Responder.respond).toHaveBeenCalledTimes(1);
			expect(Responder.respond).toHaveBeenCalledWith(req, res,
				createResponseCode(templates.ssoNotAvailable));
		});

		test('should set authParams and respond with a link if req has no body', async () => {
			const req = { query: { redirectUri: generateRandomString() }, headers: {} };
			addPkceCodes(req);

			const authURL = generateRandomURL();
			AadServices.getAuthenticationCodeUrl.mockResolvedValueOnce(authURL);

			await Aad.authenticate(redirectUri)(req, res);
			expect(Sso.addPkceProtection).toHaveBeenCalledTimes(1);
			expect(AadServices.getAuthenticationCodeUrl).toHaveBeenCalledTimes(1);
			expect(Responder.respond).toHaveBeenCalledTimes(1);
			expect(Responder.respond).toHaveBeenCalledWith(req, res, templates.ok, { link: authURL });
			expect(req.authParams).toEqual({
				redirectUri,
				state: JSON.stringify({ redirectUri: req.query.redirectUri }),
				codeChallenge: req.session.pkceCodes.challenge,
				codeChallengeMethod: req.session.pkceCodes.challengeMethod,
			});
		});

		test('should set authParams and respond with a link if req has body', async () => {
			const req = {
				query: { redirectUri: generateRandomString() },
				body: { username: generateRandomString() },
				headers: {},
			};
			addPkceCodes(req);

			const authURL = generateRandomURL();
			AadServices.getAuthenticationCodeUrl.mockResolvedValueOnce(authURL);

			await Aad.authenticate(redirectUri)(req, res);
			expect(Sso.addPkceProtection).toHaveBeenCalledTimes(1);
			expect(AadServices.getAuthenticationCodeUrl).toHaveBeenCalledTimes(1);
			expect(Responder.respond).toHaveBeenCalledTimes(1);
			expect(Responder.respond).toHaveBeenCalledWith(req, res, templates.ok, { link: authURL });
			expect(req.authParams).toEqual({
				redirectUri,
				state: JSON.stringify({ redirectUri: req.query.redirectUri, username: req.body.username }),
				codeChallenge: req.session.pkceCodes.challenge,
				codeChallengeMethod: req.session.pkceCodes.challengeMethod,
			});
		});

		test('should set authParams, set session referer and respond with a link if req headers have referer', async () => {
			const referer = generateRandomString();
			const req = {
				query: { redirectUri: generateRandomString() },
				body: { username: generateRandomString() },
				headers: { referer },
			};
			addPkceCodes(req);

			await Aad.authenticate(redirectUri)(req, res);
			expect(Sso.addPkceProtection).toHaveBeenCalledTimes(1);
			expect(Responder.respond).toHaveBeenCalledTimes(1);
			expect(Responder.respond).toHaveBeenCalledWith(req, res, templates.ok, expect.anything());
			expect(Responder.respond.mock.calls[0][3]).toHaveProperty('link');
			expect(req.authParams).toEqual({
				redirectUri,
				state: JSON.stringify({ redirectUri: req.query.redirectUri, username: req.body.username }),
				codeChallenge: req.session.pkceCodes.challenge,
				codeChallengeMethod: req.session.pkceCodes.challengeMethod,
			});
			expect(req.session.referer).toEqual(referer);
		});
	});
};

const testHasAssociatedAccount = () => {
	describe('Check if Microsoft account is linked to 3D repo', () => {
		const aadUserDetails = {
			email: 'example@email.com',
			firstName: generateRandomString(),
			lastName: generateRandomString(),
			id: generateRandomString(),
		};

		const redirectUri = generateRandomURL();
		const res = { redirect: jest.fn() };

		const getRequest = () => ({
			body: {},
			query: {
				code: generateRandomString(),
				state: JSON.stringify({ redirectUri }),
			},
			session: { pkceCodes: { verifier: generateRandomString() } },
		});

		const mockCB = jest.fn();

		test(`should respond with ${templates.invalidArguments.code} if state is not valid JSON`, async () => {
			const req = getRequest();
			req.query.state = generateRandomString();
			await Aad.hasAssociatedAccount(req, res, mockCB);
			expect(mockCB).not.toHaveBeenCalled();
			expect(Responder.respond).toHaveBeenCalledTimes(1);
			expect(Responder.respond).toHaveBeenCalledWith(req, res, {
				...templates.invalidArguments, message: 'state(query string) is required and must be valid JSON',
			});
		});

		test(`should respond with error code ${errorCodes.UNKNOWN} if getUserDetails fails`, async () => {
			AadServices.getUserDetails.mockRejectedValueOnce(errorCodes.UNKNOWN);
			await Aad.hasAssociatedAccount(getRequest(), res, mockCB);
			expect(mockCB).not.toHaveBeenCalled();
			expect(Responder.respond).not.toHaveBeenCalled();
			expect(res.redirect).toHaveBeenCalledTimes(1);
			expect(res.redirect).toHaveBeenCalledWith(`${redirectUri}?error=${errorCodes.UNKNOWN}`);
		});

		test(`should redirect with error code ${errorCodes.USER_NOT_FOUND} if user does not exist`, async () => {
			AadServices.getUserDetails.mockResolvedValueOnce(aadUserDetails);
			UsersModel.getUserByEmail.mockRejectedValueOnce(templates.userNotFound);
			await Aad.hasAssociatedAccount(getRequest(), res, mockCB);
			expect(mockCB).not.toHaveBeenCalled();
			expect(Responder.respond).not.toHaveBeenCalled();
			expect(res.redirect).toHaveBeenCalledTimes(1);
			expect(res.redirect).toHaveBeenCalledWith(`${redirectUri}?error=${errorCodes.USER_NOT_FOUND}`);
		});

		test(`should redirect with error code ${errorCodes.NON_SSO_USER} if user is a non SSO user`, async () => {
			AadServices.getUserDetails.mockResolvedValueOnce(aadUserDetails);
			UsersModel.getUserByEmail.mockResolvedValueOnce({ customData: { sso: { id: generateRandomString() } } });
			await Aad.hasAssociatedAccount(getRequest(), res, mockCB);
			expect(mockCB).not.toHaveBeenCalled();
			expect(Responder.respond).not.toHaveBeenCalled();
			expect(res.redirect).toHaveBeenCalledTimes(1);
			expect(res.redirect).toHaveBeenCalledWith(`${redirectUri}?error=${errorCodes.NON_SSO_USER}`);
		});

		test('should set req session and call next if MS user is linked to 3D repo ', async () => {
			const user = generateRandomString();
			AadServices.getUserDetails.mockResolvedValueOnce(aadUserDetails);
			UsersModel.getUserByEmail.mockResolvedValueOnce({ customData: { sso: { id: aadUserDetails.id } },
				user });
			const req = getRequest();
			await Aad.hasAssociatedAccount(req, res, mockCB);
			expect(mockCB).toHaveBeenCalledTimes(1);
			expect(req.loginData).toEqual({ username: user });
			expect(Responder.respond).not.toHaveBeenCalled();
			expect(res.redirect).not.toHaveBeenCalled();
		});
	});
};

const testRedirectToStateURL = () => {
	describe('Redirect to state url', () => {
		test('should call res.redirect with the redirect url', () => {
			const redirectUri = generateRandomURL();
			const req = { state: { redirectUri } };
			const res = { redirect: jest.fn() };

			Aad.redirectToStateURL(req, res);

			expect(res.redirect).toHaveBeenCalledTimes(1);
			expect(res.redirect).toHaveBeenCalledWith(redirectUri);

			expect(Responder.respond).not.toHaveBeenCalled();
		});

		test(`should respond with ${templates.unknown.code} if something went wrong in redirection`, () => {
			const req = { state: { redirectUri: generateRandomURL() } };
			const res = { redirect: () => { throw templates.unknown; } };

			Aad.redirectToStateURL(req, res);

			expect(Responder.respond).toHaveBeenCalledTimes(1);
			expect(Responder.respond).toHaveBeenCalledWith(req, res, templates.unknown);
		});
	});
};

describe('middleware/sso/aad', () => {
	testVerifyNewUserDetails();
	testEmailNotUsed();
	testAuthenticate();
	testHasAssociatedAccount();
	testRedirectToStateURL();
});
