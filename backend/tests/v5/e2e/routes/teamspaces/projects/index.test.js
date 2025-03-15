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
const { image, oversizedImage, objModel, src } = require('../../../../helper/path');

const { stringToUUID } = require(`${src}/utils/helper/uuids`);
const fs = require('fs');

const { MODEL_CATEGORIES, statusCodes } = require(`${src}/models/modelSettings.constants`);

const { fileMimeFromBuffer } = require(`${src}/utils/helper/typeCheck`);
const Responder = require(`${src}/utils/responder`);

const { templates } = require(`${src}/utils/responseCodes`);

let server;
let agent;

const setupBasicData = async ({ users, teamspace, projects, model, imageData }) => {
	await ServiceHelper.db.createUser(users.tsAdmin);
	await ServiceHelper.db.createTeamspace(teamspace, [users.tsAdmin.user]);

	await Promise.all([
		ServiceHelper.db.createUser(users.projectAdmin, [teamspace]),
		ServiceHelper.db.createUser(users.nonAdminUser, [teamspace]),
		ServiceHelper.db.createUser(users.unlicencedUser),
		ServiceHelper.db.createUser(users.modelPermUser, [teamspace]),
	]);

	await ServiceHelper.db.createProject(teamspace, projects.testProject.id, projects.testProject.name, [model._id]);
	await ServiceHelper.db.createProject(teamspace, projects.projectWithPngImage.id,
		projects.projectWithPngImage.name, [], [users.projectAdmin.user]);
	await ServiceHelper.db.createProject(teamspace, projects.projectWithImage.id,
		projects.projectWithImage.name, [], [users.projectAdmin.user]);
	await ServiceHelper.db.createProjectImage(teamspace, stringToUUID(projects.projectWithPngImage.id), 'fs', fs.readFileSync(image));
	await ServiceHelper.db.createProjectImage(teamspace, stringToUUID(projects.projectWithImage.id), 'fs', Buffer.from(imageData));
	await ServiceHelper.db.createModel(teamspace, model._id, model.name, model.properties);
};

const generateBasicData = () => {
	const [tsAdmin, nonAdminUser, unlicencedUser, modelPermUser, projectAdmin] = times(5,
		() => ServiceHelper.generateUserCredentials());

	const model = ServiceHelper.generateRandomModel({ viewers: [modelPermUser.user] });

	const testProject = ServiceHelper.generateRandomProject();
	const projectWithImage = ServiceHelper.generateRandomProject();
	const projectWithPngImage = ServiceHelper.generateRandomProject();

	return ({
		users: { tsAdmin, nonAdminUser, unlicencedUser, modelPermUser, projectAdmin },
		teamspace: ServiceHelper.generateRandomString(),
		projects: { testProject, projectWithPngImage, projectWithImage },
		model,
		imageData: ServiceHelper.generateRandomString(),
	});
};

const testGetProjectList = () => {
	describe('Get project list', () => {
		const basicData = generateBasicData();
		const { users, teamspace, projects } = basicData;

		beforeAll(async () => {
			await setupBasicData(basicData);
		});

		const route = (ts = teamspace, key = users.tsAdmin.apiKey) => `/v5/teamspaces/${ts}/projects?key=${key}`;

		test('should fail without a valid session', async () => {
			const res = await agent.get(route(teamspace, ServiceHelper.generateRandomString()))
				.expect(templates.notLoggedIn.status);
			expect(res.body.code).toEqual(templates.notLoggedIn.code);
		});

		test('should fail without a valid teamspace', async () => {
			const res = await agent.get(route(ServiceHelper.generateRandomString()))
				.expect(templates.teamspaceNotFound.status);
			expect(res.body.code).toEqual(templates.teamspaceNotFound.code);
		});

		test('should fail without a valid teamspace licence', async () => {
			const res = await agent.get(route(teamspace, users.unlicencedUser.apiKey))
				.expect(templates.teamspaceNotFound.status);
			expect(res.body.code).toEqual(templates.teamspaceNotFound.code);
		});

		test('should return a project list if the user has a valid session and is admin of teamspace', async () => {
			const res = await agent.get(route()).expect(templates.ok.status);
			expect(res.body).toEqual({
				projects: Object.keys(projects).map((p) => (
					{ _id: projects[p].id, name: projects[p].name, isAdmin: true })),
			});
		});

		test('should return a project list if the user has a valid session and has access to a model within one of the project', async () => {
			const res = await agent.get(route(teamspace, users.modelPermUser.apiKey)).expect(templates.ok.status);
			expect(res.body).toEqual({
				projects:
					[{ _id: projects.testProject.id, name: projects.testProject.name, isAdmin: false }],
			});
		});
	});
};

