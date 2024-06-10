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
const { MODEL_TYPES } = require('../../../../../../../models/modelSettings.constants');
const Yup = require('yup');
const { checkLegendExists } = require('../../../../../../../models/legends');
const { escapeRegexChrs } = require('../../../../../../../utils/helper/strings');
const { getModelByQuery } = require('../../../../../../../models/modelSettings');
const { getProjectById } = require('../../../../../../../models/projectSettings');
const { getViewById } = require('../../../../../../../models/views');
const { respond } = require('../../../../../../../utils/responder');
const { stringToUUID } = require('../../../../../../../utils/helper/uuids');
const { types } = require('../../../../../../../utils/helper/yup');

const ModelSettings = {};

const convertBodyUUIDs = (req) => {
	Object.keys(req.body).forEach((key) => {
		req.body[key] = stringToUUID(req.body[key]);
	});
};

const defaultViewType = (teamspace, model) => types.id.nullable().test('check-view-exists', 'View not found', async (value) => {
	if (value) {
		try {
			await getViewById(teamspace, model, stringToUUID(value), { _id: 1 });
		} catch (err) {
			return false;
		}
	}
	return true;
});

const defaultLegendType = (teamspace, model) => types.id.nullable().test('check-legend-exists', 'Legend not found', async (value) => {
	if (value) {
		try {
			await checkLegendExists(teamspace, model, stringToUUID(value));
		} catch (err) {
			return false;
		}
	}
	return true;
});

const isPropUnique = async (teamspace, project, model, modelType, propName, propValue) => {
	try {
		let { models } = await getProjectById(teamspace, project, { models: 1 });
		if (model) {
			models = models.flatMap((modelId) => (modelId === model ? [] : modelId));
		}

		const query = { _id: { $in: models },
			...(modelType === MODEL_TYPES.DRAWING ? { modelType: MODEL_TYPES.DRAWING } : {}),
			// eslint-disable-next-line security/detect-non-literal-regexp
			[propName]: new RegExp(`^${escapeRegexChrs(propValue)}$`, 'i') };

		await getModelByQuery(teamspace, query, { _id: 1 });
		return false;
	} catch (err) {
		// We want this to error out. This means there's no model with the same name
		return true;
	}
};

const modelNameType = (teamspace, project, model) => types.strings.title.test('name-already-used', 'Name is already used within the project',
	(value) => isPropUnique(teamspace, project, model, MODEL_TYPES.ANY, 'name', value));

const modelNumberType = (teamspace, project, model) => types.strings.title.test('number-already-used', 'Number is already used within the project',
	(value) => isPropUnique(teamspace, project, model, MODEL_TYPES.DRAWING, 'number', value));

const generateSchema = (newEntry, modelType, teamspace, project, modelId) => {
	const name = modelNameType(teamspace, project, modelId);
	const number = modelNumberType(teamspace, project, modelId);

	const commonProps = {
		name: newEntry ? name.required() : name,
		desc: types.strings.shortDescription,
		...(modelType === MODEL_TYPES.FEDERATION ? {} : { type: newEntry ? Yup.string().required() : Yup.string() }),
	};

	const schema = {
		...commonProps,
		...(modelType === MODEL_TYPES.DRAWING
			? { number: newEntry ? number.required() : number }
			: {
				unit: newEntry ? types.strings.unit.required() : types.strings.unit,
				code: types.strings.code,
				surveyPoints: types.surveyPoints,
				angleFromNorth: types.degrees,
				...(newEntry
					? {}
					: {
						defaultView: defaultViewType(teamspace, modelId),
						defaultLegend: defaultLegendType(teamspace, modelId),
					}),
			}),
	};

	const yupObj = Yup.object().strict(true).noUnknown().required()
		.shape(schema);
	return newEntry
		? yupObj
		: yupObj.test(
			'at-least-one-property',
			'You must provide at least one setting value',
			(value) => Object.keys(value).length,
		);
};

ModelSettings.validateAddModelData = (modelType) => async (req, res, next) => {
	try {
		const { teamspace, project } = req.params;
		const schema = generateSchema(true, modelType, teamspace, project);
		await schema.validate(req.body);

		if (req.body.unit) {
			req.body.properties = { unit: req.body.unit.toLowerCase() };
			delete req.body.unit;
		}

		if (req.body.code) {
			req.body.properties.code = req.body.code;
			delete req.body.code;
		}

		next();
	} catch (err) {
		respond(req, res, createResponseCode(templates.invalidArguments, err?.message));
	}
};

ModelSettings.validateUpdateSettingsData = (modelType) => async (req, res, next) => {
	try {
		const { teamspace, project } = req.params;

		let model;
		if (modelType === MODEL_TYPES.FEDERATION) {
			model = req.params.federation;
		} else {
			model = modelType === MODEL_TYPES.CONTAINER ? req.params.container : req.params.drawing;
		}

		const schema = generateSchema(false, modelType, teamspace, project, model);
		req.body = await schema.validate(req.body);
		convertBodyUUIDs(req);
		next();
	} catch (err) {
		respond(req, res, createResponseCode(templates.invalidArguments, err?.message));
	}
};

module.exports = ModelSettings;
