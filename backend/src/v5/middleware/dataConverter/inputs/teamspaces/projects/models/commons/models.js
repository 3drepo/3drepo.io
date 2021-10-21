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
const { respond } = require('../../../../../../../utils/responder');

const Models = {};

Models.validateAddModelData = async (req, res, next) => {
	const schema = Yup.object().strict(true).noUnknown().shape({
		name: Yup.string('name must be of type string')
			// eslint-disable-next-line
			.matches(/^[\x00-\x7F]{1,120}$/,
				'name cannot be longer than 120 characters and must only contain alphanumeric characters and underscores')
			.required(),
		unit: Yup.string('unit must be ft, mm, cm, dm, or m')
			.matches(/^(mm|cm|dm|m|ft)$/i,
				'unit must be ft, mm, cm, dm, or m')
			.required(),
		desc: Yup.string('desc must be of type string')
			.strict(true),
		code: Yup.string('code must be of type string')
			.matches(/^[a-zA-Z0-9]{0,50}$/,
				'code cannot be longer than 50 characters and must only contain alphanumeric characters'),
		type: Yup.string('type must be of type string')
			.required(),
		defaultView: Yup.string('defaultView must be a UUID string'),
		defaultLegend: Yup.string('defaultLegend must be a UUID string'),
		surveyPoints: Yup.array('surveyPoints must be of type array'),
		angleFromNorth: Yup.number('angleFromNorth must be of type number'),
		elevation: Yup.number('elevation must be of type number'),
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
