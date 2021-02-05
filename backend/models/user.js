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

const responseCodes = require("../response_codes.js");
const _ = require("lodash");
const DB = require("../handler/db");
const crypto = require("crypto");
const utils = require("../utils");
const Role = require("./role");
const { addDefaultJobs,  findJobByUser, usersWithJob, removeUserFromAnyJob, addUserToJob } = require("./job");

const History = require("./history");
const TeamspaceSettings = require("./teamspaceSetting");
const Mailer = require("../mailer/mailer");

const systemLogger = require("../logger.js").systemLogger;

const config = require("../config");

const ModelSetting = require("./modelSetting");
const C = require("../constants");
const UserBilling = require("./userBilling");
const AccountPermissions = require("./accountPermissions");
const {
	listProjects,
	findOneProject,
	getProjectsAndModelsForUser,
	getProjectNamesAccessibleToUser,
	removeUserFromProjects
} = require("./project");
const FileRef = require("./fileRef");
const PermissionTemplates = require("./permissionTemplates");

const isMemberOfTeamspace = function (user, teamspace) {
	return user.roles.filter(role => role.db === teamspace && role.role === C.DEFAULT_MEMBER_ROLE).length > 0;
};

const hasReachedLicenceLimit = async function (teamspace) {
	const Invitations = require("./invitations");
	const [userArr, invitations] = await Promise.all([
		User.getAllUsersInTeamspace(teamspace.user),
		Invitations.getInvitationsByTeamspace(teamspace.user)
	]);

	const limits =  UserBilling.getSubscriptionLimits(teamspace.customData.billing);

	const seatedLicences = userArr.length + invitations.length;
	const reachedLimit =  (limits.collaboratorLimit !== "unlimited" &&  seatedLicences >= limits.collaboratorLimit);

	if (reachedLimit) {
		throw (responseCodes.LICENCE_LIMIT_REACHED);
	}
};

const COLL_NAME = "system.users";

const User = {};

User.update = async function (username, data) {
	return DB.update("admin", COLL_NAME, {user: username}, {$set: data});
};

User.getTeamspaceSpaceUsed = async function (dbName) {
	const settings = await DB.find(dbName, "setting", {}, {_id: 1});

	const spacePerModel = await Promise.all(settings.map(async (setting) =>
		await FileRef.getTotalModelFileSize(dbName, setting._id))
	);

	return spacePerModel.reduce((total, value) => total + value, 0);
};

User.authenticate =  async function (logger, username, password) {
	if (!username || !password) {
		throw({ resCode: responseCodes.INCORRECT_USERNAME_OR_PASSWORD });
	}

	let user = null;
	let authDB = null;
	try {
		if (C.EMAIL_REGEXP.test(username)) { // if the submited username is the email
			user = await this.findByEmail(username);
			if (!user) {
				throw ({ resCode: responseCodes.INCORRECT_USERNAME_OR_PASSWORD });
			}

			username = user.user;
		}

		authDB = await DB.getAuthDB();
		await authDB.authenticate(username, password);
		authDB.close();

		if (!user)  {
			user = await this.findByUserName(username);
		}

		if (user.customData && user.customData.inactive) {
			throw ({ resCode: responseCodes.USER_NOT_VERIFIED });
		}

		if (!user.customData) {
			user.customData = {};
		}

		user.customData.lastLoginAt = new Date();

		await this.update(username, {"customData.lastLoginAt": user.customData.lastLoginAt});

		logger.logInfo("User has logged in", {username});

		return user;
	} catch(err) {
		if (authDB) {
			authDB.close();
		}

		throw (err.resCode ? err : { resCode: utils.mongoErrorToResCode(err) });
	}
};

