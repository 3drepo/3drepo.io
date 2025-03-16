/**
 *  Copyright (C) 2018 3D Repo Ltd
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
const utils = require("../utils");
const middlewares = require("../middlewares/middlewares");
const ModelSetting = require("../models/modelSetting");
const responseCodes = require("../response_codes");
const C = require("../constants");
const ModelHelpers = require("../models/helper/model");
const UnityAssets = require("../models/unityAssets");
const Scene = require("../models/scene");
const SrcAssets = require("../models/srcAssets");
const JSONAssets = require("../models/jsonAssets");
const config = require("../config");
const {v5Path} = require("../../interop");
const { validateNewRevisionData : validateNewModelRevisionData } = require(`${v5Path}/middleware/dataConverter/inputs/teamspaces/projects/models/containers`);
const { validateNewRevisionData : validateNewFedRevisionData } = require(`${v5Path}/middleware/dataConverter/inputs/teamspaces/projects/models/federations`);
const ContainersV5 = require(`${v5Path}/processors/teamspaces/projects/models/containers`);
const FederationsV5 = require(`${v5Path}/processors/teamspaces/projects/models/federations`);
const ResponderV5 = require(`${v5Path}/utils/responder`);
const ResponseCodes = require(`${v5Path}/utils/responseCodes`);

function convertProjectToParam(req, res, next) {
	if (req.body.project) {
		req.params.project = req.body.project;
	}
	next();
}

/**
 * @apiDefine PermissionObject
 *
 * @apiParam (Request body: Permission) {string} user User ID
 * @apiParam (Request body: Permission) {string} permission Permission type ('viewer'|'commenter'|'collaborator'|'').
 */

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
 *       unit: "mm"
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
 *
 * @apiParam (Request body: SurveyPoint) {Number[]} position an array representing a three dimensional coordinate
 * @apiParam (Request body: SurveyPoint) {Number[]} latLong an array representing a two dimensional coordinate for latitude and logitude
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
 *    ]
 * }
 *
 * @apiSuccessExample {json} Success:
 * {
 *    code: "stage",
 *    unit: "cm"
 * }
 *
 */

router.put("/:model/settings", middlewares.hasWriteAccessToModelSettings, updateSettings);

/**
 * @api {post} /:teamspace/model Create a model
 * @apiName createModel
 * @apiGroup Model
 *
 * @apiParam {String} teamspace Name of teamspace
 *
 * @apiParam (Request body) {String} project Name of project in which the model will be created
 * @apiParam (Request body) {String} modelName Name of the model to be created
 * @apiParam (Request body) {String} unit The unit in which the model is specified
 * @apiParam (Request body) {String} [desc] A description of the model
 * @apiParam (Request body) {String} [code] A code to be associated with the model; it can be of maximum 5 letters (a-z) and numbers
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
 *          unit: "ft"
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

// RepoBundles information

/**
 * @api {get} /:teamspace/:model/revision/master/head/repoAssets.json Get unity assets
 * @apiName getRepoAssets
 * @apiGroup Model
 * @apiDescription Get the lastest model's version assets. If RepoBundles are available, they are returned, otherwise AssetBundles are returned.
 *
 * @apiParam {String} teamspace Name of teamspace
 * @apiParam {String} model The model Id to get unity assets for.
 *
 * @apiExample {get} Example usage:
 * GET /teamSpace1/3549ddf6-885d-4977-87f1-eeac43a0e818/revision/master/head/repoAssets.json HTTP/1.1
 *
 * @apiSuccessExample {json} Success:
 * {
 *    models: [
 *       {
 *          _id: "Mw+Qm5J5QaqofBxG9TqOkw==",
 *          assets: [
 *             "92fc213b-1bab-49a4-b10e-f4368a52d500"
 *          ],
 *          database: "teamSpace1",
 *          model: "3549ddf6-885d-4977-87f1-eeac43a0e818",
 *          offset: [
 *             -688.095458984375,
 *             6410.9140625,
 *             683.460205078125
 *          ],
 *          jsonFiles: [
 *             "92fc213b-1bab-49a4-b10e-f4368a52d500"
 *          ]
 *       }
 *    ]
 * }
 */

router.get("/:model/revision/master/head/repoAssets.json", middlewares.hasReadAccessToModel, getRepoAssets);

/**
 * @api {get} /:teamspace/:model/revision/:rev/unityAssets.json Get revision's unity assets
 * @apiName getRevUnityAssets
 * @apiGroup Model
 * @apiDescription Get the model's assets but of a particular revision. If RepoBundles are available, they are returned, otherwise AssetBundles are returned.
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
 *             "92fc213b-1bab-49a4-b10e-f4368a52d500"
 *          ],
 *          database: "teamSpace1",
 *          model: "3549ddf6-885d-4977-87f1-eeac43a0e818",
 *          offset: [
 *             -688.095458984375,
 *             6410.9140625,
 *             683.460205078125
 *          ],
 *          jsonFiles: [
 *             "92fc213b-1bab-49a4-b10e-f4368a52d500"
 *          ]
 *       }
 *    ]
 * }
 */

router.get("/:model/revision/:rev/repoAssets.json", middlewares.hasReadAccessToModel, getRepoAssets);

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
 * @apiParam {String} teamspace Name of teamspace
 * @apiParam {String} model The model Id
 * @apiParam {String} rev The revision of the model
 *
 * @apiExample {get} Example usage:
 * GET /teamSpace1/3549ddf6-885d-4977-87f1-eeac43a0e818/revision/master/head/assetsMeta HTTP/1.1
 *
 * @apiSuccessExample {json} Success:
 * {
 *     superMeshes: [
 *          {
 *               _id: "<uuid string>",
 *              nVertices: 123,
 *              nFaces: 123,
 *              nUVChannels: 123,
 *              boundingBox: [[1, 2, 3], [3,4, 5]]
 *          },
 *     ]
 * }
 *
 */

router.get("/:model/revision/master/head/assetsMeta", middlewares.hasReadAccessToModel, getAssetsMeta);

