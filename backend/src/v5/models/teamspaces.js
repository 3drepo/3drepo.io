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

const { ADD_ONS, SUBSCRIPTION_TYPES } = require('./teamspaces.constants');
const { TEAMSPACE_ADMIN } = require('../utils/permissions/permissions.constants');
const { TEAM_MEMBER } = require('./roles.constants');
const { USERS_DB_NAME } = require('./users.constants');
const db = require('../handler/db');
const { riskCategories } = require('./risks.constants');
const { templates } = require('../utils/responseCodes');
const { topicTypes } = require('./issues.constants');

const SUBSCRIPTION_PATH = 'customData.billing.subscriptions';

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
	[`customData.${ADD_ONS.VR}`]: 1,
	[`customData.${ADD_ONS.HERE}`]: 1,
	[`customData.${ADD_ONS.SRC}`]: 1,
	'customData.addOns': 1,

};

Teamspace.getAddOns = async (teamspace) => {
	const { customData } = await getTeamspace(teamspace, possibleAddOns);
	const addOns = customData?.addOns || {};
	return { ...addOns,
		[ADD_ONS.VR]: customData[ADD_ONS.VR],
		[ADD_ONS.HERE]: customData[ADD_ONS.HERE],
		[ADD_ONS.SRC]: customData[ADD_ONS.SRC],
	};
};

Teamspace.updateAddOns = async (teamspace, addOns) => {
	const set = {};
	const unset = {};

	const addOnTypes = new Set(Object.values(ADD_ONS));
	Object.keys(addOns).forEach((key) => {
		if (addOnTypes.has(key)) {
			const path = (key === ADD_ONS.POWERBI) ? `customData.addOns.${key}` : `customData.${key}`;
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

Teamspace.getTeamspaceAdmins = async (ts) => {
	const data = await getTeamspace(ts, { 'customData.permissions': 1 });
	return data.customData.permissions.flatMap(
		({ user, permissions }) => (permissions.includes(TEAMSPACE_ADMIN) ? user : []),
	);
};

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
	const settings = { _id: teamspace, topicTypes, riskCategories };
	await db.insertOne(teamspace, 'teamspace', settings);
};

Teamspace.getAllUsersInTeamspace = async (teamspace) => {
	const query = { 'roles.db': teamspace, 'roles.role': TEAM_MEMBER };
	const users = await findMany(query, { user: 1 });

	return users.map(({ user }) => user);
};

Teamspace.removeUserFromAdminPrivilege = async (teamspace, user) => {
	await teamspaceUpdate({ user: teamspace }, { $pull: { 'customData.permissions': { user } } });
};

module.exports = Teamspace;
