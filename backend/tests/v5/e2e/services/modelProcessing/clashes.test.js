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

const { queueMessage } = require(`${src}/handler/queue`);
const { RUN_HISTORY_COL, clashRunStatus } = require(`${src}/models/clashes.constants`);
const { cn_queue: queueConfig } = require(`${src}/utils/config`);
const { callback_queue: callbackq, shared_storage: sharedDir } = queueConfig;
const { getClashRunByQuery } = require(`${src}/models/clashes.runs`);
const { getFileAsStream, storeFile } = require(`${src}/services/filesManager`);
const { stringToUUID } = require(`${src}/utils/helper/uuids`);
const fs = require('fs');
const path = require('path');

const { processStatuses } = require(`${src}/models/modelSettings.constants`);

const EventsManager = require(`${src}/services/eventsManager/eventsManager`);
const { events } = require(`${src}/services/eventsManager/eventsManager.constants`);
const { triggerOptions, CLASH_RUNS_COL } = require(`${src}/models/clashes.constants`);
const DBHandler = require(`${src}/handler/db`);
const { deleteModel } = require(`${src}/models/modelSettings`);

const { modelTypes } = require(`${src}/models/modelSettings.constants`);

jest.mock('../../../../../src/v5/services/mailer');

const SHARED_SPACE_TAG = '$SHARED_SPACE';

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
	const modelWithNoRevs = ServiceHelper.generateRandomModel();

	const planA = {
		...ServiceHelper.generateClashPlan(modelA._id, modelA._id),
		trigger: [triggerOptions.NEW_REVISION],
	};
	const planB = {
		...ServiceHelper.generateClashPlan(modelA._id, modelB._id),
		trigger: [triggerOptions.NEW_REVISION],
	};
	const planWithNoRevs = {
		...ServiceHelper.generateClashPlan(modelA._id, modelWithNoRevs._id),
		trigger: [triggerOptions.NEW_REVISION],
	};

	return ({
		user,
		teamspace: ServiceHelper.generateRandomString(),
		project,
		plannedClashRun1: ServiceHelper.generateClashRun(planA),
		plannedClashRun2: ServiceHelper.generateClashRun(planB),
		completedClashRun: { ...ServiceHelper.generateClashRun(planA), status: clashRunStatus.COMPLETED },
		clashes: ServiceHelper.generateClashes(planA),
		modelA,
		modelB,
		modelWithNoRevs,
		planA,
		planB,
		planWithNoRevs,
	});
};

const generateRunData = (hasPreviousRun) => {
	const modelA = ServiceHelper.generateRandomModel();
	const modelB = ServiceHelper.generateRandomModel();
	const planA = ServiceHelper.generateClashPlan(modelA._id, modelB._id);
	const previousClashes = hasPreviousRun ? ServiceHelper.generateClashes(planA) : [];

	return ({
		run: ServiceHelper.generateClashRun(planA),
		previousRun: hasPreviousRun
			? { ...ServiceHelper.generateClashRun(planA), status: clashRunStatus.COMPLETED }
			: undefined,
		previousClashes,
	});
};

const setupBasicData = async ({
	user,
	teamspace,
	project,
	plannedClashRun1,
	plannedClashRun2,
	clashes,
	completedClashRun,
	modelA,
	modelB,
	modelWithNoRevs,
	planA,
	planB,
	planWithNoRevs,
}) => {
	await ServiceHelper.db.createUser(user);
	await ServiceHelper.db.createTeamspace(teamspace, [user.user]);

	const categorizedClashes = { new: clashes.map(formatClash), active: [], resolved: [] };
	await Promise.all([
		ServiceHelper.db.createProject(teamspace, project.id, project.name,
			[modelA._id, modelB._id, modelWithNoRevs._id]),
		ServiceHelper.db.createModel(teamspace, modelA._id, modelA.name, modelA.properties),
		ServiceHelper.db.createModel(teamspace, modelB._id, modelB.name, modelB.properties),
		ServiceHelper.db.createModel(teamspace, modelWithNoRevs._id, modelWithNoRevs.name, modelWithNoRevs.properties),
		ServiceHelper.db.createRevision(teamspace, project.id, modelA._id,
			ServiceHelper.generateRevisionEntry(), modelTypes.CONTAINER),
		ServiceHelper.db.createRevision(teamspace, project.id, modelB._id,
			ServiceHelper.generateRevisionEntry(), modelTypes.CONTAINER),
		ServiceHelper.db.createClashPlan(teamspace, project.id, planA),
		ServiceHelper.db.createClashPlan(teamspace, project.id, planB),
		ServiceHelper.db.createClashPlan(teamspace, project.id, planWithNoRevs),
		ServiceHelper.db.createClashRun(teamspace, project.id, plannedClashRun1),
		ServiceHelper.db.createClashRun(teamspace, project.id, plannedClashRun2),
		ServiceHelper.db.createClashRun(teamspace, project.id, completedClashRun, categorizedClashes),
	]);
};

