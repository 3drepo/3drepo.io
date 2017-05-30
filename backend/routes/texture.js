/**
 *  Copyright (C) 2014 3D Repo Ltd
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


var express = require('express');
var router = express.Router({mergeParams: true});
var middlewares = require('./middlewares');
var C = require("../constants");
var responseCodes = require('../response_codes.js');
var Texture = require('../models/texture');
var utils = require('../utils');
var imgEncoder = require('../encoders/img_encoder');

router.get('/:uid.jpg.:subformat?', middlewares.hasReadAccessToModel, (req, res, next) => findByUID('jpg', req, res, next));
router.get('/:uid.bmp.:subformat?', middlewares.hasReadAccessToModel, (req, res, next) => findByUID('bmp', req, res, next));
router.get('/:uid.gif.:subformat?', middlewares.hasReadAccessToModel, (req, res, next) => findByUID('gif', req, res, next));
router.get('/:uid.png.:subformat?', middlewares.hasReadAccessToModel, (req, res, next) => findByUID('png', req, res, next));



function findByUID(format, req, res, next){
	'use strict';


	let dbCol =  {account: req.params.account, model: req.params.model, logger: req[C.REQ_REPO].logger};
	let place = utils.APIInfo(req);
	let options = {};

	Texture.findByUID(dbCol, req.params.uid, options).then(texture => {

		if (texture.textures && texture.textures[req.params.uid] && texture.textures[req.params.uid].data && texture.textures[req.params.uid].data.buffer){

			if (req.params.subformat === "heightmap"){

				imgEncoder.createHeightMap(format, texture.textures[req.params.uid].data.buffer, function(err, grayImage) {
					if (err.value) {
						return Promise.reject(err);
					}

					res.write(grayImage);
					res.end();
				});

			} else {
				res.write(texture.textures[req.params.uid].data.buffer);
				res.end();
			}

		} else {
			return Promise.reject({ resCode: responseCodes.TEXTURE_NOT_FOUND});
		}

	}).catch(err => {
		responseCodes.respond(place, req, res, next, err.resCode || utils.mongoErrorToResCode(err), err.resCode ? {} : err);
	});

}

module.exports = router;
