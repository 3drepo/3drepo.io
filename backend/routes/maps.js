/**
 *  Copyright (C) 2018 3D Repo Ltd
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
"use strict";

const express = require("express");
const router = express.Router({mergeParams: true});
const middlewares = require("../middlewares/middlewares");
const systemLogger = require("../logger.js").systemLogger;
const httpsGet = require("../libs/httpsReq");
const config = require("../config");
const User = require("../models/user");

const hereBaseDomain = ".base.maps.cit.api.here.com";
const hereAerialDomain = ".aerial.maps.cit.api.here.com";
const hereTrafficDomain = ".traffic.maps.cit.api.here.com";

/**
 * @api {get} .:model/maps List all Maps
 * @apiName listMaps
 * @apiGroup Maps
 *
 * @apiParam {String} model Model to list maps for .
 */
router.get("/:model/maps/", listMaps);

/**
 * @api {get} /:model/maps/osm/:zoomLevel/:gridx/:gridy.png Get OSMT file
 * @apiName getOSMTile
 * @apiGroup Maps
 *
 * @apiParam {Number} zoomLevel Map Zoom level.
 * @apiParam {String} model Model to list maps for
 */
router.get("/:model/maps/osm/:zoomLevel/:gridx/:gridy.png", getOSMTile);

/**
 * @api {get} /:model/maps/hereinfo/ Get Here Base Info
 * @apiName getHereBaseInfo
 * @apiGroup Maps
 *
 * @apiParam {String} model Model to list maps for
 */
router.get("/:model/maps/hereinfo/", middlewares.isHereEnabled, getHereBaseInfo);

/**
 * @api {get} /:model/maps/here/:zoomLevel/:gridx/:gridy.png Get Here Maps Tile
 * @apiName getHereMapsTile
 * @apiGroup Maps
 *
 * @apiParam {String} model Model to list maps for
 * @apiParam {Number} zoomLevel Map Zoom level
 * @apiParam {Number} number of tiles along row (x-cordinate)
 * @apiParam {String}  Map image type (format) to return
 */
router.get("/:model/maps/here/:zoomLevel/:gridx/:gridy.png", middlewares.isHereEnabled, getHereMapsTile);

/**
 * @api {get} /:model/maps/hereaerial/:zoomLevel/:gridx/:gridy.png Get Here Aerial Maps Tile
 * @apiName getHereAerialMapsTile
 * @apiGroup Maps
 *
 * @apiParam {String} model Model to list maps for
 * @apiParam {Number} zoomLevel Map Zoom level
 * @apiParam {Number} The number of tiles along row (x-cordinate)
 * @apiParam {String} Map image type (format) to return
 */
router.get("/:model/maps/hereaerial/:zoomLevel/:gridx/:gridy.png", middlewares.isHereEnabled, getHereAerialMapsTile);

/**
 * @api {get} /:model/maps/heretraffic/:zoomLevel/:gridx/:gridy.png Get Here Traffic Tile
 * @apiName getHereTrafficTile
 * @apiGroup Maps
 *
 * @apiParam {String} model Model to list maps for
 * @apiParam {Number} zoomLevel Map Zoom level
 * @apiParam {Number} number of tiles along row (x-cordinate)
 * @apiParam {String}  Map image type (format) to return
 */
router.get("/:model/maps/heretraffic/:zoomLevel/:gridx/:gridy.png", middlewares.isHereEnabled, getHereTrafficTile);

/**
 * @api {get} /:model/maps/heretrafficflow/:zoomLevel/:gridx/:gridy.png Get Here Traffic Flow
 * @apiName getHereTrafficTile
 * @apiGroup Maps
 *
 * @apiParam {String} model Model to list maps for
 * @apiParam {Number} zoomLevel Map Zoom level
 * @apiParam {Number} of tiles along row (x-cordinate)
 * @apiParam {String}  Map image type (format) to return
 */
router.get("/:model/maps/heretrafficflow/:zoomLevel/:gridx/:gridy.png", middlewares.isHereEnabled, getHereTrafficFlowTile);

/**
 * @api {get} /:model/maps/hereterrain/:zoomLevel/:gridx/:gridy.png Get Here Terrain Tile
 * @apiName getHereTerrainTile
 * @apiGroup Maps
 *
 * @apiParam {String} model Model to list maps for
 * @apiParam {Number} zoomLevel Map Zoom level
 * @apiParam {Number} of tiles along row (x-cordinate)
 * @apiParam {String}  Map image type (format) to return
 */
