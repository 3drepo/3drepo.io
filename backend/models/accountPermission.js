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

	const mongoose = require("mongoose");
	const schema = mongoose.Schema({
		_id: false,
		user: String,
		permissions: [String]
	});
	const responseCodes = require('../response_codes.js');
	const C = require('../constants');
	const _ = require('lodash');
	const Project = require('./project');

	const methods = {
		init(user, permissions) {

			this.user = user;
			this.permissions = permissions;
			return this;
		},

		findByUser(user){
			return this.permissions.find(perm => perm.user === user);
		},

		_check(user, permission){

			if(!this.user.customData.billing.subscriptions.findByAssignedUser(user)){
				return Promise.reject(responseCodes.USER_NOT_ASSIGNED_WITH_LICENSE);
			}

			const isPermissionInvalid = permission.permissions && 
				_.intersection(permission.permissions, C.ACCOUNT_PERM_LIST).length !== permission.permissions.length;

			if (isPermissionInvalid) {
				return Promise.reject(responseCodes.INVALID_PERM);
			}

			return Promise.resolve();

		},

		add(permission){

			return this._check(permission.user, permission).then(() => {
				
				if(this.findByUser(permission.user)){
					//return Promise.reject(responseCodes.DUP_ACCOUNT_PERM);
					return this.update(permission.user, permission)
				}
				if(permission.permissions.length === 0)
				{
					//Adding a user with empty permissions is not allowed
					return Promise.reject(responseCodes.ACCOUNT_PERM_EMPTY);
				}

				this.permissions.push(permission);
				return this.user.save().then(() => permission);

			});
		},

		update(user, permission){

			return this._check(user, permission).then(() => {
				if(permission.permissions.length === 0)
				{
					//this is actually a remove
					return this.remove(permission.user);
				}
				else
				{
					console.log(this.user.customData);
					const currPermission = this.findByUser(user);
					console.log(currPermission);

					if(currPermission){
						currPermission.permissions = permission.permissions;
					} else {
						return Promise.reject(responseCodes.ACCOUNT_PERM_NOT_FOUND);
					}
					return this.user.save().then(() => permission);
				}

			});
		},

		remove(user){

			let index = -1;
			
			this.permissions.find((perm, i) => {
				if(perm.user === user){
					index = i;
					return true;
				}
			});

			if (index === -1) {
				return Promise.reject(responseCodes.ACCOUNT_PERM_NOT_FOUND);
			} else {
				this.permissions.splice(index, 1);
				return this.user.save().then(() => {
					// remove all project permissions in this project as well, if any
					return Project.find({ account: this.user.user },{ 'permissions.user': user} );
				}).then(projects => {
					return Promise.all(
						projects.map(proj => proj.updateAttrs({ 
							permissions: proj.permissions.filter(perm => perm.user !== user) 
						}))
					);
				}).then(() => this.user);

			}

		}
	};

	// Mongoose doesn't support subschema static method
	module.exports = {
		schema, methods
	};

})();
