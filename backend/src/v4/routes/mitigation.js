/**
 *  Copyright (C) 2020 3D Repo Ltd
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
const router = express.Router({mergeParams: true});
const middlewares = require("../middlewares/middlewares");
const responseCodes = require("../response_codes.js");
const utils = require("../utils");
const Mitigation = require("../models/mitigation");

/**
 * @api {get} /:teamspace/mitigations/criteria Get mitigation criteria
 * @apiName findMitigationCriteria
 * @apiGroup Risks
 * @apiDescription Returns all mitigations criteria from mitigation suggestions.
 *
 * @apiParam {String} teamspace Name of teamspace
 *
 * @apiExample {get} Example usage:
 * GET /acme/mitigations/criteria HTTP/1.1
 *
 * @apiSuccessExample {json} Success-Response.
 * HTTP/1.1 200 OK
 * {
 * 	"associated_activity":[
 * 		"All construction",
 * 		"Site tests",
 * 		"Logistics"
 * 	],
 * 	"category":[
 * 		"safety_electricity"
 * 	],
 * 	"element":[
 * 		"Doors",
 * 		"Floors",
 * 		"Pipes",
 * 		"Vents",
 * 		"Walls"
 * 	],
 * 	"location_desc":[
 * 		"Tower 1 - Level 0",
 * 		"Tower 1 - Level 1",
 * 		"Tower 1 - Level 2",
 * 		"Tower 2 - Level 0",
 * 		"Tower 2 - Level 1",
 * 		"Tower 3 - Level 0",
 * 		"Tower 3 - Level 1",
 * 		"Tower 3 - Level 2"
 * 	],
 * 	"mitigation_stage":[
 * 		"Preliminary Design",
 * 		"Detail Design",
 * 		"Preconstruction",
 * 		"Site work and Change Control"
 * 	],
 * 	"mitigation_type":[
 * 		"Eliminate",
 * 		"Reduce",
 * 		"Control",
 * 		"Inform"
 * 	],
 * 	"risk_factor":[
 * 		"Factor 2",
 * 		"Factor 5",
 * 		"Factor 8"
 * 	],
 * 	"scope":[
 * 		"General concrete",
 * 		"In situ concrete"
 * 	]
 * }
 */
router.get("/mitigations/criteria", middlewares.isTeamspaceMember, findMitigationCriteria);

/**
 * @api {post} /:teamspace/mitigations Find mitigation suggestions
 * @apiName findMitigationSuggestions
 * @apiGroup Risks
 * @apiDescription Returns a list of suggestions for risk mitigation based on
 * given criteria.
 *
 * @apiParam {String} teamspace Name of teamspace
 * @apiParam (Request body) {String} [associated_activity] Risk associated activity
 * @apiParam (Request body) {String} [category] Risk category
 * @apiParam (Request body) {String} [element] Risk element type
 * @apiParam (Request body) {String} [location_desc] Risk location description
 * @apiParam (Request body) {String} [risk_factor] Risk factor
 * @apiParam (Request body) {String} [scope] Risk construction scope
 *
 * @apiExample {post} Example usage:
 * POST /acme/mitigations HTTP/1.1
 * {
 * 	"associated_activity":"",
 * 	"category":"safety_fall",
 * 	"element":"Doors",
 * 	"location_desc":"Tower 3 - Level 2",
 *	"risk_factor":"Factor 9",
 * 	"scope":"Tower 3"
 * }
 *
 * @apiSuccessExample {json} Success-Response.
 * HTTP/1.1 200 OK
 * [
 * 	{
 * 		"mitigation_desc":"Replace all openings required in floor slabs with precast service openings.",
 * 		"mitigation_detail":"Replace openings larger than a standard anvil required in floor slabs with precast service openings from A/W 2020 catalogue.",
 * 		"mitigation_stage":"Preliminary Design",
 * 		"mitigation_type":"Eliminate"
 * 	},
 * 	{
 * 		"mitigation_desc":"Provide safe walking surface joint covers. Any covering should be: strong enough to support any loads likely to be placed on it ; and fixed in position to prevent accidental dislodgement.",
 * 		"mitigation_detail":"Safe walking surface joint covers for all joins and gaps. Covers should be strong enough to support any loads likely to be placed on it and fixed in position with bolts to prevent accidental dislodgement.",
 * 		"mitigation_stage":"Detail Design",
 * 		"mitigation_type":"Reduce"
 * 	},
 * 	{
 * 		"mitigation_desc":"Provide warning markings and/or colour change.",
 * 		"mitigation_detail":"Provide warning markings from approved list of markings and/or colour change using chart from Document XYZ.",
 * 		"mitigation_stage":"Preconstruction",
 * 		"mitigation_type":"Control"
 * 	}
 * ]
 */
router.post("/mitigations", middlewares.isTeamspaceMember, findMitigationSuggestions);

function findMitigationSuggestions(req, res, next) {
	const place = utils.APIInfo(req);
	const {account} = req.params;
	const criteria = req.body;

	Mitigation.findMitigationSuggestions(account, criteria).then((suggestions) => {
		responseCodes.respond(place, req, res, next, responseCodes.OK, suggestions);
	}).catch(err => {
		responseCodes.respond(place, req, res, next, err, err);
	});
}

function findMitigationCriteria(req, res, next) {
	const place = utils.APIInfo(req);
	const {account} = req.params;

	Mitigation.getCriteria(account).then((criteria) => {
		responseCodes.respond(place, req, res, next, responseCodes.OK, criteria);
	}).catch(err => {
		responseCodes.respond(place, req, res, next, err, err);
	});
}

module.exports = router;
