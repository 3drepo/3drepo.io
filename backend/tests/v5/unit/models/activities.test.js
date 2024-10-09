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

const { times } = require('lodash');
const { generateRandomString, generateRandomDate, generateRandomObject } = require('../../helper/services');
const { src } = require('../../helper/path');

const Activities = require(`${src}/models/activities`);

const db = require(`${src}/handler/db`);

const ACTIVITIES_COL = 'activities';

const testGetActivities = () => {
	describe('Get activities', () => {
		const teamspace = generateRandomString();
		const fromDate = generateRandomDate();
		const toDate = generateRandomDate();

		test('should return whatever the database query returns', async () => {
			const expectedOutput = times(5, () => generateRandomObject());

			const fn = jest.spyOn(db, 'find').mockResolvedValueOnce(expectedOutput);

			await expect(Activities.getActivities(teamspace, fromDate, toDate))
				.resolves.toEqual(expectedOutput);

			expect(fn).toHaveBeenCalledTimes(1);
			expect(fn).toHaveBeenCalledWith(teamspace, ACTIVITIES_COL,
				{ timestamp: ({ $gte: fromDate, $lte: toDate }) });
		});

		test('should return whatever the database query returns (no params)', async () => {
			const expectedOutput = times(5, () => generateRandomObject());

			const fn = jest.spyOn(db, 'find').mockResolvedValueOnce(expectedOutput);

			await expect(Activities.getActivities(teamspace))
				.resolves.toEqual(expectedOutput);

			expect(fn).toHaveBeenCalledTimes(1);
			expect(fn).toHaveBeenCalledWith(teamspace, ACTIVITIES_COL, {});
		});

		test('should return whatever the database query returns (only from param)', async () => {
			const expectedOutput = times(5, () => generateRandomObject());

			const fn = jest.spyOn(db, 'find').mockResolvedValueOnce(expectedOutput);

			await expect(Activities.getActivities(teamspace, fromDate))
				.resolves.toEqual(expectedOutput);

			expect(fn).toHaveBeenCalledTimes(1);
			expect(fn).toHaveBeenCalledWith(teamspace, ACTIVITIES_COL, { timestamp: ({ $gte: fromDate }) });
		});
	});
};

const testAddActivity = () => {
	describe('Add activity', () => {
		test('should add the activity', async () => {
			const teamspace = generateRandomString();
			const action = generateRandomString();
			const executor = generateRandomString();
			const data = generateRandomObject();

			const fn = jest.spyOn(db, 'insertOne').mockResolvedValueOnce(undefined);

			await Activities.addActivity(teamspace, action, executor, data);

			expect(fn).toHaveBeenCalledTimes(1);
			const { _id, timestamp } = fn.mock.calls[0][2];
			expect(fn).toHaveBeenCalledWith(teamspace, ACTIVITIES_COL,
				{ action, executor, data, _id, timestamp });
		});
	});
};

describe('models/activities', () => {
	testGetActivities();
	testAddActivity();
});
