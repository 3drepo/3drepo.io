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
const { templates } = require('../utils/responseCodes');

const Teamspace = {};

const teamspaceQuery = (query, projection, sort) => db.findOne('admin', 'system.users', query, projection, sort);

const getTeamspace = async (ts, projection) => {
	const tsDoc = await teamspaceQuery({ user: ts }, projection);
	if (!tsDoc) {
		throw templates.teamspaceNotFound;
	}
	return tsDoc;
};

Teamspace.getSubscriptions = async (ts) => {
	const tsDoc = await getTeamspace(ts, { 'customData.billing.subscriptions': 1 });
	return (tsDoc.customData?.billing || {})?.subscriptions || {};
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

module.exports = Teamspace;
