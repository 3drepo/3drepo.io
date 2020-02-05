/**
 *  Copyright (C) 2020 3D Repo Ltd
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.ap
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
"use strict";

const express = require("express");
const router = express.Router({mergeParams: true});
const responseCodes = require("../response_codes.js");
const utils = require("../utils");

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
router.get("/mitigations/criteria", findMitigationCriteria);

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
 * 		"mitigation_details":"Replace openings larger than a standard anvil required in floor slabs with precast service openings from A/W 2020 catalogue.",
 * 		"mitigation_stage":"Preliminary Design",
 * 		"mitigation_type":"Eliminate"
 * 	},
 * 	{
 * 		"mitigation_desc":"Provide safe walking surface joint covers. Any covering should be: strong enough to support any loads likely to be placed on it ; and fixed in position to prevent accidental dislodgement.",
 * 		"mitigation_details":"Safe walking surface joint covers for all joins and gaps. Covers should be strong enough to support any loads likely to be placed on it and fixed in position with bolts to prevent accidental dislodgement.",
 * 		"mitigation_stage":"Detail Design",
 * 		"mitigation_type":"Reduce"
 * 	},
 * 	{
 * 		"mitigation_desc":"Provide warning markings and/or colour change.",
 * 		"mitigation_details":"Provide warning markings from approved list of markings and/or colour change using chart from Document XYZ.",
 * 		"mitigation_stage":"Preconstruction",
 * 		"mitigation_type":"Control"
 * 	}
 * ]
 */
router.post("/mitigations", findMitigationSuggestions);