router.get("/:model/maps/hereterrain/:zoomLevel/:gridx/:gridy.png", middlewares.isHereEnabled, getHereTerrainTile);

/**
 * @api {get} /:model/maps/herehybrid/:zoomLevel/:gridx/:gridy.png Get Here Hybrid Tile
 * @apiName getHereHybridTile
 * @apiGroup Maps
 *
 * @apiParam {String} model Model to list maps for
 * @apiParam {Number} zoomLevel Map Zoom level
 * @apiParam {Number} of tiles along row (x-cordinate)
 * @apiParam {String}  Map image type (format) to return
 */
router.get("/:model/maps/herehybrid/:zoomLevel/:gridx/:gridy.png", middlewares.isHereEnabled, getHereHybridTile);

/**
 * @api {get} /:model/maps/heregrey/:zoomLevel/:gridx/:gridy.png Get Here Grey Tile
 * @apiName getHereGreyTile
 * @apiGroup Maps
 *
 * @apiParam {String} model Model to list maps for
 * @apiParam {Number} zoomLevel Map Zoom level
 * @apiParam {Number} of tiles along row (x-cordinate)
 * @apiParam {String}  Map image type (format) to return
 */
router.get("/:model/maps/heregrey/:zoomLevel/:gridx/:gridy.png", middlewares.isHereEnabled, getHereGreyTile);

/**
 * @api {get} /:model/maps/heregreytransit/:zoomLevel/:gridx/:gridy.png Get Here Transit Tile
 * @apiName getHereGreyTransitTile
 * @apiGroup Maps
 *
 * @apiParam {String} model Model to list maps for
 * @apiParam {Number} zoomLevel Map Zoom level
 * @apiParam {Number} of tiles along row (x-cordinate)
 * @apiParam {String}  Map image type (format) to return
 */
router.get("/:model/maps/heregreytransit/:zoomLevel/:gridx/:gridy.png", middlewares.isHereEnabled, getHereGreyTransitTile);

/**
 * @api {get} /:model/maps/heretruck/:zoomLevel/:gridx/:gridy.png Get Here Truck Restrictions
 * @apiName getHereTruckRestrictionsTile
 * @apiGroup Maps
 *
 * @apiParam {String} model Model to list maps for
 * @apiParam {Number} zoomLevel Map Zoom level
 * @apiParam {Number} of tiles along row (x-cordinate)
 * @apiParam {String}  Map image type (format) to return
 */
router.get("/:model/maps/heretruck/:zoomLevel/:gridx/:gridy.png", middlewares.isHereEnabled, getHereTruckRestrictionsTile);

/**
 * @api {get} /:model/maps/heretruckoverlay/:zoomLevel/:gridx/:gridy.png Get Here Truck Restrictions Overlay Tile
 * @apiName getHereTruckRestrictionsOverlayTile
 * @apiGroup Maps
 *
 * @apiParam {String} model Model to list maps for
 * @apiParam {Number} zoomLevel Map Zoom level
 * @apiParam {Number} of tiles along row (x-cordinate)
 * @apiParam {String}  Map image type (format) to return
 */
router.get("/:model/maps/heretruckoverlay/:zoomLevel/:gridx/:gridy.png", middlewares.isHereEnabled, getHereTruckRestrictionsOverlayTile);

/**
 * @api {get} /:model/maps/hereadminlabeloverlay/:zoomLevel/:gridx/:gridy.png Get Here Admin Label Tile
 * @apiName getHereAdminLabelOverlayTile
 * @apiGroup Maps
 *
 * @apiParam {String} model Model to list maps for
 * @apiParam {Number} zoomLevel Map Zoom level
 * @apiParam {Number} of tiles along row (x-cordinate)
 * @apiParam {String}  Map image type (format) to return
 */
router.get("/:model/maps/hereadminlabeloverlay/:zoomLevel/:gridx/:gridy.png", middlewares.isHereEnabled, getHereAdminLabelOverlayTile);

/**
 * @api {get} /:model/maps/herelabeloverlay/:zoomLevel/:gridx/:gridy.png Get Here Label Overlay Tile
 * @apiName getHereAdminLabelOverlayTile
 * @apiGroup Maps
 *
 * @apiParam {String} model Model to list maps for
 * @apiParam {Number} zoomLevel Map Zoom level
 * @apiParam {Number} of tiles along row (x-cordinate)
 * @apiParam {String}  Map image type (format) to return
 */
