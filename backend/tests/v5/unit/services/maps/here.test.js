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
const { get, getArrayBuffer } = require(`${src}/utils/webRequests`);

jest.mock('../../../../../src/v5/utils/logger');
const { logger } = require(`${src}/utils/logger`);

jest.mock('../../../../../src/v5/utils/config');
const config = require(`${src}/utils/config`);

const HereService = require(`${src}/services/maps/here`);
const { templates } = require(`${src}/utils/responseCodes`);

beforeEach(() => {
	jest.clearAllMocks();
});

const testGetBaseInfo = () => {
	describe('Get Here Base Info', () => {
		config.here = { apiKey: generateRandomString() };
		test('Should return Here base info', async () => {
			get.mockResolvedValueOnce({ data: { info: 'test' } });
			await expect(
				HereService.getBaseInfo(),
			).resolves.toEqual({ info: 'test' });
			expect(get).toHaveBeenCalledTimes(1);
			expect(get).toHaveBeenCalledWith(
				expect.stringContaining(`maps.hereapi.com/v3/info?apiKey=${config.here.apiKey}`),
			);
		});
		test('Should throw error if request fails', async () => {
			get.mockRejectedValueOnce(new Error('Request failed'));
			await expect(
				HereService.getBaseInfo(),
			).rejects.toEqual(templates.mapsRequestFailed);
			expect(logger.logError).toHaveBeenCalledWith(expect.stringContaining('Failed to get HERE base info:'));
			expect(logger.logError).toHaveBeenCalledTimes(1);
		});
	});
};

const testGetTile = () => {
	describe('Get Here Tile', () => {
		const zoomLevel = generateRandomNumber();
		const x = generateRandomNumber();
		const y = generateRandomNumber();
		test('Should return Here tile', async () => {
			getArrayBuffer.mockResolvedValueOnce({ data: 'tileData' });
			await expect(
				HereService.getTile(zoomLevel, x, y),
			).resolves.toEqual('tileData');
			expect(getArrayBuffer).toHaveBeenCalledTimes(1);
			expect(getArrayBuffer).toHaveBeenCalledWith(
				expect.stringContaining(`maps.hereapi.com/v3/base/mc/${zoomLevel}/${x}/${y}/png8?apiKey=${config.here.apiKey}`),
			);
		});
		test('Should throw error if request fails', async () => {
			getArrayBuffer.mockRejectedValueOnce(new Error('Request failed'));
			await expect(
				HereService.getTile(zoomLevel, x, y),
			).rejects.toEqual(templates.mapsRequestFailed);
			expect(logger.logError).toHaveBeenCalledWith(expect.stringContaining('Failed to get HERE tile:'));
			expect(logger.logError).toHaveBeenCalledTimes(1);
		});
	});
};

const testGetAerialTile = () => {
	describe('Get Here Aerial Tile', () => {
		const zoomLevel = generateRandomNumber();
		const x = generateRandomNumber();
		const y = generateRandomNumber();
		test('Should return Here aerial tile', async () => {
			getArrayBuffer.mockResolvedValueOnce({ data: 'aerialTileData' });
			await expect(
				HereService.getAerialTile(zoomLevel, x, y),
			).resolves.toEqual('aerialTileData');
			expect(getArrayBuffer).toHaveBeenCalledTimes(1);
			expect(getArrayBuffer).toHaveBeenCalledWith(
				expect.stringContaining(`maps.hereapi.com/v3/base/mc/${zoomLevel}/${x}/${y}/png8?style=satellite.day&apiKey=${config.here.apiKey}`),
			);
		});
		test('Should throw error if request fails', async () => {
			getArrayBuffer.mockRejectedValueOnce(new Error('Request failed'));
			await expect(
				HereService.getAerialTile(zoomLevel, x, y),
			).rejects.toEqual(templates.mapsRequestFailed);
			expect(logger.logError).toHaveBeenCalledWith(expect.stringContaining('Failed to get HERE aerial tile:'));
			expect(logger.logError).toHaveBeenCalledTimes(1);
		});
	});
};

