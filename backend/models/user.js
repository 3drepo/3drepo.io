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
var DB = require('../db/db');
var crypto = require('crypto');
var utils = require("../utils");
var History = require('./history');
var projectSetting = require('./projectSetting');
var Role = require('./role');
var Mailer = require('../mailer/mailer');

var schema = mongoose.Schema({
	_id : String,
	user: String,
	//db: String,
	customData: {

		bids: [{
			package: String,
			project: String,
			account: String,
			role: String
		}],

		projects: [{
			account: String,
			project: String
		}],

		firstName: String,
		lastName: String,
		email: String,
		inactive: Boolean,
		resetPasswordToken: {
			expiredAt: Date,
			token: String
		},
		emailVerifyToken: {
			expiredAt: Date,
			token: String
		},
		subscriptions: [{
			active: Boolean,
			updatedAt: Date,
			createdAt: Date,
			billingUser: String,
			expiredAt: Date,
			limits: {},
			token: String,
			plan: String,
			database: String,
			payments: [{
				gateway: String,
				raw: {},
				createdAt: Date,
				currency: String,
				amount: String
			}]
		}],
		avatar: Object
	},
	roles: [{}]
});

schema.statics.historyChunksStats = function(dbName){
	'use strict';

	return ModelFactory.db.db(dbName).listCollections().toArray().then(collections => {

		let historyChunks = _.filter(collections, collection => collection.name.endsWith('.history.chunks'));
		let promises = [];
		
		historyChunks.forEach(collection => {
			promises.push(ModelFactory.db.db(dbName).collection(collection.name).stats());
		});

		return Promise.all(promises);

	});

	
};

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


// schema.statics.filterRoles = function(roles, database){
// 	return  database ? _.filter(users, { 'db': database }) : roles;
// };

schema.statics.findByUserName = function(user){
	return this.findOne({account: 'admin'}, { user });
};

schema.statics.findBillingUserByToken = function(token){
	return this.findSubscriptionByToken(null, token).then(subscription => {
		if(subscription){
			return this.findByUserName(subscription.billingUser);
		}

		return Promise.resolve();
	});
};


