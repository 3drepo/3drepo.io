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
	fileExists,
	resetSharedDir,
	generateRandomString,
} = require('../../helper/services');
const { times } = require('lodash');
const { utilScripts, src } = require('../../helper/path');

const { cn_queue: { shared_storage: sharedDir } } = require(`${src}/utils/config`);
const Path = require('path');
const { open } = require('fs/promises');

const CleanUpSharedDir = require(`${utilScripts}/modelProcessing/cleanUpSharedDir`);

const createFile = async (filePath, daysOld) => {
	const fd = await open(filePath, 'w');

	const daysInMS = daysOld * 24 * 60 * 60 * 1000;
	const modifiedDate = new Date(Date.now() - daysInMS);
	await fd.utimes(modifiedDate, modifiedDate);

	await fd.close();
};

const setupData = () => Promise.all(times(40, async (n) => {
	const filePath = Path.join(sharedDir, generateRandomString());
	await createFile(filePath, n);
	return { name: filePath, daysOld: n };
}));

const checkFilesExist = (filePaths, shouldExist) => {
	for (const file of filePaths) {
		expect(fileExists(file)).toBe(shouldExist);
	}
};

const runTest = () => {
	describe('Clean up shared directory', () => {
		let data;
		beforeEach(async () => {
			resetSharedDir();
			data = await setupData();
		});
		describe.each([
			['Threshold is set to negative', -1],
			['Threshold is not a number', generateRandomString()],
			['Threshold is not provided', null],
			['Threshold is not a number and force flag is set', generateRandomString()],

		])('Should throw an error if:', (desc, threshold) => {
			const negThresError = new Error('Threshold must be at least 1');
			test(desc, async () => {
				await expect(CleanUpSharedDir.run(threshold)).rejects.toEqual(negThresError);
				checkFilesExist(data.map(({ name }) => name), true);
			});
		});

		test('Should remove files older than 14 days if threshold is not set', async () => {
			const threshold = 14;
			await expect(CleanUpSharedDir.run()).resolves.toBeUndefined();
			const shouldExist = [];
			const shouldDelete = [];
			data.forEach(({ name, daysOld }) => {
				if (daysOld >= threshold) {
					shouldDelete.push(name);
				} else {
					shouldExist.push(name);
				}
			});

			checkFilesExist(shouldExist, true);
			checkFilesExist(shouldDelete, false);
		});

		test('Should remove files older than 10 days if threshold is set to 10', async () => {
			const threshold = 10;
			await expect(CleanUpSharedDir.run(threshold)).resolves.toBeUndefined();
			const shouldExist = [];
			const shouldDelete = [];
			data.forEach(({ name, daysOld }) => {
				if (daysOld >= threshold) {
					shouldDelete.push(name);
				} else {
					shouldExist.push(name);
				}
			});

			checkFilesExist(shouldExist, true);
			checkFilesExist(shouldDelete, false);
		});

		test('Should ignore any errors on file removal', async () => {
			const threshold = 10;

			jest.spyOn(Path, 'join').mockImplementation(() => {
				throw new Error();
			});

			await expect(CleanUpSharedDir.run(threshold)).resolves.toBeUndefined();

			checkFilesExist(data.map(({ name }) => name), true);
		});
	});
};

describe(determineTestGroup(__filename), () => {
	runTest();
});
