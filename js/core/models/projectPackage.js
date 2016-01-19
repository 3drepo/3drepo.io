var mongoose = require('mongoose');
var ModelFactory = require('./modelFactory');

var schema = mongoose.Schema({
	name: { type: String, required: true },
	site: { type: String, required: true },
	budget: String, 
	completedBy: Date
});


schema.pre('save', function(next){
	'use strict'

	ProjectPackage.count(this._dbcolOptions, {name: this.name}).then(count => {
		if(count > 0) {

			let err = new Error('This package name has been taken');
			err.name = 'ValidationError'
			next(err);
		} else {
			next();
		}
	})
});

var defaultProjection = { __v: 0};

// Model statics method
schema.statics.findByName = function(dbColOptions, name){
	return ProjectPackage.findOne(dbColOptions, {name}, defaultProjection);
}



var ProjectPackage = ModelFactory.createClass(
	'Package', 
	schema, 
	arg => { 
		return `${arg.project}.packages`;
	}
);

module.exports = ProjectPackage;
