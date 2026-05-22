/**
 *  Copyright (C) 2026 3D Repo Ltd
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
const ServiceHelper = require('../../../../../../helper/services');
const { src } = require('../../../../../../helper/path');
const { modelTypes } = require('../../../../../../../../src/v5/models/modelSettings.constants');
const { determineTestGroup } = require('../../../../../../helper/utils');
const { deleteIfUndefined } = require('../../../../../../../../src/v5/utils/helper/objects');
const { mapTypes } = require('../../../../../../../../src/v5/services/maps/here.constants');
const { mapProviders } = require('../../../../../../../../src/v5/services/maps/maps.constants');
const { mimeTypes } = require('../../../../../../../../src/v5/utils/responder');

const { templates } = require(`${src}/utils/responseCodes`);
const { updateAddOns } = require(`${src}/models/teamspaceSettings`);
const { ADD_ONS } = require(`${src}/models/teamspaces.constants`);
jest.mock('../../../../../../../../src/v5/utils//webRequests');
const { getArrayBuffer } = require(`${src}/utils/webRequests`);

const config = require(`${src}/utils/config`);

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
	teamspaceNoHere: ServiceHelper.generateRandomString(),
	project: ServiceHelper.generateRandomProject(),
	projectNoHere: ServiceHelper.generateRandomProject(),
	container: ServiceHelper.generateRandomModel(),
	containerNoHere: ServiceHelper.generateRandomModel(),
	federation: ServiceHelper.generateRandomModel({ modelType: modelTypes.FEDERATION }),
	federationNoHere: ServiceHelper.generateRandomModel({ modelType: modelTypes.FEDERATION }),
});

const setupBasicData = async ({
	users,
	teamspace,
	teamspaceNoHere,
	project,
	projectNoHere,
	container,
	containerNoHere,
	federation,
	federationNoHere,
}) => {
	const { tsAdmin, noProjectAccess, nobody } = users;

	await ServiceHelper.db.createUser(tsAdmin);
	await ServiceHelper.db.createTeamspace(teamspace, [tsAdmin.user]);
	await ServiceHelper.db.createTeamspace(teamspaceNoHere, [tsAdmin.user]);

	await Promise.all([
		ServiceHelper.db.createUser(noProjectAccess, [teamspace]),
		ServiceHelper.db.createUser(nobody),
		updateAddOns(teamspace, { [ADD_ONS.HERE]: true }),
		ServiceHelper.db.createModel(teamspace, container._id, container.name, container.properties),
		ServiceHelper.db.createModel(teamspace, federation._id, federation.name, federation.properties),
		ServiceHelper.db.createModel(teamspaceNoHere, containerNoHere._id,
			containerNoHere.name, containerNoHere.properties),
		ServiceHelper.db.createModel(teamspaceNoHere, federationNoHere._id,
			federationNoHere.name, federationNoHere.properties),
	]);

	await Promise.all([
		ServiceHelper.db.createProject(teamspace, project.id, project.name, [container._id, federation._id]),
		ServiceHelper.db.createProject(teamspaceNoHere, projectNoHere.id,
			projectNoHere.name, [containerNoHere._id, federationNoHere._id]),
	]);
};

const testGetListOfMaps = (isInternal = false) => {
	describe('Get list of maps', () => {
		const data = generateBasicData();

		beforeAll(async () => {
			await setupBasicData(data);
		});

		const { teamspace, project, container, federation,
			teamspaceNoHere, projectNoHere, containerNoHere, federationNoHere, users } = data;

		const generateTestCases = (modelType) => {
			const model = modelType === modelTypes.CONTAINER ? container : federation;
			const modelNoHere = modelType === modelTypes.CONTAINER ? containerNoHere : federationNoHere;

			const genRoute = ({
				ts = teamspace,
				projectId = project.id,
				modelId = model._id,
				key = users.tsAdmin.apiKey,
			} = {}) => {
				const queryString = ServiceHelper.createQueryString(deleteIfUndefined({ key }));
				return `/v5/teamspaces/${ts}/projects/${projectId}/${modelType}s/${modelId}/maps${queryString}`;
			};

			const externalCases = [
				['the user does not have a valid session', genRoute({ key: null }), false, templates.notLoggedIn],
				['the user is not a member of the teamspace', genRoute({ key: users.nobody.apiKey }), false, templates.teamspaceNotFound],
				['the user does not have access to the container', genRoute({ key: users.noProjectAccess.apiKey }), false, templates.notAuthorized],
			];

			const commonCases = [
				['the project does not exist', genRoute({ projectId: ServiceHelper.generateRandomString() }), false, templates.projectNotFound],
				['the model does not exist', genRoute({ modelId: ServiceHelper.generateRandomString() }), false, templates.modelNotFound],
				['the HERE add-on is not enabled', genRoute({ ts: teamspaceNoHere, projectId: projectNoHere.id, modelId: modelNoHere._id, key: users.tsAdmin.apiKey }), true],
				['all the parameters are valid', genRoute(), true],
			];

			return isInternal ? commonCases : [...externalCases, ...commonCases];
		};

		const runTests = (desc, route, success, expectedOutput) => {
			test(`should ${success ? 'succeed' : `fail with ${expectedOutput.code}`} if ${desc}`, async () => {
				const expectedStatus = success ? templates.ok.status : expectedOutput.status;
				const res = await agent.get(route).expect(expectedStatus);

				if (success) {
					expect(Array.isArray(res.body)).toEqual(true);
					expect(res.body).toContainEqual({ name: 'Open Street Maps', layers: [{ name: 'Map Tiles', source: 'OSM', mapType: 'default' }] });
				} else {
					expect(res.body.code).toEqual(expectedOutput.code);
				}
			});
		};

		describe.each(generateTestCases(modelTypes.CONTAINER))('Container', runTests);
		describe.each(generateTestCases(modelTypes.FEDERATION))('Federation', runTests);
	});
};
const testGetTiles = (isInternal = false) => {
	describe('Get tiles', () => {
		const data = generateBasicData();

		beforeAll(async () => {
			await setupBasicData(data);
		});

		const { teamspace, project, container, federation,
			teamspaceNoHere, projectNoHere, containerNoHere, federationNoHere, users } = data;

		const generateTestData = (modelType) => {
			const model = modelType === modelTypes.CONTAINER ? container : federation;
			const modelNoHere = modelType === modelTypes.CONTAINER ? containerNoHere : federationNoHere;

			const genRoute = ({
				ts = teamspace,
				projectId = project.id,
				modelId = model._id,
				mapProvider = mapProviders.OSM,
				mapType = mapTypes.DEFAULT,
				key = users.tsAdmin.apiKey,
				query = { zoomLevel: 10, x: 2, y: 3 },
			} = {}) => {
				const queryString = ServiceHelper.createQueryString(deleteIfUndefined({ key, ...query }));
				return `/v5/teamspaces/${ts}/projects/${projectId}/${modelType}s/${modelId}/maps/${mapProvider}/${mapType}/tiles${queryString}`;
			};

			const externalCases = [
				['the user does not have a valid session', genRoute({ key: null }), false, templates.notLoggedIn],
				['the user is not a member of the teamspace', genRoute({ key: users.nobody.apiKey }), false, templates.teamspaceNotFound],
				['the user does not have access to the container', genRoute({ key: users.noProjectAccess.apiKey }), false, templates.notAuthorized],
			];

			const commonCases = [
				['the project does not exist', genRoute({ projectId: ServiceHelper.generateRandomString() }), false, templates.projectNotFound],
				['the model does not exist', genRoute({ modelId: ServiceHelper.generateRandomString() }), false, templates.modelNotFound],
				['map coordinates are invalid', genRoute({ query: { x: ServiceHelper.generateRandomNumber } }), false, templates.invalidArguments],
				...Object.values(mapTypes).map((mapType) => [`test for here ${mapType} tiles - should succeed`, genRoute({ mapProvider: mapProviders.HERE, mapType }), true]),
				['the HERE mapType is invalid', genRoute({ mapProvider: mapProviders.HERE, mapType: ServiceHelper.generateRandomString() }), false, templates.invalidArguments],
				['the OSM mapType is invalid', genRoute({ mapProvider: mapProviders.OSM, mapType: ServiceHelper.generateRandomString() }), false, templates.invalidArguments],
				['Unknown map provider is provided', genRoute({ mapProvider: ServiceHelper.generateRandomString() }), false, templates.invalidArguments],
				['the HERE add-on is not enabled but the request is for OSM tiles', genRoute({ ts: teamspaceNoHere, projectId: projectNoHere.id, modelId: modelNoHere._id }), true],
				['the HERE add-on is not enabled and the request is for HERE tiles', genRoute({ ts: teamspaceNoHere, projectId: projectNoHere.id, modelId: modelNoHere._id, mapProvider: mapProviders.HERE }), false, templates.addOnUnavailable],
			];

			return isInternal ? commonCases : [...externalCases, ...commonCases];
		};

		const runTests = (desc, route, success, expectedOutput) => {
			test(`should ${success ? 'succeed' : `fail with ${expectedOutput.code}`} if ${desc}`, async () => {
				config[mapProviders.HERE] = { apiKey: ServiceHelper.generateRandomString() };
				config[mapProviders.OSM] = {
					domain: ServiceHelper.generateRandomString(),
					prefix: ServiceHelper.generateRandomString(),
					key: ServiceHelper.generateRandomString(),
				};

				const bufferData = Buffer.from(ServiceHelper.generateRandomString());
				if (success) getArrayBuffer.mockResolvedValueOnce({ data: bufferData });

				const expectedStatus = success ? templates.ok.status : expectedOutput.status;
				const res = await agent.get(route).expect(expectedStatus);

				if (success) {
					expect(res.headers['content-type']).toContain(mimeTypes.png);
					expect(Buffer.isBuffer(res.body)).toEqual(true);
					expect(res.body).toEqual(bufferData);
				} else {
					expect(res.body.code).toEqual(expectedOutput.code);
				}
			});
		};

		describe.each(generateTestData(modelTypes.CONTAINER))('Container', runTests);
		describe.each(generateTestData(modelTypes.FEDERATION))('Federation', runTests);
	});
};

describe(determineTestGroup(__filename), () => {
	afterEach(() => server.close());
	afterAll(() => ServiceHelper.closeApp(server));

	describe('External Service', () => {
		beforeAll(async () => {
			server = await ServiceHelper.app();
			agent = await SuperTest(server);
		});
		testGetListOfMaps();
		testGetTiles();
	});

	describe('Internal Service', () => {
		beforeAll(async () => {
			server = await ServiceHelper.app(true);
			agent = await SuperTest(server);
		});
		testGetListOfMaps(true);
		testGetTiles(true);
	});
});
