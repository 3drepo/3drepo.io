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
const colorSchema = yup.array().of(yup.number().min(0).max(1)).length(4);

const shapesSchema = yup.object().shape({
	"positions": yup.array().of(coordinatesSchema).required(),
	"normals": yup.array().of(coordinatesSchema),
	"value": yup.number().min(0),
	"color": colorSchema.required(),
	"type": yup.mixed().oneOf([0, 1]).required(),
	"ticket_id": utils.uuidSchema.required(),
	// this is for convenience only, because the shape has this field in unity we allow it
	// to be posted in this form, even though it will be replaced with _id when fetching
	"uuid": yup.string()
}).noUnknown();

const Shapes = {};

Shapes.clean = (shape) => {
	shape.uuid = utils.uuidToString(shape._id);
	delete shape.ticket_id;
	delete shape._id;
	return shape;
};

Shapes.create = async (account, model, subCollectionName, shape) => {
	if (!shapesSchema.isValidSync(shape, { strict: true })) {
		throw responseCodes.INVALID_ARGUMENTS;
	}

	delete shape.uuid;
	shape._id = utils.generateUUID();
	await DB.insert(account, getCollectionName(model, subCollectionName), shape);
	return shape._id;
};

Shapes.get = async (account, model, subCollectionName, ids) => {
	const query = { _id: { $in: utils.stringsToUUIDs(ids)} };
	return await DB.find(account, getCollectionName(model, subCollectionName), query);
};

Shapes.removeByTicketId = async (account, model, subCollectionName, ticket_id) => {
	const query = { ticket_id: utils.stringToUUID(ticket_id) };
	return await DB.remove(account, getCollectionName(model, subCollectionName), query);
};

module.exports = Shapes;