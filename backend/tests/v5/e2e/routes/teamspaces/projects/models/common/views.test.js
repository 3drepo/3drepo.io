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
const ServiceHelper = require('../../../../../../helper/services');
const { src } = require('../../../../../../helper/path');

const { modelTypes } = require(`${src}/models/modelSettings.constants`);

const { templates } = require(`${src}/utils/responseCodes`);

let server;
let agent;

const generateBasicData = () => {
	const data = {
		users: {
			tsAdmin: ServiceHelper.generateUserCredentials(),
			noProjectAccess: ServiceHelper.generateUserCredentials(),
			nobody: ServiceHelper.generateUserCredentials(),
		},
		teamspace: ServiceHelper.generateRandomString(),
		project: ServiceHelper.generateRandomProject(),
		con: ServiceHelper.generateRandomModel(),
		fed: ServiceHelper.generateRandomModel({ modelType: modelTypes.FEDERATION }),
	};
	const models = [data.con, data.fed];
	models.forEach((model) => {
		/* eslint-disable no-param-reassign */
		model.viewWithThumbnail = ServiceHelper.generateView(data.teamspace, model._id);
		model.viewNoThumbnail = ServiceHelper.generateView(data.teamspace, model._id, false);
		/* eslint-enable no-param-reassign */
	});

	return data;
};

const setupBasicData = async (users, teamspace, project, models, modelsWithViews) => {
	await ServiceHelper.db.createTeamspace(teamspace, [users.tsAdmin.user]);

	const userProms = Object.keys(users).map((key) => ServiceHelper.db.createUser(users[key], key !== 'nobody' ? [teamspace] : []));
	const modelProms = models.map((model) => ServiceHelper.db.createModel(
		teamspace,
		model._id,
		model.name,
		model.properties,
	));
	await Promise.all([
		...userProms,
		...modelProms,
		ServiceHelper.db.createProject(teamspace, project.id, project.name, models.map(({ _id }) => _id)),
	]);

	await Promise.all(modelsWithViews.map(async (model) => {
		await ServiceHelper.db.createViews(teamspace, model._id,
			[model.viewWithThumbnail, model.viewNoThumbnail]);
	}));
};

const testViewList = () => {
	describe('Views List', () => {
		const { users, teamspace, project, con, fed } = generateBasicData();
		const conNoViews = ServiceHelper.generateRandomModel();
		const fedNoViews = ServiceHelper.generateRandomModel({ modelType: modelTypes.FEDERATION });
		beforeAll(async () => {
			await setupBasicData(users, teamspace, project, [con, fed, conNoViews, fedNoViews], [con, fed]);
		});

		const generateTestData = (isFed) => {
			const model = isFed ? fed : con;
			const modelType = isFed ? 'federation' : 'container';
			const modelNotFound = isFed ? templates.federationNotFound : templates.containerNotFound;
			const modelNoViews = isFed ? fedNoViews : conNoViews;
			const modelWrongType = isFed ? con : fed;

			const getRoute = ({
				projectId = project.id,
				modelId = model._id,
				key = users.tsAdmin.apiKey,
			} = {}) => `/v5/teamspaces/${teamspace}/projects/${projectId}/${modelType}s/${modelId}/views${key ? `?key=${key}` : ''}`;

			return [
				['the user does not have a valid session', getRoute({ key: null }), false, templates.notLoggedIn],
				['the user is not a member of the teamspace', getRoute({ key: users.nobody.apiKey }), false, templates.teamspaceNotFound],
				['the project does not exist', getRoute({ projectId: ServiceHelper.generateRandomString() }), false, templates.projectNotFound],
				[`the ${modelType} does not exist`, getRoute({ modelId: ServiceHelper.generateRandomString() }), false, modelNotFound],
				[`the model is not a ${modelType}`, getRoute({ modelId: modelWrongType._id }), false, modelNotFound],
				[`the user does not have access to the ${modelType}`, getRoute({ key: users.noProjectAccess.apiKey }), false, templates.notAuthorized],
				['all the parameters are valid', getRoute(), true, [model.viewWithThumbnail, model.viewNoThumbnail]],
				['all the parameters are valid (no views)', getRoute({ modelId: modelNoViews._id }), true, []],
			];
		};

		const runTest = (desc, route, success, expectedOutput) => {
			test(`should ${success ? 'succeed' : `fail with ${expectedOutput.code}`} if ${desc}`, async () => {
				const expectedStatus = success ? templates.ok.status : expectedOutput.status;
				const res = await agent.get(route).expect(expectedStatus);
				if (success) {
					expect(res.body).toEqual({
						views: expectedOutput.map((view) => {
							const output = {
								hasThumbnail: !!view.thumbnail,
								...view,
							};

							delete output.thumbnail;
							return output;
						}),
					});
				} else {
					expect(res.body.code).toEqual(expectedOutput.code);
				}
			});
		};

		describe.each(generateTestData(true))('Federations', runTest);
		describe.each(generateTestData())('Containers', runTest);
	});
};

