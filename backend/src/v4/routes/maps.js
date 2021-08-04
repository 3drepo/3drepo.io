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

const hereBaseDomain = ".base.maps.ls.hereapi.com";
const hereAerialDomain = ".aerial.maps.ls.hereapi.com";
const hereTrafficDomain = ".traffic.maps.ls.hereapi.com";

/**
 * @apiDefine Maps Maps
 * Geographic information system (GIS) resources from
 * Open Street Maps (OSM) and Here are supported.
 * Please note that an app_id and app_code from Here are
 * required to access Here resources.
 *
 * @apiParam {String} teamspace Name of teamspace
 * @apiParam {String} model Model ID
 */

/**
 * @apiDefine MapTile
 *
 * @apiParam {Number} zoomLevel Zoom level
 * @apiParam {Number} gridx Longitudinal (X) grid reference
 * @apiParam {Number} gridy Latitudinal (Y) grid reference
 * @apiSuccess {png} image Map tile image
 *
 * @apiSuccessExample {png} Success-Response
 * HTTP/1.1 200 OK
 * <binary image>
 */

/**
 * @apiDefine HereOptions
 *
 * @apiParam (Query) {Boolean} [congestion] Flag that enables congestion and environmental
 * zone display
 * @apiParam (Query) {String} [lg] MARC three-letter language code for labels
 * @apiParam (Query) {String} [lg2] Secondary MARC three-letter language code for labels
 * @apiParam (Query) {String} [pois] Mask for Here Maps POIs categories
 * @apiParam (Query) {Number} [ppi] Tile resolution in pixels per inch (72, 250, 320, 500)
 * @apiParam (Query) {String} [pview] Render map boundaries based on internal or local views
 * @apiParam (Query) {String} [style] Select style used to render map tile
 */

/**
 * @apiDefine HereTrafficOptions
 *
 * @apiParam (Query) {String} [min_traffic_congestion] Specifies the minimum traffic
 * congestion level to use for rendering traffic flow (free, heavy, queuing, blocked)
 * @apiParam (Query) {DateTime} [time] Date and time for showing historical traffic patterns
 */

/**
 * @api {get} /:teamspace/:model/maps List maps
 * @apiName listMaps
 * @apiGroup Maps
 * @apiDescription List the available geographic information system (GIS) sources and
 * map layers.
 *
 * @apiUse Maps
 * @apiSuccess {Object[]} maps List of available map objects
 * @apiSuccess (Map object) {String} name Name of map provider
 * @apiSuccess (Map object) {Object[]} layers List of available map layer objects
 * @apiSuccess (Layer object) {String} name Name of map layer
 * @apiSuccess (Layer object) {String} source Map source identifier
 *
 * @apiExample {get} Example usage:
 * GET /acme/00000000-0000-0000-0000-000000000000/maps HTTP/1.1
 *
 * @apiSuccessExample {json} Success-Response
 * HTTP/1.1 200 OK
 * {
 * 	"maps":[
 * 		{
 * 			"name":"Open Street Map",
 * 			"layers":[
 * 				{
 * 					"name":"Map Tiles",
 * 					"source":"OSM"
 * 				}
 * 			]
 * 		},
 * 		{
 * 			"name":"Here",
 * 			"layers":[
 * 				{
 * 					"name":"Map Tiles",
 * 					"source":"HERE"
 * 				},
 * 				{
 * 					"name":"Traffic Flow",
 * 					"source":"HERE_TRAFFIC_FLOW"
 * 				},
 * 				{
 * 					"name":"Truck Restrictions",
 * 					"source":"HERE_TRUCK_OVERLAY"
 * 				}
 * 			]
 * 		}
 * 	]
 * }
 */
router.get("/:model/maps/", listMaps);

/**
 * @api {get} /:teamspace/:model/maps/osm/:zoomLevel/:gridx/:gridy.png OSM map tile
 * @apiName getOSMTile
 * @apiGroup Maps
 * @apiDescription Retrieve an Open Street Map (OSM) map tile image.
 *
 * @apiUse Maps
 * @apiUse MapTile
 *
 * @apiExample {get} Example usage:
 * GET /acme/00000000-0000-0000-0000-000000000000/maps/osm/17/65485/43574.png HTTP/1.1
 */
