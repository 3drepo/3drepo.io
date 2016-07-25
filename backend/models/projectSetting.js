/**
 *  Copyright (C) 2014 3D Repo Ltd
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


var mongoose = require('mongoose');
var ModelFactory = require('./factory/modelFactory');
var Role = require('./role');
var responseCodes = require('../response_codes.js');

var schema = mongoose.Schema({
	_id : String,
	owner: String,
	users: [String],
	desc: String,
	type: String,
	status: {type: String, default: 'ok'},
	errorReason: Object,
	permissions: [Number],
	properties: {}, // TO-DO: ask tim/carmen for full properties and update this schema
	info: mongoose.Schema({

		name: String,
		site: String,
		code: String,
		client: String,
		budget: Number,
		completedBy: Date,
		contact: String
	}),

	//redundant field to speed up listing collaborators
	collaborators: [{
		user: String,
		role: {type: String}
	}]
});

schema.statics.allowedProps = [ 'unit', 'seaLevel', 'mapTile.lat', 'mapTile.lon', 'mapTile.y'];

schema.methods.updateProperties = function(updateObj){
	'use strict';

	let allowedProps = this.constructor.allowedProps;

	this.properties = this.properties || {};

	allowedProps.forEach(key => {

		let keys = key.split('.');
		//only support 1 level 

		if(keys.length > 2 ){
			throw new Error('Only support 1 level of nesting');
		} else if(keys.length === 2 && updateObj[keys[1]]){
			this.properties[keys[0]] = this.properties[keys[0]] || {};
			this.properties[keys[0]][keys[1]] = updateObj[keys[1]];
			
		} else if(updateObj[keys[0]]){
			this.properties[keys[0]] = updateObj[keys[0]];
		}

	});

	// this is needed since properties didn't have a strict schema, need to tell mongoose this is changed
	this.markModified('properties');
};



schema.methods.findCollaborator = function(user, role){
	'use strict';

	let len = this.collaborators.length;


	for(let i=0; i<len ; i++){

		let collaborator = this.collaborators[i];
		if(collaborator.user === user && collaborator.role === role){
			return collaborator;
		}
	}

	return null;
};

schema.methods.removeCollaborator = function(user, role){
	'use strict';

	let collaborator = this.findCollaborator(user, role);
	if(collaborator){
		this.collaborators.pull(collaborator._id);
	}

	return collaborator;
};

schema.statics.removeProject = function(account, project){
	'use strict';

	let User = require('./user');
	let setting;
	return this.findById({account, project}, project).then(_setting => {

		setting = _setting;

		if(!setting){
			return Promise.reject({resCode: responseCodes.PROJECT_NOT_FOUND});
		}

		let owner = setting.owner;
		let collaborators = setting.collaborators;

		//remove all roles related to this project for these users
		let promises = [];
		
		//owner has a collaborator role
		promises.push(User.revokeRolesFromUser(owner, account, `${project}.collaborator`).catch(err =>{
			console.log(err);
			return Promise.resolve();
		}));
		
		collaborators.forEach(user => {
			promises.push(User.revokeRolesFromUser(user.user, account, `${project}.${user.role}`).catch(err => {
				console.log(err);
				return Promise.resolve();
			}));
		});

		return Promise.all(promises);

	}).then(() => {
		return ModelFactory.db.db(account).listCollections().toArray();

	}).then(collections => {
		//remove project collections
		console.log(collections);
		
		let promises = [];
		
		collections.forEach(collection => {
			if(collection.name.startsWith(project)){
				promises.push(ModelFactory.db.db(account).dropCollection(collection.name));
			}
		});

		return Promise.all(promises);

	}).then(() => {
		//remove project settings
		return setting.remove();

	}).then(() => {
		//remove roles related to this project from system.roles collection

		//remove collaborator role first because it inherit viewer role
		return Role.removeCollaboratorRole(account, project).then(() => {
			return Role.removeViewerRole(account, project);
		}).catch(err => {
			console.log(err);
			return Promise.resolve();
		});
	});

};

var ProjectSetting = ModelFactory.createClass(
	'ProjectSetting',
	schema,
	() => {
		return 'settings';
	}
);

module.exports = ProjectSetting;
