/**
 *  Copyright (C) 2019 3D Repo Ltd
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
const risksMiddleware = require("../middlewares/risk");

const C = require("../constants");
const responseCodes = require("../response_codes.js");
const Comment = require("../models/comment");
const Risk = require("../models/risk");
const config = require("../config");
const utils = require("../utils");
const multer = require("multer");

/**
 * @apiDefine Risks SafetiBase Risks
 *
 * @apiParam {String} teamspace Name of teamspace
 * @apiParam {String} model Model ID
 */

/**
 * @apiDefine RiskIdParam
 *
 * @apiParam {String} riskId Risk ID
 */

/**
 * @apiDefine viewpointObject
 *
 * @apiBody (Viewpoint) {Number[]} right Right vector of the camera
 * @apiBody (Viewpoint) {Number[]} up Up vector of the camera
 * @apiBody (Viewpoint) {Number[]} position Position of the camera
 * @apiBody (Viewpoint) {Number[]} look_at Look at point of the camera
 * @apiBody (Viewpoint) {Number[]} view_dir View direction of the camera
 * @apiBody (Viewpoint) {Number} near Near clipping plane
 * @apiBody (Viewpoint) {Number} far Far clipping plane
 * @apiBody (Viewpoint) {Number} fov Field of view in radians
 * @apiBody (Viewpoint) {Number} aspect_ratio Aspect ratio of the viewport
 * @apiBody (Viewpoint) {Object[]} [clippingPlanes] Array of clipping planes
 * @apiBody (Viewpoint) {Object[]} [override_groups] Array of override groups with colors and objects
 * @apiBody (Viewpoint) {Object[]} [transformation_groups] Array of transformation groups
 * @apiBody (Viewpoint) {Object} [highlighted_group] Highlighted group with objects and color
 * @apiBody (Viewpoint) {Object} [hidden_group] Hidden group with objects
 * @apiBody (Viewpoint) {Boolean} [hideIfc] Flag to hide IFC elements
 * @apiBody (Viewpoint) {String} [screenshot] Base64 encoded screenshot image
 * @apiBody (Viewpoint) {String} [guid] Unique identifier for the viewpoint
 */

/**
 * @apiDefine viewpointResponse
 *
 * @apiSuccess (Viewpoint) {Number[]} right Right vector of the camera
 * @apiSuccess (Viewpoint) {Number[]} up Up vector of the camera
 * @apiSuccess (Viewpoint) {Number[]} position Position of the camera
 * @apiSuccess (Viewpoint) {Number[]} look_at Look at point of the camera
 * @apiSuccess (Viewpoint) {Number[]} view_dir View direction of the camera
 * @apiSuccess (Viewpoint) {Number} near Near clipping plane
 * @apiSuccess (Viewpoint) {Number} far Far clipping plane
 * @apiSuccess (Viewpoint) {Number} fov Field of view in radians
 * @apiSuccess (Viewpoint) {Number} aspect_ratio Aspect ratio of the viewport
 * @apiSuccess (Viewpoint) {Object[]} [clippingPlanes] Array of clipping planes
 * @apiSuccess (Viewpoint) {Object[]} [override_groups] Array of override groups with colors and objects
 * @apiSuccess (Viewpoint) {Object[]} [transformation_groups] Array of transformation groups
 * @apiSuccess (Viewpoint) {Object} [highlighted_group] Highlighted group with objects and color
 * @apiSuccess (Viewpoint) {Object} [hidden_group] Hidden group with objects
 * @apiSuccess (Viewpoint) {Boolean} [hideIfc] Flag to hide IFC elements
 * @apiSuccess (Viewpoint) {String} [screenshot] URL to screenshot image
 * @apiSuccess (Viewpoint) {String} [screenshotSmall] URL to small screenshot image
 * @apiSuccess (Viewpoint) {String} [guid] Unique identifier for the viewpoint
 */

/**
 * @apiDefine risksCreationPayload
 *
 *  @apiBody {String} name Risk name
 *  @apiBody {String[]} assigned_roles Risk owner
 *  @apiBody {String} associated_activity Associated activity
 *  @apiBody {String} category Category
 *  @apiBody {Number} consequence Risk consequence (0: very low, 1: low, 2: moderate, 3: high, 4: very high)
 *  @apiBody {String} desc Risk description
 *  @apiBody {String} element Element type
 *  @apiBody {Number} likelihood Risk likelihood (0: very low, 1: low, 2: moderate, 3: high, 4: very high)
 *  @apiBody {String} location_desc Location description
 *  @apiBody {String} mitigation_status Treatment status
 *  @apiBody {String} mitigation_desc Treatment summary
 *  @apiBody {String} mitigation_detail Treatment detailed description
 *  @apiBody {String} mitigation_stage Treatment stage
 *  @apiBody {String} mitigation_type Treatment type
 *  @apiBody {Number{3..3}} position Risk pin coordinates
 *  @apiBody {Number} residual_consequence Treated risk consequence (-1: unset, 0: very low, 1: low, 2: moderate, 3: high, 4: very high)
 *  @apiBody {Number} residual_likelihood Treated risk likelihood (-1: unset, 0: very low, 1: low, 2: moderate, 3: high, 4: very high)
 *  @apiBody {String} residual_risk Residual risk
 *  @apiBody {String} risk_factor Risk factor
 *  @apiBody {String} scope Construction scope
 *  @apiUse viewpointObject
 */

/**
 * @api {get} /:teamspace/:model/risks/:riskId Get a risk
 * @apiName findRiskById
 * @apiGroup Risks
 * @apiDescription Retrieve a risk. The response includes all comments
 * and screenshot URLs.
 *
 * @apiUse Risks
 * @apiUse RiskIdParam
 *
 * @apiSuccess {Object} risk The Issue matching the Issue ID
 *
 * @apiExample {get} Example usage:
 * GET /acme/00000000-0000-0000-0000-000000000000/risks/00000000-0000-0000-0000-000000000002 HTTP/1.1
 *
 * @apiSuccessExample {json} Success-Response.
 * HTTP/1.1 200 OK
 * {
 * 	"_id":"00000000-0000-0000-0000-000000000002",
 * 	"account":"acme",
 * 	"assigned_roles":[
 * 		"Job1"
 * 	],
 * 	"associated_activity":"Column casting",
 * 	"category":"safety_fall",
 * 	"comments":[],
 * 	"consequence":0,
 * 	"created":1567156228976,
 * 	"creator_role":"Job4",
 * 	"desc":"Risk description that describes the risk",
 * 	"element":"Doors",
 * 	"level_of_risk":0,
 * 	"likelihood":0,
 * 	"location_desc":"Tower 3 - Level 2",
 * 	"mitigation_desc":"Erect temporary barrier",
 * 	"mitigation_detail":"Erect a temporary 1.5m metal barrier along edge",
 * 	"mitigation_stage":"Construction stage 5",
 * 	"mitigation_status":"proposed",
 * 	"mitigation_type":"Eliminate",
 * 	"model":"00000000-0000-0000-0000-000000000000",
 * 	"name":"Risk 1",
 * 	"overall_level_of_risk":0,
 * 	"owner":"alice",
 * 	"position":[55000.0,80000.0,-10000.0],
 * 	"residual_consequence":-1,
 * 	"residual_level_of_risk":-1,
 * 	"residual_likelihood":-1,
 * 	"residual_risk":"",
 * 	"rev_id":"00000000-0000-0000-0000-000000000001",
 *	"risk_factor":"Factor 9",
 * 	"safetibase_id":"",
 * 	"scope":"Tower 3",
 * 	"thumbnail":"acme/00000000-0000-0000-0000-000000000000/risks/00000000-0000-0000-0000-000000000002/thumbnail.png",
 * 	"viewpoint":{
 * 		"aspect_ratio":1.4,
 * 		"clippingPlanes":[],
 * 		"far":300000,
 * 		"fov":1.05,
 * 		"guid":"00000000-0000-0000-0000-000000000004",
 * 		"hideIfc":true,
 * 		"look_at":[35000.0,40000.0,8000.0],
 * 		"near":600.0,
 * 		"position":[-70000.0,120000.0,150000.0],
 * 		"right":[0.8,-0.3,0.6],
 * 		"screenshot":"acme/00000000-0000-0000-0000-000000000000/risks/00000000-0000-0000-0000-000000000002/viewpoints/00000000-0000-0000-0000-000000000003/screenshot.png",
 * 		"screenshotSmall":"acme/00000000-0000-0000-0000-000000000000/risks/00000000-0000-0000-0000-000000000002/viewpoints/00000000-0000-0000-0000-000000000003/screenshotSmall.png",
 * 		"up":[0.3,0.9,-0.3],
 * 		"view_dir":[0.5,-0.4,-0.7]
 * 	}
 * }
 */
