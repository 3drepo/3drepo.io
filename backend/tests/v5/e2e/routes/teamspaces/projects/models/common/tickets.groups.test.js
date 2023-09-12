/**
 *  Copyright (C) 2023 3D Repo Ltd
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

const { cloneDeep } = require('lodash');
const SuperTest = require('supertest');
const ServiceHelper = require('../../../../../../helper/services');
const { src } = require('../../../../../../helper/path');
const { FIELD_VALUE_OPERATORS } = require('../../../../../../../../src/v5/models/metadata.rules.constants');

const { templates } = require(`${src}/utils/responseCodes`);

let server;
let agent;

const generateBasicData = () => {
	const template = ServiceHelper.generateTemplate(false, true);

	return ({
		users: {
			tsAdmin: ServiceHelper.generateUserCredentials(),
			tsAdmin2: ServiceHelper.generateUserCredentials(),
			viewer: ServiceHelper.generateUserCredentials(),
			noProjectAccess: ServiceHelper.generateUserCredentials(),
			nobody: ServiceHelper.generateUserCredentials(),
		},
		teamspace: ServiceHelper.generateRandomString(),
		project: ServiceHelper.generateRandomProject(),
		con: ServiceHelper.generateRandomModel(),
		fed: ServiceHelper.generateRandomModel({ isFederation: true }),
		template,
		ticket: ServiceHelper.generateTicket(template),
	});
};

const setupBasicData = async ({ users, teamspace, project, fed, con, template, ticket }) => {
	const models = [fed, con];
	await ServiceHelper.db.createTeamspace(teamspace, [users.tsAdmin.user, users.tsAdmin2.user]);

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
		ServiceHelper.db.createTemplates(teamspace, [template]),
	]);

	await Promise.all([fed, con].map(async (model) => {
		const modelType = fed === model ? 'federation' : 'container';
		const addTicketRoute = (modelId) => `/v5/teamspaces/${teamspace}/projects/${project.id}/${modelType}s/${modelId}/tickets?key=${users.tsAdmin.apiKey}`;
		const getTicketRoute = (modelId, ticketId) => `/v5/teamspaces/${teamspace}/projects/${project.id}/${modelType}s/${modelId}/tickets/${ticketId}?key=${users.tsAdmin.apiKey}`;

		const { body: ticketRes } = await agent.post(addTicketRoute(model._id)).send(ticket);
		/* eslint-disable no-param-reassign */
		const { body: getRes } = await agent.get(getTicketRoute(model._id, ticketRes._id));

		for (const field in getRes.properties) {
			if (getRes.properties[field]?.state) {
				const groupId = getRes.properties[field].state.hidden[1].group;
				model.group = {
					...ticket.properties[field].state.hidden[1].group,
					_id: groupId,
				};
			}
		}

		model.ticket = { ...cloneDeep(ticket), _id: ticketRes._id };
		/* eslint-enable no-param-reassign */
	}));
};

const testGetGroup = () => {
	describe('Get group', () => {
		const basicData = generateBasicData();
		const { users, teamspace, project, con, fed } = basicData;

		beforeAll(async () => {
			await setupBasicData(basicData);
		});

		const generateTestData = (isFed) => {
			const modelType = isFed ? 'federation' : 'container';
			const wrongTypeModel = isFed ? con : fed;
			const model = isFed ? fed : con;
			const modelNotFound = isFed ? templates.federationNotFound : templates.containerNotFound;
			const baseRouteParams = { key: users.tsAdmin.apiKey, projectId: project.id, model, modelType };

			return [
				['the user does not have a valid session', { ...baseRouteParams, key: null }, false, templates.notLoggedIn],
				['the user is not a member of the teamspace', { ...baseRouteParams, key: users.nobody.apiKey }, false, templates.teamspaceNotFound],
				['the project does not exist', { ...baseRouteParams, projectId: ServiceHelper.generateRandomString() }, false, templates.projectNotFound],
				[`the ${modelType} does not exist`, { ...baseRouteParams, model: ServiceHelper.generateRandomModel() }, false, modelNotFound],
				[`the model provided is not a ${modelType}`, { ...baseRouteParams, model: wrongTypeModel }, false, modelNotFound],
				[`the user does not have access to the ${modelType}`, { ...baseRouteParams, key: users.noProjectAccess.apiKey }, false, templates.notAuthorized],
				['the ticket does not exist', { ...baseRouteParams, ticketId: ServiceHelper.generateRandomString() }, false, templates.ticketNotFound],
				['the group does not exist', { ...baseRouteParams, groupId: ServiceHelper.generateRandomString() }, false, templates.groupNotFound],
				['the group id is valid', baseRouteParams, true],
			];
		};

		const runTest = (desc, { model, ...routeParams }, success, expectedOutput) => {
			const getRoute = ({ key, projectId, modelId, ticketId, groupId, modelType }) => `/v5/teamspaces/${teamspace}/projects/${projectId}/${modelType}s/${modelId}/tickets/${ticketId}/groups/${groupId}${key ? `?key=${key}` : ''}`;

			test(`should ${success ? 'succeed' : `fail with ${expectedOutput.code}`} if ${desc}`, async () => {
				const endpoint = getRoute({ modelId: model._id,
					ticketId: model.ticket?._id,
					groupId: model.group?._id,
					...routeParams });
				const expectedStatus = success ? templates.ok.status : expectedOutput.status;

				const res = await agent.get(endpoint).expect(expectedStatus);

				if (success) {
					expect(res.body).toEqual(model.group);
				} else {
					expect(res.body.code).toEqual(expectedOutput.code);
				}
			});
		};

		describe.each(generateTestData(true))('Federations', runTest);
		describe.each(generateTestData())('Containers', runTest);
	});
};

