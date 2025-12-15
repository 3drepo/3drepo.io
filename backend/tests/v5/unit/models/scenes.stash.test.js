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

const { generateRandomString, determineTestGroup, generateRandomObject } = require('../../helper/services');

const Bundles = require(`${src}/models/scenes.stash`);

const STASH_EXT = '.stash.3drepo';

const testGetSuperMeshesInRevision = () => {
	describe('Get supermeshes in revision', () => {
		const teamspace = generateRandomString();
		const model = generateRandomString();
		const revision = generateRandomString();
		const projection = generateRandomObject();
		test('Should return supermeshes in revision', async () => {
			const supermeshesData = [generateRandomObject(), generateRandomObject()];
			db.find.mockResolvedValueOnce(supermeshesData);

			await expect(Bundles.getSuperMeshesInRevision(teamspace, model, revision, projection))
				.resolves.toEqual(supermeshesData);
			expect(db.find).toHaveBeenCalledTimes(1);
			expect(db.find).toHaveBeenCalledWith(
				teamspace,
				`${model}${STASH_EXT}`,
				{ rev_id: revision, type: 'mesh' },
				projection,
			);
		});
	});
};

describe(determineTestGroup(__filename), () => {
	testGetSuperMeshesInRevision();
});