router.get("/risks/:riskId", risksMiddleware.canView, findRiskById);

/**
 * @api {get} /:teamspace/:model/risks/:riskId/thumbnail.png Get risk thumbnail
 * @apiName getThumbnail
 * @apiGroup Risks
 * @apiDescription Retrieve a risk thumbnail image.
 *
 * @apiUse Risks
 * @apiUse RiskIdParam
 *
 * @apiSuccess {png} image Thumbnail image
 *
 * @apiExample {get} Example usage:
 * GET /acme/00000000-0000-0000-0000-000000000000/risks/00000000-0000-0000-0000-000000000002/thumbnail.png HTTP/1.1
 *
 * @apiSuccessExample {png} Success-Response
 * HTTP/1.1 200 OK
 * <binary image>
 */
router.get("/risks/:riskId/thumbnail.png", risksMiddleware.canView, getThumbnail);

/**
 * @api {get} /:teamspace/:model/risks List all risks
 * @apiName listRisks
 * @apiGroup Risks
 * @apiDescription Retrieve all model risks.
 *
 * @apiUse Risks
 *
 * @apiQuery {Number} [updatedSince] Only return issues that has been updated since this value (in epoch value)
 * @apiQuery {Number[]} [numbers] Array of issue numbers to filter for
 * @apiQuery {String[]} [ids] Array of issue ids to filter for
 * @apiQuery {String[]} [categories] Array of categories to filter for
 * @apiQuery {String[]} [mitigationStatus] Array of mitigation status to filter for
 * @apiQuery {Number[]} [likelihoods] Array of likelihoods to filter for. The possible number values for this fields are UNSET: -1, VERY_LOW: 0, LOW: 1, MODERATE: 2, HIGH: 3, VERY_HIGH: 4 .
 * @apiQuery {Number[]} [consequences] Array of consequences to filter for. The possible number values for this fields are UNSET: -1, VERY_LOW: 0, LOW: 1, MODERATE: 2, HIGH: 3, VERY_HIGH: 4 .
 * @apiQuery {Number[]} [residualLikelihoods] Array of residual likelihoods to filter for. The possible number values for this fields are UNSET: -1, VERY_LOW: 0, LOW: 1, MODERATE: 2, HIGH: 3, VERY_HIGH: 4 .
 * @apiQuery {Number[]} [levelOfRisks] Array of levels of risks to filter for. The possible number values for this fields are UNSET: -1, VERY_LOW: 0, LOW: 1, MODERATE: 2, HIGH: 3, VERY_HIGH: 4 .
 * @apiQuery {Number[]} [residualLikelihoods] Array of residual likelihoods to filter for. The possible number values for this fields are UNSET: -1, VERY_LOW: 0, LOW: 1, MODERATE: 2, HIGH: 3, VERY_HIGH: 4 .
 * @apiQuery {Number[]} [residualConsequences] Array of residual consequences to filter for. The possible number values for this fields are UNSET: -1, VERY_LOW: 0, LOW: 1, MODERATE: 2, HIGH: 3, VERY_HIGH: 4 .
 * @apiQuery {Number[]} [residualLevelOfRisks] Array of levels of risks to filter for. The possible number values for this fields are UNSET: -1, VERY_LOW: 0, LOW: 1, MODERATE: 2, HIGH: 3, VERY_HIGH: 4 .
 *
 * @apiSuccess (200) {Object[]} risks Risk objects
 *
 * @apiExample {get} Example usage:
 * GET /acme/00000000-0000-0000-0000-000000000000/risks HTTP/1.1
 *
 * @apiExample {get} Example usage:
 * GET /acme/00000000-0000-0000-0000-000000000000/revision/00000000-0000-0000-0000-000000000001/risks HTTP/1.1
 *
 * @apiSuccessExample {json} Success-Response
 * HTTP/1.1 200 OK
 * [
 * 	{
 * 		"_id":"00000000-0000-0000-0000-000000000002",
 * 		"account":"acme",
 * 		"assigned_roles":[
 * 			"Job1"
 * 		],
 * 		"associated_activity":"Column casting",
 * 		"category":"safety_fall",
 * 		"comments":[],
 * 		"consequence":0,
 * 		"created":1567156228976,
 * 		"creator_role":"Job4",
 * 		"desc":"Risk description that describes the risk",
 * 		"element":"Doors",
 * 		"level_of_risk":0,
 * 		"likelihood":0,
 * 		"location_desc":"Tower 3 - Level 2",
 * 		"mitigation_desc":"Erect temporary barrier",
 * 		"mitigation_detail":"Erect a temporary 1.5m metal barrier along edge",
 * 		"mitigation_stage":"Construction stage 5",
 * 		"mitigation_status":"proposed",
 * 		"mitigation_type":"Eliminate",
 * 		"model":"00000000-0000-0000-0000-000000000000",
 * 		"name":"Risk 1",
 * 		"overall_level_of_risk":0,
 * 		"owner":"alice",
 * 		"position":[55000.0,80000.0,-10000.0],
 * 		"residual_consequence":-1,
 * 		"residual_level_of_risk":-1,
 * 		"residual_likelihood":-1,
 * 		"residual_risk":"",
 * 		"rev_id":"00000000-0000-0000-0000-000000000001",
 * 		"risk_factor":"Factor 9",
 * 		"safetibase_id":"",
 * 		"scope":"Tower 3",
 * 		"thumbnail":"acme/00000000-0000-0000-0000-000000000000/risks/00000000-0000-0000-0000-000000000002/thumbnail.png",
 * 		"viewpoint":{
 * 			"aspect_ratio":1.4,
 * 			"clippingPlanes":[],
 * 			"far":300000,
 * 			"fov":1.05,
 * 			"guid":"00000000-0000-0000-0000-000000000004",
 * 			"hideIfc":true,
 * 			"look_at":[35000.0,40000.0,8000.0],
 * 			"near":600.0,
 * 			"position":[-70000.0,120000.0,150000.0],
 * 			"right":[0.8,-0.3,0.6],
 * 			"screenshot":"acme/00000000-0000-0000-0000-000000000000/risks/00000000-0000-0000-0000-000000000002/viewpoints/00000000-0000-0000-0000-000000000003/screenshot.png",
 * 			"screenshotSmall":"acme/00000000-0000-0000-0000-000000000000/risks/00000000-0000-0000-0000-000000000002/viewpoints/00000000-0000-0000-0000-000000000003/screenshotSmall.png",
 * 			"up":[0.3,0.9,-0.3],
 * 			"view_dir":[0.5,-0.4,-0.7]
 * 		}
 * 	}
 * ]
 */

