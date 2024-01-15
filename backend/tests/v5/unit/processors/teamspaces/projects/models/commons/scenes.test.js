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
const { determineTestGroup, generateRandomString, generateUUID, generateUUIDString } = require('../../../../../../helper/services');
const { UUIDToString, stringToUUID } = require('../../../../../../../../src/v5/utils/helper/uuids');
// const { idTypesToKeys, idTypes } = require('../../../../../../../../src/v5/models/metadata.constants');

const Scenes = require(`${src}/processors/teamspaces/projects/models/commons/scenes`);

// jest.mock('../../../../../../../../src/v5/models/metadata');
// const MetaModel = require(`${src}/models/metadata`);

jest.mock('../../../../../../../../src/v5/models/scenes');
const ScenesModel = require(`${src}/models/scenes`);

jest.mock('../../../../../../../../src/v5/services/filesManager');
const FilesManager = require(`${src}/services/filesManager`);

const testGetMeshesWithParentIds = () => {
	const teamspace = generateRandomString();
	const project = generateRandomString();
	const container = generateRandomString();
	const revision = generateUUID();
	const parentIds = times(10, generateUUID);

	const nodesMocked = [];
	const meshesToReturn = [];

	const meshMap = {};
	const dupMeshMap = {};

	const dupValues = times(10, generateUUIDString);

	for (let i = 1; i <= 10; ++i) {
		const id = generateUUIDString();
		nodesMocked.push({ _id: stringToUUID(id) });
		const results = times(i, generateUUIDString);
		meshMap[id] = results;
		dupMeshMap[id] = dupValues;
		meshesToReturn.push(...results.map(stringToUUID));
	}

	const defaultParams = {
		nodes: nodesMocked,
		meshMapFile: JSON.stringify(meshMap),
		expectedResults: meshesToReturn,
	};

	describe.each([
		['empty array if no corresponding nodes are found', { ...defaultParams, nodes: [], expectedResults: [] }],
		['empty array if no corresponding mesh mapping is found', { ...defaultParams, nodes: times(10, () => ({ _id: generateUUID() })), expectedResults: [] }],
		['expected mesh ids', defaultParams],
		['expected mesh ids in string form if returnString is set to true', { ...defaultParams, returnString: true, expectedResults: defaultParams.expectedResults.map(UUIDToString) }],
		['expected mesh ids without duplicates', { ...defaultParams, meshMapFile: JSON.stringify(dupMeshMap), expectedResults: dupValues.map(stringToUUID) }],
	])('Get meshes with parent Ids', (desc, { nodes, meshMapFile, expectedResults, returnString }) => {
		test(`Should return ${desc}`, async () => {
			ScenesModel.getNodesBySharedIds.mockResolvedValueOnce(nodes);
			FilesManager.getFile.mockResolvedValueOnce(meshMapFile);

			const res = await Scenes.getMeshesWithParentIds(teamspace, project, container, revision,
				parentIds, returnString);
			expect(res).toEqual(expectedResults);

			expect(ScenesModel.getNodesBySharedIds).toHaveBeenCalledTimes(1);
			expect(ScenesModel.getNodesBySharedIds).toHaveBeenCalledWith(teamspace,
				project, container, revision, parentIds, { _id: 1 });

			expect(FilesManager.getFile).toHaveBeenCalledTimes(1);
			expect(FilesManager.getFile).toHaveBeenCalledWith(teamspace, `${container}.stash.json_mpc`, `${UUIDToString(revision)}/idToMeshes.json`);
		});
	});
};

describe(determineTestGroup(__filename), () => {
	testGetMeshesWithParentIds();
});
