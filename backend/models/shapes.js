/**
 * Copyright (C) 2021 3D Repo Ltd
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
"use strict";
const DB = require("../handler/db");
const yup = require("yup");

const utils = require("../utils");
const responseCodes = require("../response_codes.js");
const getCollectionName = (model, subCollectionName) => `${model}.${subCollectionName}.shapes`;

const coordinatesSchema = yup.array().of(yup.number()).length(3);
const colorSchema = yup.array().of(yup.number().min(0).max(1)).length(3);

const shapesSchema = yup.object.shape({
	"positions": yup.array().of(coordinatesSchema),
	"normals": yup.array().of(coordinatesSchema),
	"value": yup.number().min(0),
	"color": colorSchema,
	"type": yup.mixed().oneOf([0, 1])
}).noUnknown();

const Shapes = {};

Shapes.create = async (account, model, subCollectionName, shape) => {
	if (!shapesSchema.isValidSync(shape, { strict: true })) {
		throw responseCodes.INVALID_ARGUMENTS;
	}

	shape._id = utils.generateUUID();
	await DB.insert(account, getCollectionName(model, subCollectionName), shape);

	return shape;
};

Shapes.fetch = async (account, model, subCollectionName, ids) => {
	const query = { _id: { $in: utils.stringsToUUIDs(ids)} };
	await DB.find(account, getCollectionName(model, subCollectionName), query);
};

module.exports = Shapes;