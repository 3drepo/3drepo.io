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

const { determineTestGroup } = require('../../../../../../helper/services');

const Maps = require(`${src}/processors/teamspaces/projects/models/commons/maps`);

jest.mock('../../../../../../../../src/v5/utils/config');
const config = require(`${src}/utils/config`);

jest.mock('../../../../../../../../src/v5/models/teamspaceSettings');
const TeamspaceSettings = require(`${src}/models/teamspaceSettings`);

jest.mock('../../../../../../../../src/v5/services/maps/here');
const HereService = require(`${src}/services/maps/here`);

jest.mock('../../../../../../../../src/v5/services/maps/osm');
const OSMService = require(`${src}/services/maps/osm`);

const testGetListOfMaps = () => {
	describe('Get list of maps', () => {
		test('should return only Open Street Map if HERE add-on is not enabled', async () => {
			config.here = { };
			const teamspace = 'testTeamspace';
			const maps = Maps.getListOfMaps(teamspace);
			expect(maps).toEqual([
				{ name: 'Open Street Map', layers: [{ name: 'Map Tiles', source: 'OSM' }] },
			]);
		});

		test('should return all maps if HERE add-on is enabled and config is set', async () => {
			config.here = { apiKey: 'testApiKey' };
			TeamspaceSettings.isAddOnModuleEnabled.mockResolvedValueOnce(true);
			const teamspace = 'testTeamspace';
			const maps = Maps.getListOfMaps(teamspace);
			expect(maps).toEqual([
				{ name: 'Open Street Map', layers: [{ name: 'Map Tiles', source: 'OSM' }] },
				{ name: 'Here',
					layers: [
						{ name: 'Map Tiles', source: 'HERE' },
						{ name: 'Traffic Flow', source: 'HERE_TRAFFIC_FLOW' },
						{ name: 'Truck Restrictions', source: 'HERE_TRUCK_OVERLAY' },
					] },
				{ name: 'Here (Terrain)',
					layers: [
						{ name: 'Map Tiles', source: 'HERE_TERRAIN' },
						{ name: 'Traffic Flow', source: 'HERE_TRAFFIC_FLOW' },
						{ name: 'Truck Restrictions', source: 'HERE_TRUCK_OVERLAY' },
					] },
				{ name: 'Here (Satellite)',
					layers: [
						{ name: 'Aerial Imagery', source: 'HERE_AERIAL' },
						{ name: 'Traffic Flow', source: 'HERE_TRAFFIC_FLOW' },
						{ name: 'Truck Restrictions', source: 'HERE_TRUCK_OVERLAY' },
					] },
				{ name: 'Here (Hybrid)',
					layers: [
						{ name: 'Map Tiles', source: 'HERE_HYBRID' },
						{ name: 'Traffic Flow', source: 'HERE_TRAFFIC_FLOW' },
						{ name: 'Truck Restrictions', source: 'HERE_TRUCK_OVERLAY' },
					] },
				{ name: 'Here (Street)',
					layers: [
						{ name: 'Map Tiles', source: 'HERE_STREET' },
						{ name: 'Traffic Flow', source: 'HERE_TRAFFIC_FLOW' },
						{ name: 'Truck Restrictions', source: 'HERE_TRUCK_OVERLAY' },
					] },
				{ name: 'Here (Toll Zone)',
					layers: [
						{ name: 'Map Tiles', source: 'HERE_TOLL_ZONE' },
						{ name: 'Traffic Flow', source: 'HERE_TRAFFIC_FLOW' },
						{ name: 'Truck Restrictions', source: 'HERE_TRUCK_OVERLAY' },
					] },
				{ name: 'Here (POI)',
					layers: [
						{ name: 'Map Tiles', source: 'HERE_POI' },
						{ name: 'Traffic Flow', source: 'HERE_TRAFFIC_FLOW' },
						{ name: 'Truck Restrictions', source: 'HERE_TRUCK_OVERLAY' },
					] },
			]);
		});
	});
};

