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

jest.mock('../../../../../src/v5/services/mailer');

const SHARED_SPACE_TAG = '$SHARED_SPACE';

let server;

const formatClash = (clash) => ({
	...clash,
	a: { container: clash.a.split('::')[0], idType: clash.a.split('::')[1], id: clash.a.split('::')[2] },
	b: { container: clash.b.split('::')[0], idType: clash.b.split('::')[1], id: clash.b.split('::')[2] },
	index: [clash.a, clash.b].sort().join('-'),
});

const generateBasicData = () => {
	const project = ServiceHelper.generateRandomProject();
	const modelA = ServiceHelper.generateRandomModel();
	const modelB = ServiceHelper.generateRandomModel();
	const plan = ServiceHelper.generateClashPlan(modelA._id, modelB._id);
	const planWithNoRun = ServiceHelper.generateClashPlan(modelA._id, modelB._id);

	return ({
		teamspace: ServiceHelper.generateRandomString(),
		project,
		plannedClashRun1: ServiceHelper.generateClashRun(plan),
		plannedClashRun2: ServiceHelper.generateClashRun(planWithNoRun),
		completedClashRun: { ...ServiceHelper.generateClashRun(plan), status: clashRunStatus.COMPLETED },
		clashes: ServiceHelper.generateClashes(plan),
	});
};

const generateRunData = (hasPreviousRun) => {
	const modelA = ServiceHelper.generateRandomModel();
	const modelB = ServiceHelper.generateRandomModel();
	const plan = ServiceHelper.generateClashPlan(modelA._id, modelB._id);
	const previousClashes = hasPreviousRun ? ServiceHelper.generateClashes(plan) : [];

	return ({
		run: ServiceHelper.generateClashRun(plan),
		previousRun: hasPreviousRun
			? { ...ServiceHelper.generateClashRun(plan), status: clashRunStatus.COMPLETED }
			: undefined,
		previousClashes,
	});
};

const setupBasicData = async ({
	teamspace,
	project,
	plannedClashRun1,
	plannedClashRun2,
	clashes,
	completedClashRun,
}) => {
	const categorizedClashes = { new: clashes.map(formatClash), active: [], resolved: [] };
	await Promise.all([
		ServiceHelper.db.createClashRun(teamspace, project.id, plannedClashRun1),
		ServiceHelper.db.createClashRun(teamspace, project.id, plannedClashRun2),
		ServiceHelper.db.createClashRun(teamspace, project.id, completedClashRun, categorizedClashes),
	]);
};

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
	const resolvedIndexes = (clashArr) => clashArr.map(formatClash).map(({ index }) => index);
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
			['there was a previous run and all clashes were resolved', true, resolvedData.run, { ...basicCBData, results: getResultsPath(resolvedData.run), value: 0 }, [], { new: 0, active: 0, resolved: resolvedData.previousClashes.length }, { new: [], active: [], resolved: resolvedIndexes(resolvedData.previousClashes) }],
			['there was a previous run and all found clashes were new', true, newClashesData.run, { ...basicCBData, results: getResultsPath(newClashesData.run), value: 0 }, newClashes, { new: newClashes.length, active: 0, resolved: newClashesData.previousClashes.length }, { new: newClashes.map(formatClash), active: [], resolved: resolvedIndexes(newClashesData.previousClashes) }],
			['there was a previous run with resolved, active and new clashes', true, mixedData.run, { ...basicCBData, results: getResultsPath(mixedData.run), value: 0 }, [...mixedActiveClashes, ...mixedNewClashes], { new: mixedNewClashes.length, active: mixedActiveClashes.length, resolved: mixedResolvedClashes.length }, { new: mixedNewClashes.map(formatClash), active: mixedActiveClashes.map(formatClash), resolved: resolvedIndexes(mixedResolvedClashes) }],
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

describe(determineTestGroup(__filename), () => {
	beforeAll(async () => {
		server = await ServiceHelper.app();
	});

	afterAll(() => ServiceHelper.closeApp(server));

	testParseClashResults();
});
