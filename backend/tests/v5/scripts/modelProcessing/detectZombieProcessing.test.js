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

// const { findModels } = require(`${src}/models/modelSettings`);
const { modelTypes, processStatuses } = require(`${src}/models/modelSettings.constants`);
const { deleteIfUndefined } = require(`${src}/utils/helper/objects`);
const { disconnect } = require(`${src}/handler/db`);
// const { templates: emailTemplates } = require(`${src}/services/mailer/mailer.constants`);

jest.mock('../../../../src/v5/services/mailer');
const Mailer = require(`${src}/services/mailer`);

// const Drawings = require(`${src}/processors/teamspaces/projects/models/drawings`);

const DetectZombieProcessing = require(`${utilScripts}/modelProcessing/detectZombieProcessing`);
// const Path = require('path');

const modelStates = Object.values(processStatuses); // ['processing', 'queued'];

const recentDate = new Date((new Date()) - 36 * 60 * 60 * 1000);

const setupData = () => {
	// console.log(processStatuses);
	const modelProms = times(2, async () => {
		const teamspace = generateRandomString();
		const models = await Promise.all(times(modelStates.length, async (n) => {
			const { _id, name, properties } = generateRandomModel({
				properties: deleteIfUndefined({ status: modelStates[n], timestamp: recentDate }),
			});
			await createModel(teamspace, _id, name, properties);
			return _id;
		}));
		const drawings = await Promise.all(times(modelStates.length, async (n) => {
			const project = generateRandomString();
			const revision = generateRevisionEntry(false, false, modelTypes.DRAWING, modelStates[n]);
			await createRevision(teamspace, project, revision._id, revision, modelTypes.DRAWING);
			return revision._id;
		}));

		return { teamspace, models, drawings };
	});
	return Promise.all(modelProms);
};

/*
const checkModelsStatus = async (teamspace, models) => {
	const data = await findModels(teamspace, { _id: { $in: models } }, { _id: 1, status: 1, timestamp: 1 });

	// const expectedData = models.map((_id, ind) => ({ _id, timestamp: recentDate, status: modelStates[ind] }));

	// console.log(expectedData);
	expect(data.length).toBe(expectedData.length);
	expect(data).toEqual(expect.arrayContaining(expectedData));
};
*/

const runTest = () => {
	describe('Detect zombie processing', () => {
		let data;
		beforeEach(async () => {
			await resetDB();
			data = await setupData();
			// console.log(data);
			// "ZOMBIE_PROCESSING_STATUSES", {"logExcerpt": "[\"73d9b3813003ec9a1298, model, 4e0a04f7-a51d-4b75-9f4e-18889503a7e2, uploading, Tue Sep 10 2024 06:47:46 GMT+0100 (British Summer Time)\",\"73d9b3813003ec9a1298, model, 6fc908ae-4efa-4d45-b037-b12c21c36b64, uploaded, Tue Sep 10 2024 06:47:46 GMT+0100 (British Summer Time)\",\"73d9b3813003ec9a1298, model, 97c834ac-539b-42d6-b9be-7c353e342398, queued, Tue Sep 10 2024 06:47:46 GMT+0100 (British Summer Time)\",\"73d9b3813003ec9a1298, model, 1f0ec23c-8ba1-40e1-9853-4413264c225a, processing, Tue Sep 10 2024 06:47:46 GMT+0100 (British Summer Time)\",\"73d9b3813003ec9a1298, model, c5d5b146-ec98-4fb9-9be8-26c7018dc99f, Generating Bundles, Tue Sep 10 2024 06:47:46 GMT+0100 (British Summer Time)\",\"73d9b3813003ec9a1298, model, 946d5de8-1f0b-416d-ad35-da78a419eb9a, Queued for Unity, Tue Sep 10 2024 06:47:46 GMT+0100 (British Summer Time)\",\"fcba2b9c606c4d47139d, model, 98769cea-a9d4-4a0d-98c3-440b6a3bf4f9, uploading, Tue Sep 10 2024 06:47:46 GMT+0100 (British Summer Time)\",\"fcba2b9c606c4d47139d, model, e17af882-f661-4e7c-b6a5-f99e70fe0f68, uploaded, Tue Sep 10 2024 06:47:46 GMT+0100 (British Summer Time)\",\"fcba2b9c606c4d47139d, model, 8ac80ea9-b616-43c6-aad6-259043b4dda9, queued, Tue Sep 10 2024 06:47:46 GMT+0100 (British Summer Time)\",\"fcba2b9c606c4d47139d, model, 68843449-065e-4f21-af33-5b2508924752, processing, Tue Sep 10 2024 06:47:46 GMT+0100 (British Summer Time)\",\"fcba2b9c606c4d47139d, model, 55c6e54d-0407-4488-8dd5-04e9ded63a68, Generating Bundles, Tue Sep 10 2024 06:47:46 GMT+0100 (British Summer Time)\",\"fcba2b9c606c4d47139d, model, 661dbaf4-fa88-46d6-bfbd-c97e609e1ab9, Queued for Unity, Tue Sep 10 2024 06:47:46 GMT+0100 (British Summer Time)\"]", "message": "12 zombie processing statuses found", "script": "detectZombieProcessing", "title": "Zombie processing statuses found"}
		});

		test('Should do nothing if notify is not set', async () => {
			await DetectZombieProcessing.run();
			expect(Mailer.sendSystemEmail).toHaveBeenCalledTimes(0);
		});

		test('Should send system mail if notify is set', async () => {
			await DetectZombieProcessing.run(undefined, undefined, true);
			expect(Mailer.sendSystemEmail).toHaveBeenCalledTimes(1);
			/*
			const expectedResults = [];
			const expectedData = {
				script: Path.basename(__filename, Path.extname(__filename)).replace(/\.test/, ''),
				title: 'Zombie processing statuses found',
				message: `${expectedResults.length} zombie processing statuses found`,
				logExcerpt: JSON.stringify(expectedResults),
			};
			expect(Mailer.sendSystemEmail).toHaveBeenCalledWith(
				emailTemplates.ZOMBIE_PROCESSING_STATUSES.name,
				expectedData,
			);
			*/
		});

		test('Should send system mail if the predefined teamspace exists', async () => {
			await DetectZombieProcessing.run(data[0].teamspace, undefined, true);
			expect(Mailer.sendSystemEmail).toHaveBeenCalledTimes(1);
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
