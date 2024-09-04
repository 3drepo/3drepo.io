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

const { src } = require('../../../../../../helper/path');
const { determineTestGroup, generateRandomString, generateRandomObject, generateUUID,
	generateUUIDString, generateRandomNumber,
	generateRevisionEntry } = require('../../../../../../helper/services');

const { deleteIfUndefined } = require(`${src}/utils/helper/objects`);
const { calibrationStatuses } = require(`${src}/models/calibrations.constants`);

jest.mock('../../../../../../../../src/v5/models/calibrations');
const Calibrations = require(`${src}/models/calibrations`);
jest.mock('../../../../../../../../src/v5/models/projectSettings');
const ProjectSettings = require(`${src}/models/projectSettings`);
jest.mock('../../../../../../../../src/v5/models/modelSettings');
const ModelSettings = require(`${src}/models/modelSettings`);
jest.mock('../../../../../../../../src/v5/processors/teamspaces/projects/models/commons/modelList');
const ModelList = require(`${src}/processors/teamspaces/projects/models/commons/modelList`);
jest.mock('../../../../../../../../src/v5/processors/teamspaces/projects/models/commons/favourites');
const Favourites = require(`${src}/processors/teamspaces/projects/models/commons/favourites`);
jest.mock('../../../../../../../../src/v5/services/filesManager');
const FilesManager = require(`${src}/services/filesManager`);
jest.mock('../../../../../../../../src/v5/models/revisions');
const Revisions = require(`${src}/models/revisions`);
jest.mock('../../../../../../../../src/v5/processors/teamspaces/projects/models/drawings/calibrations');
const CalibrationsProc = require(`${src}/processors/teamspaces/projects/models/drawings/calibrations`);
jest.mock('../../../../../../../../src/v5/services/eventsManager/eventsManager');

const { DRAWINGS_HISTORY_COL } = require(`${src}/models/revisions.constants`);

jest.mock('../../../../../../../../src/v5/utils/helper/images');
const ImageHelper = require(`${src}/utils/helper/images`);

const Drawings = require(`${src}/processors/teamspaces/projects/models/drawings`);
const { modelTypes } = require(`${src}/models/modelSettings.constants`);
const { templates } = require(`${src}/utils/responseCodes`);

const testAddDrawing = () => {
	describe('Add drawing', () => {
		test('should return whatever addModel returns', async () => {
			const teamspace = generateRandomString();
			const project = generateRandomString();
			const data = generateRandomString();
			const newDrawingId = generateRandomString();
			ModelList.addModel.mockImplementationOnce(() => newDrawingId);

			const res = await Drawings.addDrawing(teamspace, project, data);
			expect(res).toEqual(newDrawingId);
			expect(ModelList.addModel).toHaveBeenCalledTimes(1);
			expect(ModelList.addModel).toHaveBeenCalledWith(teamspace, project,
				{ ...data, modelType: modelTypes.DRAWING });
		});

		test('should return error if addModel fails', async () => {
			const teamspace = generateRandomString();
			const project = generateRandomString();
			const data = generateRandomString();
			const err = new Error(generateRandomString());
			ModelList.addModel.mockRejectedValueOnce(err);

			await expect(Drawings.addDrawing(teamspace, project, data)).rejects.toEqual(err);

			expect(ModelList.addModel).toHaveBeenCalledTimes(1);
			expect(ModelList.addModel).toHaveBeenCalledWith(teamspace, project,
				{ ...data, modelType: modelTypes.DRAWING });
		});
	});
};

const testUpdateSettings = () => {
	describe('Update settings', () => {
		test('should call updateModelSettings', async () => {
			const teamspace = generateRandomString();
			const model = generateRandomString();
			const project = generateRandomString();
			const data = generateRandomString();

			await Drawings.updateSettings(teamspace, project, model, data);
			expect(ModelSettings.updateModelSettings).toHaveBeenCalledTimes(1);
			expect(ModelSettings.updateModelSettings).toHaveBeenCalledWith(teamspace, project, model, data);
		});

		test('should return error if updateModelSettings fails', async () => {
			const teamspace = generateRandomString();
			const project = generateRandomString();
			const model = generateRandomString();
			const data = generateRandomString();
			const err = new Error(generateRandomString());
			ModelSettings.updateModelSettings.mockRejectedValueOnce(err);

			await expect(Drawings.updateSettings(teamspace, project, model, data)).rejects.toEqual(err);

			expect(ModelSettings.updateModelSettings).toHaveBeenCalledTimes(1);
			expect(ModelSettings.updateModelSettings).toHaveBeenCalledWith(teamspace, project, model, data);
		});
	});
};

