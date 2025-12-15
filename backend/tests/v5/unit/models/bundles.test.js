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

const { src } = require('../../helper/path');

jest.mock('../../../../src/v5/handler/db');
const db = require(`${src}/handler/db`);

const { templates } = require(`${src}/utils/responseCodes`);
const { generateRandomString, determineTestGroup, generateRandomObject } = require('../../helper/services');

const Bundles = require(`${src}/models/bundles`);

const repobundleExt = '.stash.repobundles';
const unity3dExt = '.stash.unity3d';

const testGetAssetList = () => {
	describe('Bundles.getAssetList', () => {
		const teamspace = generateRandomString();
		const container = generateRandomString();
		const revision = generateRandomString();
		test('Should return repobundle if found', async () => {
			const repobundleData = generateRandomObject();
			db.findOne.mockResolvedValueOnce(repobundleData);

			await expect(Bundles.getAssetList(teamspace, container, revision)).resolves.toEqual(repobundleData);
			expect(db.findOne).toHaveBeenCalledTimes(1);
			expect(db.findOne).toHaveBeenCalledWith(
				teamspace,
				`${container}${repobundleExt}`,
				{ _id: revision },
				{ _id: 0 },
			);
		});

		test('Should return unity3d bundle if repobundle not found but unity3d found', async () => {
			const unityBundleData = generateRandomObject();
			db.findOne
				.mockResolvedValueOnce(undefined) // first call for repobundle
				.mockResolvedValueOnce(unityBundleData);

			await expect(Bundles.getAssetList(teamspace, container, revision)).resolves.toEqual(unityBundleData);

			expect(db.findOne).toHaveBeenCalledTimes(2);
			expect(db.findOne).toHaveBeenNthCalledWith(
				1,
				teamspace,
				`${container}${repobundleExt}`,
				{ _id: revision },
				{ _id: 0 },
			);
			expect(db.findOne).toHaveBeenNthCalledWith(
				2,
				teamspace,
				`${container}${unity3dExt}`,
				{ _id: revision },
				{ _id: 0 },
			);
		});

		test('Should throw fileNotFound if neither repobundle nor unity3d found', async () => {
			db.findOne
				.mockResolvedValueOnce(undefined) // first call for repobundle
				.mockResolvedValueOnce(undefined); // second call for unity3d

			await expect(Bundles.getAssetList(teamspace, container, revision)).rejects.toEqual(templates.fileNotFound);

			expect(db.findOne).toHaveBeenCalledTimes(2);
			expect(db.findOne).toHaveBeenNthCalledWith(
				1,
				teamspace,
				`${container}${repobundleExt}`,
				{ _id: revision },
				{ _id: 0 },
			);
			expect(db.findOne).toHaveBeenNthCalledWith(
				2,
				teamspace,
				`${container}${unity3dExt}`,
				{ _id: revision },
				{ _id: 0 },
			);
		});
	});
};

describe(determineTestGroup(__filename), () => {
	testGetAssetList();
});
