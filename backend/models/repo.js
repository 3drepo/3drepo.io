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
