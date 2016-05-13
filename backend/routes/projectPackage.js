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
// var config = require("../config.js");
var _ = require('lodash');
var utils = require('../utils');
var middlewares = require('./middlewares');

var ProjectPackage = require('../models/projectPackage');
var dbInterface = require("../db/db_interface.js");

var responseCodes = require('../response_codes');
// var Bid = require('../models/bid');

// var dbInterface     = require("../db_interface.js");
var C               = require("../constants");
var multiparty = require('multiparty');

var getDbColOptions = function(req){
	return {account: req.params.account, project: req.params.project};
};


// Create a package
router.post('/packages.json', middlewares.isMainContractor,  createPackage);
// Update a package
router.put('/packages/:packageName.json', middlewares.isMainContractor,  updatePackage);
// Get all packages
router.get('/packages.json', hasReadPackageAccess, listPackages);
// Get a package by name
router.get('/packages/:packageName.json', hasReadPackageAccess, findPackage);
// Get a package by name
//router.get('/packages/:packageName/termsAndConds.html', hasReadPackageAccess, showTermsAndCondsHTML);
//upload attachment
router.post('/packages/:packageName/attachments', middlewares.isMainContractor, uploadAttachment);
//download attachment
router.get('/packages/:packageName/attachments/:id', hasReadPackageAccess, downloadAttachment);
//delete attachment
router.delete('/packages/:packageName/attachments/:id', middlewares.isMainContractor, deleteAttachment);

function createPackage(req, res, next) {
	'use strict';

	let place = '/:account/:project/packages.json POST';

	// Instantiate a model
	let projectPackage = ProjectPackage.createInstance(getDbColOptions(req));

	let whitelist = ['name', 'site', 'budget', 'completedBy', 'code', 'contact', 'area'];

	projectPackage = utils.writeCleanedBodyToModel(whitelist, req.body, projectPackage);

	//creator is main contractor
	projectPackage.user = req.session[C.REPO_SESSION_USER].username;

	projectPackage.save().then(projectPackage => {
		responseCodes.respond(place, req, res, next, responseCodes.OK, projectPackage);

	}).catch(err => {
		let errCode = utils.mongoErrorToResCode(err);
		responseCodes.respond(place, req, res, next, errCode, err);

	});

}


function _getPackage(req){
	return ProjectPackage.findByName(getDbColOptions(req), req.params.packageName).then(projectPackage => {
		if(projectPackage){
			return Promise.resolve(projectPackage);
		} else {
			return Promise.reject({ resCode: responseCodes.PACKAGE_NOT_FOUND });
		}
	});
}

function updatePackage(req, res, next){
	'use strict';

	let place = '/:account/:project/packages/:packageName.json PUT';

	_getPackage(req).then(projectPackage => {

		let whitelist = ['name', 'site', 'budget', 'completedBy', 'code', 'contact', 'area', 'termsAndConds'];
		projectPackage = utils.writeCleanedBodyToModel(whitelist, req.body, projectPackage);
		return projectPackage.save();

	}).then(projectPackage => {
		responseCodes.respond(place, req, res, next, responseCodes.OK, projectPackage);
	}).catch(err => {
		responseCodes.respond(place, req, res, next, err.resCode || utils.mongoErrorToResCode(err), err.resCode ? {} : err);
	});

}

function findPackage(req, res, next){
	'use strict';

	let place = '/:account/:project/packages/:packageName.json GET';
	let projectPackage;

	_getPackage(req).then(_projectPackage => {

		projectPackage = _projectPackage;
		return projectPackage.getAttachmentMeta();

	}).then(attMeta => {

		let obj = projectPackage.toJSON();
		//populate attachments metadata
		obj.attachments = attMeta;

		responseCodes.respond(place, req, res, next, responseCodes.OK, obj);
	}).catch(err => {
		responseCodes.respond(place, req, res, next, err.resCode || utils.mongoErrorToResCode(err), err.resCode ? {} : err);
	});

}

function uploadAttachment(req, res, next){
	'use strict';

	let place = '/:account/:project/packages/:packageName/attachments POST';

	_getPackage(req).then(projectPackage => {

		var defer = require('deferred')();

		let form = new multiparty.Form();
		let partError;
		let attFieldFound;
		// Parts are emitted when parsing the form
		let promises = [];
		form.on('part', function(part) {

			if (part.filename && part.name === 'attachment') {

				attFieldFound = true;

				promises.push(projectPackage.uploadAttachment(part, {

					filename: part.filename,
					contentType: part.headers['content-type'] || null,
					metadata: { packageName: projectPackage.name }

				}).then(fileMeta => {
					part.resume();
					return Promise.resolve(fileMeta);

				}).catch(err => {
					//defer.reject({ resCode: responseCodes.PROCESS_ERROR(err)});
					return Promise.reject({ resCode: responseCodes.PROCESS_ERROR(err)});
				}));

			} else {
				// reject any other fields or files
				part.resume();
			}

			part.on('error', function(err) {
				partError = err;
			});
		});

		form.on('error', function(err) {
			defer.reject({ resCode: responseCodes.PROCESS_ERROR(err)});
		});

		form.on('close', function() {
			if(partError){
				defer.reject({ resCode: responseCodes.PROCESS_ERROR(partError)});
			} else if(!attFieldFound) {
				defer.reject({ resCode: responseCodes.ATTACHMENT_FIELD_NOT_FOUND });
			}

			Promise.all(promises).then(results => {
				return defer.resolve(results);
			}).catch(err => {
				defer.reject(err);
			});

		});

		form.parse(req);

		return defer.promise;

	}).then(fileMeta => {
		responseCodes.respond(place, req, res, next, responseCodes.OK, fileMeta);
	}).catch(err => {
		responseCodes.respond(place, req, res, next, err.resCode || utils.mongoErrorToResCode(err), err.resCode ? {} : err);
	});

}

