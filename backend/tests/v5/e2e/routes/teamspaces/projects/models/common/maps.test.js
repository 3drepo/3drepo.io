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

const { templates } = require(`${src}/utils/responseCodes`);
const { updateAddOns } = require(`${src}/models/teamspaceSettings`);
const { ADD_ONS } = require(`${src}/models/teamspaces.constants`);
jest.mock('../../../../../../../../src/v5/utils//webRequests');
const { getArrayBuffer } = require(`${src}/utils/webRequests`);

const config = require(`${src}/utils/config`);

let server;
let agent;

const generateBasicData = (modelType) => ({
	users: {
		tsAdmin: ServiceHelper.generateUserCredentials(),
		viewer: ServiceHelper.generateUserCredentials(),
		noProjectAccess: ServiceHelper.generateUserCredentials(),
		nobody: ServiceHelper.generateUserCredentials(),
		projectAdmin: ServiceHelper.generateUserCredentials(),
	},
	teamspace: ServiceHelper.generateRandomString(),
	project: ServiceHelper.generateRandomProject(),
	model: ServiceHelper.generateRandomModel({ modelType }),
});

const setupBasicData = async (
	users,
	teamspace,
	project,
	model,
	hereEnabled = true,
) => {
	const { tsAdmin, noProjectAccess, nobody } = users;

	await ServiceHelper.db.createUser(tsAdmin);
	await ServiceHelper.db.createTeamspace(teamspace, [tsAdmin.user]);

	await Promise.all([
		ServiceHelper.db.createUser(noProjectAccess, [teamspace]),
		ServiceHelper.db.createUser(nobody),
	]);

	await ServiceHelper.db.createModel(teamspace, model._id, model.name, model.properties);
	await ServiceHelper.db.createProject(teamspace, project.id, project.name, [model._id]);

	if (hereEnabled) {
		await updateAddOns(teamspace, { [ADD_ONS.HERE]: true });
	}
};

const genRoute = ({
	teamspace,
	projectId,
	modelId,
	modelType,
	path = '',
	key,
	query,
}) => {
	const queryString = ServiceHelper.createQueryString({ ...query, key });
	return `/v5/teamspaces/${teamspace}/projects/${projectId}/${modelType}s/${modelId}/maps${path}${queryString}`;
};

