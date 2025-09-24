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

const { UUIDToString, generateUUID } = require('../../../../../utils/helper/uuids');
const { addDrawingThumbnailRef, deleteModelRevisions, getLatestRevision,
	getRevisionByIdOrTag, getRevisionCount, getRevisions, updateRevisionStatus } = require('../../../../../models/revisions');
const { addModel, getModelList } = require('../commons/modelList');
const { appendFavourites, deleteFavourites } = require('../commons/favourites');
const { deleteModel, getDrawingById, getDrawings, updateModelSettings } = require('../../../../../models/modelSettings');
const { getCalibrationStatus, getCalibrationStatusForAllRevs } = require('./calibrations');
const { getFileAsStream, removeFilesWithMeta, storeFile } = require('../../../../../services/filesManager');
const { getProjectById, removeModelFromProject } = require('../../../../../models/projectSettings');
const { DRAWINGS_HISTORY_COL } = require('../../../../../models/revisions.constants');
const { calibrationStatuses } = require('../../../../../models/calibrations.constants');
const { createThumbnail } = require('../../../../../utils/helper/images');
const { deleteDrawingCalibrations } = require('../../../../../models/calibrations');
const { deleteIfUndefined } = require('../../../../../utils/helper/objects');
const { modelTypes } = require('../../../../../models/modelSettings.constants');
const { processDrawingUpload } = require('../../../../../services/modelProcessing');
const { templates } = require('../../../../../utils/responseCodes');

const Drawings = { };

Drawings.getDrawingList = async (teamspace, project, user) => {
	const { models } = await getProjectById(teamspace, project, { permissions: 1, models: 1 });
	const modelSettings = await getDrawings(teamspace, models, { _id: 1, name: 1, permissions: 1 });

	return getModelList(teamspace, project, user, modelSettings);
};

Drawings.getDrawingStats = async (teamspace, project, drawing) => {
	const getLatestRevAndCalibration = async () => {
		try {
			const latestRev = await
			getLatestRevision(teamspace, drawing, modelTypes.DRAWING,
				{ _id: 1, statusCode: 1, revCode: 1, timestamp: 1 });
			const calibration = await getCalibrationStatus(teamspace, project, drawing, latestRev._id);
			return { latestRev, calibration };
		} catch {
			// do nothing. A drawing can have 0 revision.
			return {};
		}
	};

	const getDrawingStatus = async () => {
		try {
			const { status } = await getLatestRevision(teamspace, drawing, modelTypes.DRAWING,
				{ status: 1 },
				{ includeFailed: true, includeIncomplete: true });
			return status;
		} catch {
			// do nothing. A drawing can have 0 revision.
			return undefined;
		}
	};

	const [settings, revCount, { latestRev, calibration }, status] = await Promise.all([
		getDrawingById(teamspace, drawing, { number: 1, type: 1, desc: 1 }),
		getRevisionCount(teamspace, drawing, modelTypes.DRAWING),
		getLatestRevAndCalibration(),
		getDrawingStatus(),
	]);

	return deleteIfUndefined({
		number: settings.number,
		status,
		type: settings.type,
		desc: settings.desc,
		revisions: {
			total: revCount,
			...latestRev
				? { lastUpdated: latestRev.timestamp, latestRevision: `${latestRev.statusCode}-${latestRev.revCode}` }
				: {},
		},
		calibration,
	});
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
		deleteDrawingCalibrations(teamspace, project, drawing),
	]);
};

Drawings.getRevisions = async (teamspace, project, drawing, showVoid) => {
	const [revisions, calibrations] = await Promise.all([
		getRevisions(teamspace, project, drawing, modelTypes.DRAWING, showVoid,
			{ _id: 1, author: 1, format: 1, timestamp: 1, statusCode: 1, revCode: 1, void: 1, desc: 1 }),
		getCalibrationStatusForAllRevs(teamspace, project, drawing),
	]);

	for (let i = 0; i < revisions.length; ++i) {
		revisions[i].calibration = calibrations[UUIDToString(revisions[i]._id)] ?? calibrationStatuses.UNCALIBRATED;
	}

	return revisions;
};

Drawings.newRevision = processDrawingUpload;

Drawings.updateRevisionStatus = (teamspace, project, drawing, revision, status) => updateRevisionStatus(
	teamspace, project, drawing, modelTypes.DRAWING, revision, status);

Drawings.downloadRevisionFiles = async (teamspace, drawing, revision) => {
	const rev = await getRevisionByIdOrTag(teamspace, drawing, modelTypes.DRAWING, revision, { rFile: 1 },
		{ includeVoid: true });

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
	const { readStream, mimeType } = await Drawings.getImageByRevision(teamspace, project, model, revision);

	const buffer = await Buffer.concat(await Array.fromAsync(readStream));
	const thumbnail = await createThumbnail(buffer, mimeType);

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
	drawing, { name: 1, number: 1, type: 1, desc: 1, calibration: 1 });

module.exports = Drawings;
