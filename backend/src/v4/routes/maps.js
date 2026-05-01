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
const { v5Path } = require("../../interop");

const express = require("express");
const router = express.Router({mergeParams: true});
const middlewares = require("../middlewares/middlewares");
const systemLogger = require("../logger.js").systemLogger;
const httpsGet = require("../libs/httpsReq");
const config = require("../config");
const { routeDecommissioned } = require(`${v5Path}/middleware/common`);

router.get("/:model/maps/", routeDecommissioned("GET", "/v5/teamspaces/:teamspace/projects/:project/containers/:container/maps"));
router.get("/:model/maps/osm/:zoomLevel/:gridx/:gridy.png", routeDecommissioned("GET", "/v5/teamspaces/:teamspace/projects/:project/containers/:container/maps/osm/tiles"));
router.get("/:model/maps/hereinfo/", routeDecommissioned("GET", "/v5/teamspaces/:teamspace/projects/:project/containers/:container/maps/here"));
router.get("/:model/maps/here/:zoomLevel/:gridx/:gridy.png", routeDecommissioned("GET", "/v5/teamspaces/:teamspace/projects/:project/containers/:container/maps/here/default/tiles"));
router.get("/:model/maps/hereaerial/:zoomLevel/:gridx/:gridy.png", routeDecommissioned("GET", "/v5/teamspaces/:teamspace/projects/:project/containers/:container/maps/here/aerial/tiles"));
router.get("/:model/maps/heretraffic/:zoomLevel/:gridx/:gridy.png", routeDecommissioned("GET", "/v5/teamspaces/:teamspace/projects/:project/containers/:container/maps/here/traffic/tiles"));
router.get("/:model/maps/heretrafficflow/:zoomLevel/:gridx/:gridy.png", routeDecommissioned("GET", "/v5/teamspaces/:teamspace/projects/:project/containers/:container/maps/here/trafficflow/tiles"));
router.get("/:model/maps/hereterrain/:zoomLevel/:gridx/:gridy.png", routeDecommissioned("GET", "/v5/teamspaces/:teamspace/projects/:project/containers/:container/maps/here/terrain/tiles"));
router.get("/:model/maps/herehybrid/:zoomLevel/:gridx/:gridy.png", routeDecommissioned("GET", "/v5/teamspaces/:teamspace/projects/:project/containers/:container/maps/here/hybrid/tiles"));
router.get("/:model/maps/heregrey/:zoomLevel/:gridx/:gridy.png", routeDecommissioned("GET", "/v5/teamspaces/:teamspace/projects/:project/containers/:container/maps/here/grey/tiles"));
router.get("/:model/maps/heretruck/:zoomLevel/:gridx/:gridy.png", routeDecommissioned("GET", "/v5/teamspaces/:teamspace/projects/:project/containers/:container/maps/here/truck/tiles"));
router.get("/:model/maps/heretruckoverlay/:zoomLevel/:gridx/:gridy.png", routeDecommissioned("GET", "/v5/teamspaces/:teamspace/projects/:project/containers/:container/maps/here/truckoverlay/tiles"));
router.get("/:model/maps/herelabeloverlay/:zoomLevel/:gridx/:gridy.png", routeDecommissioned("GET", "/v5/teamspaces/:teamspace/projects/:project/containers/:container/maps/here/labeloverlay/tiles"));
router.get("/:model/maps/heretollzone/:zoomLevel/:gridx/:gridy.png", routeDecommissioned("GET", "/v5/teamspaces/:teamspace/projects/:project/containers/:container/maps/here/tollzone/tiles"));
router.get("/:model/maps/herepoi/:zoomLevel/:gridx/:gridy.png", routeDecommissioned("GET", "/v5/teamspaces/:teamspace/projects/:project/containers/:container/maps/here/poi/tiles"));
router.get("/:model/maps/herebuildings/:lat/:long/tile.json", middlewares.isHereEnabled, getHereBuildingsFromLongLat);

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
