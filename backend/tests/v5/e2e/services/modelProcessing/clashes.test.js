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
const { times } = require('lodash');
const ServiceHelper = require('../../../helper/services');
const { src } = require('../../../helper/path');

const { queueMessage } = require(`${src}/handler/queue`);
const { modelTypes } = require(`${src}/models/modelSettings.constants`);
const { RUN_HISTORY_COL, clashRunStatus } = require(`${src}/models/clashes.constants`);
const { cn_queue: queueConfig } = require(`${src}/utils/config`);
const { callback_queue: callbackq, shared_storage: sharedDir } = queueConfig;
const { getClashRunByQuery } = require(`${src}/models/clashes.runs`);
const { getFileAsStream } = require(`${src}/services/filesManager`);
const { stringToUUID } = require(`${src}/utils/helper/uuids`);
const fs = require('fs');
const path = require('path');

const SHARED_SPACE_TAG = '$SHARED_SPACE';

let server;

const formatClash = (clash) => ({
	...clash,
	a: { container: clash.a.split('::')[0], idType: clash.a.split('::')[1], id: clash.a.split('::')[2] },
	b: { container: clash.b.split('::')[0], idType: clash.b.split('::')[1], id: clash.b.split('::')[2] },
	index: [clash.a, clash.b].sort().join('-'),
});

const generateBasicData = () => {
	const user = ServiceHelper.generateUserCredentials();
	const models = times(2, () => ServiceHelper.generateRandomModel());
	const revisions = times(2, () => ServiceHelper.generateRevisionEntry());
	const project = ServiceHelper.generateRandomProject();
	const plan = ServiceHelper.generateClashPlan(models[0]._id, models[1]._id);
	const planWithNoRun = ServiceHelper.generateClashPlan(models[0]._id, models[1]._id);

	return ({
		user,
		teamspace: ServiceHelper.generateRandomString(),
		project,
		models,
		revisions,
		plan,
		planWithNoRun,
		plannedClashRun1: ServiceHelper.generateClashRun(plan),
		plannedClashRun2: ServiceHelper.generateClashRun(planWithNoRun),
		completedClashRun: { ...ServiceHelper.generateClashRun(plan), status: clashRunStatus.COMPLETED },
		clashes: ServiceHelper.generateClashes(plan),
	});
};

const setupBasicData = async ({
	user,
	teamspace,
	project,
	models,
	revisions,
	plan,
	planWithNoRun,
	plannedClashRun1,
	plannedClashRun2,
	clashes,
	completedClashRun,
}) => {
	await ServiceHelper.db.createUser(user);
	await ServiceHelper.db.createTeamspace(teamspace, [user.user]);

	const categorizedClashes = { new: clashes.map(formatClash), active: [], resolved: [] };
	await Promise.all([
		ServiceHelper.db.createProject(teamspace, project.id, project.name, models.map((m) => m._id)),
		...models.map((model) => ServiceHelper.db.createModel(
			teamspace,
			model._id,
			model.name,
			model.properties,
		)),
		...revisions.map((rev, i) => ServiceHelper.db.createRevision(teamspace,
			project.id, models[i]._id, rev, modelTypes.CONTAINER)),
		ServiceHelper.db.createClashPlan(teamspace, plan),
		ServiceHelper.db.createClashPlan(teamspace, planWithNoRun),
		ServiceHelper.db.createClashRun(teamspace, project.id, plannedClashRun1),
		ServiceHelper.db.createClashRun(teamspace, project.id, plannedClashRun2),
		ServiceHelper.db.createClashRun(teamspace, project.id, completedClashRun, categorizedClashes),
	]);
};

const writeResultsFiles = (runs, clashes) => {
	runs.forEach((run) => {
		const resultsDir = path.join(sharedDir, `${run._id}`);
		fs.mkdirSync(resultsDir, { recursive: true });
		fs.writeFileSync(path.join(resultsDir, 'results.json'), JSON.stringify({ clashes }), 'utf8');
	});
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
	describe('Parse clash results', () => {
		const basicData = generateBasicData();
		const { teamspace, project, plannedClashRun1, plannedClashRun2, clashes } = basicData;
		const plannedRuns = [plannedClashRun1, plannedClashRun2];

		beforeAll(async () => {
			await setupBasicData(basicData);
		});

		beforeEach(() => {
			writeResultsFiles(plannedRuns, clashes);
		});

		afterEach(() => {
			removeResultsFiles(plannedRuns);
		});

		test('should just set the run to failed if there is an error', async () => {
			const results = path.join(SHARED_SPACE_TAG, `${plannedClashRun2._id}`, 'results.json');
			const callbackObj = { type: 'clash', teamspace, project: project.id, results, value: 28 };

			await queueMessage(callbackq, plannedClashRun2._id, JSON.stringify(callbackObj));

			// wait for the queue to process the message
			await ServiceHelper.sleepMS(1000);

			const run = await getClashRunByQuery(teamspace, stringToUUID(project.id),
				{ _id: stringToUUID(plannedClashRun2._id) }, { _id: 1, status: 1, results: 1 });
			expect(run.status).toEqual(clashRunStatus.FAILED);
			expect(run.results.error.code).toEqual(callbackObj.value);
			expect(run.results.error.reason).toEqual(expect.any(String));
		});

		test('should parse results if there is no previous run', async () => {
			const results = path.join(SHARED_SPACE_TAG, `${plannedClashRun2._id}`, 'results.json');
			const callbackObj = { type: 'clash', teamspace, project: project.id, results, value: 0 };

			await queueMessage(callbackq, plannedClashRun2._id, JSON.stringify(callbackObj));

			// wait for the queue to process the message
			await ServiceHelper.sleepMS(1000);

			const run = await getClashRunByQuery(teamspace, stringToUUID(project.id),
				{ _id: stringToUUID(plannedClashRun2._id) }, { _id: 1, status: 1, results: 1 });
			expect(run.status).toEqual(clashRunStatus.COMPLETED);
			expect(run.results.stats).toEqual({ new: clashes.length, active: 0, resolved: 0 });

			const contents = await getFileContents(teamspace, run._id);
			const parsedContents = JSON.parse(contents);

			expect(parsedContents).toEqual({ new: clashes.map(formatClash), active: [], resolved: [] });
		});

		test('should parse results if there is previous run', async () => {
			const results = path.join(SHARED_SPACE_TAG, `${plannedClashRun1._id}`, 'results.json');
			const callbackObj = { type: 'clash', teamspace, project: project.id, results, value: 0 };

			await queueMessage(callbackq, plannedClashRun1._id, JSON.stringify(callbackObj));

			// wait for the queue to process the message
			await ServiceHelper.sleepMS(1000);

			const run = await getClashRunByQuery(teamspace, stringToUUID(project.id),
				{ _id: stringToUUID(plannedClashRun1._id) }, { _id: 1, status: 1, results: 1 });
			expect(run.status).toEqual(clashRunStatus.COMPLETED);
			expect(run.results.stats).toEqual({ new: 0, active: clashes.length, resolved: 0 });

			const contents = await getFileContents(teamspace, run._id);
			const parsedContents = JSON.parse(contents);

			expect(parsedContents).toEqual({ new: [], active: clashes.map(formatClash), resolved: [] });
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
