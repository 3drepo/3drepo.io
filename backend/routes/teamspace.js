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
(function() {

	const express = require("express");
	const router = express.Router({mergeParams: true});
	const responseCodes = require("../response_codes");
	const middlewares = require("../middlewares/middlewares");
	const User = require("../models/user");
	const utils = require("../utils");

	router.get("/quota", middlewares.loggedIn, getQuotaInfo);
	
	router.get("/members", middlewares.loggedIn, getMemberList);	
	router.post("/members/:user", middlewares.isAccountAdmin, addTeamMember);
	router.delete("/members/:user", middlewares.isAccountAdmin, removeTeamMember);


	function getQuotaInfo(req, res, next){

		User.findByUserName(req.session.user.username).then(user => {

			if(!user){
				return Promise.reject(responseCodes.USER_NOT_FOUND);
			}

			if(user.isMemberOfTeamspace(req.params.account)) {
				return User.getQuotaInfo(req.params.account);

			} else {
				return Promise.reject(responseCodes.NOT_AUTHORIZED);
			}
		}).then(quotaInfo => {
			responseCodes.respond(utils.APIInfo(req), req, res, next, responseCodes.OK, quotaInfo);
		}).catch(err => {

			responseCodes.respond(utils.APIInfo(req), req, res, next, err, err);
		});
		
	}


	function getMemberList(req, res, next){

		User.findByUserName(req.session.user.username).then(user => {

			if(!user) {
				return Promise.reject(responseCodes.USER_NOT_FOUND);
			}

			if(user.isMemberOfTeamspace(req.params.account)) {
				return User.getMembersAndJobs(req.params.account);

			} else {
				return Promise.reject(responseCodes.NOT_AUTHORIZED);
			}
		}).then(memArray => {
			responseCodes.respond(utils.APIInfo(req), req, res, next, responseCodes.OK, {members: memArray});
		}).catch(err => {

			responseCodes.respond(utils.APIInfo(req), req, res, next, err, err);
		});
		
	}
	
	
	function addTeamMember(req, res, next) {
	
		let responsePlace = utils.APIInfo(req);
	
		User.findByUserName(req.params.account)
			.then(dbUser => {
				if(req.params.user) {
					return dbUser.addTeamMember(req.params.user);
				} else {
					return Promise.reject(responseCodes.USER_NOT_FOUND);
				}
			})
			.then(() => {
				responseCodes.respond(responsePlace, req, res, next, responseCodes.OK, {user: req.params.user});
			})
			.catch(err => {
				responseCodes.respond(responsePlace, req, res, next, 
					err.resCode || utils.mongoErrorToResCode(err), err.resCode ? {} : err);
			});
	}

	
	function removeTeamMember(req, res, next) {

		let responsePlace = utils.APIInfo(req);
		User.findByUserName(req.params.account)
			.then(dbUser => {
				return dbUser.removeTeamMember(req.params.user, req.query.cascadeRemove);
			})
			.then(() => {
				responseCodes.respond(responsePlace, req, res, next, responseCodes.OK, {user: req.params.user});
			})
			.catch(err => {
				responseCodes.respond(responsePlace, req, res, next, 
					err.resCode || utils.mongoErrorToResCode(err), err.resCode ? err.info : err);
			});
	}


	module.exports = router;
}());

