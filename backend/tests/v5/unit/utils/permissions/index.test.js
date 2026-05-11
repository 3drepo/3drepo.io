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

const { determineTestGroup } = require('../../../helper/utils');
const { times } = require('lodash');
const { src } = require('../../../helper/path');
const { generateRandomString } = require('../../../helper/services');

const { modelTypes } = require(`${src}/models/modelSettings.constants`);

const permConst = require(`${src}/utils/permissions/permissions.constants`);

const Permissions = require(`${src}/utils/permissions`);
const { PROJECT_ADMIN } = require(`${src}/utils/permissions/permissions.constants`);
jest.mock('../../../../../src/v5/models/teamspaceSettings');
const Teamspaces = require(`${src}/models/teamspaceSettings`);
jest.mock('../../../../../src/v5/models/projectSettings');
const Projects = require(`${src}/models/projectSettings`);
jest.mock('../../../../../src/v5/models/modelSettings');
const ModelSettings = require(`${src}/models/modelSettings`);

const tsAdminUser = generateRandomString();
const projectAdminUser = generateRandomString();
const viewerUser = generateRandomString();
const collaboratorUser = generateRandomString();
const commenterUser = generateRandomString();

const expectedSettings = {
	permissions: [
		{ user: viewerUser, permission: permConst.MODEL_VIEWER },
		{ user: collaboratorUser, permission: permConst.MODEL_COLLABORATOR },
		{ user: commenterUser, permission: permConst.MODEL_COMMENTER },
	],
};
const getModelsMock = (ts, models) => models.map((model) => ({ _id: model, ...expectedSettings }));
ModelSettings.getMultipleModelsByIds.mockImplementation((ts, models) => getModelsMock(ts, models));
ModelSettings.getContainers.mockImplementation((ts, models) => getModelsMock(ts, models));
ModelSettings.getContainerById.mockImplementation(() => (expectedSettings));
ModelSettings.getFederations.mockImplementation((ts, models) => getModelsMock(ts, models));
ModelSettings.getFederationById.mockImplementation(() => (expectedSettings));
ModelSettings.getDrawings.mockImplementation((ts, models) => getModelsMock(ts, models));
ModelSettings.getDrawingById.mockImplementation(() => (expectedSettings));
Teamspaces.getTeamspaceAdmins.mockImplementation(() => ([tsAdminUser]));
Projects.getProjectAdmins.mockImplementation(() => ([projectAdminUser]));

const testIsTeamspaceAdmin = () => {
	describe('Is teamspace admin', () => {
		test('should return true if the user is an admin', async () => {
			const res = await Permissions.isTeamspaceAdmin(generateRandomString(), tsAdminUser);
			expect(res).toBeTruthy();
		});
		test('should return false if the user is not an admin', async () => {
			const res = await Permissions.isTeamspaceAdmin(generateRandomString(), generateRandomString());
			expect(res).toBeFalsy();
		});
	});
};

const testIsProjectAdmin = () => {
	describe('Is project admin', () => {
		test('should return true if the user is an admin', async () => {
			const res = await Permissions.isProjectAdmin(generateRandomString(),
				generateRandomString(), projectAdminUser);
			expect(res).toBeTruthy();
		});
		test('should return false if the user is not an admin', async () => {
			const res = await Permissions.isProjectAdmin(generateRandomString(),
				generateRandomString(), generateRandomString());
			expect(res).toBeFalsy();
		});
	});
};

