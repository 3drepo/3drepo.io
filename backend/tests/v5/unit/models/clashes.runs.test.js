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

const testCreateClashRun = () => {
	describe('Create clash run', () => {
		test('should create a clash run and create an index', async () => {
			const teamspace = generateRandomString();
			const project = generateRandomString();
			const user = generateRandomString();
			const plan = generateRandomObject();
			const createFn = jest.spyOn(db, 'insertOne').mockResolvedValueOnce(undefined);
			const createIndexFn = jest.spyOn(db, 'createIndex').mockResolvedValueOnce(undefined);

			const _id = await ClashRuns.createClashRun(teamspace, project, plan, user);

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

		test('should create a clash run and handle error if index creation fails', async () => {
			const teamspace = generateRandomString();
			const project = generateRandomString();
			const user = generateRandomString();
			const plan = generateRandomObject();
			const createFn = jest.spyOn(db, 'insertOne').mockResolvedValueOnce(undefined);
			const createIndexFn = jest.spyOn(db, 'createIndex').mockRejectedValueOnce(new Error());

			const _id = await ClashRuns.createClashRun(teamspace, project, plan, user);

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

		test('should complete a clash run', async () => {
			const teamspace = generateRandomString();
			const project = generateRandomString();
			const runId = generateRandomString();
			const stats = generateRandomObject();
			const updateFn = jest.spyOn(db, 'updateOne').mockResolvedValueOnce(undefined);

			await ClashRuns.updateRunStatus(teamspace, project, runId, clashRunStatus.COMPLETED, { stats });

			const { updatedAt } = updateFn.mock.calls[0][3].$set;
			expect(updateFn).toHaveBeenCalledTimes(1);
			expect(updateFn).toHaveBeenCalledWith(teamspace, CLASH_RUNS_COL, { project, _id: runId },
				{ $set: { status: clashRunStatus.COMPLETED, results: { stats }, updatedAt } });
		});

		test('should set a clash run to failed', async () => {
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

		test('should set a clash run to failed without results', async () => {
			const teamspace = generateRandomString();
			const project = generateRandomString();
			const runId = generateRandomString();
			const updateFn = jest.spyOn(db, 'updateOne').mockResolvedValueOnce(undefined);

			await ClashRuns.updateRunStatus(teamspace, project, runId, clashRunStatus.FAILED);

			const { updatedAt } = updateFn.mock.calls[0][3].$set;
			expect(updateFn).toHaveBeenCalledTimes(1);
			expect(updateFn).toHaveBeenCalledWith(teamspace, CLASH_RUNS_COL, { project, _id: runId },
				{ $set: { status: clashRunStatus.FAILED, updatedAt } });
		});
	});
};

const testGetClashRunByQuery = () => {
	describe('Get clash run by query', () => {
		test('should get a clash run by query', async () => {
			const teamspace = generateRandomString();
			const project = generateRandomString();
			const query = generateRandomObject();
			const projection = generateRandomObject();
			const sort = generateRandomObject();
			const result = generateRandomObject();
			const findFn = jest.spyOn(db, 'findOne').mockResolvedValueOnce(result);

			const run = await ClashRuns.getClashRunByQuery(teamspace, project, query, projection, sort);
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

			await expect(ClashRuns.getClashRunByQuery(teamspace, project, query, projection, sort))
				.rejects.toEqual(templates.clashRunNotFound);

			expect(findFn).toHaveBeenCalledTimes(1);
			expect(findFn).toHaveBeenCalledWith(teamspace, CLASH_RUNS_COL, { ...query, project }, projection, sort);
		});
	});
};

const testDeleteRunsByPlan = () => {
	describe('Delete runs by plan', () => {
		test('should delete the runs associated with a plan and return the ids removed', async () => {
			const teamspace = generateRandomString();
			const project = generateRandomString();
			const planId = generateRandomString();
			const runs = [
				{ _id: generateRandomString() },
				{ _id: generateRandomString() },
			];
			const runIds = runs.map(({ _id }) => _id);
			const findFn = jest.spyOn(db, 'find').mockResolvedValueOnce(runs);
			const deleteFn = jest.spyOn(db, 'deleteMany').mockResolvedValueOnce(undefined);

			await expect(ClashRuns.deleteRunsByPlan(teamspace, project, planId)).resolves.toEqual(runIds);

			expect(findFn).toHaveBeenCalledTimes(1);
			expect(findFn).toHaveBeenCalledWith(teamspace, CLASH_RUNS_COL,
				{ project, 'plan._id': planId }, { _id: 1 });
			expect(deleteFn).toHaveBeenCalledTimes(1);
			expect(deleteFn).toHaveBeenCalledWith(teamspace, CLASH_RUNS_COL,
				{ project, _id: { $in: runIds } });
		});

		test('should not try to delete anything if there are no runs associated with a plan', async () => {
			const teamspace = generateRandomString();
			const project = generateRandomString();
			const planId = generateRandomString();
			const findFn = jest.spyOn(db, 'find').mockResolvedValueOnce([]);
			const deleteFn = jest.spyOn(db, 'deleteMany').mockResolvedValueOnce(undefined);

			await expect(ClashRuns.deleteRunsByPlan(teamspace, project, planId)).resolves.toEqual([]);

			expect(findFn).toHaveBeenCalledTimes(1);
			expect(findFn).toHaveBeenCalledWith(teamspace, CLASH_RUNS_COL,
				{ project, 'plan._id': planId }, { _id: 1 });
			expect(deleteFn).not.toHaveBeenCalled();
		});
	});
};

const testDeleteRunsByProject = () => {
	describe('Delete runs by project', () => {
		test('should delete the runs associated with a project and return the ids removed', async () => {
			const teamspace = generateRandomString();
			const project = generateRandomString();
			const runs = [
				{ _id: generateRandomString() },
				{ _id: generateRandomString() },
			];
			const runIds = runs.map(({ _id }) => _id);
			const findFn = jest.spyOn(db, 'find').mockResolvedValueOnce(runs);
			const deleteFn = jest.spyOn(db, 'deleteMany').mockResolvedValueOnce(undefined);

			await expect(ClashRuns.deleteRunsByProject(teamspace, project)).resolves.toEqual(runIds);

			expect(findFn).toHaveBeenCalledTimes(1);
			expect(findFn).toHaveBeenCalledWith(teamspace, CLASH_RUNS_COL, { project }, { _id: 1 });
			expect(deleteFn).toHaveBeenCalledTimes(1);
			expect(deleteFn).toHaveBeenCalledWith(teamspace, CLASH_RUNS_COL,
				{ project, _id: { $in: runIds } });
		});
	});
};

describe(determineTestGroup(__filename), () => {
	testCreateClashRun();
	testUpdateRunStatus();
	testGetClashRunByQuery();
	testDeleteRunsByPlan();
	testDeleteRunsByProject();
});
