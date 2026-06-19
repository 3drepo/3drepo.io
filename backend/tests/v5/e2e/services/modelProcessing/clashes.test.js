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

const { determineTestGroup } = require('../../../helper/utils');
const ServiceHelper = require('../../../helper/services');
const { src } = require('../../../helper/path');

const DBHandler = require(`${src}/handler/db`);
const EventsManager = require(`${src}/services/eventsManager/eventsManager`);
const { queueMessage } = require(`${src}/handler/queue`);
const {
	CLASH_RUNS_COL,
	clashRunStatus,
	triggerOptions,
} = require(`${src}/models/clashes.constants`);
const { cn_queue: queueConfig } = require(`${src}/utils/config`);
const { callback_queue: callbackq, shared_storage: sharedDir } = queueConfig;
const { deleteModel } = require(`${src}/models/modelSettings`);
const { events } = require(`${src}/services/eventsManager/eventsManager.constants`);
const { getClashRunByQuery } = require(`${src}/models/clashes.runs`);
const { fileExists, getFileAsStream, storeFile } = require(`${src}/services/filesManager`);
const { modelTypes, processStatuses } = require(`${src}/models/modelSettings.constants`);
const { stringToUUID } = require(`${src}/utils/helper/uuids`);
const fs = require('fs');
const path = require('path');

jest.mock('../../../../../src/v5/services/mailer');

const SHARED_SPACE_TAG = '$SHARED_SPACE';
const DAY_IN_MS = 24 * 60 * 60 * 1000;

let server;

const formatClash = (clash) => {
	const formatClashObject = (objectId) => {
		const [container, idType, id, bboxJSON] = objectId.split('::');
		return {
			bbox: JSON.parse(bboxJSON),
			index: [container, idType, id].join('::'),
			object: { container, idType, id },
		};
	};
	const objectA = formatClashObject(clash.a);
	const objectB = formatClashObject(clash.b);

	return {
		...clash,
		a: objectA.object,
		b: objectB.object,
		index: [objectA.index, objectB.index].sort().join('-'),
		bbox: {
			min: objectA.bbox.min.map((value, i) => Math.min(value, objectB.bbox.min[i])),
			max: objectA.bbox.max.map((value, i) => Math.max(value, objectB.bbox.max[i])),
		},
	};
};

const generateBasicData = () => {
	const user = ServiceHelper.generateUserCredentials();
	const project = ServiceHelper.generateRandomProject();
	const modelA = ServiceHelper.generateRandomModel();
	const modelB = ServiceHelper.generateRandomModel();

	return ({
		user,
		teamspace: ServiceHelper.generateRandomString(),
		project,
		modelA,
		modelB,
	});
};

const generateRunData = (hasPreviousRun) => {
	const modelA = ServiceHelper.generateRandomModel();
	const modelB = ServiceHelper.generateRandomModel();
	const plan = ServiceHelper.generateClashPlan(modelA._id, modelB._id);
	const previousClashes = hasPreviousRun ? ServiceHelper.generateClashes(plan) : [];
	const previousRunDate = new Date(Date.now() - DAY_IN_MS);

	return ({
		run: ServiceHelper.generateClashRun(plan),
		previousRun: hasPreviousRun
			? ServiceHelper.generateClashRun(plan,
				{ new: previousClashes.map(formatClash), active: [], resolved: [] },
				{ triggeredAt: previousRunDate })
			: undefined,
		previousClashes,
	});
};

const setupBasicData = async ({
	user,
	teamspace,
	project,
	modelA,
	modelB,
}) => {
	await ServiceHelper.db.createUser(user);
	await ServiceHelper.db.createTeamspace(teamspace, [user.user]);

	await Promise.all([
		ServiceHelper.db.createProject(teamspace, project.id, project.name, [modelA._id, modelB._id]),
		ServiceHelper.db.createModel(teamspace, modelA._id, modelA.name, modelA.properties),
		ServiceHelper.db.createModel(teamspace, modelB._id, modelB.name, modelB.properties),
		ServiceHelper.db.createRevision(teamspace, project.id, modelA._id,
			ServiceHelper.generateRevisionEntry(), modelTypes.CONTAINER),
		ServiceHelper.db.createRevision(teamspace, project.id, modelB._id,
			ServiceHelper.generateRevisionEntry(), modelTypes.CONTAINER),
	]);
};

