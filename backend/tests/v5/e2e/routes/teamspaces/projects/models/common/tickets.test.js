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
const { serialiseTicketTemplate } = require('../../../../../../../../src/v5/middleware/dataConverter/outputs/common/tickets.templates');

const { basePropertyLabels, propTypes, presetEnumValues, presetModules } = require(`${src}/schemas/tickets/templates.constants`);
const { updateOne, findOne } = require(`${src}/handler/db`);
const { stringToUUID } = require(`${src}/utils/helper/uuids`);

const { templates } = require(`${src}/utils/responseCodes`);
const { generateFullSchema } = require(`${src}/schemas/tickets/templates`);

let server;
let agent;

const generateBasicData = () => ({
	users: {
		tsAdmin: ServiceHelper.generateUserCredentials(),
		viewer: ServiceHelper.generateUserCredentials(),
		noProjectAccess: ServiceHelper.generateUserCredentials(),
		nobody: ServiceHelper.generateUserCredentials(),
	},
	teamspace: ServiceHelper.generateRandomString(),
	project: ServiceHelper.generateRandomProject(),
	con: ServiceHelper.generateRandomModel(),
	fed: ServiceHelper.generateRandomModel({ isFederation: true }),
});

const setupBasicData = async (users, teamspace, project, models, templatesToAdd) => {
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
		ServiceHelper.db.createTemplates(teamspace, templatesToAdd),
	]);
};

