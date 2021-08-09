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
const { toCamelCase, toSnakeCase } = require('./helper/strings');

const ResponseCodes = {};

ResponseCodes.template = {
	ok: { message: 'OK', status: 200 },

	// Auth
	notLoggedIn: { message: 'You are not logged in', status: 401 },

	// Fail safe
	unknown: { message: 'Unknown error occured. Please contact support.', status: 500 },

	// User document related error
	userNotFound: { message: 'User not found.', status: 404 },

	// Teamspace related error
	teamspaceNotFound: { message: 'Teamspace not found.', status: 404 },
};

Object.keys(ResponseCodes.template).forEach((key) => {
	ResponseCodes.template[key].code = toSnakeCase(key);
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
	Object.keys(ResponseCodes.template).forEach((key) => {
		const errRes = ResponseCodes.template[key];
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

ResponseCodes.codeExists = (code) => !!ResponseCodes.template[toCamelCase(code)];

ResponseCodes.createResponseCode = (errCode, message) => {
	const res = ResponseCodes.codeExists(errCode?.code) ? errCode : ResponseCodes.template.unknown;
	return message ? { ...res, message } : res;
};

module.exports = ResponseCodes;
