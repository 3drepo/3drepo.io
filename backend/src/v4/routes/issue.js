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
const router = express.Router({ mergeParams: true });
const middlewares = require("../middlewares/middlewares");
const issuesMiddleware = require("../middlewares/issue");

const C = require("../constants");
const responseCodes = require("../response_codes.js");
const Issue = require("../models/issue");
const utils = require("../utils");
const multer = require("multer");
const config = require("../config.js");
const { findModelSettingById } = require("../models/modelSetting");
const Comment = require("../models/comment");

/**
 * @apiDefine Issues Issues
 *
 * @apiParam {String} teamspace Name of teamspace
 * @apiParam {String} model Model ID
 */

/**
 * @apiDefine IssueIdParam
 *
 * @apiParam {String} issueId Issue ID
 */

/**
 * @apiDefine RevIdParam
 *
 * @apiParam {String} revId Revision ID
 */

/**
 * @apiDefine ViewpointIdParam
 *
 * @apiParam {String} viewpointId Viewpoint ID
 */

/**
 * @apiDefine listIssuesParams
 *
 * @apiParam (Query) {String} [convertCoords] Convert coordinates to user space
 * @apiParam (Query) {Number} [updatedSince] Only return issues updated since this value (in epoch value)
 * @apiParam (Query) {Number[]} [numbers] Array of issue numbers to filter for
 * @apiParam (Query) {String[]} [ids] Array of issue IDs to filter for
 * @apiParam (Query) {String[]} [topicTypes] Array of topic types to filter
 * @apiParam (Query) {String[]} [status] Array of status to filter
 * @apiParam (Query) {String[]} [priorities] Array of priorities to filter
 * @apiParam (Query) {String[]} [owners] Array of owners to filter
 * @apiParam (Query) {String[]} [assignedRoles] Array of assigned roles  to filter. For searching unassigned issues the one of the values should be 'Unassigned'.
 *
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
 */

/**
 * @api {get} /:teamspace/:model/issues/:issueId Get issue
 * @apiName findIssue
 * @apiGroup Issues
 *
 * @apiUse Issues
 * @apiUse IssueIdParam
 *
 * @apiDescription Find an issue with the requested Issue ID.
 *
 * @apiSuccess {Object} issue The Issue matching the Issue ID
 * @apiSuccessExample {json} Success-Response.
 * HTTP/1.1 200 OK
 * {
 *		account: "username"
 *		assigned_roles: []
 *		commentCount: 0
 *		created: 1542723030489
 *		creator_role: "3D Repo"
 *		desc: "(No Description)"
 *		model: "model_ID"
 *		modelCode: ""
 *		name: "Issue one"
 *		number: 1
 *		owner: "username"
 *		position: []
 *		priority: "none"
 *		rev_id: "revision_ID"
 *		scale: 1
 *		status: "open"
 *		thumbnail: "USERNAME/MODEL_ID/issues/ISSUE_ID/thumbnail.png"
 *		topic_type: "for_information"
 *		typePrefix: "Architectural"
 *		viewCount: 1
 *		viewpoint: {near: 24.057758331298828, far: 12028.87890625, fov: 1.0471975803375244,…}
 *		__v: 0
 *		_id: "ISSUE_ID"
 * }
 *
 * @apiError ISSUE_NOT_FOUND Issue not found
 * @apiErrorExample
 * HTTP/1.1 404 Not Found
 * {
 *	 "place": "GET /issues/:issueId",
 *	 "status": 500,
 *	 "message": "Issue not found",
 * }
 */
router.get("/issues/:issueId", issuesMiddleware.canView, findIssue);

/**
 * @api {get} /:teamspace/:model/issues/:issueId/thumbnail.png Get issue thumbnail
 * @apiName getThumbnail
 * @apiGroup Issues
 * @apiDescription Retrieve screenshot thumbnail image for requested issue.
 *
 * @apiUse Issues
 * @apiUse IssueIdParam
 *
 * @apiSuccess (200) {Object} thumbnail Thumbnail image
 */
router.get("/issues/:issueId/thumbnail.png", issuesMiddleware.canView, getThumbnail);

/**
 * @api {get} /:teamspace/:model/issues List Issues
 * @apiName listIssues
 * @apiGroup Issues
 * @apiDescription List all issues for model.
 *
 * @apiUse Issues
 * @apiUse listIssuesParams
 *
 *
 * @apiSuccessExample {json} Success-Response.
 * HTTP/1.1 200 OK
 * [
 *	{
 *		"_id":"ISSUE_ID",
 *		"creator_role":"Client","scale":1,
 *		"due_date":1543881600000,
 *		"priority":"low",
 *		"desc":"reverse",
 *		"topic_type":"for_information",
 *		"status":"for approval",
 *		"owner":"username",
 *		"created":1546217360002,
 *		"name":"Without reverse",
 *		"number":2,
 *		"rev_id":"REVISION_ID",
 *		"__v":0,
 *		"assigned_roles":["Architect"],
 *		"viewCount":1,
 *		"commentCount":0,
 *		"thumbnail":"nabile/MODEL_ID/issues/ISSUE_ID/thumbnail.png",
 *		"position":[8341.8056640625,1279.962158203125,-3050.34521484375],
 *		"typePrefix":"sample",
 *		"modelCode":"",
 *		"account":"username",
 *		"model":"MODEL_ID",
 *		"viewpoint":
 *			{
 *				"near":54.739341735839844,
 *				"far":27369.669921875,
 *				"fov":1.0471975803375244,
 *				"aspect_ratio":1.451704502105713,
 *				"hideIfc":true,
 *				"guid":"9279d95e-3aee-49c2-ba45-9d2302044597",
 *				"_id":"5c296790e5f57704580ca00a",
 *				"type":"perspective",
 *				"screenshot":"ACCOUNT/MODEL_ID/issues/ISSUE_ID/viewpoints/MODEL_ID/screenshot.png",
 *				"clippingPlanes":[],"right":[0.7270411252975464,1.862645149230957e-8,0.6865938901901245],
 *				"view_dir":[0.6777805089950562,-0.15971262753009796,-0.7177084684371948],
 *				"look_at":[8400.001953125,2339.99951171875,-9599.9990234375],
 *				"position":[-3360.6259765625,5111.28125,2853.4453125],
 *				"up":[0.10965770483016968,0.9871635437011719,-0.11611767113208771],
 *				"screenshotSmall":"nabile/MODEL_ID/issues/ISSUE_ID/viewpoints/MODEL_ID/screenshotSmall.png"
 *			}
 *	}
 * ]
 */
