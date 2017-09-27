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


(() => {
	"use strict";

	const ModelSetting = require('../models/modelSetting');
	const Project = require('../models/project');
	const User = require('../models/user');

	// get permissions adapter
	function getPermissionsAdapter(account) {

		return {
			getUser: function(){
				if(this.dbUser){
					return Promise.resolve(this.dbUser);
				} else {
					return User.findByUserName(account).then(user => {
						this.dbUser = user;
						return this.dbUser;
					});
				}
			},

			accountLevel: function(username){

				return this.getUser().then(user => {

					if(!user){
						return [];
					}

					const permission = user.customData.permissions.findByUser(username);

					if(!permission){
						return [];
					}
					
					return permission.permissions;
				});
			},

			projectLevel: function(username, project){

				return Project.findOne({account}, { name: project}).then(project => {

					if(!project){
						return [];
					}

					const permission = project.findPermsByUser(username);
					
					if(!permission){
						return [];
					}
					
					return permission.permissions;

					
				});
			},

			modelLevel: function(username, model){

				let user;
				let projectPerms = [];

				const projectQuery = { models: model, 'permissions.user': username };
				// project admin have access to models underneath it.
				return Project.findOne({account}, projectQuery, { 'permissions.$' : 1 } ).then(project => {

					if(project && project.permissions){
						projectPerms = project.permissions[0].permissions;
					}

					return this.getUser();

				}).then(_user => {

					user = _user;
					return ModelSetting.findById({account, model}, model);

				}).then(setting => {

					if(!setting){
						return projectPerms;
					}

					const perm = setting.findPermissionByUser(username);

					if(!perm){
						return projectPerms;
					}

					return projectPerms.concat(user.customData.permissionTemplates.findById(perm.permission).permissions);
				});
			}
		};
	}

	module.exports = getPermissionsAdapter;

})();