router.get("/:model/maps/osm/:zoomLevel/:gridx/:gridy.png", getOSMTile);

/**
 * @api {get} /:teamspace/:model/maps/hereinfo Here Maps options
 * @apiName getHereBaseInfo
 * @apiGroup Maps
 * @apiDescription Get Here Maps service options.
 *
 * @apiUse Maps
 *
 * @apiExample {get} Example usage:
 * GET /acme/00000000-0000-0000-0000-000000000000/maps/ HTTP/1.1
 *
 * @apiSuccessExample {xml} Success-Response
 * HTTP/1.1 200 OK
 * <response>
 * 	<maps>
 * 		<map region="all" id="newest" />
 * 	</maps>
 * 	<resolutions>
 * 		<resolution id="512" height="512" width="512" />
 * 	</resolutions>
 * 	<formats>
 * 		<format encoding="png" bbp="24" id="png" />
 * 	</formats>
 * 	<schemes>
 * 		<scheme id="normal.day" />
 * 		<scheme id="normal.night" />
 * 	</schemes>
 * 	<style id="alps">
 * 		<scheme id="normal.day" />
 * 		<scheme id="normal.night" />
 * 	</style>
 * 	<style id="minis">
 * 		<scheme id="normal.day" />
 * 		<scheme id="carnav.day.grey" />
 * 	</style>
 * 	<tiletypes>
 * 		<tiletype id="maptile" />
 * 		<tiletype id="basetile" />
 * 	</tiletypes>
 * 	<languages>
 * 		<language id="ARA" />
 * 		<language id="CHI" />
 * 		<language id="ENG" />
 * 		<language id="GER" />
 * 		<language id="SPA" />
 * 	</languages>
 * 	<zoomLevels min="0" max="20" />
 * </response>
 */
router.get("/:model/maps/hereinfo/", middlewares.isHereEnabled, getHereBaseInfo);

/**
 * @api {get} /:teamspace/:model/maps/here/:zoomLevel/:gridx/:gridy.png?[query] Here map tile
 * @apiName getHereMapsTile
 * @apiGroup Maps
 * @apiDescription Retrieve a Here Maps map tile image.
 *
 * @apiUse Maps
 * @apiUse MapTile
 * @apiUse HereOptions
 *
 * @apiExample {get} Example usage:
 * GET /acme/00000000-0000-0000-0000-000000000000/maps/here/17/65485/43574.png HTTP/1.1
 */
router.get("/:model/maps/here/:zoomLevel/:gridx/:gridy.png", middlewares.isHereEnabled, getHereMapsTile);

/**
 * @api {get} /:teamspace/:model/maps/hereaerial/:zoomLevel/:gridx/:gridy.png?[query] Here aerial tile
 * @apiName getHereAerialMapsTile
 * @apiGroup Maps
 * @apiDescription Retrieve a Here Maps aerial map tile image.
 *
 * @apiUse Maps
 * @apiUse MapTile
 * @apiUse HereOptions
 *
 * @apiExample {get} Example usage:
 * GET /acme/00000000-0000-0000-0000-000000000000/maps/hereaerial/17/65485/43574.png HTTP/1.1
 */
router.get("/:model/maps/hereaerial/:zoomLevel/:gridx/:gridy.png", middlewares.isHereEnabled, getHereAerialMapsTile);

/**
 * @api {get} /:teamspace/:model/maps/heretraffic/:zoomLevel/:gridx/:gridy.png?[query] Here traffic tile
 * @apiName getHereTrafficTile
 * @apiGroup Maps
 * @apiDescription Retrieve a Here Maps traffic map tile image.
 *
 * @apiUse Maps
 * @apiUse MapTile
 * @apiUse HereOptions
 * @apiUse HereTrafficOptions
 *
 * @apiExample {get} Example usage:
 * GET /acme/00000000-0000-0000-0000-000000000000/maps/heretraffic/17/65485/43574.png HTTP/1.1
 */
router.get("/:model/maps/heretraffic/:zoomLevel/:gridx/:gridy.png", middlewares.isHereEnabled, getHereTrafficTile);

