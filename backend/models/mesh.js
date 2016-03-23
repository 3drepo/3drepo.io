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
