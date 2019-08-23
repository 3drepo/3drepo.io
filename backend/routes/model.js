/**
 *	Copyright (C) 2018 3D Repo Ltd
 *
 *	This program is free software: you can redistribute it and/or modify
 *	it under the terms of the GNU Affero General Public License as
 *	published by the Free Software Foundation, either version 3 of the
 *	License, or (at your option) any later version.
 *
 *	This program is distributed in the hope that it will be useful,
 *	but WITHOUT ANY WARRANTY; without even the implied warranty of
 *	MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *	GNU Affero General Public License for more details.
 *
 *	You should have received a copy of the GNU Affero General Public License
 *	along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
"use strict";

const express = require("express");
const router = express.Router({mergeParams: true});
const utils = require("../utils");
const middlewares = require("../middlewares/middlewares");
const ModelSetting = require("../models/modelSetting");
const responseCodes = require("../response_codes");
const C = require("../constants");
const ModelHelpers = require("../models/helper/model");
const UnityAssets = require("../models/unityAssets");
const JSONAssets = require("../models/jsonAssets");
const config = require("../config");

function getDbColOptions(req) {
	return {account: req.params.account, model: req.params.model};
}

function convertProjectToParam(req, res, next) {
	if (req.body.project) {
		req.params.project = req.body.project;
	}
	next();
}

// Get model info

/**
 * @api {get} /:teamspace/:model.json Get model settings
 * @apiName getModelSetting
 * @apiGroup Model
 *
 * @apiParam {String} teamspace Name of teamspace
 * @apiParam {Object} model The modelId to get settings for.
 *
 * @apiExample {get} Example usage:
 * GET /teamSpace1/3549ddf6-885d-4977-87f1-eeac43a0e818.json HTTP/1.1
 *
 * @apiSuccessExample {json} Success:
 * {
 *    _id: "3549ddf6-885d-4977-87f1-eeac43a0e818",
 *    timestamp: "2019-05-13T16:54:44.000Z",
 *    type: "Structural",
 *    desc: "",
 *    name: "Lego Tree",
 *    subModels: [],
 *    surveyPoints: [],
 *    properties: {
 *       unit: "mm",
 *       topicTypes: [
 *          {
 *             value: "clash",
 *             label: "Clash"
 *          },
 *          {
 *             value: "diff",
 *             label: "Diff"
 *          },
 *          {
 *             value: "rfi",
 *             label: "RFI"
 *          },
 *          {
 *             value: "risk",
 *             label: "Risk"
 *          },
 *          {
 *             value: "hs",
 *             label: "H&S"
 *          },
 *          {
 *             value: "design",
 *             label: "Design"
 *          },
 *          {
 *             value: "constructibility",
 *             label: "Constructibility"
 *          },
 *          {
 *             value: "gis",
 *             label: "GIS"
 *          },
 *          {
 *             value: "for_information",
 *             label: "For information"
 *          },
 *          {
 *             value: "vr",
 *             label: "VR"
 *          }
 *       ]
 *    },
 *    permissions: [
 *       "change_model_settings",
 *       "upload_files",
 *       "create_issue",
 *       "comment_issue",
 *       "view_issue",
 *       "view_model",
 *       "download_model",
 *       "edit_federation",
 *       "delete_federation",
 *       "delete_model",
 *       "manage_model_permission"
 *    ],
 *    status: "ok",
 *    id: "3549ddf6-885d-4977-87f1-eeac43a0e818",
 *    model: "3549ddf6-885d-4977-87f1-eeac43a0e818",
 *    account: "teamSpace1",
 *    headRevisions: {
 *    }
 * }
 *
 */

router.get("/:model.json", middlewares.hasReadAccessToModel, getModelSetting);

/**
 * @api {get} /:teamspace/:model/settings/heliSpeed Get model heli speed
 * @apiName getHeliSpeed
 * @apiGroup Model
 *
 * @apiParam {String} model The modelId to get Heli speed for.
 *
 * @apiExample {get} Example usage:
 * GET /teamSpace1/3549ddf6-885d-4977-87f1-eeac43a0e818/settings/heliSpeed HTTP/1.1
 *
 * @apiSuccessExample {json} Success:
 * {"heliSpeed":1}
 *
 */

router.get("/:model/settings/heliSpeed", middlewares.hasReadAccessToModel, getHeliSpeed);

/**
 * @api {put} /:teamspace/:model/settings/heliSpeed Update model heli speed
 * @apiName updateHeliSpeed
 * @apiGroup Model
 *
 * @apiParam {String} model Model to Update Heli speed.
 * @apiParam (Request body) {Number} heliSpeed The value of the speed that will replace the heli speed.
 *
 * @apiExample {put} Example usage:
 * PUT /teamSpace1/3549ddf6-885d-4977-87f1-eeac43a0e818/settings/heliSpeed HTTP/1.1
 * {"heliSpeed":3}
 *
 * @apiSuccessExample {json} Success:
 * {}
 *
 */

router.put("/:model/settings/heliSpeed", middlewares.hasReadAccessToModel, updateHeliSpeed);

/**
 * @api {put} /:teamspace/:model/settings/ Update Model Settings
 * @apiName updateSettings
 * @apiGroup Model
 *
 * @apiParam {String} model Model to update Settings.
 *
 * @apiParam (Request body) {String} name Name of the model to be created
 * @apiParam (Request body) {String} unit The unit in which the model is specified
 * @apiParam (Request body) {String} code A code to be associated with the model; it can be of maximum 5 letters (a-z) and numbers
 * @apiParam (Request body) {String} type The type of the model
 * @apiParam (Request body) {Number} angleFromNorth GIS bearing angle
 * @apiParam (Request body) {Number} elevation GIS elevation
 * @apiParam (Request body) {[]SurveyPoint} surveyPoints  an array containing GIS surveypoints
 * @apiParam (Request body) {[]String} topicTypes  an array containing the different types of issues/risks that can be associated with the model
 *
 * @apiParam (Request body: SurveyPoint) {[]Number} position an array representing a three dimensional coordinate
 * @apiParam (Request body: SurveyPoint) {[]Number} latLong an array representing a two dimensional coordinate for latitude and logitude
 *
 * @apiExample {put} Example usage:
 * PUT /teamSpace1/3549ddf6-885d-4977-87f1-eeac43a0e818/settings HTTP/1.1
 * {
 *    name: "Medieval",
 *    unit: "cm",
 *    code: "1233",
 *    type: "Architectural",
 *    angleFromNorth: 3,
 *    elevation: 0,
 *    surveyPoints: [
 *       {
 *          position: [
 *             4,
 *             -7,
 *             -1
 *          ],
 *          latLong: [
 *             1,
 *             2,
 *          ]
 *       }
 *    ],
 *    topicTypes: [
 *       "Clash",
 *       "Constructibility",
 *       "Design",
 *       "Diff",
 *       "For information",
 *       "GIS",
 *       "H&S",
 *       "RFI",
 *       "Risk",
 *       "VR"
 *    ]
 * }
 *
 * @apiSuccessExample {json} Success:
 * {
 *    topicTypes: [
 *       {
 *          value: "clash",
 *          label: "Clash"
 *       },
 *       {
 *          value: "constructibility",
 *          label: "Constructibility"
 *       },
 *       {
 *          value: "design",
 *          label: "Design"
 *       },
 *       {
 *          value: "diff",
 *          label: "Diff"
 *       },
 *       {
 *          value: "for_information",
 *          label: "For information"
 *       },
 *       {
 *          value: "gis",
 *          label: "GIS"
 *       },
 *       {
 *          value: "hs",
 *          label: "H&S"
 *       },
 *       {
 *          value: "rfi",
 *          label: "RFI"
 *       },
 *       {
 *          value: "risk",
 *          label: "Risk"
 *       },
 *       {
 *          value: "vr",
 *          label: "VR"
 *       }
 *    ],
 *    code: "stage",
 *    unit: "cm"
 * }
 *
 */

router.put("/:model/settings", middlewares.hasWriteAccessToModelSettings, updateSettings);

