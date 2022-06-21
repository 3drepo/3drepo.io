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
const config = require('../../../../src/v5/utils/config');
const { generateRandomString } = require('../../helper/services');
const { USERS_DB_NAME, AVATARS_COL_NAME } = require('../../../../src/v5/models/users.constants');

jest.mock('../../../../src/v5/handler/db');
const db = require(`${src}/handler/db`);
jest.mock('../../../../src/v5/models/fileRefs');
const FileRefs = require(`${src}/models/fileRefs`);

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

			expect(FileRefs.getAllRemovableEntriesByType).not.toHaveBeenCalled();
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

			FileRefs.getAllRemovableEntriesByType
				.mockImplementation((ts, col) => Promise.resolve(col === refCol1 ? refCol1Data : [{ _id: 'fs', links: [] }]));

			const teamspace = generateRandomString();

			await FilesManager.removeAllFilesFromModel(teamspace, model);

			expect(db.listCollections).toHaveBeenCalledTimes(1);
			expect(db.listCollections).toHaveBeenCalledWith(teamspace);

			expect(FileRefs.getAllRemovableEntriesByType).toHaveBeenCalledTimes(2);
			expect(FileRefs.getAllRemovableEntriesByType).toHaveBeenNthCalledWith(1, teamspace, refCol1);
			expect(FileRefs.getAllRemovableEntriesByType).toHaveBeenNthCalledWith(2, teamspace, refCol2);

			expect(FSHandler.removeFiles).toHaveBeenCalledTimes(1);
			expect(FSHandler.removeFiles).toHaveBeenCalledWith(refCol1Data[0].links);

			expect(GridFSHandler.removeFiles).toHaveBeenCalledTimes(1);
			expect(GridFSHandler.removeFiles).toHaveBeenCalledWith(teamspace, refCol1, refCol1Data[1].links);
		});

		test('Should throw error if the type of storage is unknown', async () => {
			const model = generateRandomString();

			const refCol1 = `${model}.${generateRandomString()}.ref`;

			db.listCollections.mockResolvedValueOnce([
				refCol1,
			].map((name) => ({ name })));

			FileRefs.getAllRemovableEntriesByType
				.mockResolvedValueOnce([{ _id: 'aaafs', links: [generateRandomString()] }]);

			const teamspace = generateRandomString();

			await expect(FilesManager.removeAllFilesFromModel(teamspace, model))
				.rejects.toEqual(templates.fileNotFound);

			expect(db.listCollections).toHaveBeenCalledTimes(1);
			expect(db.listCollections).toHaveBeenCalledWith(teamspace);

			expect(FileRefs.getAllRemovableEntriesByType).toHaveBeenCalledTimes(1);
			expect(FileRefs.getAllRemovableEntriesByType).toHaveBeenNthCalledWith(1, teamspace, refCol1);
		});
	});
};

const testGetFileAsStream = () => {
	describe('Get file as stream', () => {
		test('should throw error if the storage type is unrecognised', async () => {
			const fileEntry = { type: generateRandomString() };
			FileRefs.getRefEntry.mockResolvedValueOnce(fileEntry);
			await expect(FilesManager.getFileAsStream(
				generateRandomString(),
				generateRandomString(),
				generateRandomString(),
			)).rejects.toEqual(templates.fileNotFound);
		});

		test('should throw error if ref entry is not found', async () => {
			FileRefs.getRefEntry.mockRejectedValueOnce(templates.fileNotFound);
			await expect(FilesManager.getFileAsStream(
				generateRandomString(),
				generateRandomString(),
				generateRandomString(),
			)).rejects.toEqual(templates.fileNotFound);
		});

		test('should return a stream if the reference is found', async () => {
			const fileEntry = { size: 100, type: 'fs', link: generateRandomString() };
			const readStream = { [generateRandomString()]: generateRandomString() };
			FileRefs.getRefEntry.mockResolvedValueOnce(fileEntry);
			FSHandler.getFileStream.mockResolvedValueOnce(readStream);

			const teamspace = generateRandomString();
			const collection = generateRandomString();
			const fileName = generateRandomString();

			await expect(FilesManager.getFileAsStream(teamspace, collection, fileName))
				.resolves.toEqual({ readStream, size: fileEntry.size });

			expect(FileRefs.getRefEntry).toHaveBeenCalledTimes(1);
			expect(FileRefs.getRefEntry).toHaveBeenCalledWith(teamspace, collection, fileName);

			expect(FSHandler.getFileStream).toHaveBeenCalledTimes(1);
			expect(FSHandler.getFileStream).toHaveBeenCalledWith(fileEntry.link);
		});

		test('should return a stream of the reference is found (gridFs)', async () => {
			const fileEntry = { size: 100, type: 'gridfs', link: generateRandomString() };
			const readStream = { [generateRandomString()]: generateRandomString() };
			FileRefs.getRefEntry.mockResolvedValueOnce(fileEntry);
			GridFSHandler.getFileStream.mockResolvedValueOnce(readStream);

			const teamspace = generateRandomString();
			const collection = generateRandomString();
			const fileName = generateRandomString();

			await expect(FilesManager.getFileAsStream(teamspace, collection, fileName))
				.resolves.toEqual({ readStream, size: fileEntry.size });

			expect(FileRefs.getRefEntry).toHaveBeenCalledTimes(1);
			expect(FileRefs.getRefEntry).toHaveBeenCalledWith(teamspace, collection, fileName);

			expect(GridFSHandler.getFileStream).toHaveBeenCalledTimes(1);
			expect(GridFSHandler.getFileStream).toHaveBeenCalledWith(teamspace, collection, fileEntry.link);
		});
	});
};