/**
 * @api {get} /:teamspace/:model/maps/heretrafficflow/:zoomLevel/:gridx/:gridy.png?[query] Here traffic layer
 * @apiName getHereTrafficFlowTile
 * @apiGroup Maps
 * @apiDescription Retrieve a Here Maps traffic flow overlay tile image.
 *
 * @apiUse Maps
 * @apiUse MapTile
 * @apiUse HereOptions
 * @apiUse HereTrafficOptions
 *
 * @apiExample {get} Example usage:
 * GET /acme/00000000-0000-0000-0000-000000000000/maps/heretrafficflow/17/65485/43574.png HTTP/1.1
 */
router.get("/:model/maps/heretrafficflow/:zoomLevel/:gridx/:gridy.png", middlewares.isHereEnabled, getHereTrafficFlowTile);

/**
 * @api {get} /:teamspace/:model/maps/hereterrain/:zoomLevel/:gridx/:gridy.png?[query] Here terrain tile
 * @apiName getHereTerrainTile
 * @apiGroup Maps
 * @apiDescription Retrieve a Here Maps terrain map tile image.
 *
 * @apiUse Maps
 * @apiUse MapTile
 * @apiUse HereOptions
 *
 * @apiExample {get} Example usage:
 * GET /acme/00000000-0000-0000-0000-000000000000/maps/hereterrain/17/65485/43574.png HTTP/1.1
 */
router.get("/:model/maps/hereterrain/:zoomLevel/:gridx/:gridy.png", middlewares.isHereEnabled, getHereTerrainTile);

/**
 * @api {get} /:teamspace/:model/maps/herehybrid/:zoomLevel/:gridx/:gridy.png?[query] Here hybrid tile
 * @apiName getHereHybridTile
 * @apiGroup Maps
 * @apiDescription Retrieve a Here Maps hybrid map tile image.
 *
 * @apiUse Maps
 * @apiUse MapTile
 * @apiUse HereOptions
 *
 * @apiExample {get} Example usage:
 * GET /acme/00000000-0000-0000-0000-000000000000/maps/herehybrid/17/65485/43574.png HTTP/1.1
 */
router.get("/:model/maps/herehybrid/:zoomLevel/:gridx/:gridy.png", middlewares.isHereEnabled, getHereHybridTile);

/**
 * @api {get} /:teamspace/:model/maps/heregrey/:zoomLevel/:gridx/:gridy.png?[query] Here grey tile
 * @apiName getHereGreyTile
 * @apiGroup Maps
 * @apiDescription Retrieve a Here Maps grey map tile image.
 *
 * @apiUse Maps
 * @apiUse MapTile
 * @apiUse HereOptions
 *
 * @apiExample {get} Example usage:
 * GET /acme/00000000-0000-0000-0000-000000000000/maps/heregrey/17/65485/43574.png HTTP/1.1
 */
router.get("/:model/maps/heregrey/:zoomLevel/:gridx/:gridy.png", middlewares.isHereEnabled, getHereGreyTile);

/**
 * @api {get} /:teamspace/:model/maps/heregreytransit/:zoomLevel/:gridx/:gridy.png?[query] Here transit (grey) tile
 * @apiName getHereGreyTransitTile
 * @apiGroup Maps
 * @apiDescription Retrieve a Here Maps grey transit map tile image.
 *
 * @apiUse Maps
 * @apiUse MapTile
 * @apiUse HereOptions
 *
 * @apiExample {get} Example usage:
 * GET /acme/00000000-0000-0000-0000-000000000000/maps/heregreytransit/17/65485/43574.png HTTP/1.1
 */
router.get("/:model/maps/heregreytransit/:zoomLevel/:gridx/:gridy.png", middlewares.isHereEnabled, getHereGreyTransitTile);

/**
 * @api {get} /:teamspace/:model/maps/heretruck/:zoomLevel/:gridx/:gridy.png?[query] Here truck restrictions tile
 * @apiName getHereTruckRestrictionsTile
 * @apiGroup Maps
 * @apiDescription Retrieve a Here Maps truck restrictions map tile image.
 *
 * @apiUse Maps
 * @apiUse MapTile
 * @apiUse HereOptions
 *
 * @apiExample {get} Example usage:
 * GET /acme/00000000-0000-0000-0000-000000000000/maps/heretruck/17/65485/43574.png HTTP/1.1
 */
