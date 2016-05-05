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
// var _ = require('lodash');
var utils = require('../utils');
var middlewares = require('./middlewares');

var Bid = require('../models/bid');
var responseCodes = require('../response_codes');
var C = require("../constants");
module.exports = router;

//Every API list below has to log in to access
router.use(middlewares.loggedIn);

// Create a bid
router.post('/bids.json', middlewares.isMainContractor,  createBid);
// List bids
router.get('/bids.json', middlewares.isMainContractor,  listBids);
// Award bid
router.post('/bids/:id/award', middlewares.isMainContractor,  awardBid);
// get My bid (SC)
router.get('/bids/mine.json', middlewares.isSubContractorInvited, findMyBid);
// update bid tac
router.put('/bids/mine/termsAndConds.json', middlewares.isSubContractorInvited, updateTermsAndCond);
// get bid tac
router.get('/bids/mine/termsAndConds.json', middlewares.isSubContractorInvited, getTermsAndCond);
// accept bid (sc) //to be replaced by /bids/mine/invitation
router.post('/bids/mine/accept', middlewares.isSubContractorInvited, acceptMyBid);
// accept/decline bid (sc)
router.post('/bids/mine/invitation', middlewares.isSubContractorInvited, respondMyBid);
// update my bid (sc)
router.put('/bids/mine.json', middlewares.isSubContractorInvited, updateMyBid);
//submit my bid
router.post('/bids/mine/submit', middlewares.isSubContractorInvited, submitMyBid);




var getDbColOptions = function(req){
	return {account: req.params.account, project: req.params.project};
};

function createBid(req, res, next) {
	'use strict';
	
	let place = '/:account/:project/packages/:package/bids.json POST';

	// Instantiate a model
	// TO-DO: check req.body.user is a valid user in database

	Bid.count(getDbColOptions(req), { 
		packageName: req.params.packageName, 
		user: req.body.user
	}).then(count => {

		if (count > 0) {
			return Promise.reject({ resCode: responseCodes.USER_ALREADY_IN_BID});
		} else {

			let bid = Bid.createInstance(getDbColOptions(req));

			let whitelist = ['user'];

			bid = utils.writeCleanedBodyToModel(whitelist, req.body, bid);
			bid.packageName = req.params.packageName;

			//use default template for t&c
			bid.termsAndConds = require('../models/templates/json/termsAndConds.json');
			
			return bid.save();
		}
		
	}).then(bid => {
		responseCodes.respond(place, req, res, next, responseCodes.OK, bid);

	}).catch(err => {
		responseCodes.respond(place, req, res, next, err.resCode || utils.mongoErrorToResCode(err), err.resCode ? {} : err);
	});

}

function listBids(req, res, next){
	'use strict';
	
	let place = '/:account/:project/packages/:package/bids.json GET';
	Bid.findByPackage(getDbColOptions(req), req.params.packageName).then(bids => {

		bids.forEach((bid, index) => {
			bids[index] = bid.toJSON({virtuals : true });
		});

		responseCodes.respond(place, req, res, next, responseCodes.OK, bids);
	}).catch(err => {
		responseCodes.respond(place, req, res, next, utils.mongoErrorToResCode(err), err);
	});
}

function awardBid(req, res, next){
	'use strict';

	let place = '/:account/:project/packages/:package/bids/:id/award POST';


	Bid.findById(getDbColOptions(req), req.params.id).then(bid => {
		if (!bid){
			return Promise.reject({ resCode: responseCodes.BID_NOT_FOUND});
		} else {
			return bid.award();
		}

	}).then(bid => {
		responseCodes.respond(place, req, res, next, responseCodes.OK, bid);
	}).catch(err => {
		responseCodes.respond(place, req, res, next, err.resCode || utils.mongoErrorToResCode(err), err.resCode ? {} : err);
	});

}


