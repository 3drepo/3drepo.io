/**
 *  Copyright (C) 2021 3D Repo Ltd
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
const { toCamelCase, toConstantCase } = require('./helper/strings');
const { logfile } = require('./config');
const { logger } = require('./logger');

const ResponseCodes = {};

ResponseCodes.templates = {
	ok: { message: 'OK', status: 200 },

	// Auth
	notLoggedIn: { message: 'You are not logged in.', status: 401 },
	alreadyLoggedIn: { message: 'You are already logged in.', status: 401 },
	notAuthorized: { message: 'You do not have sufficient access rights for this action.', status: 401 },
	licenceExpired: { message: 'Licence expired.', status: 401 },
	tooManyLoginAttempts: { message: 'Too many unsuccessful login attempts! Account locked.', status: 400 },
	userNotVerified: { message: 'Account not yet verified. Please check your email.', status: 400 },
	incorrectUsernameOrPassword: { message: 'Incorrect username or password.', status: 400 },
	incorrectPassword: { message: 'Incorrect password.', status: 400 },
	ssoNotAvailable: { message: 'Single sign on provider not available.', status: 500 },
	nonSsoUser: { message: 'Single sign on is not enabled for this user.', status: 400 },
	ssoUser: { message: 'Single sign on is already enabled for this user.', status: 400 },

	// Fail safe
	unknown: { message: 'Unknown error occured. Please contact support.', status: 500 },

	// User document related error
	userNotFound: { message: 'User not found.', status: 404 },

	// Teamspace related error
	teamspaceNotFound: { message: 'Teamspace not found.', status: 404 },
	ssoRestricted: { message: 'This teamspace only accepts Single Signed On users. Please link your account with an authority.', status: 401 },
	domainRestricted: { message: 'Your email does not belong in a domain that is accepted by this teamspace. Please contact your teamspace administrator.', status: 401 },
	addOnModuleNotEnabled: { message: 'This add on module is not enabled in this teamspace.', status: 400 },

	// Project related error
	projectNotFound: { message: 'Project not found.', status: 404 },

	// Model related error
	modelNotFound: { message: 'Model not found.', status: 404 },

	// Federation related error
	federationNotFound: { message: 'Federation not found.', status: 404 },

	// Container related error
	containerNotFound: { message: 'Container not found.', status: 404 },
	containerIsSubModel: { message: 'Container is a submodel.', status: 400 },
	revisionNotFound: { message: 'Revision not found.', status: 404 },
	groupNotFound: { message: 'Group not found.', status: 404 },
	metadataNotFound: { message: 'Metadata not found.', status: 404 },

	// Custom ticket related error
	templateNotFound: { message: 'Template not found.', status: 404 },
	ticketNotFound: { message: 'Ticket not found.', status: 404 },
	commentNotFound: { message: 'Comment not found.', status: 404 },

	// File upload related error
	unsupportedFileFormat: { message: 'The file format is not supported.', status: 400 },
	maxSizeExceeded: { message: 'The file is bigger than the maximum size allowed.', status: 400 },
	quotaLimitExceeded: { message: 'Insufficient quota.', status: 401 },

	// File download related error
	fileNotFound: { message: 'No file can be downloaded.', status: 404 },

	// View related error
	viewNotFound: { message: 'View not found.', status: 404 },

	// Image related error
	thumbnailNotFound: { message: 'Thumbnail not available.', status: 404 },

	// Legend related error
	legendNotFound: { message: 'Legend not found.', status: 404 },

	// Invalid Arguments
	invalidArguments: { message: 'The arguments provided are not valid.', status: 400 },

	// Queue related
	queueConnectionError: { message: 'There was a problem connecting to the queue. Please contact support.', status: 500 },
	queueInsertionFailed: { message: 'Failed to insert an item into the queue. Please contact support.', status: 500 },
};

Object.keys(ResponseCodes.templates).forEach((key) => {
	ResponseCodes.templates[key].code = toConstantCase(key);
	// value = code (v4 compatibility)
	ResponseCodes.templates[key].value = ResponseCodes.templates[key].code;
});

ResponseCodes.getSwaggerComponents = () => {
	const genSchema = ({ code, message, status }) => ({
		type: 'object',
		properties: {
			code: {
				type: 'string',
				description: '3D Repo error code',
				example: code,
			},
			message: {
				type: 'string',
				description: 'A descriptive reason for the error',
				example: message,
			},
			place: {
				type: 'string',
				description: 'Endpoint this error came from',
				example: 'GET /v5/teamspaces',

			},
			status: {
				type: 'integer',
				format: 'int32',
				description: 'HTTP status code',
				example: status,
			},
		},
	});

	const responses = {};
	Object.keys(ResponseCodes.templates).forEach((key) => {
		const errRes = ResponseCodes.templates[key];
		responses[key] = {
			description: errRes.message,
			content: {
				'application/json': {
					schema: genSchema(errRes),
				},
			},
		};
	});

	return responses;
};

ResponseCodes.codeExists = (code) => !!ResponseCodes.templates[toCamelCase(code)];

ResponseCodes.createResponseCode = (errCode, message) => {
	const codeExists = ResponseCodes.codeExists(errCode?.code);
	if (!codeExists) {
		const isError = errCode instanceof Error;
		if (isError && !logfile.silent) {
			// eslint-disable-next-line
			console.error(errCode)
		}

		logger.logError('Unrecognised error code', isError ? JSON.stringify(errCode, ['message', 'arguments', 'type', 'name', 'stack']) : errCode);
	}
	const res = codeExists ? errCode : ResponseCodes.templates.unknown;
	return message ? { ...res, message } : res;
};

module.exports = ResponseCodes;
