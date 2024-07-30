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

const { createResponseCode, templates } = require('../../../../../../utils/responseCodes');
const Yup = require('yup');
const YupHelper = require('../../../../../../utils/helper/yup');
const { respond } = require('../../../../../../utils/responder');

const Calibrations = {};

Calibrations.validateNewCalibrationData = async (req, res, next) => {
	const schema = Yup.object({
		horizontal: Yup.object({
			model: Yup.array().of(YupHelper.types.position).length(2),
			drawing: Yup.array().of(YupHelper.types.position2d).length(2),
		}).required(),
		verticalRange: YupHelper.types.position2d.required(),
		units: YupHelper.types.strings.unit.required(),
	}).required().noUnknown();

	try {
		req.body = await schema.validate(req.body);
		await next();
	} catch (err) {
		respond(req, res, createResponseCode(templates.invalidArguments, err?.message));
	}
};

module.exports = Calibrations;