function downloadAttachment(req, res, next){
	'use strict';

	let place = '/:account/:project/packages/:packageName/attachments/id GET';

	_getPackage(req).then(projectPackage => {
		return projectPackage.getAttachmentReadStream(req.params.id);
	}).then(attachment => {

		let headers = {
			'Content-Length': attachment.meta.length,
			'Content-Disposition': 'inline;filename=' + attachment.meta.filename,
		};

		if(attachment.meta.contentType){
			headers['Content-Type'] = attachment.meta.contentType;
		}

		res.writeHead(200, headers);
		attachment.readStream.pipe(res);

	}).catch(err => {
		responseCodes.respond(place, req, res, next, err.resCode || utils.mongoErrorToResCode(err), err.resCode ? {} : err);

	});

}

function deleteAttachment(req, res, next){
	'use strict';

	let place = '/:account/:project/packages/:packageName/attachments/id DELETE';

	_getPackage(req).then(projectPackage => {
		return projectPackage.deleteAttachment(req.params.id);
	}).then(() => {
		responseCodes.respond(place, req, res, next, responseCodes.OK, {"status": "success"});
	}).catch(err => {
		responseCodes.respond(place, req, res, next, err.resCode || utils.mongoErrorToResCode(err), err.resCode ? {} : err);
	});
}

function listPackages(req, res, next){
	'use strict';

	let place = '/:account/:project/packages.json GET';


	if(req.role === C.REPO_ROLE_MAINCONTRACTOR){
		// Main contractor list all packages
		ProjectPackage.find(getDbColOptions(req),{}, ProjectPackage.defaultProjection).then(projectPackages => {
			responseCodes.respond(place, req, res, next, responseCodes.OK, projectPackages);
		}).catch(err => {
			let errCode = utils.mongoErrorToResCode(err);
			responseCodes.respond(place, req, res, next, errCode, err);

		});

	} else if(req.role === C.REPO_ROLE_SUBCONTRACTOR) {
		// Sub contractor list invited packages
		dbInterface(req[C.REQ_REPO].logger).getUserBidInfo(req.session[C.REPO_SESSION_USER].username).then(bids => {

			let filteredBids = _.filter(bids, { account : req.params.account, project: req.params.project});
			let packages  = _.map(filteredBids, 'package');

			return ProjectPackage.find(getDbColOptions(req), { name: {$in: packages}}, ProjectPackage.defaultProjection);

		}).then(projectPackages => {
			responseCodes.respond(place, req, res, next, responseCodes.OK, projectPackages);
		}).catch(err => {
			responseCodes.respond(place, req, res, next, err.resCode || utils.mongoErrorToResCode(err), err.resCode ? {} : err);
		});

	} else {
		// impossible path
		responseCodes.respond(place, req, res, next, responseCodes.PROCESS_ERROR(`BUG: req.role is neither ${C.REPO_ROLE_MAINCONTRACTOR} nor ${C.REPO_ROLE_SUBCONTRACTOR}`));
	}


}

// packages/* specific middlewares
function hasReadPackageAccess(req, res, next){

	middlewares.checkRole([/*C.REPO_ROLE_SUBCONTRACTOR, */C.REPO_ROLE_MAINCONTRACTOR], req).then((/*roles*/) => {
		// if role is maincontractor then no more check is needed
		req.role = C.REPO_ROLE_MAINCONTRACTOR;
		return Promise.resolve();

	}).catch(() => {

		req.role = C.REPO_ROLE_SUBCONTRACTOR;
		return middlewares.isSubContractorInvitedHelper(req);
	}).then(() => {
		next();
	}).catch(resCode => {
		responseCodes.respond("Middleware: check has read access", req, res, next, resCode, null, req.params);
	});
}

// function showTermsAndCondsHTML(req, res, next){
// 	'use strict';

// 	let place = '/:account/:project/packages/:packageName/termsAndConds.html GET';

// 	_getPackage(req).then(projectPackage => {
// 		responseCodes.respond(place, req, res, next, responseCodes.OK, projectPackage.getTermsAndCondsHTML());
// 	}).catch(err => {
// 		responseCodes.respond(place, req, res, next, err.resCode || utils.mongoErrorToResCode(err), err.resCode ? {} : err);
// 	});
// }

module.exports = router;