const testCreateProject = () => {
	describe('Create project', () => {
		const basicData = generateBasicData();
		const { users, teamspace, projects } = basicData;

		beforeAll(async () => {
			await setupBasicData(basicData);
		});

		const route = (ts = teamspace, key = users.tsAdmin.apiKey) => `/v5/teamspaces/${ts}/projects?key=${key}`;

		test('should fail without a valid session', async () => {
			const res = await agent.post(route(teamspace, ServiceHelper.generateRandomString()))
				.expect(templates.notLoggedIn.status);
			expect(res.body.code).toEqual(templates.notLoggedIn.code);
		});

		test('should fail without a valid teamspace', async () => {
			const res = await agent.post(route(ServiceHelper.generateRandomString()))
				.expect(templates.teamspaceNotFound.status);
			expect(res.body.code).toEqual(templates.teamspaceNotFound.code);
		});

		test('should fail if the user is not teamspace admin', async () => {
			const res = await agent.post(route(teamspace, users.nonAdminUser.apiKey))
				.expect(templates.notAuthorized.status);
			expect(res.body.code).toEqual(templates.notAuthorized.code);
		});

		test('should fail if the new project data are not valid', async () => {
			const res = await agent.post(route())
				.send({ name: 123 }).expect(templates.invalidArguments.status);
			expect(res.body.code).toEqual(templates.invalidArguments.code);
		});

		test('should fail if the new project name is taken by another project', async () => {
			const res = await agent.post(route())
				.send({ name: projects.testProject.name }).expect(templates.invalidArguments.status);
			expect(res.body.code).toEqual(templates.invalidArguments.code);
		});

		test('should fail if the new project name is taken by another project (case insensitive)', async () => {
			const res = await agent.post(route())
				.send({ name: projects.testProject.name.toUpperCase() }).expect(templates.invalidArguments.status);
			expect(res.body.code).toEqual(templates.invalidArguments.code);
		});

		test('should create new project if new project data are valid', async () => {
			const res = await agent.post(route())
				.send({ name: 'Valid Name' }).expect(templates.ok.status);

			const projectsRes = await agent.get(route(teamspace, users.tsAdmin.apiKey)).expect(templates.ok.status);
			expect(projectsRes.body.projects.find((p) => p.name === 'Valid Name')).not.toBe(undefined);

			// Delete project afterwards
			await agent.delete(`/v5/teamspaces/${teamspace}/projects/${res.body._id}?key=${users.tsAdmin.apiKey}`)
				.expect(templates.ok.status);
		});
	});
};

