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

const { src } = require('../../../helper/path');
const { determineTestGroup } = require('../../../helper/utils');
const { generateRandomString } = require('../../../helper/services');

jest.mock('../../../../../src/v5/utils/config');
const config = require(`${src}/utils/config`);

jest.mock('../../../../../src/v5/models/teamspaceSettings');
const TeamspaceSettings = require(`${src}/models/teamspaceSettings`);

jest.mock('../../../../../src/v5/utils/responder');
const Responder = require(`${src}/utils/responder`);

const { mapProviders } = require(`${src}/services/maps/maps.constants`);
const { templates } = require(`${src}/utils/responseCodes`);

const MapsMiddleware = require(`${src}/middleware/maps`);

Responder.respond.mockImplementation((req, res, errCode) => errCode);

const testHasMapProviderAccessToModel = () => {
	describe('hasMapProviderAccessToModel', () => {
		const teamspace = generateRandomString();

		const tests = [
			['map provider is not supported', { mapProvider: generateRandomString() }, false, templates.invalidArguments],
			['HERE is not configured', { mapProvider: mapProviders.HERE }, false, templates.mapsRequestFailed],
			['OSM is not configured', { mapProvider: mapProviders.OSM }, false, templates.mapsRequestFailed],
			['HERE is configured and add-on is enabled', { mapProvider: mapProviders.HERE }, true, null, { configureHere: true }],
			['HERE is configured but add-on is disabled', { mapProvider: mapProviders.HERE }, false, templates.addOnUnavailable, { configureHere: true, isHereEnabled: false }],
			['OSM is configured', { mapProvider: mapProviders.OSM }, true, null, { configureOsm: true }],
		];

		beforeEach(() => jest.resetAllMocks());
		describe.each(tests)('', (desc, params, success, expectedOutput, { configureHere = false, configureOsm = false, isHereEnabled = true } = {}) => {
			test(`should ${success ? 'call next()' : `respond with ${expectedOutput.code}`} when ${desc}`, async () => {
				TeamspaceSettings.isAddOnEnabled.mockResolvedValueOnce(isHereEnabled);

				const req = { params: { teamspace, ...params } };
				const res = {};
				const next = jest.fn();

				if (configureHere) {
					config[mapProviders.HERE] = { apiKey: generateRandomString() };
				}
				if (configureOsm) {
					config[mapProviders.OSM] = { domain: generateRandomString() };
				}

				if (!success) {
					Responder.respond.mockResolvedValueOnce();
				}

				await MapsMiddleware.hasMapProviderAccessToModel(
					{ params: { ...req.params, ...params } },
					res,
					next,
				);
				if (success) {
					expect(next).toHaveBeenCalledTimes(1);
					expect(Responder.respond).not.toHaveBeenCalled();
				} else {
					expect(next).not.toHaveBeenCalled();
					expect(Responder.respond).toHaveBeenCalledTimes(1);
					expect(Responder.respond).toHaveBeenCalledWith(
						expect.objectContaining(req),
						res,
						expectedOutput,
					);
				}
			});
		});
	});
};

describe(determineTestGroup(__filename), () => {
	testHasMapProviderAccessToModel();
});
