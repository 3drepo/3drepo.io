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
const { routeDecommissioned } = require(`${v5Path}/middleware/common`);

router.get("/:model/maps/", routeDecommissioned("GET", "/v5/teamspaces/:teamspace/projects/:project/containers/:container/maps"));
router.get("/:model/maps/osm/:zoomLevel/:gridx/:gridy.png", routeDecommissioned("GET", "/v5/teamspaces/:teamspace/projects/:project/containers/:container/maps/osm/default/tiles"));
router.get("/:model/maps/hereinfo/", routeDecommissioned("GET", "/v5/teamspaces/:teamspace/projects/:project/containers/:container/maps/here"));
router.get("/:model/maps/here/:zoomLevel/:gridx/:gridy.png", routeDecommissioned("GET", "/v5/teamspaces/:teamspace/projects/:project/containers/:container/maps/here/default/tiles"));
router.get("/:model/maps/hereaerial/:zoomLevel/:gridx/:gridy.png", routeDecommissioned("GET", "/v5/teamspaces/:teamspace/projects/:project/containers/:container/maps/here/aerial/tiles"));
router.get("/:model/maps/heretraffic/:zoomLevel/:gridx/:gridy.png", routeDecommissioned());
router.get("/:model/maps/heretrafficflow/:zoomLevel/:gridx/:gridy.png", routeDecommissioned("GET", "/v5/teamspaces/:teamspace/projects/:project/containers/:container/maps/here/trafficflow/tiles"));
router.get("/:model/maps/hereterrain/:zoomLevel/:gridx/:gridy.png", routeDecommissioned("GET", "/v5/teamspaces/:teamspace/projects/:project/containers/:container/maps/here/terrain/tiles"));
router.get("/:model/maps/herehybrid/:zoomLevel/:gridx/:gridy.png", routeDecommissioned("GET", "/v5/teamspaces/:teamspace/projects/:project/containers/:container/maps/here/hybrid/tiles"));
router.get("/:model/maps/heregrey/:zoomLevel/:gridx/:gridy.png", routeDecommissioned("GET", "/v5/teamspaces/:teamspace/projects/:project/containers/:container/maps/here/grey/tiles"));
router.get("/:model/maps/heretruck/:zoomLevel/:gridx/:gridy.png", routeDecommissioned());
router.get("/:model/maps/heretruckoverlay/:zoomLevel/:gridx/:gridy.png", routeDecommissioned("GET", "/v5/teamspaces/:teamspace/projects/:project/containers/:container/maps/here/truckoverlay/tiles"));
router.get("/:model/maps/herelabeloverlay/:zoomLevel/:gridx/:gridy.png", routeDecommissioned());
router.get("/:model/maps/heretollzone/:zoomLevel/:gridx/:gridy.png", routeDecommissioned("GET", "/v5/teamspaces/:teamspace/projects/:project/containers/:container/maps/here/tollzone/tiles"));
router.get("/:model/maps/herepoi/:zoomLevel/:gridx/:gridy.png", routeDecommissioned("GET", "/v5/teamspaces/:teamspace/projects/:project/containers/:container/maps/here/poi/tiles"));
router.get("/:model/maps/herebuildings/:lat/:long/tile.json", routeDecommissioned());

module.exports = router;
