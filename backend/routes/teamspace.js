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

	/**
	 * @api {get} /quota Get Quota Information
	 * @apiName getQuotaInfo
	 * @apiGroup Teamspace
	 */

	router.get("/quota", middlewares.isAccountAdmin, getQuotaInfo);

	/**
	 * @api {get} /members Get Member List
	 * @apiName getMemberList
	 * @apiGroup Teamspace
	 */

	router.get("/members", middlewares.loggedIn, getMemberList);

	/**
	 * @api {get} /members Get Member List
	 * @apiName getMemberList
	 * @apiGroup Teamspace
	 */

	router.get("/billingInfo", middlewares.isAccountAdmin, getBillingInfo);

	/**
	 * @api {delete} /members/:user Remove a team member
	 * @apiName removeTeamMember
	 * @apiGroup Teamspace
	 *
	 * @apiParam {String} user User (Member) to remove
	 */

	router.delete("/members/:user", middlewares.isAccountAdmin, removeTeamMember);

	/**
	 * @api {get} /members/search/:searchString Search for a member without a membership
	 * @apiName findUsersWithoutMembership
	 * @apiGroup Teamspace
	 *
	 * @apiParam {String} searchString Search string provided to find member
	 */

	router.get("/members/search/:searchString", middlewares.isAccountAdmin, findUsersWithoutMembership);

	/**
	 * @api {post} /members Create a Team Member
	 * @apiName addTeamMember
	 * @apiGroup Teamspace
	 * @apiParam {String} searchString Search string required to find team member.
	 *
	 * @apiSuccess (200) {Object} Team member profile
	 *
	 * @apiError User not found The <code>searchString</code> of the User was not found.
	 * @apiErrorExample
	 * {
	 * 		"message": "User not found",
	 *		"status": 404,
	 *		"code": "USER_NOT_FOUND",
	 *		"value": 1,
	 *		"place": "POST /members"
	 * }
	 */

	router.post("/members", middlewares.isAccountAdmin, addTeamMember);

	function getBillingInfo(req, res, next) {
		User.findByUserName(req.params.account).then(user => {
			const billingInfo = (user.customData.billing || {}).billingInfo;
			responseCodes.respond(utils.APIInfo(req), req, res, next, responseCodes.OK, billingInfo);
		}).catch(err => {
			responseCodes.respond(utils.APIInfo(req), req, res, next, err, err);
		});
	}

	function getQuotaInfo(req, res, next) {
		User.getQuotaInfo(req.params.account)
			.then(quotaInfo => {
				responseCodes.respond(utils.APIInfo(req), req, res, next, responseCodes.OK, quotaInfo);
			}).catch(err => {
				responseCodes.respond(utils.APIInfo(req), req, res, next, err, err);
			});
	}

	function findUsersWithoutMembership(req, res, next) {
		User.findUsersWithoutMembership(req.params.account, req.params.searchString).then((notMembers) => {
			responseCodes.respond(utils.APIInfo(req), req, res, next, responseCodes.OK, notMembers);
		}).catch(err => {
			responseCodes.respond(utils.APIInfo(req), req, res, next, err, err);
		});
	}

	function getMemberList(req, res, next) {
		User.findByUserName(req.session.user.username).then(user => {
			if(!user) {
				return Promise.reject(responseCodes.USER_NOT_FOUND);
			}

			if(user.isMemberOfTeamspace(req.params.account)) {
				return User.getMembers(req.params.account);
			} else {
				return Promise.reject(responseCodes.NOT_AUTHORIZED);
			}
		}).then(memArray => {
			const members = memArray.map((userData) => {
				userData.isCurrentUser = req.session.user.username === userData.user;
				return userData;
			});
			responseCodes.respond(utils.APIInfo(req), req, res, next, responseCodes.OK, {members});
		}).catch(err => {
			responseCodes.respond(utils.APIInfo(req), req, res, next, err, err);
		});
	}

	function addTeamMember(req, res, next) {
		const responsePlace = utils.APIInfo(req);
		User.findByUserName(req.params.account)
			.then(dbUser => {
				if(req.body.user) {
					return dbUser.addTeamMember(req.body.user, req.body.job, req.body.permissions);
				} else {
					return Promise.reject(responseCodes.USER_NOT_FOUND);
				}
			})
			.then((user) => {
				responseCodes.respond(responsePlace, req, res, next, responseCodes.OK, user);
			})
			.catch(err => {
				responseCodes.respond(responsePlace, req, res, next,
					err.resCode || utils.mongoErrorToResCode(err), err.resCode ? {} : err);
			});
	}

	function removeTeamMember(req, res, next) {

		const responsePlace = utils.APIInfo(req);
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

