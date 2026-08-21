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

const { generateRandomString, generateRandomNumber, outOfOrderArrayEqual } = require('../../../helper/services');
const { opaqueTiles, overlayTiles } = require('../../../../../src/v5/services/maps/here.constants');

jest.mock('../../../../../src/v5/utils/webRequests');
const { getArrayBuffer } = require(`${src}/utils/webRequests`);

jest.mock('../../../../../src/v5/utils/config');
const config = require(`${src}/utils/config`);

const HereService = require(`${src}/services/maps/here`);
const { mapTypes } = require(`${src}/services/maps/here.constants`);
const { mapProviders } = require(`${src}/services/maps/maps.constants`);
const { templates } = require(`${src}/utils/responseCodes`);

const testGetAvailableMaps = () => {
	describe('Get Available Maps', () => {
		test('should return available maps with correct structure', () => {
			const expectedMaps = opaqueTiles.map(({ name, mapType }) => ({
				name,
				layers: [
					{ name: 'Map Tiles', mapType },
					...overlayTiles.map((data) => data),
				].map(({ name: layerName, mapType: layerMapType }) => ({
					name: layerName,
					source: `${mapProviders.HERE}/${layerMapType}`,
				})),
			}));
			const maps = HereService.getAvailableMaps();
			expect(Array.isArray(maps)).toBe(true);
			outOfOrderArrayEqual(maps, expectedMaps);
		});
	});
};

const testGetTile = () => {
	describe('Get Here Tile', () => {
		const zoomLevel = generateRandomNumber();
		const x = generateRandomNumber();
		const y = generateRandomNumber();

		const tests = [
			['map type is valid (default)', { mapType: 'default', tileLayer: 'base' }, true, null],
			// truckoverlay uses only features without style
			['tile config has features only', { mapType: 'truckoverlay', tileLayer: 'blank', queryParams: { features: 'vehicle_restrictions:active_and_inactive' } }, true, null],
			// grey uses only style without features
			['tile config has style only', { mapType: 'grey', tileLayer: 'base', queryParams: { style: 'lite.day' } }, true, null],
			['traffic flow uses the HERE traffic domain', { mapType: 'trafficflow', domain: 'traffic.maps.hereapi.com', tileLayer: 'flow' }, true, null],
			['map type is invalid', { mapType: 'invalid_type' }, false, templates.mapsRequestFailed],
		];

		const runTests = () => {
			describe.each(tests)('', (desc, { domain = 'maps.hereapi.com', mapType, tileLayer = 'base', queryParams = {} }, success, expectedOutput) => {
				test(`should ${success ? 'return tile data' : `throw ${expectedOutput.code}`} when ${desc}`, async () => {
					config.here = { apiKey: generateRandomString() };
					if (success) {
						const query = new URLSearchParams({
							apiKey: config.here.apiKey,
							...queryParams,
						});

						const expectedData = generateRandomString();
						getArrayBuffer.mockResolvedValueOnce({ data: expectedData });

						const tile = await HereService.getTile(mapType, zoomLevel, x, y);
						expect(tile).toBe(expectedData);
						expect(getArrayBuffer).toHaveBeenCalledTimes(1);
						expect(getArrayBuffer).toHaveBeenCalledWith(
							expect.stringContaining(`https://${domain}/v3/${tileLayer}/mc/${zoomLevel}/${x}/${y}/png8?${query.toString()}`),
						);
					} else {
						await expect(HereService.getTile(mapType, zoomLevel, x, y)).rejects.toEqual(expectedOutput);
						expect(getArrayBuffer).not.toHaveBeenCalled();
					}
				});
			});
		};

		runTests();
	});
};

const testIsValidMapType = () => {
	describe('Is valid map type', () => {
		test('should return true if the map type is supported', () => {
			Object.values(mapTypes).forEach((type) => {
				expect(HereService.isValidMapType(type)).toBe(true);
			});
		});

		test('should return false if the map type is not supported', () => {
			expect(HereService.isValidMapType(generateRandomString())).toBe(false);
		});
	});
};

describe(determineTestGroup(__filename), () => {
	testGetAvailableMaps();
	testGetTile();
	testIsValidMapType();
});
