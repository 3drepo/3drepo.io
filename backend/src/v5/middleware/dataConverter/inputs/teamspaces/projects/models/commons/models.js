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

const { createResponseCode, templates } = require('../../../../../../../utils/responseCodes');
const Yup = require('yup');
const YupHelper = require('../../../../../../../utils/helper/yup');
const { respond } = require('../../../../../../../utils/responder');

const Models = {};

Models.validateAddModelData = async (req, res, next) => {
	const schema = Yup.object().strict(true).noUnknown().shape({
		name: Yup.string('name must be of type string')
			// eslint-disable-next-line
			.matches(/^[\x00-\x7F]{1,120}$/,
				'name cannot be longer than 120 characters and must only contain alphanumeric characters and underscores')
			.required(),
		unit: YupHelper.types.strings.unit.required(),
		desc: YupHelper.types.strings.blob,
		code: YupHelper.types.strings.code,
		type: Yup.string().required(),
		surveyPoints: YupHelper.types.sureyPoints,
		angleFromNorth: YupHelper.types.degrees,
		elevation: Yup.number(),
	});

	try {
		await schema.validate(req.body);

		req.body.properties = { unit: req.body.unit.toLowerCase() };
		delete req.body.unit;

		if (req.body.code) {
			req.body.properties.code = req.body.code;
			delete req.body.code;
		}

		next();
	} catch (err) {
		respond(req, res, createResponseCode(templates.invalidArguments, err?.message));
	}
};

module.exports = Models;
