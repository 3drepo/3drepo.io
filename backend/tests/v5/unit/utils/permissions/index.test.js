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

const { times } = require('lodash');
const { src } = require('../../../helper/path');
const { generateRandomString } = require('../../../helper/services');

const Permissions = require(`${src}/utils/permissions`);
const { PROJECT_ADMIN } = require(`${src}/utils/permissions.constants`);
jest.mock('../../../../../src/v5/models/teamspaceSettings');
const Teamspaces = require(`${src}/models/teamspaceSettings`);
jest.mock('../../../../../src/v5/models/projectSettings');
const Projects = require(`${src}/models/projectSettings`);
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
ModelSettings.getContainerById.mockImplementation(() => (expectedSettings));
ModelSettings.getFederationById.mockImplementation(() => (expectedSettings));
ModelSettings.getDrawingById.mockImplementation(() => (expectedSettings));
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

const testHasReadAccessToSomeModels = () => {
	const noAccessUser = generateRandomString();
	const someAccessUser = generateRandomString();
	const fullAccessUser = generateRandomString();

	const findModelsResults = [
		{
			permissions: [{ user: someAccessUser, permission: 'viewer' }, { user: fullAccessUser, permission: 'viewer' }],
		},
		{
			permissions: [{ user: fullAccessUser, permission: 'viewer' }],
		},

	];

	describe.each([
		['the user has no permissions on any models', noAccessUser, false],
		['the user has permissions on 1 model', someAccessUser, true],
		['the user has permissions on all models', fullAccessUser, true],
	])('Has read access to some models', (desc, user, hasAccess) => {
		test(`Should return ${hasAccess ? 'true' : 'false'} if ${desc}`, async () => {
			ModelSettings.findModels.mockResolvedValueOnce(findModelsResults);
			await expect(
				Permissions.hasReadAccessToSomeModels(generateRandomString(), generateRandomString(),
					times(2, () => generateRandomString()), user)).resolves.toBe(hasAccess);
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
			Projects.modelsExistInProject.mockImplementation(() => true);
			expect(await Permissions.hasReadAccessToModel('teamspace', 'project', 'model', user, adminCheck)).toBe(result);
		});
	});

	describe('Container does not belong to the project', () => {
		test('should return false if the model does not belong to the project', async () => {
			Projects.modelsExistInProject.mockImplementation(() => false);
			expect(await Permissions.hasReadAccessToModel('teamspace', 'project', 'model', 'a', true)).toBe(false);
		});
	});
};

const testHasWriteAccessToModel = () => {
	describe.each([
		['a', false, false],
		['b', false, true],
		['c', false, false],
		['projAdmin', false, false],
		['projAdmin', true, true],
		['tsAdmin', false, false],
		['tsAdmin', true, true],
		['tsAdmin', undefined, true],
		['nobody', false, false],
		['nobody', true, false],
	])('Has write access to model', (user, adminCheck, result) => {
		test(`${user} ${result ? 'have' : 'does not have'} write access (adminCheck: ${adminCheck})`, async () => {
			Projects.modelsExistInProject.mockImplementation(() => true);
			expect(await Permissions.hasWriteAccessToModel('teamspace', 'project', 'model', user, adminCheck)).toBe(result);
		});
	});

	describe('Has write access to model (2)', () => {
		test('should return false if the model does not belong to the project', async () => {
			Projects.modelsExistInProject.mockImplementation(() => false);
			expect(await Permissions.hasWriteAccessToModel('teamspace', 'project', 'model', 'a', true)).toBe(false);
		});
	});
};

const testHasCommenterAccessToModel = () => {
	describe.each([
		['a', false, false],
		['b', false, true],
		['c', false, true],
		['projAdmin', false, false],
		['projAdmin', true, true],
		['tsAdmin', false, false],
		['tsAdmin', true, true],
		['tsAdmin', undefined, true],
		['nobody', false, false],
		['nobody', true, false],
	])('Has commenter access to model', (user, adminCheck, result) => {
		test(`${user} ${result ? 'have' : 'does not have'} write access (adminCheck: ${adminCheck})`, async () => {
			Projects.modelsExistInProject.mockImplementation(() => true);
			expect(await Permissions.hasCommenterAccessToModel('teamspace', 'project', 'model', user, adminCheck)).toBe(result);
		});
	});

	describe('Has write access to model (2)', () => {
		test('should return false if the model does not belong to the project', async () => {
			Projects.modelsExistInProject.mockImplementation(() => false);
			expect(await Permissions.hasCommenterAccessToModel('teamspace', 'project', 'model', 'a', true)).toBe(false);
		});
	});
};

