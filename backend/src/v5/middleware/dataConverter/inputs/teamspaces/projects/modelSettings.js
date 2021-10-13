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

const ModelSettings = {};

const validateSurveyPoints = (surveyPoints) => {
	if (surveyPoints) {
		for (let i = 0; i < surveyPoints.length; i++) {
			if (surveyPoints[i].position.length % 3 !== 0) {
				throw { message: `position array of surveyPoints[${i}] must be divisible by 3` };
			}

			if (surveyPoints[i].latLong.length % 2 !== 0) {
				throw { message: `latLong array of surveyPoints[${i}] must be divisible by 2` };
			}
		}
	}
};

ModelSettings.validateUpdateSettingsData = async (req, res, next) => {
	const schema = Yup.object().strict(true).noUnknown().required(true).shape({
		name: Yup.string('name must be of type string').max(120).strict(true),
		desc: Yup.string('desc must be of type string').max(660).strict(true),
		surveyPoints: Yup.array('surveyPoints must be of type array')
			.of(
				Yup.object({
					position: Yup.array('position must be of type array').required()
						.of(
							Yup.number('position array items must be of type number').strict(true),
						),
					latLong: Yup.array('latLong must be of type array').required()
						.of(
							Yup.number('latLong array items must be of type number').strict(true),
						),
				}).strict(true),
			).strict(true),
		angleFromNorth: Yup.number('angleFromNorth must be of type number').strict(true),
		unit: Yup.string('unit must be of type string').oneOf(['mm', 'cm', 'dm', 'm', 'ft']).strict(true),
		code: Yup.string('code must be of type string').matches(/^[a-zA-Z0-9]{0,50}$/).strict(true),
		defaultView: Yup.string('defaultView must be of type string').nullable(true).strict(true),
		defaultLegend: Yup.string('defaultLegend must be of type string').strict(true),
	}).test('at-least-one-property', "you must provide at least one setting value", value =>
	!!(value.name || value.desc || value.surveyPoints || value.angleFromNorth || value.unit 
		|| value.code || value.defaultView || value.defaultLegend)
    );

	try {
		await schema.validate(req.body);
		validateSurveyPoints(req.body.surveyPoints);
		next();
	} catch (err) {
		respond(req, res, createResponseCode(templates.invalidArguments, err?.message));
	}
};

module.exports = ModelSettings;