/**
 * @api {get} /:teamspace/:model/revision/:rev/assetsMeta Get revision's metadata about the assets generated
 * @apiName getRevUnityAssets
 * @apiGroup Model
 * @apiDescription Get the model's assets metadata of a particular revision
 *
 * @apiParam {String} teamspace Name of teamspace
 * @apiParam {String} model The model Id
 * @apiParam {String} rev The revision of the model
 *
 * @apiExample {get} Example usage:
 * GET /teamSpace1/3549ddf6-885d-4977-87f1-eeac43a0e818/revision/master/head/assetsMeta HTTP/1.1
 *
 * @apiSuccessExample {json} Success:
 * {
 *     superMeshes: [
 *          {
 *               _id: "<uuid string>",
 *              nVertices: 123,
 *              nFaces: 123,
 *              nUVChannels: 123,
 *              boundingBox: [[1, 2, 3], [3,4, 5]]
 *          },
 *     ]
 * }
 *
 */

router.get("/:model/revision/:rev/assetsMeta", middlewares.hasReadAccessToModel, getAssetsMeta);

// FIXME: write api docs
router.get("/:model/revision/master/head/supermeshes.json.mpc", middlewares.hasReadAccessToModel, getAllJsonMpcs);
router.get("/:model/revision/:rev/supermeshes.json.mpc", middlewares.hasReadAccessToModel, getAllJsonMpcs);

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
 * @apiParam {String} model id of the model
 * @apiParam {String} uid id of the unity bundle
 */

router.get("/:model/:uid.unity3d", middlewares.hasReadAccessToModel, getUnityBundle);

/**
 * @api {get} /:teamspace/:model/:uid.src.mpc Get Model in SRC representation
 * @apiName getSRC
 * @apiGroup Model
 * @apiDescription Get a mesh presented in SRC format.
 *
 * @apiParam {String} teamspace Name of teamspace
 * @apiParam {String} model id of the model
 * @apiParam {String} uid id of the SRC file.
 */

router.get("/:model/:uid.src.mpc", middlewares.hasReadAccessToModel, getSRC);

/**
 * @api {get} /:teamspace/:model/:uid.repobundle Get RepoBundle by Id
 * @apiName getRepoBundle
 * @apiGroup Model
 * @apiDescription  Gets an actual Repo Bundle file containing a set of assets. The path for this api is provided in the data retrieved by either one of the endpoints /:teamspace/:model/revision/master/head/unityAssets.json or /:teamspace/:model/revision/:rev/unityAssets.json
 *
 * @apiParam {String} teamspace Name of teamspace
 * @apiParam {String} model id of the model
 * @apiParam {String} uid id of the repo bundle file.
 */

router.get("/:model/:uid.repobundle", middlewares.hasReadAccessToModel, getRepoBundle);

/**
 * @api {get} /:teamspace/:model/:uid.texture Get a Texture by Id
 * @apiName getTexture
 * @apiGroup Model
 * @apiDescription Gets a texture by id. The id may be provided from a number of sources but most likely will be given in a mappings material properties. The metadata of the texture is provided in the response headers.
 *
 * @apiParam {String} teamspace Name of teamspace
 * @apiParam {String} model id of the model
 * @apiParam {String} uid id of the texture file.
 */
router.get("/:model/:uid.texture", middlewares.hasReadAccessToModel, getTexture);

/**
 * @api {get} /:teamspace/:model/revision/:rev/srcAssets.json Get revision's src assets
 * @apiName getRevSrcAssets
 * @apiGroup Model
 * @apiDescription Get the model's assets but of a particular revision
 *
 * @apiParam {String} teamspace Name of teamspace
 * @apiParam {String} model The model Id to get unity assets for.
 * @apiParam {String} rev The revision of the model to get src assets for
 *
 * @apiExample {get} Example usage:
 * GET /Repo3DDemo/01713310-2286-11eb-93c1-296aba26cc11/revision/4d48e3de-1c87-4fdf-87bf-d92c224eb3fe/srcAssets.json HTTP/1.1
 *
 * @apiSuccessExample {json} Success:
 * {
 *   "models": [
 *     {
 *       "database": "Repo3DDemo",
 *       "model": "011382b0-2286-11eb-93c1-296aba26cc11",
 *       "assets": [
 *         "153cf665-2c84-4ff9-a9e2-ba495af8e6dc",
 *         "07c67b6c-4b02-435f-8639-ea88403c36f7",
 *         "2967230f-67fa-45dc-9686-161e45c7c8a2"
 *       ],
 *       "offset": [
 *         9.999999999999787,
 *         0,
 *         -9.999999999999787
 *       ]
 *     },
 *     {
 *       "database": "Repo3DDemo",
 *       "model": "01168ff0-2286-11eb-93c1-296aba26cc11",
 *       "assets": [
 *         "89d5580a-3224-4e50-bbab-89d855c320e0"
 *       ],
 *       "offset": [
 *         1610,
 *         740,
 *         -2410
 *       ]
 *     },
 *     {
 *       "database": "Repo3DDemo",
 *       "model": "01153060-2286-11eb-93c1-296aba26cc11",
 *       "assets": [
 *         "c14dbbee-a8fd-4ed8-8641-9e24737f8238"
 *       ],
 *       "offset": [
 *         -688.095458984375,
 *         6410.9140625,
 *         683.460205078125
 *       ]
 *     }
 *   ]
 * }
 *
 */

router.get("/:model/revision/:rev/srcAssets.json", middlewares.hasReadAccessToModel, getSrcAssets);

/**
 * @api {get} /:teamspace/:model/revision/master/head/srcAssets.json Get Src assets for the master branch
 * @apiName getSrcAssets
 * @apiGroup Model
 * @apiDescription Get the lastest model's version src assets
 *
 * @apiParam {String} teamspace Name of teamspace
 * @apiParam {String} model The model Id to get unity assets for.
 *
 * @apiExample {get} Example usage:
 * GET /Repo3DDemo/01713310-2286-11eb-93c1-296aba26cc11/revision/master/head/srcAssets.json HTTP/1.1
 *
 * @apiSuccessExample {json} Success:
 * {
 *   "models": [
 *     {
 *       "database": "Repo3DDemo",
 *       "model": "011382b0-2286-11eb-93c1-296aba26cc11",
 *       "assets": [
 *         "153cf665-2c84-4ff9-a9e2-ba495af8e6dc",
 *         "07c67b6c-4b02-435f-8639-ea88403c36f7",
 *         "2967230f-67fa-45dc-9686-161e45c7c8a2"
 *       ],
 *       "offset": [
 *         9.999999999999787,
 *         0,
 *         -9.999999999999787
 *       ]
 *     },
 *     {
 *       "database": "Repo3DDemo",
 *       "model": "01168ff0-2286-11eb-93c1-296aba26cc11",
 *       "assets": [
 *         "89d5580a-3224-4e50-bbab-89d855c320e0"
 *       ],
 *       "offset": [
 *         1610,
 *         740,
 *         -2410
 *       ]
 *     },
 *     {
 *       "database": "Repo3DDemo",
 *       "model": "01153060-2286-11eb-93c1-296aba26cc11",
 *       "assets": [
 *         "c14dbbee-a8fd-4ed8-8641-9e24737f8238"
 *       ],
 *       "offset": [
 *         -688.095458984375,
 *         6410.9140625,
 *         683.460205078125
 *       ]
 *     }
 *   ]
 * }
 */

