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
const ServiceHelper = require('../../../../../../../helper/services');
const { src } = require('../../../../../../../helper/path');

const { storeFile } = require(`${src}/services/filesManager`);

const { modelTypes } = require(`${src}/models/modelSettings.constants`);
const { templates } = require(`${src}/utils/responseCodes`);

let server;
let agent;

const generateBasicData = () => {
	const viewer = ServiceHelper.generateUserCredentials();
	const commenter = ServiceHelper.generateUserCredentials();
	const collaborator = ServiceHelper.generateUserCredentials();
	const data = {
		users: {
			tsAdmin: ServiceHelper.generateUserCredentials(),
			noProjectAccess: ServiceHelper.generateUserCredentials(),
			nobody: ServiceHelper.generateUserCredentials(),
			projectAdmin: ServiceHelper.generateUserCredentials(),
			viewer,
			commenter,
			collaborator,
		},
		teamspace: ServiceHelper.generateRandomString(),
		project: ServiceHelper.generateRandomProject(),
		con: ServiceHelper.generateRandomModel({
			viewers: [viewer.user],
			commenters: [commenter.user],
			collaborators: [collaborator.user] }),
		fed: ServiceHelper.generateRandomModel({
			viewers: [viewer.user],
			commenters: [commenter.user],
			collaborators: [collaborator.user],
			modelType: modelTypes.FEDERATION }),
		draw: ServiceHelper.generateRandomModel({
			viewers: [viewer.user],
			commenters: [commenter.user],
			collaborators: [collaborator.user],
			modelType: modelTypes.DRAWING }),
		calibration: ServiceHelper.generateCalibration(),
		revisions: times(2, () => ServiceHelper.generateRevisionEntry(false, false, modelTypes.CONTAINER)),
	};

	data.jobs = [
		{ _id: ServiceHelper.generateRandomString(), users: [viewer.user] },
		{ _id: ServiceHelper.generateRandomString(), users: [collaborator.user] },
		{ _id: ServiceHelper.generateRandomString(), users: Object.values(data.users).map(({ user }) => user) },
	];

	return data;
};

const setupBasicData = async (users, teamspace, project, models) => {
	const { tsAdmin, ...otherUsers } = users;

	await ServiceHelper.db.createUser(tsAdmin);
	await ServiceHelper.db.createTeamspace(teamspace, [tsAdmin.user]);

	const userProms = Object.keys(otherUsers).map((key) => ServiceHelper.db.createUser(users[key], key !== 'nobody' ? [teamspace] : []));
	const modelProms = models.map((model) => ServiceHelper.db.createModel(
		teamspace,
		model._id,
		model.name,
		model.properties,
	));
	await Promise.all([
		...userProms,
		...modelProms,
		ServiceHelper.db.createProject(teamspace, project.id, project.name, models.map(({ _id }) => _id),
			[users.projectAdmin.user]),
	]);
};

const testGetTree = (internalService) => {
	describe('Get tree', () => {
		const { users, teamspace, project, con, fed, revisions } = generateBasicData();
		const conNoRev = ServiceHelper.generateRandomModel({ modelType: modelTypes.CONTAINER });

		const rev1Content = JSON.stringify(ServiceHelper.generateRandomObject());
		const rev2Content = JSON.stringify(ServiceHelper.generateRandomObject());

		beforeAll(async () => {
			const models = [con, conNoRev, fed];
			await setupBasicData(users, teamspace, project, models);
			await ServiceHelper.db.createRevision(teamspace, project.id, con._id,
				{ ...revisions[0], timestamp: new Date() }, modelTypes.CONTAINER);
			await ServiceHelper.db.createRevision(teamspace, project.id, con._id,
				{ ...revisions[1], timestamp: new Date(Date.now() + 1000) }, modelTypes.CONTAINER);

			await storeFile(teamspace, `${con._id}.stash.json_mpc.ref`, `${revisions[0]._id}/fulltree.json`, Buffer.from(rev1Content));
			await storeFile(teamspace, `${con._id}.stash.json_mpc.ref`, `${revisions[1]._id}/fulltree.json`, Buffer.from(rev2Content));
		});

		const generateTestData = (modelType) => {
			const model = con;
			const wrongTypeModel = fed;

			const getRoute = ({
				projectId = project.id,
				key = users.tsAdmin.apiKey,
				modelId = model._id,
				revId,
			} = {}) => `/v5/teamspaces/${teamspace}/projects/${projectId}/${modelType}s/${modelId}/assets/tree${internalService ? `${revId ? `?revId=${revId}` : ''}` : `?key=${key}`}`;

			const externalTests = [
				['session is external', getRoute(), false, templates.pageNotFound],
			];

			const internalTests = modelType === modelTypes.CONTAINER ? [
				['the project does not exist', getRoute({ projectId: ServiceHelper.generateRandomString() }), false, templates.projectNotFound],
				['the container does not exist', getRoute({ modelId: ServiceHelper.generateRandomString() }), false, templates.containerNotFound],
				['the model is not a container', getRoute({ modelId: wrongTypeModel._id }), false, templates.containerNotFound],
				['the container does not have a revision', getRoute({ modelId: conNoRev._id }), false, templates.revisionNotFound],
				['a revision is provided by the user', getRoute({ revId: revisions[0]._id }), true, rev1Content],
				['a revision is not provided by the user', getRoute(), true, rev2Content],
			] : [['the model type used in the route is not container', getRoute(), false, templates.pageNotFound]];

			return internalService ? internalTests : externalTests;
		};

		const runTest = (desc, route, success, expectedOutput) => {
			test(`should ${success ? 'succeed' : `fail with ${expectedOutput.code}`} if ${desc}`, async () => {
				const expectedStatus = success ? templates.ok.status : expectedOutput.status;
				const res = await agent.get(route).expect(expectedStatus);
				if (success) {
					const fullOutput = { subTree: [], mainTree: JSON.parse(expectedOutput) };

					expect(res.body).toEqual(fullOutput);
				} else {
					expect(res.body.code).toEqual(expectedOutput.code);
				}
			});
		};

		describe.each(generateTestData(modelTypes.CONTAINER))('Containers', runTest);
		describe.each(generateTestData(modelTypes.FEDERATION))('Federations', runTest);
		describe.each(generateTestData(modelTypes.DRAWING))('Drawings', runTest);
	});
};

describe(ServiceHelper.determineTestGroup(__filename), () => {
	afterEach(() => server.close());
	afterAll(() => ServiceHelper.closeApp(server));
	describe('External Service', () => {
		beforeAll(async () => {
			server = await ServiceHelper.app();
			agent = await SuperTest(server);
		});

		testGetTree();
	});

	describe('Internal Service', () => {
		beforeAll(async () => {
			server = await ServiceHelper.app(true);
			agent = await SuperTest(server);
		});
		testGetTree(true);
	});
});
