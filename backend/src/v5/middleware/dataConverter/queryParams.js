/**
 *  Copyright (C) 2026 3D Repo Ltd
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

const { createResponseCode, templates } = require('../../utils/responseCodes');
const { respond } = require('../../utils/responder');
const yup = require('yup');

const QueryParams = {};

const mapsCoordinatesSchema = yup.object({
	zoomLevel: yup.number().integer().min(0).required(),
	x: yup.number().integer().min(0).required(),
	y: yup.number().integer().min(0).required(),
}).required();

QueryParams.validateMapsCoordinates = async (req, res, next) => {
	try {
		req.query = await mapsCoordinatesSchema.validate(req.query);
		await next();
	} catch (err) {
		respond(req, res, createResponseCode(templates.invalidArguments, err.message));
	}
};

module.exports = QueryParams;
