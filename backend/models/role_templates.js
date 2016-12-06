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

	let flatten = function (arr) {
		return [].concat.apply([], arr);
	};

	let makeUnique = function (value, index, self) {
		return self.indexOf(value) === index;
	};

	let dbCollections = {
		"project": ["scene", "stash.3drepo.chunks", "stash.3drepo.files", "stash.3drepo", "stash.json_mpc.chunks", "stash.json_mpc.files", "stash.src.chunks", "stash.src.files"],
		"settings": ["settings"],
		"files": ["history.chunks", "history.files", "history"],
		"issues": ["issues"]
	};

	const DB_DELETE = ["remove"];
	const DB_READ_WRITE = ["find", "insert", "update",];
	const DB_READ = ["find"];

	let systemToDatabasePermissions = {};

	systemToDatabasePermissions[C.PERM_DELETE_PROJECT] = { "project": DB_DELETE };
	systemToDatabasePermissions[C.PERM_CHANGE_PROJECT_SETTINGS] = { "settings": DB_READ_WRITE };
	systemToDatabasePermissions[C.PERM_ASSIGN_LICENCE] = { "system.users": DB_READ_WRITE };
	systemToDatabasePermissions[C.PERM_UPLOAD_FILES] = { "files": DB_READ_WRITE };
	systemToDatabasePermissions[C.PERM_CREATE_ISSUE] = { "issues": DB_READ_WRITE };
	systemToDatabasePermissions[C.PERM_COMMENT_ISSUE] = { "issues": DB_READ_WRITE };
	systemToDatabasePermissions[C.PERM_READ_ISSUE] = { "issues": DB_READ };
	systemToDatabasePermissions[C.PERM_DOWNLOAD_PROJECT] = { "files": DB_READ };
	systemToDatabasePermissions[C.PERM_VIEW_PROJECT] = { "project": DB_READ };
	systemToDatabasePermissions[C.PERM_CREATE_PROJECT] = { "project": DB_READ_WRITE };

	let roleTemplates = {};

	roleTemplates[C.ADMIN_TEMPLATE] = [C.PERM_DELETE_PROJECT, C.PERM_CHANGE_PROJECT_SETTINGS, C.ASSIGN_LICENCE, C.PERM_UPLOAD_FILES, C.PERM_CREATE_ISSUE, C.PERM_COMMENT_ISSUE, C.DOWNLOAD_PROJECT, C.PERM_VIEW_PROJECT, C.PERM_CREATE_PROJECT];
	roleTemplates[C.COLLABORATOR_TEMPLATE] = [C.PERM_UPLOAD_FILES, C.PERM_CREATE_ISSUE, C.PERM_COMMENT_ISSUE, C.DOWNLOAD_PROJECT, C.PERM_VIEW_PROJECT, C.PERM_CREATE_PROJECT];
	roleTemplates[C.COMMENTER_TEMPLATE] = [C.PERM_CREATE_ISSUE, C.PERM_COMMENT_ISSUE, C.DOWNLOAD_PROJECT, C.PERM_VIEW_PROJECT, C.PERM_CREATE_PROJECT];
	roleTemplates[C.VIEWER_TEMPLATE] = [C.PERM_VIEW_PROJECT];

	let createRoleFromTemplate = function (account, project, template, roleName) {
		if (!(template in roleTemplates)) {
			return Promise.reject(responseCodes.INVALID_ROLE_TEMPLATE);
		}

		roleName = roleName || `${account}.${project}.${template}`;

		let createRoleCmd = {
			"createRole": `${project}.${template}`
		};

		let myTemplate = roleTemplates[template];
		let privileges = [];

		let dbPermissions = {};

		for (let permIDX in myTemplate) {
			let perm = myTemplate[permIDX];

			for (let coll in systemToDatabasePermissions[perm]) {
				let collList = dbCollections[coll];

				for (let collName in collList) {
					dbPermissions[collName] = dbPermissions.get(collName, []);
					dbPermissions[collName].push(collList[collName]);
				}
			}
		}

		for (let coll in dbPermissions) {
			dbPermissions[coll] = flatten(dbPermissions[coll])
				.filter(makeUnique);
		}

		for (let coll in dbPermissions) {
			privileges.push({
				"resource": {
					"db": account,
					"collection": `${project}.{coll}`
				},
				"actions": dbPermissions[coll]
			});
		}

		createRoleCmd.privileges = privileges;

		return ModelFactory.db.db(account)
			.command(createRoleCmd);
	};

	

	module.exports = {
		roleTemplates: roleTemplates,
		createRoleFromTemplate: createRoleFromTemplate
	};

})();