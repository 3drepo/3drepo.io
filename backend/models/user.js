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
var Billing = require('./billing');
var projectSetting = require('./projectSetting');
var Role = require('./role');
var Mailer = require('../mailer/mailer');
var systemLogger = require("../logger.js").systemLogger;
var Payment = require('./payment');
var moment = require('moment');

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
			assignedUser: String,
			expiredAt: Date,
			limits: {},
			token: String, 
			plan: String,
			inCurrentAgreement: Boolean,
			database: String
		}],

		//global billing info
		billingAgreementId: String,
		paypalPaymentToken: String,
		billingUser: String,
		
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
		return Promise.reject({ resCode: responseCodes.INCORRECT_USERNAME_OR_PASSWORD });
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

schema.statics.findByEmail = function(email){
	return this.findOne({account: 'admin'}, { 'customData.email': email });
};

schema.statics.findByPaypalPaymentToken = function(token){
	return this.findOne({account: 'admin'}, { 'customData.paypalPaymentToken': token });
};

schema.statics.isEmailTaken = function(email, exceptUser){
	'use strict';

	let query = { 'customData.email': email};

	if(exceptUser){
		query = { 'customData.email': email, 'user': { '$ne': exceptUser }};
	}

	return this.count({account: 'admin'}, query);
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
	
	if(customData && (!customData.email || !customData.email.match(/^([a-zA-Z0-9_\-\.]+)@([a-zA-Z0-9_\-\.]+)\.([a-zA-Z]{2,5})$/))){
		return Promise.reject({ resCode: responseCodes.SIGN_UP_INVALID_EMAIL });
	}

	['firstName', 'lastName', 'email'].forEach(key => {
		if (customData && customData[key]){
			cleanedCustomData[key] = customData[key];
		}
	});

	var expiryAt = new Date();
	expiryAt.setHours(expiryAt.getHours() + tokenExpiryTime);

	cleanedCustomData.inactive = true;

	if(customData){
		cleanedCustomData.emailVerifyToken = {
			token: crypto.randomBytes(64).toString('hex'),
			expiredAt: expiryAt
		};
	}


	return this.isEmailTaken(customData.email).then(count => {

		if(count === 0){

			return adminDB.addUser(username, password, {customData: cleanedCustomData, roles: []}).then( () => {
				return Promise.resolve(cleanedCustomData.emailVerifyToken);
			}).catch(err => {
				return Promise.reject({resCode : utils.mongoErrorToResCode(err)});
			});

		} else {
			return Promise.reject({resCode: responseCodes.EMAIL_EXISTS });
		}

	});
};

