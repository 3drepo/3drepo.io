var mongoose = require('mongoose');
var ModelFactory = require('./modelFactory');

var schema = mongoose.Schema({
	name: { type: String, required: true },
	site: { type: String, required: true },
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
