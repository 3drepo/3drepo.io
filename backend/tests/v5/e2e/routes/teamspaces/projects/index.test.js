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
const SuperTest = require('supertest');
const ServiceHelper = require('../../../../helper/services');
const { src } = require('../../../../helper/path');

const { templates } = require(`${src}/utils/responseCodes`);

let server;
let agent;

// These are the users being used for tests
const [tsAdmin, nonAdminUser, unlicencedUser, modelPermUser] = times(4, () => ServiceHelper.generateUserCredentials());

const testProject = {
	_id: ServiceHelper.generateUUIDString(),
	name: ServiceHelper.generateRandomString(),
};

const teamspace = 'teamspace';
const model = ServiceHelper.generateRandomModel({ viewers: [modelPermUser.user] });

const setupData = async () => {
	await ServiceHelper.db.createTeamspace(teamspace, [tsAdmin.user]);

	await Promise.all([
		ServiceHelper.db.createUser(tsAdmin, [teamspace]),
		ServiceHelper.db.createUser(nonAdminUser, [teamspace]),
		ServiceHelper.db.createUser(unlicencedUser),
		ServiceHelper.db.createUser(modelPermUser, [teamspace]),
	]);

	await ServiceHelper.db.createProject(teamspace, testProject._id, testProject.name, [model._id]);
	await ServiceHelper.db.createModel(teamspace, model._id, model.name, model.properties);
};

const testGetProjectList = () => {
	describe('Get project list', () => {
		const route = `/v5/teamspaces/${teamspace}/projects`;
		test('should fail without a valid session', async () => {
			const res = await agent.get(route).expect(templates.notLoggedIn.status);
			expect(res.body.code).toEqual(templates.notLoggedIn.code);
		});
		test('should fail without a valid teamspace', async () => {
			const res = await agent.get(`/v5/teamspaces/badTSName/projects?key=${tsAdmin.apiKey}`).expect(templates.teamspaceNotFound.status);
			expect(res.body.code).toEqual(templates.teamspaceNotFound.code);
		});
		test('should fail without a valid teamspace licence', async () => {
			const res = await agent.get(`${route}?key=${unlicencedUser.apiKey}`).expect(templates.teamspaceNotFound.status);
			expect(res.body.code).toEqual(templates.teamspaceNotFound.code);
		});
		test('should return a project list if the user has a valid session and is admin of teamspace', async () => {
			const res = await agent.get(`${route}?key=${tsAdmin.apiKey}`).expect(templates.ok.status);
			expect(res.body).toEqual({ projects: [{ ...testProject, isAdmin: true }] });
		});

		test('should return a project list if the user has a valid session and has access to a model within one of the project', async () => {
			const res = await agent.get(`${route}?key=${modelPermUser.apiKey}`).expect(templates.ok.status);
			expect(res.body).toEqual({ projects: [{ ...testProject, isAdmin: false }] });
		});
	});
};

const testCreateProject = () => {
	describe('Create project', () => {
		const route = `/v5/teamspaces/${teamspace}/projects`;

		test('should fail without a valid session', async () => {
			const res = await agent.post(route).expect(templates.notLoggedIn.status);
			expect(res.body.code).toEqual(templates.notLoggedIn.code);
		});

		test('should fail without a valid teamspace', async () => {
			const res = await agent.post(`/v5/teamspaces/badTSName/projects?key=${tsAdmin.apiKey}`).expect(templates.teamspaceNotFound.status);
			expect(res.body.code).toEqual(templates.teamspaceNotFound.code);
		});

		test('should fail if the user is not teamspace admin', async () => {
			const res = await agent.post(`${route}?key=${nonAdminUser.apiKey}`).expect(templates.notAuthorized.status);
			expect(res.body.code).toEqual(templates.notAuthorized.code);
		});

		test('should fail if the new project data are not valid', async () => {
			const res = await agent.post(`${route}?key=${tsAdmin.apiKey}`)
				.send({ name: 123 }).expect(templates.invalidArguments.status);
			expect(res.body.code).toEqual(templates.invalidArguments.code);
		});

		test('should fail if the new project name is taken by another project', async () => {
			const res = await agent.post(`${route}?key=${tsAdmin.apiKey}`)
				.send({ name: testProject.name }).expect(templates.invalidArguments.status);
			expect(res.body.code).toEqual(templates.invalidArguments.code);
		});

		test('should fail if the new project name is taken by another project (case insensitive)', async () => {
			const res = await agent.post(`${route}?key=${tsAdmin.apiKey}`)
				.send({ name: testProject.name.toUpperCase() }).expect(templates.invalidArguments.status);
			expect(res.body.code).toEqual(templates.invalidArguments.code);
		});

		test('should create new project if new project data are valid', async () => {
			const res = await agent.post(`${route}?key=${tsAdmin.apiKey}`)
				.send({ name: 'Valid Name' }).expect(templates.ok.status);

			const projectsRes = await agent.get(`${route}?key=${tsAdmin.apiKey}`).expect(templates.ok.status);
			expect(projectsRes.body.projects.find((p) => p.name === 'Valid Name')).not.toBe(undefined);

			// Delete project afterwards
			await agent.delete(`/v5/teamspaces/${teamspace}/projects/${res.body._id}?key=${tsAdmin.apiKey}`)
				.expect(templates.ok.status);
		});
	});
};

