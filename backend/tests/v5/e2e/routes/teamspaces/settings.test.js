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
const ServiceHelper = require('../../../helper/services');
const { src } = require('../../../helper/path');
const { generateRandomString } = require('../../../helper/services');

const { templates } = require(`${src}/utils/responseCodes`);
const { fieldTypes } = require(`${src}/schemas/tickets/templates.constants`);

let server;
let agent;
const tsAdmin = ServiceHelper.generateUserCredentials();
const normalUser = ServiceHelper.generateUserCredentials();

const teamspace = { name: ServiceHelper.generateRandomString() };
const noTemplatesTS = { name: ServiceHelper.generateRandomString() };

const teamspaces = [teamspace, noTemplatesTS];

const setupData = async () => {
	await Promise.all(teamspaces.map(
		({ name }) => ServiceHelper.db.createTeamspace(name, [tsAdmin.user], false),
	));

	await Promise.all([
		ServiceHelper.db.createUser(
			tsAdmin,
			[...teamspaces.map(({ name }) => name)],
		),
		ServiceHelper.db.createUser(
			normalUser,
			[teamspace.name],
		),
	]);
};

const generateTemplate = () => ({
	name: generateRandomString(),
	properties: [
		{
			name: generateRandomString(),
			type: fieldTypes.TEXT,
		},
	],
	modules: [],
});

const getTemplateRoute = (key, id, ts = teamspace.name) => `/v5/teamspaces/${ts}/settings/tickets/templates/${id}${key ? `?key=${key}` : ''}`;
const addTemplateRoute = (key, ts = teamspace.name) => `/v5/teamspaces/${ts}/settings/tickets/templates${key ? `?key=${key}` : ''}`;
const testAddTemplate = () => {
	const templateToUse = generateTemplate();
	describe.each([
		['user does not have a valid session', undefined, undefined, templateToUse, false, templates.notLoggedIn],
		['user is not a teamspace admin', normalUser.apiKey, undefined, templateToUse, false, templates.notAuthorized],
		['teamspace does not exist', tsAdmin.apiKey, generateRandomString(), templateToUse, false, templates.teamspaceNotFound],
		['user is not a member of the teamspace', normalUser.apiKey, noTemplatesTS.name, templateToUse, false, templates.teamspaceNotFound],
		['user is a ts admin and there is a valid template', tsAdmin.apiKey, undefined, templateToUse, true],
		['template is invalid', tsAdmin.apiKey, undefined, {}, false, templates.invalidArguments],
	])('Add template', (desc, key, ts, data, success, expectedRes) => {
		test(`should ${success ? 'succeed if' : `fail with ${expectedRes.code}`} if ${desc}`, async () => {
			const expectedStatus = success ? templates.ok.status : expectedRes.status;
			const res = await agent.post(addTemplateRoute(key, ts)).send(data).expect(expectedStatus);
			if (success) {
				expect(res.body?._id).not.toBeUndefined();
				const { _id } = res.body;
				const getRes = await agent.get(getTemplateRoute(key, _id, ts)).expect(templates.ok.status);

				expect(getRes.body).toEqual({ _id, ...data });
			} else {
				expect(res.body.code).toEqual(expectedRes.code);
			}
		});
	});
};

const testUpdateTemplate = () => {
	const templateToUse = generateTemplate();
	let _id;
	const updateTemplateRoute = (key, ts = teamspace.name) => `/v5/teamspaces/${ts}/settings/tickets/templates/${_id}${key ? `?key=${key}` : ''}`;
	describe('Update template', () => {
		beforeAll(async () => {
			const res = await agent.post(addTemplateRoute(tsAdmin.apiKey)).send(templateToUse);
			_id = res.body._id;
		});
		describe.each([
			['user does not have a valid session', undefined, undefined, templateToUse, false, templates.notLoggedIn],
			['user is not a teamspace admin', normalUser.apiKey, undefined, templateToUse, false, templates.notAuthorized],
			['teamspace does not exist', tsAdmin.apiKey, generateRandomString(), templateToUse, false, templates.teamspaceNotFound],
			['user is not a member of the teamspace', normalUser.apiKey, noTemplatesTS.name, templateToUse, false, templates.teamspaceNotFound],
			['user is a ts admin and there is a valid template', tsAdmin.apiKey, undefined, { ...templateToUse, name: 'abc' }, true, { ...templateToUse, name: 'abc' }],
			['updated template should retain old properties as deprecated', tsAdmin.apiKey, undefined,
				{ ...templateToUse, properties: [{ name: 'newProp', type: fieldTypes.NUMBER }] }, true, { ...templateToUse, properties: [{ name: 'newProp', type: fieldTypes.NUMBER }, { ...templateToUse.properties[0], deprecated: true }] }],
			['template is invalid', tsAdmin.apiKey, undefined, {}, false, templates.invalidArguments],
		])('', (desc, key, ts, data, success, expectedRes) => {
			test(`should ${success ? 'succeed if' : `fail with ${expectedRes.code}`} if ${desc}`, async () => {
				const expectedStatus = success ? templates.ok.status : expectedRes.status;
				const res = await agent.put(updateTemplateRoute(key, ts)).send(data).expect(expectedStatus);
				if (success) {
					const getRes = await agent.get(getTemplateRoute(key, _id, ts)).expect(templates.ok.status);
					expect(getRes.body).toEqual({ _id, ...expectedRes });
				} else {
					expect(res.body.code).toEqual(expectedRes.code);
				}
			});
		});
	});
};

const testGetTemplate = () => {
	const templateToUse = generateTemplate();
	let _id;
	describe('Get template', () => {
		beforeAll(async () => {
			const res = await agent.post(addTemplateRoute(tsAdmin.apiKey)).send(templateToUse);
			_id = res.body._id;
		});
		describe.each([
			['user does not have a valid session', undefined, undefined, false, templates.notLoggedIn],
			['user is not a teamspace admin', normalUser.apiKey, undefined, false, templates.notAuthorized],
			['teamspace does not exist', tsAdmin.apiKey, generateRandomString(), false, templates.teamspaceNotFound],
			['user is not a member of the teamspace', normalUser.apiKey, noTemplatesTS.name, false, templates.teamspaceNotFound],
			['user is a ts admin and there is a valid template', tsAdmin.apiKey, undefined, true, templateToUse],
		])('', (desc, key, ts, success, expectedRes) => {
			test(`should ${success ? 'succeed if' : `fail with ${expectedRes.code}`} if ${desc}`, async () => {
				const expectedStatus = success ? templates.ok.status : expectedRes.status;
				const res = await agent.get(getTemplateRoute(key, _id, ts)).expect(expectedStatus);
				if (success) {
					expect(res.body).toEqual({ _id, ...expectedRes });
				} else {
					expect(res.body.code).toEqual(expectedRes.code);
				}
			});
		});
	});
};

describe('E2E routes/teamspaces/settings', () => {
	beforeAll(async () => {
		server = await ServiceHelper.app();
		agent = await SuperTest(server);
		await setupData();
	});
	afterAll(() => ServiceHelper.closeApp(server));
	testAddTemplate();
	testUpdateTemplate();
	testGetTemplate();
});
