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

jest.mock('../../../../../../../../../src/v5/models/metadata');
const Metadata = require(`${src}/models/metadata`);

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

			expect(output.join('')).toBe(`{"subTrees": [],"mainTree": ${fileContent}}`);

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

const getMetadata = () => {
	describe('Get metadata', () => {
		test('should return with a stream of the expected data', async () => {
			const teamspace = generateRandomString();
			const container = generateRandomString();
			const revision = generateUUID();

			const metadata = times(10, () => ({
				_id: generateUUID(),
				parents: [generateUUID(), generateUUID()],
				metadata: times(5, () => ({
					key: generateRandomString(),
					value: generateRandomString(),
				})),
			}));

			const castedMetadata = metadata.map((entry) => ({
				_id: UUIDToString(entry._id),
				parents: entry.parents.map(UUIDToString),
				metadata: entry.metadata.reduce((acc, { key, value }) => {
					acc[key] = value;
					return acc;
				}, {}),
			}));

			Metadata.getMetadataByQuery.mockResolvedValueOnce(metadata);

			const resultStream = await JsonAssets.getMetadata(teamspace, container, revision);

			const output = [];
			resultStream.on('data', (d) => output.push(d.toString()));
			await new Promise((resolve) => resultStream.on('end', resolve));

			expect(output.join('')).toBe(`{"data":${JSON.stringify(castedMetadata)}}`);

			expect(Metadata.getMetadataByQuery).toHaveBeenCalledTimes(1);
			expect(Metadata.getMetadataByQuery).toHaveBeenCalledWith(teamspace, container, { rev_id: revision, type: 'meta' }, { metadata: 1, parents: 1 });
		});

		test('should return with a stream of the expected data when metadata just have id', async () => {
			const teamspace = generateRandomString();
			const container = generateRandomString();
			const revision = generateUUID();

			const metadata = times(10, () => ({ _id: generateUUID() }));
			const castedMetadata = metadata.map((entry) => ({ _id: UUIDToString(entry._id) }));

			Metadata.getMetadataByQuery.mockResolvedValueOnce(metadata);

			const resultStream = await JsonAssets.getMetadata(teamspace, container, revision);

			const output = [];
			resultStream.on('data', (d) => output.push(d.toString()));
			await new Promise((resolve) => resultStream.on('end', resolve));

			expect(output.join('')).toBe(`{"data":${JSON.stringify(castedMetadata)}}`);

			expect(Metadata.getMetadataByQuery).toHaveBeenCalledTimes(1);
			expect(Metadata.getMetadataByQuery).toHaveBeenCalledWith(teamspace, container, { rev_id: revision, type: 'meta' }, { metadata: 1, parents: 1 });
		});
	});
};

describe(determineTestGroup(__filename), () => {
	testGetTree();
	getMetadata();
});