const testUpdateProject = () => {
	describe('Update project', () => {
		const basicData = generateBasicData();
		const { users, teamspace, projects } = basicData;

		beforeAll(async () => {
			await setupBasicData(basicData);
		});

		const route = (ts = teamspace, project = projects.testProject.id,
			key = users.tsAdmin.apiKey) => `/v5/teamspaces/${ts}/projects/${project}?key=${key}`;

		test('should fail without a valid session', async () => {
			const res = await agent.patch(route(teamspace, projects.testProject.id,
				ServiceHelper.generateRandomString())).expect(templates.notLoggedIn.status);
			expect(res.body.code).toEqual(templates.notLoggedIn.code);
		});

		test('should fail without a valid teamspace', async () => {
			const res = await agent.patch(route(ServiceHelper.generateRandomString(), projects.testProject.id))
				.expect(templates.teamspaceNotFound.status);
			expect(res.body.code).toEqual(templates.teamspaceNotFound.code);
		});

		test('should fail if the user is not project admin', async () => {
			const res = await agent.patch(route(teamspace, projects.testProject.id,
				users.nonAdminUser.apiKey)).expect(templates.notAuthorized.status);
			expect(res.body.code).toEqual(templates.notAuthorized.code);
		});

		test('should fail without a valid project', async () => {
			const res = await agent.patch(route(teamspace, ServiceHelper.generateRandomString(),
				users.tsAdmin.apiKey)).expect(templates.projectNotFound.status);
			expect(res.body.code).toEqual(templates.projectNotFound.code);
		});

		test('should fail if the project data are not valid', async () => {
			const res = await agent.patch(route())
				.send({ name: 123 }).expect(templates.invalidArguments.status);
			expect(res.body.code).toEqual(templates.invalidArguments.code);
		});

		test('should fail if the project name is taken by another project', async () => {
			const name = ServiceHelper.generateRandomString();
			// create test project
			const res = await agent.post(`/v5/teamspaces/${teamspace}/projects/?key=${users.tsAdmin.apiKey}`)
				.send({ name }).expect(templates.ok.status);

			const projectsRes = await agent.patch(route())
				.send({ name }).expect(templates.invalidArguments.status);
			expect(projectsRes.body.code).toEqual(templates.invalidArguments.code);

			// Delete test project afterwards
			await agent.delete(`/v5/teamspaces/${teamspace}/projects/${res.body._id}?key=${users.tsAdmin.apiKey}`)
				.expect(templates.ok.status);
		});

		test('should fail if the project name is taken by another project (case insensitive)', async () => {
			const name = ServiceHelper.generateRandomString();
			// create test project
			const res = await agent.post(`/v5/teamspaces/${teamspace}/projects/?key=${users.tsAdmin.apiKey}`)
				.send({ name }).expect(templates.ok.status);

			const projectsRes = await agent.patch(route())
				.send({ name: name.toUpperCase() }).expect(templates.invalidArguments.status);
			expect(projectsRes.body.code).toEqual(templates.invalidArguments.code);

			// Delete test project afterwards
			await agent.delete(`/v5/teamspaces/${teamspace}/projects/${res.body._id}?key=${users.tsAdmin.apiKey}`)
				.expect(templates.ok.status);
		});

		test('should edit project if project name is the same', async () => {
			await agent.patch(route())
				.send({ name: projects.testProject.name }).expect(templates.ok.status);

			const res = await agent.get(`/v5/teamspaces/${teamspace}/projects?key=${users.tsAdmin.apiKey}`).expect(templates.ok.status);
			expect(res.body.projects.find((p) => p.name === projects.testProject.name)).not.toBe(undefined);
		});

		test('should edit project if project data are valid', async () => {
			await agent.patch(route())
				.send({ name: 'New Name' }).expect(templates.ok.status);

			const res = await agent.get(`/v5/teamspaces/${teamspace}/projects?key=${users.tsAdmin.apiKey}`).expect(templates.ok.status);
			expect(res.body.projects.find((p) => p.name === projects.testProject.name)).toBe(undefined);
			expect(res.body.projects.find((p) => p.name === 'New Name')).not.toBe(undefined);

			// edit the project again to keep it the same for the next tests
			await agent.patch(route())
				.send({ name: projects.testProject.name }).expect(templates.ok.status);
		});
	});
};