/**
 * @api {post} /:teamspace/:model Create a model
 * @apiName createModel
 * @apiGroup Model
 *
 * @apiParam {String} teamspace Name of teamspace
 *
 * @apiParam (Request body) {String} project Name of project in which the model will be created
 * @apiParam (Request body) {String} modelName Name of the model to be created
 * @apiParam (Request body) {String} unit The unit in which the model is specified
 * @apiParam (Request body) {String} desc A description of the model
 * @apiParam (Request body) {String} code A code to be associated with the model; it can be of maximum 5 letters (a-z) and numbers
 * @apiParam (Request body) {String} type The type of the model
 *
 * @apiExample {post} Example usage:
 * POST /teamSpace1/model HTTP/1.1
 * {
 *    project: "classic project",
 *    modelName: "awesomeModel",
 *    unit: "ft",
 *    desc: "This is an awesome model!",
 *    code: "awe12",
 *    type: "Mechanical"
 * }
 *
 * @apiSuccessExample {json} Success:
 * {
 *    account: "teamSpace1",
 *    model: "17d09947-368e-4748-877f-d105842c6681",
 *    name: "awesomeModel",
 *    permissions: [
 *       "change_model_settings",
 *       "upload_files",
 *       "create_issue",
 *       "comment_issue",
 *       "view_issue",
 *       "view_model",
 *       "download_model",
 *       "edit_federation",
 *       "delete_federation",
 *       "delete_model",
 *       "manage_model_permission"
 *    ],
 *    setting: {
 *       type: "Mechanical",
 *       desc: "",
 *       name: "awesomeModel",
 *       _id: "17d09947-368e-4748-877f-d105842c6681",
 *       subModels: [],
 *       surveyPoints: [],
 *       properties: {
 *          unit: "ft",
 *          topicTypes: [
 *             {
 *                value: "clash",
 *                label: "Clash"
 *             },
 *             {
 *                value: "diff",
 *                label: "Diff"
 *             },
 *             {
 *                value: "rfi",
 *                label: "RFI"
 *             },
 *             {
 *                value: "risk",
 *                label: "Risk"
 *             },
 *             {
 *                value: "hs",
 *                label: "H&S"
 *             },
 *             {
 *                value: "design",
 *                label: "Design"
 *             },
 *             {
 *                value: "constructibility",
 *                label: "Constructibility"
 *             },
 *             {
 *                value: "gis",
 *                label: "GIS"
 *             },
 *             {
 *                value: "for_information",
 *                label: "For information"
 *             },
 *             {
 *                value: "vr",
 *                label: "VR"
 *             }
 *          ]
 *       },
 *       permissions: [],
 *       status: "ok"
 *    }
 * }
 *
 */

router.post("/model",convertProjectToParam,middlewares.canCreateModel,createModel);

// Unity information

/**
 * @api {get} /:teamspace/:model/revision/master/head/unityAssets.json Get unity assets
 * @apiName getUnityAssets
 * @apiGroup Model
 * @apiDescription Get the lastest model's version unity assets
 *
 * @apiParam {String} teamspace Name of teamspace
 * @apiParam {String} model The model Id to get unity assets for.
 *
 * @apiExample {get} Example usage:
 * GET /teamSpace1/3549ddf6-885d-4977-87f1-eeac43a0e818/revision/master/head/unityAssets.json HTTP/1.1
 *
 * @apiSuccessExample {json} Success:
 * {
 *    models: [
 *       {
 *          _id: "Mw+Qm5J5QaqofBxG9TqOkw==",
 *          assets: [
 *             "/teamSpace1/3549ddf6-885d-4977-87f1-eeac43a0e818/92fc213b-1bab-49a4-b10e-f4368a52d500.unity3d"
 *          ],
 *          database: "teamSpace1",
 *          model: "3549ddf6-885d-4977-87f1-eeac43a0e818",
 *          offset: [
 *             -688.095458984375,
 *             6410.9140625,
 *             683.460205078125
 *          ],
 *          jsonFiles: [
 *             "/teamSpace1/3549ddf6-885d-4977-87f1-eeac43a0e818/92fc213b-1bab-49a4-b10e-f4368a52d500_unity.json.mpc"
 *          ]
 *       }
 *    ]
 * }
 */

router.get("/:model/revision/master/head/unityAssets.json", middlewares.hasReadAccessToModel, getUnityAssets);

/**
 * @api {get} /:teamspace/:model/revision/:rev/unityAssets.json Get revision's unity assets
 * @apiName getRevUnityAssets
 * @apiGroup Model
 * @apiDescription Get the model's assets but of a particular revision
 *
 * @apiParam {String} teamspace Name of teamspace
 * @apiParam {String} model The model Id to get unity assets for.
 * @apiParam {String} rev The revision of the model to get unity assets for
 *
 * @apiExample {get} Example usage:
 * GET /teamSpace1/3549ddf6-885d-4977-87f1-eeac43a0e818/revision/master/head/unityAssets.json HTTP/1.1
 *
 * @apiSuccessExample {json} Success:
 * {
 *    models: [
 *       {
 *          _id: "Mw+Qm5J5QaqofBxG9TqOkw==",
 *          assets: [
 *             "/teamSpace1/3549ddf6-885d-4977-87f1-eeac43a0e818/92fc213b-1bab-49a4-b10e-f4368a52d500.unity3d"
 *          ],
 *          database: "teamSpace1",
 *          model: "3549ddf6-885d-4977-87f1-eeac43a0e818",
 *          offset: [
 *             -688.095458984375,
 *             6410.9140625,
 *             683.460205078125
 *          ],
 *          jsonFiles: [
 *             "/teamSpace1/3549ddf6-885d-4977-87f1-eeac43a0e818/92fc213b-1bab-49a4-b10e-f4368a52d500_unity.json.mpc"
 *          ]
 *       }
 *    ]
 * }
 *
 */

router.get("/:model/revision/:rev/unityAssets.json", middlewares.hasReadAccessToModel, getUnityAssets);

/**
 * @api {get} /:teamspace/:model/:uid.json.mpc Get JSON Mpc
 * @apiName getJsonMpc
 * @apiGroup Model
 * @apiDescription Get the unity bundle mpc json file. The path for this api is provided in the data retrieved by either one of the endpoints /:teamspace/:model/revision/master/head/unityAssets.json or /:teamspace/:model/revision/:rev/unityAssets.json
 *
 * @apiParam {String} teamspace Name of teamspace
 * @apiParam {String} model id of the model to get JSON Mpc for.
 * @apiParam {String} uid id of the json.mpc file
 *
 * @apiExample {get} Example usage:
 * GET /teamSpace1/3549ddf6-885d-4977-87f1-eeac43a0e818/92fc213b-1bab-49a4-b10e-f4368a52d500_unity.json.mpc HTTP/1.1
 *
 * @apiSuccessExample {json} Success:
 * {
 *    numberOfIDs: 1,
 *    maxGeoCount: 1,
 *    mapping: [
 *       {
 *          name: "ce413e99-8469-4ed0-86e3-ff50bf4fed89",
 *          sharedID: "a876e59a-8cda-4d61-b438-c74ce7b8855d",
 *          min: [
 *             -3515.19556,
 *             -5790.91504,
 *             0
 *          ],
 *          max: [
 *             0,
 *             0,
 *             3502.927
 *          ],
 *          usage: [
 *             "92fc213b-1bab-49a4-b10e-f4368a52d500_0"
 *          ]
 *       }
 *    ]
 * }
 *
 */

router.get("/:model/:uid.json.mpc",  middlewares.hasReadAccessToModel, getJsonMpc);

/**
 * @api {get} /:teamspace/:model/:uid.unity3d Get Unity Bundle
 * @apiName getUnityBundle
 * @apiGroup Model
 * @apiDescription Gets an actual unity bundle file. The path for this api is provided in the data retrieved by either one of the endpoints /:teamspace/:model/revision/master/head/unityAssets.json or /:teamspace/:model/revision/:rev/unityAssets.json
 *
 * @apiParam {String} teamspace Name of teamspace
 * @apiParam {String} model id of the model to get JSON Mpc for.
 * @apiParam {String} uid id of the unity bundle
 */