const testDeleteDrawing = () => {
	describe('Delete drawing', () => {
		test('should delete drawing', async () => {
			const teamspace = generateRandomString();
			const model = generateRandomString();
			const project = generateRandomString();

			await Drawings.deleteDrawing(teamspace, project, model);

			expect(FilesManager.removeFilesWithMeta).toHaveBeenCalledTimes(1);
			expect(FilesManager.removeFilesWithMeta).toHaveBeenCalledWith(teamspace, DRAWINGS_HISTORY_COL,
				{ model });
			expect(ModelSettings.deleteModel).toHaveBeenCalledTimes(1);
			expect(ModelSettings.deleteModel).toHaveBeenCalledWith(teamspace, project, model);
			expect(Revisions.deleteModelRevisions).toHaveBeenCalledTimes(1);
			expect(Revisions.deleteModelRevisions).toHaveBeenCalledWith(teamspace, project, model, modelTypes.DRAWING);
			expect(ProjectSettings.removeModelFromProject).toHaveBeenCalledTimes(1);
			expect(ProjectSettings.removeModelFromProject).toHaveBeenCalledWith(teamspace, project, model);
			expect(Calibrations.deleteDrawingCalibrations).toHaveBeenCalledTimes(1);
			expect(Calibrations.deleteDrawingCalibrations).toHaveBeenCalledWith(teamspace, project, model);
		});
	});
};

const testGetRevisions = () => {
	describe('Get drawing revisions', () => {
		test('should return the drawing revisions', async () => {
			const teamspace = generateRandomString();
			const project = generateRandomString();
			const drawing = generateRandomString();
			const showVoid = true;
			const revisions = [generateRevisionEntry(), generateRevisionEntry()];

			const getRevisionsMock = Revisions.getRevisions.mockResolvedValueOnce(revisions);
			const getClaibrationStatusMock = CalibrationsProc.getCalibrationStatus
				.mockResolvedValueOnce(calibrationStatuses.CALIBRATED)
				.mockResolvedValueOnce(calibrationStatuses.UNCONFIRMED);

			const res = await Drawings.getRevisions(teamspace, project, drawing, showVoid);

			revisions[0].calibration = calibrationStatuses.CALIBRATED;
			revisions[1].calibration = calibrationStatuses.UNCONFIRMED;

			expect(res).toEqual(revisions);
			expect(getRevisionsMock).toHaveBeenCalledTimes(1);
			expect(getRevisionsMock).toHaveBeenCalledWith(teamspace, project, drawing, modelTypes.DRAWING, showVoid,
				{ _id: 1, author: 1, format: 1, timestamp: 1, statusCode: 1, revCode: 1, void: 1, desc: 1 });
			expect(getClaibrationStatusMock).toHaveBeenCalledTimes(2);
			expect(getClaibrationStatusMock).toHaveBeenCalledWith(teamspace, project, drawing, revisions[0]._id);
			expect(getClaibrationStatusMock).toHaveBeenCalledWith(teamspace, project, drawing, revisions[1]._id);
		});
	});
};

const formatToStats = (settings, revCount, latestRev, calibration) => (deleteIfUndefined({
	number: settings.number,
	status: settings.status,
	type: settings.type,
	desc: settings.desc,
	revisions: {
		total: revCount,
		lastUpdated: latestRev?.timestamp,
		latestRevision: latestRev ? `${latestRev.statusCode}-${latestRev.revCode}` : undefined,
	},
	calibration,
}));

