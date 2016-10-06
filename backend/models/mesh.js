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


var _ = require('lodash');
var repoBase = require('./base/repo');
var mongoose = require('mongoose');
var ModelFactory = require('./factory/modelFactory');
var utils = require('../utils');
var responseCode = require('../response_codes');

var Schema = mongoose.Schema;

var meshSchema = Schema(
	_.extend({}, repoBase.attrs, {
		vertices:  Object,
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

meshSchema.statics.addGroup = function(account, project, id, gid){
	'use strict';

	return this.findById({account, project}, utils.stringToUUID(id), {groups: 1}).then(mesh => {
		if(!mesh){
			return Promise.reject(responseCode.MESH_NOT_FOUND);
		} else {
			mesh.groups.addToSet(utils.stringToUUID(gid));
			return mesh.save();
		}
	});
};

meshSchema.statics.removeGroup = function(account, project, id, gid){
	'use strict';

	return this.findById({account, project}, utils.stringToUUID(id), {groups: 1}).then(mesh => {
		

		if(!mesh){
			return Promise.reject(responseCode.MESH_NOT_FOUND);
		} else {

			let index = -1;

			mesh.groups.forEach((val, i) => {
				if (utils.uuidToString(val) === gid){
					index = i;
				}
			});

			if(index === -1){
				return Promise.reject(responseCode.GROUP_ID_NOT_FOUND_IN_MESH);
			}

			mesh.groups.splice(index ,1);
			return mesh.save();			
		}
	});
};

var Mesh = ModelFactory.createClass(
	'Mesh', 
	meshSchema, 
	arg => { 
		return `${arg.project}.scene`;
	}
);


module.exports = Mesh;
