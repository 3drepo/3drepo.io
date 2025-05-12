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
const { queryOperators, specialQueryFields } = require('../../../../../../../../src/v5/schemas/tickets/tickets.filters');

const { modelTypes } = require(`${src}/models/modelSettings.constants`);

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
		projectAdmin: ServiceHelper.generateUserCredentials(),
	},
	teamspace: ServiceHelper.generateRandomString(),
	project: ServiceHelper.generateRandomProject(),
	con: ServiceHelper.generateRandomModel(),
	fed: ServiceHelper.generateRandomModel({ modelType: modelTypes.FEDERATION }),
});

const setupBasicData = async (users, teamspace, project, models, templatesToAdd) => {
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
					ticketTemplates.flatMap(({ _id, name, deprecated, code }) => (deprecated
						? [] : { _id, name, code })),
				],
				['the user has sufficient privilege and the parameters are correct (show deprecated)', true, getRoute(),
					ticketTemplates.map(
						({ _id, name, code, deprecated }) => ({ _id, name, code, deprecated }),
					),
					true],
				['the user has sufficient privilege and the parameters are correct (get details)', true, getRoute(),
					ticketTemplates.flatMap((t) => (t.deprecated ? [] : serialiseTemplate(t, false))),
					false, true],
				['the user has sufficient privilege and the parameters are correct (get details & show deprecated)', true, getRoute(),
					ticketTemplates.flatMap((t) => serialiseTemplate(t, true)),
					true, true],
			];
		};

		const runTest = (desc, success, route, expectedOutput, showDeprecated, getDetails) => {
			test(`should ${success ? 'succeed' : `fail with ${expectedOutput.code}`} if ${desc}`, async () => {
				const expectedStatus = success ? templates.ok.status : expectedOutput.status;
				const res = await agent.get(`${route}${showDeprecated ? '&showDeprecated=true' : ''}${getDetails ? '&getDetails=true' : ''}`).expect(expectedStatus);

				if (success) {
					expect(res.body.templates).toEqual(expect.arrayContaining(expectedOutput));
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
		const oneOfJobsAndUsersPropName = ServiceHelper.generateRandomString();
		const manyOfJobsAndUsersPropName = ServiceHelper.generateRandomString();
		const uniquePropertyName = ServiceHelper.generateRandomString();
		const template = ServiceHelper.generateTemplate();
		template.properties.push({ name: uniquePropertyName, type: propTypes.TEXT, unique: true });

		const conTicket = ServiceHelper.generateTicket(template);
		const fedTicket = ServiceHelper.generateTicket(template);

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
			properties: [
				{
					name: manyOfJobsAndUsersPropName,
					type: propTypes.MANY_OF,
					values: presetEnumValues.JOBS_AND_USERS,
				},
				{
					name: oneOfJobsAndUsersPropName,
					type: propTypes.ONE_OF,
					values: presetEnumValues.JOBS_AND_USERS,
				},
				...Object.values(presetEnumValues).map((values) => ({
					name: ServiceHelper.generateRandomString(),
					type: propTypes.ONE_OF,
					values,
				})),
			],
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
				['the ticket has a template that contains all preset modules, preset enums and configs', true, getRoute(), undefined, { ...ServiceHelper.generateTicket(templateWithAllModulesAndPresetEnums) }],
				['oneOf jobsAndUsers property is populated with a user that has inadequate permissions', false, getRoute(), templates.invalidArguments, { ...ServiceHelper.generateTicket(templateWithAllModulesAndPresetEnums), properties: { [oneOfJobsAndUsersPropName]: users.noProjectAccess.user } }],
				['oneOf jobsAndUsers property is populated', true, getRoute(), undefined, { ...ServiceHelper.generateTicket(templateWithAllModulesAndPresetEnums), properties: { [oneOfJobsAndUsersPropName]: users.tsAdmin.user } }],
				['manyOf jobsAndUsers property is populated with a user that has inadequate permissions', false, getRoute(), templates.invalidArguments, { ...ServiceHelper.generateTicket(templateWithAllModulesAndPresetEnums), properties: { [manyOfJobsAndUsersPropName]: [users.noProjectAccess.user, users.tsAdmin.user] } }],
				['manyOf jobsAndUsers property is populated', true, getRoute(), undefined, { ...ServiceHelper.generateTicket(templateWithAllModulesAndPresetEnums), properties: { [manyOfJobsAndUsersPropName]: [users.tsAdmin.user, users.projectAdmin.user] } }],
				['assignees property is populated with a user that has inadequate permissions', false, getRoute(), templates.invalidArguments, { ...ServiceHelper.generateTicket(templateWithAllModulesAndPresetEnums), properties: { [basePropertyLabels.ASSIGNEES]: [users.viewer.user, users.tsAdmin.user] } }],
				['assignees property is populated', true, getRoute(), undefined, { ...ServiceHelper.generateTicket(templateWithAllModulesAndPresetEnums), properties: { [basePropertyLabels.ASSIGNEES]: [users.tsAdmin.user, users.projectAdmin.user] } }],
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

const testImportTickets = () => {
	describe('Import tickets', () => {
		const { users, teamspace, project, con, fed } = generateBasicData();
		const uniquePropertyName = ServiceHelper.generateRandomString();
		const template = ServiceHelper.generateTemplate(false, false, { comments: true });
		const templateWithoutComments = ServiceHelper.generateTemplate();
		template.properties.push({ name: uniquePropertyName, type: propTypes.TEXT, unique: true });
		template.modules.push({
			name: uniquePropertyName,
			properties: [{ name: uniquePropertyName, type: propTypes.TEXT, unique: true }],
		});
		const duplicateValue = ServiceHelper.generateRandomString();

		beforeAll(async () => {
			await setupBasicData(users, teamspace, project, [con, fed],
				[template, templateWithoutComments]);
		});

		const generateTestData = (isFed) => {
			const modelType = isFed ? 'federation' : 'container';
			const wrongTypeModel = isFed ? con : fed;
			const modelWithTemplates = isFed ? fed : con;
			const modelNotFound = isFed ? templates.federationNotFound : templates.containerNotFound;
			const duplicateUniquePropTicket = ServiceHelper.generateTicket(template);
			duplicateUniquePropTicket.properties[uniquePropertyName] = duplicateValue;

			const duplicateUniqueModulePropTicket = ServiceHelper.generateTicket(template);
			duplicateUniqueModulePropTicket.modules[uniquePropertyName][uniquePropertyName] = duplicateValue;

			const getRoute = ({ key = users.tsAdmin.apiKey, projectId = project.id, modelId = modelWithTemplates._id, templateId = template._id } = {}) => `/v5/teamspaces/${teamspace}/projects/${projectId}/${modelType}s/${modelId}/tickets/import${ServiceHelper.createQueryString({ key, template: templateId })}`;

			return [
				['the user does not have a valid session', false, getRoute({ key: null }), templates.notLoggedIn],
				['the user is not a member of the teamspace', false, getRoute({ key: users.nobody.apiKey }), templates.teamspaceNotFound],
				['the project does not exist', false, getRoute({ projectId: ServiceHelper.generateRandomString() }), templates.projectNotFound],
				[`the ${modelType} does not exist`, false, getRoute({ modelId: ServiceHelper.generateRandomString() }), modelNotFound],
				[`the model provided is a ${modelType}`, false, getRoute({ modelId: wrongTypeModel._id }), modelNotFound],
				['the user does not have access to the federation', false, getRoute({ key: users.noProjectAccess.apiKey }), templates.notAuthorized],
				['the templateId provided does not exist', false, getRoute({ templateId: ServiceHelper.generateUUIDString() }), templates.templateNotFound],
				['the templateId provided is not a UUID string', false, getRoute({ templateId: ServiceHelper.generateRandomString() }), templates.templateNotFound],
				['the templateId is not provided', false, getRoute({ templateId: null }), templates.invalidArguments],
				['the ticket data does not conforms to the template', false, getRoute(), templates.invalidArguments, { properties: { [ServiceHelper.generateRandomString()]: ServiceHelper.generateRandomString() } }],
				['the ticket data conforms to the template', true, getRoute()],
				['the ticket data conforms to the template but the user is a viewer', false, getRoute({ key: users.viewer.apiKey }), templates.notAuthorized],
				['the ticket data contains comments', true, getRoute(), undefined, { comments: times(10, ServiceHelper.generateImportedComment) }],
				['the ticket data contains comments when comments are disabled', false, getRoute({ templateId: templateWithoutComments._id }), templates.invalidArguments, {
					...ServiceHelper.generateTicket(templateWithoutComments),
					comments: times(10, ServiceHelper.generateImportedComment) }],
				['the ticket data contains invalid comments', false, getRoute(), templates.invalidArguments, { comments: times(10, ServiceHelper.generateComment) }],
				['the ticket data contains duplicate unique properties', false, getRoute(), templates.invalidArguments, { ...duplicateUniquePropTicket }],
				['the ticket data contains duplicate unique module properties', false, getRoute(), templates.invalidArguments, { ...duplicateUniqueModulePropTicket }],
			];
		};

		const runTest = (desc, success, route, expectedOutput, payloadChanges = {}) => {
			test(`should ${success ? 'succeed' : 'fail'} if ${desc}`, async () => {
				const payload = {
					tickets: times(10, () => ({ ...ServiceHelper.generateTicket(template), ...payloadChanges })),
				};

				const expectedStatus = success ? templates.ok.status : expectedOutput.status;

				const res = await agent.post(route).send(payload).expect(expectedStatus);

				if (success) {
					const { tickets } = res.body;
					expect(tickets).not.toBeUndefined();

					await Promise.all(tickets.map(async (id, i) => {
						const getEndpoint = route.replace('/tickets/import', `/tickets/${id}`);
						await agent.get(getEndpoint).expect(templates.ok.status);
						if (payload.tickets[i].comments?.length) {
							const getCommentsEndpoint = route.replace('/tickets/import', `/tickets/${id}/comments`);
							const { body: commentRes } = await agent.get(getCommentsEndpoint)
								.expect(templates.ok.status);
							expect(commentRes.comments?.length).toEqual(payload.tickets[i].comments.length);
						}
					}));
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
		const fedNoTickets = ServiceHelper.generateRandomModel({ modelType: modelTypes.FEDERATION });
		const commonTextProp = { name: ServiceHelper.generateRandomString(), type: propTypes.TEXT };
		const textProp = { name: ServiceHelper.generateRandomString(), type: propTypes.TEXT };
		const longTextProp = { name: ServiceHelper.generateRandomString(), type: propTypes.LONG_TEXT };
		const numberProp = { name: ServiceHelper.generateRandomString(), type: propTypes.NUMBER };
		const boolProp = { name: ServiceHelper.generateRandomString(), type: propTypes.BOOLEAN };
		const dateProp = { name: ServiceHelper.generateRandomString(), type: propTypes.DATE };
		const oneOfProp = { name: ServiceHelper.generateRandomString(),
			type: propTypes.ONE_OF,
			values: times(5, () => ServiceHelper.generateRandomString()) };
		const manyOfProp = { name: ServiceHelper.generateRandomString(),
			type: propTypes.MANY_OF,
			values: times(5, () => ServiceHelper.generateRandomString()) };

		const templatesToUse = times(3, () => {
			const template = ServiceHelper.generateTemplate();
			template.properties.push(commonTextProp);
			return template;
		});

		const templateWithAllProps = templatesToUse[0];
		templateWithAllProps.properties.push(textProp, longTextProp, numberProp, boolProp, dateProp,
			oneOfProp, manyOfProp);

		con.tickets = times(13, (n) => ServiceHelper.generateTicket(templatesToUse[n % templatesToUse.length]));
		fed.tickets = times(13, (n) => ServiceHelper.generateTicket(templatesToUse[n % templatesToUse.length]));

		delete con.tickets[12].properties[textProp.name];
		delete con.tickets[12].properties[longTextProp.name];
		delete con.tickets[12].properties[numberProp.name];
		delete con.tickets[12].properties[dateProp.name];
		delete con.tickets[12].properties[oneOfProp.name];
		delete con.tickets[12].properties[manyOfProp.name];

		delete fed.tickets[12].properties[textProp.name];
		delete fed.tickets[12].properties[longTextProp.name];
		delete fed.tickets[12].properties[numberProp.name];
		delete fed.tickets[12].properties[dateProp.name];
		delete fed.tickets[12].properties[oneOfProp.name];
		delete fed.tickets[12].properties[manyOfProp.name];

		beforeAll(async () => {
			await setupBasicData(users, teamspace, project, [con, fed, conNoTickets, fedNoTickets],
				templatesToUse);

			await Promise.all([fed, con].map(async (model) => {
				const modelType = fed === model ? 'federation' : 'container';
				const addTicketRoute = (modelId) => `/v5/teamspaces/${teamspace}/projects/${project.id}/${modelType}s/${modelId}/tickets?key=${users.tsAdmin.apiKey}`;

				await Promise.all(model.tickets.map(async (ticket) => {
					const res = await agent.post(addTicketRoute(model._id)).send(ticket);
					if (!res.body._id) {
						throw new Error(`Could not add a new ticket: ${res.body.message}`);
					}

					// eslint-disable-next-line no-param-reassign
					ticket._id = res.body._id;
				}));

				return model;
			}));
		});

		const ticketsById = (tickets) => {
			const res = {};

			tickets.forEach((ticket) => {
				res[ticket._id] = ticket;
			});

			return res;
		};

		const generateTestData = (isFed) => {
			const modelType = isFed ? 'federation' : 'container';
			const wrongTypeModel = isFed ? con : fed;
			const model = isFed ? fed : con;
			const modelNoTickets = isFed ? fedNoTickets : conNoTickets;
			const modelNotFound = isFed ? templates.federationNotFound : templates.containerNotFound;
			const moduleName = Object.keys(model.tickets[0].modules)[0];
			const filters = `${Object.keys(model.tickets[0].properties)[0]},${moduleName}.${Object.keys(model.tickets[0].modules[moduleName])[0]}`;
			const baseRouteParams = { key: users.tsAdmin.apiKey, modelType, projectId: project.id, model };

			const checkTicketList = (ascending = true) => (tickets) => {
				// check the list is sorted by created at, ascending order
				let lastTicketTime;

				for (const entry of tickets) {
					const createdAt = entry.properties[basePropertyLabels.CREATED_AT];
					if (lastTicketTime) expect(lastTicketTime < createdAt).toBe(ascending);
					lastTicketTime = createdAt;
				}
			};

			const existsPropertyFilters = (propType, propertyName) => [
				[`${queryOperators.EXISTS} operator is used in ${propType} property`,
					{ ...baseRouteParams, options: { query: `'${propertyName}::${queryOperators.EXISTS}'` } }, true,
					model.tickets.filter((t) => t.type === templateWithAllProps._id
						&& Object.hasOwn(t.properties, propertyName))],
				[`${queryOperators.NOT_EXISTS} operator is used in ${propType} property`,
					{ ...baseRouteParams, options: { query: `'${propertyName}::${queryOperators.NOT_EXISTS}'` } }, true,
					model.tickets.filter((t) => t.type !== templateWithAllProps._id
					|| !Object.hasOwn(t.properties, propertyName))],
			];

			const equalsPropertyFilters = (propType, propertyName) => [
				[`${queryOperators.EQUALS} operator is used in ${propType} property`,
					{ ...baseRouteParams, options: { query: `'${propertyName}::${queryOperators.EQUALS}::${model.tickets[0].properties[propertyName]}'` } }, true,
					model.tickets
						.filter((t) => t.properties[propertyName] === model.tickets[0].properties[propertyName])],
				[`${queryOperators.NOT_EQUALS} operator is used in ${propType} property`,
					{ ...baseRouteParams, options: { query: `'${propertyName}::${queryOperators.NOT_EQUALS}::${model.tickets[0].properties[propertyName]}'` } }, true,
					model.tickets
						.filter((t) => t.properties[propertyName] !== model.tickets[0].properties[propertyName])],
			];

			const textPropertyFilters = (propType, propertyName) => {
				const existTextFilters = existsPropertyFilters(propType, propertyName);
				return [
					...existTextFilters,
					[`${queryOperators.IS} operator is used in ${propType} property`,
						{ ...baseRouteParams, options: { query: `'${propertyName}::${queryOperators.IS}::${model.tickets[0].properties[propertyName]}'` } }, true,
						model.tickets
							.filter((t) => t.properties[propertyName] === model.tickets[0].properties[propertyName])],
					[`${queryOperators.NOT_IS} operator is used in ${propType} property`,
						{ ...baseRouteParams, options: { query: `'${propertyName}::${queryOperators.NOT_IS}::${model.tickets[0].properties[propertyName]}'` } }, true,
						model.tickets
							.filter((t) => t.properties[propertyName] !== model.tickets[0].properties[propertyName])],
					[`${queryOperators.CONTAINS} operator is used in ${propType} property`,
						{ ...baseRouteParams, options: { query: `'${propertyName}::${queryOperators.CONTAINS}::${model.tickets[0].properties[propertyName].slice(0, 5)}'` } }, true,
						model.tickets.filter((t) => t.properties[propertyName]
							=== model.tickets[0].properties[propertyName])],
					[`${queryOperators.NOT_CONTAINS} operator is used in ${propType} property`,
						{ ...baseRouteParams,
							options: { query: `'${propertyName}::${queryOperators.NOT_CONTAINS}::${model.tickets[0].properties[propertyName]}'` } },
						true,
						model.tickets
							.filter((t) => t.properties[propertyName] !== model.tickets[0].properties[propertyName])],
				];
			};

			const manyOfPropertyFilters = [
				...existsPropertyFilters(propTypes.MANY_OF, manyOfProp.name),
				[`${queryOperators.IS} operator is used in ${propTypes.MANY_OF} property`,
					{ ...baseRouteParams, options: { query: `'${manyOfProp.name}::${queryOperators.IS}::${model.tickets[0].properties[manyOfProp.name][0]}'` } }, true,
					model.tickets
						.filter((t) => (t.properties[manyOfProp.name]
							?.some((val) => val === model.tickets[0].properties[manyOfProp.name][0])))],
				[`${queryOperators.NOT_IS} operator is used in ${propTypes.MANY_OF} property`,
					{ ...baseRouteParams, options: { query: `'${manyOfProp.name}::${queryOperators.NOT_IS}::${model.tickets[0].properties[manyOfProp.name][0]}'` } }, true,
					model.tickets
						.filter((t) => (!t.properties[manyOfProp.name]
							?.some((val) => val === model.tickets[0].properties[manyOfProp.name][0])))],
				[`${queryOperators.CONTAINS} operator is used in ${propTypes.MANY_OF} property`,
					{ ...baseRouteParams, options: { query: `'${manyOfProp.name}::${queryOperators.CONTAINS}::${model.tickets[0].properties[manyOfProp.name][0].slice(0, 5)}'` } }, true,
					model.tickets
						.filter((t) => t.properties[manyOfProp.name]?.some((val) => val.slice(0, 5)
							=== model.tickets[0].properties[manyOfProp.name][0].slice(0, 5)))],
				[`${queryOperators.NOT_CONTAINS} operator is used in ${propTypes.MANY_OF} property`,
					{ ...baseRouteParams,
						options: { query: `'${manyOfProp.name}::${queryOperators.NOT_CONTAINS}::${model.tickets[0].properties[manyOfProp.name][0].slice(0, 5)}'` } },
					true,
					model.tickets
						.filter((t) => !t.properties[manyOfProp.name]
							?.some((val) => val.slice(0, 5)
								=== model.tickets[0].properties[manyOfProp.name][0].slice(0, 5)))],
			];

			const numberPropertyFilters = (propType, propertyName) => [
				...existsPropertyFilters(propType, propertyName),
				...equalsPropertyFilters(propType, propertyName),
				[`${queryOperators.GREATER_OR_EQUAL_TO} operator is used in ${propType} property`, { ...baseRouteParams,
					options: { query: `'${propertyName}::${queryOperators.GREATER_OR_EQUAL_TO}::${model.tickets[0].properties[propertyName]}'` } }, true,
				model.tickets.filter((t) => t.properties[propertyName]
					>= model.tickets[0].properties[propertyName])],
				[`${queryOperators.LESSER_OR_EQUAL_TO} operator is used in ${propType} property`, { ...baseRouteParams,
					options: { query: `'${propertyName}::${queryOperators.LESSER_OR_EQUAL_TO}::${model.tickets[0].properties[propertyName]}'` } }, true,
				model.tickets.filter((t) => t.properties[propertyName]
						<= model.tickets[0].properties[propertyName])],
				[`${queryOperators.RANGE} operator is used in ${propType} property`, { ...baseRouteParams,
					options: { query: `'${propertyName}::${queryOperators.RANGE}::[${model.tickets[0].properties[propertyName] - 500},${model.tickets[0].properties[propertyName] + 500}]'` } }, true,
				model.tickets.filter((t) => t.properties[propertyName]
						>= model.tickets[0].properties[propertyName] - 500
						&& t.properties[propertyName] <= model.tickets[0].properties[propertyName] + 500)],
				[`${queryOperators.NOT_IN_RANGE} operator is used in ${propType} property`,
					{ ...baseRouteParams,
						options: { query: `'${propertyName}::${queryOperators.NOT_IN_RANGE}::[${model.tickets[0].properties[propertyName] - 500},${model.tickets[0].properties[propertyName] + 500}]'` } },
					true,
					model.tickets.filter((t) => !t.properties[propertyName] || (t.properties[propertyName]
					< model.tickets[0].properties[propertyName] - 500
					|| t.properties[propertyName] > model.tickets[0].properties[propertyName] + 500))],
			];

			const booleanPropertyFilters = [
				...existsPropertyFilters(propTypes.BOOLEAN, boolProp.name),
				...equalsPropertyFilters(propTypes.BOOLEAN, boolProp.name),
			];

			return [
				['the user does not have a valid session', { ...baseRouteParams, key: null }, false, templates.notLoggedIn],
				['the user is not a member of the teamspace', { ...baseRouteParams, key: users.nobody.apiKey }, false, templates.teamspaceNotFound],
				['the project does not exist', { ...baseRouteParams, projectId: ServiceHelper.generateRandomString() }, false, templates.projectNotFound],
				[`the ${modelType} does not exist`, { ...baseRouteParams, model: ServiceHelper.generateRandomModel() }, false, modelNotFound],
				[`the model provided is not a ${modelType}`, { ...baseRouteParams, model: wrongTypeModel }, false, modelNotFound],
				['the user does not have access to the federation', { ...baseRouteParams, key: users.noProjectAccess.apiKey }, false, templates.notAuthorized],
				['the model has no tickets', { ...baseRouteParams, model: modelNoTickets }, true, []],
				['the model has tickets', baseRouteParams, true, model.tickets],
				['the model has tickets with filter imposed', { ...baseRouteParams, options: { filters } }, true, model.tickets],
				['the model returning only tickets updated since now', { ...baseRouteParams, options: { updatedSince: Date.now() + 1000000 } }, true, []],
				['the model returning tickets sorted by updated at in ascending order', { ...baseRouteParams, options: { sortBy: basePropertyLabels.UPDATED_AT, sortDesc: false }, checkTicketList: checkTicketList() }, true, model.tickets],
				['the model returning tickets sorted by updated at in descending order', { ...baseRouteParams, options: { sortBy: basePropertyLabels.UPDATED_AT, sortDesc: true }, checkTicketList: checkTicketList(false) }, true, model.tickets],
				['the model has tickets and template query filter is imposed', { ...baseRouteParams, options: { query: `'$${specialQueryFields.TEMPLATE}::${queryOperators.IS}::${templatesToUse[1].code}'` } }, true, model.tickets.filter((t) => t.type === templatesToUse[1]._id)],
				['the model has tickets and ticket code query filter is imposed', { ...baseRouteParams, options: { query: `'$${specialQueryFields.TICKET_CODE}::${queryOperators.CONTAINS}::${templateWithAllProps.code}'` } }, true, model.tickets.filter((t) => t.type === templateWithAllProps._id)],
				['the model has tickets and title query filter is imposed', { ...baseRouteParams, options: { query: `'$${specialQueryFields.TITLE}::${queryOperators.IS}::${model.tickets[5].title}'` } }, true, [model.tickets[5]]],
				...textPropertyFilters(propTypes.TEXT, textProp.name),
				...textPropertyFilters(propTypes.LONG_TEXT, longTextProp.name),
				...textPropertyFilters(propTypes.ONE_OF, oneOfProp.name),
				...manyOfPropertyFilters,
				...numberPropertyFilters(propTypes.NUMBER, numberProp.name),
				...numberPropertyFilters(propTypes.DATE, dateProp.name),
				...booleanPropertyFilters,
				['the model has tickets and skip is provided', { ...baseRouteParams, options: { skip: 2, sortBy: commonTextProp.name } }, true, model.tickets.sort((t1, t2) => String(t2.properties[commonTextProp.name]).localeCompare(t1.properties[commonTextProp.name])).slice(2)],
				['the model has tickets and limit', { ...baseRouteParams, options: { limit: 2, sortBy: commonTextProp.name } }, true, model.tickets.sort((t1, t2) => String(t2.properties[commonTextProp.name]).localeCompare(t1.properties[commonTextProp.name])).slice(0, 2)],
			];
		};

		const runTest = (desc, { model, options = {}, checkTicketList, ...routeParams }, success, expectedOutput) => {
			test(`should ${success ? 'succeed' : `fail with ${expectedOutput.code}`} if ${desc}`, async () => {
				const getRoute = ({ key, projectId, modelType, modelId }) => `/v5/teamspaces/${teamspace}/projects/${projectId}/${modelType}s/${modelId}/tickets${ServiceHelper.createQueryString({ key, ...options })}`;
				const endpoint = getRoute({ ...routeParams, modelId: model._id });
				const expectedStatus = success ? templates.ok.status : expectedOutput.status;
				const res = await agent.get(endpoint).expect(expectedStatus);
				if (success) {
					expect(res.body.tickets.length).toBe(expectedOutput.length);
					if (checkTicketList) checkTicketList(res.body.tickets);

					if (res.body?.tickets?.length) {
						const ticketByIdMap = ticketsById(expectedOutput);
						res.body.tickets.forEach((tickOut) => {
							const { _id, title, type } = ticketByIdMap[tickOut._id];
							expect(tickOut).toEqual(expect.objectContaining({ _id, title, type }));
						});

						if (options.filters) {
							const [propName, moduleFilter] = options.filters.split(',');
							const [moduleName, moduleProp] = moduleFilter.split('.');

							const ticketContainingProps = res.body.tickets
								.filter((t) => t.properties[propName] && t.modules[moduleName]
								&& t.modules[moduleName][moduleProp]);

							expect(ticketContainingProps.length).toBeTruthy();
						}
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
		const jobsAndUsersPropName = ServiceHelper.generateRandomString();
		const requiredPropName = ServiceHelper.generateRandomString();
		const immutableProp = ServiceHelper.generateRandomString();
		const immutablePropWithDefaultValue = ServiceHelper.generateRandomString();
		const imagePropName = ServiceHelper.generateRandomString();
		const imageListPropName = ServiceHelper.generateRandomString();
		const requiredImagePropName = ServiceHelper.generateRandomString();
		const uniquePropName = ServiceHelper.generateRandomString();
		const template = {
			...ServiceHelper.generateTemplate(false, false, { issueProperties: true }),
			properties: [
				{
					name: jobsAndUsersPropName,
					type: propTypes.ONE_OF,
					values: presetEnumValues.JOBS_AND_USERS,
				},
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
					name: imageListPropName,
					type: propTypes.IMAGE_LIST,
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
		con.ticket.properties[imageListPropName] = [FS.readFileSync(image, { encoding: 'base64' })];
		delete con.ticket.properties[immutablePropWithDefaultValue];
		con.depTemTicket = ServiceHelper.generateTicket(deprecatedTemplate);
		const conUniqueProp = con.ticket.properties[uniquePropName];

		fed.ticket = ServiceHelper.generateTicket(template);
		fed.ticket.properties[requiredImagePropName] = FS.readFileSync(image, { encoding: 'base64' });
		fed.ticket.properties[imageListPropName] = [FS.readFileSync(image, { encoding: 'base64' })];
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
				[`the ${modelType} does not exist`, { ...baseRouteParams, model: ServiceHelper.generateRandomModel({ modelType: modelTypes.FEDERATION }) }, false, modelNotFound],
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
				['an image list property is updated', baseRouteParams, true, undefined, { title: ServiceHelper.generateRandomString(), properties: { [imageListPropName]: [FS.readFileSync(image, { encoding: 'base64' })] } }],
				['jobsAndUsers property is updated with a user that has inadequate permissions', baseRouteParams, false, templates.invalidArguments, { title: ServiceHelper.generateRandomString(), properties: { [jobsAndUsersPropName]: users.noProjectAccess.user } }],
				['jobsAndUsers property is updated', baseRouteParams, true, undefined, { title: ServiceHelper.generateRandomString(), properties: { [jobsAndUsersPropName]: users.tsAdmin.user } }],
				['assignees property is updated with a user that has inadequate permissions', baseRouteParams, false, templates.invalidArguments, { title: ServiceHelper.generateRandomString(), properties: { [basePropertyLabels.ASSIGNEES]: [users.viewer.user] } }],
				['assignees property is updated', baseRouteParams, true, undefined, { title: ServiceHelper.generateRandomString(), properties: { [jobsAndUsersPropName]: users.tsAdmin.user, [basePropertyLabels.ASSIGNEES]: [users.tsAdmin.user] } }],
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
						[imageListPropName]: updatedTicket.properties[imageListPropName],
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

const testUpdateManyTickets = () => {
	describe('Update many tickets', () => {
		const { users, teamspace, project, con, fed } = generateBasicData();
		const uniquePropertyName = ServiceHelper.generateRandomString();
		const template = ServiceHelper.generateTemplate(false, false, { comments: true });
		const duplicateTemplate = ServiceHelper.generateTemplate();
		duplicateTemplate.properties.push({ name: uniquePropertyName, type: propTypes.TEXT, unique: true });
		duplicateTemplate.modules.push({
			name: uniquePropertyName,
			properties: [{ name: uniquePropertyName, type: 'text', unique: true }],
		});
		const duplicateValue = ServiceHelper.generateRandomString();

		const nTickets = 2;

		const deprecatedTemplate = ServiceHelper.generateTemplate();
		con.depTemTicket = ServiceHelper.generateTicket(deprecatedTemplate);
		fed.depTemTicket = ServiceHelper.generateTicket(deprecatedTemplate);

		con.tickets = times(nTickets, () => ServiceHelper.generateTicket(template));
		fed.tickets = times(nTickets, () => ServiceHelper.generateTicket(template));
		con.ticketsCommentTest1 = times(nTickets, () => ServiceHelper.generateTicket(template));
		fed.ticketsCommentTest1 = times(nTickets, () => ServiceHelper.generateTicket(template));
		con.ticketsCommentTest2 = times(nTickets, () => ServiceHelper.generateTicket(template));
		fed.ticketsCommentTest2 = times(nTickets, () => ServiceHelper.generateTicket(template));
		con.ticketsDuplicateUniqueProp = times(nTickets, () => {
			const ticket = ServiceHelper.generateTicket(duplicateTemplate);
			ticket.properties[uniquePropertyName] = duplicateValue;
			return ticket;
		});
		fed.ticketsDuplicateUniqueProp = times(nTickets, () => {
			const ticket = ServiceHelper.generateTicket(duplicateTemplate);
			ticket.properties[uniquePropertyName] = duplicateValue;
			return ticket;
		});
		con.ticketsDuplicateUniqueModuleProp = times(nTickets, () => {
			const ticket = ServiceHelper.generateTicket(duplicateTemplate);
			ticket.modules[uniquePropertyName][uniquePropertyName] = duplicateValue;
			return ticket;
		});
		fed.ticketsDuplicateUniqueModuleProp = times(nTickets, () => {
			const ticket = ServiceHelper.generateTicket(duplicateTemplate);
			ticket.modules[uniquePropertyName][uniquePropertyName] = duplicateValue;
			return ticket;
		});

		beforeAll(async () => {
			await setupBasicData(
				users, teamspace, project, [con, fed], [template, deprecatedTemplate, duplicateTemplate],
			);

			await Promise.all([fed, con].map(async (model) => {
				const modelType = fed === model ? 'federation' : 'container';
				const addTicketRoute = (modelId) => `/v5/teamspaces/${teamspace}/projects/${project.id}/${modelType}s/${modelId}/tickets?key=${users.tsAdmin.apiKey}`;

				const { tickets, ticketsCommentTest1, ticketsCommentTest2, depTemTicket } = model;
				/* eslint-disable no-param-reassign */
				await Promise.all([...tickets, ...ticketsCommentTest1, ...ticketsCommentTest2, depTemTicket].map(
					async (ticketToAdd) => {
						const res = await agent.post(addTicketRoute(model._id)).send(ticketToAdd);
						console.log('the res: '); // eslint-disable-line
						console.log(res); // eslint-disable-line
						if (!res.body._id) {
							throw new Error(`Could not add a new ticket: ${res.body.message}`);
						}
						ticketToAdd._id = res.body._id;
						ticketToAdd.properties[basePropertyLabels.UPDATED_AT] = new Date();
					}));

				await updateOne(teamspace, 'templates', { _id: stringToUUID(deprecatedTemplate._id) }, { $set: { deprecated: true } });
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

			const baseRouteParams = {
				key: users.tsAdmin.apiKey,
				modelType,
				projectId: project.id,
				model,
				tickets: model.tickets,
				templateId: template._id,
			};

			return [
				['the user does not have a valid session', false, { ...baseRouteParams, key: null }, templates.notLoggedIn],
				['the user is not a member of the teamspace', false, { ...baseRouteParams, key: users.nobody.apiKey }, templates.teamspaceNotFound],
				['the project does not exist', false, { ...baseRouteParams, projectId: ServiceHelper.generateRandomString() }, templates.projectNotFound],
				[`the ${modelType} does not exist`, false, { ...baseRouteParams, modelId: ServiceHelper.generateRandomString() }, modelNotFound],
				[`the model provided is a ${modelType}`, false, { ...baseRouteParams, modelId: wrongTypeModel._id }, modelNotFound],
				['the user does not have access to the federation', false, { ...baseRouteParams, key: users.noProjectAccess.apiKey }, templates.notAuthorized],
				['the templateId provided does not exist', false, { ...baseRouteParams, templateId: ServiceHelper.generateUUIDString() }, templates.templateNotFound],
				['the templateId provided is not a UUID string', false, { ...baseRouteParams, templateId: ServiceHelper.generateRandomString() }, templates.templateNotFound],
				['the templateId is not provided', false, { ...baseRouteParams, templateId: null }, templates.invalidArguments],
				['the ticket data does not conforms to the template', false, baseRouteParams, templates.invalidArguments, () => ({ properties: { [ServiceHelper.generateRandomString()]: ServiceHelper.generateRandomString() } })],
				['the ticket data does not contain any update (no properties provided)', false, baseRouteParams, templates.invalidArguments],
				['the ticket data does not contain any update (properties with existing data)', false, baseRouteParams, templates.invalidArguments, ({ title }) => ({ title })],
				['the tickets to update are not following the provided template', false, { ...baseRouteParams, templateId: deprecatedTemplate._id }, templates.invalidArguments, () => ({ title: ServiceHelper.generateRandomString() })],
				['the ticket data conforms to a deprecated template', true, { ...baseRouteParams, templateId: deprecatedTemplate._id, tickets: [model.depTemTicket] }, undefined, () => ({ title: ServiceHelper.generateRandomString() })],
				['the ticket data conforms to the template but the user is a viewer', false, { ...baseRouteParams, key: users.viewer.apiKey }, templates.notAuthorized, () => ({ title: ServiceHelper.generateRandomString() })],
				['the ticket data contains comments but the template does not support it', false, { ...baseRouteParams, templateId: deprecatedTemplate._id, tickets: [model.depTemTicket] }, templates.invalidArguments, () => ({ title: ServiceHelper.generateRandomString(), comments: times(10, ServiceHelper.generateImportedComment) })],
				['the ticket data contains invalid comments', false, baseRouteParams, templates.invalidArguments, () => ({ comments: times(10, ServiceHelper.generateComment) })],
				['the ticket data contains duplicate unique property', false, { ...baseRouteParams, tickets: model.ticketsDuplicateUniqueProp }, templates.invalidArguments],
				['the ticket data contains duplicate module unique property', false, { ...baseRouteParams, tickets: model.ticketsDuplicateUniqueModuleProp }, templates.invalidArguments],
				['the ticket data conforms to the template', true, baseRouteParams, undefined, () => ({ title: ServiceHelper.generateRandomString() })],
				['the ticket data contains just comments', true, { ...baseRouteParams, tickets: model.ticketsCommentTest1 }, undefined, () => ({ comments: times(10, ServiceHelper.generateImportedComment) })],
				['the ticket data contains comments', true, { ...baseRouteParams, tickets: model.ticketsCommentTest2 }, undefined, () => ({ title: ServiceHelper.generateRandomString(), comments: times(10, ServiceHelper.generateImportedComment) })],
			];
		};

		const runTest = (desc, success, { model, tickets, ...routeParams }, expectedOutput, payloadChanges) => {
			const updateTicketsRoute = ({ key, projectId, modelId, modelType, templateId } = {}) => `/v5/teamspaces/${teamspace}/projects/${projectId}/${modelType}s/${modelId}/tickets${ServiceHelper.createQueryString({ key, template: templateId })}`;
			const getTicketRoute = ({ key, projectId, modelId, ticketId, modelType } = {}) => `/v5/teamspaces/${teamspace}/projects/${projectId}/${modelType}s/${modelId}/tickets/${ticketId}${ServiceHelper.createQueryString({ key })}`;
			const getTicketCommentsRoute = ({ key, projectId, modelId, ticketId, modelType } = {}) => `/v5/teamspaces/${teamspace}/projects/${projectId}/${modelType}s/${modelId}/tickets/${ticketId}/comments${ServiceHelper.createQueryString({ key })}`;

			test(`should ${success ? 'succeed' : `fail with ${expectedOutput.code}`} if ${desc}`, async () => {
				const expectedStatus = success ? templates.ok.status : expectedOutput.status;
				const finalisedParams = { modelId: model._id, ...routeParams };
				const endpoint = updateTicketsRoute(finalisedParams);

				const payload = {
					tickets: tickets.map((ticket) => {
						const data = payloadChanges ? payloadChanges(ticket) : {};
						data._id = ticket._id;
						return data;
					}),
				};

				const res = await agent.patch(endpoint).send(payload).expect(expectedStatus);

				if (success) {
					await Promise.all(tickets.map(async (ticket, i) => {
						const getParams = { ...finalisedParams, ticketId: ticket._id };
						const updatedTicketRes = await agent.get(getTicketRoute(
							getParams)).expect(templates.ok.status);

						const updatedTicket = updatedTicketRes.body;

						expect(updatedTicket).toHaveProperty('number');
						expect(updatedTicket.properties).toHaveProperty(basePropertyLabels.UPDATED_AT);
						expect(updatedTicket.properties).toHaveProperty(basePropertyLabels.CREATED_AT);
						expect(updatedTicket.properties).toHaveProperty(basePropertyLabels.STATUS);
						expect(updatedTicket.properties).toHaveProperty(basePropertyLabels.OWNER);
						expect(updatedTicket.properties[basePropertyLabels.UPDATED_AT])
							.not.toEqual(ticket.properties[basePropertyLabels.UPDATED_AT]);

						const { comments, ...ticketUpdates } = payload.tickets[i];
						const expectedUpdatedTicket = { ...cloneDeep(ticket), ...ticketUpdates };
						expectedUpdatedTicket.number = updatedTicket.number;
						expectedUpdatedTicket.properties = {
							...ticket.properties,
							[basePropertyLabels.UPDATED_AT]: updatedTicket.properties[basePropertyLabels.UPDATED_AT],
							[basePropertyLabels.CREATED_AT]: updatedTicket.properties[basePropertyLabels.CREATED_AT],
							[basePropertyLabels.STATUS]: updatedTicket.properties[basePropertyLabels.STATUS],
							[basePropertyLabels.OWNER]: updatedTicket.properties[basePropertyLabels.OWNER],
							...(payloadChanges?.properties ?? {}),
						};

						expect(updatedTicket).toEqual(expectedUpdatedTicket);
						await checkTicketLogByDate(updatedTicket.properties[basePropertyLabels.UPDATED_AT]);

						if (comments?.length) {
							const { body: commentRes } = await agent.get(getTicketCommentsRoute(
								getParams)).expect(templates.ok.status);
							expect(commentRes.comments?.length).toEqual(payload.tickets[i].comments.length);
						}
					}));
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
	// testGetAllTemplates();
	// testGetTemplateDetails();
	// testAddTicket();
	// testImportTickets();
	// testGetTicketResource();
	// testGetTicket();
	// testGetTicketList();
	// testUpdateTicket();
	testUpdateManyTickets();
});