const testGetHereBaseInfo = () => {
	describe('Get HERE base info', () => {
		test('should return base info from HERE service', async () => {
			const mockBaseInfo = { version: '1.0', features: ['feature1', 'feature2'] };
			HereService.getBaseInfo.mockResolvedValueOnce(mockBaseInfo);
			const baseInfo = await Maps.getHereBaseInfo();
			expect(HereService.getBaseInfo).toHaveBeenCalled();
			expect(baseInfo).toEqual(mockBaseInfo);
		});
	});
};

const testGetOSMTile = () => {
	describe('Get OSM tile', () => {
		test('should return OSM tile data', async () => {
			OSMService.getTile.mockResolvedValueOnce('tileData');
			const tileData = await Maps.getOSMTile(10, 5, 5);
			expect(OSMService.getTile).toHaveBeenCalled();
			expect(OSMService.getTile).toHaveBeenCalledWith(10, 5, 5);
			expect(tileData).toEqual('tileData');
		});
	});
};

const testGetHereDefaultTile = () => {
	describe('Get HERE default tile', () => {
		test('should return HERE default tile data', async () => {
			HereService.getTile.mockResolvedValueOnce('defaultTileData');
			const tileData = await Maps.getHereDefaultTile(10, 5, 5);
			expect(HereService.getTile).toHaveBeenCalled();
			expect(HereService.getTile).toHaveBeenCalledWith(10, 5, 5);
			expect(tileData).toEqual('defaultTileData');
		});
	});
};

const testGetHereAerialTile = () => {
	describe('Get HERE aerial tile', () => {
		test('should return HERE aerial tile data', async () => {
			HereService.getAerialTile.mockResolvedValueOnce('aerialTileData');
			const tileData = await Maps.getHereAerialTile(10, 5, 5);
			expect(HereService.getAerialTile).toHaveBeenCalled();
			expect(HereService.getAerialTile).toHaveBeenCalledWith(10, 5, 5);
			expect(tileData).toEqual('aerialTileData');
		});
	});
};

const testGetHereTrafficTile = () => {
	describe('Get HERE traffic tile', () => {
		test('should return HERE traffic tile data', async () => {
			HereService.getTrafficTile.mockResolvedValueOnce('trafficTileData');
			const tileData = await Maps.getHereTrafficTile(10, 5, 5);
			expect(HereService.getTrafficTile).toHaveBeenCalled();
			expect(HereService.getTrafficTile).toHaveBeenCalledWith(10, 5, 5);
			expect(tileData).toEqual('trafficTileData');
		});
	});
};

const testGetHereTrafficFlowTile = () => {
	describe('Get HERE traffic flow tile', () => {
		test('should return HERE traffic flow tile data', async () => {
			HereService.getTrafficFlowTile.mockResolvedValueOnce('trafficFlowTileData');
			const tileData = await Maps.getHereTrafficFlowTile(10, 5, 5);
			expect(HereService.getTrafficFlowTile).toHaveBeenCalled();
			expect(HereService.getTrafficFlowTile).toHaveBeenCalledWith(10, 5, 5);
			expect(tileData).toEqual('trafficFlowTileData');
		});
	});
};

const testGetHereTerrainTile = () => {
	describe('Get HERE terrain tile', () => {
		test('should return HERE terrain tile data', async () => {
			HereService.getTerrainTile.mockResolvedValueOnce('terrainTileData');
			const tileData = await Maps.getHereTerrainTile(10, 5, 5);
			expect(HereService.getTerrainTile).toHaveBeenCalled();
			expect(HereService.getTerrainTile).toHaveBeenCalledWith(10, 5, 5);
			expect(tileData).toEqual('terrainTileData');
		});
	});
};

const testGetHereHybridTile = () => {
	describe('Get HERE hybrid tile', () => {
		test('should return HERE hybrid tile data', async () => {
			HereService.getHybridTile.mockResolvedValueOnce('hybridTileData');
			const tileData = await Maps.getHereHybridTile(10, 5, 5);
			expect(HereService.getHybridTile).toHaveBeenCalled();
			expect(HereService.getHybridTile).toHaveBeenCalledWith(10, 5, 5);
			expect(tileData).toEqual('hybridTileData');
		});
	});
};

