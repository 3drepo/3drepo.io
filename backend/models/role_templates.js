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

	const C = require("../constants");
	const ModelFactory = require("./factory/modelFactory");
	const responseCodes = require("../response_codes");
	const _ = require('lodash');

	let flatten = function (arr) {
		return [].concat.apply([], arr);
	};

	let makeUnique = function (value, index, self) {
		return self.indexOf(value) === index;
	};

	let dbCollections = {
		"project": ["history", "scene", "stash.3drepo.chunks", "stash.3drepo.files", "stash.3drepo", "stash.json_mpc.chunks", "stash.json_mpc.files", "stash.src.chunks", "stash.src.files"],
		"settings": ["settings"],
		"files": ["history.chunks", "history.files", "history"],
		"issues": ["issues"],
		"system.users": ["system.users"]
	};

	const DB_DELETE = ["remove"];
	const DB_READ_WRITE_UPDATE = ["find", "insert", "update"];
	const DB_READ_WRITE = ["find", "insert"];
	const DB_READ = ["find"];

	let systemToDatabasePermissions = {};

	systemToDatabasePermissions[C.PERM_DELETE_PROJECT] = { "project": DB_DELETE };
	systemToDatabasePermissions[C.PERM_CHANGE_PROJECT_SETTINGS] = { "settings": DB_READ_WRITE_UPDATE };
	systemToDatabasePermissions[C.PERM_ASSIGN_LICENCE] = { "system.users": DB_READ_WRITE };
	systemToDatabasePermissions[C.PERM_UPLOAD_FILES] = { "files": DB_READ_WRITE };
	systemToDatabasePermissions[C.PERM_CREATE_ISSUE] = { "issues": DB_READ_WRITE_UPDATE };
	systemToDatabasePermissions[C.PERM_COMMENT_ISSUE] = { "issues": DB_READ_WRITE_UPDATE };
	systemToDatabasePermissions[C.PERM_VIEW_ISSUE] = { "issues": DB_READ };
	systemToDatabasePermissions[C.PERM_DOWNLOAD_PROJECT] = { "files": DB_READ };
	systemToDatabasePermissions[C.PERM_VIEW_PROJECT] = { "project": DB_READ };
	systemToDatabasePermissions[C.PERM_CREATE_PROJECT] = { "project": DB_READ_WRITE };

	let roleTemplates = {};

	roleTemplates[C.ADMIN_TEMPLATE] = [C.PERM_DELETE_PROJECT, C.PERM_CHANGE_PROJECT_SETTINGS, C.PERM_ASSIGN_LICENCE, C.PERM_UPLOAD_FILES, C.PERM_CREATE_ISSUE, C.PERM_COMMENT_ISSUE, C.PERM_DOWNLOAD_PROJECT, C.PERM_VIEW_PROJECT, C.PERM_CREATE_PROJECT, C.PERM_VIEW_ISSUE];
	roleTemplates[C.COLLABORATOR_TEMPLATE] = [C.PERM_VIEW_PROJECT, C.PERM_UPLOAD_FILES, C.PERM_CREATE_ISSUE, C.PERM_COMMENT_ISSUE, C.PERM_DOWNLOAD_PROJECT, C.PERM_VIEW_ISSUE];
	roleTemplates[C.COMMENTER_TEMPLATE] = [C.PERM_VIEW_PROJECT, C.PERM_COMMENT_ISSUE, C.PERM_VIEW_ISSUE];
	roleTemplates[C.VIEWER_TEMPLATE] = [C.PERM_VIEW_PROJECT, C.PERM_VIEW_ISSUE];

	//role templates for project
	let projectRoleTemplateLists = [C.COLLABORATOR_TEMPLATE, C.COMMENTER_TEMPLATE, C.VIEWER_TEMPLATE];

	let createRoleFromTemplate = function (account, project, template, roleName) {
		if (!(template in roleTemplates)) {
			return Promise.reject(responseCodes.INVALID_ROLE_TEMPLATE);
		}

		let createRoleCmd;

		//C.ADMIN_TEMPLATE is a special situation, it means admin role on the entire db and therefore all the projects within that db
		if(template === C.ADMIN_TEMPLATE){

			roleName = roleName || template;
			createRoleCmd = {
				'createRole' : roleName,
				'privileges': [],
				roles: [{ role: 'readWrite', db: account}]
			};

		} else {
			roleName = roleName || `${project}.${template}`;

			createRoleCmd = {
				"createRole": roleName
			};

			let myTemplate = roleTemplates[template];
			let privileges = [];

			let dbPermissions = {};

			for (let permIDX in myTemplate) {
				if(!myTemplate.hasOwnProperty(permIDX)){
					continue;
				}
				
				let perm = myTemplate[permIDX];

				for (let coll in systemToDatabasePermissions[perm]) {
					if(!systemToDatabasePermissions[perm].hasOwnProperty(coll)){
						continue;
					}

					let collList = dbCollections[coll];
					let dbActions = systemToDatabasePermissions[perm][coll];
					for (let collListIDX=0 ;  collListIDX < collList.length; collListIDX++) {
						let collName = collList[collListIDX];
						dbPermissions[collName] = dbPermissions[collName] || [];
						dbPermissions[collName].push(dbActions);
					}
				}
			}

			for (let coll in dbPermissions) {
				if(!dbPermissions.hasOwnProperty(coll)){
					continue;
				}

				dbPermissions[coll] = flatten(dbPermissions[coll])
					.filter(makeUnique);
			}

			for (let coll in dbPermissions) {
				if(!dbPermissions.hasOwnProperty(coll)){
					continue;
				}

				privileges.push({
					"resource": {
						"db": account,
						"collection": `${project}.${coll}`
					},
					"actions": dbPermissions[coll]
				});
			}

			createRoleCmd.privileges = privileges;
			createRoleCmd.roles = [];
		}

		return ModelFactory.db.db(account)
			.command(createRoleCmd).then(() => {
				return { role: roleName, db: account};
			});
	};

	let determinePermission = function(db, project, role){
		//speical mongo role readWrite on the whole database
		if(role.inheritedRoles && role.inheritedRoles.find(_role => _role.role === 'readWrite' && _role.db === db)){
			return roleTemplates[C.ADMIN_TEMPLATE];
		}

		if(!role.privileges){
			return [];
		}

		let permissions = [];

		Object.keys(systemToDatabasePermissions).forEach(permission => {
			
			let dbPerm = systemToDatabasePermissions[permission];
			let failedMatching = false;

			Object.keys(dbPerm).forEach(collSet => {
				
				let actions = dbPerm[collSet];

				dbCollections[collSet].forEach(collection => {

					let privMatched = role.privileges.find(priv => {
						return priv.resource.db === db &&
							priv.resource.collection === `${project}.${collection}` &&
							_.intersection(priv.actions, actions).length === actions.length;

					});

					if(!privMatched){
						failedMatching = true;
					}
				});
			});

			if(!failedMatching){
				permissions.push(permission);
			}

		});

		return permissions;
	};

	module.exports = {
		roleTemplates: roleTemplates,
		projectRoleTemplateLists: projectRoleTemplateLists,
		createRoleFromTemplate: createRoleFromTemplate,
		determinePermission: determinePermission,
		dbCollections: dbCollections
	};

})();