router.get("/:model/maps/heretruck/:zoomLevel/:gridx/:gridy.png", middlewares.isHereEnabled, getHereTruckRestrictionsTile);

/**
 * @api {get} /:teamspace/:model/maps/heretruckoverlay/:zoomLevel/:gridx/:gridy.png?[query] Here truck restrictions layer
 * @apiName getHereTruckRestrictionsOverlayTile
 * @apiGroup Maps
 * @apiDescription Retrieve a Here Maps truck restrictions overlay tile image.
 *
 * @apiUse Maps
 * @apiUse MapTile
 * @apiUse HereOptions
 *
 * @apiExample {get} Example usage:
 * GET /acme/00000000-0000-0000-0000-000000000000/maps/heretruckoverlay/17/65485/43574.png HTTP/1.1
 */
router.get("/:model/maps/heretruckoverlay/:zoomLevel/:gridx/:gridy.png", middlewares.isHereEnabled, getHereTruckRestrictionsOverlayTile);

/**
 * @api {get} /:teamspace/:model/maps/hereadminlabeloverlay/:zoomLevel/:gridx/:gridy.png?[query] Here admin layer
 * @apiName getHereAdminOverlayTile
 * @apiGroup Maps
 * @apiDescription Retrieve a Here Maps administrative labels overlay tile image.
 *
 * @apiUse Maps
 * @apiUse MapTile
 * @apiUse HereOptions
 *
 * @apiExample {get} Example usage:
 * GET /acme/00000000-0000-0000-0000-000000000000/maps/hereadminlabeloverlay/17/65485/43574.png HTTP/1.1
 */
router.get("/:model/maps/hereadminlabeloverlay/:zoomLevel/:gridx/:gridy.png", middlewares.isHereEnabled, getHereAdminLabelOverlayTile);

/**
 * @api {get} /:teamspace/:model/maps/herelabeloverlay/:zoomLevel/:gridx/:gridy.png?[query] Here label layer
 * @apiName getHereLabelOverlayTile
 * @apiGroup Maps
 * @apiDescription Retrieve a Here Maps label overlay tile image.
 *
 * @apiUse Maps
 * @apiUse MapTile
 * @apiUse HereOptions
 *
 * @apiExample {get} Example usage:
 * GET /acme/00000000-0000-0000-0000-000000000000/maps/herelabeloverlay/17/65485/43574.png HTTP/1.1
 */
router.get("/:model/maps/herelabeloverlay/:zoomLevel/:gridx/:gridy.png", middlewares.isHereEnabled, getHereLabelOverlayTile);

/**
 * @api {get} /:teamspace/:model/maps/herelinelabeloverlay/:zoomLevel/:gridx/:gridy.png?[query] Here line & label layer
 * @apiName getHereLineLabelOverlayTile
 * @apiGroup Maps
 * @apiDescription Retrieve a Here Maps line and label overlay tile image of street lines, city centre labels,
 * and item labels.
 *
 * @apiUse Maps
 * @apiUse MapTile
 * @apiUse HereOptions
 *
 * @apiExample {get} Example usage:
 * GET /acme/00000000-0000-0000-0000-000000000000/maps/herelinelabeloverlay/17/65485/43574.png HTTP/1.1
 */
router.get("/:model/maps/herelinelabeloverlay/:zoomLevel/:gridx/:gridy.png", middlewares.isHereEnabled, getHereLineLabelOverlayTile);

/**
 * @api {get} /:teamspace/:model/maps/heretollzone/:zoomLevel/:gridx/:gridy.png?[query] Here toll zone tile
 * @apiName getHereTollZoneTile
 * @apiGroup Maps
 * @apiDescription Retrieve a Here Maps toll zone map tile image.
 *
 * @apiUse Maps
 * @apiUse MapTile
 * @apiUse HereOptions
 *
 * @apiExample {get} Example usage:
 * GET /acme/00000000-0000-0000-0000-000000000000/maps/heretollzone/17/65485/43574.png HTTP/1.1
 */
router.get("/:model/maps/heretollzone/:zoomLevel/:gridx/:gridy.png", middlewares.isHereEnabled, getHereTollZoneTile);

