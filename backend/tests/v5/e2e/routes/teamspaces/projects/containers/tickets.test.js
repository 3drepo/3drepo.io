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
	viewer: ServiceHelper.generateUserCredentials(),
	noProjectAccess: ServiceHelper.generateUserCredentials(),
	nobody: ServiceHelper.generateUserCredentials(),
};

const teamspace = ServiceHelper.generateRandomString();

const project = ServiceHelper.generateRandomProject();

const models = [
	ServiceHelper.generateRandomModel({ viewers: [users.viewer.user] }),
	ServiceHelper.generateRandomModel({ viewers: [users.viewer.user] }),
	ServiceHelper.generateRandomModel({ isFederation: true }),
];

const modelWithTemplates = models[0];
const fed = models[2];

const ticketTemplates = [
	ServiceHelper.generateTemplate(),
	ServiceHelper.generateTemplate(true),
	ServiceHelper.generateTemplate(),
	ServiceHelper.generateTemplate(true),
];

const setupData = async () => {
	await ServiceHelper.db.createTeamspace(teamspace, [users.tsAdmin.user]);

	const userProms = Object.keys(users).map((key) => ServiceHelper.db.createUser(users[key], key !== 'nobody' ? [teamspace] : []));
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
		ServiceHelper.db.createTemplates(teamspace, ticketTemplates),
	]);
};
const testGetAllTemplates = () => {
	const route = (key, projectId = project.id, modelId = modelWithTemplates._id) => `/v5/teamspaces/${teamspace}/projects/${projectId}/containers/${modelId}/tickets/templates${key ? `?key=${key}` : ''}`;
	describe.each([
		['the user does not have a valid session', false, templates.notLoggedIn],
		['the user is not a member of the teamspace', false, templates.teamspaceNotFound, undefined, undefined, users.nobody.apiKey],
		['the project does not exist', false, templates.projectNotFound, ServiceHelper.generateRandomString(), undefined, users.tsAdmin.apiKey],
		['the container does not exist', false, templates.containerNotFound, project.id, ServiceHelper.generateRandomString(), users.tsAdmin.apiKey],
		['the container provided is a federation', false, templates.containerNotFound, project.id, fed._id, users.tsAdmin.apiKey],
		['the user does not have access to the container', false, templates.notAuthorized, undefined, undefined, users.noProjectAccess.apiKey],
		['should provide the list of templates that are not deprecated', true,
			{ templates: ticketTemplates.flatMap(({ _id, name, deprecated }) => (deprecated ? [] : { _id, name })) },
			undefined, undefined, users.tsAdmin.apiKey],
		['should provide the list of templates including deprecated if the flag is set', true,
			{ templates: ticketTemplates.map(({ _id, name }) => ({ _id, name })) },
			undefined, undefined, users.tsAdmin.apiKey, true],

	])('Get all templates', (desc, success, expectedOutput, projectId, modelId, key, showDeprecated) => {
		test(`should ${success ? 'succeed' : 'fail'} if ${desc}`, async () => {
			const expectedStatus = success ? templates.ok.status : expectedOutput.status;
			const endpoint = route(key, projectId, modelId);
			const res = await agent.get(`${endpoint}${showDeprecated ? '&showDeprecated=true' : ''}`).expect(expectedStatus);

			if (success) {
				expect(res.body).toEqual(expectedOutput);
			} else {
				expect(res.body.code).toEqual(expectedOutput.code);
			}
		});
	});
};

describe('E2E routes/teamspaces/projects/containers/tickets', () => {
	beforeAll(async () => {
		server = await ServiceHelper.app();
		agent = await SuperTest(server);
		await setupData();
	});
	afterAll(() => ServiceHelper.closeApp(server));

	testGetAllTemplates();
});
