/**
 *  Copyright (C) 2025 3D Repo Ltd
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

const { isArray, isObject } = require('../../../../../../../../utils/helper/typeCheck');
const Yup = require('yup');
const { logger } = require('../../../../../../../../utils/logger');
const { modelTypes } = require('../../../../../../../../models/modelSettings.constants');
const { respond } = require('../../../../../../../../utils/responder');
const { templates } = require('../../../../../../../../utils/responseCodes');
const { types } = require('../../../../../../../../utils/helper/yup');

const Bundles = {};

const baseSchema = Yup.object({
	_id: types.id,
	primitive: Yup.number().default(3),

	nFaces: Yup.number().default(0),
	nVertices: Yup.number().default(0),
	nUVChannels: Yup.number().default(0),

	min: Yup.array().of(Yup.number()).length(3),
	max: Yup.array().of(Yup.number()).length(3),
}).transform((value) => {
	if (!value || !isObject(value)) return value;

	return {
		...value,
		nFaces: value.faces_count ?? 0,
		nVertices: value.vertices_count ?? 0,
		nUVChannels: value.uv_channels_count ?? 0,
		min: (isArray(value.bounding_box) && value.bounding_box[0]) ?? [0, 0, 0],
		max: (isArray(value.bounding_box) && value.bounding_box[1]) ?? [0, 0, 0],
	};
});

Bundles.serialiseUnityMeta = (modelType) => (req, res) => {
	try {
		const containerSchema = {
			superMeshes: Yup.array().of(baseSchema),
		};

		const schema = modelType === modelTypes.CONTAINER ? Yup.object(containerSchema) : Yup.object({
			subModels: Yup.array().of(
				Yup.object({
					superMeshes: Yup.object(containerSchema),
					teamspace: Yup.string(),
					model: types.id,
				}),
			),
		});

		const data = schema.cast(req.supermeshData, { stripUnknown: true });
		respond(req, res, templates.ok, data);
	} catch (err) {
		logger.logInfo(`Error serialising unity meta: ${err.message}`);
		respond(req, res, templates.unknown);
	}
};

module.exports = Bundles;