const testStoreFile = () => {
	describe('Store file in fileshare', () => {
		test('should throw error if the default type is not recognised', async () => {
			const { defaultStorage } = config;
			config.defaultStorage = 'unrecognised storage type';

			await expect(FilesManager.storeFile(
				generateRandomString(),
				generateRandomString(),
				generateRandomString(),
			)).rejects.toEqual(templates.unknown);

			config.defaultStorage = defaultStorage;
		});

		test('should store file if default storage type is fs', async () => {
			const { defaultStorage } = config;
			config.defaultStorage = 'fs';

			const refInfo = { _id: generateRandomString() };
			FSHandler.storeFile.mockResolvedValueOnce(refInfo);
			const teamspace = generateRandomString();
			const collection = generateRandomString();
			const id = generateRandomString();
			const data = generateRandomString();

			await expect(FilesManager.storeFile(teamspace, collection, id, data))
				.resolves.toEqual(undefined);

			expect(FSHandler.storeFile).toHaveBeenCalledTimes(1);
			expect(FSHandler.storeFile).toHaveBeenCalledWith(data);
			expect(FileRefs.insertRef).toHaveBeenCalledTimes(1);
			expect(FileRefs.insertRef).toHaveBeenCalledWith(teamspace, collection, { ...refInfo, _id: id });

			config.defaultStorage = defaultStorage;
		});

		test('should store file if default storage type is gridfs', async () => {
			const { defaultStorage } = config;
			config.defaultStorage = 'gridfs';

			const refInfo = { _id: generateRandomString() };
			GridFSHandler.storeFile.mockResolvedValueOnce(refInfo);
			const teamspace = generateRandomString();
			const collection = generateRandomString();
			const id = generateRandomString();
			const data = generateRandomString();

			await expect(FilesManager.storeFile(teamspace, collection, id, data))
				.resolves.toEqual(undefined);
			expect(GridFSHandler.storeFile).toHaveBeenCalledTimes(1);
			expect(GridFSHandler.storeFile).toHaveBeenCalledWith(teamspace, collection, data);
			expect(FileRefs.insertRef).toHaveBeenCalledTimes(1);
			expect(FileRefs.insertRef).toHaveBeenCalledWith(teamspace, collection, { ...refInfo, _id: id });

			config.defaultStorage = defaultStorage;
		});
	});
};

const testFileExists = () => {
	describe('Check whether a file exists or not', () => {
		test('should return fs if config.defaultStorage is set to fs', async () => {
			const { defaultStorage } = config;
			config.defaultStorage = 'fs';

			FileRefs.getRefEntry.mockResolvedValueOnce({ _id: generateRandomString() });
			const filename = generateRandomString();
			await expect(FilesManager.fileExists(filename)).resolves.toEqual(true);
			expect(FileRefs.getRefEntry).toHaveBeenCalledTimes(1);
			expect(FileRefs.getRefEntry).toHaveBeenCalledWith(USERS_DB_NAME, AVATARS_COL_NAME, filename);

			config.defaultStorage = defaultStorage;
		});

		test('should return false if file does not exist', async () => {
			FileRefs.getRefEntry.mockRejectedValueOnce(templates.fileNotFound);
			const filename = generateRandomString();
			await expect(FilesManager.fileExists(filename)).resolves.toEqual(false);
			expect(FileRefs.getRefEntry).toHaveBeenCalledTimes(1);
			expect(FileRefs.getRefEntry).toHaveBeenCalledWith(USERS_DB_NAME, AVATARS_COL_NAME, filename);
		});
	});
};

describe('services/filesManager', () => {
	testRemoveAllFilesFromModel();
	testGetFileAsStream();
	testStoreFile();
	testFileExists();
});
