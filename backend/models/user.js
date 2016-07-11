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
var Subscription = require('./subscription');
var getSubscription = Subscription.getSubscription;



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
		billingInfo:{

			vat: String,
			"line1": String,
			"city": String,
			"postalCode": String,
			"countryCode": String
		},
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

// schema.statics.findBillingUserByToken = function(token){
// 	return this.findSubscriptionByToken(null, token).then(subscription => {
// 		if(subscription){
// 			return this.findByUserName(subscription.billingUser);
// 		}

// 		return Promise.resolve();
// 	});
// };

schema.statics.findBillingUserByBillingId = function(billingAgreementId){
	return this.findOne({account: 'admin'}, { 'customData.billingAgreementId': billingAgreementId });
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

schema.statics.verify = function(username, token, options){
	'use strict';

	options = options || {};

	let allowRepeatedVerify = options.allowRepeatedVerify;
	let skipImportToyProject = options.skipImportToyProject;
	let skipCreateBasicPlan = options.skipCreateBasicPlan;

	let user;

	return this.findByUserName(username).then(_user => {
		
		user = _user;

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

	}).then(() => {

		if(!skipImportToyProject){

			//import toy project
			var ProjectHelper = require('./helper/project');

			ProjectHelper.importToyProject(username).catch(err => {
				systemLogger.logError(JSON.stringify(err));
			});
		}

		if(!skipCreateBasicPlan){
			//basic quota
			return user.createSubscription(Subscription.getBasicPlan().plan, user.user, true, null).then(() => user);
		}

		return user;

	});
};



schema.methods.getAvatar = function(){
	return this.customData && this.customData.avatar || null;
};

schema.methods.updateInfo = function(updateObj){
	'use strict';

	let updateableFields = [ 'firstName', 'lastName', 'email', 'billingInfo' ];
	
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

schema.methods.listProjects = function(options){
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
		if(options && options.skipTimestamp){
			return Promise.resolve(projects);
		}

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
		if(options && options.skipStatus){
			return Promise.resolve(projects);
		}

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

schema.methods.buySubscriptions = function(plans, billingUser, billingAddress){
	'use strict';

	plans = plans || [];
	this.customData.subscriptions = this.customData.subscriptions || [];
	this.customData.billingUser = billingUser;

	let subscriptions = this.customData.subscriptions;
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


	let next;
	let billingAgreement;

	if(plans.length <= 0){

		if(!this.customData.billingAgreementId){
			next = Promise.resolve({});
		} else {
			next = Payment.updateBillingAddress(this.customData.billingAgreementId, {
				"line1": billingAddress.line1,
				"city": billingAddress.city,
				"postal_code": billingAddress.postalCode,
				"country_code": billingAddress.countryCode
			});
		}


	} else {

		let startDate;

		let currentDate = {};
		currentDate.today = moment().utc().startOf('day');
		currentDate.endOfMonth = moment(currentDate.today).utc().endOf('month');
		currentDate.totalDays = currentDate.endOfMonth.date();
		currentDate.remainingDays = Math.round(moment.duration(moment(currentDate.endOfMonth).utc().diff(currentDate.today)).asDays());


		let nextMonth = {};
		nextMonth.today = moment().utc().startOf('day').add(1, 'month');
		nextMonth.endOfMonth = moment(nextMonth.today).utc().endOf('month');
		nextMonth.totalDays = nextMonth.endOfMonth.date();
		nextMonth.remainingDays = Math.round(moment.duration(moment(nextMonth.endOfMonth).utc().diff(nextMonth.today)).asDays());

		let trialDate = {};
		if(this.customData.freeTrial){
			trialDate.today = moment(this.customData.freeTrial.startAt).utc().startOf('day');
			trialDate.endOfMonth = moment(trialDate.today).utc().endOf('month');
			trialDate.totalDays = trialDate.endOfMonth.date();
			trialDate.remainingDays = Math.round(moment.duration(moment(trialDate.endOfMonth).utc().diff(trialDate.today)).asDays());
		}


		// let endOfMonthOfStartDate = moment(startDate).utc().endOf('month');
		// let totalDays = endOfMonthOfStartDate.date();
		// let noOfDays = Math.round(moment.duration(moment(endOfMonthOfStartDate).utc().diff(startDate)).asDays());
		// let firstCycleLength = noOfDays;

		let currency = 'GBP';
		let amount = 0;
		let initAmount = 0;
		let firstCycleAmount = 0;
		let billingCycle = 1;
		let firstCycleLength;
		
		let isfirstPlan = this.getActiveSubscriptions({skipBasic: true}).length === 0;

		let now = new Date();
		let inTrialPeriod = this.customData.freeTrial && this.customData.freeTrial.endAt < now;

		if(isfirstPlan){
			// first time to buy licence(s), free for 1st licence for 1st month

			startDate = moment(nextMonth.today);

			//////////////////
			// 1st cycle (init payment)
			//////////////////
			plans.forEach(data => {
				let quantity = data.quantity - 1;
				let plan = getSubscription(data.plan);
				initAmount += plan.amount * (currentDate.remainingDays / currentDate.totalDays) * quantity;

			});

			//////////////////
			// 2nd cycle
			//////////////////
			//cal pro-rata price for 1st free licence for 2nd cycle
			firstCycleAmount = nextMonth.remainingDays / nextMonth.totalDays * getSubscription(plans[0].plan).amount;
			firstCycleLength = nextMonth.remainingDays;

			plans.forEach(data => {

				let quantity = data.quantity - 1;
				let plan = getSubscription(data.plan);
				firstCycleAmount += plan.amount * quantity;

			});

			/////////////////////
			// remaining cycles
			////////////////////
			plans.forEach(data => {

				let quantity = data.quantity;
				let plan = getSubscription(data.plan);
				amount += plan.amount * quantity;

			});

			//add exisiting plans to the bill of next cycle as well
			existingPlans.forEach(data => {

				let quantity = data.quantity;
				let plan = getSubscription(data.plan);
				amount += plan.amount * quantity;

			});

		} else if (inTrialPeriod) {
			// buying extra licence(s) during 1-month free trial for 1 month

			startDate = trialStartDate;
			//////////////////
			// 1st cycle (init payment)
			//////////////////
			plans.forEach(data => {
				let quantity = data.quantity;
				let plan = getSubscription(data.plan);
				initAmount += plan.amount * (currentDate.remainingDays / currentDate.totalDays) * quantity;

			});


			//////////////////
			// 2nd cycle
			//////////////////
			//cal pro-rata price for 1st free licence for 2nd cycle
			firstCycleAmount = trialDate.remainingDays / trialDate.totalDays * getSubscription(plans[0].plan).amount; // it works because we only have 1 type of plan now
			firstCycleLength = trialDate.remainingDays;

			// new licences
			plans.forEach(data => {
				let quantity = data.quantity;
				let plan = getSubscription(data.plan);
				firstCycleAmount += plan.amount * quantity;

			});

			//add exisiting plans to the bill of next cycle as well
			existingPlans.forEach(data => {
				let quantity = data.quantity;
				let plan = getSubscription(data.plan);
				firstCycleAmount += plan.amount * quantity;
			});

			/////////////////////
			// remaining cycles
			////////////////////
			plans.forEach(data => {

				let quantity = data.quantity;
				let plan = getSubscription(data.plan);
				amount += plan.amount * quantity;

			});

			//add exisiting plans to the bill of next cycle as well
			existingPlans.forEach(data => {

				let quantity = data.quantity;
				let plan = getSubscription(data.plan);
				amount += plan.amount * quantity;

			});

		} else {
			// not in trial period any more

			startDate = moment(nextMonth.today);
			//////////////////
			// 1st cycle (init payment)
			//////////////////
			plans.forEach(data => {
				let quantity = data.quantity;
				let plan = getSubscription(data.plan);
				initAmount += plan.amount * (currentDate.remainingDays / currentDate.totalDays) * quantity;

			});

			/////////////////////
			// remaining cycles
			////////////////////
			plans.forEach(data => {

				let quantity = data.quantity;
				let plan = getSubscription(data.plan);
				amount += plan.amount * quantity;

			});

			//add exisiting plans to the bill of next cycle as well
			existingPlans.forEach(data => {

				let quantity = data.quantity;
				let plan = getSubscription(data.plan);
				amount += plan.amount * quantity;

			});
		}


		initAmount = Math.round(initAmount * 100) / 100;
		firstCycleAmount = Math.round(firstCycleAmount * 100) / 100;
		amount = Math.round(amount * 100) / 100;

		next = Payment.getBillingAgreement(billingUser, {
			"line1": billingAddress.line1,
			"city": billingAddress.city,
			"postal_code": billingAddress.postalCode,
			"country_code": billingAddress.countryCode
		}, currency, initAmount, firstCycleAmount, amount, billingCycle, startDate.toDate(), firstCycleLength).then(_billingAgreement => {

			billingAgreement = _billingAgreement;
			this.customData.paypalPaymentToken = billingAgreement.paypalPaymentToken;

		});

	}


	return next.then(() => {

		//store billing info locally
		console.log(billingAddress);
		this.customData.billingInfo = billingAddress;
		return this.save();

	}).then(() => {
		return Promise.resolve(billingAgreement || {});
	});

};


schema.methods.createSubscription = function(plan, billingUser, active, expiredAt){
	'use strict';

	if(getSubscription(plan)){


		this.customData.subscriptions = this.customData.subscriptions || [];
		let subscriptions = this.customData.subscriptions;

		var now = new Date();

		let subscription = {

			plan: plan,
			billingUser: billingUser,
			createdAt: now,
			updatedAt: now,
			active: active,
			expiredAt: expiredAt
		};

		if(active){
			subscription.limits = getSubscription(subscription.plan).limits;
		}

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
			return Promise.reject({ message: `No users found with billingAgreementId ${billingAgreementId}`});
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

		let items = [];

		dbUser.customData.subscriptions.forEach(subscription => {

			if(subscription.inCurrentAgreement){

				// set to to next 3rd of next month, give 3 days cushion
				let expiredAt = moment(paymentInfo.nextPaymentDate).utc()
					.add(3, 'day')
					.hours(0).minutes(0).seconds(0).milliseconds(0)
					.toDate();

				let start = moment.utc(paymentInfo.ipnDate).date();
				let end = moment(paymentInfo.ipnDate).utc().endOf('month').date();
				let prorata = (end - start + 1) / end;


				subscription.limits = getSubscription(subscription.plan).limits;

				if(!subscription.expiredAt || subscription.expiredAt < expiredAt){
					subscription.expiredAt = expiredAt;
					subscription.active = true;

					items.push({
						name: subscription.plan,
						currency: getSubscription(subscription.plan).currency,
					});
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
			billing.items = items;
			//copy current billing info from user to billing
			billing.info = dbUser.customData.billingInfo;

			billing.periodStart = moment(paymentInfo.ipnDate).utc()
				.hours(0).minutes(0).seconds(0).milliseconds(0)
				.toDate();

			billing.periodEnd = moment(paymentInfo.ipnDate).utc()
					.endOf('month')
					.toDate();

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

schema.methods.executeBillingAgreement = function(token, billingAgreementId){
	'use strict';

	this.customData.paypalPaymentToken = token;
	this.customData.billingAgreementId = billingAgreementId;

	let assignedBillingUser = false;

	this.customData.subscriptions.forEach(subscription => {

		if(subscription.plan === Subscription.getBasicPlan().plan){
			return;
		}

		if(subscription.assignedUser === this.customData.billingUser){
			assignedBillingUser = true;
		}

		subscription.inCurrentAgreement = true;

		// pre activate
		// don't wait for IPN message to confirm but to activate the subscription right away, for 2 hours.
		// IPN message should come quickly after executing an agreement, usually less then a minute
		let twoHoursLater = moment().utc().add(2, 'hour').toDate();
		if(!subscription.expiredAt || subscription.expiredAt < twoHoursLater){
			subscription.active = true;
			subscription.expiredAt = twoHoursLater;
			subscription.limits = getSubscription(subscription.plan).limits;
		}

	});

	if(!assignedBillingUser){

		let subscriptions = this.customData.subscriptions;
		
		for(let i=0; i < subscriptions.length; i++){

			if(subscriptions[i].plan !== Subscription.getBasicPlan().plan && !subscriptions[i].assignedUser){
				subscriptions[i].assignedUser = this.customData.billingUser;
				break;
			}
		}
	}
};

schema.methods.haveActiveSubscriptions = function(){
	return this.getActiveSubscriptions().length > 0;
};

schema.methods.getActiveSubscriptions = function(options){
	'use strict';
	let now = new Date();
	options = options || {};
	if (options.skipBasic){
		return this.customData.subscriptions.filter(sub => sub.plan !== Subscription.getBasicPlan().plan && sub.active && (sub.expiredAt > now || !sub.expiredAt));
	} else {
		return this.customData.subscriptions.filter(sub => sub.active && (sub.expiredAt > now || !sub.expiredAt));
	}

};

schema.methods.getSubscriptionLimits = function(){
	'use strict';

	let subscriptions = this.getActiveSubscriptions();

	let sumLimits = {
		spaceLimit: 0, 
		collaboratorLimit: 0
	};

	console.log(subscriptions);

	subscriptions.forEach(sub => {
		sumLimits.spaceLimit += sub.limits.spaceLimit;
		sumLimits.collaboratorLimit += sub.limits.collaboratorLimit;
	});

	return sumLimits;
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

schema.methods.removeAssignedSubscriptionFromUser = function(id){
	'use strict';

	let subscription = this.customData.subscriptions.id(id);
	
	if(!subscription){
		return Promise.reject({ resCode: responseCodes.SUBSCRIPTION_NOT_FOUND});
	}

	if(!subscription.assignedUser){
		return Promise.reject({ resCode: responseCodes.SUBSCRIPTION_NOT_ASSIGNED});
	}

	if(subscription.assignedUser === this.user){
		return Promise.reject({ resCode: responseCodes.SUBSCRIPTION_CANNOT_REMOVE_SELF});
	}

	//check if they are a collaborator
	return projectSetting.find({ account: this.user }, {}).then(projects => {

		let foundProjects = [];
		projects.forEach(project => {
			project.collaborators.forEach(collaborator => {
				if(collaborator.user === subscription.assignedUser){
					foundProjects.push(project._id);
				}
			});
		});

		if(foundProjects.length > 0){
			return Promise.reject({ resCode: responseCodes.USER_IN_COLLABORATOR_LIST, info: {projects: foundProjects}});
		}

	}).then(() => {
		subscription.assignedUser = undefined;
		return this.save().then(() => subscription);
	});

};

schema.methods.assignSubscriptionToUser = function(id, userData){
	'use strict';

	let subscription = this.customData.subscriptions.id(id);
	
	if(!subscription){
		return Promise.reject({ resCode: responseCodes.SUBSCRIPTION_NOT_FOUND});
	}

	let next;

	
	if(userData.email){
		next = User.findByEmail(userData.email);
	} else {
		next = User.findByUserName(userData.user);
	}

	return next.then(user => {

		if(!user){
			return Promise.reject({ resCode: responseCodes.USER_NOT_FOUND });
		}

		let assigned;

		this.customData.subscriptions.forEach(subscription => {
			if(subscription.assignedUser === user.user){
				assigned = true;
			}
		});

		if(assigned){
			return Promise.reject({ resCode: responseCodes.USER_ALREADY_ASSIGNED });
		} else if(subscription.assignedUser){
			return Promise.reject({ resCode: responseCodes.SUBSCRIPTION_ALREADY_ASSIGNED });
		} else {
			subscription.assignedUser = user.user;
			return this.save().then(() => subscription);
		}
		
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