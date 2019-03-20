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
const Ref = require("./ref");
const Schema = mongoose.Schema;
const db = require("../handler/db");
const utils = require("../utils");

const schema = Schema({
	_id: Object,
	parents: [],
	metadata: Object
});

if (!schema.options.toJSON) {
	schema.options.toJSON = {};
}

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

const Meta = ModelFactory.createClass(
	"Meta",
	schema,
	arg => {
		return `${arg.model}.scene`;
	}
);

Meta.getMetadataFields = function(account, model) {

	return Ref.getRefNodes(account, model).then((subModelRefs) => {
		const subModelMetadataFieldsPromises = [];

		subModelRefs.forEach((ref) => {
			subModelMetadataFieldsPromises.push(
				this.getMetadataFields(ref.owner, ref.project).catch(() => {
					// Suppress submodel metadata failure
					return Promise.resolve();
				})
			);
		});

		return Promise.all(subModelMetadataFieldsPromises).then((subModels) => {
			const metaKeys = new Set();

			if (subModels) {
				subModels.forEach((subModelMetadataFields) => {
					if (subModelMetadataFields) {
						subModelMetadataFields.forEach((field) => {
							metaKeys.add(field);
						});
					}
				});
			}

			return db.getCollection(account, model + ".scene").then((sceneCollection) => {
				return sceneCollection.mapReduce(
					/* eslint-disable */
					function() {
						for (var key in this.metadata) {
							emit(key, null);
						}
					},
					function(key, value) {
						return null;
					},
					{
						"out": {inline:1}
					}
					/* eslint-enable */
				).then((uniqueKeys) => {
					uniqueKeys.forEach((key) => {
						metaKeys.add(key._id);
					});

					return Array.from(metaKeys);
				});
			});
		});
	});
};

module.exports = Meta;
