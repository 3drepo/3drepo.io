/**
 *	Copyright (C) 2019 3D Repo Ltd
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
const responseCodes = require("../response_codes");
const onSuccess = responseCodes.onSuccessfulOperation;
const middlewares = require("../middlewares/middlewares");
const User =  require("../models/user");
const utils = require("../utils");
const { isString, isArray } = require("lodash");

/**
 * @api {get} /me Gets the profile for the logged user
 * @apiName getProfile
 * @apiGroup User
 * */
router.get("/me", middlewares.loggedIn, getProfile, onSuccess);

/**
 * @api {post} /apikey Generates an apikey for the logged user
 * @apiName generateApiKey
 * @apiGroup User
 * */
router.post("/apikey", middlewares.loggedIn, generateApiKey, onSuccess);

/**
 * @api {delete} /apikey Deletes the current apikey for the logged user
 * @apiName deleteApiKey
 * @apiGroup User
 * */
router.delete("/apikey", middlewares.loggedIn, deleteApiKey, onSuccess);

/**
 * @api {get} /starredMeta Gets the starred metadata tags for the logged user
 * @apiName GetStarredMetadataTags
 * @apiGroup User
 * */
router.get("/starredMeta", middlewares.loggedIn, getStarredMetadataTags, onSuccess);

/**
 * @api {post} /starredMeta Adds a starred metadata tag for the logged user
 * @apiName StarMetadataTags
 * @apiGroup User
 *
 * @apiParam  {String} tag The tag to be starred
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
 * @api {put} /starredMeta Sets the whole starred metadata tag for the logged user
 * @apiName SetMetadataTags
 * @apiGroup User
 *
 * @apiParam  [String]  An array of tags to be starred
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
 * @apiParam  {String} tag The tag to be starred
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

async function getProfile(req, res, next) {
	const username = req.session.user.username;
	req.dataModel = await User.getProfileByUsername(username);
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
		res.status(400);
		res.end();
		return;
	}

	req.dataModel = await User.appendStarredMetadataTag(username,tag);
	next();
}

async function replaceStarredMetadataTags(req, res, next) {
	const username = req.session.user.username;
	const tags = req.body;

	if (!isArray(tags) || !tags.every(isString)) {
		res.status(400);
		res.end();
		return;
	}

	req.dataModel = await User.setStarredMetadataTags(username,tags);
	next();
}

async function deleteStarredMetadataTag(req, res, next) {
	const username = req.session.user.username;
	const tag = req.body.tag;
	if (!tag) {
		res.status(400);
		res.end();
		return;
	}
	req.dataModel = await User.deleteStarredMetadataTag(username,tag);
	next();
}

module.exports = router;
