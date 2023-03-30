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
const { generateRandomString } = require('../../helper/services');

const View = require(`${src}/models/views`);
const db = require(`${src}/handler/db`);
const { VIEWS_COL } = require(`${src}/models/views.constants`);
const { templates } = require(`${src}/utils/responseCodes`);

const testGetViewById = () => {
	describe('Get view by Id', () => {
		const ts = generateRandomString();
		const model = generateRandomString();

		test('should return error if the view does not exist', async () => {
			jest.spyOn(db, 'findOne').mockResolvedValue(undefined);
			await expect(View.getViewById(ts, model, generateRandomString()))
				.rejects.toEqual(templates.viewNotFound);
		});

		test('should succeed if view exists', async () => {
			jest.spyOn(db, 'findOne').mockResolvedValue('view');
			await expect(View.getViewById(ts, model, generateRandomString())).resolves.toEqual('view');
		});
	});
};

const testGetViews = () => {
	describe('Get views', () => {
		test('should return list of views', async () => {
			const mockData = [generateRandomString(), generateRandomString(), generateRandomString()];
			const fn = jest.spyOn(db, 'find').mockResolvedValue(mockData);
			const ts = generateRandomString();
			const model = generateRandomString();
			const projection = { _id: 1 };
			await expect(View.getViews(ts, model, projection)).resolves.toEqual(mockData);

			expect(fn).toHaveBeenCalledTimes(1);
			expect(fn).toHaveBeenCalledWith(ts, VIEWS_COL, { model }, projection);
		});
	});
};

const testInitialise = () => {
	describe('Initialise', () => {
		test('should ensure indices exist', async () => {
			const fn = jest.spyOn(db, 'createIndex').mockResolvedValue(undefined);
			const ts = generateRandomString();
			await View.initialise(ts);
			expect(fn).toHaveBeenCalledTimes(1);
			expect(fn).toHaveBeenCalledWith(ts, VIEWS_COL,
				{ teamspace: 1, project: 1, model: 1 }, { runInBackground: true });
		});
	});
};

describe('models/views', () => {
	testGetViewById();
	testGetViews();
	testInitialise();
});
