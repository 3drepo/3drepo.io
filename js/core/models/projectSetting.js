var mongoose = require('mongoose');
var ModelFactory = require('./factory/modelFactory');

var schema = mongoose.Schema({
	_id : String,
	info: mongoose.Schema({

		name: String,
		site: String,
		code: String,
		client: String,
		budget: Number,
		completedBy: Date,
		contact: String
	})
});

var ProjectSetting = ModelFactory.createClass(
	'ProjectSetting', 
	schema, 
	() => { 
		return 'settings';
	}
);

module.exports = ProjectSetting;