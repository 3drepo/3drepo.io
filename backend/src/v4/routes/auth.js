/**
 *  Copyright (C) 2014 3D Repo Ltd
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
const { v5Path } = require("../../interop");

const express = require("express");
const router = express.Router({ mergeParams: true });
const responseCodes = require("../response_codes.js");
const C = require("../constants");
const middlewares = require("../middlewares/middlewares");
const config = require("../config");
const utils = require("../utils");
const User = require("../models/user");
const UsersV5 = require(`${v5Path}/processors/users`);
const { fileExtensionFromBuffer } = require(`${v5Path}/utils/helper/typeCheck`);
const { routeDecommissioned } = require(`${v5Path}/middleware/common`);

const FileType = require("file-type");

const multer = require("multer");
const { fileExists } = require("../models/fileRef");

/**
 * @api {get} /version Application version
 * @apiName printVersion
 * @apiGroup 3D Repo
 * @apiDescription Show current application version.
 *
 * @apiSuccess (200) {String} VERSION API service version
 * @apiSuccess (200) {Object} unity Unity viewer version
 * @apiSuccess (200) {Object} navis Autodesk Navisworks version
 * @apiSuccess (200) {Object} unitydll Unity viewer version
 *
 * @apiSuccessExample {json} Success-Response:
 * HTTP/1.1 200 OK
 * {
 * 	"VERSION": "2.20.1",
 * 	"unity": {
 * 		"current": "2.20.0",
 * 		"supported": []
 * 	},
 * 	"navis": {
 * 		"current": "2.16.0",
 * 		"supported": [
 * 			"2.8.0"
 * 		]
 * 	},
 * 	"unitydll": {
 * 		"current": "2.8.0",
 * 		"supported": []
 * 	}
 * }
 */
router.get("/version", printVersion);

/**
 * @api {get} /:account.json List account information
 * @apiName listInfo
 * @apiGroup Account
 * @apiDescription Account information and list of projects grouped by teamspace
 * that the user has access to.
 *
 * @apiParam {String} account.json Account name with .json extension
 * @apiSuccess (200) {Object[]} accounts User account
 * @apiSuccess (200) {Object} billingInfo Billing information
 * @apiSuccess (200) {String} email User e-mail address
 * @apiSuccess (200) {String} firstName First name
 * @apiSuccess (200) {String} lastName Surname
 * @apiSuccess (200) {Boolean} hasAvatar True if user account has an avatar
 *
 * @apiExample {get} Example usage:
 * GET /alice.json HTTP/1.1
 *
 * @apiSuccessExample {json} Success-Response:
 * HTTP/1.1 200 OK
 * {
 * 	"accounts": [
 * 		{
 * 			"account": "repoman",
 * 			"models": [
 * 				{
 * 					"permissions": [
 * 						"change_model_settings",
 * 						"upload_files",
 * 						"create_issue",
 * 						"comment_issue",
 * 						"view_issue",
 * 						"view_model",
 * 						"download_model",
 * 						"edit_federation",
 * 						"delete_federation",
 * 						"delete_model",
 * 						"manage_model_permission"
 * 					],
 * 					"model": "00000000-0000-0000-0000-000000000000",
 * 					"name": "ufo",
 * 					"status": "ok",
 * 					"timestamp": "2016-07-26T15:52:11.000Z"
 * 				}
 * 			],
 * 			"fedModels": [],
 * 			"isAdmin": true,
 * 			"permissions": [
 * 				"teamspace_admin"
 * 			],
 * 			"quota": {
 * 				"spaceLimit": 10485760,
 * 				"collaboratorLimit": 5,
 * 				"spaceUsed": 12478764
 * 			},
 * 			"projects": []
 * 		},
 * 		{
 * 			"account": "breakingbad",
 * 			"models": [
 * 				{
 * 					"permissions": [
 * 						"view_issue",
 * 						"view_model",
 * 						"upload_files",
 * 						"create_issue"
 * 					],
 * 					"model": "00000000-0000-0000-0000-000000000001",
 * 					"name": "homelab",
 * 					"status": "ok",
 * 					"timestamp": null
 * 				}
 * 			],
 * 			"fedModels": [
 * 				{
 * 					"federate": true,
 * 					"permissions": [
 * 						"change_model_settings",
 * 						"upload_files",
 * 						"create_issue",
 * 						"comment_issue",
 * 						"view_issue",
 * 						"view_model",
 * 						"download_model",
 * 						"edit_federation",
 * 						"delete_federation",
 * 						"delete_model",
 * 						"manage_model_permission"
 * 					],
 * 					"model": "00000000-0000-0000-0000-000000000003",
 * 					"name": "fed1",
 * 					"status": "ok",
 * 					"timestamp": "2017-05-11T12:49:59.000Z",
 * 					"subModels": [
 * 						{
 * 							"database": "breakingbad",
 * 							"model": "00000000-0000-0000-0000-000000000001",
 * 							"name": "homelab"
 * 						},
 * 						{
 * 							"database": "breakingbad",
 * 							"model": "00000000-0000-0000-0000-000000000002",
 * 							"name": "laundrylab"
 * 						}
 * 					]
 * 				}
 * 			],
 * 			"projects": [
 * 				{
 * 					"_id": "58f78c8ededbb13a982114ee",
 * 					"name": "folder1",
 * 					"permission": [],
 * 					"models": [
 * 						{
 * 							"permissions": [
 * 								"view_issue",
 * 								"view_model",
 * 								"upload_files",
 * 								"create_issue"
 * 							],
 * 							"model": "00000000-0000-0000-0000-000000000004",
 * 							"name": "laundrylab",
 * 							"status": "ok",
 * 							"timestamp": null
 * 						}
 * 					]
 * 				}
 * 			]
 * 		}
 * 	],
 * 	"billingInfo": {
 * 		"countryCode": "US",
 * 		"postalCode": "0",
 * 		"line2": "123",
 * 		"city": "123",
 * 		"line1": "123",
 * 		"vat": "000",
 * 		"company": "Universal Pictures",
 * 		"_id": "59145aedf4f613668fba0f98"
 * 	},
 * 	"email":"alice@acme.co.uk",
 * 	"firstName":"Alice",
 * 	"lastName":"Allen",
 * 	"hasAvatar": true,
 * 	"jobs": [
 * 		{
 * 			"_id": "Director"
 * 		},
 * 		{
 * 			"_id": "Actor"
 * 		},
 * 		{
 * 			"_id": "Producer"
 * 		}
 * 	]
 * }
 */
