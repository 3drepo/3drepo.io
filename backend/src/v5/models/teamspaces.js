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

const SUBSCRIPTION_PATH = 'customData.billing.subscriptions';

const TEAMSPACE_SETTINGS_COL = 'teamspace';

const Teamspace = {};

const teamspaceUpdate = (query, actions) => db.updateOne(USERS_DB_NAME, 'system.users', query, actions);
const teamspaceQuery = (query, projection, sort) => db.findOne(USERS_DB_NAME, 'system.users', query, projection, sort);
const findMany = (query, projection, sort) => db.find(USERS_DB_NAME, 'system.users', query, projection, sort);

const getTeamspace = async (ts, projection) => {
	const tsDoc = await teamspaceQuery({ user: ts }, projection);
	if (!tsDoc) {
		throw templates.teamspaceNotFound;
	}
	return tsDoc;
};

Teamspace.getSubscriptions = async (ts) => {
	const tsDoc = await getTeamspace(ts, { [SUBSCRIPTION_PATH]: 1 });
	return tsDoc.customData?.billing?.subscriptions || {};
};

Teamspace.editSubscriptions = async (ts, type, data) => {
	const subsObjPath = `${SUBSCRIPTION_PATH}.${type}`;
	const action = {};
	const fields = ['collaborators', 'data', 'expiryDate'];
	fields.forEach((field) => {
		if (data[field] !== undefined) {
			action[`${subsObjPath}.${field}`] = data[field];
		}
	});

	if (Object.keys(action).length) {
		await teamspaceUpdate({ user: ts }, { $set: action });
	}
};

Teamspace.removeSubscription = (ts, type) => {
	const field = type ? `${SUBSCRIPTION_PATH}.${type}` : `${SUBSCRIPTION_PATH}`;
	return teamspaceUpdate({ user: ts }, { $unset: { [field]: 1 } });
};

const possibleAddOns = {
	[`customData.addOns.${ADD_ONS.VR}`]: 1,
	[`customData.addOns.${ADD_ONS.HERE}`]: 1,
	[`customData.addOns.${ADD_ONS.SRC}`]: 1,
	[`customData.addOns.${ADD_ONS.POWERBI}`]: 1,
};

Teamspace.getAddOns = async (teamspace) => {
	const { customData } = await getTeamspace(teamspace, possibleAddOns);
	const addOns = customData?.addOns || {};
	return addOns;
};

Teamspace.updateAddOns = async (teamspace, addOns) => {
	const set = {};
	const unset = {};

	const addOnTypes = new Set(Object.values(ADD_ONS));
	Object.keys(addOns).forEach((key) => {
		if (addOnTypes.has(key)) {
			const path = `customData.addOns.${key}`;
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

	if (Object.keys(action).length) await teamspaceUpdate({ user: teamspace }, action);
};

Teamspace.removeAddOns = (teamspace) => teamspaceUpdate({ user: teamspace }, { $unset: possibleAddOns });

Teamspace.getTeamspaceAdmins = async (teamspace) => {
	console.log('============== V TWO ====================');
	const tsSettings = await db.findOne(
		teamspace, TEAMSPACE_SETTINGS_COL, { _id: teamspace }, { permissions: 1 },
	);
	console.log('============== TS SETTINGS ==============');
	console.log(tsSettings);

	if (!tsSettings) {
		throw templates.teamspaceNotFound;
	}

	console.log(tsSettings.permissions.flatMap(
		({ user, permissions }) => (permissions.includes(TEAMSPACE_ADMIN) ? user : []),
	));
	console.log('============== END =====================');
	return tsSettings.permissions.flatMap(
		({ user, permissions }) => (permissions.includes(TEAMSPACE_ADMIN) ? user : []),
	);
};

/*
Teamspace.getTeamspaceAdmins = async (ts) => {
	const data = await getTeamspace(ts, { 'customData.permissions': 1 });
	console.log("============== DATA =====================");
	console.log(data);
	console.log("============== FLAT MAP =====================");
	console.log(data.customData.permissions.flatMap(
		({ user, permissions }) => (permissions.includes(TEAMSPACE_ADMIN) ? user : []),
	));
	console.log("============== END =====================");
	return Teamspace.getTeamspaceAdmins2(ts);
	return data.customData.permissions.flatMap(
		({ user, permissions }) => (permissions.includes(TEAMSPACE_ADMIN) ? user : []),
	);
};
	*/

Teamspace.hasAccessToTeamspace = async (teamspace, username) => {
	const query = { user: username, 'roles.db': teamspace };
	const userDoc = await teamspaceQuery(query, { _id: 1 });
	return !!userDoc;
};

Teamspace.getMembersInfo = async (teamspace) => {
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

Teamspace.getAllTeamspacesWithActiveLicenses = (projection) => {
	const currentDate = new Date();
	const query = { $or: SUBSCRIPTION_TYPES.flatMap((type) => [{ [`${SUBSCRIPTION_PATH}.${type}`]: { $exists: true }, [`${SUBSCRIPTION_PATH}.${type}.expiryDate`]: null },
		{ [`${SUBSCRIPTION_PATH}.${type}.expiryDate`]: { $gt: currentDate } },
	]) };
	return findMany(query, projection);
};

Teamspace.createTeamspaceSettings = async (teamspace) => {
	/*
	const settings = { _id: teamspace,
		topicTypes: DEFAULT_TOPIC_TYPES,
		riskCategories: DEFAULT_RISK_CATEGORIES,
		permissions: [{ user: teamspace, permissions: [TEAMSPACE_ADMIN] }] };
		*/
	const settings = { _id: teamspace,
		topicTypes: DEFAULT_TOPIC_TYPES,
		riskCategories: DEFAULT_RISK_CATEGORIES,
		permissions: [] };
	// const settings = { _id: teamspace, topicTypes: DEFAULT_TOPIC_TYPES, riskCategories: DEFAULT_RISK_CATEGORIES };
	await db.insertOne(teamspace, TEAMSPACE_SETTINGS_COL, settings);
};

Teamspace.grantAdminToUser = async (teamspace, username) => {
	await db.updateOne(teamspace, TEAMSPACE_SETTINGS_COL, { _id: teamspace },
		{ $push: { permissions: { user: username, permissions: [TEAMSPACE_ADMIN] } } });
};

Teamspace.getAllUsersInTeamspace = async (teamspace) => {
	const query = { 'roles.db': teamspace, 'roles.role': TEAM_MEMBER };
	const users = await findMany(query, { user: 1 });

	return users.map(({ user }) => user);
};

Teamspace.removeUserFromAdminPrivilege = async (teamspace, user) => {
	await db.updateOne(teamspace, TEAMSPACE_SETTINGS_COL, { _id: teamspace }, { $pull: { permissions: { user } } });
	// await teamspaceUpdate({ user: teamspace }, { $pull: { 'customData.permissions': { user } } });
};

Teamspace.getRiskCategories = async (teamspace) => {
	const { riskCategories } = await db.findOne(
		teamspace, TEAMSPACE_SETTINGS_COL, { _id: teamspace }, { riskCategories: 1 },
	);
	return riskCategories;
};

module.exports = Teamspace;