router.get("/:model/maps/herelabeloverlay/:zoomLevel/:gridx/:gridy.png", middlewares.isHereEnabled, getHereLabelOverlayTile);

/**
 * @api {get} /:model/maps/herelinelabeloverlay/:zoomLevel/:gridx/:gridy.png Get Here Line Label Overlay Tile
 * @apiName getHereLineLabelOverlayTile
 * @apiGroup Maps
 *
 * @apiParam {String} model Model to list maps for
 * @apiParam {Number} zoomLevel Map Zoom level
 * @apiParam {Number} of tiles along row (x-cordinate)
 * @apiParam {String}  Map image type (format) to return
 */
router.get("/:model/maps/herelinelabeloverlay/:zoomLevel/:gridx/:gridy.png", middlewares.isHereEnabled, getHereLineLabelOverlayTile);

/**
 * @api {get} /:model/maps/heretollzone/:zoomLevel/:gridx/:gridy.png Get Here Tollzone Tile
 * @apiName getHereTollZoneTile
 * @apiGroup Maps
 *
 * @apiParam {String} model Model to list maps for
 * @apiParam {Number} zoomLevel Map Zoom level
 * @apiParam {Number} of tiles along row (x-cordinate)
 * @apiParam {String}  Map image type (format) to return
 */
router.get("/:model/maps/heretollzone/:zoomLevel/:gridx/:gridy.png", middlewares.isHereEnabled, getHereTollZoneTile);

/**
 * @api {get} /:model/maps/herepoi/:zoomLevel/:gridx/:gridy.png Get Here POI (Point of Interest) Tile
 * @apiName getHerePOITile
 * @apiGroup Maps
 *
 * @apiParam {String} model Model to list maps for
 * @apiParam {Number} zoomLevel Map Zoom level
 * @apiParam {Number} of tiles along row (x-cordinate)
 * @apiParam {String}  Map image type (format) to return
 */
router.get("/:model/maps/herepoi/:zoomLevel/:gridx/:gridy.png", middlewares.isHereEnabled, getHerePOITile);

/**
 * @api {get} /:model/maps/herepoi/:zoomLevel/:gridx/:gridy.png Get Here Buildings From Longitude and Latitude
 * @apiName getHereBuildingsFromLongLat
 * @apiGroup Maps
 *
 * @apiParam {String} model Model to list maps for
 * @apiParam {Number} zoomLevel Map Zoom level
 * @apiParam {Number} of tiles along row (x-cordinate)
 * @apiParam {String}  Map image type (format) to return
 */
router.get("/:model/maps/herebuildings/:lat/:long/tile.json", middlewares.isHereEnabled, getHereBuildingsFromLongLat);

