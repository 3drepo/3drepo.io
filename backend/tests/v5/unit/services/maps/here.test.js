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

jest.mock('../../../../../src/v5/utils/webRequests');
const { getArrayBuffer } = require(`${src}/utils/webRequests`);

jest.mock('../../../../../src/v5/utils/config');
const config = require(`${src}/utils/config`);

const HereService = require(`${src}/services/maps/here`);
const { mapTypes } = require(`${src}/services/maps/here.constants`);
const { templates } = require(`${src}/utils/responseCodes`);

const testGetAvailableMaps = () => {
	describe('Get Available Maps', () => {
		test('should return available maps with correct structure', () => {
			const arrayOfMaps = [{ name: 'Here',
				layers: [
					{ name: 'Map Tiles', source: 'HERE' },
					{ name: 'Traffic Flow', source: 'HERE_TRAFFIC_FLOW', mapType: mapTypes.TRAFFIC_FLOW },
					{ name: 'Truck Restrictions', source: 'HERE_TRUCK_OVERLAY', mapType: mapTypes.TRUCK_OVERLAY },
				] },
			{ name: 'Here (Terrain)',
				layers: [
					{ name: 'Map Tiles', source: 'HERE_TERRAIN' },
					{ name: 'Traffic Flow', source: 'HERE_TRAFFIC_FLOW', mapType: mapTypes.TRAFFIC_FLOW },
					{ name: 'Truck Restrictions', source: 'HERE_TRUCK_OVERLAY', mapType: mapTypes.TRUCK_OVERLAY },
				] },
			{ name: 'Here (Satellite)',
				layers: [
					{ name: 'Map Tiles', source: 'HERE_AERIAL' },
					{ name: 'Traffic Flow', source: 'HERE_TRAFFIC_FLOW', mapType: mapTypes.TRAFFIC_FLOW },
					{ name: 'Truck Restrictions', source: 'HERE_TRUCK_OVERLAY', mapType: mapTypes.TRUCK_OVERLAY },
				] },
			{ name: 'Here (Hybrid)',
				layers: [
					{ name: 'Map Tiles', source: 'HERE_HYBRID' },
					{ name: 'Traffic Flow', source: 'HERE_TRAFFIC_FLOW', mapType: mapTypes.TRAFFIC_FLOW },
					{ name: 'Truck Restrictions', source: 'HERE_TRUCK_OVERLAY', mapType: mapTypes.TRUCK_OVERLAY },
				] },
			{ name: 'Here (STREET)',
				layers: [
					{ name: 'Map Tiles', source: 'HERE_GREY' },
					{ name: 'Traffic Flow', source: 'HERE_TRAFFIC_FLOW', mapType: mapTypes.TRAFFIC_FLOW },
					{ name: 'Truck Restrictions', source: 'HERE_TRUCK_OVERLAY', mapType: mapTypes.TRUCK_OVERLAY },
				] },
			{ name: 'Here (Toll Zones)',
				layers: [
					{ name: 'Map Tiles', source: 'HERE_TOLL_ZONE' },
					{ name: 'Traffic Flow', source: 'HERE_TRAFFIC_FLOW', mapType: mapTypes.TRAFFIC_FLOW },
					{ name: 'Truck Restrictions', source: 'HERE_TRUCK_OVERLAY', mapType: mapTypes.TRUCK_OVERLAY },
				] },
			{ name: 'Here (POI)',
				layers: [
					{ name: 'Map Tiles', source: 'HERE_POI' },
					{ name: 'Traffic Flow', source: 'HERE_TRAFFIC_FLOW', mapType: mapTypes.TRAFFIC_FLOW },
					{ name: 'Truck Restrictions', source: 'HERE_TRUCK_OVERLAY', mapType: mapTypes.TRUCK_OVERLAY },
				] },
			];
			const maps = HereService.getAvailableMaps();
			expect(Array.isArray(maps)).toBe(true);
			outOfOrderArrayEqual(maps, arrayOfMaps);
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
			beforeEach(() => {
				jest.resetAllMocks();
				config.here = { apiKey: generateRandomString() };
			});

			describe.each(tests)('', (desc, { domain = 'maps.hereapi.com', mapType, tileLayer = 'base', queryParams = {} }, success, expectedOutput) => {
				test(`should ${success ? 'return tile data' : `throw ${expectedOutput.code}`} when ${desc}`, async () => {
					if (success) {
						const query = new URLSearchParams({
							apiKey: config.here.apiKey,
							...queryParams,
						});

						getArrayBuffer.mockResolvedValueOnce({ data: 'tile data' });

						const tile = await HereService.getTile(mapType, zoomLevel, x, y);
						expect(tile).toBe('tile data');
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
			expect(HereService.isValidMapType(mapTypes.DEFAULT)).toBe(true);
			expect(HereService.isValidMapType(mapTypes.TERRAIN)).toBe(true);
		});

		test('should return false if the map type is not supported', () => {
			expect(HereService.isValidMapType('invalid_type')).toBe(false);
		});
	});
};

describe(determineTestGroup(__filename), () => {
	testGetAvailableMaps();
	testGetTile();
	testIsValidMapType();
});
