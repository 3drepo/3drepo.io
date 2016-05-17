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
					"find", "insert", "update"
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

// schema.statics.createAndAssignRole = function(account, project, username){
// 	'use strict';

// 	let roleId = `${account}.${project}`;

// 	return this.findByRoleID(roleId).then(role =>{

// 		if(role){
// 			return Promise.resolve();
// 		} else {
// 			return this.createRole(account, project);
// 		}

// 	}).then(() => {

// 		return User.grantRoleToUser(username, account, project);

// 	});
// };


var Role = ModelFactory.createClass(
	'Role', 
	schema, 
	() => {
		return 'system.roles';
	}
);

module.exports = Role;