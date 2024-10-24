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

const { valueOperators } = require(`${src}/models/metadata.rules.constants`);
const { convertLegacyRules } = require(`${src}/schemas/rules`);

const { templates } = require(`${src}/utils/responseCodes`);

let server;
let agent;

const testExportGroups = () => {
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

	const container = ServiceHelper.generateRandomModel();
	const containerNoGroups = ServiceHelper.generateRandomModel();
	const fed = ServiceHelper.generateRandomModel({ modelType: modelTypes.FEDERATION });
	const fedNoGroups = ServiceHelper.generateRandomModel({ modelType: modelTypes.FEDERATION });

	const groups = [
		ServiceHelper.generateLegacyGroup(teamspace, container._id),
		ServiceHelper.generateLegacyGroup(teamspace, container._id, false, true),
		ServiceHelper.generateLegacyGroup(teamspace, container._id, true, false),
	];

	const legacyFieldSchema = {
		...ServiceHelper.generateLegacyGroup(teamspace, container._id, true, false),
		rules: [{
			name: ServiceHelper.generateRandomString(),
			field: ServiceHelper.generateRandomString(),
			operator: valueOperators.IS.name,
			values: [ServiceHelper.generateRandomString()],
		}],
	};

	const postData = { groups: groups.map(({ _id }) => _id) };

	const generateTestData = (isFed) => {
		const createRoute = ({ projectId = project.id, modelId = isFed ? fed._id : container._id, apiKey = users.tsAdmin.apiKey } = {}) => `/v5/teamspaces/${teamspace}/projects/${projectId}/${isFed ? 'federations' : 'containers'}/${modelId}/groups/export${apiKey ? `?key=${apiKey}` : ''}`;
		const modelLabel = isFed ? 'federations' : 'containers';
		const modelNotFoundRes = isFed ? templates.federationNotFound : templates.containerNotFound;

		const incorrectModelTypeId = isFed ? container._id : fed._id;
		const modelWithNoGroups = isFed ? fedNoGroups._id : containerNoGroups._id;

		return [
			['the user is not authenticated', createRoute({ apiKey: null }), false, templates.notLoggedIn],
			['the user is not a member of the teamspace', createRoute({ apiKey: users.nobody.apiKey }), false, templates.teamspaceNotFound],
			['the project does not exist', createRoute({ projectId: 'dslfkjds' }), false, templates.projectNotFound],
			[`the ${modelLabel} does not exist`, createRoute({ modelId: 'dslfkjds' }), false, modelNotFoundRes],
			[`the model is not a ${modelLabel}`, createRoute({ modelId: incorrectModelTypeId }), false, modelNotFoundRes],
			[`the user does not have permissions to access the ${modelLabel}`, createRoute({ apiKey: users.noProjectAccess.apiKey }), false, templates.notAuthorized],
			['the data is not of the right schema', createRoute(), false, templates.invalidArguments, { groups: 1 }],
			['the groups array is empty', createRoute(), false, templates.invalidArguments, { groups: [] }],
			['the groups requested exists (1)', createRoute(), true, { groups }],
			['the groups requested exists (2)', createRoute(), true, { groups: [groups[0]] }, { groups: [groups[0]._id] }],
			['the groups requested doesn\'t exist', createRoute({ modelId: modelWithNoGroups }), true, { groups: [] }],
			['the groups requested have legacy field schema', createRoute(), true, { groups: [{ ...legacyFieldSchema, rules: convertLegacyRules(legacyFieldSchema.rules) }] }, { groups: [legacyFieldSchema._id] }],
		];
	};

	const runTest = (desc, route, success, expectedRes, post = postData) => {
		test(`Should ${success ? 'succeed' : `fail with ${expectedRes.code}`} if ${desc}`, async () => {
			const expectedStatus = success ? templates.ok.status : expectedRes.status;
			const res = await agent.post(route)
				.send(post)
				.expect(expectedStatus);
			if (success) {
				expect(res.body.groups.length).toBe(expectedRes.groups.length);
				expect(res.body.groups).toEqual(expect.arrayContaining(expectedRes.groups));
			} else {
				expect(res.body.code).toEqual(expectedRes.code);
			}
		});
	};

	describe('Export groups', () => {
		beforeAll(async () => {
			const models = [container, fed, containerNoGroups, fedNoGroups];
			await ServiceHelper.db.createTeamspace(teamspace, [users.tsAdmin.user]);

			const userProms = Object.keys(users).map((key) => ServiceHelper.db.createUser(users[key], key === 'nobody' ? [] : [teamspace]));
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
				ServiceHelper.db.createLegacyGroups(teamspace, container._id, [...groups, legacyFieldSchema]),
				ServiceHelper.db.createLegacyGroups(teamspace, fed._id, [...groups, legacyFieldSchema]),
			]);
		});
		describe.each(generateTestData(true))('Federations', runTest);
		describe.each(generateTestData())('Containers', runTest);
	});
};