router.get("/issues", issuesMiddleware.canView, listIssues);

/**
 * @api {get} /:teamspace/:model/issues.bcfzip Download issues BCF file
 * @apiName getIssuesBCF
 * @apiGroup Issues
 * @apiDescription Download issues as a BCF file.
 *
 * @apiUse Issues
 */
router.get("/issues.bcfzip", issuesMiddleware.canView, getIssuesBCF);

/**
 * @api {post} /:teamspace/:model/issues.bcfzip Import BCF file
 * @apiName importBCF
 * @apiGroup Issues
 * @apiDescription Upload issues BCF file.
 *
 * @apiUse Issues
 */
router.post("/issues.bcfzip", issuesMiddleware.canCreate, importBCF);

/**
 * @api {get} /:teamspace/:model/issues/:issueId/viewpoints/:viewpointId/screenshot.png Get issue viewpoint screenshot
 * @apiName getScreenshot
 * @apiGroup Issues
 * @apiDescription Get an issue viewpoint screenshot.
 *
 * @apiUse Issues
 * @apiUse IssueIdParam
 * @apiUse ViewpointIdParam
 */
router.get("/issues/:issueId/viewpoints/:vid/screenshot.png", issuesMiddleware.canView, getScreenshot);

/**
 * @api {get} /:teamspace/:model/issues/:issueId/viewpoints/:viewpointId/screenshotSmall.png Get smaller version of Issue screenshot
 * @apiName getScreenshotSmall
 * @apiGroup Issues
 *
 * @apiUse Issues
 * @apiUse IssueIdParam
 * @apiUse ViewpointIdParam
 *
 * @apiSuccess (200) {Object} Issue Screenshot.
 */
router.get("/issues/:issueId/viewpoints/:vid/screenshotSmall.png", issuesMiddleware.canView, getScreenshot);

/**
 * @api {get} /:teamspace/:model/revision/:revId/issues List Issues by revision ID
 * @apiName listIssuesByRevision
 * @apiGroup Issues
 *
 * @apiUse Issues
 * @apiUse RevIdParam
 *
 * @apiUse listIssuesParams
 *
 * @apiDescription Get all issues related to specific revision ID.
 *
 * @apiSuccess (200) {Object} Issues Object
 * @apiSuccessExample {json} Success-Response
 *
 * [
 *	{
 *		"_id":"issue_ID",
 *		"creator_role":"Client",
 *		"scale":1,
 *		"due_date":1547424000000,
 *		"priority":"low",
 *		"desc":"This is a description",
 *		"topic_type":"for_information",
 *		"status":"open","owner":"username",
 *		"created":1546626949432,
 *		"name":"An Issue for API",
 *		"number":3,
 *		"rev_id":"9cf31c6e-37cc-4625-8cee-270cf731059e",
 *		"__v":0,
 *		"assigned_roles":["Architect"],
 *		"viewCount":1,"commentCount":0,
 *		"thumbnail":"ACCOUNT/MODEL_ID/issues/ISSUE_ID/thumbnail.png",
 *		"position":[],
 *		"typePrefix":"sample",
 *		"modelCode":"",
 *		"account":"username",
 *		"model":"MODEL_ID",
 *		"viewpoint":
 *			{
 *				"near":54.739341735839844,
 *				"far":27369.669921875,
 *				"fov":1.0471975803375244,
 *				"aspect_ratio":2.522167444229126,
 *				"hideIfc":true,
 *				"guid":"5afbe23f-8307-42d0-ba77-f031922281ce",
 *				"_id":"5c2fa785b4af3c45f8f83c60",
 *				"type":"perspective",
 *				"screenshot":"username/MODEL_ID/issues/ISSUE_ID/viewpoints/5afbe23f-8307-42d0-ba77-f031922281ce/screenshot.png",
 *				"clippingPlanes":[],"right":[0.7270411252975464,1.862645149230957e-8,0.6865938901901245],
 *					"view_dir":[0.6777805089950562,-0.15971262753009796,-0.7177084684371948],
 *					"look_at":[8400.001953125,2339.99951171875,-9599.9990234375],
 *					"position":[-3360.6259765625,5111.28125,2853.4453125],
 *					"up":[0.10965770483016968,0.9871635437011719,-0.11611767113208771],
 *					"screenshotSmall"username/MODEL_ID/issues/ISSUE_ID/viewpoints/5afbe23f-8307-42d0-ba77-f031922281ce/screenshot.png"}
 *	}
 * ]
 */
