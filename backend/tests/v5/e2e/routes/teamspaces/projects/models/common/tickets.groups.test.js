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
const { idTypesToKeys, idTypes } = require('../../../../../../../../src/v5/models/metadata.constants');

const { modelTypes } = require(`${src}/models/modelSettings.constants`);

const { propTypes } = require(`${src}/schemas/tickets/templates.constants`);

const { fieldOperators, valueOperators } = require(`${src}/models/metadata.rules.constants`);

const { templates } = require(`${src}/utils/responseCodes`);
const { UUIDToString } = require(`${src}/utils/helper/uuids`);

let server;
let agent;

const generateBasicData = () => {
	const template = ServiceHelper.generateTemplate(false, true);
	const con = ServiceHelper.generateRandomModel();

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
		con,
		fed: ServiceHelper.generateRandomModel({ modelType: modelTypes.FEDERATION,
			properties: { subModels: [{ _id: con._id }] } }),
		template,
		ticket: ServiceHelper.generateTicket(template, false, con._id),
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

		model.notFound = { _id: ServiceHelper.generateUUIDString() };
		/* eslint-enable no-param-reassign */
	}));
};

const setupExtIDTicket = (container) => {
	const viewName = ServiceHelper.generateRandomString();
	const template = {
		...ServiceHelper.generateTemplate(),
		properties: [
			{
				name: viewName,
				type: propTypes.VIEW,
			},
		],
		modules: [],
	};
	const ticket = ServiceHelper.generateTicket(template);

	const rev = ServiceHelper.generateRevisionEntry();
	const revId = rev._id;

	const rootNode = ServiceHelper.generateBasicNode('transformation', revId);

	const rootMeta = ServiceHelper.generateBasicNode('meta', revId, [rootNode.shared_id], { metadata: [{
		key: idTypesToKeys[idTypes.IFC][0],
		value: ServiceHelper.generateRandomIfcGuid(),
	},
	{
		key: idTypesToKeys[idTypes.REVIT][0],
		value: ServiceHelper.generateRandomRvtId(),
	},

	] });

	const mesh1 = ServiceHelper.generateBasicNode('mesh', revId, [rootNode.shared_id]);
	const mesh2 = ServiceHelper.generateBasicNode('mesh', revId, [rootNode.shared_id]);

	const nodes = [rootNode, rootMeta, mesh1, mesh2];
	const meshIdStr1 = UUIDToString(mesh1._id);
	const meshIdStr2 = UUIDToString(mesh2._id);

	const meshMap = {
		[`${UUIDToString(rootNode._id)}`]: [meshIdStr1, meshIdStr2],
		[meshIdStr1]: meshIdStr1,
		[meshIdStr2]: meshIdStr2,
	};

	const createGroupWithExtIds = (idsObj) => {
		const group = ServiceHelper.generateGroup(false, { serialised: true, hasId: false, container });
		/* eslint-disable-next-line no-underscore-dangle */
		delete group.objects[0]._ids;
		group.objects[0] = { ...group.objects[0], ...idsObj };
		return group;
	};

	const createSmartGroupWithMatchingMeta = ({ key, value }) => {
		const rule = {
			name: ServiceHelper.generateRandomString(),
			field: { operator: fieldOperators.IS.name, values: [key] },
			operator: valueOperators.IS.name,
			values: [value],
		};
		return ServiceHelper.createGroupWithRule(rule);
	};

	/* eslint-disable no-underscore-dangle */
	const groups = {
		groupWithIfcGuids: { data: createGroupWithExtIds({ [idTypes.IFC]: [rootMeta.metadata[0].value] }),
			convertedObjs: [meshIdStr1, meshIdStr2] },
		groupWithRvtIds: { data: createGroupWithExtIds({ [idTypes.REVIT]: [rootMeta.metadata[1].value] }),
			convertedObjs: [meshIdStr1, meshIdStr2] },
		groupWithIfcGuidsNotFound: { data: createGroupWithExtIds({
			[idTypes.IFC]: [ServiceHelper.generateRandomIfcGuid()] }),
		convertedObjs: [] },
		groupWithRvtIdsNotFound: { data: createGroupWithExtIds({
			[idTypes.REVIT]: [ServiceHelper.generateRandomRvtId()] }),
		convertedObjs: [] },
		smartGroupWithIfcGuids: {
			data: createSmartGroupWithMatchingMeta(rootMeta.metadata[0]),
			convertedObjs: [meshIdStr1, meshIdStr2],
			original: { [idTypes.IFC]: [rootMeta.metadata[0].value] },
		},
		smartGroupWithRvtIds: {
			data: createSmartGroupWithMatchingMeta(rootMeta.metadata[1]),
			convertedObjs: [meshIdStr1, meshIdStr2],
			original: { [idTypes.IFC]: [rootMeta.metadata[0].value] },
		},
		smartGroupWithIfcGuidsNotFound: {
			data: createSmartGroupWithMatchingMeta({ ...rootMeta.metadata[0],
				value: ServiceHelper.generateRandomIfcGuid() }),
			convertedObjs: [],
			original: { [idTypes.IFC]: [] },
		},
	};

	/* eslint-enable no-underscore-dangle */

	ticket.properties[viewName] = {
		state: {
			hidden: Object.values(groups).map(({ data }) => ({ group: cloneDeep(data) })),
		},
	};

	return { ticket,
		template,
		groups,
		viewName,
		scene: { nodes, rev, meshMap } };
};

