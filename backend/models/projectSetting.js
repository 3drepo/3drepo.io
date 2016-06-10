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

schema.statics.mapTilesProp = ['lat', 'lon', 'width', 'height'];


schema.methods.updateMapTileCoors = function(updateObj){
	'use strict';

	let mapTilesProp = this.constructor.mapTilesProp;

	this.properties = this.properties || {};
	this.properties.mapTile = this.properties.mapTile || {};

	mapTilesProp.forEach(key => {

		if(updateObj[key]){
			this.properties.mapTile[key] = updateObj[key];
		}
	});

	// this is needed since properties didn't have a strict schema, need to tell mongoose this is changed
	this.markModified('properties');
	return this.save();

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
		
		promises.push(User.revokeRolesFromUser(owner, account, `${project}.collaborator`));
		
		collaborators.forEach(user => {
			promises.push(User.revokeRolesFromUser(user.user, account, `${project}.${user.role}`));
		});

		return Promise.all(promises);

	}).then(() => {
		return ModelFactory.db.db(account).listCollections().toArray();

	}).then(collections => {
		//remove project collections
		console.log(collections);
		
		let promises = [];
		
		collections.forEach(collection => {
			if(collection.collectionName.startsWith(project)){
				promises.push(ModelFactory.db.db(account).dropCollection(collection.name));
			}
		});

		return Promise.all(promises);

	}).then(collections => {
		//remove project settings
		return setting.remove();

	}).then(() => {
		//remove roles related to this project from system.roles collection

		//remove collaborator role first because it inherit viewer role
		return Role.removeCollaboratorRole(account, project).then(() => {
			return Role.removeViewerRole(account, project)
		})
	});


}

var ProjectSetting = ModelFactory.createClass(
	'ProjectSetting',
	schema,
	() => {
		return 'settings';
	}
);

module.exports = ProjectSetting;
