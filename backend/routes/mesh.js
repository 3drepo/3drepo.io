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
var config = require('../config');
var C = require("../constants");
var responseCodes = require('../response_codes.js');
var Mesh = require('../models/mesh');
var Scene = require('../models/scene');
var Stash3DRepo = require('../models/stash3DRepo');
var History = require('../models/history');
var utils = require('../utils');
var srcEncoder = require('../encoders/src_encoder');
var stash = require('../models/helper/stash');
var repoGraphScene = require("../repo/repoGraphScene.js");
var x3dEncoder = require("../encoders/x3dom_encoder");

router.get('/:uid.src.:subformat?', middlewares.hasReadAccessToProject, findByUID);
router.get('/revision/:rid/:sid.src.:subformat?', middlewares.hasReadAccessToProject, findByRevision);

router.get('/revision/master/head.x3d.mp', middlewares.hasReadAccessToProject, generateX3DofHead);
router.get('/revision/:id.x3d.mp', middlewares.hasReadAccessToProject, generateX3D);


function findByUID(req, res, next){
	'use strict';

	let dbCol =  {account: req.params.account, project: req.params.project, logger: req[C.REQ_REPO].logger};
	let place = utils.APIInfo(req);
	let options = {};
	//options.stash = _getStashOptions(dbCol, 'src', req.url);
	//options.filename = `/${dbCol.account}/${dbCol.project}${req.url}`;

	let filename = `/${dbCol.account}/${dbCol.project}${req.url}`;

	let start = Promise.resolve(false);

	if(!config.disableCache){
		start = stash.findStashByFilename(dbCol, 'src', filename);
	}

	start.then(buffer => {

		if(!buffer) {
			return Mesh.findByUID(dbCol, req.params.uid, options).then(mesh => {
				req.params.format = 'src';
				let renderedObj = srcEncoder.render(req.params.project, mesh, req.query.tex_uuid || null, req.params.subformat, req[C.REQ_REPO].logger);

				if (!config.disableStash)
				{
					return stash.saveStashByFilename(dbCol, 'src', filename, renderedObj).then(() => {
						return Promise.resolve(renderedObj);
					});
				} else {
					return Promise.resolve(renderedObj);
				}
			});

		} else {
			return Promise.resolve(buffer);
		}

	}).then(data => {
		req.params.format = 'src';
		responseCodes.respond(place, req, res, next, responseCodes.OK, data);
	}).catch(err => {
		console.log(err.stack);
		responseCodes.respond(place, req, res, next, err.resCode || utils.mongoErrorToResCode(err), err.resCode ? {} : err);
	});


}

function findByRevision(req, res, next){
	'use strict';

	let dbCol =  {account: req.params.account, project: req.params.project, logger: req[C.REQ_REPO].logger};
	let place = utils.APIInfo(req);
	let options = {};
	// options.stash = _getStashOptions(dbCol, 'src', req.url);
	let filename = `/${dbCol.account}/${dbCol.project}${req.url}`;
	let start = Promise.resolve(false);

	if(!config.disableCache){
		start = stash.findStashByFilename(dbCol, 'src', filename);
	}


	start.then(buffer => {

		if(!buffer) {

			return Mesh.findByRevision(dbCol, req.params.rid, req.params.sid, options).then(mesh => {

				req.params.format = 'src';
				let renderedObj = srcEncoder.render(req.params.project, mesh, req.query.tex_uuid || null, req.params.subformat, req[C.REQ_REPO].logger);

				stash.saveStashByFilename(dbCol, 'src', filename, renderedObj).then(() => {
					return Promise.resolve(renderedObj);
				});
			});

		} else {
			return Promise.resolve(buffer);
		}

	}).then(data => {
		req.params.format = 'src';
		responseCodes.respond(place, req, res, next, responseCodes.OK, data);
	}).catch(err => {
		console.log(err.stack);
		responseCodes.respond(place, req, res, next, err.resCode || utils.mongoErrorToResCode(err), err.resCode ? {} : err);
	});



	// Mesh.findByRevision(dbCol, req.params.rid, req.params.sid, options).then(mesh => {

	// 	req.params.format = 'src';
	// 	let renderedObj = mesh;
	// 	if(!options.stash){
	// 		// generate src format if obj not from stash
	// 		renderedObj = srcEncoder.render(req.params.project, mesh, req.query.tex_uuid || null, req.params.subformat, req[C.REQ_REPO].logger);
	// 	}

	// 	responseCodes.respond(place, req, res, next, responseCodes.OK, renderedObj);
	// }).catch(err => {
	// 	console.log(err.stack);
	// 	responseCodes.respond(place, req, res, next, err.resCode || utils.mongoErrorToResCode(err), err.resCode ? {} : err);
	// });
}

function getSceneObject(account, project, history){
	'use strict';

	let projection = {
		vertices: 0,
		normals: 0,
		faces: 0,
		data: 0,
		uv_channels: 0
	};

	return Stash3DRepo.find({account, project}, {rev_id: history._id}, projection).then(objs => {

		if(!objs.length){
			return Scene.find({account, project}, { _id: {$in: history.current }}, projection);
		}

		return objs;

	}).then(objs => {	

		let getCoordOffSets = [];

		objs.forEach((obj, i) => {
			objs[i] = obj.toObject();
			
			if (objs[i].type === 'ref'){

				let refAccount = objs[i].owner || account;
				let promise = History.findByBranch({
						account: refAccount, 
						project: objs[i].project 
					}, utils.uuidToString(objs[i]._rid), {
						coordOffset: 1
					}
				).then(history => {
					objs[i].coordOffset = (history && history.coordOffset) || [0,0,0];
				});

				getCoordOffSets.push(promise);
			}
		});

		return Promise.all(getCoordOffSets).then(() => objs);
	});
}


function generateX3D(req, res, next){
	'use strict';

	let place = utils.APIInfo(req);
	let account = req.params.account;
	let project = req.params.project;
	let id = req.params.id;

	let findHistory;

	if(utils.isUUID(id)){
		findHistory = History.findByUID;
	} else {
		findHistory = History.findByTag;
	}

	findHistory({account, project}, id).then(history => {

		if(!history){
			return Promise.reject(responseCodes.PROJECT_HISTORY_NOT_FOUND);
		}

		return getSceneObject(account, project, history);

	}).then(objs => {

		let xml = x3dEncoder.render(account, project, repoGraphScene(req[C.REQ_REPO].logger).decode(objs), req[C.REQ_REPO].logger);
		responseCodes.respond(place, req, res, next, responseCodes.OK, xml);

	}).catch(err => {
		console.log(err.stack);
		responseCodes.respond(place, req, res, next, err.resCode || utils.mongoErrorToResCode(err), err.resCode ? {} : err);
	});
}



function generateX3DofHead(req, res ,next){
	'use strict';

	let place = utils.APIInfo(req);
	let account = req.params.account;
	let project = req.params.project;

	History.findByBranch({account, project}, 'master').then(history => {

		if(!history){
			return Promise.reject(responseCodes.PROJECT_HISTORY_NOT_FOUND);
		}

		return getSceneObject(account, project, history);

	}).then(objs => {

		//console.log(objs);

		let xml = x3dEncoder.render(account, project, repoGraphScene(req[C.REQ_REPO].logger).decode(objs), req[C.REQ_REPO].logger);
		responseCodes.respond(place, req, res, next, responseCodes.OK, xml);

	}).catch(err => {
		console.log(err.stack);
		responseCodes.respond(place, req, res, next, err.resCode || utils.mongoErrorToResCode(err), err.resCode ? {} : err);
	});
}

module.exports = router;