schema.statics.updatePassword = function(logger, username, oldPassword, token, newPassword){
	'use strict';

	if(!((oldPassword || token) && newPassword)){
		return Promise.reject({ resCode: responseCodes.INVALID_INPUTS_TO_PASSWORD_UPDATE});
	}

	var checkUser;
	var user;

	if(oldPassword){
		checkUser = this.authenticate(logger, username, oldPassword);
	} else if (token){

		checkUser = this.findByUserName(username).then(_user => {

			user = _user;

			var tokenData = user.customData.resetPasswordToken;
			if(tokenData && tokenData.token === token && tokenData.expiredAt > new Date()){
				return Promise.resolve();
			} else {
				return Promise.reject({ resCode: responseCodes.TOKEN_INVALID });
			}
		});
	}

	return checkUser.then(() => {

		let updateUserCmd = { 
			'updateUser' : username,
			'pwd': newPassword
		 };

		 return ModelFactory.db.admin().command(updateUserCmd);

	}).then(() => {

		if(user){
			user.customData.resetPasswordToken = undefined;
			return user.save().then(() => Promise.resolve());
		} 

		return Promise.resolve();

	}).catch( err => {
		return Promise.reject(err.resCode ? err : {resCode: utils.mongoErrorToResCode(err)});
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

schema.statics.verify = function(username, token, allowRepeatedVerify){
	'use strict';

	return this.findByUserName(username).then(user => {
		
		var tokenData = user.customData.emailVerifyToken;

		if(!user.customData.inactive && !allowRepeatedVerify){
			return Promise.reject({ resCode: responseCodes.ALREADY_VERIFIED});

		} else if(tokenData.token === token && tokenData.expiredAt > new Date()){


			//create admin role for own database

			return Role.findByRoleID(`${username}.admin`).then(role => {

				if(!role){
					return Role.createAdminRole(username);
				} else {
					return Promise.resolve();
				}

			}).then(() => {

				let adminRoleName = 'admin';
				return User.grantRoleToUser(username, username, adminRoleName);

			}).then(() => {

				user.customData.inactive = undefined;
				//user.customData.emailVerifyToken = undefined;
				return user.save();

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


	return this.save();
};

schema.statics.getForgotPasswordToken = function(username, email, tokenExpiryTime){

	var expiryAt = new Date();
	expiryAt.setHours(expiryAt.getHours() + tokenExpiryTime);

	var resetPasswordToken = {
		token: crypto.randomBytes(64).toString('hex'),
		expiredAt: expiryAt
	};

	return this.findByUserName(username).then(user => {

		if(user.customData.email !== email){
			return Promise.reject({ resCode: responseCodes.USER_EMAIL_NOT_MATCH});
		}

		user.customData.resetPasswordToken = resetPasswordToken;

		return user.save();
	
	}).then(() => {
		return Promise.resolve(resetPasswordToken);
	});


};

schema.statics.grantRoleToUser = function(username, db, role){
	'use strict';

	return this.findByUserName(username).then(user => {
		
		let dup = false;
		user.roles.forEach(_role => {
			if(_role.role === role && _role.db === db){
				dup = true;
			}
		});

		if(!dup){
			user.roles.push({ role, db});

			let grantRoleCmd = { 
				grantRolesToUser: username,
				roles: user.roles
			};

			return ModelFactory.db.admin().command(grantRoleCmd);
		}

		return Promise.resolve();

	});
};

// list project readable by this user
schema.methods.getPrivileges = function(){
	'use strict';

	let viewRolesCmd = { rolesInfo : this.roles, showPrivileges: true };
	return ModelFactory.db.admin().command(viewRolesCmd).then(docs => {


		let privs = [];
		if (docs && docs.roles.length) {
			let rolesArr = docs.roles;
			for (let i = 0; i < rolesArr.length; i++) {
				privs = privs.concat(rolesArr[i].inheritedPrivileges);
			}
		}

		return Promise.resolve(privs);
	});

};

schema.methods.listAccounts = function(){
	'use strict';

	let accounts = [];

	this.roles.forEach(role => {
		if(role.role === 'admin'){
			accounts.push({ account: role.db, projects: [] });
		}
	});

	//backward compatibility, user has access to database with the name same as their username
	if(!_.find(accounts, account => account.account === this.user)){
		accounts.push({ account: this.user, projects: [] });
	}
	
	// group projects by accounts
	return this.listProjects().then(projects => {
		
		projects.forEach(project => {

			let account = _.find(accounts, account => account.account === project.account);

			if(!account){

				account = {
					account: project.account,
					projects: []
				};

				accounts.push(account);
			}

			account.projects.push({
				project: project.project,
				timestamp: project.timestamp,
				status: project.status,
			});

		});

		let getQuotaPromises = [];
		accounts.forEach(account => {
			account.projects.sort((a, b) => {
				if(a.timestamp < b.timestamp){
					return 1;
				} else if (a.timestamp > b.timestamp){
					return -1;
				} else {
					return 0;
				}
			});

			getQuotaPromises.push(
				User.findByUserName(account.account).then(user => {
					account.quota = user.haveActiveSubscriptions() ? user.getSubscriptionLimits() : undefined;
				})
			);
		});

		accounts.sort((a, b) => {
			if (a.account.toLowerCase() < b.account.toLowerCase()){
				return -1;
			} else if (a.account.toLowerCase() > b.account.toLowerCase()) {
				return 1;
			} else {
				return 0;
			}
		});


		return Promise.all(getQuotaPromises).then(() => {
			return Promise.resolve(accounts);
		});
	});
};

schema.methods.listProjects = function(){
	'use strict';

	return this.getPrivileges().then(privs => {

		// This is the collection that we check for
		// when seeing if a project is viewable
		let filterCollectionType = "history";
		let projects = [];

		for(var i = 0; i < privs.length; i++){
			if (privs[i].resource.db && privs[i].resource.collection && privs[i].resource.db !== "system"){
				if (privs[i].resource.collection.substr(-filterCollectionType.length) === filterCollectionType){
					if (privs[i].actions.indexOf("find") !== -1){
						var baseCollectionName = privs[i].resource.collection.substr(0, privs[i].resource.collection.length - filterCollectionType.length - 1);

						projects.push({
							"account" : privs[i].resource.db,
							"project" : baseCollectionName
						});
					}
				}
			}
		}

		return Promise.resolve(projects);

	}).then(projects => {

		//get timestamp for project
		let promises = [];
		projects.forEach((project, index) => {
			promises.push(
				History.findByBranch(project, 'master').then(history => {

					if(history){
						projects[index].timestamp = history.timestamp;
					} else {
						projects[index].timestamp = null;
					}

					return Promise.resolve();
					
				}).catch(() => Promise.resolve())
			);
		});

		return Promise.all(promises).then(() => Promise.resolve(projects));
	
	}).then(projects => {

		//get status for project
		let promises = [];

		projects.forEach((project, index) => {
			promises.push(
				projectSetting.findById(project, project.project).then(setting => {

					if(setting){
						projects[index].status = setting.status;
					}

					return Promise.resolve();
					
				}).catch(() => Promise.resolve())
			);
		});

		return Promise.all(promises).then(() => Promise.resolve(projects));
	});
};



//TO-DO: we have only one plan now so it is hardcoded
var subscriptions = {
	'THE-100-QUID-PLAN': {
		plan: 'THE-100-QUID-PLAN',
		limits: {
			spaceLimit: 10737418240, //bytes
			collaboratorLimit: 5,
		},
		db: this.user,
		billingCycle: 1, //month
		freeTrial: 1, //month
		currency: 'GBP',
		amount: 100
	}
};

function getSubscription(plan){
	return subscriptions[plan];
}

//TO-DO: payment, subscription activation methods, move to somewhere instead of staying in user.js
// maybe something like schema.statics.subscriptions = require('...')
schema.statics.getSubscription = function(plan) {
	return subscriptions[plan];
};

schema.methods.createSubscriptionToken = function(plan, billingUser){
	'use strict';

	if(plan === 'THE-100-QUID-PLAN'){

		let token = crypto.randomBytes(64).toString('hex');

		this.customData.subscriptions = this.customData.subscriptions || [];
		let subscriptions = this.customData.subscriptions;

		var now = new Date();

		let subscription = {
			token: token,
			plan: plan,
			db: this.user,
			billingUser: billingUser,
			createdAt: now,
			updatedAt: now,
			active: false,
			payments: []

		};

		subscriptions.push(subscription);

		return this.save().then(() => {
			return Promise.resolve(subscription);
		});

	} else {

		return Promise.reject({ resCode: responseCodes.INVALID_SUBSCRIPTION_PLAN });
	}
};

schema.statics.activateSubscription = function(token, paymentInfo, raw, disableEmail){
	'use strict';
	
	let query = {'customData.subscriptions.token': token};
	let subscription;
	let account;
	let dbUser;

	return this.findOne({account: 'admin'}, query).then(user => {

		dbUser =  user;

		if(!dbUser){
			return Promise.reject({ message: 'Token not found'});
		}

		subscription = _.find(dbUser.customData.subscriptions, subscription => subscription.token === token);

		if(!getSubscription(subscription.plan).freeTrial && paymentInfo.subscriptionSignup){
			// do nothing if no free trial is provided for this plan and getting a subscription sign up message with no payment
			return Promise.reject();
		}

		account = dbUser.user;

		return Role.findByRoleID(`${account}.admin`);

	}).then(role => {

		if(!role){
			return Role.createAdminRole(account);
		} else {
			return Promise.resolve();
		}

	}).then(() => {

		let adminRoleName = 'admin';
		return User.grantRoleToUser(subscription.billingUser, account, adminRoleName);

	}).then(() => {

		let now = new Date();

		let expiryAt = new Date(now.valueOf());
		expiryAt.setMonth(expiryAt.getMonth() + getSubscription(subscription.plan).billingCycle);

		let payment = {
			raw: raw,
			gateway: paymentInfo.gateway,
			createdAt: new Date(),
			currency: paymentInfo.currency,
			amount: paymentInfo.amount
		};

		subscription.limits = getSubscription(subscription.plan).limits;
		subscription.expiredAt = expiryAt;
		subscription.active = true;
		subscription.payments.push(payment);

		if(!disableEmail && !paymentInfo.subscriptionSignup){

			//send verification email
			let amount = payment.amount;
			let currency = payment.currency;
			if(currency === 'GBP'){
				currency = '£';
			}

			User.findByUserName(subscription.billingUser).then(user => {
				return Mailer.sendPaymentReceivedEmail(user.customData.email, {
					account: account,
					amount: currency + amount

				});
			}).catch(err => {
				console.log('Email Error', err);
			});

		}

		return dbUser.save().then(() => {
			return Promise.resolve({subscription, account, payment});
		});
		

		
	});

};

schema.methods.haveActiveSubscriptions = function(){
	return this.getActiveSubscriptions().length > 0;
};

schema.methods.getActiveSubscriptions = function(){
	'use strict';
	let now = new Date();
	return _.filter(
		this.customData.subscriptions, 
		subscription => subscription.active && subscription.expiredAt > now
	);
};

schema.methods.getSubscriptionLimits = function(){
	'use strict';

	let subscriptions = this.getActiveSubscriptions();

	let sumLimits = {
		spaceLimit: 0, 
		collaboratorLimit: 0
	};

	subscriptions.forEach(sub => {
		sumLimits.spaceLimit += sub.limits.spaceLimit;
		sumLimits.collaboratorLimit += sub.limits.collaboratorLimit;
	});

	return sumLimits;
};

schema.statics.findSubscriptionsByBillingUser = function(billingUser){
	'use strict';

	let subscriptions = [];

	return this.find({account: 'admin'}, { 
		'customData.subscriptions.billingUser': billingUser, 
	}).then( dbUsers => {

		dbUsers.forEach(dbUser => {
	
			let dbSubs = _.filter(dbUser.customData.subscriptions, subscription => subscription.billingUser === billingUser);
			dbSubs.forEach(dbSub => {

				dbSub = dbSub.toObject();
				dbSub.account = dbUser.user;
				subscriptions.push(dbSub);
			});
			
		});

		return Promise.resolve(subscriptions);

	});
};

schema.statics.findSubscriptionByToken = function(billingUser, token){
	'use strict';

	let query = { 
		'customData.subscriptions.token': token
	};

	if(billingUser){
		query['customData.subscriptions.billingUser'] = billingUser;
	}

	return this.findOne({account: 'admin'}, query, {
		'customData.subscriptions.$': 1,
		'user': 1
	}).then( dbUser => {

		let subscription = dbUser.customData.subscriptions[0].toObject();
		subscription.account = dbUser.user;

		return Promise.resolve(subscription);
	});
};

var User = ModelFactory.createClass(
	'User', 
	schema, 
	() => { 
		return 'system.users';
	}
);

module.exports = User;