/**
 * @api {get} /:teamspace/:model/revision/:revId/risks List all risks of a revision
 * @apiName listRisksByRevision
 * @apiGroup Risks
 * @apiDescription Retrieve all model risks.
 *
 * @apiUse Risks
 *
 * @apiParam {String} [revId] Revision ID
 * @apiQuery {Number} [updatedSince] Only return issues that has been updated since this value (in epoch value)
 * @apiQuery {Number[]} [numbers] Array of issue numbers to filter for
 * @apiQuery {String[]} [ids] Array of issue ids to filter for
 * @apiQuery {String[]} [categories] Array of categories to filter for
 * @apiQuery {String[]} [mitigationStatus] Array of mitigation status to filter for
 * @apiQuery {Number[]} [likelihoods] Array of likelihoods to filter for. The possible number values for this fields are UNSET: -1, VERY_LOW: 0, LOW: 1, MODERATE: 2, HIGH: 3, VERY_HIGH: 4 .
 * @apiQuery {Number[]} [consequences] Array of consequences to filter for. The possible number values for this fields are UNSET: -1, VERY_LOW: 0, LOW: 1, MODERATE: 2, HIGH: 3, VERY_HIGH: 4 .
 * @apiQuery {Number[]} [residualLikelihoods] Array of residual likelihoods to filter for. The possible number values for this fields are UNSET: -1, VERY_LOW: 0, LOW: 1, MODERATE: 2, HIGH: 3, VERY_HIGH: 4 .
 * @apiQuery {Number[]} [levelOfRisks] Array of levels of risks to filter for. The possible number values for this fields are UNSET: -1, VERY_LOW: 0, LOW: 1, MODERATE: 2, HIGH: 3, VERY_HIGH: 4 .
 * @apiQuery {Number[]} [residualLikelihoods] Array of residual likelihoods to filter for. The possible number values for this fields are UNSET: -1, VERY_LOW: 0, LOW: 1, MODERATE: 2, HIGH: 3, VERY_HIGH: 4 .
 * @apiQuery {Number[]} [residualConsequences] Array of residual consequences to filter for. The possible number values for this fields are UNSET: -1, VERY_LOW: 0, LOW: 1, MODERATE: 2, HIGH: 3, VERY_HIGH: 4 .
 * @apiQuery {Number[]} [residualLevelOfRisks] Array of levels of risks to filter for. The possible number values for this fields are UNSET: -1, VERY_LOW: 0, LOW: 1, MODERATE: 2, HIGH: 3, VERY_HIGH: 4 .
 *
 * @apiSuccess (200) {Object[]} risks Risk objects
 *
 * @apiExample {get} Example usage:
 * GET /acme/00000000-0000-0000-0000-000000000000/risks HTTP/1.1
 *
 * @apiExample {get} Example usage:
 * GET /acme/00000000-0000-0000-0000-000000000000/revision/00000000-0000-0000-0000-000000000001/risks HTTP/1.1
 *
 * @apiSuccessExample {json} Success-Response
 * HTTP/1.1 200 OK
 * [
 * 	{
 * 		"_id":"00000000-0000-0000-0000-000000000002",
 * 		"account":"acme",
 * 		"assigned_roles":[
 * 			"Job1"
 * 		],
 * 		"associated_activity":"Column casting",
 * 		"category":"safety_fall",
 * 		"comments":[],
 * 		"consequence":0,
 * 		"created":1567156228976,
 * 		"creator_role":"Job4",
 * 		"desc":"Risk description that describes the risk",
 * 		"element":"Doors",
 * 		"level_of_risk":0,
 * 		"likelihood":0,
 * 		"location_desc":"Tower 3 - Level 2",
 * 		"mitigation_desc":"Erect temporary barrier",
 * 		"mitigation_detail":"Erect a temporary 1.5m metal barrier along edge",
 * 		"mitigation_stage":"Construction stage 5",
 * 		"mitigation_status":"proposed",
 * 		"mitigation_type":"Eliminate",
 * 		"model":"00000000-0000-0000-0000-000000000000",
 * 		"name":"Risk 1",
 * 		"overall_level_of_risk":0,
 * 		"owner":"alice",
 * 		"position":[55000.0,80000.0,-10000.0],
 * 		"residual_consequence":-1,
 * 		"residual_level_of_risk":-1,
 * 		"residual_likelihood":-1,
 * 		"residual_risk":"",
 * 		"rev_id":"00000000-0000-0000-0000-000000000001",
 * 		"risk_factor":"Factor 9",
 * 		"safetibase_id":"",
 * 		"scope":"Tower 3",
 * 		"thumbnail":"acme/00000000-0000-0000-0000-000000000000/risks/00000000-0000-0000-0000-000000000002/thumbnail.png",
 * 		"viewpoint":{
 * 			"aspect_ratio":1.4,
 * 			"clippingPlanes":[],
 * 			"far":300000,
 * 			"fov":1.05,
 * 			"guid":"00000000-0000-0000-0000-000000000004",
 * 			"hideIfc":true,
 * 			"look_at":[35000.0,40000.0,8000.0],
 * 			"near":600.0,
 * 			"position":[-70000.0,120000.0,150000.0],
 * 			"right":[0.8,-0.3,0.6],
 * 			"screenshot":"acme/00000000-0000-0000-0000-000000000000/risks/00000000-0000-0000-0000-000000000002/viewpoints/00000000-0000-0000-0000-000000000003/screenshot.png",
 * 			"screenshotSmall":"acme/00000000-0000-0000-0000-000000000000/risks/00000000-0000-0000-0000-000000000002/viewpoints/00000000-0000-0000-0000-000000000003/screenshotSmall.png",
 * 			"up":[0.3,0.9,-0.3],
 * 			"view_dir":[0.5,-0.4,-0.7]
 * 		}
 * 	}
 * ]
 */
router.get("/risks", risksMiddleware.canView, listRisks);

/**
 * @api {get} /:teamspace/:model/risks/:riskId/screenshot.png Get risk screenshot
 * @apiName getScreenshot
 * @apiGroup Risks
 * @apiDescription Retrieve a risk screenshot image.
 *
 * @apiUse Risks
 * @apiUse RiskIdParam
 *
 * @apiSuccess {png} image Screenshot image
 *
 * @apiExample {get} Example usage:
 * GET /acme/00000000-0000-0000-0000-000000000000/risks/00000000-0000-0000-0000-000000000002/screenshot.png HTTP/1.1
 *
 * @apiSuccessExample {png} Success-Response
 * HTTP/1.1 200 OK
 * <binary image>
 */
router.get("/risks/:riskId/viewpoints/:vid/screenshot.png", risksMiddleware.canView, getScreenshot);

/**
 * @api {get} /:teamspace/:model/risks/:riskId/screenshotSmall.png Get low-res screenshot
 * @apiName getScreenshotSmall
 * @apiGroup Risks
 * @apiDescription Retrieve a low-resolution risk screenshot image.
 *
 * @apiUse Risks
 * @apiUse RiskIdParam
 *
 * @apiSuccess {png} image Small screenshot image
 *
 * @apiExample {get} Example usage:
 * GET /acme/00000000-0000-0000-0000-000000000000/risks/00000000-0000-0000-0000-000000000002/screenshotSmall.png HTTP/1.1
 *
 * @apiSuccessExample {png} Success-Response
 * HTTP/1.1 200 OK
 * <binary image>
 */
router.get("/risks/:riskId/viewpoints/:vid/screenshotSmall.png", risksMiddleware.canView, getScreenshotSmall);

router.get("/revision/:rid/risks", risksMiddleware.canView, listRisks);

