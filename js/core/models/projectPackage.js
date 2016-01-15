var mongoose = require('mongoose');
var ModelFactory = require('./modelFactory');

var schema = mongoose.Schema({
	name: { type: String, required: true},
	site: String, 
	budget: String, 
	completedBy: Date
});



var ProjectPackage = ModelFactory.createClass(
	'Package', 
	schema, 
	arg => { 
		return `${arg.project}.packages`;
	}
);

module.exports = ProjectPackage;
