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

const DbConstants = require('../../../../src/v5/handler/db.constants');
const { src } = require('../../helper/path');
const { generateRandomString } = require('../../helper/services');

const Project = require(`${src}/models/projectSettings`);
const db = require(`${src}/handler/db`);
const { templates } = require(`${src}/utils/responseCodes`);
const { PROJECT_ADMIN } = require(`${src}/utils/permissions/permissions.constants`);
const { isUUIDString } = require(`${src}/utils/helper/typeCheck`);

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

const testFindProjectByModelId = () => {
	describe('Get project by model Id', () => {
		test('should return a project if there is a match', async () => {
			const data = { _id: generateRandomString() };
			const fn = jest.spyOn(db, 'findOne').mockResolvedValue(data);

			const teamspace = generateRandomString();
			const model = generateRandomString();
			const projection = { _id: 1 };
			await expect(Project.findProjectByModelId(teamspace, model, projection)).resolves.toEqual(data);
			expect(fn).toHaveBeenCalledWith(teamspace, 'projects', { models: model }, projection);
		});

		test('should throw project not found if it is not available', async () => {
			const fn = jest.spyOn(db, 'findOne').mockResolvedValue(undefined);

			const teamspace = generateRandomString();
			const model = generateRandomString();
			const projection = { _id: 1 };
			await expect(Project.findProjectByModelId(
				teamspace, model, projection,
			)).rejects.toEqual(templates.projectNotFound);
			expect(fn).toHaveBeenCalledWith(teamspace, 'projects', { models: model }, projection);
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

const testModelsExistInProject = () => {
	describe('Models Exist In Project', () => {
		test('should return error if the project does not exist', async () => {
			jest.spyOn(db, 'findOne').mockResolvedValue(undefined);

			await expect(Project.modelsExistInProject('someTS', 'someProject', ['a']))
				.rejects.toEqual(templates.projectNotFound);
		});

		test('should return true if a model is part of a project', async () => {
			const project = { models: ['a', 'b', 'c'] };
			jest.spyOn(db, 'findOne').mockResolvedValue(project);
			const res = await Project.modelsExistInProject('someTS', 'someProject', ['a']);
			expect(res).toBe(true);
		});

		test('should return true if models are part of a project', async () => {
			const project = { models: ['a', 'b', 'c'] };
			jest.spyOn(db, 'findOne').mockResolvedValue(project);
			const res = await Project.modelsExistInProject('someTS', 'someProject', ['a', 'b']);
			expect(res).toBe(true);
		});

		test('should return false if a model is not part of a project', async () => {
			const project = { models: ['a', 'b', 'c'] };
			jest.spyOn(db, 'findOne').mockResolvedValue(project);
			const res = await Project.modelsExistInProject('someTS', 'someProject', ['d']);
			expect(res).toBe(false);
		});

		test('should return false if a model is not part of a project', async () => {
			const project = { models: ['a', 'b', 'c'] };
			jest.spyOn(db, 'findOne').mockResolvedValue(project);
			const res = await Project.modelsExistInProject('someTS', 'someProject', ['a', 'b', 'd']);
			expect(res).toBe(false);
		});

		test('should return false if the array is empty', async () => {
			const project = { models: ['a', 'b', 'c'] };
			jest.spyOn(db, 'findOne').mockResolvedValue(project);
			const res = await Project.modelsExistInProject('someTS', 'someProject', []);
			expect(res).toBe(false);
		});
	});
};

const testCreateProject = () => {
	describe('Create New Project', () => {
		class CustomTestError extends Error {
			constructor(message, code) {
				super(message);
				this.name = this.constructor.name;
				this.code = code;
			}
		}
		test('should add and return a project', async () => {
			const fn = jest.spyOn(db, 'insertOne').mockResolvedValue();

			const res = await Project.createProject('someTS', { name: 'newName' });

			expect(fn.mock.calls.length).toBe(1);
			expect(fn.mock.calls[0][0]).toEqual('someTS');
			expect(fn.mock.calls[0][1]).toEqual('projects');
			expect(fn.mock.calls[0][2].name).toEqual({ name: 'newName' });
			expect(fn.mock.calls[0][2]).toHaveProperty('_id');
			expect(fn.mock.calls[0][2]).toHaveProperty('createdAt');
			expect(isUUIDString(fn.mock.calls[0][2]._id));
			expect(res).toEqual(fn.mock.calls[0][2]._id);
		});
		test('should throw invalidArguments if duplicate index', async () => {
			const fn = jest.spyOn(db, 'insertOne').mockRejectedValue(new CustomTestError('Some index duplicate error message', DbConstants.DUPLICATE_CODE));

			const res = await Project.createProject('otherTS', { name: 'newNameTheSequel' }).catch((err) => err);

			expect(res.message).toBe(templates.invalidArguments.message);
			expect(fn.mock.calls.length).toBe(1);
			expect(fn.mock.calls[0][0]).toEqual('otherTS');
			expect(fn.mock.calls[0][1]).toEqual('projects');
			expect(fn.mock.calls[0][2].name).toEqual({ name: 'newNameTheSequel' });
			expect(fn.mock.calls[0][2]).toHaveProperty('_id');
			expect(fn.mock.calls[0][2]).toHaveProperty('createdAt');
			expect(isUUIDString(fn.mock.calls[0][2]._id));
		});
		test('should throw the error that the db has thrown', async () => {
			const fn = jest.spyOn(db, 'insertOne').mockRejectedValue(new CustomTestError('Some db error message', 123456));

			const res = await Project.createProject('otherTS', { name: 'newNameTheSequel' }).catch((err) => err);

			expect(res.message).toBe('Some db error message');
			expect(fn.mock.calls.length).toBe(1);
			expect(fn.mock.calls[0][0]).toEqual('otherTS');
			expect(fn.mock.calls[0][1]).toEqual('projects');
			expect(fn.mock.calls[0][2].name).toEqual({ name: 'newNameTheSequel' });
			expect(fn.mock.calls[0][2]).toHaveProperty('_id');
			expect(fn.mock.calls[0][2]).toHaveProperty('createdAt');
			expect(isUUIDString(fn.mock.calls[0][2]._id));
		});
	});
};

const testDeleteProject = () => {
	describe('Delete Project', () => {
		test('should delete a project', async () => {
			const fn = jest.spyOn(db, 'deleteOne').mockResolvedValue({ deletedCount: 1 });
			await Project.deleteProject('someTS', 'project Id');
			expect(fn.mock.calls.length).toBe(1);
			expect(fn.mock.calls[0][0]).toEqual('someTS');
			expect(fn.mock.calls[0][1]).toEqual('projects');
			expect(fn.mock.calls[0][2]).toEqual({ _id: 'project Id' });
		});
	});
};

const testUpdateProject = () => {
	describe('Update Project', () => {
		test('should edit a project', async () => {
			const fn = jest.spyOn(db, 'updateOne').mockResolvedValue({ matchedCount: 1 });
			await Project.updateProject('someTS', 'project Id', { name: 'newName' });
			expect(fn.mock.calls.length).toBe(1);
			expect(fn.mock.calls[0][0]).toEqual('someTS');
			expect(fn.mock.calls[0][1]).toEqual('projects');
			expect(fn.mock.calls[0][2]).toEqual({ _id: 'project Id' });
			expect(fn.mock.calls[0][3]).toEqual({ $set: { name: 'newName' } });
		});
	});
};

const testGetProjectByName = () => {
	describe('Get Project by Name', () => {
		test('should return a project', async () => {
			const fn = jest.spyOn(db, 'findOne').mockResolvedValueOnce('project');
			const teamspace = generateRandomString();
			const project = generateRandomString();
			await Project.getProjectByName(teamspace, project);
			expect(fn).toHaveBeenCalledTimes(1);
			// eslint-disable-next-line security/detect-non-literal-regexp
			expect(fn).toHaveBeenCalledWith(teamspace, 'projects', { name: new RegExp(`^${project}$`, 'i') }, undefined);
		});

		test('should return error if project is not found', async () => {
			jest.spyOn(db, 'findOne').mockResolvedValue(undefined);
			await expect(Project.getProjectByName('someTS', 'project name')).rejects.toEqual(templates.projectNotFound);
		});
	});
};

const testGetProjectById = () => {
	describe('Get Project by id', () => {
		test('should return a project', async () => {
			const fn = jest.spyOn(db, 'findOne').mockResolvedValue('project');
			await Project.getProjectById('someTS', 'project id');
			expect(fn.mock.calls.length).toBe(1);
			expect(fn.mock.calls[0][0]).toEqual('someTS');
			expect(fn.mock.calls[0][1]).toEqual('projects');
			expect(fn.mock.calls[0][2]).toEqual({ _id: 'project id' });
		});

		test('should return error if project is not found', async () => {
			jest.spyOn(db, 'findOne').mockResolvedValue(undefined);
			await expect(Project.getProjectById('someTS', 'project id')).rejects.toEqual(templates.projectNotFound);
		});
	});
};

const testRemoveUserFromAllProjects = () => {
	describe('Remove user from all projects', () => {
		test('Should trigger a query to remove user from all projects', async () => {
			const teamspace = generateRandomString();
			const user = generateRandomString();
			const fn = jest.spyOn(db, 'updateMany').mockResolvedValueOnce();
			await expect(Project.removeUserFromAllProjects(teamspace, user)).resolves.toBeUndefined();

			expect(fn).toHaveBeenCalledTimes(1);
			expect(fn).toHaveBeenCalledWith(teamspace, 'projects',
				{ 'permissions.user': user },
				{ $pull: { permissions: { user } } });
		});
	});
};

describe('models/projectSettings', () => {
	testProjectAdmins();
	testGetProjectList();
	testAddProjectModel();
	testRemoveProjectModel();
	testModelsExistInProject();
	testFindProjectByModelId();
	testCreateProject();
	testDeleteProject();
	testUpdateProject();
	testGetProjectByName();
	testGetProjectById();
	testRemoveUserFromAllProjects();
});