/**
 * @api {get} /:teamspace/:model/risks.html Render risks as HTML
 * @apiName renderRisksHTML
 * @apiGroup Risks
 * @apiDescription Retrieve HTML page of all risks.
 *
 * @apiUse Risks
 *
 * @apiQuery {String} ids Risk IDs to show
 * @apiSuccess (200) {Object[]} risks Risk objects
 *
 * @apiExample {get} Example usage:
 * GET /acme/00000000-0000-0000-0000-000000000000/risks.html?[query] HTTP/1.1
 *
 * @apiExample {get} Example usage:
 * GET /acme/00000000-0000-0000-0000-000000000000/revision/00000000-0000-0000-0000-000000000001/risks.html?[query] HTTP/1.1
 *
 * @apiSuccessExample {html} Success-Response
 * HTTP/1.1 200 OK
 * <html page>
 */

/**
 * @api {get} /:teamspace/:model/revision/:revId/risks.html Render risks for a revision as HTML
 * @apiName renderRisksByRevisionHTML
 * @apiGroup Risks
 * @apiDescription Retrieve HTML page of all risks.
 *
 * @apiUse Risks
 *
 * @apiParam {String} [revId] Revision ID
 * @apiQuery {String} ids Risk IDs to show
 * @apiSuccess (200) {Object[]} risks Risk objects
 *
 * @apiExample {get} Example usage:
 * GET /acme/00000000-0000-0000-0000-000000000000/risks.html?[query] HTTP/1.1
 *
 * @apiExample {get} Example usage:
 * GET /acme/00000000-0000-0000-0000-000000000000/revision/00000000-0000-0000-0000-000000000001/risks.html?[query] HTTP/1.1
 *
 * @apiSuccessExample {html} Success-Response
 * HTTP/1.1 200 OK
 * <html page>
 */
router.get("/risks.html", risksMiddleware.canView, renderRisksHTML);

router.get("/revision/:rid/risks.html", risksMiddleware.canView, renderRisksHTML);

/**
 * @api {post} /:teamspace/:model/revision/:revId/risks Create a risk for a revision
 * @apiName storeRiskForRevision
 * @apiGroup Risks
 * @apiDescription Create a model risk.
 *
 * @apiUse Risks
 * @apiParam {String} [revId] Revision ID
 *
 * @apiUse risksCreationPayload
 * @apiUse viewpointObject
 *
 * @apiExample {post} Example usage:
 * POST /acme/00000000-0000-0000-0000-000000000000/risks HTTP/1.1
 * {
 * 	"assigned_roles":[
 * 		"Job1"
 * 	],
 * 	"associated_activity":"",
 * 	"category":"safety_fall",
 * 	"comments":[],
 * 	"consequence":0,
 * 	"creator_role":"Job4",
 * 	"desc":"Risk description that describes the risk",
 * 	"element":"Doors",
 * 	"level_of_risk":0,
 * 	"likelihood":0,
 * 	"location_desc":"Tower 3 - Level 2",
 * 	"mitigation_desc":"Erect temporary barrier",
 * 	"mitigation_detail":"Erect a temporary 1.5m metal barrier along edge",
 * 	"mitigation_stage":"Construction stage 5",
 * 	"mitigation_status":"proposed",
 * 	"mitigation_type":"Eliminate",
 * 	"name":"Risk 1",
 * 	"overall_level_of_risk":0,
 * 	"position":[55000.0,80000.0,-10000.0],
 * 	"residual_consequence":-1,
 * 	"residual_level_of_risk":-1,
 * 	"residual_likelihood":-1,
 * 	"residual_risk":"",
 *	"risk_factor":"Factor 9",
 * 	"safetibase_id":"",
 * 	"scope":"Tower 3",
 * 	"viewpoint":{
 * 		"aspect_ratio":1.4,
 * 		"clippingPlanes":[],
 * 		"far":300000,
 * 		"fov":1.05,
 * 		"hideIfc":true,
 * 		"highlighted_group_id":"",
 * 		"look_at":[35000.0,40000.0,8000.0],
 * 		"near":600.0,
 * 		"position":[-70000.0,120000.0,150000.0],
 * 		"right":[0.8,-0.3,0.6],
 * 		"up":[0.3,0.9,-0.3],
 * 		"view_dir":[0.5,-0.4,-0.7],
 * 		"screenshot":<base64 image>
 * 	}
 * }
 *
 * @apiExample {post} Example usage:
 * POST /acme/00000000-0000-0000-0000-000000000000/revision/00000000-0000-0000-0000-000000000001/risks HTTP/1.1
 * {
 * 	"assigned_roles":[
 * 		"Job1"
 * 	],
 * 	"associated_activity":"",
 * 	"category":"safety_fall",
 * 	"comments":[],
 * 	"consequence":0,
 * 	"creator_role":"Job4",
 * 	"desc":"Risk description that describes the risk",
 * 	"element":"Doors",
 * 	"level_of_risk":0,
 * 	"likelihood":0,
 * 	"location_desc":"Tower 3 - Level 2",
 * 	"mitigation_desc":"Erect temporary barrier",
 * 	"mitigation_detail":"Erect a temporary 1.5m metal barrier along edge",
 * 	"mitigation_stage":"Construction stage 5",
 * 	"mitigation_status":"proposed",
 * 	"mitigation_type":"Eliminate",
 * 	"name":"Risk 1",
 * 	"overall_level_of_risk":0,
 * 	"position":[55000.0,80000.0,-10000.0],
 * 	"residual_consequence":-1,
 * 	"residual_level_of_risk":-1,
 * 	"residual_likelihood":-1,
 * 	"residual_risk":"",
 *	"risk_factor":"Factor 9",
 * 	"safetibase_id":"",
 * 	"scope":"Tower 3",
 * 	"viewpoint":{
 * 		"aspect_ratio":1.4,
 * 		"clippingPlanes":[],
 * 		"far":300000,
 * 		"fov":1.05,
 * 		"hideIfc":true,
 * 		"highlighted_group_id":"",
 * 		"look_at":[35000.0,40000.0,8000.0],
 * 		"near":600.0,
 * 		"position":[-70000.0,120000.0,150000.0],
 * 		"right":[0.8,-0.3,0.6],
 * 		"up":[0.3,0.9,-0.3],
 * 		"view_dir":[0.5,-0.4,-0.7],
 * 		"screenshot":<base64 image>
 * 	}
 * }
 *
 * @apiSuccessExample {json} Success-Response
 * HTTP/1.1 200 OK
 * {
 * 	"_id":"00000000-0000-0000-0000-000000000002",
 * 	"account":"acme",
 * 	"assigned_roles":[
 * 		"Job1"
 * 	],
 * 	"associated_activity":"",
 * 	"category":"safety_fall",
 * 	"comments":[],
 * 	"consequence":0,
 * 	"created":1567156228976,
 * 	"creator_role":"Job4",
 * 	"desc":"Risk description that describes the risk",
 * 	"element":"Doors",
 * 	"level_of_risk":0,
 * 	"likelihood":0,
 * 	"location_desc":"Tower 3 - Level 2",
 * 	"mitigation_desc":"Erect temporary barrier",
 * 	"mitigation_detail":"Erect a temporary 1.5m metal barrier along edge",
 * 	"mitigation_stage":"Construction stage 5",
 * 	"mitigation_status":"proposed",
 * 	"mitigation_type":"Eliminate",
 * 	"model":"00000000-0000-0000-0000-000000000000",
 * 	"name":"Risk 1",
 * 	"overall_level_of_risk":0,
 * 	"owner":"alice",
 * 	"position":[55000.0,80000.0,-10000.0],
 * 	"residual_consequence":-1,
 * 	"residual_level_of_risk":-1,
 * 	"residual_likelihood":-1,
 * 	"residual_risk":"",
 * 	"rev_id":"00000000-0000-0000-0000-000000000001",
 *	"risk_factor":"Factor 9",
 * 	"safetibase_id":"",
 * 	"scope":"Tower 3",
 * 	"thumbnail":"acme/00000000-0000-0000-0000-000000000000/risks/00000000-0000-0000-0000-000000000002/thumbnail.png",
 * 	"viewpoint":{
 * 		"aspect_ratio":1.4,
 * 		"clippingPlanes":[],
 * 		"far":300000,
 * 		"fov":1.05,
 * 		"guid":"00000000-0000-0000-0000-000000000004",
 * 		"hideIfc":true,
 * 		"look_at":[35000.0,40000.0,8000.0],
 * 		"near":600.0,
 * 		"position":[-70000.0,120000.0,150000.0],
 * 		"right":[0.8,-0.3,0.6],
 * 		"screenshot":"acme/00000000-0000-0000-0000-000000000000/risks/00000000-0000-0000-0000-000000000002/viewpoints/00000000-0000-0000-0000-000000000003/screenshot.png",
 * 		"screenshotSmall":"acme/00000000-0000-0000-0000-000000000000/risks/00000000-0000-0000-0000-000000000002/viewpoints/00000000-0000-0000-0000-000000000003/screenshotSmall.png",
 * 		"up":[0.3,0.9,-0.3],
 * 		"view_dir":[0.5,-0.4,-0.7]
 * 	}
 * }
 */

