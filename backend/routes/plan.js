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

"use strict";
const express = require("express");
const responseCodes = require("../response_codes.js");
const router = express.Router({mergeParams: true});
const utils = require("../utils");
const config = require("../config");

/**
 * @api {get} /plans List all Plans
 * @apiName listPlans
 * @apiGroup Plan
 */

router.get("/plans", listPlans);

function listPlans(req, res, next) {
	const place = utils.APIInfo(req);
	const subscriptions = config.subscriptions.plans ?  config.subscriptions.plans : {};
	responseCodes.respond(place, req, res, next, responseCodes.OK, subscriptions, undefined, config.cachePolicy);
}

module.exports = router;
