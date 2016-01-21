var mongoose = require('mongoose');
var ModelFactory = require('./modelFactory');
var C = require('../constants.js');

var schema = mongoose.Schema({
	name: { type: String, required: true },
	site: { type: String, required: true },
	budget: Number, 
	completedBy: Date,
	user: String
});

schema.plugin(require('mongoose-timestamp'), {
  createdAt: 'createdOn',
  updatedAt: 'updatedOn'
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

schema.post('save', function(doc){
	'use strict';

	// add to customData.bids for quick lookup 

	let db = ModelFactory.db;
	let database = 'admin';
	let collection = 'system.users'
	let bid = {
		role: C.REPO_ROLE_MAINCONTRACTOR,
		account: doc._dbcolOptions.account,
		project : doc._dbcolOptions.project,
		package: doc.name,
	};

	db.db(database)
	.collection(collection)
	.findOneAndUpdate({ 
		user: doc.user 
	},{'$addToSet':{ 
		'customData.bids': bid
	}});

});

var defaultProjection = { __v: 0, user: 0};

schema.statics.defaultProjection = defaultProjection;

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
