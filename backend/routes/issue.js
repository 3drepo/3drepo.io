/**
 *  Copyright (C) 2019 3D Repo Ltd
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
const router = express.Router({ mergeParams: true });
const middlewares = require("../middlewares/middlewares");

const C = require("../constants");
const responseCodes = require("../response_codes.js");
const Issue = require("../models/issue");
const utils = require("../utils");
const multer = require("multer");
const config = require("../config.js");
const ModelSetting = require("../models/modelSetting");
const Comment = require("../models/comment");

/**
 * @api {get} /:teamspace/:model/issues/:issueId Find Issue by ID
 * @apiName findIssueById
 * @apiGroup Issues
 *
 * @apiParam {String} teamspace Name of teamspace
 * @apiParam {String} model Model ID
 * @apiParam {Number} issueId Issue ID
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
 *		norm: []
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
 *
 */
router.get("/issues/:issueId", middlewares.issue.canView, findIssueById);

/**
 * @api {get} /:teamspace/:model/issues/:issueId/thumbnail.png Get Issue Thumbnail
 * @apiName findIssueById
 * @apiGroup Issues
 *
 * @apiParam {String} teamspace Name of teamspace
 * @apiParam {String} model Model ID
 * @apiParam {Number} id Issue unique ID.
 *
 * @apiDescription Retrieve thumbnail screenshot image for requested issue.
 *
 * @apiSuccess 200 {Object} thumbnail Thumbnail Image
 *
 */
router.get("/issues/:issueId/thumbnail.png", middlewares.issue.canView, getThumbnail);

/**
 * @api {get} /:teamspace/:model/issues?[query] Get all Issues
 * @apiName listIssues
 * @apiGroup Issues
 *
 * @apiDescription List all available issue for current model.
 *
 * @apiParam {String} teamspace Name of teamspace
 * @apiParam {String} model Model ID
 *
 * @apiParam (Query) {String} [convertCoords] Convert coordinates to user space
 * @apiParam (Query) {Number} [updatedSince] Only return issues that has been updated since this value (in epoch value)
 *
 * @apiSuccess (200) {Object} Issue Object.
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
 *		"norm":[0,0,0],
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
 *
 */
router.get("/issues", middlewares.issue.canView, listIssues);

/**
 * @api {get} /:teamspace/:model/issues.bcfzip Download issues BCF zip file
 * @apiName getIssuesBCF
 * @apiGroup Issues
 *
 * @apiDescription Get a downloaded zip file of all Issues BCF.
 *
 * @apiParam {String} teamspace Name of teamspace
 * @apiParam {String} model Model ID
 */
router.get("/issues.bcfzip", middlewares.issue.canView, getIssuesBCF);

/**
 * @api {post} /:teamspace/:model/issues.bcfzip Import BCF file
 * @apiName importBCF
 * @apiGroup Issues
 *
 * @apiDescription Upload an Issues BCF file.
 *
 * @apiParam {String} teamspace Name of teamspace
 * @apiParam {String} model Model ID
 */
router.post("/issues.bcfzip", middlewares.issue.canCreate, importBCF);

/**
 * @api {get} /:teamspace/:model/issues.bcfzip Get Issue Screenshot
 * @apiName getScreenshot
 * @apiGroup Issues
 *
 * @apiParam {String} teamspace Name of teamspace
 * @apiParam {String} model Model ID
 * @apiParam {String} id Viewpoint unique ID.
 *
 * @apiDescription Get an issue screenshot from viewpoints using a viewpoint ID and issue ID.
 */
router.get("/issues/:issueId/viewpoints/:vid/screenshot.png", middlewares.issue.canView, getScreenshot);

/**
 * @api {get} /:teamspace/:model/issues/:issueId/viewpoints/:vid/screenshotSmall.png Get smaller version of Issue screenshot
 * @apiName getScreenshotSmall
 * @apiGroup Issues
 *
 * @apiParam {String} teamspace Name of teamspace
 * @apiParam {String} model Model ID
 * @apiParam {String} id Viewpoint unique ID.
 *
 * @apiSuccess (200) {Object} Issue Screenshot.
 */
router.get("/issues/:issueId/viewpoints/:vid/screenshotSmall.png", middlewares.issue.canView, getScreenshot);

