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

const { determineTestGroup } = require('../../../../../../helper/utils');
const { times } = require('lodash');
const { src } = require('../../../../../../helper/path');
const { generateRandomString, generateUUID } = require('../../../../../../helper/services');

const { stringToUUID } = require(`${src}/utils/helper/uuids`);

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
		test('should return the data getMetadataByQuery returns in the correct format', async () => {
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

			MetadataModel.getMetadataByQuery.mockResolvedValueOnce(metadata);

			const res = await Metadata.getAllMetadata(teamspace, container, revision);

			expect(res).toEqual(metadata);
			expect(MetadataModel.getMetadataByQuery).toHaveBeenCalledTimes(1);
			expect(MetadataModel.getMetadataByQuery).toHaveBeenCalledWith(teamspace, container, { rev_id: revision, type: 'meta' }, { metadata: 1, parents: 1 });
		});

		test('should return the data getMetadataByQuery returns (meta with just id)', async () => {
			const teamspace = generateRandomString();
			const container = generateRandomString();
			const revision = generateUUID();
			const metadata = times(10, () => ({ _id: generateUUID() }));

			MetadataModel.getMetadataByQuery.mockResolvedValueOnce(metadata);

			const res = await Metadata.getAllMetadata(teamspace, container, revision);

			expect(res).toEqual(metadata);
			expect(MetadataModel.getMetadataByQuery).toHaveBeenCalledTimes(1);
			expect(MetadataModel.getMetadataByQuery).toHaveBeenCalledWith(teamspace, container, { rev_id: revision, type: 'meta' }, { metadata: 1, parents: 1 });
		});
	});
};

const getMetadataById = () => {
	describe('Get metadata by id', () => {
		test('should return the data getMetadataByQuery returns in the correct format', async () => {
			const teamspace = generateRandomString();
			const container = generateRandomString();
			const revision = generateUUID();
			const metadataId = generateUUID();
			const metadata = [{
				_id: generateUUID(),
				shared_id: generateUUID(),
				paths: [generateUUID()],
				type: generateRandomString(),
				api: generateRandomString(),
				rev_id: generateUUID(),
				metadata: times(5, () => ({
					key: generateRandomString(),
					value: generateRandomString(),
				})),
			}];

			MetadataModel.getMetadataByQuery.mockResolvedValueOnce(metadata);

			const res = await Metadata.getMetadataById(teamspace, container, revision, stringToUUID(metadataId));

			expect(res).toEqual(metadata);
			expect(MetadataModel.getMetadataByQuery).toHaveBeenCalledTimes(1);
			expect(MetadataModel.getMetadataByQuery).toHaveBeenCalledWith(teamspace, container,
				{ _id: stringToUUID(metadataId), rev_id: revision },
				{ shared_id: 0, paths: 0, type: 0, api: 0, parents: 0, rev_id: 0 });
		});

		test('should return the data getMetadataByQuery returns (metadata with just id)', async () => {
			const teamspace = generateRandomString();
			const container = generateRandomString();
			const revision = generateUUID();
			const metadataId = generateUUID();
			const metadata = [{ _id: generateUUID() }];

			MetadataModel.getMetadataByQuery.mockResolvedValueOnce(metadata);

			const res = await Metadata.getMetadataById(teamspace, container, revision, stringToUUID(metadataId));

			expect(res).toEqual(metadata);
			expect(MetadataModel.getMetadataByQuery).toHaveBeenCalledTimes(1);
			expect(MetadataModel.getMetadataByQuery).toHaveBeenCalledWith(teamspace, container,
				{ _id: stringToUUID(metadataId), rev_id: revision },
				{ shared_id: 0, paths: 0, type: 0, api: 0, parents: 0, rev_id: 0 });
		});
	});
};

describe(determineTestGroup(__filename), () => {
	testUpdateCustomMetadata();
	getMetadata();
	getMetadataById();
});