router.get("/:model/:uid.unity3d", middlewares.hasReadAccessToModel, getUnityBundle);

/**
 * @api {put} /:teamspace/:model Update Federated Model
 * @apiName updateModel
 * @apiGroup Model
 *
 * @apiParam {String} teamspace Name of teamspace
 * @apiParam {String} model Federated Model ID to update
 *
 * @apiParam (Request body){[]Submodel} subModels Information on the models that are going to get federated
 *
 * @apiParam (Request body: SubModel){String} database The teamspace name which the model belongs to
 * @apiParam (Request body: SubModel){String} model The model id to be federated
 *
 * @apiExample {put} Example usage:
 * PUT /teamSpace1/5ce7dd19-1252-4548-a9c9-4a5414f2e0c5 HTTP/1.1
 * {
 *    subModels: [
 *       {
 *          database: "teamSpace1",
 *          model: "2710bd65-37d3-4e7f-b2e0-ffe743ce943f",
 *       },
 *       {
 *          database: "teamSpace1",
 *          model: "7cf61b4f-acdf-4295-b2d0-9b45f9f27418",
 *       }
 *    ]
 * }
 *
 * @apiSuccessExample {json} Success:
 * {
 *    account: "teamSpace1",
 *    model: "5ce7dd19-1252-4548-a9c9-4a5414f2e0c5",
 *    setting: {
 *       _id: "5ce7dd19-1252-4548-a9c9-4a5414f2e0c5",
 *       federate: {
 *       },
 *       desc: "",
 *       name: "Full Logo test",
 *       timestamp: "2019-08-22T10:42:05.242Z",
 *       type: "Federation",
 *       subModels: [
 *          {
 *             database: "teamSpace1",
 *             model: "2710bd65-37d3-4e7f-b2e0-ffe743ce943f"
 *          },
 *          {
 *             database: "teamSpace1",
 *             model: "7cf61b4f-acdf-4295-b2d0-9b45f9f27418"
 *          }
 *       ],
 *       surveyPoints: [
 *          {
 *             position: [
 *                0,
 *                0,
 *                0
 *             ],
 *             latLong: [
 *                0,
 *                0
 *             ]
 *          }
 *       ],
 *       properties: {
 *          unit: "mm",
 *          topicTypes: [
 *             {
 *                value: "clash",
 *                label: "Clash"
 *             },
 *             {
 *                value: "constructibility",
 *                label: "Constructibility"
 *             },
 *             {
 *                value: "design",
 *                label: "Design"
 *             },
 *             {
 *                value: "diff",
 *                label: "Diff"
 *             },
 *             {
 *                value: "for_information",
 *                label: "For information"
 *             },
 *             {
 *                value: "gis",
 *                label: "GIS"
 *             },
 *             {
 *                value: "hs",
 *                label: "H&S"
 *             },
 *             {
 *                value: "rfi",
 *                label: "RFI"
 *             },
 *             {
 *                value: "risk",
 *                label: "Risk"
 *             },
 *             {
 *                value: "vr",
 *                label: "VR"
 *             }
 *          ]
 *       },
 *       permissions: [
 *          {
 *             user: "viewerTeamspace1Model1JobA",
 *             permission: "viewer"
 *          },
 *          {
 *             user: "commenterTeamspace1Model1JobA",
 *             permission: "commenter"
 *          },
 *          {
 *             user: "collaboratorTeamspace1Model1JobA",
 *             permission: "collaborator"
 *          },
 *          {
 *             user: "commenterTeamspace1Model1JobB",
 *             permission: "commenter"
 *          },
 *          {
 *             user: "collaboratorTeamspace1Model1JobB",
 *             permission: "collaborator"
 *          }
 *       ],
 *       status: "ok"
 *    }
 * }
 *
 */

router.put("/:model", middlewares.hasEditAccessToFedModel, updateModel);

/**
 * @api {post} /:teamspace/models/permissions Update multiple models permissions
 * @apiName updateMultiplePermissions
 * @apiGroup Model
 *
 * @apiParam {String} teamspace Name of teamspace.
 * @apiParam (Request body) {[]ModelPermissions} BODY Its an array with a list of model ids and their permissions.
 *
 * @apiParam (Request body: ModelPermissions) {String} model The model id of the model that will have their permission changed. If it's a federation the entry in the response corresponding with the model will have the 'federated' field set to true.
 * @apiParam (Request body: ModelPermissions) {[]Permission} permissions An array indicating the new permissions.
 *
 * @apiParam (Request body: Permission) {string} user The user id associated with this permission.
 * @apiParam (Request body: Permission) {string} permission The type of permission. This can has the value of 'viewer', 'commenter' or 'collaborator'.
 *
 * @apiExample {post} Example usage:
 * POST /teamSpace1/models/permissions HTTP/1.1
 * [
 *    {
 *       model: "5ce7dd19-1252-4548-a9c9-4a5414f2e0c5",
 *       permissions: [
 *          {
 *             user: "viewerTeamspace1Model1JobA",
 *             permission: "viewer"
 *          },
 *          {
 *             user: "commenterTeamspace1Model1JobA",
 *             permission: "viewer"
 *          },
 *          {
 *             user: "collaboratorTeamspace1Model1JobA",
 *             permission: "collaborator"
 *          },
 *          {
 *             user: "commenterTeamspace1Model1JobB",
 *             permission: "commenter"
 *          },
 *          {
 *             user: "collaboratorTeamspace1Model1JobB",
 *             permission: "collaborator"
 *          }
 *       ]
 *    }
 * ]
 *
 * @apiSuccessExample {json} Success:
 * [
 *    {
 *       name: "Full Logo ",
 *       federate: true,
 *       model: "5ce7dd19-1252-4548-a9c9-4a5414f2e0c5",
 *       permissions: [
 *          {
 *             user: "viewerTeamspace1Model1JobA",
 *             permission: "viewer"
 *          },
 *          {
 *             user: "commenterTeamspace1Model1JobA",
 *             permission: "viewer"
 *          },
 *          {
 *             user: "collaboratorTeamspace1Model1JobA",
 *             permission: "collaborator"
 *          },
 *          {
 *             user: "commenterTeamspace1Model1JobB",
 *             permission: "commenter"
 *          },
 *          {
 *             user: "collaboratorTeamspace1Model1JobB",
 *             permission: "collaborator"
 *          },
 *          {
 *             user: "projectshared"
 *          },
 *          {
 *             user: "fed"
 *          },
 *          {
 *             user: "teamSpace1"
 *          },
 *          {
 *             user: "unassignedTeamspace1UserJobA"
 *          },
 *          {
 *             user: "viewerTeamspace1Model1JobB"
 *          },
 *          {
 *             user: "adminTeamspace1JobA"
 *          },
 *          {
 *             user: "adminTeamspace1JobB"
 *          },
 *          {
 *             user: "weirdTeamspace"
 *          }
 *       ],
 *       subModels: [
 *          {
 *             database: "teamSpace1",
 *             model: "7cf61b4f-acdf-4295-b2d0-9b45f9f27418"
 *          },
 *          {
 *             database: "teamSpace1",
 *             model: "b1fceab8-b0e9-4e45-850b-b9888efd6521"
 *          }
 *       ]
 *    }
 * ]
 *
 *
 *
 */

router.post("/models/permissions", middlewares.hasEditPermissionsAccessToMulitpleModels, updateMultiplePermissions);

