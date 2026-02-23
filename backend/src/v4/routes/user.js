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
const responseCodes = require("../response_codes");
const onSuccess = responseCodes.onSuccessfulOperation;
const middlewares = require("../middlewares/middlewares");
const User =  require("../models/user");
const utils = require("../utils");
const { setIntercomHash } = require("../models/intercom");
const { isString, isArray, isObject } = require("lodash");

/**
 * @api {get} /me Gets the profile for the logged user
 * @apiName getProfile
 *
 * @apiSuccessExample {json} Success
 *    HTTP/1.1 200 OK
 *    {
 *       username: "jasonv",
 *       firstName: "Jason",
 *       lastName: "Voorhees",
 *       email: "jason@vorhees.com",
 *       hasAvatar: true
 *    }
 *
 * @apiGroup User
 * */
router.get("/me", middlewares.loggedIn, getProfile, onSuccess);

/**
 * @api {post} /apikey Generates an apikey for the logged user
 * @apiName generateApiKey
 *
 * @apiSuccessExample {json} Success
 *    HTTP/1.1 200 OK
 *    {
 *       apiKey:"20f947a673dce5419ce187ca7998a68f"
 *    }
 *
 * @apiGroup User
 * */
router.post("/apikey", middlewares.loggedIn, generateApiKey, onSuccess);

/**
 * @api {delete} /apikey Deletes the current apikey for the logged user
 * @apiName deleteApiKey
 *
 * @apiSuccessExample {json} Success
 *    HTTP/1.1 200 OK
 *    {}
 *
 * @apiGroup User
 * */
router.delete("/apikey", middlewares.loggedIn, deleteApiKey, onSuccess);

/**
 * @api {get} /starredMeta Gets the starred metadata tags for the logged user
 * @apiDescription This endpoint returns the starred metadata tags. You can manage
 * the starred metadata in the frontend from BIM (i) icon in the viewer.
 *
 * @apiSuccessExample {json} Success
 *    HTTP/1.1 200 OK
 *    [
 *       "material",
 *       "color",
 *       "base offset"
 *    ]
 *
 * @apiName GetStarredMetadataTags
 * @apiGroup User
 * */
router.get("/starredMeta", middlewares.loggedIn, getStarredMetadataTags, onSuccess);

/**
 * @api {post} /starredMeta Adds a starred metadata tag for the logged user
 * @apiName StarMetadataTags
 * @apiGroup User
 *
 * @apiBody {String} tag The tag to be starred
 * @apiParamExample {json} Input
 *    {
 *      "tag": "material"
 *    }
 *
 * @apiSuccessExample {json} Success
 *    HTTP/1.1 200 OK
 *	  {}
 *
 * @apiError 400 BadRequest The request was malformed
 * */
router.post("/starredMeta", middlewares.loggedIn, appendStarredMetadataTag, onSuccess);

/**
 * @api {put} /starredMeta Replaces the whole starred metadata tags array for the logged user
 * @apiName SetMetadataTags
 * @apiGroup User
 *
 * @apiBody {String[]} tags An array of tags to be starred
 * @apiParamExample {json} Input
 *    [
 *    	"material",
 * 	  	"color"
 * 	  ]
 *
 * @apiSuccessExample {json} Success
 *    HTTP/1.1 200 OK
 *	  {}
 *
 * @apiError 400 BadRequest The request was malformed
 * */
router.put("/starredMeta", middlewares.loggedIn, replaceStarredMetadataTags, onSuccess);

/**
 * @api {delete} /starredMeta removes a starred metadata tag for the logged user if the tag exists
 * @apiName UnstarMetadataTags
 * @apiGroup User
 *
 * @apiBody {String} tag The tag to be starred
 * @apiParamExample {json} Input
 *    {
 *      "tag": "material"
 *    }
 *
 * @apiSuccessExample {json} Success
 *    HTTP/1.1 200 OK
 *	  {}
 *
 * @apiError 400 BadRequest The request was malformed
 * */
router.delete("/starredMeta", middlewares.loggedIn, deleteStarredMetadataTag, onSuccess);

/**
 * @api {get} /starredModels Gets the starred models for the logged user
 * @apiName GetStarredModels
 * @apiGroup User
 *
 * @apiSuccessExample {json} Success
 *    HTTP/1.1 200 OK
 *    [
 *      {
 *        "teamspace": "ts1",
 *        "models": ["c7d9184a-83d3-4ef0-975c-ba2ced888e79"]
 *      },
 *      {
 *        "teamspace": "ts2",
 *        "models": ["4d17e126-8238-432d-a421-93819373e21a", "0411e74a-0661-48f9-bf4f-8eabe4a673a0"]
 *      }
 *    ]
 * */
router.get("/starredModels", middlewares.loggedIn, getStarredModels, onSuccess);

/**
 * @api {post} /starredModels Adds a starred models for the logged user
 * @apiName StarModels
 * @apiGroup User
 *
 * @apiBody {String} teamspace teamspace where model resides
 * @apiBody {String} model model ID  to add
 * @apiParamExample {json} Input
 *    {
 *      "teamspace": "user1",
 *      "model": "c7d9184a-83d3-4ef0-975c-ba2ced888e79"
 *    }
 *
 * @apiSuccessExample {json} Success
 *    HTTP/1.1 200 OK
 *	  {}
 *
 * @apiError 400 BadRequest The request was malformed
 * */
router.post("/starredModels", middlewares.loggedIn, appendStarredModels, onSuccess);

