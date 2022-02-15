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

const SuperTest = require('supertest');
const ServiceHelper = require('../../../../../helper/services');
const { src } = require('../../../../../helper/path');

const { templates } = require(`${src}/utils/responseCodes`);

let server;
let agent;

const users = {
	tsAdmin: ServiceHelper.generateUserCredentials(),
	noProjectAccess: ServiceHelper.generateUserCredentials(),
};

const nobody = ServiceHelper.generateUserCredentials();

const teamspace = ServiceHelper.generateRandomString();

const project = {
	id: ServiceHelper.generateUUIDString(),
	name: ServiceHelper.generateRandomString(),
};

const models = [
	{
		_id: ServiceHelper.generateUUIDString(),
		name: ServiceHelper.generateRandomString(),
		isFavourite: true,
		properties: { ...ServiceHelper.generateRandomModelProperties(), federate: true },
	},
	{
		_id: ServiceHelper.generateUUIDString(),
		name: ServiceHelper.generateRandomString(),
		properties: { ...ServiceHelper.generateRandomModelProperties(), federate: true },
	},
	{
		_id: ServiceHelper.generateUUIDString(),
		name: ServiceHelper.generateRandomString(),
		properties: { ...ServiceHelper.generateRandomModelProperties() },
	},
];

const modelWithViews = models[0];
const modelWithoutViews = models[1];
const notFed = models[2];

const views = [
	ServiceHelper.generateView(teamspace, modelWithViews._id),
	ServiceHelper.generateView(teamspace, modelWithViews._id, false),
];

const viewWithThumbnail = views[0];
const viewNoThumbnail = views[1];

const setupData = async () => {
	await ServiceHelper.db.createTeamspace(teamspace, [users.tsAdmin.user]);
	const customData = { starredModels: {
		[teamspace]: models.flatMap(({ _id, isFavourite }) => (isFavourite ? _id : [])),
	} };
	const userProms = Object.keys(users).map((key) => ServiceHelper.db.createUser(users[key], [teamspace], customData));
	const modelProms = models.map((model) => ServiceHelper.db.createModel(
		teamspace,
		model._id,
		model.name,
		model.properties,
	));
	return Promise.all([
		...userProms,
		...modelProms,
		ServiceHelper.db.createUser(nobody),
		ServiceHelper.db.createProject(teamspace, project.id, project.name, models.map(({ _id }) => _id)),
		ServiceHelper.db.createViews(teamspace, modelWithViews._id, views),
	]);
};

const testViewList = () => {
	const createRoute = (projectId = project.id, modelId = modelWithViews._id) => `/v5/teamspaces/${teamspace}/projects/${projectId}/federations/${modelId}/views`;
	describe('Views List', () => {
		test('should fail without a valid session', async () => {
			const res = await agent.get(createRoute()).expect(templates.notLoggedIn.status);
			expect(res.body.code).toEqual(templates.notLoggedIn.code);
		});

		test('should fail if the user is not a member of the teamspace', async () => {
			const res = await agent.get(`${createRoute()}?key=${nobody.apiKey}`).expect(templates.teamspaceNotFound.status);
			expect(res.body.code).toEqual(templates.teamspaceNotFound.code);
		});

		test('should fail if the project does not exist', async () => {
			const res = await agent.get(`${createRoute('dslfkjds')}?key=${users.tsAdmin.apiKey}`).expect(templates.projectNotFound.status);
			expect(res.body.code).toEqual(templates.projectNotFound.code);
		});

		test('should fail if the federation does not exist', async () => {
			const res = await agent.get(`${createRoute(project.id, 'dslfkjds')}?key=${users.tsAdmin.apiKey}`)
				.expect(templates.federationNotFound.status);
			expect(res.body.status).toEqual(templates.federationNotFound.status);
		});

		test('should fail if the federation is actually a container', async () => {
			const res = await agent.get(`${createRoute(project.id, notFed._id)}?key=${users.tsAdmin.apiKey}`)
				.expect(templates.federationNotFound.status);
			expect(res.body.status).toEqual(templates.federationNotFound.status);
		});

		test('should fail if the user does not have permissions to access the federation', async () => {
			const res = await agent.get(`${createRoute()}?key=${users.noProjectAccess.apiKey}`)
				.expect(templates.notAuthorized.status);
			expect(res.body.status).toEqual(templates.notAuthorized.status);
		});

		test('should return the views if the user has sufficient access', async () => {
			const res = await agent.get(`${createRoute()}?key=${users.tsAdmin.apiKey}`)
				.expect(templates.ok.status);
			expect(res.body).toEqual({
				views: views.map((view) => {
					const output = {
						hasThumbnail: !!view.thumbnail,
						...view,
					};

					delete output.thumbnail;
					return output;
				}),
			});
		});

		test('should return an empty array if the federation has no views', async () => {
			const res = await agent.get(`${createRoute(project.id, modelWithoutViews._id)}?key=${users.tsAdmin.apiKey}`)
				.expect(templates.ok.status);
			expect(res.body).toEqual({ views: [] });
		});
	});
};