const testGetTrafficTile = () => {
	describe('Get Here Traffic Tile', () => {
		const zoomLevel = generateRandomNumber();
		const x = generateRandomNumber();
		const y = generateRandomNumber();
		test('Should return Here traffic tile', async () => {
			getArrayBuffer.mockResolvedValueOnce({ data: 'trafficTileData' });
			await expect(
				HereService.getTrafficTile(zoomLevel, x, y),
			).resolves.toEqual('trafficTileData');
			expect(getArrayBuffer).toHaveBeenCalledTimes(1);
			expect(getArrayBuffer).toHaveBeenCalledWith(
				expect.stringContaining(`maps.hereapi.com/v3/base/mc/${zoomLevel}/${x}/${y}/png8?style=logistics.day&apiKey=${config.here.apiKey}`),
			);
		});
		test('Should throw error if request fails', async () => {
			getArrayBuffer.mockRejectedValueOnce(new Error('Request failed'));
			await expect(
				HereService.getTrafficTile(zoomLevel, x, y),
			).rejects.toEqual(templates.mapsRequestFailed);
			expect(logger.logError).toHaveBeenCalledWith(expect.stringContaining('Failed to get HERE traffic tile:'));
			expect(logger.logError).toHaveBeenCalledTimes(1);
		});
	});
};

const testGetTrafficFlowTile = () => {
	describe('Get Here Traffic Flow Tile', () => {
		const zoomLevel = generateRandomNumber();
		const x = generateRandomNumber();
		const y = generateRandomNumber();
		test('Should return Here traffic flow tile', async () => {
			getArrayBuffer.mockResolvedValueOnce({ data: 'trafficFlowTileData' });
			await expect(
				HereService.getTrafficFlowTile(zoomLevel, x, y),
			).resolves.toEqual('trafficFlowTileData');
			expect(getArrayBuffer).toHaveBeenCalledTimes(1);
			expect(getArrayBuffer).toHaveBeenCalledWith(
				expect.stringContaining(`traffic.maps.hereapi.com/v3/flow/mc/${zoomLevel}/${x}/${y}/png8?apiKey=${config.here.apiKey}`),
			);
		});
		test('Should throw error if request fails', async () => {
			getArrayBuffer.mockRejectedValueOnce(new Error('Request failed'));
			await expect(
				HereService.getTrafficFlowTile(zoomLevel, x, y),
			).rejects.toEqual(templates.mapsRequestFailed);
			expect(logger.logError).toHaveBeenCalledWith(expect.stringContaining('Failed to get HERE traffic flow tile:'));
			expect(logger.logError).toHaveBeenCalledTimes(1);
		});
	});
};

const testGetTerrainTile = () => {
	describe('Get Here Terrain Tile', () => {
		const zoomLevel = generateRandomNumber();
		const x = generateRandomNumber();
		const y = generateRandomNumber();
		test('Should return Here terrain tile', async () => {
			getArrayBuffer.mockResolvedValueOnce({ data: 'terrainTileData' });
			await expect(
				HereService.getTerrainTile(zoomLevel, x, y),
			).resolves.toEqual('terrainTileData');
			expect(getArrayBuffer).toHaveBeenCalledTimes(1);
			expect(getArrayBuffer).toHaveBeenCalledWith(
				expect.stringContaining(`maps.hereapi.com/v3/base/mc/${zoomLevel}/${x}/${y}/png8?style=topo.day&apiKey=${config.here.apiKey}`),
			);
		});
		test('Should throw error if request fails', async () => {
			getArrayBuffer.mockRejectedValueOnce(new Error('Request failed'));
			await expect(
				HereService.getTerrainTile(zoomLevel, x, y),
			).rejects.toEqual(templates.mapsRequestFailed);
			expect(logger.logError).toHaveBeenCalledWith(expect.stringContaining('Failed to get HERE terrain tile:'));
			expect(logger.logError).toHaveBeenCalledTimes(1);
		});
	});
};

const testGetHybridTile = () => {
	describe('Get Here Hybrid Tile', () => {
		const zoomLevel = generateRandomNumber();
		const x = generateRandomNumber();
		const y = generateRandomNumber();
		test('Should return Here hybrid tile', async () => {
			getArrayBuffer.mockResolvedValueOnce({ data: 'hybridTileData' });
			await expect(
				HereService.getHybridTile(zoomLevel, x, y),
			).resolves.toEqual('hybridTileData');
			expect(getArrayBuffer).toHaveBeenCalledTimes(1);
			expect(getArrayBuffer).toHaveBeenCalledWith(
				expect.stringContaining(`maps.hereapi.com/v3/base/mc/${zoomLevel}/${x}/${y}/png8?style=explore.satellite.day&apiKey=${config.here.apiKey}`),
			);
		});
		test('Should throw error if request fails', async () => {
			getArrayBuffer.mockRejectedValueOnce(new Error('Request failed'));
			await expect(
				HereService.getHybridTile(zoomLevel, x, y),
			).rejects.toEqual(templates.mapsRequestFailed);
			expect(logger.logError).toHaveBeenCalledWith(expect.stringContaining('Failed to get HERE hybrid tile:'));
			expect(logger.logError).toHaveBeenCalledTimes(1);
		});
	});
};