/**
 * @api {post} /:teamspace/:model/risks Create a risk
 * @apiName storeRisk
 * @apiGroup Risks
 * @apiDescription Create a model risk.
 *
 * @apiUse Risks
 *
 * @apiUse risksCreationPayload
 * @apiUse viewpointObject
 *
 * @apiExample {post} Example usage:
 * POST /acme/00000000-0000-0000-0000-000000000000/risks HTTP/1.1
 * {
 * 	"assigned_roles":[
 * 		"Job1"
 * 	],
 * 	"associated_activity":"",
 * 	"category":"safety_fall",
 * 	"comments":[],
 * 	"consequence":0,
 * 	"creator_role":"Job4",
 * 	"desc":"Risk description that describes the risk",
 * 	"element":"Doors",
 * 	"level_of_risk":0,
 * 	"likelihood":0,
 * 	"location_desc":"Tower 3 - Level 2",
 * 	"mitigation_desc":"Erect temporary barrier",
 * 	"mitigation_detail":"Erect a temporary 1.5m metal barrier along edge",
 * 	"mitigation_stage":"Construction stage 5",
 * 	"mitigation_status":"proposed",
 * 	"mitigation_type":"Eliminate",
 * 	"name":"Risk 1",
 * 	"overall_level_of_risk":0,
 * 	"position":[55000.0,80000.0,-10000.0],
 * 	"residual_consequence":-1,
 * 	"residual_level_of_risk":-1,
 * 	"residual_likelihood":-1,
 * 	"residual_risk":"",
 *	"risk_factor":"Factor 9",
 * 	"safetibase_id":"",
 * 	"scope":"Tower 3",
 * 	"viewpoint":{
 * 		"aspect_ratio":1.4,
 * 		"clippingPlanes":[],
 * 		"far":300000,
 * 		"fov":1.05,
 * 		"hideIfc":true,
 * 		"highlighted_group_id":"",
 * 		"look_at":[35000.0,40000.0,8000.0],
 * 		"near":600.0,
 * 		"position":[-70000.0,120000.0,150000.0],
 * 		"right":[0.8,-0.3,0.6],
 * 		"up":[0.3,0.9,-0.3],
 * 		"view_dir":[0.5,-0.4,-0.7],
 * 		"screenshot":<base64 image>
 * 	}
 * }
 *
 * @apiExample {post} Example usage:
 * POST /acme/00000000-0000-0000-0000-000000000000/revision/00000000-0000-0000-0000-000000000001/risks HTTP/1.1
 * {
 * 	"assigned_roles":[
 * 		"Job1"
 * 	],
 * 	"associated_activity":"",
 * 	"category":"safety_fall",
 * 	"comments":[],
 * 	"consequence":0,
 * 	"creator_role":"Job4",
 * 	"desc":"Risk description that describes the risk",
 * 	"element":"Doors",
 * 	"level_of_risk":0,
 * 	"likelihood":0,
 * 	"location_desc":"Tower 3 - Level 2",
 * 	"mitigation_desc":"Erect temporary barrier",
 * 	"mitigation_detail":"Erect a temporary 1.5m metal barrier along edge",
 * 	"mitigation_stage":"Construction stage 5",
 * 	"mitigation_status":"proposed",
 * 	"mitigation_type":"Eliminate",
 * 	"name":"Risk 1",
 * 	"overall_level_of_risk":0,
 * 	"position":[55000.0,80000.0,-10000.0],
 * 	"residual_consequence":-1,
 * 	"residual_level_of_risk":-1,
 * 	"residual_likelihood":-1,
 * 	"residual_risk":"",
 *	"risk_factor":"Factor 9",
 * 	"safetibase_id":"",
 * 	"scope":"Tower 3",
 * 	"viewpoint":{
 * 		"aspect_ratio":1.4,
 * 		"clippingPlanes":[],
 * 		"far":300000,
 * 		"fov":1.05,
 * 		"hideIfc":true,
 * 		"highlighted_group_id":"",
 * 		"look_at":[35000.0,40000.0,8000.0],
 * 		"near":600.0,
 * 		"position":[-70000.0,120000.0,150000.0],
 * 		"right":[0.8,-0.3,0.6],
 * 		"up":[0.3,0.9,-0.3],
 * 		"view_dir":[0.5,-0.4,-0.7],
 * 		"screenshot":<base64 image>
 * 	}
 * }
 *
 * @apiSuccessExample {json} Success-Response
 * HTTP/1.1 200 OK
 * {
 * 	"_id":"00000000-0000-0000-0000-000000000002",
 * 	"account":"acme",
 * 	"assigned_roles":[
 * 		"Job1"
 * 	],
 * 	"associated_activity":"",
 * 	"category":"safety_fall",
 * 	"comments":[],
 * 	"consequence":0,
 * 	"created":1567156228976,
 * 	"creator_role":"Job4",
 * 	"desc":"Risk description that describes the risk",
 * 	"element":"Doors",
 * 	"level_of_risk":0,
 * 	"likelihood":0,
 * 	"location_desc":"Tower 3 - Level 2",
 * 	"mitigation_desc":"Erect temporary barrier",
 * 	"mitigation_detail":"Erect a temporary 1.5m metal barrier along edge",
 * 	"mitigation_stage":"Construction stage 5",
 * 	"mitigation_status":"proposed",
 * 	"mitigation_type":"Eliminate",
 * 	"model":"00000000-0000-0000-0000-000000000000",
 * 	"name":"Risk 1",
 * 	"overall_level_of_risk":0,
 * 	"owner":"alice",
 * 	"position":[55000.0,80000.0,-10000.0],
 * 	"residual_consequence":-1,
 * 	"residual_level_of_risk":-1,
 * 	"residual_likelihood":-1,
 * 	"residual_risk":"",
 * 	"rev_id":"00000000-0000-0000-0000-000000000001",
 *	"risk_factor":"Factor 9",
 * 	"safetibase_id":"",
 * 	"scope":"Tower 3",
 * 	"thumbnail":"acme/00000000-0000-0000-0000-000000000000/risks/00000000-0000-0000-0000-000000000002/thumbnail.png",
 * 	"viewpoint":{
 * 		"aspect_ratio":1.4,
 * 		"clippingPlanes":[],
 * 		"far":300000,
 * 		"fov":1.05,
 * 		"guid":"00000000-0000-0000-0000-000000000004",
 * 		"hideIfc":true,
 * 		"look_at":[35000.0,40000.0,8000.0],
 * 		"near":600.0,
 * 		"position":[-70000.0,120000.0,150000.0],
 * 		"right":[0.8,-0.3,0.6],
 * 		"screenshot":"acme/00000000-0000-0000-0000-000000000000/risks/00000000-0000-0000-0000-000000000002/viewpoints/00000000-0000-0000-0000-000000000003/screenshot.png",
 * 		"screenshotSmall":"acme/00000000-0000-0000-0000-000000000000/risks/00000000-0000-0000-0000-000000000002/viewpoints/00000000-0000-0000-0000-000000000003/screenshotSmall.png",
 * 		"up":[0.3,0.9,-0.3],
 * 		"view_dir":[0.5,-0.4,-0.7]
 * 	}
 * }
 */
