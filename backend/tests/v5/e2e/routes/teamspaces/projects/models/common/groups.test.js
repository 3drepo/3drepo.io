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

const { templates } = require(`${src}/utils/responseCodes`);

let server;
let agent;

const users = {
	tsAdmin: ServiceHelper.generateUserCredentials(),
	noProjectAccess: ServiceHelper.generateUserCredentials(),
	nobody: ServiceHelper.generateUserCredentials(),
};

const teamspace = ServiceHelper.generateRandomString();

const project = {
	id: ServiceHelper.generateUUIDString(),
	name: ServiceHelper.generateRandomString(),
};

const modelWithGroups = {
	_id: ServiceHelper.generateUUIDString(),
	name: ServiceHelper.generateRandomString(),
	isFavourite: true,
	properties: { ...ServiceHelper.generateRandomModelProperties(), federate: true },
};
const modelWithoutGroups = {
	_id: ServiceHelper.generateUUIDString(),
	name: ServiceHelper.generateRandomString(),
	properties: { ...ServiceHelper.generateRandomModelProperties(), federate: true },
};
const modelForImport = {
	_id: ServiceHelper.generateUUIDString(),
	name: ServiceHelper.generateRandomString(),
	properties: { ...ServiceHelper.generateRandomModelProperties(), federate: true },
};
const notFed = {
	_id: ServiceHelper.generateUUIDString(),
	name: ServiceHelper.generateRandomString(),
	properties: ServiceHelper.generateRandomModelProperties(),
};

const groups = [
	ServiceHelper.generateGroup(teamspace, modelWithGroups._id),
	ServiceHelper.generateGroup(teamspace, modelWithGroups._id, false, true),
	ServiceHelper.generateGroup(teamspace, modelWithGroups._id, true, false),
];

const setupData = async () => {
	const models = [modelWithGroups, modelWithoutGroups, modelForImport, notFed];
	await ServiceHelper.db.createTeamspace(teamspace, [users.tsAdmin.user]);
	const customData = { starredModels: {
		[teamspace]: models.flatMap(({ _id, isFavourite }) => (isFavourite ? _id : [])),
	} };
	const userProms = Object.keys(users).map((key) => ServiceHelper.db.createUser(users[key], key === 'nobody' ? [] : [teamspace], customData));
	const modelProms = models.map((model) => ServiceHelper.db.createModel(
		teamspace,
		model._id,
		model.name,
		model.properties,
	));
	return Promise.all([
		...userProms,
		...modelProms,
		ServiceHelper.db.createProject(teamspace, project.id, project.name, models.map(({ _id }) => _id)),
		ServiceHelper.db.createGroups(teamspace, modelWithGroups._id, groups),
	]);
};

const testExportGroups = () => {
	const createRoute = ({ projectId = project.id, modelId = modelWithGroups._id, apiKey = users.tsAdmin.apiKey } = {}) => `/v5/teamspaces/${teamspace}/projects/${projectId}/federations/${modelId}/groups/export${apiKey ? `?key=${apiKey}` : ''}`;
	const postData = { groups: groups.map(({ _id }) => _id) };
	describe.each([
		['the user is not authenticated', createRoute({ apiKey: null }), false, templates.notLoggedIn],
		['the user is not a member of the teamspace', createRoute({ apiKey: users.nobody.apiKey }), false, templates.teamspaceNotFound],
		['the project does not exist', createRoute({ projectId: 'dslfkjds' }), false, templates.projectNotFound],
		['the federation does not exist', createRoute({ modelId: 'dslfkjds' }), false, templates.federationNotFound],
		['the federation is actually a container', createRoute({ modelId: notFed._id }), false, templates.federationNotFound],
		['the user does not have permissions to access the federation', createRoute({ apiKey: users.noProjectAccess.apiKey }), false, templates.notAuthorized],
		['the data is not of the right schema', createRoute(), false, templates.invalidArguments, { groups: 1 }],
		['the groups array is empty', createRoute(), false, templates.invalidArguments, { groups: [] }],
		['the groups requested exists (1)', createRoute(), true, { groups }],
		['the groups requested exists (2)', createRoute(), true, { groups: [groups[0]] }, { groups: [groups[0]._id] }],
		['the groups requested doesn\'t exists', createRoute({ modelId: modelWithoutGroups._id }), true, { groups: [] }],

	])('Export groups', (desc, route, success, expectedRes, post = postData) => {
		test(`Should ${success ? 'succeed' : `fail with ${expectedRes.code}`} if ${desc}`, async () => {
			const expectedStatus = success ? templates.ok.status : expectedRes.status;
			const res = await agent.post(route)
				.send(post)
				.expect(expectedStatus);
			if (success) {
				expect(res.body).toEqual(expectedRes);
			} else {
				expect(res.body.code).toEqual(expectedRes.code);
			}
		});
	});
};

