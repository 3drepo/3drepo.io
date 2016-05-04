var mongoose = require('mongoose');
var ModelFactory = require('./factory/modelFactory');
var responseCodes = require('../response_codes.js');
var _ = require('lodash');
var DB = require('../db/db');
var crypto = require('crypto');
var utils = require("../utils");

var schema = mongoose.Schema({
	_id : String,
	user: String,
	//db: String,
	customData: {},
	roles: {}
});

schema.statics.authenticate = function(logger, username, password){
	'use strict';

	let authDB = DB(logger).getAuthDB();

	if(!username || !password){
		return Promise.reject();
	}

	return authDB.authenticate(username, password).then(() => {
		return this.findByUserName(username);
	}).then(user => {
		if(user.customData && user.customData.inactive) {
			return Promise.reject({resCode: responseCodes.USER_NOT_VERIFIED});
		} 
		return Promise.resolve(user);
	}).catch( err => {
		return Promise.reject(err.resCode ? err : {resCode: utils.mongoErrorToResCode(err)});
	});
};


schema.statics.filterRoles = function(roles, database){
	return  database ? _.filter(users, { 'db': database }) : roles;
};

schema.statics.findByUserName = function(user){
	return this.findOne({account: 'admin'}, { user });
};

//updatePassword is static because it doesn't need a full user object, so save a db call
schema.statics.updatePassword = function(logger, username, oldPassword, newPassword){
	'use strict';

	if(!(oldPassword && newPassword)){
		return Promise.reject(responseCodes.INVALID_INPUTS_TO_PASSWORD_UPDATE);
	}

	return this.authenticate(logger, username, oldPassword).then(() => {

		let updateUserCmd = { 
			'updateUser' : username,
			'pwd': newPassword
		 };

		 return ModelFactory.db.admin().command(updateUserCmd);
	});
};

schema.statics.createUser = function(logger, username, password, customData, tokenExpiryTime){
	'use strict';
	let adminDB = ModelFactory.db.admin();
	
	let cleanedCustomData = {};
	['firstName', 'lastName', 'email'].forEach(key => {
		if (customData[key]){
			cleanedCustomData[key] = customData[key];
		}
	});

	var expiryAt = new Date();
	expiryAt.setHours(expiryAt.getHours() + tokenExpiryTime);

	cleanedCustomData.inactive = true;
	cleanedCustomData.emailVerifyToken = {
		token: crypto.randomBytes(64).toString('hex'),
		expiredAt: expiryAt
	};

	return adminDB.addUser(username, password, {customData: cleanedCustomData, roles: []}).then( () => {
		return Promise.resolve(cleanedCustomData.emailVerifyToken);
	}).catch(err => {
		return Promise.reject({resCode : utils.mongoErrorToResCode(err)});
	});
};

schema.statics.verify = function(username, token){
	return this.findByUserName(username).then(user => {
		
		var tokenData = user.customData.emailVerifyToken;

		if(!user.customData.inactive){
			return Promise.reject({ resCode: responseCodes.ALREADY_VERIFIED});

		} else if(tokenData.token === token && tokenData.expiredAt > new Date()){

			delete user.customData.inactive;
			delete user.customData.emailVerifyToken;
			user.markModified('customData');

			return user.save(() => {
				return Promise.resolve(true);
			});
		
		} else {
			return Promise.reject({ resCode: responseCodes.TOKEN_INVALID});
		}
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