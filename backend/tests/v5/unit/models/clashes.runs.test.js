/**
 *  Copyright (C) 2026 3D Repo Ltd
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
const { generateRandomString, determineTestGroup, generateRandomObject } = require('../../helper/services');

const { CLASH_RUN_STATUS, CLASH_RUNS_COL } = require(`${src}/models/clashes.constants`);
const ClashRuns = require(`${src}/models/clashes.runs`);
const db = require(`${src}/handler/db`);

const createTestRun = () => {
	describe('Create test run', () => {
		test('should create a test run', async () => {
			const teamspace = generateRandomString();
			const user = generateRandomString();
			const plan = generateRandomObject();
			const createFn = jest.spyOn(db, 'insertOne').mockResolvedValueOnce(undefined);

			const _id = await ClashRuns.createTestRun(teamspace, plan, user);

			expect(createFn).toHaveBeenCalledTimes(1);
			expect(createFn).toHaveBeenCalledWith(teamspace, CLASH_RUNS_COL,
				{
					_id,
					triggeredBy: user,
					triggeredAt: createFn.mock.calls[0][2].triggeredAt,
					status: CLASH_RUN_STATUS.PLANNED,
					plan,
				});
		});
	});
};

describe(determineTestGroup(__filename), () => {
	createTestRun();
});
