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

const { src } = require('../../helper/path');

const Project = require(`${src}/models/projects`);
const db = require(`${src}/handler/db`);
const { templates } = require(`${src}/utils/responseCodes`);
const { PROJECT_ADMIN } = require(`${src}/utils/permissions/permissions.constants`);

const testProjectAdmins = () => {
	describe('Get project admins', () => {
		test('should return list of admins if project exists', async () => {
			const expectedData = {
				permissions: [
					{ user: 'personA', permissions: [PROJECT_ADMIN] },
					{ user: 'personB', permissions: ['someOtherPerm'] },
					{ user: 'personC', permissions: [PROJECT_ADMIN] },
				],
			};
			jest.spyOn(db, 'findOne').mockResolvedValue(expectedData);

			const res = await Project.getProjectAdmins('someTS', 'someProject');
			expect(res).toEqual(['personA', 'personC']);
		});

		test('should return error if project does not exists', async () => {
			jest.spyOn(db, 'findOne').mockResolvedValue(undefined);

			await expect(Project.getProjectAdmins('someTS', 'someProject'))
				.rejects.toEqual(templates.projectNotFound);
		});
	});
};

const testGetProjectList = () => {
	describe('Get project list', () => {
		test('should return list of projects', async () => {
			const teamspace = 'someTS';
			const expectedData = [
				{ _id: 1, name: 'proj1' },
				{ _id: 2, name: 'proj2' },
				{ _id: 3, name: 'proj3' },
				{ _id: 4, name: 'proj4' },
				{ _id: 5, name: 'proj5' },
			];
			const fn = jest.spyOn(db, 'find').mockResolvedValue(expectedData);

			const res = await Project.getProjectList(teamspace);
			expect(res).toEqual(expectedData);
			expect(fn.mock.calls.length).toBe(1);
			expect(fn.mock.calls[0][0]).toEqual(teamspace);
			expect(fn.mock.calls[0][1]).toEqual('projects');
			expect(fn.mock.calls[0][2]).toEqual({});
			expect(fn.mock.calls[0][3]).toEqual({ _id: 1, name: 1 });
		});
	});
};

const testAddProjectModel = () => {
	describe('Add project model', () => {
		test('should add model to project models', async () => {
			const teamspace = 'someTS';
			const projectId = 'someProject';
			const modelId = 'someModel';
			const expectedData = {
				matchedCount: 1,
				modifiedCount: 1,
				upsertedId: projectId,
			};
			const fn = jest.spyOn(db, 'updateOne').mockResolvedValue(expectedData);

			const res = await Project.addModelToProject(teamspace, projectId, modelId);
			expect(res).toEqual(expectedData);
			expect(fn.mock.calls.length).toBe(1);
			expect(fn.mock.calls[0][0]).toEqual(teamspace);
			expect(fn.mock.calls[0][1]).toEqual('projects');
			expect(fn.mock.calls[0][2]).toEqual({ _id: projectId });
			expect(fn.mock.calls[0][3]).toEqual({ $push: { models: modelId } });
		});
	});
};

const testRemoveProjectModel = () => {
	describe('Remove project model', () => {
		test('should remove model from project models', async () => {
			const teamspace = 'someTS';
			const projectId = 'someProject';
			const modelId = 'someModel';
			const fn = jest.spyOn(db, 'updateOne').mockResolvedValue();

			await Project.removeModelFromProject(teamspace, projectId, modelId);
			expect(fn.mock.calls.length).toBe(1);
			expect(fn.mock.calls[0][0]).toEqual(teamspace);
			expect(fn.mock.calls[0][1]).toEqual('projects');
			expect(fn.mock.calls[0][2]).toEqual({ _id: projectId });
			expect(fn.mock.calls[0][3]).toEqual({ $pull: { models: modelId } });
		});
	});
};

const testModelExistsInProject = () => {
	describe('Model Exists In Project', () => {
		test('should return error if the project does not exist', async () => {
			jest.spyOn(db, 'findOne').mockResolvedValue(undefined);

			await expect(Project.modelExistsInProject('someTS', 'someProject', 'a'))
				.rejects.toEqual(templates.projectNotFound);
		});

		test('should return true if a model is part of a project', async () => {
			const project = { models: ['a', 'b', 'c'] };
			jest.spyOn(db, 'findOne').mockResolvedValue(project);
			const res = await Project.modelExistsInProject('someTS', 'someProject', 'a');
			expect(res).toBe(true);
		});

		test('should return false if a model is not part of a project', async () => {
			const project = { models: ['a', 'b', 'c'] };
			jest.spyOn(db, 'findOne').mockResolvedValue(project);
			const res = await Project.modelExistsInProject('someTS', 'someProject', 'd');
			expect(res).toBe(false);
		});
	});
};

describe('models/projects', () => {
	testProjectAdmins();
	testGetProjectList();
	testAddProjectModel();
	testRemoveProjectModel();
	testModelExistsInProject();
});