router.post("/risks", risksMiddleware.canCreate, storeRisk);

/**
 * @api {patch} /:teamspace/:model/revision/:revId/risks/:riskId Update risk for a revision
 * @apiName updateRiskForRevision
 * @apiGroup Risks
 * @apiDescription Update model risk.
 *
 * @apiUse Risks
 * @apiUse RiskIdParam
 *
 * @apiParam {String} [revId] Revision ID
 *
 * @apiUse risksCreationPayload
 *
 * @apiExample {patch} Example usage:
 * PATCH /acme/00000000-0000-0000-0000-000000000000/risks/00000000-0000-0000-0000-000000000002 HTTP/1.1
 * {
 * 	"residual_likelihood":1
 * }
 *
 * @apiExample {patch} Example usage:
 * PATCH /acme/00000000-0000-0000-0000-000000000000/revision/00000000-0000-0000-0000-000000000001/risks/00000000-0000-0000-0000-000000000002 HTTP/1.1
 * {
 * 	"residual_likelihood":1
 * }
 *
 * @apiSuccessExample {json} Success-Response
 * HTTP/1.1 200 OK
 * {
 * 	"_id":"00000000-0000-0000-0000-000000000002",
 * 	"account":"acme",
 * 	"assigned_roles":[
 * 		"Job1"
 * 	],
 * 	"associated_activity":"",
 * 	"category":"safety_fall",
 * 	"comments":[],
 * 	"consequence":0,
 * 	"created":1567156228976,
 * 	"creator_role":"Job4",
 * 	"desc":"Risk description that describes the risk",
 * 	"element":"Doors",
 * 	"level_of_risk":0,
 * 	"likelihood":0,
 * 	"location_desc":"Tower 3 - Level 2",
 * 	"mitigation_desc":"Erect temporary barrier",
 * 	"mitigation_detail":"Erect a temporary 1.5m metal barrier along edge",
 * 	"mitigation_stage":"Construction stage 5",
 * 	"mitigation_status":"proposed",
 * 	"mitigation_type":"Eliminate",
 * 	"model":"00000000-0000-0000-0000-000000000000",
 * 	"name":"Risk 1",
 * 	"owner":"alice",
 * 	"overall_level_of_risk":0,
 * 	"position":[55000.0,80000.0,-10000.0],
 * 	"residual_consequence":-1,
 * 	"residual_level_of_risk":-1,
 * 	"residual_likelihood":1,
 * 	"residual_risk":"",
 * 	"rev_id":"00000000-0000-0000-0000-000000000001",
 *	"risk_factor":"Factor 9",
 * 	"safetibase_id":"",
 * 	"scope":"Tower 3",
 * 	"thumbnail":"acme/00000000-0000-0000-0000-000000000000/risks/00000000-0000-0000-0000-000000000002/thumbnail.png",
 * 	"viewpoint":{
 * 		"aspect_ratio":1.4,
 * 		"clippingPlanes":[],
 * 		"far":300000,
 * 		"fov":1.05,
 * 		"guid":"00000000-0000-0000-0000-000000000004",
 * 		"hideIfc":true,
 * 		"look_at":[35000.0,40000.0,8000.0],
 * 		"near":600.0,
 * 		"position":[-70000.0,120000.0,150000.0],
 * 		"right":[0.8,-0.3,0.6],
 * 		"screenshot":"acme/00000000-0000-0000-0000-000000000000/risks/00000000-0000-0000-0000-000000000002/viewpoints/00000000-0000-0000-0000-000000000003/screenshot.png",
 * 		"screenshotSmall":"acme/00000000-0000-0000-0000-000000000000/risks/00000000-0000-0000-0000-000000000002/viewpoints/00000000-0000-0000-0000-000000000003/screenshotSmall.png",
 * 		"up":[0.3,0.9,-0.3],
 * 		"view_dir":[0.5,-0.4,-0.7]
 * 	}
 * }
 */

/**
 * @api {patch} /:teamspace/:model/risks/:riskId Update risk
 * @apiName updateRisk
 * @apiGroup Risks
 * @apiDescription Update model risk.
 *
 * @apiUse Risks
 * @apiUse RiskIdParam
 *
 *
 * @apiUse risksCreationPayload
 *
 * @apiExample {patch} Example usage:
 * PATCH /acme/00000000-0000-0000-0000-000000000000/risks/00000000-0000-0000-0000-000000000002 HTTP/1.1
 * {
 * 	"residual_likelihood":1
 * }
 *
 * @apiExample {patch} Example usage:
 * PATCH /acme/00000000-0000-0000-0000-000000000000/revision/00000000-0000-0000-0000-000000000001/risks/00000000-0000-0000-0000-000000000002 HTTP/1.1
 * {
 * 	"residual_likelihood":1
 * }
 *
 * @apiSuccessExample {json} Success-Response
 * HTTP/1.1 200 OK
 * {
 * 	"_id":"00000000-0000-0000-0000-000000000002",
 * 	"account":"acme",
 * 	"assigned_roles":[
 * 		"Job1"
 * 	],
 * 	"associated_activity":"",
 * 	"category":"safety_fall",
 * 	"comments":[],
 * 	"consequence":0,
 * 	"created":1567156228976,
 * 	"creator_role":"Job4",
 * 	"desc":"Risk description that describes the risk",
 * 	"element":"Doors",
 * 	"level_of_risk":0,
 * 	"likelihood":0,
 * 	"location_desc":"Tower 3 - Level 2",
 * 	"mitigation_desc":"Erect temporary barrier",
 * 	"mitigation_detail":"Erect a temporary 1.5m metal barrier along edge",
 * 	"mitigation_stage":"Construction stage 5",
 * 	"mitigation_status":"proposed",
 * 	"mitigation_type":"Eliminate",
 * 	"model":"00000000-0000-0000-0000-000000000000",
 * 	"name":"Risk 1",
 * 	"owner":"alice",
 * 	"overall_level_of_risk":0,
 * 	"position":[55000.0,80000.0,-10000.0],
 * 	"residual_consequence":-1,
 * 	"residual_level_of_risk":-1,
 * 	"residual_likelihood":1,
 * 	"residual_risk":"",
 * 	"rev_id":"00000000-0000-0000-0000-000000000001",
 *	"risk_factor":"Factor 9",
 * 	"safetibase_id":"",
 * 	"scope":"Tower 3",
 * 	"thumbnail":"acme/00000000-0000-0000-0000-000000000000/risks/00000000-0000-0000-0000-000000000002/thumbnail.png",
 * 	"viewpoint":{
 * 		"aspect_ratio":1.4,
 * 		"clippingPlanes":[],
 * 		"far":300000,
 * 		"fov":1.05,
 * 		"guid":"00000000-0000-0000-0000-000000000004",
 * 		"hideIfc":true,
 * 		"look_at":[35000.0,40000.0,8000.0],
 * 		"near":600.0,
 * 		"position":[-70000.0,120000.0,150000.0],
 * 		"right":[0.8,-0.3,0.6],
 * 		"screenshot":"acme/00000000-0000-0000-0000-000000000000/risks/00000000-0000-0000-0000-000000000002/viewpoints/00000000-0000-0000-0000-000000000003/screenshot.png",
 * 		"screenshotSmall":"acme/00000000-0000-0000-0000-000000000000/risks/00000000-0000-0000-0000-000000000002/viewpoints/00000000-0000-0000-0000-000000000003/screenshotSmall.png",
 * 		"up":[0.3,0.9,-0.3],
 * 		"view_dir":[0.5,-0.4,-0.7]
 * 	}
 * }
 */