router.get("/:account.json", middlewares.loggedIn, listInfo);
// TODO: divide into different endpoints that makes sense.

/**
 * @api {get} /:account/avatar Get avatar
 * @apiName getAvatar
 * @apiGroup Account
 * @apiDescription Get user avatar.
 *
 * @apiParam {String} account Account name
 * @apiSuccess (200) {File} avatar User Avatar Image
 * @apiError (404) USER_DOES_NOT_HAVE_AVATAR User does not have an avatar
 *
 * @apiExample {get} Example usage:
 * GET /alice/avatar HTTP/1.1
 *
 * @apiSuccessExample {binary} Success-Response:
 * HTTP/1.1 200 OK
 * Content-Type: image/png
 *
 * <binary image data>
 *
 * @apiErrorExample {json} Error-Response:
 * HTTP/1.1 404 Not Found
 * {
 * 	"message": "User does not have an avatar",
 * 	"status": 404,
 * 	"code": "USER_DOES_NOT_HAVE_AVATAR",
 * 	"place": "GET /alice/avatar"
 * }
 */
router.get("/:account/avatar", middlewares.loggedIn, getAvatar);

/**
 * @api {post} /:account/avatar Upload avatar
 * @apiName uploadAvatar
 * @apiGroup Account
 * @apiDescription Upload a new avatar image.
 * Only multipart form data content type will be accepted.
 *
 * @apiParam {String} account Account name
 * @apiBody {File} file Image to upload
 *
 * @apiExample {post} Example usage:
 * POST /alice/avatar HTTP/1.1
 * Content-Type: multipart/form-data; boundary=----WebKitFormBoundaryN8dwXAkcO1frCHLf
 *
 * ------WebKitFormBoundaryN8dwXAkcO1frCHLf
 * Content-Disposition: form-data; name="file"; filename="avatar.png"
 * Content-Type: image/png
 *
 * <binary content>
 * ------WebKitFormBoundaryN8dwXAkcO1frCHLf--
 *
 * @apiSuccess (200) {Object} status Status of Avatar upload.
 * @apiSuccessExample {json} Success-Response:
 * HTTP/1.1 200 OK
 * {
 *	"status":"success"
 * }
 */
router.post("/:account/avatar", middlewares.isAccountAdmin, uploadAvatar);

