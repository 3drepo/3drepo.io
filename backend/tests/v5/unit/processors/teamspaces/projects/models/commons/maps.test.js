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

const { src } = require('../../../../../../helper/path');

const { determineTestGroup } = require('../../../../../../helper/utils');

const { generateRandomString, generateRandomNumber } = require('../../../../../../helper/services');

const Maps = require(`${src}/processors/teamspaces/projects/models/commons/maps`);
const { ADD_ONS } = require(`${src}/models/teamspaces.constants`);
const { templates } = require(`${src}/utils/responseCodes`);

jest.mock('../../../../../../../../src/v5/models/teamspaceSettings');
const TeamspaceSettings = require(`${src}/models/teamspaceSettings`);

jest.mock('../../../../../../../../src/v5/services/maps/here');
const HereService = require(`${src}/services/maps/here`);

jest.mock('../../../../../../../../src/v5/services/maps/osm');
const OSMService = require(`${src}/services/maps/osm`);

const testGetListOfMaps = () => {
	describe('Get list of maps', () => {
		const teamspace = generateRandomString();
		const OSMMaps = [{ name: 'Open Street Map', layers: [{ name: 'Map Tiles', source: 'OSM' }] }];
		const HereMaps = [
			{ name: 'Here',
				layers: [
					{ name: 'Map Tiles', source: 'HERE' },
					{ name: 'Traffic Flow', source: 'HERE_TRAFFIC_FLOW' },
					{ name: 'Truck Restrictions', source: 'HERE_TRUCK_OVERLAY' },
				] },
		];
		test('should return only Open Street Map if HERE add-on is not enabled', async () => {
			TeamspaceSettings.isAddOnEnabled.mockResolvedValueOnce(false);
			OSMService.getAvailableMaps.mockResolvedValueOnce(OSMMaps);
			const maps = await Maps.getListOfMaps(teamspace);
			expect(maps).toEqual(OSMMaps);

			expect(TeamspaceSettings.isAddOnEnabled).toHaveBeenCalledWith(teamspace, ADD_ONS.HERE);
			expect(OSMService.getAvailableMaps).toHaveBeenCalled();
			expect(HereService.getAvailableMaps).not.toHaveBeenCalled();
		});

		test('should return all maps if HERE add-on is enabled and config is set', async () => {
			TeamspaceSettings.isAddOnEnabled.mockResolvedValueOnce(true);
			OSMService.getAvailableMaps.mockResolvedValueOnce(OSMMaps);
			HereService.getAvailableMaps.mockResolvedValueOnce(HereMaps);
			const maps = await Maps.getListOfMaps(teamspace);
			expect(maps).toEqual([...OSMMaps, ...HereMaps]);

			expect(TeamspaceSettings.isAddOnEnabled).toHaveBeenCalledWith(teamspace, ADD_ONS.HERE);
			expect(OSMService.getAvailableMaps).toHaveBeenCalled();
			expect(HereService.getAvailableMaps).toHaveBeenCalled();
		});
	});
};

const testGetTile = () => {
	describe('Get tile', () => {
		const mapType = generateRandomString();
		const zoomLevel = generateRandomNumber();
		const x = generateRandomNumber();
		const y = generateRandomNumber();
		test('should call HereService.getTile if map provider is HERE', () => {
			const mapProvider = 'here';

			HereService.getTile.mockReturnValueOnce('tile data');
			const tile = Maps.getTile(mapProvider, mapType, zoomLevel, x, y);
			expect(tile).toBe('tile data');
			expect(HereService.getTile).toHaveBeenCalledWith(mapType, zoomLevel, x, y);
		});

		test('should call OSMService.getTile if map provider is OSM', () => {
			const mapProvider = 'osm';

			OSMService.getTile.mockReturnValueOnce('tile data');
			const tile = Maps.getTile(mapProvider, mapType, zoomLevel, x, y);
			expect(tile).toBe('tile data');
			expect(OSMService.getTile).toHaveBeenCalledWith(mapType, zoomLevel, x, y);
		});

		test('should throw an error if map provider is invalid', () => {
			const mapProvider = 'invalid_provider';

			expect(() => Maps.getTile(mapProvider, mapType, zoomLevel, x, y)).toThrow(templates.invalidArguments);
			expect(HereService.getTile).not.toHaveBeenCalled();
			expect(OSMService.getTile).not.toHaveBeenCalled();
		});
	});
};

describe(determineTestGroup(__filename), () => {
	testGetListOfMaps();
	testGetTile();
});
