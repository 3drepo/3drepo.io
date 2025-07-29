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

	const _ = require("lodash");
	const express = require("express");
	const C = require("../constants");
	const router = express.Router({mergeParams: true});
	const responseCodes = require("../response_codes");
	const middlewares = require("../middlewares/middlewares");
	const multer = require("multer");
	const TeamspaceSettings = require("../models/teamspaceSetting");
	const User = require("../models/user");
	const utils = require("../utils");

	/**
	 * @apiDefine Teamspace Teamspace
	 *
	 * @apiParam {String} teamspace Name of teamspace
	 */

	/**
	 * @api {get} /:teamspace/settings/mitigations.csv Download mitigations file
	 * @apiName getMitigationsFile
	 * @apiGroup Teamspace
	 * @apiDescription Returns a CSV file containing all defined suggested risk mitigations.
	 *
	 * @apiUse Teamspace
	 *
	 * @apiExample {get} Example usage
	 * GET /acme/settings/mitigations.csv HTTP/1.1
	 *
	 * @apiSuccessExample {json} Success-Response
	 * HTTP/1.1 200 OK
	 * <Risk mitigations CSV file>
	 */
	router.get("/settings/mitigations.csv", middlewares.isAccountAdmin, getMitigationsFile);

	/**
	 * @api {post} /:teamspace/settings/mitigations.csv Upload mitigations file
	 * @apiName uploadMitigationsFile
	 * @apiGroup Teamspace
	 * @apiDescription Upload a risk mitigations CSV file to a teamspace.
	 *
	 * @apiUse Teamspace
	 *
	 * @apiExample {post} Example usage
	 * POST /acme/settings/mitigations.csv HTTP/1.1
	 * <Risk mitigations CSV file>
	 *
	 * @apiSuccessExample {json} Success-Response
	 * HTTP/1.1 200 OK
	 * {
	 * 	"status":"ok"
	 * }
	 */
	router.post("/settings/mitigations.csv", middlewares.isAccountAdmin, uploadMitigationsFile);

	/**
	 * @api {get} /:teamspace/settings Get teamspace settings
	 * @apiName getTeamspaceSettings
	 * @apiGroup Teamspace
	 * @apiDescription Returns all teamspace settings.
	 *
	 * @apiUse Teamspace
	 *
	 * @apiExample {get} Example usage
	 * GET /acme/settings HTTP/1.1
	 *
	 * @apiSuccessExample {json} Success-Response
	 * HTTP/1.1 200 OK
	 * {
	 * 	"riskCategories":[
	 * 		"Commercial Issue",
	 * 		"Environmental Issue",
	 * 		"Health - Material effect",
	 * 		"Health - Mechanical effect",
	 * 		"Safety Issue - Fall",
	 * 		"Safety Issue - Trapped",
	 * 		"Safety Issue - Event",
	 * 		"Safety Issue - Handling",
	 * 		"Safety Issue - Struck",
	 * 		"Safety Issue - Public",
	 * 		"Social Issue",
	 * 		"Other Issue",
	 * 		"UNKNOWN"
	 * 	],
	 * 	"topicTypes":[
	 * 		"For information",
	 * 		"VR",
	 * 		"Clash",
	 * 		"Diff",
	 * 		"RFI",
	 * 		"Risk",
	 * 		"H&S",
	 * 		"Design",
	 * 		"Constructibility",
	 * 		"GIS"
	 * 	],
	 * 	"mitigationsUpdatedAt":1567156228976,
	 * 	"_id":"acme"
	 * }
	 */
	router.get("/settings", middlewares.isTeamspaceMember, getTeamspaceSettings);

	/**
	 * @api {patch} /:teamspace/settings Update teamspace settings
	 * @apiName updateTeamspaceSettings
	 * @apiGroup Teamspace
	 * @apiDescription Update teamspace settings.
	 *
	 * @apiUse Teamspace
	 *
	 * @apiBody {String[]} [riskCategories] List of risk categories
	 * @apiBody {String[]} [topicTypes] List of issue topic types
	 *
	 * @apiBody (Risk category) {String} value Value of risk category
	 * @apiBody (Risk category) {String} label Label for risk category
	 *
	 * @apiBody (Topic type) {String} value Value of topic type
	 * @apiBody (Topic type) {String} label Label for topic type
	 *
	 * @apiExample {put} Example usage
	 * PUT /acme/settings HTTP/1.1
	 * {
	 * 	"topicTypes":[
	 * 		"New Topic 1",
	 * 		"New Topic 2"
	 * 	],
	 * 	"riskCategories":[
	 * 		"New Category 1",
	 * 		"NEW CATEGORY 2"
	 * 	]
	 * }
	 *
	 * @apiSuccessExample {json} Success-Response
	 * HTTP/1.1 200 OK
	 * {
	 * 	"riskCategories":[
	 * 		"New Category 1",
	 * 		"NEW CATEGORY 2"
	 * 	],
	 * 	"topicTypes":[
	 * 		"New Topic 1",
	 * 		"New Topic 2"
	 * 	],
	 * 	"mitigationsUpdatedAt":1567156228976,
	 * 	"_id":"acme"
	 * }
	 */
	router.patch("/settings", middlewares.isAccountAdmin, updateTeamspaceSettings);

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
	 *    company: "Teamspace one",
	 *    job: {"_id": "Job1", color: "#FFFFFF"}
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
	router.delete("/members/:user", middlewares.canAddOrRemoveUsers, removeTeamMember);

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
	 * @apiParam {String} teamspace name of the teamspace
	 * @apiParam {String} searchString Search string provided to find member
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
	 * @apiBody {String} job The job that the users going to have assigned
	 * @apiBody {String} user The username of the user to become a member
	 * @apiBody {String[]} permissions The permisions to be assigned to the member it can be an empty array or have a "teamspace_admin" value.
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
	router.post("/members", middlewares.canAddOrRemoveUsers, addTeamMember);

	/**
	 * @api {get} /:teamspace/addOns get enabled add ons
	 * @apiName getAddOns
	 * @apiGroup Teamspace
	 * @apiDescription view the list of addOns enabled on this teamspace
	 *
	 * @apiPermission teamspace member
	 *
	 * @apiParam {String} teamspace Name of teamspace
	 *
	 * @apiSuccessExample {json} Success
	 * {
	 *   vrEnabled: true,
	 *   hereEnabled: true
	 * }
	 *
	 */

	router.get("/addOns", middlewares.isTeamspaceMember, getTeamspaceAddOns);

	function getTeamspaceAddOns(req, res, next) {
		User.getAddOnsForTeamspace(req.params.account).then((addOns) => {
			responseCodes.respond(utils.APIInfo(req), req, res, next, responseCodes.OK, addOns);
		}).catch(err => {
			responseCodes.respond(utils.APIInfo(req), req, res, next, err, err);
		});
	}

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
		User.addTeamMember(req.params.account, req.body.user, req.body.job, req.body.permissions, req.session.user.username)
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
		User.removeTeamMember(req.params.account, req.params.user, req.query.cascadeRemove, req.session.user.username).then(() => {
			responseCodes.respond(responsePlace, req, res, next, responseCodes.OK, {user: req.params.user});
		})
			.catch(err => {
				responseCodes.respond(responsePlace, req, res, next,
					err.resCode || utils.mongoErrorToResCode(err), err.resCode ? err.info : err);
			});
	}

	function getTeamspaceSettings(req, res, next) {
		TeamspaceSettings.getTeamspaceSettings(req.params.account).then((settings) => {
			responseCodes.respond(utils.APIInfo(req), req, res, next, responseCodes.OK, settings);
		}).catch(err => {
			responseCodes.respond(utils.APIInfo(req), req, res, next, err, err);
		});
	}

	function updateTeamspaceSettings(req, res, next) {
		TeamspaceSettings.update(req.params.account, req.body).then((settings) => {
			responseCodes.respond(utils.APIInfo(req), req, res, next, responseCodes.OK, settings);
		}).catch(err => {
			responseCodes.respond(utils.APIInfo(req), req, res, next, err, err);
		});
	}

	function getMitigationsFile(req, res, next) {
		TeamspaceSettings.getMitigationsFile(req.params.account).then((mitigationsStream) => {
			const timestamp = (new Date()).toLocaleString();
			const filenamePrefix = (req.params.account + "_" + timestamp + "_").replace(/\W+/g, "_");

			const headers = {
				"Content-Disposition": "attachment;filename=" + filenamePrefix + "mitigations.csv",
				"Content-Type": "text/csv"
			};

			res.set(headers);
			responseCodes.writeStreamRespond(utils.APIInfo(req), req, res, next, mitigationsStream, headers);
		}).catch(err => {
			responseCodes.respond(utils.APIInfo(req), req, res, next, err, err);
		});
	}

	function uploadMitigationsFile(req, res, next) {
		const place = utils.APIInfo(req);
		const {account} = req.params;
		const sessionId = req.headers[C.HEADER_SOCKET_ID];
		const user = req.session.user.username;

		const upload = multer({
			storage: multer.memoryStorage()
		});

		upload.single("file")(req, res, (err) => {
			if (err) {
				return responseCodes.respond(place, req, res, next, err.resCode ? err.resCode : err , err.resCode ? err.resCode : err);
			} else {
				TeamspaceSettings.processMitigationsFile(account, user, sessionId, req.file.originalname, req.file.buffer).then((result) => {
					responseCodes.respond(utils.APIInfo(req), req, res, next, responseCodes.OK, result);
				}).catch(promErr => {
					responseCodes.respond(place, req, res, next, promErr, promErr);
				});
			}
		});
	}

	module.exports = router;
}());