const testGetListOfMaps = (isInternal = false) => {
	describe('Get list of maps', () => {
		const generateTest = (modelType) => {
			const {
				users,
				teamspace,
				project,
				model,
			} = generateBasicData(modelType);
			const { users: usersNoHere,
				teamspace: teamspaceNoHere,
				project: projectNoHere,
				model: modelNoHere,
			} = generateBasicData(modelType);

			beforeAll(async () => {
				await setupBasicData(users, teamspace, project, model, true);
				await setupBasicData(usersNoHere, teamspaceNoHere, projectNoHere, modelNoHere, false);
			});

			const externalCases = [
				['the user does not have a valid session',
					genRoute({
						teamspace,
						projectId: project.id,
						modelId: model._id,
						modelType,
						key: null,
					}),
					false,
					templates.notLoggedIn,
				],
				['the user is not a member of the teamspace',
					genRoute({
						teamspace,
						projectId: project.id,
						modelId: model._id,
						modelType,
						key: users.nobody.apiKey,
					}),
					false,
					templates.teamspaceNotFound,
				],
				['the user does not have access to the container',
					genRoute({
						teamspace,
						projectId: project.id,
						modelId: model._id,
						modelType,
						key: users.noProjectAccess.apiKey,
					}),
					false,
					templates.notAuthorized],
			];

			const internalCases = [
				['the project does not exist', genRoute({ teamspace, projectId: ServiceHelper.generateRandomString(), modelId: model._id, modelType, key: users.tsAdmin.apiKey }), false, templates.projectNotFound],
				['the container does not exist', genRoute({ teamspace, projectId: project.id, modelId: ServiceHelper.generateRandomString(), modelType, key: users.tsAdmin.apiKey }), false, modelType === modelTypes.CONTAINER ? templates.containerNotFound : templates.federationNotFound],
				['the HERE add-on is not enabled', genRoute({ teamspace: teamspaceNoHere, projectId: projectNoHere.id, modelId: modelNoHere._id, modelType, key: usersNoHere.tsAdmin.apiKey }), true],
				['all the parameters are valid', genRoute({ teamspace, projectId: project.id, modelId: model._id, modelType, key: users.tsAdmin.apiKey }), true],
			];

			return isInternal ? internalCases : [...externalCases, ...internalCases];
		};

		const runTests = (desc, route, success, expectedOutput) => {
			test(`should ${success ? 'succeed' : `fail with ${expectedOutput.code}`} if ${desc}`, async () => {
				const expectedStatus = success ? templates.ok.status : expectedOutput.status;
				const res = await agent.get(route).expect(expectedStatus);

				if (success) {
					expect(Array.isArray(res.body)).toEqual(true);
					expect(res.body).toContainEqual({ name: 'Open Street Map', layers: [{ name: 'Map Tiles', source: 'OSM' }] });
				} else {
					expect(res.body.code).toEqual(expectedOutput.code);
				}
			});
		};

		describe.each(generateTest(modelTypes.CONTAINER))('Container maps - %s', runTests);
		describe.each(generateTest(modelTypes.FEDERATION))('Federation maps - %s', runTests);
	});
};
const testGetTiles = (isInternal = false) => {
	describe('Get tiles', () => {
		const hereEndpoints = [
			{ name: 'HERE default', path: '/here/default/tiles' },
			{ name: 'HERE aerial', path: '/here/aerial/tiles' },
			{ name: 'HERE traffic', path: '/here/traffic/tiles' },
			{ name: 'HERE traffic flow', path: '/here/trafficflow/tiles' },
			{ name: 'HERE terrain', path: '/here/terrain/tiles' },
			{ name: 'HERE hybrid', path: '/here/hybrid/tiles' },
			{ name: 'HERE grey', path: '/here/grey/tiles' },
			{ name: 'HERE truck restrictions', path: '/here/truck/tiles' },
			{ name: 'HERE truck restrictions overlay', path: '/here/truckoverlay/tiles' },
			{ name: 'HERE label overlay', path: '/here/labeloverlay/tiles' },
			{ name: 'HERE toll zone', path: '/here/tollzone/tiles' },
			{ name: 'HERE POI', path: '/here/poi/tiles' },
		];

		const generateTest = (modelType) => {
			const {
				users,
				teamspace,
				project,
				model,
			} = generateBasicData(modelType);

			const {
				users: usersNoHere,
				teamspace: teamspaceNoHere,
				project: projectNoHere,
				model: modelNoHere,
			} = generateBasicData(modelType);

			beforeAll(async () => {
				await setupBasicData(users, teamspace, project, model, true);
				await setupBasicData(usersNoHere, teamspaceNoHere, projectNoHere, modelNoHere, false);
			});

			const externalCases = [
				['the user does not have a valid session',
					genRoute({
						teamspace,
						projectId: project.id,
						modelId: model._id,
						modelType,
						key: null,
					}),
					false,
					templates.notLoggedIn,
				],
				['the user is not a member of the teamspace',
					genRoute({
						teamspace,
						projectId: project.id,
						modelId: model._id,
						modelType,
						key: users.nobody.apiKey,
					}),
					false,
					templates.teamspaceNotFound,
				],
				['the user does not have access to the model',
					genRoute({
						teamspace,
						projectId: project.id,
						modelId: model._id,
						modelType,
						key: users.noProjectAccess.apiKey,
					}),
					false,
					templates.notAuthorized],
			];

			const internalCases = [
				['the project does not exist', genRoute({ teamspace, projectId: ServiceHelper.generateRandomString(), modelId: model._id, modelType, key: users.tsAdmin.apiKey }), false, templates.projectNotFound],
				['the model does not exist', genRoute({ teamspace, projectId: project.id, modelId: ServiceHelper.generateRandomString(), modelType, key: users.tsAdmin.apiKey }), false, modelType === modelTypes.CONTAINER ? templates.containerNotFound : templates.federationNotFound],
				['map coordinates are invalid', genRoute({ teamspace, projectId: project.id, modelId: model._id, modelType, path: '/here/default/tiles', key: users.tsAdmin.apiKey, query: { zoomLevel: 'a', x: 2 } }), false, templates.invalidArguments, { configureHERE: true, provider: 'HERE' }],
				['the HERE add-on is not enabled', genRoute({ teamspace: teamspaceNoHere, projectId: projectNoHere.id, modelId: modelNoHere._id, modelType, path: '/here/default/tiles', key: usersNoHere.tsAdmin.apiKey }), false, templates.addOnUnavailable, { configureHERE: true, provider: 'HERE' }],
				...hereEndpoints.map(({ name, path }) => [`test for ${name} tiles - should succeed if all parameters are valid`, genRoute({ teamspace, projectId: project.id, modelId: model._id, modelType, path, key: users.tsAdmin.apiKey, query: { zoomLevel: 10, x: 2, y: 3 } }), true, {}, { configureHERE: true, provider: 'HERE' }]),
				['the OSM configuration is missing', genRoute({ teamspace, projectId: project.id, modelId: model._id, modelType, path: '/osm/default/tiles', key: users.tsAdmin.apiKey, query: { zoomLevel: 10, x: 2, y: 3 } }), false, templates.mapsRequestFailed, { provider: 'OSM', configureOSM: 'missing' }],
				['the OSM mapType is invalid', genRoute({ teamspace, projectId: project.id, modelId: model._id, modelType, path: '/osm/invalid/tiles', key: users.tsAdmin.apiKey, query: { zoomLevel: 10, x: 2, y: 3 } }), false, templates.invalidArguments, { provider: 'OSM', configureOSM: 'valid' }],
				['the HERE add-on is not enabled but the request is for OSM tiles and the OSM configuration is present', genRoute({ path: '/osm/default/tiles', teamspace: teamspaceNoHere, projectId: projectNoHere.id, modelId: modelNoHere._id, modelType, key: usersNoHere.tsAdmin.apiKey, query: { zoomLevel: 10, x: 2, y: 3 } }), true, {}, { provider: 'OSM', configureOSM: 'valid' }],
			];

			return isInternal ? internalCases : internalCases.concat(externalCases);
		};

		const runTests = (desc, route, success, expectedOutput, { configureHERE = false, provider = 'HERE', configureOSM = null } = {}) => {
			test(`should ${success ? 'succeed' : `fail with ${expectedOutput.code}`} if ${desc}`, async () => {
				if (configureHERE) {
					config.here = {
						apiKey: ServiceHelper.generateRandomString(),
					};
				}

				if (configureOSM === 'missing') {
					config.osm = null;
				}

				if (configureOSM === 'valid') {
					config.osm = {
						domain: ServiceHelper.generateRandomString(),
						prefix: ServiceHelper.generateRandomString(),
						key: ServiceHelper.generateRandomString(),
					};
				}

				getArrayBuffer.mockResolvedValueOnce({ data: Buffer.from('test') });

				const expectedStatus = success ? templates.ok.status : expectedOutput.status;
				const res = await agent.get(route).expect(expectedStatus);

				if (success) {
					expect(res.headers['content-type']).toContain('image/png');
					expect(Buffer.isBuffer(res.body)).toEqual(true);
					expect(res.body.length).toBeGreaterThan(0);
				} else {
					expect(res.body.code).toEqual(expectedOutput.code);
					if (provider === 'OSM') {
						expect(getArrayBuffer).not.toHaveBeenCalled();
					}
				}
			});
		};

		afterEach(() => {
			jest.restoreAllMocks();
		});

		describe.each(generateTest(modelTypes.CONTAINER))('Container maps - %s', runTests);
		describe.each(generateTest(modelTypes.FEDERATION))('Federation maps - %s', runTests);
	});
};

describe(ServiceHelper.determineTestGroup(__filename), () => {
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