const testGetHereGreyTile = () => {
	describe('Get HERE grey tile', () => {
		test('should return HERE grey tile data', async () => {
			HereService.getGreyTile.mockResolvedValueOnce('greyTileData');
			const tileData = await Maps.getHereGreyTile(10, 5, 5);
			expect(HereService.getGreyTile).toHaveBeenCalled();
			expect(HereService.getGreyTile).toHaveBeenCalledWith(10, 5, 5);
			expect(tileData).toEqual('greyTileData');
		});
	});
};

const testGetHereTruckRestrictionsTile = () => {
	describe('Get HERE truck restrictions tile', () => {
		test('should return HERE truck restrictions tile data', async () => {
			HereService.getTruckRestrictionsTile.mockResolvedValueOnce('truckRestrictionsTileData');
			const tileData = await Maps.getHereTruckRestrictionsTile(10, 5, 5);
			expect(HereService.getTruckRestrictionsTile).toHaveBeenCalled();
			expect(HereService.getTruckRestrictionsTile).toHaveBeenCalledWith(10, 5, 5);
			expect(tileData).toEqual('truckRestrictionsTileData');
		});
	});
};

const testGetHereTruckRestrictionsOverlayTile = () => {
	describe('Get HERE truck restrictions overlay tile', () => {
		test('should return HERE truck restrictions overlay tile data', async () => {
			HereService.getTruckRestrictionsOverlayTile.mockResolvedValueOnce('truckRestrictionsOverlayTileData');
			const tileData = await Maps.getHereTruckRestrictionsOverlayTile(10, 5, 5);
			expect(HereService.getTruckRestrictionsOverlayTile).toHaveBeenCalled();
			expect(HereService.getTruckRestrictionsOverlayTile).toHaveBeenCalledWith(10, 5, 5);
			expect(tileData).toEqual('truckRestrictionsOverlayTileData');
		});
	});
};

const testGetHereLabelOverlayTile = () => {
	describe('Get HERE label overlay tile', () => {
		test('should return HERE label overlay tile data', async () => {
			HereService.getLabelOverlayTile.mockResolvedValueOnce('labelOverlayTileData');
			const tileData = await Maps.getHereLabelOverlayTile(10, 5, 5);
			expect(HereService.getLabelOverlayTile).toHaveBeenCalled();
			expect(HereService.getLabelOverlayTile).toHaveBeenCalledWith(10, 5, 5);
			expect(tileData).toEqual('labelOverlayTileData');
		});
	});
};

const testGetHereTollZoneTile = () => {
	describe('Get HERE toll zone tile', () => {
		test('should return HERE toll zone tile data', async () => {
			HereService.getTollZoneTile.mockResolvedValueOnce('tollZoneTileData');
			const tileData = await Maps.getHereTollZoneTile(10, 5, 5);
			expect(HereService.getTollZoneTile).toHaveBeenCalled();
			expect(HereService.getTollZoneTile).toHaveBeenCalledWith(10, 5, 5);
			expect(tileData).toEqual('tollZoneTileData');
		});
	});
};

const testGetHerePOITile = () => {
	describe('Get HERE POI tile', () => {
		test('should return HERE POI tile data', async () => {
			HereService.getPOITile.mockResolvedValueOnce('poiTileData');
			const tileData = await Maps.getHerePOITile(10, 5, 5);
			expect(HereService.getPOITile).toHaveBeenCalled();
			expect(HereService.getPOITile).toHaveBeenCalledWith(10, 5, 5);
			expect(tileData).toEqual('poiTileData');
		});
	});
};

describe(determineTestGroup(__filename), () => {
	testGetListOfMaps();
	testGetHereBaseInfo();
	testGetOSMTile();
	testGetHereDefaultTile();
	testGetHereAerialTile();
	testGetHereTrafficTile();
	testGetHereTrafficFlowTile();
	testGetHereTerrainTile();
	testGetHereHybridTile();
	testGetHereGreyTile();
	testGetHereTruckRestrictionsTile();
	testGetHereTruckRestrictionsOverlayTile();
	testGetHereLabelOverlayTile();
	testGetHereTollZoneTile();
	testGetHerePOITile();
});