const testHasProjectAdminPermissions = () => {
	const perms = [
		{
			user: viewerUser,
			permissions: [PROJECT_ADMIN],
		},
		{
			user: collaboratorUser,
			permissions: [],
		},
	];
	describe.each([
		[perms, viewerUser, true],
		[perms, collaboratorUser, false],
		[perms, commenterUser, false],
		[[], viewerUser, false],
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
		[viewerUser, false, true],
		[collaboratorUser, false, true],
		[commenterUser, false, true],
		[projectAdminUser, false, false],
		[projectAdminUser, true, true],
		[tsAdminUser, false, false],
		[tsAdminUser, true, true],
		[tsAdminUser, undefined, true],
		[generateRandomString(), false, false],
		[generateRandomString(), true, false],
	])('Has read access to model', (user, adminCheck, result) => {
		test(`${user} ${result ? 'have' : 'does not have'} read access (adminCheck: ${adminCheck})`, async () => {
			Projects.modelsExistInProject.mockImplementation(() => true);
			expect(await Permissions.hasReadAccessToModel(generateRandomString(), generateRandomString(),
				generateRandomString(), user, adminCheck)).toBe(result);
		});
	});

	describe('Container does not belong to the project', () => {
		test('should return false if the model does not belong to the project', async () => {
			Projects.modelsExistInProject.mockImplementation(() => false);
			expect(await Permissions.hasReadAccessToModel(generateRandomString(), generateRandomString(),
				generateRandomString(), viewerUser, true)).toBe(false);
		});
	});
};

const testHasWriteAccessToModel = () => {
	describe.each([
		[viewerUser, false, false],
		[collaboratorUser, false, true],
		[commenterUser, false, false],
		[projectAdminUser, false, false],
		[projectAdminUser, true, true],
		[tsAdminUser, false, false],
		[tsAdminUser, true, true],
		[tsAdminUser, undefined, true],
		[generateRandomString(), false, false],
		[generateRandomString(), true, false],
	])('Has write access to model', (user, adminCheck, result) => {
		test(`${user} ${result ? 'have' : 'does not have'} write access (adminCheck: ${adminCheck})`, async () => {
			Projects.modelsExistInProject.mockImplementation(() => true);
			expect(await Permissions.hasWriteAccessToModel(generateRandomString(), generateRandomString(),
				generateRandomString(), user, adminCheck)).toBe(result);
		});
	});

	describe('Has write access to model (2)', () => {
		test('should return false if the model does not belong to the project', async () => {
			Projects.modelsExistInProject.mockImplementation(() => false);
			expect(await Permissions.hasWriteAccessToModel(generateRandomString(), generateRandomString(),
				generateRandomString(), viewerUser, true)).toBe(false);
		});
	});
};

const testHasCommenterAccessToModel = () => {
	describe.each([
		[viewerUser, false, false],
		[collaboratorUser, false, true],
		[commenterUser, false, true],
		[projectAdminUser, false, false],
		[projectAdminUser, true, true],
		[tsAdminUser, false, false],
		[tsAdminUser, true, true],
		[tsAdminUser, undefined, true],
		[generateRandomString(), false, false],
		[generateRandomString(), true, false],
	])('Has commenter access to model', (user, adminCheck, result) => {
		test(`${user} ${result ? 'have' : 'does not have'} write access (adminCheck: ${adminCheck})`, async () => {
			Projects.modelsExistInProject.mockImplementation(() => true);
			expect(await Permissions.hasCommenterAccessToModel(generateRandomString(), generateRandomString(),
				generateRandomString(), user, adminCheck)).toBe(result);
		});
	});

	describe('Has write access to model (2)', () => {
		test('should return false if the model does not belong to the project', async () => {
			Projects.modelsExistInProject.mockImplementation(() => false);
			expect(await Permissions.hasCommenterAccessToModel(generateRandomString(), generateRandomString(),
				generateRandomString(), viewerUser, true)).toBe(false);
		});
	});
};