const testUpdateGroup = () => {
	describe('Update group', () => {
		const basicData = generateBasicData();
		const { users, teamspace, project, con, fed } = basicData;

		beforeAll(async () => {
			await setupBasicData(basicData);
		});

		const generateTestData = (isFed) => {
			const modelType = isFed ? 'federation' : 'container';
			const wrongTypeModel = isFed ? con : fed;
			const model = isFed ? fed : con;
			const modelNotFound = isFed ? templates.federationNotFound : templates.containerNotFound;
			const baseRouteParams = { key: users.tsAdmin.apiKey, projectId: project.id, model, modelType };

			const payload = { name: ServiceHelper.generateRandomString() };

			return [
				['the user does not have a valid session', { ...baseRouteParams, key: null }, payload, false, templates.notLoggedIn],
				['the user is not a member of the teamspace', { ...baseRouteParams, key: users.nobody.apiKey }, payload, false, templates.teamspaceNotFound],
				['the project does not exist', { ...baseRouteParams, projectId: ServiceHelper.generateRandomString() }, payload, false, templates.projectNotFound],
				[`the ${modelType} does not exist`, { ...baseRouteParams, model: ServiceHelper.generateRandomModel() }, payload, false, modelNotFound],
				[`the model provided is not a ${modelType}`, { ...baseRouteParams, model: wrongTypeModel }, payload, false, modelNotFound],
				[`the user does not have access to the ${modelType}`, { ...baseRouteParams, key: users.noProjectAccess.apiKey }, payload, false, templates.notAuthorized],
				['the ticket does not exist', { ...baseRouteParams, ticketId: ServiceHelper.generateRandomString() }, payload, false, templates.ticketNotFound],
				['the group does not exist', { ...baseRouteParams, groupId: ServiceHelper.generateRandomString() }, payload, false, templates.groupNotFound],
				['the group id is valid', baseRouteParams, payload, true],
				['the payload contains both rules and objects', baseRouteParams, { rules: [{
					field: 'IFC Type',
					operator: FIELD_VALUE_OPERATORS.IS.name,
					values: [
						'IfcBeam',
					],
				}],
				objects: [{
					container: ServiceHelper.generateUUIDString(),
					_ids: [ServiceHelper.generateUUIDString()],
				}] }, false, templates.invalidArguments],
			];
		};

		const runTest = (desc, { model, ...routeParams }, payload, success, expectedOutput = templates.ok) => {
			const updateRoute = ({ key, projectId, modelId, ticketId, groupId, modelType }) => `/v5/teamspaces/${teamspace}/projects/${projectId}/${modelType}s/${modelId}/tickets/${ticketId}/groups/${groupId}${key ? `?key=${key}` : ''}`;
			const getRoute = ({ key, projectId, modelId, ticketId, groupId, modelType }) => `/v5/teamspaces/${teamspace}/projects/${projectId}/${modelType}s/${modelId}/tickets/${ticketId}/groups/${groupId}${key ? `?key=${key}` : ''}`;
			test(`should ${success ? 'succeed' : `fail with ${expectedOutput.code}`} if ${desc}`, async () => {
				const endpoint = updateRoute({ modelId: model._id,
					ticketId: model.ticket?._id,
					groupId: model.group?._id,
					...routeParams });
				const getEndpoint = getRoute({ modelId: model._id,
					ticketId: model.ticket?._id,
					groupId: model.group?._id,
					...routeParams });

				const expectedStatus = success ? templates.ok.status : expectedOutput.status;

				const res = await agent.patch(endpoint).send(payload).expect(expectedStatus);

				if (success) {
					const getRes = await agent.get(getEndpoint).expect(200);
					expect(getRes.body).toEqual({ ...model.group, ...payload });
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

	testGetGroup();
	testUpdateGroup();
});
