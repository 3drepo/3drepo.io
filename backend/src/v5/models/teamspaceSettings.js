/**
 *  Copyright (C) 2021 3D Repo Ltd
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

const {
	ADD_ONS,
	DEFAULT_RISK_CATEGORIES,
	DEFAULT_TOPIC_TYPES,
	SECURITY,
	SECURITY_SETTINGS,
	SUBSCRIPTION_TYPES,
} = require('./teamspaces.constants');
const { TEAMSPACE_ADMIN } = require('../utils/permissions/permissions.constants');
const { TEAM_MEMBER } = require('./roles.constants');
const { USERS_DB_NAME } = require('./users.constants');
const db = require('../handler/db');
const { templates } = require('../utils/responseCodes');

const TEAMSPACE_SETTINGS_COL = 'teamspace';

const TeamspaceSetting = {};

const teamspaceQuery = (query, projection, sort) => db.findOne(USERS_DB_NAME, 'system.users', query, projection, sort);
const findMany = (query, projection, sort) => db.find(USERS_DB_NAME, 'system.users', query, projection, sort);

const teamspaceSettingUpdate = (ts, query, actions) => db.updateOne(ts, TEAMSPACE_SETTINGS_COL, query, actions);
const teamspaceSettingQuery = (ts, query, projection, sort) => db.findOne(ts,
	TEAMSPACE_SETTINGS_COL, query, projection, sort);

TeamspaceSetting.getTeamspaceSetting = async (ts, projection) => {
	const tsDoc = await teamspaceSettingQuery(ts, { _id: ts }, projection);
	if (!tsDoc) {
		throw templates.teamspaceNotFound;
	}
	return tsDoc;
};

TeamspaceSetting.updateSecurityRestrictions = async (ts, ssoRestricted, whiteListDomains) => {
	const query = { _id: ts };

	const action = {};

	if (ssoRestricted !== undefined) {
		if (ssoRestricted) {
			action.$set = { [`${SECURITY}.${SECURITY_SETTINGS.SSO_RESTRICTED}`]: true };
		} else {
			action.$unset = { [`${SECURITY}.${SECURITY_SETTINGS.SSO_RESTRICTED}`]: 1 };
		}
	}

	if (whiteListDomains !== undefined) {
		if (whiteListDomains) {
			action.$set = action.$set ?? {};
			action.$set[`${SECURITY}.${SECURITY_SETTINGS.DOMAIN_WHITELIST}`] = whiteListDomains;
		} else {
			action.$unset = action.$unset ?? {};
			action.$unset[`${SECURITY}.${SECURITY_SETTINGS.DOMAIN_WHITELIST}`] = 1;
		}
	}

	if (Object.keys(action).length) {
		await teamspaceSettingUpdate(ts, query, action);
	}
};

TeamspaceSetting.getSecurityRestrictions = async (ts) => {
	const data = await TeamspaceSetting.getTeamspaceSetting(ts, { [SECURITY]: 1 });
	return data[SECURITY] ?? {};
};

TeamspaceSetting.getSubscriptions = async (ts) => {
	const { subscriptions } = await TeamspaceSetting.getTeamspaceSetting(ts, { subscriptions: 1 });
	return subscriptions || {};
};

TeamspaceSetting.editSubscriptions = async (ts, type, data) => {
	const subsObjPath = `subscriptions.${type}`;
	const action = {};
	const fields = ['collaborators', 'data', 'expiryDate'];
	fields.forEach((field) => {
		if (data[field] !== undefined) {
			action[`${subsObjPath}.${field}`] = data[field];
		}
	});

	if (Object.keys(action).length) {
		await teamspaceSettingUpdate(ts, { _id: ts }, { $set: action });
	}
};

TeamspaceSetting.removeSubscription = (ts, type) => {
	const field = type ? `subscriptions.${type}` : 'subscriptions';
	return teamspaceSettingUpdate(ts, { _id: ts }, { $unset: { [field]: 1 } });
};

const possibleAddOns = {};

Object.values(ADD_ONS).forEach((addOnVal) => {
	possibleAddOns[`addOns.${addOnVal}`] = 1;
});

TeamspaceSetting.getAddOns = async (teamspace) => {
	const { addOns } = await TeamspaceSetting.getTeamspaceSetting(teamspace, possibleAddOns);
	return addOns || {};
};

TeamspaceSetting.isAddOnModuleEnabled = async (teamspace, moduleName) => {
	const addOns = await TeamspaceSetting.getAddOns(teamspace, moduleName);
	return !!addOns[ADD_ONS.MODULES]?.includes(moduleName);
};

TeamspaceSetting.updateAddOns = async (teamspace, addOns) => {
	const set = {};
	const unset = {};

	const addOnTypes = new Set(Object.values(ADD_ONS));
	Object.keys(addOns).forEach((key) => {
		if (addOnTypes.has(key)) {
			const path = `addOns.${key}`;
			if (addOns[key]) {
				set[path] = addOns[key];
			} else {
				unset[path] = 1;
			}
		}
	});
	const action = {};

	if (Object.keys(set).length) {
		action.$set = set;
	}

	if (Object.keys(unset).length) {
		action.$unset = unset;
	}

	if (Object.keys(action).length) await teamspaceSettingUpdate(teamspace, { _id: teamspace }, action);
};

TeamspaceSetting.removeAddOns = (teamspace) => teamspaceSettingUpdate(teamspace,
	{ _id: teamspace }, { $unset: possibleAddOns });

TeamspaceSetting.getTeamspaceAdmins = async (teamspace) => {
	const tsSettings = await TeamspaceSetting.getTeamspaceSetting(teamspace, { permissions: 1 });
	return tsSettings.permissions.flatMap(
		({ user, permissions }) => (permissions.includes(TEAMSPACE_ADMIN) ? user : []),
	);
};

TeamspaceSetting.hasAccessToTeamspace = async (teamspace, username) => {
	const query = { user: username, 'roles.db': teamspace };
	const userDoc = await teamspaceQuery(query, { _id: 1, customData: { sso: 1, email: 1 } });
	if (!userDoc) return false;

	const restrictions = await TeamspaceSetting.getSecurityRestrictions(teamspace);

	if (restrictions[SECURITY_SETTINGS.SSO_RESTRICTED] && !userDoc.customData.sso) {
		throw templates.ssoRestricted;
	}

	if (restrictions[SECURITY_SETTINGS.DOMAIN_WHITELIST]) {
		const userDomain = userDoc.customData.email.split('@')[1].toLowerCase();
		if (!restrictions[SECURITY_SETTINGS.DOMAIN_WHITELIST].includes(userDomain)) {
			throw templates.domainRestricted;
		}
	}

	return !!userDoc;
};

TeamspaceSetting.getMembersInfo = async (teamspace) => {
	const query = { 'roles.db': teamspace };
	const projection = { user: 1, 'customData.firstName': 1, 'customData.lastName': 1, 'customData.billing.billingInfo.company': 1 };
	const data = await findMany(query, projection);

	return data.map(({ user, customData }) => {
		const { firstName, lastName, billing } = customData;
		const res = { user, firstName, lastName };
		if (billing?.billingInfo?.company) {
			res.company = billing.billingInfo.company;
		}
		return res;
	});
};

TeamspaceSetting.getTeamspaceActiveLicenses = async (teamspace) => {
	// get all licenses, filter them to includes ones with a valid type and an expiry date in the future
	const licenses = await TeamspaceSetting.getSubscriptions(teamspace);
	const currentDate = new Date();
	return Object.fromEntries(
		Object.entries(licenses).filter(
			([licenseType, license]) => SUBSCRIPTION_TYPES.includes(licenseType)
				&& (license.expiryDate === undefined || license.expiryDate > currentDate),
		),
	);
};

TeamspaceSetting.getTeamspaceExpiredLicenses = async (teamspace) => {
	// get all licenses, filter them to includes ones with a valid type and an expiry date in the past
	const licenses = await TeamspaceSetting.getSubscriptions(teamspace);
	const currentDate = new Date();
	return Object.fromEntries(
		Object.entries(licenses).filter(
			([licenseType, license]) => SUBSCRIPTION_TYPES.includes(licenseType) && license.expiryDate < currentDate,
		),
	);
};

TeamspaceSetting.countLicenses = async (teamspace) => {
	const licenses = await TeamspaceSetting.getSubscriptions(teamspace);
	return Object.keys(licenses).filter((licenceType) => SUBSCRIPTION_TYPES.includes(licenceType)).length;
};

TeamspaceSetting.createTeamspaceSettings = async (teamspace) => {
	const settings = { _id: teamspace,
		topicTypes: DEFAULT_TOPIC_TYPES,
		riskCategories: DEFAULT_RISK_CATEGORIES,
		permissions: [] };
	await db.insertOne(teamspace, TEAMSPACE_SETTINGS_COL, settings);
};

const grantPermissionToUser = async (teamspace, username, permission) => {
	await teamspaceSettingUpdate(teamspace, { _id: teamspace },
		{ $push: { permissions: { user: username, permissions: [permission] } } });
};

TeamspaceSetting.grantAdminToUser = (teamspace, username) => grantPermissionToUser(teamspace,
	username, TEAMSPACE_ADMIN);

TeamspaceSetting.getAllUsersInTeamspace = async (teamspace) => {
	const query = { 'roles.db': teamspace, 'roles.role': TEAM_MEMBER };
	const users = await findMany(query, { user: 1 });

	return users.map(({ user }) => user);
};

TeamspaceSetting.removeUserFromAdminPrivilege = async (teamspace, user) => {
	await teamspaceSettingUpdate(teamspace, { _id: teamspace }, { $pull: { permissions: { user } } });
};

TeamspaceSetting.getRiskCategories = async (teamspace) => {
	const { riskCategories } = await teamspaceSettingQuery(teamspace, { _id: teamspace }, { riskCategories: 1 });
	return riskCategories;
};

module.exports = TeamspaceSetting;