const testHasReadAccessToContainer = () => {
	describe.each([
		[viewerUser, false, true],
		[collaboratorUser, false, true],
		[commenterUser, false, true],
		[projectAdminUser, false, false],
		[projectAdminUser, true, true],
		[tsAdminUser, false, false],
		[tsAdminUser, true, true],
		[tsAdminUser, undefined, true],
		[generateRandomString(), false, false],
		[generateRandomString(), true, false],
	])('Has read access to container', (user, adminCheck, result) => {
		test(`${user} ${result ? 'have' : 'does not have'} read access (adminCheck: ${adminCheck})`, async () => {
			Projects.modelsExistInProject.mockImplementation(() => true);
			expect(await Permissions.hasReadAccessToContainer(generateRandomString(), generateRandomString(),
				generateRandomString(), user, adminCheck)).toBe(result);
		});
	});

	describe('Container does not belong to the project', () => {
		test('should return false if the container does not belong to the project', async () => {
			Projects.modelsExistInProject.mockImplementation(() => false);
			expect(await Permissions.hasReadAccessToContainer(generateRandomString(), generateRandomString(),
				generateRandomString(), viewerUser, true)).toBe(false);
		});
	});
};

const testHasWriteAccessToContainer = () => {
	describe.each([
		[viewerUser, false, false],
		[collaboratorUser, false, true],
		[commenterUser, false, false],
		[projectAdminUser, false, false],
		[projectAdminUser, true, true],
		[tsAdminUser, false, false],
		[tsAdminUser, true, true],
		[tsAdminUser, undefined, true],
		[generateRandomString(), false, false],
		[generateRandomString(), true, false],
	])('Has write access to container', (user, adminCheck, result) => {
		test(`${user} ${result ? 'have' : 'does not have'} write access (adminCheck: ${adminCheck})`, async () => {
			Projects.modelsExistInProject.mockImplementation(() => true);
			expect(await Permissions.hasWriteAccessToContainer(generateRandomString(), generateRandomString(),
				generateRandomString(), user, adminCheck)).toBe(result);
		});
	});

	describe('Has write access to container (2)', () => {
		test('should return false if the container does not belong to the project', async () => {
			Projects.modelsExistInProject.mockImplementation(() => false);
			expect(await Permissions.hasWriteAccessToContainer(generateRandomString(), generateRandomString(),
				generateRandomString(), viewerUser, true)).toBe(false);
		});
	});
};

const testHasCommenterAccessToContainer = () => {
	describe.each([
		[viewerUser, false, false],
		[collaboratorUser, false, true],
		[commenterUser, false, true],
		[projectAdminUser, false, false],
		[projectAdminUser, true, true],
		[tsAdminUser, false, false],
		[tsAdminUser, true, true],
		[tsAdminUser, undefined, true],
		[generateRandomString(), false, false],
		[generateRandomString(), true, false],
	])('Has commenter access to container', (user, adminCheck, result) => {
		test(`${user} ${result ? 'have' : 'does not have'} write access (adminCheck: ${adminCheck})`, async () => {
			Projects.modelsExistInProject.mockImplementation(() => true);
			expect(await Permissions.hasCommenterAccessToContainer(generateRandomString(), generateRandomString(),
				generateRandomString(), user, adminCheck)).toBe(result);
		});
	});

	describe('Has write access to container (2)', () => {
		test('should return false if the model does not belong to the project', async () => {
			Projects.modelsExistInProject.mockImplementation(() => false);
			expect(await Permissions.hasCommenterAccessToContainer(generateRandomString(), generateRandomString(),
				generateRandomString(), viewerUser, true)).toBe(false);
		});
	});
};

const testHasAdminAccessToContainer = () => {
	describe.each([
		[viewerUser, false],
		[collaboratorUser, false],
		[commenterUser, false],
		[projectAdminUser, true],
		[tsAdminUser, true],
		[generateRandomString(), false],
	])('Has admin access to container', (user, result) => {
		test(`${user} ${result ? 'have' : 'does not have'} admin access`, async () => {
			Projects.modelsExistInProject.mockImplementation(() => true);
			expect(await Permissions.hasAdminAccessToContainer(generateRandomString(), generateRandomString(),
				generateRandomString(), user)).toBe(result);
		});
	});

	describe('Container does not belong to the project', () => {
		test('should return false if the container does not belong to the project', async () => {
			Projects.modelsExistInProject.mockImplementation(() => false);
			expect(await Permissions.hasAdminAccessToContainer(generateRandomString(), generateRandomString(),
				generateRandomString(), viewerUser)).toBe(false);
		});
	});
};

