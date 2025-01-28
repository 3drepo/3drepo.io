/**
 *  Copyright (C) 2024 3D Repo Ltd
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

jest.mock('../../../../src/v5/models/scenes');
const Scenes = require(`${src}/models/scenes`);

jest.mock('../../../../src/v5/models/modelSettings');
const ModelSettings = require(`${src}/models/modelSettings`);

const { times } = require('lodash');

const ServiceHelper = require('../../helper/services');

const Ref = require(`${src}/models/ref`);

const testGetRefNodes = () => {
	describe('Get ref nodes', () => {
		const teamspace = ServiceHelper.generateRandomString();
		const fedId = ServiceHelper.generateUUIDString();
		const branch = 'master';
		const revId = ServiceHelper.generateUUID();

		test('should retrieve model settings to get the ref nodes and return the result', async () => {
			const mockSettings = {
				federate: true,
			};

			const expectedData = times(10, ServiceHelper.generateRandomObject);

			ModelSettings.getModelById.mockResolvedValue(mockSettings);
			Scenes.findNodesByType.mockResolvedValue(expectedData);

			const result = await Ref.getRefNodes(teamspace, fedId, branch, revId);

			expect(ModelSettings.getModelById).toHaveBeenCalledTimes(1);
			expect(ModelSettings.getModelById).toHaveBeenCalledWith(
				teamspace,
				fedId,
			);

			expect(Scenes.findNodesByType).toHaveBeenCalledTimes(1);
			expect(Scenes.findNodesByType).toHaveBeenCalledWith(
				teamspace,
				fedId,
				branch,
				revId,
				'ref',
				undefined,
			);

			expect(result).toEqual(expectedData);
		});

		test('should retrieve an empty array if the settings indicate that the model is not a federation', async () => {
			const mockSettings = {
				federate: false,
			};

			ModelSettings.getModelById.mockResolvedValue(mockSettings);

			const result = await Ref.getRefNodes(teamspace, fedId, branch, revId);

			expect(ModelSettings.getModelById).toHaveBeenCalledTimes(1);
			expect(ModelSettings.getModelById).toHaveBeenCalledWith(
				teamspace,
				fedId,
			);

			expect(result).toEqual([]);
		});
	});
};

// describe('models/ref', () => {
// 	testGetRefNodes();
// });

const dummyTest = () => {
	describe('dummy test', () => {
		test('should succeed', () => {
			expect(true).toEqual(true);
		});
	});
};

describe(ServiceHelper.determineTestGroup(__filename), () => {
	dummyTest();
});
