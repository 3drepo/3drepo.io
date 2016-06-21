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
// var config = require('../config');
var C = require("../constants");
var responseCodes = require('../response_codes.js');
var Group = require('../models/group');
var utils = require('../utils');
// var uuid = require('node-uuid');
var stringToUUID = utils.stringToUUID;
// var uuidToString = utils.uuidToString;
//var mongo    = require("mongodb");

var History = require('../models/history');

router.get('/', middlewares.hasReadAccessToProject, listGroups);
router.get('/:uid', middlewares.hasWriteAccessToProject, findGroup);
router.put('/:uid', middlewares.hasWriteAccessToProject, updateGroup);
router.post('/', middlewares.hasWriteAccessToProject, createGroup);
router.delete('/:id', middlewares.hasWriteAccessToProject, deleteGroup);


var getDbColOptions = function(req){
	return {account: req.params.account, project: req.params.project, logger: req[C.REQ_REPO].logger};
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

	Group.findByUID(getDbColOptions(req), req.params.uid).then( group => {
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
		History.findByBranch(getDbColOptions(req), 'master').then(history => {

			history.addToCurrent(group._id);
			return history.save();

		}).catch(err => {
			console.log(err);
		});

		responseCodes.respond(place, req, res, next, responseCodes.OK, group.clean());
		next();

	}).catch(err => {
		responseCodes.respond(place, req, res, next, err.resCode || utils.mongoErrorToResCode(err), err.resCode ? {} : err);
		next();
	});
}

function deleteGroup(req, res, next){
	'use strict';

	let place = utils.APIInfo(req);

	Group.findOneAndRemove(getDbColOptions(req), { _id : stringToUUID(req.params.id)}).then( removedDocs => {

		//TO-DO: remove it or keep it, if keep it, push the error
		if(!removedDocs){
			return Promise.reject({resCode: responseCodes.GROUP_NOT_FOUND});
		}

		History.findByBranch(getDbColOptions(req), 'master').then(history => {

			history.removeFromCurrent(stringToUUID(req.params.id));
			return history.save();

		}).catch(err => {
			console.log(err);
		});

		responseCodes.respond(place, req, res, next, responseCodes.OK, { 'status': 'success'});
		//next();	

	}).catch(err => {
		responseCodes.respond(place, req, res, next, err.resCode || utils.mongoErrorToResCode(err), err.resCode ? {} : err);
		//next();	
	});
}

function updateGroup(req, res, next){
	'use strict';

	let place = utils.APIInfo(req);

	Group.findByUID(getDbColOptions(req), req.params.uid).then( group => {

		if(!group){
			return Promise.reject({resCode: responseCodes.GROUP_NOT_FOUND});
		} else {
			group.updateAttrs(req.body);
			return group.save();
		}

	}).then(group => {
		responseCodes.respond(place, req, res, next, responseCodes.OK, group.clean());
	}).catch(err => {
		console.log(err.stack);
		responseCodes.respond(place, req, res, next, err.resCode || utils.mongoErrorToResCode(err), err.resCode ? {} : err);
	});
}

module.exports = router;