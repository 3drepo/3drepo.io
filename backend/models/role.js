/**
 *	Copyright (C) 2014 3D Repo Ltd
 *
 *	This program is free software: you can redistribute it and/or modify
 *	it under the terms of the GNU Affero General Public License as
 *	published by the Free Software Foundation, either version 3 of the
 *	License, or (at your option) any later version.
 *
 *	This program is distributed in the hope that it will be useful,
 *	but WITHOUT ANY WARRANTY; without even the implied warranty of
 *	MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *	GNU Affero General Public License for more details.
 *
 *	You should have received a copy of the GNU Affero General Public License
 *	along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

const mongoose = require('mongoose');
const ModelFactory = require('./factory/modelFactory');
const _ = require('lodash');

//var User = require('./user');
//var _ = require('lodash');

const schema = mongoose.Schema({
	_id : String,
	role: String,
	privileges: {},
	roles: []
});

schema.statics.createStandardRoles = function (account, project) {
	let rolePromises = [];

	for(let role in roleTemplates)
	{
		rolePromises.push(this.creatRole(account, project, role));
	}

	return Promise.all(rolePromises);
};

schema.statics.createRole = function (account, project, role) {
	Role.findByRoleID(account, project, role).then(roleFound => {
		if(roleFound){
			return;
		} else {
			return roleTemplates.createRoleFromTemplate(account, project, role, roleName);
		}
	});
};

schema.static.dropRole = function (account, project, role) {
	
};

schema.statics.grantRoleToUser = function (username) {

};

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


schema.statics.createCommenterRole = function(account, project){
	'use strict';
	
	let createRoleCmd = {
		'createRole' : `${project}.commenter`,
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
					"find", "insert", "update"
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

schema.statics.removeCommenterRole = function(account, project){
	'use strict';

	let dropRoleCmd = {
		'dropRole' : `${project}.commenter`
	};

	return ModelFactory.db.db(account).command(dropRoleCmd);

};

var Role = ModelFactory.createClass(
	'Role', 
	schema, 
	() => {
		return 'system.roles';
	}
);

module.exports = Role;
