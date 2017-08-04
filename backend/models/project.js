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
	const C = require("../constants");
	const responseCodes = require("../response_codes.js");
	const ModelFactory = require("./factory/modelFactory");
	const utils = require("../utils");
	const _ = require('lodash');
	const ModelSetting = require('./modelSetting');

	const schema = mongoose.Schema({
		name: { type: String, unique: true},
		models: [String],
		permissions: [{
			_id: false,
			user: { type: String, required: true },
			permissions: [String]
		}]
	});

	schema.pre('save', function checkInvalidName(next){

		if(C.PROJECT_DEFAULT_ID === this.name){
			return next(utils.makeError(responseCodes.INVALID_PROJECT_NAME));
		}

		return next();
	});

	schema.pre('save', function checkDupName(next){

		Project.findOne(this._dbcolOptions, {name: this.name}).then(project => {
			if(project && project.id !== this.id){
				return next(utils.makeError(responseCodes.PROJECT_EXIST));
			} else {
				return next();
			}
		});
	});

	schema.pre('save', function checkPermissionName(next){

		for (let i=0; i < this.permissions.length; i++){
			let permission = this.permissions[i];

			if (_.intersection(C.PROJECT_PERM_LIST, permission.permissions).length < permission.permissions.length){
				return next(utils.makeError(responseCodes.INVALID_PERM));
			}
		}

		return next();
	});

	schema.statics.createProject = function(account, name, username, userPermissions){
		const User = require('./user');

		let project = Project.createInstance({account});
		project.name = name;

		if(userPermissions.indexOf(C.PERM_TEAMSPACE_ADMIN) === -1){
			project.permissions = [{
				user: username,
				permissions: [C.PERM_PROJECT_ADMIN]
			}];
		}

		return project.save().then(() => project);

	};

	schema.statics.delete = function(account, name){

		const User = require('./user');
		const ModelHelper = require('./helper/model');

		let project;

		return Project.findOneAndRemove({account}, {name}).then(_project => {

			project = _project;

			//remove all models as well

			if(!project){
				return Promise.reject(responseCodes.PROJECT_NOT_FOUND);
			} else {
				return Promise.resolve();
			}
		}).then(() => {
			return Promise.all(project.models.map(m => ModelHelper.removeModel(account, m, true)));
		}).then(() => project);
	};

	schema.statics.removeModel = function(account, model){
		return Project.update({account}, { models: model }, { '$pull' : { 'models': model}}, {'multi': true});
	};

	schema.methods.updateAttrs = function(data){

		const account = this._dbcolOptions.account;
		const whitelist = ['name', 'permissions'];
		const User = require('./user');

		let usersToRemove = [];
		let usersToAdd = [];

		if(data.permissions){
			// user to delete
			for(let i = data.permissions.length -1; i >=0; i--){
				if(!Array.isArray(data.permissions[i].permissions) || data.permissions[i].permissions.length === 0){
					data.permissions.splice(i ,1);
				}
			}

			usersToRemove = _.difference(this.permissions.map(p => p.user), data.permissions.map(p => p.user));
			usersToAdd = _.difference(data.permissions.map(p => p.user), this.permissions.map(p => p.user));
		}

		Object.keys(data).forEach(key => {
			if(whitelist.indexOf(key) !== -1){

				this[key] = data[key];
			}
		});

		let check = Promise.resolve();

		if(this.permissions.length){
			
			check = User.findByUserName(this._dbcolOptions.account).then(teamspace => {

				const someUserNotAssignedWithLicence = this.permissions.some(
					perm => !teamspace.customData.billing.subscriptions.findByAssignedUser(perm.user)
				);

				if(someUserNotAssignedWithLicence){
					return Promise.reject(responseCodes.USER_NOT_ASSIGNED_WITH_LICENSE);
				}

			});
		}

		return check.then(() => {

			let userPromises = [];

			usersToRemove.forEach(user => {
				// remove all model permissions in this project as well, if any
				userPromises.push(
					ModelSetting.find(this._dbcolOptions, { 'permissions.user': user}).then(settings => 
						Promise.all(
							settings.map(s => s.changePermissions(s.permissions.filter(perm => perm.user !== user)))
						)
					)
				);
			});

			return Promise.all(userPromises);

		}).then(() => {
			return this.save();
		});

	};

	schema.statics.findAndPopulateUsers = function(account, query){

		const User = require('./user');

		let subscriptions;

		return User.findByUserName(account.account).then(user => {
			
			subscriptions = user.customData.billing.subscriptions.getActiveSubscriptions({ skipBasic: true});
			return Project.find(account, query);
		
		}).then(projects => {
			
			if(projects){
				projects.forEach(p => Project.populateUsers(subscriptions, p));
			}

			return projects;

		});
	}


	schema.statics.findOneAndPopulateUsers = function(account, query){

		const User = require('./user');

		let subscriptions;

		return User.findByUserName(account.account).then(user => {
			
			subscriptions = user.customData.billing.subscriptions.getActiveSubscriptions({ skipBasic: true});
			return Project.findOne(account, query);
		
		}).then(project => {
			
			if(project){
				return Project.populateUsers(subscriptions, project);
			} else {
				return Promise.reject(responseCodes.PROJECT_NOT_FOUND);
			}

		});
	}

	schema.statics.populateUsers = function(subscriptions, project){

		subscriptions && subscriptions.forEach(sub => {

			const userFound = project.permissions.find(perm => perm.user === sub.assignedUser);

			if(!userFound && sub.assignedUser){
				project.permissions.push({
					user: sub.assignedUser
				});
			}
		});

		return project;
	};


	schema.methods.findPermsByUser = function(username){
		return this.permissions.find(perm => perm.user === username);
	};

	const Project = ModelFactory.createClass(
		"Project",
		schema,
		() => {
			return "projects";
		}
	);

	module.exports = Project;

})();
