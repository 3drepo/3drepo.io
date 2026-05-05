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

const { templates } = require(`${src}/utils/responseCodes`);
const { updateAddOns } = require(`${src}/models/teamspaceSettings`);
const { ADD_ONS } = require(`${src}/models/teamspaces.constants`);
const Maps = require(`${src}/processors/teamspaces/projects/models/commons/maps`);

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
	container: ServiceHelper.generateRandomModel(),
});

const setupBasicData = async (
	users,
	teamspace,
	project,
	container,
	hereEnabled = true,
) => {
	const { tsAdmin, noProjectAccess, nobody } = users;

	await ServiceHelper.db.createUser(tsAdmin);
	await ServiceHelper.db.createTeamspace(teamspace, [tsAdmin.user]);

	await Promise.all([
		ServiceHelper.db.createUser(noProjectAccess, [teamspace]),
		ServiceHelper.db.createUser(nobody),
	]);

	await ServiceHelper.db.createModel(teamspace, container._id, container.name, container.properties);
	await ServiceHelper.db.createProject(teamspace, project.id, project.name, [container._id]);

	if (hereEnabled) {
		await updateAddOns(teamspace, { [ADD_ONS.HERE]: true });
	}
};

const genRoute = ({
	teamspace,
	projectId,
	containerId,
	path = '',
	key,
	query,
}) => {
	const searchParams = new URLSearchParams();

	if (key) {
		searchParams.set('key', key);
	}

	if (query) {
		Object.entries(query).forEach(([k, v]) => {
			if (v !== undefined && v !== null) {
				searchParams.set(k, v);
			}
		});
	}

	const queryString = searchParams.toString();
	return `/v5/teamspaces/${teamspace}/projects/${projectId}/containers/${containerId}/maps${path}${queryString ? `?${queryString}` : ''}`;
};

const testGetListOfMaps = () => {
	describe('Get list of maps', () => {
		const {
			users,
			teamspace,
			project,
			container,
		} = generateBasicData();

		beforeAll(async () => {
			await setupBasicData(users, teamspace, project, container, true);
		});

		const route = ({
			key = users.tsAdmin.apiKey,
			projectId = project.id,
			containerId = container._id,
		} = {}) => genRoute({ teamspace, projectId, containerId, key });

		describe.each([
			['the user does not have a valid session', route({ key: null }), false, templates.notLoggedIn],
			['the user is not a member of the teamspace', route({ key: users.nobody.apiKey }), false, templates.teamspaceNotFound],
			['the project does not exist', route({ projectId: ServiceHelper.generateRandomString() }), false, templates.projectNotFound],
			['the container does not exist', route({ containerId: ServiceHelper.generateRandomString() }), false, templates.containerNotFound],
			['the user does not have access to the container', route({ key: users.noProjectAccess.apiKey }), false, templates.notAuthorized],
			['all the parameters are valid', route(), true],
		])('%s', (desc, url, success, expectedOutput) => {
			test(`should ${success ? 'succeed' : `fail with ${expectedOutput.code}`} if ${desc}`, async () => {
				const expectedStatus = success ? templates.ok.status : expectedOutput.status;
				const res = await agent.get(url).expect(expectedStatus);

				if (success) {
					expect(Array.isArray(res.body)).toEqual(true);
					expect(res.body).toContainEqual({ name: 'Open Street Map', layers: [{ name: 'Map Tiles', source: 'OSM' }] });
				} else {
					expect(res.body.code).toEqual(expectedOutput.code);
				}
			});
		});
	});
};