const testDeleteProject = () => {
	describe('Delete project', () => {
		const basicData = generateBasicData();
		const { users, teamspace, projects } = basicData;

		beforeAll(async () => {
			await setupBasicData(basicData);
		});

		const route = (ts = teamspace, project = projects.testProject.id, key = users.tsAdmin.apiKey) => `/v5/teamspaces/${ts}/projects/${project}?key=${key}`;

		test('should fail without a valid session', async () => {
			const res = await agent.delete(route(teamspace, projects.testProject.id,
				ServiceHelper.generateRandomString())).expect(templates.notLoggedIn.status);
			expect(res.body.code).toEqual(templates.notLoggedIn.code);
		});

		test('should fail without a valid teamspace', async () => {
			const res = await agent.delete(route(ServiceHelper.generateRandomString()))
				.expect(templates.teamspaceNotFound.status);
			expect(res.body.code).toEqual(templates.teamspaceNotFound.code);
		});

		test('should fail if the user is not teamspace admin', async () => {
			const res = await agent.delete(route(teamspace, projects.testProject.id, users.nonAdminUser.apiKey))
				.expect(templates.notAuthorized.status);
			expect(res.body.code).toEqual(templates.notAuthorized.code);
		});

		test('should fail without a valid project', async () => {
			const res = await agent.delete(route(teamspace, ServiceHelper.generateRandomString()))
				.expect(templates.projectNotFound.status);
			expect(res.body.code).toEqual(templates.projectNotFound.code);
		});

		test('should delete project', async () => {
			// create test project
			const res = await agent.post(`/v5/teamspaces/${teamspace}/projects/?key=${users.tsAdmin.apiKey}`)
				.send({ name: 'New Project' }).expect(templates.ok.status);

			await agent.delete(route(teamspace, res.body._id)).expect(templates.ok.status);

			const projectsRes = await agent.get(`/v5/teamspaces/${teamspace}/projects?key=${users.tsAdmin.apiKey}`).expect(templates.ok.status);
			expect(projectsRes.body.projects.find((p) => p.name === 'New Project')).toBe(undefined);
		});
	});
};

const testGetProject = () => {
	describe('Get project', () => {
		const basicData = generateBasicData();
		const { users, teamspace, projects } = basicData;

		beforeAll(async () => {
			await setupBasicData(basicData);
		});

		const route = (ts = teamspace, project = projects.testProject.id, key = users.tsAdmin.apiKey) => `/v5/teamspaces/${ts}/projects/${project}?key=${key}`;

		test('should fail without a valid session', async () => {
			const res = await agent.get(route(teamspace, projects.testProject.id, ServiceHelper.generateRandomString()))
				.expect(templates.notLoggedIn.status);
			expect(res.body.code).toEqual(templates.notLoggedIn.code);
		});

		test('should fail without a valid teamspace', async () => {
			const res = await agent.get(route(ServiceHelper.generateRandomString()))
				.expect(templates.teamspaceNotFound.status);
			expect(res.body.code).toEqual(templates.teamspaceNotFound.code);
		});

		test('should fail if the user is not teamspace member', async () => {
			const res = await agent.get(route(teamspace, projects.testProject.id, users.unlicencedUser.apiKey))
				.expect(templates.teamspaceNotFound.status);
			expect(res.body.code).toEqual(templates.teamspaceNotFound.code);
		});

		test('should fail without a valid project', async () => {
			const res = await agent.get(route(teamspace, ServiceHelper.generateRandomString()))
				.expect(templates.projectNotFound.status);
			expect(res.body.code).toEqual(templates.projectNotFound.code);
		});

		test('should get project', async () => {
			const res = await agent.get(route()).expect(templates.ok.status);
			expect(res.body).toEqual({ name: projects.testProject.name });
		});
	});
};

