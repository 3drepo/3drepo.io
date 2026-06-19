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

const { determineTestGroup } = require('../../../../helper/utils');
const { times } = require('lodash');
const SuperTest = require('supertest');
const ServiceHelper = require('../../../../helper/services');
const { image, oversizedImage, objModel, src } = require('../../../../helper/path');

const { stringToUUID } = require(`${src}/utils/helper/uuids`);
const fs = require('fs');

const { MODEL_CATEGORIES, statusCodes } = require(`${src}/models/modelSettings.constants`);

const { fileMimeFromBuffer } = require(`${src}/utils/helper/typeCheck`);
const Responder = require(`${src}/utils/responder`);

const DB = require(`${src}/handler/db`);
const { CLASH_PLANS_COL, CLASH_RUNS_COL } = require(`${src}/models/clashes.constants`);
const { getFileAsStream } = require(`${src}/services/filesManager`);
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

const testGetProjectList = (internalService) => {
	describe('Get project list', () => {
		const route = (ts, key) => `/v5/teamspaces/${ts}/projects${internalService ? '' : `?key=${key}`}`;
		const basicData = generateBasicData();
		const { users, teamspace, projects } = basicData;
		beforeAll(async () => {
			await setupBasicData(basicData);
		});

		const externalTests = [
			['session is invalid', { key: ServiceHelper.generateRandomString() }, false, templates.notLoggedIn],
			['user is not a member of the teamspace', { key: users.unlicencedUser.apiKey }, false, templates.teamspaceNotFound],
			['user has a valid session and has access to a project', { key: users.modelPermUser.apiKey }, true, projects.testProject],
		];

		const generalTests = [
			['teamspace is not found', { ts: ServiceHelper.generateRandomString() }, false, templates.teamspaceNotFound],
			['user has a valid session and is teamspace admin', {}, true],
		];

		describe.each([
			...(internalService ? [] : externalTests),
			...generalTests,
		])('', (desc, { ts = teamspace, key = users.tsAdmin.apiKey }, success, expectedRes) => {
			test(`should ${success ? 'succeed' : 'fail'} if ${desc}`, async () => {
				const res = await agent.get(route(ts, key))
					.expect(expectedRes?.status || templates.ok.status);
				if (success) {
					const expectedData = expectedRes ? [{ _id: expectedRes.id, name: expectedRes.name, isAdmin: false }]
						: Object.keys(projects).map((p) => (
							{ _id: projects[p].id, name: projects[p].name, isAdmin: true }));
					expect(res.body).toEqual({
						projects: expectedData,
					});
				} else {
					expect(res.body.code).toEqual(expectedRes.code);
				}
			});
		});
	});
};

const testCreateProject = (internalService) => {
	describe('Create Project', () => {
		const route = (ts, key) => `/v5/teamspaces/${ts}/projects${internalService ? '' : `?key=${key}`}`;
		const basicData = generateBasicData();
		const { users, teamspace, projects } = basicData;
		beforeAll(async () => {
			await setupBasicData(basicData);
		});

		const externalTestCases = [
			['session is invalid', { key: ServiceHelper.generateRandomString() }, false, templates.notLoggedIn],
			['teamspace is not found', { ts: ServiceHelper.generateRandomString() }, false, templates.teamspaceNotFound],
			['user is not admin', { key: users.nonAdminUser.apiKey }, false, templates.notAuthorized],

		];
		const generalTestCases = [
			['teamspace is not found', { ts: ServiceHelper.generateRandomString() }, false, templates.teamspaceNotFound],
			['project name is not valid', { projectName: 123 }, false, templates.invalidArguments],
			['project name is already taken', { projectName: projects.testProject.name }, false, templates.invalidArguments],
			['project name is already taken (case insensitive)', { projectName: projects.testProject.name.toUpperCase() }, false, templates.invalidArguments],
			['project name is already taken', { projectName: projects.testProject.name }, false, templates.invalidArguments],
			['user has rights and project name is not taken', { }, true],
		];

		describe.each([
			...(internalService ? [] : externalTestCases),
			...generalTestCases,
		])('', (desc,
			{ ts = teamspace, key = users.tsAdmin.apiKey, projectName = ServiceHelper.generateRandomString() },
			success, expectedRes = templates.ok) => {
			test(`should ${success ? 'succeed' : 'fail'} if ${desc}`, async () => {
				const res = await agent.post(route(ts, key))
					.send({ name: projectName })
					.expect(expectedRes.status);
				if (success) {
					const projectsRes = await agent.get(
						route(teamspace, users.tsAdmin.apiKey)).expect(templates.ok.status);

					expect(projectsRes.body.projects.some((p) => p.name === projectName)).toBe(true);
				} else {
					expect(res.body.code).toEqual(expectedRes.code);
				}
			});
		});

		test('should fail if multiple projects are being sent at similar times with the same name', async () => {
			const payload = { name: ServiceHelper.generateRandomString() };
			const res = await Promise.all(
				times(3, () => agent.post(route(teamspace, users.tsAdmin.apiKey)).send(payload)));

			let successAttemptFound = false;
			res.forEach(({ statusCode, body }) => {
				if (statusCode === templates.ok.status) {
					expect(successAttemptFound).toBeFalsy();
					successAttemptFound = true;
				} else {
					expect(statusCode).toBe(templates.invalidArguments.status);
					expect(body.code).toBe(templates.invalidArguments.code);
				}
			});
		});
	});
};