const testGetHereInfo = () => {
	describe('Get HERE base info', () => {
		const {
			users,
			teamspace,
			project,
			container,
		} = generateBasicData();

		const {
			users: usersNoHere,
			teamspace: teamspaceNoHere,
			project: projectNoHere,
			container: containerNoHere,
		} = generateBasicData();

		beforeAll(async () => {
			await setupBasicData(users, teamspace, project, container, true);
			await setupBasicData(usersNoHere, teamspaceNoHere, projectNoHere, containerNoHere, false);
		});

		afterEach(() => {
			jest.restoreAllMocks();
		});

		const route = ({
			ts = teamspace,
			key = users.tsAdmin.apiKey,
			projectId = project.id,
			containerId = container._id,
		} = {}) => genRoute({ teamspace: ts, projectId, containerId, path: '/here', key });

		describe.each([
			['the user does not have a valid session', route({ key: null }), false, templates.notLoggedIn],
			['the user is not a member of the teamspace', route({ key: users.nobody.apiKey }), false, templates.teamspaceNotFound],
			['the project does not exist', route({ projectId: ServiceHelper.generateRandomString() }), false, templates.projectNotFound],
			['the container does not exist', route({ containerId: ServiceHelper.generateRandomString() }), false, templates.containerNotFound],
			['the user does not have access to the container', route({ key: users.noProjectAccess.apiKey }), false, templates.notAuthorized],
			['the HERE add-on is not enabled', route({ ts: teamspaceNoHere, projectId: projectNoHere.id, containerId: containerNoHere._id, key: usersNoHere.tsAdmin.apiKey }), false, templates.addOnUnavailable],
		])('%s', (desc, url, success, expectedOutput) => {
			test(`should ${success ? 'succeed' : `fail with ${expectedOutput.code}`} if ${desc}`, async () => {
				const expectedStatus = success ? templates.ok.status : expectedOutput.status;
				const res = await agent.get(url).expect(expectedStatus);

				if (success) {
					expect(res.body).toEqual({ version: 'v-test' });
				} else {
					expect(res.body.code).toEqual(expectedOutput.code);
				}
			});
		});

		test('should succeed if all parameters are valid', async () => {
			jest.spyOn(Maps, 'getHereBaseInfo').mockResolvedValueOnce({ version: 'v-test' });

			const res = await agent.get(route()).expect(templates.ok.status);
			expect(res.body).toEqual({ version: 'v-test' });
		});
	});
};

