/**
 *  Copyright (C) 2025 3D Repo Ltd
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
const { readFile, writeFile, access, rm } = require('fs/promises');
const Path = require('path');

const { createTmpDir, determineTestGroup, generateRandomString } = require('../../helper/services');
const { Readable } = require('stream');
const { times } = require('lodash');

const { createResponseCode, templates } = require(`${src}/utils/responseCodes`);

const FSHandler = require(`${src}/handler/fs`);

const tmpDir = createTmpDir();
const name = generateRandomString();

const config = { path: tmpDir, levels: 2, name };

const testConstructor = () => {
	describe.each([
		['with valid config', config, true],
		['with valid read only config', { path: tmpDir, readOnly: true, name }, true],
		['with path missing', { levels: 2, name }, false],
		['with level missing', { path: tmpDir, name }, true],
		['with level is smaller than 0', { path: tmpDir, levels: -1, name }, false],
		['with name missing', { path: tmpDir, levels: 2 }, false],
		['with unreachable path', { path: '/unreachable/path', name, levels: 2 }, false],
	])('Constructor', (desc, testConfig, success) => {
		test((`Should ${success ? 'succeed' : 'throw an error'} if ${desc}`), async () => {
			if (success) {
				await expect(FSHandler(testConfig)).resolves.not.toBeUndefined();
			} else {
				await expect(FSHandler(testConfig)).rejects.not.toBeUndefined();
			}
		});
	});
};

const testStoreFile = () => {
	const fileContent = generateRandomString(1024);
	describe('Store file', () => {
		test('Should store file successfully', async () => {
			const fsHandler = await FSHandler(config);
			const ret = await fsHandler.storeFile(Buffer.from(fileContent));
			expect(ret).toEqual({
				_id: expect.any(String), link: expect.any(String), size: fileContent.length, type: name });

			const storedContent = await readFile(Path.posix.join(tmpDir, ret.link));
			expect(storedContent.toString()).toBe(fileContent);

			expect(ret.link.split('/').length).toBe(3); // 2 levels + file
		});

		test('Should store file successfully (no level)', async () => {
			const fsHandler = await FSHandler({ ...config, levels: 0 });

			const ret = await fsHandler.storeFile(Buffer.from(fileContent));

			expect(ret).toEqual({
				_id: expect.any(String), link: expect.any(String), size: fileContent.length, type: name });

			const storedContent = await readFile(Path.posix.join(tmpDir, ret.link));
			expect(storedContent.toString()).toBe(fileContent);

			expect(ret.link.split('/').length).toBe(1); // 0 levels + file
		});

		test('Should fail to store file when in read only mode', async () => {
			const fsHandler = await FSHandler({ ...config, readOnly: true });
			await expect(fsHandler.storeFile(Buffer.from(fileContent))).rejects.toEqual(
				createResponseCode(templates.unknown, 'Trying to write to a read-only filesystem'));
		});
	});
};

const testStoreFileStream = () => {
	const fileContent = generateRandomString(1024);
	describe('Store file stream', () => {
		const createStream = () => Readable.from(Buffer.from(fileContent));
		test('Should store file successfully', async () => {
			const fsHandler = await FSHandler(config);
			const ret = await fsHandler.storeFileStream(createStream());
			expect(ret).toEqual({
				_id: expect.any(String), link: expect.any(String), size: fileContent.length, type: name });

			const storedContent = await readFile(Path.posix.join(tmpDir, ret.link));
			expect(storedContent.toString()).toBe(fileContent);

			expect(ret.link.split('/').length).toBe(3); // 2 levels + file
		});

		test('Should store file successfully (no level)', async () => {
			const fsHandler = await FSHandler({ ...config, levels: 0 });

			const ret = await fsHandler.storeFileStream(createStream());

			expect(ret).toEqual({
				_id: expect.any(String), link: expect.any(String), size: fileContent.length, type: name });

			const storedContent = await readFile(Path.posix.join(tmpDir, ret.link));
			expect(storedContent.toString()).toBe(fileContent);

			expect(ret.link.split('/').length).toBe(1); // 0 levels + file
		});

		test('Should fail to store file when in read only mode', async () => {
			const fsHandler = await FSHandler({ ...config, readOnly: true });
			await expect(fsHandler.storeFileStream(createStream())).rejects.toEqual(
				createResponseCode(templates.unknown, 'Trying to write to a read-only filesystem'));
		});
	});
};

const testGetFile = () => {
	const fileContent = generateRandomString(1024);
	const link = generateRandomString();
	describe('Get file', () => {
		beforeAll(async () => {
			await writeFile(Path.posix.join(tmpDir, link), fileContent);
		});
		test('Should get file successfully', async () => {
			const fsHandler = await FSHandler(config);
			const data = await fsHandler.getFile(link);
			expect(data.toString()).toBe(fileContent);
		});

		test('Should fail to get non existing file', async () => {
			const fsHandler = await FSHandler(config);
			await expect(fsHandler.getFile('non-existing-file')).rejects.toEqual(templates.fileNotFound);
		});
	});
};

const testGetFileStream = () => {
	const fileContent = generateRandomString(1024);
	const link = generateRandomString();
	describe('Get file stream', () => {
		const streamToBuffer = async (stream) => new Promise((resolve, reject) => {
			const chunks = [];
			stream.on('data', (chunk) => {
				chunks.push(chunk);
			});
			stream.on('end', () => {
				resolve(Buffer.concat(chunks));
			});
			stream.on('error', (err) => {
				reject(err);
			});
		});
		beforeAll(async () => {
			await writeFile(Path.posix.join(tmpDir, link), fileContent);
		});
		test('Should get file stream successfully', async () => {
			const fsHandler = await FSHandler(config);
			const stream = await fsHandler.getFileStream(link);
			const data = await streamToBuffer(stream);
			expect(data.toString()).toBe(fileContent);
		});

		test('Should get a chunk of the file through streaming successfully', async () => {
			const fsHandler = await FSHandler(config);
			const stream = await fsHandler.getFileStream(link, { start: 100, end: 199 });
			const data = await streamToBuffer(stream);
			expect(data.toString()).toBe(fileContent.slice(100, 200));
		});

		test('Should fail to get non existing file stream', async () => {
			const fsHandler = await FSHandler(config);
			await expect(fsHandler.getFileStream('non-existing-file')).rejects.toEqual(templates.fileNotFound);
		});
	});
};

const testRemoveFiles = () => {
	const fileContent = generateRandomString(1024);
	const links = times(3, () => generateRandomString());
	describe('Remove files', () => {
		beforeEach(async () => {
			await Promise.all(links.map((link) => writeFile(Path.posix.join(tmpDir, link), fileContent)));
		});
		test('Should remove files successfully', async () => {
			const fsHandler = await FSHandler(config);
			await expect(fsHandler.removeFiles(links)).resolves.toBeUndefined();

			await Promise.all(links.map(async (link) => {
				await expect(access(Path.posix.join(tmpDir, link))).rejects.toBeDefined();
			}));
		});
		test('Should not fail when removing non existing files', async () => {
			const fsHandler = await FSHandler(config);
			await expect(fsHandler.removeFiles(['non-existing-file-1', 'non-existing-file-2'])).resolves.toBeUndefined();
		});

		test('should fail if the file handler is read only', async () => {
			const fsHandler = await FSHandler({ ...config, readOnly: true });
			await expect(fsHandler.removeFiles(links)).rejects.toEqual(
				createResponseCode(templates.unknown, 'Trying to remove a file in a read-only filesystem'));
		});
	});
};

describe(determineTestGroup(__filename), () => {
	afterAll(async () => {
		// remove the tmp directory
		await rm(tmpDir, { recursive: true, force: true });
	});
	testConstructor();
	testStoreFile();
	testStoreFileStream();
	testGetFile();
	testGetFileStream();
	testRemoveFiles();
});
