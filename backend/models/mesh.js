/**
 *  Copyright (C) 2014 3D Repo Ltd
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

(() => {
	"use strict";

	const _ = require("lodash");
	const repoBase = require("./base/repo");
	const mongoose = require("mongoose");
	const ModelFactory = require("./factory/modelFactory");
	const utils = require("../utils");
	const responseCode = require("../response_codes");

	const Schema = mongoose.Schema;

	let meshSchema = Schema(
		_.extend({}, repoBase.attrs, {
			vertices: Object,
			vertices_count: Number,
			vertices_byte_count: Number,

			normals: Object,

			faces: Object,
			faces_count: Number,
			faces_byte_count: Number,

			outline: [],
			bounding_box: [],

			uv_channels: Object,
			uv_channels_count: Number,
			uv_channels_byte_count: Number,

			groups: [],

		})
	);

	// extend statics method
	_.extend(meshSchema.statics, repoBase.statics);

	meshSchema.statics.addGroup = function (account, model, id, gid) {
		return this.findById({ account, model }, utils.stringToUUID(id), { groups: 1, shared_id: 1 })
			.then(mesh => {
				if (!mesh) {
					return Promise.reject(responseCode.MESH_NOT_FOUND);
				} else {
					mesh.groups.addToSet(utils.stringToUUID(gid));
					return mesh.save();
				}
			});
	};

	meshSchema.statics.removeGroup = function (account, model, id, gid) {
		return this.findById({ account, model }, utils.stringToUUID(id), { groups: 1 })
			.then(mesh => {

				if (!mesh) {
					return Promise.reject(responseCode.MESH_NOT_FOUND);
				} else {

					let index = -1;

					mesh.groups.forEach((val, i) => {
						if (utils.uuidToString(val) === gid) {
							index = i;
						}
					});

					if (index === -1) {
						return Promise.reject(responseCode.GROUP_ID_NOT_FOUND_IN_MESH);
					}

					mesh.groups.splice(index, 1);
					return mesh.save();
				}
			});
	};

	meshSchema.statics.getMeshes = function (account, model, history) {
		//find all meshes within this revision.
		var query = { "_id" : {"$in": history.current}, "type": "mesh"};
		return this.find({account, model}, query, {_id : 1, shared_id: 1})
			.then( meshes => {
				meshes.forEach(mesh => {
					mesh._id = utils.uuidToString(mesh._id);
					mesh.shared_id = mesh.shared_id && utils.uuidToString(mesh.shared_id);
				});
				return meshes;
			});


	};
	

	let Mesh = ModelFactory.createClass(
		"Mesh",
		meshSchema,
		
		arg => {
			return `${arg.model}.scene`;
		}
	);

	module.exports = Mesh;

})();
