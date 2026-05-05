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

const { determineTestGroup, generateRandomString, generateRandomNumber } = require('../../../helper/services');

jest.mock('../../../../../src/v5/utils/webRequests');
const { getArrayBuffer } = require(`${src}/utils/webRequests`);

jest.mock('../../../../../src/v5/utils/logger');
const { logger } = require(`${src}/utils/logger`);

jest.mock('../../../../../src/v5/utils/config');
const config = require(`${src}/utils/config`);

const OSMService = require(`${src}/services/maps/osm`);
const { templates } = require(`${src}/utils/responseCodes`);

const testGetTitle = () => {
	describe('Get OSM Tile', () => {
		const zoomLevel = generateRandomNumber();
		const gridx = generateRandomNumber();
		const gridy = generateRandomNumber();
		test('Should return OSM tile', async () => {
			getArrayBuffer.mockResolvedValueOnce({ data: Buffer.from('test') });
			await OSMService.getTile(zoomLevel, gridx, gridy);

			expect(getArrayBuffer).toHaveBeenCalledTimes(1);
			expect(getArrayBuffer).toHaveBeenCalledWith(
				expect.stringContaining(`a.tile.openstreetmap.org/${zoomLevel}/${gridx}/${gridy}.png`),
			);
		});

		test('Should return OSM tile with custom config', async () => {
			getArrayBuffer.mockResolvedValueOnce({ data: Buffer.from('test') });

			config.osm = {
				domain: generateRandomString(),
				prefix: generateRandomString(),
				key: generateRandomString(),
			};
			await OSMService.getTile(zoomLevel, gridx, gridy);
			expect(getArrayBuffer).toHaveBeenCalledTimes(1);
			expect(getArrayBuffer).toHaveBeenCalledWith(`https://${config.osm.domain}/${config.osm.prefix}/${zoomLevel}/${gridx}/${gridy}.png?key=${config.osm.key}`);
		});
		test('Should throw error if request fails', async () => {
			getArrayBuffer.mockRejectedValueOnce(new Error('Request failed'));
			await expect(OSMService.getTile(zoomLevel, gridx, gridy)).rejects.toEqual(templates.mapsRequestFailed);
			expect(logger.logError).toHaveBeenCalledWith(expect.stringContaining('Failed to get OSM tile:'));
			expect(logger.logError).toHaveBeenCalledTimes(1);
		});
	});
};

describe(determineTestGroup(__filename), () => {
	testGetTitle();
});
