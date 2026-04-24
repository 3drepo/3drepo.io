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
const { get } = require(`${src}/utils/webRequests`);

jest.mock('../../../../../src/v5/utils/config');
const config = require(`${src}/utils/config`);

const OSMService = require(`${src}/services/maps/osm`);

const testGetTitle = () => {
	describe('Get OSM Tile', () => {
		const zoomLevel = generateRandomNumber();
		const gridx = generateRandomNumber();
		const gridy = generateRandomNumber();
		test('Should return OSM tile', async () => {
			await OSMService.getTile(zoomLevel, gridx, gridy);

			expect(get).toHaveBeenCalledTimes(1);
			expect(get).toHaveBeenCalledWith(
				expect.stringContaining(`a.tile.openstreetmap.org/${zoomLevel}/${gridx}/${gridy}.png`),
			);
		});

		test('Should return OSM tile with custom config', async () => {
			config.osm = {
				domain: generateRandomString(),
				prefix: generateRandomString(),
				key: generateRandomString(),
			};
			await OSMService.getTile(zoomLevel, gridx, gridy);
			expect(get).toHaveBeenCalledTimes(1);
			expect(get).toHaveBeenCalledWith(`https://${config.osm.domain}/${config.osm.prefix}/${zoomLevel}/${gridx}/${gridy}.png?key=${config.osm.key}`);
		});
	});
};

describe(determineTestGroup('OSM Service'), () => {
	testGetTitle();
});
