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
	const RoleTemplates = require('./role_templates');
	const responseCodes = require("../response_codes");
	const ProjectSetting = require("./projectSetting");
	const _ = require('lodash');
	const C = require('../constants');

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
		
		let roleId = `${account}.${project}.${role}`;
		
		if(!project){
			roleId = `${account}.${role}`;
		}
		
		return Role.findByRoleID(roleId).then(roleFound => {
			if(roleFound){
				roleFound = roleFound.toObject();
				return { role: roleFound.role, db: roleFound.db};
			} else {
				return RoleTemplates.createRoleFromTemplate(account, project, role);
			}
		});
	};

	schema.statics.dropRole = function (account, role) {
		let dropRoleCmd = {
			'dropRole' : role
		};

		return this.findByRoleID(`${account}.${role}`).then(role => {
			if(!role){
				return Promise.resolve();
			} else {
				return ModelFactory.db.db(account).command(dropRoleCmd);
			}
		});
		
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

	schema.statics.findByRoleID = function(id){
		return this.findOne({ account: 'admin'}, { _id: id});
	};

	schema.statics.revokeRolesFromUser = function(username, roles){

		let cmd = {
			revokeRolesFromUser: username,
			roles: roles
		};

		return ModelFactory.db.admin().command(cmd);
	};

	schema.statics.viewRolesWithInheritedPrivs = function(roles){

		let viewRolesCmd = { rolesInfo : roles, showPrivileges: true };
		return ModelFactory.db.admin().command(viewRolesCmd).then(doc => doc.roles);

	};

	schema.statics.listProjectsAndAccountAdmin = function(roles){

		let projects = {};
		let promises = [];
		let adminAccounts = [];

		function getProjectNames(privileges){

			let collectionSuffix = '.history';
			let projectNames = [];

			for(let i=0 ; i < privileges.length ; i++){
				let collectionName = privileges[i].resource.collection;
				if(collectionName.endsWith(collectionSuffix)){
					projectNames.push(collectionName.substr(0, collectionName.length - collectionSuffix.length));
				}
			}

			return _.unique(projectNames);
		}

		function addToProjectList(account, project, permissions){
			//if project not found in the list
			if(!projects[`${account}.${project}`]){
				projects[`${account}.${project}`] = {
					project,
					account,
					permissions: permissions ? permissions : []
				};
			} else {
				permissions && (projects[`${account}.${project}`].permissions = projects[`${account}.${project}`].permissions.concat(permissions));
				projects[`${account}.${project}`].permissions  = _.unique(projects[`${account}.${project}`].permissions);
			}
		}

		roles.forEach(role => {

			let permissions = RoleTemplates.determinePermission(role.db, '', role);

			if(_.intersection(permissions, RoleTemplates.roleTemplates[C.ADMIN_TEMPLATE]).length === RoleTemplates.roleTemplates[C.ADMIN_TEMPLATE].length){
				// admin role list all projects on that db
				adminAccounts.push(role.db);
				promises.push(
					ProjectSetting.find({account: role.db}).then(settings => {
						settings.forEach(setting => {

							let projectName = setting._id;
							addToProjectList(role.db, projectName, RoleTemplates.roleTemplates[C.ADMIN_TEMPLATE]);

						});
					})
				);

			} else {

				let projectNames = getProjectNames(role.inheritedPrivileges);
				let permissions;

				projectNames.forEach(projectName => {
					if(projectName){
						permissions = RoleTemplates.determinePermission(role.db, projectName, role);
					}

					if(permissions){
						addToProjectList(role.db, projectName, permissions);
					}
				});

			}
		});

		return Promise.all(promises).then(() => {
			return {
				projects:  _.values(projects),
				adminAccounts: _.unique(adminAccounts)
			};
		});

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