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
const ServiceHelper = require('../../../../../helper/services');
const { src, image } = require('../../../../../helper/path');

const { propTypes, presetEnumValues, presetModules } = require(`${src}/schemas/tickets/templates.constants`);
const { updateOne, findOne } = require(`${src}/handler/db`);
const { stringToUUID } = require(`${src}/utils/helper/uuids`);

const { templates } = require(`${src}/utils/responseCodes`);
const { generateFullSchema } = require(`${src}/schemas/tickets/templates`);

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
	ServiceHelper.generateRandomModel({ viewers: [users.viewer.user] }),
	ServiceHelper.generateRandomModel({ isFederation: true }),
];

const modelWithTemplates = models[0];
const modelWithNoTickets = models[1];
const modelForTicketList = models[2];
const fed = models[3];

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

const templateWithImage = {
	...ServiceHelper.generateTemplate(),
	properties: [{
		name: ServiceHelper.generateRandomString(),
		type: propTypes.IMAGE,
	}],
};

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

const ticketTemplates = [
	ServiceHelper.generateTemplate(),
	deprecatedTemplate,
	ServiceHelper.generateTemplate(),
	ServiceHelper.generateTemplate(true),
	templateWithAllModulesAndPresetEnums,
	templateWithImage,
	templateWithRequiredProp,
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
			{
				templates: ticketTemplates.flatMap(({ _id, name, deprecated, code }) => (deprecated ? []
					: { _id, name, code })),
			},
			undefined, undefined, users.tsAdmin.apiKey],
		['should provide the list of templates including deprecated if the flag is set', true,
			{ templates: ticketTemplates.map(({ _id, name, code, deprecated }) => ({ _id, name, code, deprecated })) },
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

const testGetTemplateDetails = () => {
	const route = (key, projectId = project.id, modelId = modelWithTemplates._id, templateId = ticketTemplates[0]._id) => `/v5/teamspaces/${teamspace}/projects/${projectId}/containers/${modelId}/tickets/templates/${templateId}${key ? `?key=${key}` : ''}`;
	const pruneDeprecated = (template) => {
		// eslint-disable-next-line no-param-reassign
		template.properties = template.properties.filter(({ deprecated }) => !deprecated);
		// eslint-disable-next-line no-param-reassign
		template.modules = template.modules.filter((mod) => {
			// eslint-disable-next-line no-param-reassign
			mod.properties = mod.properties.filter(({ deprecated }) => !deprecated);
			return !mod.deprecated;
		});

		return template;
	};
	describe.each([
		['the user does not have a valid session', false, templates.notLoggedIn],
		['the user is not a member of the teamspace', false, templates.teamspaceNotFound, undefined, undefined, undefined, users.nobody.apiKey],
		['the project does not exist', false, templates.projectNotFound, ServiceHelper.generateRandomString(), undefined, undefined, users.tsAdmin.apiKey],
		['the container does not exist', false, templates.containerNotFound, project.id, ServiceHelper.generateRandomString(), undefined, users.tsAdmin.apiKey],
		['the container provided is a federation', false, templates.containerNotFound, project.id, fed._id, undefined, users.tsAdmin.apiKey],
		['the user does not have access to the container', false, templates.notAuthorized, undefined, undefined, undefined, users.noProjectAccess.apiKey],
		['the template id is invalid', false, templates.templateNotFound, undefined, undefined, ServiceHelper.generateRandomString(), users.tsAdmin.apiKey],
		['should return the full template', true, generateFullSchema(ticketTemplates[0]), undefined, undefined, undefined, users.tsAdmin.apiKey, true],
		['should return the full template without deprecated fields', true, pruneDeprecated(generateFullSchema(ticketTemplates[0])), undefined, undefined, undefined, users.tsAdmin.apiKey],
	])('Get template details', (desc, success, expectedOutput, projectId, modelId, templateId, key, showDeprecated) => {
		test(`should ${success ? 'succeed' : 'fail'} if ${desc}`, async () => {
			const expectedStatus = success ? templates.ok.status : expectedOutput.status;
			const endpoint = route(key, projectId, modelId, templateId);
			const res = await agent.get(`${endpoint}${showDeprecated ? '&showDeprecated=true' : ''}`).expect(expectedStatus);

			if (success) {
				expect(res.body).toEqual(expectedOutput);
			} else {
				expect(res.body.code).toEqual(expectedOutput.code);
			}
		});
	});
};

const addTicketRoute = (key, projectId = project.id, modelId = modelWithTemplates._id) => `/v5/teamspaces/${teamspace}/projects/${projectId}/containers/${modelId}/tickets${key ? `?key=${key}` : ''}`;

const getTicketRoute = (key, projectId = project.id, modelId = modelWithTemplates._id, ticketId) => `/v5/teamspaces/${teamspace}/projects/${projectId}/containers/${modelId}/tickets/${ticketId}${key ? `?key=${key}` : ''}`;

const testAddTicket = () => {
	describe.each([
		['the user does not have a valid session', false, templates.notLoggedIn],
		['the user is not a member of the teamspace', false, templates.teamspaceNotFound, undefined, undefined, users.nobody.apiKey],
		['the project does not exist', false, templates.projectNotFound, ServiceHelper.generateRandomString(), undefined, users.tsAdmin.apiKey],
		['the container does not exist', false, templates.containerNotFound, project.id, ServiceHelper.generateRandomString(), users.tsAdmin.apiKey],
		['the container provided is a federation', false, templates.containerNotFound, project.id, fed._id, users.tsAdmin.apiKey],
		['the user does not have access to the container', false, templates.notAuthorized, undefined, undefined, users.noProjectAccess.apiKey],
		['the templateId provided does not exist', false, templates.templateNotFound, undefined, undefined, users.tsAdmin.apiKey, { type: ServiceHelper.generateRandomString() }],
		['the templateId is not provided', false, templates.invalidArguments, undefined, undefined, users.tsAdmin.apiKey, { type: undefined }],
		['the ticket data does not conforms to the template', false, templates.invalidArguments, undefined, undefined, users.tsAdmin.apiKey, { properties: { [ServiceHelper.generateRandomString()]: ServiceHelper.generateRandomString() } }],
		['the ticket data conforms to the template', true, undefined, undefined, undefined, users.tsAdmin.apiKey],
		['the ticket data conforms to the template but the user is a viewer', false, templates.notAuthorized, undefined, undefined, users.viewer.apiKey],
		['the ticket has a template that contains all preset modules, preset enums and configs', true, undefined, undefined, undefined, users.tsAdmin.apiKey, { properties: {}, modules: {}, type: templateWithAllModulesAndPresetEnums._id }],
	])('Add Ticket', (desc, success, expectedOutput, projectId, modelId, key, payloadChanges = {}) => {
		test(`should ${success ? 'succeed' : 'fail'} if ${desc}`, async () => {
			const payload = { ...ServiceHelper.generateTicket(ticketTemplates[0]), ...payloadChanges };

			const expectedStatus = success ? templates.ok.status : expectedOutput.status;
			const endpoint = addTicketRoute(key, projectId, modelId);

			const res = await agent.post(endpoint).send(payload).expect(expectedStatus);

			if (success) {
				expect(res.body._id).not.toBeUndefined();

				const getEndpoint = getTicketRoute(users.tsAdmin.apiKey,
					project.id, modelWithTemplates._id, res.body._id);
				await agent.get(getEndpoint).expect(templates.ok.status);
			} else {
				expect(res.body.code).toEqual(expectedOutput.code);
			}
		});
	});
};

const testGetTicketResource = () => {
	const route = (key, projectId = project.id, modelId = modelWithTemplates._id, ticketId, resourceId) => `/v5/teamspaces/${teamspace}/projects/${projectId}/containers/${modelId}/tickets/${ticketId}/resources/${resourceId}${key ? `?key=${key}` : ''}`;
	describe('Get ticket resource', () => {
		let ticketID;
		let resourceID;

		beforeAll(async () => {
			const ticket = {
				title: ServiceHelper.generateRandomString(),
				type: templateWithImage._id,
				properties: {
					[templateWithImage.properties[0].name]: FS.readFileSync(image, { encoding: 'base64' }),
				},
			};
			const endpoint = addTicketRoute(users.tsAdmin.apiKey);
			const res = await agent.post(endpoint).send(ticket);
			ticketID = res.body._id;

			const getEndpoint = getTicketRoute(users.tsAdmin.apiKey, project.id, modelWithTemplates._id, ticketID);
			const { body } = await agent.get(getEndpoint);
			resourceID = body.properties[templateWithImage.properties[0].name];
		});

		describe.each([
			['the user does not have a valid session', templates.notLoggedIn],
			['the user is not a member of the teamspace', templates.teamspaceNotFound, undefined, undefined, undefined, undefined, users.nobody.apiKey],
			['the project does not exist', templates.projectNotFound, ServiceHelper.generateRandomString(), undefined, undefined, undefined, users.tsAdmin.apiKey],
			['the container does not exist', templates.containerNotFound, project.id, ServiceHelper.generateRandomString(), undefined, undefined, users.tsAdmin.apiKey],
			['the container provided is a federation', templates.containerNotFound, project.id, fed._id, undefined, undefined, users.tsAdmin.apiKey],
			['the user does not have access to the container', templates.notAuthorized, undefined, undefined, undefined, undefined, users.noProjectAccess.apiKey],
			['the ticket does not exist', templates.fileNotFound, undefined, undefined, ServiceHelper.generateRandomString(), undefined, users.tsAdmin.apiKey],
			['the resource does not exist', templates.fileNotFound, undefined, undefined, undefined, ServiceHelper.generateRandomString(), users.tsAdmin.apiKey],
		])('Error checks', (desc, expectedOutput, projectId, modelId, ticket, resource, key) => {
			test(`should fail with ${expectedOutput.code} if ${desc}`, async () => {
				const endpoint = route(key, projectId, modelId, ticket ?? ticketID, resource ?? resourceID);

				const res = await agent.get(endpoint).expect(expectedOutput.status);
				expect(res.body.code).toEqual(expectedOutput.code);
			});
		});

		test('should get the resource successfully given the correct resource id', async () => {
			const endpoint = route(users.tsAdmin.apiKey, project.id, modelWithTemplates._id, ticketID, resourceID);
			const res = await agent.get(endpoint).expect(templates.ok.status);
			expect(res.header).toEqual(expect.objectContaining({ 'content-type': 'image/png' }));
			expect(res.body).not.toBeUndefined();
			expect(Buffer.isBuffer(res.body)).toBeTruthy();
		});
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
			['the container does not exist', templates.containerNotFound, project.id, ServiceHelper.generateRandomString(), undefined, users.tsAdmin.apiKey],
			['the container provided is a federation', templates.containerNotFound, project.id, fed._id, undefined, users.tsAdmin.apiKey],
			['the user does not have access to the container', templates.notAuthorized, undefined, undefined, undefined, users.noProjectAccess.apiKey],
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
	const route = (key, projectId = project.id, modelId = modelWithTemplates._id) => `/v5/teamspaces/${teamspace}/projects/${projectId}/containers/${modelId}/tickets${key ? `?key=${key}` : ''}`;
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
			['the container does not exist', templates.containerNotFound, project.id, ServiceHelper.generateRandomString(), users.tsAdmin.apiKey],
			['the container provided is a federation', templates.containerNotFound, project.id, fed._id, users.tsAdmin.apiKey],
			['the user does not have access to the container', templates.notAuthorized, undefined, undefined, users.noProjectAccess.apiKey],
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

const updateTicketRoute = (key, projectId = project.id, modelId = modelWithTemplates._id, ticketId) => `/v5/teamspaces/${teamspace}/projects/${projectId}/containers/${modelId}/tickets/${ticketId}${key ? `?key=${key}` : ''}`;

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
		ticket.properties['Updated at'] = new Date();
		ticketWithDeprecatedTemplate.properties['Updated at'] = new Date();
		await updateOne(teamspace, 'templates', { _id: stringToUUID(deprecatedTemplate._id) }, { $set: { deprecated: true } });
	});

	describe.each([
		['the user does not have a valid session', false, templates.notLoggedIn],
		['the user is not a member of the teamspace', false, templates.teamspaceNotFound, undefined, undefined, undefined, users.nobody.apiKey],
		['the project does not exist', false, templates.projectNotFound, ServiceHelper.generateRandomString(), undefined, undefined, users.tsAdmin.apiKey],
		['the container does not exist', false, templates.containerNotFound, project.id, ServiceHelper.generateRandomString(), undefined, users.tsAdmin.apiKey],
		['the container provided is a federation', false, templates.containerNotFound, project.id, fed._id, undefined, users.tsAdmin.apiKey],
		['the user does not have access to the container', false, templates.notAuthorized, undefined, undefined, undefined, users.noProjectAccess.apiKey],
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
				expect(updatedTicket.properties).toHaveProperty('Updated at');
				expect(updatedTicket.properties['Updated at']).not.toEqual(ticket.properties['Updated at']);
				expect(updatedTicket.properties).toHaveProperty('Created at');
				expect(updatedTicket.properties).toHaveProperty('Owner');
				delete updatedTicket.number;
				const updatedDate = updatedTicket.properties['Updated at'];
				delete updatedTicket.properties['Updated at'];
				delete ticket.properties['Updated at'];
				delete updatedTicket.properties['Created at'];
				delete updatedTicket.properties.Owner;
				expect({ ...updatedTicket }).toEqual({ ...ticket, ...payloadChanges });
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
		expect(updatedTicket.properties).toHaveProperty('Updated at');
		expect(updatedTicket.properties['Updated at']).not.toEqual(ticketWithDeprecatedTemplate.properties['Updated at']);
		expect(updatedTicket.properties).toHaveProperty('Created at');
		expect(updatedTicket.properties).toHaveProperty('Owner');
		delete updatedTicket.number;
		delete updatedTicket.properties['Updated at'];
		const updatedDate = updatedTicket.properties['Updated at'];
		delete ticketWithDeprecatedTemplate.properties['Updated at'];
		delete updatedTicket.properties['Created at'];
		delete updatedTicket.properties.Owner;
		expect({ ...updatedTicket }).toEqual({ ...ticketWithDeprecatedTemplate, ...payloadChanges });
		await checkTicketLogByDate(updatedDate);
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
	testGetTemplateDetails();
	testAddTicket();
	testGetTicket();
	testGetTicketResource();
	testGetTicketList();
	testUpdateTicket();
});