const testViewThumbnail = () => {
	describe('View thumbnail', () => {
		const { users, teamspace, project, con, fed } = generateBasicData();
		beforeAll(async () => {
			await setupBasicData(users, teamspace, project, [con, fed], [con, fed]);
		});

		const generateTestData = (isFed) => {
			const model = isFed ? fed : con;
			const modelType = isFed ? 'federation' : 'container';
			const modelNotFound = isFed ? templates.federationNotFound : templates.containerNotFound;
			const modelWrongType = isFed ? con : fed;

			const getRoute = ({
				projectId = project.id,
				modelId = model._id,
				key = users.tsAdmin.apiKey,
				viewId = model.viewWithThumbnail._id,
			} = {}) => `/v5/teamspaces/${teamspace}/projects/${projectId}/${modelType}s/${modelId}/views/${viewId}/thumbnail${key ? `?key=${key}` : ''}`;

			return [
				['the user does not have a valid session', getRoute({ key: null }), false, templates.notLoggedIn],
				['the user is not a member of the teamspace', getRoute({ key: users.nobody.apiKey }), false, templates.teamspaceNotFound],
				['the project does not exist', getRoute({ projectId: ServiceHelper.generateRandomString() }), false, templates.projectNotFound],
				[`the ${modelType} does not exist`, getRoute({ modelId: ServiceHelper.generateRandomString() }), false, modelNotFound],
				[`the model is not a ${modelType}`, getRoute({ modelId: modelWrongType._id }), false, modelNotFound],
				[`the user does not have access to the ${modelType}`, getRoute({ key: users.noProjectAccess.apiKey }), false, templates.notAuthorized],
				['the view has a thumbnail', getRoute(), true],
				['the view does not exist', getRoute({ viewId: ServiceHelper.generateRandomString() }), false, templates.viewNotFound],
				['the view does not have a thumbnail', getRoute({ viewId: model.viewNoThumbnail._id }), false, templates.thumbnailNotFound],
			];
		};

		const runTest = (desc, route, success, expectedOutput) => {
			test(`should ${success ? 'succeed' : `fail with ${expectedOutput.code}`} if ${desc}`, async () => {
				const expectedStatus = success ? templates.ok.status : expectedOutput.status;
				const res = await agent.get(route).expect(expectedStatus);
				if (success) {
					expect(res.headers['content-type']).toEqual('image/png');
				} else {
					expect(res.body.code).toEqual(expectedOutput.code);
				}
			});
		};

		describe.each(generateTestData(true))('Federations', runTest);
		describe.each(generateTestData())('Containers', runTest);
	});
};

describe(ServiceHelper.determineTestGroup(__filename), () => {
	beforeAll(async () => {
		server = await ServiceHelper.app();
		agent = await SuperTest(server);
	});
	afterAll(() => ServiceHelper.closeApp(server));
	testViewList();
	testViewThumbnail();
});
