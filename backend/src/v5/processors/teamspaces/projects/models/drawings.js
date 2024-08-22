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

const { addDrawingThumbnailRef, deleteModelRevisions, getLatestRevision,
	getRevisionByIdOrTag, getRevisionCount, getRevisions, updateRevisionStatus } = require('../../../../models/revisions');
const { addModel, getModelList } = require('./commons/modelList');
const { appendFavourites, deleteFavourites } = require('./commons/favourites');
const { deleteModel, getDrawingById, getDrawings, updateModelSettings } = require('../../../../models/modelSettings');
const { getFile, getFileAsStream, removeFilesWithMeta, storeFile } = require('../../../../services/filesManager');
const { getProjectById, removeModelFromProject } = require('../../../../models/projectSettings');
const { DRAWINGS_HISTORY_COL } = require('../../../../models/revisions.constants');
const { createThumbnail } = require('../../../../utils/helper/images');
const { generateUUID } = require('../../../../utils/helper/uuids');
const { modelTypes } = require('../../../../models/modelSettings.constants');
const { processDrawingUpload } = require('../../../../services/modelProcessing');
const { templates } = require('../../../../utils/responseCodes');

const Drawings = { };

Drawings.getDrawingList = async (teamspace, project, user) => {
	const { models } = await getProjectById(teamspace, project, { permissions: 1, models: 1 });
	const modelSettings = await getDrawings(teamspace, models, { _id: 1, name: 1, permissions: 1 });

	return getModelList(teamspace, project, user, modelSettings);
};

Drawings.getDrawingStats = async (teamspace, project, drawing) => {
	let latestRev;
	const [settings, revCount] = await Promise.all([
		getDrawingById(teamspace, drawing, { number: 1, status: 1, type: 1, desc: 1, calibration: 1 }),
		getRevisionCount(teamspace, drawing, modelTypes.DRAWING),
	]);

	try {
		latestRev = await getLatestRevision(teamspace, drawing, modelTypes.DRAWING,
			{ statusCode: 1, revCode: 1, timestamp: 1 });
	} catch {
		// do nothing. A drawing can have 0 revision.
	}

	return {
		number: settings.number,
		status: settings.status,
		type: settings.type,
		desc: settings.desc,
		revisions: {
			total: revCount,
			lastUpdated: latestRev?.timestamp,
			latestRevision: latestRev ? `${latestRev.statusCode}-${latestRev.revCode}` : undefined,
		},
		calibration: settings.calibration ?? 'uncalibrated',
	};
};

Drawings.addDrawing = (teamspace, project, data) => addModel(teamspace, project,
	{ ...data, modelType: modelTypes.DRAWING });

Drawings.updateSettings = updateModelSettings;

Drawings.deleteDrawing = async (teamspace, project, drawing) => {
	await removeFilesWithMeta(teamspace, DRAWINGS_HISTORY_COL, { model: drawing });

	await Promise.all([
		deleteModelRevisions(teamspace, project, drawing, modelTypes.DRAWING),
		deleteModel(teamspace, project, drawing),
		removeModelFromProject(teamspace, project, drawing),
	]);
};

Drawings.getRevisions = (teamspace, drawing, showVoid) => getRevisions(teamspace, drawing,
	modelTypes.DRAWING, showVoid,
	{ _id: 1, author: 1, format: 1, timestamp: 1, statusCode: 1, revCode: 1, void: 1, desc: 1 });

Drawings.newRevision = processDrawingUpload;

Drawings.updateRevisionStatus = (teamspace, project, drawing, revision, status) => updateRevisionStatus(
	teamspace, project, drawing, modelTypes.DRAWING, revision, status);

Drawings.downloadRevisionFiles = async (teamspace, drawing, revision) => {
	const rev = await getRevisionByIdOrTag(teamspace, drawing, modelTypes.DRAWING, revision, { rFile: 1 });

	if (!rev.rFile?.length) {
		throw templates.fileNotFound;
	}

	return getFileAsStream(teamspace, DRAWINGS_HISTORY_COL, rev.rFile[0]);
};

Drawings.getLatestThumbnail = async (teamspace, project, drawing) => {
	try {
		const rev = await getLatestRevision(teamspace, drawing, modelTypes.DRAWING, { thumbnail: 1 });

		if (!rev?.thumbnail) {
			throw templates.fileNotFound;
		}

		return getFileAsStream(teamspace, DRAWINGS_HISTORY_COL, rev.thumbnail);
	} catch (err) {
		throw templates.fileNotFound;
	}
};

Drawings.getImageByRevision = async (teamspace, project, drawing, revision) => {
	try {
		const rev = await getRevisionByIdOrTag(teamspace, drawing, modelTypes.DRAWING, revision, { image: 1 });

		if (!rev?.image) {
			throw templates.fileNotFound;
		}

		return getFileAsStream(teamspace, DRAWINGS_HISTORY_COL, rev.image);
	} catch (err) {
		throw templates.fileNotFound;
	}
};

Drawings.createDrawingThumbnail = async (teamspace, project, model, revision) => {
	const { image } = await getRevisionByIdOrTag(teamspace, model, modelTypes.DRAWING, revision, { image: 1 });

	const buffer = await getFile(teamspace, DRAWINGS_HISTORY_COL, image);
	const thumbnail = await createThumbnail(buffer);

	if (thumbnail) {
		const thumbnailID = generateUUID();
		await storeFile(teamspace, DRAWINGS_HISTORY_COL, thumbnailID, thumbnail,
			{ teamspace, project, model, rev_id: revision });

		await addDrawingThumbnailRef(teamspace, project, model, revision, thumbnailID);
	}
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
