/**
 *  Copyright (C) 2022 3D Repo Ltd
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
const {
	db: { reset: resetDB, createModel, createRevision, createClashRuns },
	generateRandomString,
	generateRandomProject,
	generateRandomModel,
	generateRevisionEntry,
	generateClashPlan,
	generateClashRun,
} = require('../../helper/services');
const { times } = require('lodash');
const { utilScripts, src } = require('../../helper/path');

const { find } = require(`${src}/handler/db`);
const { findModels } = require(`${src}/models/modelSettings`);
const { deleteIfUndefined } = require(`${src}/utils/helper/objects`);
const { disconnect } = require(`${src}/handler/db`);
const { stringToUUID } = require(`${src}/utils/helper/uuids`);

const { modelTypes } = require(`${src}/models/modelSettings.constants`);
const { CLASH_RUNS_COL, clashRunStatus } = require(`${src}/models/clashes.constants`);

const ResetProcessingFlags = require(`${utilScripts}/modelProcessing/resetProcessingFlags`);

const modelStates = ['ok', 'failed', 'processing', 'queued'];
const clashRunStates = Object.values(clashRunStatus);
const terminalClashRunStates = [clashRunStatus.COMPLETED, clashRunStatus.FAILED, clashRunStatus.ABORTED];
const manualCancellationReason = 'Cancelled manually';
const resetTypes = {
	MODELS: 'models',
	DRAWINGS: 'drawings',
	CLASHES: 'clashes',
};
const project = generateRandomString();

const setupData = () => {
	const modelProms = times(2, async () => {
		const teamspace = generateRandomString();

		const models = await Promise.all(times(modelStates.length, async (n) => {
			const { _id, name, properties } = generateRandomModel({
				properties: deleteIfUndefined({ status: modelStates[n] }),
			});
			await createModel(teamspace, _id, name, properties);
			return _id;
		}));

		const drawings = await Promise.all(
			times(modelStates.length, async (n) => {
				const revision = generateRevisionEntry(false, true, modelTypes.DRAWING, null, modelStates[n]);
				await createRevision(
					teamspace, project, revision._id, { ...revision, model: revision._id }, modelTypes.DRAWING);

				return revision._id;
			},
			),
		);
		const clashProject = generateRandomProject();
		const clashRuns = clashRunStates.map((status, index) => {
			const plan = generateClashPlan(models[index % models.length], models[0]);
			const run = generateClashRun(plan, undefined, { status });
			return { plan, run: run._id, status };
		});

		await Promise.all(clashRuns.map(({ plan, run, status }) => createClashRuns(teamspace, clashProject.id,
			plan, [generateClashRun(plan, undefined, { _id: run, status })])));

		return { teamspace, models, drawings, clashRuns };
	});
	return Promise.all(modelProms);
};

const getAllResetIds = ({ models, drawings, clashRuns }) => ({
	resetModelIds: models,
	resetDrawingIds: drawings,
	resetClashRunIds: clashRuns.map(({ run }) => run),
});

const checkProcessingStatuses = async (teamspace, models, drawings, clashRuns, expectedResetIds = {}) => {
	const {
		resetModelIds = [],
		resetDrawingIds = [],
		resetClashRunIds = [],
	} = expectedResetIds;

	const modelsData = await findModels(teamspace, { _id: { $in: models } }, { _id: 1, status: 1 });

	const expectedModelsData = models.map((_id, ind) => ({
		_id,
		status: resetModelIds.includes(_id) ? undefined : modelStates[ind],
	}),
	);

	const drawingsData = await find(teamspace, 'drawings.history',
		{ model: { $in: drawings } },
		{ model: 1, status: 1, _id: 0 },
	);
	const expectedDrawingsData = drawings.map((_id, ind) => ({
		model: _id,
		status:
			resetDrawingIds.includes(_id) && !['ok', 'failed'].includes(modelStates[ind]) ? 'failed' : modelStates[ind],
	}));
	const clashRunsData = await find(teamspace, CLASH_RUNS_COL,
		{ _id: { $in: clashRuns.map(({ run }) => stringToUUID(run)) } },
		{ _id: 1, status: 1, results: 1 },
	);
	const expectedClashRunsData = clashRuns.map(({ run, status }) => {
		const shouldAbort = resetClashRunIds.includes(run) && !terminalClashRunStates.includes(status);
		return {
			_id: stringToUUID(run),
			status: shouldAbort ? clashRunStatus.ABORTED : status,
			...(shouldAbort ? { results: { error: { reason: manualCancellationReason } } } : {}),
		};
	});

	expect(modelsData.length).toBe(expectedModelsData.length);
	expect(modelsData).toEqual(expect.arrayContaining(expectedModelsData));

	expect(drawingsData.length).toBe(expectedDrawingsData.length);
	expect(drawingsData).toEqual(expect.arrayContaining(expectedDrawingsData));

	expect(clashRunsData.length).toBe(expectedClashRunsData.length);
	expect(clashRunsData).toEqual(expect.arrayContaining(expectedClashRunsData));
};

const checkAllProcessingStatuses = (data, getExpectedResetIds = () => ({})) => Promise.all(data.map(
	({ teamspace, models, drawings, clashRuns }, ind) => checkProcessingStatuses(
		teamspace,
		models,
		drawings,
		clashRuns,
		getExpectedResetIds({ models, drawings, clashRuns }, ind),
	),
));

const runTest = () => {
	describe('Reset Processing flags', () => {
		let data;
		beforeEach(async () => {
			await resetDB();
			data = await setupData();
		});

		test('Should throw an error if id is provided but not teamspace', async () => {
			const error = new Error('Teamspace must be provided if id is defined');
			await expect(ResetProcessingFlags.run(undefined, generateRandomString())).rejects.toEqual(error);
			await checkAllProcessingStatuses(data);
		});

		test('Should throw an error if type is invalid', async () => {
			const invalidType = generateRandomString();
			const error = new Error(`Type must be one of: ${Object.values(resetTypes).join(', ')}`);
			await expect(ResetProcessingFlags.run(data[0].teamspace, undefined, invalidType)).rejects.toEqual(error);
			await checkAllProcessingStatuses(data);
		});

		test('Should only process the predefined teamspace if it is defined', async () => {
			await ResetProcessingFlags.run(data[0].teamspace);
			await checkAllProcessingStatuses(data, (entry, ind) => (ind === 0 ? getAllResetIds(entry) : {}));
		});

		test('Should only process the predefined model id if it is defined', async () => {
			const lastInd = data[0].models.length - 1;
			const resetModelIds = [data[0].models[lastInd]];
			await ResetProcessingFlags.run(data[0].teamspace, resetModelIds[0]);
			await checkAllProcessingStatuses(data, (_, ind) => (ind === 0 ? {
				resetModelIds,
			} : {}));
		});

		test('Should only process the predefined drawing id if it is defined', async () => {
			const lastInd = data[0].drawings.length - 1;
			const resetDrawingIds = [data[0].drawings[lastInd]];
			await ResetProcessingFlags.run(data[0].teamspace, resetDrawingIds[0]);
			await checkAllProcessingStatuses(data, (entry, ind) => (ind === 0 ? { resetDrawingIds } : {}));
		});

		test('Should only process the predefined clash run id if it is defined', async () => {
			const resetClashRun = data[0].clashRuns.find(({ status }) => !terminalClashRunStates.includes(status));
			await ResetProcessingFlags.run(data[0].teamspace, resetClashRun.run, resetTypes.CLASHES);
			await checkAllProcessingStatuses(data, (entry, ind) => (ind === 0
				? { resetClashRunIds: [resetClashRun.run] } : {}));
		});

		test('Should only process models if type is defined', async () => {
			await ResetProcessingFlags.run(data[0].teamspace, undefined, resetTypes.MODELS);
			await checkAllProcessingStatuses(data, ({ models }, ind) => (ind === 0 ? { resetModelIds: models } : {}));
		});

		test('Should only process drawings if type is defined', async () => {
			await ResetProcessingFlags.run(data[0].teamspace, undefined, resetTypes.DRAWINGS);
			await checkAllProcessingStatuses(data, ({ drawings }, ind) => (ind === 0
				? { resetDrawingIds: drawings } : {}));
		});

		test('Should only process clash runs if type is defined', async () => {
			await ResetProcessingFlags.run(data[0].teamspace, undefined, resetTypes.CLASHES);
			await checkAllProcessingStatuses(data, ({ clashRuns }, ind) => (ind === 0
				? { resetClashRunIds: clashRuns.map(({ run }) => run) } : {}));
		});

		test('Should process all items if no parameters are provided', async () => {
			await ResetProcessingFlags.run();
			await checkAllProcessingStatuses(data, getAllResetIds);
		});

		test('Should do nothing if teamspace is not found', async () => {
			await ResetProcessingFlags.run(generateRandomString());
			await checkAllProcessingStatuses(data);
		});

		test('Should do nothing if id is not found', async () => {
			await ResetProcessingFlags.run(data[0].teamspace, generateRandomString());
			await checkAllProcessingStatuses(data);
		});
	});
};

describe(determineTestGroup(__filename), () => {
	runTest();
	afterAll(disconnect);
});
