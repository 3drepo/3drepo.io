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

const { determineTestGroup } = require('../../helper/utils');
const { src } = require('../../helper/path');
const { generateRandomString, generateRandomObject } = require('../../helper/services');

const { CLASH_RUN_STATUS, CLASH_RUNS_COL } = require(`${src}/models/clashes.constants`);
const ClashRuns = require(`${src}/models/clashes.runs`);
const db = require(`${src}/handler/db`);
const { templates } = require(`${src}/utils/responseCodes`);

const testCreateTestRun = () => {
	describe('Create test run', () => {
		test('should create a test run and create an index', async () => {
			const teamspace = generateRandomString();
			const user = generateRandomString();
			const plan = generateRandomObject();
			const createFn = jest.spyOn(db, 'insertOne').mockResolvedValueOnce(undefined);
			const createIndexFn = jest.spyOn(db, 'createIndex').mockResolvedValueOnce(undefined);

			const _id = await ClashRuns.createTestRun(teamspace, plan, user);

			expect(createIndexFn).toHaveBeenCalledTimes(1);
			expect(createIndexFn).toHaveBeenCalledWith(teamspace, CLASH_RUNS_COL, { 'plan._id': 1, createdAt: -1 }, { runInBackground: true });

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

		test('should create a test run and handle error if index creation fails', async () => {
			const teamspace = generateRandomString();
			const user = generateRandomString();
			const plan = generateRandomObject();
			const createFn = jest.spyOn(db, 'insertOne').mockResolvedValueOnce(undefined);
			const createIndexFn = jest.spyOn(db, 'createIndex').mockRejectedValueOnce(new Error());

			const _id = await ClashRuns.createTestRun(teamspace, plan, user);

			expect(createIndexFn).toHaveBeenCalledTimes(1);
			expect(createIndexFn).toHaveBeenCalledWith(teamspace, CLASH_RUNS_COL, { 'plan._id': 1, createdAt: -1 }, { runInBackground: true });

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

const testCompleteTestRun = () => {
	describe('Complete test run', () => {
		test('should complete a test run', async () => {
			const teamspace = generateRandomString();
			const runId = generateRandomString();
			const resultId = generateRandomString();
			const updateFn = jest.spyOn(db, 'updateOne').mockResolvedValueOnce(undefined);

			await ClashRuns.completeTestRun(teamspace, runId, resultId);

			const { completedAt } = updateFn.mock.calls[0][3].$set;
			expect(updateFn).toHaveBeenCalledTimes(1);
			expect(updateFn).toHaveBeenCalledWith(teamspace, CLASH_RUNS_COL, { _id: runId },
				{ $set: { status: CLASH_RUN_STATUS.COMPLETED, completedAt, result: resultId } });
		});
	});
};

const testSetTestRunToFailed = () => {
	describe('Set test run to failed', () => {
		test('should set a test run to failed', async () => {
			const teamspace = generateRandomString();
			const runId = generateRandomString();
			const message = generateRandomString();
			const errorCode = generateRandomString();
			const updateFn = jest.spyOn(db, 'updateOne').mockResolvedValueOnce(undefined);

			await ClashRuns.setTestRunToFailed(teamspace, runId, message, errorCode);

			const { timestamp } = updateFn.mock.calls[0][3].$set.errorReason;
			expect(updateFn).toHaveBeenCalledTimes(1);
			expect(updateFn).toHaveBeenCalledWith(teamspace, CLASH_RUNS_COL, { _id: runId },
				{ $set: { status: CLASH_RUN_STATUS.FAILED, errorReason: { message, timestamp, errorCode } } });
		});
	});
};

const testGetTestRunByQuery = () => {
	describe('Get test run by query', () => {
		test('should get a test run by query', async () => {
			const teamspace = generateRandomString();
			const query = generateRandomObject();
			const projection = generateRandomObject();
			const sort = generateRandomObject();
			const result = generateRandomObject();
			const findFn = jest.spyOn(db, 'findOne').mockResolvedValueOnce(result);

			const run = await ClashRuns.getTestRunByQuery(teamspace, query, projection, sort);
			expect(run).toEqual(result);

			expect(findFn).toHaveBeenCalledTimes(1);
			expect(findFn).toHaveBeenCalledWith(teamspace, CLASH_RUNS_COL, query, projection, sort);
		});

		test('should return error if run is not found', async () => {
			const teamspace = generateRandomString();
			const query = generateRandomObject();
			const projection = generateRandomObject();
			const sort = generateRandomObject();

			const findFn = jest.spyOn(db, 'findOne').mockResolvedValueOnce(undefined);

			await expect(ClashRuns.getTestRunByQuery(teamspace, query, projection, sort))
				.rejects.toEqual(templates.clashRunNotFound);

			expect(findFn).toHaveBeenCalledTimes(1);
			expect(findFn).toHaveBeenCalledWith(teamspace, CLASH_RUNS_COL, query, projection, sort);
		});
	});
};

const testGetLastRunFromPlan = () => {
	describe('Get last run from plan', () => {
		test('should get the last run from a plan', async () => {
			const teamspace = generateRandomString();
			const planId = generateRandomString();
			const result = generateRandomObject();
			const findFn = jest.spyOn(db, 'findOne').mockResolvedValueOnce(result);

			const run = await ClashRuns.getLastRunFromPlan(teamspace, planId);
			expect(run).toEqual(result);

			expect(findFn).toHaveBeenCalledTimes(1);
			expect(findFn).toHaveBeenCalledWith(teamspace, CLASH_RUNS_COL, { 'plan._id': planId }, { sort: { createdAt: -1 } });
		});
	});
};

const testGetRunsByPlanId = () => {
	describe('Get runs by plan ID', () => {
		const teamspace = generateRandomString();
		const planId = generateRandomString();

		test('should get runs by plan ID sorted by triggeredAt descending and without plan field', async () => {
			const runs = [generateRandomObject(), generateRandomObject()];
			const findFn = jest.spyOn(db, 'find').mockResolvedValueOnce(runs);

			await expect(ClashRuns.getRunsByPlanId(teamspace, planId)).resolves.toEqual(runs);

			expect(findFn).toHaveBeenCalledTimes(1);
			expect(findFn).toHaveBeenCalledWith(
				teamspace,
				CLASH_RUNS_COL,
				{ 'plan._id': planId },
				{ plan: 0 },
				{ triggeredAt: -1 },
			);
		});

		test('should reject if find fails', async () => {
			const error = new Error(generateRandomString());
			const findFn = jest.spyOn(db, 'find').mockRejectedValueOnce(error);

			await expect(ClashRuns.getRunsByPlanId(teamspace, planId)).rejects.toEqual(error);

			expect(findFn).toHaveBeenCalledTimes(1);
			expect(findFn).toHaveBeenCalledWith(
				teamspace,
				CLASH_RUNS_COL,
				{ 'plan._id': planId },
				{ plan: 0 },
				{ triggeredAt: -1 },
			);
		});
	});
};

describe(determineTestGroup(__filename), () => {
	testCreateTestRun();
	testCompleteTestRun();
	testSetTestRunToFailed();
	testGetTestRunByQuery();
	testGetLastRunFromPlan();
	testGetRunsByPlanId();
});