const testGetAllTemplates = () => {
	describe('Get all templates', () => {
		const { users, teamspace, project, con, fed } = generateBasicData();

		const ticketTemplates = times(10, (n) => ServiceHelper.generateTemplate(n % 2 === 0 ? true : undefined));

		beforeAll(async () => {
			await setupBasicData(users, teamspace, project, [con, fed], ticketTemplates);
		});

		const serialiseTemplate = (template, showDeprecated) => {
			const fullTemplate = generateFullSchema(template);
			return serialiseTicketTemplate(fullTemplate, !showDeprecated);
		};

		const generateTestData = (isFed) => {
			const modelWithTemplates = isFed ? fed : con;
			const modelType = isFed ? 'federation' : 'container';
			const modelNotFound = isFed ? templates.federationNotFound : templates.containerNotFound;
			const modelWrongType = isFed ? con : fed;
			const getRoute = ({ key = users.tsAdmin.apiKey, projectId = project.id, modelId = modelWithTemplates._id } = {}) => `/v5/teamspaces/${teamspace}/projects/${projectId}/${modelType}s/${modelId}/tickets/templates${key ? `?key=${key}` : ''}`;

			return [
				['the user does not have a valid session', false, getRoute({ key: null }), templates.notLoggedIn],
				['the user is not a member of the teamspace', false, getRoute({ key: users.nobody.apiKey }), templates.teamspaceNotFound],
				['the project does not exist', false, getRoute({ projectId: ServiceHelper.generateRandomString() }), templates.projectNotFound],
				[`the ${modelType} does not exist`, false, getRoute({ modelId: ServiceHelper.generateRandomString() }), modelNotFound],
				[`the model is not a ${modelType}`, false, getRoute({ modelId: modelWrongType._id }), modelNotFound],
				[`the user does not have access to the ${modelType}`, false, getRoute({ key: users.noProjectAccess.apiKey }), templates.notAuthorized],
				['the user has sufficient privilege and the parameters are correct', true, getRoute(),
					{
						templates: ticketTemplates.flatMap(({ _id, name, deprecated, code }) => (deprecated ? []
							: { _id, name, code })),
					}],
				['the user has sufficient privilege and the parameters are correct (show deprecated)', true, getRoute(),
					{ templates: ticketTemplates.map(
						({ _id, name, code, deprecated }) => ({ _id, name, code, deprecated }),
					) },
					true],
				['the user has sufficient privilege and the parameters are correct (get details)', true, getRoute(),
					{
						templates: ticketTemplates.flatMap((t) => (t.deprecated ? [] : serialiseTemplate(t, false))),
					}, false, true],
				['the user has sufficient privilege and the parameters are correct (get details & show deprecated)', true, getRoute(),
					{
						templates: ticketTemplates.flatMap((t) => serialiseTemplate(t, true)),
					}, true, true],
			];
		};

		const runTest = (desc, success, route, expectedOutput, showDeprecated, getDetails) => {
			test(`should ${success ? 'succeed' : `fail with ${expectedOutput.code}`} if ${desc}`, async () => {
				const expectedStatus = success ? templates.ok.status : expectedOutput.status;
				const res = await agent.get(`${route}${showDeprecated ? '&showDeprecated=true' : ''}${getDetails ? '&getDetails=true' : ''}`).expect(expectedStatus);

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
		const { users, teamspace, project, con, fed } = generateBasicData();
		const template = ServiceHelper.generateTemplate();
		beforeAll(async () => {
			await setupBasicData(users, teamspace, project, [con, fed], [template]);
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

			const wrongTypeModel = isFed ? con : fed;
			const modelWithTemplates = isFed ? fed : con;

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
				['the user has sufficient privilege and the parameters are correct (show deprecated properties)', true, getRoute(), generateFullSchema(template), true],
				['the user has sufficient privilege and the parameters are correct', true, getRoute(), pruneDeprecated(generateFullSchema(template))],

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
		describe.each(generateTestData())('Containers', runTest);
	});
};

const testAddTicket = () => {
	describe('Add ticket', () => {
		const { users, teamspace, project, con, fed } = generateBasicData();
		const template = ServiceHelper.generateTemplate();
		const conTicket = ServiceHelper.generateTicket(template);
		const fedTicket = ServiceHelper.generateTicket(template);
		const uniquePropertyName = template.properties.find((p) => p.unique).name;
		const statusValues = ServiceHelper.generateCustomStatusValues();

		const templateWithAllModulesAndPresetEnums = {
			...ServiceHelper.generateTemplate(),
			config: {
				comments: true,
				issueProperties: true,
				attachments: true,
				defaultView: true,
				defaultImage: true,
				pin: true,
				status: { values: statusValues, default: statusValues[0].name },
			},
			properties: Object.values(presetEnumValues).map((values) => ({
				name: ServiceHelper.generateRandomString(),
				type: propTypes.ONE_OF,
				values,
			})),
			modules: Object.values(presetModules).map((type) => ({ type, properties: [] })),
		};

		beforeAll(async () => {
			await setupBasicData(users, teamspace, project, [con, fed],
				[template, templateWithAllModulesAndPresetEnums]);
			await ServiceHelper.db.createTicket(teamspace, project, con, conTicket);
			await ServiceHelper.db.createTicket(teamspace, project, con, fedTicket);
		});

		const generateTestData = (isFed) => {
			const modelType = isFed ? 'federation' : 'container';
			const wrongTypeModel = isFed ? con : fed;
			const modelWithTemplates = isFed ? fed : con;
			const modelNotFound = isFed ? templates.federationNotFound : templates.containerNotFound;
			const uniquePropValue = isFed
				? fedTicket.properties[uniquePropertyName]
				: conTicket.properties[uniquePropertyName];

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
				['the ticket data includes duplicate value for unique property', false, getRoute(), templates.invalidArguments, { properties: { [uniquePropertyName]: uniquePropValue } }],
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
		const { users, teamspace, project, con, fed } = generateBasicData();
		const template = {
			...ServiceHelper.generateTemplate(),
			config: {
				defaultImage: true,
			},
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
					[basePropertyLabels.DEFAULT_IMAGE]: FS.readFileSync(image, { encoding: 'base64' }),

				},
			};

			await setupBasicData(users, teamspace, project, [con, fed], [template]);

			await Promise.all([fed, con].map(async (model) => {
				const modelType = fed === model ? 'federation' : 'container';
				const addTicketRoute = (modelId) => `/v5/teamspaces/${teamspace}/projects/${project.id}/${modelType}s/${modelId}/tickets?key=${users.tsAdmin.apiKey}`;
				const getTicketRoute = (modelId, ticketId) => `/v5/teamspaces/${teamspace}/projects/${project.id}/${modelType}s/${modelId}/tickets/${ticketId}?key=${users.tsAdmin.apiKey}`;
				const ticket = {};
				const res = await agent.post(addTicketRoute(model._id)).send(ticketData);
				ticket._id = res.body._id;

				const { body } = await agent.get(getTicketRoute(model._id, ticket._id));
				ticket.resourceId = body.properties[template.properties[0].name];
				ticket.defaultImageResourceId = body.properties[basePropertyLabels.DEFAULT_IMAGE];
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
				['given the correct resource id (default image)', { ...baseRouteParams, testDefaultImage: true }, true],
				['the resource id is correct', baseRouteParams, true],
			];
		};

		const getRoute = ({ key, projectId, modelId, ticketId, resourceId, modelType }) => `/v5/teamspaces/${teamspace}/projects/${projectId}/${modelType}s/${modelId}/tickets/${ticketId}/resources/${resourceId}${key ? `?key=${key}` : ''}`;

		const runTest = (desc, { model, testDefaultImage, ...routeParams }, success, expectedOutput) => {
			test(`should ${success ? 'succeed' : `fail with  ${expectedOutput.code}`} if ${desc}`, async () => {
				const expectedStatus = success ? templates.ok.status : expectedOutput.status;
				const route = getRoute({
					modelId: model._id,
					ticketId: model.ticket._id,
					resourceId: testDefaultImage ? model.ticket.defaultImageResourceId : model.ticket.resourceId,
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

		const { users, teamspace, project, con, fed } = generateBasicData();

		beforeAll(async () => {
			await setupBasicData(users, teamspace, project, [con, fed], [templateToUse]);

			await Promise.all([fed, con].map(async (model) => {
				const ticket = ServiceHelper.generateTicket(templateToUse);

				const modelType = fed === model ? 'federation' : 'container';
				const addTicketRoute = (modelId) => `/v5/teamspaces/${teamspace}/projects/${project.id}/${modelType}s/${modelId}/tickets?key=${users.tsAdmin.apiKey}`;

				const res = await agent.post(addTicketRoute(model._id)).send(ticket);
				ticket._id = res.body._id;

				// eslint-disable-next-line no-param-reassign
				model.ticket = ticket;

				const ticketWithDepData = cloneDeep(ticket);
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
				// eslint-disable-next-line no-param-reassign
				model.ticketWithDepFields = ticketWithDepData;
			}));
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
				['ticket id is valid', baseRouteParams, true, undefined, false],
				['ticket id is valid (show deprecated)', baseRouteParams, true, undefined, true],
			];
		};

		const runTest = (desc, { model, ...routeParams }, success, expectedOutput, showDeprecated) => {
			const getRoute = ({ key, projectId, modelId, ticketId, modelType }) => `/v5/teamspaces/${teamspace}/projects/${projectId}/${modelType}s/${modelId}/tickets/${ticketId}${key ? `?key=${key}` : ''}`;
			test(`should ${success ? 'succeed' : `fail with ${expectedOutput.code}`} if ${desc}`, async () => {
				const endpoint = getRoute({ modelId: model._id, ticketId: model?.ticket?._id, ...routeParams });
				const expectedStatus = success ? templates.ok.status : expectedOutput.status;

				const res = await agent.get(`${endpoint}${showDeprecated ? '&showDeprecated=true' : ''}`).expect(expectedStatus);

				if (success) {
					const ticketOut = res.body;
					const expectedTicket = cloneDeep(showDeprecated ? model.ticketWithDepFields : model.ticket);
					expectedTicket.number = ticketOut.number;
					expectedTicket.properties = { ...ticketOut.properties, ...expectedTicket.properties };
					expect(ticketOut).toEqual(expectedTicket);
				} else {
					expect(res.body.code).toEqual(expectedOutput.code);
				}
			});
		};

		describe.each(generateTestData(true))('Federations', runTest);
		describe.each(generateTestData())('Containers', runTest);
	});
};
const testGetTicketList = () => {
	describe('Get ticket list', () => {
		const { users, teamspace, project, con, fed } = generateBasicData();
		const conNoTickets = ServiceHelper.generateRandomModel();
		const fedNoTickets = ServiceHelper.generateRandomModel({ isFederation: true });
		const templatesToUse = times(3, () => ServiceHelper.generateTemplate());

		con.tickets = times(10, (n) => ServiceHelper.generateTicket(templatesToUse[n % templatesToUse.length]));
		fed.tickets = times(10, (n) => ServiceHelper.generateTicket(templatesToUse[n % templatesToUse.length]));

		beforeAll(async () => {
			await setupBasicData(users, teamspace, project, [con, fed, conNoTickets, fedNoTickets],
				templatesToUse);

			await Promise.all([fed, con].map((model) => {
				const modelType = fed === model ? 'federation' : 'container';
				const addTicketRoute = (modelId) => `/v5/teamspaces/${teamspace}/projects/${project.id}/${modelType}s/${modelId}/tickets?key=${users.tsAdmin.apiKey}`;

				model.tickets.forEach(async (ticket) => {
					const res = await agent.post(addTicketRoute(model._id)).send(ticket);
					if (!res.body._id) {
						throw new Error(`Could not add a new ticket: ${res.body.message}`);
					}

					// eslint-disable-next-line no-param-reassign
					ticket._id = res.body._id;
				});

				return model;
			}));
		});

		const generateTestData = (isFed) => {
			const modelType = isFed ? 'federation' : 'container';
			const wrongTypeModel = isFed ? con : fed;
			const model = isFed ? fed : con;
			const modelNoTickets = isFed ? fedNoTickets : conNoTickets;
			const modelNotFound = isFed ? templates.federationNotFound : templates.containerNotFound;
			const moduleName = Object.keys(model.tickets[0].modules)[0];
			const filter = `${Object.keys(model.tickets[0].properties)[0]},${moduleName}.${Object.keys(model.tickets[0].modules[moduleName])[0]}`;
			const baseRouteParams = { key: users.tsAdmin.apiKey, modelType, projectId: project.id, model };

			return [
				['the user does not have a valid session', { ...baseRouteParams, key: null }, false, templates.notLoggedIn],
				['the user is not a member of the teamspace', { ...baseRouteParams, key: users.nobody.apiKey }, false, templates.teamspaceNotFound],
				['the project does not exist', { ...baseRouteParams, projectId: ServiceHelper.generateRandomString() }, false, templates.projectNotFound],
				[`the ${modelType} does not exist`, { ...baseRouteParams, model: ServiceHelper.generateRandomModel() }, false, modelNotFound],
				[`the model provided is not a ${modelType}`, { ...baseRouteParams, model: wrongTypeModel }, false, modelNotFound],
				['the user does not have access to the federation', { ...baseRouteParams, key: users.noProjectAccess.apiKey }, false, templates.notAuthorized],
				['the model has no tickets', { ...baseRouteParams, model: modelNoTickets }, true],
				['the model has tickets', baseRouteParams, true],
				['the model has tickets (filter)', { ...baseRouteParams, filter }, true],
			];
		};

		const sortById = (a, b) => {
			if (a._id > b._id) return 1;
			if (b._id > a._id) return -1;
			return 0;
		};

		const runTest = (desc, { model, filter, ...routeParams }, success, expectedOutput) => {
			test(`should ${success ? 'succeed' : `fail with ${expectedOutput.code}`} if ${desc}`, async () => {
				const getRoute = ({ key, projectId, modelType, modelId }) => `/v5/teamspaces/${teamspace}/projects/${projectId}/${modelType}s/${modelId}/tickets${key ? `?key=${key}` : ''}${filter ? `&filter=${filter}` : ''}`;
				const endpoint = getRoute({ ...routeParams, modelId: model._id });
				const expectedStatus = success ? templates.ok.status : expectedOutput.status;
				const res = await agent.get(endpoint).expect(expectedStatus);
				if (success) {
					const tickets = model.tickets ?? [];
					if (res.body?.tickets?.length) {
						tickets.sort(sortById);
						res.body.tickets.sort(sortById);
						res.body.tickets.forEach((tickOut, ind) => {
							const { _id, title, type } = tickets[ind];
							expect(tickOut).toEqual(expect.objectContaining({ _id, title, type }));
						});

						if (filter) {
							const filterParts = filter.split(',');
							const propName = filterParts[0];
							const moduleName = filterParts[1].split('.')[0];
							const moduleProp = filterParts[1].split('.')[1];

							const ticketContainingProps = res.body.tickets
								.filter((t) => t.properties[propName] && t.modules[moduleName][moduleProp]);

							expect(ticketContainingProps).toBeDefined();
						}
					} else {
						expect(res.body).toEqual({ tickets });
					}
				} else {
					expect(res.body.code).toEqual(expectedOutput.code);
				}
			});
		};

		describe.each(generateTestData(true))('Federations', runTest);
		describe.each(generateTestData())('Containers', runTest);
	});
};

const testUpdateTicket = () => {
	describe('Update ticket', () => {
		const { users, teamspace, project, con, fed } = generateBasicData();
		const requiredPropName = ServiceHelper.generateRandomString();
		const immutableProp = ServiceHelper.generateRandomString();
		const immutablePropWithDefaultValue = ServiceHelper.generateRandomString();
		const imagePropName = ServiceHelper.generateRandomString();
		const requiredImagePropName = ServiceHelper.generateRandomString();
		const uniquePropName = ServiceHelper.generateRandomString();
		const template = {
			...ServiceHelper.generateTemplate(),
			properties: [
				{
					name: requiredPropName,
					type: propTypes.TEXT,
					required: true,
				},
				{
					name: imagePropName,
					type: propTypes.IMAGE,
				},
				{
					name: requiredImagePropName,
					type: propTypes.IMAGE,
					required: true,
				},
				{
					name: immutableProp,
					type: propTypes.TEXT,
					immutable: true,
				},
				{
					name: immutablePropWithDefaultValue,
					type: propTypes.TEXT,
					immutable: true,
					default: ServiceHelper.generateRandomString(),
				},
				{
					name: uniquePropName,
					type: propTypes.TEXT,
					unique: true,
				},
			],
		};

		const deprecatedTemplate = ServiceHelper.generateTemplate();
		con.ticket = ServiceHelper.generateTicket(template);
		con.ticket.properties[requiredImagePropName] = FS.readFileSync(image, { encoding: 'base64' });
		delete con.ticket.properties[immutablePropWithDefaultValue];
		con.depTemTicket = ServiceHelper.generateTicket(deprecatedTemplate);
		const conUniqueProp = con.ticket.properties[uniquePropName];

		fed.ticket = ServiceHelper.generateTicket(template);
		fed.ticket.properties[requiredImagePropName] = FS.readFileSync(image, { encoding: 'base64' });
		delete fed.ticket.properties[immutablePropWithDefaultValue];
		fed.depTemTicket = ServiceHelper.generateTicket(deprecatedTemplate);
		const fedUniqueProp = fed.ticket.properties[uniquePropName];

		beforeAll(async () => {
			await setupBasicData(users, teamspace, project, [con, fed], [template, deprecatedTemplate]);

			await Promise.all([fed, con].map(async (model) => {
				const modelType = fed === model ? 'federation' : 'container';
				const addTicketRoute = (modelId) => `/v5/teamspaces/${teamspace}/projects/${project.id}/${modelType}s/${modelId}/tickets?key=${users.tsAdmin.apiKey}`;

				const { ticket, depTemTicket } = model;
				/* eslint-disable no-param-reassign */
				await Promise.all([ticket, depTemTicket].map(async (ticketToAdd) => {
					const res = await agent.post(addTicketRoute(model._id)).send(ticketToAdd);
					if (!res.body._id) {
						throw new Error(`Could not add a new ticket: ${res.body.message}`);
					}
					ticketToAdd._id = res.body._id;
					ticketToAdd.properties[basePropertyLabels.UPDATED_AT] = new Date();
				}));

				await updateOne(teamspace, 'templates', { _id: stringToUUID(deprecatedTemplate._id) }, { $set: { deprecated: true } });

				model.ticket.properties[immutablePropWithDefaultValue] = template
					.properties.find((p) => p.name === immutablePropWithDefaultValue).default;
			}));
		});

		const checkTicketLogByDate = async (updatedDate) => {
			const ticketLog = await findOne(teamspace, 'tickets.logs', { timestamp: new Date(updatedDate) });
			expect(ticketLog).not.toBeUndefined();
		};

		const generateTestData = (isFed) => {
			const modelType = isFed ? 'federation' : 'container';
			const wrongTypeModel = isFed ? con : fed;
			const model = isFed ? fed : con;
			const modelNotFound = isFed ? templates.federationNotFound : templates.containerNotFound;
			const uniquePropValue = isFed ? fedUniqueProp : conUniqueProp;

			const baseRouteParams = {
				key: users.tsAdmin.apiKey,
				modelType,
				projectId:
				project.id,
				model,
				ticket: model.ticket,
			};

			return [
				['the user does not have a valid session', { ...baseRouteParams, key: null }, false, templates.notLoggedIn],
				['the user is not a member of the teamspace', { ...baseRouteParams, key: users.nobody.apiKey }, false, templates.teamspaceNotFound],
				['the project does not exist', { ...baseRouteParams, projectId: ServiceHelper.generateRandomString() }, false, templates.projectNotFound],
				[`the ${modelType} does not exist`, { ...baseRouteParams, model: ServiceHelper.generateRandomModel({ isFederation: true }) }, false, modelNotFound],
				[`the model provided is not a ${modelType}`, { ...baseRouteParams, model: wrongTypeModel }, false, modelNotFound],
				[`the user does not have access to the ${modelType}`, { ...baseRouteParams, key: users.noProjectAccess.apiKey }, false, templates.notAuthorized],
				['the ticketId provided does not exist', { ...baseRouteParams, ticketId: ServiceHelper.generateRandomString() }, false, templates.ticketNotFound, { title: ServiceHelper.generateRandomString() }],
				['the update data does not conform to the template (trying to unset required prop)', baseRouteParams, false, templates.invalidArguments, { properties: { [requiredPropName]: null } }],
				['the update data does not conform to the template (trying to unset required img prop)', baseRouteParams, false, templates.invalidArguments, { properties: { [requiredImagePropName]: null } }],
				['the update data does not conform to the template (trying to update immutable prop with value)', baseRouteParams, false, templates.invalidArguments, { properties: { [immutableProp]: ServiceHelper.generateRandomString() } }],
				['the update data does not conform to the template (trying to update immutable prop with default value)', baseRouteParams, false, templates.invalidArguments, { properties: { [immutablePropWithDefaultValue]: ServiceHelper.generateRandomString() } }],
				['the update data is an empty object', baseRouteParams, false, templates.invalidArguments, { }],
				['the update data are the same as the existing', baseRouteParams, false, templates.invalidArguments, { properties: { [requiredPropName]: model.ticket.properties[requiredPropName] } }],
				['the update data includes duplicate unique value', baseRouteParams, false, templates.invalidArguments, { properties: { [uniquePropName]: uniquePropValue } }],
				['the update data conforms to the template', baseRouteParams, true, undefined, { title: ServiceHelper.generateRandomString() }],
				['the update data conforms to the template but the user is a viewer', { ...baseRouteParams, key: users.viewer.apiKey }, false, templates.notAuthorized, { title: ServiceHelper.generateRandomString() }],
				['the update data conforms to the template even if the template is deprecated', { ...baseRouteParams, ticket: model.depTemTicket }, true, undefined, { title: ServiceHelper.generateRandomString() }],
				['an image property is updated', baseRouteParams, true, undefined, { title: ServiceHelper.generateRandomString(), properties: { [imagePropName]: FS.readFileSync(image, { encoding: 'base64' }) } }],
			];
		};

		const runTest = (desc, { model, ticket, ...routeParams }, success, expectedOutput, payloadChanges = {}) => {
			const updateTicketRoute = ({ key, projectId, modelId, ticketId, modelType } = {}) => `/v5/teamspaces/${teamspace}/projects/${projectId}/${modelType}s/${modelId}/tickets/${ticketId}${key ? `?key=${key}` : ''}`;
			const getTicketRoute = ({ key, projectId, modelId, ticketId, modelType } = {}) => `/v5/teamspaces/${teamspace}/projects/${projectId}/${modelType}s/${modelId}/tickets/${ticketId}${key ? `?key=${key}` : ''}`;

			test(`should ${success ? 'succeed' : `fail with ${expectedOutput.code}`} if ${desc}`, async () => {
				const expectedStatus = success ? templates.ok.status : expectedOutput.status;
				const finalisedParams = { modelId: model._id, ticketId: ticket?._id, ...routeParams };
				const endpoint = updateTicketRoute(finalisedParams);

				const res = await agent.patch(endpoint).send(payloadChanges).expect(expectedStatus);

				if (success) {
					const updatedTicketRes = await agent.get(getTicketRoute(finalisedParams))
						.expect(templates.ok.status);

					const updatedTicket = updatedTicketRes.body;

					expect(updatedTicket).toHaveProperty('number');
					expect(updatedTicket.properties).toHaveProperty(basePropertyLabels.UPDATED_AT);
					expect(updatedTicket.properties).toHaveProperty(basePropertyLabels.CREATED_AT);
					expect(updatedTicket.properties).toHaveProperty(basePropertyLabels.STATUS);
					expect(updatedTicket.properties).toHaveProperty(basePropertyLabels.OWNER);
					expect(updatedTicket.properties[basePropertyLabels.UPDATED_AT])
						.not.toEqual(ticket.properties[basePropertyLabels.UPDATED_AT]);

					const expectedUpdatedTicket = { ...cloneDeep(ticket), ...payloadChanges };
					expectedUpdatedTicket.number = updatedTicket.number;
					expectedUpdatedTicket.properties = {
						...ticket.properties,
						[basePropertyLabels.UPDATED_AT]: updatedTicket.properties[basePropertyLabels.UPDATED_AT],
						[basePropertyLabels.CREATED_AT]: updatedTicket.properties[basePropertyLabels.CREATED_AT],
						[basePropertyLabels.STATUS]: updatedTicket.properties[basePropertyLabels.STATUS],
						[basePropertyLabels.OWNER]: updatedTicket.properties[basePropertyLabels.OWNER],
						...(payloadChanges?.properties ?? {}),
						[imagePropName]: updatedTicket.properties[imagePropName],
						[requiredImagePropName]: updatedTicket.properties[requiredImagePropName],
					};

					expect(updatedTicket).toEqual(expectedUpdatedTicket);
					await checkTicketLogByDate(updatedTicket.properties[basePropertyLabels.UPDATED_AT]);
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
	testGetAllTemplates();
	testGetTemplateDetails();
	testAddTicket();
	testGetTicketResource();
	testGetTicket();
	testGetTicketList();
	testUpdateTicket();
});
