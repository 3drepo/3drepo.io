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

const { cloneDeep, times } = require('lodash');
const SuperTest = require('supertest');
const FS = require('fs');
const ServiceHelper = require('../../../../../../helper/services');
const { src, image } = require('../../../../../../helper/path');

const { basePropertyLabels, propTypes, presetEnumValues, presetModules } = require(`${src}/schemas/tickets/templates.constants`);
const { updateOne, findOne } = require(`${src}/handler/db`);
const { stringToUUID } = require(`${src}/utils/helper/uuids`);

const { templates } = require(`${src}/utils/responseCodes`);
const { generateFullSchema } = require(`${src}/schemas/tickets/templates`);

let server;
let agent;

const requiredPropName = ServiceHelper.generateRandomString();
const templateWithRequiredProp = {
	...ServiceHelper.generateTemplate(),
	properties: [
		{
			name: requiredPropName,
			type: propTypes.TEXT,
			required: true,
		},
	],
};
const deprecatedTemplate = ServiceHelper.generateTemplate(true);

const generateBasicData = () => ({
	users: {
		tsAdmin: ServiceHelper.generateUserCredentials(),
		viewer: ServiceHelper.generateUserCredentials(),
		noProjectAccess: ServiceHelper.generateUserCredentials(),
		nobody: ServiceHelper.generateUserCredentials(),
	},
	teamspace: ServiceHelper.generateRandomString(),
	project: ServiceHelper.generateRandomProject(),
});

const setupBasicData = async (users, teamspace, project, models) => {
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
};

const testGetAllTemplates = () => {
	describe('Get all templates', () => {
		const { users, teamspace, project } = generateBasicData();
		const conWithTemplates = ServiceHelper.generateRandomModel();
		const fedWithTemplates = ServiceHelper.generateRandomModel({ isFederation: true });

		const ticketTemplates = times(10, (n) => ServiceHelper.generateTemplate(n % 2 === 0 ? true : undefined));

		beforeAll(async () => {
			await setupBasicData(users, teamspace, project, [conWithTemplates, fedWithTemplates]);
			await ServiceHelper.db.createTemplates(teamspace, ticketTemplates);
		});

		const generateTestData = (isFed) => {
			const modelWithTemplates = isFed ? fedWithTemplates : conWithTemplates;
			const modelType = isFed ? 'federation' : 'container';
			const modelNotFound = isFed ? templates.federationNotFound : templates.containerNotFound;
			const modelWrongType = isFed ? conWithTemplates : fedWithTemplates;
			const getRoute = ({ key = users.tsAdmin.apiKey, projectId = project.id, modelId = modelWithTemplates._id } = {}) => `/v5/teamspaces/${teamspace}/projects/${projectId}/${modelType}s/${modelId}/tickets/templates${key ? `?key=${key}` : ''}`;

			return [
				['the user does not have a valid session', false, getRoute({ key: null }), templates.notLoggedIn],
				['the user is not a member of the teamspace', false, getRoute({ key: users.nobody.apiKey }), templates.teamspaceNotFound],
				['the project does not exist', false, getRoute({ projectId: ServiceHelper.generateRandomString() }), templates.projectNotFound],
				[`the ${modelType} does not exist`, false, getRoute({ modelId: ServiceHelper.generateRandomString() }), modelNotFound],
				[`the model is not a ${modelType}`, false, getRoute({ modelId: modelWrongType._id }), modelNotFound],
				[`the user does not have access to the ${modelType}`, false, getRoute({ key: users.noProjectAccess.apiKey }), templates.notAuthorized],
				['should provide the list of templates that are not deprecated', true, getRoute(),
					{
						templates: ticketTemplates.flatMap(({ _id, name, deprecated, code }) => (deprecated ? []
							: { _id, name, code })),
					}],
				['should provide the list of templates including deprecated if the flag is set', true, getRoute(),
					{ templates: ticketTemplates.map(
						({ _id, name, code, deprecated }) => ({ _id, name, code, deprecated }),
					) },
					true],
			];
		};

		const runTest = (desc, success, route, expectedOutput, showDeprecated) => {
			test(`should ${success ? 'succeed' : `fail with ${expectedOutput.code}`} if ${desc}`, async () => {
				const expectedStatus = success ? templates.ok.status : expectedOutput.status;
				const res = await agent.get(`${route}${showDeprecated ? '&showDeprecated=true' : ''}`).expect(expectedStatus);

				if (success) {
					expect(res.body).toEqual(expectedOutput);
				} else {
					expect(res.body.code).toEqual(expectedOutput.code);
				}
			});
		};

		describe.each(generateTestData(true))('Federations', runTest);
		describe.each(generateTestData())('Containers', runTest);
	});
};

