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

var C = require("./constants");
var _ = require('lodash');

var responseCodes = {
	// User error codes

	OK: {value: 0, message: "OK", status: 200},
	USER_NOT_FOUND: {value: 1, message: "User not found", status: 404},
	INCORRECT_USERNAME_OR_PASSWORD: {value: 2, message: "Incorrect username or password", status: 400},

	CAN_ONLY_CHANGE_OWN_ACCOUNT: {value:3, message: "You can only update your own account", status: 401},

	NOT_LOGGED_IN: {value:4, message: "You are not logged in", status: 401},

	AUTH_ERROR: {value:5, message: "Authentication error", status: 401},
	USERNAME_NOT_SPECIFIED: {value: 6, message: "Username not specifed", status: 422},
	PROJECT_NOT_SPECIFIED: {value: 7, message: "Project not specifed", status: 422},

	PROJECT_NOT_PUBLIC: {value: 8, message: "Not a public project", status: 401},

	NOT_AUTHORIZED: {value: 9, message: "Not Authorized", status: 401},

	RID_SID_OR_UID_NOT_SPECIFIED: {value: 10, message: "RID, SID or UID not specified", status: 422},

	GET_PUBLIC_NOT_SPECIFIED: {value: 11, message: "Get public parameter not specified", status: 422},

	OBJECT_TYPE_NOT_SUPPORTED: {value: 12, message: "Object type not supported", status: 500},

	USER_DOES_NOT_HAVE_AVATAR: {value: 13, message: "User does not have an avatar", status: 404},
	AVATAR_IS_NOT_AN_IMAGE: {value: 14, message: "Avatar is not an image", status: 500},
	AVATAR_IS_NOT_A_JPEG: {value: 15, message: "Avatar is not a JPEG", status: 500},
	FORMAT_NOT_SUPPORTED: {value: 16, message: "Format not supported for this regex", status:415},
	FUNCTION_NOT_SUPPORTED: {value: 17, message: "REST API call not supported", status:501},

	INVALID_INPUTS_TO_PASSWORD_UPDATE: {value: 18, message: "Invalid new or old password", status: 422},

	PROJECT_HISTORY_NOT_FOUND: {value: 19, message: "Project history not found", status: 404},
	PROJECT_INFO_NOT_FOUND:		{value: 20, message: "Project info not found", status: 404},

	BRANCH_NOT_FOUND:			{value: 21, message: "Branch not found", status: 404},

	ERROR_RENDERING_OBJECT:	 {value : 22, message: "Error rendering object", status: 500},

	MISSING_SCHEMA: { value: 23, message: "Trying to process request with missing schema", status: 500 },

	SETTINGS_ERROR: { value: 24, message: "Error in the settings collection", status: 500},

	OBJECT_NOT_FOUND: { value: 25, message: "Object not found", status: 404},

	ROOT_NODE_NOT_FOUND: { value: 26, message: "No root node found for revision", status: 500},

	ISSUE_NOT_FOUND: { value: 27, message: "Issue not found", status: 404},

	HEAD_REVISION_NOT_FOUND: { value: 28, message: "Head revision not found", status: 404 },

	FILE_IMPORT_PROCESS_ERR: { value: 29, message: "Failed to process file", status: 400 },
	FILE_IMPORT_INVALID_ARGS: { value: 30, message: "Failed to process file: Invalid arguments", status: 500 },
	FILE_IMPORT_UNKNOWN_ERR: { value: 31, message: "Failed to process file: Unknown error", status: 500 },
	FILE_IMPORT_UNKNOWN_CMD: { value: 32, message: "Failed to process file: Unknown command", status: 500 },
	QUEUE_CONN_ERR: { value: 33, message: "Failed to establish connection to queue", status: 404 },
	QUEUE_INTERNAL_ERR: { value: 34, message: "Failed preprocessing for queue dispatch", status: 500 },
	QUEUE_NO_CONFIG: { value: 35, message: "Server has no queue configuration", status: 404 },

	INVALID_MESH : { value: 36, message: "Mesh not valid for processing", status: 500},

	FILE_ALREADY_EXISTS : { value: 37, message: "File already exists", status: 500},
	FILE_DOESNT_EXIST : { value: 38, message: "File doesn't exist", status: 404},

	AVATAR_INVALID_IMAGE_TYPE : { value: 39, message: "Avatar does not have valid image type", status: 500},

	IMAGE_CONVERSION_FAILED : { value: 40, message: "Image conversion failed", status: 500},
	ROLE_SETTINGS_NOT_FOUND : { value: 41, message: "Role settings not found", status: 500 },


	PACKAGE_NOT_FOUND: {value: 43, message: 'Package not found', status: 404},
	BID_NOT_FOUND: {value: 44, message: 'Bid not found', status: 404},
	BID_ALREADY_ACCEPTED_OR_DECLINED: {value : 45, message: 'Bid already accepted or declined', status: 400},
	USER_ALREADY_IN_BID: {value: 46, message: 'User already has a bid created in this package', status: 400},
	BID_NOT_ACCEPTED_OR_DECLINED: {value: 47, message: 'Bid invitation is not yet accepted or is declined', status: 400},

	PACKAGE_AWARDED :{ value: 48, message: 'This package has a winner already', status: 400},
	ATTACHMENT_NOT_FOUND: {value:49, message: 'Attachment not found', status: 404},
	ATTACHMENT_FIELD_NOT_FOUND: {value:50, message: 'Attachment field not found in request body', status: 400},

	BID_SUBMIITED: { value: 51, message: 'Bid already submitted', status: 400},
	BID_NOT_UPDATEABLE: {value: 52, message: 'Bid is not updateable since it is either submitted or declined', status: 400},
	BID_NOT_SUBMIITED: { value: 53, message: 'Bid not yet submitted', status: 400},


	GROUP_NOT_FOUND: {value: 54, message: 'Group not found', status: 404},

	USER_EXISTS: { value: 55, message: 'User already exists', status: 400},
	SIGN_UP_PASSWORD_MISSING: {value: 56, message: 'Password is missing', status: 400},
	USER_EMAIL_NOT_MATCH: {	value: 57, message: "Username or email address doesn't match/ exist", status: 400},
	TOKEN_INVALID: {value: 58, message: 'Token is invalid or expired', status: 400},
	ALREADY_VERIFIED: {value: 60, message: 'Already verified', status: 400},
	USER_NOT_VERIFIED: {value: 61, message: 'Incorrect username or password', status: 400},
	INVALID_CAPTCHA_RES: {value: 62, message: 'Invalid captcha', status: 400},
	REGISTER_DISABLE: {value: 63, message: 'Sign up function is disabled', status: 400},
	PROJECT_EXIST: {value: 64, message: 'Project already exists', status: 400},
	DATABASE_EXIST: {value: 65, message: 'Database already exists', status: 400 },

	SIZE_LIMIT_PAY: {value: 66, message: 'Ran of out database space. Please pay for more space.', status: 400},
	INVALID_SUBSCRIPTION_PLAN: {value: 67, message: 'Invalid subscription plan', status: 400},


	FILE_FORMAT_NOT_SUPPORTED: { value: 68, message: "Failed to process file: Format not supported", status: 400 },

	SIZE_LIMIT: {value: 69, message: 'Single file size exceeded system limit', status: 400},
	INVALID_PROJECT_NAME: {value: 70, message: 'Invalid project name', status: 400},
	SIGN_UP_INVALID_EMAIL: {value: 71, message: 'Invalid email adress', status: 400},
	ALREADY_LOGGED_IN: {value: 72, message: "You are already logged in", status: 400},
	BLACKLISTED_PROJECT_NAME: {value: 73, message: "Project name reserved", status: 400},

	STASH_GEN_FAILED: { value: 74, message: "Failed to regenerate stash: Unknown error", status: 500 },
	FILE_IMPORT_MISSING_TEXTURES: { value: 75, message: "Failed to import file: Missing textures", status: 500 },

	ISSUE_NO_NAME: { value: 76, message: "Create issue without name", status: 400},
	ISSUE_COMMENT_INVALID_INDEX: {value: 77, message: "Invalid comment index", status: 400},
	ISSUE_COMMENT_PERMISSION_DECLINED: {value: 78, message: "Can't edit comment made by others", status: 400},
	ISSUE_COMMENT_SEALED: { value: 79, message: "Can't edit a sealed comment or a comment in closed issue", status: 400},
	ISSUE_CLOSED_ALREADY: { value: 80, message: "Issue closed already", status: 400},
	PROJECT_NOT_FOUND: { value: 81, message: "Project not found", status: 400},
	INVALID_ROLE: {value: 82, message: 'Invalid role name', status: 400},
	ALREADY_IN_ROLE: {value: 83, message: 'User already assigned with this role', status: 400},

	NOT_IN_ROLE: { value: 84, message: 'User or role not found', status: 400},
	EMAIL_EXISTS: { value: 85, message: 'Email already exists', status: 400 },
	QUEUE_NO_LISTENER: { value: 86, message: 'There is currently no worker listening to the queue, you model import is delayed', status: 400},
	COLLABORATOR_LIMIT_EXCEEDED: {value: 87, message: 'You do not have enough quota to add an extra collaborator', status: 400},

	LICENSE_NO_CHANGE: { value: 88, message: 'You must increase your number of licenses', status: 400},
	SUBSCRIPTION_NOT_FOUND: {value: 89, message: 'Subscription not found', status: 404},
	SUBSCRIPTION_ALREADY_ASSIGNED: {value: 90, message: 'Subscription already assigned to someone else', status: 400},
	USER_ALREADY_ASSIGNED: {value: 91, message: 'This user is already in another subscription', status: 400},
	USER_NOT_ASSIGNED_WITH_LICENSE: {value: 92, message: 'This user is not assigned with license', status: 400},
	SUBSCRIPTION_NOT_ASSIGNED: {value: 93, message: 'This subscription is not assigned to any user', status: 400},
	USER_IN_COLLABORATOR_LIST: {value: 94, message: 'This user is currently in collaborator list of a project', status: 400 },
	SUBSCRIPTION_CANNOT_REMOVE_SELF: {value: 95, message: 'You cannot remove yourself', status: 400 },

	PAYMENT_TOKEN_ERROR: { value: 96, message: 'Payment token is invalid', status: 400}, 
	EXECUTE_AGREEMENT_ERROR: { value: 97, message: 'Failed to get payment from PayPal', status: 400 },

	LICENCE_REMOVAL_SPACE_EXCEEDED: { value: 98, message: 'Your current quota usage exceeds the requested change.', status: 400 },
	REMOVE_ASSIGNED_LICENCE: { value: 99, message: 'Some of the licences are assigned and can\'t be removed', status: 400 },

	BILLING_NOT_FOUND: { value: 100, message: 'Billing not found', status: 404 },
	PAYPAL_ERROR: { value: 101, status: 400 },

	PROJECT_NO_UNIT: { value: 103, status: 400, message: 'Unit is not specified'},

	TREE_NOT_FOUND: {value: 104, message: 'Model fulltree not found in stash', status: 404},
	REPOERR_FED_GEN_FAIL: {value: 105, message: 'Failed to create federation', status: 400},

	INVALID_VAT: {value: 106, status: 400, message: 'Invalid VAT number'},
	NO_CONTACT_EMAIL: { value: 107, status: 400, message: 'contact.email is not defined in config'},

	FED_MODEL_IN_OTHER_DB: { value: 110, message: 'Models of federation must reside in the same account', status: 400},
	FED_MODEL_IS_A_FED: {value: 111, message: 'Models of federation cannot be a federation', status:400},
	PROJECT_IS_NOT_A_FED: {value: 112, message: 'Project is not a federation', status:400},


	MONGOOSE_VALIDATION_ERROR: function(err){
		return {
			value: 900,
			status: 400 ,
			message: err.message || 'Validation failed'
		};
	},

	DB_ERROR: function(mongoErr) {
		"use strict";

		if(mongoErr.code === 11000){
			return this.USER_EXISTS;
		} else if (mongoErr.code === 18) {
			return this.INCORRECT_USERNAME_OR_PASSWORD;
		}
		//other error
		return {
			value: 1000,
			message: mongoErr.message,
			dbErr: mongoErr,
			status: 500
		};
	},

	EXTERNAL_ERROR: function(message) {
		"use strict";

		return {
			value: 2000,
			message: JSON.stringify(message),
			status: 500
		};
	},

	VALIDATION_ERROR: function(validErrors) {
		"use strict";

		return {
			value: 3000,
			message: JSON.stringify(validErrors),
			status: 422
		};
	},

	PROCESS_ERROR: function(message) {
		 "use strict";

		 if (typeof message !== 'string' && typeof message.message !== 'string'){
		 	message = JSON.stringify(message);
		 } else if (typeof message !== 'string' && typeof message.message === 'string'){
		 	message = message.message;
		 }

		 return {
			value: 4000,
			message: 'Internal Error',
			status: 500
		};
	}
};


