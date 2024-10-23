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
const ServiceHelper = require('../../../helper/services');
const { src } = require('../../../helper/path');
const { generateRandomString } = require('../../../helper/services');

const { templates } = require(`${src}/utils/responseCodes`);
const { templates: emailTemplates } = require(`${src}/services/mailer/mailer.constants`);
const { propTypes } = require(`${src}/schemas/tickets/templates.constants`);

jest.mock('../../../../../src/v5/services/mailer');
const Mailer = require(`${src}/services/mailer`);

let server;
let agent;
const tsAdmin = ServiceHelper.generateUserCredentials();
const normalUser = ServiceHelper.generateUserCredentials();
const nobody = ServiceHelper.generateUserCredentials();

const teamspace = { name: ServiceHelper.generateRandomString() };
const noTemplatesTS = { name: ServiceHelper.generateRandomString() };

const teamspaces = [teamspace, noTemplatesTS];
const auditActions = times(10, () => ServiceHelper.generateAuditAction()).sort((a) => a.timestamp);

const setupData = async () => {
	await Promise.all(teamspaces.map(
		({ name }) => ServiceHelper.db.createTeamspace(name, [tsAdmin.user]),
	));

	await Promise.all([
		...auditActions.map((action) => ServiceHelper.db.createAuditAction(teamspace.name, action)),
		ServiceHelper.db.createUser(tsAdmin, [...teamspaces.map(({ name }) => name)]),
		ServiceHelper.db.createUser(normalUser, [teamspace.name]),
		ServiceHelper.db.createUser(nobody, []),
	]);
};

