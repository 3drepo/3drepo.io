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

const { src } = require('../../helper/path');
const { generateRandomString } = require('../../helper/services');

jest.mock('../../../../src/v5/handler/db');
const db = require(`${src}/handler/db`);
jest.mock('../../../../src/v5/models/fileRefs');
const fileRefs = require(`${src}/models/fileRefs`);

jest.mock('../../../../src/v5/handler/fs');
const FSHandler = require(`${src}/handler/fs`);

jest.mock('../../../../src/v5/handler/gridfs');
const GridFSHandler = require(`${src}/handler/gridfs`);

const FilesManager = require(`${src}/services/filesManager`);

const { templates } = require(`${src}/utils/responseCodes`);

const testRemoveAllFilesFromModel = () => {
	describe('Remove all files from model', () => {
		test('Should not do any calls if no ref collections are found', async () => {
			const model = generateRandomString();
			db.listCollections.mockResolvedValueOnce([
				`${model}.${generateRandomString()}`,
				`${model}.${generateRandomString()}`,
				generateRandomString(),
			].map((name) => ({ name })));
			const teamspace = generateRandomString();

			await FilesManager.removeAllFilesFromModel(teamspace, model);

			expect(db.listCollections).toHaveBeenCalledTimes(1);
			expect(db.listCollections).toHaveBeenCalledWith(teamspace);

			expect(fileRefs.getAllRemovableEntriesByType).not.toHaveBeenCalled();
		});

		test('Should do the relevant calls to remove files', async () => {
			const model = generateRandomString();

			const refCol1 = `${model}.${generateRandomString()}.ref`;
			const refCol2 = `${model}.${generateRandomString()}.ref`;

			db.listCollections.mockResolvedValueOnce([
				`${model}.${generateRandomString()}`,
				`${model}.${generateRandomString()}`,
				refCol1,
				`${model}.${generateRandomString()}.refasdf`,
				`${model}.${generateRandomString()}.aaref`,
				generateRandomString(),
				refCol2,
			].map((name) => ({ name })));

			const refCol1Data = [
				{
					_id: 'fs',
					links: [generateRandomString(), generateRandomString(), generateRandomString()],
				},
				{
					_id: 'gridfs',
					links: [generateRandomString(), generateRandomString(), generateRandomString()],
				},
			];

			fileRefs.getAllRemovableEntriesByType
				.mockImplementation((ts, col) => Promise.resolve(col === refCol1 ? refCol1Data : [{ _id: 'fs', links: [] }]));

			const teamspace = generateRandomString();

			await FilesManager.removeAllFilesFromModel(teamspace, model);

			expect(db.listCollections).toHaveBeenCalledTimes(1);
			expect(db.listCollections).toHaveBeenCalledWith(teamspace);

			expect(fileRefs.getAllRemovableEntriesByType).toHaveBeenCalledTimes(2);
			expect(fileRefs.getAllRemovableEntriesByType).toHaveBeenNthCalledWith(1, teamspace, refCol1);
			expect(fileRefs.getAllRemovableEntriesByType).toHaveBeenNthCalledWith(2, teamspace, refCol2);

			expect(FSHandler.removeFiles).toHaveBeenCalledTimes(1);
			expect(FSHandler.removeFiles).toHaveBeenCalledWith(refCol1Data[0].links);

			expect(GridFSHandler.removeFiles).toHaveBeenCalledTimes(1);
			expect(GridFSHandler.removeFiles).toHaveBeenCalledWith(teamspace, refCol1, refCol1Data[1].links);
		});

		test('Should error if the type of storage is unknown', async () => {
			const model = generateRandomString();

			const refCol1 = `${model}.${generateRandomString()}.ref`;

			db.listCollections.mockResolvedValueOnce([
				refCol1,
			].map((name) => ({ name })));

			fileRefs.getAllRemovableEntriesByType
				.mockResolvedValueOnce([{ _id: 'aaafs', links: [generateRandomString()] }]);

			const teamspace = generateRandomString();

			await expect(FilesManager.removeAllFilesFromModel(teamspace, model))
				.rejects.toEqual(templates.fileNotFound);

			expect(db.listCollections).toHaveBeenCalledTimes(1);
			expect(db.listCollections).toHaveBeenCalledWith(teamspace);

			expect(fileRefs.getAllRemovableEntriesByType).toHaveBeenCalledTimes(1);
			expect(fileRefs.getAllRemovableEntriesByType).toHaveBeenNthCalledWith(1, teamspace, refCol1);
		});
	});
};

describe('services/filesManager', () => {
	testRemoveAllFilesFromModel();
});