const eventTriggeredPromise = (event) => new Promise(
	(resolve) => EventsManager.subscribe(event, () => setTimeout(resolve, 10)),
);

const setupRunData = async (teamspace, project, { run, previousRun, previousClashes }) => {
	await Promise.all([
		ServiceHelper.db.createClashRun(teamspace, project.id, run),
		previousRun
			? ServiceHelper.db.createClashRun(teamspace, project.id, previousRun,
				{ new: previousClashes.map(formatClash), active: [], resolved: [] })
			: Promise.resolve(),
	]);
};

const setupRunDataWithUnreadablePreviousResults = async (teamspace, project, { run, previousRun }) => {
	await Promise.all([
		ServiceHelper.db.createClashRun(teamspace, project.id, run),
		ServiceHelper.db.createClashRun(teamspace, project.id, previousRun),
		storeFile(teamspace, RUN_HISTORY_COL, stringToUUID(previousRun._id), Buffer.from('{')),
	]);
};

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
	const { readStream } = await getFileAsStream(teamspace, RUN_HISTORY_COL, fileId);

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
	const { teamspace, project, plannedClashRun1, plannedClashRun2, clashes } = basicData;
	const resultsRun1 = getResultsPath(plannedClashRun1);
	const resultsRun2 = getResultsPath(plannedClashRun2);
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
	const scenarioRuns = [
		missingResultsData, unreadablePreviousResultsData, resolvedData, newClashesData, mixedData,
	].map(({ run }) => run);

	describe('Parse clash results', () => {
		beforeAll(async () => {
			await setupBasicData(basicData);
			await Promise.all([
				missingResultsData,
				resolvedData,
				newClashesData,
				mixedData,
			].map((runData) => setupRunData(teamspace, project, runData)));
			await setupRunDataWithUnreadablePreviousResults(teamspace, project, unreadablePreviousResultsData);
		});

		describe.each([
			['Bouncer returned an error', false, plannedClashRun2, { ...basicCBData, results: resultsRun2, value: 28 }, clashes],
			['the results file from the callback object is not found', false, missingResultsData.run, { ...basicCBData, results: missingResultsPath, value: 0 }, undefined, undefined, undefined, clashRunStatus.FAILED, 'Could not read results file:'],
			['the results data from the previous run cannot be read', false, unreadablePreviousResultsData.run, { ...basicCBData, results: getResultsPath(unreadablePreviousResultsData.run), value: 0 }, unreadablePreviousResultsClashes, undefined, undefined, clashRunStatus.FAILED, 'Error retrieving clashes from last run:'],
			['Bouncer returned success and there was no previous run', true, plannedClashRun2, { ...basicCBData, results: resultsRun2, value: 0 }, clashes, { new: clashes.length, active: 0, resolved: 0 }, { new: clashes.map(formatClash), active: [], resolved: [] }],
			['Bouncer returned success and there was a run', true, plannedClashRun1, { ...basicCBData, results: resultsRun1, value: 0 }, clashes, { new: 0, active: clashes.length, resolved: 0 }, { new: [], active: clashes.map(formatClash), resolved: [] }],
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
				removeResultsFiles([plannedClashRun1, plannedClashRun2, ...scenarioRuns]);
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

		beforeAll(async () => {
			await setupBasicData(basicData);
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

			const modelWithNoRevsRuns = await getRunsByModel(teamspace, project.id, basicData.modelWithNoRevs._id);
			expect(modelWithNoRevsRuns.length).toEqual(0);
		});

		test('Should not start clash run if the revision has failed', async () => {
			const waitOnEvent = eventTriggeredPromise(events.MODEL_IMPORT_FINISHED);
			const data = { teamspace,
				project: stringToUUID(project.id),
				model: modelA._id,
				user: user.user,
				modelType: modelTypes.CONTAINER,
				data: { errorReason: ServiceHelper.generateRandomObject() } };

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
				data: { errorReason: ServiceHelper.generateRandomObject() } };

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

	afterAll(() => ServiceHelper.closeApp(server));
	testParseClashResults();
	testStartClashRunsAfterNewRev();
});