const testViewThumbnail = () => {
	const createRoute = (projectId = project.id, modelId = modelWithViews._id, viewId = viewWithThumbnail._id) => `/v5/teamspaces/${teamspace}/projects/${projectId}/federations/${modelId}/views/${viewId}/thumbnail`;
	describe('View thumbnail', () => {
		test('should fail without a valid session', async () => {
			const res = await agent.get(createRoute()).expect(templates.notLoggedIn.status);
			expect(res.body.code).toEqual(templates.notLoggedIn.code);
		});

		test('should fail if the user is not a member of the teamspace', async () => {
			const res = await agent.get(`${createRoute()}?key=${nobody.apiKey}`).expect(templates.teamspaceNotFound.status);
			expect(res.body.code).toEqual(templates.teamspaceNotFound.code);
		});

		test('should fail if the project does not exist', async () => {
			const res = await agent.get(`${createRoute('dflfkjdsl')}?key=${users.tsAdmin.apiKey}`).expect(templates.projectNotFound.status);
			expect(res.body.code).toEqual(templates.projectNotFound.code);
		});

		test('should fail if the federation does not exist', async () => {
			const res = await agent.get(`${createRoute(project.id, 'dslfkjds')}?key=${users.tsAdmin.apiKey}`)
				.expect(templates.federationNotFound.status);
			expect(res.body.status).toEqual(templates.federationNotFound.status);
		});

		test('should fail if the federation is actually a container', async () => {
			const res = await agent.get(`${createRoute(project.id, notFed._id)}?key=${users.tsAdmin.apiKey}`)
				.expect(templates.federationNotFound.status);
			expect(res.body.status).toEqual(templates.federationNotFound.status);
		});

		test('should fail if the user does not have permissions to access the federation', async () => {
			const res = await agent.get(`${createRoute()}?key=${users.noProjectAccess.apiKey}`)
				.expect(templates.notAuthorized.status);
			expect(res.body.status).toEqual(templates.notAuthorized.status);
		});

		test('should return the thumbnail if the user has sufficient access', async () => {
			const res = await agent.get(`${createRoute()}?key=${users.tsAdmin.apiKey}`)
				.expect(templates.ok.status);
			expect(res.headers['content-type']).toEqual('image/png');
		});

		test('should fail if the view does not exist', async () => {
			const res = await agent.get(`${createRoute(project.id, modelWithViews._id, ServiceHelper.generateUUIDString())}?key=${users.tsAdmin.apiKey}`)
				.expect(templates.viewNotFound.status);
			expect(res.body.status).toEqual(templates.viewNotFound.status);
		});

		test('should fail if the view does not have a thumbnail', async () => {
			const res = await agent.get(`${createRoute(project.id, modelWithViews._id, viewNoThumbnail._id)}?key=${users.tsAdmin.apiKey}`)
				.expect(templates.thumbnailNotFound.status);
			expect(res.body.status).toEqual(templates.thumbnailNotFound.status);
		});
	});
};

describe('E2E routes/teamspaces/projects/federations/views', () => {
	beforeAll(async () => {
		server = await ServiceHelper.app();
		agent = await SuperTest(server);
		await setupData();
	});
	afterAll(() => ServiceHelper.closeApp(server));
	testViewList();
	testViewThumbnail();
});
