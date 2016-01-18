var mongoose = require('mongoose');
var ModelFactory = require('./modelFactory');
var ProjectPackage = require('./projectPackage');
var Bid = require('./bid');

var schema = mongoose.Schema({
	user: { type: String, required: true },
	budget: String, 
	accepted: { type: String, default: null },
	acceptedOn: Date,
	awarded: { type: String, default: null },
	awardedOn: Date,
	packageName: { type: String, required: true }
});


schema.pre('save', function(next){
	'use strict'
	
	ProjectPackage.count(this._dbcolOptions, {name: this.packageName}).then(count => {
		if(count <= 0) {
			let err = new Error('Package not found');
			err.name = 'ValidationError'

			next(err);
		} else {

			next();
		}
	})
});

// Model statics method
schema.statics.findByPackage = function(dbColOptions, packageName){
	return Bid.find(dbColOptions, {packageName});
}

var Bid = ModelFactory.createClass(
	'Bid', 
	schema, 
	arg => { 
		return `${arg.project}.bids`;
	}
);


module.exports = Bid;

