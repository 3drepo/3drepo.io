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

const {
	determineTestGroup,
	db: { reset: resetDB, createModel, createRevision },
	generateRandomString,
	generateRandomModel,
	generateRevisionEntry,
} = require('../../helper/services');
const { times } = require('lodash');
const { utilScripts, src } = require('../../helper/path');

const { find } = require(`${src}/handler/db`);
const { findModels } = require(`${src}/models/modelSettings`);
const { deleteIfUndefined } = require(`${src}/utils/helper/objects`);
const { disconnect } = require(`${src}/handler/db`);

const { modelTypes } = require(`${src}/models/modelSettings.constants`);

const ResetProcessingFlags = require(`${utilScripts}/modelProcessing/resetProcessingFlags`);

const modelStates = ['ok', 'failed', 'processing', 'queued'];
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

		return { teamspace, models, drawings };
	});
	return Promise.all(modelProms);
};

const checkModelsStatus = async (teamspace, models, drawings, expectedResetModelIds = []) => {
	const modelsData = await findModels(teamspace, { _id: { $in: models } }, { _id: 1, status: 1 });

	const expectedModelsData = models.map((_id, ind) => ({
		_id,
		status: expectedResetModelIds.includes(_id) ? undefined : modelStates[ind],
	}),
	);

	const drawingsData = await find(teamspace, 'drawings.history',
		{ model: { $in: drawings } },
		{ model: 1, status: 1, _id: 0 },
	);
	const expectedDrawingsData = drawings.map((_id, ind) => ({
		model: _id,
		status:
			expectedResetModelIds.includes(_id) && !['ok', 'failed'].includes(modelStates[ind]) ? 'failed' : modelStates[ind],
	}));

	expect(modelsData.length).toBe(expectedModelsData.length);
	expect(modelsData).toEqual(expect.arrayContaining(expectedModelsData));

	expect(drawingsData.length).toBe(expectedDrawingsData.length);
	expect(drawingsData).toEqual(expect.arrayContaining(expectedDrawingsData));
};

const runTest = () => {
	describe('Reset Processing flags', () => {
		let data;
		beforeEach(async () => {
			await resetDB();
			data = await setupData();
		});

		test('Should throw an error if model is provided but not teamspace', async () => {
			const error = new Error('Teamspace must be provided if model is defined');
			await expect(ResetProcessingFlags.run(undefined, generateRandomString())).rejects.toEqual(error);
			await Promise.all(
				data.map(
					({ teamspace, models, drawings }) => checkModelsStatus(teamspace, models, drawings),
				));
		});

		test('Should only process the predefined teamspace if it is defined', async () => {
			await ResetProcessingFlags.run(data[0].teamspace);
			await Promise.all(data.map(
				({ teamspace, models, drawings }, ind) => checkModelsStatus(
					teamspace, models, drawings, ind === 0 ? [...models, ...drawings] : [],
				),
			));
		});

		test('Should only process the predefined model if it is defined', async () => {
			const lastInd = data[0].models.length - 1;
			await ResetProcessingFlags.run(data[0].teamspace, data[0].models[lastInd]);
			await Promise.all([
				...data.map(
					({ teamspace, models, drawings }, ind) => checkModelsStatus(
						teamspace,
						models,
						drawings,
						ind === 0 ? [data[0].models[lastInd]] : [],
					),
				),
			]);
		});

		test('Should only process the predefined drawing if it is defined', async () => {
			const lastInd = data[0].drawings.length - 1;
			await ResetProcessingFlags.run(data[0].teamspace, data[0].drawings[lastInd]);
			await Promise.all([
				...data.map(
					({ teamspace, models, drawings }, ind) => checkModelsStatus(
						teamspace,
						models,
						drawings,
						ind === 0 ? [data[0].drawings[lastInd]] : [],
					),
				),
			]);
		});

		test('Should process all models if no parameters are provided', async () => {
			await ResetProcessingFlags.run();
			await Promise.all(data.map(
				({ teamspace, models, drawings }) => checkModelsStatus(
					teamspace,
					models,
					drawings,
					[...models, ...drawings],
				),
			));
		});

		test('Should do nothing if teamspace is not found', async () => {
			await ResetProcessingFlags.run(generateRandomString());
			await Promise.all(data.map(
				({ teamspace, models, drawings }) => checkModelsStatus(teamspace, models, drawings, []),
			));
		});

		test('Should do nothing if model is not found', async () => {
			const nonExistentModel = generateRandomString();
			await ResetProcessingFlags.run(data[0].teamspace, nonExistentModel);
			await Promise.all(data.map(
				({ teamspace, models, drawings }) => checkModelsStatus(teamspace, models, drawings, [nonExistentModel]),
			));
		});
	});
};

describe(determineTestGroup(__filename), () => {
	runTest();
	afterAll(disconnect);
});
