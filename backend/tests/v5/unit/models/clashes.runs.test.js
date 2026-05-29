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

const { clashRunStatus, CLASH_RUNS_COL } = require(`${src}/models/clashes.constants`);
const ClashRuns = require(`${src}/models/clashes.runs`);
const db = require(`${src}/handler/db`);
const { templates } = require(`${src}/utils/responseCodes`);

const testCreateTestRun = () => {
	describe('Create test run', () => {
		test('should create a test run and create an index', async () => {
			const teamspace = generateRandomString();
			const project = generateRandomString();
			const user = generateRandomString();
			const plan = generateRandomObject();
			const createFn = jest.spyOn(db, 'insertOne').mockResolvedValueOnce(undefined);
			const createIndexFn = jest.spyOn(db, 'createIndex').mockResolvedValueOnce(undefined);

			const _id = await ClashRuns.createTestRun(teamspace, project, plan, user);

			expect(createIndexFn).toHaveBeenCalledTimes(1);
			expect(createIndexFn).toHaveBeenCalledWith(teamspace, CLASH_RUNS_COL,
				{ project: 1, 'plan._id': 1, updatedAt: -1 }, { runInBackground: true });

			const { triggeredAt, updatedAt } = createFn.mock.calls[0][2];
			expect(createFn).toHaveBeenCalledTimes(1);
			expect(createFn).toHaveBeenCalledWith(teamspace, CLASH_RUNS_COL,
				{
					_id,
					project,
					triggeredBy: user,
					triggeredAt,
					updatedAt,
					status: clashRunStatus.PLANNED,
					plan,
				});
		});

		test('should create a test run and handle error if index creation fails', async () => {
			const teamspace = generateRandomString();
			const project = generateRandomString();
			const user = generateRandomString();
			const plan = generateRandomObject();
			const createFn = jest.spyOn(db, 'insertOne').mockResolvedValueOnce(undefined);
			const createIndexFn = jest.spyOn(db, 'createIndex').mockRejectedValueOnce(new Error());

			const _id = await ClashRuns.createTestRun(teamspace, project, plan, user);

			expect(createIndexFn).toHaveBeenCalledTimes(1);

			expect(createIndexFn).toHaveBeenCalledWith(teamspace, CLASH_RUNS_COL,
				{ project: 1, 'plan._id': 1, updatedAt: -1 }, { runInBackground: true });

			const { triggeredAt, updatedAt } = createFn.mock.calls[0][2];
			expect(createFn).toHaveBeenCalledTimes(1);
			expect(createFn).toHaveBeenCalledWith(teamspace, CLASH_RUNS_COL,
				{
					_id,
					project,
					triggeredBy: user,
					triggeredAt,
					updatedAt,
					status: clashRunStatus.PLANNED,
					plan,
				});
		});
	});
};