/**
 * @api {post} /:teamspace/:model/permissions Update model permissions
 * @apiName updatePermissions
 * @apiGroup Model
 *
 * @apiParam {String} teamspace Name of teamspace
 * @apiParam {String} model The model id of the model to be updated
 *
 * @apiParam (Request body) {[]Permissions} BODY Its an array with a list of users and their permission type.
 *
 * @apiParam (Request body: Permission) {string} user The user id associated with this permission.
 * @apiParam (Request body: Permission) {string} permission The type of permission. This can has the value of 'viewer', 'commenter' or 'collaborator'.
 *
 * @apiExample {post} Example usage:
 * POST /teamSpace1/5ce7dd19-1252-4548-a9c9-4a5414f2e0c5/permissions HTTP/1.1
 * [
 *    {
 *       user: "viewerTeamspace1Model1JobA",
 *       permission: "collaborator"
 *    },
 *    {
 *       user: "commenterTeamspace1Model1JobA",
 *       permission: "viewer"
 *    },
 *    {
 *       user: "collaboratorTeamspace1Model1JobA",
 *       permission: "collaborator"
 *    },
 *    {
 *       user: "commenterTeamspace1Model1JobB",
 *       permission: "commenter"
 *    },
 *    {
 *       user: "collaboratorTeamspace1Model1JobB",
 *       permission: "collaborator"
 *    }
 * ]
 *
 * @apiSuccessExample {json} Success:
 * {
 *    _id: "2710bd65-37d3-4e7f-b2e0-ffe743ce943f",
 *    timestamp: "2019-05-02T16:17:14.000Z",
 *    type: "Architectural",
 *    desc: "",
 *    name: "pipes",
 *    subModels: [],
 *    surveyPoints: [
 *       {
 *          position: [
 *             0,
 *             0,
 *             0
 *          ],
 *          latLong: [
 *             0,
 *             0
 *          ]
 *       }
 *    ],
 *    properties: {
 *       unit: "mm",
 *       topicTypes: [
 *          {
 *             value: "clash",
 *             label: "Clash"
 *          },
 *          {
 *             value: "diff",
 *             label: "Diff"
 *          },
 *          {
 *             value: "rfi",
 *             label: "RFI"
 *          },
 *          {
 *             value: "risk",
 *             label: "Risk"
 *          },
 *          {
 *             value: "hs",
 *             label: "H&S"
 *          },
 *          {
 *             value: "design",
 *             label: "Design"
 *          },
 *          {
 *             value: "constructibility",
 *             label: "Constructibility"
 *          },
 *          {
 *             value: "gis",
 *             label: "GIS"
 *          },
 *          {
 *             value: "for_information",
 *             label: "For information"
 *          },
 *          {
 *             value: "vr",
 *             label: "VR"
 *          }
 *       ]
 *    },
 *    permissions: [
 *       {
 *          user: "viewerTeamspace1Model1JobA",
 *          permission: "collaborator"
 *       },
 *       {
 *          user: "commenterTeamspace1Model1JobA",
 *          permission: "viewer"
 *       },
 *       {
 *          user: "collaboratorTeamspace1Model1JobA",
 *          permission: "collaborator"
 *       },
 *       {
 *          user: "commenterTeamspace1Model1JobB",
 *          permission: "commenter"
 *       },
 *       {
 *          user: "collaboratorTeamspace1Model1JobB",
 *          permission: "collaborator"
 *       }
 *    ],
 *    status: "ok"
 * }
 *
 * */

router.post("/:model/permissions", middlewares.hasEditPermissionsAccessToModel, updatePermissions);

/**
 * @api {get} /:teamspace/model/permissions?models=[MODELS] Get multiple models permissions
 * @apiName getMultipleModelsPermissions
 * @apiGroup Model
 *
 * @apiDescription Gets the permissions of a list of models
 *
 * @apiParam {String} teamspace Name of teamspace.
 * @apiParam (Query) {[]String} MODELS An array of model ids.
 *
 * @apiExample {get} Example usage:
 * GET /teamSpace1/models/permissions?models=5ce7dd19-1252-4548-a9c9-4a5414f2e0c5,3549ddf6-885d-4977-87f1-eeac43a0e818 HTTP/1.1
 *
 * @apiSuccessExample {json} Success:
 * [
 *    {
 *       model: "3549ddf6-885d-4977-87f1-eeac43a0e818",
 *       name: "Lego Tree",
 *       permissions: [
 *          {
 *             user: "collaboratorTeamspace1Model1JobA",
 *             permission: "collaborator"
 *          },
 *          {
 *             user: "commenterTeamspace1Model1JobA",
 *             permission: "commenter"
 *          },
 *          {
 *             user: "projectshared"
 *          },
 *          {
 *             user: "fed"
 *          },
 *          {
 *             user: "teamSpace1"
 *          },
 *          {
 *             user: "unassignedTeamspace1UserJobA"
 *          },
 *          {
 *             user: "viewerTeamspace1Model1JobA"
 *          },
 *          {
 *             user: "viewerTeamspace1Model1JobB"
 *          },
 *          {
 *             user: "commenterTeamspace1Model1JobB"
 *          },
 *          {
 *             user: "collaboratorTeamspace1Model1JobB"
 *          },
 *          {
 *             user: "adminTeamspace1JobA"
 *          },
 *          {
 *             user: "adminTeamspace1JobB"
 *          },
 *          {
 *             user: "weirdTeamspace"
 *          }
 *       ],
 *       subModels: []
 *    },
 *    {
 *       model: "5ce7dd19-1252-4548-a9c9-4a5414f2e0c5",
 *       federate: {
 *       },
 *       name: "Full Logo ",
 *       permissions: [
 *          {
 *             user: "viewerTeamspace1Model1JobA",
 *             permission: "viewer"
 *          },
 *          {
 *             user: "commenterTeamspace1Model1JobA",
 *             permission: "viewer"
 *          },
 *          {
 *             user: "collaboratorTeamspace1Model1JobA",
 *             permission: "commenter"
 *          },
 *          {
 *             user: "commenterTeamspace1Model1JobB",
 *             permission: "commenter"
 *          },
 *          {
 *             user: "collaboratorTeamspace1Model1JobB",
 *             permission: "collaborator"
 *          },
 *          {
 *             user: "projectshared",
 *             permission: "collaborator"
 *          },
 *          {
 *             user: "fed"
 *          },
 *          {
 *             user: "teamSpace1"
 *          },
 *          {
 *             user: "unassignedTeamspace1UserJobA"
 *          },
 *          {
 *             user: "viewerTeamspace1Model1JobB"
 *          },
 *          {
 *             user: "adminTeamspace1JobA"
 *          },
 *          {
 *             user: "adminTeamspace1JobB"
 *          },
 *          {
 *             user: "weirdTeamspace"
 *          }
 *       ],
 *       subModels: [
 *          {
 *             database: "teamSpace1",
 *             model: "7cf61b4f-acdf-4295-b2d0-9b45f9f27418"
 *          },
 *          {
 *             database: "teamSpace1",
 *             model: "b1fceab8-b0e9-4e45-850b-b9888efd6521"
 *          }
 *       ]
 *    }
 * ]
 *
 */

router.get("/models/permissions", middlewares.hasEditPermissionsAccessToMulitpleModels, getMultipleModelsPermissions);

/**
 * @api {get} /:teamspace/:model/permissions Get model permissions
 * @apiName getSingleModelPermissions
 * @apiGroup Model
 *
 * @apiDescription Gets the permissions of a model
 *
 * @apiParam {String} teamspace Name of teamspace
 * @apiParam {String} model Model to get Permission for.
 *
 * @apiExample {get} Example usage:
 * GET /teamSpace1/3549ddf6-885d-4977-87f1-eeac43a0e818/permissions HTTP/1.1
 *
 * @apiSuccessExample {json} Success:
 * [
 *    {
 *       user: "viewerTeamspace1Model1JobA",
 *       permission: "viewer"
 *    },
 *    {
 *       user: "commenterTeamspace1Model1JobA",
 *       permission: "viewer"
 *    },
 *    {
 *       user: "collaboratorTeamspace1Model1JobA",
 *       permission: "commenter"
 *    },
 *    {
 *       user: "commenterTeamspace1Model1JobB",
 *       permission: "commenter"
 *    },
 *    {
 *       user: "collaboratorTeamspace1Model1JobB",
 *       permission: "collaborator"
 *    },
 *    {
 *       user: "projectshared",
 *       permission: "collaborator"
 *    },
 *    {
 *       user: "fed"
 *    },
 *    {
 *       user: "teamSpace1"
 *    },
 *    {
 *       user: "unassignedTeamspace1UserJobA"
 *    },
 *    {
 *       user: "viewerTeamspace1Model1JobB"
 *    },
 *    {
 *       user: "adminTeamspace1JobA"
 *    },
 *    {
 *       user: "adminTeamspace1JobB"
 *    },
 *    {
 *       user: "weirdTeamspace"
 *    }
 * ]
 *
 */

