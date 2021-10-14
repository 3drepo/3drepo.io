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

const { createResponseCode, templates } = require('../../../../../utils/responseCodes');
const Yup = require('yup');
const { respond } = require('../../../../../utils/responder');
const { types } = require('../../..//../../utils/helper/yup');

const ModelSettings = {};

ModelSettings.validateUpdateSettingsData = async (req, res, next) => {
	const schema = Yup.object().strict(true).noUnknown().required(true).shape({
		name: types.strings.title,
		desc: types.strings.blob,
		surveyPoints: Yup.array()
			.of(
				Yup.object({
					position: types.strings.position.required(true),
					latLong: Yup.array().required(true).of(Yup.number())
						.test('test-divisibleByTwo','latLong array must be divisible by 2', function(array) {	
							return array.length % 2 === 0;
						})
				}),
			),
		angleFromNorth: Yup.number(),
		unit: types.strings.unit,
		code: Yup.string().matches(/^[a-zA-Z0-9]{0,50}$/),
		defaultView: types.id,
		defaultLegend: Yup.string(),
	}).test('at-least-one-property', "you must provide at least one setting value", value =>
	!!(value.name || value.desc || value.surveyPoints || value.angleFromNorth || value.unit 
		|| value.code || value.defaultView || value.defaultLegend)
    );

	try {
		await schema.validate(req.body);
		next();
	} catch (err) {
		respond(req, res, createResponseCode(templates.invalidArguments, err?.message));
	}
};

module.exports = ModelSettings;