router.patch("/risks/:riskId", risksMiddleware.canComment, updateRisk,  middlewares.chat.onUpdateRisk,responseCodes.onSuccessfulOperation);

router.post("/revision/:rid/risks", risksMiddleware.canCreate, storeRisk);

router.patch("/revision/:rid/risks/:riskId", risksMiddleware.canComment, updateRisk, responseCodes.onSuccessfulOperation);

/**
 * @api {post} /:teamspace/:model/risks/:riskId/comments Add a comment
 * @apiName commentRisk
 * @apiGroup Risks
 * @apiDescription Create a comment in a risk.
 *
 * @apiUse Risks
 * @apiUse RiskIdParam
 *
 * @apiBody {String} _id Risk ID
 * @apiBody {String} rev_id Revision ID
 * @apiBody {String} comment Comment text
 * @apiUse viewpointObject
 *
 * @apiSuccess {String} guid Comment ID
 * @apiSuccess {Number} created Comment creation timestamp
 * @apiSuccess {String} owner Comment owner
 * @apiSuccess {String} comment Comment text
 * @apiUse viewpointResponse
 *
 * @apiExample {post} Example usage:
 * POST /acme/00000000-0000-0000-0000-000000000000/risks/00000000-0000-0000-0000-000000000002/comments HTTP/1.1
 * {
 * 	"_id":"00000000-0000-0000-0000-000000000002",
 * 	"rev_id":"00000000-0000-0000-0000-000000000001",
 * 	"comment":"Comment 1",
 * 	"viewpoint":{
 * 		"right":[0.5,-0.1,0.5],
 * 		"up":[0.3,0.9,-0.3],
 * 		"position":[-50000.0,100000.0,150000.0],
 * 		"look_at":[35000.0,50000.0,9000.0],
 * 		"view_dir":[0.5,-0.5,-1.0],
 * 		"near":500.0,
 * 		"far":300000,
 * 		"fov":1.05,
 * 		"aspect_ratio":1.5,
 * 		"clippingPlanes":[],
 * 		"highlighted_group_id":"",
 * 		"screenshot":<base64 image>
 * 	}
 * }
 *
 * @apiSuccessExample {json} Success-Response.
 * HTTP/1.1 200 OK
 * {
 * 	"guid":"00000000-0000-0000-0000-000000000007",
 * 	"created":1567172228143,
 * 	"owner":"alice",
 * 	"comment":"Comment 1",
 * 	"viewpoint":{
 * 		"right":[0.5,-0.1,0.5],
 * 		"up":[0.3,0.9,-0.3],
 * 		"position":[-50000.0,100000.0,150000.0],
 * 		"look_at":[35000.0,50000.0,9000.0],
 * 		"view_dir":[0.5,-0.5,-1.0],
 * 		"near":500.0,
 * 		"far":300000,
 * 		"fov":1.05,
 * 		"aspect_ratio":1.5,
 * 		"clippingPlanes":[],
 * 		"screenshot":"acme/00000000-0000-0000-0000-000000000000/risks/00000000-0000-0000-0000-000000000002/viewpoints/00000000-0000-0000-0000-000000000005/screenshot.png",
 * 		"guid":"00000000-0000-0000-0000-000000000006",
 * 		"screenshotSmall":"acme/00000000-0000-0000-0000-000000000000/risks/00000000-0000-0000-0000-000000000002/viewpoints/00000000-0000-0000-0000-000000000005/screenshotSmall.png"
 * 	}
 * }
 **/
router.post("/risks/:riskId/comments", risksMiddleware.canComment, addComment, middlewares.notification.onNewComment, middlewares.chat.onCommentCreated, responseCodes.onSuccessfulOperation);

/**
 * @api {delete} /:teamspace/:model/risks/:riskId/comments Delete a comment
 * @apiName deleteComment
 * @apiGroup Risks
 * @apiDescription Delete a risk comment.
 *
 * @apiUse Risks
 * @apiUse RiskIdParam
 *
 * @apiBody {String} guid Comment ID
 *
 * @apiExample {delete} Example usage:
 * DELETE /acme/00000000-0000-0000-0000-000000000000/risks/00000000-0000-0000-0000-000000000002/comments HTTP/1.1
 * {
 * 	"guid":"00000000-0000-0000-0000-000000000007",
 * }
 *
 * @apiSuccessExample {json} Success-Response.
 * HTTP/1.1 200 OK
 * {
 * 	"guid":"00000000-0000-0000-0000-000000000007",
 * }
 **/
router.delete("/risks/:riskId/comments", risksMiddleware.canComment, deleteComment, middlewares.chat.onCommentDeleted, responseCodes.onSuccessfulOperation);

/**
 * @api {post} /:teamspace/:model/risks/:riskId/resources Attach resources to a risk
 * @apiName attachResourceRisk
 * @apiGroup Risks
 * @apiDescription Attaches file or URL resources to a risk.
 * If the type of the resource is file it should be sent as multipart/form-data.
 * Both types at the same time cannot be sent. So in order to attach files and URLs it should be done
 * with two different requests.
 *
 * This method triggers a chat event
 *
 * @apiUse RiskIdParam
 *
 * @apiParam {String} teamspace Name of teamspace
 * @apiParam {String} model Model ID
 *
 * @apiBody (file resource (multipart/form-data)) {File[]} files The array of files to be attached
 * @apiBody (file resource (multipart/form-data)) {String[]} names The names of the files; it should have the same length as the files field and should include the file extension
 * @apiBody (URL resource) {String[]} urls The array of URLs to be attached
 * @apiBody (URL resource) {String[]} names The names of the URLs; it should have the same length as the URL field
 *
 * @apiSuccessExample {json} Success example result after two files has been uploaded
 *
 * [
 *    {
 *       "_id":"7617f775-9eb7-4877-8ec3-98ea3457e519",
 *       "size":1422,
 *       "riskIds":[
 *          "3e8a11e0-9812-11e9-9c4d-ebde5888e062"
 *       ],
 *       "name":"todo.txt",
 *       "user":"teamSpace1",
 *       "createdAt":1561973996461
 *    },
 *    {
 *       "_id":"e25e42d5-c4f0-4fbc-a8f4-bc9899e6662a",
 *       "size":2509356,
 *       "riskIds":[
 *          "3e8a11e0-9812-11e9-9c4d-ebde5888e062"
 *       ],
 *       "name":"football.gif",
 *       "user":"teamSpace1",
 *       "createdAt":1561973996462
 *    }
 * ]
 */
router.post("/risks/:riskId/resources",risksMiddleware.canComment, attachResourcesToRisk, middlewares.chat.onResourcesCreated, responseCodes.onSuccessfulOperation);

