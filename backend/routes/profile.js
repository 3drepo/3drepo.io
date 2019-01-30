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
const middlewares = require("../middlewares/middlewares");
const User =  require("../models/user");

// Helper function for converting a db user to the actual data that's being send
const userToProfile = (user) =>{
	const customData =  user.customData;
	return 	{
		username: user.user,
		firstName: customData.firstName,
		lastName: customData.lastName,
		email: customData.email,
		hasAvatar: !!customData.avatar,
		apiKey: customData.apiKey
	};
};

/**
 * @api {get} /me Gets the profile for the logged user
 * @apiName getProfile
 * @apiGroup Profile
 * */
router.get("/", middlewares.loggedIn, getProfile, responseCodes.onSuccessfulOperation);

async function getProfile(req, res, next) {
	const username = req.session.user.username;
	req.dataModel = userToProfile(await User.findByUserName(username));
	next();
}

module.exports = router;
