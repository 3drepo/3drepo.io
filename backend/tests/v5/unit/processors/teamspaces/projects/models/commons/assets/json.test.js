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

const { PassThrough } = require('stream');
const { src } = require('../../../../../../../helper/path');
const {
	determineTestGroup,
	generateRandomString,
	generateUUID,
	generateRandomObject,
} = require('../../../../../../../helper/services');
const { times } = require('lodash');

const { UUIDToString } = require(`${src}/utils/helper/uuids`);

jest.mock('../../../../../../../../../src/v5/services/filesManager');
const FilesManager = require(`${src}/services/filesManager`);

const JsonAssets = require(`${src}/processors/teamspaces/projects/models/commons/assets/json`);

const { templates } = require(`${src}/utils/responseCodes`);

const JSON_STASH_COL = '.stash.json_mpc.ref';

const testGetTree = () => {
	describe('Get tree', () => {
		test('should return with a stream of the expected data', async () => {
			const teamspace = generateRandomString();
			const container = generateRandomString();
			const revision = generateUUID();
			const fileContent = JSON.stringify(generateRandomObject());

			FilesManager.getFileAsStream.mockImplementationOnce(() => {
				const fakeReadStream = PassThrough();
				fakeReadStream.write(fileContent);

				fakeReadStream.end();
				return Promise.resolve({
					readStream: fakeReadStream,
				});
			});

			const resultStream = await JsonAssets.getTree(teamspace, container, revision);

			const output = [];
			resultStream.on('data', (d) => output.push(d.toString()));

			await new Promise((resolve) => resultStream.on('end', resolve));

			expect(output.join('')).toBe(`{"subTree": [],"mainTree": ${fileContent}}`);

			expect(FilesManager.getFileAsStream).toHaveBeenCalledTimes(1);
			expect(FilesManager.getFileAsStream).toHaveBeenCalledWith(
				teamspace,
				`${container}${JSON_STASH_COL}`,
				`${UUIDToString(revision)}/fulltree.json`,
			);
		});

		test('should throw error file was not found', async () => {
			const teamspace = generateRandomString();
			const container = generateRandomString();
			const revision = generateUUID();

			FilesManager.getFileAsStream.mockRejectedValueOnce(templates.fileNotFound);

			await expect(JsonAssets.getTree(teamspace, container, revision))
				.rejects.toEqual(templates.fileNotFound);

			expect(FilesManager.getFileAsStream).toHaveBeenCalledTimes(1);
			expect(FilesManager.getFileAsStream).toHaveBeenCalledWith(
				teamspace,
				`${container}${JSON_STASH_COL}`,
				`${UUIDToString(revision)}/fulltree.json`);
		});

		test('should emit the error signal on the returned stream if something went wrong', async () => {
			const teamspace = generateRandomString();
			const container = generateRandomString();
			const revision = generateUUID();
			const fileContent = JSON.stringify(generateRandomObject());

			FilesManager.getFileAsStream.mockImplementationOnce(() => {
				const fakeReadStream = PassThrough();
				fakeReadStream.write(fileContent);

				fakeReadStream.emit('error', new Error());
				fakeReadStream.end();

				return Promise.resolve({
					readStream: fakeReadStream,
				});
			});

			await expect(JsonAssets.getTree(teamspace, container, revision)).rejects.not.toBeUndefined();

			expect(FilesManager.getFileAsStream).toHaveBeenCalledTimes(1);
			expect(FilesManager.getFileAsStream).toHaveBeenCalledWith(
				teamspace,
				`${container}${JSON_STASH_COL}`,
				`${UUIDToString(revision)}/fulltree.json`,
			);
		});
	});
};

