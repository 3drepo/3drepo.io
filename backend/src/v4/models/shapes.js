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

"use strict";
const db = require("../handler/db");
const yup = require("yup");

const utils = require("../utils");
const responseCodes = require("../response_codes.js");
const getCollectionName = (model, subCollectionName) => `${model}.${subCollectionName}.shapes`;

const coordinatesSchema = yup.array().of(yup.number()).length(3);
const colorSchema = yup.array().of(yup.number().min(0).max(1)).length(4);

const shapeSchema = yup.object().shape({
	"positions": yup.array().of(coordinatesSchema).required(),
	"normals": yup.array().of(coordinatesSchema),
	"value": yup.number().min(0),
	"color": colorSchema.required(),
	"type": yup.mixed().oneOf([0, 1, 2, 3]).required(),
	"name": yup.string()
}).noUnknown();

const shapesSchema = yup.array().of(shapeSchema);

const Shapes = {};

Shapes.clean = (shape) => {
	shape._id = utils.uuidToString(shape._id);
	delete shape.ticket_id;
	return shape;
};

Shapes.cleanCollection = shapes => shapes.map(Shapes.clean);

Shapes.createMany = async (account, model, subCollectionName, ticket_id, shapes) => {
	if (!utils.uuidSchema.isValidSync(ticket_id, { strict: true }) || !shapesSchema.isValidSync(shapes, { strict: true })) {
		throw responseCodes.INVALID_ARGUMENTS;
	}

	const uuids = utils.generateUUIDs(shapes.length);
	shapes = shapes.map(shape=> ({_id: uuids.pop(), ticket_id, ...shape}));

	await Shapes.removeByTicketId(account, model, subCollectionName, ticket_id); // remove old collection of shapes

	if (shapes.length) {
		await db.insertMany(account, getCollectionName(model, subCollectionName), shapes);
	}

	return  shapes;
};

Shapes.getByTicketId = async (account, model, subCollectionName, ticket_id) => {
	const query = { ticket_id };
	return await db.find(account, getCollectionName(model, subCollectionName), query);
};

Shapes.removeByTicketId = async (account, model, subCollectionName, ticket_id) => {
	const query = { ticket_id: utils.stringToUUID(ticket_id) };
	return await db.deleteMany(account, getCollectionName(model, subCollectionName), query);
};

module.exports = Shapes;