const testUpdateProject = () => {
	describe('Update project', () => {
		const basicData = generateBasicData();
		const { users, teamspace, projects } = basicData;
		const projectsRoute = `/v5/teamspaces/${teamspace}/projects?key=${users.tsAdmin.apiKey}`;

		beforeAll(async () => {
			await setupBasicData(basicData);
		});

		const route = (ts = teamspace, project = projects.testProject.id,
			key = users.tsAdmin.apiKey) => `/v5/teamspaces/${ts}/projects/${project}?key=${key}`;

		describe.each([
			['without a valid session', { key: ServiceHelper.generateRandomString() }, {}, false, templates.notLoggedIn],
			['without a valid teamspace', { ts: ServiceHelper.generateRandomString() }, {}, false, templates.teamspaceNotFound],
			['if the user is not project admin', { key: users.nonAdminUser.apiKey }, {}, false, templates.notAuthorized],
			['without a valid project', { project: ServiceHelper.generateRandomString() }, {}, false, templates.projectNotFound],
			['if the project data are not valid', {}, { name: 123 }, false, templates.invalidArguments],
			['if the project name is taken by another project', {}, {}, false, templates.invalidArguments, { createProjectWithName: true }],
			['if the project name is taken by another project (case insensitive)', {}, {}, false, templates.invalidArguments, { createProjectWithName: true, caseInsensitiveName: true }],
			['if project name is the same', {}, { name: projects.testProject.name }, true],
			['if project data are valid', {}, { name: 'New Name' }, true, templates.ok, { resetProjectName: true }],
		])('', (desc,
			{ ts = teamspace, project = projects.testProject.id, key = users.tsAdmin.apiKey },
			payload, success, expectedRes = templates.ok, options = {}) => {
			test(`should ${success ? 'edit project' : 'fail'} ${desc}`, async () => {
				let temporaryProjectId;
				let payloadToSend = payload;

				if (options.createProjectWithName) {
					const name = ServiceHelper.generateRandomString();
					const res = await agent.post(projectsRoute).send({ name }).expect(templates.ok.status);
					temporaryProjectId = res.body._id;
					payloadToSend = { name: options.caseInsensitiveName ? name.toUpperCase() : name };
				}

				try {
					const res = await agent.patch(route(ts, project, key))
						.send(payloadToSend).expect(expectedRes.status);

					if (success) {
						const projectsRes = await agent.get(projectsRoute).expect(templates.ok.status);
						expect(projectsRes.body.projects.find((p) => p.name === payloadToSend.name))
							.not.toBe(undefined);

						if (options.resetProjectName) {
							expect(projectsRes.body.projects.find((p) => p.name === projects.testProject.name))
								.toBe(undefined);
							await agent.patch(route()).send({ name: projects.testProject.name })
								.expect(templates.ok.status);
						}
					} else {
						expect(res.body.code).toEqual(expectedRes.code);
					}
				} finally {
					if (temporaryProjectId) {
						await agent.delete(route(teamspace, temporaryProjectId)).expect(templates.ok.status);
					}
				}
			});
		});
	});
};

