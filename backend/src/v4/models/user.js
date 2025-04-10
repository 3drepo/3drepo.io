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

"use strict";

const responseCodes = require("../response_codes.js");
const _ = require("lodash");
const db = require("../handler/db");
const utils = require("../utils");
const { findJobByUser, usersWithJob, addUserToJob } = require("./job");

const TeamspaceSettings = require("./teamspaceSetting");

const { findModelSettingById, findModelSettings, findPermissionByUser } = require("./modelSetting");
const C = require("../constants");
const UserBilling = require("./userBilling");
const AccountPermissions = require("./accountPermissions");
const {
	findOneProject,
	getProjectsAndModelsForUser,
	getProjectsForAccountsList
} = require("./project");
const PermissionTemplates = require("./permissionTemplates");
const { fileExists } = require("./fileRef");
const {v5Path} = require("../../interop");
const { types: { strings } } = require(`${v5Path}/utils/helper/yup.js`);
const { sanitiseRegex } = require(`${v5Path}/utils/helper/strings.js`);
const { events } = require(`${v5Path}/services/eventsManager/eventsManager.constants`);
const { publish } = require(`${v5Path}/services/eventsManager/eventsManager.js`);
const { getAddOns } = require(`${v5Path}/models/teamspaceSettings`);
const { getSpaceUsed } = require(`${v5Path}/utils/quota.js`);
const UserProcessorV5 = require(`${v5Path}/processors/users`);
const { removeTeamspaceMember, addTeamspaceMember, getTeamspaceListByUser} = require(`${v5Path}/processors/teamspaces`);
const {USERS_DB_NAME} = require(`${v5Path}/models/users.constants`);
const {getTeamspaceSetting} = require(`${v5Path}/models/teamspaceSettings`);
const {getAllUsersInAccount} = require(`${v5Path}/services/sso/frontegg/components/accounts`);

const COLL_NAME = "system.users";

const isMemberOfTeamspace = function (user, teamspace) {
	return user.roles.filter(role => role.db === teamspace && role.role === C.DEFAULT_MEMBER_ROLE).length > 0;
};

const hasReachedLicenceLimit = async function (teamspace) {
	const Invitations = require("./invitations");
	const [userArr, invitations] = await Promise.all([
		User.getAllUsersInTeamspace(teamspace),
		Invitations.getInvitationsByTeamspace(teamspace)
	]);

	const limits = await UserBilling.getSubscriptionLimits(teamspace);

	const seatedLicences = userArr.length + invitations.length;
	const reachedLimit =  (limits.collaboratorLimit !== "unlimited" &&  seatedLicences >= limits.collaboratorLimit);

	if (reachedLimit) {
		throw (responseCodes.LICENCE_LIMIT_REACHED);
	}
};

// Find functions
const findOne = async function (query, projection) {
	return await db.findOne("admin", COLL_NAME, query, projection);
};

const User = {};

User.getTeamspaceSpaceUsed = (dbName) => getSpaceUsed(dbName);

User.getProfileByUsername = async function (username) {
	if (!username) {
		return null;
	}

	const user = await User.findByUserName(username, {user: 1,
		"customData.firstName" : 1,
		"customData.lastName" : 1,
		"customData.email" : 1,
		"customData.apiKey" : 1
	});

	const customData =  user.customData;
	const hasAvatar = await fileExists("admin", "avatars.ref" , username);

	return 	{
		username: user.user,
		firstName: customData.firstName,
		lastName: customData.lastName,
		email: customData.email,
		hasAvatar,
		apiKey: customData.apiKey
	};
};

User.getAddOnsForTeamspace = (user) => {
	return getAddOns(user);
};

User.isHereEnabled = async function (username) {
	const { hereEnabled } = await User.getAddOnsForTeamspace(username);
	return !!hereEnabled;
};

User.getStarredMetadataTags = async function (username) {
	const userProfile = await User.findByUserName(username, {user: 1,
		"customData.StarredMetadataTags" : 1
	});

	return _.get(userProfile, "customData.StarredMetadataTags") || [];
};

