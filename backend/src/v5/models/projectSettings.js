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
const { COL_NAME } = require('./projectSettings.constants');
const { PROJECT_ADMIN } = require('../utils/permissions/permissions.constants');
const db = require('../handler/db');
const { errCodes } = require('../handler/db.constants');
const { generateUUID } = require('../utils/helper/uuids');
const { getCommonElements } = require('../utils/helper/arrays');
const { createResponseCode, templates } = require('../utils/responseCodes');

const findProjects = (ts, query, projection, sort) => db.find(ts, COL_NAME, query, projection, sort);
const findOneProject = (ts, query, projection) => db.findOne(ts, COL_NAME, query, projection);
const updateOneProject = (ts, query, data) => db.updateOne(ts, COL_NAME, query, data);

Projects.addModelToProject = (ts, project, model) => updateOneProject(
	ts,
	{ _id: project },
	{ $push: { models: model } },
);

Projects.removeModelFromProject = (ts, project, model) => updateOneProject(
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

Projects.findProjectByModelId = async (teamspace, modelId, projection) => {
	const data = await findOneProject(teamspace, { models: modelId }, projection);
	if (!data) {
		throw templates.projectNotFound;
	}
	return data;
};

// eslint-disable-next-line security/detect-non-literal-regexp
Projects.getProjectByName = (ts, name, projection) => getProjectByQuery(ts, { name: new RegExp(`^${name}$`, 'i') }, projection);

Projects.getProjectById = (ts, id, projection) => getProjectByQuery(ts, { _id: id }, projection);

Projects.modelsExistInProject = async (teamspace, project, models) => {
	if (!models.length) return false;
	const { models: projModels } = await getProjectByQuery(teamspace, { _id: project }, { models: 1 });
	return getCommonElements(models, projModels).length === models.length;
};

Projects.getProjectList = (ts, projection = { _id: 1, name: 1 }) => findProjects(ts, {}, projection);

Projects.getProjectAdmins = async (ts, project) => {
	const { permissions } = await getProjectByQuery(ts, { _id: project }, { permissions: 1 });
	return permissions.flatMap((entry) => (entry.permissions.includes(PROJECT_ADMIN) ? [entry.user] : []));
};

Projects.createProject = async (teamspace, name) => {
	try {
		const addedProject = { _id: generateUUID(), createdAt: new Date(), name, models: [], permissions: [] };
		await db.insertOne(teamspace, COL_NAME, addedProject);
		return addedProject._id;
	} catch (error) {
		if (error.code === errCodes.DUPLICATE_KEY) throw createResponseCode(templates.invalidArguments, 'Project name is taken');
		throw error;
	}
};

Projects.deleteProject = (teamspace, projectId) => db.deleteOne(teamspace, COL_NAME, { _id: projectId });

Projects.updateProject = (teamspace, projectId, updatedProject) => updateOneProject(
	teamspace, { _id: projectId }, { $set: updatedProject },
);

Projects.removeUserFromAllProjects = async (teamspace, user) => {
	await db.updateMany(
		teamspace,
		COL_NAME,
		{ 'permissions.user': user },
		{ $pull: { permissions: { user } } },
	);
};

module.exports = Projects;