const testUpdateProject = () => {
	describe('Update project', () => {
		const route = `/v5/teamspaces/${teamspace}/projects/${testProject._id}`;

		test('should fail without a valid session', async () => {
			const res = await agent.patch(route).expect(templates.notLoggedIn.status);
			expect(res.body.code).toEqual(templates.notLoggedIn.code);
		});

		test('should fail without a valid teamspace', async () => {
			const res = await agent.patch(`/v5/teamspaces/badTSName/projects/${testProject._id}?key=${tsAdmin.apiKey}`).expect(templates.teamspaceNotFound.status);
			expect(res.body.code).toEqual(templates.teamspaceNotFound.code);
		});

		test('should fail if the user is not project admin', async () => {
			const res = await agent.patch(`${route}?key=${nonAdminUser.apiKey}`).expect(templates.notAuthorized.status);
			expect(res.body.code).toEqual(templates.notAuthorized.code);
		});

		test('should fail without a valid project', async () => {
			const res = await agent.patch(`/v5/teamspaces/teamspace/projects/12345?key=${tsAdmin.apiKey}`).expect(templates.projectNotFound.status);
			expect(res.body.code).toEqual(templates.projectNotFound.code);
		});

		test('should fail if the project data are not valid', async () => {
			const res = await agent.patch(`${route}?key=${tsAdmin.apiKey}`)
				.send({ name: 123 }).expect(templates.invalidArguments.status);
			expect(res.body.code).toEqual(templates.invalidArguments.code);
		});

		test('should fail if the project name is taken by another project', async () => {
			const name = ServiceHelper.generateRandomString();
			// create test project
			const res = await agent.post(`/v5/teamspaces/${teamspace}/projects/?key=${tsAdmin.apiKey}`)
				.send({ name }).expect(templates.ok.status);

			const projectsRes = await agent.patch(`${route}?key=${tsAdmin.apiKey}`)
				.send({ name }).expect(templates.invalidArguments.status);
			expect(projectsRes.body.code).toEqual(templates.invalidArguments.code);

			// Delete test project afterwards
			await agent.delete(`/v5/teamspaces/${teamspace}/projects/${res.body._id}?key=${tsAdmin.apiKey}`)
				.expect(templates.ok.status);
		});

		test('should fail if the project name is taken by another project (case insensitive)', async () => {
			const name = ServiceHelper.generateRandomString();
			// create test project
			const res = await agent.post(`/v5/teamspaces/${teamspace}/projects/?key=${tsAdmin.apiKey}`)
				.send({ name }).expect(templates.ok.status);

			const projectsRes = await agent.patch(`${route}?key=${tsAdmin.apiKey}`)
				.send({ name: name.toUpperCase() }).expect(templates.invalidArguments.status);
			expect(projectsRes.body.code).toEqual(templates.invalidArguments.code);

			// Delete test project afterwards
			await agent.delete(`/v5/teamspaces/${teamspace}/projects/${res.body._id}?key=${tsAdmin.apiKey}`)
				.expect(templates.ok.status);
		});

		test('should edit project if project name is the same', async () => {
			await agent.patch(`${route}?key=${tsAdmin.apiKey}`)
				.send({ name: testProject.name }).expect(templates.ok.status);

			const res = await agent.get(`/v5/teamspaces/${teamspace}/projects?key=${tsAdmin.apiKey}`).expect(templates.ok.status);
			expect(res.body.projects.find((p) => p.name === testProject.name)).not.toBe(undefined);
		});

		test('should edit project if project data are valid', async () => {
			await agent.patch(`${route}?key=${tsAdmin.apiKey}`)
				.send({ name: 'New Name' }).expect(templates.ok.status);

			const res = await agent.get(`/v5/teamspaces/${teamspace}/projects?key=${tsAdmin.apiKey}`).expect(templates.ok.status);
			expect(res.body.projects.find((p) => p.name === testProject.name)).toBe(undefined);
			expect(res.body.projects.find((p) => p.name === 'New Name')).not.toBe(undefined);

			// edit the project again to keep it the same for the next tests
			await agent.patch(`${route}?key=${tsAdmin.apiKey}`)
				.send({ name: testProject.name }).expect(templates.ok.status);
		});
	});
};