const testGetTiles = () => {
	describe('Get tiles', () => {
		const {
			users,
			teamspace,
			project,
			container,
		} = generateBasicData();

		const {
			users: usersNoHere,
			teamspace: teamspaceNoHere,
			project: projectNoHere,
			container: containerNoHere,
		} = generateBasicData();

		beforeAll(async () => {
			await setupBasicData(users, teamspace, project, container, true);
			await setupBasicData(usersNoHere, teamspaceNoHere, projectNoHere, containerNoHere, false);
		});

		afterEach(() => {
			jest.restoreAllMocks();
		});

		const endpoints = [
			{ name: 'OSM', path: '/osm/tiles', method: 'getOSMTile' },
			{ name: 'HERE default', path: '/here/default/tiles', method: 'getHereDefaultTile' },
			{ name: 'HERE aerial', path: '/here/aerial/tiles', method: 'getHereAerialTile' },
			{ name: 'HERE traffic', path: '/here/traffic/tiles', method: 'getHereTrafficTile' },
			{ name: 'HERE traffic flow', path: '/here/trafficflow/tiles', method: 'getHereTrafficFlowTile' },
			{ name: 'HERE terrain', path: '/here/terrain/tiles', method: 'getHereTerrainTile' },
			{ name: 'HERE hybrid', path: '/here/hybrid/tiles', method: 'getHereHybridTile' },
			{ name: 'HERE grey', path: '/here/grey/tiles', method: 'getHereGreyTile' },
			{ name: 'HERE truck restrictions', path: '/here/truck/tiles', method: 'getHereTruckRestrictionsTile' },
			{ name: 'HERE truck restrictions overlay', path: '/here/truckoverlay/tiles', method: 'getHereTruckRestrictionsOverlayTile' },
			{ name: 'HERE label overlay', path: '/here/labeloverlay/tiles', method: 'getHereLabelOverlayTile' },
			{ name: 'HERE toll zone', path: '/here/tollzone/tiles', method: 'getHereTollZoneTile' },
			{ name: 'HERE POI', path: '/here/poi/tiles', method: 'getHerePOITile' },
		];

		const route = ({
			path,
			ts = teamspace,
			key = users.tsAdmin.apiKey,
			projectId = project.id,
			containerId = container._id,
			query = {
				zoomLevel: 10,
				gridx: 2,
				gridy: 3,
			},
		} = {}) => genRoute({ teamspace: ts, projectId, containerId, path, key, query });

		describe('Endpoint protection and validation', () => {
			test(`should fail with ${templates.notLoggedIn.code} if the user does not have a valid session`, async () => {
				const res = await agent.get(route({ path: '/osm/tiles', key: null })).expect(templates.notLoggedIn.status);
				expect(res.body.code).toEqual(templates.notLoggedIn.code);
			});

			test(`should fail with ${templates.teamspaceNotFound.code} if the user is not a member of the teamspace`, async () => {
				const res = await agent.get(route({ path: '/osm/tiles', key: users.nobody.apiKey })).expect(templates.teamspaceNotFound.status);
				expect(res.body.code).toEqual(templates.teamspaceNotFound.code);
			});

			test(`should fail with ${templates.projectNotFound.code} if the project does not exist`, async () => {
				const res = await agent.get(route({ path: '/osm/tiles', projectId: ServiceHelper.generateRandomString() })).expect(templates.projectNotFound.status);
				expect(res.body.code).toEqual(templates.projectNotFound.code);
			});

			test(`should fail with ${templates.containerNotFound.code} if the container does not exist`, async () => {
				const res = await agent.get(route({ path: '/osm/tiles', containerId: ServiceHelper.generateRandomString() })).expect(templates.containerNotFound.status);
				expect(res.body.code).toEqual(templates.containerNotFound.code);
			});

			test(`should fail with ${templates.notAuthorized.code} if the user does not have access to the container`, async () => {
				const res = await agent.get(route({ path: '/osm/tiles', key: users.noProjectAccess.apiKey })).expect(templates.notAuthorized.status);
				expect(res.body.code).toEqual(templates.notAuthorized.code);
			});

			test(`should fail with ${templates.addOnUnavailable.code} if the HERE add-on is not enabled`, async () => {
				const res = await agent.get(route({
					path: '/osm/tiles',
					ts: teamspaceNoHere,
					projectId: projectNoHere.id,
					containerId: containerNoHere._id,
					key: usersNoHere.tsAdmin.apiKey,
				})).expect(templates.addOnUnavailable.status);
				expect(res.body.code).toEqual(templates.addOnUnavailable.code);
			});

			test(`should fail with ${templates.invalidArguments.code} if map coordinates are invalid`, async () => {
				const res = await agent.get(route({ path: '/osm/tiles', query: { zoomLevel: 'a', gridx: 2 } })).expect(templates.invalidArguments.status);
				expect(res.body.code).toEqual(templates.invalidArguments.code);
			});
		});

		describe.each(endpoints)('$name', ({ name, path, method }) => {
			test('should succeed if all parameters are valid', async () => {
				jest.spyOn(Maps, method).mockResolvedValueOnce(Buffer.from(`${name} tile`));

				const res = await agent.get(route({ path })).expect(templates.ok.status);
				expect(res.headers['content-type']).toContain('image/png');
				expect(Buffer.isBuffer(res.body)).toEqual(true);
				expect(res.body.length).toBeGreaterThan(0);
			});
		});
	});
};

describe(ServiceHelper.determineTestGroup(__filename), () => {
	beforeAll(async () => {
		server = await ServiceHelper.app();
		agent = await SuperTest(server);
	});

	afterAll(() => ServiceHelper.closeApp(server));

	testGetListOfMaps();
	testGetHereInfo();
	testGetTiles();
});
