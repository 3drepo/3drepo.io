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

jest.mock('../../../../../src/v5/utils/config');
const config = require(`${src}/utils/config`);

const HereService = require(`${src}/services/maps/here`);

const testGetBaseInfo = () => {
	describe('Get Here Base Info', () => {
		config.here = { apiKey: generateRandomString() };
		test('Should return Here base info', async () => {
			await HereService.getBaseInfo();
			expect(get).toHaveBeenCalledTimes(1);
			expect(get).toHaveBeenCalledWith(
				expect.stringContaining(`maps.hereapi.com/v3/info?apiKey=${config.here.apiKey}`),
			);
		});
	});
};

const testGetTile = () => {
	describe('Get Here Tile', () => {
		const zoomLevel = generateRandomNumber();
		const gridx = generateRandomNumber();
		const gridy = generateRandomNumber();
		test('Should return Here tile', async () => {
			await HereService.getTile(zoomLevel, gridx, gridy);
			expect(getArrayBuffer).toHaveBeenCalledTimes(1);
			expect(getArrayBuffer).toHaveBeenCalledWith(
				expect.stringContaining(`maps.hereapi.com/v3/base/mc/${zoomLevel}/${gridx}/${gridy}/png8?apiKey=${config.here.apiKey}`),
			);
		});
	});
};

const testGetAerialTile = () => {
	describe('Get Here Arial Tile', () => {
		const zoomLevel = generateRandomNumber();
		const gridx = generateRandomNumber();
		const gridy = generateRandomNumber();
		test('Should return Here arial tile', async () => {
			await HereService.getAerialTile(zoomLevel, gridx, gridy);
			expect(getArrayBuffer).toHaveBeenCalledTimes(1);
			expect(getArrayBuffer).toHaveBeenCalledWith(
				expect.stringContaining(`maps.hereapi.com/v3/base/mc/${zoomLevel}/${gridx}/${gridy}/png8?style=satellite.day&apiKey=${config.here.apiKey}`),
			);
		});
	});
};

const testGetTrafficTile = () => {
	describe('Get Here Traffic Tile', () => {
		const zoomLevel = generateRandomNumber();
		const gridx = generateRandomNumber();
		const gridy = generateRandomNumber();
		test('Should return Here traffic tile', async () => {
			await HereService.getTrafficTile(zoomLevel, gridx, gridy);
			expect(getArrayBuffer).toHaveBeenCalledTimes(1);
			expect(getArrayBuffer).toHaveBeenCalledWith(
				expect.stringContaining(`maps.hereapi.com/v3/base/mc/${zoomLevel}/${gridx}/${gridy}/png8?style=logistics.day&apiKey=${config.here.apiKey}`),
			);
		});
	});
};

const testGetTrafficFlowTile = () => {
	describe('Get Here Traffic Flow Tile', () => {
		const zoomLevel = generateRandomNumber();
		const gridx = generateRandomNumber();
		const gridy = generateRandomNumber();
		test('Should return Here traffic flow tile', async () => {
			await HereService.getTrafficFlowTile(zoomLevel, gridx, gridy);
			expect(getArrayBuffer).toHaveBeenCalledTimes(1);
			expect(getArrayBuffer).toHaveBeenCalledWith(
				expect.stringContaining(`maps.hereapi.com/v3/flow/mc/${zoomLevel}/${gridx}/${gridy}/png8?apiKey=${config.here.apiKey}`),
			);
		});
	});
};

const testGetTerrainTile = () => {
	describe('Get Here Terrain Tile', () => {
		const zoomLevel = generateRandomNumber();
		const gridx = generateRandomNumber();
		const gridy = generateRandomNumber();
		test('Should return Here terrain tile', async () => {
			await HereService.getTerrainTile(zoomLevel, gridx, gridy);
			expect(getArrayBuffer).toHaveBeenCalledTimes(1);
			expect(getArrayBuffer).toHaveBeenCalledWith(
				expect.stringContaining(`maps.hereapi.com/v3/base/mc/${zoomLevel}/${gridx}/${gridy}/png8?style=topo.day&apiKey=${config.here.apiKey}`),
			);
		});
	});
};

const testGetHybridTile = () => {
	describe('Get Here Hybrid Tile', () => {
		const zoomLevel = generateRandomNumber();
		const gridx = generateRandomNumber();
		const gridy = generateRandomNumber();
		test('Should return Here hybrid tile', async () => {
			await HereService.getHybridTile(zoomLevel, gridx, gridy);
			expect(getArrayBuffer).toHaveBeenCalledTimes(1);
			expect(getArrayBuffer).toHaveBeenCalledWith(
				expect.stringContaining(`maps.hereapi.com/v3/base/mc/${zoomLevel}/${gridx}/${gridy}/png8?style=explore.satellite.day&apiKey=${config.here.apiKey}`),
			);
		});
	});
};