const testGetGreyTile = () => {
	describe('Get Here Grey Tile', () => {
		const zoomLevel = generateRandomNumber();
		const x = generateRandomNumber();
		const y = generateRandomNumber();
		test('Should return Here grey tile', async () => {
			getArrayBuffer.mockResolvedValueOnce({ data: 'greyTileData' });
			await expect(
				HereService.getGreyTile(zoomLevel, x, y),
			).resolves.toEqual('greyTileData');
			expect(getArrayBuffer).toHaveBeenCalledTimes(1);
			expect(getArrayBuffer).toHaveBeenCalledWith(
				expect.stringContaining(`maps.hereapi.com/v3/base/mc/${zoomLevel}/${x}/${y}/png8?style=lite.day&apiKey=${config.here.apiKey}`),
			);
		});
		test('Should throw error if request fails', async () => {
			getArrayBuffer.mockRejectedValueOnce(new Error('Request failed'));
			await expect(
				HereService.getGreyTile(zoomLevel, x, y),
			).rejects.toEqual(templates.mapsRequestFailed);
			expect(logger.logError).toHaveBeenCalledWith(expect.stringContaining('Failed to get HERE grey tile:'));
			expect(logger.logError).toHaveBeenCalledTimes(1);
		});
	});
};

const testGetTruckRestrictionsTile = () => {
	describe('Get Here Truck Restrictions Tile', () => {
		const zoomLevel = generateRandomNumber();
		const x = generateRandomNumber();
		const y = generateRandomNumber();
		test('Should return Here truck restrictions tile', async () => {
			getArrayBuffer.mockResolvedValueOnce({ data: 'truckRestrictionsTileData' });
			await expect(
				HereService.getTruckRestrictionsTile(zoomLevel, x, y),
			).resolves.toEqual('truckRestrictionsTileData');
			expect(getArrayBuffer).toHaveBeenCalledTimes(1);
			expect(getArrayBuffer).toHaveBeenCalledWith(
				expect.stringContaining(`maps.hereapi.com/v3/base/mc/${zoomLevel}/${x}/${y}/png8?features=vehicle_restrictions:active_and_inactive&style=explore.day&apiKey=${config.here.apiKey}`),
			);
		});
		test('Should throw error if request fails', async () => {
			getArrayBuffer.mockRejectedValueOnce(new Error('Request failed'));
			await expect(
				HereService.getTruckRestrictionsTile(zoomLevel, x, y),
			).rejects.toEqual(templates.mapsRequestFailed);
			expect(logger.logError).toHaveBeenCalledWith(expect.stringContaining('Failed to get HERE truck restrictions tile:'));
			expect(logger.logError).toHaveBeenCalledTimes(1);
		});
	});
};

const testGetTruckRestrictionsOverlayTile = () => {
	describe('Get Here Truck Restrictions Overlay Tile', () => {
		const zoomLevel = generateRandomNumber();
		const x = generateRandomNumber();
		const y = generateRandomNumber();
		test('Should return Here truck restrictions overlay tile', async () => {
			getArrayBuffer.mockResolvedValueOnce({ data: 'truckRestrictionsOverlayTileData' });
			await expect(
				HereService.getTruckRestrictionsOverlayTile(zoomLevel, x, y),
			).resolves.toEqual('truckRestrictionsOverlayTileData');
			expect(getArrayBuffer).toHaveBeenCalledTimes(1);
			expect(getArrayBuffer).toHaveBeenCalledWith(
				expect.stringContaining(`maps.hereapi.com/v3/blank/mc/${zoomLevel}/${x}/${y}/png8?features=vehicle_restrictions:active_and_inactive&apiKey=${config.here.apiKey}`),
			);
		});
		test('Should throw error if request fails', async () => {
			getArrayBuffer.mockRejectedValueOnce(new Error('Request failed'));
			await expect(
				HereService.getTruckRestrictionsOverlayTile(zoomLevel, x, y),
			).rejects.toEqual(templates.mapsRequestFailed);
			expect(logger.logError).toHaveBeenCalledWith(expect.stringContaining('Failed to get HERE truck restrictions overlay tile:'));
			expect(logger.logError).toHaveBeenCalledTimes(1);
		});
	});
};

