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
const User = require("../models/user");
const router = express.Router({mergeParams: true});
const responseCodes = require("../response_codes");
const middlewares = require("../middlewares/middlewares");
const utils = require("../utils");

router.post("/apikey", middlewares.loggedIn, generateApiKey, responseCodes.onSuccessfulOperation);

router.delete("/apikey", middlewares.loggedIn, deleteApiKey, responseCodes.onSuccessfulOperation);

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

module.exports = router;
