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
router.put('/bids/mine/termsAndConds', middlewares.isSubContractorInvited, updateTermsAndCond);
// get bid tac
router.get('/bids/mine/termsAndConds', middlewares.isSubContractorInvited, getTermsAndCond);
// accept bid (sc) //to be replaced by /bids/mine/invitation
router.post('/bids/mine/accept', middlewares.isSubContractorInvited, acceptMyBid);
// accept/decline bid (sc)
router.post('/bids/mine/invitation', middlewares.isSubContractorInvited, replyMyBid);
// update my bid (sc)
router.put('/bids/mine.json', middlewares.isSubContractorInvited, updateMyBid);





var getDbColOptions = function(req){
	return {account: req.params.account, project: req.params.project};
};

function createBid(req, res, next) {
	'use strict';
	
	let place = '/:account/:project/packages/:package/bids.json POST';

	// Instantiate a model

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

	return Bid.findByUser(getDbColOptions(req), username, projection).then(bid => {
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
		responseCodes.respond(place, req, res, next, responseCodes.OK, bid);
	}).catch(err => {
		responseCodes.respond(place, req, res, next, err.resCode || utils.mongoErrorToResCode(err), err.resCode ? {} : err);
	});
}


function acceptMyBid(req, res, next){
	'use strict';

	let place = '/:account/:project/packages/:package/bids/mine/accept POST';

	_getMyBid(req).then(bid => {
		
		if(bid.responded()) {
			return Promise.reject({ resCode: responseCodes.BID_ALREADY_ACCEPTED_OR_DECLINED });
		} else {
			bid.accepted = true;
			bid.acceptedOn = new Date();

			return bid.save();
		}

	}).then(bid => {
		responseCodes.respond(place, req, res, next, responseCodes.OK, bid);
	}).catch(err => {
		responseCodes.respond(place, req, res, next, err.resCode || utils.mongoErrorToResCode(err), err.resCode ? {} : err);
	});

}

function replyMyBid(req, res, next){
	'use strict';

	let place = '/:account/:project/packages/:package/bids/mine/invitation POST';

	_getMyBid(req).then(bid => {
		
		if(bid.responded()) {
			return Promise.reject({ resCode: responseCodes.BID_ALREADY_ACCEPTED_OR_DECLINED });
		} else {

			// if (typeof req.body.accept !== 'boolean'){
			// 	return Promise.reject({ resCode: responseCodes.MONGOOSE_VALIDATION_ERROR({ message: 'accept must be true or false'}) })
			// } else {
				bid.accepted = req.body.accept;
				bid.acceptedOn = new Date();
				return bid.save();
			//}
			
		}

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
		
		if (!bid.accepted){
			return Promise.reject({ resCode: responseCodes.BID_NOT_ACCEPTED_OR_DECLINED});
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
		
		bid.termsAndConds = req.body;
		bid.markModified('termsAndConds.items.values')
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