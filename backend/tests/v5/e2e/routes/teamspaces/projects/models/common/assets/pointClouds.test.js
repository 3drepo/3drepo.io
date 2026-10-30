/**
 *  Copyright (C) 2026 3D Repo Ltd
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

const { determineTestGroup } = require('../../../../../../../helper/utils');
const { times } = require('lodash');
const SuperTest = require('supertest');
const {
	generateUUIDString,
	generateRandomString,
	generateUserCredentials,
	generateRandomProject,
	generateRandomModel,
} = require('../../../../../../../helper/dataGen');
const ServiceHelper = require('../../../../../../../helper/services');
const { src } = require('../../../../../../../helper/path');

const STASH_POINTCLOUD_EXT = '.stash.pointclouds';
const STASH_POINTCLOUD_OCTREE_FILE = 'octree.bin';
const STASH_POINTCLOUD_HIERARCHY_FILE = 'hierarchy.bin';

const { storeFile } = require(`${src}/services/filesManager`);
const { modelTypes } = require(`${src}/models/modelSettings.constants`);
const { templates } = require(`${src}/utils/responseCodes`);

let server;
let agent;

const generateBasicData = () => {
	const viewer = generateUserCredentials();
	const commenter = generateUserCredentials();
	const collaborator = generateUserCredentials();
	const perms = {
		viewers: [viewer.user],
		commenters: [commenter.user],
		collaborators: [collaborator.user],
	};
	const data = {
		users: {
			tsAdmin: generateUserCredentials(),
			noProjectAccess: generateUserCredentials(),
			nobody: generateUserCredentials(),
			projectAdmin: generateUserCredentials(),
			viewer,
			commenter,
			collaborator,
		},
		teamspace: generateRandomString(),
		project: generateRandomProject(),
		con: generateRandomModel(perms),
		conNoRev: generateRandomModel(perms),

		revisions: times(2, () => ServiceHelper.generateRevisionEntry(false, false, modelTypes.CONTAINER)),
	};

	data.fed = generateRandomModel({
		...perms,
		modelType: modelTypes.FEDERATION,
		properties: { subModels: [{ _id: data.con._id }, { _id: data.conNoRev._id }] },
	});

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

const testGetOctree = (internalService) => {
	describe('Get Octree Data', () => {
		const { users, teamspace, project, con, fed, revisions } = generateBasicData();

		const octree1Content = Buffer.from(generateRandomString());
		const octree1Name = `${revisions[0]._id}/${STASH_POINTCLOUD_OCTREE_FILE}`;

		const octree2Content = Buffer.from(generateRandomString());
		const octree2Name = `${revisions[1]._id}/${STASH_POINTCLOUD_OCTREE_FILE}`;

		beforeAll(async () => {
			const models = [con];
			await setupBasicData(users, teamspace, project, models);

			await ServiceHelper.db.createRevision(teamspace, project.id, con._id,
				{ ...revisions[0], timestamp: new Date() }, modelTypes.CONTAINER);
			await ServiceHelper.db.createRevision(teamspace, project.id, con._id,
				{ ...revisions[1], timestamp: new Date(Date.now() + 1000) }, modelTypes.CONTAINER);

			await storeFile(teamspace, `${con._id}${STASH_POINTCLOUD_EXT}`, octree1Name, octree1Content);
			await storeFile(teamspace, `${con._id}${STASH_POINTCLOUD_EXT}`, octree2Name, octree2Content);
		});

		const generateTestData = () => {
			const getRoute = ({
				projectId = project.id,
				key = users.tsAdmin.apiKey,
				modelId = con._id,
				revId = revisions[0]._id,
				offset = 0,
				size = 10,
			} = {}) => `/v5/teamspaces/${teamspace}/projects/${projectId}/containers/${modelId}/assets/pointClouds/octree/${ServiceHelper.createQueryString({
				key: internalService ? undefined : key,
				revId,
				offset,
				size,
			})}`;

			const externalTests = [
				['the user does not have a valid session', getRoute({ key: null }), false, templates.notLoggedIn],
				['the user is not a member of the teamspace', getRoute({ key: users.nobody.apiKey }), false, templates.teamspaceNotFound],
				['the user does not have access to the model', getRoute({ key: users.noProjectAccess.apiKey }), false, templates.notAuthorized],
			];

			const commonTests = [
				['the project does not exist', getRoute({ projectId: generateRandomString() }), false, templates.projectNotFound],
				['model does not exist', getRoute({ modelId: generateRandomString() }), false, templates.modelNotFound],
				['the model is of the wrong type', getRoute({ modelId: fed._id }), false, templates.modelNotFound],

				['the offset parameter is missing', getRoute({ offset: null }), false, templates.invalidArguments],
				['the size parameter is missing', getRoute({ size: null }), false, templates.invalidArguments],
				['the offset and size parameter is missing', getRoute({ offset: null, size: null }), false, templates.invalidArguments],
				['the offset parameter is not a number', getRoute({ offset: 'invalid' }), false, templates.invalidArguments],
				['the size parameter is not a number', getRoute({ size: 'invalid' }), false, templates.invalidArguments],
				['the offset and size parameter are not numbers', getRoute({ offset: 'invalid', size: 'invalid' }), false, templates.invalidArguments],

				['a not existing revision id is provided by the user', getRoute({ revId: generateUUIDString() }), false, templates.revisionNotFound],
				['no revision id is provided by the user', getRoute({ revId: undefined }), true, octree1Content.subarray(0, 10)],
				['a specific revision id is provided by the user', getRoute({ revId: revisions[1]._id }), true, octree2Content.subarray(0, 10)],

				['a section of 15 starting a 0 is requested', getRoute({ size: 15 }), true, octree1Content.subarray(0, 15)],
				['a section of 5 starting a 10 is requested', getRoute({ offset: 10, size: 5 }), true, octree1Content.subarray(10, 15)],
			];

			return [
				...commonTests,
				...(internalService ? [] : externalTests),
			];
		};

		const runTest = (desc, route, success, expectedOutput) => {
			test(`should ${success ? 'succeed' : `fail with ${expectedOutput.code}`} if ${desc}`, async () => {
				const expectedStatus = success ? templates.ok.status : expectedOutput.status;
				const res = await agent.get(route).expect(expectedStatus);
				if (success) {
					expect(res.body).toEqual(expectedOutput);
				} else {
					expect(res.body.code).toEqual(expectedOutput.code);
				}
			});
		};

		describe.each(generateTestData(modelTypes.CONTAINER))('Containers', runTest);
	});
};

const testGetHierarchy = (internalService) => {
	describe('Get Hierarchy', () => {
		const { users, teamspace, project, con, fed, revisions } = generateBasicData();

		const hierarchy1Content = Buffer.from(generateRandomString());
		const hierarchy1Name = `${revisions[0]._id}/${STASH_POINTCLOUD_HIERARCHY_FILE}`;

		const hierarchy2Content = Buffer.from(generateRandomString());
		const hierarchy2Name = `${revisions[1]._id}/${STASH_POINTCLOUD_HIERARCHY_FILE}`;

		beforeAll(async () => {
			const models = [con];
			await setupBasicData(users, teamspace, project, models);

			await ServiceHelper.db.createRevision(teamspace, project.id, con._id,
				{ ...revisions[0], timestamp: new Date() }, modelTypes.CONTAINER);
			await ServiceHelper.db.createRevision(teamspace, project.id, con._id,
				{ ...revisions[1], timestamp: new Date(Date.now() + 1000) }, modelTypes.CONTAINER);

			await storeFile(teamspace, `${con._id}${STASH_POINTCLOUD_EXT}`, hierarchy1Name, hierarchy1Content);
			await storeFile(teamspace, `${con._id}${STASH_POINTCLOUD_EXT}`, hierarchy2Name, hierarchy2Content);
		});

		const generateTestData = () => {
			const getRoute = ({
				projectId = project.id,
				key = users.tsAdmin.apiKey,
				modelId = con._id,
				revId = revisions[0]._id,
				offset = 0,
				size = 10,
			} = {}) => `/v5/teamspaces/${teamspace}/projects/${projectId}/containers/${modelId}/assets/pointClouds/hierarchy/${ServiceHelper.createQueryString({
				key: internalService ? undefined : key,
				revId,
				offset,
				size,
			})}`;

			const externalTests = [
				['the user does not have a valid session', getRoute({ key: null }), false, templates.notLoggedIn],
				['the user is not a member of the teamspace', getRoute({ key: users.nobody.apiKey }), false, templates.teamspaceNotFound],
				['the user does not have access to the model', getRoute({ key: users.noProjectAccess.apiKey }), false, templates.notAuthorized],
			];

			const commonTests = [
				['the project does not exist', getRoute({ projectId: generateRandomString() }), false, templates.projectNotFound],
				['model does not exist', getRoute({ modelId: generateRandomString() }), false, templates.modelNotFound],
				['the model is of the wrong type', getRoute({ modelId: fed._id }), false, templates.modelNotFound],

				['the offset parameter is missing', getRoute({ offset: null }), false, templates.invalidArguments],
				['the size parameter is missing', getRoute({ size: null }), false, templates.invalidArguments],
				['the offset and size parameter is missing', getRoute({ offset: null, size: null }), false, templates.invalidArguments],
				['the offset parameter is not a number', getRoute({ offset: 'invalid' }), false, templates.invalidArguments],
				['the size parameter is not a number', getRoute({ size: 'invalid' }), false, templates.invalidArguments],
				['the offset and size parameter are not numbers', getRoute({ offset: 'invalid', size: 'invalid' }), false, templates.invalidArguments],

				['a not existing revision id is provided by the user', getRoute({ revId: generateUUIDString() }), false, templates.revisionNotFound],
				['no revision id is provided by the user', getRoute({ revId: undefined }), true, hierarchy1Content.subarray(0, 10)],
				['a specific revision id is provided by the user', getRoute({ revId: revisions[1]._id }), true, hierarchy2Content.subarray(0, 10)],

				['a section of 15 starting a 0 is requested', getRoute({ size: 15 }), true, hierarchy1Content.subarray(0, 15)],
				['a section of 5 starting a 10 is requested', getRoute({ offset: 10, size: 5 }), true, hierarchy1Content.subarray(10, 15)],
			];

			return [
				...commonTests,
				...(internalService ? [] : externalTests),
			];
		};

		const runTest = (desc, route, success, expectedOutput) => {
			test(`should ${success ? 'succeed' : `fail with ${expectedOutput.code}`} if ${desc}`, async () => {
				const expectedStatus = success ? templates.ok.status : expectedOutput.status;
				const res = await agent.get(route).expect(expectedStatus);
				if (success) {
					expect(res.body).toEqual(expectedOutput);
				} else {
					expect(res.body.code).toEqual(expectedOutput.code);
				}
			});
		};

		describe.each(generateTestData(modelTypes.CONTAINER))('Containers', runTest);
	});
};

describe(determineTestGroup(__filename), () => {
	afterEach(() => server.close());
	afterAll(() => ServiceHelper.closeApp(server));
	describe('External Services', () => {
		beforeAll(async () => {
			server = await ServiceHelper.app();
			agent = await SuperTest(server);
		});

		testGetOctree();
		testGetHierarchy();
	});

	describe('Internal Service', () => {
		beforeAll(async () => {
			server = await ServiceHelper.app(true);
			agent = await SuperTest(server);
		});

		testGetOctree(true);
		testGetHierarchy(true);
	});
});
