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

const CryptoJS = require('crypto-js');
const { times } = require('lodash');
const { src } = require('../../helper/path');
const config = require('../../../../src/v5/utils/config');
const { generateRandomString, generateRandomObject } = require('../../helper/services');
const { PassThrough } = require('stream');

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

const DEFAULT_MIME_TYPE = 'application/octet-stream';

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

const testRemoveAllFilesFromTeamspace = () => {
	describe('Remove all files from teamspace', () => {
		test('Should not do any calls if no ref collections are found', async () => {
			db.listCollections.mockResolvedValueOnce([
				generateRandomString(),
				generateRandomString(),
				generateRandomString(),
				`${generateRandomString()}ref`,
			].map((name) => ({ name })));
			const teamspace = generateRandomString();

			await FilesManager.removeAllFilesFromTeamspace(teamspace);

			expect(db.listCollections).toHaveBeenCalledTimes(1);
			expect(db.listCollections).toHaveBeenCalledWith(teamspace);

			expect(FileRefs.getAllRemovableEntriesByType).not.toHaveBeenCalled();
		});

		test('Should do the relevant calls to remove files', async () => {
			const refCol1 = `${generateRandomString()}.ref`;
			const refCol2 = `${generateRandomString()}.ref`;

			db.listCollections.mockResolvedValueOnce([
				generateRandomString(),
				generateRandomString(),
				refCol1,
				`${generateRandomString()}.refasdf`,
				`${generateRandomString()}.aaref`,
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

			await FilesManager.removeAllFilesFromTeamspace(teamspace);

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
			const refCol1 = `${generateRandomString()}.ref`;

			db.listCollections.mockResolvedValueOnce([
				refCol1,
			].map((name) => ({ name })));

			FileRefs.getAllRemovableEntriesByType
				.mockResolvedValueOnce([{ _id: 'aaafs', links: [generateRandomString()] }]);

			const teamspace = generateRandomString();

			await expect(FilesManager.removeAllFilesFromTeamspace(teamspace))
				.rejects.toEqual(templates.fileNotFound);

			expect(db.listCollections).toHaveBeenCalledTimes(1);
			expect(db.listCollections).toHaveBeenCalledWith(teamspace);

			expect(FileRefs.getAllRemovableEntriesByType).toHaveBeenCalledTimes(1);
			expect(FileRefs.getAllRemovableEntriesByType).toHaveBeenNthCalledWith(1, teamspace, refCol1);
		});
	});
};

const testGetFile = () => {
	describe('Get file', () => {
		test('should throw error if the storage type is unrecognised', async () => {
			const fileEntry = { type: generateRandomString() };
			FileRefs.getRefEntry.mockResolvedValueOnce(fileEntry);
			await expect(FilesManager.getFile(
				generateRandomString(),
				generateRandomString(),
				generateRandomString(),
			)).rejects.toEqual(templates.fileNotFound);
		});

		test('should throw error if ref entry is not found', async () => {
			FileRefs.getRefEntry.mockRejectedValueOnce(templates.fileNotFound);
			await expect(FilesManager.getFile(
				generateRandomString(),
				generateRandomString(),
				generateRandomString(),
			)).rejects.toEqual(templates.fileNotFound);
		});

		test('should return a stream if the reference is found', async () => {
			const fileEntry = { size: 100, type: 'fs', link: generateRandomString() };
			const fileBin = generateRandomString();
			FileRefs.getRefEntry.mockResolvedValueOnce(fileEntry);
			FSHandler.getFile.mockResolvedValueOnce(fileBin);

			const teamspace = generateRandomString();
			const collection = generateRandomString();
			const fileName = generateRandomString();

			await expect(FilesManager.getFile(teamspace, collection, fileName))
				.resolves.toEqual(fileBin);

			expect(FileRefs.getRefEntry).toHaveBeenCalledTimes(1);
			expect(FileRefs.getRefEntry).toHaveBeenCalledWith(teamspace, collection, fileName);

			expect(FSHandler.getFile).toHaveBeenCalledTimes(1);
			expect(FSHandler.getFile).toHaveBeenCalledWith(fileEntry.link);
		});

		test('should return a stream of the reference is found (gridFs)', async () => {
			const fileEntry = { size: 100, type: 'gridfs', link: generateRandomString() };
			const fileBin = generateRandomString();
			FileRefs.getRefEntry.mockResolvedValueOnce(fileEntry);
			GridFSHandler.getFile.mockResolvedValueOnce(fileBin);

			const teamspace = generateRandomString();
			const collection = generateRandomString();
			const fileName = generateRandomString();

			await expect(FilesManager.getFile(teamspace, collection, fileName))
				.resolves.toEqual(fileBin);

			expect(FileRefs.getRefEntry).toHaveBeenCalledTimes(1);
			expect(FileRefs.getRefEntry).toHaveBeenCalledWith(teamspace, collection, fileName);

			expect(GridFSHandler.getFile).toHaveBeenCalledTimes(1);
			expect(GridFSHandler.getFile).toHaveBeenCalledWith(teamspace, collection, fileEntry.link);
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
				.resolves.toEqual({ readStream, size: fileEntry.size, mimeType: DEFAULT_MIME_TYPE });

			expect(FileRefs.getRefEntry).toHaveBeenCalledTimes(1);
			expect(FileRefs.getRefEntry).toHaveBeenCalledWith(teamspace, collection, fileName);

			expect(FSHandler.getFileStream).toHaveBeenCalledTimes(1);
			expect(FSHandler.getFileStream).toHaveBeenCalledWith(fileEntry.link, undefined);
		});

		test('should include the filename if it is part of the ref entry', async () => {
			const fileEntry = { size: 100, type: 'fs', link: generateRandomString(), name: generateRandomString() };
			const readStream = { [generateRandomString()]: generateRandomString() };
			FileRefs.getRefEntry.mockResolvedValueOnce(fileEntry);
			FSHandler.getFileStream.mockResolvedValueOnce(readStream);

			const teamspace = generateRandomString();
			const collection = generateRandomString();
			const fileName = generateRandomString();

			await expect(FilesManager.getFileAsStream(teamspace, collection, fileName))
				.resolves.toEqual({ readStream,
					size: fileEntry.size,
					mimeType: DEFAULT_MIME_TYPE,
					filename: fileEntry.name });

			expect(FileRefs.getRefEntry).toHaveBeenCalledTimes(1);
			expect(FileRefs.getRefEntry).toHaveBeenCalledWith(teamspace, collection, fileName);

			expect(FSHandler.getFileStream).toHaveBeenCalledTimes(1);
			expect(FSHandler.getFileStream).toHaveBeenCalledWith(fileEntry.link, undefined);
		});

		test('should return a stream with the recorded mimeType if the reference is found', async () => {
			const mimeType = generateRandomString();
			const fileEntry = { size: 100, type: 'fs', link: generateRandomString(), mimeType };
			const readStream = { [generateRandomString()]: generateRandomString() };
			FileRefs.getRefEntry.mockResolvedValueOnce(fileEntry);
			FSHandler.getFileStream.mockResolvedValueOnce(readStream);

			const teamspace = generateRandomString();
			const collection = generateRandomString();
			const fileName = generateRandomString();

			await expect(FilesManager.getFileAsStream(teamspace, collection, fileName))
				.resolves.toEqual({ readStream, size: fileEntry.size, mimeType });

			expect(FileRefs.getRefEntry).toHaveBeenCalledTimes(1);
			expect(FileRefs.getRefEntry).toHaveBeenCalledWith(teamspace, collection, fileName);

			expect(FSHandler.getFileStream).toHaveBeenCalledTimes(1);
			expect(FSHandler.getFileStream).toHaveBeenCalledWith(fileEntry.link, undefined);
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
				.resolves.toEqual({ readStream, size: fileEntry.size, mimeType: DEFAULT_MIME_TYPE });

			expect(FileRefs.getRefEntry).toHaveBeenCalledTimes(1);
			expect(FileRefs.getRefEntry).toHaveBeenCalledWith(teamspace, collection, fileName);

			expect(GridFSHandler.getFileStream).toHaveBeenCalledTimes(1);
			expect(GridFSHandler.getFileStream).toHaveBeenCalledWith(teamspace, collection, fileEntry.link, undefined);
		});
	});
};

const testGetFileWithMetaAsStream = () => {
	describe('Get file as stream with certain metadata', () => {
		const teamspace = generateRandomString();
		const collection = generateRandomString();
		const fileName = generateRandomString();
		const meta = { [generateRandomString()]: generateRandomString() };

		test('should throw error if the storage type is unrecognised', async () => {
			const fileEntry = { type: generateRandomString() };
			FileRefs.getRefEntryByQuery.mockResolvedValueOnce(fileEntry);
			await expect(FilesManager.getFileWithMetaAsStream(
				teamspace, collection, fileName, meta,
			)).rejects.toEqual(templates.fileNotFound);

			expect(FileRefs.getRefEntryByQuery).toHaveBeenCalledTimes(1);
			expect(FileRefs.getRefEntryByQuery).toHaveBeenCalledWith(teamspace, collection, { ...meta, _id: fileName });
		});

		test('should throw error if ref entry is not found', async () => {
			FileRefs.getRefEntryByQuery.mockRejectedValueOnce(templates.fileNotFound);

			await expect(FilesManager.getFileWithMetaAsStream(
				teamspace, collection, fileName, meta,
			)).rejects.toEqual(templates.fileNotFound);
		});

		test('should return a stream if the reference is found', async () => {
			const fileEntry = { size: 100, type: 'fs', link: generateRandomString() };
			const readStream = { [generateRandomString()]: generateRandomString() };
			FileRefs.getRefEntryByQuery.mockResolvedValueOnce(fileEntry);
			FSHandler.getFileStream.mockResolvedValueOnce(readStream);

			await expect(FilesManager.getFileWithMetaAsStream(teamspace, collection, fileName))
				.resolves.toEqual({ readStream, size: fileEntry.size, mimeType: DEFAULT_MIME_TYPE });

			expect(FSHandler.getFileStream).toHaveBeenCalledTimes(1);
			expect(FSHandler.getFileStream).toHaveBeenCalledWith(fileEntry.link, undefined);
		});

		test('should return a stream of the reference is found (gridFs)', async () => {
			const fileEntry = { size: 100, type: 'gridfs', link: generateRandomString() };
			const readStream = { [generateRandomString()]: generateRandomString() };
			FileRefs.getRefEntryByQuery.mockResolvedValueOnce(fileEntry);
			GridFSHandler.getFileStream.mockResolvedValueOnce(readStream);

			await expect(FilesManager.getFileWithMetaAsStream(teamspace, collection, fileName))
				.resolves.toEqual({ readStream, size: fileEntry.size, mimeType: DEFAULT_MIME_TYPE });

			expect(GridFSHandler.getFileStream).toHaveBeenCalledTimes(1);
			expect(GridFSHandler.getFileStream).toHaveBeenCalledWith(teamspace, collection, fileEntry.link, undefined);
		});
	});
};

const storeFileTestHelper = (multipleFiles) => {
	const nEntries = multipleFiles ? 10 : 1;
	test('should throw error if the default type is not recognised', async () => {
		const { defaultStorage } = config;
		config.defaultStorage = 'unrecognised storage type';

		const entries = times(nEntries, () => ({
			id: generateRandomString(),
			data: generateRandomString(),
			meta: generateRandomObject(),
		}));

		const testProm = multipleFiles ? FilesManager.storeFiles(
			generateRandomString(), generateRandomString(), entries)
			: FilesManager.storeFile(
				generateRandomString(), generateRandomString(), entries[0].id, entries[0].data, entries[0].meta);

		await expect(testProm).rejects.toEqual(templates.unknown);

		config.defaultStorage = defaultStorage;
	});

	test('should store file if default storage type is fs', async () => {
		const { defaultStorage } = config;
		config.defaultStorage = 'fs';

		const refInfo = generateRandomObject();

		const entries = times(nEntries, () => ({
			id: generateRandomString(),
			data: generateRandomString(),
			meta: generateRandomObject(),
		}));

		FSHandler.storeFile.mockResolvedValue(refInfo);
		const teamspace = generateRandomString();
		const collection = generateRandomString();

		const testProm = multipleFiles ? FilesManager.storeFiles(
			teamspace, collection, entries)
			: FilesManager.storeFile(
				teamspace, collection, entries[0].id, entries[0].data, entries[0].meta);

		await expect(testProm).resolves.toEqual(undefined);

		expect(FSHandler.storeFile).toHaveBeenCalledTimes(entries.length);
		const expectedInsertRefsParam = entries.map(({ id, meta, data }) => {
			expect(FSHandler.storeFile).toHaveBeenCalledWith(data);
			return { ...meta, _id: id, ...refInfo, mimeType: DEFAULT_MIME_TYPE };
		});

		expect(FileRefs.insertManyRefs).toHaveBeenCalledTimes(1);
		expect(FileRefs.insertManyRefs).toHaveBeenCalledWith(teamspace, collection,
			expectedInsertRefsParam);

		config.defaultStorage = defaultStorage;
	});

	test('should store file if default storage type is gridfs', async () => {
		const { defaultStorage } = config;
		config.defaultStorage = 'gridfs';

		const refInfo = generateRandomObject();

		const entries = times(nEntries, () => ({
			id: generateRandomString(),
			data: generateRandomString(),
		}));

		GridFSHandler.storeFile.mockResolvedValue(refInfo);
		const teamspace = generateRandomString();
		const collection = generateRandomString();

		const testProm = multipleFiles ? FilesManager.storeFiles(
			teamspace, collection, entries)
			: FilesManager.storeFile(
				teamspace, collection, entries[0].id, entries[0].data);

		await expect(testProm).resolves.toEqual(undefined);

		expect(GridFSHandler.storeFile).toHaveBeenCalledTimes(entries.length);

		const expectedInsertRefsParam = entries.map(({ data, id }) => {
			expect(GridFSHandler.storeFile).toHaveBeenCalledWith(teamspace, collection, data);
			return { _id: id, ...refInfo, mimeType: DEFAULT_MIME_TYPE };
		});
		expect(FileRefs.insertManyRefs).toHaveBeenCalledTimes(1);
		expect(FileRefs.insertManyRefs).toHaveBeenCalledWith(teamspace, collection,
			expectedInsertRefsParam);

		config.defaultStorage = defaultStorage;
	});
};
const testStoreFile = () => {
	describe('Store file in fileshare', () => {
		storeFileTestHelper(false);
	});
};

const testStoreFiles = () => {
	describe('Store multiple files in fileshare', () => {
		storeFileTestHelper(true);
	});
};

const testStoreFileStream = () => {
	describe('Store file stream in fileshare', () => {
		test('should throw error if the default type is not recognised', async () => {
			const { defaultStorage } = config;
			config.defaultStorage = 'unrecognised storage type';

			await expect(FilesManager.storeFileStream(
				generateRandomString(),
				generateRandomString(),
				generateRandomString(),
			)).rejects.toEqual(templates.unknown);

			config.defaultStorage = defaultStorage;
		});

		test('should throw error if the default type is gridfs', async () => {
			const { defaultStorage } = config;
			config.defaultStorage = 'gridfs';

			await expect(FilesManager.storeFileStream(
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
			const stream = PassThrough();

			const execProm = expect(FilesManager.storeFileStream(teamspace, collection, id, stream))
				.resolves.toEqual(undefined);

			stream.write(data);
			stream.end();

			await execProm;

			expect(FSHandler.storeFileStream).toHaveBeenCalledTimes(1);
			expect(FSHandler.storeFileStream).toHaveBeenCalledWith(stream);
			expect(FileRefs.insertRef).toHaveBeenCalledTimes(1);
			expect(FileRefs.insertRef).toHaveBeenCalledWith(teamspace, collection,
				{ ...refInfo, _id: id, mimeType: DEFAULT_MIME_TYPE });

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
			const ts = generateRandomString();
			const collection = generateRandomString();

			const filename = generateRandomString();
			await expect(FilesManager.fileExists(ts, collection, filename)).resolves.toEqual(true);
			expect(FileRefs.getRefEntry).toHaveBeenCalledTimes(1);
			expect(FileRefs.getRefEntry).toHaveBeenCalledWith(ts, collection, filename);

			config.defaultStorage = defaultStorage;
		});

		test('should return false if file does not exist', async () => {
			FileRefs.getRefEntry.mockRejectedValueOnce(templates.fileNotFound);
			const ts = generateRandomString();
			const collection = generateRandomString();
			const filename = generateRandomString();
			await expect(FilesManager.fileExists(ts, collection, filename)).resolves.toEqual(false);
			expect(FileRefs.getRefEntry).toHaveBeenCalledTimes(1);
			expect(FileRefs.getRefEntry).toHaveBeenCalledWith(ts, collection, filename);
		});
	});
};

const testRemoveFilesWithMeta = () => {
	describe('Remove files with meta', () => {
		const meta = { [generateRandomString()]: generateRandomString() };
		const teamspace = generateRandomString();
		const collection = generateRandomString();
		test('Should remove all files that satisfy the query', async () => {
			const expectedRefs = times(3, () => ({ _id: generateRandomString(), type: 'fs', link: generateRandomString() }));
			FileRefs.getRefsByQuery.mockResolvedValueOnce(expectedRefs);

			await FilesManager.removeFilesWithMeta(teamspace, collection, meta);

			expect(FileRefs.getRefsByQuery).toHaveBeenCalledTimes(1);
			expect(FileRefs.getRefsByQuery).toHaveBeenCalledWith(teamspace, collection, meta);

			expect(FSHandler.removeFiles).toHaveBeenCalledTimes(1);
			expect(FSHandler.removeFiles).toHaveBeenCalledWith(expectedRefs.map(({ link }) => link));

			expect(FileRefs.removeRefsByQuery).toHaveBeenCalledTimes(1);
			expect(FileRefs.removeRefsByQuery).toHaveBeenCalledWith(teamspace, collection, meta);
		});

		test('Should do nothing if no files are found', async () => {
			FileRefs.getRefsByQuery.mockResolvedValueOnce([]);

			await FilesManager.removeFilesWithMeta(teamspace, collection, meta);

			expect(FileRefs.getRefsByQuery).toHaveBeenCalledTimes(1);
			expect(FileRefs.getRefsByQuery).toHaveBeenCalledWith(teamspace, collection, meta);

			expect(FSHandler.removeFiles).not.toHaveBeenCalled();
			expect(FileRefs.removeRefsByQuery).not.toHaveBeenCalled();
		});

		test('Should manage non file refs properly', async () => {
			const expectedRefs = times(3, () => ({ _id: generateRandomString(), type: 'fs', link: generateRandomString() }));
			FileRefs.getRefsByQuery.mockResolvedValueOnce(expectedRefs);

			expectedRefs.push({ _id: generateRandomString(), type: 'http', link: generateRandomString() });
			expectedRefs.push({ _id: generateRandomString(), type: 'gridfs', link: generateRandomString() });

			await FilesManager.removeFilesWithMeta(teamspace, collection, meta);

			expect(FileRefs.getRefsByQuery).toHaveBeenCalledTimes(1);
			expect(FileRefs.getRefsByQuery).toHaveBeenCalledWith(teamspace, collection, meta);

			expect(FSHandler.removeFiles).toHaveBeenCalledTimes(1);
			expect(FSHandler.removeFiles).toHaveBeenCalledWith(expectedRefs.flatMap(({ type, link }) => (type === 'fs' ? link : [])));

			expect(GridFSHandler.removeFiles).toHaveBeenCalledTimes(1);
			expect(GridFSHandler.removeFiles).toHaveBeenCalledWith(teamspace, collection, expectedRefs.flatMap(({ type, link }) => (type === 'gridfs' ? link : [])));

			expect(FileRefs.removeRefsByQuery).toHaveBeenCalledTimes(1);
			expect(FileRefs.removeRefsByQuery).toHaveBeenCalledWith(teamspace, collection, meta);
		});
	});
};

const testGetMD5FileHash = () => {
	describe('Get a file\'s MD5 hash', () => {
		const mockId = Buffer.from('testBuffer');
		const mockRefEntry = { type: 'fs', link: 'mockLink', size: 100 };
		test('it should create the MD5 hash if it has not been chached', async () => {
			FileRefs.getRefEntry.mockImplementation(() => mockRefEntry);
			FSHandler.getFile.mockResolvedValueOnce(mockId);

			const wordArray = CryptoJS.lib.WordArray.create(mockId);
			await expect(FilesManager.getMD5FileHash('teamspace', 'container', 'filename')).resolves.toEqual({ hash: CryptoJS.MD5(wordArray).toString(), size: 100 });

			expect(FileRefs.getRefEntry).toHaveBeenCalledTimes(2);
			expect(FSHandler.getFile).toHaveBeenCalledTimes(1);
			expect(FileRefs.updateRef).toHaveBeenCalledTimes(1);
		});
		test('it should return straight away if the MD5 has has been cached', async () => {
			const mockRef = { ...mockRefEntry, md5Hash: generateRandomString() };
			FileRefs.getRefEntry.mockResolvedValueOnce(mockRef);

			await expect(FilesManager.getMD5FileHash('teamspace', 'container', 'filename')).resolves.toEqual({ hash: mockRef.md5Hash, size: mockRef.size });

			expect(FileRefs.getRefEntry).toHaveBeenCalledTimes(1);
			expect(FSHandler.getFile).toHaveBeenCalledTimes(0);
			expect(FileRefs.updateRef).toHaveBeenCalledTimes(0);
		});
	});
};

describe('services/filesManager', () => {
	testRemoveFilesWithMeta();
	testRemoveAllFilesFromModel();
	testRemoveAllFilesFromTeamspace();
	testGetFile();
	testGetFileAsStream();
	testGetFileWithMetaAsStream();
	testStoreFile();
	testStoreFiles();
	testStoreFileStream();
	testFileExists();
	testGetMD5FileHash();
});
