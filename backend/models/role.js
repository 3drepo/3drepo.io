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

(() => {
	"use strict";

	const mongoose = require('mongoose');
	const ModelFactory = require('./factory/modelFactory');
	const _ = require('lodash');
	const RoleTemplates = require('./role_templates');
	const responseCodes = require("../response_codes");
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

		RoleTemplates.projectRoleTemplateLists.forEach(role =>
			{
				rolePromises.push(this.createRole(account, project, role));
			}
		);

		return Promise.all(rolePromises);
	};

	schema.statics.createRole = function (account, project, role) {
		return Role.findByRoleID(`${account}.${project}.${role}`).then(roleFound => {
			if(roleFound){
				return;
			} else {
				return RoleTemplates.createRoleFromTemplate(account, project, role);
			}
		});
	};

	schema.static.dropRole = function (account, role) {
		let dropRoleCmd = {
			'dropRole' : role
		};

		return ModelFactory.db.db(account).command(dropRoleCmd);
	};

	schema.statics.grantRolesToUser = function (username, roles) {
		
		let grantRoleCmd = {
			grantRolesToUser: username,
			roles: roles
		};
		
		return ModelFactory.db.admin().command(grantRoleCmd);
	};

	schema.statics.grantProjectRoleToUser = function (username, account, project, role) {
		
		// lazily create the role from template if the role is not found

		if(RoleTemplates.projectRoleTemplateLists.indexOf(role) === -1){
			return Promise.reject(responseCodes.INVALID_ROLE_TEMPLATE);
		}

		return this.createRole(account, project, role).then(() => {

			let grantRoleCmd = {
				grantRolesToUser: username,
				roles: [{
					db: account,
					role: `${project}.${role}`
				}]
			};
			
			return ModelFactory.db.admin().command(grantRoleCmd);
		});

	};

	var roleEnum = {
		'ADMIN': 'admin',
		'VIEWER': 'viewer',
		'COLLABORATOR': 'collaborator',
		'COMMENTER': 'commenter'
	};

	schema.statics.roleEnum = roleEnum;


	schema.statics.findByRoleID = function(id){
		return this.findOne({ account: 'admin'}, { _id: id});
	};

	schema.statics.determineRole = function(db, project, role){

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

	schema.statics.revokeRolesFromUser = function(username, roles){

		let cmd = {
			revokeRolesFromUser: username,
			roles: roles
		};

		return ModelFactory.db.admin().command(cmd);
	};

	var Role = ModelFactory.createClass(
		'Role', 
		schema, 
		() => {
			return 'system.roles';
		}
	);

	module.exports = Role;

})();