router.get("/revision/:rid/issues", issuesMiddleware.canView, listIssues);

/**
 * @api {get} /:teamspace/:model/revision/:revId/issues.bcfzip Get Issues BCF zip file by revision ID
 * @apiName getIssuesBCFTRid
 * @apiGroup Issues
 *
 * @apiUse Issues
 * @apiUse RevIdParam
 *
 * @apiDescription Get Issues BCF export based on revision ID.
 *
 */
router.get("/revision/:rid/issues.bcfzip", issuesMiddleware.canView, getIssuesBCF);

/**
 * @api {post} /:teamspace/:model/revision/:revId/issues.bcfzip Post Issues BCF zip file by revision ID
 * @apiName postIssuesBCF
 * @apiGroup Issues
 *
 * @apiUse Issues
 * @apiUse RevIdParam
 *
 * @apiDescription Upload Issues BCF file using current revision ID.
 *
 * @apiSuccess (200) {String} status "ok" on success
 * @apiSuccessExample {json} Success-Response:
 * HTTP
 * {
 *	"status":"ok"
 * }
 *
 */
router.post("/revision/:rid/issues.bcfzip", issuesMiddleware.canCreate, importBCF);

/**
 * @api {get} /:teamspace/:model/issues.html Issues response into as HTML
 * @apiName renderIssuesHTML
 * @apiGroup Issues
 *
 * @apiUse Issues
 *
 * @apiDescription Render all Issues into a HTML webpage, response is rendered HTML.
 */
router.get("/issues.html", issuesMiddleware.canView, renderIssuesHTML);

/**
 * @api {get} /:teamspace/:model/revision/:revId/issues.html Issues response into as HTML by revision ID
 * @apiName  renderIssuesHTMLRid
 * @apiGroup Issues
 *
 * @apiUse Issues
 * @apiUse RevIdParam
 *
 * @apiDescription Render all Issues into a HTML webpage based on current revision ID.
 */
router.get("/revision/:rid/issues.html", issuesMiddleware.canView, renderIssuesHTML);