// Get my bid helper
function _getMyBid(req, projection){
	'use strict';

	let username;

	if (req.session.hasOwnProperty(C.REPO_SESSION_USER)) {
		username = req.session[C.REPO_SESSION_USER].username;
	}

	let dbCol = getDbColOptions(req);
	// original account
	dbCol.packageAccount = dbCol.account;
	// workspace account
	dbCol.account = username;
	dbCol.workspace = true;
	
	return Bid.findByUser(dbCol, username, req.params.packageName, projection).then(bid => {
		if (!bid) {
			return Promise.reject({ resCode: responseCodes.BID_NOT_FOUND});
		} else {
			return Promise.resolve(bid);
		}
	});
}

function findMyBid(req, res, next){
	'use strict';

	let place = '/:account/:project/packages/:package/bids/mine.json GET';


	_getMyBid(req).then(bid => {
		responseCodes.respond(place, req, res, next, responseCodes.OK, bid.toJSON({ virtuals : true }));
	}).catch(err => {
		responseCodes.respond(place, req, res, next, err.resCode || utils.mongoErrorToResCode(err), err.resCode ? {} : err);
	});
}


function acceptMyBid(req, res){
	'use strict';
	res.status(400).json({ "message": "This API is deprecated. Use /:account/:project/packages/:package/bids/mine/invitation instead"});
}


function respondMyBid(req, res, next){
	'use strict';

	let place = '/:account/:project/packages/:package/bids/mine/invitation POST';

	_getMyBid(req).then(bid => {
		return bid.respond(req.body.accept);
	}).then(bid => {
		responseCodes.respond(place, req, res, next, responseCodes.OK, bid);
	}).catch(err => {
		responseCodes.respond(place, req, res, next, err.resCode || utils.mongoErrorToResCode(err), err.resCode ? {} : err);
	});
}


function updateMyBid(req, res, next){
	'use strict';

	let place = '/:account/:project/packages/:package/bids/mine.json PUT';

	_getMyBid(req).then(bid => {
		
		if(!bid.updateable()){
			return Promise.reject({ resCode: responseCodes.BID_NOT_UPDATEABLE });
		} else  {
			let whitelist = ['budget'];
			bid = utils.writeCleanedBodyToModel(whitelist, req.body, bid);
			return bid.save();
		}

	}).then(bid => {
		responseCodes.respond(place, req, res, next, responseCodes.OK, bid);
	}).catch(err => {
		responseCodes.respond(place, req, res, next, err.resCode || utils.mongoErrorToResCode(err), err.resCode ? {} : err);
	});

}


function updateTermsAndCond(req, res, next){
	'use strict';

	let place = '/:account/:project/packages/:package/bids/mine/termsAndConds PUT';

	_getMyBid(req).then(bid => {
		
		if(!bid.updateable()){
			return Promise.reject({ resCode: responseCodes.BID_NOT_UPDATEABLE });
		}

		bid.termsAndConds = req.body;
		bid.markModified('termsAndConds.items.values');
		return bid.save();

	}).then(bid => {
		responseCodes.respond(place, req, res, next, responseCodes.OK, bid.termsAndConds);
	}).catch(err => {
		responseCodes.respond(place, req, res, next, err.resCode || utils.mongoErrorToResCode(err), err.resCode ? {} : err);
	});
}

function getTermsAndCond(req, res, next){
	'use strict';

	let place = '/:account/:project/packages/:package/bids/mine/termsAndConds GET';

	_getMyBid(req, { termsAndConds: 1}).then(bid => {
		responseCodes.respond(place, req, res, next, responseCodes.OK, bid.termsAndConds);
	}).catch(err => {
		responseCodes.respond(place, req, res, next, err.resCode || utils.mongoErrorToResCode(err), err.resCode ? {} : err);
	});
}


function submitMyBid(req, res, next){
	'use strict';

	let place = '/:account/:project/packages/:package/bids/mine/submit POST';
	let projection = {};

	// project on all fields as we have to move them to package space
	_getMyBid(req, projection).then(bid => {
		return bid.submit();
	}).then(bid => {
		bid.termsAndConds = undefined;
		responseCodes.respond(place, req, res, next, responseCodes.OK, bid);
	}).catch(err => {
		responseCodes.respond(place, req, res, next, err.resCode || utils.mongoErrorToResCode(err), err.resCode ? {} : err);
	});
}