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

const { createResponseCode, templates } = require('../utils/responseCodes');
const { respond } = require('../utils/responder');

const Common = {};

Common.validateMany = (validators) => {
	const validateAll = async (req, res, next, current = 0) => {
		if (validators.length > current) {
			await validators[current](req, res, () => validateAll(req, res, next, current + 1));
		} else {
			next();
		}
	};
	return validateAll;
};

Common.routeDecommissioned = (verb, newEndpoint) => (req, res) => {
	let response = templates.endpointDecommissioned;

	if (verb && newEndpoint) {
		const errorMessage = `This endpoint is no longer available. Please use ${verb} ${newEndpoint} instead.`;
		response = createResponseCode(templates.endpointDecommissioned, errorMessage);
	}

	respond(req, res, response);
};

module.exports = Common;
