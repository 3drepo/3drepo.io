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

const { src } = require('../../../helper/path');

const { generateRandomString } = require('../../../helper/services');

const ModelHelper = require(`${src}/utils/helper/models`);

jest.mock('../../../../../src/v5/models/modelSettings');
const ModelSettings = require(`${src}/models/modelSettings`);

jest.mock('../../../../../src/v5/services/filesManager');
const FilesManager = require(`${src}/services/filesManager`);

jest.mock('../../../../../src/v5/handler/db');
const DB = require(`${src}/handler/db`);

const { templates } = require(`${src}/utils/responseCodes`);

const testRemoveModelData = () => {
	describe('Remove model data', () => {
		test(`should not return with error if deleteModel failed with ${templates.modelNotFound.code}`, async () => {
			FilesManager.removeAllFilesFromModel.mockResolvedValueOnce();
			DB.listCollections.mockResolvedValueOnce([]);
			ModelSettings.deleteModel.mockRejectedValue(templates.modelNotFound);

			const teamspace = generateRandomString();
			const model = generateRandomString();

			await ModelHelper.removeModelData(teamspace, model);

			expect(FilesManager.removeAllFilesFromModel).toHaveBeenCalledTimes(1);
			expect(FilesManager.removeAllFilesFromModel).toHaveBeenCalledWith(teamspace, model);

			expect(ModelSettings.deleteModel).toHaveBeenCalledTimes(1);
			expect(ModelSettings.deleteModel).toHaveBeenCalledWith(teamspace, model);

			expect(DB.listCollections).toHaveBeenCalledTimes(1);
			expect(DB.listCollections).toHaveBeenCalledWith(teamspace);

			// We mocked listCollections to return empty array, so we shouldn't have removed any collections
			expect(DB.dropCollection).not.toHaveBeenCalled();

			expect(ModelSettings.deleteModel).toHaveBeenCalledTimes(1);
			expect(ModelSettings.deleteModel).toHaveBeenCalledWith(teamspace, model);
		});

		test(`should throw error if deleteModel threw an error that was not ${templates.modelNotFound.code}`, async () => {
			FilesManager.removeAllFilesFromModel.mockResolvedValueOnce();
			DB.listCollections.mockResolvedValueOnce([]);
			ModelSettings.deleteModel.mockRejectedValue(templates.unknown);

			const teamspace = generateRandomString();
			const model = generateRandomString();

			await expect(ModelHelper.removeModelData(teamspace, model)).rejects.toEqual(templates.unknown);
		});
	});
};

describe('utils/helper/models', () => {
	testRemoveModelData();
});