const testGetLabelOverlayTile = () => {
	describe('Get Here Label Overlay Tile', () => {
		const zoomLevel = generateRandomNumber();
		const x = generateRandomNumber();
		const y = generateRandomNumber();
		test('Should return Here label overlay tile', async () => {
			getArrayBuffer.mockResolvedValueOnce({ data: 'labelOverlayTileData' });
			await expect(
				HereService.getLabelOverlayTile(zoomLevel, x, y),
			).resolves.toEqual('labelOverlayTileData');
			expect(getArrayBuffer).toHaveBeenCalledTimes(1);
			expect(getArrayBuffer).toHaveBeenCalledWith(
				expect.stringContaining(`maps.hereapi.com/v3/label/mc/${zoomLevel}/${x}/${y}/png8?apiKey=${config.here.apiKey}`),
			);
		});
		test('Should throw error if request fails', async () => {
			getArrayBuffer.mockRejectedValueOnce(new Error('Request failed'));
			await expect(
				HereService.getLabelOverlayTile(zoomLevel, x, y),
			).rejects.toEqual(templates.mapsRequestFailed);
			expect(logger.logError).toHaveBeenCalledWith(expect.stringContaining('Failed to get HERE label overlay tile:'));
			expect(logger.logError).toHaveBeenCalledTimes(1);
		});
	});
};

const testGetTollZoneTile = () => {
	describe('Get Here Toll Zone Tile', () => {
		const zoomLevel = generateRandomNumber();
		const x = generateRandomNumber();
		const y = generateRandomNumber();
		test('Should return Here toll zone tile', async () => {
			getArrayBuffer.mockResolvedValueOnce({ data: 'tollZoneTileData' });
			await expect(
				HereService.getTollZoneTile(zoomLevel, x, y),
			).resolves.toEqual('tollZoneTileData');
			expect(getArrayBuffer).toHaveBeenCalledTimes(1);
			expect(getArrayBuffer).toHaveBeenCalledWith(
				expect.stringContaining(`maps.hereapi.com/v3/base/mc/${zoomLevel}/${x}/${y}/png8?features=congestion_zones:all&apiKey=${config.here.apiKey}`),
			);
		});
		test('Should throw error if request fails', async () => {
			getArrayBuffer.mockRejectedValueOnce(new Error('Request failed'));
			await expect(
				HereService.getTollZoneTile(zoomLevel, x, y),
			).rejects.toEqual(templates.mapsRequestFailed);
			expect(logger.logError).toHaveBeenCalledWith(expect.stringContaining('Failed to get HERE toll zone tile:'));
			expect(logger.logError).toHaveBeenCalledTimes(1);
		});
	});
};

const testGetPOITile = () => {
	describe('Get Here POI Tile', () => {
		const zoomLevel = generateRandomNumber();
		const x = generateRandomNumber();
		const y = generateRandomNumber();
		test('Should return Here POI tile', async () => {
			getArrayBuffer.mockResolvedValueOnce({ data: 'poiTileData' });
			await expect(
				HereService.getPOITile(zoomLevel, x, y),
			).resolves.toEqual('poiTileData');
			expect(getArrayBuffer).toHaveBeenCalledTimes(1);
			expect(getArrayBuffer).toHaveBeenCalledWith(
				expect.stringContaining(`maps.hereapi.com/v3/base/mc/${zoomLevel}/${x}/${y}/png8?features=pois:all&apiKey=${config.here.apiKey}`),
			);
		});
		test('Should throw error if request fails', async () => {
			getArrayBuffer.mockRejectedValueOnce(new Error('Request failed'));
			await expect(
				HereService.getPOITile(zoomLevel, x, y),
			).rejects.toEqual(templates.mapsRequestFailed);
			expect(logger.logError).toHaveBeenCalledWith(expect.stringContaining('Failed to get HERE POI tile:'));
			expect(logger.logError).toHaveBeenCalledTimes(1);
		});
	});
};

describe(determineTestGroup(__filename), () => {
	testGetBaseInfo();
	testGetTile();
	testGetAerialTile();
	testGetTrafficTile();
	testGetTrafficFlowTile();
	testGetTerrainTile();
	testGetHybridTile();
	testGetGreyTile();
	testGetTruckRestrictionsTile();
	testGetTruckRestrictionsOverlayTile();
	testGetLabelOverlayTile();
	testGetTollZoneTile();
	testGetPOITile();
});