const testHasReadAccessToContainer = () => {
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
	])('Has read access to container', (user, adminCheck, result) => {
		test(`${user} ${result ? 'have' : 'does not have'} read access (adminCheck: ${adminCheck})`, async () => {
			Projects.modelsExistInProject.mockImplementation(() => true);
			expect(await Permissions.hasReadAccessToContainer('teamspace', 'project', 'model', user, adminCheck)).toBe(result);
		});
	});

	describe('Container does not belong to the project', () => {
		test('should return false if the container does not belong to the project', async () => {
			Projects.modelsExistInProject.mockImplementation(() => false);
			expect(await Permissions.hasReadAccessToContainer('teamspace', 'project', 'model', 'a', true)).toBe(false);
		});
	});
};

const testHasWriteAccessToContainer = () => {
	describe.each([
		['a', false, false],
		['b', false, true],
		['c', false, false],
		['projAdmin', false, false],
		['projAdmin', true, true],
		['tsAdmin', false, false],
		['tsAdmin', true, true],
		['tsAdmin', undefined, true],
		['nobody', false, false],
		['nobody', true, false],
	])('Has write access to container', (user, adminCheck, result) => {
		test(`${user} ${result ? 'have' : 'does not have'} write access (adminCheck: ${adminCheck})`, async () => {
			Projects.modelsExistInProject.mockImplementation(() => true);
			expect(await Permissions.hasWriteAccessToContainer('teamspace', 'project', 'model', user, adminCheck)).toBe(result);
		});
	});

	describe('Has write access to container (2)', () => {
		test('should return false if the container does not belong to the project', async () => {
			Projects.modelsExistInProject.mockImplementation(() => false);
			expect(await Permissions.hasWriteAccessToContainer('teamspace', 'project', 'model', 'a', true)).toBe(false);
		});
	});
};

const testHasCommenterAccessToContainer = () => {
	describe.each([
		['a', false, false],
		['b', false, true],
		['c', false, true],
		['projAdmin', false, false],
		['projAdmin', true, true],
		['tsAdmin', false, false],
		['tsAdmin', true, true],
		['tsAdmin', undefined, true],
		['nobody', false, false],
		['nobody', true, false],
	])('Has commenter access to container', (user, adminCheck, result) => {
		test(`${user} ${result ? 'have' : 'does not have'} write access (adminCheck: ${adminCheck})`, async () => {
			Projects.modelsExistInProject.mockImplementation(() => true);
			expect(await Permissions.hasCommenterAccessToContainer('teamspace', 'project', 'model', user, adminCheck)).toBe(result);
		});
	});

	describe('Has write access to container (2)', () => {
		test('should return false if the model does not belong to the project', async () => {
			Projects.modelsExistInProject.mockImplementation(() => false);
			expect(await Permissions.hasCommenterAccessToContainer('teamspace', 'project', 'model', 'a', true)).toBe(false);
		});
	});
};

const testHasAdminAccessToContainer = () => {
	describe.each([
		['a', false],
		['b', false],
		['c', false],
		['projAdmin', true],
		['tsAdmin', true],
		['nobody', false],
	])('Has admin access to container', (user, result) => {
		test(`${user} ${result ? 'have' : 'does not have'} admin access`, async () => {
			Projects.modelsExistInProject.mockImplementation(() => true);
			expect(await Permissions.hasAdminAccessToContainer('teamspace', 'project', 'model', user)).toBe(result);
		});
	});

	describe('Container does not belong to the project', () => {
		test('should return false if the container does not belong to the project', async () => {
			Projects.modelsExistInProject.mockImplementation(() => false);
			expect(await Permissions.hasAdminAccessToContainer('teamspace', 'project', 'model', 'a')).toBe(false);
		});
	});
};