const testGetGroup = () => {
	describe('Get group', () => {
		const basicData = generateBasicData();
		const { users, teamspace, project, con, fed } = basicData;

		const extIdTestCase = setupExtIDTicket(con._id);

		beforeAll(async () => {
			await setupBasicData(basicData);
			await ServiceHelper.db.createTemplates(teamspace, [extIdTestCase.template]);

			await ServiceHelper.db.createScene(teamspace, project.id, con._id, extIdTestCase.scene.rev,
				extIdTestCase.scene.nodes, extIdTestCase.scene.meshMap);
			await Promise.all([fed, con].map(async (model) => {
				const modelType = fed === model ? 'federation' : 'container';

				const addTicketRoute = (modelId) => `/v5/teamspaces/${teamspace}/projects/${project.id}/${modelType}s/${modelId}/tickets?key=${users.tsAdmin.apiKey}`;
				const getTicketRoute = (modelId, ticketId) => `/v5/teamspaces/${teamspace}/projects/${project.id}/${modelType}s/${modelId}/tickets/${ticketId}?key=${users.tsAdmin.apiKey}`;

				const { body: ticketRes } = await agent.post(addTicketRoute(model._id)).send(extIdTestCase.ticket);
				/* eslint-disable no-param-reassign */
				const { body: getRes } = await agent.get(getTicketRoute(model._id, ticketRes._id));

				const hiddenGroups = getRes.properties[extIdTestCase.viewName].state.hidden;

				const groupsToUpdate = Object.keys(extIdTestCase.groups);

				groupsToUpdate.forEach((name, ind) => {
					model[name] = {
						...extIdTestCase.groups[name].data,
						_id: hiddenGroups[ind].group,
						convertedObjects: extIdTestCase.groups[name].convertedObjs,
						original: extIdTestCase.groups[name].original,
					};
				});

				model.extIdTicket = { ...cloneDeep(extIdTestCase.ticket), _id: ticketRes._id };
				/* eslint-enable no-param-reassign */
			}));
		});

		const generateTestData = (isFed) => {
			const modelType = isFed ? 'federation' : 'container';
			const wrongTypeModel = isFed ? con : fed;
			const model = isFed ? fed : con;
			const modelNotFound = isFed ? templates.federationNotFound : templates.containerNotFound;
			const baseRouteParams = { key: users.tsAdmin.apiKey,
				projectId: project.id,
				model,
				modelType,
				convertIds: true };

			return [
				['the user does not have a valid session', { ...baseRouteParams, key: null }, false, templates.notLoggedIn],
				['the user is not a member of the teamspace', { ...baseRouteParams, key: users.nobody.apiKey }, false, templates.teamspaceNotFound],
				['the project does not exist', { ...baseRouteParams, projectId: ServiceHelper.generateRandomString() }, false, templates.projectNotFound],
				[`the ${modelType} does not exist`, { ...baseRouteParams, model: ServiceHelper.generateRandomModel() }, false, modelNotFound],
				[`the model provided is not a ${modelType}`, { ...baseRouteParams, model: wrongTypeModel }, false, modelNotFound],
				[`the user does not have access to the ${modelType}`, { ...baseRouteParams, key: users.noProjectAccess.apiKey }, false, templates.notAuthorized],
				['the ticket does not exist', { ...baseRouteParams, ticketName: 'notFound' }, false, templates.ticketNotFound],
				['the group does not exist', { ...baseRouteParams, groupName: 'notFound' }, false, templates.groupNotFound],
				['the group id is valid', baseRouteParams, true],
				['the group id is valid (returning IFC GUIDs)', { ...baseRouteParams, groupName: 'groupWithIfcGuids', ticketName: 'extIdTicket', convertIds: false }, true],
				['the group id is valid and IFC guids are converted', { ...baseRouteParams, groupName: 'groupWithIfcGuids', ticketName: 'extIdTicket' }, true],
				['the group id is valid with unfound IFC GUIDs should return empty array', { ...baseRouteParams, groupName: 'groupWithIfcGuidsNotFound', ticketName: 'extIdTicket', convertIds: true }, true],
				['the group id is valid (returning RVT IDs)', { ...baseRouteParams, groupName: 'groupWithRvtIds', ticketName: 'extIdTicket', convertIds: false }, true],
				['the group id is valid and RVT IDs are converted', { ...baseRouteParams, groupName: 'groupWithRvtIds', ticketName: 'extIdTicket' }, true],
				['the group id is valid with unfound RVT IDs should return empty array', { ...baseRouteParams, groupName: 'groupWithRvtIdsNotFound', ticketName: 'extIdTicket', convertIds: true }, true],
				['the smart group id is valid', { ...baseRouteParams, ticketName: 'extIdTicket', groupName: 'smartGroupWithIfcGuids' }, true],
				['the smart group id is valid (returning IFC Guids)', { ...baseRouteParams, ticketName: 'extIdTicket', groupName: 'smartGroupWithIfcGuids', convertIds: false }, true],
			];
		};

		const getRoute = ({ key, projectId, modelId, ticketId, groupId, modelType, convertIds }) => `/v5/teamspaces/${teamspace}/projects/${projectId}/${modelType}s/${modelId}/tickets/${ticketId}/groups/${groupId}${key ? `?key=${key}` : ''}${!convertIds ? '&convertIds=false' : ''}`;
		const runTest = (desc, { model, groupName = 'group', ticketName = 'ticket', ...routeParams }, success, expectedOutput) => {
			test(`should ${success ? 'succeed' : `fail with ${expectedOutput.code}`} if ${desc}`, async () => {
				const ticket = model[ticketName];
				const group = model[groupName];
				const endpoint = getRoute({ modelId: model._id,
					ticketId: ticket?._id,
					groupId: group?._id,
					...routeParams });
				const expectedStatus = success ? templates.ok.status : expectedOutput.status;
				const res = await agent.get(endpoint).expect(expectedStatus);

				if (success) {
					const { convertedObjects, original, ...expectedData } = cloneDeep(group);
					if (routeParams.convertIds !== false) {
						if (convertedObjects) {
						// have to construct this for smart groups
							expectedData.objects = expectedData.objects || [{ container: con._id }];
							// eslint-disable-next-line no-underscore-dangle
							expectedData.objects[0]._ids = convertedObjects;

							delete expectedData.objects[0][idTypes.IFC];
							delete expectedData.objects[0][idTypes.REVIT];
						}
					} else if (original) {
						expectedData.objects = [{ container: con._id, ...original }];
					}

					expect(res.body).toEqual(expectedData);
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
				['the payload has ifc guids', { ...baseRouteParams, checkOutput: false }, { objects: [
					{ container: con._id, [idTypes.IFC]: [ServiceHelper.generateRandomIfcGuid()] },
				] }, true],
				['the payload has rvt ids', { ...baseRouteParams, checkOutput: false }, { objects: [
					{ container: con._id, [idTypes.REVIT]: [ServiceHelper.generateRandomRvtId()] },
				] }, true],
				['the payload has no ids', { ...baseRouteParams, checkOutput: false }, { objects: [
					{ container: con._id },
				] }, false, templates.invalidArguments],
				['the payload has more than one type of ids', { ...baseRouteParams, checkOutput: false }, { objects: [
					{ container: con._id,
						[idTypes.REVIT]: [ServiceHelper.generateRandomRvtId()],
						[idTypes.IFC]: [ServiceHelper.generateRandomIfcGuid()] },
				] }, false, templates.invalidArguments],
				['the payload contains both rules and objects', baseRouteParams, { rules: [{
					field: 'IFC Type',
					operator: valueOperators.IS.name,
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

		const runTest = (desc, { model, checkOutput = true, ...routeParams },
			payload, success, expectedOutput = templates.ok) => {
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
					if (checkOutput) {
						// some tests we don't care about the output (this is checked by the GET function)
						expect(getRes.body).toEqual({ ...model.group, ...payload });
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

describe(ServiceHelper.determineTestGroup(__filename), () => {
	beforeAll(async () => {
		server = await ServiceHelper.app();
		agent = await SuperTest(server);
	});
	afterAll(() => ServiceHelper.closeApp(server));

	testGetGroup();
	testUpdateGroup();
});
