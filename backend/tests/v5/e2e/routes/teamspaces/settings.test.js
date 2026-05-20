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

const { determineTestGroup } = require('../../../helper/utils');
const { times } = require('lodash');
const SuperTest = require('supertest');
const ServiceHelper = require('../../../helper/services');
const { src } = require('../../../helper/path');
const { generateRandomString } = require('../../../helper/services');

const { actions } = require(`${src}/models/teamspaces.audits.constants`);
const { templates } = require(`${src}/utils/responseCodes`);
const { templates: emailTemplates } = require(`${src}/services/mailer/mailer.constants`);
const { propTypes } = require(`${src}/schemas/tickets/templates.constants`);

jest.mock('../../../../../src/v5/services/mailer');
const Mailer = require(`${src}/services/mailer`);

let server;
let agent;

const generateBasicData = () => {
	const teamspace = { name: ServiceHelper.generateRandomString() };
	const noTemplatesTS = { name: ServiceHelper.generateRandomString() };

	return {
		tsAdmin: ServiceHelper.generateUserCredentials(),
		normalUser: ServiceHelper.generateUserCredentials(),
		nobody: ServiceHelper.generateUserCredentials(),
		teamspace,
		noTemplatesTS,
		teamspaces: [teamspace, noTemplatesTS],
		auditActions: [
			ServiceHelper.generateAuditAction(actions.USER_ADDED),
			ServiceHelper.generateAuditAction(actions.USER_REMOVED),
			ServiceHelper.generateAuditAction(actions.PERMISSIONS_UPDATED),
			ServiceHelper.generateAuditAction(actions.INVITATION_ADDED),
			ServiceHelper.generateAuditAction(actions.INVITATION_REVOKED),
		].sort((a) => a.timestamp),
	};
};

const setupData = async ({ tsAdmin, normalUser, nobody, teamspace, teamspaces, auditActions }) => {
	await ServiceHelper.db.createUser(tsAdmin);
	await Promise.all(teamspaces.map(
		({ name }) => ServiceHelper.db.createTeamspace(name, [tsAdmin.user]),
	));

	await Promise.all([
		...auditActions.map((action) => ServiceHelper.db.createAuditAction(teamspace.name, action)),
		ServiceHelper.db.createUser(normalUser, [teamspace.name]),
		ServiceHelper.db.createUser(nobody, []),
	]);
};

const setupTestData = async (data) => {
	jest.clearAllMocks();
	await ServiceHelper.db.reset();

	await setupData(data);
};

const getTemplateRoute = ({ teamspace }, key, id, ts = teamspace.name) => `/v5/teamspaces/${ts}/settings/tickets/templates/${id}${key ? `?key=${key}` : ''}`;
const addTemplateRoute = ({ teamspace }, key, ts = teamspace.name) => `/v5/teamspaces/${ts}/settings/tickets/templates${key ? `?key=${key}` : ''}`;
const createTemplates = (basicData, templatesToCreate) => ServiceHelper.db.createTemplates(
	basicData.teamspace.name, templatesToCreate);
const withRouteId = ({ _id, ...template }, routeId) => ({ _id: routeId ?? _id, ...template });
const deprecateProperties = (properties) => properties.map((property) => ({ ...property, deprecated: true }));

