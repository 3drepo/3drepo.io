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

const { TICKETS_RESOURCES_COL } = require(`${src}/models/tickets.constants`);
const { VIEWS_COL } = require(`${src}/models/views.constants`);

jest.mock('../../../../../src/v5/models/modelSettings');
const ModelSettings = require(`${src}/models/modelSettings`);

jest.mock('../../../../../src/v5/models/tickets');
const Tickets = require(`${src}/models/tickets`);

jest.mock('../../../../../src/v5/services/filesManager');
const FilesManager = require(`${src}/services/filesManager`);

jest.mock('../../../../../src/v5/handler/db');
const DB = require(`${src}/handler/db`);

const { templates } = require(`${src}/utils/responseCodes`);

const testRemoveModelData = () => {
	describe('Remove model data', () => {
		test('should remove model data successfully', async () => {
			const teamspace = generateRandomString();
			const project = generateRandomString();
			const model = generateRandomString();

			const modelCol1 = `${model}.ref`;
			const modelCol2 = `${model}.history`;

			ModelSettings.deleteModel.mockResolvedValueOnce();
			DB.listCollections.mockResolvedValueOnce([
				modelCol1,
				modelCol2,
				generateRandomString(),
			].map((name) => ({ name })));

			await ModelHelper.removeModelData(teamspace, project, model);

			expect(FilesManager.removeAllFilesFromModel).toHaveBeenCalledTimes(1);
			expect(FilesManager.removeAllFilesFromModel).toHaveBeenCalledWith(teamspace, model);

			expect(FilesManager.removeFilesWithMeta).toHaveBeenCalledTimes(2);
			expect(FilesManager.removeFilesWithMeta).toHaveBeenCalledWith(teamspace, TICKETS_RESOURCES_COL,
				{ teamspace, project, model });
			expect(FilesManager.removeFilesWithMeta).toHaveBeenCalledWith(teamspace, VIEWS_COL,
				{ teamspace, project, model });

			expect(ModelSettings.deleteModel).toHaveBeenCalledTimes(1);
			expect(ModelSettings.deleteModel).toHaveBeenCalledWith(teamspace, project, model);

			expect(DB.listCollections).toHaveBeenCalledTimes(1);
			expect(DB.listCollections).toHaveBeenCalledWith(teamspace);

			expect(DB.dropCollection).toHaveBeenCalledTimes(2);
			expect(DB.dropCollection).toHaveBeenCalledWith(teamspace, modelCol1);
			expect(DB.dropCollection).toHaveBeenCalledWith(teamspace, modelCol2);

			expect(Tickets.removeAllTicketsInModel).toHaveBeenCalledTimes(1);
			expect(Tickets.removeAllTicketsInModel).toHaveBeenCalledWith(teamspace, project, model);

			expect(Tickets.removeAllTicketsInModel).toHaveBeenCalledTimes(1);
			expect(FilesManager.removeFilesWithMeta).toHaveBeenCalledWith(teamspace,
				TICKETS_RESOURCES_COL, { teamspace, project, model });
		});
		test(`should not return with error if deleteModel failed with ${templates.modelNotFound.code}`, async () => {
			DB.listCollections.mockResolvedValueOnce([]);
			ModelSettings.deleteModel.mockRejectedValue(templates.modelNotFound);

			const teamspace = generateRandomString();
			const project = generateRandomString();
			const model = generateRandomString();

			await ModelHelper.removeModelData(teamspace, project, model);

			expect(FilesManager.removeAllFilesFromModel).toHaveBeenCalledTimes(1);
			expect(FilesManager.removeAllFilesFromModel).toHaveBeenCalledWith(teamspace, model);

			expect(FilesManager.removeFilesWithMeta).toHaveBeenCalledTimes(2);
			expect(FilesManager.removeFilesWithMeta).toHaveBeenCalledWith(teamspace, TICKETS_RESOURCES_COL,
				{ teamspace, project, model });
			expect(FilesManager.removeFilesWithMeta).toHaveBeenCalledWith(teamspace, VIEWS_COL,
				{ teamspace, project, model });

			expect(ModelSettings.deleteModel).toHaveBeenCalledTimes(1);
			expect(ModelSettings.deleteModel).toHaveBeenCalledWith(teamspace, project, model);

			expect(DB.listCollections).toHaveBeenCalledTimes(1);
			expect(DB.listCollections).toHaveBeenCalledWith(teamspace);

			expect(Tickets.removeAllTicketsInModel).toHaveBeenCalledTimes(1);
			expect(Tickets.removeAllTicketsInModel).toHaveBeenCalledWith(teamspace, project, model);

			expect(Tickets.removeAllTicketsInModel).toHaveBeenCalledTimes(1);
			expect(FilesManager.removeFilesWithMeta).toHaveBeenCalledWith(teamspace,
				TICKETS_RESOURCES_COL, { teamspace, project, model });

			// We mocked listCollections to return empty array, so we shouldn't have removed any collections
			expect(DB.dropCollection).not.toHaveBeenCalled();
		});

		test(`should throw error if deleteModel threw an error that was not ${templates.modelNotFound.code}`, async () => {
			DB.listCollections.mockResolvedValueOnce([]);
			ModelSettings.deleteModel.mockRejectedValue(templates.unknown);

			const teamspace = generateRandomString();
			const project = generateRandomString();
			const model = generateRandomString();

			await expect(ModelHelper.removeModelData(teamspace, project, model)).rejects.toEqual(templates.unknown);
		});
	});
};

describe('utils/helper/models', () => {
	testRemoveModelData();
});