router.get("/:model/revision/master/head/srcAssets.json", middlewares.hasReadAccessToModel, getSrcAssets);

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
 *          unit: "mm"
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

router.put("/:model", middlewares.hasEditAccessToFedModel, middlewares.formatV5NewFedRevisionsData, validateNewFedRevisionData, updateModel);

/**
 * @api {patch} /:teamspace/models/permissions Batch update model permissions
 * @apiName batchUpdateModelPermissions
 * @apiGroup Model
 *
 * @apiParam {String} teamspace Name of teamspace.
 *
 * @apiParam (Request body) {ModelPermissions[]} BODY List of model permissions
 *
 * @apiParam (Request body: ModelPermissions) {String} model Model ID
 * @apiParam (Request body: ModelPermissions) {Permission[]} permissions List of user permissions
 *
 * @apiUse PermissionObject
 *
 * @apiExample {patch} Example usage:
 * PATCH /acme/models/permissions HTTP/1.1
 * [
 *    {
 *       model: "00000000-0000-0000-0000-000000000000",
 *       permissions: [
 *          {
 *             user: "alice",
 *             permission: "collaborator"
 *          },
 *          {
 *             user: "bob",
 *             permission: "commenter"
 *          },
 *          {
 *             user: "mike",
 *             permission: ""
 *          }
 *       ]
 *    },
 *    {
 *       model: "11111111-1111-1111-1111-111111111111",
 *       permissions: [
 *          {
 *             user: "charlie",
 *             permission: "viewer"
 *          }
 *       ]
 *    },
 *    {
 *       model: "22222222-2222-2222-2222-222222222222",
 *       permissions: [
 *          {
 *             user: "dave",
 *             permission: "commenter"
 *          },
 *          {
 *             user: "eve",
 *             permission: ""
 *          }
 *       ]
 *    }
 * ]
 *
 * @apiSuccessExample {json} Success:
 * {
 *    status: "ok"
 * }
 */
router.patch("/models/permissions", middlewares.hasEditPermissionsAccessToMulitpleModels, batchUpdatePermissions);

/**
 * @api {patch} /:teamspace/:model/permissions Update model permissions
 * @apiName updateModelPermissions
 * @apiGroup Model
 *
 * @apiParam {String} teamspace Name of teamspace
 * @apiParam {String} model Model ID
 *
 * @apiParam (Request body) {Permission[]} BODY List of user permissions
 *
 * @apiUse PermissionObject
 *
 * @apiExample {patch} Example usage (add user permission):
 * PATCH /acme/00000000-0000-0000-0000-000000000000/permissions HTTP/1.1
 * [
 *    {
 *       user: "alice",
 *       permission: "collaborator"
 *    }
 * ]
 *
 * @apiExample {patch} Example usage (add multiple user permissions):
 * PATCH /acme/00000000-0000-0000-0000-000000000000/permissions HTTP/1.1
 * [
 *    {
 *       user: "bob",
 *       permission: "commenter"
 *    },
 *    {
 *       user: "mike",
 *       permission: "viewer"
 *    }
 * ]
 *
 * @apiExample {patch} Example usage (remove user permission):
 * PATCH /acme/00000000-0000-0000-0000-000000000000/permissions HTTP/1.1
 * [
 *    {
 *       user: "mike",
 *       permission: ""
 *    }
 * ]
 *
 * @apiSuccessExample {json} Success:
 * {
 *    status: "ok"
 * }
 */
router.patch("/:model/permissions", middlewares.hasEditPermissionsAccessToModel, updatePermissions);

