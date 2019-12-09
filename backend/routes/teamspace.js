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
(function() {

	const _ = require("lodash");
	const express = require("express");
	const router = express.Router({mergeParams: true});
	const responseCodes = require("../response_codes");
	const middlewares = require("../middlewares/middlewares");
	const User = require("../models/user");
	const utils = require("../utils");

	/**
	 *
	 * @api {get} /:teamspace/quota Get Quota Information
	 * @apiName getQuotaInfo
	 * @apiGroup Teamspace
	 * @apiDescription It returns the quota information. Each teamspace has a space limit and a limit of collaborators.
	 * The values returned are  space used (both these values are in bytes) and the collaborator limit.
	 * If spaceLimit or collaboratorLimit are nulled it means that there are no space limit/member limit.
	 *
	 * @apiPermission teamSpaceAdmin
	 *
	 * @apiExample {get} Example usage:
	 * GET /teamSpace1/quota HTTP/1.1
	 *
	 * @apiParam {String} teamspace Name of teamspace
	 *
	 * @apiSuccessExample {json} Success
	 * HTTP/1.1 200 OK
	 * {
	 *     spaceLimit: 1048576,
	 *	   collaboratorLimit: 12,
	 *     spaceUsed: 2048
	 * }
	 *
	 */
	router.get("/quota", middlewares.isAccountAdmin, getQuotaInfo);

	/**
	 *
	 * @api {get} /:teamspace/members Get members list
	 * @apiName getMemberList
	 * @apiGroup Teamspace
	 * @apiDescription It returns a list of members identifying which of them are teamspace administrators, and their jobs.
	 *
	 * @apiPermission teamSpaceMember
	 *
	 * @apiParam {String} teamspace Name of teamspace
	 *
	 * @apiExample {get} Example usage:
	 * GET /teamSpace1/members HTTP/1.1
	 *
	 * @apiSuccessExample {json} Success
	 * HTTP/1.1 200 OK
	 * {
	 *    members: [
	 *       {
	 *          user: "teamSpace1",
	 *          firstName: "Teamspace",
	 *          lastName: "One",
	 *          company: "Teamspace one",
	 *          permissions: [
	 *             "teamspace_admin"
 	 *          ],
 	 *          job: "jobA",
	 *          isCurrentUser: true
	 *       },
	 *       {
	 *          user: "unassignedTeamspace1UserJobA",
 	 *          firstName: "John",
 	 *          lastName: "Williams",
 	 *          company: "Teamspace One",
	 *          permissions: [],
	 *          job: "jobA",
	 *          isCurrentUser: false
	 *       },
	 *       {
	 *          user: "viewerTeamspace1Model1JobB",
	 *          firstName: "Alice",
	 *          lastName: "Stratford",
	 *          company: "Teamspace one",
	 *          permissions: [],
	 *          job: "jobB",
	 *          isCurrentUser: false
	 *       }
	 *    ]
	 * }
	 *
	 */
	router.get("/members", middlewares.isTeamspaceMember, getMemberList);

	/**
	 *
	 * @api {get} /:teamspace/billingInfo Get billing info
	 * @apiName getBillingInfo
	 * @apiGroup Teamspace
	 * @apiDescription It returns the teamspace billing info.
	 *
	 * @apiPermission teamSpaceAdmin
	 *
	 * @apiParam {String} teamspace Name of teamspace
	 *
	 * @apiExample {get} Example usage:
	 * GET /teamSpace1/billingInfo HTTP/1.1
	 *
	 * @apiSuccessExample {json} Success
	 * HTTP/1.1 200 OK
	 * {
	 *    vat: "GB 365684514",
	 *    line1: "10 Downing Street",
	 *    postalCode: "SW1A 2AA",
	 *    city: "London",
	 *    company: "Teamspace one",
	 *    countryCode: "GB",
	 *    lastName: "Voorhees",
	 *    firstName: "Jason"
	 * }
	 *
	 */
	router.get("/billingInfo", middlewares.isAccountAdmin, getBillingInfo);

	/**
	 *
	 * @api {get} /:teamspace/members/:user Get member's info
	 * @apiName getMemberInfo
	 * @apiGroup Teamspace
	 * @apiDescription It returns the teamspace's member small info .
	 *
	 * @apiPermission teamSpaceMember
	 * @apiParam {String} teamspace Name of teamspace
	 * @apiParam {String} user The username of the user you wish to query
	 *
	 * @apiExample {get} Example usage:
	 * GET /teamSpace1/members/viewerTeamspace1Model1JobB HTTP/1.1
	 *
	 * @apiSuccessExample {json} Success
	 * HTTP/1.1 200 OK
	 * {
	 *    user: "viewerTeamspace1Model1JobB",
	 *    firstName: "Alice",
	 *    lastName: "Stratford",
	 *    company: "Teamspace one"
	 * }
	 */
	router.get("/members/:user", middlewares.isTeamspaceMember, getTeamMemberInfo);

	/**
	 *
	 * @api {delete} /:teamspace/members/:user Remove from the teamspace
	 * @apiName removeTeamMember
	 * @apiGroup Teamspace
	 * @apiDescription Removes a user from the teampspace.
	 *
	 * @apiPermission teamSpaceAdmin
	 *
	 * @apiParam {String} teamspace Name of teamspace
	 * @apiParam {String} user Username of the member to remove
	 *
	 * @apiExample {delete} Example usage:
	 * DELETE /teamSpace1/members/viewerTeamspace1Model1JobB HTTP/1.1
	 *
	 * @apiSuccessExample {json} Success
	 * HTTP/1.1 200 OK
	 * {
	 *    user: "viewerTeamspace1Model1JobB",
	 * }
	 */
	router.delete("/members/:user", middlewares.isAccountAdminOrSameUser , removeTeamMember);

	/**
	 *
	 * @api {get} /:teamspace/members/search/:searchString Search for non-members
	 * @apiName findUsersWithoutMembership
	 * @apiGroup Teamspace
	 * @apiDescription It returns a list of users that dont belong to the teamspace and that their usernames matches partially with the string and if entered an email
	 * it only matches if the string is the entire email address.
	 *
	 * In the result it's included their username, first name, last name, company and roles in other teamspaces.
	 *
	 * @apiPermission teamSpaceAdmin
	 *
	 * @apiParam {String} search Search string provided to find member
	 *
	 * @apiExample {get} Example usage:
	 * GET /teamSpace1/members/search/project HTTP/1.1
	 *
	 * @apiSuccessExample {json} Success
	 * HTTP/1.1 200 OK
	 *
	 * [
	 *    {
	 *       user: "projectowner",
	 *       roles: [
	 *          {
	 *             role: "team_member",
	 *             db: "projectowner"
	 *          }
	 *       ],
	 *       firstName: "Project",
	 *       lastName: "Owner",
	 *       company: null
	 *    },
	 *    {
	 *       user: "projectshared",
	 *       roles: [
	 *          {
	 *             role: "team_member",
	 *             db: "projectshared"
	 *          }
	 *       ],
	 *       firstName: "Drink",
	 *       lastName: "Coffee",
	 *       company: null
	 *    },
	 *    {
	 *       user: "project_username",
	 *       roles: [
	 *          {
	 *             role: "team_member",
	 *             db: "project_username"
	 *          }
	 *       ],
	 *       firstName: "George",
	 *       lastName: "Crown",
	 *        company: null
	 *    },
	 * ]
	 *
	 */
	router.get("/members/search/:searchString", middlewares.isAccountAdmin, findUsersWithoutMembership);

	/**
	 * @api {post} /:teamspace/members Add a team member
	 * @apiName addTeamMember
	 * @apiGroup Teamspace
	 * @apiDescription Adds a user to a teamspace and assign it a job.
	 *
	 * @apiPermission teamSpaceAdmin
	 *
	 * @apiParam {String} teamspace Name of teamspace
	 * @apiParam (Request body) {String} job The job that the users going to have assigned
	 * @apiParam (Request body) {String} user The username of the user to become a member
	 * @apiParam (Request body) {[]String} permissions The permisions to be assigned to the member it can be an empty array or have a "teamspace_admin" value.
	 *
	 * @apiExample {post} Example usage:
	 * POST /teamSpace1/members HTTP/1.1
	 * {
	 *    job: "jobA",
	 *    user: "projectshared",
	 *    permissions: []
	 * }
	 *
	 * @apiSuccessExample {json} Success
	 * {
	 *    job: "jobA",
	 *    permissions: [],
	 *    user: "projectshared",
	 *    firstName: "Drink",
	 *    lastName: "Coffee",
	 *    company: null
	 * }
	 *
	 */
	router.post("/members", middlewares.isAccountAdmin, addTeamMember);

	function getBillingInfo(req, res, next) {
		User.findByUserName(req.params.account).then(user => {
			let billingInfo = (user.customData.billing || {}).billingInfo;
			if (billingInfo.toBSON) {
				billingInfo = _.omit(billingInfo.toBSON(), "_id");
			}

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

	function getTeamMemberInfo(req, res, next) {
		User.getTeamMemberInfo(
			req.params.account,
			req.params.user
		).then(info => {
			responseCodes.respond(utils.APIInfo(req), req, res, next, responseCodes.OK, info);
		}).catch(err => {
			responseCodes.respond(utils.APIInfo(req), req, res, next, err, err);
		});

	}

	function getMemberList(req, res, next) {
		User.getMembers(req.params.account).then(memArray => {
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

