var express = require('express');
var router = express.Router({mergeParams: true});
var middlewares = require('./middlewares');

var C = require("../constants");
var responseCodes = require('../response_codes.js');
var ProjectSetting = require('../models/projectSetting');
var utils = require('../utils');

router.put('/settings/map-tile', middlewares.hasWriteAccessToProject, updateMapTileSettings);

function updateMapTileSettings(req, res, next){
	'use strict';


	let place = utils.APIInfo(req);
	let dbCol =  {account: req.params.account, project: req.params.project, logger: req[C.REQ_REPO].logger};

	return ProjectSetting.findById(dbCol, req.params.project).then(projectSetting => {
		return projectSetting.updateMapTileCoors(req.body);
	}).then(projectSetting => {
		responseCodes.respond(place, req, res, next, responseCodes.OK, projectSetting);
	}).catch(err => {
		responseCodes.respond(place, req, res, next, err.resCode || utils.mongoErrorToResCode(err), err.resCode ? {} : err);
	});
}

module.exports = router;