/**
 * @api {get} /:teamspace/model/permissions?models=[MODELS] Get multiple models permissions
 * @apiName getMultipleModelsPermissions
 * @apiGroup Model
 *
 * @apiDescription Gets the permissions of a list of models
 *
 * @apiParam {String} teamspace Name of teamspace.
 * @apiParam (Query) {String[]} MODELS An array of model ids.
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
 * @api {get} /:teamspace/:model/revision/master/head/idMap.json Get ID map
 * @apiName getIdMap
 * @apiGroup Model
 *
 * @apiParam {String} teamspace Name of teamspace
 * @apiParam {String} model Model id to Get ID Map for.
 *
 * @apiExample {get} Example usage (federation):
 * GET /teamSpace1/5ce7dd19-1252-4548-a9c9-4a5414f2e0c5/revision/master/head/idMap.json HTTP/1.1
 *
 * @apiExample {get} Example usage (model):
 * GET /teamSpace1/b1fceab8-b0e9-4e45-850b-b9888efd6521/revision/master/head/idMap.json HTTP/1.1
 *
 * @apiSuccessExample {json} Success (federation):
 * {
 *    mainTree: {
 *       idMap: {
 *          261bf9df-64d7-4642-8bb2-0a79abd370ec: "d86573c9-beec-4f06-b194-18b6983a3d71",
 *          528c62e6-5cf8-4868-b5ff-733c128b4b4e: "6047f788-8317-45ff-b692-29e03071ec63",
 *          7d5ce878-6ec9-4c11-a96d-12b68c9e9c7c: "7d9eefe0-2b8a-4de3-9acb-c216c9b48c9f",
 *          95744e20-4b4d-4fc1-8ba7-1f31ebf772b6: "d2c0e845-b392-429e-86bd-6c7453b78654",
 *          71634e9c-da2c-4ea7-bd04-44971d3fd8dc: "6e40ecbc-bb2f-4504-8f00-80b12fb04443",
 *          a70dd58c-c09e-4ed4-ac7e-914dbd145302: "f1a14ded-6528-4937-b31d-ce4b3ca813d8",
 *          d68cf5e7-4d0f-4702-8a92-c81b72928c54: "d012d6ba-01d2-4460-921e-72539a1ac197"
 *       }
 *    },
 *    subModels: [
 *       {
 *          account: "teamSpace1",
 *          model: "b1fceab8-b0e9-4e45-850b-b9888efd6521",
 *          idMap: {
 *             a82a3b7f-bcd9-4487-8f94-370fa1f2ea4e: "57b0969f-6009-4e32-9153-2b17d3a3628b",
 *             33c36fee-622d-46a5-8be1-a1bd295aa7d1: "1e47d53e-cad8-489b-89ea-7c6c7b8d0e6c"
 *          }
 *       },
 *       {
 *          account: "teamSpace1",
 *          model: "7cf61b4f-acdf-4295-b2d0-9b45f9f27418",
 *          idMap: {
 *             8a1f9cad-18d8-47ce-9cbd-08ba53858ced: "60286d41-d897-4de6-a0ed-0929fa68be96",
 *             ea37c2ed-39d4-4236-843c-332d52876c96: "9c4be293-0d8f-4e37-b115-d2c752824bfe"
 *          }
 *       },
 *       {
 *          account: "teamSpace1",
 *          model: "2710bd65-37d3-4e7f-b2e0-ffe743ce943f",
 *          idMap: {
 *             8ef1c52e-8838-46dc-9825-efe46aa10041: "a4a14ee6-aa44-4f36-96bd-f80dbabf8ead",
 *             ecc25d63-87e0-4600-ae60-f38f766bc9e4: "ffd49cfd-57fb-4c31-84f7-02b41352b54f",
 *             3abc5450-5db8-459b-80ea-cb9fca9ccedd: "a6947de3-25f4-4c2c-a150-22f0ed9ce4dd"
 *          }
 *       }
 *    ]
 * }
 *
 * @apiSuccessExample {json} Success (model):
 * {
 *    mainTree: {
 *       idMap: {
 *          a82a3b7f-bcd9-4487-8f94-370fa1f2ea4e: "57b0969f-6009-4e32-9153-2b17d3a3628b",
 *          33c36fee-622d-46a5-8be1-a1bd295aa7d1: "1e47d53e-cad8-489b-89ea-7c6c7b8d0e6c"
 *       }
 *    },
 *    subModels: []
 * }
 *
 */

router.get("/:model/revision/master/head/idMap.json", middlewares.hasReadAccessToModel, getIdMap);

/**
 * @api {get} /:teamspace/:model/revision/master/head/idToMeshes.json Get ID to meshes
 * @apiName getIdToMeshes
 * @apiGroup Model
 *
 * @apiParam {String} teamspace Name of teamspace
 * @apiParam {String} model Model to get ID Meshes for.
 *
 * @apiExample {get} Example usage:
 * GET /teamSpace1/b1fceab8-b0e9-4e45-850b-b9888efd6521/revision/master/head/idToMeshes.json HTTP/1.1
 *
 * @apiSuccessExample {json} Success:
 * {
 *    mainTree: {
 *       a82a3b7f-bcd9-4487-8f94-370fa1f2ea4e: [
 *          "a82a3b7f-bcd9-4487-8f94-370fa1f2ea4e"
 *       ],
 *       33c36fee-622d-46a5-8be1-a1bd295aa7d1: [
 *          "a82a3b7f-bcd9-4487-8f94-370fa1f2ea4e"
 *       ]
 *    },
 *    subModels: []
 * }
 */

router.get("/:model/revision/master/head/idToMeshes.json", middlewares.hasReadAccessToModel, getIdToMeshes);

/**
 * @api {get} /:teamspace/:model/revision/master/head/modelProperties.json Get model properties
 * @apiName getModelProperties
 * @apiGroup Model
 *
 * @apiParam {String} teamspace Name of teamspace
 * @apiParam {String} model Model to get properties for.
 *
 * @apiExample {get} Example usage:
 * GET /teamSpace1/b1fceab8-b0e9-4e45-850b-b9888efd6521/revision/master/head/modelProperties.json HTTP/1.1
 *
 * @apiSuccessExample {json} Success:
 * {
 *    properties: {
 *       hiddenNodes: []
 *    },
 *    subModels: []
 * }
 *
 */

router.get("/:model/revision/master/head/modelProperties.json", middlewares.hasReadAccessToModel, getModelProperties);

/**
 * @api {get} /:teamspace/:model/revision/:rev/fulltree.json Get tree by revision
 * @apiName getRevModelTree
 * @apiGroup Model
 * @apiDescription Get full tree by revision. See more details <a href='#api-Model-getModelTree'>here</a>.
 *
 * @apiParam {String} teamspace Name of teamspace
 * @apiParam {String} model Model to get Tree for.
 * @apiParam {String} rev	Revision to use.
 */

router.get("/:model/revision/:rev/fulltree.json", middlewares.hasReadAccessToModel, getModelTree);

/**
 * @api {get} /:teamspace/:model/revision/:rev/tree_path.json Get tree path by revision
 * @apiName getTreePathByRevision
 * @apiGroup Model
 * @apiDescription Get tree path by revision. See more details <a href='#api-Model-getTreePath'>here</a>.
 *
 * @apiParam {String} teamspace Name of teamspace
 * @apiParam {String} model Model to get tree path for.
 * @apiParam {String} rev	Revision to use.
 */

router.get("/:model/revision/:rev/tree_path.json", middlewares.hasReadAccessToModel, getTreePath);

/**
 * @api {get} /:teamspace/:model/revision/:rev/idMap.json Get tree path by revision
 * @apiName getRevIdMap
 * @apiGroup Model
 * @apiDescription Get tree path by revision. See more details <a href='#api-Model-getTreePath'>here</a>.
 *
 * @apiParam {String} teamspace Name of teamspace
 * @apiParam {String} model Model to ID map for.
 * @apiParam {String} rev	Revision to use.
 */

router.get("/:model/revision/:rev/idMap.json", middlewares.hasReadAccessToModel, getIdMap);