const generateTemplate = () => ({
	name: generateRandomString(),
	code: generateRandomString(3),
	config: {},
	properties: [
		{
			name: generateRandomString(),
			type: propTypes.TEXT,
			unique: true,
			readOnlyOnUI: true,
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
		['template is empty object', tsAdmin.apiKey, undefined, {}, false, templates.invalidArguments],
		['template is invalid (invalid unique property)', tsAdmin.apiKey, undefined, { ...templateToUse, properties: [{ name: generateRandomString(), type: propTypes.LONG_TEXT, unique: true }] }, false, templates.invalidArguments],
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
	const templateThatClashes = generateTemplate();
	let _id;
	const updateTemplateRoute = (key, ts = teamspace.name, id = _id) => `/v5/teamspaces/${ts}/settings/tickets/templates/${id}${key ? `?key=${key}` : ''}`;
	describe('Update template', () => {
		beforeAll(async () => {
			const res = await agent.post(addTemplateRoute(tsAdmin.apiKey)).send(templateToUse);
			_id = res.body._id;

			await agent.post(addTemplateRoute(tsAdmin.apiKey)).send(templateThatClashes);
		});
		describe.each([
			['user does not have a valid session', undefined, undefined, undefined, templateToUse, false, templates.notLoggedIn],
			['user is not a teamspace admin', normalUser.apiKey, undefined, undefined, templateToUse, false, templates.notAuthorized],
			['teamspace does not exist', tsAdmin.apiKey, generateRandomString(), undefined, templateToUse, false, templates.teamspaceNotFound],
			['user is not a member of the teamspace', normalUser.apiKey, noTemplatesTS.name, undefined, templateToUse, false, templates.teamspaceNotFound],
			['user is a ts admin and there is a valid template', tsAdmin.apiKey, undefined, undefined, { ...templateToUse, name: 'abc' }, true, { ...templateToUse, name: 'abc' }],
			['updated template should retain old properties as deprecated', tsAdmin.apiKey, undefined, undefined,
				{ ...templateToUse, properties: [{ name: 'newProp', type: propTypes.NUMBER }] }, true, { ...templateToUse, properties: [{ name: 'newProp', type: propTypes.NUMBER }, { ...templateToUse.properties[0], deprecated: true }] }],
			['template is invalid', tsAdmin.apiKey, undefined, undefined, {}, false, templates.invalidArguments],
			['template name is already used by another template', tsAdmin.apiKey, undefined, undefined, { ...templateToUse, name: templateThatClashes.name }, false, templates.invalidArguments],
			['template code is already used by another template', tsAdmin.apiKey, undefined, undefined, { ...templateToUse, code: templateThatClashes.code }, false, templates.invalidArguments],
			['template is invalid (invalid unique property)', tsAdmin.apiKey, undefined, undefined, { ...templateToUse, properties: [{ name: generateRandomString(), type: propTypes.LONG_TEXT, unique: true }] }, false, templates.invalidArguments],
			['template id is invalid', tsAdmin.apiKey, undefined, generateRandomString(), templateToUse, false, templates.templateNotFound],
		])('', (desc, key, ts, id, data, success, expectedRes) => {
			test(`should ${success ? 'succeed if' : `fail with ${expectedRes.code}`} if ${desc}`, async () => {
				const expectedStatus = success ? templates.ok.status : expectedRes.status;
				const res = await agent.put(updateTemplateRoute(key, ts, id)).send(data).expect(expectedStatus);
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
			['user does not have a valid session', undefined, undefined, _id, false, templates.notLoggedIn],
			['user is not a teamspace admin', normalUser.apiKey, undefined, _id, false, templates.notAuthorized],
			['teamspace does not exist', tsAdmin.apiKey, generateRandomString(), _id, false, templates.teamspaceNotFound],
			['user is not a member of the teamspace', normalUser.apiKey, noTemplatesTS.name, _id, false, templates.teamspaceNotFound],
			['user is a ts admin and there is a valid template', tsAdmin.apiKey, undefined, _id, true, templateToUse],
			['template id does not exist', tsAdmin.apiKey, undefined, generateRandomString(), false, templates.templateNotFound],
		])('', (desc, key, ts, id, success, expectedRes) => {
			test(`should ${success ? 'succeed if' : `fail with ${expectedRes.code}`} if ${desc}`, async () => {
				const expectedStatus = success ? templates.ok.status : expectedRes.status;
				const res = await agent.get(getTemplateRoute(key, id || _id, ts)).expect(expectedStatus);
				if (success) {
					expect(res.body).toEqual({ _id, ...expectedRes });
				} else {
					expect(res.body.code).toEqual(expectedRes.code);
				}
			});
		});
	});
};

const testGetTemplateList = () => {
	const templateList = times(5, generateTemplate);
	const route = (key, ts = teamspace.name) => `/v5/teamspaces/${ts}/settings/tickets/templates${key ? `?key=${key}` : ''}`;
	describe('Get template List', () => {
		beforeAll(async () => {
			await Promise.all(templateList.map(async (template) => {
				const res = await agent.post(addTemplateRoute(tsAdmin.apiKey)).send(template);
				// eslint-disable-next-line no-param-reassign
				template._id = res.body._id;
			}));
		});
		describe.each([
			['user does not have a valid session', undefined, undefined, false, templates.notLoggedIn],
			['user is not a teamspace admin', normalUser.apiKey, undefined, false, templates.notAuthorized],
			['teamspace does not exist', tsAdmin.apiKey, generateRandomString(), false, templates.teamspaceNotFound],
			['user is not a member of the teamspace', normalUser.apiKey, noTemplatesTS.name, false, templates.teamspaceNotFound],
			['user is a ts admin', tsAdmin.apiKey, undefined, true],
		])('', (desc, key, ts, success, expectedRes) => {
			test(`should ${success ? 'succeed if' : `fail with ${expectedRes.code}`} if ${desc}`, async () => {
				const expectedStatus = success ? templates.ok.status : expectedRes.status;
				const res = await agent.get(route(key, ts)).expect(expectedStatus);
				if (success) {
					expect(res.body.templates).toEqual(expect.arrayContaining(templateList.map(
						({ _id, name, code }) => ({ _id, name, code }),
					)));
				} else {
					expect(res.body.code).toEqual(expectedRes.code);
				}
			});
		});
	});
};

const testGetRiskCategories = () => {
	const route = (key, ts = teamspace.name) => `/v5/teamspaces/${ts}/settings/tickets/riskCategories${key ? `?key=${key}` : ''}`;
	describe('Risk Categories', () => {
		describe.each([
			['user does not have a valid session', undefined, undefined, false, templates.notLoggedIn],
			['teamspace does not exist', tsAdmin.apiKey, generateRandomString(), false, templates.teamspaceNotFound],
			['user is not a member of the teamspace', normalUser.apiKey, noTemplatesTS.name, false, templates.teamspaceNotFound],
			['user is a member of teamspace', normalUser.apiKey, undefined, true],
		])('', (desc, key, ts, success, expectedRes) => {
			test(`should ${success ? 'succeed if' : `fail with ${expectedRes.code}`} if ${desc}`, async () => {
				const expectedStatus = success ? templates.ok.status : expectedRes.status;
				const res = await agent.get(route(key, ts)).expect(expectedStatus);
				if (success) {
					expect(res.body.riskCategories).toEqual(expect.arrayContaining(['Commercial Issue', 'Environmental Issue', 'Health - Material effect', 'Health - Mechanical effect', 'Safety Issue - Fall', 'Safety Issue - Trapped', 'Safety Issue - Event', 'Safety Issue - Handling', 'Safety Issue - Struck', 'Safety Issue - Public', 'Social Issue', 'Other Issue', 'Unknown']));
				} else {
					expect(res.body.code).toEqual(expectedRes.code);
				}
			});
		});
	});
};

const testGetAuditLogArchive = () => {
	describe('Get audit log archive', () => {
		const route = (key, ts = teamspace.name, query) => `/v5/teamspaces/${ts}/settings/activities/archive${key ? `?key=${key}${query ? `&from=${query.from}&to=${query.to}` : ''}` : ''}`;

		describe.each([
			['user does not have a valid session', undefined, undefined, undefined, false, templates.notLoggedIn],
			['teamspace does not exist', tsAdmin.apiKey, generateRandomString(), undefined, false, templates.teamspaceNotFound],
			['user is not a member of the teamspace', nobody.apiKey, undefined, undefined, false, templates.teamspaceNotFound],
			['user is not a teamspace admin', normalUser.apiKey, undefined, undefined, false, templates.notAuthorized],
			['user is a teamspace admin', tsAdmin.apiKey, undefined, undefined, true],
			['user is a teamspace admin but there are no activities', tsAdmin.apiKey, noTemplatesTS.name, undefined, true],
			['query is invalid', tsAdmin.apiKey, undefined, { from: Date.now() + 10000, to: Date.now() - 10000 }, false, templates.invalidArguments],
		])('', (desc, key, ts, query, success, expectedRes) => {
			test(`should ${success ? 'succeed' : `fail with ${expectedRes.code}`} if ${desc}`, async () => {
				const expectedStatus = success ? templates.ok.status : expectedRes.status;

				const res = await agent.get(route(key, ts, query))
					.expect(expectedStatus);

				if (success) {
					expect(res.headers['content-disposition']).toEqual('attachment;filename=audit.zip');
					expect(res.headers['content-type']).toEqual('application/zip');
					expect(Mailer.sendEmail).toHaveBeenCalledTimes(1);
					const { password } = Mailer.sendEmail.mock.calls[0][2];
					expect(Mailer.sendEmail).toHaveBeenCalledWith(emailTemplates.AUDIT.name,
						tsAdmin.basicData.email, { firstName: tsAdmin.basicData.firstName, password });
				} else {
					expect(res.body.code).toEqual(expectedRes.code);
				}
			});
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
	testAddTemplate();
	testUpdateTemplate();
	testGetTemplate();
	testGetTemplateList();
	testGetRiskCategories();
	testGetAuditLogArchive();
});
