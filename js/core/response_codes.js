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
var log_iface = require('./logger.js');
var logger = log_iface.logger;

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

	MISSING_SCHEMA: { value: 23, message: 'Trying to process request with missing schema', status: 500 },

	SETTINGS_ERROR: { value: 24, message: 'Error in the settings collection', status: 500},

	OBJECT_NOT_FOUND: { value: 25, message: 'Object not found', status: 404},

	ROOT_NODE_NOT_FOUND: { value: 26, message: 'No root node found for revision', status: 500},

	DB_ERROR: function(mongoErr) {
		return {
			value: 1000,
			message: mongoErr.toString(), //'[' + mongoErr["code"] + '] @ ' + mongoErr["err"],
			status: 500
		};
	},

	EXTERNAL_ERROR: function(message) {
		return {
			value: 2000,
			message: JSON.stringify(message),
			status: 500
		};
	},

	VALIDATION_ERROR: function(validErrors) {
		return {
			value: 3000,
			message: JSON.stringify(validErrors),
			status: 422
		};
	},

};

var valid_values = [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 1000, 2000, 3000];

responseCodes.respond = function(place, resCode, res, extraInfo)
{
	if (valid_values.indexOf(resCode.value) == -1) {
		throw Error("Unspecified error code [VALUE: " + resCode.value + "]");
	}

	if (resCode.value) // Prepare error response
	{
		if (!extraInfo)
			var responseObject = {};
		else
			var responseObject = extraInfo;

		responseObject.place   = place;
		responseObject.status  = resCode.status;
		responseObject.message = resCode.message;

		if (resCode.value)
			logger.log('error', JSON.stringify(responseObject));

		res.status(resCode.status).send(JSON.stringify(responseObject));
	} else {
		if(Buffer.isBuffer(extraInfo))
		{
			res.status(resCode.status);
			res.write(extraInfo, 'binary');
			res.end();
		} else {
			res.status(resCode.status).send(extraInfo);
		}
	}
}

// On error respond with error code and errInfo (containing helpful information)
// On OK, response with OK status and extraInfo
responseCodes.onError = function(place, err, res, extraInfo, errInfo)
{
	if(!errInfo)
		errInfo = {};

	if(err.value)
		responseCodes.respond(place, err, res, errInfo);
	else
		responseCodes.respond(place, responseCodes.OK, res, extraInfo);
}

module.exports = Object.freeze(responseCodes);

