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

const { MODEL_CATEGORIES } = require('../../../../../../src/v5/models/modelSettings.constants');
const { COL_NAME } = require('../../../../../../src/v5/models/projectSettings.constants');
const { src } = require('../../../../helper/path');
const { generateRandomString } = require('../../../../helper/services');

jest.mock('../../../../../../src/v5/models/projectSettings');
const ProjectsModel = require(`${src}/models/projectSettings`);

jest.mock('../../../../../../src/v5/services/filesManager');
const FilesManager = require(`${src}/services/filesManager`);

jest.mock('../../../../../../src/v5/models/tickets.templates');
const TemplatesModel = require(`${src}/models/tickets.templates`);

jest.mock('../../../../../../src/v5/utils/helper/models');
const ModelHelper = require(`${src}/utils/helper/models`);

const Projects = require(`${src}/processors/teamspaces/projects`);
const { PROJECT_ADMIN } = require(`${src}/utils/permissions/permissions.constants`);

const projectList = [
	{ _id: '1', name: 'project1', permissions: [{ user: 'projAdmin', permissions: [PROJECT_ADMIN] }], models: ['modelA'] },
	{ _id: '2', name: 'project2', permissions: [{ user: 'projAdmin', permissions: [PROJECT_ADMIN] }], models: ['modelB'] },
	{ _id: '3', name: 'project3', permissions: [{ user: 'mixedUser', permissions: [PROJECT_ADMIN] }], models: [] },
	{ _id: '4', name: 'project4', permissions: [], models: [] },
];

const modelReadPermissions = {
	modelA: ['modelUser', 'mixedUser'],
	modelB: ['mixedUser'],
};

ProjectsModel.getProjectList.mockImplementation(() => projectList);
const deleteProjectMock = ProjectsModel.deleteProject.mockImplementation(() => {});
const createProjectMock = ProjectsModel.createProject.mockImplementation(() => {});
const getProjectByIdMock = ProjectsModel.getProjectById
	.mockImplementation((teamspace, projectId) => projectList.find((p) => p._id === projectId));
const removeModelDataMock = ModelHelper.removeModelData.mockImplementation(() => {});

// Permissions mock
jest.mock('../../../../../../src/v5/utils/permissions/permissions', () => ({
	...jest.requireActual('../../../../../../src/v5/utils/permissions/permissions'),
	isTeamspaceAdmin: jest.fn().mockImplementation((teamspace, user) => user === 'tsAdmin'),
	hasReadAccessToSomeModels: jest.fn()
		.mockImplementation((teamspace, project, models, user) => models.some(
			(model) => (modelReadPermissions[model] || []).includes(user))),
}));

const determineProjectListResult = (username) => projectList.flatMap(({ permissions, _id, name, models }) => {
	const isAdmin = permissions.some((permEntry) => permEntry.user === username
		&& permEntry.permissions.includes(PROJECT_ADMIN));
	const hasModelAccess = models.some((model) => (modelReadPermissions[model] || []).includes(username));
	return isAdmin || hasModelAccess ? { _id, name, isAdmin } : [];
});

const testGetProjectList = () => {
	describe('Get project list by user', () => {
		test('should return the whole list if the user is a teamspace admin', async () => {
			const res = await Projects.getProjectList('teamspace', 'tsAdmin');
			const expectedRes = projectList.map(({ _id, name }) => ({ _id, name, isAdmin: true }));
			expect(res).toEqual(expectedRes);
		});
		test('should return a partial list if the user is a project admin in some projects', async () => {
			const res = await Projects.getProjectList('teamspace', 'projAdmin');
			expect(res).toEqual(determineProjectListResult('projAdmin'));
		});
		test('should return a partial list if the user has model access in some projects', async () => {
			const res = await Projects.getProjectList('teamspace', 'modelUser');
			expect(res).toEqual(determineProjectListResult('modelUser'));
		});
		test('should return a partial list if the user has model access in some projects and admin access in others', async () => {
			const res = await Projects.getProjectList('teamspace', 'mixedUser');
			expect(res).toEqual(determineProjectListResult('mixedUser'));
		});
		test('should return empty array if the user has no access', async () => {
			const res = await Projects.getProjectList('teamspace', 'nobody');
			expect(res).toEqual([]);
		});
	});
};