const testGetDrawingStats = () => {
	describe('Get drawing stats', () => {
		const teamspace = generateRandomString();
		const project = generateRandomString();
		const drawing = generateRandomString();
		const revCount = generateRandomNumber();
		const settings = {
			number: generateRandomNumber(),
			status: generateRandomString(),
			type: generateRandomString(),
			desc: generateRandomString(),
		};
		const latestRev = {
			_id: generateRandomString(),
			timestamp: generateRandomString(),
			statusCode: generateRandomString(),
			revCode: generateRandomString(),
		};

		test('should return the drawing stats', async () => {
			const getDrawingByIdMock = ModelSettings.getDrawingById.mockResolvedValueOnce(settings);
			const getRevisionCountMock = Revisions.getRevisionCount.mockResolvedValueOnce(revCount);
			const getLatestRevMock = Revisions.getLatestRevision.mockResolvedValueOnce(latestRev);
			const getCalibrationMock = CalibrationsProc.getCalibration
				.mockResolvedValueOnce({ status: calibrationStatuses.CALIBRATED });

			const res = await Drawings.getDrawingStats(teamspace, project, drawing);

			expect(res).toEqual(formatToStats(settings, revCount, latestRev, calibrationStatuses.CALIBRATED));
			expect(getDrawingByIdMock).toHaveBeenCalledTimes(1);
			expect(getDrawingByIdMock).toHaveBeenCalledWith(teamspace, drawing,
				{ number: 1, status: 1, type: 1, desc: 1 });
			expect(getRevisionCountMock).toHaveBeenCalledTimes(1);
			expect(getRevisionCountMock).toHaveBeenCalledWith(teamspace, drawing, modelTypes.DRAWING);
			expect(getLatestRevMock).toHaveBeenCalledTimes(1);
			expect(getLatestRevMock).toHaveBeenCalledWith(teamspace, drawing, modelTypes.DRAWING,
				{ _id: 1, statusCode: 1, revCode: 1, timestamp: 1 });
			expect(getCalibrationMock).toHaveBeenCalledTimes(1);
			expect(getCalibrationMock).toHaveBeenCalledWith(teamspace, project, drawing, latestRev._id);
		});

		test('should return the drawing stats even if there are no revisions', async () => {
			const getDrawingByIdMock = ModelSettings.getDrawingById.mockResolvedValueOnce(settings);
			const getRevisionCountMock = Revisions.getRevisionCount.mockResolvedValueOnce(revCount);
			const getLatestRevMock = Revisions.getLatestRevision.mockRejectedValueOnce(undefined);

			const res = await Drawings.getDrawingStats(teamspace, project, drawing);

			expect(res).toEqual(formatToStats(settings, revCount));
			expect(getDrawingByIdMock).toHaveBeenCalledTimes(1);
			expect(getDrawingByIdMock).toHaveBeenCalledWith(teamspace, drawing,
				{ number: 1, status: 1, type: 1, desc: 1 });
			expect(getRevisionCountMock).toHaveBeenCalledTimes(1);
			expect(getRevisionCountMock).toHaveBeenCalledWith(teamspace, drawing, modelTypes.DRAWING);
			expect(getLatestRevMock).toHaveBeenCalledTimes(1);
			expect(getLatestRevMock).toHaveBeenCalledWith(teamspace, drawing, modelTypes.DRAWING,
				{ _id: 1, statusCode: 1, revCode: 1, timestamp: 1 });
			expect(CalibrationsProc.getCalibration).not.toHaveBeenCalled();
		});

		test('should fail if getDrawingById fails', async () => {
			const err = new Error(generateRandomString());

			ModelSettings.getDrawingById.mockRejectedValueOnce(err);
			await expect(Drawings.getDrawingStats(teamspace, project, drawing)).rejects.toEqual(err);
		});

		test('should fail if getRevisionCount fails', async () => {
			const err = new Error(generateRandomString());

			Revisions.getRevisionCount.mockRejectedValueOnce(err);
			await expect(Drawings.getDrawingStats(teamspace, project, drawing)).rejects.toEqual(err);
		});
	});
};

const testUpdateRevisionStatus = () => {
	describe('Update revision status', () => {
		test('should update the status of a revision', async () => {
			const teamspace = generateRandomString();
			const project = generateRandomString();
			const drawing = generateRandomString();
			const revision = generateRandomString();
			const status = generateRandomString();

			await Drawings.updateRevisionStatus(teamspace, project, drawing, revision, status);

			expect(Revisions.updateRevisionStatus).toHaveBeenCalledTimes(1);
			expect(Revisions.updateRevisionStatus).toHaveBeenCalledWith(teamspace, project, drawing,
				modelTypes.DRAWING, revision, status);
		});
	});
};