const testGetTemplateDetails = () => {
	describe('Get Template Details', () => {
		const { users, teamspace, project } = generateBasicData();
		const conWithTemplates = ServiceHelper.generateRandomModel();
		const fedWithTemplates = ServiceHelper.generateRandomModel({ isFederation: true });
		const template = ServiceHelper.generateTemplate();
		beforeAll(async () => {
			await setupBasicData(users, teamspace, project, [conWithTemplates, fedWithTemplates]);
			await ServiceHelper.db.createTemplates(teamspace, [template]);
		});

		const generateTestData = (isFed) => {
			const pruneDeprecated = (tem) => {
				const res = cloneDeep(tem);
				res.properties = res.properties.filter(({ deprecated }) => !deprecated);
				res.modules = res.modules.filter((mod) => {
					// eslint-disable-next-line no-param-reassign
					mod.properties = mod.properties.filter(({ deprecated }) => !deprecated);
					return !mod.deprecated;
				});

				return res;
			};

			const modelType = isFed ? 'federation' : 'container';
			const wrongTypeModel = isFed ? conWithTemplates : fedWithTemplates;
			const modelWithTemplates = isFed ? fedWithTemplates : conWithTemplates;
			const modelNotFound = isFed ? templates.federationNotFound : templates.containerNotFound;

			const getRoute = ({
				key = users.tsAdmin.apiKey,
				projectId = project.id,
				modelId = modelWithTemplates._id,
				templateId = template._id,
			} = {}) => `/v5/teamspaces/${teamspace}/projects/${projectId}/${modelType}s/${modelId}/tickets/templates/${templateId}${key ? `?key=${key}` : ''}`;

			return [
				['the user does not have a valid session', false, getRoute({ key: null }), templates.notLoggedIn],
				['the user is not a member of the teamspace', false, getRoute({ key: users.nobody.apiKey }), templates.teamspaceNotFound],
				['the project does not exist', false, getRoute({ projectId: ServiceHelper.generateRandomString() }), templates.projectNotFound],
				[`the ${modelType} does not exist`, false, getRoute({ modelId: ServiceHelper.generateRandomString() }), modelNotFound],
				[`the model provided is not a ${modelType}`, false, getRoute({ modelId: wrongTypeModel._id }), modelNotFound],
				[`the user does not have access to the ${modelType}`, false, getRoute({ key: users.noProjectAccess.apiKey }), templates.notAuthorized],
				['the template id is invalid', false, getRoute({ templateId: ServiceHelper.generateRandomString() }), templates.templateNotFound],
				['should return the full template', true, getRoute(), generateFullSchema(template), true],
				['should return the full template without deprecated fields', true, getRoute(), pruneDeprecated(generateFullSchema(template))],
			];
		};

		const runTest = (desc, success, route, expectedOutput, showDeprecated) => {
			test(`should ${success ? 'succeed' : 'fail'} if ${desc}`, async () => {
				const expectedStatus = success ? templates.ok.status : expectedOutput.status;
				const res = await agent.get(`${route}${showDeprecated ? '&showDeprecated=true' : ''}`).expect(expectedStatus);

				if (success) {
					expect(res.body).toEqual(expectedOutput);
				} else {
					expect(res.body.code).toEqual(expectedOutput.code);
				}
			});
		};

		describe.each(generateTestData(true))('Federations', runTest);
		describe.each(generateTestData(true))('Containers', runTest);
	});
};

