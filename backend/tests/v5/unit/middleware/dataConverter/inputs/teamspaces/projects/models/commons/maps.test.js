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

const { determineTestGroup } = require('../../../../../../../../helper/utils');
const { generateRandomString } = require('../../../../../../../../helper/services');
const { src } = require('../../../../../../../../helper/path');

jest.mock('../../../../../../../../../../src/v5/models/teamspaceSettings');
jest.mock('../../../../../../../../../../src/v5/utils/config');
jest.mock('../../../../../../../../../../src/v5/utils/logger');
jest.mock('../../../../../../../../../../src/v5/utils/responder');

const config = require(`${src}/utils/config`);
const HereService = require(`${src}/services/maps/here`);
const Maps = require(`${src}/middleware/dataConverter/inputs/teamspaces/projects/models/commons/maps`);
const OSMService = require(`${src}/services/maps/osm`);
const { mapProviders } = require(`${src}/services/maps/maps.constants`);
const Responder = require(`${src}/utils/responder`);
const TeamspaceSettings = require(`${src}/models/teamspaceSettings`);
const { templates } = require(`${src}/utils/responseCodes`);

const configureMapProviders = ({ configureHere = false, configureOsm = false } = {}) => {
	if (configureHere) {
		config[mapProviders.HERE] = { apiKey: generateRandomString() };
	}

	if (configureOsm) {
		config[mapProviders.OSM] = {
			domain: generateRandomString(),
			prefix: generateRandomString(),
			key: generateRandomString(),
		};
	}
};

const resetMapMocks = () => {
	jest.resetAllMocks();
	delete config[mapProviders.HERE];
	delete config[mapProviders.OSM];
};

const testValidateMapRequest = () => {
	describe('validateMapRequest', () => {
		const teamspace = generateRandomString();
		const validQuery = { zoomLevel: 3, x: 10, y: 20 };
		const invalidMapProvider = generateRandomString();
		const invalidMapType = 'traffic';

		const tests = [
			['OSM request is valid', { mapProvider: mapProviders.OSM, mapType: 'default' }, validQuery, true, null, { configureOsm: true }],
			['HERE request is valid and the add-on is enabled', { mapProvider: mapProviders.HERE, mapType: 'default' }, validQuery, true, null, { configureHere: true }],
			['map provider is not supported', { mapProvider: invalidMapProvider, mapType: 'default' },
				validQuery, false, templates.invalidArguments, {}, `Unknown map provider: ${invalidMapProvider}`],
			['OSM map type is invalid', { mapProvider: mapProviders.OSM, mapType: invalidMapType },
				validQuery, false, templates.invalidArguments, { configureOsm: true }, `Unknown map type: ${invalidMapType}`],
			['HERE map type is invalid', { mapProvider: mapProviders.HERE, mapType: invalidMapType },
				validQuery, false, templates.invalidArguments, { configureHere: true }, `Unknown map type: ${invalidMapType}`],
			['HERE is not configured', { mapProvider: mapProviders.HERE, mapType: 'default' }, validQuery, false, templates.mapsRequestFailed],
			['OSM is not configured', { mapProvider: mapProviders.OSM, mapType: 'default' }, validQuery, false, templates.mapsRequestFailed],
			['HERE is configured but the add-on is disabled', { mapProvider: mapProviders.HERE, mapType: 'default' }, validQuery, false, templates.addOnUnavailable, { configureHere: true, isHereEnabled: false }],
			['access validation fails before coordinates', { mapProvider: mapProviders.HERE, mapType: 'default' }, { zoomLevel: 'abc' }, false, templates.addOnUnavailable, { configureHere: true, isHereEnabled: false }],
			['a required coordinate is missing', { mapProvider: mapProviders.OSM, mapType: 'default' }, { zoomLevel: 3, x: 10 }, false, templates.invalidArguments, { configureOsm: true }],
			['a coordinate is not numeric', { mapProvider: mapProviders.OSM, mapType: 'default' }, { zoomLevel: 'abc', x: 10, y: 20 }, false, templates.invalidArguments, { configureOsm: true }],
			['a coordinate is negative', { mapProvider: mapProviders.OSM, mapType: 'default' }, { zoomLevel: -1, x: 10, y: 20 }, false, templates.invalidArguments, { configureOsm: true }],
			['a coordinate is not an integer', { mapProvider: mapProviders.OSM, mapType: 'default' }, { zoomLevel: 3.5, x: 10, y: 20 }, false, templates.invalidArguments, { configureOsm: true }],
		];

		beforeEach(resetMapMocks);

		describe.each([
			['HERE', mapProviders.HERE, HereService],
			['OSM', mapProviders.OSM, OSMService],
		])('%s map type validation', (desc, mapProvider, service) => {
			test('should delegate map type validation to the map service', async () => {
				const req = { params: { teamspace, mapProvider, mapType: 'default' }, query: validQuery };
				const res = {};
				const next = jest.fn(async () => { });
				const isValidMapType = jest.spyOn(service, 'isValidMapType').mockReturnValueOnce(false);

				Responder.respond.mockResolvedValueOnce();

				try {
					await Maps.validateMapRequest(req, res, next);

					expect(isValidMapType).toHaveBeenCalledTimes(1);
					expect(isValidMapType).toHaveBeenCalledWith('default');
					expect(next).not.toHaveBeenCalled();
					expect(Responder.respond).toHaveBeenCalledWith(
						req,
						res,
						expect.objectContaining({
							code: templates.invalidArguments.code,
							message: 'Unknown map type: default',
						}),
					);
				} finally {
					isValidMapType.mockRestore();
				}
			});
		});

		describe.each(tests)('', (desc, params, query, success, expectedOutput,
			{ configureHere = false, configureOsm = false, isHereEnabled = true } = {}, expectedMessage) => {
			test(`should ${success ? 'call next()' : `respond with ${expectedOutput.code}`} when ${desc}`, async () => {
				const req = { params: { teamspace, ...params }, query };
				const res = {};
				const next = jest.fn(async () => { });

				TeamspaceSettings.isAddOnEnabled.mockResolvedValueOnce(isHereEnabled);

				configureMapProviders({ configureHere, configureOsm });

				if (!success) {
					Responder.respond.mockResolvedValueOnce();
				}

				await Maps.validateMapRequest(req, res, next);

				if (success) {
					expect(next).toHaveBeenCalledTimes(1);
					expect(Responder.respond).not.toHaveBeenCalled();
				} else {
					expect(next).not.toHaveBeenCalled();
					expect(Responder.respond).toHaveBeenCalledTimes(1);
					expect(Responder.respond).toHaveBeenCalledWith(
						req,
						res,
						expect.objectContaining({
							code: expectedOutput.code,
							...(expectedMessage ? { message: expectedMessage } : {}),
						}),
					);
				}
			});
		});
	});
};

describe(determineTestGroup(__filename), () => {
	testValidateMapRequest();
});
