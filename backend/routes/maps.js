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

const express = require('express');
const router = express.Router({mergeParams: true});
const middlewares = require("../middlewares/middlewares");
const systemLogger = require("../logger.js").systemLogger;
const httpsGet = require('../libs/httpsReq');
const config = require("../config");
const User = require('../models/user');

router.get("/:model/maps/", listMaps);
router.get("/:model/maps/osm/:zoomLevel/:gridx/:gridy.png", getOSMTile);
router.get("/:model/maps/here/:zoomLevel/:gridx/:gridy.png", middlewares.isHereEnabled, getHereMapsTile);
router.get("/:model/maps/hereaerial/:zoomLevel/:gridx/:gridy.png", middlewares.isHereEnabled, getHereAerialMapsTile);
router.get("/:model/maps/heretraffic/:zoomLevel/:gridx/:gridy.png", middlewares.isHereEnabled, getHereTrafficTile);
router.get("/:model/maps/heretrafficflow/:zoomLevel/:gridx/:gridy.png", middlewares.isHereEnabled, getHereTrafficFlowTile);
router.get("/:model/maps/hereterrain/:zoomLevel/:gridx/:gridy.png", middlewares.isHereEnabled, getHereTerrainTile);
router.get("/:model/maps/herehybrid/:zoomLevel/:gridx/:gridy.png", middlewares.isHereEnabled, getHereHybridTile);
router.get("/:model/maps/herebuildings/:lat/:long/tile.json", middlewares.isHereEnabled, getHereBuildingsFromLongLat);

function listMaps(req, res, next) {
	const teamspace = req.params.account;

	let maps = [
		{ name: "Open Street Map", layers: [ { name: "Map Tiles", source: "OSM" } ] }
	];

	User.isHereEnabled(teamspace).then((hereEnabled) => {
		if (hereEnabled && (config.here && config.here.appID && config.here.appCode)) {
			maps = maps.concat([
				{ name: "Here", layers: [ { name: "Map Tiles", source: "HERE" }, { name: "Traffic Flow", source: "HERE_TRAFFIC_FLOW" } ] },
				{ name: "Here (Satellite)", layers: [ { name: "Aerial Imagery", source: "HERE_AERIAL" }, { name: "Traffic Flow", source: "HERE_TRAFFIC_FLOW" } ] }
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
		res.writeHead(200, {'Content-Type': 'image/png' });
		res.write(image);
		res.end();
	}).catch(err => {
		systemLogger.logError(JSON.stringify(err));
		if(err.message){
			res.status(500).json({ message: err.message});
		} else if (err.resCode){
			res.status(err.resCode).json({message: err.message});
		}
	});
}

function getOSMTile(req, res, next){
	//TODO: we may want to ensure the model has access to tiles
	//const url = "https://a.tile.openstreetmap.org/" + req.params.zoomLevel + "/" + req.params.gridx + "/" + req.params.gridy + ".png";
	const domain = "a.tile.openstreetmap.org";
	const uri = "/" + req.params.zoomLevel + "/" + req.params.gridx + "/" + req.params.gridy + ".png"
	systemLogger.logInfo("Fetching osm map tile: " + uri);
	requestMapTile(req, res, domain, uri);
}

function getHereMapsTile(req, res, next){
	const size = 256; // 256 = [256,256]; 512 = [512,512]; Deprecated: 128
	const domain = (1 + ((req.params.gridx + req.params.gridy) % 4)) + ".base.maps.cit.api.here.com";
	let uri = "/maptile/2.1/maptile/newest/normal.day/" + req.params.zoomLevel + "/" + req.params.gridx + "/" + req.params.gridy + "/" + size + "/png8";
	systemLogger.logInfo("Fetching Here map tile: " + uri);
	uri += "?app_id=" + config.here.appID + "&app_code=" + config.here.appCode;
	requestMapTile(req, res, domain, uri);
}

function getHereAerialMapsTile(req, res, next){
	const size = 256; // 256 = [256,256]; 512 = [512,512]; Deprecated: 128
	const domain = (1 + ((req.params.gridx + req.params.gridy) % 4)) + ".aerial.maps.cit.api.here.com";
	let uri = "/maptile/2.1/maptile/newest/satellite.day/" + req.params.zoomLevel + "/" + req.params.gridx + "/" + req.params.gridy + "/" + size + "/png8";
	systemLogger.logInfo("Fetching Here map tile: " + uri);
	uri += "?app_id=" + config.here.appID + "&app_code=" + config.here.appCode;
	requestMapTile(req, res, domain, uri);
}

function getHereTrafficTile(req, res, next){
	const size = 256; // 256 = [256,256]; 512 = [512,512]; Deprecated: 128
	const domain = (1 + ((req.params.gridx + req.params.gridy) % 4)) + ".traffic.maps.cit.api.here.com";
	let uri = "/maptile/2.1/traffictile/newest/normal.day/" + req.params.zoomLevel + "/" + req.params.gridx + "/" + req.params.gridy + "/" + size + "/png8";
	systemLogger.logInfo("Fetching Here traffic flow map tile: " + uri);
	uri += "?app_id=" + config.here.appID + "&app_code=" + config.here.appCode;
	requestMapTile(req, res, domain, uri);
}

function getHereTrafficFlowTile(req, res, next){
	const size = 256; // 256 = [256,256]; 512 = [512,512]; Deprecated: 128
	const domain = (1 + ((req.params.gridx + req.params.gridy) % 4)) + ".traffic.maps.cit.api.here.com";
	let uri = "/maptile/2.1/flowtile/newest/normal.traffic.day/" + req.params.zoomLevel + "/" + req.params.gridx + "/" + req.params.gridy + "/" + size + "/png8";
	systemLogger.logInfo("Fetching Here traffic flow map tile: " + uri);
	uri += "?app_id=" + config.here.appID + "&app_code=" + config.here.appCode;
	requestMapTile(req, res, domain, uri);
}

function getHereTerrainTile(req, res) {
	const size = 256; // 256 = [256,256]; 512 = [512,512]; Deprecated: 128
	const domain = (1 + ((req.params.gridx + req.params.gridy) % 4)) + ".aerial.maps.cit.api.here.com";
	let uri = "/maptile/2.1/maptile/newest/terrain.day/" + req.params.zoomLevel + "/" + req.params.gridx + "/" + req.params.gridy + "/" + size + "/png8";
	systemLogger.logInfo("Fetching Here terrain map tile: " + uri);
	uri += "?app_id=" + config.here.appID + "&app_code=" + config.here.appCode;
	requestMapTile(req, res, domain, uri);
}

function getHereHybridTile(req, res) {
	const size = 256; // 256 = [256,256]; 512 = [512,512]; Deprecated: 128
	const domain = (1 + ((req.params.gridx + req.params.gridy) % 4)) + ".aerial.maps.cit.api.here.com";
	let uri = "/maptile/2.1/maptile/newest/hybrid.day/" + req.params.zoomLevel + "/" + req.params.gridx + "/" + req.params.gridy + "/" + size + "/png8";
	systemLogger.logInfo("Fetching Here hybrid map tile: " + uri);
	uri += "?app_id=" + config.here.appID + "&app_code=" + config.here.appCode;
	requestMapTile(req, res, domain, uri);
}

function getHereBuildingsFromLongLat(req, res, next) {
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
		if(err.message){
			res.status(500).json({ message: err.message});
		} else if (err.resCode){
			res.status(err.resCode).json({message: err.message});
		}
	});
}

module.exports = router;
