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

const { src, srcV4 } = require('./path');

const { createApp } = require(`${srcV4}/services/api`);
const DbHandler = require(`${src}/handler/db`);
const { createTeamSpaceRole } = require(`${srcV4}/models/role`);
const { createProject } = require(`${srcV4}/models/project`);

const db = {};
const ServiceHelper = { db };

db.createUser = async (user, pwd, customData = {}, roles = []) => {
	const adminDB = await DbHandler.getAuthDB();
	return adminDB.addUser(user, pwd, { customData, roles });
};

db.createTeamspaceRole = (ts) => createTeamSpaceRole(ts);

db.createProject = (ts, projectName, username, userPermissions) =>
	createProject(ts, projectName, username, userPermissions);

ServiceHelper.app = () => createApp().listen(8080);

ServiceHelper.closeApp = async (server) => {
	await DbHandler.disconnect();
	if (server) await server.close();
};

module.exports = ServiceHelper;
