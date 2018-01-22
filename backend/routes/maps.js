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

router.get("/:model/maps/osm/:zoomLevel/:gridx/:gridy.png", middlewares.hasReadAccessToModel, getOSMTile);

function getOSMTile(req, res, next){
	//TODO: we may want to ensure the model has access to tiles
	httpsGet.get("https://a.tile.openstreetmap.org/" + req.params.zoomLevel + "/" + req.params.gridx + "/" + req.params.gridy + ".png").then(image =>{
		res.writeHead(200, {'Content-Type': 'image/png' });
		res.write(image);
		res.end();
	}).catch(err => {
		if(err.message){
			res.status(500).json({ message: err.message});
		} else if (err.resCode){
			res.status(err.resCode).json({message: err.message});
		}
	});

}

module.exports = router;