const testAddTicket = () => {
	describe('Add ticket', () => {
		const { users, teamspace, project } = generateBasicData();
		const conWithTemplates = ServiceHelper.generateRandomModel();
		const fedWithTemplates = ServiceHelper.generateRandomModel({ isFederation: true });
		const template = ServiceHelper.generateTemplate();
		const templateWithAllModulesAndPresetEnums = {
			...ServiceHelper.generateTemplate(),
			config: {
				comments: true,
				issueProperties: true,
				attachments: true,
				defaultView: true,
				defaultImage: true,
				pin: true,
			},
			properties: Object.values(presetEnumValues).map((values) => ({
				name: ServiceHelper.generateRandomString(),
				type: propTypes.ONE_OF,
				values,
			})),
			modules: Object.values(presetModules).map((type) => ({ type, properties: [] })),
		};

		beforeAll(async () => {
			await setupBasicData(users, teamspace, project, [conWithTemplates, fedWithTemplates]);
			await ServiceHelper.db.createTemplates(teamspace, [template, templateWithAllModulesAndPresetEnums]);
		});

		const generateTestData = (isFed) => {
			const modelType = isFed ? 'federation' : 'container';
			const wrongTypeModel = isFed ? conWithTemplates : fedWithTemplates;
			const modelWithTemplates = isFed ? fedWithTemplates : conWithTemplates;
			const modelNotFound = isFed ? templates.federationNotFound : templates.containerNotFound;

			const getRoute = ({ key = users.tsAdmin.apiKey, projectId = project.id, modelId = modelWithTemplates._id } = {}) => `/v5/teamspaces/${teamspace}/projects/${projectId}/${modelType}s/${modelId}/tickets${key ? `?key=${key}` : ''}`;

			return [
				['the user does not have a valid session', false, getRoute({ key: null }), templates.notLoggedIn],
				['the user is not a member of the teamspace', false, getRoute({ key: users.nobody.apiKey }), templates.teamspaceNotFound],
				['the project does not exist', false, getRoute({ projectId: ServiceHelper.generateRandomString() }), templates.projectNotFound],
				[`the ${modelType} does not exist`, false, getRoute({ modelId: ServiceHelper.generateRandomString() }), modelNotFound],
				[`the model provided is a ${modelType}`, false, getRoute({ modelId: wrongTypeModel._id }), modelNotFound],
				['the user does not have access to the federation', false, getRoute({ key: users.noProjectAccess.apiKey }), templates.notAuthorized],
				['the templateId provided does not exist', false, getRoute(), templates.templateNotFound, { type: ServiceHelper.generateRandomString() }],
				['the templateId is not provided', false, getRoute(), templates.invalidArguments, { type: undefined }],
				['the ticket data does not conforms to the template', false, getRoute(), templates.invalidArguments, { properties: { [ServiceHelper.generateRandomString()]: ServiceHelper.generateRandomString() } }],
				['the ticket data conforms to the template', true, getRoute()],
				['the ticket data conforms to the template but the user is a viewer', false, getRoute({ key: users.viewer.apiKey }), templates.notAuthorized],
				['the ticket has a template that contains all preset modules, preset enums and configs', true, getRoute(), undefined, { properties: {}, modules: {}, type: templateWithAllModulesAndPresetEnums._id }],
			];
		};

		const runTest = (desc, success, route, expectedOutput, payloadChanges = {}) => {
			test(`should ${success ? 'succeed' : 'fail'} if ${desc}`, async () => {
				const payload = { ...ServiceHelper.generateTicket(template), ...payloadChanges };

				const expectedStatus = success ? templates.ok.status : expectedOutput.status;

				const res = await agent.post(route).send(payload).expect(expectedStatus);

				if (success) {
					expect(res.body._id).not.toBeUndefined();

					const getEndpoint = route.replace('/tickets', `/tickets/${res.body._id}`);
					await agent.get(getEndpoint).expect(templates.ok.status);
				} else {
					expect(res.body.code).toEqual(expectedOutput.code);
				}
			});
		};

		describe.each(generateTestData(true))('Federations', runTest);
		describe.each(generateTestData())('Containers', runTest);
	});
};
const testGetTicketResource = () => {
	describe('Get ticket resource', () => {
		const { users, teamspace, project } = generateBasicData();
		const con = ServiceHelper.generateRandomModel();
		const fed = ServiceHelper.generateRandomModel({ isFederation: true });
		const template = {
			...ServiceHelper.generateTemplate(),
			properties: [{
				name: ServiceHelper.generateRandomString(),
				type: propTypes.IMAGE,
			}],
		};

		beforeAll(async () => {
			const ticketData = {
				title: ServiceHelper.generateRandomString(),
				type: template._id,
				properties: {
					[template.properties[0].name]: FS.readFileSync(image, { encoding: 'base64' }),
				},
			};

			await setupBasicData(users, teamspace, project, [con, fed]);
			await ServiceHelper.db.createTemplates(teamspace, [template]);

			await Promise.all([fed, con].map(async (model) => {
				const modelType = fed === model ? 'federation' : 'container';
				const addTicketRoute = (modelId) => `/v5/teamspaces/${teamspace}/projects/${project.id}/${modelType}s/${modelId}/tickets?key=${users.tsAdmin.apiKey}`;
				const getTicketRoute = (modelId, ticketId) => `/v5/teamspaces/${teamspace}/projects/${project.id}/${modelType}s/${modelId}/tickets/${ticketId}?key=${users.tsAdmin.apiKey}`;
				const ticket = {};
				const res = await agent.post(addTicketRoute(model._id)).send(ticketData);
				ticket._id = res.body._id;

				const { body } = await agent.get(getTicketRoute(model._id, ticket._id));
				ticket.resourceId = body.properties[template.properties[0].name];
				// eslint-disable-next-line no-param-reassign
				model.ticket = ticket;
			}));
		});

		const generateTestData = (isFed) => {
			const modelType = isFed ? 'federation' : 'container';
			const wrongTypeModel = isFed ? con : fed;
			const model = isFed ? fed : con;
			const modelNotFound = isFed ? templates.federationNotFound : templates.containerNotFound;

			const baseRouteParams = { modelType,
				key: users.tsAdmin.apiKey,
				projectId: project.id,
				model };

			return [
				['the user does not have a valid session', { ...baseRouteParams, key: null }, false, templates.notLoggedIn],
				['the user is not a member of the teamspace', { ...baseRouteParams, key: users.nobody.apiKey }, false, templates.teamspaceNotFound],
				['the project does not exist', { ...baseRouteParams, projectId: ServiceHelper.generateRandomString() }, false, templates.projectNotFound],
				[`the ${modelType} does not exist`, { ...baseRouteParams, modelId: ServiceHelper.generateRandomString() }, false, modelNotFound],
				[`the model is not a ${modelType}`, { ...baseRouteParams, modelId: wrongTypeModel._id }, false, modelNotFound],
				[`the user does not have access to the ${modelType}`, { ...baseRouteParams, key: users.noProjectAccess.apiKey }, false, templates.notAuthorized],
				['the ticket does not exist', { ...baseRouteParams, ticketId: ServiceHelper.generateRandomString() }, false, templates.fileNotFound],
				['the resource does not exist', { ...baseRouteParams, resourceId: ServiceHelper.generateRandomString() }, false, templates.fileNotFound],
				['given the correct resource id', { ...baseRouteParams }, true],
			];
		};

		const getRoute = ({ key, projectId, modelId, ticketId, resourceId, modelType }) => `/v5/teamspaces/${teamspace}/projects/${projectId}/${modelType}s/${modelId}/tickets/${ticketId}/resources/${resourceId}${key ? `?key=${key}` : ''}`;

		const runTest = (desc, { model, ...routeParams }, success, expectedOutput) => {
			test(`should ${success ? 'succeed' : `fail with  ${expectedOutput.code}`} if ${desc}`, async () => {
				const expectedStatus = success ? templates.ok.status : expectedOutput.status;
				const route = getRoute({
					modelId: model._id,
					ticketId: model.ticket._id,
					resourceId: model.ticket.resourceId,
					...routeParams,
				});
				const res = await agent.get(route).expect(expectedStatus);
				if (success) {
					expect(res.header).toEqual(expect.objectContaining({ 'content-type': 'image/png' }));
					expect(res.body).not.toBeUndefined();
					expect(Buffer.isBuffer(res.body)).toBeTruthy();
				} else {
					expect(res.body.code).toEqual(expectedOutput.code);
				}
			});
		};

		describe.each(generateTestData(true))('Federations', runTest);
		describe.each(generateTestData())('Containers', runTest);
	});
};