/**
 * @api {post} /:teamspace/:model/issues Create issue
 * @apiName  newIssue
 * @apiGroup Issues
 * @apiDescription Creates a new issue.
 *
 * @apiUse Issues
 *
 * @apiBody {String} name The name of the issue
 * @apiBody {String[]} assigned_roles The roles assigned to the issue. Even though its an array (this is for future support of multiple assigned jobs), currently it has one or none elements correspoing to the available jobs in the teamaspace.
 * @apiBody {String} status The status of the issue. It can have a value of "open","in progress","for approval", "void" or "closed".
 * @apiBody {String} priority The priority of the issue. It can have a value of "none", "low", "medium" or "high".
 * @apiBody {String} topic_type Type of the issue. It's value has to be one of the defined topic_types for the model. See <a href='#api-Model-createModel'>here</a> for more details.
 * @apiBody {Viewpoint} viewpoint The viewpoint of the issue, defining the position of the camera and the screenshot for that position.
 * @apiBody {String} desc The description of the created issue
 * @apiBody {Number{3..3}} position The vector defining the pin of the issue. If the pin doesnt has an issue its an empty array.
 *
 * @apiUse viewpointObject
 *
 * @apiExample {post} Example usage:
 * POST /teamSpace1/3549ddf6-885d-4977-87f1-eeac43a0e818/issues HTTP/1.1
 * {
 *    "name": "Amazing issue",
 *    "assigned_roles": [
 *       "jobA"
 *    ],
 *    "status": "open",
 *    "priority": "none",
 *    "topic_type": "for_information",
 *    "viewpoint": {
 *       "right": [
 *          0.8471935391426086,
 *          -2.2351741790771484e-8,
 *          0.5312844514846802
 *       ],
 *       "up": [
 *          0.14098820090293884,
 *          0.9641460180282593,
 *          -0.22482173144817352
 *       ],
 *       "position": [
 *          -5828.818359375,
 *          5268.15625,
 *          7829.76171875
 *       ],
 *       "look_at": [
 *          -2445.6826171875,
 *          3515.4658203125,
 *          2434.966552734375
 *       ],
 *       "view_dir": [
 *          0.5122357606887817,
 *          -0.2653723657131195,
 *          -0.8168182373046875
 *       ],
 *       "near": 20.835742950439453,
 *       "far": 10417.87109375,
 *       "fov": 1.0471975803375244,
 *       "aspect_ratio": 4.031496047973633,
 *       "clippingPlanes": [],
 *       "override_groups": [
 *           {
 *               "color": [
 *          	     0,
 *          	     106,
 *          	     255,
 *          	     52
 *          	 ],
 *          	 "objects": [
 *                   {
 *                       "shared_ids": [
 *                           "ffd49cfd-57fb-4c31-84f7-02b41352b54f"
 *                       ],
 *                       "account": "teamSpace1",
 *                       "model": "2710bd65-37d3-4e7f-b2e0-ffe743ce943f"
 *                   }
 *               ]
 *          },
 *          {
 *              "color": [
 *                  96,
 *                  237,
 *                  61
 *              ],
 *          	"objects": [
 *          	    {
 *                      "shared_ids": [
 *                          "a4a14ee6-aa44-4f36-96bd-f80dbabf8ead"
 *                      ],
 *                      "account": "teamSpace1",
 *                      "model": "2710bd65-37d3-4e7f-b2e0-ffe743ce943f"
 *                  }
 *              ]
 *          }
 *       ],
 *       "transformation_groups": [
 *           {
 *               "transformation": [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16],
 *          	 "objects": [
 *                   {
 *                       "shared_ids": [
 *                           "ffd49cfd-57fb-4c31-84f7-02b41352b54f"
 *                       ],
 *                       "account": "teamSpace1",
 *                       "model": "2710bd65-37d3-4e7f-b2e0-ffe743ce943f"
 *                   }
 *               ]
 *          },
 *          {
 *              "color": [
 *                  96,
 *                  237,
 *                  61
 *              ],
 *          	"objects": [
 *          	    {
 *                      "shared_ids": [
 *                          "a4a14ee6-aa44-4f36-96bd-f80dbabf8ead"
 *                      ],
 *                      "account": "teamSpace1",
 *                      "model": "2710bd65-37d3-4e7f-b2e0-ffe743ce943f"
 *                  }
 *              ]
 *          }
 *       ],
 *       "highlighted_group": {
 *       	"objects": [
 *       		{
 *       			"shared_ids": [
 *       				"60286d41-d897-4de6-a0ed-0929fa68be96"
 *       			],
 *       			"account": "teamSpace1",
 *       			"model": "7cf61b4f-acdf-4295-b2d0-9b45f9f27418"
 *       		}
 *       	],
 *       	"color": [
 *       		255,
 *       		255,
 *       		0
 *       	]
 *       },
 *       "hidden_group": {
 *       	"objects": [
 *       		{
 *       			"shared_ids": [
 *       				"57b0969f-6009-4e32-9153-2b17d3a3628b"
 *       			],
 *       			"account": "teamSpace1",
 *       			"model": "b1fceab8-b0e9-4e45-850b-b9888efd6521"
 *       		}
 *       	]
 *       }
 *       "hideIfc": true,
 *       "screenshot": "iVBORw0KGgoAAAANSUhEUgAACAAAA...ggg=="
 *    },
 *    "desc": "This is the most awesome issue ever",
 *    "position": [
 *       -3960.10205078125,
 *       4487.1552734375,
 *       3326.732177734375
 *    ]
 * }
 *
 * @apiSuccessExample {json} Success:
 * {
 *    "name": "Amazing issue",
 *    "assigned_roles": [
 *       "jobA"
 *    ],
 *    "status": "open",
 *    "priority": "none",
 *    "topic_type": "for_information",
 *    "owner": "teamSpace1",
 *    "desc": "This is the most awesome issue ever",
 *    "rev_id": "330f909b-9279-41aa-a87c-1c46f53a8e93",
 *    "creator_role": "jobA",
 *    "scale": 1,
 *    "position": [
 *       -3960.10205078125,
 *       4487.1552734375,
 *       3326.732177734375
 *    ],
 *    "_id": "9ba5fb10-c8db-11e9-8f2a-ada77612c97e",
 *    "created": 1566918114625,
 *    "number": 1,
 *    "thumbnail": "teamSpace1/3549ddf6-885d-4977-87f1-eeac43a0e818/issues/9ba5fb10-c8db-11e9-8f2a-ada77612c97e/thumbnail.png",
 *    "typePrefix": "Structural",
 *    "modelCode": "",
 *    "account": "teamSpace1",
 *    "model": "3549ddf6-885d-4977-87f1-eeac43a0e818",
 *    "viewpoint": {
 *       "right": [
 *          0.8471935391426086,
 *          -2.2351741790771484e-8,
 *          0.5312844514846802
 *       ],
 *       "up": [
 *          0.14098820090293884,
 *          0.9641460180282593,
 *          -0.22482173144817352
 *       ],
 *       "position": [
 *          -5828.818359375,
 *          5268.15625,
 *          7829.76171875
 *       ],
 *       "look_at": [
 *          -2445.6826171875,
 *          3515.4658203125,
 *          2434.966552734375
 *       ],
 *       "view_dir": [
 *          0.5122357606887817,
 *          -0.2653723657131195,
 *          -0.8168182373046875
 *       ],
 *       "near": 20.835742950439453,
 *       "far": 10417.87109375,
 *       "fov": 1.0471975803375244,
 *       "aspect_ratio": 4.031496047973633,
 *       "clippingPlanes": [],
 *       "hidden_group_id": "119d5dc0-e223-11ea-8549-49012d4e4956",
 *       "highlighted_group_id" : "80c5a270-e223-11ea-8549-49012d4e4956",
 *       "override_group_ids": [
 *          "11952060-e223-11ea-8549-49012d4e4956",
 *          "bc5ca80-e6c7-11ea-bd51-ddd919e6418e"
 *       ],
 *       "transformation_group_ids": [
 *          "12345678-e223-11ea-8549-49012d4e4956",
 *          "12345678-e6c7-11ea-bd51-ddd919e6418e"
 *       ],
 *       "hideIfc": true,
 *       "screenshot": "teamSpace1/3549ddf6-885d-4977-87f1-eeac43a0e818/issues/9ba5fb10-c8db-11e9-8f2a-ada77612c97e/viewpoints/125ce196-852c-49ed-9a2f-f9a77aa03390/screenshot.png",
 *       "guid": "125ce196-852c-49ed-9a2f-f9a77aa03390",
 *       "screenshotSmall": "teamSpace1/3549ddf6-885d-4977-87f1-eeac43a0e818/issues/9ba5fb10-c8db-11e9-8f2a-ada77612c97e/viewpoints/125ce196-852c-49ed-9a2f-f9a77aa03390/screenshotSmall.png"
 *    },
 *    "comments": [],
 *    "extras": {
 *    }
 * }
 *
 *
 */