router.get("/:model/permissions", middlewares.hasEditPermissionsAccessToModel, getSingleModelPermissions);

/**
 * @api {get} /:teamspace/:model/revision/master/head/fulltree.json Get tree
 * @apiName getModelTree
 * @apiGroup Model
 *
 * @apiDescription Returns the full tree for the model
 *
 * @apiExample {get} Example usage:
 * GET /teamSpace1/3549ddf6-885d-4977-87f1-eeac43a0e818/revision/master/head/fulltree.json HTTP/1.1
 *
 * @apiSuccessExample {json} Success:
 * {
 *    mainTree: {
 *       nodes: {
 *          account: "teamSpace1",
 *          project: "3549ddf6-885d-4977-87f1-eeac43a0e818",
 *          type: "transformation",
 *          name: "RootNode",
 *          path: "73a41cea-4c6b-47ed-936b-3f5641aecb52",
 *          _id: "73a41cea-4c6b-47ed-936b-3f5641aecb52",
 *          shared_id: "4dd46b6f-099e-42cd-b045-6460200e7995",
 *          children: [
 *             {
 *                account: "teamSpace1",
 *                project: "3549ddf6-885d-4977-87f1-eeac43a0e818",
 *                type: "transformation",
 *                name: "Fouliiferous Tree H64_2",
 *                path: "73a41cea-4c6b-47ed-936b-3f5641aecb52__33fe7c13-17a4-43d6-af03-ceae6880322f",
 *                _id: "33fe7c13-17a4-43d6-af03-ceae6880322f",
 *                shared_id: "b69a8384-c29d-4954-9efa-4c7bc14f1d3d",
 *                children: [
 *                   {
 *                      account: "teamSpace1",
 *                      project: "3549ddf6-885d-4977-87f1-eeac43a0e818",
 *                      type: "mesh",
 *                      name: "Fouliiferous Tree H64",
 *                      path: "73a41cea-4c6b-47ed-936b-3f5641aecb52__33fe7c13-17a4-43d6-af03-ceae6880322f__ce413e99-8469-4ed0-86e3-ff50bf4fed89",
 *                      _id: "ce413e99-8469-4ed0-86e3-ff50bf4fed89",
 *                      shared_id: "a876e59a-8cda-4d61-b438-c74ce7b8855d",
 *                      toggleState: "visible"
 *                   }
 *                ],
 *                toggleState: "visible"
 *             }
 *          ],
 *          toggleState: "visible"
 *       },
 *       idToName: {
 *          ce413e99-8469-4ed0-86e3-ff50bf4fed89: "Fouliiferous Tree H64",
 *          33fe7c13-17a4-43d6-af03-ceae6880322f: "Fouliiferous Tree H64_2",
 *          73a41cea-4c6b-47ed-936b-3f5641aecb52: "RootNode"
 *       }
 *    },
 *    subTrees: []
 * }
 *
 *
 * @apiParam {String} teamspace Name of teamspace
 * @apiParam {String} model Model to use.
 */

router.get("/:model/revision/master/head/fulltree.json", middlewares.hasReadAccessToModel, getModelTree);

/**
 * @api {get} /:teamspace/:model/revision/master/head/tree_path.json Get tree paths
 * @apiName getTreePath
 * @apiGroup Model
 * @apiDescription Returns the full tree path for the model and if the model is a federation of it submodels. These tree paths have the path to get to every object in the model.
 *
 * @apiParam {String} teamspace Name of teamspace
 * @apiParam {String} model Model to get tree path for.
 *
 * @apiExample {get} Example usage:
 * GET /teamSpace1/5ce7dd19-1252-4548-a9c9-4a5414f2e0c5/revision/master/head/tree_path.json HTTP/1.1
 *
 * @apiSuccessExample {json} Success:
 * {
 *    mainTree: {
 *       idToPath: {
 *          d68cf5e7-4d0f-4702-8a92-c81b72928c54: "d68cf5e7-4d0f-4702-8a92-c81b72928c54",
 *          261bf9df-64d7-4642-8bb2-0a79abd370ec: "d68cf5e7-4d0f-4702-8a92-c81b72928c54__528c62e6-5cf8-4868-b5ff-733c128b4b4e__261bf9df-64d7-4642-8bb2-0a79abd370ec",
 *          528c62e6-5cf8-4868-b5ff-733c128b4b4e: "d68cf5e7-4d0f-4702-8a92-c81b72928c54__528c62e6-5cf8-4868-b5ff-733c128b4b4e",
 *          7d5ce878-6ec9-4c11-a96d-12b68c9e9c7c: "d68cf5e7-4d0f-4702-8a92-c81b72928c54__95744e20-4b4d-4fc1-8ba7-1f31ebf772b6__7d5ce878-6ec9-4c11-a96d-12b68c9e9c7c",
 *          71634e9c-da2c-4ea7-bd04-44971d3fd8dc: "d68cf5e7-4d0f-4702-8a92-c81b72928c54__a70dd58c-c09e-4ed4-ac7e-914dbd145302__71634e9c-da2c-4ea7-bd04-44971d3fd8dc",
 *          95744e20-4b4d-4fc1-8ba7-1f31ebf772b6: "d68cf5e7-4d0f-4702-8a92-c81b72928c54__95744e20-4b4d-4fc1-8ba7-1f31ebf772b6",
 *          a70dd58c-c09e-4ed4-ac7e-914dbd145302: "d68cf5e7-4d0f-4702-8a92-c81b72928c54__a70dd58c-c09e-4ed4-ac7e-914dbd145302"
 *       }
 *    },
 *    subModels: [
 *       {
 *          account: "teamSpace1",
 *          model: "b1fceab8-b0e9-4e45-850b-b9888efd6521",
 *          idToPath: {
 *             a82a3b7f-bcd9-4487-8f94-370fa1f2ea4e: "33c36fee-622d-46a5-8be1-a1bd295aa7d1__a82a3b7f-bcd9-4487-8f94-370fa1f2ea4e",
 *             33c36fee-622d-46a5-8be1-a1bd295aa7d1: "33c36fee-622d-46a5-8be1-a1bd295aa7d1"
 *          }
 *       },
 *       {
 *          account: "teamSpace1",
 *          model: "7cf61b4f-acdf-4295-b2d0-9b45f9f27418",
 *          idToPath: {
 *             8a1f9cad-18d8-47ce-9cbd-08ba53858ced: "ea37c2ed-39d4-4236-843c-332d52876c96__8a1f9cad-18d8-47ce-9cbd-08ba53858ced",
 *             ea37c2ed-39d4-4236-843c-332d52876c96: "ea37c2ed-39d4-4236-843c-332d52876c96"
 *          }
 *       },
 *       {
 *          account: "teamSpace1",
 *          model: "2710bd65-37d3-4e7f-b2e0-ffe743ce943f",
 *          idToPath: {
 *             8ef1c52e-8838-46dc-9825-efe46aa10041: "3abc5450-5db8-459b-80ea-cb9fca9ccedd__8ef1c52e-8838-46dc-9825-efe46aa10041",
 *             ecc25d63-87e0-4600-ae60-f38f766bc9e4: "3abc5450-5db8-459b-80ea-cb9fca9ccedd__ecc25d63-87e0-4600-ae60-f38f766bc9e4",
 *             3abc5450-5db8-459b-80ea-cb9fca9ccedd: "3abc5450-5db8-459b-80ea-cb9fca9ccedd"
 *          }
 *       }
 *    ]
 * }

 *
 *
 */

router.get("/:model/revision/master/head/tree_path.json", middlewares.hasReadAccessToModel, getTreePath);

