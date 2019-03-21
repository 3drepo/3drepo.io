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

router.get("/favmeta", middlewares.loggedIn, getFavouriteMetadataTags, onSuccess);

router.post("/favmeta", middlewares.loggedIn, appendFavouriteMetadataTag, onSuccess);

router.delete("/favmeta", middlewares.loggedIn, deleteFavouriteMetadataTag, onSuccess);

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

async function getFavouriteMetadataTags(req, res, next) {
	const username = req.session.user.username;
	req.dataModel = await User.getFavouriteMetadataTags(username);
	next();
}

async function appendFavouriteMetadataTag(req, res, next) {
	const username = req.session.user.username;
	const tag = req.body.tag;
	if (!tag) {
		res.status(400);
		res.end();
		return;
	}

	req.dataModel = await User.appendFavouriteMetadataTag(username,tag);
	next();
}

async function deleteFavouriteMetadataTag(req, res, next) {
	const username = req.session.user.username;
	const tag = req.body.tag;
	if (!tag) {
		res.status(400);
		res.end();
		return;
	}
	req.dataModel = await User.deleteFavouriteMetadataTag(username,tag);
	next();
}

module.exports = router;