const testAddTemplate = () => {
	describe('Add template', () => {
		const basicData = generateBasicData();
		const templateToUse = ServiceHelper.generateTemplate();
		beforeAll(() => setupTestData(basicData));

		describe.each([
			['user does not have a valid session', false, templates.notLoggedIn, () => ({ data: templateToUse })],
			['user is not a teamspace admin', false, templates.notAuthorized, () => ({ key: basicData.normalUser.apiKey, data: templateToUse })],
			['teamspace does not exist', false, templates.teamspaceNotFound, () => ({ key: basicData.tsAdmin.apiKey, ts: generateRandomString(), data: templateToUse })],
			['user is not a member of the teamspace', false, templates.teamspaceNotFound, () => ({ key: basicData.normalUser.apiKey, ts: basicData.noTemplatesTS.name, data: templateToUse })],
			['user is a ts admin and there is a valid template', true, undefined, () => ({ key: basicData.tsAdmin.apiKey, data: templateToUse })],
			['template is empty object', false, templates.invalidArguments, () => ({ key: basicData.tsAdmin.apiKey, data: {} })],
			['template is invalid (invalid unique property)', false, templates.invalidArguments, () => ({ key: basicData.tsAdmin.apiKey, data: { ...templateToUse, properties: [{ name: generateRandomString(), type: propTypes.LONG_TEXT, unique: true }] } })],
		])('Add template', (desc, success, expectedRes, getTestData) => {
			test(`should ${success ? 'succeed if' : `fail with ${expectedRes.code} if`} ${desc}`, async () => {
				const { key, ts, data } = getTestData();
				const expectedStatus = success ? templates.ok.status : expectedRes.status;
				const res = await agent.post(addTemplateRoute(basicData, key, ts)).send(data).expect(expectedStatus);
				if (success) {
					expect(res.body?._id).not.toBeUndefined();
					const { _id } = res.body;
					const getRes = await agent.get(getTemplateRoute(basicData, key, _id, ts))
						.expect(templates.ok.status);

					expect(getRes.body).toEqual(withRouteId(data, _id));
				} else {
					expect(res.body.code).toEqual(expectedRes.code);
				}
			});
		});
	});
};

const testUpdateTemplate = () => {
	describe('Update template', () => {
		const basicData = generateBasicData();
		const templateToUse = ServiceHelper.generateTemplate();
		const templateThatClashes = ServiceHelper.generateTemplate();
		beforeAll(async () => {
			await setupTestData(basicData);
			await createTemplates(basicData, [templateToUse, templateThatClashes]);
		});

		const updateTemplateRoute = (key, ts = basicData.teamspace.name, id = templateToUse._id) => `/v5/teamspaces/${ts}/settings/tickets/templates/${id}${key ? `?key=${key}` : ''}`;

		describe.each([
			['user does not have a valid session', false, templates.notLoggedIn, () => ({ data: templateToUse })],
			['user is not a teamspace admin', false, templates.notAuthorized, () => ({ key: basicData.normalUser.apiKey, data: templateToUse })],
			['teamspace does not exist', false, templates.teamspaceNotFound, () => ({ key: basicData.tsAdmin.apiKey, ts: generateRandomString(), data: templateToUse })],
			['user is not a member of the teamspace', false, templates.teamspaceNotFound, () => ({ key: basicData.normalUser.apiKey, ts: basicData.noTemplatesTS.name, data: templateToUse })],
			['user is a ts admin and there is a valid template', true, undefined, () => ({ key: basicData.tsAdmin.apiKey, data: { ...templateToUse, name: 'abc' }, expectedBody: { ...templateToUse, name: 'abc' } })],
			['updated template should retain old properties as deprecated', true, undefined, () => ({
				key: basicData.tsAdmin.apiKey,
				data: { ...templateToUse, properties: [{ name: 'newProp', type: propTypes.NUMBER }] },
				expectedBody: {
					...templateToUse,
					properties: [
						{ name: 'newProp', type: propTypes.NUMBER },
						...deprecateProperties(templateToUse.properties),
					],
				},
			})],
			['template is invalid', false, templates.invalidArguments, () => ({ key: basicData.tsAdmin.apiKey, data: {} })],
			['template name is already used by another template', false, templates.invalidArguments, () => ({ key: basicData.tsAdmin.apiKey, data: { ...templateToUse, name: templateThatClashes.name } })],
			['template code is already used by another template', false, templates.invalidArguments, () => ({ key: basicData.tsAdmin.apiKey, data: { ...templateToUse, code: templateThatClashes.code } })],
			['template is invalid (invalid unique property)', false, templates.invalidArguments, () => ({ key: basicData.tsAdmin.apiKey, data: { ...templateToUse, properties: [{ name: generateRandomString(), type: propTypes.LONG_TEXT, unique: true }] } })],
			['template id is invalid', false, templates.templateNotFound, () => ({ key: basicData.tsAdmin.apiKey, id: generateRandomString(), data: templateToUse })],
		])('', (desc, success, expectedRes, getTestData) => {
			test(`should ${success ? 'succeed if' : `fail with ${expectedRes.code}`} if ${desc}`, async () => {
				const { key, ts, id, data, expectedBody } = getTestData();
				const expectedStatus = success ? templates.ok.status : expectedRes.status;
				const res = await agent.put(updateTemplateRoute(key, ts, id)).send(data).expect(expectedStatus);
				if (success) {
					const getRes = await agent.get(getTemplateRoute(basicData, key, templateToUse._id, ts))
						.expect(templates.ok.status);
					expect(getRes.body).toEqual(expectedBody);
				} else {
					expect(res.body.code).toEqual(expectedRes.code);
				}
			});
		});
	});
};