function listMaps(req, res) {
	const teamspace = req.params.account;

	let maps = [
		{ name: "Open Street Map", layers: [{ name: "Map Tiles", source: "OSM" }] }
	];

	User.isHereEnabled(teamspace).then((hereEnabled) => {
		if (hereEnabled && (config.here && config.here.appID && config.here.appCode)) {
			maps = maps.concat([
				{ name: "Here", layers: [
					{ name: "Map Tiles", source: "HERE" },
					{ name: "Traffic Flow", source: "HERE_TRAFFIC_FLOW" },
					{ name: "Truck Restrictions", source: "HERE_TRUCK_OVERLAY" }
				] },
				{ name: "Here (Terrain)", layers: [
					{ name: "Map Tiles", source: "HERE_TERRAIN" },
					{ name: "Traffic Flow", source: "HERE_TRAFFIC_FLOW" },
					{ name: "Truck Restrictions", source: "HERE_TRUCK_OVERLAY" }
				] },
				{ name: "Here (Satellite)", layers: [
					{ name: "Aerial Imagery", source: "HERE_AERIAL" },
					{ name: "Traffic Flow", source: "HERE_TRAFFIC_FLOW" },
					{ name: "Truck Restrictions", source: "HERE_TRUCK_OVERLAY" }
				] },
				{ name: "Here (Hybrid)", layers: [
					{ name: "Map Tiles", source: "HERE_HYBRID" },
					{ name: "Traffic Flow", source: "HERE_TRAFFIC_FLOW" },
					{ name: "Truck Restrictions", source: "HERE_TRUCK_OVERLAY" }
				] },
				{ name: "Here (Street)", layers: [
					{ name: "Map Tiles", source: "HERE_STREET" },
					{ name: "Traffic Flow", source: "HERE_TRAFFIC_FLOW" },
					{ name: "Truck Restrictions", source: "HERE_TRUCK_OVERLAY" }
				] },
				{ name: "Here (Transit)", layers: [
					{ name: "Map Tiles", source: "HERE_TRANSIT" },
					{ name: "Traffic Flow", source: "HERE_TRAFFIC_FLOW" },
					{ name: "Truck Restrictions", source: "HERE_TRUCK_OVERLAY" }
				] },
				{ name: "Here (Toll Zone)", layers: [
					{ name: "Map Tiles", source: "HERE_TOLL_ZONE" },
					{ name: "Traffic Flow", source: "HERE_TRAFFIC_FLOW" },
					{ name: "Truck Restrictions", source: "HERE_TRUCK_OVERLAY" }
				] },
				{ name: "Here (POI)", layers: [
					{ name: "Map Tiles", source: "HERE_POI" },
					{ name: "Traffic Flow", source: "HERE_TRAFFIC_FLOW" },
					{ name: "Truck Restrictions", source: "HERE_TRUCK_OVERLAY" }
				] }
			]);
		}

		if (maps.length > 0) {
			res.status(200).json({ maps });
		} else {
			res.status(500).json({ message: "No Maps Available" });
		}
	});
}

function requestMapTile(req, res, domain, uri) {
	httpsGet.get(domain, uri).then(image =>{
		res.writeHead(200, {"Content-Type": "image/png" });
		res.write(image);
		res.end();
	}).catch(err => {
		systemLogger.logError(JSON.stringify(err));
		if(err.message) {
			res.status(500).json({ message: err.message});
		} else if (err.resCode) {
			res.status(err.resCode).json({message: err.message});
		}
	});
}

function requestHereMapTile(req, res, domain, uri) {
	uri += "?app_id=" + config.here.appID + "&app_code=" + config.here.appCode;
	if (req.query.congestion) {
		uri += "&congestion=" + req.query.congestion;
	}
	if (req.query.lg) {
		uri += "&lg=" + req.query.lg;
	}
	if (req.query.lg2) {
		uri += "&lg2=" + req.query.lg2;
	}
	if (req.query.min_traffic_congestion) {
		uri += "&min_traffic_congestion=" + req.query.min_traffic_congestion;
	}
	if (req.query.pois) {
		uri += "&pois=" + req.query.pois;
	}
	if (req.query.ppi) {
		uri += "&ppi=" + req.query.ppi;
	}
	if (req.query.pview) {
		uri += "&pview=" + req.query.pview;
	}
	if (req.query.range) {
		uri += "&range=" + req.query.range;
	}
	if (req.query.style) {
		uri += "&style=" + req.query.style;
	}
	if (req.query.time) {
		uri += "&time=" + req.query.time;
	}
	requestMapTile(req, res, domain, uri);
}

function getOSMTile(req, res) {
	// TODO: we may want to ensure the model has access to tiles
	const domain = "a.tile.openstreetmap.org";
	const uri = "/" + req.params.zoomLevel + "/" + req.params.gridx + "/" + req.params.gridy + ".png";
	systemLogger.logInfo("Fetching osm map tile: " + uri);
	requestMapTile(req, res, domain, uri);
}

function getHereBaseInfo(req, res) {
	const domain = "1" + hereBaseDomain;
	let uri = "/maptile/2.1/info";
	uri += "?app_id=" + config.here.appID + "&app_code=" + config.here.appCode;
	httpsGet.get(domain, uri).then(info =>{
		res.write(info);
		res.end();
	}).catch(err => {
		systemLogger.logError(JSON.stringify(err));
		if (err.message) {
			res.status(500).json({ message: err.message});
		} else if (err.resCode) {
			res.status(err.resCode).json({message: err.message});
		}
	});
}

function getHereMapsTile(req, res) {
	const size = 256; // 256 = [256,256]; 512 = [512,512]; Deprecated: 128
	const domain = (1 + ((req.params.gridx + req.params.gridy) % 4)) + hereBaseDomain;
	const uri = "/maptile/2.1/maptile/newest/normal.day/" + req.params.zoomLevel + "/" + req.params.gridx + "/" + req.params.gridy + "/" + size + "/png8";
	systemLogger.logInfo("Fetching Here map tile: " + uri);
	requestHereMapTile(req, res, domain, uri);
}

