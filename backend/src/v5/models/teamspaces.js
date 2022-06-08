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
const { TEAM_MEMBER } = require('./roles.constants');
const db = require('../handler/db');
const { riskCategories } = require('./risks.constants');
const { templates } = require('../utils/responseCodes');
const { topicTypes } = require('./issues.constants');

const Teamspace = {};

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
	const tsDoc = await getTeamspace(ts, { 'customData.billing.subscriptions': 1 });
	return tsDoc.customData?.billing?.subscriptions || {};
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

Teamspace.getAllUsersInTeamspace = async (teamspace) => {
	const query = { 'roles.db': teamspace, 'roles.role': TEAM_MEMBER };
	const users = await findMany(query, { _id: 0, user: 1 });

	return users.map(({ user }) => user);
};

Teamspace.updateExpiry = async (teamspace) => {
	db.updateOne('admin', 'system.users', {user: teamspace}, {$set: 		
		{
		
		'customData.billing.subscriptions':[{
			discretionary: {
				collaborators: 'unlimited',
				expiryDate: Date.now() - 1000,
				data: 10240
			}
		}] }
	});
};

module.exports = Teamspace;