router.post("/issues", issuesMiddleware.canCreate, storeIssue, middlewares.notification.onUpdateIssue, middlewares.chat.onNotification, responseCodes.onSuccessfulOperation);

/**
 * @api {patch} /:teamspace/:model/issues/:issueId Update issue
 * @apiName  updateIssue
 * @apiGroup Issues
 * @apiDescription Updates an issue. It takes the part of the issue that can be updated.
 * The system will create a system comment within the issue describing which values were changed.
 * The user needs to be the teamspace administrator, the project administrator, has the same job as the creator of the issue, or has the issue assigned. In the case that the issue has been assigned to the user, the user cannot change it to the "closed" status.
 *
 * If the issue is being updated to assigned to a job and the status of the issue has the value "for_approval", then the status of the issue is automatically changed to "in_progress".
 *
 * If the user is changing the issue to the "for_approval" status, the issue will be assigned to the job that the creator of the issue.
 *
 * @apiUse Issues
 * @apiUse IssueIdParam
 *
 * @apiBody {String[]} [assigned_roles] Job roles assigned to the issue
 * @apiBody {String} [desc] Description of issue
 * @apiBody {String} [status] The status of issue (values: "open", "in progress", "for approval", "closed")
 * @apiBody {String} [topic_type] Topic type of issue (see <a href='#api-Model-createModel'>here</a> for available types)
 * @apiBody {Number{3..3}} [position] Vector defining the pin position of the issue; empty if the issue has no pin
 * @apiBody {Number} [due_date] Due date timestamp for the issue
 * @apiBody {String} [priority] The priority of the issue (values: "none", "low", "medium", "high")
 * @apiBody {Number} [scale] The scale factor of the issue
 * @apiBody {Viewpoint} [viewpoint] The viewpoint and screenshot of the issue
 * @apiBody {Number} [viewCount] The viewcount of the issue
 * @apiBody {Object} [extras] A field containing any extras that wanted to be saved in the issue (typically used by BCF)
 *
 * @apiUse viewpointObject
 *
 * @apiExample {patch} Example usage:
 * PATCH /teamSpace1/3549ddf6-885d-4977-87f1-eeac43a0e818/issues/98c39770-c8e2-11e9-8f2a-ada77612c97e HTTP/1.1
 * {"status":"in progress"}
 *
 * @apiSuccessExample {json} Success:
 * {
 *    "_id": "98c39770-c8e2-11e9-8f2a-ada77612c97e",
 *    "name": "issue 2",
 *    "assigned_roles": [
 *       "jobC"
 *    ],
 *    "status": "in progress",
 *    "priority": "none",
 *    "topic_type": "for_information",
 *    "owner": "teamSpace1",
 *    "rev_id": "330f909b-9279-41aa-a87c-1c46f53a8e93",
 *    "creator_role": "jobA",
 *    "scale": 1,
 *    "created": 1566921116263,
 *    "desc": "(No Description)",
 *    "number": 2,
 *    "thumbnail": "teamSpace1/3549ddf6-885d-4977-87f1-eeac43a0e818/issues/98c39770-c8e2-11e9-8f2a-ada77612c97e/thumbnail.png",
 *    "comments": [
 *       {
 *          "guid": "febbe083-5a98-4711-8d60-d2ac06721f83",
 *          "created": 1566924049774,
 *          "owner": "teamSpace1",
 *          "action": {
 *             "property": "assigned_roles",
 *             "from": "",
 *             "to": "jobB"
 *          },
 *          "sealed": true
 *       },
 *       {
 *          "guid": "e8ba32b2-d58e-4c33-90f7-c6e0404ef1ee",
 *          "created": 1566924062287,
 *          "owner": "teamSpace1",
 *          "action": {
 *             "property": "assigned_roles",
 *             "from": "jobB",
 *             "to": "jobC"
 *          },
 *          "sealed": true
 *       },
 *       {
 *          "guid": "83117273-2698-4d2d-bd47-7cd31e6a7b14",
 *          "created": 1566924080277,
 *          "owner": "teamSpace1",
 *          "action": {
 *             "property": "status",
 *             "from": "open",
 *             "to": "in progress"
 *          }
 *       }
 *    ],
 *    "status_last_changed": 1566924080277,
 *    "account": "teamSpace1",
 *    "model": "3549ddf6-885d-4977-87f1-eeac43a0e818",
 *    "viewpoint": {
 *       "right": [
 *          0.9953137040138245,
 *          -4.656612873077393e-10,
 *          0.09669896215200424
 *       ],
 *       "up": [
 *          0.005437099374830723,
 *          0.9984180331230164,
 *          -0.05596357211470604
 *       ],
 *       "position": [
 *          -3083.33251953125,
 *          3886.8251953125,
 *          8998.2783203125
 *       ],
 *       "look_at": [
 *          -2445.680419921875,
 *          3515.46533203125,
 *          2434.984130859375
 *       ],
 *       "view_dir": [
 *          0.0965459868311882,
 *          -0.05622706934809685,
 *          -0.9937390685081482
 *       ],
 *       "near": 20.835796356201172,
 *       "far": 10417.8984375,
 *       "fov": 1.0471975803375244,
 *       "aspect_ratio": 3.1459293365478516,
 *       "clippingPlanes": [],
 *       "highlighted_group_id": "98b9d370-c8e2-11e9-8f2a-ada77612c97e",
 *       "hideIfc": true,
 *       "screenshot": "teamSpace1/3549ddf6-885d-4977-87f1-eeac43a0e818/issues/98c39770-c8e2-11e9-8f2a-ada77612c97e/viewpoints/a1167d5f-2434-4a50-a158-d6a6745e7d6a/screenshot.png",
 *       "guid": "a1167d5f-2434-4a50-a158-d6a6745e7d6a",
 *       "screenshotSmall": "teamSpace1/3549ddf6-885d-4977-87f1-eeac43a0e818/issues/98c39770-c8e2-11e9-8f2a-ada77612c97e/viewpoints/a1167d5f-2434-4a50-a158-d6a6745e7d6a/screenshotSmall.png"
 *    },
 *    "position": [],
 *    "extras": {
 *    }
 * }
 *
 * @apiSuccess (200) {Object} Updated Issue Object.
 *
 */