/**
 * @api {get} /:teamspace/:model/revision/master/head/idMap.json Get ID Map
 * @apiName getIdMap
 * @apiGroup Model
 *
 * @apiParam {String} teamspace Name of teamspace
 * @apiParam {String} model Model to Get ID Map for.
 */

router.get("/:model/revision/master/head/idMap.json", middlewares.hasReadAccessToModel, getIdMap);

/**
 * @api {get} /:teamspace/:model/revision/master/head/idToMeshes.json Get ID Map
 * @apiName getIdToMeshes
 * @apiGroup Model
 *
 * @apiParam {String} teamspace Name of teamspace
 * @apiParam {String} model Model to get ID Meshes for.
 */

router.get("/:model/revision/master/head/idToMeshes.json", middlewares.hasReadAccessToModel, getIdToMeshes);

/**
 * @api {get} /:teamspace/:model/revision/master/head/modelProperties.json Get ID Map
 * @apiName getModelProperties
 * @apiGroup Model
 *
 * @apiParam {String} teamspace Name of teamspace
 * @apiParam {String} model Model to get properties for.
 */

router.get("/:model/revision/master/head/modelProperties.json", middlewares.hasReadAccessToModel, getModelProperties);

/**
 * @api {get} /:teamspace/:model/revision/:rev/fulltree.json Get ID Map
 * @apiName getModelTree
 * @apiGroup Model
 *
 * @apiParam {String} teamspace Name of teamspace
 * @apiParam {String} model Model to get Tree for.
 * @apiParam {String} rev	Revision to use.
 */

router.get("/:model/revision/:rev/fulltree.json", middlewares.hasReadAccessToModel, getModelTree);

/**
 * @api {get} /:teamspace/:model/revision/:rev/tree_path.json Get Tree Path
 * @apiName getTreePath
 * @apiGroup Model
 *
 * @apiParam {String} teamspace Name of teamspace
 * @apiParam {String} model Model to get tree path for.
 * @apiParam {String} rev	Revision to use.
 */

router.get("/:model/revision/:rev/tree_path.json", middlewares.hasReadAccessToModel, getTreePath);

/**
 * @api {get} /:teamspace/:model/revision/:rev/idMap.json Get Tree Path
 * @apiName getIdMap
 * @apiGroup Model
 *
 * @apiParam {String} teamspace Name of teamspace
 * @apiParam {String} model Model to ID map for.
 * @apiParam {String} rev	Revision to use.
 */

router.get("/:model/revision/:rev/idMap.json", middlewares.hasReadAccessToModel, getIdMap);

/**
 * @api {get} /:teamspace/:model/revision/:rev/idToMeshes.json Get ID Meshes
 * @apiName getIdToMeshes
 * @apiGroup Model
 *
 * @apiParam {String} teamspace Name of teamspace
 * @apiParam {String} model Model to use.
 * @apiParam {String} rev	Revision to use.
 */

router.get("/:model/revision/:rev/idToMeshes.json", middlewares.hasReadAccessToModel, getIdToMeshes);

/**
 * @api {get} /:teamspace/:model/revision/:rev/modelProperties.json Get ID Meshes
 * @apiName getModelProperties
 * @apiGroup Model
 *
 * @apiParam {String} teamspace Name of teamspace
 * @apiParam {String} model Model to use.
 * @apiParam {String} rev	Revision to use.
 */

router.get("/:model/revision/:rev/modelProperties.json", middlewares.hasReadAccessToModel, getModelProperties);

/**
 * @api {get} /:teamspace/:model/revision/master/head/searchtree.json Search model tree using model as reference.
 * @apiName searchModelTree
 * @apiGroup Model
 *
 * @apiParam {String} teamspace Name of teamspace
 * @apiParam {String} model Model to use.
 */

router.get("/:model/revision/master/head/searchtree.json", middlewares.hasReadAccessToModel, searchModelTree);

/**
 * @api {get} /:teamspace/:model/revision/:rev/searchtree.json Search model tree using revision and model to reference.
 * @apiName searchModelTree
 * @apiGroup Model
 *
 * @apiParam {String} teamspace Name of teamspace
 * @apiParam {String} model Model to use.
 * @apiParam {String} rev	Revision to use.
 */

router.get("/:model/revision/:rev/searchtree.json", middlewares.hasReadAccessToModel, searchModelTree);

/**
 * @api {get} /:teamspace/:model/revision/master/head/subModelRevisions Get revision info from sub models
 * @apiName getSubRevisionModels
 * @apiGroup Model
 *
 * @apiParam {String} teamspace Name of teamspace
 * @apiParam {String} model Model to get properties for.
 */
router.get("/:model/revision/master/head/subModelRevisions", middlewares.hasReadAccessToModel, getSubModelRevisions);

/**
 * @api {get} /:teamspace/:model/revision/master/head/subModelRevisions Get revision info from sub models
 * @apiName getSubModelRevisions
 * @apiGroup Model
 *
 * @apiParam {String} teamspace Name of teamspace
 * @apiParam {String} model Model to get properties for.
 * @apiParam {String} rev	Revision to use.
 */
router.get("/:model/revision/:revId/subModelRevisions", middlewares.hasReadAccessToModel, getSubModelRevisions);

/**
 * @api {delete} /:teamspace/:model Delete Model.
 * @apiName deleteModel
 * @apiGroup Model
 *
 * @apiParam {String} teamspace Name of teamspace
 * @apiParam {String} model Model to delete.
 */
router.delete("/:model", middlewares.hasDeleteAccessToModel, deleteModel);

/**
 * @api {post} /:teamspace/upload Upload Model.
 * @apiName uploadModel
 * @apiGroup Model
 *
 * @apiParam {String} teamspace Name of teamspace
 * @apiParam {String} model Model to upload.
 */
router.post("/:model/upload", middlewares.hasUploadAccessToModel, uploadModel);

/**
 * @api {get} /:teamspace/:model/download/latest Upload Model.
 * @apiName uploadModel
 * @apiGroup Model
 *
 * @apiParam {String} teamspace Name of teamspace
 * @apiParam {String} model Model to download.
 */

router.get("/:model/download/latest", middlewares.hasDownloadAccessToModel, downloadLatest);

function updateSettings(req, res, next) {

	const place = utils.APIInfo(req);
	const dbCol = {account: req.params.account, model: req.params.model, logger: req[C.REQ_REPO].logger};

	return ModelSetting.findById(dbCol, req.params.model).then(modelSetting => {

		if (!modelSetting) {
			return Promise.reject(responseCodes.MODEL_NOT_FOUND);
		}

		return modelSetting.updateProperties(req.body);

	}).then(modelSetting => {
		responseCodes.respond(place, req, res, next, responseCodes.OK, modelSetting.properties);
	}).catch(err => {
		responseCodes.respond(place, req, res, next, err.resCode || utils.mongoErrorToResCode(err), err.resCode ? {} : err);
	});
}

function getHeliSpeed(req, res, next) {
	const place = utils.APIInfo(req);
	const dbCol = {account: req.params.account, model: req.params.model, logger: req[C.REQ_REPO].logger};

	return ModelSetting.findById(dbCol, req.params.model).then(modelSetting => {
		const speed = modelSetting.heliSpeed ? modelSetting.heliSpeed : 1;
		responseCodes.respond(place, req, res, next, responseCodes.OK, {heliSpeed: speed});
	}).catch(err => {
		responseCodes.respond(place, req, res, next, err.resCode || utils.mongoErrorToResCode(err), err.resCode ? {} : err);
	});
}

function updateHeliSpeed(req, res, next) {
	const place = utils.APIInfo(req);
	const dbCol = {account: req.params.account, model: req.params.model, logger: req[C.REQ_REPO].logger};

	return ModelSetting.findById(dbCol, req.params.model).then(modelSetting => {
		if (!modelSetting) {
			return Promise.reject(responseCodes.MODEL_NOT_FOUND);
		}
		if (!Number.isInteger(req.body.heliSpeed)) {
			return Promise.reject(responseCodes.INVALID_ARGUMENTS);
		}

		return modelSetting.updateProperties({heliSpeed: req.body.heliSpeed});
	}).then(() => {
		responseCodes.respond(place, req, res, next, responseCodes.OK, {});
	}).catch(err => {
		responseCodes.respond(place, req, res, next, err.resCode || utils.mongoErrorToResCode(err), err.resCode ? {} : err);
	});
}

