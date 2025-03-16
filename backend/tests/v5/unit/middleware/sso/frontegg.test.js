/**
 *  Copyright (C) 2025 3D Repo Ltd
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

const { cloneDeep } = require('lodash');
const { src } = require('../../../helper/path');
const { determineTestGroup, generateRandomString, generateRandomObject } = require('../../../helper/services');

const { errorCodes } = require(`${src}/services/sso/sso.constants`);

const { toBase64 } = require(`${src}/utils/helper/strings`);

// This prevents the session service from triggering a mongo service.
jest.mock('../../../../../src/v5/handler/db');

jest.mock('../../../../../src/v5/middleware/sso/pkce');
const PKCEMiddleware = require(`${src}/middleware/sso/pkce`);

jest.mock('../../../../../src/v5/models/users');
const UserModel = require(`${src}/models/users`);

jest.mock('../../../../../src/v5/processors/users');
const UserProcessor = require(`${src}/processors/users`);

jest.mock('../../../../../src/v5/middleware/sso');
const SSOMiddleware = require(`${src}/middleware/sso`);

jest.mock('../../../../../src/v5/models/teamspaceSettings');
const TeamspaceModel = require(`${src}/models/teamspaceSettings`);

jest.mock('../../../../../src/v5/utils/responder');
const Responder = require(`${src}/utils/responder`);

jest.mock('../../../../../src/v5/utils/sessions');
const SessionsUtils = require(`${src}/utils/sessions`);

jest.mock('../../../../../src/v5/services/sso/frontegg');
const FronteggService = require(`${src}/services/sso/frontegg`);

const { templates, createResponseCode } = require(`${src}/utils/responseCodes`);

const Frontegg = require(`${src}/middleware/sso/frontegg`);

const testRedirectToStateURL = () => {
	describe('Redirect to state URL', () => {
		test('should call redirect on the response to the url within the state', async () => {
			const redirectUri = generateRandomString();

			const req = { state: { redirectUri } };
			const res = { redirect: jest.fn() };

			await Frontegg.redirectToStateURL(req, res);

			expect(res.redirect).toHaveBeenCalledTimes(1);
			expect(res.redirect).toHaveBeenCalledWith(redirectUri);

			expect(Responder.respond).not.toHaveBeenCalled();
		});
		test('should respond with unknown error if unexpected error has occured', async () => {
			const res = { redirect: jest.fn() };

			await Frontegg.redirectToStateURL(undefined, res);

			expect(res.redirect).not.toHaveBeenCalled();
			expect(Responder.respond).toHaveBeenCalledTimes(1);
			expect(Responder.respond).toHaveBeenCalledWith(undefined, res, templates.unknown);
		});
	});
};

const testGenerateLinkToAuthenticator = () => {
	PKCEMiddleware.addPkceProtection.mockImplementation((req, res, next) => next());
	SSOMiddleware.setSessionInfo.mockImplementation((req, res, next) => next());
	const authLink = generateRandomString();
	const ssoPostRedirect = generateRandomString();
	const redirectUri = generateRandomString();
	FronteggService.generateAuthenticationCodeUrl.mockResolvedValue(authLink);
	const reqSample = {
		query: { redirectUri },
		params: {},
		session: {
			pkceCodes: { challenge: generateRandomString() },
			csrfToken: generateRandomString(),
		},
	};
	describe('Generate link to authentication', () => {
		test(`Should return with ${templates.invalidArguments.code} if redirectUri is not provided`, async () => {
			const req = cloneDeep(reqSample);
			req.query = {};
			const res = {};
			await Frontegg.generateLinkToAuthenticator(ssoPostRedirect)(req, res);

			expect(Responder.respond).toHaveBeenCalledTimes(1);
			expect(Responder.respond).toHaveBeenCalledWith(req, res,
				createResponseCode(templates.invalidArguments, 'redirectUri(query string) is required'));
		});

		test('Should fail with whatever error catch if the catch function is triggered', async () => {
			const req = cloneDeep(reqSample);
			const res = {};

			const errMessage = generateRandomString();

			FronteggService.generateAuthenticationCodeUrl.mockRejectedValueOnce(errMessage);

			await Frontegg.generateLinkToAuthenticator(ssoPostRedirect)(req, res);

			expect(Responder.respond).toHaveBeenCalledTimes(1);
			expect(Responder.respond).toHaveBeenCalledWith(req, res, errMessage);
		});

		test('Should respond with a link', async () => {
			const req = cloneDeep(reqSample);
			const res = {};

			await Frontegg.generateLinkToAuthenticator(ssoPostRedirect)(req, res);

			expect(Responder.respond).toHaveBeenCalledTimes(1);
			expect(Responder.respond).toHaveBeenCalledWith(req, res, templates.ok, { link: expect.any(String) });

			expect(req.session.reAuth).not.toBeTruthy();

			const authParams = {
				redirectURL: ssoPostRedirect,
				state: toBase64(JSON.stringify({
					csrfToken: req.session.csrfToken,
					redirectUri: req.query.redirectUri,
				})),
				codeChallenge: req.session.pkceCodes.challenge,
			};

			expect(FronteggService.generateAuthenticationCodeUrl).toHaveBeenCalledTimes(1);
			expect(FronteggService.generateAuthenticationCodeUrl).toHaveBeenCalledWith(authParams, undefined);
		});
	});
};

const testGenerateLinkToTeamspaceAuthenticator = () => {
	describe('Generate link to authenticate against a teamspace', () => {
		const ssoPostRedirect = generateRandomString();
		test('Should flag reAuth if teamspace is provided', async () => {
			const teamspace = generateRandomString();
			const accountId = generateRandomString();
			const redirectUri = generateRandomString();
			const req = {
				query: { redirectUri },
				session: {
					pkceCodes: { challenge: generateRandomString() },
					csrfToken: generateRandomString(),
				},
				params: { teamspace } };
			const res = {};

			TeamspaceModel.getTeamspaceRefId.mockResolvedValueOnce(accountId);

			await Frontegg.generateLinkToTeamspaceAuthenticator(ssoPostRedirect)(req, res);

			expect(Responder.respond).toHaveBeenCalledTimes(1);
			expect(Responder.respond).toHaveBeenCalledWith(req, res, templates.ok, { link: expect.any(String) });

			expect(req.session.reAuth).toBeTruthy();

			const authParams = {
				redirectURL: ssoPostRedirect,
				state: toBase64(JSON.stringify({
					csrfToken: req.session.csrfToken,
					redirectUri: req.query.redirectUri,
				})),
				codeChallenge: req.session.pkceCodes.challenge,
			};

			expect(TeamspaceModel.getTeamspaceRefId).toHaveBeenCalledTimes(1);
			expect(TeamspaceModel.getTeamspaceRefId).toHaveBeenCalledWith(teamspace);

			expect(FronteggService.generateAuthenticationCodeUrl).toHaveBeenCalledTimes(1);
			expect(FronteggService.generateAuthenticationCodeUrl).toHaveBeenCalledWith(authParams, accountId);

			expect(PKCEMiddleware.addPkceProtection).not.toHaveBeenCalled();
			expect(SSOMiddleware.setSessionInfo).not.toHaveBeenCalled();
		});
	});
};

const testGenerateToken = () => {
	const redirectURLUsed = generateRandomString();
	const redirectUri = generateRandomString();
	const csrfToken = generateRandomString();
	const sampleReq = {
		query: {
			code: generateRandomString(),
			state: toBase64(JSON.stringify({
				csrfToken,
				redirectUri,
			})),
		},
		session: { csrfToken, pkceCodes: { challenge: generateRandomString() } },
	};
	describe('Generate token', () => {
		const missingQueryResponse = createResponseCode(templates.invalidArguments, 'Response body does not contain code or state');

		beforeEach(() => {
			jest.resetAllMocks();
		});

		describe.each([
			['query.state does not exist', { ...sampleReq, query: { code: generateRandomString() } }, missingQueryResponse],
			['query.code does not exist', { ...sampleReq, query: { state: generateRandomString() } }, missingQueryResponse],
			['state is not JSON parsable', { ...sampleReq, query: { ...sampleReq.query, state: generateRandomString() } },
				createResponseCode(templates.invalidArguments, 'state is required and must be a valid encoded JSON')],
			['csrfToken does not match', { ...sampleReq, session: { csrfToken: generateRandomString() } },
				createResponseCode(templates.invalidArguments, 'CSRF Token mismatched. Please clear your cookies and try again')],
		])('Check state is valid', (desc, request, expectedResponse) => {
			test(`Should respond with ${expectedResponse.code} if ${desc}`, async () => {
				SessionsUtils.destroySession.mockImplementationOnce((sess, res, callback) => callback());
				const res = {};
				const next = jest.fn();

				const req = cloneDeep(request);

				await Frontegg.generateToken(redirectURLUsed)(req, res, next);

				expect(next).not.toHaveBeenCalled();

				expect(Responder.respond).toHaveBeenCalledTimes(1);
				expect(Responder.respond).toHaveBeenCalledWith(req, res, expectedResponse);

				expect(SessionsUtils.destroySession).toHaveBeenCalledTimes(1);
				expect(SessionsUtils.destroySession).toHaveBeenCalledWith(req.session, res, expect.anything());
			});
		});

		test('Should call redirectWithError if it failed to generate a token', async () => {
			FronteggService.generateToken.mockRejectedValueOnce({ message: generateRandomString() });
			const res = {};
			const next = jest.fn();

			const req = cloneDeep(sampleReq);

			await Frontegg.generateToken(redirectURLUsed)(req, res, next);

			expect(next).not.toHaveBeenCalled();
			expect(Responder.respond).not.toHaveBeenCalled();

			expect(FronteggService.generateToken).toHaveBeenCalledTimes(1);
			expect(FronteggService.generateToken).toHaveBeenCalledWith(redirectURLUsed, req.query.code,
				req.session.pkceCodes.challenge);

			expect(SSOMiddleware.redirectWithError).toHaveBeenCalledTimes(1);
			expect(SSOMiddleware.redirectWithError).toHaveBeenCalledWith(res, redirectUri, errorCodes.UNKNOWN);
		});

		test('Should call redirectWithError if it failed to get user details', async () => {
			FronteggService.getUserInfoFromToken.mockRejectedValueOnce({ message: generateRandomString() });
			const res = {};
			const next = jest.fn();

			const req = cloneDeep(sampleReq);
			req.auth = { tokenInfo: {
				token: generateRandomString(),
			} };

			await Frontegg.generateToken(redirectURLUsed)(req, res, next);

			expect(next).not.toHaveBeenCalled();
			expect(Responder.respond).not.toHaveBeenCalled();

			expect(FronteggService.generateToken).toHaveBeenCalledTimes(1);
			expect(FronteggService.generateToken).toHaveBeenCalledWith(redirectURLUsed, req.query.code,
				req.session.pkceCodes.challenge);

			expect(SSOMiddleware.redirectWithError).toHaveBeenCalledTimes(1);
			expect(SSOMiddleware.redirectWithError).toHaveBeenCalledWith(res, redirectUri, errorCodes.UNKNOWN);
		});

		test('Should call next() if everything ran successfully', async () => {
			const authAccount = generateRandomString();
			const authTS = generateRandomString();
			const otherTS = generateRandomString();
			const username = generateRandomString();
			const userInfo = {
				userId: generateRandomString(),
				email: generateRandomString(),
				authAccount,
				accounts: [authAccount, generateRandomString()],
			};
			const tokenInfo = {
				token: generateRandomString(),
			};

			FronteggService.generateToken.mockResolvedValueOnce(tokenInfo);
			FronteggService.getUserInfoFromToken.mockResolvedValueOnce(userInfo);
			FronteggService.getTeamspaceByAccount.mockImplementation(
				(account) => Promise.resolve(account === authAccount ? authTS : otherTS));

			UserModel.getUserByEmail.mockResolvedValueOnce({ user: username, customData: { userId: userInfo.userId } });

			const res = {};
			const next = jest.fn();

			const req = cloneDeep(sampleReq);
			req.auth = { tokenInfo: {
				token: generateRandomString(),
			} };

			await Frontegg.generateToken(redirectURLUsed)(req, res, next);

			expect(next).toHaveBeenCalled();
			expect(Responder.respond).not.toHaveBeenCalled();
			expect(SSOMiddleware.redirectWithError).not.toHaveBeenCalled();

			expect(req.loginData).toEqual({
				auth: {
					userId: userInfo.userId,
					teamspaces: expect.arrayContaining([authTS, otherTS]),
					authenticatedTeamspace: authTS,
					tokenInfo,
				},
				username,

			});
		});
		test('Should filter out accountIds that has no matching teamspace', async () => {
			const authAccount = generateRandomString();
			const otherTS = generateRandomString();
			const username = generateRandomString();
			const userInfo = {
				userId: generateRandomString(),
				email: generateRandomString(),
				authAccount,
				accounts: [authAccount, generateRandomString()],
			};
			const tokenInfo = {
				token: generateRandomString(),
			};

			FronteggService.generateToken.mockResolvedValueOnce(tokenInfo);
			FronteggService.getUserInfoFromToken.mockResolvedValueOnce(userInfo);
			FronteggService.getTeamspaceByAccount.mockImplementation(
				(account) => Promise.resolve(account === authAccount ? undefined : otherTS));

			UserModel.getUserByEmail.mockResolvedValueOnce({ user: username, customData: { userId: userInfo.userId } });

			const res = {};
			const next = jest.fn();

			const req = cloneDeep(sampleReq);
			req.auth = { tokenInfo: {
				token: generateRandomString(),
			} };

			await Frontegg.generateToken(redirectURLUsed)(req, res, next);

			expect(next).toHaveBeenCalled();
			expect(Responder.respond).not.toHaveBeenCalled();
			expect(SSOMiddleware.redirectWithError).not.toHaveBeenCalled();

			expect(req.loginData).toEqual({
				auth: {
					userId: userInfo.userId,
					teamspaces: expect.arrayContaining([otherTS]),
					authenticatedTeamspace: undefined,
					tokenInfo,
				},
				username,

			});
		});

		test('Should update the userId if it is not stored in mongo', async () => {
			const authAccount = generateRandomString();
			const otherTS = generateRandomString();
			const authTS = generateRandomString();
			const username = generateRandomString();
			const userInfo = {
				userId: generateRandomString(),
				email: generateRandomString(),
				authAccount,
				accounts: [authAccount, generateRandomString()],
			};
			const tokenInfo = {
				token: generateRandomString(),
			};

			FronteggService.generateToken.mockResolvedValueOnce(tokenInfo);
			FronteggService.getUserInfoFromToken.mockResolvedValueOnce(userInfo);
			FronteggService.getTeamspaceByAccount.mockImplementation(
				(account) => Promise.resolve(account === authAccount ? authTS : otherTS));

			UserModel.getUserByEmail.mockResolvedValueOnce({ user: username,
				customData: { userId: generateRandomString() } });

			const res = {};
			const next = jest.fn();

			const req = cloneDeep(sampleReq);
			req.auth = { tokenInfo: {
				token: generateRandomString(),
			} };

			await Frontegg.generateToken(redirectURLUsed)(req, res, next);

			expect(next).toHaveBeenCalled();
			expect(Responder.respond).not.toHaveBeenCalled();
			expect(SSOMiddleware.redirectWithError).not.toHaveBeenCalled();

			expect(req.loginData).toEqual({
				auth: {
					userId: userInfo.userId,
					teamspaces: expect.arrayContaining([authTS, otherTS]),
					authenticatedTeamspace: authTS,
					tokenInfo,
				},
				username,

			});

			expect(UserModel.updateUserId).toHaveBeenCalledTimes(1);
			expect(UserModel.updateUserId).toHaveBeenCalledWith(username, userInfo.userId);
		});
		test('Should create a new user record it is not stored in mongo', async () => {
			const authAccount = generateRandomString();
			const otherTS = generateRandomString();
			const authTS = generateRandomString();
			const username = generateRandomString();
			const userInfo = {
				userId: generateRandomString(),
				email: generateRandomString(),
				authAccount,
				accounts: [authAccount, generateRandomString()],
			};
			const tokenInfo = {
				token: generateRandomString(),
			};

			const userData = generateRandomObject();

			FronteggService.getUserById.mockResolvedValueOnce(userData);
			FronteggService.generateToken.mockResolvedValueOnce(tokenInfo);
			FronteggService.getUserInfoFromToken.mockResolvedValueOnce(userInfo);
			FronteggService.getTeamspaceByAccount.mockImplementation(
				(account) => Promise.resolve(account === authAccount ? authTS : otherTS));

			UserProcessor.createNewUserRecord.mockResolvedValueOnce(username);

			UserModel.getUserByEmail.mockRejectedValueOnce(templates.userNotFound);

			const res = {};
			const next = jest.fn();

			const req = cloneDeep(sampleReq);
			req.auth = { tokenInfo: {
				token: generateRandomString(),
			} };

			await Frontegg.generateToken(redirectURLUsed)(req, res, next);

			expect(next).toHaveBeenCalled();
			expect(Responder.respond).not.toHaveBeenCalled();
			expect(SSOMiddleware.redirectWithError).not.toHaveBeenCalled();

			expect(req.loginData).toEqual({
				auth: {
					userId: userInfo.userId,
					teamspaces: expect.arrayContaining([authTS, otherTS]),
					authenticatedTeamspace: authTS,
					tokenInfo,
				},
				username,

			});

			expect(FronteggService.getUserById).toHaveBeenCalledTimes(1);
			expect(FronteggService.getUserById).toHaveBeenCalledWith(userInfo.userId);

			expect(UserProcessor.createNewUserRecord).toHaveBeenCalledTimes(1);
			expect(UserProcessor.createNewUserRecord).toHaveBeenCalledWith(userData);
		});

		test('Should redirect with error if determineUsername threw an unexpected error', async () => {
			const authAccount = generateRandomString();
			const username = generateRandomString();
			const userInfo = {
				userId: generateRandomString(),
				email: generateRandomString(),
				authAccount,
				accounts: [authAccount, generateRandomString()],
			};
			const tokenInfo = {
				token: generateRandomString(),
			};

			const userData = generateRandomObject();

			FronteggService.getUserById.mockResolvedValueOnce(userData);
			FronteggService.generateToken.mockResolvedValueOnce(tokenInfo);
			FronteggService.getUserInfoFromToken.mockResolvedValueOnce(userInfo);

			UserProcessor.createNewUserRecord.mockResolvedValueOnce(username);

			UserModel.getUserByEmail.mockRejectedValueOnce(templates.unknown);

			const res = {};
			const next = jest.fn();

			const req = cloneDeep(sampleReq);
			req.auth = { tokenInfo: {
				token: generateRandomString(),
			} };

			await Frontegg.generateToken(redirectURLUsed)(req, res, next);

			expect(next).not.toHaveBeenCalled();
			expect(Responder.respond).not.toHaveBeenCalled();
			expect(SSOMiddleware.redirectWithError).toHaveBeenCalledTimes(1);
			expect(SSOMiddleware.redirectWithError).toHaveBeenCalledWith(res, redirectUri, errorCodes.UNKNOWN);
		});
	});
};

describe(determineTestGroup(__filename), () => {
	testRedirectToStateURL();
	testGenerateLinkToAuthenticator();
	testGenerateLinkToTeamspaceAuthenticator();
	testGenerateToken();
});