/**
 * @api {put} /starredModels Sets the whole starred models for the logged user
 * @apiName SetStarredModels
 * @apiGroup User
 *
 * @apiBody {Object[]} starredModels Array of objects containing teamspace and models
 * @apiBody (starredModels) {String} teamspace Teamspace name
 * @apiBody (starredModels) {String[]} models Array of model IDs
 * @apiParamExample {json} Input
 *    [
 *      {
 *        "teamspace": "user1",
 *        "models": ["c7d9184a-83d3-4ef0-975c-ba2ced888e79"]
 *      },
 *      {
 *        "teamspace": "user2",
 *        "models": ["4d17e126-8238-432d-a421-93819373e21a", "0411e74a-0661-48f9-bf4f-8eabe4a673a0"]
 *      }
 *    ]
 *
 * @apiSuccessExample {json} Success
 *    HTTP/1.1 200 OK
 *	  {}
 *
 * @apiError 400 BadRequest The request was malformed
 * */
router.put("/starredModels", middlewares.loggedIn, replaceStarredModels, onSuccess);

/**
 * @api {delete} /starredModels removes a starred models for the logged user if the tag exists
 * @apiName UnstarModels
 * @apiGroup User
 *
 * @apiBody {String} teamspace teamspace where model resides
 * @apiBody  {String} model model ID  to remove
 * @apiParamExample {json} Input
 *    {
 *      "teamspace": "user1",
 *      "model": "c7d9184a-83d3-4ef0-975c-ba2ced888e79"
 *    }
 *
 * @apiSuccessExample {json} Success
 *    HTTP/1.1 200 OK
 *	  {}
 *
 * @apiError 400 BadRequest The request was malformed
 * */
router.delete("/starredModels", middlewares.loggedIn, deleteStarredModels, onSuccess);

async function getProfile(req, res, next) {
	const username = req.session.user.username;
	req.dataModel = await User.getProfileByUsername(username);
	setIntercomHash(req.dataModel);
	next();
}

async function generateApiKey(req, res, next) {
	try {
		const apiKey = await User.generateApiKey(req.session.user.username);
		req.dataModel = {apiKey};
		next();
	} catch(err) {
		responseCodes.respond(utils.APIInfo(req), req, res, next,
			err.resCode || utils.mongoErrorToResCode(err), err.resCode ? {} : err);
	}
}

function deleteApiKey(req, res, next) {
	try {
		User.deleteApiKey(req.session.user.username);
		req.dataModel = {};
		next();
	} catch(err) {
		responseCodes.respond(utils.APIInfo(req), req, res, next,
			err.resCode || utils.mongoErrorToResCode(err), err.resCode ? {} : err);
	}
}

async function getStarredMetadataTags(req, res, next) {
	const username = req.session.user.username;
	req.dataModel = await User.getStarredMetadataTags(username);
	next();
}

async function appendStarredMetadataTag(req, res, next) {
	const username = req.session.user.username;
	const tag = req.body.tag;
	if (!tag) {
		responseCodes.respond(utils.APIInfo(req), req, res, next, responseCodes.INVALID_ARGUMENTS, responseCodes.INVALID_ARGUMENTS);
		return;
	}

	req.dataModel = await User.appendStarredMetadataTag(username,tag);
	next();
}

async function replaceStarredMetadataTags(req, res, next) {
	const username = req.session.user.username;
	const tags = req.body;

	if (!isArray(tags) || !tags.every(isString)) {
		responseCodes.respond(utils.APIInfo(req), req, res, next, responseCodes.INVALID_ARGUMENTS, responseCodes.INVALID_ARGUMENTS);
		return;
	}

	req.dataModel = await User.setStarredMetadataTags(username,tags);
	next();
}

async function deleteStarredMetadataTag(req, res, next) {
	const username = req.session.user.username;
	const tag = req.body.tag;
	if (!tag) {
		responseCodes.respond(utils.APIInfo(req), req, res, next, responseCodes.INVALID_ARGUMENTS, responseCodes.INVALID_ARGUMENTS);
		return;
	}
	req.dataModel = await User.deleteStarredMetadataTag(username,tag);
	next();
}

async function getStarredModels(req, res, next) {
	const username = req.session.user.username;
	req.dataModel = await User.getStarredModels(username);
	next();
}

async function appendStarredModels(req, res, next) {
	const username = req.session.user.username;
	const ts = req.body.teamspace;
	const model = req.body.model;
	if (!ts || !isString(ts) || !model || !isString(model)) {
		responseCodes.respond(utils.APIInfo(req), req, res, next, responseCodes.INVALID_ARGUMENTS, responseCodes.INVALID_ARGUMENTS);
		return;
	}

	req.dataModel = await User.appendStarredModels(username, ts, model);
	next();
}

async function replaceStarredModels(req, res, next) {
	const username = req.session.user.username;
	const data = req.body;

	const validData = isObject(data) && !isArray(data) &&
		Object.keys(data).reduce((currRes, key) => currRes && isArray(data[key]) && data[key].every(isString),
			true);

	if (!validData) {
		responseCodes.respond(utils.APIInfo(req), req, res, next, responseCodes.INVALID_ARGUMENTS, responseCodes.INVALID_ARGUMENTS);
		return;
	}

	req.dataModel = await User.setStarredModels(username, data);
	next();
}

async function deleteStarredModels(req, res, next) {
	const username = req.session.user.username;
	const ts = req.body.teamspace;
	const model = req.body.model;
	if (!ts || !isString(ts) || !model || !isString(model)) {
		responseCodes.respond(utils.APIInfo(req), req, res, next, responseCodes.INVALID_ARGUMENTS, responseCodes.INVALID_ARGUMENTS);
		return;
	}
	req.dataModel = await User.deleteStarredModel(username, ts, model);
	next();
}

module.exports = router;