const testDeleteProject = () => {
	describe('Delete project', () => {
		const route = (projectId) => `/v5/teamspaces/${teamspace}/projects/${projectId}`;

		test('should fail without a valid session', async () => {
			const res = await agent.delete(route(testProject._id)).expect(templates.notLoggedIn.status);
			expect(res.body.code).toEqual(templates.notLoggedIn.code);
		});

		test('should fail without a valid teamspace', async () => {
			const res = await agent.delete(`/v5/teamspaces/badTSName/projects/${testProject._id}?key=${tsAdmin.apiKey}`).expect(templates.teamspaceNotFound.status);
			expect(res.body.code).toEqual(templates.teamspaceNotFound.code);
		});

		test('should fail if the user is not teamspace admin', async () => {
			const res = await agent.delete(`${route(testProject._id)}?key=${nonAdminUser.apiKey}`).expect(templates.notAuthorized.status);
			expect(res.body.code).toEqual(templates.notAuthorized.code);
		});

		test('should fail without a valid project', async () => {
			const res = await agent.delete(`/v5/teamspaces/teamspace/projects/12345?key=${tsAdmin.apiKey}`).expect(templates.projectNotFound.status);
			expect(res.body.code).toEqual(templates.projectNotFound.code);
		});

		test('should delete project', async () => {
			// create test project
			const res = await agent.post(`/v5/teamspaces/${teamspace}/projects/?key=${tsAdmin.apiKey}`)
				.send({ name: 'New Project' }).expect(templates.ok.status);

			await agent.delete(`${route(res.body._id)}?key=${tsAdmin.apiKey}`).expect(templates.ok.status);

			const projectsRes = await agent.get(`/v5/teamspaces/${teamspace}/projects?key=${tsAdmin.apiKey}`).expect(templates.ok.status);
			expect(projectsRes.body.projects.find((p) => p.name === 'New Project')).toBe(undefined);
		});
	});
};

const testGetProject = () => {
	describe('Get project', () => {
		const route = (projectId) => `/v5/teamspaces/${teamspace}/projects/${projectId}`;

		test('should fail without a valid session', async () => {
			const res = await agent.get(route(testProject._id)).expect(templates.notLoggedIn.status);
			expect(res.body.code).toEqual(templates.notLoggedIn.code);
		});

		test('should fail without a valid teamspace', async () => {
			const res = await agent.get(`/v5/teamspaces/badTSName/projects/${testProject._id}?key=${tsAdmin.apiKey}`).expect(templates.teamspaceNotFound.status);
			expect(res.body.code).toEqual(templates.teamspaceNotFound.code);
		});

		test('should fail if the user is not teamspace member', async () => {
			const res = await agent.delete(`${route(testProject._id)}?key=${unlicencedUser.apiKey}`).expect(templates.teamspaceNotFound.status);
			expect(res.body.code).toEqual(templates.teamspaceNotFound.code);
		});

		test('should fail without a valid project', async () => {
			const res = await agent.get(`/v5/teamspaces/teamspace/projects/12345?key=${tsAdmin.apiKey}`).expect(templates.projectNotFound.status);
			expect(res.body.code).toEqual(templates.projectNotFound.code);
		});

		test('should get project', async () => {
			const res = await agent.get(`${route(testProject._id)}?key=${tsAdmin.apiKey}`).expect(templates.ok.status);
			expect(res.body).toEqual({ name: testProject.name });
		});
	});
};

describe(ServiceHelper.determineTestGroup(__filename), () => {
	beforeAll(async () => {
		server = await ServiceHelper.app();
		agent = await SuperTest(server);
		await setupData();
	});
	afterAll(() => ServiceHelper.closeApp(server));
	testGetProjectList();
	testCreateProject();
	testUpdateProject();
	testDeleteProject();
	testGetProject();
});