const testDeleteProject = () => {
	describe('Delete a project', () => {
		test('should delete a project with no models', async () => {
			await Projects.deleteProject('teamspace', '3');
			expect(getProjectByIdMock.mock.calls.length).toEqual(1);
			expect(getProjectByIdMock.mock.calls[0][0]).toEqual('teamspace');
			expect(getProjectByIdMock.mock.calls[0][1]).toEqual('3');
			expect(getProjectByIdMock.mock.calls[0][2]).toEqual({ models: 1 });
			expect(removeModelDataMock.mock.calls.length).toEqual(0);
			expect(deleteProjectMock.mock.calls.length).toEqual(1);
			expect(deleteProjectMock.mock.calls[0][0]).toEqual('teamspace');
			expect(deleteProjectMock.mock.calls[0][1]).toEqual('3');
		});

		test('should delete a project with no models', async () => {
			await Projects.deleteProject('teamspace', '1');
			expect(getProjectByIdMock.mock.calls.length).toEqual(1);
			expect(getProjectByIdMock.mock.calls[0][0]).toEqual('teamspace');
			expect(getProjectByIdMock.mock.calls[0][1]).toEqual('1');
			expect(getProjectByIdMock.mock.calls[0][2]).toEqual({ models: 1 });
			expect(removeModelDataMock.mock.calls.length).toEqual(1);
			expect(deleteProjectMock.mock.calls.length).toEqual(1);
			expect(deleteProjectMock.mock.calls[0][0]).toEqual('teamspace');
			expect(deleteProjectMock.mock.calls[0][1]).toEqual('1');
		});
	});
};

const testCreateProject = () => {
	describe('Create a project', () => {
		test('should create a project with no models', async () => {
			await Projects.createProject('teamspace', 'newName');
			expect(createProjectMock.mock.calls.length).toEqual(1);
			expect(createProjectMock.mock.calls[0][0]).toEqual('teamspace');
			expect(createProjectMock.mock.calls[0][1]).toEqual('newName');
		});
	});
};

const testGetProjectSettings = () => {
	describe('Get a project', () => {
		test('should return a project', async () => {
			const res = await Projects.getProjectSettings('teamspace', '1');
			expect(getProjectByIdMock.mock.calls[0][0]).toEqual('teamspace');
			expect(getProjectByIdMock.mock.calls[0][1]).toEqual('1');
			expect(getProjectByIdMock.mock.calls[0][2]).toEqual({ name: 1, _id: 0 });
			expect(res).toEqual(projectList.find((p) => p._id === '1'));
		});
	});
};

const testGetAllTemplates = () => {
	describe('Get all templates', () => {
		test('should return all templates available for the project', async () => {
			const teamspace = generateRandomString();
			const project = generateRandomString();
			const showDeprecated = false;
			const getDetails = false;

			const expectedOutput = [generateRandomString(), generateRandomString(), generateRandomString()];
			TemplatesModel.getAllTemplates.mockResolvedValueOnce(expectedOutput);

			await expect(Projects.getAllTemplates(teamspace, project, getDetails, showDeprecated))
				.resolves.toEqual(expectedOutput);

			expect(TemplatesModel.getAllTemplates).toHaveBeenCalledTimes(1);
			expect(TemplatesModel.getAllTemplates).toHaveBeenCalledWith(teamspace, showDeprecated,
				{ name: 1, code: 1, deprecated: 1 });
		});

		test('should return all templates available for the project (get details)', async () => {
			const teamspace = generateRandomString();
			const project = generateRandomString();
			const showDeprecated = false;
			const getDetails = true;

			const expectedOutput = [generateRandomString(), generateRandomString(), generateRandomString()];
			TemplatesModel.getAllTemplates.mockResolvedValueOnce(expectedOutput);

			await expect(Projects.getAllTemplates(teamspace, project, getDetails, showDeprecated))
				.resolves.toEqual(expectedOutput);

			expect(TemplatesModel.getAllTemplates).toHaveBeenCalledTimes(1);
			expect(TemplatesModel.getAllTemplates).toHaveBeenCalledWith(teamspace, showDeprecated, undefined);
		});
	});
};

