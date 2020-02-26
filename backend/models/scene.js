/**
 *  Copyright (C) 2016 3D Repo Ltd
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
const mongoose = require("mongoose");
const ModelFactory = require("./factory/modelFactory");
const Schema = mongoose.Schema;
const utils = require("../utils");
const db = require("../handler/db");

const schema = Schema({
	_id: Object,
	parents: []
});

if (!schema.options.toJSON) {
	schema.options.toJSON = {};
}

const dbFindOne = async (account, model, query, projection) => {
	const coll = await db.getCollection(account, model + ".scene");
	return await coll.findOne(query, projection);
};

schema.options.toJSON.transform = function (doc, ret) {
	ret._id = utils.uuidToString(doc._id);
	if(doc.parents) {
		const newParents = [];
		doc.parents.forEach(function(parentId) {
			newParents.push(utils.uuidToString(parentId));
		});
		ret.parents = newParents;
	}
	return ret;
};

schema.statics.getBySharedId = async (account, model, shared_id, revisionIds, projection = {}) => {
	return await dbFindOne(account, model, {shared_id, _id :{$in: revisionIds}}, projection);
};

schema.statics.getObjectById = async (account, model, id, projection = {}) => {
	return await dbFindOne(account, model, {_id: id}, projection);
};

const Scene = ModelFactory.createClass(
	"Scene",
	schema,
	arg => {
		return `${arg.model}.scene`;
	}
);

module.exports = Scene;