User.appendStarredMetadataTag = async function (username, tag) {
	await db.updateOne("admin", COLL_NAME, {user: username}, {$addToSet: { "customData.StarredMetadataTags" : tag } });
	return {};
};

User.setStarredMetadataTags = async function (username, tags) {
	tags = _.uniq(tags);
	await db.updateOne("admin", COLL_NAME, {user: username}, {$set: { "customData.StarredMetadataTags" : tags}});
	return {};
};

User.deleteStarredMetadataTag = async function (username, tag) {
	await db.updateOne("admin", COLL_NAME, {user: username}, {$pull: { "customData.StarredMetadataTags" : tag } });
	return {};
};

User.getStarredModels = async function (username) {
	const userProfile = await db.findOne("admin", COLL_NAME, {user: username}, {user: 1,
		"customData.starredModels" : 1
	});

	return _.get(userProfile, "customData.starredModels") || {};
};

User.appendStarredModels = async function (username, ts, modelID) {
	const userProfile = await db.findOne("admin", COLL_NAME, {user: username}, {user: 1,
		"customData.starredModels" : 1
	});

	const starredModels = 	userProfile.customData.starredModels || {};
	if(!starredModels[ts]) {
		starredModels[ts] = [];
	}

	if(starredModels[ts].indexOf(modelID) === -1) {
		starredModels[ts].push(modelID);
		await db.updateOne("admin", COLL_NAME, {user: username}, {$set: { "customData.starredModels" : starredModels } });
	}
	return {};
};

User.setStarredModels = async function (username, models) {
	await db.updateOne("admin", COLL_NAME, {user: username}, {$set: { "customData.starredModels" : models}});
	return {};
};

User.deleteStarredModel = async function (username, ts, modelID) {
	const userProfile = await db.findOne("admin", COLL_NAME, {user: username}, {user: 1,
		"customData.starredModels" : 1
	});

	if(userProfile.customData.starredModels && userProfile.customData.starredModels[ts]) {
		if(userProfile.customData.starredModels[ts].length === 1 &&
			userProfile.customData.starredModels[ts][0] === modelID) {
			const action = {$unset: {}};
			action.$unset[`customData.starredModels.${ts}`] = "";
			await db.updateOne("admin", COLL_NAME, {user: username}, action);

		} else {
			const action = {$pull: {}};
			action.$pull[`customData.starredModels.${ts}`] = modelID;
			await db.updateOne("admin", COLL_NAME, {user: username}, action);
		}
	}
	return {};
};

User.generateApiKey = (username) => UserProcessorV5.generateApiKey(username);

User.deleteApiKey = (username) => UserProcessorV5.deleteApiKey(username);

User.findUsersWithoutMembership = async function (teamspace, searchString) {
	const regex = new RegExp(`^${searchString}$`, "i");
	const notMembers = await db.find("admin", COLL_NAME, {
		$or: [
			{"customData.email": regex},
			{"user": regex}
		],
		"customData.inactive": { "$exists": false },
		"roles.db": {$ne: teamspace }
	});

	return notMembers.map(({user, customData }) => {
		return {
			user,
			firstName: customData.firstName,
			lastName: customData.lastName,
			company: _.get(customData, "billing.billingInfo.company", null)
		};
	});

};

// case insenstive
User.checkUserNameAvailableAndValid = async function (username) {
	if (!User.usernameRegExp.test(username) ||
		-1 !== C.REPO_BLACKLIST_USERNAME.indexOf(username.toLowerCase())
	) {
		throw (responseCodes.INVALID_USERNAME);
	}

	const count = await db.count("admin", COLL_NAME, { user: new RegExp(`^${username}$`, "i")});

	if(count > 0) {
		throw (responseCodes.USER_EXISTS);
	}
};

User.checkEmailAvailableAndValid = async function (email, exceptUser) {
	if (!strings.email.isValidSync(email)) {
		throw(responseCodes.EMAIL_INVALID);
	}

	const query =  exceptUser ? { "customData.email": email, "user": { "$ne": exceptUser } }
		: { "customData.email": email };

	const count = await db.count("admin", COLL_NAME, query);

	if(count > 0) {
		throw (responseCodes.EMAIL_EXISTS);
	}
};