router.patch("/issues/:issueId", issuesMiddleware.canComment, updateIssue, middlewares.chat.onUpdateIssue, middlewares.notification.onUpdateIssue, middlewares.chat.onNotification, responseCodes.onSuccessfulOperation);

/**
 * @api {post} /:teamspace/:model/revision/:revId/issues Create issue on revision
 * @apiName newIssueRev
 * @apiGroup Issues
 * @apiDescription Creates a new issue for a particular revision. See <a href="#api-Issues-newIssue">here</a> for more details.
 *
 * @apiUse Issues
 * @apiUse RevIdParam
 */
router.post("/revision/:rid/issues", issuesMiddleware.canCreate, storeIssue, responseCodes.onSuccessfulOperation);

/**
 * @api {patch} /:teamspace/:model/revision/:revId/issues/:issueId Update issue on revision
 * @apiName updateIssueRev
 * @apiGroup Issues
 * @apiDescription Updates an issue for a particular revision. See <a href="#api-Issues-updateIssue">here</a> for more details.
 *
 * @apiUse Issues
 * @apiUse IssueIdParam
 * @apiUse RevIdParam
 */
router.patch("/revision/:rid/issues/:issueId", issuesMiddleware.canComment, updateIssue, middlewares.notification.onUpdateIssue, middlewares.chat.onNotification, responseCodes.onSuccessfulOperation);

/**
 * @api {post} /:teamspace/:model/issues/:issueId/comments Add comment to issue
 * @apiName commentIssue
 * @apiGroup Issues
 *
 * @apiUse Issues
 * @apiUse IssueIdParam
 *
 * @apiBody {String} comment Comment text
 * @apiBody {Viewpoint} [viewpoint] The viewpoint associated with the comment
 *
 * @apiUse viewpointObject
 *
 * @apiParamExample {json} Request Body Example:
 *    {
 *      "comment": "This is a commment",
 *      "viewpoint": {right: [-0.0374530553817749, -7.450580596923828e-9, -0.9992983341217041],…}
 *    }
 *
 * @apiSuccessExample {json} Success
 *    HTTP/1.1 200 OK
 *   {
 *       guid: "096de7ed-e3bb-4d5b-ae68-17a5cf7a5e5e",
 *       comment: "This is a commment",
 *       created: 1558534690327,
 *       guid: "096de7ed-e3bb-4d5b-ae68-17a5cf7a5e5e",
 *       owner: "username",
 *       viewpoint: {right: [-0.0374530553817749, -7.450580596923828e-9, -0.9992983341217041],…}
 *   }
 *
 * @apiError 404 Issue not found
 * @apiError 400 Comment with no text
 * */
router.post("/issues/:issueId/comments", issuesMiddleware.canComment, addComment, middlewares.notification.onNewComment, middlewares.chat.onCommentCreated, responseCodes.onSuccessfulOperation);

/**
 * @api {delete} /:teamspace/:model/issues/:issueId/comments Deletes an comment from an issue
 * @apiName commentIssue
 * @apiGroup Issues
 *
 * @apiUse Issues
 * @apiUse IssueIdParam
 * @apiBody {String} guid The GUID of the comment to be deleted.
 * @apiParamExample {json} Request Body Example:
 *    {
 *       "guid": "096de7ed-e3bb-4d5b-ae68-17a5cf7a5e5e"
 *    }
 *
 * @apiSuccessExample {json} Success
 *    HTTP/1.1 200 OK
 *   {
 *       guid: "096de7ed-e3bb-4d5b-ae68-17a5cf7a5e5e"
 *   }
 *
 * @apiError 404 Issue not found
 * @apiError 401 Not authorized, when the user is not the owner
 * @apiError 400 Issue comment sealed, when the user is trying to delete a comment that is sealed
 * @apiError 400 GUID invalid, when the user sent an invalid guid
 * */
router.delete("/issues/:issueId/comments", issuesMiddleware.canComment, deleteComment, middlewares.chat.onCommentDeleted, responseCodes.onSuccessfulOperation);

router.post("/revision/:rid/issues.json", issuesMiddleware.canCreate, storeIssue, responseCodes.onSuccessfulOperation);

