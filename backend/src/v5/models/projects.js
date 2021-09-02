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

const Projects = {};
const { PROJECT_ADMIN } = require('../utils/permissions/permissions.constants');
const db = require('../handler/db');
const { templates } = require('../utils/responseCodes');

const findProject = (ts, query, projection, sort) => db.find(ts, 'projects', query, projection, sort);
const findOneProject = (ts, query, projection) => db.findOne(ts, 'projects', query, projection);

const getProjectById = async (ts, project, projection) => {
	const res = await findOneProject(ts, { _id: project }, projection);
	if (!res) {
		throw templates.projectNotFound;
	}

	return res;
};

Projects.getProjectList = async (ts, projection = { _id: 1, name: 1 }) => findProject(ts, {}, projection);

Projects.getProjectAdmins = async (ts, project) => {
	const { permissions } = await getProjectById(ts, project, { permissions: 1 });
	return permissions.flatMap((entry) => (entry.permissions.includes(PROJECT_ADMIN) ? [entry.user] : []));
};

module.exports = Projects;