const testHasReadAccessToDrawing = () => {
	describe.each([
		[viewerUser, false, true],
		[collaboratorUser, false, true],
		[commenterUser, false, true],
		[projectAdminUser, false, false],
		[projectAdminUser, true, true],
		[tsAdminUser, false, false],
		[tsAdminUser, true, true],
		[tsAdminUser, undefined, true],
		[generateRandomString(), false, false],
		[generateRandomString(), true, false],
	])('Has read access to drawing', (user, adminCheck, result) => {
		test(`${user} ${result ? 'have' : 'does not have'} read access (adminCheck: ${adminCheck})`, async () => {
			Projects.modelsExistInProject.mockImplementation(() => true);
			expect(await Permissions.hasReadAccessToDrawing(generateRandomString(), generateRandomString(),
				generateRandomString(), user, adminCheck)).toBe(result);
		});
	});

	describe('Drawing does not belong to the project', () => {
		test('should return false if the drawing does not belong to the project', async () => {
			Projects.modelsExistInProject.mockImplementation(() => false);
			expect(await Permissions.hasReadAccessToDrawing(generateRandomString(), generateRandomString(),
				generateRandomString(), viewerUser, true)).toBe(false);
		});
	});
};

const testHasWriteAccessToDrawing = () => {
	describe.each([
		[viewerUser, false, false],
		[collaboratorUser, false, true],
		[commenterUser, false, false],
		[projectAdminUser, false, false],
		[projectAdminUser, true, true],
		[tsAdminUser, false, false],
		[tsAdminUser, true, true],
		[tsAdminUser, undefined, true],
		[generateRandomString(), false, false],
		[generateRandomString(), true, false],
	])('Has write access to drawing', (user, adminCheck, result) => {
		test(`${user} ${result ? 'have' : 'does not have'} write access (adminCheck: ${adminCheck})`, async () => {
			Projects.modelsExistInProject.mockImplementation(() => true);
			expect(await Permissions.hasWriteAccessToDrawing(generateRandomString(), generateRandomString(),
				generateRandomString(), user, adminCheck)).toBe(result);
		});
	});

	describe('Has write access to drawing (2)', () => {
		test('should return false if the drawing does not belong to the project', async () => {
			Projects.modelsExistInProject.mockImplementation(() => false);
			expect(await Permissions.hasWriteAccessToDrawing(generateRandomString(), generateRandomString(),
				generateRandomString(), viewerUser, true)).toBe(false);
		});
	});
};

const testHasCommenterAccessToDrawing = () => {
	describe.each([
		[viewerUser, false, false],
		[collaboratorUser, false, true],
		[commenterUser, false, true],
		[projectAdminUser, false, false],
		[projectAdminUser, true, true],
		[tsAdminUser, false, false],
		[tsAdminUser, true, true],
		[tsAdminUser, undefined, true],
		[generateRandomString(), false, false],
		[generateRandomString(), true, false],
	])('Has commenter access to drawing', (user, adminCheck, result) => {
		test(`${user} ${result ? 'have' : 'does not have'} commenter access (adminCheck: ${adminCheck})`, async () => {
			Projects.modelsExistInProject.mockImplementation(() => true);
			expect(await Permissions.hasCommenterAccessToDrawing(generateRandomString(), generateRandomString(),
				generateRandomString(), user, adminCheck)).toBe(result);
		});
	});

	describe('Has commenter access to drawing (2)', () => {
		test('should return false if the model does not belong to the project', async () => {
			Projects.modelsExistInProject.mockImplementation(() => false);
			expect(await Permissions.hasCommenterAccessToDrawing(generateRandomString(), generateRandomString(),
				generateRandomString(), viewerUser, true)).toBe(false);
		});
	});
};