/**
 * @api {post} /:teamspace/:model/issues/:issueId/resources Attach resources to an issue
 * @apiName attachResource
 * @apiGroup Issues
 * @apiDescription Attaches file or url resources to an issue.
 * If the type of the resource is file it should be send as multipart/form-data.
 * Both types at the same time cant be sent. So in order to attach files and urls it should be done
 * with two different requests.
 *
 * This method triggers a chat event
 *
 * @apiUse Issues
 * @apiUse IssueIdParam
 *
 * @apiBody (File Resource - multipart/form-data) {File[]} files The array of files to be attached
 * @apiBody (File Resource - multipart/form-data) {String[]} names The names of the files; it should have the same length as the files field and should include the file extension
 * @apiBody (URL Resource) {String[]} urls The array of urls to be attached
 * @apiBody (URL Resource) {String[]} names The names of the urls; it should have the same length as the url field
 * @apiSuccessExample {json} Success example result after two files has been uploaded
 *
 * [
 *    {
 *       "_id":"7617f775-9eb7-4877-8ec3-98ea3457e519",
 *       "size":1422,
 *       "issueIds":[
 *          "3e8a11e0-9812-11e9-9c4d-ebde5888e062"
 *       ],
 *       "name":"todo.txt",
 *       "user":"teamSpace1",
 *       "createdAt":1561973996461
 *    },
 *    {
 *       "_id":"e25e42d5-c4f0-4fbc-a8f4-bc9899e6662a",
 *       "size":2509356,
 *       "issueIds":[
 *          "3e8a11e0-9812-11e9-9c4d-ebde5888e062"
 *       ],
 *       "name":"football.gif",
 *       "user":"teamSpace1",
 *       "createdAt":1561973996462
 *    }
 * ]
 */
router.post("/issues/:issueId/resources",issuesMiddleware.canComment, attachResourcesToIssue, middlewares.chat.onResourcesCreated, responseCodes.onSuccessfulOperation);

/**
 * @api {delete} /:teamspace/:model/issues/:issueId/resources Detach a resource from an issue
 * @apiName detachResource
 * @apiGroup Issues
 * @apiDescription Detachs a resource from an issue. If the issue is the last entity
 * the resources has been attached to it also deletes the resource from the system. This
 * method triggers a chat event .
 *
 * @apiUse Issues
 * @apiUse IssueIdParam
 *
 * @apiBody {String} _id The resource id to be detached
 *
 * @apiSuccessExample {json} Success-Response
 * HTTP/1.1 200 OK
 * {
 *    "_id":"e25e42d5-c4f0-4fbc-a8f4-bc9899e6662a",
 *    "size":2509356,
 *    "issueIds":[
 *    ],
 *    "name":"football.gif",
 *    "user":"teamSpace1",
 *    "createdAt":1561973996462
 * }
 */
router.delete("/issues/:issueId/resources",issuesMiddleware.canComment, detachResourcefromIssue, middlewares.chat.onResourceDeleted, responseCodes.onSuccessfulOperation);

function storeIssue(req, res, next) {
	const data = req.body;
	const sessionId = req.headers[C.HEADER_SOCKET_ID];

	data.owner = req.session.user.username;
	delete data._id; // Ignore _id field

	if (req.params.rid) {
		data.revId = req.params.rid;
	}

	const {account, model} = req.params;

	Issue.create(account, model, data, sessionId).then(issue => {
		req.dataModel = issue;
		next();
	}).catch(err => {
		responseCodes.onError(req, res, err);
	});
}

function updateIssue(req, res, next) {
	const place = utils.APIInfo(req);
	const { account, model, issueId } = req.params;
	const updateData = req.body;

	const user = req.session.user.username;
	const sessionId = req.headers[C.HEADER_SOCKET_ID];

	return Issue.update(user, sessionId, account, model, issueId, updateData).then(({updatedTicket, oldTicket, data}) => {
		req.dataModel = updatedTicket;
		req.oldDataModel = oldTicket;
		req.data = data;
		next();
	}).catch((err) => {
		responseCodes.respond(place, req, res, next, err.resCode || utils.mongoErrorToResCode(err), err.resCode ? {} : err);
	});
}

function listIssues(req, res, next) {
	const place = utils.APIInfo(req);
	const { account, model, rid } = req.params;
	const branch = rid ? null : "master";
	const filters = utils.deserialiseQueryFilters(req.query, C.ISSUE_FILTERS);

	const convertCoords = !!req.query.convertCoords;
	let updatedSince = req.query.updatedSince;

	if (updatedSince) {
		updatedSince = parseInt(updatedSince, 10);
		if (isNaN(updatedSince)) {
			return responseCodes.respond(place, req, res, next, responseCodes.INVALID_ARGUMENTS, responseCodes.INVALID_ARGUMENTS);
		}
	}

	Issue.getList(account, model, branch, rid, filters, convertCoords, updatedSince).then(issues => {
		responseCodes.respond(place, req, res, next, responseCodes.OK, issues);
	}).catch(err => {
		responseCodes.respond(place, req, res, next, err.resCode || utils.mongoErrorToResCode(err), err.resCode ? {} : err);
	});
}

