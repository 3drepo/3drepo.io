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
	generateUUID,
	generateRandomObject,
} = require('../../../../../../../helper/services');
const { times } = require('lodash');

jest.mock('../../../../../../../../../src/v5/models/bundles');
const BundlesModel = require(`${src}/models/bundles`);

// jest.mock('../../../../../../../../../src/v5/services/filesManager');
// const FilesManager = require(`${src}/services/filesManager`);

const bundlesAssets = require(`${src}/processors/teamspaces/projects/models/commons/assets/bundles`);

const testGetRepoBundleInfo = () => {
	describe('getRepoBundleInfo', () => {
		const teamspace = generateRandomString();
		const container = generateUUID();
		const revision = generateUUID();
		test("should return asset list from getAssetList's result", async () => {
			const mockAssetList = generateRandomObject();
			BundlesModel.getAssetList.mockResolvedValueOnce(mockAssetList);

			await expect(bundlesAssets.getRepoBundleInfo(teamspace, container, revision))
				.resolves.toEqual({ models: [mockAssetList] });

			expect(BundlesModel.getAssetList).toHaveBeenCalledTimes(1);
			expect(BundlesModel.getAssetList).toHaveBeenCalledWith(teamspace, container, revision);
		});

		test('Should return multiple asset lists when subModels parameter is provided', async () => {
			const subModels = times(4, () => ({ container: generateUUID(), revision: generateUUID() }));
			const assetList = times(subModels.length - 1, generateRandomObject);

			assetList.forEach((asset) => {
				BundlesModel.getAssetList.mockResolvedValueOnce(asset);
			});

			BundlesModel.getAssetList.mockRejectedValueOnce();

			await expect(bundlesAssets.getRepoBundleInfo(teamspace, container, revision, subModels)).resolves.toEqual({
				models: assetList,
			});

			expect(BundlesModel.getAssetList).toHaveBeenCalledTimes(subModels.length);
			subModels.forEach(({ container: cont, revision: rev }, index) => {
				expect(BundlesModel.getAssetList).toHaveBeenNthCalledWith(index + 1, teamspace, cont, rev);
			});
		});
	});
};

describe(determineTestGroup(__filename), () => {
	testGetRepoBundleInfo();
});
