var express = require('express');
var router = express.Router({mergeParams: true});
var config = require("../config.js");
var _ = require('lodash');
var utils = require('../utils');

var Bid = require('../models/bid');
var resHelper = require('../response_codes');

module.exports = router;

// Create a bid
router.post('/bids.json', checkPremission, createBid);
// List bids
router.get('/bids.json', checkPremission, listBids);
// Award bid
router.post('/bids/:id/award', checkPremission, awardBid);


var getDbColOptions = function(req){
	return {account: req.params.account, project: req.params.project};
}

function createBid(req, res, next) {
	'use strict';
	
	let place = '/:account/:project/packages/:package/bids.json POST';

	let whitelist = ['user'];

	// Instantiate a model
	let bid = Bid.createInstance(getDbColOptions(req));

	let cleanedReq = _.pick(req.body, whitelist);

	_.forEach(cleanedReq, (value, key) => {
		bid[key] = value;
	});

	bid.packageName = req.params.packageName;

	bid.save().then(bid => {
		resHelper.respond(place, req, res, next, resHelper.OK, bid);

	}).catch(err => {
		let errCode = utils.mongoErrorToResCode(err);
		resHelper.respond(place, req, res, next, errCode, err);

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

function checkPremission(req, res, next){
	next();
}