/**
 * @api {get} /:teamspace/:model/revision/:rev/idToMeshes.json Get ID Meshes by revision
 * @apiName getRevIdToMeshes
 * @apiGroup Model
 * @apiDescription Get ID Meshes by revision. See more details <a href='#api-Model-getTreePath'>here</a>.
 *
 * @apiParam {String} teamspace Name of teamspace
 * @apiParam {String} model Model to use.
 * @apiParam {String} rev	Revision to use.
 */

router.get("/:model/revision/:rev/idToMeshes.json", middlewares.hasReadAccessToModel, getIdToMeshes);

/**
 * @api {get} /:teamspace/:model/revision/:rev/modelProperties.json Get model properties by revision
 * @apiName getRevModelProperties
 * @apiGroup Model
 * @apiDescription Get model properties by revision. See more details <a href='#api-Model-getModelProperties'>here</a>.
 *
 * @apiParam {String} teamspace Name of teamspace
 * @apiParam {String} model Model to use.
 * @apiParam {String} rev	Revision to use.
 */

router.get("/:model/revision/:rev/modelProperties.json", middlewares.hasReadAccessToModel, getModelProperties);

/**
 *
 *
 * @api {get} /:teamspace/:model/revision/master/head/searchtree.json?searchString=[searchString] Search model tree
 * @apiName searchModelTree
 * @apiGroup Model
 * @apiDescription Searches the model (or models if it is a federation) tree and returns the objects matching their names with the searchString param.
 *
 * @apiParam {String} teamspace Name of teamspace
 * @apiParam {String} model Model to use.
 *
 * @apiParam (Query) {String} searchString The string to use for search tree objects
 *
 * @apiExample {get} Example usage:
 * GET /teamSpace1/3549ddf6-885d-4977-87f1-eeac43a0e818/revision/master/head/searchtree.json?searchString=fou HTTP/1.1
 *
 * @apiSuccessExample {json} Success:
 * [
 *    {
 *       "_id": "33fe7c13-17a4-43d6-af03-ceae6880322f",
 *       "name": "Fouliiferous Tree H64_2",
 *       "account": "teamSpace1",
 *       "model": "3549ddf6-885d-4977-87f1-eeac43a0e818"
 *    },
 *    {
 *       "_id": "ce413e99-8469-4ed0-86e3-ff50bf4fed89",
 *       "name": "Fouliiferous Tree H64",
 *       "account": "teamSpace1",
 *       "model": "3549ddf6-885d-4977-87f1-eeac43a0e818"
 *    }
 * ]
 *
 */

router.get("/:model/revision/master/head/searchtree.json", middlewares.hasReadAccessToModel, searchModelTree);

/**
 * @api {get} /:teamspace/:model/revision/:rev/searchtree.json?searchString=[searchString] Search model tree by revision
 * @apiName searchModelTreeRev
 * @apiGroup Model
 * @apiDescription Searches the model (or models if it is a federation) tree and returns the objects matching their names with the searchString param.
 * See more details <a href='#api-Model-searchModelTree'>here</a>
 *
 * @apiParam {String} teamspace Name of teamspace
 * @apiParam {String} model Model to use.
 * @apiParam {String} rev	Revision to use.
 *
 * @apiParam (Query) {String} searchString The string to use for search tree objects
 */

router.get("/:model/revision/:rev/searchtree.json", middlewares.hasReadAccessToModel, searchModelTree);

/**
 * @api {get} /:teamspace/:model/revision/master/head/subModelRevisions Get submodels revisions
 * @apiName getSubRevisionModels
 * @apiGroup Model
 * @apiDescription In a federation it returns the submodels revisions of the latest federation revision.
 *
 * @apiParam {String} teamspace Name of teamspace
 * @apiParam {String} model Model to get properties for.
 *
 * @apiExample {get} Example usage:
 * GET /teamSpace1/5ce7dd19-1252-4548-a9c9-4a5414f2e0c5/revision/master/head/subModelRevisions HTTP/1.1
 *
 * @apiSuccessExample {json} Success:
 * {
 *    "b1fceab8-b0e9-4e45-850b-b9888efd6521": {
 *       "name": "block",
 *       "revisions": [
 *          {
 *             "_id": "ddcc3213-af61-4d30-921f-e502d1c2199c",
 *             "author": "teamSpace1",
 *             "tag": "block",
 *             "timestamp": "2019-05-02T16:16:49.000Z",
 *             "name": "ddcc3213-af61-4d30-921f-e502d1c2199c",
 *             "branch": "master"
 *          }
 *       ]
 *    },
 *    "7cf61b4f-acdf-4295-b2d0-9b45f9f27418": {
 *       "name": "letters",
 *       "revisions": [
 *          {
 *             "_id": "a1bcfa72-ff37-41ac-95ab-66e450a37896",
 *             "author": "teamSpace1",
 *             "tag": "letters",
 *             "timestamp": "2019-05-02T16:16:32.000Z",
 *             "name": "a1bcfa72-ff37-41ac-95ab-66e450a37896",
 *             "branch": "master"
 *          }
 *       ]
 *    },
 *    "2710bd65-37d3-4e7f-b2e0-ffe743ce943f": {
 *       "name": "pipes",
 *       "revisions": [
 *          {
 *             "_id": "9ee1190b-cd25-4467-8d38-5af7c77cab5a",
 *             "author": "teamSpace1",
 *             "tag": "pipes",
 *             "timestamp": "2019-05-02T16:17:04.000Z",
 *             "name": "9ee1190b-cd25-4467-8d38-5af7c77cab5a",
 *             "branch": "master"
 *          }
 *       ]
 *    }
 * }
 *
 */
router.get("/:model/revision/master/head/subModelRevisions", middlewares.hasReadAccessToModel, getSubModelRevisions);

/**
 * @api {get} /:teamspace/:model/revision/:revId/subModelRevisions Get submodel revisions by rev
 * @apiName getSubModelRevisionsByRev
 * @apiGroup Model
 * @apiDescription In a federation it returns the submodels revisions of a particular federation revision.
 * See more details <a href='#api-Model-getSubRevisionModels'>here</a>
 *
 * @apiParam {String} teamspace Name of teamspace
 * @apiParam {String} model Model to get properties for.
 * @apiParam {String} rev	Revision to use.
 *
 */
router.get("/:model/revision/:revId/subModelRevisions", middlewares.hasReadAccessToModel, getSubModelRevisions);

