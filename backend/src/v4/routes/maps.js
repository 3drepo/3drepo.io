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

const hereBaseDomain = "maps.hereapi.com";
const hereTrafficDomain = "traffic.maps.hereapi.com";

router.get("/:model/maps/", listMaps);
router.get("/:model/maps/osm/:zoomLevel/:gridx/:gridy.png", getOSMTile);
router.get("/:model/maps/hereinfo/", middlewares.isHereEnabled, getHereBaseInfo);
router.get("/:model/maps/here/:zoomLevel/:gridx/:gridy.png", middlewares.isHereEnabled, getHereMapsTile);
router.get("/:model/maps/hereaerial/:zoomLevel/:gridx/:gridy.png", middlewares.isHereEnabled, getHereAerialMapsTile);
router.get("/:model/maps/heretraffic/:zoomLevel/:gridx/:gridy.png", middlewares.isHereEnabled, getHereTrafficTile);
router.get("/:model/maps/heretrafficflow/:zoomLevel/:gridx/:gridy.png", middlewares.isHereEnabled, getHereTrafficFlowTile);
router.get("/:model/maps/hereterrain/:zoomLevel/:gridx/:gridy.png", middlewares.isHereEnabled, getHereTerrainTile);
router.get("/:model/maps/herehybrid/:zoomLevel/:gridx/:gridy.png", middlewares.isHereEnabled, getHereHybridTile);
router.get("/:model/maps/heregrey/:zoomLevel/:gridx/:gridy.png", middlewares.isHereEnabled, getHereGreyTile);
router.get("/:model/maps/heretruck/:zoomLevel/:gridx/:gridy.png", middlewares.isHereEnabled, getHereTruckRestrictionsTile);
router.get("/:model/maps/heretruckoverlay/:zoomLevel/:gridx/:gridy.png", middlewares.isHereEnabled, getHereTruckRestrictionsOverlayTile);
router.get("/:model/maps/herelabeloverlay/:zoomLevel/:gridx/:gridy.png", middlewares.isHereEnabled, getHereLabelOverlayTile);
router.get("/:model/maps/heretollzone/:zoomLevel/:gridx/:gridy.png", middlewares.isHereEnabled, getHereTollZoneTile);
router.get("/:model/maps/herepoi/:zoomLevel/:gridx/:gridy.png", middlewares.isHereEnabled, getHerePOITile);
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

function requestHereMapTile(req, res, domain, resource, style, features) {
	let uri = `/v3/${resource}/mc/${req.params.zoomLevel}/${req.params.gridx}/${req.params.gridy}/png8?apiKey=${config.here.apiKey}`;

	if (features) {
		uri += `&features=${features}`;
	}

	if (style) {
		uri += `&style=${style}`;
	}

	systemLogger.logInfo("Fetching Here map tile: " + domain + uri);
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
	const domain = hereBaseDomain;
	const uri = `/v3/info?apiKey=${config.here.apiKey}`;
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
	requestHereMapTile(req, res, hereBaseDomain, "base");
}

function getHereAerialMapsTile(req, res) {
	requestHereMapTile(req, res, hereBaseDomain, "base", "satellite.day");
}

function getHereTrafficTile(req, res) {
	requestHereMapTile(req, res, hereBaseDomain, "base", "logistics.day");
}

function getHereTrafficFlowTile(req, res) {
	requestHereMapTile(req, res, hereTrafficDomain, "flow");
}

function getHereTerrainTile(req, res) {
	requestHereMapTile(req, res, hereBaseDomain, "base", "topo.day");
}

function getHereHybridTile(req, res) {
	requestHereMapTile(req, res, hereBaseDomain, "base", "explore.satellite.day");
}

function getHereGreyTile(req, res) {
	requestHereMapTile(req, res, hereBaseDomain, "base", "lite.day");
}

function getHereTruckRestrictionsTile(req, res) {
	requestHereMapTile(req, res, hereBaseDomain, "base", "explore.day", "vehicle_restrictions:active_and_inactive");
}

function getHereTruckRestrictionsOverlayTile(req, res) {
	requestHereMapTile(req, res, hereBaseDomain, "blank", undefined, "vehicle_restrictions:active_and_inactive");
}

function getHereLabelOverlayTile(req, res) {
	requestHereMapTile(req, res, hereBaseDomain, "label");
}

function getHereTollZoneTile(req, res) {
	requestHereMapTile(req, res, hereBaseDomain, "base", undefined, "congestion_zones:all");
}

function getHerePOITile(req, res) {
	requestHereMapTile(req, res, hereBaseDomain, "base", undefined, "pois:all");
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
