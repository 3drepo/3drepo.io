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

const Crypto = require('crypto');

const { src, srcV4 } = require('./path');

const { createApp } = require(`${srcV4}/services/api`);
const DbHandler = require(`${src}/handler/db`);
const { createTeamSpaceRole } = require(`${srcV4}/models/role`);
const { generateUUID, uuidToString, stringToUUID } = require(`${srcV4}/utils`);
const { PROJECT_ADMIN, TEAMSPACE_ADMIN } = require(`${src}/utils/permissions/permissions.constants`);

const db = {};
const ServiceHelper = { db };

// userCredentials should be the same format as the return value of generateUserCredentials
db.createUser = async (userCredentials, tsList = [], customData = {}) => {
	const { user, password, apiKey } = userCredentials;
	const roles = tsList.map((ts) => ({ db: ts, role: 'team_member' }));
	const adminDB = await DbHandler.getAuthDB();
	return adminDB.addUser(user, password, { customData: { ...customData, apiKey }, roles });
};

db.createTeamspaceRole = (ts) => createTeamSpaceRole(ts);

db.createTeamspace = (teamspace, admins = []) => {
	const permissions = admins.map((adminUser) => ({ user: adminUser, permissions: TEAMSPACE_ADMIN }));
	return Promise.all([
		ServiceHelper.db.createUser({ user: teamspace, password: teamspace }, [], { permissions }),
		ServiceHelper.db.createTeamspaceRole(teamspace),
	]);
};

db.createProject = (teamspace, _id, name, models = [], admins = []) => {
	const project = {
		_id: stringToUUID(_id),
		name,
		models,
		permissions: admins.map((user) => ({ user, permissions: [PROJECT_ADMIN] })),
	};

	return DbHandler.insertOne(teamspace, 'projects', project);
};

db.createModel = (teamspace, _id, name, props) => {
	const settings = {
		_id,
		name,
		...props,
	};
	return DbHandler.insertOne(teamspace, 'settings', settings);
};

ServiceHelper.generateUUIDString = () => uuidToString(generateUUID());
ServiceHelper.generateRandomString = () => Crypto.randomBytes(15).toString('hex');

ServiceHelper.generateUserCredentials = () => ({
	user: ServiceHelper.generateRandomString(),
	password: ServiceHelper.generateRandomString(),
	apiKey: ServiceHelper.generateRandomString(),
});

ServiceHelper.app = () => createApp().listen(8080);

ServiceHelper.closeApp = async (server) => {
	await DbHandler.disconnect();
	if (server) await server.close();
};

module.exports = ServiceHelper;