function getIssuesBCF(req, res, next) {
	const place = utils.APIInfo(req);
	const account = req.params.account;
	const model = req.params.model;

	const filters = utils.deserialiseQueryFilters(req.query, C.ISSUE_FILTERS);

	let getBCFZipRS;

	if (req.params.rid) {
		getBCFZipRS = Issue.getBCF(account, model, null, req.params.rid, filters);
	} else {
		getBCFZipRS = Issue.getBCF(account, model, "master", null, filters);
	}

	getBCFZipRS.then(zipRS => {
		const timestamp = (new Date()).toLocaleString();

		findModelSettingById(account, model).then((settings) => {
			const filenamePrefix = (settings.name + "_" + timestamp + "_").replace(/\W+/g, "_");

			const headers = {
				"Content-Disposition": "attachment;filename=" + filenamePrefix + "issues.bcf",
				"Content-Type": "application/zip"
			};

			res.writeHead(200, headers);
			zipRS.pipe(res);
		});

	}).catch(err => {
		responseCodes.respond(place, req, res, next, err.resCode || utils.mongoErrorToResCode(err), err.resCode ? {} : err);
	});
}

function findIssue(req, res, next) {
	const place = utils.APIInfo(req);
	const {account, model, issueId} = req.params;

	Issue.findByUID(account, model, issueId).then(issue => {
		responseCodes.respond(place, req, res, next, responseCodes.OK, issue);
	}).catch(err => {
		responseCodes.respond(place, req, res, next, err.resCode || utils.mongoErrorToResCode(err), err.resCode ? {} : err);
	});
}

function renderIssuesHTML(req, res, next) {
	const place = utils.APIInfo(req);
	const {account, model, rid} = req.params;
	const filters = utils.deserialiseQueryFilters(req.query, C.ISSUE_FILTERS);

	Issue.getIssuesReport(account, model, rid, filters, res).catch(err => {
		responseCodes.respond(place, req, res, next, err.resCode || utils.mongoErrorToResCode(err), err.resCode ? {} : err);
	});
}

function importBCF(req, res, next) {
	const place = utils.APIInfo(req);

	const upload = multer({
		storage: multer.memoryStorage(),
		fileFilter : (fileReq, file, cb) => {
			const acceptedFormat = [
				"bcf", "bcfzip", "zip"
			];

			let format = file.originalname.split(".");
			format = format.length <= 1 ? "" : format.splice(-1)[0];

			const size = parseInt(fileReq.headers["content-length"]);

			if (acceptedFormat.indexOf(format.toLowerCase()) === -1) {
				return cb({ resCode: responseCodes.FILE_FORMAT_NOT_SUPPORTED });
			}

			if (size > config.uploadSizeLimit) {
				return cb({ resCode: responseCodes.SIZE_LIMIT });
			}

			cb(null, true);
		}
	});

	upload.single("file")(req, res, function (err) {
		if (err) {
			return responseCodes.respond(place, req, res, next, err.resCode || err, err.resCode || err);
		}
		Issue.importBCF({ socketId: req.headers[C.HEADER_SOCKET_ID], user: req.session.user.username }, req.params.account, req.params.model, req.params.rid, req.file.buffer).then(() => {
			responseCodes.respond(place, req, res, next, responseCodes.OK, { "status": "ok" });
		}).catch(error => {
			responseCodes.respond(place, req, res, next, error, error);
		});
	});
}

function getScreenshot(req, res, next) {
	const place = utils.APIInfo(req);
	const {account, model, issueId, vid} = req.params;

	Issue.getScreenshot(account, model, issueId, vid).then(buffer => {
		responseCodes.respond(place, req, res, next, responseCodes.OK, buffer, "png", config.cachePolicy);
	}).catch(err => {
		responseCodes.respond(place, req, res, next, err, err);
	});
}

function getThumbnail(req, res, next) {
	const place = utils.APIInfo(req);
	const { account, model, issueId } = req.params;

	Issue.getThumbnail(account, model, issueId).then(buffer => {
		responseCodes.respond(place, req, res, next, responseCodes.OK, buffer, "png", config.cachePolicy);
	}).catch(err => {
		responseCodes.respond(place, req, res, next, err, err);
	});
}

function addComment(req, res, next) {
	const user = req.session.user.username;
	const data =  req.body;
	const {account, model, issueId} = req.params;
	const sessionId = req.headers[C.HEADER_SOCKET_ID];

	Issue.addComment(account, model, issueId, user, data, sessionId).then(({comment, userRefs}) => {
		req.dataModel = comment;
		req.userReferences = {type: "issue", userRefs};
		next();
	}).catch(err => {
		responseCodes.onError(req, res, err);
	});
}

function deleteComment(req, res, next) {
	const user = req.session.user.username;
	const guid = req.body.guid;
	const {account, model, issueId} = req.params;

	Comment.deleteComment(account, model, "issues", issueId, guid, user).then(comment => {
		req.dataModel = comment;
		next();
	}).catch(err => {
		responseCodes.onError(req, res, err);
	});
}

function attachResourcesToIssue(req, res, next) {
	const place = utils.APIInfo(req);
	const {account, model, issueId} = req.params;
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
				resourcesProm = Issue.attachResourceFiles(account, model, issueId, user, sessionId, names, req.files);
			} else {
				resourcesProm = Issue.attachResourceUrls(account, model, issueId, user, sessionId, names, urls);
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

function detachResourcefromIssue(req, res, next) {
	const place = utils.APIInfo(req);
	const {account, model, issueId} = req.params;
	const resourceId = req.body._id;
	const sessionId = req.headers[C.HEADER_SOCKET_ID];
	const user = req.session.user.username;

	Issue.detachResource(account, model, issueId, resourceId, user, sessionId).then(ref => {
		req.dataModel = ref;
		next();
	}).catch(err => {
		responseCodes.respond(place, req, res, next, err, err);
	});

}

module.exports = router;
