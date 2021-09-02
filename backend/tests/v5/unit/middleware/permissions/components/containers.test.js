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
jest.mock('../../../../../../src/v5/utils/permissions/permissions');
const Permissions = require(`${src}/utils/permissions/permissions`);
const { templates } = require(`${src}/utils/responseCodes`);

jest.mock('../../../../../../src/v5/utils/sessions');
const Sessions = require(`${src}/utils/sessions`);
<<<<<<< HEAD:backend/tests/v5/unit/middleware/permissions/components/containers.test.js
const ContainerMiddleware = require(`${src}/middleware/permissions/components/containers`);
=======
const PermMiddlewares = require(`${src}/middleware/permissions/permissions`);
>>>>>>> staging:backend/tests/v5/unit/middleware/permissions/permissions.test.js

// Mock respond function to just return the resCode
Responder.respond.mockImplementation((req, res, errCode) => errCode);
Permissions.hasReadAccessToModel.mockImplementation((teamspace) => {
	if (teamspace === 'throw') {
		throw templates.projectNotFound;
	}
	return teamspace === 'ts';
});
Sessions.getUserFromSession.mockImplementation(() => 'hi');

const testHasReadAccessToContainer = () => {
	describe('hasReadAccessToContainer', () => {
		test('next() should be called if the user has access', async () => {
			const mockCB = jest.fn(() => {});
<<<<<<< HEAD:backend/tests/v5/unit/middleware/permissions/components/containers.test.js
			await ContainerMiddleware.hasReadAccessToContainer(
				{ params: { teamspace: 'ts' }, session: { user: { username: 'hi' } } },
=======
			await PermMiddlewares.hasAccessToTeamspace(
				{ params: { teamspace: 'ts' }, header: { referer: 'http://abc.com/' }, session: { user: { username: 'hi', referer: 'http://abc.com' } } },
>>>>>>> staging:backend/tests/v5/unit/middleware/permissions/permissions.test.js
				{},
				mockCB,
			);
			expect(mockCB.mock.calls.length).toBe(1);
		});

		test('should respond with not authorised if the user has no access', async () => {
			const mockCB = jest.fn(() => {});
<<<<<<< HEAD:backend/tests/v5/unit/middleware/permissions/components/containers.test.js
			await ContainerMiddleware.hasReadAccessToContainer(
				{ params: { teamspace: 'ts1' }, session: { user: { username: 'hi' } } },
=======
			await PermMiddlewares.hasAccessToTeamspace(
				{ params: { teamspace: 'ts' }, header: { referer: 'http://xyz.com' } },
>>>>>>> staging:backend/tests/v5/unit/middleware/permissions/permissions.test.js
				{},
				mockCB,
			);
			expect(mockCB.mock.calls.length).toBe(0);
			expect(Responder.respond.mock.calls.length).toBe(1);
			expect(Responder.respond.mock.results[0].value).toEqual(templates.notAuthorized);
		});

		test('should respond with whatever hasReadAccessToModel errored with if it errored', async () => {
			const mockCB = jest.fn(() => {});
<<<<<<< HEAD:backend/tests/v5/unit/middleware/permissions/components/containers.test.js
			await ContainerMiddleware.hasReadAccessToContainer(
				{ params: { teamspace: 'throw' }, session: { user: { username: 'hi' } } },
=======
			await PermMiddlewares.hasAccessToTeamspace(
				{ params: { teamspace: 'ts1' }, header: { referer: 'http://xyz.com' }, session: { user: { username: 'hi', referer: 'http://xyz.com' } } },
>>>>>>> staging:backend/tests/v5/unit/middleware/permissions/permissions.test.js
				{},
				mockCB,
			);
			expect(mockCB.mock.calls.length).toBe(0);
			expect(Responder.respond.mock.calls.length).toBe(1);
			expect(Responder.respond.mock.results[0].value).toEqual(templates.projectNotFound);
		});
	});
};

<<<<<<< HEAD:backend/tests/v5/unit/middleware/permissions/components/containers.test.js
describe('middleware/permissions/components/containers', () => {
	testHasReadAccessToContainer();
=======
describe('middleware/permissions/permissions', () => {
	testHasAccessToTeamspace();
>>>>>>> staging:backend/tests/v5/unit/middleware/permissions/permissions.test.js
});
