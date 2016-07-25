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

var express = require("express");
var Subscription = require('../models/subscription');
var responseCodes = require("../response_codes.js");
var router = express.Router({mergeParams: true});
var utils = require('../utils');

router.get("/plans", listPlans);


function listPlans(req, res, next){
	'use strict';
	let place = utils.APIInfo(req);
	let subscriptions = Subscription.getAll().filter(sub => sub.plan !== Subscription.getBasicPlan().plan);
	
	responseCodes.respond(place, req, res, next, responseCodes.OK, subscriptions);
}


module.exports = router;