/*
const testGetTicket = () => {
	describe('Get ticket', () => {
		const deprecatedPropName = ServiceHelper.generateRandomString();
		const deprecatedModule = ServiceHelper.generateRandomString();
		const moduleName = ServiceHelper.generateRandomString();

		const templateToUse = {
			...ServiceHelper.generateTemplate(),
			properties: [
				{
					name: ServiceHelper.generateRandomString(),
					type: propTypes.TEXT,
				},
				{
					name: deprecatedPropName,
					type: propTypes.TEXT,
					deprecated: true,
				},
			],
			modules: [
				{
					name: moduleName,
					properties: [
						{
							name: ServiceHelper.generateRandomString(),
							type: propTypes.TEXT,
						},
						{
							name: deprecatedPropName,
							type: propTypes.TEXT,
							deprecated: true,
						},
					],
				},
				{
					name: deprecatedModule,
					properties: [
						{
							name: deprecatedPropName,
							type: propTypes.TEXT,
							deprecated: true,
						},
					],
					deprecated: true,
				},
			],
		};
		let ticket; let ticketWithDepData;
		beforeAll(async () => {
			await ServiceHelper.db.createTemplates(teamspace, [templateToUse]);
			ticket = ServiceHelper.generateTicket(templateToUse);
			const endpoint = addTicketRoute(users.tsAdmin.apiKey);

			const res = await agent.post(endpoint).send(ticket);
			ticket._id = res.body._id;

			ticketWithDepData = cloneDeep(ticket);

			ticketWithDepData.properties[deprecatedPropName] = ServiceHelper.generateRandomString();
			ticketWithDepData.modules[moduleName][deprecatedPropName] = ServiceHelper.generateRandomString();
			ticketWithDepData.modules[deprecatedModule] = {
				[deprecatedPropName]: ServiceHelper.generateRandomString(),
			};

			const depFieldsToAdd = {
				[`properties.${deprecatedPropName}`]: ticketWithDepData.properties[deprecatedPropName],
				[`modules.${moduleName}.${deprecatedPropName}`]: ticketWithDepData.modules[moduleName][deprecatedPropName],
				[`modules.${deprecatedModule}`]: ticketWithDepData.modules[deprecatedModule],
			};

			await updateOne(teamspace, 'tickets', { _id: stringToUUID(ticket._id) }, { $set: depFieldsToAdd });
		});

		describe.each([
			['the user does not have a valid session', templates.notLoggedIn],
			['the user is not a member of the teamspace', templates.teamspaceNotFound, undefined, undefined, undefined, users.nobody.apiKey],
			['the project does not exist', templates.projectNotFound, ServiceHelper.generateRandomString(), undefined, undefined, users.tsAdmin.apiKey],
			['the federation does not exist', templates.federationNotFound, project.id, ServiceHelper.generateRandomString(), undefined, users.tsAdmin.apiKey],
			['the federation provided is a container', templates.federationNotFound, project.id, con._id, undefined, users.tsAdmin.apiKey],
			['the user does not have access to the federation', templates.notAuthorized, undefined, undefined, undefined, users.noProjectAccess.apiKey],
			['the ticket does not exist', templates.ticketNotFound, undefined, undefined, ServiceHelper.generateRandomString(), users.tsAdmin.apiKey],
		])('Error checks', (desc, expectedOutput, projectId, modelId, ticketId, key) => {
			test(`should fail with ${expectedOutput.code} if ${desc}`, async () => {
				const endpoint = getTicketRoute(key, projectId, modelId, ticketId ?? ticket._id);
				const res = await agent.get(endpoint).expect(expectedOutput.status);
				expect(res.body.code).toEqual(expectedOutput.code);
			});
		});

		test('Should get ticket with valid id', async () => {
			const endpoint = getTicketRoute(users.tsAdmin.apiKey, undefined, undefined, ticket._id);
			const { body: ticketOut } = await agent.get(endpoint).expect(templates.ok.status);
			const expectedTicket = cloneDeep(ticket);
			expectedTicket.number = ticketOut.number;
			expectedTicket.properties = { ...ticketOut.properties, ...expectedTicket.properties };
			expect(ticketOut).toEqual(expectedTicket);
		});

		test('Should get ticket along with deprecated fields if showDeprecated is set to true', async () => {
			const endpoint = getTicketRoute(users.tsAdmin.apiKey, undefined, undefined, ticket._id);
			const { body: ticketOut } = await agent.get(`${endpoint}&showDeprecated=true`).expect(templates.ok.status);
			const expectedTicket = cloneDeep(ticketWithDepData);
			expectedTicket.number = ticketOut.number;
			expectedTicket.properties = { ...ticketOut.properties, ...expectedTicket.properties };
			expect(ticketOut).toEqual(expectedTicket);
		});
	});
};

const testGetTicketList = () => {
	const route = (key, projectId = project.id, modelId = modelWithTemplates._id) => `/v5/teamspaces/${teamspace}/projects/${projectId}/federations/${modelId}/tickets${key ? `?key=${key}` : ''}`;
	describe('Get ticket list', () => {
		const tickets = [];
		const sortById = (a, b) => {
			if (a._id > b._id) return 1;
			if (b._id > a._id) return -1;
			return 0;
		};
		beforeAll(async () => {
			const tickTems = [];
			times(3, () => {
				tickTems.push(ServiceHelper.generateTemplate());
			});
			await ServiceHelper.db.createTemplates(teamspace, tickTems);

			const proms = [];
			const endpoint = addTicketRoute(users.tsAdmin.apiKey, undefined, modelForTicketList._id);

			times(10, (i) => {
				const ticket = ServiceHelper.generateTicket(tickTems[i % tickTems.length]);
				const prom = agent.post(endpoint).send(ticket).then(({ body }) => {
					ticket._id = body._id;
					tickets.push(ticket);
				});

				proms.push(prom);
			});

			await Promise.all(proms);
			tickets.sort(sortById);
		});

		describe.each([
			['the user does not have a valid session', templates.notLoggedIn],
			['the user is not a member of the teamspace', templates.teamspaceNotFound, undefined, undefined, users.nobody.apiKey],
			['the project does not exist', templates.projectNotFound, ServiceHelper.generateRandomString(), undefined, users.tsAdmin.apiKey],
			['the federation does not exist', templates.federationNotFound, project.id, ServiceHelper.generateRandomString(), users.tsAdmin.apiKey],
			['the federation provided is a container', templates.federationNotFound, project.id, con._id, users.tsAdmin.apiKey],
			['the user does not have access to the federation', templates.notAuthorized, undefined, undefined, users.noProjectAccess.apiKey],
		])('Error checks', (desc, expectedOutput, projectId, modelId, key) => {
			test(`should fail with ${expectedOutput.code} if ${desc}`, async () => {
				const endpoint = route(key, projectId, modelId);
				const res = await agent.get(endpoint).expect(expectedOutput.status);
				expect(res.body.code).toEqual(expectedOutput.code);
			});
		});

		test('Should return empty list if model has no tickets', async () => {
			const endpoint = route(users.tsAdmin.apiKey, undefined, modelWithNoTickets._id);
			const res = await agent.get(endpoint).expect(templates.ok.status);
			expect(res.body).toEqual({ tickets: [] });
		});

		test('Should return all tickets within the model', async () => {
			const endpoint = route(users.tsAdmin.apiKey, undefined, modelForTicketList._id);
			const res = await agent.get(endpoint).expect(templates.ok.status);
			const ticketsOut = res.body.tickets;
			ticketsOut.sort(sortById);
			ticketsOut.forEach((tickOut, ind) => {
				const { _id, title, type } = tickets[ind];
				expect(tickOut).toEqual(expect.objectContaining({ _id, title, type }));
			});
		});
	});
};

const updateTicketRoute = (key, projectId = project.id, modelId = modelWithTemplates._id, ticketId) => `/v5/teamspaces/${teamspace}/projects/${projectId}/federations/${modelId}/tickets/${ticketId}${key ? `?key=${key}` : ''}`;

const testUpdateTicket = () => {
	const ticket = ServiceHelper.generateTicket(templateWithRequiredProp);
	const ticketWithDeprecatedTemplate = ServiceHelper.generateTicket(deprecatedTemplate);

	const checkTicketLogByDate = async (updatedDate) => {
		const ticketLog = await findOne(teamspace, 'tickets.logs', { timestamp: new Date(updatedDate) });
		expect(ticketLog).not.toBeUndefined();
	};

	beforeAll(async () => {
		await updateOne(teamspace, 'templates', { _id: stringToUUID(deprecatedTemplate._id) }, { $set: { deprecated: false } });
		const endpoint = addTicketRoute(users.tsAdmin.apiKey);

		const res = await agent.post(endpoint).send(ticket);
		const res2 = await agent.post(endpoint).send(ticketWithDeprecatedTemplate);
		ticket._id = res.body._id;
		ticketWithDeprecatedTemplate._id = res2.body._id;
		ticket.properties[basePropertyLabels.UPDATED_AT] = new Date();
		ticketWithDeprecatedTemplate.properties[basePropertyLabels.UPDATED_AT] = new Date();
		await updateOne(teamspace, 'templates', { _id: stringToUUID(deprecatedTemplate._id) }, { $set: { deprecated: true } });
	});

	describe.each([
		['the user does not have a valid session', false, templates.notLoggedIn],
		['the user is not a member of the teamspace', false, templates.teamspaceNotFound, undefined, undefined, undefined, users.nobody.apiKey],
		['the project does not exist', false, templates.projectNotFound, ServiceHelper.generateRandomString(), undefined, undefined, users.tsAdmin.apiKey],
		['the federation does not exist', false, templates.federationNotFound, project.id, ServiceHelper.generateRandomString(), undefined, users.tsAdmin.apiKey],
		['the federation provided is a container', false, templates.federationNotFound, project.id, con._id, undefined, users.tsAdmin.apiKey],
		['the user does not have access to the federation', false, templates.notAuthorized, undefined, undefined, undefined, users.noProjectAccess.apiKey],
		['the ticketId provided does not exist', false, templates.ticketNotFound, undefined, undefined, { _id: ServiceHelper.generateRandomString() }, users.tsAdmin.apiKey, { title: ServiceHelper.generateRandomString() }],
		['the update data does not conforms to the template', false, templates.invalidArguments, undefined, undefined, undefined, users.tsAdmin.apiKey, { properties: { [requiredPropName]: null } }],
		['the update data is an empty object', false, templates.invalidArguments, undefined, undefined, undefined, users.tsAdmin.apiKey, { }],
		['the update data are the same as the existing', false, templates.invalidArguments, undefined, undefined, undefined, users.tsAdmin.apiKey, { properties: ticket.properties }],
		['the update data conforms to the template', true, undefined, undefined, undefined, undefined, users.tsAdmin.apiKey, { title: ServiceHelper.generateRandomString() }],
		['the update data conforms to the template but the user is a viewer', false, templates.notAuthorized, undefined, undefined, undefined, users.viewer.apiKey, { title: ServiceHelper.generateRandomString() }],
	])('Update Ticket', (desc, success, expectedOutput, projectId, modelId, ticketId, key, payloadChanges = {}) => {
		test(`should ${success ? 'succeed' : 'fail'} if ${desc}`, async () => {
			const expectedStatus = success ? templates.ok.status : expectedOutput.status;
			const endpoint = updateTicketRoute(key, projectId, modelId, ticketId ?? ticket._id);

			const res = await agent.patch(endpoint).send(payloadChanges).expect(expectedStatus);

			if (success) {
				const getEndpoint = getTicketRoute(users.tsAdmin.apiKey, project.id, modelWithTemplates._id,
					ticketId ?? ticket._id);
				const updatedTicketRes = await agent.get(getEndpoint).expect(templates.ok.status);
				const updatedTicket = updatedTicketRes.body;
				expect(updatedTicket).toHaveProperty('number');
				expect(updatedTicket.properties).toHaveProperty(basePropertyLabels.UPDATED_AT);
				expect(updatedTicket.properties[basePropertyLabels.UPDATED_AT])
					.not.toEqual(ticket.properties[basePropertyLabels.UPDATED_AT]);
				expect(updatedTicket.properties).toHaveProperty(basePropertyLabels.CREATED_AT);
				expect(updatedTicket.properties).toHaveProperty(basePropertyLabels.OWNER);
				delete updatedTicket.number;
				const updatedDate = updatedTicket.properties[basePropertyLabels.UPDATED_AT];
				delete updatedTicket.properties[basePropertyLabels.UPDATED_AT];
				delete ticket.properties[basePropertyLabels.UPDATED_AT];
				delete updatedTicket.properties[basePropertyLabels.CREATED_AT];
				delete updatedTicket.properties.Owner;
				expect(updatedTicket).toEqual({ ...ticket, ...payloadChanges });
				await checkTicketLogByDate(updatedDate);
			} else {
				expect(res.body.code).toEqual(expectedOutput.code);
			}
		});
	});

	test('Should succeed if the template is deprecated', async () => {
		const payloadChanges = { title: ServiceHelper.generateRandomString() };
		const endpoint = updateTicketRoute(users.tsAdmin.apiKey, undefined, undefined,
			ticketWithDeprecatedTemplate._id);
		await agent.patch(endpoint).send(payloadChanges).expect(templates.ok.status);

		const getEndpoint = getTicketRoute(users.tsAdmin.apiKey, undefined, undefined,
			ticketWithDeprecatedTemplate._id);
		const updatedTicketRes = await agent.get(getEndpoint).expect(templates.ok.status);

		const updatedTicket = updatedTicketRes.body;
		expect(updatedTicket).toHaveProperty('number');
		expect(updatedTicket.properties).toHaveProperty(basePropertyLabels.UPDATED_AT);
		expect(updatedTicket.properties[basePropertyLabels.UPDATED_AT])
			.not.toEqual(ticketWithDeprecatedTemplate.properties[basePropertyLabels.UPDATED_AT]);
		expect(updatedTicket.properties).toHaveProperty(basePropertyLabels.CREATED_AT);
		expect(updatedTicket.properties).toHaveProperty(basePropertyLabels.OWNER);
		delete updatedTicket.number;
		delete updatedTicket.properties[basePropertyLabels.UPDATED_AT];
		const updatedDate = updatedTicket.properties[basePropertyLabels.UPDATED_AT];
		delete ticketWithDeprecatedTemplate.properties[basePropertyLabels.UPDATED_AT];
		delete updatedTicket.properties[basePropertyLabels.CREATED_AT];
		delete updatedTicket.properties.Owner;
		expect(updatedTicket).toEqual({ ...ticketWithDeprecatedTemplate, ...payloadChanges });
		await checkTicketLogByDate(updatedDate);
	});
};
*/
describe(ServiceHelper.determineTestGroup(__filename), () => {
	beforeAll(async () => {
		server = await ServiceHelper.app();
		agent = await SuperTest(server);
	});
	afterAll(() => ServiceHelper.closeApp(server));

	testGetAllTemplates();
	testGetTemplateDetails();
	testAddTicket();
	testGetTicketResource();
	/* testGetTicket();
	testGetTicketList();
	testUpdateTicket();
	*/
});