const testGetProjectImage = () => {
	const basicData = generateBasicData();
	const { users, teamspace, projects, imageData } = basicData;

	beforeAll(async () => {
		await setupBasicData(basicData);
	});

	const baseRouteParams = { key: users.tsAdmin.apiKey, teamspace, projectId: projects.projectWithImage.id };

	const testCases = [
		['the user does not have a valid session', { ...baseRouteParams, key: null }, false, templates.notLoggedIn],
		['the teamspace does not exist', { ...baseRouteParams, teamspace: ServiceHelper.generateRandomString() }, false, templates.teamspaceNotFound],
		['the user is not a member of the teamspace', { ...baseRouteParams, key: users.unlicencedUser.apiKey }, false, templates.teamspaceNotFound],
		['the project does not exist', { ...baseRouteParams, projectId: ServiceHelper.generateRandomString() }, false, templates.projectNotFound],
		['the project has no image', { ...baseRouteParams, projectId: projects.testProject.id }, false, templates.fileNotFound],
		['the project has image', { ...baseRouteParams }, true, Buffer.from(imageData), undefined],
		['the project has image (non project admin)', { ...baseRouteParams, key: users.nonAdminUser.apiKey }, true, Buffer.from(imageData), undefined],
		['the project has image (PNG)', { ...baseRouteParams, projectId: projects.projectWithPngImage.id }, true, fs.readFileSync(image), Responder.mimeTypes.png],
	];

	const runTest = (desc, { ...routeParams }, success, expectedOutput, expectedFormat) => {
		const route = ({ teamspace: ts, projectId, key }) => `/v5/teamspaces/${ts}/projects/${projectId}/image${key ? `?key=${key}` : ''}`;

		test(`should ${success ? 'succeed' : `fail with ${expectedOutput.code}`} if ${desc}`, async () => {
			const expectedStatus = success ? templates.ok.status : expectedOutput.status;

			const res = await agent.get(route({ ...routeParams })).expect(expectedStatus);

			if (success) {
				expect(res.body).toEqual(expectedOutput);

				const mimeType = await fileMimeFromBuffer(expectedOutput);
				expect(mimeType).toEqual(expectedFormat);
			} else {
				expect(res.body.code).toEqual(expectedOutput.code);
			}
		});
	};

	describe.each(testCases)('Get project image', runTest);
};

const testUpdateProjectImage = () => {
	const basicData = generateBasicData();
	const { users, teamspace, projects } = basicData;

	beforeAll(async () => {
		await setupBasicData(basicData);
	});

	const baseRouteParams = {
		key: users.tsAdmin.apiKey,
		teamspace,
		projectId: projects.projectWithPngImage.id,
		image,
	};

	const testCases = [
		['the user does not have a valid session', { ...baseRouteParams, key: ServiceHelper.generateRandomString() }, false, templates.notLoggedIn],
		['the teamspace does not exist', { ...baseRouteParams, teamspace: ServiceHelper.generateRandomString() }, false, templates.teamspaceNotFound],
		['the user is not a member of the teamspace', { ...baseRouteParams, key: users.unlicencedUser.apiKey }, false, templates.teamspaceNotFound],
		['the user does not have access to the project', { ...baseRouteParams, key: users.modelPermUser.apiKey }, false, templates.notAuthorized],
		['the user is not project admin', { ...baseRouteParams, key: users.nonAdminUser.apiKey }, false, templates.notAuthorized],
		['the project does not exist', { ...baseRouteParams, projectId: ServiceHelper.generateRandomString() }, false, templates.projectNotFound],
		['an oversized image is provided', { ...baseRouteParams, image: oversizedImage }, false, templates.maxSizeExceeded],
		['a wrong file type is provided', { ...baseRouteParams, image: objModel }, false, templates.unsupportedFileFormat],
		['the user is teamspace admin', { ...baseRouteParams }, true],
		['the user is project admin', { ...baseRouteParams, key: users.projectAdmin.apiKey }, true],
	];

	const runTest = (desc, { ...routeParams }, success, expectedOutput) => {
		const route = ({ teamspace: ts, projectId, key }) => `/v5/teamspaces/${ts}/projects/${projectId}/image${key ? `?key=${key}` : ''}`;

		test(`should ${success ? 'succeed' : `fail with ${expectedOutput.code}`} if ${desc}`, async () => {
			const expectedStatus = success ? templates.ok.status : expectedOutput.status;

			const putRes = await agent.put(route({ ...routeParams }))
				.attach('file', routeParams.image)
				.expect(expectedStatus);

			if (success) {
				const getRes = await agent.get(route({ ...routeParams }))
					.expect(templates.ok.status);

				const buffer = fs.readFileSync(routeParams.image);
				const mimeType = await fileMimeFromBuffer(buffer);
				expect(getRes.body).toEqual(buffer);
				expect(mimeType).toEqual(Responder.mimeTypes.png);
			} else {
				expect(putRes.body.code).toEqual(expectedOutput.code);
			}
		});
	};

	describe.each(testCases)('Update project image', runTest);
};