schema.statics.verify = function(username, token, allowRepeatedVerify){
	'use strict';

	return this.findByUserName(username).then(user => {
		
		var tokenData = user && user.customData && user.customData.emailVerifyToken;

		if(!user){

			return Promise.reject({ resCode: responseCodes.TOKEN_INVALID});

		} else if(!user.customData.inactive && !allowRepeatedVerify){

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

	return User.isEmailTaken(this.customData.email, this.user).then(count => {
		if(count === 0){
			return this.save();
		} else {
			return Promise.reject({ resCode: responseCodes.EMAIL_EXISTS });
		}
	});
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

schema.statics.revokeRolesFromUser = function(username, db, role){
	'use strict';

	let cmd = {
		revokeRolesFromUser: username,
		roles: [{ role, db }]
	};

	return ModelFactory.db.admin().command(cmd);
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
					if(user){
						account.quota = user.haveActiveSubscriptions() ? user.getSubscriptionLimits() : undefined;
						return User.historyChunksStats(account.account);
					}

				}).then(stats => {
				
					if(stats && account.quota){
						let totalSize = 0;
						stats.forEach(stat => {
							totalSize += stat.size; 
						});
						
						account.quota.spaceUsed = totalSize;
					}
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
	},

	'SOFT-LAUNCH-FREE-TRIAL': {
		plan: 'SOFT-LAUNCH-FREE-TRIAL',
		limits: {
			spaceLimit: 10737418240, //bytes
			collaboratorLimit: 2,
		},
		db: this.user,
		billingCycle: 3, //month
		freeTrial: 0, //month
		currency: 'GBP',
		amount: 0
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

schema.methods.createSubscriptions = function(plans, billingUser){
	'use strict';

	this.customData.subscriptions = this.customData.subscriptions || [];
	this.customData.billingUser = billingUser;

	let subscriptions = this.customData.subscriptions;
	let error;
	let now = new Date();

	let currentCount = {};
	let existingPlans = [];

	//clear subscriptions
	let ids = this.customData.subscriptions.filter(sub => !sub.active).map(sub => sub._id);
	console.log('ids', ids);
	ids.forEach(id => {
		this.customData.subscriptions.remove(id);
	});
	

	this.customData.subscriptions.forEach(subscription => {
		if(!currentCount[subscription.plan]){
			currentCount[subscription.plan] = 1;
		} else {
			currentCount[subscription.plan]++;
		}
	});

	Object.keys(currentCount).forEach(plan => {
		existingPlans.push({ plan: plan, quantity: currentCount[plan]});
	});

	console.log('currentCount', currentCount);

	plans.forEach(plan => {
		if(currentCount[plan.plan]){
			plan.quantity = plan.quantity - currentCount[plan.plan];
		}
	});
	
	console.log('plans', plans);

	//change of plans
	plans = plans.filter(plan => plan.quantity > 0);

	console.log('plans', plans);

	plans.forEach(plan => {

		if(getSubscription(plan.plan) && Number.isInteger(plan.quantity) && plan.quantity > 0){
			
			for(let i=0; i<plan.quantity; i++){

				subscriptions.push({
					plan: plan.plan,
					createdAt: now,
					updatedAt: now,
					active: false
				});
			}
		}
	});


	if(plans.length <= 0){
		return Promise.reject({ message: 'You cant reduce the no. of licenses currently'});
	}

	let billingAgreement;

	let startDate = moment.utc().date(1).add(1, 'month').hours(0).minutes(0).seconds(0).milliseconds(0).toDate();
	let lastDayOfThisMonth = moment.utc().endOf('month').date();
	let day = moment.utc().date();

	let currency = 'GBP';
	let amount = 0;
	let billingCycle = 1;

	plans.forEach(data => {

		let quantity = data.quantity
		let plan = getSubscription(data.plan);
		amount += plan.amount * quantity;
		// currency = plan.currency;
		// billingCycle = plan.billingCycle;

	});

	//cal pro-rata price of new licenses subscription
	let proRataPrice = (lastDayOfThisMonth - day + 1) / lastDayOfThisMonth * amount;
	proRataPrice = Math.round(proRataPrice * 100) / 100;

	//add exisiting plans to bill of next cycle as well
	existingPlans.forEach(data => {

		let quantity = data.quantity
		let plan = getSubscription(data.plan);
		amount += plan.amount * quantity;
		// currency = plan.currency;
		// billingCycle = plan.billingCycle;
	});

	amount = Math.round(amount * 100) / 100;

	return Payment.getBillingAgreement(currency, proRataPrice, amount, billingCycle, startDate).then(_billingAgreement => {

		billingAgreement = _billingAgreement;
		this.customData.paypalPaymentToken = billingAgreement.paypalPaymentToken;

		return this.save();

	}).then(() => {
		return Promise.resolve(billingAgreement);
	});

}


schema.methods.createSubscriptionToken = function(plan, billingUser){
	'use strict';

	if(plan === 'THE-100-QUID-PLAN' || plan === 'SOFT-LAUNCH-FREE-TRIAL'){

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
			active: false
		};

		subscriptions.push(subscription);

		return this.save().then(() => {
			return Promise.resolve(subscription);
		});

	} else {

		return Promise.reject({ resCode: responseCodes.INVALID_SUBSCRIPTION_PLAN });
	}
};

schema.statics.activateSubscription = function(billingAgreementId, paymentInfo, raw, disableEmail){
	'use strict';
	
	let query = {'customData.billingAgreementId': billingAgreementId};
	let account;
	let dbUser;

	return this.findOne({account: 'admin'}, query).then(user => {

		dbUser = user;

		if(!dbUser){
			return Promise.reject({ message: 'BillingAgreementId not found'});
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
		return User.grantRoleToUser(dbUser.customData.billingUser, account, adminRoleName);

	}).then(() => {

		dbUser.customData.subscriptions.forEach(subscription => {

			if(subscription.inCurrentAgreement){
				let now = new Date();
				let expiryAt = moment(paymentInfo.ipnDate).utc()
					.date(1)
					.add(getSubscription(subscription.plan).billingCycle, 'month')
					.hours(0).minutes(0).seconds(0).milliseconds(0)
					.toDate();

				subscription.limits = getSubscription(subscription.plan).limits;

				if(!subscriptions.expiredAt || subscriptions.expiredAt < expiredAt){
					subscription.expiredAt = expiryAt;
					subscription.active = true;
				}
			
			}

		});

		if(paymentInfo.createBilling){

			let billing = Billing.createInstance({ account });

			billing.raw = raw;
			billing.gateway = paymentInfo.gateway;
			billing.createdAt = new Date();
			billing.currency = paymentInfo.currency;
			billing.amount = paymentInfo.amount;
			billing.billingAgreementId = billingAgreementId;
			
			billing.save().catch( err => {
				console.log('Billing error', err);
			});
		}


		if(!disableEmail){

			//send verification email
			let amount = paymentInfo.amount;
			let currency = paymentInfo.currency;
			if(currency === 'GBP'){
				currency = '£';
			}

			User.findByUserName(dbUser.customData.billingUser).then(user => {
				return Mailer.sendPaymentReceivedEmail(user.customData.email, {
					account: account,
					amount: currency + amount

				});
			}).catch(err => {
				systemLogger.logError(`Email error - ${err.message}`);
			});

		}

		return dbUser.save().then(() => {
			return Promise.resolve({subscriptions: dbUser.customData.subscriptions, account, payment: paymentInfo});
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
		'customData.billingUser': billingUser, 
	}).then( dbUsers => {

		let promises = [];

		dbUsers.forEach(dbUser => {
	

			dbUser.customData.subscriptions.forEach(dbSub => {

				dbSub = dbSub.toObject();
				dbSub.account = dbUser.user;
				
				promises.push(Billing.findBySubscriptionToken(dbUser.user, dbSub.token).then(payments => {
					dbSub.payments = payments;
				}));

				subscriptions.push(dbSub);
			});
			
		});

		return Promise.all(promises).then(() => {
			return Promise.resolve(subscriptions);
		});

	});
};

schema.statics.findSubscriptionByToken = function(billingUser, token){
	'use strict';

	let query = { 
		'customData.subscriptions.token': token
	};

	let subscription;

	if(billingUser){
		query['customData.subscriptions.billingUser'] = billingUser;
	}

	return this.findOne({account: 'admin'}, query, {
		'customData.subscriptions.$': 1,
		'user': 1
	}).then( dbUser => {

		subscription = dbUser.customData.subscriptions[0].toObject();
		subscription.account = dbUser.user;
		
		return Billing.findBySubscriptionToken(dbUser.user, subscription.token);

	}).then(payments => {

		subscription.payments = payments;
		return subscription;

	});
};

schema.methods.hasRole = function(db, roleName){
	'use strict';

	let roleLen = this.roles.length;

	for(let i=0; i < roleLen; i++){

		let role = this.roles[i];

		if(role.role === roleName && role.db === db){
			return role;
		}
	}

	return null;
};

var User = ModelFactory.createClass(
	'User',
	schema,
	() => {
		return 'system.users';
	}
);

module.exports = User;