const testUpdateRunStatus = () => {
	describe('Update run status', () => {
		test('should update the status of a run', async () => {
			const teamspace = generateRandomString();
			const project = generateRandomString();
			const runId = generateRandomString();
			const updateFn = jest.spyOn(db, 'updateOne').mockResolvedValueOnce(undefined);

			await ClashRuns.updateRunStatus(teamspace, project, runId, clashRunStatus.QUEUED);

			const { updatedAt } = updateFn.mock.calls[0][3].$set;
			expect(updateFn).toHaveBeenCalledTimes(1);
			expect(updateFn).toHaveBeenCalledWith(teamspace, CLASH_RUNS_COL, { project, _id: runId },
				{ $set: { status: clashRunStatus.QUEUED, updatedAt } });
		});

		test('should complete a test run', async () => {
			const teamspace = generateRandomString();
			const project = generateRandomString();
			const runId = generateRandomString();
			const resultId = generateRandomString();
			const updateFn = jest.spyOn(db, 'updateOne').mockResolvedValueOnce(undefined);

			await ClashRuns.updateRunStatus(teamspace, project, runId, clashRunStatus.COMPLETED, resultId);

			const { updatedAt } = updateFn.mock.calls[0][3].$set;
			expect(updateFn).toHaveBeenCalledTimes(1);
			expect(updateFn).toHaveBeenCalledWith(teamspace, CLASH_RUNS_COL, { project, _id: runId },
				{ $set: { status: clashRunStatus.COMPLETED, results: resultId, updatedAt } });
		});

		test('should complete a test run with pre-shaped results data', async () => {
			const teamspace = generateRandomString();
			const project = generateRandomString();
			const runId = generateRandomString();
			const resultId = generateRandomString();
			const updateFn = jest.spyOn(db, 'updateOne').mockResolvedValueOnce(undefined);

			await ClashRuns.updateRunStatus(teamspace, project, runId, clashRunStatus.COMPLETED, { results: resultId });

			const { updatedAt } = updateFn.mock.calls[0][3].$set;
			expect(updateFn).toHaveBeenCalledTimes(1);
			expect(updateFn).toHaveBeenCalledWith(teamspace, CLASH_RUNS_COL, { project, _id: runId },
				{ $set: { status: clashRunStatus.COMPLETED, results: resultId, updatedAt } });
		});

		test('should set a test run to failed', async () => {
			const teamspace = generateRandomString();
			const project = generateRandomString();
			const runId = generateRandomString();
			const reason = generateRandomString();
			const code = generateRandomString();
			const updateFn = jest.spyOn(db, 'updateOne').mockResolvedValueOnce(undefined);

			await ClashRuns.updateRunStatus(teamspace, project, runId, clashRunStatus.FAILED, { reason, code });

			const { updatedAt } = updateFn.mock.calls[0][3].$set;
			expect(updateFn).toHaveBeenCalledTimes(1);
			expect(updateFn).toHaveBeenCalledWith(teamspace, CLASH_RUNS_COL, { project, _id: runId },
				{ $set: { status: clashRunStatus.FAILED, results: { error: { reason, code } }, updatedAt } });
		});

		test('should set a test run to failed with pre-shaped error data', async () => {
			const teamspace = generateRandomString();
			const project = generateRandomString();
			const runId = generateRandomString();
			const error = { code: generateRandomString(), reason: generateRandomString() };
			const updateFn = jest.spyOn(db, 'updateOne').mockResolvedValueOnce(undefined);

			await ClashRuns.updateRunStatus(teamspace, project, runId, clashRunStatus.FAILED, { error });

			const { updatedAt } = updateFn.mock.calls[0][3].$set;
			expect(updateFn).toHaveBeenCalledTimes(1);
			expect(updateFn).toHaveBeenCalledWith(teamspace, CLASH_RUNS_COL, { project, _id: runId },
				{ $set: { status: clashRunStatus.FAILED, results: { error }, updatedAt } });
		});

		test('should set a test run to failed with a string error reason', async () => {
			const teamspace = generateRandomString();
			const project = generateRandomString();
			const runId = generateRandomString();
			const reason = generateRandomString();
			const updateFn = jest.spyOn(db, 'updateOne').mockResolvedValueOnce(undefined);

			await ClashRuns.updateRunStatus(teamspace, project, runId, clashRunStatus.FAILED, reason);

			const { updatedAt } = updateFn.mock.calls[0][3].$set;
			expect(updateFn).toHaveBeenCalledTimes(1);
			expect(updateFn).toHaveBeenCalledWith(teamspace, CLASH_RUNS_COL, { project, _id: runId },
				{ $set: { status: clashRunStatus.FAILED, results: { error: { reason } }, updatedAt } });
		});

		test('should set a test run to failed without error data', async () => {
			const teamspace = generateRandomString();
			const project = generateRandomString();
			const runId = generateRandomString();
			const updateFn = jest.spyOn(db, 'updateOne').mockResolvedValueOnce(undefined);

			await ClashRuns.updateRunStatus(teamspace, project, runId, clashRunStatus.FAILED);

			const { updatedAt } = updateFn.mock.calls[0][3].$set;
			expect(updateFn).toHaveBeenCalledTimes(1);
			expect(updateFn).toHaveBeenCalledWith(teamspace, CLASH_RUNS_COL, { project, _id: runId },
				{ $set: { status: clashRunStatus.FAILED, results: { error: {} }, updatedAt } });
		});

		test('should set a test run to failed with null error data', async () => {
			const teamspace = generateRandomString();
			const project = generateRandomString();
			const runId = generateRandomString();
			const updateFn = jest.spyOn(db, 'updateOne').mockResolvedValueOnce(undefined);

			await ClashRuns.updateRunStatus(teamspace, project, runId, clashRunStatus.FAILED, null);

			const { updatedAt } = updateFn.mock.calls[0][3].$set;
			expect(updateFn).toHaveBeenCalledTimes(1);
			expect(updateFn).toHaveBeenCalledWith(teamspace, CLASH_RUNS_COL, { project, _id: runId },
				{ $set: { status: clashRunStatus.FAILED, results: { error: {} }, updatedAt } });
		});
	});
};

const testGetTestRunByQuery = () => {
	describe('Get test run by query', () => {
		test('should get a test run by query', async () => {
			const teamspace = generateRandomString();
			const project = generateRandomString();
			const query = generateRandomObject();
			const projection = generateRandomObject();
			const sort = generateRandomObject();
			const result = generateRandomObject();
			const findFn = jest.spyOn(db, 'findOne').mockResolvedValueOnce(result);

			const run = await ClashRuns.getTestRunByQuery(teamspace, project, query, projection, sort);
			expect(run).toEqual(result);

			expect(findFn).toHaveBeenCalledTimes(1);
			expect(findFn).toHaveBeenCalledWith(teamspace, CLASH_RUNS_COL, { ...query, project }, projection, sort);
		});

		test('should return error if run is not found', async () => {
			const teamspace = generateRandomString();
			const project = generateRandomString();
			const query = generateRandomObject();
			const projection = generateRandomObject();
			const sort = generateRandomObject();

			const findFn = jest.spyOn(db, 'findOne').mockResolvedValueOnce(undefined);

			await expect(ClashRuns.getTestRunByQuery(teamspace, project, query, projection, sort))
				.rejects.toEqual(templates.clashRunNotFound);

			expect(findFn).toHaveBeenCalledTimes(1);
			expect(findFn).toHaveBeenCalledWith(teamspace, CLASH_RUNS_COL, { ...query, project }, projection, sort);
		});
	});
};

describe(determineTestGroup(__filename), () => {
	testCreateTestRun();
	testUpdateRunStatus();
	testGetTestRunByQuery();
});