/**
 * @api {delete} /:teamspace/:model/risks/:riskId/resources Detach a resource from a risk
 * @apiName detachResourceRisk
 * @apiGroup Risks
 * @apiDescription Detachs a resource from a risk. If the risk is the last entity
 * the resources has been attached to it also deletes the resource from the system. This
 * method triggers a chat event .
 *
 * @apiUse RiskIdParam
 *
 * @apiParam {String} teamspace Name of teamspace
 * @apiParam {String} model Model ID
 *
 * @apiBody {String} _id The resource id to be detached
 *
 * @apiSuccessExample {json}
 *
 * {
 *    "_id":"e25e42d5-c4f0-4fbc-a8f4-bc9899e6662a",
 *    "size":2509356,
 *    "riskIds":[
 *    ],
 *    "name":"football.gif",
 *    "user":"teamSpace1",
 *    "createdAt":1561973996462
 * }
 *
 */
router.delete("/risks/:riskId/resources", risksMiddleware.canComment, detachResourcefromRisk, middlewares.chat.onResourceDeleted, responseCodes.onSuccessfulOperation);

function storeRisk(req, res, next) {
	const place = utils.APIInfo(req);
	const { account, model } = req.params;
	const data = req.body;
	const sessionId = req.headers[C.HEADER_SOCKET_ID];

	data.owner = req.session.user.username;
	data.revId = req.params.rid;

	Risk.create(account, model, data, sessionId).then(risk => {
		responseCodes.respond(place, req, res, next, responseCodes.OK, risk);
	}).catch(err => {
		responseCodes.respond(place, req, res, next, err.resCode || utils.mongoErrorToResCode(err), err.resCode ? {} : err);
	});
}

function updateRisk(req, res, next) {
	const place = utils.APIInfo(req);
	const { account, model, riskId } = req.params;
	const updateData = req.body;

	const user = req.session.user.username;
	const sessionId = req.headers[C.HEADER_SOCKET_ID];

	return Risk.update(user, sessionId, account, model, riskId, updateData).then(({updatedTicket, oldTicket, data}) => {
		req.dataModel = updatedTicket;
		req.oldDataModel = oldTicket;
		req.data = data;
		next();
	}).catch((err) => {
		responseCodes.respond(place, req, res, next, err.resCode || utils.mongoErrorToResCode(err), err.resCode ? {} : err);
	});
}

function listRisks(req, res, next) {
	const place = utils.APIInfo(req);
	const { account, model, rid } = req.params;
	const branch = rid ? null : "master";

	const filters = utils.deserialiseQueryFilters(req.query, C.RISK_FILTERS);
	const convertCoords = !!req.query.convertCoords;
	let updatedSince = req.query.updatedSince;

	if (updatedSince) {
		updatedSince = parseInt(updatedSince, 10);
		if (isNaN(updatedSince)) {
			return responseCodes.respond(place, req, res, next, responseCodes.INVALID_ARGUMENTS, responseCodes.INVALID_ARGUMENTS);
		}
	}

	Risk.getList(account, model, branch, rid, filters, convertCoords, updatedSince).then(risks => {
		responseCodes.respond(place, req, res, next, responseCodes.OK, risks);
	}).catch(err => {
		responseCodes.respond(place, req, res, next, err.resCode || utils.mongoErrorToResCode(err), err.resCode ? {} : err);
	});
}

function findRiskById(req, res, next) {
	const params = req.params;
	const place = utils.APIInfo(req);
	const {account, model} =  req.params;

	Risk.findByUID(account, model, params.riskId).then(risk => {
		responseCodes.respond(place, req, res, next, responseCodes.OK, risk);
	}).catch(err => {
		responseCodes.respond(place, req, res, next, err.resCode || utils.mongoErrorToResCode(err), err.resCode ? {} : err);
	});
}

function renderRisksHTML(req, res, next) {
	const place = utils.APIInfo(req);
	const {account, model, rid} = req.params;
	const filters = utils.deserialiseQueryFilters(req.query, C.RISK_FILTERS);

	Risk.getRisksReport(account, model, rid, filters, res).catch(err => {
		responseCodes.respond(place, req, res, next, err.resCode || utils.mongoErrorToResCode(err), err.resCode ? {} : err);
	});
}

function getScreenshot(req, res, next) {
	const place = utils.APIInfo(req);
	const {account, model, riskId, vid} = req.params;

	Risk.getScreenshot(account, model, riskId, vid).then(buffer => {
		responseCodes.respond(place, req, res, next, responseCodes.OK, buffer, "png", config.cachePolicy);
	}).catch(err => {
		responseCodes.respond(place, req, res, next, err, err);
	});
}

function getScreenshotSmall(req, res, next) {
	const place = utils.APIInfo(req);
	const { account, model, riskId, vid } = req.params;

	Risk.getSmallScreenshot(account, model, riskId, vid).then(buffer => {
		responseCodes.respond(place, req, res, next, responseCodes.OK, buffer, "png", config.cachePolicy);
	}).catch(err => {
		responseCodes.respond(place, req, res, next, err, err);
	});
}

function getThumbnail(req, res, next) {
	const place = utils.APIInfo(req);
	const { account, model, riskId } = req.params;

	Risk.getThumbnail(account, model, riskId).then(buffer => {
		responseCodes.respond(place, req, res, next, responseCodes.OK, buffer, "png", config.cachePolicy);
	}).catch(err => {
		responseCodes.respond(place, req, res, next, err, err);
	});
}

function addComment(req, res, next) {
	const user = req.session.user.username;
	const data =  req.body;
	const {account, model, riskId} = req.params;
	const sessionId = req.headers[C.HEADER_SOCKET_ID];

	Risk.addComment(account, model, riskId, user, data, sessionId).then(({comment, userRefs}) => {
		req.dataModel = comment;
		req.userReferences = {type: "risk", userRefs};

		next();
	}).catch(err => {
		responseCodes.onError(req, res, err);
	});
}

function deleteComment(req, res, next) {
	const user = req.session.user.username;
	const guid = req.body.guid;
	const {account, model, riskId} = req.params;

	Comment.deleteComment(account, model, "risks", riskId, guid, user).then(comment => {
		req.dataModel = comment;
		next();
	}).catch(err => {
		responseCodes.onError(req, res, err);
	});
}

function attachResourcesToRisk(req, res, next) {
	const place = utils.APIInfo(req);
	const {account, model, riskId} = req.params;
	const sessionId = req.headers[C.HEADER_SOCKET_ID];
	const user = req.session.user.username;
	const upload = multer({
		storage: multer.memoryStorage()
	});

	upload.array("file")(req, res, function (err) {
		const names = Array.isArray(req.body.names) ? req.body.names : [req.body.names];
		const urls = req.body.urls;
		if (err) {
			return responseCodes.respond(place, req, res, next, err.resCode ? err.resCode : err , err.resCode ?  err.resCode : err);
		} else {
			let resourcesProm = null;

			if (req.files) {
				resourcesProm = Risk.attachResourceFiles(account, model, riskId, user, sessionId, names, req.files);
			} else {
				resourcesProm = Risk.attachResourceUrls(account, model, riskId, user, sessionId, names, urls);
			}

			resourcesProm.then(resources => {
				req.dataModel = resources;
				next();
			}).catch(promErr => {
				responseCodes.respond(place, req, res, next, promErr, promErr);
			});
		}
	});
}

function detachResourcefromRisk(req, res, next) {
	const place = utils.APIInfo(req);
	const {account, model, riskId} = req.params;
	const resourceId = req.body._id;
	const sessionId = req.headers[C.HEADER_SOCKET_ID];
	const user = req.session.user.username;

	Risk.detachResource(account, model, riskId, resourceId, user, sessionId).then(ref => {
		req.dataModel = ref;
		next();
	}).catch(err => {
		responseCodes.respond(place, req, res, next, err, err);
	});

}

module.exports = router;