function findMitigationSuggestions(req, res, next) {
	const place = utils.APIInfo(req);

	const suggestions = [
		{
			"mitigation_desc":"Replace all openings required in floor slabs with precast  service openings.",
			"mitigation_details":"Replace all openings required in floor slabs with precast  service openings.Replace all openings required in floor slabs with precast  service openings.Replace all openings required in floor slabs with precast  service openings.",
			"mitigation_stage":"Preliminary Design",
			"mitigation_type":"Eliminate"
		},
		{
			"mitigation_desc":"Cast in mesh in openings to reduce risk of person falling through.",
			"mitigation_details":"Cast in mesh in openings to reduce risk of person falling through.Cast in mesh in openings to reduce risk of person falling through.Cast in mesh in openings to reduce risk of person falling through.",
			"mitigation_stage":"Preliminary Design",
			"mitigation_type":"Reduce"
		},
		{
			"mitigation_desc":"Group small floor openings together to create one large opening.",
			"mitigation_details":"Group small floor openings together to create one large opening.Group small floor openings together to create one large opening.Group small floor openings together to create one large opening.",
			"mitigation_stage":"Group small floor openings together to create one large opening.",
			"mitigation_type":"Control"
		},
		{
			"mitigation_desc":"Locate floor openings away from passageways, work areas, and the structure perimeter.",
			"mitigation_details":"Locate floor openings away from passageways, work areas, and the structure perimeter.Locate floor openings away from passageways, work areas, and the structure perimeter.Locate floor openings away from passageways, work areas, and the structure perimeter.",
			"mitigation_stage":"Preliminary Design",
			"mitigation_type":"Control"
		},
		{
			"mitigation_desc":"Structural engineer liaises with architects during design phase to assist in design of handrail and guard elements.",
			"mitigation_details":"Structural engineer liaises with architects during design phase to assist in design of handrail and guard elements.Structural engineer liaises with architects during design phase to assist in design of handrail and guard elements.Structural engineer liaises with architects during design phase to assist in design of handrail and guard elements.",
			"mitigation_stage":"Preliminary Design",
			"mitigation_type":"Inform"
		},
		{
			"mitigation_desc":"Avoid low walls in circulation areas. Avoid hidden alcoves and offsets.",
			"mitigation_details":"Avoid low walls in circulation areas. Avoid hidden alcoves and offsets.Avoid low walls in circulation areas. Avoid hidden alcoves and offsets.Avoid low walls in circulation areas. Avoid hidden alcoves and offsets.",
			"mitigation_stage":"Detail Design",
			"mitigation_type":"Eliminate"
		},
		{
			"mitigation_desc":"Provide safe walking surface joint covers. Any covering should be: strong enough to support any loads likely to be placed on it ; and fixed in position to prevent accidental dislodgement.",
			"mitigation_details":"Provide safe walking surface joint covers. Any covering should be: strong enough to support any loads likely to be placed on it ; and fixed in position to prevent accidental dislodgement.Provide safe walking surface joint covers. Any covering should be: strong enough to support any loads likely to be placed on it ; and fixed in position to prevent accidental dislodgement.Provide safe walking surface joint covers. Any covering should be: strong enough to support any loads likely to be placed on it ; and fixed in position to prevent accidental dislodgement.",
			"mitigation_stage":"Detail Design",
			"mitigation_type":"Reduce"
		},
		{
			"mitigation_desc":"Locate openings away from building edges.",
			"mitigation_details":"Locate openings away from building edges.Locate openings away from building edges.Locate openings away from building edges.",
			"mitigation_stage":"Detail Design",
			"mitigation_type":"Reduce"
		},
		{
			"mitigation_desc":"Design permanent grating in opening, to be installed when opening is created during construction.",
			"mitigation_details":"Design permanent grating in opening, to be installed when opening is created during construction.Design permanent grating in opening, to be installed when opening is created during construction.Design permanent grating in opening, to be installed when opening is created during construction.",
			"mitigation_stage":"Detail Design",
			"mitigation_type":"Control"
		},
		{
			"mitigation_desc":"Specify guardrail systems around floor openings except at the entrance to stairways.",
			"mitigation_details":"Specify guardrail systems around floor openings except at the entrance to stairways.Specify guardrail systems around floor openings except at the entrance to stairways.Specify guardrail systems around floor openings except at the entrance to stairways.",
			"mitigation_stage":"Detail Design",
			"mitigation_type":"Control"
		},
		{
			"mitigation_desc":"All steel columns should have a hole in which to install guardrails and lifelines at 50 and 100 cm above each floor.",
			"mitigation_details":"All steel columns should have a hole in which to install guardrails and lifelines at 50 and 100 cm above each floor.All steel columns should have a hole in which to install guardrails and lifelines at 50 and 100 cm above each floor.All steel columns should have a hole in which to install guardrails and lifelines at 50 and 100 cm above each floor.",
			"mitigation_stage":"Detail Design",
			"mitigation_type":"Inform"
		},
		{
			"mitigation_desc":"Avoid work activity running below unfinished slab/floor.",
			"mitigation_details":"Avoid work activity running below unfinished slab/floor.Avoid work activity running below unfinished slab/floor.Avoid work activity running below unfinished slab/floor.",
			"mitigation_stage":"Preconstruction",
			"mitigation_type":"Eliminate"
		},
		{
			"mitigation_desc":"Provide requisite guardrails and toe boards at all slab openings.",
			"mitigation_details":"Provide requisite guardrails and toe boards at all slab openings.Provide requisite guardrails and toe boards at all slab openings.Provide requisite guardrails and toe boards at all slab openings.",
			"mitigation_stage":"Preconstruction",
			"mitigation_type":"Reduce"
		},
		{
			"mitigation_desc":"Provide warning markings and/or colour change.",
			"mitigation_details":"Provide warning markings and/or colour change.Provide warning markings and/or colour change.Provide warning markings and/or colour change.",
			"mitigation_stage":"Preconstruction",
			"mitigation_type":"Control"
		},
		{
			"mitigation_desc":"Provide protective grate to support weight of person over opening.",
			"mitigation_details":"Provide protective grate to support weight of person over opening.Provide protective grate to support weight of person over opening.Provide protective grate to support weight of person over opening.",
			"mitigation_stage":"Preconstruction",
			"mitigation_type":"Control"
		},
		{
			"mitigation_desc":"Inform contractor to Design-in permanent cast-in sockets around floor openings to enable early installation of permanent railings.",
			"mitigation_details":"Inform contractor to Design-in permanent cast-in sockets around floor openings to enable early installation of permanent railings.Inform contractor to Design-in permanent cast-in sockets around floor openings to enable early installation of permanent railings.Inform contractor to Design-in permanent cast-in sockets around floor openings to enable early installation of permanent railings.",
			"mitigation_stage":"Preconstruction",
			"mitigation_type":"Inform"
		},
		{
			"mitigation_desc":"Securely fix  cover with adequate SWL over opening with fixings requiring a tool.  Inspect regularly",
			"mitigation_details":"Securely fix  cover with adequate SWL over opening with fixings requiring a tool.  Inspect regularlySecurely fix  cover with adequate SWL over opening with fixings requiring a tool.  Inspect regularlySecurely fix  cover with adequate SWL over opening with fixings requiring a tool.  Inspect regularly",
			"mitigation_stage":"Site work and Change Control",
			"mitigation_type":"Eliminate"
		},
		{
			"mitigation_desc":"Ensure work is carried out only when weather conditions do not jeopardise the   health and safety of the workers.",
			"mitigation_details":"Ensure work is carried out only when weather conditions do not jeopardise the   health and safety of the workers.Ensure work is carried out only when weather conditions do not jeopardise the   health and safety of the workers.Ensure work is carried out only when weather conditions do not jeopardise the   health and safety of the workers.",
			"mitigation_stage":"Site work and Change Control",
			"mitigation_type":"Reduce"
		},
		{
			"mitigation_desc":"Provide safe lighting levels, including access and depression.",
			"mitigation_details":"Provide safe lighting levels, including access and depression.Provide safe lighting levels, including access and depression.Provide safe lighting levels, including access and depression.",
			"mitigation_stage":"Site work and Change Control",
			"mitigation_type":"Control"
		},
		{
			"mitigation_desc":"Inform Site team of any activities when covers or guardrails need to be removed.",
			"mitigation_details":"Inform Site team of any activities when covers or guardrails need to be removed.Inform Site team of any activities when covers or guardrails need to be removed.Inform Site team of any activities when covers or guardrails need to be removed.",
			"mitigation_stage":"Site work and Change Control",
			"mitigation_type":"Inform"
		},
		{
			"mitigation_desc":"Where necessary to locate equipment within 3m from edge of roof, provide railings or means of securing fall protection devices with appropriate signage.",
			"mitigation_details":"Where necessary to locate equipment within 3m from edge of roof, provide railings or means of securing fall protection devices with appropriate signage.Where necessary to locate equipment within 3m from edge of roof, provide railings or means of securing fall protection devices with appropriate signage.Where necessary to locate equipment within 3m from edge of roof, provide railings or means of securing fall protection devices with appropriate signage.",
			"mitigation_stage":"Preliminary Design",
			"mitigation_type":"Eliminate"
		}
	];

	responseCodes.respond(place, req, res, next, responseCodes.OK, suggestions);
}

function findMitigationCriteria(req, res, next) {
	const place = utils.APIInfo(req);

	const criteria = {
		"associated_activity":[
			"All construction",
			"Site tests",
			"Logistics"
		],
		"category":[
			"Safety Electricity"
		],
		"element":[
			"Doors",
			"Floors",
			"Pipes",
			"Vents",
			"Walls"
		],
		"location_desc":[
			"Tower 1 - Level 0",
			"Tower 1 - Level 1",
			"Tower 1 - Level 2",
			"Tower 2 - Level 0",
			"Tower 2 - Level 1",
			"Tower 3 - Level 0",
			"Tower 3 - Level 1",
			"Tower 3 - Level 2"
		],
		"mitigation_stage":[
			"Preliminary Design",
			"Detail Design",
			"Preconstruction",
			"Site work and Change Control"
		],
		"mitigation_type":[
			"Eliminate",
			"Reduce",
			"Control",
			"Inform"
		],
		"risk_factor":[
			"Factor 2",
			"Factor 5",
			"Factor 8"
		],
		"scope":[
			"General concrete",
			"In situ concrete"
		]
	};

	responseCodes.respond(place, req, res, next, responseCodes.OK, criteria);
}

module.exports = router;
