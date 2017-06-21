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

		let project = Project.createInstance({account});
		project.name = name;

		if(userPermissions.indexOf(C.PERM_TEAMSPACE_ADMIN) === -1){
			project.permissions = [{
				user: username,
				permissions: [C.PERM_PROJECT_ADMIN]
			}];
		}

		return project.save();

	};

	schema.statics.delete = function(account, name){

		return Project.findOneAndRemove({account}, {name}).then(project => {
			if(!project){
				return Promise.reject(responseCodes.PROJECT_NOT_FOUND);
			} else {
				return project;
			}
		});
	};

	schema.statics.removeModel = function(account, model){
		return Project.update({account}, { models: model }, { '$pull' : { 'models': model}}, {'multi': true});
	};

	schema.methods.updateAttrs = function(data){
		
		const whitelist = ['name', 'permissions'];
		
		Object.keys(data).forEach(key => {
			if(whitelist.indexOf(key) !== -1){

				this[key] = data[key];
			}
		});

		return this.save();

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