/**
 * @api {get} /:teamspace/:model/revision/:rid/issues Get all Issues by revision ID
 * @apiName listIssues
 * @apiGroup Issues
 *
 * @apiParam {String} teamspace Name of teamspace
 * @apiParam {String} model Model ID
 * @apiParam {String} id Revision unique ID.
 *
 * @apiParam (Query) {String} [convertCoords] Convert coordinates to user space
 * @apiParam (Query) {Number} [updatedSince] Only return issues that has been updated since this value (in epoch value)
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
 *		"norm":[],"position":[],
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
router.get("/revision/:rid/issues", middlewares.issue.canView, listIssues);

/**
 * @api {get} /:teamspace/:model/revision/:rid/issues.bcfzip Get Issues BCF zip file by revision ID
 * @apiName getIssuesBCFTRid
 * @apiGroup Issues
 *
 * @apiParam {String} teamspace Name of teamspace
 * @apiParam {String} model Model ID
 * @apiParam {String} id Revision unique ID.
 *
 * @apiDescription Get Issues BCF export based on revision ID.
 *
 */
router.get("/revision/:rid/issues.bcfzip", middlewares.issue.canView, getIssuesBCF);

/**
 * @api {post} /:teamspace/:model/revision/:rid/issues.bcfzip Post Issues BCF zip file by revision ID
 * @apiName postIssuesBCF
 * @apiGroup Issues
 *
 * @apiParam {String} teamspace Name of teamspace
 * @apiParam {String} model Model ID
 * @apiParam {String} id Revision unique ID.
 *
 * @apiDescription Upload Issues BCF file using current revision ID.
 *
 * @apiSuccess (200) {Object} Status
 * @apiSuccessExample {json} Success-Response.
 * HTTP
 * {
 *	"status":"ok"
 * }
 *
 */
router.post("/revision/:rid/issues.bcfzip", middlewares.issue.canCreate, importBCF);

/**
 * @api {get} /:teamspace/:model/issues.html Issues response into as HTML
 * @apiName renderIssuesHTML
 * @apiGroup Issues
 *
 * @apiParam {String} teamspace Name of teamspace
 * @apiParam {String} model Model ID
 *
 * @apiDescription Render all Issues into a HTML webpage, response is rendered HTML.
 */
router.get("/issues.html", middlewares.issue.canView, renderIssuesHTML);

/**
 * @api {get} /:teamspace/:model/revision/:rid/issues.html Issues response into as HTML by revision ID
 * @apiName  renderIssuesHTMLRid
 * @apiGroup Issues
 *
 * @apiParam {String} teamspace Name of teamspace
 * @apiParam {String} model Model ID
 * @apiParam {String} id Revision unique ID.
 *
 * @apiDescription Render all Issues into a HTML webpage based on current revision ID.
 */
router.get("/revision/:rid/issues.html", middlewares.issue.canView, renderIssuesHTML);