const testHasAdminAccessToDrawing = () => {
	describe.each([
		[viewerUser, false],
		[collaboratorUser, false],
		[commenterUser, false],
		[projectAdminUser, true],
		[tsAdminUser, true],
		[generateRandomString(), false],
	])('Has admin access to drawing', (user, result) => {
		test(`${user} ${result ? 'have' : 'does not have'} admin access`, async () => {
			Projects.modelsExistInProject.mockResolvedValueOnce(true);
			expect(await Permissions.hasAdminAccessToDrawing(generateRandomString(), generateRandomString(),
				generateRandomString(), user)).toBe(result);
		});
	});

	describe('Drawing does not belong to the project', () => {
		test('should return false if the drawing does not belong to the project', async () => {
			Projects.modelsExistInProject.mockResolvedValueOnce(false);
			expect(await Permissions.hasAdminAccessToDrawing(generateRandomString(), generateRandomString(),
				generateRandomString(), viewerUser)).toBe(false);
		});
	});
};

const testHasReadAccessToFederation = () => {
	describe.each([
		[viewerUser, false, true],
		[collaboratorUser, false, true],
		[commenterUser, false, true],
		[projectAdminUser, false, false],
		[projectAdminUser, true, true],
		[tsAdminUser, false, false],
		[tsAdminUser, true, true],
		[tsAdminUser, undefined, true],
		[generateRandomString(), false, false],
		[generateRandomString(), true, false],
	])('Has read access to federation', (user, adminCheck, result) => {
		test(`${user} ${result ? 'have' : 'does not have'} read access (adminCheck: ${adminCheck})`, async () => {
			Projects.modelsExistInProject.mockImplementation(() => true);
			expect(await Permissions.hasReadAccessToFederation(generateRandomString(), generateRandomString(),
			 generateRandomString(), user, adminCheck)).toBe(result);
		});
	});

	describe('Federation does not belong to the project', () => {
		test('should return false if the federation does not belong to the project', async () => {
			Projects.modelsExistInProject.mockImplementation(() => false);
			expect(await Permissions.hasReadAccessToFederation(generateRandomString(), generateRandomString(),
				generateRandomString(), viewerUser, true)).toBe(false);
		});
	});
};

const testHasWriteAccessToFederation = () => {
	describe.each([
		[viewerUser, false, false],
		[collaboratorUser, false, true],
		[commenterUser, false, false],
		[projectAdminUser, false, false],
		[projectAdminUser, true, true],
		[tsAdminUser, false, false],
		[tsAdminUser, true, true],
		[tsAdminUser, undefined, true],
		[generateRandomString(), false, false],
		[generateRandomString(), true, false],
	])('Has write access to federation', (user, adminCheck, result) => {
		test(`${user} ${result ? 'have' : 'does not have'} write access (adminCheck: ${adminCheck})`, async () => {
			Projects.modelsExistInProject.mockImplementation(() => true);
			expect(await Permissions.hasWriteAccessToFederation(generateRandomString(), generateRandomString(),
				generateRandomString(), user, adminCheck)).toBe(result);
		});
	});

	describe('Has write access to federation (2)', () => {
		test('should return false if the federation does not belong to the project', async () => {
			Projects.modelsExistInProject.mockImplementation(() => false);
			expect(await Permissions.hasWriteAccessToFederation(generateRandomString(), generateRandomString(),
				generateRandomString(), viewerUser, true)).toBe(false);
		});
	});
};

