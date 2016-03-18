var _ = require('lodash');
var repoBase = require('./base/repo');
var mongoose = require('mongoose');
var ModelFactory = require('./factory/modelFactory');

var Schema = mongoose.Schema;

var textureSchema = Schema(
	_.extend({}, repoBase.attrs, {
		width: Number,
		height: Number,
		data: Buffer,
		data_byte_count: Number,
		extension: String
	})
);


// extend statics method
_.extend(textureSchema.statics, repoBase.statics);


var Texture = ModelFactory.createClass(
	'Texture', 
	textureSchema, 
	arg => { 
		return `${arg.project}.scene`;
	}
);


module.exports = Texture;
