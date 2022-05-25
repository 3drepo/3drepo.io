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

const { src } = require('../../../../../helper/path');
const { generateRandomString } = require('../../../../../helper/services');

const Metadata = require(`${src}/processors/teamspaces/projects/models/metadata`);

jest.mock('../../../../../../../src/v5/models/metadata');
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

describe('processors/teamspaces/projects/models/metadata', () => {
	testUpdateCustomMetadata();
});
