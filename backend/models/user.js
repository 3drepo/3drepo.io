/**
 *
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
"use strict";

const mongoose = require("mongoose");
const ModelFactory = require("./factory/modelFactory");
const responseCodes = require("../response_codes.js");
const _ = require("lodash");
const DB = require("../handler/db");
const crypto = require("crypto");
const utils = require("../utils");
const Role = require("./role");
const Job = require("./job");
const Mailer = require("../mailer/mailer");

const systemLogger = require("../logger.js").systemLogger;

const config = require("../config");

const ModelSetting = require("./modelSetting");
const C = require("../constants");
const userBilling = require("./userBilling");
const permissionTemplate = require("./permissionTemplate");
const accountPermission = require("./accountPermission");
const Project = require("./project");
const FileRef = require("./fileRef");

const schema = mongoose.Schema({
	_id: String,
	user: String,
	customData: {
		firstName: String,
		lastName: String,
		email: String,
		apiKey: String,
		mailListOptOut: Boolean,
		createdAt: Date,
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
			_id: false,
			type: userBilling,
			default: userBilling,
			get: function (billing) {
				if (billing) {
					billing._parent = this;
				}
				return billing;
			}

		},
		avatar: Object,
		lastLoginAt: Date,
		permissionTemplates: {
			type: [permissionTemplate.schema],
			get: function (permissionTemplates) {
				return permissionTemplate.methods.init(this, permissionTemplates);
			}
		},
		// teamspace level permissions
		permissions: {
			type: [accountPermission.schema],
			get: function (permissions) {
				return accountPermission.methods.init(this, permissions);
			}
		},
		hereEnabled: Boolean,
		vrEnabled: Boolean
	},
	roles: [{}]
});

schema.statics.getTeamspaceSpaceUsed = function (dbName) {
	return DB.getCollection(dbName, "settings").then((col) => {
		return col.find({}, {_id: 1}).toArray().then((settings) => {
			const spaceUsedProm = [];
			settings.forEach((setting) => {
				spaceUsedProm.push(FileRef.getTotalOrgFileSize(dbName, setting._id));
			});

			return Promise.all(spaceUsedProm).then((spacePerModel) => {
				return spacePerModel.reduce((total, value) => total + value, 0);
			});
		});
	});
};

schema.statics.authenticate = function (logger, username, password) {

	if (!username || !password) {
		return Promise.reject({ resCode: responseCodes.INCORRECT_USERNAME_OR_PASSWORD });
	}

	let authDB = null;
	return DB.getAuthDB().then(_authDB => {
		authDB = _authDB;
		return authDB.authenticate(username, password);
	}).then(() => {
		authDB.close();
		return this.findByUserName(username);
	}).then(user => {
		if (user.customData && user.customData.inactive) {
			return Promise.reject({ resCode: responseCodes.USER_NOT_VERIFIED });
		}

		if (!user.customData) {
			user.customData = {};
		}

		return user.save();

	}).catch(err => {
		if (authDB) {
			authDB.close();
		}
		return Promise.reject(err.resCode ? err : { resCode: utils.mongoErrorToResCode(err) });
	});
};

schema.statics.findByUserName = function (user) {
	return this.findOne({ account: "admin" }, { user });
};

schema.statics.getProfileByUsername = async function (username) {
	if (!username) {
		return null;
	}

	const dbCol = await DB.getCollection("admin", "system.users");
	const user = await dbCol.findOne({user: username}, {user: 1,
		"customData.firstName" : 1,
		"customData.lastName" : 1,
		"customData.email" : 1,
		"customData.avatar" : 1,
		"customData.apiKey" : 1
	});

	const customData =  user.customData;

	return 	{
		username: user.user,
		firstName: customData.firstName,
		lastName: customData.lastName,
		email: customData.email,
		hasAvatar: !!customData.avatar,
		apiKey: customData.apiKey
	};
};

schema.statics.findByAPIKey = async function (key) {
	if (!key) {
		return null;
	}

	const dbCol = await DB.getCollection("admin", "system.users");
	const user = await dbCol.findOne({"customData.apiKey" : key});
	return user;
};

schema.statics.generateApiKey = async function (username) {
	const apiKey = crypto.randomBytes(16).toString("hex");
	const dbCol = await DB.getCollection("admin", "system.users");
	await dbCol.update({ user: username}, {$set: {"customData.apiKey" : apiKey}});
	return apiKey;
};

schema.statics.deleteApiKey = async function (username) {
	const dbCol = await DB.getCollection("admin", "system.users");
	await dbCol.update({ user: username}, {$unset: {"customData.apiKey" : 1}});
};

schema.statics.findUsersWithoutMembership = function (teamspace, searchString) {
	return DB.getCollection("admin", "system.users").then(dbCol => {
		return dbCol
			.find({
				$and: [{
					$or: [
						{ user: new RegExp(`.*${searchString}.*`, "i") },
						{ "customData.email": searchString }
					]
				},
				{ "customData.inactive": { "$exists": false }}
				]
			}).toArray();
	}).then((users) => {
		const notMembers = users.reduce((members, {user, roles, customData}) => {
			const isMemberOfTeamspace = roles.some((roleItem) => {
				return roleItem.db === teamspace && roleItem.role === C.DEFAULT_MEMBER_ROLE;
			});

			if (!isMemberOfTeamspace) {
				members.push({
					user,
					roles,
					firstName: customData.firstName,
					lastName: customData.lastName,
					company: _.get(customData, "billing.billingInfo.company", null)
				});
			}

			return members;
		}, []);

		return Promise.resolve(notMembers);
	});
};

// case insenstive
schema.statics.isUserNameTaken = function (username) {
	return this.count({ account: "admin" }, {
		user: new RegExp(`^${username}$`, "i")
	});
};

schema.statics.findByEmail = function (email) {
	return this.findOne({ account: "admin" }, { "customData.email": email });
};

schema.statics.findByPaypalPaymentToken = function (token) {
	return this.findOne({ account: "admin" }, { "customData.billing.paypalPaymentToken": token });
};

schema.statics.isEmailTaken = function (email, exceptUser) {

	let query = { "customData.email": email };

	if (exceptUser) {
		query = { "customData.email": email, "user": { "$ne": exceptUser } };
	}

	return this.count({ account: "admin" }, query);
};

schema.statics.findUserByBillingId = function (billingAgreementId) {
	return this.findOne({ account: "admin" }, { "customData.billing.billingAgreementId": billingAgreementId });
};

schema.statics.updatePassword = function (logger, username, oldPassword, token, newPassword) {

	if (!((oldPassword || token) && newPassword)) {
		return Promise.reject({ resCode: responseCodes.INVALID_INPUTS_TO_PASSWORD_UPDATE });
	}

	let checkUser;
	let user;

	if (oldPassword) {

		if (oldPassword === newPassword) {
			return Promise.reject(responseCodes.NEW_OLD_PASSWORD_SAME);
		}

		checkUser = this.authenticate(logger, username, oldPassword);
	} else if (token) {

		checkUser = this.findByUserName(username).then(_user => {

			user = _user;

			const tokenData = user.customData.resetPasswordToken;
			if (tokenData && tokenData.token === token && tokenData.expiredAt > new Date()) {
				return Promise.resolve();
			} else {
				return Promise.reject({ resCode: responseCodes.TOKEN_INVALID });
			}
		});
	}

	return checkUser.then(() => {

		const updateUserCmd = {
			"updateUser": username,
			"pwd": newPassword
		};

		return ModelFactory.dbManager.runCommand("admin", updateUserCmd);

	}).then(() => {

		if (user) {
			user.customData.resetPasswordToken = undefined;
			return user.save().then(() => Promise.resolve());
		}

		return Promise.resolve();

	}).catch(err => {
		return Promise.reject(err.resCode ? err : { resCode: utils.mongoErrorToResCode(err) });
	});

};

schema.statics.usernameRegExp = /^[a-zA-Z][\w]{1,63}$/;

schema.statics.createUser = function (logger, username, password, customData, tokenExpiryTime, skipCheckEmail) {

	if (customData) {
		return ModelFactory.dbManager.getAuthDB().then(adminDB => {

			const cleanedCustomData = {};
			let emailRegex = /^(['a-zA-Z0-9_\-.]+)@([a-zA-Z0-9_\-.]+)\.([a-zA-Z]{2,5})$/;

			if (config.auth.allowPlusSignInEmail) {
				emailRegex = /^(['+a-zA-Z0-9_\-.]+)@([a-zA-Z0-9_\-.]+)\.([a-zA-Z]{2,5})$/;
			}

			if (!customData.email || !customData.email.match(emailRegex)) {
				return Promise.reject({ resCode: responseCodes.SIGN_UP_INVALID_EMAIL });
			}

			if (!this.usernameRegExp.test(username)) {
				return Promise.reject({ resCode: responseCodes.INVALID_USERNAME });
			}

			if (-1 !== C.REPO_BLACKLIST_USERNAME.indexOf(username.toLowerCase())) {
				return Promise.reject({ resCode: responseCodes.INVALID_USERNAME });
			}

			cleanedCustomData.createdAt = new Date();

			["firstName", "lastName", "email", "mailListOptOut"].forEach(key => {
				if (customData[key]) {
					cleanedCustomData[key] = customData[key];
				}
			});

			const billingInfo = {};

			["firstName", "lastName", "countryCode", "company"].forEach(key => {
				if (customData[key]) {
					billingInfo[key] = customData[key];
				}
			});

			const expiryAt = new Date();
			expiryAt.setHours(expiryAt.getHours() + tokenExpiryTime);

			cleanedCustomData.inactive = true;

			// default permission
			cleanedCustomData.permissions = [{
				user: username,
				permissions: [C.PERM_TEAMSPACE_ADMIN]
			}];

			// default templates
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

			cleanedCustomData.emailVerifyToken = {
				token: crypto.randomBytes(64).toString("hex"),
				expiredAt: expiryAt
			};

			return this.isUserNameTaken(username).then(count => {

				if (count !== 0) {
					return Promise.reject(responseCodes.USER_EXISTS);
				}

				let checkEmail = Promise.resolve(0);

				if (!skipCheckEmail) {
					checkEmail = this.isEmailTaken(customData.email);
				}

				return checkEmail;
			}).then(count => {

				if (count === 0) {

					return adminDB.addUser(username, password, { customData: cleanedCustomData, roles: [] }).then(() => {
						return Promise.resolve(cleanedCustomData.emailVerifyToken);
					}).catch(err => {
						return Promise.reject({ resCode: utils.mongoErrorToResCode(err) });
					});

				} else {
					return Promise.reject({ resCode: responseCodes.EMAIL_EXISTS });
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
	} else {
		return Promise.reject({ resCode: responseCodes.SIGN_UP_INVALID_EMAIL });
	}
};

function formatPronouns(str) {
	const strArr = str.toLowerCase().split(" ");
	return strArr.map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(" ");
}

schema.statics.verify = function (username, token, options) {

	options = options || {};

	const allowRepeatedVerify = options.allowRepeatedVerify;
	const skipImportToyModel = options.skipImportToyModel;

	return this.findByUserName(username).then(_user => {

		const user = _user;

		const tokenData = user && user.customData && user.customData.emailVerifyToken;

		if (!user) {

			return Promise.reject({ resCode: responseCodes.TOKEN_INVALID });

		} else if (!user.customData.inactive && !allowRepeatedVerify) {

			return Promise.reject({ resCode: responseCodes.ALREADY_VERIFIED });

		} else if (tokenData.token === token && tokenData.expiredAt > new Date()) {

			user.customData.inactive = undefined;
			user.customData.emailVerifyToken = undefined;
			return user.save();

		} else {
			return Promise.reject({ resCode: responseCodes.TOKEN_INVALID });
		}

	}).then((user) => {
		const name = user.customData.firstName && user.customData.firstName.length > 0 ?
			formatPronouns(user.customData.firstName) : user.user;
		Mailer.sendWelcomeUserEmail(user.customData.email, {user: name});

		if (!skipImportToyModel) {

			// import toy model
			const ModelHelper = require("./helper/model");

			ModelHelper.importToyProject(username, username).catch(err => {
				systemLogger.logError("Failed to import toy model", { err: err && err.stack ? err.stack : err });
			});
		}

		Role.createTeamSpaceRole(username).then(() => {
			return Role.grantTeamSpaceRoleToUser(username, username);
		}
		).catch((err) => {
			systemLogger.logError("Failed to create role for ", username, err);
		});

		Job.addDefaultJobs(username).catch((err) => {
			systemLogger.logError("Failed to create default jobs for ", username, err);
		});

	});
};

schema.methods.hasReadLatestTerms = function () {
	return new Date(config.termsUpdatedAt) < this.customData.lastLoginAt;
};

schema.methods.getAvatar = function () {
	return this.customData && this.customData.avatar || null;
};

schema.methods.updateInfo = function (updateObj) {

	const updateableFields = ["firstName", "lastName", "email"];

	this.customData = this.customData || {};
	let validUpdates = true;
	updateableFields.forEach(field => {
		if (updateObj.hasOwnProperty(field)) {
			if (Object.prototype.toString.call(updateObj[field]) === "[object String]") {
				this.customData[field] = updateObj[field];
			} else {
				validUpdates = false;
			}
		}
	});

	if (!validUpdates) {
		return Promise.reject({ resCode: responseCodes.INVALID_ARGUMENTS });
	}

	return User.isEmailTaken(this.customData.email, this.user).then(count => {
		if (count === 0) {
			return this.save();
		} else {
			return Promise.reject({ resCode: responseCodes.EMAIL_EXISTS });
		}
	});
};

schema.statics.findUsernameOrEmail = function (userNameOrEmail) {
	return DB.getCollection("admin", "system.users").then(dbCol => {
		return dbCol
			.findOne({
				$or: [
					{ user: userNameOrEmail },
					{ "customData.email": userNameOrEmail }
				]
			}
			);
	});
};

schema.statics.getForgotPasswordToken = function (userNameOrEmail) {

	const expiryAt = new Date();
	expiryAt.setHours(expiryAt.getHours() + config.tokenExpiry.forgotPassword);

	const resetPasswordToken = {
		token: crypto.randomBytes(64).toString("hex"),
		expiredAt: expiryAt
	};

	let resetPasswordUserInfo = {};

	let user;

	return this.findUsernameOrEmail(userNameOrEmail).then(_user => {

		user = _user;

		// set token only if username is found.
		if (user) {
			user.customData.resetPasswordToken = resetPasswordToken;

			resetPasswordUserInfo = {
				token: resetPasswordToken.token,
				email: user.customData.email,
				username: user.user
			};

			return updateUser(user.user, { $set: { "customData.resetPasswordToken": resetPasswordToken } });
		} else {
			return Promise.resolve();
		}

	}).then(() => {
		return Promise.resolve(resetPasswordUserInfo);
	});

};

function _fillInModelDetails(accountName, setting, permissions) {

	if (permissions.indexOf(C.PERM_MANAGE_MODEL_PERMISSION) !== -1) {
		permissions = C.MODEL_PERM_LIST.slice(0);
	}

	const model = {
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
// list all models in an account
function _getModels(accountName, ids, permissions) {

	const models = [];
	const fedModels = [];

	let query = {};

	if (ids) {
		query = { _id: { "$in": ids } };
	}

	return ModelSetting.find({ account: accountName }, query).then(settings => {

		const promises = [];

		settings.forEach(setting => {
			promises.push(
				_fillInModelDetails(accountName, setting, permissions).then(model => {
					if (!(model.permissions.length === 1 && model.permissions[0] === null)) {
						setting.federate ? fedModels.push(model) : models.push(model);
					}
				})
			);
		});

		return Promise.all(promises).then(() => {
			return { models, fedModels };
		});
	});
}

// find projects and put models into project
function _addProjects(account, username, models) {

	let query = {};

	if (models) {
		query = { models: { $in: models } };
	}

	return Project.find({ account: account.account }, query).then(projects => {

		projects.forEach((project, i) => {

			project = project.toObject();

			let permissions = project.permissions.find(p => p.user === username);
			permissions = _.get(permissions, "permissions") || [];
			// show inherited and implied permissions
			permissions = permissions.map(p => C.IMPLIED_PERM[p] && C.IMPLIED_PERM[p].project || p);
			permissions = permissions.concat(account.permissions.map(p => C.IMPLIED_PERM[p] && C.IMPLIED_PERM[p].project || null));

			project.permissions = _.uniq(_.compact(_.flatten(permissions)));

			projects[i] = project;

			const findModel = model => (m, index, modelList) => {
				if (m.model === model) {
					modelList.splice(index, 1);
					return true;
				}
			};

			project.models.forEach((model, j) => {

				const fullModel = account.models.find(findModel(model)) || account.fedModels.find(findModel(model));
				project.models[j] = fullModel;

			});

			project.models = _.compact(project.models);

		});

		account.projects = account.projects.concat(projects);
	});
}

function _findModelDetails(dbUserCache, username, model) {

	let getUser;
	let dbUser;

	if (dbUserCache[model.account]) {
		getUser = Promise.resolve(dbUserCache[model.account]);
	} else {
		getUser = User.findByUserName(model.account).then(user => {
			dbUserCache[model.account] = user;
			return dbUserCache[model.account];
		});
	}

	return getUser.then(_user => {
		dbUser = _user;
		return ModelSetting.findById({ account: model.account }, model.model);

	}).then(setting => {

		let permissions = [];

		if (!setting) {
			setting = { _id: model.model };
		} else {
			const template = setting.findPermissionByUser(username);

			if (template) {
				permissions = dbUser.customData.permissionTemplates.findById(template.permission).permissions;
			}
		}

		return { setting, permissions };
	});
}

function _calSpace(user) {

	const quota = user.customData.billing.getSubscriptionLimits();
	return User.getTeamspaceSpaceUsed(user.user).then(sizeInBytes => {

		if (quota.spaceLimit > 0) {
			quota.spaceUsed = sizeInBytes / (1024 * 1024); // In MiB
		} else if (quota) {
			quota.spaceUsed = 0;
		}
		return quota;
	});

}

function _sortAccountsAndModels(accounts) {

	function sortModel(a, b) {
		if (a.timestamp < b.timestamp) {
			return 1;
		} else if (a.timestamp > b.timestamp) {
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
		if (a.account.toLowerCase() < b.account.toLowerCase()) {
			return -1;
		} else if (a.account.toLowerCase() > b.account.toLowerCase()) {
			return 1;
		} else {
			return 0;
		}
	});
}

function _findModel(id, account) {
	return account.models.find(m => m.model === id) ||
		account.fedModels.find(m => m.model === id) ||
		account.projects.reduce((target, project) => target || project.models.find(m => m.model === id), null);
}

function _makeAccountObject(name) {
	return { account: name, models: [], fedModels: [], projects: [], permissions: [], isAdmin: false };
}

function _createAccounts(roles, userName) {

	const accounts = [];
	const promises = [];

	roles.forEach(role => {
		promises.push(User.findByUserName(role.db).then(user => {
			if (!user) {
				return;
			}
			const tsPromises = [];
			const permission = user.customData.permissions.findByUser(userName);
			if (permission) {
				// Check for admin Privileges first
				const isTeamspaceAdmin = permission.permissions.indexOf(C.PERM_TEAMSPACE_ADMIN) !== -1;
				const canViewProjects = permission.permissions.indexOf(C.PERM_VIEW_PROJECTS) !== -1;
				const account = {
					account: user.user,
					projects: [],
					models: [],
					fedModels: [],
					isAdmin: isTeamspaceAdmin,
					permissions: permission.permissions || []
				};

				// show all implied and inherted permissions
				account.permissions = _.uniq(_.flatten(account.permissions.map(p => C.IMPLIED_PERM[p] && C.IMPLIED_PERM[p].account || p)));
				accounts.push(account);
				if (isTeamspaceAdmin || canViewProjects) {
					// show all implied and inherted permissions
					const inheritedModelPermissions = _.uniq(_.flatten(account.permissions.map(p => C.IMPLIED_PERM[p] && C.IMPLIED_PERM[p].model || [])));

					tsPromises.push(
						// list all models under this account as they have full access
						_getModels(account.account, null, inheritedModelPermissions).then(data => {
							account.models = data.models;
							account.fedModels = data.fedModels;
						}).then(() => _addProjects(account, userName))
					);
				}

			}

			return Promise.all(tsPromises).then(() => {
				// check project scope permissions
				const projPromises = [];
				let account = null;
				const query = { "permissions": { "$elemMatch": { user: userName } } };
				const projection = { "permissions": { "$elemMatch": { user: userName } }, "models": 1, "name": 1 };
				return Project.find({ account: user.user }, query, projection).then(projects => {

					projects.forEach(_proj => {
						projPromises.push(new Promise(function (resolve) {
							let myProj;
							if (!_proj || _proj.permissions.length === 0) {
								resolve();
								return;
							}
							if (!account) {

								account = accounts.find(_account => _account.account === user.user);
								if (!account) {
									account = _makeAccountObject(user.user);
									accounts.push(account);
								}
							}

							myProj = account.projects.find(p => p.name === _proj.name);

							if (!myProj) {
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
							if (newModelIds.length) {
								_getModels(account.account, newModelIds, inheritedModelPerms).then(models => {
									myProj.models = models.models.concat(models.fedModels);
									resolve();
								});
							} else {
								resolve();
							}
						}));

					});
					return Promise.all(projPromises).then(() => {
						// model permissions
						const modelPromises = [];
						const dbUserCache = {};
						return ModelSetting.find({ account: user.user }, query, projection).then(models => {

							models.forEach(model => {
								if (model.permissions.length > 0) {
									if (!account) {
										account = accounts.find(_account => _account.account === user.user);
										if (!account) {
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

											if (existingModel) {

												existingModel.permissions = _.uniq(existingModel.permissions.concat(_model.permissions));
												return;
											}

											// push result to account object
											return Project.findOne({ account: account.account }, { models: _model.model }).then(projectObj => {
												if (projectObj) {

													let project = account.projects.find(p => p.name === projectObj.name);

													if (!project) {
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

								// fill in all subModels name
								accounts.forEach(_account => {
									// all fed models
									const allFedModels = _account.fedModels.concat(
										_account.projects.reduce((feds, project) => feds.concat(project.models.filter(m => m.federate)), [])
									);

									// all models
									const allModels = _account.models.concat(
										_account.projects.reduce((feds, project) => feds.concat(project.models.filter(m => !m.federate)), [])
									);

									allFedModels.forEach(fed => {
										fed.subModels.forEach(subModel => {
											const foundModel = allModels.find(m => m.model === subModel.model);
											subModel.name = foundModel && foundModel.name;
										});
									});
								});

								// sorting models
								_sortAccountsAndModels(accounts);

								// own acconut always ranks top of the list
								const myAccountIndex = accounts.findIndex(_account => _account.account === userName);
								if (myAccountIndex > -1) {
									const myAccount = accounts[myAccountIndex];
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

	return Promise.all(promises).then(() => {
		return accounts;
	});

}
schema.methods.listAccounts = function () {
	return _createAccounts(this.roles, this.user);
};

schema.methods.updateSubscriptions = function (plans, billingUser, billingAddress) {

	let billingAgreement;

	plans = plans || [];

	return this.customData.billing.updateSubscriptions(plans, this.user, billingUser, billingAddress)
		.then(_billingAgreement => {

			billingAgreement = _billingAgreement;
			return updateUser(this.user, { $set: { "customData.billing": this.customData.billing } });
		}).then(() => {
			return Promise.resolve(billingAgreement || {});
		});
};

function updateUser(username, update) {
	return DB.getCollection("admin", "system.users").then(dbCol => {
		return dbCol.update({ user: username }, update);
	});

}

schema.statics.activateSubscription = function (billingAgreementId, paymentInfo, raw) {

	let dbUser;
	return this.findUserByBillingId(billingAgreementId).then(user => {
		dbUser = user;

		if (!dbUser) {
			return Promise.reject({ message: `No users found with billingAgreementId ${billingAgreementId}` });
		}

		return dbUser.customData.billing.activateSubscriptions(dbUser.user, paymentInfo, raw);

	}).then(() => {
		return updateUser(dbUser.user, { $set: { "customData.billing": dbUser.customData.billing } });
	}).then(() => {
		return Promise.resolve({ subscriptions: dbUser.customData.billing.subscriptions, account: dbUser, payment: paymentInfo });
	});

};

schema.methods.executeBillingAgreement = function () {
	return this.customData.billing.executeBillingAgreement(this.user).then(() => {
		return updateUser(this.user, { $set: { "customData.billing": this.customData.billing } });
	});
};

schema.methods.removeTeamMember = function (username, cascadeRemove) {

	let foundProjects = [];
	let foundModels = [];

	if (this.user === username) {
		// The user should not be able to remove itself from the teamspace
		return Promise.reject(responseCodes.SUBSCRIPTION_CANNOT_REMOVE_SELF);
	}

	const teamspacePerm = this.customData.permissions.findByUser(username);
	// check if they have any permissions assigned
	return Project.find({ account: this.user }, { "permissions.user": username }).then(projects => {

		foundProjects = projects;
		return ModelSetting.find({ account: this.user }, { "permissions.user": username });

	}).then(models => {

		foundModels = models;

		if (!cascadeRemove && (foundModels.length || foundProjects.length || teamspacePerm)) {

			return Promise.reject({
				resCode: responseCodes.USER_IN_COLLABORATOR_LIST,
				info: {
					models: foundModels.map(m => {
						return { model: m.name };
					}),
					projects: foundProjects.map(p => p.name),
					teamspace: teamspacePerm
				}
			});

		} else {

			const promises = [];

			if (teamspacePerm) {
				promises.push(this.customData.permissions.remove(username));
			}

			promises.push(foundModels.map(model =>
				model.changePermissions(model.permissions.filter(p => p.user !== username))));

			promises.push(foundProjects.map(project =>
				project.updateAttrs({ permissions: project.permissions.filter(p => p.user !== username) })));

			promises.push(Job.removeUserFromAnyJob(this.user, username));
			return Promise.all(promises);
		}

	}).then(() => {
		return Role.revokeTeamSpaceRoleFromUser(username, this.user);
	});

};

schema.methods.addTeamMember = function (user, job, permissions) {
	return User.getAllUsersInTeamspace(this.user).then((userArr) => {
		const limits = this.customData.billing.getSubscriptionLimits();

		if (limits.collaboratorLimit !== "unlimited" && userArr.length >= limits.collaboratorLimit) {
			return Promise.reject(responseCodes.LICENCE_LIMIT_REACHED);
		} else {
			return User.findByUserName(user).then((userEntry) => {
				if (!userEntry) {
					return Promise.reject(responseCodes.USER_NOT_FOUND);
				}
				if (userEntry.isMemberOfTeamspace(this.user)) {
					return Promise.reject(responseCodes.USER_ALREADY_ASSIGNED);
				}

				return Role.grantTeamSpaceRoleToUser(user, this.user).then(() => {
					const promises = [];
					if (job) {
						promises.push(Job.addUserToJob(this.user, user, job));
					}
					if (permissions && permissions.length) {
						promises.push(this.customData.permissions.add({user, permissions}));
					}

					return Promise.all(promises).then(userEntry.getBasicDetails.bind(userEntry));
				})
					.then(userData => Object.assign({job, permissions}, userData));
			});
		}
	});
};

schema.methods.getBasicDetails = function() {
	const {user, customData} = this;
	return {
		user,
		firstName: customData.firstName,
		lastName: customData.lastName,
		company: _.get(customData, "billing.billingInfo.company", null)
	};
};

schema.methods.isMemberOfTeamspace = function (teamspace) {
	return this.roles.filter(role => role.db === teamspace && role.role === C.DEFAULT_MEMBER_ROLE).length > 0;
};

schema.statics.getQuotaInfo = function (teamspace) {
	return this.findByUserName(teamspace).then((user) => {
		if (!user) {
			return Promise.reject(responseCodes.USER_NOT_FOUND);
		}

		return _calSpace(user);
	});
};

schema.statics.getMembers = function (teamspace) {
	const promises = [];

	const getTeamspaceMembers = this.findUsersInTeamspace(teamspace, {
		user: 1,
		customData: 1
	});
	const getJobInfo = Job.usersWithJob(teamspace);

	const getTeamspacePermissions = User.findByUserName(teamspace)
		.then(user => user.toObject().customData.permissions);

	promises.push(
		getTeamspaceMembers,
		getTeamspacePermissions,
		getJobInfo
	);

	return Promise.all(promises)
		.then(([members = [], teamspacePermissions, memToJob = {}]) => {
			return members.map(({user, customData}) => {
				const permissions = _.find(teamspacePermissions, {user});

				return {
					user,
					firstName: customData.firstName,
					lastName: customData.lastName,
					company: _.get(customData, "billing.billingInfo.company", null),
					permissions: _.get(permissions, "permissions", []),
					job: _.get(memToJob, user)
				};
			});
		});
};

schema.statics.getAllUsersInTeamspace = function (teamspace) {
	return this.findUsersInTeamspace(teamspace, {user: 1}).then(users => {
		const results = users.map(({user}) => user);
		return Promise.resolve(results);
	});
};

schema.statics.findUsersInTeamspace = function (teamspace, fields) {
	const query = { "roles.db": teamspace, "roles.role" : C.DEFAULT_MEMBER_ROLE };
	return this.find({account: "admin"}, query , fields);
};

schema.statics.teamspaceMemberCheck = function (teamspace, user) {
	return User.findByUserName(user).then((userEntry) => {
		if (!userEntry) {
			return Promise.reject(responseCodes.USER_NOT_FOUND);
		}

		if (!userEntry.isMemberOfTeamspace(teamspace)) {
			return Promise.reject(responseCodes.USER_NOT_ASSIGNED_WITH_LICENSE);
		}
	});
};

schema.statics.getTeamMemberInfo = function (teamspace, user) {
	return User.findByUserName(user).then((userEntry) => {
		if(!userEntry || !userEntry.isMemberOfTeamspace(teamspace)) {
			return Promise.reject(responseCodes.USER_NOT_FOUND);
		} else {
			return {
				user,
				firstName: userEntry.customData.firstName,
				lastName: userEntry.customData.lastName,
				company: _.get(userEntry.customData, "billing.billingInfo.company", null)
			};
		}
	});
};

schema.statics.isHereEnabled = function (username) {
	return _isHereEnabled(username);
};

function _isHereEnabled(username) {
	return DB.getCollection("admin", "system.users").then(dbCol => {
		return dbCol.findOne({ user: username }, { _id: 0, "customData.hereEnabled": 1 })
			.then((isHereEnabledResult) => {
				return isHereEnabledResult.customData.hereEnabled;
			});
	});
}

const User = ModelFactory.createClass(
	"User",
	schema,
	() => {
		return "system.users";
	}
);

module.exports = User;