function _getModel(req) {

	let setting;
	return ModelSetting.findById(getDbColOptions(req), req.params.model).then(_setting => {

		if (!_setting) {
			return Promise.reject({ resCode: responseCodes.MODEL_INFO_NOT_FOUND});
		} else {

			setting = _setting;
			setting = setting.toObject();
			// compute permissions by user role

			return ModelHelpers.getModelPermission(
				req.session.user.username,
				_setting,
				req.params.account
			).then(permissions => {

				setting.permissions = permissions;
				return ModelHelpers.listSubModels(req.params.account, req.params.model, C.MASTER_BRANCH_NAME);

			}).then(subModels => {

				setting.subModels = subModels;
				return setting;
			});
		}
	});
}

function getModelSetting(req, res, next) {

	const place = utils.APIInfo(req);

	_getModel(req).then(setting => {

		setting.model = setting._id;
		setting.account = req.params.account;

		setting.headRevisions = {};

		responseCodes.respond(place, req, res, next, responseCodes.OK, setting);

	}).catch(err => {
		responseCodes.respond(place, req, res, next, err.resCode || utils.mongoErrorToResCode(err), err.resCode ? {} : err);
	});
}

function createModel(req, res, next) {

	const responsePlace = utils.APIInfo(req);

	if (Object.keys(req.body).length >= 1 &&
			Object.prototype.toString.call(req.body.modelName) === "[object String]" &&
			(!req.body.desc || Object.prototype.toString.call(req.body.desc) === "[object String]") &&
			(!req.body.type || Object.prototype.toString.call(req.body.type) === "[object String]") &&
			(!req.body.unit || Object.prototype.toString.call(req.body.unit) === "[object String]") &&
			(!req.body.subModels || Object.prototype.toString.call(req.body.subModels) === "[object Array]") &&
			(!req.body.code || Object.prototype.toString.call(req.body.code) === "[object String]") &&
			(!req.body.project || Object.prototype.toString.call(req.body.project) === "[object String]")) {
		const modelName = req.body.modelName;
		const account = req.params.account;

		const data = {
			desc: req.body.desc,
			type: req.body.type,
			unit: req.body.unit,
			subModels: req.body.subModels,
			code: req.body.code,
			project: req.body.project
		};

		data.sessionId = req.headers[C.HEADER_SOCKET_ID];
		data.userPermissions = req.session.user.permissions;

		let createModelPromise;
		if (req.body.subModels) {
			createModelPromise = ModelHelpers.createNewFederation(account, modelName, data);
		} else {
			createModelPromise = ModelHelpers.createNewModel(account, modelName, data);
		}

		createModelPromise.then(result => {
			const modelData = result.modelData;
			modelData.setting = result.settings;

			responseCodes.respond(responsePlace, req, res, next, responseCodes.OK, modelData);
		}).catch(err => {
			responseCodes.respond(responsePlace, req, res, next, err.resCode || utils.mongoErrorToResCode(err), err.resCode ? {} : err);
		});
	} else {
		responseCodes.respond(responsePlace, req, res, next, responseCodes.INVALID_ARGUMENTS, responseCodes.INVALID_ARGUMENTS);
	}
}

function updateModel(req, res, next) {

	const responsePlace = utils.APIInfo(req);
	const account = req.params.account;
	const model = req.params.model;

	let promise = null;
	let setting;

	if (Object.keys(req.body).length >= 1 && Array.isArray(req.body.subModels)) {
		if (req.body.subModels.length > 0) {
			promise = ModelSetting.findById({account}, model).then(_setting => {

				setting = _setting;

				if (!setting) {
					return Promise.reject(responseCodes.MODEL_NOT_FOUND);
				} else if (!setting.federate) {
					return Promise.reject(responseCodes.MODEL_IS_NOT_A_FED);
				} else {
					return ModelHelpers.createFederatedModel(account, model, req.body.subModels);
				}

			}).then(() => {
				setting.subModels = req.body.subModels;
				setting.timestamp = new Date();
				return setting.save();
			});
		} else {
			promise = Promise.reject(responseCodes.SUBMODEL_IS_MISSING);
		}
	} else {
		promise = Promise.reject(responseCodes.INVALID_ARGUMENTS);
	}

	promise.then(() => {
		responseCodes.respond(responsePlace, req, res, next, responseCodes.OK, { account, model, setting });
	}).catch(err => {
		responseCodes.respond(responsePlace, req, res, next, err.resCode || utils.mongoErrorToResCode(err), err.resCode ? {} : err);
	});
}

function deleteModel(req, res, next) {

	const responsePlace = utils.APIInfo(req);
	const account = req.params.account;
	const model = req.params.model;

	// delete
	ModelHelpers.removeModel(account, model).then((removedModel) => {
		responseCodes.respond(responsePlace, req, res, next, responseCodes.OK, { account, model, federate: removedModel.federate });
	}).catch(err => {
		responseCodes.respond(responsePlace, req, res, next, err.resCode || err, err.resCode ? {} : err);
	});
}

function getHeaders(cache = false) {
	const headers = {
		"Content-Type" : "application/json"
	};

	if(cache) {
		headers["Cache-Control"] = "private, max-age=" + config.cachePolicy.maxAge;
	}
	return headers;
}

function getIdMap(req, res, next) {
	const revId = req.params.rev;
	JSONAssets.getIdMap(
		req.params.account,
		req.params.model,
		revId ? undefined : C.MASTER_BRANCH_NAME,
		revId,
		req.session.user.username
	).then(file => {

		const headers = getHeaders(false);
		responseCodes.writeStreamRespond(utils.APIInfo(req), req, res, next, file.readStream, headers);

	}).catch(err => {
		responseCodes.respond(utils.APIInfo(req), req, res, next, err, err);
	});
}

function getIdToMeshes(req, res, next) {
	const revId = req.params.rev;
	JSONAssets.getIdToMeshes(
		req.params.account,
		req.params.model,
		revId ? undefined : C.MASTER_BRANCH_NAME,
		revId,
		req.session.user.username
	).then(file => {
		const headers = getHeaders(false);

		responseCodes.writeStreamRespond(utils.APIInfo(req), req, res, next, file.readStream, headers);
	}).catch(err => {
		responseCodes.respond(utils.APIInfo(req), req, res, next, err, err);
	});
}

function getModelTree(req, res, next) {
	const revId = req.params.rev;
	JSONAssets.getTree(
		req.params.account,
		req.params.model,
		revId ? undefined : C.MASTER_BRANCH_NAME,
		revId
	).then(file => {
		const headers = getHeaders(revId);
		responseCodes.writeStreamRespond(utils.APIInfo(req), req, res, next, file.readStream, headers);

	}).catch(err => {
		responseCodes.respond(utils.APIInfo(req), req, res, next, err, err);
	});
}

function getModelProperties(req, res, next) {
	const revId = req.params.rev;
	JSONAssets.getModelProperties(
		req.params.account,
		req.params.model,
		revId ? undefined : C.MASTER_BRANCH_NAME,
		revId,
		req.session.user.username
	).then(file => {
		const headers = getHeaders(false);
		responseCodes.writeStreamRespond(utils.APIInfo(req), req, res, next, file.readStream, headers);

	}).catch(err => {
		responseCodes.respond(utils.APIInfo(req), req, res, next, err, err);
	});
}

function getTreePath(req, res, next) {
	const revId = req.params.rev;
	JSONAssets.getTreePath(
		req.params.account,
		req.params.model,
		revId ? undefined : C.MASTER_BRANCH_NAME,
		revId,
		req.session.user.username
	).then(file => {
		const headers = getHeaders(false);

		responseCodes.writeStreamRespond(utils.APIInfo(req), req, res, next, file.readStream, headers);
	}).catch(err => {
		responseCodes.respond(utils.APIInfo(req), req, res, next, err, err);
	});
}