const testHasCommenterAccessToFederation = () => {
	describe.each([
		[viewerUser, false, false],
		[collaboratorUser, false, true],
		[commenterUser, false, true],
		[projectAdminUser, false, false],
		[projectAdminUser, true, true],
		[tsAdminUser, false, false],
		[tsAdminUser, true, true],
		[tsAdminUser, undefined, true],
		[generateRandomString(), false, false],
		[generateRandomString(), true, false],
	])('Has commenter access to federation', (user, adminCheck, result) => {
		test(`${user} ${result ? 'have' : 'does not have'} commenter access (adminCheck: ${adminCheck})`, async () => {
			Projects.modelsExistInProject.mockImplementation(() => true);
			expect(await Permissions.hasCommenterAccessToFederation(generateRandomString(), generateRandomString(),
				generateRandomString(), user, adminCheck)).toBe(result);
		});
	});

	describe('Has commenter access to federation (2)', () => {
		test('should return false if the model does not belong to the project', async () => {
			Projects.modelsExistInProject.mockImplementation(() => false);
			expect(await Permissions.hasCommenterAccessToFederation(generateRandomString(), generateRandomString(),
				generateRandomString(), viewerUser, true)).toBe(false);
		});
	});
};

const testHasAdminAccessToFederation = () => {
	describe.each([
		[viewerUser, false],
		[collaboratorUser, false],
		[commenterUser, false],
		[projectAdminUser, true],
		[tsAdminUser, true],
		[generateRandomString(), false],
	])('Has admin access to federation', (user, result) => {
		test(`${user} ${result ? 'have' : 'does not have'} admin access`, async () => {
			Projects.modelsExistInProject.mockResolvedValueOnce(() => true);
			expect(await Permissions.hasAdminAccessToFederation(generateRandomString(), generateRandomString(),
				generateRandomString(), user)).toBe(result);
		});
	});

	describe('Federation does not belong to the project', () => {
		test('should return false if the federation does not belong to the project', async () => {
			Projects.modelsExistInProject.mockResolvedValueOnce(() => false);
			expect(await Permissions.hasAdminAccessToFederation(generateRandomString(), generateRandomString(),
				generateRandomString(), viewerUser)).toBe(false);
		});
	});
};

const testHasReadAccessToMultipleContainers = () => {
	describe.each([
		[viewerUser, false, true],
		[collaboratorUser, false, true],
		[commenterUser, false, true],
		[projectAdminUser, false, false],
		[projectAdminUser, true, true],
		[tsAdminUser, false, false],
		[tsAdminUser, true, true],
		[tsAdminUser, undefined, true],
		[generateRandomString(), false, false],
		[generateRandomString(), true, false],
	])('Has read access to containers', (user, adminCheck, result) => {
		test(`${user} ${result ? 'have' : 'does not have'} read access (adminCheck: ${adminCheck})`, async () => {
			Projects.modelsExistInProject.mockResolvedValueOnce(() => true);
			expect(await Permissions.hasReadAccessToMultipleContainers(generateRandomString(), generateRandomString(),
				times(3, () => generateRandomString()), user, adminCheck)).toBe(result);
		});
	});
};

const testHasReadAccessToMultipleDrawings = () => {
	describe.each([
		[viewerUser, false, true],
		[collaboratorUser, false, true],
		[commenterUser, false, true],
		[projectAdminUser, false, false],
		[projectAdminUser, true, true],
		[tsAdminUser, false, false],
		[tsAdminUser, true, true],
		[tsAdminUser, undefined, true],
		[generateRandomString(), false, false],
		[generateRandomString(), true, false],
	])('Has read access to drawings', (user, adminCheck, result) => {
		test(`${user} ${result ? 'have' : 'does not have'} read access (adminCheck: ${adminCheck})`, async () => {
			Projects.modelsExistInProject.mockResolvedValueOnce(() => true);
			expect(await Permissions.hasReadAccessToMultipleDrawings(generateRandomString(), generateRandomString(),
				times(3, () => generateRandomString()), user, adminCheck)).toBe(result);
		});
	});
};

