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
jest.mock('../../../../../../src/v5/utils/permissions');
const Permissions = require(`${src}/utils/permissions`);
const { templates } = require(`${src}/utils/responseCodes`);

jest.mock('../../../../../../src/v5/models/projectSettings');
const Projects = require(`${src}/models/projectSettings`);
jest.mock('../../../../../../src/v5/utils/sessions');
const Sessions = require(`${src}/utils/sessions`);
const ProjectMiddlewares = require(`${src}/middleware/permissions/components/projects`);

// Mock respond function to just return the resCode
Responder.respond.mockImplementation((req, res, errCode) => errCode);
Permissions.isTeamspaceAdmin.mockImplementation((teamspace, user) => user === 'tsAdmin');
Permissions.isProjectAdmin.mockImplementation((teamspace, project, user) => user === 'projAdmin');
Projects.getProjectById.mockImplementation((teamspace, project) => {
	if (project !== 'p1') {
		throw templates.projectNotFound;
	}
});

Sessions.isSessionValid.mockImplementation((session) => !!session);
Sessions.getUserFromSession.mockImplementation(({ user }) => user.username);

const app = { get: () => false };

const testIsProjectAdmin = () => {
	describe('isProjectAdmin', () => {
		test('next() should be called if the user is teamspace admin', async () => {
			const mockCB = jest.fn(() => {});
			await ProjectMiddlewares.isProjectAdmin(
				{ app, params: { teamspace: 'ts', project: 'p1' }, session: { user: { username: 'tsAdmin' } } },
				{},
				mockCB,
			);
			expect(mockCB.mock.calls.length).toBe(1);
		});

		test('next() should be called if the user is project admin', async () => {
			const mockCB = jest.fn(() => {});
			await ProjectMiddlewares.isProjectAdmin(
				{ app, params: { teamspace: 'ts', project: 'p1' }, session: { user: { username: 'projAdmin' } } },
				{},
				mockCB,
			);
			expect(mockCB.mock.calls.length).toBe(1);
		});

		test('next() should be called if permissions is bypassed', async () => {
			const mockCB = jest.fn(() => {});
			await ProjectMiddlewares.isProjectAdmin(
				{ app: { get: () => true }, params: { teamspace: 'ts', project: 'p1' }, session: { user: { username: 'projAdmin' } } },
				{},
				mockCB,
			);
			expect(mockCB.mock.calls.length).toBe(1);
		});

		test('should respond with not authorized if the user has no access', async () => {
			const mockCB = jest.fn(() => {});
			await ProjectMiddlewares.isProjectAdmin(
				{ app, params: { teamspace: 'ts1', project: 'p1' }, session: { user: { username: 'hi' } } },
				{},
				mockCB,
			);
			expect(mockCB.mock.calls.length).toBe(0);
			expect(Responder.respond.mock.calls.length).toBe(1);
			expect(Responder.respond.mock.results[0].value).toEqual(templates.notAuthorized);
		});

		test('should respond with project not found if the project does not exist', async () => {
			const mockCB = jest.fn(() => {});
			await ProjectMiddlewares.isProjectAdmin(
				{ app, params: { teamspace: 'ts1', project: 'pr2' }, session: { user: { username: 'hi' } } },
				{},
				mockCB,
			);
			expect(mockCB.mock.calls.length).toBe(0);
			expect(Responder.respond.mock.calls.length).toBe(1);
			expect(Responder.respond.mock.results[0].value).toEqual(templates.projectNotFound);
		});
	});
};

describe('middleware/permissions/components/projects', () => {
	testIsProjectAdmin();
});
