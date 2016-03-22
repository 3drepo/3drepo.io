var express = require('express');
var router = express.Router({mergeParams: true});
var middlewares = require('./middlewares');
//var dbInterface = require("../db/db_interface.js");
//var config = require('../config');
var C = require("../constants");
var responseCodes = require('../response_codes.js');
var Texture = require('../models/texture');
var utils = require('../utils');
var imgEncoder = require('../encoders/img_encoder');

router.get('/:uid.jpg.:subformat?', middlewares.hasReadAccessToProject, (req, res, next) => findByUID('jpg', req, res, next));
router.get('/:uid.bmp.:subformat?', middlewares.hasReadAccessToProject, (req, res, next) => findByUID('bmp', req, res, next));
router.get('/:uid.gif.:subformat?', middlewares.hasReadAccessToProject, (req, res, next) => findByUID('gif', req, res, next));
router.get('/:uid.png.:subformat?', middlewares.hasReadAccessToProject, (req, res, next) => findByUID('png', req, res, next));



function findByUID(format, req, res, next){
	'use strict';


	let dbCol =  {account: req.params.account, project: req.params.project, logger: req[C.REQ_REPO].logger};
	let place = utils.APIInfo(req);
	let options = {};

	Texture.findByUID(dbCol, req.params.uid, options).then(texture => {

		if (texture.textures){

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
			return Promise.reject({ resCode: responseCodes.OBJECT_TYPE_NOT_SUPPORTED});
		}

	}).catch(err => {
		responseCodes.respond(place, req, res, next, err.resCode || utils.mongoErrorToResCode(err), err.resCode ? {} : err);
	});

}

module.exports = router;
