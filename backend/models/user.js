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

var mongoose = require("mongoose");
var ModelFactory = require('./factory/modelFactory');
var responseCodes = require('../response_codes.js');
var _ = require('lodash');
var DB = require('../db/db');
var crypto = require('crypto');
var utils = require("../utils");
var History = require('./history');
var Billing = require('./billing');
var Role = require('./role');
var Mailer = require('../mailer/mailer');
var systemLogger = require("../logger.js").systemLogger;
var Payment = require('./payment');
var moment = require('moment');
var Subscription = require('./subscription');
var config = require('../config');
var vat = require('./vat');
var Counter = require('./counter');
var ProjectSetting = require('./projectSetting');
var C = require('../constants');
var RoleTemplates = require('./role_templates');
var userBilling = require("./userBilling");
var getSubscription = Subscription.getSubscription;

var schema = mongoose.Schema({
	_id : String,
	user: String,
	//db: String,
	customData: {
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
		billing: userBilling,
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

schema.statics.usernameRegExp = /^[a-zA-Z][\w]{1,19}$/;

schema.statics.createUser = function(logger, username, password, customData, tokenExpiryTime){
	'use strict';
	let adminDB = ModelFactory.db.admin();

	let cleanedCustomData = {};
	let emailRegex = /^([a-zA-Z0-9_\-\.]+)@([a-zA-Z0-9_\-\.]+)\.([a-zA-Z]{2,5})$/;

	if(config.auth.allowPlusSignInEmail){
		emailRegex = /^([+a-zA-Z0-9_\-\.]+)@([a-zA-Z0-9_\-\.]+)\.([a-zA-Z]{2,5})$/;
	}

	if(customData && (!customData.email || !customData.email.match(emailRegex))){
		return Promise.reject({ resCode: responseCodes.SIGN_UP_INVALID_EMAIL });
	}


	if(!this.usernameRegExp.test(username)){
		return Promise.reject({ resCode: responseCodes.INVALID_USERNAME});
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


			user.customData.inactive = undefined;
			user.customData.emailVerifyToken = undefined;
			return user.save();


		} else {
			return Promise.reject({ resCode: responseCodes.TOKEN_INVALID});
		}

	}).then(() => {

		if(!skipImportToyProject){

			//import toy project
			var ProjectHelper = require('./helper/project');

			ProjectHelper.importToyProject(username).catch(err => {
				systemLogger.logError('Failed to import toy project', { err : err && err.stack ? err.stack : err});
			});
		}

		if(!skipCreateBasicPlan){
			//basic quota
			return user.createSubscription(Subscription.getBasicPlan().plan, user.user, true, null).then(() => user);
		}

		return Promise.resolve();

	}).then(() => {

		return Role.createRole(username, null, C.ADMIN_TEMPLATE);

	}).then(role => {

		return Role.grantRolesToUser(username, [role]);
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


schema.methods.listAccounts = function(){
	'use strict';

	let accounts = [];

	// group projects by accounts
	return this.listProjectsAndAccountAdmins().then(data => {

		let projects = data.projects;
		let adminAccounts = data.adminAccounts;

		projects.forEach(project => {

			let account = _.find(accounts, account => account.account === project.account);

			if(!account){

				account = {
					account: project.account,
					projects: [],
					fedProjects: []
				};

				accounts.push(account);
			}

			if(project.federate){
				account.fedProjects.push({
					project: project.project,
					timestamp: project.timestamp,
					status: project.status,
					federate: project.federate,
					subProjects: project.subProjects,
					permissions: project.permissions
				});
			} else {
				account.projects.push({
					project: project.project,
					timestamp: project.timestamp,
					status: project.status,
					subProjects: project.subProjects,
					permissions: project.permissions
				});
			}


		});

		adminAccounts.forEach(account => {
			let accObj = accounts.find(_account => _account.account === account);
			if(accObj){
				accObj.isAdmin = true;
			} else {
				accounts.push({
					account: account,
					projects: [],
					fedProjects: [],
					isAdmin: true
				});
			}
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
						account.quota = user.getSubscriptionLimits();
						return User.historyChunksStats(account.account);
					}

				}).then(stats => {

					if(stats && account.quota.spaceLimit > 0){
						let totalSize = 0;
						stats.forEach(stat => {
							totalSize += stat.size;
						});

						account.quota.spaceUsed = totalSize;
					} else if(account.quota) {
						account.quota.spaceUsed = 0;
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

		// own acconut always ranks top of the list
		let myAccountIndex = accounts.findIndex(account => account.account === this.user);
		if(myAccountIndex > -1){
			let myAccount = accounts[myAccountIndex];
			accounts.splice(myAccountIndex, 1);
			accounts.unshift(myAccount);
		}

		return Promise.all(getQuotaPromises).then(() => {
			return Promise.resolve(accounts);
		});
	});
};

schema.methods.listProjectsAndAccountAdmins = function(options){
	'use strict';

	var ProjectHelper = require('./helper/project');
	let adminAccounts = [];
	return Role.viewRolesWithInheritedPrivs(this.roles).then(roles => {

		let projects = {};
		let promises = [];

		function getProjectName(privileges){

			let collectionSuffix = '.history';

			for(let i=0 ; i < privileges.length ; i++){
				let collectionName = privileges[i].resource.collection;
				if(collectionName.endsWith(collectionSuffix)){
					return collectionName.substr(0, collectionName.length - collectionSuffix.length);
				}
			}
		}

		function addToProjectList(account, project, permissions){
			//if project not found in the list
			if(!projects[`${account}.${project}`]){
				projects[`${account}.${project}`] = {
					project,
					account,
					permissions: permissions ? permissions : []
				};
			} else {
				permissions && (projects[`${account}.${project}`].permissions = projects[`${account}.${project}`].permissions.concat(permissions));
				projects[`${account}.${project}`].permissions  = _.unique(projects[`${account}.${project}`].permissions);
			}
		}

		roles.forEach(role => {

			let permissions = RoleTemplates.determinePermission(role.db, '', role);

			if(_.intersection(permissions, RoleTemplates.roleTemplates[C.ADMIN_TEMPLATE]).length === RoleTemplates.roleTemplates[C.ADMIN_TEMPLATE].length){
				// admin role list all projects on that db
				adminAccounts.push(role.db);
				promises.push(
					ProjectSetting.find({account: role.db}).then(settings => {
						settings.forEach(setting => {

							let projectName = setting._id;
							addToProjectList(role.db, projectName, RoleTemplates.roleTemplates[C.ADMIN_TEMPLATE]);

						});
					})
				);

			} else {

				let projectName = getProjectName(role.privileges);
				let permissions;

				if(projectName){
					permissions = RoleTemplates.determinePermission(role.db, projectName, role);
				}

				if(permissions){
					addToProjectList(role.db, projectName, permissions);
				}

			}
		});

		return Promise.all(promises).then(() => _.values(projects));

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
				ProjectSetting.findById(project, project.project).then(setting => {

					if(setting){
						projects[index].status = setting.status;
						projects[index].federate = setting.federate;
					}

					return Promise.resolve();

				}).then(() => {


					if(projects[index].federate){
						return ProjectHelper.listSubProjects(projects[index].account, projects[index].project, 'master');
					}

					return Promise.resolve();

				}).then(subProjects => {

					if(subProjects){
						projects[index].subProjects = subProjects;
					}

				}).catch(() => Promise.resolve())
			);
		});

		return Promise.all(promises).then(() => Promise.resolve({projects, adminAccounts}));
	});
};

schema.methods.buySubscriptions = function(plans, billingUser, billingAddress){
	"use strict";

	let billingAgreement;

	plans = plans || [];
	console.log(this.customData);
	return this.customData.billing.buySubscriptions(plans, billingUser, billingAddress).then(function(_billingAgreement) {
		billingAgreement = _billingAgreement;
		return this.save();
	}).then(function() {
		return Promise.resolve(billingAgreement || {});
	});
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

		if(dbUser.customData.nextPaymentDate > paymentInfo.nextPaymentDate){
			return Promise.reject({ message: 'Received ipn message older than the one in database. Activation halt.' });
		}


		account = dbUser.user;

		return Billing.findByTransactionId(account, paymentInfo.transactionId);

	}).then(billing => {

		if(billing){
			return Promise.reject({ message: 'Duplicated ipn message. Activation halt.'});
		}

		return Role.createRole(account, null, C.ADMIN_TEMPLATE);

	}).then(role => {

		return Role.grantRolesToUser(dbUser.customData.billingUser, [role]);

	}).then(() => {

		let items = [];

		if(dbUser.customData.nextPaymentDate && moment(paymentInfo.nextPaymentDate).utc().startOf('date').toISOString() !== moment(dbUser.customData.nextPaymentDate).utc().startOf('date').toISOString()){
			dbUser.customData.lastAnniversaryDate = new Date(dbUser.customData.nextPaymentDate);
		}

		dbUser.customData.nextPaymentDate = moment(paymentInfo.nextPaymentDate).utc().startOf('date').toDate();

		// set to to next 3rd of next month, give 3 days cushion
		let expiredAt = moment(paymentInfo.nextPaymentDate).utc()
			.add(3, 'day')
			.hours(0).minutes(0).seconds(0).milliseconds(0)
			.toDate();

		let newPurchaseCount = dbUser.customData.subscriptions.filter(sub => sub.inCurrentAgreement && (!sub.expiredAt || sub.expiredAt < expiredAt)).length;

		dbUser.customData.subscriptions.forEach(subscription => {

			if(subscription.inCurrentAgreement){

				subscription.limits = getSubscription(subscription.plan).limits;

				if(!subscription.expiredAt || subscription.expiredAt < expiredAt){
					subscription.expiredAt = expiredAt;
					//subscription.active = true;

					items.push({
						name: subscription.plan,
						description: getSubscription(subscription.plan).description,
						currency: getSubscription(subscription.plan).currency,
						amount: Math.round(paymentInfo.amount / newPurchaseCount * 100) / 100,
						taxAmount: Math.round(paymentInfo.taxAmount / newPurchaseCount * 100) / 100
					});
				}

			}

		});

		let createBill = Promise.resolve();

		if(paymentInfo.createBilling){

			let billing = Billing.createInstance({ account });
			let pendingBill;

			createBill = Billing.findAndRemovePendingBill(account, billingAgreementId).then(_pendingBill => {

				pendingBill = _pendingBill;
				if(pendingBill){
					return Promise.resolve(pendingBill.invoiceNo);
				} else {
					return Counter.findAndIncInvoiceNumber().then(counter => {
						return Promise.resolve('SO-' + counter.count);
					});
				}

			}).then(invoiceNo => {

				billing.raw = raw;
				billing.gateway = paymentInfo.gateway;
				billing.createdAt = pendingBill.createdAt;
				billing.currency = paymentInfo.currency;
				billing.amount = paymentInfo.amount;
				billing.billingAgreementId = billingAgreementId;
				billing.items = pendingBill.items;
				billing.nextPaymentDate = paymentInfo.nextPaymentDate;
				billing.taxAmount = paymentInfo.taxAmount;
				billing.nextPaymentAmount = paymentInfo.nextAmount;
				billing.invoiceNo = invoiceNo;
				billing.transactionId = paymentInfo.transactionId;

				//copy current billing info from user to billing
				billing.info = pendingBill.info;

				billing.periodStart = pendingBill.periodStart;
				billing.periodEnd = pendingBill.periodEnd;

				return billing.save();
			});

		}


		if(!disableEmail){


			createBill.then(billing => {

				if(billing){
					return billing.generatePDF().then(pdf => {

						billing.pdf = pdf;
						// also save the pdf to database for ref.
						return billing.save();

					});
				}

			}).then(billing => {

				let attachments;

				if(billing && billing.pdf){
					attachments = [{
						filename: `${moment(billing.createdAt).utc().format('YYYY-MM-DD')}_invoice-${billing.invoiceNo}.pdf`,
						content: billing.pdf
					}];
				}

				//send invoice
				let amount = paymentInfo.amount;
				let currency = paymentInfo.currency;
				if(currency === 'GBP'){
					currency = '£';
				}

				return User.findByUserName(dbUser.customData.billingUser).then(user => {

					//make a copy to sales

					Mailer.sendPaymentReceivedEmailToSales({
						account: account,
						amount: currency + amount,
						email: user.customData.email,
						invoiceNo: billing.invoiceNo
					}, attachments);

					return Mailer.sendPaymentReceivedEmail(user.customData.email, {
						account: account,
						amount: currency + amount
					}, attachments);
				});


			}).catch(err => {
				console.log(err.stack);
				systemLogger.logError(`Email error - ${err.message}`);
			});


		}

		return dbUser.save().then(() => {
			return Promise.resolve({subscriptions: dbUser.customData.subscriptions, account, payment: paymentInfo});
		});



	});

};

schema.methods.executeBillingAgreement = function(token, billingAgreementId, billingAgreement){
	'use strict';

	this.customData.paypalPaymentToken = token;
	this.customData.billingAgreementId = billingAgreementId;

	let assignedBillingUser = false;
	let items = [];

	this.customData.subscriptions.forEach(subscription => {

		if(subscription.plan === Subscription.getBasicPlan().plan || !subscription.inCurrentAgreement){
			return;
		}

		if(subscription.assignedUser === this.customData.billingUser){
			assignedBillingUser = true;
		}

		//subscription.inCurrentAgreement = true;

		if(!subscription.active){

			items.push({
				name: subscription.plan,
				description: getSubscription(subscription.plan).description,
				currency: getSubscription(subscription.plan).currency,
			});
		}
		// pre activate
		// don't wait for IPN message to confirm but to activate the subscription right away, for 48 hours.
		// IPN message should come quickly after executing an agreement, usually less then a minute
		let twoDayLater = moment().utc().add(48, 'hour').toDate();
		if(!subscription.expiredAt || subscription.expiredAt < twoDayLater){
			subscription.active = true;
			//subscription.newPurchased = true;
			subscription.expiredAt = twoDayLater;
			subscription.limits = getSubscription(subscription.plan).limits;
		}

	});


	//clear pending delete subscriptions
	let ids = this.customData.subscriptions.filter(sub => sub.pendingDelete).map(sub => sub._id);

	ids.forEach(id => {
		this.customData.subscriptions.remove(id);
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

	// create pending bill

	if(items.length > 0){


		let billAmount = billingAgreement.plan.payment_definitions.find(def => def.type === 'TRIAL') || billingAgreement.plan.payment_definitions.find(def => def.type === 'REGULAR');
		let nextAmount = billingAgreement.plan.payment_definitions.find(def => def.type === 'REGULAR');

		let paymentInfo = {
			currency: billAmount.amount.currency,
			taxAmount: parseFloat(billAmount.charge_models.find(model => model.type === 'TAX').amount.value)
		};

		paymentInfo.amount = parseFloat(billAmount.amount.value) + paymentInfo.taxAmount;
		paymentInfo.nextAmount = parseFloat(nextAmount.amount.value) + parseFloat(nextAmount.charge_models.find(model => model.type === 'TAX').amount.value);
		paymentInfo.nextAmount = Math.round(paymentInfo.nextAmount * 100) / 100;

		items.forEach(item => {
			item.amount = Math.round(paymentInfo.amount / items.length * 100) / 100;
			item.taxAmount = Math.round(paymentInfo.taxAmount / items.length * 100) / 100;
		});

		let billing = Billing.createInstance({ account: this.user });

		return Billing.hasPendingBill(this.user, billingAgreementId).then(hasBill => {

			if(hasBill){
				return Promise.resolve();
			} else {
				return Counter.findAndIncInvoiceNumber().then(counter => {
					return Promise.resolve('SO-' + counter.count);
				});
			}

		}).then(invoiceNo => {

			if(invoiceNo){

				let nextPaymentDate = moment(this.customData.nextPaymentDate || this.customData.firstNextPaymentDate).utc().startOf('date');

				billing.gateway = 'PAYPAL';
				billing.createdAt = new Date();
				billing.currency = paymentInfo.currency;
				billing.amount = paymentInfo.amount;
				billing.billingAgreementId = billingAgreementId;
				billing.items = items;
				billing.nextPaymentDate = nextPaymentDate;
				billing.taxAmount = paymentInfo.taxAmount;
				billing.nextPaymentAmount = paymentInfo.nextAmount;
				billing.invoiceNo = invoiceNo;
				billing.pending = true;

				//copy current billing info from user to billing
				billing.info = this.customData.billingInfo;

				billing.periodStart = moment().utc().toDate();
				billing.periodEnd = nextPaymentDate
					.utc()
					.subtract(1, 'day')
					.endOf('date')
					.toDate();

				return billing.save();
			}

		});

	} else {
		return Promise.resolve();
	}




};

schema.methods.haveActiveSubscriptions = function(){
	return this.getActiveSubscriptions().length > 0;
};



schema.methods.getSubscriptionLimits = function(options){
	'use strict';

	let subscriptions = this.getActiveSubscriptions(options);

	let sumLimits = {
		spaceLimit: 0,
		collaboratorLimit: 0
	};

	//console.log(subscriptions);

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


schema.methods.removeAssignedSubscriptionFromUser = function(id, cascadeRemove){
	'use strict';

	let ProjectHelper = require('./helper/project');

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
	return ProjectSetting.find({ account: this.user }, {}).then(projects => {

		let foundProjects = [];
		projects.forEach(project => {
			project.collaborators.forEach(collaborator => {
				if(collaborator.user === subscription.assignedUser){
					foundProjects.push({ project: project._id, role: collaborator.role});
				}
			});
		});

		if(!cascadeRemove && foundProjects.length > 0){
			return Promise.reject({ resCode: responseCodes.USER_IN_COLLABORATOR_LIST, info: {projects: foundProjects}});
		} else {

			let promises = [];
			foundProjects.forEach(foundProject => {
				promises.push(ProjectHelper.removeCollaborator(subscription.assignedUser, null, this.user, foundProject.project, foundProject.role));
			});

			return Promise.all(promises);

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


schema.methods.getPrivileges = function(){
	'use strict';

	return Role.viewRolesWithInheritedPrivs(this.roles).then(roles => {

		let privs = [];
		if (roles && roles.length) {
			for (let i = 0; i < roles.length; i++) {
				privs = privs.concat(roles[i].inheritedPrivileges);
			}
		}

		return Promise.resolve({inheritedPrivileges: privs});
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