const testDownloadRevisionFiles = () => {
	describe('Download revision files', () => {
		test('should throw error if revision has no file', async () => {
			Revisions.getRevisionByIdOrTag.mockResolvedValueOnce({ rFile: [] });

			await expect(Drawings.downloadRevisionFiles(generateUUIDString(), generateUUIDString(),
				generateUUIDString())).rejects.toEqual(templates.fileNotFound);

			expect(FilesManager.getFileAsStream).not.toHaveBeenCalled();
		});

		test('should download files if revision has file', async () => {
			const teamspace = generateRandomString();
			const drawing = generateRandomString();
			const fileName = generateRandomString();
			const revision = generateRandomString();
			const output = generateRandomObject();

			Revisions.getRevisionByIdOrTag.mockResolvedValueOnce({ rFile: [fileName] });
			FilesManager.getFileAsStream.mockResolvedValueOnce(output);

			await expect(Drawings.downloadRevisionFiles(teamspace, drawing, revision)).resolves.toEqual(output);

			expect(Revisions.getRevisionByIdOrTag).toHaveBeenCalledTimes(1);
			expect(Revisions.getRevisionByIdOrTag).toHaveBeenCalledWith(teamspace, drawing, modelTypes.DRAWING,
				revision, { rFile: 1 }, { includeVoid: true });

			expect(FilesManager.getFileAsStream).toHaveBeenCalledTimes(1);
			expect(FilesManager.getFileAsStream).toHaveBeenCalledWith(teamspace, DRAWINGS_HISTORY_COL, fileName);
		});
	});
};

const testGetLatestThumbnail = () => {
	describe('get Latest thumbnail', () => {
		test(`should reject with ${templates.fileNotFound} if there are no revisions`, async () => {
			Revisions.getLatestRevision.mockRejectedValueOnce(new Error());

			await expect(Drawings.getLatestThumbnail(generateUUIDString(), generateUUIDString(),
				generateUUIDString())).rejects.toEqual(templates.fileNotFound);

			expect(FilesManager.getFileAsStream).not.toHaveBeenCalled();
		});

		test(`should reject with ${templates.fileNotFound} if the latest revision does not have a thumbnail`, async () => {
			Revisions.getLatestRevision.mockResolvedValueOnce({});

			await expect(Drawings.getLatestThumbnail(generateUUIDString(), generateUUIDString(),
				generateUUIDString())).rejects.toEqual(templates.fileNotFound);

			expect(FilesManager.getFileAsStream).not.toHaveBeenCalled();
		});

		test('should return file buffer if the latest revision has a thumbnail', async () => {
			const teamspace = generateRandomString();
			const project = generateRandomString();
			const drawing = generateRandomString();
			const thumbnailRef = generateRandomString();
			const output = generateRandomObject();

			Revisions.getLatestRevision.mockResolvedValueOnce({ thumbnail: thumbnailRef });
			FilesManager.getFileAsStream.mockResolvedValueOnce(output);

			await expect(Drawings.getLatestThumbnail(teamspace, project, drawing)).resolves.toEqual(output);

			expect(Revisions.getLatestRevision).toHaveBeenCalledTimes(1);
			expect(Revisions.getLatestRevision).toHaveBeenCalledWith(teamspace, drawing, modelTypes.DRAWING,
				{ thumbnail: 1 });

			expect(FilesManager.getFileAsStream).toHaveBeenCalledTimes(1);
			expect(FilesManager.getFileAsStream).toHaveBeenCalledWith(teamspace, DRAWINGS_HISTORY_COL, thumbnailRef);
		});
	});
};