function getHereAerialMapsTile(req, res) {
	const size = 256; // 256 = [256,256]; 512 = [512,512]; Deprecated: 128
	const domain = (1 + ((req.params.gridx + req.params.gridy) % 4)) + hereAerialDomain;
	const uri = "/maptile/2.1/maptile/newest/satellite.day/" + req.params.zoomLevel + "/" + req.params.gridx + "/" + req.params.gridy + "/" + size + "/png8";
	systemLogger.logInfo("Fetching Here map tile: " + uri);
	requestHereMapTile(req, res, domain, uri);
}

function getHereTrafficTile(req, res) {
	const size = 256; // 256 = [256,256]; 512 = [512,512]; Deprecated: 128
	const domain = (1 + ((req.params.gridx + req.params.gridy) % 4)) + hereTrafficDomain;
	const uri = "/maptile/2.1/traffictile/newest/normal.day/" + req.params.zoomLevel + "/" + req.params.gridx + "/" + req.params.gridy + "/" + size + "/png8";
	systemLogger.logInfo("Fetching Here traffic flow map tile: " + uri);
	requestHereMapTile(req, res, domain, uri);
}

function getHereTrafficFlowTile(req, res) {
	const size = 256; // 256 = [256,256]; 512 = [512,512]; Deprecated: 128
	const domain = (1 + ((req.params.gridx + req.params.gridy) % 4)) + hereTrafficDomain;
	const uri = "/maptile/2.1/flowtile/newest/normal.traffic.day/" + req.params.zoomLevel + "/" + req.params.gridx + "/" + req.params.gridy + "/" + size + "/png8";
	systemLogger.logInfo("Fetching Here traffic flow map tile: " + uri);
	requestHereMapTile(req, res, domain, uri);
}

function getHereTerrainTile(req, res) {
	const size = 256; // 256 = [256,256]; 512 = [512,512]; Deprecated: 128
	const domain = (1 + ((req.params.gridx + req.params.gridy) % 4)) + hereAerialDomain;
	const uri = "/maptile/2.1/maptile/newest/terrain.day/" + req.params.zoomLevel + "/" + req.params.gridx + "/" + req.params.gridy + "/" + size + "/png8";
	systemLogger.logInfo("Fetching Here terrain map tile: " + uri);
	requestHereMapTile(req, res, domain, uri);
}

function getHereHybridTile(req, res) {
	const size = 256; // 256 = [256,256]; 512 = [512,512]; Deprecated: 128
	const domain = (1 + ((req.params.gridx + req.params.gridy) % 4)) + hereAerialDomain;
	const uri = "/maptile/2.1/maptile/newest/hybrid.day/" + req.params.zoomLevel + "/" + req.params.gridx + "/" + req.params.gridy + "/" + size + "/png8";
	systemLogger.logInfo("Fetching Here hybrid map tile: " + uri);
	requestHereMapTile(req, res, domain, uri);
}

function getHereGreyTile(req, res) {
	const size = 256; // 256 = [256,256]; 512 = [512,512]; Deprecated: 128
	const domain = (1 + ((req.params.gridx + req.params.gridy) % 4)) + hereBaseDomain;
	const uri = "/maptile/2.1/maptile/newest/normal.day.grey/" + req.params.zoomLevel + "/" + req.params.gridx + "/" + req.params.gridy + "/" + size + "/png8";
	systemLogger.logInfo("Fetching Here colour-reduced street map tile: " + uri);
	requestHereMapTile(req, res, domain, uri);
}

function getHereGreyTransitTile(req, res) {
	const size = 256; // 256 = [256,256]; 512 = [512,512]; Deprecated: 128
	const domain = (1 + ((req.params.gridx + req.params.gridy) % 4)) + hereBaseDomain;
	const uri = "/maptile/2.1/maptile/newest/normal.day.transit/" + req.params.zoomLevel + "/" + req.params.gridx + "/" + req.params.gridy + "/" + size + "/png8";
	systemLogger.logInfo("Fetching Here colour-reduced transit map tile: " + uri);
	requestHereMapTile(req, res, domain, uri);
}