const testDeleteProjectImage = () => {
	const basicData = generateBasicData();
	const { users, teamspace, projects } = basicData;

	beforeAll(async () => {
		await setupBasicData(basicData);
	});

	const baseRouteParams = {
		key: users.tsAdmin.apiKey,
		teamspace,
		projectId: projects.projectWithPngImage.id,
	};

	const testCases = [
		['the user does not have a valid session', { ...baseRouteParams, key: ServiceHelper.generateRandomString() }, false, templates.notLoggedIn],
		['the teamspace does not exist', { ...baseRouteParams, teamspace: ServiceHelper.generateRandomString() }, false, templates.teamspaceNotFound],
		['the user is not a member of the teamspace', { ...baseRouteParams, key: users.unlicencedUser.apiKey }, false, templates.teamspaceNotFound],
		['the user does not have access to the project', { ...baseRouteParams, key: users.modelPermUser.apiKey }, false, templates.notAuthorized],
		['the user is not project admin', { ...baseRouteParams, key: users.nonAdminUser.apiKey }, false, templates.notAuthorized],
		['the project does not exist', { ...baseRouteParams, projectId: ServiceHelper.generateRandomString() }, false, templates.projectNotFound],
		['the project does not have an image', { ...baseRouteParams, projectId: projects.testProject.id }, true],
		['the user is teamspace admin', { ...baseRouteParams }, true],
		['the user is project admin', { ...baseRouteParams, key: users.projectAdmin.apiKey }, true],
	];

	const runTest = (desc, { ...routeParams }, success, expectedOutput) => {
		const route = ({ teamspace: ts, projectId, key }) => `/v5/teamspaces/${ts}/projects/${projectId}/image${key ? `?key=${key}` : ''}`;

		test(`should ${success ? 'succeed' : `fail with ${expectedOutput.code}`} if ${desc}`, async () => {
			const expectedStatus = success ? templates.ok.status : expectedOutput.status;

			const deleteRes = await agent.delete(route({ ...routeParams }))
				.expect(expectedStatus);

			if (success) {
				await agent.get(route({ ...routeParams }))
					.expect(templates.fileNotFound.status);
			} else {
				expect(deleteRes.body.code).toEqual(expectedOutput.code);
			}
		});
	};

	describe.each(testCases)('Delete project image', runTest);
};

