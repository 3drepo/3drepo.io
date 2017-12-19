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
const Role = require('./role');

var systemLogger = require("../logger.js").systemLogger;

var Subscription = require('./subscription');
var config = require('../config');


var ModelSetting = require('./modelSetting');
var C = require('../constants');
var userBilling = require("./userBilling");
var job = require('./job');
var permissionTemplate = require('./permissionTemplate');
var accountPermission = require('./accountPermission');
var Project = require('./project');

var schema = mongoose.Schema({
	_id : String,
	user: String,
	//db: String,
	customData: {
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
		billing: { 
			type: userBilling, 
			default: userBilling,
			get: function(billing){
				if(billing){
					billing._parent = this;
				}
				return billing;
			}

		},
		avatar: Object,
		lastLoginAt: Date,
		jobs: {
			type: [job.schema],
			get: function(jobs){
				return job.methods.init(this, jobs);
			}
		},
		permissionTemplates: {
			type: [permissionTemplate.schema],
			get: function(permissionTemplates){
				return permissionTemplate.methods.init(this, permissionTemplates);
			}
		},
		//teamspace level permissions
		permissions: {
			type: [accountPermission.schema],
			get: function(permissions){
				return accountPermission.methods.init(this, permissions);
			}
		},
		vrEnabled : Boolean
	},
	roles: [{}]
});

schema.statics.historyChunksStats = function(dbName){
	'use strict';

	return ModelFactory.dbManager.listCollections(dbName).then(collections => {

		let historyChunks = _.filter(collections, collection => collection.name.endsWith('.history.chunks'));
		let promises = [];

		historyChunks.forEach(collection => {
			promises.push(ModelFactory.dbManager.getCollectionStats(dbName, collection.name));
		});

		return Promise.all(promises);

	});

};

