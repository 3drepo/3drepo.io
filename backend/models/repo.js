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
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// Base Repo Attributes
var repoBase = {
	_id: Buffer,
	shared_id: Buffer,
	paths: [Buffer],
	type: String,
	api: Number,
	parents: [Buffer],
	name: String
};

var cameraSchema = Schema(
	_.extend({}, repoBase, {
		// camera attrs
		aspect_ratio: Number,
		far: Number,
		near: Number,
		fov: Number,
		look_at: [Number],
		view_dir: [Number],
		position: [Number],
		up: [Number],

	})
);

var materialSchema = Schema(
	_.extend({}, repoBase, {
		//material attrs
		ambient: [Number],
		diffuse: [Number],
		specular: [Number],
		emissive: [Number],
		opacity: Number,
		shininess: Number,
		shininess_strength: Number,
		wireframe: Boolean,
		two_sided: Boolean

	})
);

var metaDataSchema = Schema(
	_.extend({}, repoBase, {
		metadata: Buffer
	})
);

var referenceSchema = Schema(
	_.extend({}, repoBase, {
		owner: String,
		project: String,
		_rid: Buffer,
		unique: Boolean
	})
);

var textureSchema = Schema(
	_.extend({}, repoBase, {
		width: Number,
		height: Number,
		data: Buffer,
		data_byte_count: Number,
		extension: String
	})
);


var transformationSchema = Schema(
	_.extend({}, repoBase, {
		matrix: [[Number]]
	})
);


var Camera = ModelFactory.createClass(
	'Camera', 
	cameraSchema, 
	arg => { 
		return `${arg.project}.scene`;
	}
);

var Material = ModelFactory.createClass(
	'Material', 
	materialSchema, 
	arg => { 
		return `${arg.project}.scene`;
	}
);


var Metadata = ModelFactory.createClass(
	'Metadata', 
	metaDataSchema, 
	arg => { 
		return `${arg.project}.scene`;
	}
);

var Reference = ModelFactory.createClass(
	'Reference', 
	referenceSchema, 
	arg => { 
		return `${arg.project}.scene`;
	}
);

var Texture = ModelFactory.createClass(
	'Texture', 
	textureSchema, 
	arg => { 
		return `${arg.project}.scene`;
	}
);


var Transformation = ModelFactory.createClass(
	'Transformation', 
	transformationSchema, 
	arg => { 
		return `${arg.project}.scene`;
	}
);


module.exports = {Camera, Material, Metadata, Reference, Texture, Transformation};