/**
 * @api {post} /:teamspace/:model/issues Create issue
 * @apiName  newIssue
 * @apiGroup Issues
 * @apiDescription Creates a new issue.
 *
 * @apiParam {String} teamspace Name of teamspace
 * @apiParam {String} model Model ID
 *
 * @apiParam (Request body) {String} name The name of the issue
 * @apiParam (Request body) {String[]} assigned_roles The roles assigned to the issue. Even though its an array (this is for future support of multiple assigned jobs), currently it has one or none elements correspoing to the available jobs in the teamaspace.
 * @apiParam (Request body) {String} status The status of the issue. It can have a value of "open","in progress","for approval", "void" or "closed".
 * @apiParam (Request body) {String} priority The priority of the issue. It can have a value of "none", String"low", "medium" or "high".
 * @apiParam (Request body) {String} topic_type Type of the issue. It's value has to be one of the defined topic_types for the model. See <a href='#api-Model-createModel'>here</a> for more details.
 * @apiParam (Request body) {Viewpoint} viewpoint The viewpoint of the issue, defining the position of the camera and the screenshot for that position.
 * @apiParam (Request body) {String} desc The description of the created issue
 * @apiParam (Request body) {Number[3]} position The vector defining the pin of the issue. If the pin doesnt has an issue its an empty array.
 * @apiParam (Request body) {Number[3]} position The vector defining the pin of the issue. If the pin doesnt has an issue its an empty array.
 *
 * @apiParam (Request body: Viewpoint) {Number[3]} right The right vector of the viewpoint indicating the direction of right in relative coordinates.
 * @apiParam (Request body: Viewpoint) {Number[3]} up The up vector of the viewpoint indicating the direction of up in relative coordinates.
 * @apiParam (Request body: Viewpoint) {Number[3]} position The position vector indicates where in the world the viewpoint is positioned.
 * @apiParam (Request body: Viewpoint) {Number[3]} look_at The vector indicating where in the world the viewpoint is looking at.
 * @apiParam (Request body: Viewpoint) {Number[3]} view_dir The vector indicating where is the viewpoint is looking at in relative coordinates.
 * @apiParam (Request body: Viewpoint) {Number} near The vector indicating the near plane.
 * @apiParam (Request body: Viewpoint) {Number} far The vector indicating the far plane.
 * @apiParam (Request body: Viewpoint) {Number} fov The angle of the field of view.
 * @apiParam (Request body: Viewpoint) {Number} aspect_ratio The aspect ratio of the fustrum.
 * @apiParam (Request body: Viewpoint) {String} [highlighted_group_id] If the issue is associated with one or more objects from the model this field has the value of a group id generated to hold those objects
 * @apiParam (Request body: Viewpoint) {String[]} [highlighted_objects] If the issue is associated with one or more objects from the model this field has the value of the meshes
 * @apiParam (Request body: Viewpoint) {String} [hidden_group_id] If the issue is associated with one or more objects from the model this field has the value of a group id generated to hold those objects
 * @apiParam (Request body: Viewpoint) {String[]} [hidden_objects] If the issue is associated with one or more objects from the model this field has the value of a group id generated to hold those objects
 * @apiParam (Request body: Viewpoint) {Boolean} hide_IFC A flag to hide the IFC
 * @apiParam (Request body: Viewpoint) {String} screenshot A string in base64 representing the screenshot associated with the issue
 *
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
 *       "highlighted_group_id": "",
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
 *    "norm": [
 *       0,
 *       0,
 *       0
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
 *       "highlighted_group_id": "",
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
router.post("/issues", middlewares.issue.canCreate, storeIssue, middlewares.notification.onUpdateIssue, middlewares.chat.onNotification, responseCodes.onSuccessfulOperation);

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
 * @apiParam {String} teamspace Name of teamspace
 * @apiParam {String} model Model ID
 * @apiParam {String} id Issue unique ID
 *
 * @apiParam (Request body) {[]String} [assigned_roles] Job roles assigned to the issue
 * @apiParam (Request body) {String} [desc] Description of issue
 * @apiParam (Request body) {String} [status] The status of issue (values: "open", "in progress", "for approval", "closed")
 * @apiParam (Request body) {String} [topic_type] Topic type of issue (see <a href='#api-Model-createModel'>here</a> for available types)
 * @apiParam (Request body) {[3]Number} [position] Vector defining the pin position of the issue; empty if the issue has no pin
 * @apiParam (Request body) {Number} [due_date] Due date timestamp for the issue
 * @apiParam (Request body) {String} [priority] The priority of the issue (values: "none", "low", "medium", "high")
 * @apiParam (Request body) {Number} [scale] The scale factor of the issue
 * @apiParam (Request body) {Object} [viewpoint] The viewpoint and screenshot of the issue
 * @apiParam (Request body) {Number} [viewCount] The viewcount of the issue
 * @apiParam (Request body) {Object} [extras] A field containing any extras that wanted to be saved in the issue (typically used by BCF)
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
 *    "norm": [],
 *    "position": [],
 *    "extras": {
 *    }
 * }
 *
 * @apiSuccess (200) {Object} Updated Issue Object.
 *
 */
router.patch("/issues/:issueId", middlewares.issue.canComment, updateIssue, middlewares.chat.onUpdateIssue, middlewares.notification.onUpdateIssue, middlewares.chat.onNotification, responseCodes.onSuccessfulOperation);

/**
 * @api {post} /:teamspace/:model/revision/:rid/issues Create issue on revision
 * @apiName newIssueRev
 * @apiGroup Issues
 * @apiDescription Creates a new issue for a particular revision. See <a href="#api-Issues-newIssue">here</a> for more details.
 *
 * @apiParam {String} teamspace Name of teamspace
 * @apiParam {String} model Model ID
 * @apiParam {String} rid Unique Revision ID to store.
 */
router.post("/revision/:rid/issues", middlewares.issue.canCreate, storeIssue, responseCodes.onSuccessfulOperation);

/**
 * @api {patch} /:teamspace/:model/revision/:rid/issues/:issueId Update issue on revision
 * @apiName updateIssueRev
 * @apiGroup Issues
 * @apiDescription Updates an issue for a particular revision. See <a href="#api-Issues-updateIssue">here</a> for more details.
 *
 * @apiParam {String} teamspace Name of teamspace
 * @apiParam {String} model Model ID
 * @apiParam {String} rid Unique Revision ID to update to.
 * @apiParam {String} issueId Unique Issue ID to update.
 */
router.patch("/revision/:rid/issues/:issueId", middlewares.issue.canComment, updateIssue, middlewares.notification.onUpdateIssue, middlewares.chat.onNotification, responseCodes.onSuccessfulOperation);

