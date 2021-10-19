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
const { types } = require('../../../../../../../utils/helper/yup');
const { stringToUUID } = require('../../../../../../../utils/helper/uuids')

const ModelSettings = {};

ModelSettings.validateUpdateSettingsData = async (req, res, next) => {
	const schema = Yup.object().shape({
		name: types.strings.title,
		desc: types.strings.blob,
		surveyPoints: Yup.array()
			.of(
				Yup.object().shape({
					position: types.position.required(),
					latLong: Yup.array().of(Yup.number()).length(2).required(),						
				}),
			),
		angleFromNorth: Yup.number().min(0).max(360),
		type: Yup.string(),
		unit: types.strings.unit,
		code: Yup.string().matches(/^[a-zA-Z0-9]{0,50}$/),
		defaultView: types.id.nullable(),
		defaultLegend: types.id,
	}).strict(true).noUnknown()
		.required()
		.test('at-least-one-property', 'you must provide at least one setting value', (value) => Object.keys(value).length);
	try {
		await schema.validate(req.body);
		convertBodyUUIDs(req.body);
		next();
	} catch (err) {
		respond(req, res, createResponseCode(templates.invalidArguments, err?.message));
	}
};

const convertBodyUUIDs = (payload) => {
	if (payload) {
		Object.keys(payload).forEach((key) => {
			payload[key] = stringToUUID(payload[key]);
		});
	}
};


module.exports = ModelSettings;