User.getProfileByUsername = async function (username) {
	if (!username) {
		return null;
	}

	const user = await this.findByUserName(username, {user: 1,
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

User.getStarredMetadataTags = async function (username) {
	const userProfile = await this.findByUserName(username, {user: 1,
		"customData.StarredMetadataTags" : 1
	});

	return _.get(userProfile, "customData.StarredMetadataTags") || [];
};

User.appendStarredMetadataTag = async function (username, tag) {
	const dbCol = await DB.getCollection("admin", COLL_NAME);
	await dbCol.update({user: username}, {$addToSet: { "customData.StarredMetadataTags" : tag } });
	return {};
};

User.setStarredMetadataTags = async function (username, tags) {
	const dbCol = await DB.getCollection("admin", COLL_NAME);
	tags = _.uniq(tags);
	await dbCol.update({user: username}, {$set: { "customData.StarredMetadataTags" : tags}});
	return {};
};

User.deleteStarredMetadataTag = async function (username, tag) {
	const dbCol = await DB.getCollection("admin", COLL_NAME);
	await dbCol.update({user: username}, {$pull: { "customData.StarredMetadataTags" : tag } });
	return {};
};

User.getStarredModels = async function (username) {
	const dbCol = await DB.getCollection("admin", COLL_NAME);
	const userProfile = await dbCol.findOne({user: username}, {user: 1,
		"customData.starredModels" : 1
	});

	return _.get(userProfile, "customData.starredModels") || {};
};

User.appendStarredModels = async function (username, ts, modelID) {
	const dbCol = await DB.getCollection("admin", COLL_NAME);
	const userProfile = await dbCol.findOne({user: username}, {user: 1,
		"customData.starredModels" : 1
	});

	const starredModels = 	userProfile.customData.starredModels || {};
	if(!starredModels[ts]) {
		starredModels[ts] = [];
	}

	if(starredModels[ts].indexOf(modelID) === -1) {
		starredModels[ts].push(modelID);
		await dbCol.update({user: username}, {$set: { "customData.starredModels" : starredModels } });
	}
	return {};
};

User.setStarredModels = async function (username, models) {
	const dbCol = await DB.getCollection("admin", COLL_NAME);
	await dbCol.update({user: username}, {$set: { "customData.starredModels" : models}});
	return {};
};

User.deleteStarredModel = async function (username, ts, modelID) {
	const dbCol = await DB.getCollection("admin", COLL_NAME);
	const userProfile = await dbCol.findOne({user: username}, {user: 1,
		"customData.starredModels" : 1
	});

	if(userProfile.customData.starredModels && userProfile.customData.starredModels[ts]) {
		if(userProfile.customData.starredModels[ts].length === 1 &&
			userProfile.customData.starredModels[ts][0] === modelID) {
			const action = {$unset: {}};
			action.$unset[`customData.starredModels.${ts}`] = "";
			await dbCol.update({user: username}, action);

		} else {
			const action = {$pull: {}};
			action.$pull[`customData.starredModels.${ts}`] = modelID;
			await dbCol.update({user: username}, action);
		}
	}
	return {};
};

User.generateApiKey = async function (username) {
	const apiKey = crypto.randomBytes(16).toString("hex");
	await this.update(username, {"customData.apiKey" : apiKey});
	return apiKey;
};

User.deleteApiKey = async function (username) {
	await DB.update("admin", { user: username}, {$unset: {"customData.apiKey" : 1}});
};

User.findUsersWithoutMembership = async function (teamspace, searchString) {
	const users = await DB.find("admin", COLL_NAME, {
		$and: [{
			$or: [
				{ user: new RegExp(`.*${searchString}.*`, "i") },
				{ "customData.email": new RegExp(searchString, "i") }
			]
		},
		{ "customData.inactive": { "$exists": false }}
		]
	});

	const notMembers = users.reduce((members, userentry) => {
		if (!isMemberOfTeamspace(userentry, teamspace)) {
			const {user, roles, customData } = userentry;
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

	return notMembers;
};

// case insenstive
User.checkUserNameAvailableAndValid = async function (username) {

	if (!this.usernameRegExp.test(username) ||
		-1 !== C.REPO_BLACKLIST_USERNAME.indexOf(username.toLowerCase())
	) {
		throw (responseCodes.INVALID_USERNAME);
	}

	const count = await DB.count("admin", COLL_NAME, { user: new RegExp(`^${username}$`, "i")});

	if(count > 0) {
		throw (responseCodes.USER_EXISTS);
	}
};

User.checkEmailAvailableAndValid = async function (email, exceptUser) {
	const emailRegex = /^(['a-zA-Z0-9_\-.]+)@([a-zA-Z0-9_\-.]+)\.([a-zA-Z]{2,})$/;
	if (!email.match(emailRegex)) {
		throw(responseCodes.EMAIL_INVALID);
	}

	const query =  exceptUser ? { "customData.email": email, "user": { "$ne": exceptUser } }
		: { "customData.email": email };

	const count = await DB.count("admin", COLL_NAME, query);

	if(count > 0) {
		throw (responseCodes.EMAIL_EXISTS);
	}
};

User.updatePassword = async function (logger, username, oldPassword, token, newPassword) {

	if (!((oldPassword || token) && newPassword)) {
		throw ({ resCode: responseCodes.INVALID_INPUTS_TO_PASSWORD_UPDATE });
	}

	let user;

	if (oldPassword) {

		if (oldPassword === newPassword) {
			throw (responseCodes.NEW_OLD_PASSWORD_SAME);
		}

		await this.authenticate(logger, username, oldPassword);
	} else if (token) {
		user = await this.findByUserName(username);

		const tokenData = user.customData.resetPasswordToken;

		if (!tokenData || tokenData.token !== token || tokenData.expiredAt < new Date()) {
			throw ({ resCode: responseCodes.TOKEN_INVALID });
		}
	}

	const updateUserCmd = {
		"updateUser": username,
		"pwd": newPassword
	};
	try {
		await DB.runCommand("admin", updateUserCmd);

		if (user) {
			await this.update(username, {"customData.resetPasswordToken" : undefined });
		}

	} catch(err) {
		throw (err.resCode ? err : { resCode: utils.mongoErrorToResCode(err) });
	}
};

User.usernameRegExp = /^[a-zA-Z][\w]{1,63}$/;

User.createUser = async function (logger, username, password, customData, tokenExpiryTime) {
	const Invitations =  require("./invitations");
	if (!customData) {
		throw ({ resCode: responseCodes.EMAIL_INVALID });
	}

	await Promise.all([
		this.checkUserNameAvailableAndValid(username),
		this.checkEmailAvailableAndValid(customData.email)
	]);

	const adminDB = await DB.getAuthDB();

	const cleanedCustomData = {
		createdAt: new Date(),
		inactive: true
	};

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

	cleanedCustomData.billing = await UserBilling.changeBillingAddress(cleanedCustomData.billing || {}, billingInfo);

	try {
		await adminDB.addUser(username, password, { customData: cleanedCustomData, roles: [] });
	} catch(err) {
		throw ({ resCode: utils.mongoErrorToResCode(err) });
	}

	const user = await this.findByUserName(username);

	await Invitations.unpack(user);

	return cleanedCustomData.emailVerifyToken;
};

function formatPronouns(str) {
	const strArr = str.toLowerCase().split(" ");
	return strArr.map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(" ");
}

User.verify = async function (username, token, options) {
	options = options || {};

	const allowRepeatedVerify = options.allowRepeatedVerify;
	const skipImportToyModel = options.skipImportToyModel;

	const user = await this.findByUserName(username);

	const tokenData = user && user.customData && user.customData.emailVerifyToken;

	if (!user) {

		throw ({ resCode: responseCodes.TOKEN_INVALID });

	} else if (!user.customData.inactive && !allowRepeatedVerify) {

		throw ({ resCode: responseCodes.ALREADY_VERIFIED });

	} else if (tokenData.token === token && tokenData.expiredAt > new Date()) {

		await User.update(username, {"customData.inactive": undefined, "customData.emailVerifyToken": undefined });

	} else {
		throw ({ resCode: responseCodes.TOKEN_INVALID });
	}

	const name = user.customData.firstName && user.customData.firstName.length > 0 ?
		formatPronouns(user.customData.firstName) : user.user;
	Mailer.sendWelcomeUserEmail(user.customData.email, {user: name})
		.catch(err => systemLogger.logError(err));

	if (!skipImportToyModel) {

		// import toy model
		const ModelHelper = require("./helper/model");

		ModelHelper.importToyProject(username, username).catch(err => {
			systemLogger.logError("Failed to import toy model", { err: err && err.stack ? err.stack : err });
		});
	}

	try {
		await Role.createTeamSpaceRole(username);
		await Role.grantTeamSpaceRoleToUser(username, username);
	} catch(err) {
		systemLogger.logError("Failed to create role for ", username, err);
	}

	try {
		await addDefaultJobs(username);
	} catch(err) {
		systemLogger.logError("Failed to create default jobs for ", username, err);
	}

	try {
		await TeamspaceSettings.createTeamspaceSettings(username);
	} catch(err) {
		systemLogger.logError("Failed to create teamspace settings for ", username, err);
	}
};

User.hasReadLatestTerms = function (user) {
	return new Date(config.termsUpdatedAt) < user.customData.lastLoginAt;
};

User.getAvatar = function (user) {
	return user.customData && user.customData.avatar || null;
};

User.updateInfo = async function(username, updateObj) {
	const updateableFields = new Set(["firstName", "lastName", "email"]);

	let validUpdates = true;
	const updateData = {};

	updateableFields.forEach(field => {
		if (utils.hasField(updateObj, field) && validUpdates) {
			if (utils.isString(updateObj[field])) {
				updateData[`customData.${field}`] = updateObj[field];
			} else {
				validUpdates = false;
			}
		}
	});

	if (!validUpdates) {
		throw ({ resCode: responseCodes.INVALID_ARGUMENTS });
	}

	if (updateObj.email) {
		await User.checkEmailAvailableAndValid(updateObj.email, username);
	}

	await User.update(username, updateData);
};

User.getForgotPasswordToken = async function (userNameOrEmail) {
	const expiryAt = new Date();
	expiryAt.setHours(expiryAt.getHours() + config.tokenExpiry.forgotPassword);

	const resetPasswordToken = {
		token: crypto.randomBytes(64).toString("hex"),
		expiredAt: expiryAt
	};

	let resetPasswordUserInfo = {};

	const user = await this.findByUsernameOrEmail(userNameOrEmail);

	// set token only if username is found.
	if (user) {
		user.customData.resetPasswordToken = resetPasswordToken;
		resetPasswordUserInfo = {
			token: resetPasswordToken.token,
			email: user.customData.email,
			username: user.user,
			firstName:user.customData.firstName
		};

		await this.update(user.user, { "customData.resetPasswordToken": resetPasswordToken });

		return resetPasswordUserInfo;
	}

	return {};
};

async function _fillInModelDetails(accountName, setting, permissions) {
	if (permissions.indexOf(C.PERM_MANAGE_MODEL_PERMISSION) !== -1) {
		permissions = C.MODEL_PERM_LIST.slice(0);
	}

	const model = {
		federate: setting.federate,
		permissions: permissions,
		model: setting._id,
		type: setting.type,
		units: setting.properties.unit,
		name: setting.name,
		status: setting.status,
		errorReason: setting.errorReason,
		subModels: setting.federate && setting.toObject().subModels || undefined,
		timestamp: setting.timestamp || null,
		code: setting.properties ? setting.properties.code || undefined : undefined

	};

	const nRev = await History.revisionCount(accountName, setting._id);

	model.nRevisions = nRev;

	return model;
}
// list all models in an account
async function _getModels(teamspace, ids, permissions) {

	const models = [];
	const fedModels = [];

	let query = {};

	if (ids) {
		query = { _id: { "$in": ids } };
	}

	const settings = await ModelSetting.find({ account: teamspace }, query);

	await Promise.all(settings.map(async setting => {
		const model = await _fillInModelDetails(teamspace, setting, permissions);

		if (!(model.permissions.length === 1 && model.permissions[0] === null)) {
			setting.federate ? fedModels.push(model) : models.push(model);
		}
	}));

	return { models, fedModels };
}

// find projects and put models into project
async function _addProjects(account, username) {
	const projects = await getProjectsAndModelsForUser(account.account, account.permissions, account.models, account.fedModels, username);
	account.projects = account.projects.concat(projects);
}

async function _findModelDetails(dbUserCache, username, model) {
	let user;

	if (dbUserCache[model.account]) {
		user = dbUserCache[model.account];
	} else {
		user = await User.findByUserName(model.account);
		dbUserCache[model.account] = user;
	}

	let setting  = await ModelSetting.findById({ account: model.account }, model.model);

	let permissions = [];

	if (!setting) {
		setting = { _id: model.model };
	} else {
		const template = setting.findPermissionByUser(username);

		if (template) {
			permissions = PermissionTemplates.findById(user, template.permission).permissions;
		}
	}

	return { setting, permissions };
}

async function _calSpace(user) {
	const quota = UserBilling.getSubscriptionLimits(user.customData.billing);
	const sizeInBytes = await User.getTeamspaceSpaceUsed(user.user);

	if (quota.spaceLimit > 0) {
		quota.spaceUsed = sizeInBytes / (1024 * 1024); // In MiB
	} else if (quota) {
		quota.spaceUsed = 0;
	}
	return quota;
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
			const permission = AccountPermissions.findByUser(user, userName);
			if (permission) {
				// Check for admin Privileges first
				const isTeamspaceAdmin = permission.permissions.indexOf(C.PERM_TEAMSPACE_ADMIN) !== -1;
				const canViewProjects = permission.permissions.indexOf(C.PERM_VIEW_PROJECTS) !== -1;
				const account = {
					account: user.user,
					firstName: user.customData.firstName,
					lastName: user.customData.lastName,
					hasAvatar: !!user.customData.avatar,
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
				return listProjects(user.user, query, projection).then(projects => {
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
									account.hasAvatar = !!user.customData.avatar;
									accounts.push(account);
								}
							}

							myProj = account.projects.find(p => p.name === _proj.name);

							if (!myProj) {
								myProj = _proj;
								account.projects.push(myProj);
								myProj.permissions = myProj.permissions[0].permissions;
							} else {
								myProj.permissions = _.uniq(myProj.permissions.concat(_proj.permissions[0].permissions));
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
											account.hasAvatar = !!user.customData.avatar;
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
											return findOneProject(account.account, { models: _model.model }).then(projectObj => {
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

User.getSubscriptionLimits = function(user) {
	return UserBilling.getSubscriptionLimits(user.customData.billing);
};

User.listAccounts = async function(user) {
	return _createAccounts(user.roles, user.user);
};

User.removeTeamMember = async function (teamspace, userToRemove, cascadeRemove) {
	if (teamspace.user === userToRemove) {
		// The user should not be able to remove itself from the teamspace
		return Promise.reject(responseCodes.SUBSCRIPTION_CANNOT_REMOVE_SELF);
	}

	const teamspacePerm = AccountPermissions.findByUser(teamspace, userToRemove);

	// check if they have any permissions assigned
	const [projectNames, models] = await Promise.all([
		getProjectNamesAccessibleToUser(teamspace.user, userToRemove),
		ModelSetting.find({ account: teamspace.user }, { "permissions.user": userToRemove })
	]);

	if (!cascadeRemove && (models.length || projectNames.length || teamspacePerm)) {
		throw({
			resCode: responseCodes.USER_IN_COLLABORATOR_LIST,
			info: {
				models: models.map(m => {
					return { model: m.name };
				}),
				projects: projectNames,
				teamspace: teamspacePerm
			}
		});
	} else {

		const promises = [];

		if (teamspacePerm) {
			promises.push(AccountPermissions.remove(teamspace, userToRemove));
		}

		promises.push(models.map(model =>
			model.changePermissions(model.permissions.filter(p => p.user !== userToRemove))));

		promises.push(removeUserFromProjects(teamspace.user, userToRemove));

		promises.push(removeUserFromAnyJob(teamspace.user, userToRemove));

		await Promise.all(promises);
	}

	return await Role.revokeTeamSpaceRoleFromUser(userToRemove, teamspace.user);
};

User.addTeamMember = async function(teamspace, userToAdd, job, permissions) {
	const teamspaceUser = await User.findByUserName(teamspace);

	await hasReachedLicenceLimit(teamspaceUser);

	const userEntry = await User.findByUserName(userToAdd);

	if (!userEntry) {
		throw (responseCodes.USER_NOT_FOUND);
	}

	if (!job) {
		throw (responseCodes.USER_NOT_ASSIGNED_JOB);
	}

	if (isMemberOfTeamspace(userEntry, teamspace)) {
		throw (responseCodes.USER_ALREADY_ASSIGNED);
	}

	await Role.grantTeamSpaceRoleToUser(userToAdd, teamspace);

	const promises = [];
	promises.push(addUserToJob(teamspace, job, userToAdd));

	if (permissions && permissions.length) {
		promises.push(AccountPermissions.updateOrCreate(teamspaceUser, userToAdd, permissions));
	}

	await Promise.all(promises);

	return  { job, permissions, ... this.getBasicDetails(userEntry) };
};

User.getBasicDetails = function(userObj) {
	const {user, customData} = userObj;
	return {
		user,
		firstName: customData.firstName,
		lastName: customData.lastName,
		company: _.get(customData, "billing.billingInfo.company", null)
	};
};

User.getQuotaInfo = async function (teamspace) {
	const teamspaceFound = await this.findByUserName(teamspace);
	if (!teamspaceFound) {
		throw (responseCodes.USER_NOT_FOUND);
	}

	return _calSpace(teamspaceFound);
};

User.hasSufficientQuota = async (teamspace, size) => {
	const quota = await User.getQuotaInfo(teamspace);
	const spaceLeft = ((quota.spaceLimit === null || quota.spaceLimit === undefined ? Infinity : quota.spaceLimit) - quota.spaceUsed) * 1024 * 1024;
	return spaceLeft >= size;
};

User.hasReachedLicenceLimitCheck = async function(teamspace) {
	const teamspaceUser = await this.findByUserName(teamspace);
	await hasReachedLicenceLimit(teamspaceUser);
};

User.getMembers = async function (teamspace) {
	const promises = [];

	const getTeamspaceMembers = this.findUsersInTeamspace(teamspace, {
		user: 1,
		customData: 1
	});
	const getJobInfo = usersWithJob(teamspace);

	const getTeamspacePermissions = User.findByUserName(teamspace).then(user => user.customData.permissions);

	promises.push(
		getTeamspaceMembers,
		getTeamspacePermissions,
		getJobInfo
	);

	const [members = [], teamspacePermissions, memToJob = {}] = await Promise.all(promises);

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
};

User.getAllUsersInTeamspace = async function (teamspace) {
	const users =  await this.findUsersInTeamspace(teamspace, {user: 1});
	return users.map(({user}) => user);
};

User.findUsersInTeamspace =  async function (teamspace, fields) {
	const query = { "roles.db": teamspace, "roles.role" : C.DEFAULT_MEMBER_ROLE };
	return await DB.find("admin", COLL_NAME, query, fields);
};

User.teamspaceMemberCheck = async function (user, teamspace) {
	const userEntry = await User.findByUserName(user, {roles: 1});

	if (!userEntry) {
		throw (responseCodes.USER_NOT_FOUND);
	}

	if (!isMemberOfTeamspace(userEntry, teamspace)) {
		throw (responseCodes.USER_NOT_ASSIGNED_WITH_LICENSE);
	}
};

User.getTeamMemberInfo = async function(teamspace, user) {
	const userEntry = await User.findByUserName(user);
	if(!userEntry || !isMemberOfTeamspace(userEntry,teamspace)) {
		throw responseCodes.USER_NOT_FOUND;
	} else {
		const job = await findJobByUser(teamspace, user);
		const result = {
			user,
			firstName: userEntry.customData.firstName,
			lastName: userEntry.customData.lastName,
			company: _.get(userEntry.customData, "billing.billingInfo.company", null)
		};

		if(job) {
			result.job = {_id: job._id, color: job.color};
		}
		return result;
	}
};

User.isHereEnabled = async function (username) {
	const user = await this.findByUserName(username,  { _id: 0, "customData.hereEnabled": 1 });
	return user.customData.hereEnabled;
};

// Find functions
User.findOne = async function (query, projection) {
	return await DB.findOne("admin", COLL_NAME, query, projection);
};

User.findByUserName = async function (username, projection) {
	return await this.findOne({ user: username }, projection);
};

User.findByEmail = async function (email) {
	return await this.findOne({ "customData.email":  new RegExp("^" + utils.sanitizeString(email) + "$", "i") });
};

User.findByUsernameOrEmail = async function (userNameOrEmail) {
	return await this.findOne({
		$or: [
			{ user: userNameOrEmail },
			{ "customData.email": userNameOrEmail }
		]
	});
};

User.findByAPIKey = async function (key) {
	if (!key) {
		return null;
	}

	return await this.findOne({"customData.apiKey" : key});
};

User.findByPaypalPaymentToken = async function (token) {
	return await this.findOne({ "customData.billing.paypalPaymentToken": token });
};

User.findUserByBillingId = async function (billingAgreementId) {
	return await this.findOne({ "customData.billing.billingAgreementId": billingAgreementId });
};

/*
Payment (paypal) stuff

schema.methods.executeBillingAgreement = function () {
	return this.customData.billing.executeBillingAgreement(this.user).then(() => {
		return this.update(this.user,  { "customData.billing": this.customData.billing });
	});
};

schema.methods.updateSubscriptions = function (plans, billingUser, billingAddress) {

	let billingAgreement;

	plans = plans || [];

	return this.customData.billing.updateSubscriptions(plans, this.user, billingUser, billingAddress)
		.then(_billingAgreement => {

			billingAgreement = _billingAgreement;
			return this.update(this.user, { "customData.billing": this.customData.billing });
		}).then(() => {
			return Promise.resolve(billingAgreement || {});
		});
};

User.activateSubscription = function (billingAgreementId, paymentInfo, raw) {

	let dbUser;
	return this.findUserByBillingId(billingAgreementId).then(user => {
		dbUser = user;

		if (!dbUser) {
			return Promise.reject({ message: `No users found with billingAgreementId ${billingAgreementId}` });
		}

		return dbUser.customData.billing.activateSubscriptions(dbUser.user, paymentInfo, raw);

	}).then(() => {
		return this.update(dbUser.user,  { "customData.billing": dbUser.customData.billing  });
	}).then(() => {
		return Promise.resolve({ subscriptions: dbUser.customData.billing.subscriptions, account: dbUser, payment: paymentInfo });
	});

};
*/

module.exports = User;
