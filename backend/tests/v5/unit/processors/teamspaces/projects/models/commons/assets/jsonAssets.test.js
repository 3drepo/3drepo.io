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

const { src } = require('../../../../../../../helper/path');
const {
	determineTestGroup,
	generateRandomString,
	generateRandomObject,
} = require('../../../../../../../helper/services');

jest.mock('../../../../../../../../../src/v5/models/revisions');
const Revisions = require(`${src}/models/revisions`);

jest.mock('../../../../../../../../../src/v5/services/filesManager');
const FilesManager = require(`${src}/services/filesManager`);

const JsonAssets = require(`${src}/processors/teamspaces/projects/models/commons/assets/jsonAssets`);

const { templates } = require(`${src}/utils/responseCodes`);
const { modelTypes } = require(`${src}/models/modelSettings.constants`);

const testGetContainerTree = () => {
	describe('Get container tree', () => {
		test('should call getFileAsStream with the provided revision', async () => {
			const file = generateRandomObject();
			const teamspace = generateRandomString();
			const container = generateRandomString();
			const revId = generateRandomString();

			FilesManager.getFileAsStream.mockResolvedValueOnce(file);

			await expect(JsonAssets.getContainerTree(teamspace, container, revId))
				.resolves.toEqual(file);

			expect(FilesManager.getFileAsStream).toHaveBeenCalledTimes(1);
			expect(FilesManager.getFileAsStream).toHaveBeenCalledWith(teamspace, `${container}.stash.json_mpc.ref`, `${revId}/fulltree.json`);
		});

		test('should call getFileAsStream with the latest revision if revision is not provided', async () => {
			const file = generateRandomObject();
			const teamspace = generateRandomString();
			const container = generateRandomString();
			const revision = { _id: generateRandomString() };

			Revisions.getLatestRevision.mockResolvedValueOnce(revision);
			FilesManager.getFileAsStream.mockResolvedValueOnce(file);

			await expect(JsonAssets.getContainerTree(teamspace, container))
				.resolves.toEqual(file);

			expect(FilesManager.getFileAsStream).toHaveBeenCalledTimes(1);
			expect(FilesManager.getFileAsStream).toHaveBeenCalledWith(teamspace, `${container}.stash.json_mpc.ref`, `${revision._id}/fulltree.json`);
			expect(Revisions.getLatestRevision).toHaveBeenCalledTimes(1);
			expect(Revisions.getLatestRevision).toHaveBeenCalledWith(teamspace, container,
				modelTypes.CONTAINER, { _id: 1 });
		});

		test('should throw error if revision is not provided and no latest revision exists', async () => {
			const teamspace = generateRandomString();
			const container = generateRandomString();

			Revisions.getLatestRevision.mockRejectedValueOnce(new Error());

			await expect(JsonAssets.getContainerTree(teamspace, container))
				.rejects.toEqual(templates.fileNotFound);

			expect(FilesManager.getFileAsStream).not.toHaveBeenCalled();
			expect(Revisions.getLatestRevision).toHaveBeenCalledTimes(1);
			expect(Revisions.getLatestRevision).toHaveBeenCalledWith(teamspace, container,
				modelTypes.CONTAINER, { _id: 1 });
		});
	});
};

describe(determineTestGroup(__filename), () => {
	testGetContainerTree();
});
