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

const Permissions = require(`${src}/utils/permissions/permissions`);
const { PROJECT_ADMIN } = require(`${src}/utils/permissions/permissions.constants`);
jest.mock('../../../../../src/v5/models/teamspaces');
const Teamspaces = require(`${src}/models/teamspaces`);
jest.mock('../../../../../src/v5/models/projects');
const Projects = require(`${src}/models/projects`);
jest.mock('../../../../../src/v5/models/modelSettings');
const ModelSettings = require(`${src}/models/modelSettings`);

const expectedSettings = {
	permissions: [
		{ user: 'a', permission: 'viewer' },
		{ user: 'b', permission: 'collaborator' },
		{ user: 'c', permission: 'commenter' },
	],
};
ModelSettings.getModelById.mockImplementation(() => (expectedSettings));
Teamspaces.getTeamspaceAdmins.mockImplementation(() => (['tsAdmin']));
Projects.getProjectAdmins.mockImplementation(() => (['projAdmin']));

const testIsTeamspaceAdmin = () => {
	describe('Is teamspace admin', () => {
		test('should return true if the user is an admin', async () => {
			const res = await Permissions.isTeamspaceAdmin('abc', 'tsAdmin');
			expect(res).toBeTruthy();
		});
		test('should return false if the user is not an admin', async () => {
			const res = await Permissions.isTeamspaceAdmin('abc', 'someoneElse');
			expect(res).toBeFalsy();
		});
	});
};

const testIsProjectAdmin = () => {
	describe('Is project admin', () => {
		test('should return true if the user is an admin', async () => {
			const res = await Permissions.isProjectAdmin('abc', 'project', 'projAdmin');
			expect(res).toBeTruthy();
		});
		test('should return false if the user is not an admin', async () => {
			const res = await Permissions.isProjectAdmin('abc', 'project', 'username');
			expect(res).toBeFalsy();
		});
	});
};

const testHasProjectAdminPermissions = () => {
	const perms = [
		{
			user: 'a',
			permissions: [PROJECT_ADMIN],
		},
		{
			user: 'b',
			permissions: [],
		},
	];
	describe.each([
		[perms, 'a', true],
		[perms, 'b', false],
		[perms, 'c', false],
		[[], 'a', false],
	])('Has project admin permissions', (permissions, user, result) => {
		test(`with ${JSON.stringify(permissions)} user ${result ? 'have' : 'does not have'} admin rights`, () => {
			expect(Permissions.hasProjectAdminPermissions(permissions, user)).toBe(result);
		});
	});
};

const testHasReadAccessToModel = () => {
	describe.each([
		['a', false, true],
		['b', false, true],
		['c', false, true],
		['projAdmin', false, false],
		['projAdmin', true, true],
		['tsAdmin', false, false],
		['tsAdmin', true, true],
		['tsAdmin', undefined, true],
		['nobody', false, false],
		['nobody', true, false],
	])('Has read access to model', (user, adminCheck, result) => {
		test(`${user} ${result ? 'have' : 'does not have'} read access (adminCheck: ${adminCheck})`, async () => {
			expect(await Permissions.hasReadAccessToModel('teamspace', 'project', 'model', user, adminCheck)).toBe(result);
		});
	});
};

describe('utils/permissions', () => {
	testIsTeamspaceAdmin();
	testIsProjectAdmin();
	testHasProjectAdminPermissions();
	testHasReadAccessToModel();
});
