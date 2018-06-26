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


let _ = require("lodash");
let mongoose = require("mongoose");
let Schema = mongoose.Schema;

// Base Repo Attributes
let repoBase = {
	_id: Buffer,
	shared_id: Buffer,
	paths: [Buffer],
	type: String,
	api: Number,
	parents: [Buffer],
	name: String
};

let cameraSchema = Schema(
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

let materialSchema = Schema(
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

let metaDataSchema = Schema(
	_.extend({}, repoBase, {
		metadata: Buffer
	})
);

let referenceSchema = Schema(
	_.extend({}, repoBase, {
		owner: String,
		project: String,
		_rid: Buffer,
		unique: Boolean
	})
);

let textureSchema = Schema(
	_.extend({}, repoBase, {
		width: Number,
		height: Number,
		data: Buffer,
		data_byte_count: Number,
		extension: String
	})
);


let transformationSchema = Schema(
	_.extend({}, repoBase, {
		matrix: [[Number]]
	})
);


let Camera = ModelFactory.createClass(
	"Camera", 
	cameraSchema, 
	arg => { 
		return `${arg.model}.scene`;
	}
);

let Material = ModelFactory.createClass(
	"Material", 
	materialSchema, 
	arg => { 
		return `${arg.model}.scene`;
	}
);


let Metadata = ModelFactory.createClass(
	"Metadata", 
	metaDataSchema, 
	arg => { 
		return `${arg.model}.scene`;
	}
);

let Reference = ModelFactory.createClass(
	"Reference", 
	referenceSchema, 
	arg => { 
		return `${arg.model}.scene`;
	}
);

let Texture = ModelFactory.createClass(
	"Texture", 
	textureSchema, 
	arg => { 
		return `${arg.model}.scene`;
	}
);


let Transformation = ModelFactory.createClass(
	"Transformation", 
	transformationSchema, 
	arg => { 
		return `${arg.model}.scene`;
	}
);


module.exports = {Camera, Material, Metadata, Reference, Texture, Transformation};