/**
 * @api {delete} /:teamspace/:model Delete Model.
 * @apiName deleteModel
 * @apiGroup Model
 *
 * @apiParam {String} teamspace Name of teamspace
 * @apiParam {String} model Model to delete.
 *
 * @apiExample {delete} Example usage:
 * DELETE /teamSpace1/17d09947-368e-4748-877f-d105842c6681 HTTP/1.1
 *
 * @apiSuccessExample {json} Success:
 * {
 *    "account": "teamSpace1",
 *    "model": "17d09947-368e-4748-877f-d105842c6681"
 * }
 *
 */
router.delete("/:model", middlewares.hasDeleteAccessToModel, deleteModel);

/**
 * @api {post} /:teamspace/:model/upload Upload Model.
 * @apiName uploadModel
 * @apiGroup Model
 * @apiDescription It uploads a model file and creates a new revision for that model.
 *
 * @apiParam {String} teamspace Name of teamspace
 * @apiParam {String} model Model id to upload.
 * @apiParam (Request body) {String} tag the tag name for the new revision
 * @apiParam (Request body) {String} desc the description for the new revision
 * @apiParam (Request body) {Boolean} [importAnimations] whether to import animations within a sequence
 *
 * @apiParam (Request body: Attachment) {binary} FILE the file to be uploaded
 *
 * @apiExample {post} Example usage:
 * POST /teamSpace1/b1fceab8-b0e9-4e45-850b-b9888efd6521/upload HTTP/1.1
 * Content-Type: multipart/form-data; boundary=----WebKitFormBoundarySos0xligf1T8Sy8I
 *
 * ------WebKitFormBoundarySos0xligf1T8Sy8I
 * Content-Disposition: form-data; name="file"; filename="3DrepoBIM.obj"
 * Content-Type: application/octet-stream
 *
 * <binary content>
 * ------WebKitFormBoundarySos0xligf1T8Sy8I
 * Content-Disposition: form-data; name="tag"
 *
 * rev1
 * ------WebKitFormBoundarySos0xligf1T8Sy8I
 * Content-Disposition: form-data; name="desc"
 *
 * el paso
 * ------WebKitFormBoundarySos0xligf1T8Sy8I-- *
 *
 */
router.post("/:model/upload",  middlewares.hasUploadAccessToModel, middlewares.formatV5NewModelRevisionsData, validateNewModelRevisionData, uploadModel);
/**
 * @api {get} /:teamspace/:model/download/latest Download model
 * @apiName downloadModel
 * @apiGroup Model
 * @apiDescription It returns the model file using the latest revision.
 *
 * @apiParam {String} teamspace Name of teamspace
 * @apiParam {String} model Model to download.
 *
 * @apiExample {get} Example usage:
 * GET /teamSpace1/b1fceab8-b0e9-4e45-850b-b9888efd6521/download/latest HTTP/1.1
 *
 * @apiSuccessExample {json} Success (with headers):
 *
 * HTTP/1.1 200 OK
 * X-Powered-By: Express
 * Vary: Origin
 * Access-Control-Allow-Credentials: true
 * Content-Length: 11964
 * Content-Disposition: attachment;filename=3DrepoBIM_blocks.obj
 * set-cookie: connect.sid=s%3Ax4mDfLE-NqmPUO5tSSxPAyMjgov6YRge.bVSUoML3obJNp1XuObpbtXY44RjgEhJtsTz%2FwhwIckE; Domain=local.3drepo.io; Path=/; Expires=Tue, 27 Aug 2019 12:18:34 GMT; HttpOnly
 * Date: Tue, 27 Aug 2019 11:18:34 GMT
 * Connection: keep-alive
 *
 * /***** FILE CONTENTS ******\
 */

router.get("/:model/download/latest", middlewares.hasDownloadAccessToModel, downloadLatest);

router.get("/:model/meshes/:meshId", middlewares.hasReadAccessToModel, getMesh);

function updateSettings(req, res, next) {
	const place = utils.APIInfo(req);
	const {account, model} = req.params;

	return ModelSetting.updateModelSetting(account, model, req.body).then(modelSetting => {
		responseCodes.respond(place, req, res, next, responseCodes.OK, modelSetting.properties);
	}).catch(err => {
		responseCodes.respond(place, req, res, next, err.resCode || utils.mongoErrorToResCode(err), err.resCode ? {} : err);
	});
}

function getHeliSpeed(req, res, next) {
	const place = utils.APIInfo(req);
	const {account, model} = req.params;

	return ModelSetting.getHeliSpeed(account, model).then(heliSpeed => {
		responseCodes.respond(place, req, res, next, responseCodes.OK, heliSpeed);
	}).catch(err => {
		responseCodes.respond(place, req, res, next, err.resCode || utils.mongoErrorToResCode(err), err.resCode ? {} : err);
	});
}

function updateHeliSpeed(req, res, next) {
	const place = utils.APIInfo(req);
	const {account, model} = req.params;

	return ModelSetting.updateHeliSpeed(account, model, req.body.heliSpeed).then(() => {
		responseCodes.respond(place, req, res, next, responseCodes.OK, {});
	}).catch(err => {
		responseCodes.respond(place, req, res, next, err.resCode || utils.mongoErrorToResCode(err), err.resCode ? {} : err);
	});
}

