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

const { modelTypes, processStatuses } = require(`${src}/models/modelSettings.constants`);
const { clashRunStatus } = require(`${src}/models/clashes.constants`);
const { deleteIfUndefined } = require(`${src}/utils/helper/objects`);
const { disconnect } = require(`${src}/handler/db`);
const { templates: emailTemplates } = require(`${src}/services/mailer/mailer.constants`);

jest.mock('../../../../src/v5/services/mailer');
const Mailer = require(`${src}/services/mailer`);

const DetectZombieProcessing = require(`${utilScripts}/modelProcessing/detectZombieProcessing`);
const Path = require('path');

const modelStates = Object.values(processStatuses);
const clashRunStates = Object.values(clashRunStatus);
const terminalClashRunStates = [clashRunStatus.COMPLETED, clashRunStatus.FAILED, clashRunStatus.ABORTED];

const recentDate = new Date((new Date()) - 36 * 60 * 60 * 1000);

const setupData = () => {
	const modelProms = times(2, async () => {
		const teamspace = generateRandomString();
		const models = await Promise.all(times(modelStates.length, async (n) => {
			const { _id, name, properties } = generateRandomModel({
				properties: deleteIfUndefined({ status: modelStates[n], timestamp: recentDate }),
			});
			await createModel(teamspace, _id, name, properties);
			return { model: _id, status: modelStates[n] };
		}));
		const drawings = await Promise.all(times(modelStates.length, async (n) => {
			const project = generateRandomString();
			const revision = generateRevisionEntry(false, false, modelTypes.DRAWING, recentDate, modelStates[n]);
			await createRevision(teamspace, project, revision._id, revision, modelTypes.DRAWING);
			return { drawing: revision._id, status: modelStates[n] };
		}));
		const project = generateRandomProject();
		const plan = generateClashPlan(models[0].model, models[1].model);
		const clashRuns = clashRunStates.map((status) => (
			generateClashRun(plan, undefined, {
				status,
				triggeredAt: recentDate,
				updatedAt: recentDate,
			})
		));
		await createClashRuns(teamspace, project.id, plan, clashRuns);

		return { teamspace, models, drawings, clashRuns: clashRuns.map(({ _id, status }) => ({ run: _id, status })) };
	});
	return Promise.all(modelProms);
};

const checkMail = (data, filteredTeamspace) => {
	const expectedZombieEntries = data.reduce((acc, { teamspace, models, drawings, clashRuns }) => {
		if (!filteredTeamspace || teamspace === filteredTeamspace) {
			acc.models.push(...models
				.filter(({ status }) => status !== processStatuses.OK && status !== processStatuses.FAILED)
				.map(({ model, status }) => ({ teamspace, id: model, status, timestamp: recentDate })));
			acc.drawings.push(...drawings
				.filter(({ status }) => status !== processStatuses.OK && status !== processStatuses.FAILED)
				.map(({ drawing, status }) => ({ teamspace, id: drawing, status, timestamp: recentDate })));
			acc.clashRuns.push(...clashRuns
				.filter(({ status }) => !terminalClashRunStates.includes(status))
				.map(({ run, status }) => ({ teamspace, id: run, status, timestamp: recentDate })));
		}
		return acc;
	}, { models: [], drawings: [], clashRuns: [] });
	const zombieCount = Object.values(expectedZombieEntries).reduce((sum, entries) => sum + entries.length, 0);
	const expectedData = {
		script: Path.basename(__filename, Path.extname(__filename)).replace(/\.test/, ''),
		title: 'Zombie processing statuses found',
		message: `${zombieCount} zombie processing statuses found`,
	};
	expect(Mailer.sendSystemEmail).toHaveBeenCalledWith(
		emailTemplates.ZOMBIE_PROCESSING_STATUSES.name,
		expect.objectContaining(expectedData),
	);
	const { zombieEntries } = Mailer.sendSystemEmail.mock.calls[0][1];
	expect(zombieEntries.models).toEqual(expect.arrayContaining(expectedZombieEntries.models));
	expect(zombieEntries.drawings).toEqual(expect.arrayContaining(expectedZombieEntries.drawings));
	expect(zombieEntries.clashRuns).toEqual(expect.arrayContaining(expectedZombieEntries.clashRuns));
};

const runTest = () => {
	describe('Detect zombie processing', () => {
		let data;
		beforeEach(async () => {
			await resetDB();
			data = await setupData();
		});

		test('Should do nothing if notify is not set', async () => {
			await DetectZombieProcessing.run();
			expect(Mailer.sendSystemEmail).toHaveBeenCalledTimes(0);
		});

		test('Should send system mail if notify is set', async () => {
			await DetectZombieProcessing.run(undefined, undefined, true);
			expect(Mailer.sendSystemEmail).toHaveBeenCalledTimes(1);
			checkMail(data);
		});

		test('Should send system mail if the predefined teamspace exists', async () => {
			await DetectZombieProcessing.run(data[0].teamspace, undefined, true);
			expect(Mailer.sendSystemEmail).toHaveBeenCalledTimes(1);
			checkMail(data, data[0].teamspace);
		});

		test('Should do nothing if teamspace is not found', async () => {
			await DetectZombieProcessing.run(generateRandomString(), undefined, true);
			expect(Mailer.sendSystemEmail).toHaveBeenCalledTimes(0);
		});

		test('Should do nothing if time limit is extended', async () => {
			await DetectZombieProcessing.run(undefined, 48 * 60 * 60 * 1000, true);
			expect(Mailer.sendSystemEmail).toHaveBeenCalledTimes(0);
		});
	});
};

describe(determineTestGroup(__filename), () => {
	runTest();
	afterAll(disconnect);
});
