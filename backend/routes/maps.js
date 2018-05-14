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

router.get("/:model/maps/", listMaps);
router.get("/:model/maps/osm/:zoomLevel/:gridx/:gridy.png", getOSMTile);
router.get("/:model/maps/here/:zoomLevel/:gridx/:gridy.png", getHereMapsTile);
router.get("/:model/maps/hereaerial/:zoomLevel/:gridx/:gridy.png", getHereAerialMapsTile);
router.get("/:model/maps/heretraffic/:zoomLevel/:gridx/:gridy.png", getHereTrafficTile);
router.get("/:model/maps/heretrafficflow/:zoomLevel/:gridx/:gridy.png", getHereTrafficFlowTile);

function listMaps(req, res, next) {
	const maps = [
		{ source: "OSM", name: "Open Street Map", layers: [ { name: "Map Tiles", endpoint: "osm" } ] },
		{ source: "HERE", name: "Here", layers: [ { name: "Base Tiles", endpoint: "here" }/*, { name: "Traffic Flow", endpoint: "heretrafficflow" }*/ ] }
	];
	if (maps.length > 0) {
		res.status(200).json({ maps });
	} else {
		res.status(500).json({ message: "No Maps Available" });
	}
}

function getOSMTile(req, res, next){
	//TODO: we may want to ensure the model has access to tiles
//	const url = "https://a.tile.openstreetmap.org/" + req.params.zoomLevel + "/" + req.params.gridx + "/" + req.params.gridy + ".png";
	const domain = "a.tile.openstreetmap.org";
	const uri = "/" + req.params.zoomLevel + "/" + req.params.gridx + "/" + req.params.gridy + ".png"
	systemLogger.logInfo("Fetching osm map tile: " + uri);
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

function getHereMapsTile(req, res, next){
	const size = 256; // 256 = [256,256]; 512 = [512,512]; Deprecated: 128
	const domain = "1.base.maps.cit.api.here.com";
	let uri = "/maptile/2.1/maptile/newest/normal.day/" + req.params.zoomLevel + "/" + req.params.gridx + "/" + req.params.gridy + "/" + size + "/png8";
	systemLogger.logInfo("Fetching Here map tile: " + uri);
	uri += "?app_id=" + config.here.appID + "&app_code=" + config.here.appCode;
	httpsGet.get(domain, uri).then(image => {
		res.writeHead(200, {'Content-Type': 'image/png' });
		res.write(image);
		res.end();
	}).catch(err => {
		systemLogger.logError(JSON.stringify(err));
		if (err.message) {
			res.status(500).json({ message: err.message });
		} else if (err.resCode) {
			res.status(err.resCode).json({ message: err.message });
		}
	});
}

function getHereAerialMapsTile(req, res, next){
	const size = 256; // 256 = [256,256]; 512 = [512,512]; Deprecated: 128
	const domain = "1.aerial.maps.cit.api.here.com";
	let uri = "/maptile/2.1/maptile/newest/satellite.day/" + req.params.zoomLevel + "/" + req.params.gridx + "/" + req.params.gridy + "/" + size + "/png8";
	systemLogger.logInfo("Fetching Here map tile: " + uri);
	uri += "?app_id=" + config.here.appID + "&app_code=" + config.here.appCode;
	httpsGet.get(domain, uri).then(image => {
		res.writeHead(200, {'Content-Type': 'image/png' });
		res.write(image);
		res.end();
	}).catch(err => {
		systemLogger.logError(JSON.stringify(err));
		if (err.message) {
			res.status(500).json({ message: err.message });
		} else if (err.resCode) {
			res.status(err.resCode).json({ message: err.message });
		}
	});
}

function getHereTrafficTile(req, res, next){
	const size = 256; // 256 = [256,256]; 512 = [512,512]; Deprecated: 128
	const domain = "1.traffic.maps.cit.api.here.com";
	let uri = "/maptile/2.1/traffictile/newest/normal.day/" + req.params.zoomLevel + "/" + req.params.gridx + "/" + req.params.gridy + "/" + size + "/png8";
	systemLogger.logInfo("Fetching Here traffic flow map tile: " + uri);
	uri += "?app_id=" + config.here.appID + "&app_code=" + config.here.appCode;
	httpsGet.get(domain, uri).then(image => {
		res.writeHead(200, {'Content-Type': 'image/png' });
		res.write(image);
		res.end();
	}).catch(err => {
		systemLogger.logError(JSON.stringify(err));
		if (err.message) {
			res.status(500).json({ message: err.message });
		} else if (err.resCode) {
			res.status(err.resCode).json({ message: err.message });
		}
	});
}

function getHereTrafficFlowTile(req, res, next){
	const size = 256; // 256 = [256,256]; 512 = [512,512]; Deprecated: 128
	const domain = "1.traffic.maps.cit.api.here.com";
	let uri = "/maptile/2.1/flowtile/newest/normal.traffic.day/" + req.params.zoomLevel + "/" + req.params.gridx + "/" + req.params.gridy + "/" + size + "/png8";
	systemLogger.logInfo("Fetching Here traffic flow map tile: " + uri);
	uri += "?app_id=" + config.here.appID + "&app_code=" + config.here.appCode;
	httpsGet.get(domain, uri).then(image => {
		res.writeHead(200, {'Content-Type': 'image/png' });
		res.write(image);
		res.end();
	}).catch(err => {
		systemLogger.logError(JSON.stringify(err));
		if (err.message) {
			res.status(500).json({ message: err.message });
		} else if (err.resCode) {
			res.status(err.resCode).json({ message: err.message });
		}
	});
}

module.exports = router;