const testHasReadAccessToDrawing = () => {
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
	])('Has read access to drawing', (user, adminCheck, result) => {
		test(`${user} ${result ? 'have' : 'does not have'} read access (adminCheck: ${adminCheck})`, async () => {
			Projects.modelsExistInProject.mockImplementation(() => true);
			expect(await Permissions.hasReadAccessToDrawing('teamspace', 'project', 'model', user, adminCheck)).toBe(result);
		});
	});

	describe('Drawing does not belong to the project', () => {
		test('should return false if the drawing does not belong to the project', async () => {
			Projects.modelsExistInProject.mockImplementation(() => false);
			expect(await Permissions.hasReadAccessToDrawing('teamspace', 'project', 'model', 'a', true)).toBe(false);
		});
	});
};

const testHasWriteAccessToDrawing = () => {
	describe.each([
		['a', false, false],
		['b', false, true],
		['c', false, false],
		['projAdmin', false, false],
		['projAdmin', true, true],
		['tsAdmin', false, false],
		['tsAdmin', true, true],
		['tsAdmin', undefined, true],
		['nobody', false, false],
		['nobody', true, false],
	])('Has write access to drawing', (user, adminCheck, result) => {
		test(`${user} ${result ? 'have' : 'does not have'} write access (adminCheck: ${adminCheck})`, async () => {
			Projects.modelsExistInProject.mockImplementation(() => true);
			expect(await Permissions.hasWriteAccessToDrawing('teamspace', 'project', 'model', user, adminCheck)).toBe(result);
		});
	});

	describe('Has write access to drawing (2)', () => {
		test('should return false if the drawing does not belong to the project', async () => {
			Projects.modelsExistInProject.mockImplementation(() => false);
			expect(await Permissions.hasWriteAccessToDrawing('teamspace', 'project', 'model', 'a', true)).toBe(false);
		});
	});
};

const testHasCommenterAccessToDrawing = () => {
	describe.each([
		['a', false, false],
		['b', false, true],
		['c', false, true],
		['projAdmin', false, false],
		['projAdmin', true, true],
		['tsAdmin', false, false],
		['tsAdmin', true, true],
		['tsAdmin', undefined, true],
		['nobody', false, false],
		['nobody', true, false],
	])('Has commenter access to drawing', (user, adminCheck, result) => {
		test(`${user} ${result ? 'have' : 'does not have'} write access (adminCheck: ${adminCheck})`, async () => {
			Projects.modelsExistInProject.mockImplementation(() => true);
			expect(await Permissions.hasCommenterAccessToDrawing('teamspace', 'project', 'model', user, adminCheck)).toBe(result);
		});
	});

	describe('Has write access to drawing (2)', () => {
		test('should return false if the model does not belong to the project', async () => {
			Projects.modelsExistInProject.mockImplementation(() => false);
			expect(await Permissions.hasCommenterAccessToDrawing('teamspace', 'project', 'model', 'a', true)).toBe(false);
		});
	});
};

const testHasAdminAccessToDrawing = () => {
	describe.each([
		['a', false],
		['b', false],
		['c', false],
		['projAdmin', true],
		['tsAdmin', true],
		['nobody', false],
	])('Has admin access to drawing', (user, result) => {
		test(`${user} ${result ? 'have' : 'does not have'} admin access`, async () => {
			Projects.modelsExistInProject.mockImplementation(() => true);
			expect(await Permissions.hasAdminAccessToDrawing('teamspace', 'project', 'model', user)).toBe(result);
		});
	});

	describe('Drawing does not belong to the project', () => {
		test('should return false if the drawing does not belong to the project', async () => {
			Projects.modelsExistInProject.mockImplementation(() => false);
			expect(await Permissions.hasAdminAccessToDrawing('teamspace', 'project', 'model', 'a')).toBe(false);
		});
	});
};

const testHasReadAccessToFederation = () => {
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
	])('Has read access to federation', (user, adminCheck, result) => {
		test(`${user} ${result ? 'have' : 'does not have'} read access (adminCheck: ${adminCheck})`, async () => {
			Projects.modelsExistInProject.mockImplementation(() => true);
			expect(await Permissions.hasReadAccessToFederation('teamspace', 'project', 'model', user, adminCheck)).toBe(result);
		});
	});

	describe('Federation does not belong to the project', () => {
		test('should return false if the federation does not belong to the project', async () => {
			Projects.modelsExistInProject.mockImplementation(() => false);
			expect(await Permissions.hasReadAccessToFederation('teamspace', 'project', 'model', 'a', true)).toBe(false);
		});
	});
};

