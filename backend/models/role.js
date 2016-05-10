var mongoose = require('mongoose');
var ModelFactory = require('./factory/modelFactory');

var schema = mongoose.Schema({
	_id : String,
	role: String,
	privileges: {},
	roles: []
});

schema.statics.findByRoleID = function(id){
	'use strict';
	return this.findOne({ account: 'admin'}, { _id: id});
};

schema.statics.createRole = function(account, project){
	'use strict';

	let createRoleCmd = { 
		'createRole' : project,
		'privileges': [
			{
				"resource" : {
					"db" : account,
					"collection" : `${project}.history`
				},
				"actions" : [ 
					"find"
				]
			},
			{
				"resource" : {
					"db" : account,
					"collection" : `${project}.issues`
				},
				"actions" : [ 
					"find", "insert", "update"
				]
			}, 
		],
		roles: []
	};

	return ModelFactory.db.db(account).command(createRoleCmd);
};

var Role = ModelFactory.createClass(
	'Role', 
	schema, 
	() => { 
		return 'system.roles';
	}
);

module.exports = Role;