const testGetImageByRevision = () => {
	describe('get image by revision', () => {
		test(`should reject with ${templates.fileNotFound} if there are no revisions`, async () => {
			Revisions.getRevisionByIdOrTag.mockRejectedValueOnce(new Error());

			await expect(Drawings.getImageByRevision(generateUUIDString(), generateUUIDString(),
				generateUUIDString())).rejects.toEqual(templates.fileNotFound);

			expect(FilesManager.getFileAsStream).not.toHaveBeenCalled();
		});

		test(`should reject with ${templates.fileNotFound} if the latest revision does not have a image`, async () => {
			Revisions.getRevisionByIdOrTag.mockResolvedValueOnce({});

			await expect(Drawings.getImageByRevision(generateUUIDString(), generateUUIDString(),
				generateUUIDString())).rejects.toEqual(templates.fileNotFound);

			expect(FilesManager.getFileAsStream).not.toHaveBeenCalled();
		});

		test('should return file buffer if the latest revision has a image', async () => {
			const teamspace = generateRandomString();
			const project = generateRandomString();
			const drawing = generateRandomString();
			const imageRef = generateRandomString();
			const revision = generateRandomString();
			const output = generateRandomObject();

			Revisions.getRevisionByIdOrTag.mockResolvedValueOnce({ image: imageRef });
			FilesManager.getFileAsStream.mockResolvedValueOnce(output);

			await expect(Drawings.getImageByRevision(teamspace, project, drawing, revision)).resolves.toEqual(output);

			expect(Revisions.getRevisionByIdOrTag).toHaveBeenCalledTimes(1);
			expect(Revisions.getRevisionByIdOrTag).toHaveBeenCalledWith(teamspace, drawing, modelTypes.DRAWING,
				revision, { image: 1 });

			expect(FilesManager.getFileAsStream).toHaveBeenCalledTimes(1);
			expect(FilesManager.getFileAsStream).toHaveBeenCalledWith(teamspace, DRAWINGS_HISTORY_COL, imageRef);
		});
	});
};

const testGetSettings = () => {
	describe('Get drawing settings', () => {
		test('should return the drawing settings', async () => {
			const drawingSettings = generateRandomString();
			const teamspace = generateRandomString();
			const drawing = generateRandomString();
			const projection = { name: 1, number: 1, type: 1, desc: 1 };
			const getDrawingByIdMock = ModelSettings.getDrawingById.mockResolvedValueOnce(drawingSettings);

			const res = await Drawings.getSettings(teamspace, drawing);
			expect(res).toEqual(drawingSettings);
			expect(getDrawingByIdMock).toHaveBeenCalledTimes(1);
			expect(getDrawingByIdMock).toHaveBeenCalledWith(teamspace, drawing, projection);
		});
	});
};

const testAppendFavourites = () => {
	describe('Append favourites', () => {
		test('should fail if getDrawings fails', async () => {
			const username = generateRandomString();
			const teamspace = generateRandomString();
			const project = generateRandomString();
			const favouritesToAdd = generateRandomString();
			const models = generateRandomString();
			const err = new Error(generateRandomString());
			ProjectSettings.getProjectById.mockResolvedValueOnce({ models });
			ModelSettings.getDrawings.mockRejectedValueOnce(err);

			await expect(Drawings.appendFavourites(username, teamspace, project, favouritesToAdd))
				.rejects.toEqual(err);

			expect(ProjectSettings.getProjectById).toHaveBeenCalledTimes(1);
			expect(ProjectSettings.getProjectById).toHaveBeenCalledWith(teamspace, project,
				{ permissions: 1, models: 1 });
		});

		test('should fail if getModelList fails', async () => {
			const username = generateRandomString();
			const teamspace = generateRandomString();
			const project = generateRandomString();
			const favouritesToAdd = generateRandomString();
			const models = generateRandomString();
			const err = new Error(generateRandomString());
			ProjectSettings.getProjectById.mockResolvedValueOnce({ models });
			ModelList.getModelList.mockRejectedValueOnce(err);

			await expect(Drawings.appendFavourites(username, teamspace, project, favouritesToAdd))
				.rejects.toEqual(err);
		});

		test('should fail if appendFavourites fails', async () => {
			const username = generateRandomString();
			const teamspace = generateRandomString();
			const project = generateRandomString();
			const favouritesToAdd = generateRandomString();
			const models = generateRandomString();
			const err = new Error(generateRandomString());
			ProjectSettings.getProjectById.mockResolvedValueOnce({ models });
			Favourites.appendFavourites.mockRejectedValueOnce(err);

			await expect(Drawings.appendFavourites(username, teamspace, project, favouritesToAdd))
				.rejects.toEqual(err);
		});

		test('should return what appendFavourites returns', async () => {
			const username = generateRandomString();
			const teamspace = generateRandomString();
			const project = generateRandomString();
			const favouritesToAdd = generateRandomString();
			const modelSettings = generateRandomString();
			const models = generateRandomString();
			const accessibleDrawings = generateRandomString();
			const result = generateRandomString();
			ProjectSettings.getProjectById.mockResolvedValueOnce({ models });
			ModelSettings.getDrawings.mockResolvedValueOnce(modelSettings);
			ModelList.getModelList.mockResolvedValueOnce(accessibleDrawings);
			Favourites.appendFavourites.mockResolvedValueOnce(result);

			const res = await Drawings.appendFavourites(username, teamspace, project, favouritesToAdd);
			expect(res).toEqual(result);

			expect(ProjectSettings.getProjectById).toHaveBeenCalledTimes(1);
			expect(ProjectSettings.getProjectById).toHaveBeenCalledWith(teamspace, project,
				{ permissions: 1, models: 1 });
			expect(ModelSettings.getDrawings).toHaveBeenCalledTimes(1);
			expect(ModelSettings.getDrawings).toHaveBeenCalledWith(teamspace, models,
				{ _id: 1, name: 1, permissions: 1 });
			expect(ModelList.getModelList).toHaveBeenCalledTimes(1);
			expect(ModelList.getModelList).toHaveBeenCalledWith(teamspace, project, username, modelSettings);
			expect(Favourites.appendFavourites).toHaveBeenCalledTimes(1);
			expect(Favourites.appendFavourites).toHaveBeenCalledWith(username, teamspace,
				accessibleDrawings, favouritesToAdd);
		});
	});
};

