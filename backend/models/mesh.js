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

var Schema = mongoose.Schema;

var meshSchema = Schema(
	_.extend({}, repoBase.attrs, {
		vertices:  Buffer,
		vertices_count: Number,
		vertices_byte_count: Number,

		normals: Buffer,

		faces: Buffer,
		faces_count: Number,
		faces_byte_count: Number,

		outline: [],
		bounding_box: [],

		uv_channels: Buffer,
		uv_channels_count: Number,
		uv_channels_byte_count: Number

	})
);

// extend statics method
_.extend(meshSchema.statics, repoBase.statics);

var Mesh = ModelFactory.createClass(
	'Mesh', 
	meshSchema, 
	arg => { 
		return `${arg.project}.scene`;
	}
);


module.exports = Mesh;
