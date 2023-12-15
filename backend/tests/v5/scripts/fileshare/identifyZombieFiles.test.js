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

const { determineTestGroup, fileExists, resetFileshare, db: { reset: resetDB }, generateRandomString } = require('../../helper/services');
const { utilScripts, src } = require('../../helper/path');
const { times } = require('lodash');

const { disconnect } = require(`${src}/handler/db`);
const { storeFile } = require(`${src}/services/filesManager`);
const { getRefsByQuery, removeRefsByQuery } = require(`${src}/models/fileRefs`);
const { fs: { path: fileShareRoot } } = require(`${src}/utils/config`);
const Path = require('path');
const { mkdirSync, writeFileSync, unlinkSync } = require('fs');

const IdentifyZombieFiles = require(`${utilScripts}/fileshare/identifyZombieFiles`);

const findRefs = async (teamspace, collection, ids) => {
	const res = await getRefsByQuery(teamspace, collection, { _id: { $in: ids } }, { link: 1 });
	return res.map(({ link }) => link);
};

const setupData = async (data) => {
	const teamspace = generateRandomString();
	const collection = generateRandomString();
	await Promise.all(
		[...data.referencedFiles, ...data.zombieFiles].map((fileName) => {
			const buffer = Buffer.from(generateRandomString(), 'utf-8');
			return storeFile(teamspace, collection, fileName, buffer);
		}),
	);

	const toyFolder = `toy_${generateRandomString()}`;
	const toyPath = Path.join(fileShareRoot, toyFolder);
	mkdirSync(toyPath);

	/* eslint-disable no-param-reassign */
	const [noFileRef, ...others] = await findRefs(teamspace, collection, data.referencedFiles);
	data.referencedLinks = others;
	data.zombiedLinks = await findRefs(teamspace, collection, data.zombieFiles);
	data.toyLinks = times(5, () => {
		const toyFile = generateRandomString();
		writeFileSync(Path.join(toyPath, toyFile), generateRandomString());
		return Path.join(toyFolder, toyFile);
	});
	/* eslint-enable no-param-reassign */

	// have a ref entry with no file to ensure this is handled without failure
	unlinkSync(Path.join(fileShareRoot, noFileRef));

	await removeRefsByQuery(teamspace, collection, { _id: { $in: data.zombieFiles } });
};

const checkFileExists = (filePaths, shouldExist) => {
	for (const file of filePaths) {
		expect(fileExists(Path.join(fileShareRoot, file))).toBe(shouldExist);
	}
};

const runTest = (data) => {
	describe('Identify zombie files', () => {
		test('Should not remove any files if flag is not set', async () => {
			await IdentifyZombieFiles.run();

			checkFileExists(data.referencedLinks, true);
			checkFileExists(data.toyLinks, true);
			checkFileExists(data.zombiedLinks, true);
		});

		test('Should remove zombie files if flag is set', async () => {
			await IdentifyZombieFiles.run(undefined, true, 1);

			checkFileExists(data.referencedLinks, true);
			checkFileExists(data.toyLinks, true);
			checkFileExists(data.zombiedLinks, false);

			// re-run should not be removing any more files
			await IdentifyZombieFiles.run(undefined, true);
			checkFileExists(data.referencedLinks, true);
			checkFileExists(data.toyLinks, true);
			checkFileExists(data.zombiedLinks, false);
		});
	});
};

describe(determineTestGroup(__filename), () => {
	const data = {
		referencedFiles: times(3, () => generateRandomString()),
		zombieFiles: times(4, () => generateRandomString()),
	};
	beforeAll(async () => {
		resetFileshare();
		await resetDB();
		await setupData(data);
	});
	runTest(data);
	afterAll(async () => {
		await disconnect();
		unlinkSync('./unreferenced_files.csv');
	});
});
