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
var responseCodes = require('../response_codes.js');
var _ = require('lodash');

var schema = mongoose.Schema({
	_id : String,
	owner: String,
	users: [String],
	desc: String,
	type: String,
	status: {type: String, default: 'ok'},
	errorReason: Object,
	federate: Boolean,
	permissions: [Number],
	properties: {
		"pinSize" : Number,
		"avatarHeight" : Number,
		"visibilityLimit" : Number,
		"speed" : Number,
		"zNear" : Number,
		"zFar" : Number,
		"unit": String, //cm, m, ft, mm
		"mapTile": {
			lat: Number,
			lon: Number,
			y: Number
		},
		code: String,
		topicTypes: [{
			_id: false,
			value: String,
			label: String
		}]

	},
	//redundant field to speed up listing collaborators
	collaborators: [{
		user: String,
		role: {type: String}
	}],

});


schema.statics.defaultTopicTypes = [
	{value: "for_information", label: "For information"},
	{value: "vr", label: "VR"}
];

schema.path('properties.topicTypes').get(function(v) {
	return v.length === 0 ? schema.statics.defaultTopicTypes : v;
});

schema.set('toObject', { getters: true });

schema.statics.projectCodeRegExp = /^[a-zA-Z0-9]{0,5}$/;
schema.methods.updateProperties = function(updateObj){
	'use strict';

	Object.keys(updateObj).forEach(key => {

		if(key === 'code' && updateObj[key] && !schema.statics.projectCodeRegExp.test(updateObj[key])){
			throw responseCodes.INVALID_PROJECT_CODE;
		}

		if(key === 'topicTypes'){
			
			let topicTypes = {};
			updateObj[key].forEach(type => {

				if(!type || !type.trim()){
					return;
				}
				
				//generate value from label
				let value = type.trim().toLowerCase().replace(/ /g, '_');
				
				if(topicTypes[value]){
					throw responseCodes.ISSUE_DUPLICATE_TOPIC_TYPE;
				} else {
					topicTypes[value] = {
						value,
						label: type.trim()
					};
				}
			});

			this.properties[key] = _.values(topicTypes);
		} else {
			this.properties[key] = updateObj[key];
		}
		
	});

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


var ProjectSetting = ModelFactory.createClass(
	'ProjectSetting',
	schema,
	() => {
		return 'settings';
	}
);

module.exports = ProjectSetting;
