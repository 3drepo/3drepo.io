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

const { src } = require('../../../helper/path');

jest.mock('../../../../../src/v5/utils/responder');
const Responder = require(`${src}/utils/responder`);
jest.mock('../../../../../src/v5/utils/permissions');
const Permissions = require(`${src}/utils/permissions`);
const { templates } = require(`${src}/utils/responseCodes`);

jest.mock('../../../../../src/v5/utils/sessions');
const Sessions = require(`${src}/utils/sessions`);
const PermMiddlewares = require(`${src}/middleware/permissions`);
const { determineTestGroup, generateRandomString } = require('../../../helper/services');

const authenticatedTeamspace = generateRandomString();

// Mock respond function to just return the resCode
Responder.respond.mockImplementation((req, res, errCode) => errCode);
Permissions.hasAccessToTeamspace.mockImplementation((teamspace) => teamspace === authenticatedTeamspace);
Permissions.hasReadAccessToContainer.mockImplementation((teamspace, project) => project === 'ok');
Sessions.isSessionValid.mockImplementation((session) => !!session);
Sessions.getUserFromSession.mockImplementation(() => 'hi');

const testHasAccessToTeamspace = () => {
	const ipAddress = generateRandomString();
	const reqSample = { ips: [ipAddress], params: { teamspace: authenticatedTeamspace }, headers: { referer: 'http://abc.com/' }, session: { ipAddress, user: { auth: { authenticatedTeamspace }, username: 'hi', referer: 'http://abc.com' } } };
	describe.each([
		['user has access', reqSample, true],
		['session is invalid', { ...reqSample, session: undefined }, false, templates.notLoggedIn],
		['user does not have access', { ...reqSample, params: { teamspace: generateRandomString() } }, false, templates.teamspaceNotFound],
		['user is not authenticated to the teamspace', { ...reqSample, session: { ...reqSample.session, user: { ...reqSample.session.user, auth: { authenticatedTeamspace: generateRandomString() } } } }, false, templates.notAuthenticatedAgainstTeamspace],
		['user is using API Key', { ...reqSample, session: { ...reqSample.session, user: { isAPIKey: true, ...reqSample.session.user, auth: undefined } } }, true],
	])('Has access to teamspace', (desc, req, success, expectedErr) => {
		test(`Should ${success ? 'succeed' : 'fail'} if ${desc}`, async () => {
			const mockCB = jest.fn(() => {});
			const res = {};
			await PermMiddlewares.hasAccessToTeamspace(
				req,
				{},
				mockCB,
			);
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
	const ipAddress = generateRandomString();
	const reqSample = { ips: [ipAddress], params: { teamspace: authenticatedTeamspace }, headers: { referer: 'http://abc.com/' }, session: { ipAddress, user: { auth: { authenticatedTeamspace }, username: 'hi', referer: 'http://abc.com' } } };
	describe.each([
		['user has access', reqSample, true],
		['session is invalid', { ...reqSample, session: undefined }, false, templates.notLoggedIn],
		['user does not have access', { ...reqSample, params: { teamspace: generateRandomString() } }, false, templates.teamspaceNotFound],
		['user is not authenticated to the teamspace', { ...reqSample, session: { ...reqSample.session, user: { ...reqSample.session.user, auth: { authenticatedTeamspace: generateRandomString() } } } }, true],
		['user is using API Key', { ...reqSample, session: { ...reqSample.session, user: { ...reqSample.session.user, auth: undefined } } }, true],
	])('Is member of teamspace', (desc, req, success, expectedErr) => {
		test(`Should ${success ? 'succeed' : 'fail'} if ${desc}`, async () => {
			const mockCB = jest.fn(() => {});
			const res = {};
			await PermMiddlewares.isMemberOfTeamspace(
				req,
				{},
				mockCB,
			);
			if (success) expect(mockCB).toHaveBeenCalledTimes(1);
			else {
				expect(mockCB).not.toHaveBeenCalled();
				expect(Responder.respond).toHaveBeenCalledTimes(1);
				expect(Responder.respond).toHaveBeenCalledWith(req, res, expectedErr);
			}
		});
	});
};
const testHasReadAccessToContainer = () => {
	describe('HasReadAccessToContainer', () => {
		const ipAddress = generateRandomString();
		const session = { ipAddress, user: { auth: { authenticatedTeamspace }, username: 'hi', referer: 'http://abc.com' } };

		test('next() should be called if the user has access', async () => {
			const mockCB = jest.fn(() => {});
			await PermMiddlewares.hasReadAccessToContainer(
				{ ips: [ipAddress], params: { teamspace: authenticatedTeamspace, project: 'ok' }, headers: { referer: 'http://abc.com/' }, session },
				{},
				mockCB,
			);
			expect(mockCB.mock.calls.length).toBe(1);
		});

		test('should respond with notAuthorized if the user has no access', async () => {
			const mockCB = jest.fn(() => {});
			await PermMiddlewares.hasReadAccessToContainer(
				{ ips: [ipAddress], params: { teamspace: authenticatedTeamspace, project: 'nope' }, headers: { referer: 'http://abc.com/' }, session },
				{},
				mockCB,
			);
			expect(mockCB.mock.calls.length).toBe(0);
			expect(Responder.respond.mock.calls.length).toBe(1);
			expect(Responder.respond.mock.results[0].value).toEqual(templates.notAuthorized);
		});

		test('should respond with notLoggedIn errCode if the session is invalid', async () => {
			const mockCB = jest.fn(() => {});
			await PermMiddlewares.hasReadAccessToContainer(
				{ ips: [ipAddress], params: { teamspace: authenticatedTeamspace }, headers: { referer: 'http://xyz.com' } },
				{},
				mockCB,
			);
			expect(mockCB.mock.calls.length).toBe(0);
			expect(Responder.respond.mock.calls.length).toBe(1);
			expect(Responder.respond.mock.results[0].value).toEqual(templates.notLoggedIn);
		});

		test('should respond with teamspace not found if the user has no access', async () => {
			const mockCB = jest.fn(() => {});
			await PermMiddlewares.hasReadAccessToContainer(
				{ ips: [ipAddress], params: { teamspace: 'ts1' }, headers: { referer: 'http://xyz.com' }, session },
				{},
				mockCB,
			);
			expect(mockCB.mock.calls.length).toBe(0);
			expect(Responder.respond.mock.calls.length).toBe(1);
			expect(Responder.respond.mock.results[0].value).toEqual(templates.teamspaceNotFound);
		});
	});
};

describe(determineTestGroup(__filename), () => {
	testHasAccessToTeamspace();
	testIsMemberOfTeamspace();
	testHasReadAccessToContainer();
});
