/**
 *  Copyright (C) 2017 3D Repo Ltd
 *
 *  This program is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU Affero General Public License as
 *  published by the Free Software Foundation, either version 3 of the
 *  License, or (at your option) any later version.
 *
 *  This program is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU Affero General Public License for more details.
 *
 *  You should have received a copy of the GNU Affero General Public License
 *  along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

"use strict";

const { v5Path } = require("../../interop");

const { hasAccessToTeamspace } = require(`${v5Path}/models/teamspaceSettings`);

const AccountPermissions = require("../models/accountPermissions");
const PermissionTemplates = require("../models/permissionTemplates");

(() => {
	const { findModelSettingById, findPermissionByUser } = require("../models/modelSetting");
	const { findOneProject, findProjectPermsByUser } = require("../models/project");
	const { getTeamspaceSettings } = require("../models/teamspaceSetting");
	const User = require("../models/user");
	const ResponseCodes = require("../response_codes");

	// get permissions adapter
	function getPermissionsAdapter(account) {
		return {
			getUser: function() {
				if(this.dbUser) {
					return Promise.resolve(this.dbUser);
				} else {
					return User.findByUserName(account).then(user => {
						this.dbUser = user;
						return this.dbUser;
					});
				}
			},

			accountLevel: async function(username) {

				await hasAccessToTeamspace(account, username);

				return getTeamspaceSettings(account, { permissions: 1 }).then(settings => {
					const permission = AccountPermissions.findByUser(settings, username);

					if(!permission) {
						return [];
					}

					return permission.permissions;
				}).catch(() => {
					throw ResponseCodes.RESOURCE_NOT_FOUND;
				});
			},

			projectLevel: function(username, modelName) {
				return findProjectPermsByUser(account, modelName, username).then(permission => {
					if (!permission) {
						return [];
					}

					return permission.permissions;
				});
			},

			modelLevel: function(username, model) {

				let projectPerms = [];

				const projectQuery = { models: model, "permissions.user": username };
				// project admin have access to models underneath it.
				return findOneProject(account, projectQuery, { "permissions.$" : 1 }).then(project => {
					if(project && project.permissions) {
						projectPerms = project.permissions[0].permissions;
					}

					return findModelSettingById(account, model);

				}).then(async setting => {
					if(!setting) {
						throw ResponseCodes.RESOURCE_NOT_FOUND;
					}

					const perm = await findPermissionByUser(account, model, username);

					if(!perm) {
						return projectPerms;
					}

					return projectPerms.concat(PermissionTemplates.findById(perm.permission).permissions);
				});
			}
		};
	}

	module.exports = getPermissionsAdapter;

})();