function searchModelTree(req, res, next) {

	const model = req.params.model;
	const account = req.params.account;
	const username = req.session.user.username;
	const searchString = req.query.searchString;

	let branch;

	if (!req.params.rev) {
		branch = C.MASTER_BRANCH_NAME;
	}

	ModelHelpers.searchTree(account, model, branch, req.params.rev, searchString, username).then(items => {

		responseCodes.respond(utils.APIInfo(req), req, res, next, responseCodes.OK, items);

	}).catch(err => {
		responseCodes.respond(utils.APIInfo(req), req, res, next, err, err);
	});
}

function downloadLatest(req, res, next) {

	ModelHelpers.downloadLatest(req.params.account, req.params.model).then(file => {

		const headers = {
			"Content-Length": file.size,
			"Content-Disposition": "attachment;filename=" + file.fileName
		};

		responseCodes.writeStreamRespond(utils.APIInfo(req), req, res, next, file.readStream, headers);

	}).catch(err => {
		responseCodes.respond(utils.APIInfo(req), req, res, next, err, err);
	});
}

function uploadModel(req, res, next) {
	const responsePlace = utils.APIInfo(req);
	const account = req.params.account;
	const model = req.params.model;
	const username = req.session.user.username;
	let modelSetting;

	// check model exists before upload
	return ModelSetting.findById({account, model}, model).then(_modelSetting => {

		modelSetting = _modelSetting;

		if (!modelSetting) {
			return Promise.reject(responseCodes.MODEL_NOT_FOUND);
		} else {
			return ModelHelpers.uploadFile(req);
		}

	}).then(file => {
		const data = {
			tag: req.body.tag,
			desc: req.body.desc
		};

		const source = {
			type: "upload",
			file: file
		};

		return ModelHelpers.importModel(account, model, username, modelSetting, source, data).then(() => {
			responseCodes.respond(responsePlace, req, res, next, responseCodes.OK, { status: "uploaded"});
		});

	}).catch(err => {
		err = err.resCode ? err.resCode : err;
		responseCodes.respond(responsePlace, req, res, next, err, err);
	});
}

function updatePermissions(req, res, next) {

	const account = req.params.account;
	const model = req.params.model;

	return ModelSetting.findById({account, model}, model).then(modelSetting => {

		if (!modelSetting) {
			return Promise.reject(responseCodes.MODEL_NOT_FOUND);
		}

		return modelSetting.changePermissions(req.body);

	}).then(permission => {
		responseCodes.respond(utils.APIInfo(req), req, res, next, responseCodes.OK, permission);
	}).catch(err => {
		responseCodes.respond(utils.APIInfo(req), req, res, next, err, err);
	});
}

function updateMultiplePermissions(req, res, next) {

	const account = req.params.account;
	const modelsIds = req.body.map(({model}) => model);

	return ModelSetting.find({account}, {"_id" : {"$in" : modelsIds}}).then((modelsList) => {
		if (!modelsList.length) {
			return Promise.reject({resCode: responseCodes.MODEL_INFO_NOT_FOUND});
		} else {
			const modelsPromises = modelsList.map((model) => {
				const newModelPermissions = req.body.find((modelPermissions) => modelPermissions.model === model._id);
				return model.changePermissions(newModelPermissions.permissions || {}, account);
			});

			return Promise.all(modelsPromises).then((models) => {
				const populatedPermissionsPromises = models.map(({permissions}) => {
					return ModelSetting.populateUsers(account, permissions);
				});

				return Promise.all(populatedPermissionsPromises).then((populatedPermissions) => {
					return populatedPermissions.map((permissions, index) => {
						const {name, federate, _id: model, subModels} =  models[index] || {};
						return {name, federate, model, permissions, subModels};
					});
				});
			});
		}
	}).then(permissions => {
		responseCodes.respond(utils.APIInfo(req), req, res, next, responseCodes.OK, permissions);
	}).catch(err => {
		responseCodes.respond(utils.APIInfo(req), req, res, next, err, err);
	});
}

function getSingleModelPermissions(req, res, next) {

	const account = req.params.account;
	const model = req.params.model;

	return ModelSetting.findById({account, model}, model).then(setting => {
		if (!setting) {
			return Promise.reject({ resCode: responseCodes.MODEL_INFO_NOT_FOUND});
		} else {
			return ModelSetting.populateUsers(account, setting.permissions);
		}

	}).then(permissions => {
		responseCodes.respond(utils.APIInfo(req), req, res, next, responseCodes.OK, permissions);
	}).catch(err => {
		responseCodes.respond(utils.APIInfo(req), req, res, next, err, err);
	});
}

function getMultipleModelsPermissions(req, res, next) {

	const account = req.params.account;
	const models = req.query.models.split(",");

	return ModelSetting.find({account}, {"_id" : {"$in" : models}}).then((modelsList) => {
		if (!modelsList.length) {
			return Promise.reject({ resCode: responseCodes.MODEL_INFO_NOT_FOUND });
		} else {
			const permissionsList = modelsList.map(({permissions}) => permissions || []);
			return ModelSetting.populateUsersForMultiplePermissions(account, permissionsList)
				.then((populatedPermissions) => {
					return populatedPermissions.map((permissions, index) => {
						const {_id, federate, name, subModels} = modelsList[index];
						return {
							model:_id,
							federate,
							name,
							permissions,
							subModels
						};
					});
				});
		}
	}).then(permissions => {
		responseCodes.respond(utils.APIInfo(req), req, res, next, responseCodes.OK, permissions);
	}).catch(err => {
		responseCodes.respond(utils.APIInfo(req), req, res, next, err, err);
	});
}

function getUnityAssets(req, res, next) {

	const model = req.params.model;
	const account = req.params.account;
	const username = req.session.user.username;
	let branch;

	if (!req.params.rev) {
		branch = C.MASTER_BRANCH_NAME;
	}

	UnityAssets.getAssetList(account, model, branch, req.params.rev, username).then(obj => {
		responseCodes.respond(utils.APIInfo(req), req, res, next, responseCodes.OK, obj, undefined, req.param.rev ? config.cachePolicy : undefined);
	}).catch(err => {
		responseCodes.respond(utils.APIInfo(req), req, res, next, err, err);
	});
}

function getJsonMpc(req, res, next) {
	const model = req.params.model;
	const account = req.params.account;
	const id = req.params.uid;

	JSONAssets.getSuperMeshMapping(account, model, id).then(file => {
		responseCodes.respond(utils.APIInfo(req), req, res, next, responseCodes.OK, file, undefined, config.cachePolicy);
	}).catch(err => {
		responseCodes.respond(utils.APIInfo(req), req, res, next, err.resCode || utils.mongoErrorToResCode(err), err.resCode ? {} : err);
	});
}

function getSubModelRevisions(req, res, next) {

	const model = req.params.model;
	const account = req.params.account;
	const revId = req.params.revId;
	const branch = revId ? undefined : "master";
	const username = req.session.user.username;

	ModelHelpers.getSubModelRevisions(account, model, username, branch, revId).then((result) => {
		responseCodes.respond(utils.APIInfo(req), req, res, next, responseCodes.OK, result, undefined, req.param.rev ? config.cachePolicy : undefined);
	}).catch(err => {
		responseCodes.respond(utils.APIInfo(req), req, res, next, err.resCode || utils.mongoErrorToResCode(err), err.resCode ? {} : err);
	});
}

function getUnityBundle(req, res, next) {

	const model = req.params.model;
	const account = req.params.account;
	const id = req.params.uid;

	UnityAssets.getUnityBundle(account, model, id).then(file => {
		req.params.format = "unity3d";
		responseCodes.respond(utils.APIInfo(req), req, res, next, responseCodes.OK, file, undefined, config.cachePolicy);
	}).catch(err => {
		responseCodes.respond(utils.APIInfo(req), req, res, next, err.resCode || utils.mongoErrorToResCode(err), err.resCode ? {} : err);
	});
}

module.exports = router;
