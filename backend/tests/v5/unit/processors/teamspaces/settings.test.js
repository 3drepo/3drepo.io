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

const { determineTestGroup } = require('../../../helper/utils');
const { src } = require('../../../helper/path');

const { generateRandomString } = require('../../../helper/services');

jest.mock('../../../../../src/v5/models/teamspaceSettings');
const SettingsModel = require(`${src}/models/teamspaceSettings`);

const Settings = require(`${src}/processors/teamspaces/settings`);

const testGetRiskCategories = () => {
	describe('Get risk cateogires', () => {
		test('should call getRiskCategories in the model object', async () => {
			const teamspace = generateRandomString();
			const data = generateRandomString();
			SettingsModel.getRiskCategories.mockResolvedValueOnce(data);
			await expect(Settings.getRiskCategories(teamspace)).resolves.toEqual(data);

			expect(SettingsModel.getRiskCategories).toHaveBeenCalledTimes(1);
			expect(SettingsModel.getRiskCategories).toHaveBeenCalledWith(teamspace);
		});
	});
};

describe(determineTestGroup(__filename), () => {
	testGetRiskCategories();
});