const testImportGroups = () => {
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

	const container = ServiceHelper.generateRandomModel();
	const fed = ServiceHelper.generateRandomModel({ modelType: modelTypes.FEDERATION });

	const groups = [
		ServiceHelper.generateLegacyGroup(teamspace, container._id),
		ServiceHelper.generateLegacyGroup(teamspace, container._id, false, true),
		ServiceHelper.generateLegacyGroup(teamspace, container._id, true, false),
	];

	const legacyFieldSchema = {
		...ServiceHelper.generateLegacyGroup(teamspace, container._id, true, false),
		rules: [{
			name: ServiceHelper.generateRandomString(),
			field: ServiceHelper.generateRandomString(),
			operator: valueOperators.IS.name,
			values: [ServiceHelper.generateRandomString()],
		}],
	};

	const postData = { groups };

	const changedGroup = { ...groups[0], name: ServiceHelper.generateRandomString() };
	const newGroup = ServiceHelper.generateLegacyGroup(teamspace, container._id, true, false);
	const partialGroupUpdateTestData = [changedGroup, newGroup];

	const generateTestData = (isFed) => {
		const createRoute = ({ projectId = project.id, modelId = isFed ? fed._id : container._id, apiKey = users.tsAdmin.apiKey } = {}) => `/v5/teamspaces/${teamspace}/projects/${projectId}/${isFed ? 'federations' : 'containers'}/${modelId}/groups/import${apiKey ? `?key=${apiKey}` : ''}`;
		const modelLabel = isFed ? 'federations' : 'containers';
		const modelNotFoundRes = isFed ? templates.federationNotFound : templates.containerNotFound;

		const incorrectModelTypeId = isFed ? container._id : fed._id;

		return [
			['the user is not authenticated', createRoute({ apiKey: null }), false, templates.notLoggedIn],
			['the user is not a member of the teamspace', createRoute({ apiKey: users.nobody.apiKey }), false, templates.teamspaceNotFound],
			['the project does not exist', createRoute({ projectId: 'dslfkjds' }), false, templates.projectNotFound],
			[`the ${modelLabel} does not exist`, createRoute({ modelId: 'dslfkjds' }), false, modelNotFoundRes],
			[`the model is not a ${modelLabel}`, createRoute({ modelId: incorrectModelTypeId }), false, modelNotFoundRes],
			[`the user does not have permissions to access the ${modelLabel}`, createRoute({ apiKey: users.noProjectAccess.apiKey }), false, templates.notAuthorized],
			['the data is not of the right schema', createRoute(), false, templates.invalidArguments, { groups: 1 }],
			['the groups array is empty', createRoute(), false, templates.invalidArguments, { groups: [] }],
			['the groups are valid', createRoute(), true, { post: { groups: postData.groups.map(({ _id }) => _id) }, data: groups }],
			['the same groups are being imported again', createRoute(), true, { post: { groups: postData.groups.map(({ _id }) => _id) }, data: groups }],
			['the user is updating only some of the groups', createRoute(), true, { post: { groups: [...groups.map(({ _id }) => _id), newGroup._id] }, data: [changedGroup, ...groups.slice(1), newGroup] }, { groups: partialGroupUpdateTestData }],
			['the groups have legacy field schema', createRoute(), true, { post: { groups: [legacyFieldSchema._id] }, data: [{ ...legacyFieldSchema, rules: convertLegacyRules(legacyFieldSchema.rules) }] }, { groups: [legacyFieldSchema] }],
		];
	};

	const runTest = (desc, route, success, expectedRes, post = postData) => {
		test(`Should ${success ? 'succeed' : `fail with ${expectedRes.code}`} if ${desc}`, async () => {
			const expectedStatus = success ? templates.ok.status : expectedRes.status;
			const res = await agent.post(route)
				.send(post)
				.expect(expectedStatus);
			if (success) {
				const exportRes = await agent.post(route.replace('/import', '/export'))
					.send(expectedRes.post)
					.expect(templates.ok.status);
				expect(exportRes.body.groups).toEqual(expect.arrayContaining(expectedRes.data));
			} else {
				expect(res.body.code).toEqual(expectedRes.code);
			}
		});
	};

	describe('Import groups', () => {
		beforeAll(async () => {
			const models = [container, fed];
			await ServiceHelper.db.createTeamspace(teamspace, [users.tsAdmin.user]);

			const userProms = Object.keys(users).map((key) => ServiceHelper.db.createUser(users[key], key === 'nobody' ? [] : [teamspace]));
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
			]);
		});
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
	testExportGroups();
	testImportGroups();
});