const testHasWriteAccessToFederation = () => {
	describe.each([
		['a', false, false],
		['b', false, true],
		['c', false, false],
		['projAdmin', false, false],
		['projAdmin', true, true],
		['tsAdmin', false, false],
		['tsAdmin', true, true],
		['tsAdmin', undefined, true],
		['nobody', false, false],
		['nobody', true, false],
	])('Has write access to federation', (user, adminCheck, result) => {
		test(`${user} ${result ? 'have' : 'does not have'} write access (adminCheck: ${adminCheck})`, async () => {
			Projects.modelsExistInProject.mockImplementation(() => true);
			expect(await Permissions.hasWriteAccessToFederation('teamspace', 'project', 'model', user, adminCheck)).toBe(result);
		});
	});

	describe('Has write access to federation (2)', () => {
		test('should return false if the federation does not belong to the project', async () => {
			Projects.modelsExistInProject.mockImplementation(() => false);
			expect(await Permissions.hasWriteAccessToFederation('teamspace', 'project', 'model', 'a', true)).toBe(false);
		});
	});
};

const testHasCommenterAccessToFederation = () => {
	describe.each([
		['a', false, false],
		['b', false, true],
		['c', false, true],
		['projAdmin', false, false],
		['projAdmin', true, true],
		['tsAdmin', false, false],
		['tsAdmin', true, true],
		['tsAdmin', undefined, true],
		['nobody', false, false],
		['nobody', true, false],
	])('Has commenter access to federation', (user, adminCheck, result) => {
		test(`${user} ${result ? 'have' : 'does not have'} write access (adminCheck: ${adminCheck})`, async () => {
			Projects.modelsExistInProject.mockImplementation(() => true);
			expect(await Permissions.hasCommenterAccessToFederation('teamspace', 'project', 'model', user, adminCheck)).toBe(result);
		});
	});

	describe('Has write access to federation (2)', () => {
		test('should return false if the model does not belong to the project', async () => {
			Projects.modelsExistInProject.mockImplementation(() => false);
			expect(await Permissions.hasCommenterAccessToFederation('teamspace', 'project', 'model', 'a', true)).toBe(false);
		});
	});
};

const testHasAdminAccessToFederation = () => {
	describe.each([
		['a', false],
		['b', false],
		['c', false],
		['projAdmin', true],
		['tsAdmin', true],
		['nobody', false],
	])('Has admin access to federation', (user, result) => {
		test(`${user} ${result ? 'have' : 'does not have'} admin access`, async () => {
			Projects.modelsExistInProject.mockImplementation(() => true);
			expect(await Permissions.hasAdminAccessToFederation('teamspace', 'project', 'model', user)).toBe(result);
		});
	});

	describe('Federation does not belong to the project', () => {
		test('should return false if the federation does not belong to the project', async () => {
			Projects.modelsExistInProject.mockImplementation(() => false);
			expect(await Permissions.hasAdminAccessToFederation('teamspace', 'project', 'model', 'a')).toBe(false);
		});
	});
};

describe('utils/permissions', () => {
	testIsTeamspaceAdmin();
	testIsProjectAdmin();
	testHasProjectAdminPermissions();
	testHasReadAccessToSomeModels();
	testHasReadAccessToModel();
	testHasWriteAccessToModel();
	testHasCommenterAccessToModel();

	testHasReadAccessToContainer();
	testHasWriteAccessToContainer();
	testHasCommenterAccessToContainer();
	testHasAdminAccessToContainer();

	testHasReadAccessToDrawing();
	testHasWriteAccessToDrawing();
	testHasCommenterAccessToDrawing();
	testHasAdminAccessToDrawing();

	testHasReadAccessToFederation();
	testHasWriteAccessToFederation();
	testHasCommenterAccessToFederation();
	testHasAdminAccessToFederation();
});