/**
 * @api {post} /:teamspace/:model/issues/:issueId/comments Add comment to issue
 * @apiName commentIssue
 * @apiGroup Issues
 *
 * @apiParam {String} teamspace Name of teamspace
 * @apiParam {String} model Model ID
 * @apiParam {String} issueId Unique Issue ID to update.
 * @apiParam {Json} PAYLOAD The data with the comment to be added.
 * @apiParamExample {json} PAYLOAD
 *    {
 *      "comment": "This is a commment",
 *      "viewpoint: {right: [-0.0374530553817749, -7.450580596923828e-9, -0.9992983341217041],…}
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
router.post("/issues/:issueId/comments", middlewares.issue.canComment, addComment, middlewares.notification.onNewComment, middlewares.chat.onCommentCreated, responseCodes.onSuccessfulOperation);

/**
 * @api {delete} /:teamspace/:model/issues/:issueId/comments Deletes an comment from an issue
 * @apiName commentIssue
 * @apiGroup Issues
 *
 * @apiParam {String} teamspace Name of teamspace
 * @apiParam {String} model Model ID
 * @apiParam {String} issueId Unique Issue ID to update.
 * @apiParam {Json} PAYLOAD The data with the comment guid to be deleted.
 * @apiParamExample {json} PAYLOAD
 *    {
 *       guid: "096de7ed-e3bb-4d5b-ae68-17a5cf7a5e5e"
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
router.delete("/issues/:issueId/comments", middlewares.issue.canComment, deleteComment, middlewares.chat.onCommentDeleted, responseCodes.onSuccessfulOperation);

router.post("/revision/:rid/issues.json", middlewares.issue.canCreate, storeIssue, responseCodes.onSuccessfulOperation);

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
 * @apiParam {String} teamspace Name of teamspace
 * @apiParam {String} model Model ID
 * @apiParam {String} issueId Issue unique ID
 *
 * @apiParam (Request body file resource (multipart/form-data)) {File[]} files The array of files to be attached
 * @apiParam (Request body file resource (multipart/form-data)) {String[]} names The names of the files; it should have the same length as the files field and should include the file extension
 * @apiParam (Request body url resource) {String[]} urls The array of urls to be attached
 * @apiParam (Request body url resource) {String[]} names The names of the urls; it should have the same length as the url field
 *
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
router.post("/issues/:issueId/resources",middlewares.issue.canComment, attachResourcesToIssue, middlewares.chat.onResourcesCreated, responseCodes.onSuccessfulOperation);

/**
 * @api {delete} /:teamspace/:model/issues/:issueId/resources Detach a resource from an issue
 * @apiName detachResource
 * @apiGroup Issues
 * @apiDescription Detachs a resource from an issue. If the issue is the last entity
 * the resources has been attached to it also deletes the resource from the system. This
 * method triggers a chat event .
 *
 * @apiParam {String} teamspace Name of teamspace
 * @apiParam {String} model Model ID
 * @apiParam {String} issueId Issue unique ID
 *
 * @apiParam (Request body) {String} _id The resource id to be detached
 *
 * @apiSuccessExample {json}
 *
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
router.delete("/issues/:issueId/resources",middlewares.issue.canComment, detachResourcefromIssue, middlewares.chat.onResourceDeleted, responseCodes.onSuccessfulOperation);

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
	const ids = req.query.ids ? req.query.ids.split(",") : null;
	const convertCoords = !!req.query.convertCoords;
	let updatedSince = req.query.updatedSince;

	if (updatedSince) {
		updatedSince = parseInt(updatedSince, 10);
		if (isNaN(updatedSince)) {
			return responseCodes.respond(place, req, res, next, responseCodes.INVALID_ARGUMENTS, responseCodes.INVALID_ARGUMENTS);
		}
	}

	Issue.getList(account, model, branch, rid, ids, convertCoords, updatedSince).then(issues => {
		responseCodes.respond(place, req, res, next, responseCodes.OK, issues);
	}).catch(err => {
		responseCodes.respond(place, req, res, next, err.resCode || utils.mongoErrorToResCode(err), err.resCode ? {} : err);
	});
}

function getIssuesBCF(req, res, next) {
	const place = utils.APIInfo(req);
	const account = req.params.account;
	const model = req.params.model;
	const dbCol =  {account: account, model: model};

	let ids;
	let useIssueNumbers = false;
	if (req.query.numbers) {
		ids = req.query.numbers.split(",");
		useIssueNumbers = true;
	} else if (req.query.ids) {
		ids = req.query.ids.split(",");
	}

	let getBCFZipRS;

	if (req.params.rid) {
		getBCFZipRS = Issue.getBCF(account, model, null, req.params.rid, ids, useIssueNumbers);
	} else {
		getBCFZipRS = Issue.getBCF(account, model, "master", null, ids, useIssueNumbers);
	}

	getBCFZipRS.then(zipRS => {
		const timestamp = (new Date()).toLocaleString();

		ModelSetting.findById(dbCol, dbCol.model).then((settings) => {
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

function findIssueById(req, res, next) {
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
	const ids = req.query.ids ? req.query.ids.split(",") : undefined;

	Issue.getIssuesReport(account, model, rid, ids, res).catch(err => {
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