const testGetDrawingCategories = () => {
	const basicData = generateBasicData();
	const { users, teamspace, projects } = basicData;

	beforeAll(async () => {
		await setupBasicData(basicData);
	});

	const baseRouteParams = {
		key: users.tsAdmin.apiKey,
		teamspace,
		projectId: projects.projectWithPngImage.id,
	};

	const testCases = [
		['the user does not have a valid session', { ...baseRouteParams, key: ServiceHelper.generateRandomString() }, false, templates.notLoggedIn],
		['the teamspace does not exist', { ...baseRouteParams, teamspace: ServiceHelper.generateRandomString() }, false, templates.teamspaceNotFound],
		['the user is not a member of the teamspace', { ...baseRouteParams, key: users.unlicencedUser.apiKey }, false, templates.teamspaceNotFound],
		['the user does not have access to the project', { ...baseRouteParams, key: users.modelPermUser.apiKey }, false, templates.notAuthorized],
		['the user is not project admin', { ...baseRouteParams, key: users.nonAdminUser.apiKey }, false, templates.notAuthorized],
		['the project does not exist', { ...baseRouteParams, projectId: ServiceHelper.generateRandomString() }, false, templates.projectNotFound],
		['the user is teamspace admin', { ...baseRouteParams }, true],
		['the user is project admin', { ...baseRouteParams, key: users.projectAdmin.apiKey }, true],
	];

	const runTest = (desc, { ...routeParams }, success, expectedOutput) => {
		const route = ({ teamspace: ts, projectId, key }) => `/v5/teamspaces/${ts}/projects/${projectId}/settings/drawingCategories${key ? `?key=${key}` : ''}`;

		test(`should ${success ? 'succeed' : `fail with ${expectedOutput.code}`} if ${desc}`, async () => {
			const expectedStatus = success ? templates.ok.status : expectedOutput.status;

			const getRes = await agent.get(route({ ...routeParams }))
				.expect(expectedStatus);

			if (success) {
				expect(getRes.body).toEqual({ drawingCategories: MODEL_CATEGORIES });
			} else {
				expect(getRes.body.code).toEqual(expectedOutput.code);
			}
		});
	};

	describe.each(testCases)('Get Drawing Categories', runTest);
};

const testGetStatusCodes = () => {
	const basicData = generateBasicData();
	const { users, teamspace, projects } = basicData;

	beforeAll(async () => {
		await setupBasicData(basicData);
	});

	const baseRouteParams = {
		key: users.tsAdmin.apiKey,
		teamspace,
		projectId: projects.projectWithPngImage.id,
	};

	const testCases = [
		['the user does not have a valid session', { ...baseRouteParams, key: ServiceHelper.generateRandomString() }, false, templates.notLoggedIn],
		['the teamspace does not exist', { ...baseRouteParams, teamspace: ServiceHelper.generateRandomString() }, false, templates.teamspaceNotFound],
		['the user is not a member of the teamspace', { ...baseRouteParams, key: users.unlicencedUser.apiKey }, false, templates.teamspaceNotFound],
		['the project does not exist', { ...baseRouteParams, projectId: ServiceHelper.generateRandomString() }, false, templates.projectNotFound],
		['the user is teamspace admin', { ...baseRouteParams }, true],
		['the user is project admin', { ...baseRouteParams, key: users.projectAdmin.apiKey }, true],
		['the user is not project admin', { ...baseRouteParams, key: users.nonAdminUser.apiKey }, true],
	];

	const runTest = (desc, { ...routeParams }, success, expectedOutput) => {
		const route = ({ teamspace: ts, projectId, key }) => `/v5/teamspaces/${ts}/projects/${projectId}/settings/statusCodes${key ? `?key=${key}` : ''}`;

		test(`should ${success ? 'succeed' : `fail with ${expectedOutput.code}`} if ${desc}`, async () => {
			const expectedStatus = success ? templates.ok.status : expectedOutput.status;

			const getRes = await agent.get(route({ ...routeParams }))
				.expect(expectedStatus);

			if (success) {
				expect(getRes.body).toEqual({ statusCodes });
			} else {
				expect(getRes.body.code).toEqual(expectedOutput.code);
			}
		});
	};

	describe.each(testCases)('Get Status Codes', runTest);
};

describe(ServiceHelper.determineTestGroup(__filename), () => {
	beforeAll(async () => {
		server = await ServiceHelper.app();
		agent = await SuperTest(server);
	});

	afterAll(() => ServiceHelper.closeApp(server));
	testGetProjectList();
	testCreateProject();
	testUpdateProject();
	testDeleteProject();
	testGetProject();
	testGetProjectImage();
	testUpdateProjectImage();
	testDeleteProjectImage();
	testGetDrawingCategories();
	testGetStatusCodes();
});