const testGetAssetProperties = () => {
	describe.each([
		['should return with a stream of the expected data (no submodels)', 0],
		['should return with a stream of default data if no file has been found (no subModel)', 0, true],
		['should return with a stream of default data if no file has been found (with subModel)', 3, true],
		['should return with a stream of the expected data (with submodels)', 3],
		['should return with a stream of the expected data if some submodels failed (with submodels)', 3, false, [true, false, true]],
		['should return with a stream of the expected data if all submodels failed (with submodels)', 1, false, [true]],
	])('Get asset properties', (desc, nSubModels, throwOnMain, throwOnSubModels = []) => {
		test(desc, async () => {
			const teamspace = generateRandomString();
			const container = generateRandomString();
			const revision = generateUUID();
			const fileObj = generateRandomObject();

			const subModels = times(nSubModels, () => ({
				container: generateRandomString(),
				revision: generateUUID(),
			}));

			const implementFilestreamMock = () => {
				FilesManager.getFileAsStream.mockImplementationOnce(() => {
					const fakeReadStream = PassThrough();
					fakeReadStream.write(JSON.stringify(fileObj));
					fakeReadStream.end();
					return Promise.resolve({
						readStream: fakeReadStream,
					});
				});
			};

			if (throwOnMain) {
				FilesManager.getFileAsStream.mockRejectedValueOnce(templates.fileNotFound);
			} else {
				implementFilestreamMock();
			}

			subModels.forEach((subModel, index) => {
				if (throwOnSubModels[index]) {
					FilesManager.getFileAsStream.mockRejectedValueOnce(templates.fileNotFound);
				} else {
					implementFilestreamMock();
				}
			});

			const resultStream = await JsonAssets.getAssetProperties(teamspace, container,
				revision, nSubModels === 0 ? undefined : subModels);

			const output = [];
			resultStream.on('data', (d) => output.push(d.toString()));

			await new Promise((resolve) => resultStream.on('end', resolve));

			const expectedMainContent = throwOnMain
				? JSON.stringify({ hiddenNodes: [] }) : JSON.stringify(fileObj);
			const subModelContent = subModels.flatMap(({ container: containerId }, i) => (throwOnSubModels[i]
				? []
				: JSON.stringify({ account: teamspace, model: containerId, ...fileObj })));

			expect(output.join('')).toBe(`{"properties": ${expectedMainContent},"subModels":[${subModelContent.join(',')}]}`);

			expect(FilesManager.getFileAsStream).toHaveBeenCalledTimes(nSubModels + 1);
			expect(FilesManager.getFileAsStream).toHaveBeenCalledWith(
				teamspace,
				`${container}${JSON_STASH_COL}`,
				`${UUIDToString(revision)}/modelProperties.json`,
			);
			subModels.forEach(({ container: containerId, revision: revId }) => {
				expect(FilesManager.getFileAsStream).toHaveBeenCalledWith(
					teamspace,
					`${containerId}${JSON_STASH_COL}`,
					`${UUIDToString(revId)}/modelProperties.json`,
				);
			});
		});
	});
};

const testGetSupermeshMapping = () => {
	describe.each([
		['should return with a stream of the expected data (no submodels)', 0],
		['should return with a stream of default data if no file has been found (no subModel)', 0, true],
		['should return with a stream of the expected data (with submodels)', 3],
		['should return with a stream of the expected data if some submodels failed (with submodels)', 3, false, [true, false, true]],
		['should return with a stream of the expected data if all submodels failed (with submodels)', 1, false, [true]],
	])('Get supermesh mapping', (desc, nSubModels, throwOnMain, throwOnSubModels = []) => {
		test(desc, async () => {
			const teamspace = generateRandomString();
			const container = generateRandomString();
			const revision = generateUUID();
			const fileObj = generateRandomObject();

			const subModels = times(nSubModels, () => ({
				container: generateRandomString(),
				revision: generateUUID(),
			}));

			const implementFilestreamMock = () => {
				FilesManager.getFileAsStream.mockImplementationOnce(() => {
					const fakeReadStream = PassThrough();
					fakeReadStream.write(JSON.stringify(fileObj));
					fakeReadStream.end();
					return Promise.resolve({
						readStream: fakeReadStream,
					});
				});
			};

			if (nSubModels === 0) {
				if (throwOnMain) {
					FilesManager.getFileAsStream.mockRejectedValueOnce(templates.fileNotFound);
				} else {
					implementFilestreamMock();
				}
			}

			subModels.forEach((subModel, index) => {
				if (throwOnSubModels[index]) {
					FilesManager.getFileAsStream.mockRejectedValueOnce(templates.fileNotFound);
				} else {
					implementFilestreamMock();
				}
			});

			const fnProm = JsonAssets.getSupermeshMapping(teamspace, container,
				revision, nSubModels === 0 ? undefined : subModels);
			if (throwOnMain) {
				expect(fnProm).rejects.toEqual(templates.fileNotFound);
			} else {
				const resultStream = await fnProm;
				const outputChunks = [];
				resultStream.on('data', (d) => outputChunks.push(d.toString()));

				await new Promise((resolve) => resultStream.on('end', resolve));

				const output = outputChunks.join('');

				if (nSubModels === 0) {
					expect(output).toEqual(JSON.stringify(fileObj));
				} else {
					const subModelContent = subModels.flatMap((data, i) => (throwOnSubModels[i]
						? []
						: fileObj));
					expect(output).toEqual(JSON.stringify({
						submodels: subModelContent,
					}));
				}
			}

			expect(FilesManager.getFileAsStream).toHaveBeenCalledTimes(nSubModels === 0 ? 1 : nSubModels);
			if (nSubModels === 0) {
				expect(FilesManager.getFileAsStream).toHaveBeenCalledWith(
					teamspace,
					`${container}${JSON_STASH_COL}`,
					`${UUIDToString(revision)}/supermeshes.json`,
				);
			} else {
				subModels.forEach(({ container: containerId, revision: revId }) => {
					expect(FilesManager.getFileAsStream).toHaveBeenCalledWith(
						teamspace,
						`${containerId}${JSON_STASH_COL}`,
						`${UUIDToString(revId)}/supermeshes.json`,
					);
				});
			}
		});
	});
};

describe(determineTestGroup(__filename), () => {
	testGetTree();
	testGetAssetProperties();
	testGetSupermeshMapping();
});