function getHereTruckRestrictionsTile(req, res) {
	const size = 256; // 256 = [256,256]; 512 = [512,512]; Deprecated: 128
	const domain = (1 + ((req.params.gridx + req.params.gridy) % 4)) + hereBaseDomain;
	const uri = "/maptile/2.1/trucktile/newest/normal.day/" + req.params.zoomLevel + "/" + req.params.gridx + "/" + req.params.gridy + "/" + size + "/png8";
	systemLogger.logInfo("Fetching Here truck restrictions map tile: " + uri);
	requestHereMapTile(req, res, domain, uri);
}

function getHereTruckRestrictionsOverlayTile(req, res) {
	const size = 256; // 256 = [256,256]; 512 = [512,512]; Deprecated: 128
	const domain = (1 + ((req.params.gridx + req.params.gridy) % 4)) + hereBaseDomain;
	const uri = "/maptile/2.1/truckonlytile/newest/normal.day/" + req.params.zoomLevel + "/" + req.params.gridx + "/" + req.params.gridy + "/" + size + "/png8";
	systemLogger.logInfo("Fetching Here truck restrictions overlay map tile: " + uri);
	requestHereMapTile(req, res, domain, uri);
}

function getHereAdminLabelOverlayTile(req, res) {
	const size = 256; // 256 = [256,256]; 512 = [512,512]; Deprecated: 128
	const domain = (1 + ((req.params.gridx + req.params.gridy) % 4)) + hereBaseDomain;
	const uri = "/maptile/2.1/alabeltile/newest/normal.day/" + req.params.zoomLevel + "/" + req.params.gridx + "/" + req.params.gridy + "/" + size + "/png8";
	systemLogger.logInfo("Fetching Here administrative label overlay map tile: " + uri);
	requestHereMapTile(req, res, domain, uri);
}

function getHereLabelOverlayTile(req, res) {
	const size = 256; // 256 = [256,256]; 512 = [512,512]; Deprecated: 128
	const domain = (1 + ((req.params.gridx + req.params.gridy) % 4)) + hereBaseDomain;
	const uri = "/maptile/2.1/labeltile/newest/normal.day/" + req.params.zoomLevel + "/" + req.params.gridx + "/" + req.params.gridy + "/" + size + "/png8";
	systemLogger.logInfo("Fetching Here label overlay map tile: " + uri);
	requestHereMapTile(req, res, domain, uri);
}

function getHereLineLabelOverlayTile(req, res) {
	const size = 256; // 256 = [256,256]; 512 = [512,512]; Deprecated: 128
	const domain = (1 + ((req.params.gridx + req.params.gridy) % 4)) + hereBaseDomain;
	const uri = "/maptile/2.1/lltile/newest/normal.day/" + req.params.zoomLevel + "/" + req.params.gridx + "/" + req.params.gridy + "/" + size + "/png8";
	systemLogger.logInfo("Fetching Here line label overlay map tile: " + uri);
	requestHereMapTile(req, res, domain, uri);
}

function getHereTollZoneTile(req, res) {
	if (!req.query) {
		req.query = {};
	}
	req.query.congestion = true;
	getHereMapsTile(req, res);
}

function getHerePOITile(req, res) {
	if (!req.query) {
		req.query = {};
	}
	req.query.pois = true;
	getHereMapsTile(req, res);
}

function getHereBuildingsFromLongLat(req, res) {
	const zoomLevel = 13;
	const tileSize = 180 / Math.pow(2, zoomLevel);
	const tileX = Math.floor((parseFloat(req.params.long) + 180) / tileSize);
	const tileY = Math.floor((parseFloat(req.params.lat) + 90) / tileSize);

	const domain = "pde.api.here.com";
	let uri = "/1/tile.json?&layer=BUILDING&level=" + zoomLevel + "&tilex=" + tileX + "&tiley=" + tileY + "&region=WEU";
	systemLogger.logInfo("Fetching Here building platform data extensions: " + uri);
	uri += "&app_id=" + config.here.appID + "&app_code=" + config.here.appCode;

	httpsGet.get(domain, uri).then(buildings =>{
		res.status(200).json(buildings);
	}).catch(err => {
		systemLogger.logError(JSON.stringify(err));
		if(err.message) {
			res.status(500).json({ message: err.message});
		} else if (err.resCode) {
			res.status(err.resCode).json({message: err.message});
		}
	});
}

module.exports = router;
