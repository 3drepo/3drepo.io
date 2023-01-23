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

const getTeamspaceSetting = async (ts, projection) => {
	const tsDoc = await teamspaceSettingQuery(ts, { _id: ts }, projection);
	if (!tsDoc) {
		throw templates.teamspaceNotFound;
	}
	return tsDoc;
};

TeamspaceSetting.getSubscriptions = async (ts) => {
	const { subscriptions } = await getTeamspaceSetting(ts, { subscriptions: 1 });
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

const possibleAddOns = {
	[`addOns.${ADD_ONS.VR}`]: 1,
	[`addOns.${ADD_ONS.HERE}`]: 1,
	[`addOns.${ADD_ONS.SRC}`]: 1,
	[`addOns.${ADD_ONS.POWERBI}`]: 1,
};

TeamspaceSetting.getAddOns = async (teamspace) => {
	const { addOns } = await getTeamspaceSetting(teamspace, possibleAddOns);
	return addOns || {};
};

TeamspaceSetting.updateAddOns = async (teamspace, addOns) => {
	const set = {};
	const unset = {};

	const addOnTypes = new Set(Object.values(ADD_ONS));
	Object.keys(addOns).forEach((key) => {
		if (addOnTypes.has(key)) {
			const path = `addOns.${key}`;
			if (addOns[key]) {
				set[path] = true;
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
	const tsSettings = await getTeamspaceSetting(teamspace, { permissions: 1 });
	return tsSettings.permissions.flatMap(
		({ user, permissions }) => (permissions.includes(TEAMSPACE_ADMIN) ? user : []),
	);
};

TeamspaceSetting.hasAccessToTeamspace = async (teamspace, username) => {
	const query = { user: username, 'roles.db': teamspace };
	const userDoc = await teamspaceQuery(query, { _id: 1 });
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

TeamspaceSetting.getTeamspaceActiveLicenses = (teamspace) => {
	const currentDate = new Date();
	const query = { $or: SUBSCRIPTION_TYPES.flatMap((type) => [{ [`subscriptions.${type}`]: { $exists: true }, [`subscriptions.${type}.expiryDate`]: null },
		{ [`subscriptions.${type}.expiryDate`]: { $gt: currentDate } },
	]) };
	return teamspaceSettingQuery(teamspace, query, { _id: 1, subscriptions: 1 });
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