const eventTriggeredPromise = (event) => new Promise(
	(resolve) => EventsManager.subscribe(event, () => setTimeout(resolve, 10)),
);

const getResultsPath = (run) => path.join(SHARED_SPACE_TAG, `${run._id}`, 'results.json');

const writeResultsFile = (run, clashes) => {
	const resultsDir = path.join(sharedDir, `${run._id}`);
	fs.mkdirSync(resultsDir, { recursive: true });
	fs.writeFileSync(path.join(resultsDir, 'results.json'), JSON.stringify({ clashes }), 'utf8');
};

const removeResultsFiles = (runs) => {
	runs.forEach((run) => {
		const resultsDir = path.join(sharedDir, `${run._id}`);
		fs.rmSync(resultsDir, { recursive: true, force: true });
	});
};

const getFileContents = async (teamspace, fileId) => {
	const { readStream } = await getFileAsStream(teamspace, CLASH_RUNS_COL, fileId);

	return new Promise((resolve, reject) => {
		const chunks = [];

		readStream.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
		readStream.on('error', reject);
		readStream.on('end', () => {
			resolve(Buffer.concat(chunks).toString('utf8'));
		});
	});
};

const testParseClashResults = () => {
	const basicData = generateBasicData();
	const { teamspace, project, modelA, modelB } = basicData;
	const planWithPreviousRun = ServiceHelper.generateClashPlan(modelA._id, modelA._id);
	const planForBouncerError = ServiceHelper.generateClashPlan(modelA._id, modelB._id);
	const planWithoutPreviousRun = ServiceHelper.generateClashPlan(modelB._id, modelB._id);
	const previousRunDate = new Date(Date.now() - DAY_IN_MS);
	const [runWithPreviousRun, bouncerErrorRun, runWithoutPreviousRun] = [
		planWithPreviousRun,
		planForBouncerError,
		planWithoutPreviousRun,
	]
		.map((plan) => ServiceHelper.generateClashRun(plan));
	const clashes = ServiceHelper.generateClashes(planWithPreviousRun);
	const previousCompletedRun = ServiceHelper.generateClashRun(planWithPreviousRun,
		{ new: clashes.map(formatClash), active: [], resolved: [] },
		{ triggeredAt: previousRunDate });
	const resultsWithPreviousRun = getResultsPath(runWithPreviousRun);
	const resultsForBouncerError = getResultsPath(bouncerErrorRun);
	const resultsWithoutPreviousRun = getResultsPath(runWithoutPreviousRun);
	const basicCBData = { type: 'clash', teamspace, project: project.id };
	const missingResultsData = generateRunData(false);
	const missingResultsPath = getResultsPath(missingResultsData.run);
	const unreadablePreviousResultsData = generateRunData(true);
	const unreadablePreviousResultsClashes = ServiceHelper.generateClashes(unreadablePreviousResultsData.run.plan);
	const resolvedData = generateRunData(true);
	const newClashesData = generateRunData(true);
	const mixedData = generateRunData(true);
	const newClashes = ServiceHelper.generateClashes(newClashesData.run.plan);
	const mixedActiveClashes = mixedData.previousClashes.slice(0, 5);
	const mixedNewClashes = ServiceHelper.generateClashes(mixedData.run.plan, 5);
	const mixedResolvedClashes = mixedData.previousClashes.slice(5);
	const clashRunData = [
		{ plan: planWithPreviousRun, runs: [runWithPreviousRun, previousCompletedRun] },
		{ plan: planForBouncerError, runs: [bouncerErrorRun] },
		{ plan: planWithoutPreviousRun, runs: [runWithoutPreviousRun] },
		...[missingResultsData, unreadablePreviousResultsData, resolvedData, newClashesData, mixedData]
			.map(({ run, previousRun }) => ({ plan: run.plan, runs: [run, previousRun].filter(Boolean) })),
	];
	const scenarioRuns = [
		missingResultsData, unreadablePreviousResultsData, resolvedData, newClashesData, mixedData,
	].map(({ run }) => run);

	describe('Parse clash results', () => {
		beforeAll(async () => {
			await setupBasicData(basicData);
			await Promise.all([
				ServiceHelper.db.createClashPlans(teamspace, project.id, [
					planWithPreviousRun,
					planForBouncerError,
					planWithoutPreviousRun,
				]),
				...clashRunData.map(({ plan, runs }) => (
					ServiceHelper.db.createClashRuns(teamspace, project.id, plan, runs)
				)),
			]);
			await storeFile(teamspace, CLASH_RUNS_COL,
				stringToUUID(unreadablePreviousResultsData.previousRun._id), Buffer.from('{'));
		});

		describe.each([
			['Bouncer returned an error', false, bouncerErrorRun, { ...basicCBData, results: resultsForBouncerError, value: 28 }, clashes],
			['the results file from the callback object is not found', false, missingResultsData.run, { ...basicCBData, results: missingResultsPath, value: 0 }, undefined, undefined, undefined, clashRunStatus.FAILED, 'Could not read results file:'],
			['the results data from the previous run cannot be read', false, unreadablePreviousResultsData.run, { ...basicCBData, results: getResultsPath(unreadablePreviousResultsData.run), value: 0 }, unreadablePreviousResultsClashes, undefined, undefined, clashRunStatus.FAILED, 'Error retrieving clashes from last run:'],
			['Bouncer returned success and there was no previous run', true, runWithoutPreviousRun, { ...basicCBData, results: resultsWithoutPreviousRun, value: 0 }, clashes, { new: clashes.length, active: 0, resolved: 0 }, { new: clashes.map(formatClash), active: [], resolved: [] }],
			['Bouncer returned success and there was a run', true, runWithPreviousRun, { ...basicCBData, results: resultsWithPreviousRun, value: 0 }, clashes, { new: 0, active: clashes.length, resolved: 0 }, { new: [], active: clashes.map(formatClash), resolved: [] }],
			['there was a previous run and all clashes were resolved', true, resolvedData.run, { ...basicCBData, results: getResultsPath(resolvedData.run), value: 0 }, [], { new: 0, active: 0, resolved: resolvedData.previousClashes.length }, { new: [], active: [], resolved: resolvedData.previousClashes.map(formatClash) }],
			['there was a previous run and all found clashes were new', true, newClashesData.run, { ...basicCBData, results: getResultsPath(newClashesData.run), value: 0 }, newClashes, { new: newClashes.length, active: 0, resolved: newClashesData.previousClashes.length }, { new: newClashes.map(formatClash), active: [], resolved: newClashesData.previousClashes.map(formatClash) }],
			['there was a previous run with resolved, active and new clashes', true, mixedData.run, { ...basicCBData, results: getResultsPath(mixedData.run), value: 0 }, [...mixedActiveClashes, ...mixedNewClashes], { new: mixedNewClashes.length, active: mixedActiveClashes.length, resolved: mixedResolvedClashes.length }, { new: mixedNewClashes.map(formatClash), active: mixedActiveClashes.map(formatClash), resolved: mixedResolvedClashes.map(formatClash) }],
		])('', (desc, success, clashRun, callbackObj, resultsFileClashes, runStats, runRes, expectedStatus, errorReason) => {
			beforeEach(() => {
				if (resultsFileClashes) {
					writeResultsFile(clashRun, resultsFileClashes);
				}
			});

			afterEach(() => {
				removeResultsFiles([runWithPreviousRun, bouncerErrorRun, runWithoutPreviousRun, ...scenarioRuns]);
			});

			test(`Should ${success ? 'succeed' : 'fail'} if ${desc}`, async () => {
				await queueMessage(callbackq, clashRun._id, JSON.stringify(callbackObj));

				// wait for the queue to process the message
				await ServiceHelper.sleepMS(1000);

				const run = await getClashRunByQuery(teamspace, stringToUUID(project.id),
					{ _id: stringToUUID(clashRun._id) }, { _id: 1, status: 1, results: 1 });

				if (success) {
					expect(run.status).toEqual(clashRunStatus.COMPLETED);
					expect(run.results.stats).toEqual(runStats);
					const contents = await getFileContents(teamspace, run._id);
					const parsedContents = JSON.parse(contents);

					expect(parsedContents).toEqual(runRes);
				} else if (expectedStatus) {
					expect(run.status).toEqual(expectedStatus);
					expect(run.results.error.reason).toEqual(expect.stringContaining(errorReason));
				} else {
					expect(run.status).toEqual(clashRunStatus.FAILED);
					expect(run.results.error.code).toEqual(callbackObj.value);
					expect(run.results.error.reason).toEqual(expect.any(String));
				}
			});
		});

		test('Should abort an older completed run and still process the latest run', async () => {
			const plan = ServiceHelper.generateClashPlan(modelA._id, modelB._id);
			const oldRun = ServiceHelper.generateClashRun(plan, undefined, { triggeredAt: previousRunDate });
			const newRun = ServiceHelper.generateClashRun(plan);
			const oldClashes = ServiceHelper.generateClashes(plan);
			const latestRunClashes = ServiceHelper.generateClashes(plan);
			const callbackData = { type: 'clash', teamspace, project: project.id };

			await Promise.all([
				ServiceHelper.db.createClashPlans(teamspace, project.id, [plan]),
				ServiceHelper.db.createClashRuns(teamspace, project.id, plan, [oldRun, newRun]),
			]);

			try {
				writeResultsFile(oldRun, oldClashes);

				await queueMessage(callbackq, oldRun._id, JSON.stringify({
					...callbackData,
					results: getResultsPath(oldRun),
					value: 0,
				}));

				await ServiceHelper.sleepMS(1000);

				const oldRunInDb = await getClashRunByQuery(teamspace, stringToUUID(project.id),
					{ _id: stringToUUID(oldRun._id) }, { _id: 1, status: 1, results: 1 });

				expect(oldRunInDb.status).toEqual(clashRunStatus.ABORTED);
				expect(oldRunInDb.results.error.reason).toEqual(
					'Clash run aborted because it has been superseded by a newer run.');
				await expect(fileExists(teamspace, CLASH_RUNS_COL, oldRunInDb._id)).resolves.toEqual(false);

				writeResultsFile(newRun, latestRunClashes);

				await queueMessage(callbackq, newRun._id, JSON.stringify({
					...callbackData,
					results: getResultsPath(newRun),
					value: 0,
				}));

				await ServiceHelper.sleepMS(1000);

				const newRunInDb = await getClashRunByQuery(teamspace, stringToUUID(project.id),
					{ _id: stringToUUID(newRun._id) }, { _id: 1, status: 1, results: 1 });
				const expectedResults = { new: latestRunClashes.map(formatClash), active: [], resolved: [] };

				expect(newRunInDb.status).toEqual(clashRunStatus.COMPLETED);
				expect(newRunInDb.results.stats).toEqual({ new: latestRunClashes.length, active: 0, resolved: 0 });
				expect(JSON.parse(await getFileContents(teamspace, newRunInDb._id))).toEqual(expectedResults);
			} finally {
				removeResultsFiles([oldRun, newRun]);
			}
		});
	});
};

