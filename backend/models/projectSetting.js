var mongoose = require('mongoose');
var ModelFactory = require('./factory/modelFactory');

var schema = mongoose.Schema({
	_id : String,
	owner: String,
	users: [String],
	desc: String,
	type: String,
	permissions: [Number]
});

var ProjectSetting = ModelFactory.createClass(
	'ProjectSetting', 
	schema, 
	() => { 
		return 'settings';
	}
);

module.exports = ProjectSetting;