const testDeleteProject = () => {
	describe('Delete project', () => {
		const basicData = generateBasicData();
		const { users, teamspace, projects, model } = basicData;
		const projectsRoute = `/v5/teamspaces/${teamspace}/projects?key=${users.tsAdmin.apiKey}`;

		beforeAll(async () => {
			await setupBasicData(basicData);
		});

		const route = (ts = teamspace, project = projects.testProject.id, key = users.tsAdmin.apiKey) => `/v5/teamspaces/${ts}/projects/${project}?key=${key}`;

		describe.each([
			['without a valid session', { key: ServiceHelper.generateRandomString() }, false, templates.notLoggedIn],
			['without a valid teamspace', { ts: ServiceHelper.generateRandomString() }, false, templates.teamspaceNotFound],
			['if the user is not teamspace admin', { key: users.nonAdminUser.apiKey }, false, templates.notAuthorized],
			['without a valid project', { project: ServiceHelper.generateRandomString() }, false, templates.projectNotFound],
			['project', {}, true],
		])('', (desc,
			{ ts = teamspace, project = projects.testProject.id, key = users.tsAdmin.apiKey },
			success, expectedRes = templates.ok) => {
			test(`should ${success ? 'delete' : 'fail'} ${desc}`, async () => {
				let projectToDelete = project;
				let run;

				if (success) {
					const res = await agent.post(projectsRoute)
						.send({ name: 'New Project' }).expect(templates.ok.status);
					projectToDelete = res.body._id;

					const plan = ServiceHelper.generateClashPlan(model._id, model._id);
					const clashResults = { new: [], active: [], resolved: [] };
					run = ServiceHelper.generateClashRun(plan, clashResults);

					await ServiceHelper.db.createClashPlans(teamspace, projectToDelete, [plan]);
					await ServiceHelper.db.createClashRuns(teamspace, projectToDelete, plan, [run]);
				}

				const res = await agent.delete(route(ts, projectToDelete, key)).expect(expectedRes.status);

				if (success) {
					const projectId = stringToUUID(projectToDelete);
					expect(await DB.find(teamspace, CLASH_PLANS_COL, { project: projectId })).toEqual([]);
					expect(await DB.find(teamspace, CLASH_RUNS_COL, { project: projectId })).toEqual([]);
					await expect(getFileAsStream(teamspace, CLASH_RUNS_COL, stringToUUID(run._id)))
						.rejects.toEqual(templates.fileNotFound);

					const projectsRes = await agent.get(projectsRoute).expect(templates.ok.status);
					expect(projectsRes.body.projects.find((p) => p.name === 'New Project')).toBe(undefined);
				} else {
					expect(res.body.code).toEqual(expectedRes.code);
				}
			});
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

		describe.each([
			['without a valid session', { key: ServiceHelper.generateRandomString() }, false, templates.notLoggedIn],
			['without a valid teamspace', { ts: ServiceHelper.generateRandomString() }, false, templates.teamspaceNotFound],
			['if the user is not teamspace member', { key: users.unlicencedUser.apiKey }, false, templates.teamspaceNotFound],
			['without a valid project', { project: ServiceHelper.generateRandomString() }, false, templates.projectNotFound],
			['project', {}, true],
		])('', (desc,
			{ ts = teamspace, project = projects.testProject.id, key = users.tsAdmin.apiKey },
			success, expectedRes = templates.ok) => {
			test(`should ${success ? 'get' : 'fail'} ${desc}`, async () => {
				const res = await agent.get(route(ts, project, key)).expect(expectedRes.status);

				if (success) {
					expect(res.body).toEqual({ name: projects.testProject.name });
				} else {
					expect(res.body.code).toEqual(expectedRes.code);
				}
			});
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

describe(determineTestGroup(__filename), () => {
	afterEach(() => server.close());
	afterAll(() => ServiceHelper.closeApp(server));
	describe('External Service', () => {
		beforeAll(async () => {
			server = await ServiceHelper.app();
			agent = await SuperTest(server);
		});

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

	describe('Internal Service', () => {
		beforeAll(async () => {
			server = await ServiceHelper.app(true);
			agent = await SuperTest(server);
		});

		testCreateProject(true);
		testGetProjectList(true);
	});
});
