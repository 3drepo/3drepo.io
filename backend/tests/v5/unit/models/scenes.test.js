/**
 *  Copyright (C) 2023 3D Repo Ltd
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
const { src } = require('../../helper/path');
const { generateRandomString, generateRandomObject, determineTestGroup } = require('../../helper/services');

const Scenes = require(`${src}/models/scenes`);
const db = require(`${src}/handler/db`);

const testGetNodesBySharedIds = () => {
	describe('Get nodes by shared Ids', () => {
		test('Should return the results from the database query', async () => {
			const teamspace = generateRandomString();
			const project = generateRandomString();
			const model = generateRandomString();
			const revId = generateRandomString();
			const sharedIds = times(10, () => generateRandomString());
			const projection = generateRandomObject();

			const expectedData = times(10, generateRandomObject);

			const findFn = jest.spyOn(db, 'find').mockResolvedValueOnce(expectedData);

			await expect(Scenes.getNodesBySharedIds(teamspace, project, model, revId, sharedIds, projection))
				.resolves.toEqual(expectedData);

			expect(findFn).toHaveBeenCalledTimes(1);
			expect(findFn).toHaveBeenCalledWith(teamspace, `${model}.scene`, { rev_id: revId, shared_id: { $in: sharedIds } }, projection);
		});
	});
};

const testGetNodesByIds = () => {
	describe('Get nodes by Ids', () => {
		test('Should return the results from the database query', async () => {
			const teamspace = generateRandomString();
			const project = generateRandomString();
			const model = generateRandomString();
			const ids = times(10, () => generateRandomString());
			const projection = generateRandomObject();

			const expectedData = times(10, generateRandomObject);

			const findFn = jest.spyOn(db, 'find').mockResolvedValueOnce(expectedData);

			await expect(Scenes.getNodesByIds(teamspace, project, model, ids, projection))
				.resolves.toEqual(expectedData);

			expect(findFn).toHaveBeenCalledTimes(1);
			expect(findFn).toHaveBeenCalledWith(teamspace, `${model}.scene`, { _id: { $in: ids } }, projection);
		});
	});
};

describe(determineTestGroup(__filename), () => {
	testGetNodesBySharedIds();
	testGetNodesByIds();
});
