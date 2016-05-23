var mongoose = require('mongoose');
var ModelFactory = require('./factory/modelFactory');
//var User = require('./user');
//var _ = require('lodash');

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

schema.statics.createCollaboratorRole = function(account, project){
	'use strict';

	let createRoleCmd = {
		'createRole' : `${project}.collaborator`,
		'privileges': [
			{
				"resource" : {
					"db" : account,
					"collection" : `${project}.history`
				},
				"actions" : [ 
					"find", "insert"
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
		roles: [{ role: `${project}.viewer`, db: account}]
	};

	return ModelFactory.db.db(account).command(createRoleCmd);
};

schema.statics.createViewerRole = function(account, project){
	'use strict';

	let createRoleCmd = {
		'createRole' : `${project}.viewer`,
		'privileges': [
			{
				"resource" : {
					"db" : account,
					"collection" : `${project}.history`
				},
				"actions" : [ 
					"find",
				]
			},
			{
				"resource" : {
					"db" : account,
					"collection" : `${project}.issues`
				},
				"actions" : [ 
					"find"
				]
			}, 
		],
		roles: []
	};

	return ModelFactory.db.db(account).command(createRoleCmd);
};

schema.statics.createAdminRole = function(account){
	'use strict';

	let createRoleCmd = {
		'createRole' : 'admin',
		'privileges': [],
		roles: [{ role: 'readWrite', db: account}]
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