const testGetGreyTile = () => {
	describe('Get Here Grey Tile', () => {
		const zoomLevel = generateRandomNumber();
		const gridx = generateRandomNumber();
		const gridy = generateRandomNumber();
		test('Should return Here grey tile', async () => {
			await HereService.getGreyTile(zoomLevel, gridx, gridy);
			expect(getArrayBuffer).toHaveBeenCalledTimes(1);
			expect(getArrayBuffer).toHaveBeenCalledWith(
				expect.stringContaining(`maps.hereapi.com/v3/base/mc/${zoomLevel}/${gridx}/${gridy}/png8?style=lite.day&apiKey=${config.here.apiKey}`),
			);
		});
	});
};

const testGetTruckRestrictionsTile = () => {
	describe('Get Here Truck Restrictions Tile', () => {
		const zoomLevel = generateRandomNumber();
		const gridx = generateRandomNumber();
		const gridy = generateRandomNumber();
		test('Should return Here truck restrictions tile', async () => {
			await HereService.getTruckRestrictionsTile(zoomLevel, gridx, gridy);
			expect(getArrayBuffer).toHaveBeenCalledTimes(1);
			expect(getArrayBuffer).toHaveBeenCalledWith(
				expect.stringContaining(`maps.hereapi.com/v3/base/mc/${zoomLevel}/${gridx}/${gridy}/png8?features=vehicle_restrictions:active_and_inactive&style=explore.day&apiKey=${config.here.apiKey}`),
			);
		});
	});
};

const testGetTruckRestrictionsOverlayTile = () => {
	describe('Get Here Truck Restrictions Overlay Tile', () => {
		const zoomLevel = generateRandomNumber();
		const gridx = generateRandomNumber();
		const gridy = generateRandomNumber();
		test('Should return Here truck restrictions overlay tile', async () => {
			await HereService.getTruckRestrictionsOverlayTile(zoomLevel, gridx, gridy);
			expect(getArrayBuffer).toHaveBeenCalledTimes(1);
			expect(getArrayBuffer).toHaveBeenCalledWith(
				expect.stringContaining(`maps.hereapi.com/v3/blank/mc/${zoomLevel}/${gridx}/${gridy}/png8?features=vehicle_restrictions:active_and_inactive&apiKey=${config.here.apiKey}`),
			);
		});
	});
};

const testGetLabelOverlayTile = () => {
	describe('Get Here Label Overlay Tile', () => {
		const zoomLevel = generateRandomNumber();
		const gridx = generateRandomNumber();
		const gridy = generateRandomNumber();
		test('Should return Here label overlay tile', async () => {
			await HereService.getLabelOverlayTile(zoomLevel, gridx, gridy);
			expect(getArrayBuffer).toHaveBeenCalledTimes(1);
			expect(getArrayBuffer).toHaveBeenCalledWith(
				expect.stringContaining(`maps.hereapi.com/v3/label/mc/${zoomLevel}/${gridx}/${gridy}/png8?apiKey=${config.here.apiKey}`),
			);
		});
	});
};

const testGetTollZoneTile = () => {
	describe('Get Here Toll Zone Tile', () => {
		const zoomLevel = generateRandomNumber();
		const gridx = generateRandomNumber();
		const gridy = generateRandomNumber();
		test('Should return Here toll zone tile', async () => {
			await HereService.getTollZoneTile(zoomLevel, gridx, gridy);
			expect(getArrayBuffer).toHaveBeenCalledTimes(1);
			expect(getArrayBuffer).toHaveBeenCalledWith(
				expect.stringContaining(`maps.hereapi.com/v3/base/mc/${zoomLevel}/${gridx}/${gridy}/png8?features=congestion_zones:all&apiKey=${config.here.apiKey}`),
			);
		});
	});
};

const testGetPOITile = () => {
	describe('Get Here POI Tile', () => {
		const zoomLevel = generateRandomNumber();
		const gridx = generateRandomNumber();
		const gridy = generateRandomNumber();
		test('Should return Here POI tile', async () => {
			await HereService.getPOITile(zoomLevel, gridx, gridy);
			expect(getArrayBuffer).toHaveBeenCalledTimes(1);
			expect(getArrayBuffer).toHaveBeenCalledWith(
				expect.stringContaining(`maps.hereapi.com/v3/base/mc/${zoomLevel}/${gridx}/${gridy}/png8?features=pois:all&apiKey=${config.here.apiKey}`),
			);
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