/**
 * @api {get} /:teamspace/:model/maps/herepoi/:zoomLevel/:gridx/:gridy.png?[query] Here POI tile
 * @apiName getHerePOITile
 * @apiGroup Maps
 * @apiDescription Retrieve a Here Maps point-of-interest (POI) map tile image.
 *
 * @apiUse Maps
 * @apiUse MapTile
 * @apiUse HereOptions
 *
 * @apiExample {get} Example usage:
 * GET /acme/00000000-0000-0000-0000-000000000000/maps/herepoi/17/65485/43574.png HTTP/1.1
 */
router.get("/:model/maps/herepoi/:zoomLevel/:gridx/:gridy.png", middlewares.isHereEnabled, getHerePOITile);

/**
 * @api {get} /:teamspace/:model/maps/herebuildings/:lat/:long/tile.json Here building elevation
 * @apiName getHereBuildingsFromLongLat
 * @apiGroup Maps
 * @apiDescription Retrieve building elevation information from Here Maps.
 *
 * @apiUse Maps
 * @apiParam {Number} lat Latitude
 * @apiParam {Number} long Longitude
 *
 * @apiExample {get} Example usage:
 * GET /acme/00000000-0000-0000-0000-000000000000/maps/herebuildings/51.524575/-0.139088/tile.json HTTP/1.1
 *
 * @apiSuccessExample {json} Success-Response
 * HTTP/1.1 200 OK
 * {
 * 	"Rows":[
 * 		{
 * 			"BUILDING_ID":"700567270",
 * 			"FACE_ID":"700567270",
 * 			"FEATURE_TYPE":"2005700",
 * 			"HEIGHT":"22",
 * 			"GROUND_CLEARANCE":null,
 * 			"CF_ID":"1400645341",
 * 			"HAS_3DLM":"N",
 * 			"NAME":null,
 * 			"LAT":"5150745,9,-12,-4,10,-5,2",
 * 			"LON":"-14284,18,14,-9,-12,-9,-2",
 * 			"INNER_LAT":null,
 * 			"INNER_LON":null
 * 		},
 * 		{
 * 			"BUILDING_ID":"700567273",
 * 			"FACE_ID":"700567273",
 * 			"FEATURE_TYPE":"2005700",
 * 			"HEIGHT":"11",
 * 			"GROUND_CLEARANCE":null,
 * 			"CF_ID":"1400645344",
 * 			"HAS_3DLM":"N",
 * 			"NAME":null,
 * 			"LAT":"5150742,-12,-4,-4,11,5,4",
 * 			"LON":"-14252,14,-9,-8,-14,8,9",
 * 			"INNER_LAT":null,
 * 			"INNER_LON":null
 * 		}
 * 	]
 * }
 */
router.get("/:model/maps/herebuildings/:lat/:long/tile.json", middlewares.isHereEnabled, getHereBuildingsFromLongLat);

function listMaps(req, res) {
	const teamspace = req.params.account;

	let maps = [
		{ name: "Open Street Map", layers: [{ name: "Map Tiles", source: "OSM" }] }
	];

	User.isHereEnabled(teamspace).then((hereEnabled) => {
		if (hereEnabled && config.here && config.here.apiKey) {
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
		res.setHeader("Cache-Control", `private, max-age=${config.cachePolicy.maxAge}`);
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
	uri += "?apiKey=" + config.here.apiKey;

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
	let domain = "a.tile.openstreetmap.org";
	let uri = "/" + req.params.zoomLevel + "/" + req.params.gridx + "/" + req.params.gridy + ".png";

	if (config.osm && config.osm.domain) {
		domain = config.osm.domain;
		uri = `/${config.osm.prefix}/${req.params.zoomLevel}/${req.params.gridx}/${req.params.gridy}.png?key=${config.osm.key}`;
	}

	systemLogger.logInfo("Fetching osm map tile: " + domain + uri);
	requestMapTile(req, res, domain, uri);
}

function getHereBaseInfo(req, res) {
	const domain = "1" + hereBaseDomain;
	let uri = "/maptile/2.1/info";
	uri += "?apiKey=" + config.here.apiKey;
	httpsGet.get(domain, uri).then(info =>{
		res.setHeader("Cache-Control", `private, max-age=${config.cachePolicy.maxAge}`);
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
	uri += "&apiKey=" + config.here.apiKey;

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
