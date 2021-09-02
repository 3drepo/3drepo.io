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
jest.mock('../../../../../src/v5/models/teamspaces');
const Teamspace = require(`${src}/models/teamspaces`);
const { templates } = require(`${src}/utils/responseCodes`);

jest.mock('../../../../../src/v5/utils/sessions');
const Sessions = require(`${src}/utils/sessions`);
const PermMiddlewares = require(`${src}/middleware/permissions/permissions`);

// Mock respond function to just return the resCode
Responder.respond.mockImplementation((req, res, errCode) => errCode);
Teamspace.hasAccessToTeamspace.mockImplementation((teamspace) => teamspace === 'ts');
Sessions.isSessionValid.mockImplementation((session) => !!session);
Sessions.getUserFromSession.mockImplementation(() => 'hi');

const testHasAccessToTeamspace = () => {
	describe('HasAccessToTeamspace', () => {
		test('next() should be called if the user has access', async () => {
			const mockCB = jest.fn(() => {});
			await PermMiddlewares.hasAccessToTeamspace(
				{ params: { teamspace: 'ts' }, header: { referer: 'http://abc.com/' }, session: { user: { username: 'hi', referer: 'http://abc.com' } } },
				{},
				mockCB,
			);
			expect(mockCB.mock.calls.length).toBe(1);
		});
		test('should respond with notLoggedIn errCode if the session is invalid', async () => {
			const mockCB = jest.fn(() => {});
			await PermMiddlewares.hasAccessToTeamspace(
				{ params: { teamspace: 'ts' }, header: { referer: 'http://xyz.com' } },
				{},
				mockCB,
			);
			expect(mockCB.mock.calls.length).toBe(0);
			expect(Responder.respond.mock.calls.length).toBe(1);
			expect(Responder.respond.mock.results[0].value).toEqual(templates.notLoggedIn);
		});

		test('should respond with teamspace not found if the user has no access', async () => {
			const mockCB = jest.fn(() => {});
			await PermMiddlewares.hasAccessToTeamspace(
				{ params: { teamspace: 'ts1' }, header: { referer: 'http://xyz.com' }, session: { user: { username: 'hi', referer: 'http://xyz.com' } } },
				{},
				mockCB,
			);
			expect(mockCB.mock.calls.length).toBe(0);
			expect(Responder.respond.mock.calls.length).toBe(1);
			expect(Responder.respond.mock.results[0].value).toEqual(templates.teamspaceNotFound);
		});
	});
};

describe('middleware/permissions/permissions', () => {
	testHasAccessToTeamspace();
});
