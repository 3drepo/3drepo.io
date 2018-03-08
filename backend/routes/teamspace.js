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

(function() {
	"use strict";

	const express = require('express');
	const router = express.Router({mergeParams: true});
	const responseCodes = require('../response_codes');
	const middlewares = require('../middlewares/middlewares');
	const User = require("../models/user");
	const utils = require("../utils");

	router.get("/quota", middlewares.loggedIn, getQuotaInfo);


	function getQuotaInfo(req, res, next){

		User.findByUserName(req.session.user.username).then(user => {

			if(!user){
				return Promise.reject(responseCodes.USER_NOT_FOUND);
			}

			if(user.isMemberOfTeamspace(req.params.account)) {
				return User.getQuotaInfo(req.params.account);

			}
			else
			{
				return Promise.reject(responseCodes.NOT_AUTHORIZED);
			}
		}).then(quotaInfo => {
			console.log(quotaInfo);
			responseCodes.respond(utils.APIInfo(req), req, res, next, responseCodes.OK, quotaInfo);
		}).catch(err => {

			responseCodes.respond(utils.APIInfo(req), req, res, next, err, err);
		});
		
	}

	module.exports = router;
}());