const testGetTemplate = () => {
	describe('Get template', () => {
		const basicData = generateBasicData();
		const templateToUse = ServiceHelper.generateTemplate();
		beforeAll(async () => {
			await setupTestData(basicData);
			await createTemplates(basicData, [templateToUse]);
		});

		describe.each([
			['user does not have a valid session', false, templates.notLoggedIn, () => ({ id: templateToUse._id })],
			['user is not a teamspace admin', false, templates.notAuthorized, () => ({ key: basicData.normalUser.apiKey, id: templateToUse._id })],
			['teamspace does not exist', false, templates.teamspaceNotFound, () => ({ key: basicData.tsAdmin.apiKey, ts: generateRandomString(), id: templateToUse._id })],
			['user is not a member of the teamspace', false, templates.teamspaceNotFound, () => ({ key: basicData.normalUser.apiKey, ts: basicData.noTemplatesTS.name, id: templateToUse._id })],
			['user is a ts admin and there is a valid template', true, undefined, () => ({ key: basicData.tsAdmin.apiKey, id: templateToUse._id, expectedBody: templateToUse })],
			['template id does not exist', false, templates.templateNotFound, () => ({ key: basicData.tsAdmin.apiKey, id: generateRandomString() })],
		])('', (desc, success, expectedRes, getTestData) => {
			test(`should ${success ? 'succeed if' : `fail with ${expectedRes.code}`} if ${desc}`, async () => {
				const { key, ts, id, expectedBody } = getTestData();
				const expectedStatus = success ? templates.ok.status : expectedRes.status;
				const res = await agent.get(getTemplateRoute(basicData, key, id, ts)).expect(expectedStatus);
				if (success) {
					expect(res.body).toEqual(expectedBody);
				} else {
					expect(res.body.code).toEqual(expectedRes.code);
				}
			});
		});
	});
};

