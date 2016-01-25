// This API helper will only be loaded if config.test_helper_api is true

var express = require('express');
var router = express.Router({mergeParams: true});
// var config = require("../config.js");
var C               = require("../constants");
var dbInterface     = require("../db_interface.js");

router.post('/roles/main-contractor',  createMCRole);
router.post ('/roles/main-contractor/grant', grantUserRole);

module.exports = router;

function createMCRole(req, res){

	dbInterface(req[C.REQ_REPO].logger).createMainContractorRole(req.body.account, req.body.project).then(() => {
		res.status(200).json({status: 'OK'});
	}).catch( err => {
		res.status(500).json(err);
	});
}


function grantUserRole(req, res){
	dbInterface(req[C.REQ_REPO].logger).grantUserMainContractorRole(req.body.user, req.body.account).then(() => {
		res.status(200).json({status: 'OK'});
	}).catch( err => {
		res.status(500).json(err);
	});
}

