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

const { TEAMSPACE_ADMIN } = require('../utils/permissions/permissions.constants');
const db = require('../handler/db');
const { riskCategories } = require('./risks.constants');
const { templates } = require('../utils/responseCodes');
const { topicTypes } = require('./issues.constants');

const SUBSCRIPTION_PATH = 'customData.billing.subscriptions';

const Teamspace = {};

const teamspaceUpdate = (query, actions) => db.updateOne('admin', 'system.users', query, actions);
const teamspaceQuery = (query, projection, sort) => db.findOne('admin', 'system.users', query, projection, sort);
const findMany = (query, projection, sort) => db.find('admin', 'system.users', query, projection, sort);

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

Teamspace.removeAddOns = (teamspace) => {
	const possibleAddOns = {
		'customData.vrEnabled': 1,
		'customData.srcEnabled': 1,
		'customData.hereEnabled': 1,
		'customData.addOns': 1,

	};
	return teamspaceUpdate({ user: teamspace }, { $unset: possibleAddOns });
};

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

Teamspace.createTeamspaceSettings = async (teamspace) => {
	const settings = { _id: teamspace, topicTypes, riskCategories };
	await db.insertOne(teamspace, 'teamspace', settings);
};

module.exports = Teamspace;
