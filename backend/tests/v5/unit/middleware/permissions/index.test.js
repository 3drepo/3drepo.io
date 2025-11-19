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

const { src } = require('../../../helper/path');

const { BYPASS_AUTH } = require(`${src}/utils/config.constants`);
jest.mock('../../../../../src/v5/utils/responder');
const Responder = require(`${src}/utils/responder`);
const { templates } = require(`${src}/utils/responseCodes`);

jest.mock('../../../../../src/v5/middleware/auth');
const Sessions = require(`${src}/middleware/auth`);

jest.mock('../../../../../src/v5/middleware/permissions/components/teamspaces');
const TSPermMiddleware = require(`${src}/middleware/permissions/components/teamspaces`);

const PermMiddlewares = require(`${src}/middleware/permissions`);
const { determineTestGroup, generateRandomString } = require('../../../helper/services');

const authenticatedTeamspace = generateRandomString();

// Mock respond function to just return the resCode
Responder.respond.mockImplementation((req, res, errCode) => errCode);

Sessions.validSession.mockImplementation(async (req, res, next) => {
	if (req.app.get(BYPASS_AUTH) || req.session) await next();
	else Responder.respond(req, res, templates.notLoggedIn);
});
const app = { get: () => false };
const ipAddress = generateRandomString();
const reqSample = { ips: [ipAddress],
	params: { teamspace: authenticatedTeamspace },
	headers: { referer: 'http://abc.com/' },
	session: { ipAddress, user: { auth: { authenticatedTeamspace }, username: 'hi', referer: 'http://abc.com' } },
	app,
};

const testHasAccessToTeamspace = () => {
	describe.each([
		['user has access', reqSample, true, true],
		['user does not have access', reqSample, false, false, templates.teamspaceNotFound],
		['session is invalid', { ...reqSample, session: undefined }, undefined, false, templates.notLoggedIn],
		['auth bypass is enabled', { ...reqSample, session: undefined, app: { get: () => true } }, true, true],
		['user is not authenticated to the teamspace', { ...reqSample, session: { ...reqSample.session, user: { ...reqSample.session.user, auth: { authenticatedTeamspace: generateRandomString() } } } }, true, false, templates.notAuthenticatedAgainstTeamspace],
		['user is using API Key', { ...reqSample, session: { ...reqSample.session, user: { isAPIKey: true, ...reqSample.session.user, auth: undefined } } }, true, true],
	])('Has access to teamspace', (desc, req, isMember, success, expectedErr) => {
		test(`Should ${success ? 'succeed' : 'fail'} if ${desc}`, async () => {
			const mockCB = jest.fn(() => {});
			const res = {};
			if (isMember !== undefined) {
				TSPermMiddleware.isTeamspaceMember.mockImplementationOnce(async (r, s, next) => {
					if (isMember) await next();
					else Responder.respond(r, s, templates.teamspaceNotFound);
				});
			}

			await PermMiddlewares.hasAccessToTeamspace(
				req,
				{},
				mockCB,
			);

			if (isMember === undefined) {
				expect(TSPermMiddleware.isTeamspaceMember).not.toHaveBeenCalled();
			} else {
				expect(TSPermMiddleware.isTeamspaceMember).toHaveBeenCalledTimes(1);
			}

			if (success) expect(mockCB).toHaveBeenCalledTimes(1);
			else {
				expect(mockCB).not.toHaveBeenCalled();
				expect(Responder.respond).toHaveBeenCalledTimes(1);
				expect(Responder.respond).toHaveBeenCalledWith(req, res, expectedErr);
			}
		});
	});
};

const testIsMemberOfTeamspace = () => {
	describe.each([
		['user has access', reqSample, true, true],
		['session is invalid', { ...reqSample, session: undefined }, undefined, false, templates.notLoggedIn],
		['user does not have access', reqSample, false, false, templates.teamspaceNotFound],
		['user is not authenticated to the teamspace', { ...reqSample, session: { ...reqSample.session, user: { ...reqSample.session.user, auth: { authenticatedTeamspace: generateRandomString() } } } }, true, true],
		['user is using API Key', { ...reqSample, session: { ...reqSample.session, user: { ...reqSample.session.user, auth: undefined } } }, true, true],
	])('Is member of teamspace', (desc, req, isMember, success, expectedErr) => {
		test(`Should ${success ? 'succeed' : 'fail'} if ${desc}`, async () => {
			const mockCB = jest.fn(() => {});
			const res = {};
			if (isMember !== undefined) {
				TSPermMiddleware.isTeamspaceMember.mockImplementationOnce(async (r, s, next) => {
					if (isMember) await next();
					else Responder.respond(r, s, templates.teamspaceNotFound);
				});
			}

			await PermMiddlewares.isMemberOfTeamspace(
				req,
				{},
				mockCB,
			);

			if (isMember === undefined) {
				expect(TSPermMiddleware.isTeamspaceMember).not.toHaveBeenCalled();
			} else {
				expect(TSPermMiddleware.isTeamspaceMember).toHaveBeenCalledTimes(1);
			}
			if (success) expect(mockCB).toHaveBeenCalledTimes(1);
			else {
				expect(mockCB).not.toHaveBeenCalled();
				expect(Responder.respond).toHaveBeenCalledTimes(1);
				expect(Responder.respond).toHaveBeenCalledWith(req, res, expectedErr);
			}
		});
	});
};

describe(determineTestGroup(__filename), () => {
	testHasAccessToTeamspace();
	testIsMemberOfTeamspace();
});
