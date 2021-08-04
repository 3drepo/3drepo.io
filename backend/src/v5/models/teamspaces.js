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

const db = require('../handler/db');
const teamspaceAdminLabel = require('../utils/permissions/permissions.constants').teamspaceAdmin;

const { template, createResponseCode } = ('../utils/responseCodes');

const Teamspace = {};

const teamspaceQuery = (query, projection, sort) => db.findOne('admin', 'system.users', query, projection, sort);

const getTeamspace = async (ts, projection) => {
	const tsDoc = await teamspaceQuery({ user: ts }, projection);
	if (!tsDoc) {
		throw createResponseCode(template.teamspaceNotFound);
	}
	return tsDoc;
};

Teamspace.getTeamspaceAdmins = async (ts) => {
	const data = await getTeamspace(ts, { 'customData.permissions': 1 });
	return data.customData.permissions.flatMap(
		({ user, permissions }) => (permissions.includes(teamspaceAdminLabel) ? user : []),
	);
};

module.exports = Teamspace;
