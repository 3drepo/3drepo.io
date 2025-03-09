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
const { determineTestGroup, generateRandomString } = require('../../../helper/services');

const { toBase64 } = require(`${src}/utils/helper/strings`);

// This prevents the session service from trigger a mongo service.
jest.mock('../../../../../src/v5/handler/db');

jest.mock('../../../../../src/v5/middleware/sso/pkce');
const PKCEMiddleware = require(`${src}/middleware/sso/pkce`);

jest.mock('../../../../../src/v5/middleware/sso');
const SSOMiddleware = require(`${src}/middleware/sso`);

jest.mock('../../../../../src/v5/models/teamspaceSettings');
const TeamspaceModel = require(`${src}/models/teamspaceSettings`);

jest.mock('../../../../../src/v5/utils/responder');
const Responder = require(`${src}/utils/responder`);

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

		test('Should flag reAuth if teamspace is provided', async () => {
			const teamspace = generateRandomString();
			const accountId = generateRandomString();
			const req = { ...cloneDeep(reqSample), params: { teamspace } };
			const res = {};

			TeamspaceModel.getTeamspaceRefId.mockResolvedValueOnce(accountId);

			await Frontegg.generateLinkToAuthenticator(ssoPostRedirect)(req, res);

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
		});
	});
};

describe(determineTestGroup(__filename), () => {
	testRedirectToStateURL();
	testGenerateLinkToAuthenticator();
});