var valid_values = [900, 1000, 2000, 3000, 4000];

Object.keys(responseCodes).forEach(key => {
	if(typeof responseCodes[key].value !== 'undefined'){
		valid_values.push(responseCodes[key].value);
	}
});


var mimeTypes = {
	"src"  : "text/plain",
	"gltf" : "application/json",
	"bin"  : "text/plain",
	"x3d"  : "application/xml",
	"json" : "application/json",
	"png"  : "image/png",
	"jpg"  : "image/jpg"
};

responseCodes.respond = function(place, req, res, next, resCode, extraInfo)
{
	"use strict";


	if (!resCode || valid_values.indexOf(resCode.value) === -1) {

		//throw Error("Unspecified error code [" + JSON.stringify(resCode) + " @ " + place + "]");
		if(resCode && resCode.stack){
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

		// if (!extraInfo) {
		// 	responseObject = {};
		// } else {
		// 	responseObject = extraInfo;
		// }

		// responseObject.place   = place;
		// responseObject.status  = resCode.status;
		// responseObject.message = resCode.message;

		length = JSON.stringify(responseObject).length;
		req[C.REQ_REPO].logger.logError(JSON.stringify(responseObject),  { httpCode: resCode.status, contentLength: length });

		res.status(resCode.status).send(responseObject);

	} else {

		if(Buffer.isBuffer(extraInfo)){

			res.status(resCode.status);

			var contentType = mimeTypes[req.params.format];

			if (contentType)
			{
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

			length = typeof extraInfo === 'string' ? extraInfo.length : JSON.stringify(extraInfo).length;
			res.status(resCode.status).send(extraInfo);
		}

		// log bandwidth and http status code
		req[C.REQ_REPO].logger.logInfo('Responded with ' + resCode.status, { httpCode: resCode.status, contentLength: length });
	}

	//next();
};

// On error respond with error code and errInfo (containing helpful information)
// On OK, response with OK status and extraInfo
responseCodes.onError = function(place, req, res, next, err, extraInfo, errInfo) {
	"use strict";

	if(!errInfo) {
		errInfo = {};
	}

	if(err.value) {
		responseCodes.respond(place, req, res, next, err, errInfo);
	} else {
		responseCodes.respond(place, req, res, next, responseCodes.OK, extraInfo);
	}
};

module.exports = Object.freeze(responseCodes);