User.usernameRegExp = /^[a-zA-Z][\w]{1,63}$/;

User.getAvatarStream = UserProcessorV5.getAvatarStream;

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

	await db.updateOne("admin", COLL_NAME, {user: username}, {$set: updateData});
};

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

	let setting  = await findModelSettingById(model.account, model.model);

	let permissions = [];

	if (!setting) {
		setting = { _id: model.model };
	} else {
		const template = await findPermissionByUser(model.account, model.model, username);

		if (template) {
			permissions = PermissionTemplates.findById(template.permission).permissions;
		}
	}

	return { setting, permissions };
}

async function _calSpace(teamspace) {
	const [quota, sizeInBytes] = await Promise.all([
		UserBilling.getSubscriptionLimits(teamspace),
		User.getTeamspaceSpaceUsed(teamspace)
	]);

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

async function _createAccounts(roles, userName) {
	const accounts = [];

	const teamspaces = await getTeamspaceListByUser(userName);

	await Promise.all(teamspaces.map(async ({name: teamspace}) => {
		const tsPromises = [];
		let settings;
		try {
			settings = await TeamspaceSettings.getTeamspaceSettings(teamspace);
		} catch (err) {
			return;
		}
		const permission = AccountPermissions.findByUser(settings, userName);

		if (permission) {
			// Check for admin Privileges first
			const isTeamspaceAdmin = permission.permissions.indexOf(C.PERM_TEAMSPACE_ADMIN) !== -1;
			const canViewProjects = permission.permissions.indexOf(C.PERM_VIEW_PROJECTS) !== -1;
			const hasAvatar = await fileExists("admin", "avatars.ref" , teamspace);
			const account = {
				account: teamspace,
				hasAvatar,
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

				const {_getModels} = require("./helper/model");
				tsPromises.push(
					// list all models under this account as they have full access
					_getModels(account.account, null, inheritedModelPermissions).then(data => {
						account.models = data.models;
						account.fedModels = data.fedModels;
					}).then(() => _addProjects(account, userName))
				);
			}
		}

		await Promise.all(tsPromises);

		// check project scope permissions
		const query = { "permissions": { "$elemMatch": { user: userName } } };
		const projection = { "permissions": { "$elemMatch": { user: userName } }, "models": 1, "name": 1 };
		let account = null;

		account = await getProjectsForAccountsList(teamspace, accounts, userName);

		// model permissions
		const modelPromises = [];
		const dbUserCache = {};
		const hasAvatar = await fileExists("admin", "avatars.ref" , userName);
		const models = await findModelSettings(teamspace, query, projection);

		models.forEach(model => {
			if (model.permissions.length > 0) {
				if (!account) {
					account = accounts.find(_account => _account.account === teamspace);
					if (!account) {
						const {_makeAccountObject} = require("./helper/model");
						account = _makeAccountObject(teamspace);
						account.hasAvatar = hasAvatar;
						accounts.push(account);
					}
				}
				const existingModel = _findModel(model._id, account);
				modelPromises.push(
					_findModelDetails(dbUserCache, userName, {
						account: teamspace, model: model._id
					}).then(data => {
						const {_fillInModelDetails} = require("./helper/model");
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
										_id: utils.uuidToString(projectObj._id),
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

		await Promise.all(modelPromises);

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
				fed.subModels = fed.subModels.map(subModel => {
					const subModelId = subModel?._id ;
					const foundModel = allModels.find(m => m.model === subModelId);
					return { database: _account.account, model: subModelId, name: foundModel?.name};
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
	}));

	return accounts;
}

User.getSubscriptionLimits = function(user) {
	return UserBilling.getSubscriptionLimits(user.user);
};

User.listAccounts = async function(user) {
	return _createAccounts(user.roles, user.user);
};

User.removeTeamMember = async function (teamspace, userToRemove, cascadeRemove, executor) {
	await removeTeamspaceMember(teamspace, userToRemove);
	publish(events.USER_REMOVED, { teamspace, executor, user: userToRemove});

};

User.addTeamMember = async function(teamspace, userToAdd, job, permissions, executor) {
	await hasReachedLicenceLimit(teamspace);

	let userEntry = null;
	if (strings.email.isValidSync(userToAdd)) { // if the submited username is the email
		userEntry = await User.findByEmail(userToAdd);
	} else {
		userEntry = await User.findByUserName(userToAdd);
	}

	if (!userEntry) {
		throw (responseCodes.USER_NOT_FOUND);
	}

	if (!job) {
		throw (responseCodes.USER_NOT_ASSIGNED_JOB);
	}

	if (isMemberOfTeamspace(userEntry, teamspace)) {
		throw (responseCodes.USER_ALREADY_ASSIGNED);
	}

	await addTeamspaceMember(teamspace, userEntry.user, executor);
	publish(events.USER_ADDED, { teamspace, executor, user: userEntry.user});

	const promises = [];
	promises.push(addUserToJob(teamspace, job, userEntry.user));

	const teamspaceSettings = await TeamspaceSettings.getTeamspaceSettings(teamspace);

	if (permissions && permissions.length) {
		promises.push(AccountPermissions.updateOrCreate(teamspaceSettings, userEntry.user, permissions, executor));
	}

	await Promise.all(promises);

	return  { job, permissions, ... User.getBasicDetails(userEntry) };
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

	return _calSpace(teamspace);
};

User.hasSufficientQuota = async (teamspace, size) => {
	const quota = await User.getQuotaInfo(teamspace);
	const spaceLeft = ((quota.spaceLimit === null || quota.spaceLimit === undefined ? Infinity : quota.spaceLimit) - quota.spaceUsed) * 1024 * 1024;
	return spaceLeft >= size;
};

User.hasReachedLicenceLimitCheck = hasReachedLicenceLimit;

User.getMembers = async function (teamspace) {
	const promises = [];

	const { refId: tenantId } = await getTeamspaceSetting(teamspace, { refId: 1 });
	const frontEggUsers = await getAllUsersInAccount(tenantId);

	const getTeamspaceMembers =		Promise.all(frontEggUsers.map(user => User.findUsersInTeamspaceById(user.id)));
	const getJobInfo = usersWithJob(teamspace);
	const getTeamspacePermissions = TeamspaceSettings.getTeamspaceSettings(teamspace).then(({permissions}) => permissions);

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
	const users =  await User.findUsersInTeamspace(teamspace, {user: 1});
	return users.map(({user}) => user);
};

User.findUsersInTeamspace =  async function (teamspace, fields) {
	const query = { "roles.db": teamspace, "roles.role" : C.DEFAULT_MEMBER_ROLE };
	return await db.find("admin", COLL_NAME, query, fields);
};

User.findUsersInTeamspaceById =  async function (userId) {
	const query = { "customData.userId": userId };
	const projection = { user: 1, "customData.firstName": 1, "customData.lastName": 1, "customData.billing.billingInfo.company": 1 };
	return await db.findOne(USERS_DB_NAME, "system.users", query, projection);
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

User.findByUserName = async function (username, projection) {
	return await findOne({ user: username }, projection);
};

User.findByEmail = async function (email) {
	const sanitisedEmail = sanitiseRegex(email);
	return await findOne({ "customData.email":  new RegExp(`^${sanitisedEmail}$`, "i") });
};

User.findByUsernameOrEmail = async function (userNameOrEmail) {
	return await findOne({
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
	return await findOne({"customData.apiKey" : key});
};

User.findUserByBillingId = async function (billingAgreementId) {
	return await findOne({ "customData.billing.billingAgreementId": billingAgreementId });
};

User.updateAvatar = async function(username, avatarBuffer) {
	await UserProcessorV5.uploadAvatar(username, avatarBuffer);
};

User.updatePermissions = TeamspaceSettings.updatePermissions;

User.updateSubscriptions = TeamspaceSettings.updateSubscriptions;

module.exports = User;
