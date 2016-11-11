var mongoose = require('mongoose');
var ModelFactory = require('./factory/modelFactory');
var _ = require('lodash');

//var User = require('./user');
//var _ = require('lodash');

var schema = mongoose.Schema({
	_id : String,
	role: String,
	privileges: {},
	roles: []
});

var roleEnum = {
	'ADMIN': 'admin',
	'VIEWER': 'viewer',
	'COLLABORATOR': 'collaborator',
	'COMMENTER': 'commenter'
};

schema.statics.roleEnum = roleEnum;


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


schema.statics.removeViewerRole = function(account, project){
	'use strict';

	let dropRoleCmd = {
		'dropRole' : `${project}.viewer`
	};

	return ModelFactory.db.db(account).command(dropRoleCmd);
};

schema.statics.removeCollaboratorRole = function(account, project){
	'use strict';

	let dropRoleCmd = {
		'dropRole' : `${project}.collaborator`
	};

	return ModelFactory.db.db(account).command(dropRoleCmd);
};

schema.statics.determineRole = function(db, project, role){
	'use strict';

	let findPriv = function(actions){

		let findHistoryPriv = role.privileges.find(priv => {
			return priv.resource.db === db &&
				priv.resource.collection === `${project}.history` &&
				_.xor(priv.actions, actions.history).length === 0;
		});

		let findIssuePriv = role.privileges.find(priv => {
			return priv.resource.db === db &&
				priv.resource.collection === `${project}.issues` &&
				_.xor(priv.actions, actions.issue).length === 0;
		});

		return findHistoryPriv && findIssuePriv;
	};

	if(role.privileges){

		if(role.roles && role.roles.find(r => r.role === 'readWrite' && r.db === db)){
			return roleEnum.ADMIN;
		} else if(findPriv({history: [ "find", "insert"], issue: [ "find", "insert", "update"]})){
			return roleEnum.COLLABORATOR;
		} else if (findPriv({history: [ "find"], issue: ["find", "insert", "update" ]})){
			return roleEnum.COMMENTER;
		} else if (findPriv({history: [ "find"], issue: [ "find"]})){
			return roleEnum.VIEWER;
		}
	}
};

var Role = ModelFactory.createClass(
	'Role', 
	schema, 
	() => {
		return 'system.roles';
	}
);

module.exports = Role;