const testDeleteFavourites = () => {
	describe('Delete favourites', () => {
		test('should fail if getDrawings fails', async () => {
			const username = generateRandomString();
			const teamspace = generateRandomString();
			const project = generateRandomString();
			const favouritesToRemove = generateRandomString();
			const models = generateRandomString();
			const err = new Error(generateRandomString());
			ProjectSettings.getProjectById.mockResolvedValueOnce({ models });
			ModelSettings.getDrawings.mockRejectedValueOnce(err);

			await expect(Drawings.deleteFavourites(username, teamspace, project, favouritesToRemove))
				.rejects.toEqual(err);

			expect(ProjectSettings.getProjectById).toHaveBeenCalledTimes(1);
			expect(ProjectSettings.getProjectById).toHaveBeenCalledWith(teamspace, project,
				{ permissions: 1, models: 1 });
		});

		test('should fail if getModelList fails', async () => {
			const username = generateRandomString();
			const teamspace = generateRandomString();
			const project = generateRandomString();
			const favouritesToRemove = generateRandomString();
			const models = generateRandomString();
			const err = new Error(generateRandomString());
			ProjectSettings.getProjectById.mockResolvedValueOnce({ models });
			ModelList.getModelList.mockRejectedValueOnce(err);

			await expect(Drawings.deleteFavourites(username, teamspace, project, favouritesToRemove))
				.rejects.toEqual(err);
		});

		test('should fail if deleteFavourites fails', async () => {
			const username = generateRandomString();
			const teamspace = generateRandomString();
			const project = generateRandomString();
			const favouritesToRemove = generateRandomString();
			const models = generateRandomString();
			const err = new Error(generateRandomString());
			ProjectSettings.getProjectById.mockResolvedValueOnce({ models });
			Favourites.deleteFavourites.mockRejectedValueOnce(err);

			await expect(Drawings.deleteFavourites(username, teamspace, project, favouritesToRemove))
				.rejects.toEqual(err);
		});

		test('should return what deleteFavourites returns', async () => {
			const username = generateRandomString();
			const teamspace = generateRandomString();
			const project = generateRandomString();
			const favouritesToRemove = generateRandomString();
			const modelSettings = generateRandomString();
			const models = generateRandomString();
			const accessibleDrawings = generateRandomString();
			const result = generateRandomString();
			ProjectSettings.getProjectById.mockResolvedValueOnce({ models });
			ModelSettings.getDrawings.mockResolvedValueOnce(modelSettings);
			ModelList.getModelList.mockResolvedValueOnce(accessibleDrawings);
			Favourites.deleteFavourites.mockResolvedValueOnce(result);

			const res = await Drawings.deleteFavourites(username, teamspace, project, favouritesToRemove);
			expect(res).toEqual(result);

			expect(ProjectSettings.getProjectById).toHaveBeenCalledTimes(1);
			expect(ProjectSettings.getProjectById).toHaveBeenCalledWith(teamspace, project,
				{ permissions: 1, models: 1 });
			expect(ModelSettings.getDrawings).toHaveBeenCalledTimes(1);
			expect(ModelSettings.getDrawings).toHaveBeenCalledWith(teamspace, models,
				{ _id: 1, name: 1, permissions: 1 });
			expect(ModelList.getModelList).toHaveBeenCalledTimes(1);
			expect(ModelList.getModelList).toHaveBeenCalledWith(teamspace, project, username, modelSettings);
			expect(Favourites.deleteFavourites).toHaveBeenCalledTimes(1);
			expect(Favourites.deleteFavourites).toHaveBeenCalledWith(username, teamspace,
				accessibleDrawings, favouritesToRemove);
		});
	});
};

