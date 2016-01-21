var mongoose = require('mongoose');
var ModelFactory = require('./modelFactory');
var ProjectPackage = require('./projectPackage');
var responseCode = require('../response_codes');

var schema = mongoose.Schema({
	user: { type: String, required: true },
	budget: String, 
	accepted: { type: Boolean, default: null },
	acceptedOn: Date,
	awarded: { type: Boolean, default: null },
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

schema.statics.findByUser = function(dbColOptions, user){
	return Bid.findOne(dbColOptions, {user});
}

schema.methods.award = function(){

	return Bid.count(this._dbcolOptions, { packageName: this.packageName, awarded: true }).then(count => {
		if (count > 0){
			return Promise.reject({ resCode: responseCode.PACKAGE_AWARDED});
		} else if (!this.accepted) {
			return Promise.reject({ resCode: responseCode.BID_NOT_ACCEPTED});
		} else {

			this.awarded = true;
			this.awardedOn = new Date();
			
			return this.save();			
		}
	}).then(bid => {

		// mark other bids awarded: false

		// unfortunately mongoose.update don't return promise so wrap it in promise
		return new Promise((resolve, reject) => {
			console.log(this._dbcolOptions);
			Bid.update(this._dbcolOptions, { 
				packageName: this.packageName, 
				awarded: null 
			}, { 
				awarded: false, 
				awardedOn: new Date() 
			}, { multi: true }, function(err) {
				if (err){
					reject(err);
				} else {
					resolve(bid)
				}
			});
		});

	});
}

var Bid = ModelFactory.createClass(
	'Bid', 
	schema, 
	arg => { 
		return `${arg.project}.bids`;
	}
);


module.exports = Bid;

