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

const { determineTestGroup, generateRandomNumber } = require('../../../helper/services');

jest.mock('../../../../../src/v5/utils/webRequests');
const { getArrayBuffer } = require(`${src}/utils/webRequests`);

jest.mock('../../../../../src/v5/utils/logger');
const { logger } = require(`${src}/utils/logger`);

jest.mock('../../../../../src/v5/utils/config');
const config = require(`${src}/utils/config`);

const OSMService = require(`${src}/services/maps/osm`);
const { templates } = require(`${src}/utils/responseCodes`);

const testGetAvailableMaps = () => {
	describe('Get Available Maps', () => {
		test('should return available maps with correct structure', () => {
			const maps = OSMService.getAvailableMaps();
			expect(maps).toEqual([
				{ name: 'Open Street Map',
					layers: [
						{ name: 'Map Tiles', source: 'OSM' },
					],
				},
			]);
		});
	});
};

const testGetTitle = () => {
	describe('Get OSM Tile', () => {
		const zoomLevel = generateRandomNumber();
		const x = generateRandomNumber();
		const y = generateRandomNumber();
		test('should return tile data for valid request', async () => {
			const tileData = new ArrayBuffer(8);
			config.osm = { domain: 'osm.com', prefix: '/tiles', key: 'testKey' };
			getArrayBuffer.mockResolvedValueOnce({ data: tileData });
			const result = await OSMService.getTile('default', zoomLevel, x, y);
			expect(result).toBe(tileData);
			expect(getArrayBuffer).toHaveBeenCalledWith(
				`https://osm.com/tiles/${zoomLevel}/${x}/${y}.png?key=testKey`,
			);
		});

		test('should throw an error if OSM config is missing', async () => {
			config.osm = null;
			await expect(OSMService.getTile('default', zoomLevel, x, y)).rejects.toEqual(templates.mapsRequestFailed);
			expect(logger.logError).toHaveBeenCalled();
		});

		test('should throw an error if web request fails', async () => {
			config.osm = { domain: 'osm.com', prefix: '/tiles', key: 'testKey' };
			getArrayBuffer.mockRejectedValueOnce({ response: { data: 'Error message' } });
			await expect(OSMService.getTile('default', zoomLevel, x, y)).rejects.toEqual(templates.mapsRequestFailed);
			expect(logger.logError).toHaveBeenCalledWith('Failed to get OSM tile: Error message ');
		});

		test('should throw an error for invalid map type', async () => {
			await expect(() => OSMService.getTile('invalidType', zoomLevel, x, y)).toThrow(templates.invalidArguments);
		});
	});
};

describe(determineTestGroup(__filename), () => {
	testGetAvailableMaps();
	testGetTitle();
});
