var express = require('express');
var router = express.Router({mergeParams: true});
var middlewares = require('./middlewares');
var dbInterface = require("../db/db_interface.js");

var C = require("../constants");
var responseCodes = require('../response_codes.js');
var Mesh = require('../models/mesh');
var utils = require('../utils');
var srcEncoder = require('../encoders/src_encoder');

router.get('/:uid.src', middlewares.hasReadAccessToProject, findByUID);

function findByUID(req, res, next){
	'use strict';
	
	let dbCol =  {account: req.params.account, project: req.params.project, logger: req[C.REQ_REPO].logger};
	let place = utils.APIInfo(req);

	Mesh.findByUID(dbCol, req.params.uid).then(mesh => {
		
		if(!mesh){
			return Promise.reject({resCode: responseCodes.OBJECT_NOT_FOUND});
		}

		let tex_uuid = null;
		if (req.query.tex_uuid) {
			tex_uuid = req.query.tex_uuid;
		}

		req.params.format = 'src';
		let renderedObj = srcEncoder.render(req.params.project, mesh, tex_uuid, req.params.subformat, req[C.REQ_REPO].logger);
		
		responseCodes.respond(place, req, res, next, responseCodes.OK, renderedObj);

	}).catch(err => {
		console.log(err);
		responseCodes.respond(place, req, res, next, err.resCode || utils.mongoErrorToResCode(err), err.resCode ? {} : err);
	});
}

module.exports = router;