const testGetTemplateList = () => {
	describe('Get template List', () => {
		const basicData = generateBasicData();
		const templateList = times(5, () => ServiceHelper.generateTemplate());
		const route = (key, ts = basicData.teamspace.name) => `/v5/teamspaces/${ts}/settings/tickets/templates${key ? `?key=${key}` : ''}`;

		beforeAll(async () => {
			await setupTestData(basicData);
			await createTemplates(basicData, templateList);
		});

		describe.each([
			['user does not have a valid session', false, templates.notLoggedIn, () => ({})],
			['user is not a teamspace admin', false, templates.notAuthorized, () => ({ key: basicData.normalUser.apiKey })],
			['teamspace does not exist', false, templates.teamspaceNotFound, () => ({ key: basicData.tsAdmin.apiKey, ts: generateRandomString() })],
			['user is not a member of the teamspace', false, templates.teamspaceNotFound, () => ({ key: basicData.normalUser.apiKey, ts: basicData.noTemplatesTS.name })],
			['user is a ts admin', true, undefined, () => ({ key: basicData.tsAdmin.apiKey })],
		])('', (desc, success, expectedRes, getTestData) => {
			test(`should ${success ? 'succeed if' : `fail with ${expectedRes.code}`} if ${desc}`, async () => {
				const { key, ts } = getTestData();
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
	describe('Risk Categories', () => {
		const basicData = generateBasicData();
		const route = (key, ts = basicData.teamspace.name) => `/v5/teamspaces/${ts}/settings/tickets/riskCategories${key ? `?key=${key}` : ''}`;

		beforeAll(() => setupTestData(basicData));

		describe.each([
			['user does not have a valid session', false, templates.notLoggedIn, () => ({})],
			['teamspace does not exist', false, templates.teamspaceNotFound, () => ({ key: basicData.tsAdmin.apiKey, ts: generateRandomString() })],
			['user is not a member of the teamspace', false, templates.teamspaceNotFound, () => ({ key: basicData.normalUser.apiKey, ts: basicData.noTemplatesTS.name })],
			['user is a member of teamspace', true, undefined, () => ({ key: basicData.normalUser.apiKey })],
		])('', (desc, success, expectedRes, getTestData) => {
			test(`should ${success ? 'succeed if' : `fail with ${expectedRes.code}`} if ${desc}`, async () => {
				const { key, ts } = getTestData();
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
		const basicData = generateBasicData();
		const route = (key, ts = basicData.teamspace.name, query) => `/v5/teamspaces/${ts}/settings/activities/archive${key ? `?key=${key}${query ? `&from=${query.from}&to=${query.to}` : ''}` : ''}`;

		beforeAll(() => setupTestData(basicData));

		describe.each([
			['user does not have a valid session', false, templates.notLoggedIn, () => ({})],
			['teamspace does not exist', false, templates.teamspaceNotFound, () => ({ key: basicData.tsAdmin.apiKey, ts: generateRandomString() })],
			['user is not a member of the teamspace', false, templates.teamspaceNotFound, () => ({ key: basicData.nobody.apiKey })],
			['user is not a teamspace admin', false, templates.notAuthorized, () => ({ key: basicData.normalUser.apiKey })],
			['user is a teamspace admin', true, undefined, () => ({ key: basicData.tsAdmin.apiKey })],
			['user is a teamspace admin but there are no activities', true, undefined, () => ({ key: basicData.tsAdmin.apiKey, ts: basicData.noTemplatesTS.name })],
			['query is invalid', false, templates.invalidArguments, () => ({ key: basicData.tsAdmin.apiKey, query: { from: Date.now() + 10000, to: Date.now() - 10000 } })],
		])('', (desc, success, expectedRes, getTestData) => {
			test(`should ${success ? 'succeed' : `fail with ${expectedRes.code}`} if ${desc}`, async () => {
				Mailer.sendEmail.mockClear();
				const { key, ts, query } = getTestData();
				const expectedStatus = success ? templates.ok.status : expectedRes.status;

				const res = await agent.get(route(key, ts, query))
					.expect(expectedStatus);

				if (success) {
					expect(res.headers['content-disposition']).toEqual('attachment;filename=audit.zip');
					expect(res.headers['content-type']).toEqual('application/zip');
					expect(Mailer.sendEmail).toHaveBeenCalledTimes(1);
					const { password } = Mailer.sendEmail.mock.calls[0][2];
					expect(Mailer.sendEmail).toHaveBeenCalledWith(emailTemplates.AUDIT_LOG_PASSWORD.name,
						basicData.tsAdmin.basicData.email,
						{ firstName: basicData.tsAdmin.basicData.firstName, password });
				} else {
					expect(res.body.code).toEqual(expectedRes.code);
				}
			});
		});
	});
};

describe(determineTestGroup(__filename), () => {
	beforeAll(async () => {
		server = await ServiceHelper.app();
		agent = await SuperTest(server);
	});
	afterAll(() => Promise.all([
		ServiceHelper.db.reset(),
		ServiceHelper.closeApp(server),
	]));
	testAddTemplate();
	testUpdateTemplate();
	testGetTemplate();
	testGetTemplateList();
	testGetRiskCategories();
	testGetAuditLogArchive();
});