schema.statics.authenticate = function(logger, username, password){
	'use strict';

	if(!username || !password){
		return Promise.reject({ resCode: responseCodes.INCORRECT_USERNAME_OR_PASSWORD });
	}

	return DB.getAuthDB().then(authDB => {
		return authDB.authenticate(username, password);
	}).then(() => {
		return this.findByUserName(username);
	}).then(user => {
		if(user.customData && user.customData.inactive) {
			return Promise.reject({resCode: responseCodes.USER_NOT_VERIFIED});
		}

		if(!user.customData){
			user.customData = {};
		}
		
		user.customData.lastLoginAt = new Date();
		return user.save();

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

//case insenstive
schema.statics.isUserNameTaken = function(username){
	return this.count({account: 'admin'}, {
		user: new RegExp(`^${username}$`, 'i')
	});
};

schema.statics.findByEmail = function(email){
	return this.findOne({account: 'admin'}, { 'customData.email': email });
};

schema.statics.findByPaypalPaymentToken = function(token){
	return this.findOne({account: 'admin'}, { 'customData.billing.paypalPaymentToken': token });
};

schema.statics.isEmailTaken = function(email, exceptUser){
	'use strict';

	let query = { 'customData.email': email};

	if(exceptUser){
		query = { 'customData.email': email, 'user': { '$ne': exceptUser }};
	}

	return this.count({account: 'admin'}, query);
};


schema.statics.findUserByBillingId = function(billingAgreementId){
	return this.findOne({account: 'admin'}, { 'customData.billing.billingAgreementId': billingAgreementId });
};


schema.statics.updatePassword = function(logger, username, oldPassword, token, newPassword){
	'use strict';

	if(!((oldPassword || token) && newPassword)){
		return Promise.reject({ resCode: responseCodes.INVALID_INPUTS_TO_PASSWORD_UPDATE});
	}

	var checkUser;
	var user;

	if(oldPassword){
		
		if(oldPassword === newPassword){
			return Promise.reject(responseCodes.NEW_OLD_PASSWORD_SAME);
		}

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

		 return ModelFactory.dbManager.runCommand("admin", updateUserCmd);

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

schema.statics.createUser = function(logger, username, password, customData, tokenExpiryTime, skipCheckEmail){
	'use strict';
	return ModelFactory.dbManager.getAuthDB().then(adminDB => {

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

		for(let i=0 ; i < C.REPO_BLACKLIST_USERNAME.length; i++){
			if(C.REPO_BLACKLIST_USERNAME[i] === username){
				return Promise.reject({ resCode: responseCodes.INVALID_USERNAME });
			}
		}
	

		['firstName', 'lastName', 'email'].forEach(key => {
			if (customData && customData[key]){
				cleanedCustomData[key] = customData[key];
			}
		});

		let billingInfo = {};

		['firstName', 'lastName', 'phoneNo', 'countryCode', 'jobTitle', 'company'].forEach(key => {
			if (customData && customData[key]){
				billingInfo[key] = customData[key];
			}
		});

		//cleanedCustomData.billing = {};

		var expiryAt = new Date();
		expiryAt.setHours(expiryAt.getHours() + tokenExpiryTime);

		cleanedCustomData.inactive = true;

		//default permission
		cleanedCustomData.permissions = [{
			user: username,
			permissions: [C.PERM_TEAMSPACE_ADMIN]
		}];

		//default templates
		cleanedCustomData.permissionTemplates = [
			{
				_id: C.ADMIN_TEMPLATE,
				permissions: C.ADMIN_TEMPLATE_PERMISSIONS
			},
			{
				_id: C.VIEWER_TEMPLATE,
				permissions: C.VIEWER_TEMPLATE_PERMISSIONS
			},
			{
				_id: C.COMMENTER_TEMPLATE,
				permissions: C.COMMENTER_TEMPLATE_PERMISSIONS
			},
			{
				_id: C.COLLABORATOR_TEMPLATE,
				permissions: C.COLLABORATOR_TEMPLATE_PERMISSIONS
			}
		];	

		cleanedCustomData.jobs = C.DEFAULT_JOBS;
	
		if(customData){
			cleanedCustomData.emailVerifyToken = {
				token: crypto.randomBytes(64).toString('hex'),
				expiredAt: expiryAt
			};
		}

		return this.isUserNameTaken(username).then(count => {
	
			if(count !== 0){
				return Promise.reject(responseCodes.USER_EXISTS);
			}

			let checkEmail = Promise.resolve(0);

			if(!skipCheckEmail){
				checkEmail = this.isEmailTaken(customData.email);
			}
	
			return checkEmail;
		}).then(count => {

			if(count === 0){
	
				return adminDB.addUser(username, password, {customData: cleanedCustomData, roles: []}).then( () => {
					return Promise.resolve(cleanedCustomData.emailVerifyToken);
				}).catch(err => {
					return Promise.reject({resCode : utils.mongoErrorToResCode(err)});
				});

			} else {
				return Promise.reject({resCode: responseCodes.EMAIL_EXISTS });
			}

		}).then(() => {
			return this.findByUserName(username);
		}).then(user => {
			user.customData.billing.billingInfo.changeBillingAddress(billingInfo);
			return user.save();
		}).then(() => {
			return Promise.resolve(cleanedCustomData.emailVerifyToken);
		});
	});
};

schema.statics.verify = function(username, token, options){
	'use strict';

	options = options || {};

	let allowRepeatedVerify = options.allowRepeatedVerify;
	let skipImportToyModel = options.skipImportToyModel;
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

	}).then(user => {

		if(!skipImportToyModel){

			//import toy model
			var ModelHelper = require('./helper/model');

			ModelHelper.importToyProject(username, username).catch(err => {
				systemLogger.logError('Failed to import toy model', { err : err && err.stack ? err.stack : err});
			});
		}

		if(!skipCreateBasicPlan){
			//basic quota
			user.createSubscription(Subscription.getBasicPlan().plan, user.user, true, null).then(() => user);
		}
		
		Role.createTeamSpaceRole(username).then(role => {
				return Role.grantTeamSpaceRoleToUser(username, username);
			}
		).catch(err => {
			systemLogger.logError('Failed to create role for ', username);
		});

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

		if(!user){
			return Promise.reject(responseCodes.USER_EMAIL_NOT_MATCH);
		}

		if(user.customData.email !== email){
			return Promise.reject({ resCode: responseCodes.USER_EMAIL_NOT_MATCH});
		}

		user.customData.resetPasswordToken = resetPasswordToken;

		return user.save();

	}).then(() => {
		return Promise.resolve(resetPasswordToken);
	});


};


function _fillInModelDetails(accountName, setting, permissions){
	'use strict';

	if(permissions.indexOf(C.PERM_MANAGE_MODEL_PERMISSION) !== -1){
		permissions = C.MODEL_PERM_LIST.slice(0);
	}

	let model = {
		federate: setting.federate,
		permissions: permissions,
		model: setting._id,
		name: setting.name,
		status: setting.status,
		errorReason: setting.errorReason,
		subModels: setting.federate && setting.toObject().subModels || undefined,
		timestamp: setting.timestamp || null
	};

	return Promise.resolve(model);

	// the following is not needed any more after caching timestamp and submodels in model settings

	// return History.findByBranch({account: accountName, model: model.model}, C.MASTER_BRANCH_NAME).then(history => {

	// 	if(history){
	// 		model.timestamp = history.timestamp;
	// 	} else {
	// 		model.timestamp = null;
	// 	}

	// 	if(setting.federate){
		
	// 		//list all sub models of a fed model
	// 		return ModelHelper.listSubModels(accountName, model.model, C.MASTER_BRANCH_NAME).then(subModels => {
	// 			model.subModels = subModels;
	// 		}).then(() => model);

	// 	}

	// 	return model;
	// });

}
//list all models in an account
function _getModels(accountName, ids, permissions){
	'use strict';

	let models = [];
	let fedModels = [];

	let query = {};

	if(ids){
		query = { _id : { '$in': ids}};
	}

	return ModelSetting.find({account: accountName}, query).then(settings => {

		let promises = [];

		settings.forEach(setting => {
			promises.push(
				_fillInModelDetails(accountName, setting, permissions).then(model => {
					if(!(model.permissions.length == 1 && model.permissions[0] == null))
						setting.federate ? fedModels.push(model) : models.push(model);
				})
			);
		});

		return Promise.all(promises).then(() => { return {models, fedModels}; });
	});
}

// find projects and put models into project
function _addProjects(account, username, models){
	'use strict';
	
	let query = {};

	if (models){
		query = { models: { $in: models} };
	}

	return Project.find({account: account.account}, query).then(projects => {

		projects.forEach((project, i) => {
		
			project = project.toObject();

			let permissions = project.permissions.find(p => p.user === username);
			permissions = _.get(permissions, 'permissions') || [];
			// show inherited and implied permissions
			permissions = permissions.map(p => C.IMPLIED_PERM[p] && C.IMPLIED_PERM[p].project || p);
			permissions = permissions.concat(account.permissions.map(p => C.IMPLIED_PERM[p] && C.IMPLIED_PERM[p].project || null));
			
			project.permissions = _.uniq(_.compact(_.flatten(permissions)));
			
			projects[i] = project;

			const findModel = model => (m, i, models) => {
				if (m.model === model){
					models.splice(i, 1);
					return true;
				}
			};

			project.models.forEach((model, i) => {

				let fullModel = account.models.find(findModel(model)) || account.fedModels.find(findModel(model));
				project.models[i] = fullModel;

			});

			project.models = _.compact(project.models);

		});

		account.projects = account.projects.concat(projects);
	});
}


function _findModelDetails(dbUserCache, username, model){
	'use strict';

	let getUser;
	let dbUser;

	if(dbUserCache[model.account]){
		getUser = Promise.resolve(dbUserCache[model.account]);
	} else {
		getUser = User.findByUserName(model.account).then(user => {
			dbUserCache[model.account] = user;
			return dbUserCache[model.account];
		});
	}

	return getUser.then(_user => {
		dbUser = _user;
		return ModelSetting.findById({account: model.account}, model.model);

	}).then(setting => {

		let permissions = [];

		if(!setting){
			setting = { _id: model.model };
		} else {
			const template = setting.findPermissionByUser(username);
			
			if (template){
				permissions = dbUser.customData.permissionTemplates.findById(template.permission).permissions;
			}
		}

		return {setting, permissions};
	});
}

function _calSpace(user){
	'use strict';

	let quota = user.customData.billing.subscriptions.getSubscriptionLimits();

	return User.historyChunksStats(user.user).then(stats => {

		if(stats && quota.spaceLimit > 0){
			let totalSize = 0;
			stats.forEach(stat => {
				totalSize += stat.size;
			});

			quota.spaceUsed = totalSize;
		} else if(quota) {
			quota.spaceUsed = 0;
		}

		return quota;
	});

}

function _sortAccountsAndModels(accounts){
	'use strict';

	function sortModel(a, b) {
			if(a.timestamp < b.timestamp){
				return 1;
			} else if (a.timestamp > b.timestamp){
				return -1;
			} else {
				return 0;
			}
	}

	accounts.forEach(account => {
		account.models.sort(sortModel);
		account.fedModels.sort(sortModel);
		account.projects.forEach(p => p.models.sort(sortModel));
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
}

// function _findModel(id, accounts){

// 	//flatten all the model ids in accounts object
// 	const ids = accounts.reduce(
// 		(arr, account) => arr.concat(
// 			account.models.map(model => model.model), 
// 			account.fedModels.map(model => model.model), 
// 			account.projects.reduce((arr, project) => arr.concat(project.models.map(model => model.model)), [])
// 		), 
// 		[]
// 	);

// 	console.log('findModel', ids, id);
// 	return ids.indexOf(id) !== -1;
// }

function _findModel(id, account){
	return account.models.find(m => m.model === id) ||
		account.fedModels.find(m => m.model === id) ||
		account.projects.reduce((target, project) => target || project.models.find(m => m.model === id), null);
}

function _makeAccountObject(name){
	return {account: name, models: [], fedModels: [], projects: [], permissions: [], isAdmin: false};
}

function _createAccounts(roles, userName)
{
	'use strict';

	let accounts = [];
	let promises = [];

	roles.forEach( role => {
		promises.push(User.findByUserName(role.db).then(user => {
			if(!user) return;
			let tsPromises = [];
			const permission = user.customData.permissions.findByUser(userName);
			if(permission){
				//Check for admin Privileges first
				const isTeamspaceAdmin = permission.permissions.indexOf(C.PERM_TEAMSPACE_ADMIN) !== -1;
				const canViewProjects = permission.permissions.indexOf(C.PERM_VIEW_PROJECTS) !== -1;
					let account = {
					account: user.user,
					projects: [],
					models: [],
					fedModels: [],
					isAdmin: isTeamspaceAdmin,
					permissions: permission.permissions || []
				};

				//show all implied and inherted permissions
				account.permissions = _.uniq(_.flatten(account.permissions.map(p => C.IMPLIED_PERM[p] && C.IMPLIED_PERM[p].account || p)));
				accounts.push(account);
				if (isTeamspaceAdmin || canViewProjects){
					//show all implied and inherted permissions
					const inheritedModelPermissions = _.uniq(_.flatten(account.permissions.map(p => C.IMPLIED_PERM[p] && C.IMPLIED_PERM[p].model || [])));
					
					tsPromises.push(
						// list all models under this account as they have full access
						_getModels(account.account, null, inheritedModelPermissions).then(data => {
							account.models = data.models;
							account.fedModels = data.fedModels;
								// add space usage stat info into account object
							if (isTeamspaceAdmin){
								return _calSpace(user).then(quota => account.quota = quota);
							}
						}).then(() => _addProjects(account, userName))	
					);
				}
				
			}

			return Promise.all(tsPromises).then(()=>{
				//check project scope permissions
				let projPromises = [];
				let account = null;
				const query = { 'permissions': { '$elemMatch': { user: userName } }};
				const projection = { 'permissions': { '$elemMatch': { user: userName } }, "models": 1, "name": 1};
				return Project.find({account: user.user}, query, projection).then(projects => {

					projects.forEach( _proj =>{
						projPromises.push(new Promise(function(resolve, reject){
							let myProj;
							if(!_proj || _proj.permissions.length === 0){
								resolve();
								return;
							}
							if(!account){
	
								account = accounts.find(account => account.account === user.user);
								if(!account)
								{
									account = _makeAccountObject(user.user);
									accounts.push(account);
								}
							}	

							myProj = account.projects.find(p => p.name === _proj.name);

							if(!myProj){
								myProj = _proj.toObject();
								account.projects.push(myProj);
								myProj.permissions = myProj.permissions[0].permissions;
							} else {
								myProj.permissions = _.uniq(myProj.permissions.concat(_proj.toObject().permissions[0].permissions));
							}


							// show implied and inherited permissions
							myProj.permissions = myProj.permissions.map(p => C.IMPLIED_PERM[p] && C.IMPLIED_PERM[p].project || p);
							myProj.permissions = _.uniq(_.flatten(myProj.permissions));
	
							let inheritedModelPerms = myProj.permissions.map(p => C.IMPLIED_PERM[p] && C.IMPLIED_PERM[p].model || null);
							inheritedModelPerms = _.uniq(_.flatten(inheritedModelPerms));

							const newModelIds = _.difference(_proj.models, myProj.models.map(m => m.model));
							if(newModelIds.length){
								 _getModels(account.account, newModelIds, inheritedModelPerms).then(models => {
									myProj.models = models.models.concat(models.fedModels);
									resolve();
								});
							}
							else
							{
								resolve();
							}
						}));						

					})
					return Promise.all(projPromises).then(()=>
							{
								//model permissions
								let modelPromises = [];
								let dbUserCache = {};
								return ModelSetting.find({account: user.user},query, projection).then(models => {

									models.forEach(model => {
										if(model.permissions.length > 0){
											if(!account){
												account = accounts.find(account => account.account === user.user);
												if(!account){
													account = _makeAccountObject(user.user);
													accounts.push(account);
												}
											}	
											const existingModel = _findModel(model._id, account);
											modelPromises.push(
												_findModelDetails(dbUserCache, userName, { 
													account: user.user, model: model._id
												}).then(data => {
														return _fillInModelDetails(account.account, data.setting, data.permissions);
			
												}).then(_model => {
			
													if(existingModel){
								
														existingModel.permissions = _.uniq(existingModel.permissions.concat(_model.permissions));
															return;
													}
	
													//push result to account object
													return Project.findOne({ account: account.account }, { models: _model.model }).then(projectObj => {
														if (projectObj){
									
															let project = account.projects.find(p => p.name === projectObj.name);
								
															if(!project){
																project = {
																	_id: projectObj._id,
																	name: projectObj.name,
																	permissions: [],
																	models: []
																};
																account.projects.push(project);
															}
															project.models.push(_model);

														} else {
															_model.federate ? account.fedModels.push(_model) : account.models.push(_model);
														}
													});
												})
											);
										}
									});
									


									return Promise.all(modelPromises).then(() => {

										//fill in all subModels name
										accounts.forEach(account => {
											//all fed models
											const allFedModels = account.fedModels.concat(
											account.projects.reduce((feds, project) => feds.concat(project.models.filter(m => m.federate)), [])
											);

											//all models	
											const allModels = account.models.concat(
												account.projects.reduce((feds, project) => feds.concat(project.models.filter(m => !m.federate)), [])
											);

											allFedModels.forEach(fed => {
												fed.subModels.forEach(subModel => {
													const foundModel = allModels.find(m => m.model === subModel.model);
													subModel.name = foundModel && foundModel.name;
												});
											});
										});


										//sorting models
										_sortAccountsAndModels(accounts);

										// own acconut always ranks top of the list
										let myAccountIndex = accounts.findIndex(account => account.account === userName);
										if(myAccountIndex > -1){
											let myAccount = accounts[myAccountIndex];
											accounts.splice(myAccountIndex, 1);
											accounts.unshift(myAccount);
										}


										return accounts;

									});			
								});
							});
				});
				
			});
		}));

	});

	return Promise.all(promises).then(() => { return accounts;});

}
schema.methods.listAccounts = function(){
	'use strict';

	return _createAccounts(this.roles, this.user);	
}

schema.methods.buySubscriptions = function(plans, billingUser, billingAddress){
	"use strict";

	let billingAgreement;

	plans = plans || [];
	
	return this.customData.billing.buySubscriptions(plans, this.user, billingUser, billingAddress)
	.then(_billingAgreement => {
		
		billingAgreement = _billingAgreement;
		return this.save();

	}).then(() => {
		return Promise.resolve(billingAgreement || {});
	});
};


schema.statics.activateSubscription = function(billingAgreementId, paymentInfo, raw){
	'use strict';


	let dbUser;

	return this.findUserByBillingId(billingAgreementId).then(user => {

		dbUser = user;

		if(!dbUser){
			return Promise.reject({ message: `No users found with billingAgreementId ${billingAgreementId}`});
		}

		return dbUser.customData.billing.activateSubscriptions(dbUser.user, paymentInfo, raw);

	}).then(() => {
		return dbUser.save();
	}).then(() => {
		return Promise.resolve({subscriptions: dbUser.customData.billing.subscriptions, account: dbUser, payment: paymentInfo});
	});

};

schema.methods.executeBillingAgreement = function(){
	'use strict';
	return this.customData.billing.executeBillingAgreement(this.user).then(() => {
		return this.save();
	});
};

schema.methods.removeAssignedSubscriptionFromUser = function(id, cascadeRemove){
	'use strict';
	var sub = this.customData.billing.subscriptions.findByID(id);
	var username = sub ? sub.assignedUser : null ;
	return this.customData.billing.subscriptions.removeAssignedSubscriptionFromUser(id, this.user, cascadeRemove).then(subscription => {
		if(username){
			Role.revokeTeamSpaceRoleFromUser(username, this.user);
		}
		return this.save().then(() => subscription);
	});

};

schema.methods.assignSubscriptionToUser = function(id, userData){
	'use strict';

	return this.customData.billing.subscriptions.assignSubscriptionToUser(id, userData).then(subscription => {
		//add this user to the role
		Role.grantTeamSpaceRoleToUser(userData.user, this.user);
		return this.save().then(() => subscription);
	});
};

schema.methods.updateAssignDetail = function(id, data){
	'use strict';

	return this.customData.billing.subscriptions.updateAssignDetail(id, data).then(subscription => {
		return this.save().then(() => subscription);
	});
};

schema.methods.createSubscription = function(plan, billingUser, active, expiredAt){
	'use strict';

	this.customData.billing.billingUser = billingUser;
	let subscription = this.customData.billing.subscriptions.addSubscription(plan, active, expiredAt);
	//this.markModified('customData.billing');
	return this.save().then(() => {
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
