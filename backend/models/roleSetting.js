var mongoose = require('mongoose');
var ModelFactory = require('./factory/modelFactory');

var schema = mongoose.Schema({
	_id : String,
	color: String,
	desc: String,
});


var RoleSetting = ModelFactory.createClass(
	'RoleSetting',
	schema,
	() => {
		return 'settings.roles';
	}
);

module.exports = RoleSetting;
