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

const Legend = require(`${src}/models/legends`);
const db = require(`${src}/handler/db`);
const { templates } = require(`${src}/utils/responseCodes`);

const testLegendExistsInModel = () => {
	describe('Legend Exists In Model', () => {
		test('should return error if the legend does not exist', async () => {
			jest.spyOn(db, 'findOne').mockResolvedValue(undefined);
			await expect(Legend.checkLegendExists('someTS', 'someModel', 'a'))
				.rejects.toEqual(templates.legendNotFound);
		});

		test('should succeed if legend exists', async () => {
			jest.spyOn(db, 'findOne').mockResolvedValue('legend');
			await Legend.checkLegendExists('someTS', 'someModel', 'b');
		});
	});
};

describe('models/legends', () => {
	testLegendExistsInModel();
});
