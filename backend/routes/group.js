var express = require('express');
var router = express.Router({mergeParams: true});
var middlewares = require('./middlewares');
//var dbInterface = require("../db/db_interface.js");
var config = require('../config');
var C = require("../constants");
var responseCodes = require('../response_codes.js');
var Group = require('../models/group');
var utils = require('../utils');
var uuid = require('node-uuid');
var stringToUUID = utils.stringToUUID;
var uuidToString = utils.uuidToString;
//var mongo    = require("mongodb");
// assuming master branch for now
var dbInterface = require("../db/db_interface.js");

router.get('/', middlewares.hasReadAccessToProject, listGroups);
router.get('/:uid', middlewares.hasWriteAccessToProject, findGroup);
router.post('/', middlewares.hasWriteAccessToProject, createGroup);
router.delete('/:id', middlewares.hasWriteAccessToProject, deleteGroup);


var getDbColOptions = function(req){
	return {account: req.params.account, project: req.params.project};
};

function listGroups(req, res, next){
	'use strict';

	let place = utils.APIInfo(req);

	Group.listGroups(getDbColOptions(req)).then(groups => {
		groups.forEach((group, i) => {
			groups[i] = group.clean();
		});

		responseCodes.respond(place, req, res, next, responseCodes.OK, groups);
		next();

	}).catch(err => {

		console.log(err.stack);
		responseCodes.respond(place, req, res, next, err.resCode || utils.mongoErrorToResCode(err), err.resCode ? {} : err);
		next();

	});
	
}

function findGroup(req, res, next){

	'use strict';
	let place = utils.APIInfo(req);
	console.log(req.params.uid)
	Group.findByUID(getDbColOptions(req), req.params.id).then( group => {
		if(!group){
			return Promise.reject({resCode: responseCodes.GROUP_NOT_FOUND});
		} else {
			return Promise.resolve(group);
		}
	}).then(group => {
		responseCodes.respond(place, req, res, next, responseCodes.OK, group.clean());
	}).catch(err => {
		console.log(err.stack);
		responseCodes.respond(place, req, res, next, err.resCode || utils.mongoErrorToResCode(err), err.resCode ? {} : err);
	});
}

function createGroup(req, res, next){

	'use strict';
	let place = utils.APIInfo(req);

	let group = Group.createGroup(getDbColOptions(req), req.body);

	group.save().then(group => {

		//TO-DO: remove it or keep it, if keep it, push the error
		dbInterface(req[C.REQ_REPO].logger).addToCurrentList(req.params.account, req.params.project, 'master', utils.uuidToMongoBuf3(group._id), err => {
			console.log(err)
		}); 

		responseCodes.respond(place, req, res, next, responseCodes.OK, group.clean());
		next();

	}).catch(err => {
		console.log(err.stack);
		responseCodes.respond(place, req, res, next, err.resCode || utils.mongoErrorToResCode(err), err.resCode ? {} : err);
		next();
	});

}

function deleteGroup(req, res, next){
	'use strict';

	let place = utils.APIInfo(req);
	console.log('place', place);
	console.log(stringToUUID(req.params.id));

	Group.findOneAndRemove(getDbColOptions(req), { _id : stringToUUID(req.params.id)}).then( () => {
		console.log(stringToUUID(req.params.id))
		//TO-DO: remove it or keep it, if keep it, push the error
		dbInterface(req[C.REQ_REPO].logger).removeFromCurrentList(req.params.account, req.params.project, 'master', stringToUUID(req.params.id), err => {
			console.log(err)
		}); 

		responseCodes.respond(place, req, res, next, responseCodes.OK, { 'status': 'success'});
		//next();	

	}).catch(err => {

		console.log(err);
		responseCodes.respond(place, req, res, next, err.resCode || utils.mongoErrorToResCode(err), err.resCode ? {} : err);
		//next();	
	})
}

module.exports = router;