const testCreateDrawingThumbnail = () => {
	const teamspace = generateRandomString();
	const project = generateRandomString();
	const model = generateRandomString();
	const revision = generateRandomString();

	describe('Create drawing thumbnail', () => {
		test('Should store the thumbnail if it has been successfully generated', async () => {
			const imageRef = generateUUID();
			const imageBuffer = generateRandomString();
			const thumbnailBuffer = generateRandomString();
			Revisions.getRevisionByIdOrTag.mockResolvedValueOnce({ image: imageRef });
			FilesManager.getFile.mockResolvedValueOnce(imageBuffer);
			ImageHelper.createThumbnail.mockResolvedValueOnce(thumbnailBuffer);

			await Drawings.createDrawingThumbnail(teamspace, project, model, revision);

			expect(Revisions.getRevisionByIdOrTag).toHaveBeenCalledTimes(1);
			expect(Revisions.getRevisionByIdOrTag).toHaveBeenCalledWith(teamspace, model,
				modelTypes.DRAWING, revision, { image: 1 });

			expect(FilesManager.getFile).toHaveBeenCalledTimes(1);
			expect(FilesManager.getFile).toHaveBeenCalledWith(teamspace, DRAWINGS_HISTORY_COL, imageRef);

			expect(ImageHelper.createThumbnail).toHaveBeenCalledTimes(1);
			expect(ImageHelper.createThumbnail).toHaveBeenCalledWith(imageBuffer);

			expect(FilesManager.storeFile).toHaveBeenCalledTimes(1);
			expect(FilesManager.storeFile).toHaveBeenCalledWith(teamspace, DRAWINGS_HISTORY_COL,
				expect.anything(), thumbnailBuffer, { teamspace, project, model, rev_id: revision });

			const thumbnailRef = FilesManager.storeFile.mock.calls[0][2];

			expect(Revisions.addDrawingThumbnailRef).toHaveBeenCalledTimes(1);
			expect(Revisions.addDrawingThumbnailRef).toHaveBeenCalledWith(teamspace, project, model,
				revision, thumbnailRef);
		});

		test('Should not store the thumbnail it has not been successfully generated', async () => {
			const imageRef = generateUUID();
			const imageBuffer = generateRandomString();
			Revisions.getRevisionByIdOrTag.mockResolvedValueOnce({ image: imageRef });
			FilesManager.getFile.mockResolvedValueOnce(imageBuffer);
			ImageHelper.createThumbnail.mockResolvedValueOnce();

			await Drawings.createDrawingThumbnail(teamspace, project, model, revision);

			expect(Revisions.getRevisionByIdOrTag).toHaveBeenCalledTimes(1);
			expect(Revisions.getRevisionByIdOrTag).toHaveBeenCalledWith(teamspace, model,
				modelTypes.DRAWING, revision, { image: 1 });

			expect(FilesManager.getFile).toHaveBeenCalledTimes(1);
			expect(FilesManager.getFile).toHaveBeenCalledWith(teamspace, DRAWINGS_HISTORY_COL, imageRef);

			expect(ImageHelper.createThumbnail).toHaveBeenCalledTimes(1);
			expect(ImageHelper.createThumbnail).toHaveBeenCalledWith(imageBuffer);

			expect(FilesManager.storeFile).not.toHaveBeenCalled();
			expect(Revisions.addDrawingThumbnailRef).not.toHaveBeenCalled();
		});
	});
};

describe(determineTestGroup(__filename), () => {
	testAddDrawing();
	testUpdateSettings();
	testDeleteDrawing();
	testGetRevisions();
	testUpdateRevisionStatus();
	testDownloadRevisionFiles();
	testGetSettings();
	testGetDrawingStats();
	testAppendFavourites();
	testDeleteFavourites();
	testCreateDrawingThumbnail();
	testGetLatestThumbnail();
	testGetImageByRevision();
});
