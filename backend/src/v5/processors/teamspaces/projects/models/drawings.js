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

const { addModel, deleteModel, getModelList } = require('./commons/modelList');
const { appendFavourites, deleteFavourites } = require('./commons/favourites');
const { getDrawingById, getDrawings, updateModelSettings } = require('../../../../models/modelSettings');
const { getProjectById } = require('../../../../models/projectSettings');
const { modelTypes } = require('../../../../models/modelSettings.constants');
const { logger } = require('../../../../utils/logger');
const { queueModelUpload } = require('../../../../services/modelProcessing');
const { templates } = require('../../../../utils/responseCodes');

const Drawings = { };

Drawings.getDrawingList = async (teamspace, project, user) => {
	const { models } = await getProjectById(teamspace, project, { permissions: 1, models: 1 });
	const modelSettings = await getDrawings(teamspace, models, { _id: 1, name: 1, permissions: 1 });

	return getModelList(teamspace, project, user, modelSettings);
};

Drawings.addDrawing = (teamspace, project, data) => addModel(teamspace, project,
	{ ...data, modelType: modelTypes.DRAWING });

Drawings.updateSettings = updateModelSettings;

Drawings.deleteDrawing = deleteModel;

Drawings.getRevisions = async (teamspace, drawing, showVoid) => {
	const revisions = await getRevisions(teamspace,
		drawing, showVoid, { _id: 1, author: 1, timestamp: 1, tag: 1, void: 1, desc: 1, rFile: 1 });

	return revisions.map(({ rFile, ...r }) => {
		const format = getRevisionFormat(rFile);
		return { ...r, ...deleteIfUndefined({ format }) };
	});
};

Drawings.newRevision = async (teamspace, drawing, data, file) => {
	const { properties: { unit: units } = {} } = await getDrawingById(teamspace, drawing, { 'properties.unit': 1 });
	await queueModelUpload(teamspace, drawing, { ...data, units }, file).finally(() => fs.rm(file.path).catch((e) => {
		logger.logError(`Failed to delete uploaded file: ${e.message}`);
	}));
};

Drawings.updateRevisionStatus = updateRevisionStatus;

Drawings.downloadRevisionFiles = async (teamspace, drawing, revision) => {
	const rev = await getRevisionByIdOrTag(teamspace, drawing, revision, { rFile: 1 });

	if (!rev.rFile?.length) {
		throw templates.fileNotFound;
	}

	// We currently only support single file fetches
	const fileName = rev.rFile[0];
	const fileNameFormatted = fileName.substr(36).replace(/_([^_]*)$/, '.$1');
	const file = await getFileAsStream(teamspace, `${drawing}.history.ref`, fileName);
	return { ...file, filename: fileNameFormatted };
};

Drawings.appendFavourites = async (username, teamspace, project, favouritesToAdd) => {
	const accessibleDrawings = await Drawings.getDrawingList(teamspace, project, username);
	return appendFavourites(username, teamspace, accessibleDrawings, favouritesToAdd);
};

Drawings.deleteFavourites = async (username, teamspace, project, favouritesToRemove) => {
	const accessibleDrawings = await Drawings.getDrawingList(teamspace, project, username);
	return deleteFavourites(username, teamspace, accessibleDrawings, favouritesToRemove);
};

Drawings.getSettings = (teamspace, drawing) => getDrawingById(teamspace,
	drawing, { name: 1, number: 1, type: 1, desc: 1 });

module.exports = Drawings;
