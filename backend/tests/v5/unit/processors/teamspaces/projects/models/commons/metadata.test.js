/**
 *  Copyright (C) 2022 3D Repo Ltd
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

const { times } = require('lodash');
const { src } = require('../../../../../../helper/path');
const { generateRandomString, generateUUID } = require('../../../../../../helper/services');

const { UUIDToString } = require(`${src}utils/helper/uuids`);
const Metadata = require(`${src}/processors/teamspaces/projects/models/commons/metadata`);
jest.mock('../../../../../../../../src/v5/models/metadata');
const MetadataModel = require(`${src}/models/metadata`);

const testUpdateCustomMetadata = () => {
	describe('Update metadata', () => {
		test('should update the metadata of a container', async () => {
			const teamspace = generateRandomString();
			const project = generateRandomString();
			const container = generateRandomString();
			const dataToUpdate = [{ key: generateRandomString(), value: generateRandomString() }];

			await expect(Metadata.updateCustomMetadata(teamspace, project, container, dataToUpdate));
			expect(MetadataModel.updateCustomMetadata).toHaveBeenCalledTimes(1);
			expect(MetadataModel.updateCustomMetadata).toHaveBeenCalledWith(teamspace, project, container,
				dataToUpdate);
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

			const resultStream = await Metadata.getMetadata(teamspace, container, revision);

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

			const resultStream = await Metadata.getMetadata(teamspace, container, revision);

			const output = [];
			resultStream.on('data', (d) => output.push(d.toString()));
			await new Promise((resolve) => resultStream.on('end', resolve));

			expect(output.join('')).toBe(`{"data":${JSON.stringify(castedMetadata)}}`);

			expect(Metadata.getMetadataByQuery).toHaveBeenCalledTimes(1);
			expect(Metadata.getMetadataByQuery).toHaveBeenCalledWith(teamspace, container, { rev_id: revision, type: 'meta' }, { metadata: 1, parents: 1 });
		});
	});
};

describe('processors/teamspaces/projects/models/metadata', () => {
	testUpdateCustomMetadata();
	getMetadata();
});
