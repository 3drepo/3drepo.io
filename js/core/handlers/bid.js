var express = require('express');
var router = express.Router({mergeParams: true});
var config = require("../config.js");
var _ = require('lodash');
var utils = require('../utils');

var Bid = require('../models/bid');
var resHelper = require('../response_codes');
var C = require("../constants");
module.exports = router;

// Create a bid
router.post('/bids.json', checkPremission, createBid);
// List bids
router.get('/bids.json', checkPremission, listBids);
// Award bid
router.post('/bids/:id/award', checkPremission, awardBid);
// get My bid (SC)
router.get('/bids/mine.json', checkPremission, findMyBid);
// accept bid (sc)
router.post('/bids/mine/accept', checkPremission, acceptMyBid);
// update my bid (sc)
router.put('/bids/mine.json', checkPremission, updateMyBid);





var getDbColOptions = function(req){
	return {account: req.params.account, project: req.params.project};
}

function createBid(req, res, next) {
	'use strict';
	
	let place = '/:account/:project/packages/:package/bids.json POST';

	// Instantiate a model

	Bid.count(getDbColOptions(req), { 
		packageName: req.params.packageName, 
		user: req.body.user
	}).then(count => {

		if (count > 0) {
			return Promise.reject({ resCode: resHelper.USER_ALREADY_IN_BID})
		} else {

			let bid = Bid.createInstance(getDbColOptions(req));

			let whitelist = ['user'];

			bid = utils.writeCleanedBodyToModel(whitelist, req.body, bid);
			bid.packageName = req.params.packageName;
			return bid.save();
		}
		
	}).then(bid => {
		resHelper.respond(place, req, res, next, resHelper.OK, bid);

	}).catch(err => {
		resHelper.respond(place, req, res, next, err.resCode || utils.mongoErrorToResCode(err), err.resCode ? {} : err);
	});

}

function listBids(req, res, next){
	'use strict';
	
	let place = '/:account/:project/packages/:package/bids.json GET';
	Bid.findByPackage(getDbColOptions(req), req.params.packageName).then(bids => {
		resHelper.respond(place, req, res, next, resHelper.OK, bids);
	}).catch(err => {
		resHelper.respond(place, req, res, next, utils.mongoErrorToResCode(err), err);
	});
}

function awardBid(req, res, next){
	'use strict';

	let place = '/:account/:project/packages/:package/bids/:id/award POST';

	Bid.findById(getDbColOptions(req), req.params.id).then(bid => {
		if (!bid){
			return Promise.reject({ resCode: resHelper.BID_NOT_FOUND});
		} else if (!bid.accepted) {
			return Promise.reject({ resCode: resHelper.BID_NOT_ACCEPTED})
		} else {

			bid.awarded = true;
			bid.awardedOn = new Date();
			
			return bid.save();
		}

	}).then(bid => {
		resHelper.respond(place, req, res, next, resHelper.OK, bid);
	}).catch(err => {
		resHelper.respond(place, req, res, next, err.resCode || utils.mongoErrorToResCode(err), err.resCode ? {} : err);
	})

}

// Get my bid helper
function _getMyBid(req){
	'use strict';

	let username;

	if (req.session.hasOwnProperty(C.REPO_SESSION_USER)) {
		username = req.session[C.REPO_SESSION_USER].username;
	}

	return Bid.findByUser(getDbColOptions(req), username).then(bid => {
		if (!bid) {
			return Promise.reject({ resCode: resHelper.BID_NOT_FOUND});
		} else {
			return Promise.resolve(bid);
		}
	});
}

function findMyBid(req, res, next){
	'use strict';

	let place = '/:account/:project/packages/:package/bids/mine.json GET';


	_getMyBid(req).then(bid => {
		resHelper.respond(place, req, res, next, resHelper.OK, bid);
	}).catch(err => {
		resHelper.respond(place, req, res, next, err.resCode || utils.mongoErrorToResCode(err), err.resCode ? {} : err);
	});
}


function acceptMyBid(req, res, next){
	'use strict';

	let place = '/:account/:project/packages/:package/bids/mine/accept POST';

	_getMyBid(req).then(bid => {
		
		if(bid.accepted) {
			return Promise.reject({ resCode: resHelper.BID_ALREADY_ACCEPTED })
		} else {
			bid.accepted = true;
			bid.acceptedOn = new Date();

			return bid.save();
		}

	}).then(bid => {
		resHelper.respond(place, req, res, next, resHelper.OK, bid);
	}).catch(err => {
		resHelper.respond(place, req, res, next, err.resCode || utils.mongoErrorToResCode(err), err.resCode ? {} : err);
	});

}


function updateMyBid(req, res, next){
	'use strict';

	let place = '/:account/:project/packages/:package/bids/mine.json PUT';

	_getMyBid(req).then(bid => {
		
		if (!bid.accepted){
			return Promise.reject({ resCode: resHelper.BID_NOT_ACCEPTED})
		} else  {
			let whitelist = ['budget'];
			bid = utils.writeCleanedBodyToModel(whitelist, req.body, bid);
			return bid.save();
		}

	}).then(bid => {
		resHelper.respond(place, req, res, next, resHelper.OK, bid);
	}).catch(err => {
		resHelper.respond(place, req, res, next, err.resCode || utils.mongoErrorToResCode(err), err.resCode ? {} : err);
	});

}

function checkPremission(req, res, next){

	next();
}