const getRunsByModel = (teamspace, projectId, modelId) => {
	const query = {
		project: stringToUUID(projectId),
		$or: [
			{ 'plan.selectionA.container': modelId },
			{ 'plan.selectionB.container': modelId },
		],
		'plan.trigger': triggerOptions.NEW_REVISION,
	};

	return DBHandler.find(teamspace, CLASH_RUNS_COL, query);
};

const testStartClashRunsAfterNewRev = () => {
	describe('Start clash runs after new revision', () => {
		const basicData = generateBasicData();
		const { user, teamspace, project, modelA, modelB } = basicData;
		const modelWithNoRevs = ServiceHelper.generateRandomModel();
		const [planWithModelA, planWithModelB, planWithModelWithoutRevisions] = [
			modelA,
			modelB,
			modelWithNoRevs,
		].map((model) => (
			ServiceHelper.generateClashPlan(modelA._id, model._id)
		));

		beforeAll(async () => {
			await setupBasicData(basicData);
			await Promise.all([
				ServiceHelper.db.createModel(teamspace, modelWithNoRevs._id,
					modelWithNoRevs.name, modelWithNoRevs.properties),
				ServiceHelper.db.createClashPlans(teamspace, project.id, [
					planWithModelA,
					planWithModelB,
					planWithModelWithoutRevisions,
				]),
			]);
		});

		test('Should start clash runs if there are plans related to the model and there are revisions', async () => {
			const waitOnEvent = eventTriggeredPromise(events.MODEL_IMPORT_FINISHED);
			const data = { teamspace,
				project: stringToUUID(project.id),
				model: modelA._id,
				user: user.user,
				modelType: modelTypes.CONTAINER,
				data: { status: processStatuses.OK } };

			const existingRunsA = await getRunsByModel(teamspace, project.id, modelA._id);
			const existingRunsB = await getRunsByModel(teamspace, project.id, modelB._id);

			EventsManager.publish(events.MODEL_IMPORT_FINISHED, data);
			await waitOnEvent;

			await ServiceHelper.sleepMS(1000);

			const newRunsA = await getRunsByModel(teamspace, project.id, modelA._id);
			expect(newRunsA.length).toEqual(existingRunsA.length + 2);

			const newRunsB = await getRunsByModel(teamspace, project.id, modelB._id);
			expect(newRunsB.length).toEqual(existingRunsB.length + 1);

			const modelWithNoRevsRuns = await getRunsByModel(teamspace, project.id, modelWithNoRevs._id);
			expect(modelWithNoRevsRuns.length).toEqual(0);
		});

		test('Should not start clash run if the revision has failed', async () => {
			const waitOnEvent = eventTriggeredPromise(events.MODEL_IMPORT_FINISHED);
			const data = { teamspace,
				project: stringToUUID(project.id),
				model: modelA._id,
				user: user.user,
				modelType: modelTypes.CONTAINER,
				data: { status: processStatuses.FAILED, errorReason: ServiceHelper.generateRandomObject() } };

			const existingRunsA = await getRunsByModel(teamspace, project.id, modelA._id);
			const existingRunsB = await getRunsByModel(teamspace, project.id, modelB._id);

			EventsManager.publish(events.MODEL_IMPORT_FINISHED, data);
			await waitOnEvent;

			await ServiceHelper.sleepMS(1000);

			const newRunsA = await getRunsByModel(teamspace, project.id, modelA._id);
			expect(newRunsA.length).toEqual(existingRunsA.length);

			const newRunsB = await getRunsByModel(teamspace, project.id, modelB._id);
			expect(newRunsB.length).toEqual(existingRunsB.length);
		});

		test('Should not start clash run if the revision is not for a container', async () => {
			const waitOnEvent = eventTriggeredPromise(events.MODEL_IMPORT_FINISHED);
			const data = { teamspace,
				project: stringToUUID(project.id),
				model: modelA._id,
				user: user.user,
				modelType: modelTypes.DRAWING,
				data: { status: processStatuses.OK } };

			const existingRunsA = await getRunsByModel(teamspace, project.id, modelA._id);
			const existingRunsB = await getRunsByModel(teamspace, project.id, modelB._id);

			EventsManager.publish(events.MODEL_IMPORT_FINISHED, data);
			await waitOnEvent;

			await ServiceHelper.sleepMS(1000);

			const newRunsA = await getRunsByModel(teamspace, project.id, modelA._id);
			expect(newRunsA.length).toEqual(existingRunsA.length);

			const newRunsB = await getRunsByModel(teamspace, project.id, modelB._id);
			expect(newRunsB.length).toEqual(existingRunsB.length);
		});

		test('Should not start clash run for a plan where one container is deleted', async () => {
			const waitOnEvent = eventTriggeredPromise(events.MODEL_IMPORT_FINISHED);
			const data = { teamspace,
				project: stringToUUID(project.id),
				model: modelB._id,
				user: user.user,
				modelType: modelTypes.CONTAINER,
				data: { status: processStatuses.OK } };

			const existingRunsB = await getRunsByModel(teamspace, project.id, modelB._id);

			await deleteModel(teamspace, project.id, modelA._id);
			EventsManager.publish(events.MODEL_IMPORT_FINISHED, data);
			await waitOnEvent;

			await ServiceHelper.sleepMS(1000);

			const newRunsB = await getRunsByModel(teamspace, project.id, modelB._id);
			expect(newRunsB.length).toEqual(existingRunsB.length);
		});
	});
};

describe(determineTestGroup(__filename), () => {
	beforeAll(async () => {
		server = await ServiceHelper.app();
	});

	afterAll(async () => {
		await ServiceHelper.queue.purgeQueues();
		await ServiceHelper.closeApp(server);
	});
	testParseClashResults();
	testStartClashRunsAfterNewRev();
});