const testHasReadAccessToMultipleFederations = () => {
	describe.each([
		[viewerUser, false, true],
		[collaboratorUser, false, true],
		[commenterUser, false, true],
		[projectAdminUser, false, false],
		[projectAdminUser, true, true],
		[tsAdminUser, false, false],
		[tsAdminUser, true, true],
		[tsAdminUser, undefined, true],
		[generateRandomString(), false, false],
		[generateRandomString(), true, false],
	])('Has read access to federations', (user, adminCheck, result) => {
		test(`${user} ${result ? 'have' : 'does not have'} read access (adminCheck: ${adminCheck})`, async () => {
			Projects.modelsExistInProject.mockResolvedValueOnce(() => true);
			expect(await Permissions.hasReadAccessToMultipleFederations(generateRandomString(), generateRandomString(),
				times(3, () => generateRandomString()), user, adminCheck)).toBe(result);
		});
	});
};

const testCheckModelExists = () => {
	describe('Check model exists', () => {
		const models = times(2, () => generateRandomString());
		const modelSettingsResponse = models.map((model) => ({ _id: model }));
		const generateTests = (modelType, callbackFn) => [
			['Models exist and are in project', modelType, callbackFn, modelSettingsResponse, true],
			['Models exist but are not in project', modelType, callbackFn, modelSettingsResponse, false],
			['Some models exist are not in project', modelType, callbackFn, modelSettingsResponse.slice(0, 1), false],
			['No models exist', modelType, callbackFn, [], true],
		];

		const runTest = (desc, modelType, callbackFn, callbackFnResponse, modelExists) => {
			test(`(modelType: ${modelType}) ${desc}`, async () => {
				ModelSettings[callbackFn].mockResolvedValueOnce(callbackFnResponse);
				if (models.length === callbackFnResponse.length) {
					Projects.modelsExistInProject.mockResolvedValueOnce(modelExists);
				}

				const teamspace = generateRandomString();
				const project = generateRandomString();

				const res = await Permissions.checkModelsExists(teamspace, project, models, modelType);

				expect(ModelSettings[callbackFn]).toHaveBeenCalledTimes(1);
				expect(ModelSettings[callbackFn]).toHaveBeenCalledWith(teamspace, models, { permissions: 1 });
				if (models.length !== callbackFnResponse.length) {
					expect(Projects.modelsExistInProject).not.toHaveBeenCalled();
				} else {
					expect(Projects.modelsExistInProject).toHaveBeenCalledTimes(1);
					expect(Projects.modelsExistInProject).toHaveBeenCalledWith(teamspace, project, models);
				}

				if (!modelExists || !callbackFnResponse.length) {
					expect(res).toBeFalsy();
				} else {
					expect(res).toBeTruthy();
				}
			});
		};

		describe.each(generateTests(undefined, 'getMultipleModelsByIds'))('Undefined model', runTest);
		describe.each(generateTests(modelTypes.CONTAINER, 'getContainers'))('Container model', runTest);
		describe.each(generateTests(modelTypes.FEDERATION, 'getFederations'))('Federation model', runTest);
		describe.each(generateTests(modelTypes.DRAWING, 'getDrawings'))('Drawing model', runTest);
	});
};

describe(determineTestGroup(__filename), () => {
	testCheckModelExists();

	testIsTeamspaceAdmin();
	testIsProjectAdmin();
	testHasProjectAdminPermissions();
	testHasReadAccessToSomeModels();
	testHasReadAccessToModel();
	testHasWriteAccessToModel();
	testHasCommenterAccessToModel();

	testHasReadAccessToContainer();
	testHasReadAccessToMultipleContainers();
	testHasWriteAccessToContainer();
	testHasCommenterAccessToContainer();
	testHasAdminAccessToContainer();

	testHasReadAccessToDrawing();
	testHasReadAccessToMultipleDrawings();
	testHasWriteAccessToDrawing();
	testHasCommenterAccessToDrawing();
	testHasAdminAccessToDrawing();

	testHasReadAccessToFederation();
	testHasReadAccessToMultipleFederations();
	testHasWriteAccessToFederation();
	testHasCommenterAccessToFederation();
	testHasAdminAccessToFederation();
});