router.put("/:account", routeDecommissioned("PUT", "/v5/user"));

router.put("/:account/password", routeDecommissioned("POST", "/v5/user/password/reset"));

function getAvatar(req, res, next) {
	const responsePlace = utils.APIInfo(req);

	// Update user info
	UsersV5.getAvatar(req.params[C.REPO_REST_API_ACCOUNT]).then(async avatar => {

		if (!avatar) {
			return Promise.reject({ resCode: responseCodes.USER_DOES_NOT_HAVE_AVATAR });
		}
		const fileExt = await fileExtensionFromBuffer(avatar.buffer);
		req.params.format = fileExt || "png";
		responseCodes.respond(responsePlace, req, res, next, responseCodes.OK, avatar.buffer);

	}).catch((err) => {
		responseCodes.respond(responsePlace, req, res, next, err.resCode || utils.mongoErrorToResCode(err), err.resCode ? {} : err);
	});
}

function uploadAvatar(req, res, next) {
	const responsePlace = utils.APIInfo(req);
	// check space and format
	function fileFilter(fileReq, file, cb) {
		let format = file.originalname.split(".");
		format = format.length <= 1 ? "" : format.splice(-1)[0];

		const size = parseInt(fileReq.headers["content-length"]);

		if (!C.ACCEPTED_IMAGE_FORMATS.includes(format.toLowerCase())) {
			return cb({ resCode: responseCodes.FILE_FORMAT_NOT_SUPPORTED });
		}

		if (size > config.imageSizeLimit) {
			return cb({ resCode: responseCodes.AVATAR_SIZE_LIMIT });
		}

		return cb(null, true);
	}

	const upload = multer({
		storage: multer.memoryStorage(),
		fileFilter: fileFilter
	});

	upload.single("file")(req, res, function (err) {
		if (err) {
			return responseCodes.respond(responsePlace, req, res, next, err.resCode ? err.resCode : err, err.resCode ? err.resCode : err);
		} else {
			FileType.fromBuffer(req.file.buffer).then(type => {
				if (!C.ACCEPTED_IMAGE_FORMATS.includes(type.ext)) {
					throw (responseCodes.FILE_FORMAT_NOT_SUPPORTED);
				}
			}).then(async () => {
				const username = req.params[C.REPO_REST_API_ACCOUNT];
				await User.updateAvatar(username, req.file.buffer);
				responseCodes.respond(responsePlace, req, res, next, responseCodes.OK, { status: "success" });
			}).catch(error => {
				responseCodes.respond(responsePlace, req, res, next, error.resCode ? error.resCode : error, error.resCode ? error.resCode : error);
			});
		}
	});
}

async function listUserInfo(req, res, next) {

	const responsePlace = utils.APIInfo(req);
	const user = await User.findByUserName(req.params.account);

	if (!user) {
		throw { resCode: responseCodes.USER_NOT_FOUND };
	}

	const accounts = await User.listAccounts(user);

	const { firstName, lastName, email, billing: { billingInfo } } = user.customData;
	const hasAvatar = await fileExists("admin", "avatars.ref", user.user);
	responseCodes.respond(responsePlace, req, res, next, responseCodes.OK, {
		accounts,
		firstName,
		lastName,
		email,
		billingInfo: billingInfo,
		hasAvatar
	});
}

function listInfo(req, res, next) {

	const responsePlace = utils.APIInfo(req);

	if (req.session.user.username !== req.params.account) {

		let getType;

		if (C.REPO_BLACKLIST_USERNAME.indexOf(req.params.account) !== -1) {
			getType = Promise.resolve("blacklisted");
		} else {
			getType = User.findByUserName(req.params.account).then(_user => {
				if (!_user) {
					return "";
				} else if (!_user.customData.email) {
					return "database";
				} else {
					return "user";
				}
			});
		}

		getType.then(type => {
			responseCodes.respond(responsePlace, req, res, next, responseCodes.OK, { type });
		});

	} else {
		listUserInfo(req, res, next).catch(err => {
			responseCodes.respond(responsePlace, req, res, next, err.resCode || err, err.resCode ? {} : err);
		});
	}
}

function printVersion(req, res, next) {
	const responsePlace = utils.APIInfo(req);
	const versionInfo = require("../../../VERSION");
	responseCodes.respond(responsePlace, req, res, next, responseCodes.OK, versionInfo);
}

module.exports = router;