function getModelSetting(req, res, next) {
	const place = utils.APIInfo(req);
	const username = req.session.user.username;
	const {model, account} = req.params;

	ModelHelpers.getModelSetting(account, model, username).then(setting => {
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
		const username = req.session.user.username;

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
		const isFed = !!req.body.subModels;
		if (isFed) {
			createModelPromise = ModelHelpers.createNewFederation(account, modelName, username, data);
		} else {
			createModelPromise = ModelHelpers.createNewModel(account, modelName, data);
		}

		createModelPromise.then(result => {
			const modelData = result.modelData;
			modelData.setting = result.settings;

			if (isFed) {
				// hack: we need to wire federations properly onto the queue and follow the same process as model uploads. But it's
				//       not happening right now.
				modelData.setting.timestamp = new Date();
			}

			responseCodes.respond(responsePlace, req, res, next, responseCodes.OK, modelData);
		}).catch(err => {
			responseCodes.respond(responsePlace, req, res, next, err.resCode || utils.mongoErrorToResCode(err), err.resCode ? {} : err);
		});
	} else {
		responseCodes.respond(responsePlace, req, res, next, responseCodes.INVALID_ARGUMENTS, responseCodes.INVALID_ARGUMENTS);
	}
}

async function updateModel(req, res, next) {
	const responsePlace = utils.APIInfo(req);
	const {teamspace, federation} = req.params;
	const owner = req.session.user.username;

	try {
		await FederationsV5.newRevision(teamspace, federation, {owner, ...req.body});
		const setting = await ModelHelpers.getModelSetting(teamspace, federation, owner);
		responseCodes.respond(responsePlace, req, res, next, responseCodes.OK, {
			account: teamspace,
			model: federation,
			setting: {...setting, subModels: req.body.containers }
		});
	} catch(err) {
		responseCodes.respond(responsePlace, req, res, next, err.resCode || utils.mongoErrorToResCode(err), err.resCode ? {} : err);
	}
}

function deleteModel(req, res, next) {
	const responsePlace = utils.APIInfo(req);
	const {account, model} = req.params;

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
	const {account, model, rev} = req.params;

	JSONAssets.getIdMap(
		account,
		model,
		rev ? undefined : C.MASTER_BRANCH_NAME,
		rev,
		req.session.user.username
	).then(file => {
		const headers = getHeaders(false);
		responseCodes.writeStreamRespond(utils.APIInfo(req), req, res, next, file.readStream, headers);
	}).catch(err => {
		responseCodes.respond(utils.APIInfo(req), req, res, next, err, err);
	});
}

function getIdToMeshes(req, res, next) {
	const {account, model, rev} = req.params;

	JSONAssets.getIdToMeshes(
		account,
		model,
		rev ? undefined : C.MASTER_BRANCH_NAME,
		rev,
		req.session.user.username
	).then(file => {
		const headers = getHeaders(false);

		responseCodes.writeStreamRespond(utils.APIInfo(req), req, res, next, file.readStream, headers);
	}).catch(err => {
		responseCodes.respond(utils.APIInfo(req), req, res, next, err, err);
	});
}

function getModelTree(req, res, next) {
	const {account, model, rev} = req.params;

	JSONAssets.getTree(
		account,
		model,
		rev ? undefined : C.MASTER_BRANCH_NAME,
		rev
	).then(({ file, isFed }) => {
		const headers = getHeaders(rev && !isFed);
		responseCodes.writeStreamRespond(utils.APIInfo(req), req, res, next, file.readStream, headers);
	}).catch(err => {
		responseCodes.respond(utils.APIInfo(req), req, res, next, err, err);
	});
}

function getModelProperties(req, res, next) {
	const {account, model, rev} = req.params;

	JSONAssets.getModelProperties(
		account,
		model,
		rev ? undefined : C.MASTER_BRANCH_NAME,
		rev,
		req.session.user.username
	).then(file => {
		const headers = getHeaders(false);
		responseCodes.writeStreamRespond(utils.APIInfo(req), req, res, next, file.readStream, headers);

	}).catch(err => {
		responseCodes.respond(utils.APIInfo(req), req, res, next, err, err);
	});
}

function getTreePath(req, res, next) {
	const {account, model, rev} = req.params;

	JSONAssets.getTreePath(
		account,
		model,
		rev ? undefined : C.MASTER_BRANCH_NAME,
		rev,
		req.session.user.username
	).then(file => {
		const headers = getHeaders(false);

		responseCodes.writeStreamRespond(utils.APIInfo(req), req, res, next, file.readStream, headers);
	}).catch(err => {
		responseCodes.respond(utils.APIInfo(req), req, res, next, err, err);
	});
}

function searchModelTree(req, res, next) {
	const {account, model, rev} = req.params;
	const username = req.session.user.username;
	const searchString = req.query.searchString;

	let branch;

	if (!rev) {
		branch = C.MASTER_BRANCH_NAME;
	}

	ModelHelpers.searchTree(account, model, branch, rev, searchString, username).then(items => {
		responseCodes.respond(utils.APIInfo(req), req, res, next, responseCodes.OK, items);
	}).catch(err => {
		responseCodes.respond(utils.APIInfo(req), req, res, next, err, err);
	});
}

function downloadLatest(req, res, next) {
	const {account, model} = req.params;

	ModelHelpers.downloadLatest(account, model).then(file => {
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
	const { file } = req;
	const revInfo = req.body;
	const { teamspace, container } = req.params;
	const owner = req.session.user ? req.session.user.username : undefined;

	ContainersV5.newRevision(teamspace, container, { ...revInfo, owner }, file).then(() => {
		responseCodes.respond(responsePlace, req, res, next, responseCodes.OK, { status: "uploaded"});
	}).catch(err => {
		err = err.resCode ? err.resCode : err;
		responseCodes.respond(responsePlace, req, res, next, err, err);
	});
}

function updatePermissions(req, res, next) {
	const { account, model } = req.params;

	return ModelSetting.updatePermissions(account, model, req.body, req.session.user.username).then(response => {
		responseCodes.respond(utils.APIInfo(req), req, res, next, responseCodes.OK, response);
	}).catch(err => {
		responseCodes.respond(utils.APIInfo(req), req, res, next, err, err);
	});
}

function batchUpdatePermissions(req, res, next) {
	return ModelSetting.batchUpdatePermissions(req.params.account, req.body,req.session.user.username).then(response => {
		responseCodes.respond(utils.APIInfo(req), req, res, next, responseCodes.OK, response);
	}).catch(err => {
		responseCodes.respond(utils.APIInfo(req), req, res, next, err, err);
	});
}

function getSingleModelPermissions(req, res, next) {
	const { account, model } = req.params;

	return ModelSetting.getSingleModelPermissions(account, model).then(permissions => {
		responseCodes.respond(utils.APIInfo(req), req, res, next, responseCodes.OK, permissions);
	}).catch(err => {
		responseCodes.respond(utils.APIInfo(req), req, res, next, err, err);
	});
}

function getMultipleModelsPermissions(req, res, next) {
	return ModelSetting.getMultipleModelsPermissions(req.params.account, req.query.models).then(permissions => {
		responseCodes.respond(utils.APIInfo(req), req, res, next, responseCodes.OK, permissions);
	}).catch(err => {
		responseCodes.respond(utils.APIInfo(req), req, res, next, err, err);
	});
}

function getAssetsMeta(req, res, next) {
	const {account, model, rev} = req.params;
	const username = req.session.user.username;
	const branch = rev ? undefined : C.MASTER_BRANCH_NAME;

	Scene.getMeshInfo(account, model, branch, rev, username).then(obj => {
		responseCodes.respond(utils.APIInfo(req), req, res, next, responseCodes.OK, obj);
	}).catch(err => {
		responseCodes.respond(utils.APIInfo(req), req, res, next, err, err);
	});
}

function getUnityAssets(req, res, next) {
	const {account, model, rev} = req.params;
	const username = req.session.user.username;
	const branch = rev ? undefined : C.MASTER_BRANCH_NAME;

	UnityAssets.getAssetList(account, model, branch, rev, username, true).then(obj => {
		responseCodes.respond(utils.APIInfo(req), req, res, next, responseCodes.OK, obj);
	}).catch(err => {
		responseCodes.respond(utils.APIInfo(req), req, res, next, err, err);
	});
}

function getRepoAssets(req, res, next) {
	const {account, model, rev} = req.params;
	const username = req.session.user.username;
	const branch = rev ? undefined : C.MASTER_BRANCH_NAME;

	UnityAssets.getAssetList(account, model, branch, rev, username, false).then(obj => {
		responseCodes.respond(utils.APIInfo(req), req, res, next, responseCodes.OK, obj);
	}).catch(err => {
		responseCodes.respond(utils.APIInfo(req), req, res, next, err, err);
	});
}

function getSrcAssets(req, res, next) {
	const {account, model, rev} = req.params;
	const username = req.session.user.username;
	const branch = rev ? undefined : C.MASTER_BRANCH_NAME;

	SrcAssets.getAssetList(account, model, branch, rev, username).then(obj => {
		responseCodes.respond(utils.APIInfo(req), req, res, next, responseCodes.OK, obj);
	}).catch(err => {
		responseCodes.respond(utils.APIInfo(req), req, res, next, err, err);
	});
}

function getJsonMpc(req, res, next) {
	const {account, model, uid} = req.params;

	JSONAssets.getSuperMeshMapping(account, model, uid).then(file => {
		responseCodes.respond(utils.APIInfo(req), req, res, next, responseCodes.OK, file, undefined, config.cachePolicy);
	}).catch(err => {
		responseCodes.respond(utils.APIInfo(req), req, res, next, err.resCode || utils.mongoErrorToResCode(err), err.resCode ? {} : err);
	});
}

function getAllJsonMpcs(req, res, next) {
	const {account, model, rev} = req.params;
	const username = req.session.user.username;
	const branch = rev ? undefined : C.MASTER_BRANCH_NAME;

	JSONAssets.getAllSuperMeshMapping(account, model, branch, rev, username).then(({readStream, isFed}) => {
		const headers = getHeaders(rev && !isFed);
		responseCodes.writeStreamRespond(utils.APIInfo(req), req, res, next, readStream, headers);
	}).catch(err => {
		responseCodes.respond(utils.APIInfo(req), req, res, next, err, err);
	});
}

function getSubModelRevisions(req, res, next) {
	const {account, model, revId} = req.params;
	const branch = revId ? undefined : "master";

	ModelHelpers.getSubModelRevisions(account, model, branch, revId).then((result) => {
		responseCodes.respond(utils.APIInfo(req), req, res, next, responseCodes.OK, result, undefined, req.param.rev ? config.cachePolicy : undefined);
	}).catch(err => {
		responseCodes.respond(utils.APIInfo(req), req, res, next, err.resCode || utils.mongoErrorToResCode(err), err.resCode ? {} : err);
	});
}

function getUnityBundle(req, res, next) {
	const {account, model, uid} = req.params;

	UnityAssets.getUnityBundle(account, model, uid).then(({ readStream, size, mimeType, encoding }) => {
		ResponderV5.writeStreamRespond(req, res, ResponseCodes.templates.ok, readStream, undefined, size, { mimeType, encoding });
	}).catch(err => {
		responseCodes.respond(utils.APIInfo(req), req, res, next, err.resCode || utils.mongoErrorToResCode(err), err.resCode ? {} : err);
	});
}

function getRepoBundle(req, res, next) {
	const {account, model, uid} = req.params;

	UnityAssets.getRepoBundle(account, model, uid).then(({ readStream, size, mimeType, encoding }) => {
		ResponderV5.writeStreamRespond(req, res, ResponseCodes.templates.ok, readStream, undefined, size, { mimeType, encoding });
	}).catch(err => {
		responseCodes.respond(utils.APIInfo(req), req, res, next, err.resCode || utils.mongoErrorToResCode(err), err.resCode ? {} : err);
	});
}

function getTexture(req, res, next) {
	const {account, model, uid} = req.params;

	UnityAssets.getTexture(account, model, uid).then(({ readStream, size, mimeType, encoding }) => {
		ResponderV5.writeStreamRespond(req, res, ResponseCodes.templates.ok, readStream, undefined, size, { mimeType, encoding });
	}).catch(err => {
		responseCodes.respond(utils.APIInfo(req), req, res, next, err.resCode || utils.mongoErrorToResCode(err), err.resCode ? {} : err);
	});
}

function getSRC(req, res, next) {
	const {account, model, uid} = req.params;

	// FIXME: We should probably generalise this and have a model assets object.
	SrcAssets.getSRC(account, model, utils.uuidToString(uid)).then(({ readStream, size, mimeType, encoding }) => {
		req.params.format = "src";
		ResponderV5.writeStreamRespond(req, res, ResponseCodes.templates.ok, readStream, undefined, size, { mimeType, encoding });
	}).catch(err => {
		responseCodes.respond(utils.APIInfo(req), req, res, next, err.resCode || utils.mongoErrorToResCode(err), err.resCode ? {} : err);
	});
}

function getMesh(req, res, next) {
	const {model, account, meshId} = req.params;

	ModelHelpers.getMeshById(account, model, meshId).then((stream) => {
		res.writeHead(200, {"Content-Type": "application/json; charset=utf-8" });
		stream.pipe(res);
	}).catch(err => {
		responseCodes.respond(utils.APIInfo(req), req, res, next, err.resCode || utils.mongoErrorToResCode(err), err.resCode ? {} : err);
	});
}

module.exports = router;
