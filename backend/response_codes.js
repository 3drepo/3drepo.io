/**
 *	Copyright (C) 2014 3D Repo Ltd
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
(() => {
	"use strict";

	const C = require("./constants");
	const _ = require("lodash");
	const config = require("./config");
	const systemLogger = require("./logger.js").systemLogger;

	/**
	 * List of response and error codes
	 * @type {Object}
	 */

	let codesMap = {
		OK: { message: "OK", status: 200 },
		USER_NOT_FOUND: { message: "User not found", status: 404 },
		INCORRECT_USERNAME_OR_PASSWORD: { message: "Incorrect username or password", status: 400 },

		CAN_ONLY_CHANGE_OWN_ACCOUNT: { message: "You can only update your own account", status: 401 },

		NOT_LOGGED_IN: { message: "You are not logged in", status: 401 },

		AUTH_ERROR: { message: "Authentication error", status: 401 },
		USERNAME_NOT_SPECIFIED: { message: "Username not specifed", status: 422 },
		PROJECT_NOT_SPECIFIED: { message: "Project not specifed", status: 422 },

		PROJECT_NOT_PUBLIC: { message: "Not a public project", status: 401 },

		NOT_AUTHORIZED: { message: "Not Authorized", status: 401 },

		RID_SID_OR_UID_NOT_SPECIFIED: { message: "RID, SID or UID not specified", status: 422 },

		GET_PUBLIC_NOT_SPECIFIED: { message: "Get public parameter not specified", status: 422 },

		OBJECT_TYPE_NOT_SUPPORTED: { message: "Object type not supported", status: 500 },

		USER_DOES_NOT_HAVE_AVATAR: { message: "User does not have an avatar", status: 404 },
		AVATAR_IS_NOT_AN_IMAGE: { message: "Avatar is not an image", status: 500 },
		AVATAR_IS_NOT_A_JPEG: { message: "Avatar is not a JPEG", status: 500 },
		FORMAT_NOT_SUPPORTED: { message: "Format not supported for this regex", status: 415 },
		FUNCTION_NOT_SUPPORTED: { message: "REST API call not supported", status: 501 },

		INVALID_INPUTS_TO_PASSWORD_UPDATE: { message: "Invalid new or old password", status: 422 },

		PROJECT_HISTORY_NOT_FOUND: { message: "Project history not found", status: 404 },
		PROJECT_INFO_NOT_FOUND: { message: "Project info not found", status: 404 },

		BRANCH_NOT_FOUND: { message: "Branch not found", status: 404 },

		ERROR_RENDERING_OBJECT: { message: "Error rendering object", status: 500 },

		MISSING_SCHEMA: { message: "Trying to process request with missing schema", status: 500 },

		SETTINGS_ERROR: { message: "Error in the settings collection", status: 500 },

		OBJECT_NOT_FOUND: { message: "Object not found", status: 404 },

		ROOT_NODE_NOT_FOUND: { message: "No root node found for revision", status: 500 },

		ISSUE_NOT_FOUND: { message: "Issue not found", status: 404 },

		HEAD_REVISION_NOT_FOUND: { message: "Head revision not found", status: 404 },

		FILE_IMPORT_PROCESS_ERR: { message: "Failed to process file", status: 400 },
		FILE_IMPORT_INVALID_ARGS: { message: "Invalid arguments", status: 500 },
		FILE_IMPORT_UNKNOWN_ERR: { message: "Unknown error", status: 500 },
		FILE_IMPORT_UNKNOWN_CMD: { message: "Unknown command", status: 500 },
		QUEUE_CONN_ERR: { message: "Failed to establish connection to queue", status: 404 },
		QUEUE_INTERNAL_ERR: { message: "Failed preprocessing for queue dispatch", status: 500 },
		QUEUE_NO_CONFIG: { message: "Server has no queue configuration", status: 404 },

		INVALID_MESH: { message: "Mesh not valid for processing", status: 500 },

		FILE_ALREADY_EXISTS: { message: "File already exists", status: 500 },
		FILE_DOESNT_EXIST: { message: "File doesn't exist", status: 404 },

		AVATAR_INVALID_IMAGE_TYPE: { message: "Avatar does not have valid image type", status: 500 },

		IMAGE_CONVERSION_FAILED: { message: "Image conversion failed", status: 500 },
		ROLE_SETTINGS_NOT_FOUND: { message: "Role settings not found", status: 500 },

		GROUP_NOT_FOUND: { message: "Group not found", status: 404 },

		USER_EXISTS: { message: "User already exists", status: 400 },
		SIGN_UP_PASSWORD_MISSING: { message: "Password is missing", status: 400 },
		USER_EMAIL_NOT_MATCH: { message: "Incorrect username or email", status: 400 },
		TOKEN_INVALID: { message: "Token is invalid or expired", status: 400 },
		ALREADY_VERIFIED: { message: "Already verified", status: 400 },
		USER_NOT_VERIFIED: { message: "Incorrect username or password", status: 400 },
		INVALID_CAPTCHA_RES: { message: "Invalid captcha", status: 400 },
		REGISTER_DISABLE: { message: "Sign up function is disabled", status: 400 },
		PROJECT_EXIST: { message: "Project already exists", status: 400 },
		DATABASE_EXIST: { message: "Database already exists", status: 400 },

		SIZE_LIMIT_PAY: { message: "Ran of out database space. Please pay for more space.", status: 400 },
		INVALID_SUBSCRIPTION_PLAN: { message: "Invalid subscription plan", status: 400 },

		FILE_FORMAT_NOT_SUPPORTED: { message: "Format not supported", status: 400 },

		SIZE_LIMIT: { message: "Single file size exceeded system limit", status: 400 },
		INVALID_PROJECT_NAME: { message: "Invalid project name", status: 400 },
		SIGN_UP_INVALID_EMAIL: { message: "Invalid email address", status: 400 },
		ALREADY_LOGGED_IN: { message: "You are already logged in", status: 400 },
		BLACKLISTED_PROJECT_NAME: { message: "Project name reserved", status: 400 },

		STASH_GEN_FAILED: { message: "Failed to regenerate stash: Unknown error", status: 500 },
		STASH_NOT_FOUND: { message: "Stash not found" , status: 500},
		
		FILE_IMPORT_MISSING_TEXTURES: { message: "Imported but missing textures", status: 500 },
		FILE_IMPORT_MISSING_NODES: { message: "Imported but missing nodes (corrupted file?)", status: 500 },

		ISSUE_NO_NAME: { message: "Create issue without name", status: 400 },
		ISSUE_COMMENT_INVALID_INDEX: { message: "Invalid comment index", status: 400 },
		ISSUE_COMMENT_PERMISSION_DECLINED: { message: "Can't edit comment made by others", status: 400 },
		ISSUE_COMMENT_SEALED: { message: "Can't edit a sealed comment or a comment in closed issue", status: 400 },
		ISSUE_CLOSED_ALREADY: { message: "Issue closed already", status: 400 },
		PROJECT_NOT_FOUND: { message: "Project not found", status: 404 },
		INVALID_ROLE: { message: "Invalid role name", status: 400 },
		ALREADY_IN_ROLE: { message: "User already assigned with this role", status: 400 },

		NOT_IN_ROLE: { message: "User or role not found", status: 400 },
		EMAIL_EXISTS: { message: "Email already exists", status: 400 },
		QUEUE_NO_LISTENER: { message: "There is currently no worker listening to the queue, you model import is delayed", status: 400 },
		COLLABORATOR_LIMIT_EXCEEDED: { message: "You do not have enough quota to add an extra collaborator", status: 400 },

		LICENSE_NO_CHANGE: { message: "You must increase your number of licenses", status: 400 },
		SUBSCRIPTION_NOT_FOUND: { message: "Subscription not found", status: 404 },
		SUBSCRIPTION_ALREADY_ASSIGNED: { message: "Subscription already assigned to someone else", status: 400 },
		USER_ALREADY_ASSIGNED: { message: "This user is already in another subscription", status: 400 },
		USER_NOT_ASSIGNED_WITH_LICENSE: { message: "This user is not assigned with license", status: 400 },
		SUBSCRIPTION_NOT_ASSIGNED: { message: "This subscription is not assigned to any user", status: 400 },
		USER_IN_COLLABORATOR_LIST: { message: "This user is currently in collaborator list of a project", status: 400 },
		SUBSCRIPTION_CANNOT_REMOVE_SELF: { message: "You cannot remove yourself", status: 400 },

		PAYMENT_TOKEN_ERROR: { message: "Payment token is invalid", status: 400 },
		EXECUTE_AGREEMENT_ERROR: { message: "Failed to get payment from PayPal", status: 400 },

		LICENCE_REMOVAL_SPACE_EXCEEDED: { message: "Your current quota usage exceeds the requested change.", status: 400 },
		REMOVE_ASSIGNED_LICENCE: { message: "Some of the licences are assigned and can\"t be removed", status: 400 },

		BILLING_NOT_FOUND: { message: "Billing not found", status: 404 },
		PAYPAL_ERROR: { status: 400 },
		NO_FILE_FOUND: { message: "No file can be downloaded", status: 404 },

		PROJECT_NO_UNIT: { status: 400, message: "Unit is not specified" },

		TREE_NOT_FOUND: { message: "Model fulltree not found in stash", status: 404 },
		REPOERR_FED_GEN_FAIL: { message: "Failed to create federation", status: 400 },

		INVALID_VAT: { status: 400, message: "Invalid VAT number" },
		NO_CONTACT_EMAIL: { status: 400, message: "contact.email is not defined in config" },

		DUPLICATE_TAG: { status: 400, message: "Revision name already exists" },
		INVALID_TAG_NAME: { value: 109, status: 400, message: "Invalid revision name" },

		FED_MODEL_IN_OTHER_DB: { message: "Models of federation must reside in the same account", status: 400 },
		FED_MODEL_IS_A_FED: { message: "Models of federation cannot be a federation", status: 400 },
		PROJECT_IS_NOT_A_FED: { message: "Project is not a federation", status: 400 },

		AVATAR_SIZE_LIMIT: { status: 400, message: `Avatar image cannot be larger than ${config.avatarSizeLimit / 1024 / 1024 } MB` },
		INVALID_USERNAME: { message: "Invalid username", status: 400 },
		FILE_NO_EXT: { message: "Filename must have extension", status: 400 },

		SCREENSHOT_NOT_FOUND: { message: "Screenshot not found", status: 404 },
		ISSUE_INVALID_STATUS: { message: "Invalid issue status", status: 400 },
		ISSUE_INVALID_PRIORITY: { message: "Invalid issue priority", status: 400 },
		ISSUE_SAME_STATUS: { message: "New status is the same as current status", status: 400 },
		ISSUE_SAME_PRIORITY: { message: "New priority is the same as current priority", status: 400 },
		MESH_NOT_FOUND: { message: "Mesh not found", status: 400 },
		GROUP_ID_NOT_FOUND_IN_MESH: { message: "Group ID not found in mesh", status: 400 },

		PROJECT_NAME_TOO_LONG: { message: "Project name cannot be longer than 60 characters", status: 400 },
		ISSUE_SYSTEM_COMMENT: { message: "Can't edit or remove system comment", status: 400 },
		ISSUE_UPDATE_PERMISSION_DECLINED: { message: "No permission to update issue", status: 400 },

		INVALID_PROJECT_CODE: { message: "Project code must contain only alphabets and numerical digits", status: 400 },
		ISSUE_DUPLICATE_TOPIC_TYPE: { message: "Two or more topic types given are the same", status: 400 },

		MESH_STASH_NOT_FOUND: { message: "Message stash not found", status: 404},
		INVALID_ROLE_TEMPLATE: { message: "Role template requested doesn't exist", status: 500 },
		MISSING_INIT_INVOICE: { message: "Missing init invoice", status: 500},
		MISSING_LAST_INVOICE: { message: "Missing last invoice", status: 500},
		NEW_OLD_PASSWORD_SAME: { message: "New password can't be the same as old password", status: 400},
		TEXTURE_NOT_FOUND: { message: "Texture not found", status: 404 },
		METADATA_NOT_FOUND: { message: "Metadata not found", status: 404 },

		JOB_NOT_FOUND:{ message: 'Job not found', status: 404},
		DUP_JOB: {message: 'Duplicate job id', status: 400},
		JOB_ASSIGNED: {message: 'Cannot remove assigned job', status: 400},
		DUP_PERM_TEMPLATE: {message: 'Duplicate template ID', status: 400},
		PERM_NOT_FOUND: {message: 'Permission template not found', status: 404},
		INVALID_PERM: {message: 'Invalid permission', status: 400}
	};


	let valueCounter = 0;
	let valid_values = [900, 1000, 2000, 3000, 4000];

	Object.keys(codesMap)
		.forEach(key => {
			codesMap[key].code = key;
			codesMap[key].value = valueCounter++;
			valid_values.push(codesMap[key].value);
			
		});

	let responseCodes = Object.assign({

		codesMap: codesMap,

		/**
		 * Wrapper for mongoose errors
		 * 
		 * @param {Object} err
		 * @returns
		 */
		MONGOOSE_VALIDATION_ERROR: function (err) {
			return {
				value: 900,
				status: 400,
				message: err.message || "Validation failed"
			};
		},

		/**
		 * Wrapper for Mongo errors
		 * 
		 * @param {Object} mongoErr
		 * @returns
		 */
		DB_ERROR: function (mongoErr) {

			let errorCode = mongoErr.code;
			
			//replica error format
			if(mongoErr.errors && mongoErr.errors[0] && mongoErr.errors[0].err){
				errorCode = mongoErr.errors[0].err.code;
			}

			if (errorCode === 11000) {
				return this.USER_EXISTS;
			} else if (errorCode === 18) {
				return this.INCORRECT_USERNAME_OR_PASSWORD;
			}
			//other error
			systemLogger.logError(mongoErr);
			return {
				value: 1000,
				message: "System error. Please try again later.",
				dbErr: mongoErr,
				status: 500
			};
		},

		/**
		 * Wrapper for other external library errors
		 * 
		 * @param {Object} message
		 * @returns
		 */
		EXTERNAL_ERROR: function (message) {
			return {
				value: 2000,
				message: "System error. Please try again later.",
				system_message: JSON.stringify(message),
				status: 500
			};
		},

		/**
		 * Wrapper for processes that run
		 * 
		 * @param {Object} message
		 * @returns
		 */
		PROCESS_ERROR: function (message) {
			if (typeof message !== "string" && typeof message.message !== "string") {
				message = JSON.stringify(message);
			} else if (typeof message !== "string" && typeof message.message === "string") {
				message = message.message;
			}

			return {
				value: 4000,
				message: "Internal Error",
				status: 500
			};
		}
	}, codesMap);

	const mimeTypes = {
		"src": "text/plain",
		"gltf": "application/json",
		"bin": "text/plain",
		"x3d": "application/xml",
		"json": "application/json",
		"png": "image/png",
		"jpg": "image/jpg"
	};

	/**
	 * 
	 * 
	 * @param {any} place
	 * @param {any} req
	 * @param {any} res
	 * @param {any} next
	 * @param {any} resCode
	 * @param {any} extraInfo
	 * @param {any} format
	 */
	responseCodes.respond = function (place, req, res, next, resCode, extraInfo, format) {
		
		if (!resCode || valid_values.indexOf(resCode.value) === -1) {
			if (resCode && resCode.stack) {
				req[C.REQ_REPO].logger.logError(resCode.stack);
			} else if (resCode && resCode.message) {
				req[C.REQ_REPO].logger.logError(resCode.message);
			} else {
				req[C.REQ_REPO].logger.logError(JSON.stringify(resCode));
			}

			resCode = responseCodes.PROCESS_ERROR(resCode);

		}

		let length;
		if (resCode.value) // Prepare error response
		{
			let responseObject = _.extend({}, extraInfo, {
				place: place,
				status: resCode.status,
				message: resCode.message,
				value: resCode.value
			});

			length = JSON.stringify(responseObject)
				.length;
			req[C.REQ_REPO].logger.logError(JSON.stringify(responseObject), { httpCode: resCode.status, contentLength: length });

			res.status(resCode.status)
				.send(responseObject);

		} else {

			if (Buffer.isBuffer(extraInfo)) {
				res.status(resCode.status);

				var contentType = mimeTypes[format || req.params.format];

				if (contentType) {
					res.setHeader("Content-Type", contentType);
				} else {
					// Force compression on everything else
					res.setHeader("Content-Type", "application/json");
				}

				//res.setHeader("Content-Length", extraInfo.length);
				length = extraInfo.length;

				res.write(extraInfo, "binary");
				res.flush();
				res.end();

			} else {

				length = typeof extraInfo === "string" ? extraInfo.length : JSON.stringify(extraInfo)
					.length;
				res.status(resCode.status)
					.send(extraInfo);
			}

			// log bandwidth and http status code
			req[C.REQ_REPO].logger.logInfo("Responded with " + resCode.status, { httpCode: resCode.status, contentLength: length });
		}

		//next();
	};

	// On error respond with error code and errInfo (containing helpful information)
	// On OK, response with OK status and extraInfo
	/**
	 * 
	 * 
	 * @param {any} place
	 * @param {any} req
	 * @param {any} res
	 * @param {any} next
	 * @param {any} err
	 * @param {any} extraInfo
	 * @param {any} errInfo
	 */
	responseCodes.onError = function (place, req, res, next, err, extraInfo, errInfo) {
		if (!errInfo) {
			errInfo = {};
		}

		if (err.value) {
			responseCodes.respond(place, req, res, next, err, errInfo);
		} else {
			responseCodes.respond(place, req, res, next, responseCodes.OK, extraInfo);
		}
	};

	module.exports = Object.freeze(responseCodes);

})();