const testImportGroups = () => {
	const createRoute = ({ projectId = project.id, modelId = modelForImport._id, apiKey = users.tsAdmin.apiKey } = {}) => `/v5/teamspaces/${teamspace}/projects/${projectId}/federations/${modelId}/groups/import${apiKey ? `?key=${apiKey}` : ''}`;
	const exportRoute = ({ projectId = project.id, modelId = modelForImport._id, apiKey = users.tsAdmin.apiKey } = {}) => `/v5/teamspaces/${teamspace}/projects/${projectId}/federations/${modelId}/groups/export${apiKey ? `?key=${apiKey}` : ''}`;

	const postData = { groups };

	const changedGroup = { ...groups[0], name: ServiceHelper.generateRandomString() };
	const newGroup = ServiceHelper.generateGroup(teamspace, modelWithGroups._id, true, false);
	const partialGroupUpdateTestData = [changedGroup, newGroup];

	describe.each([
		['the user is not authenticated', createRoute({ apiKey: null }), false, templates.notLoggedIn],
		['the user is not a member of the teamspace', createRoute({ apiKey: users.nobody.apiKey }), false, templates.teamspaceNotFound],
		['the project does not exist', createRoute({ projectId: 'dslfkjds' }), false, templates.projectNotFound],
		['the federation does not exist', createRoute({ modelId: 'dslfkjds' }), false, templates.federationNotFound],
		['the federation is actually a container', createRoute({ modelId: notFed._id }), false, templates.federationNotFound],
		['the user does not have permissions to access the federation', createRoute({ apiKey: users.noProjectAccess.apiKey }), false, templates.notAuthorized],
		['the data is not of the right schema', createRoute(), false, templates.invalidArguments, { groups: 1 }],
		['the groups array is empty', createRoute(), false, templates.invalidArguments, { groups: [] }],
		['the groups are valid', createRoute(), true, { post: { groups: postData.groups.map(({ _id }) => _id) }, data: groups }],
		['the same groups are being imported again', createRoute(), true, { post: { groups: postData.groups.map(({ _id }) => _id) }, data: groups }],
		['the user is updating only some of the groups', createRoute(), true, { post: { groups: [...groups.map(({ _id }) => _id), newGroup._id] }, data: expect.arrayContaining([changedGroup, ...groups.slice(1), newGroup]) }, { groups: partialGroupUpdateTestData }],
	])('Import groups', (desc, route, success, expectedRes, post = postData) => {
		test(`Should ${success ? 'succeed' : `fail with ${expectedRes.code}`} if ${desc}`, async () => {
			const expectedStatus = success ? templates.ok.status : expectedRes.status;
			const res = await agent.post(route)
				.send(post)
				.expect(expectedStatus);
			if (success) {
				const exportRes = await agent.post(exportRoute())
					.send({ groups: post.groups.map(({ _id }) => _id) })
					.expect(templates.ok.status);
				expect(exportRes.body.groups).toEqual(post.groups);
			} else {
				expect(res.body.code).toEqual(expectedRes.code);
			}
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
	testExportGroups();
	testImportGroups();
});
