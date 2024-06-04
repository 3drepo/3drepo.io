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

const { src } = require('../../../../../helper/path');

jest.mock('../../../../../../../src/v5/models/projectSettings');
const ProjectSettings = require(`${src}/models/projectSettings`);
jest.mock('../../../../../../../src/v5/models/modelSettings');
const ModelSettings = require(`${src}/models/modelSettings`);
jest.mock('../../../../../../../src/v5/processors/teamspaces/projects/models/commons/modelList');
const ModelList = require(`${src}/processors/teamspaces/projects/models/commons/modelList`);
jest.mock('../../../../../../../src/v5/processors/teamspaces/projects/models/commons/favourites');
const Favourites = require(`${src}/processors/teamspaces/projects/models/commons/favourites`);

const Drawings = require(`${src}/processors/teamspaces/projects/models/drawings`);

const { determineTestGroup, generateRandomString } = require('../../../../../helper/services');
const { MODEL_TYPES } = require('../../../../../../../src/v5/models/modelSettings.constants');

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
				{ ...data, modelType: MODEL_TYPES.drawing });
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
				{ ...data, modelType: MODEL_TYPES.drawing });
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
		test('should call updateModelSettings', async () => {
			const teamspace = generateRandomString();
			const model = generateRandomString();
			const project = generateRandomString();

			await Drawings.deleteDrawing(teamspace, project, model);
			expect(ModelList.deleteModel).toHaveBeenCalledTimes(1);
			expect(ModelList.deleteModel).toHaveBeenCalledWith(teamspace, project, model);
		});

		test('should return error if deleteModel fails', async () => {
			const teamspace = generateRandomString();
			const project = generateRandomString();
			const model = generateRandomString();
			const err = new Error(generateRandomString());
			ModelList.deleteModel.mockRejectedValueOnce(err);

			await expect(Drawings.deleteDrawing(teamspace, project, model)).rejects.toEqual(err);

			expect(ModelList.deleteModel).toHaveBeenCalledTimes(1);
			expect(ModelList.deleteModel).toHaveBeenCalledWith(teamspace, project, model);
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

describe(determineTestGroup(__filename), () => {
	testAddDrawing();
	testUpdateSettings();
	testDeleteDrawing();
	testAppendFavourites();
	testDeleteFavourites();
});