const testGetImage = () => {
	describe('Get image', () => {
		test('Should get image', async () => {
			const teamspace = generateRandomString();
			const project = generateRandomString();
			const stream = generateRandomString();
			FilesManager.getFile.mockResolvedValueOnce(stream);

			const result = await Projects.getImage(teamspace, project);

			expect(result).toEqual(stream);
			expect(FilesManager.getFile).toHaveBeenCalledTimes(1);
			expect(FilesManager.getFile).toHaveBeenCalledWith(teamspace, COL_NAME, project);
		});

		test('should return whatever error is thrown from FilesManager', async () => {
			const teamspace = generateRandomString();
			const project = generateRandomString();
			const error = new Error(generateRandomString());
			FilesManager.getFile.mockRejectedValueOnce(error);

			await expect(Projects.getImage(teamspace, project)).rejects.toEqual(error);
			expect(FilesManager.getFile).toHaveBeenCalledTimes(1);
			expect(FilesManager.getFile).toHaveBeenCalledWith(teamspace, COL_NAME, project);
		});
	});
};

const testUpdateImage = () => {
	describe('Update image', () => {
		test('should update image', async () => {
			const teamspace = generateRandomString();
			const project = generateRandomString();
			const stream = generateRandomString();

			await Projects.updateImage(teamspace, project, stream);

			expect(FilesManager.storeFile).toHaveBeenCalledTimes(1);
			expect(FilesManager.storeFile).toHaveBeenCalledWith(teamspace, COL_NAME, project, stream);
		});

		test('should return whatever error is thrown from FilesManager', async () => {
			const teamspace = generateRandomString();
			const project = generateRandomString();
			const stream = generateRandomString();
			const error = new Error(generateRandomString());
			FilesManager.storeFile.mockRejectedValueOnce(error);

			await expect(Projects.updateImage(teamspace, project, stream)).rejects.toEqual(error);
			expect(FilesManager.storeFile).toHaveBeenCalledTimes(1);
			expect(FilesManager.storeFile).toHaveBeenCalledWith(teamspace, COL_NAME, project, stream);
		});
	});
};

const testDeleteImage = () => {
	describe('Delete image', () => {
		test('should delete image', async () => {
			const teamspace = generateRandomString();
			const project = generateRandomString();

			await Projects.deleteImage(teamspace, project);

			expect(FilesManager.removeFile).toHaveBeenCalledTimes(1);
			expect(FilesManager.removeFile).toHaveBeenCalledWith(teamspace, COL_NAME, project);
		});

		test('should return whatever error is thrown from FilesManager', async () => {
			const teamspace = generateRandomString();
			const project = generateRandomString();
			const error = new Error(generateRandomString());
			FilesManager.removeFile.mockRejectedValueOnce(error);

			await expect(Projects.deleteImage(teamspace, project)).rejects.toEqual(error);
			expect(FilesManager.removeFile).toHaveBeenCalledTimes(1);
			expect(FilesManager.removeFile).toHaveBeenCalledWith(teamspace, COL_NAME, project);
		});
	});
};

const testGetDrawingCategories = () => {
	describe('Get drawing categories', () => {
		test('should get drawing categories', async () => {
			await expect(Projects.getDrawingCategories()).toEqual(MODEL_CATEGORIES);
		});
	});
};

describe('processors/teamspaces/projects', () => {
	testGetProjectList();
	testDeleteProject();
	testCreateProject();
	testGetProjectSettings();
	testGetAllTemplates();
	testGetImage();
	testUpdateImage();
	testDeleteImage();
	testGetDrawingCategories();
});
