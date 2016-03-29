var mongoose = require('mongoose');
var ModelFactory = require('./factory/modelFactory');
var responseCodes = require('../response_codes.js');
var _ = require('lodash');
var DB = require('../db/db');
var schema = mongoose.Schema({
	_id : String,
	user: String,
	//db: String,
	customData: {},
	roles: {}
});

schema.statics.authenticate = function(logger, username, password){
	'use strict';

	let adminDB = DB(logger).getAuthDB();

	if(!username || !password){
		return Promise.reject();
	}

	return adminDB.authenticate(username, password).then(() => {
		return this.findByUserName(username);
	}).then(user => {
		return Promise.resolve(user);
	});
};


schema.statics.filterRoles = function(roles, database){
	return  database ? _.filter(users, { 'db': database }) : roles;
};

schema.statics.findByUserName = function(user){
	return this.findOne({account: 'admin'}, { user });
};

//updatePassword is static because it doesn't need a full user object, so save a db call
schema.statics.updatePassword = function(username, oldPassword, newPassword){
	'use strict';

	if(!(oldPassword && newPassword)){
		return Promise.reject(responseCodes.INVALID_INPUTS_TO_PASSWORD_UPDATE);
	}

	return this.authenticate(username, oldPassword).then(() => {

		let updateUserCmd = { 
			'updateUser' : username,
			'pwd': newPassword
		 };

		 return ModelFactory.db.admin().command(updateUserCmd);
	});
};

schema.methods.getAvatar = function(){
	return this.customData && this.customData.avatar || null;
};

schema.methods.updateInfo = function(updateObj){
	'use strict';

	let updateableFields = [ 'firstName', 'lastName', 'email' ];
	
	this.customData = this.customData || {};

	updateableFields.forEach(field => {
		if(updateObj.hasOwnProperty(field)){
			this.customData[field] = updateObj[field];
		}
	});

	this.markModified('customData');

	return this.save();
};

var User = ModelFactory.createClass(
	'User', 
	schema, 
	() => { 
		return 'system.users';
	}
);

module.exports = User;