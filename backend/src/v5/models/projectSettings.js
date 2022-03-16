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
const { generateUUID } = require('../utils/helper/uuids');
const { getCommonElements } = require('../utils/helper/arrays');
const { templates } = require('../utils/responseCodes');

const COL_NAME = 'projects';
const findProjects = (ts, query, projection, sort) =>
	db.find(ts, COL_NAME, query, projection, sort);
const findOneProject = (ts, query, projection) =>
	db.findOne(ts, COL_NAME, query, projection);
const updateOneProject = (ts, query, data) =>
	db.updateOne(ts, COL_NAME, query, data);

Projects.addModelToProject = (ts, project, model) =>
	updateOneProject(
		ts,
		{ _id: project },
		{ $push: { models: model } },
	);

Projects.removeModelFromProject = (ts, project, model) =>
	updateOneProject(
		ts,
		{ _id: project },
		{ $pull: { models: model } },
	);

const getProjectByQuery = async (ts, query, projection) => {
	const res = await findOneProject(ts, query, projection);

	if (!res) {
		throw templates.projectNotFound;
	}

	return res;
};

Projects.getProjectByName = (ts, name, projection) =>
	getProjectByQuery(ts, { name }, projection);

Projects.getProjectById = (ts, id, projection) =>
	getProjectByQuery(ts, { _id: id }, projection);

Projects.modelsExistInProject = async (teamspace, project, models) => {
	if (!models.length) return false;
	const { models: projModels } = await getProjectByQuery(teamspace, { _id: project }, { models: 1 });
	return getCommonElements(models, projModels).length === models.length;
};

Projects.getProjectList = (ts, projection = { _id: 1, name: 1 }) =>
	findProjects(ts, {}, projection);

Projects.getProjectAdmins = async (ts, project) => {
	const { permissions } = await getProjectByQuery(ts, { _id: project }, { permissions: 1 });
	return permissions.flatMap((entry) =>
		(entry.permissions.includes(PROJECT_ADMIN) ? [entry.user] : []));
};

Projects.createProject = async (teamspace, name) => {
	const addedProject = { _id: generateUUID(), name, models: [], permissions: [] };
	await db.insertOne(teamspace, COL_NAME, addedProject);
	return addedProject._id;
};

Projects.deleteProject = async (teamspace, projectId) => {
	const { deletedCount } = await db.deleteOne(teamspace, COL_NAME, { _id: projectId });

	if (deletedCount === 0) {
		throw templates.projectNotFound;
	}
};

Projects.updateProject = async (teamspace, projectId, updatedProject) => {
	const { matchedCount } = await updateOneProject(teamspace, { _id: projectId }, { $set: updatedProject });
	if (matchedCount === 0) {
		throw templates.projectNotFound;
	}
};

module.exports = Projects;
