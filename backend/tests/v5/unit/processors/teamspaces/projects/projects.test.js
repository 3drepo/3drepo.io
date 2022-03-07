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

jest.mock('../../../../../../src/v5/models/projects');
const ProjectsModel = require(`${src}/models/projects`);
jest.mock('../../../../../../src/v5/utils/helper/models');
const ModelHelper = require(`${src}/utils/helper/models`);
const Projects = require(`${src}/processors/teamspaces/projects/projects`);
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
const getProjectByQueryMock = ProjectsModel.getProjectByQuery
	.mockImplementation((teamspace, query) => projectList.find((p) => p._id === query._id));
const removeModelDataMock = ModelHelper.removeModelData.mockImplementation(() => {});

// Permissions mock
jest.mock('../../../../../../src/v5/utils/permissions/permissions', () => ({
	...jest.requireActual('../../../../../../src/v5/utils/permissions/permissions'),
	isTeamspaceAdmin: jest.fn().mockImplementation((teamspace, user) => user === 'tsAdmin'),
	hasReadAccessToModel: jest.fn()
		.mockImplementation((teamspace, model, user) => (modelReadPermissions[model] || []).includes(user)),
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
			expect(getProjectByQueryMock.mock.calls.length).toEqual(1);
			expect(getProjectByQueryMock.mock.calls[0][0]).toEqual('teamspace');
			expect(getProjectByQueryMock.mock.calls[0][1]).toEqual({ _id: '3' });
			expect(getProjectByQueryMock.mock.calls[0][2]).toEqual({ models: 1 });
			expect(removeModelDataMock.mock.calls.length).toEqual(0);
			expect(deleteProjectMock.mock.calls.length).toEqual(1);
			expect(deleteProjectMock.mock.calls[0][0]).toEqual('teamspace');
			expect(deleteProjectMock.mock.calls[0][1]).toEqual('3');
		});

		test('should delete a project with no models', async () => {
			await Projects.deleteProject('teamspace', '1');
			expect(getProjectByQueryMock.mock.calls.length).toEqual(1);
			expect(getProjectByQueryMock.mock.calls[0][0]).toEqual('teamspace');
			expect(getProjectByQueryMock.mock.calls[0][1]).toEqual({ _id: '1' });
			expect(getProjectByQueryMock.mock.calls[0][2]).toEqual({ models: 1 });
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
			expect(createProjectMock.mock.calls[0][1]).toEqual({ name: 'newName', models: [], permissions: [] });
		});
	});
};

const testGetProject = () => {
	describe('Get a project', () => {
		test('should return a project', async () => {
			const res = await Projects.getProject('teamspace', '1');
			expect(getProjectByQueryMock.mock.calls[0][0]).toEqual('teamspace');
			expect(getProjectByQueryMock.mock.calls[0][1]).toEqual({ _id: '1'});
			expect(getProjectByQueryMock.mock.calls[0][2]).toEqual({ name: 1, _id: 0 });
			expect(res).toEqual(projectList.find(p => p._id === '1'));
		});
	});
};

describe('processors/teamspaces/projects', () => {
	testGetProjectList();
	testDeleteProject();
	testCreateProject();
	testGetProject();
});
