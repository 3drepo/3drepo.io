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
const { checkLegendExists } = require('../../../../../../../models/legends')
const { checkViewExists} = require('../../../../../../../models/views')
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
		defaultView: types.id.nullable().test('check-view-exists', 'View not found', async (value) => {
			if (value) {
				try{
					const model = req.params.container ?? req.params.federation;
					await checkViewExists(req.params.teamspace, model, stringToUUID(value));
				} catch(err){
					return false;
				}
			}
			return true;
		}),
		defaultLegend: types.id.nullable().test('check-legend-exists', 'Legend not found', async (value) => {
			if (value) {
				try{
					const model = req.params.container ?? req.params.federation;
					await checkLegendExists(req.params.teamspace, model, stringToUUID(value));
				} catch(err){
					return false;
				}				
			}
			return true;
		}),
	}).strict(true).noUnknown()
		.required()
		.test('at-least-one-property', 'You must provide at least one setting value', (value) => Object.keys(value).length);
	try {
		req.body = await schema.validate(req.body);
		convertBodyUUIDs(req.body);
		next();
	} catch (err) {
		respond(req, res, createResponseCode(templates.invalidArguments, err?.message));
	}
};

const convertBodyUUIDs = (data) => {
	Object.keys(data).forEach((key) => {
		data[key] = stringToUUID(data[key]);
	});
};


module.exports = ModelSettings;
