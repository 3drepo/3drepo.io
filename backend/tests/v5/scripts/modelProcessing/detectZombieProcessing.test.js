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

const {
	determineTestGroup,
	db: { reset: resetDB, createModel, createRevision },
	generateRandomString,
	generateRandomModel,
	generateRevisionEntry,
} = require('../../helper/services');
const { times } = require('lodash');
const { utilScripts, src } = require('../../helper/path');

const { modelTypes, processStatuses } = require(`${src}/models/modelSettings.constants`);
const { deleteIfUndefined } = require(`${src}/utils/helper/objects`);
const { disconnect } = require(`${src}/handler/db`);
const { templates: emailTemplates } = require(`${src}/services/mailer/mailer.constants`);

jest.mock('../../../../src/v5/services/mailer');
const Mailer = require(`${src}/services/mailer`);

const DetectZombieProcessing = require(`${utilScripts}/modelProcessing/detectZombieProcessing`);
const Path = require('path');

const modelStates = Object.values(processStatuses);

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

		return { teamspace, models, drawings };
	});
	return Promise.all(modelProms);
};

const checkMail = (data, filteredTeamspace) => {
	const expectedLogExcerpt = data.map(({ teamspace, models, drawings }) => {
		if (!filteredTeamspace || teamspace === filteredTeamspace) {
			const expectedModels = models.map(({ model, status }) => (
				(status !== processStatuses.OK && status !== processStatuses.FAILED)
					? `${teamspace}, model, ${model}, ${status}, ${recentDate}` : ''));
			const expectedDrawings = drawings.map(({ drawing, status }) => (
				(status !== processStatuses.OK && status !== processStatuses.FAILED)
					? `${teamspace}, drawing, ${drawing}, ${status}, ${recentDate}` : ''));
			return [...expectedModels, ...expectedDrawings];
		}
		return undefined;
	}).flat().filter(Boolean);
	const expectedData = {
		script: Path.basename(__filename, Path.extname(__filename)).replace(/\.test/, ''),
		title: 'Zombie processing statuses found',
		message: `${expectedLogExcerpt.length} zombie processing statuses found`,
	};
	expect(Mailer.sendSystemEmail).toHaveBeenCalledWith(
		emailTemplates.ZOMBIE_PROCESSING_STATUSES.name,
		expect.objectContaining(expectedData),
	);
	const actualLogExcerpt = JSON.parse(Mailer.sendSystemEmail.mock.calls[0][1].logExcerpt);
	expect(actualLogExcerpt).toEqual(expect.arrayContaining(expectedLogExcerpt));
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
