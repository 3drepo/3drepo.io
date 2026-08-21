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
const { generateRandomNumber, generateRandomString } = require('../../../../../../../../helper/services');
const { src } = require('../../../../../../../../helper/path');
const { createResponseCode } = require('../../../../../../../../../../src/v5/utils/responseCodes');

jest.mock('../../../../../../../../../../src/v5/models/teamspaceSettings');
jest.mock('../../../../../../../../../../src/v5/utils/config');
jest.mock('../../../../../../../../../../src/v5/utils/logger');
jest.mock('../../../../../../../../../../src/v5/utils/responder');

const config = require(`${src}/utils/config`);
const Maps = require(`${src}/middleware/dataConverter/inputs/teamspaces/projects/models/commons/maps`);
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
	describe('Validate map request', () => {
		const teamspace = generateRandomString();
		const validQuery = {
			zoomLevel: Math.floor(generateRandomNumber(0, 20)),
			x: Math.floor(generateRandomNumber(0, 1000)),
			y: Math.floor(generateRandomNumber(0, 1000)),
		};
		const invalidMapProvider = generateRandomString();
		const invalidMapType = 'traffic';

		beforeEach(resetMapMocks);

		describe.each([
			['OSM request is valid', { mapProvider: mapProviders.OSM, mapType: 'default' }, validQuery, true],
			['HERE request is valid and the add-on is enabled', { mapProvider: mapProviders.HERE, mapType: 'default' }, validQuery, true],
			['map provider is not supported', { mapProvider: invalidMapProvider, mapType: 'default' },
				validQuery, false, templates.invalidArguments, undefined, `Unknown map provider: ${invalidMapProvider}`],
			['OSM map type is invalid', { mapProvider: mapProviders.OSM, mapType: invalidMapType },
				validQuery, false, createResponseCode(templates.invalidArguments, `Unknown map type: ${invalidMapType}`)],
			['HERE map type is invalid', { mapProvider: mapProviders.HERE, mapType: invalidMapType },
				validQuery, false, createResponseCode(templates.invalidArguments, `Unknown map type: ${invalidMapType}`)],
			['HERE is not configured', { mapProvider: mapProviders.HERE, mapType: 'default' }, validQuery, false, templates.mapsRequestFailed, { configureHere: false }],
			['OSM is not configured', { mapProvider: mapProviders.OSM, mapType: 'default' }, validQuery, false, templates.mapsRequestFailed, { configureOsm: false }],
			['HERE is configured but the add-on is disabled', { mapProvider: mapProviders.HERE, mapType: 'default' }, validQuery, false, templates.addOnUnavailable, { isHereEnabled: false }],
			['access validation fails before coordinates', { mapProvider: mapProviders.HERE, mapType: 'default' }, { zoomLevel: 'abc' }, false, templates.addOnUnavailable, { isHereEnabled: false }],
			['a required coordinate is missing', { mapProvider: mapProviders.OSM, mapType: 'default' }, { ...validQuery, y: undefined }, false, templates.invalidArguments],
			['a coordinate is not numeric', { mapProvider: mapProviders.OSM, mapType: 'default' }, { ...validQuery, zoomLevel: 'abc' }, false, templates.invalidArguments],
			['a coordinate is negative', { mapProvider: mapProviders.OSM, mapType: 'default' }, { ...validQuery, zoomLevel: -1 }, false, templates.invalidArguments],
			['a coordinate is not an integer', { mapProvider: mapProviders.OSM, mapType: 'default' }, { ...validQuery, zoomLevel: 3.5 }, false, templates.invalidArguments],
		])('', (desc, params, query, success, expectedOutput,
			{ configureHere = true, configureOsm = true, isHereEnabled = true } = {}, expectedMessage) => {
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
						res, expect.objectContaining({
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
