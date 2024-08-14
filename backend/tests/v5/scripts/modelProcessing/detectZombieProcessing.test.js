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
	db: { reset: resetDB, createModel },
	generateRandomString,
	generateRandomModel,
	generateRandomNumber,
} = require('../../helper/services');
const { times } = require('lodash');
const { utilScripts, src } = require('../../helper/path');

const { findModels } = require(`${src}/models/modelSettings`);
const { deleteIfUndefined } = require(`${src}/utils/helper/objects`);
const { disconnect } = require(`${src}/handler/db`);

jest.mock('../../../../src/v5/services/mailer');
const Mailer = require(`${src}/services/mailer`);

const CheckProcessingFlags = require(`${utilScripts}/modelProcessing/checkProcessingFlags`);

const modelStates = ['processing', 'queued'];

const recentDate = new Date();

const setupData = () => {
	const modelProms = times(2, async () => {
		const teamspace = generateRandomString();
		const models = await Promise.all(times(modelStates.length, async (n) => {
			const { _id, name, properties } = generateRandomModel({
				properties: deleteIfUndefined({ status: modelStates[n], timestamp: recentDate }),
			});
			await createModel(teamspace, _id, name, properties);
			return _id;
		}));

		return { teamspace, models };
	});
	return Promise.all(modelProms);
};

const checkModelsStatus = async (teamspace, models) => {
	const data = await findModels(teamspace, { _id: { $in: models } }, { _id: 1, status: 1, timestamp: 1 });

	const expectedData = models.map((_id, ind) => ({ _id, timestamp: recentDate, status: modelStates[ind] }));

	expect(data.length).toBe(expectedData.length);
	expect(data).toEqual(expect.arrayContaining(expectedData));
};

const runTest = () => {
	describe('Check Processing flags', () => {
		let data;
		beforeEach(async () => {
			await resetDB();
			data = await setupData();
		});
		test('Should throw an error if model is provided but not teamspace', async () => {
			const error = new Error('Teamspace must be provided if model is defined');
			await expect(CheckProcessingFlags.run(undefined, generateRandomString())).rejects.toEqual(error);
			await Promise.all(data.map(({ teamspace, models }) => checkModelsStatus(teamspace, models)));
		});

		test('Should only process the predefined teamspace if it is defined', async () => {
			await CheckProcessingFlags.run(data[0].teamspace);
			await Promise.all(data.map(
				({ teamspace, models }) => checkModelsStatus(teamspace, models),
			));
		});

		test('Should only process the predefined model if it is defined', async () => {
			await CheckProcessingFlags.run(data[0].teamspace, data[0].models[0]);
			await Promise.all([
				...data.map(({ teamspace, models }) => checkModelsStatus(teamspace, models)),
				checkModelsStatus(data[0].teamspace, [data[0].models[0]]),
			]);
		});

		test('Should process all models if no parameters are provided', async () => {
			await CheckProcessingFlags.run();
			await Promise.all(data.map(
				({ teamspace, models }) => checkModelsStatus(teamspace, models),
			));
		});

		test('Should do nothing if teamspace is not found', async () => {
			await CheckProcessingFlags.run(generateRandomString());
			await Promise.all(data.map(
				({ teamspace, models }) => checkModelsStatus(teamspace, models),
			));
		});

		test('Should do nothing if model is not found', async () => {
			await CheckProcessingFlags.run(data[0].teamspace, generateRandomString());
			await Promise.all(data.map(
				({ teamspace, models }) => checkModelsStatus(teamspace, models),
			));
		});

		test('Should set time limit if given', async () => {
			await CheckProcessingFlags.run(undefined, undefined, generateRandomNumber());
			await Promise.all(data.map(
				({ teamspace, models }) => checkModelsStatus(teamspace, models),
			));
		});

		test('Should send notification if set and there are results', async () => {
			await CheckProcessingFlags.run(undefined, undefined, undefined, true);
			expect(Mailer.sendSystemEmail).toHaveBeenCalledTimes(1);
			await Promise.all(data.map(
				({ teamspace, models }) => checkModelsStatus(teamspace, models),
			));
		});
	});
};

describe(determineTestGroup(__filename), () => {
	runTest();
	afterAll(disconnect);
});
