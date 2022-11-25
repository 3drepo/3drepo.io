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
	generateRevisionEntry,
	fileExists,
	resetFileshare,
	db: { reset: resetDB, createRevision },
	generateRandomString,
} = require('../../helper/services');
const readline = require('readline');
const { utilScripts, src } = require('../../helper/path');

const { getRefsByQuery } = require(`${src}/models/fileRefs`);
const { fs: { path: fileShareRoot } } = require(`${src}/utils/config`);
const { getRevisionByIdOrTag } = require(`${src}/models/revisions`);
const { stringToUUID } = require(`${src}/utils/helper/uuids`);
const Path = require('path');

const RemoveIncompleteRevisions = require(`${utilScripts}/scene/removeIncompleteRevisions`);

const findRefs = async (teamspace, collection, ids) => {
	const res = await getRefsByQuery(teamspace, collection, { _id: { $in: ids } }, { link: 1 });
	return res.map(({ link }) => link);
};

const setupData = async (data) => {
	const teamspace = generateRandomString();
	const model = generateRandomString();

	const adjustDate = (dateDiff) => {
		const date = new Date();
		date.setDate(date.getDate() - dateDiff);

		return date;
	};

	const generateRevision = async (incomplete, timestamp) => {
		const rev = { ...generateRevisionEntry(), timestamp };

		if (incomplete) {
			rev.incomplete = 2;
		}

		await createRevision(teamspace, model, rev);
		const links = await findRefs(teamspace, `${model}.history`, rev.rFile);
		return { revision: { rev: { ...rev, _id: stringToUUID(rev._id) }, links } };
	};

	const [
		todayRev, oneDayOld, weekOld, thirteenDaysOld, twoWeeksOld, monthOld, ...completedRevs
	] = await Promise.all([
		generateRevision(true, new Date()),
		generateRevision(true, adjustDate(1)),
		generateRevision(true, adjustDate(7)),
		generateRevision(true, adjustDate(13)),
		generateRevision(true, adjustDate(14)),
		generateRevision(true, adjustDate(30)),
		generateRevision(false, new Date()),
		generateRevision(false, adjustDate(1)),
		generateRevision(false, adjustDate(7)),
		generateRevision(false, adjustDate(13)),
		generateRevision(false, adjustDate(14)),
		generateRevision(false, adjustDate(30)),
	]);

	/* eslint-disable no-param-reassign */
	data.completedRevs = completedRevs;
	data.failedRevs = { todayRev, oneDayOld, weekOld, thirteenDaysOld, twoWeeksOld, monthOld };
	data.teamspace = teamspace;
	data.model = model;
	/* eslint-enable no-param-reassign */
};

const checkFileExists = (filePaths, shouldExist) => {
	for (const file of filePaths) {
		expect(fileExists(Path.join(fileShareRoot, file))).toBe(shouldExist);
	}
};

const checkRevisionsExist = async (teamspace, model, revisions, shouldExist) => {
	const checkRevision = async ({ revision: { rev, links } }) => {
		const revFound = await getRevisionByIdOrTag(teamspace, model, rev._id, { _id: 1 }).catch(() => false);
		expect(!!revFound).toEqual(shouldExist);

		checkFileExists(links, shouldExist);
	};

	await Promise.all(revisions.map(checkRevision));
};

const runTest = (data) => {
	describe('Remove incomplete revisions', () => {
		describe.each([
			['Threshold is set to negative', [-1]],
			['Threshold is not a number', [generateRandomString()]],
			['Threshold is not provided', []],
			['Threshold is not a number and force flag is set', [generateRandomString(), true]],

		])('Should throw an error if:', (desc, params) => {
			const negThresError = new Error('Revision age must be a positive number');
			test(desc, async () => {
				const allRevs = [...data.completedRevs, ...Object.values(data.failedRevs)];
				await expect(RemoveIncompleteRevisions.run(...params)).rejects.toEqual(negThresError);
				await checkRevisionsExist(data.teamspace, data.model, allRevs, true);
			});
		});

		test('Should remove revisions older than 14 days', async () => {
			await RemoveIncompleteRevisions.run(14);
			const { todayRev, oneDayOld, weekOld, thirteenDaysOld, ...deletedRevs } = data.failedRevs;
			const revsToExist = [...data.completedRevs, todayRev, oneDayOld, weekOld, thirteenDaysOld];
			await checkRevisionsExist(data.teamspace, data.model, revsToExist, true);
			await checkRevisionsExist(data.teamspace, data.model, Object.values(deletedRevs), false);
		});

		test('Should not remove any revisions if threshold is less than 2 days and stdIn returned no', async () => {
			const fakeLineRder = { question: (str, cb) => cb('n'), close: jest.fn() };
			jest.spyOn(readline, 'createInterface').mockReturnValueOnce(fakeLineRder);

			await RemoveIncompleteRevisions.run(1);

			const { todayRev, oneDayOld, weekOld, thirteenDaysOld, ...deletedRevs } = data.failedRevs;
			const revsToExist = [...data.completedRevs, todayRev, oneDayOld, weekOld, thirteenDaysOld];
			await checkRevisionsExist(data.teamspace, data.model, revsToExist, true);
			await checkRevisionsExist(data.teamspace, data.model, Object.values(deletedRevs), false);
		});

		test('Should remove any revisions if threshold is less than 1 days and stdIn returned y', async () => {
			const fakeLineRder = { question: (str, cb) => cb('y'), close: jest.fn() };
			jest.spyOn(readline, 'createInterface').mockReturnValueOnce(fakeLineRder);

			await RemoveIncompleteRevisions.run(1);

			const { todayRev, ...deletedRevs } = data.failedRevs;
			const revsToExist = [...data.completedRevs, todayRev];
			await checkRevisionsExist(data.teamspace, data.model, revsToExist, true);
			await checkRevisionsExist(data.teamspace, data.model, Object.values(deletedRevs), false);
		});

		test('Should remove any revisions if threshold is less than 0 days without prompt if force is flagged', async () => {
			const rlFn = jest.spyOn(readline, 'createInterface');

			await RemoveIncompleteRevisions.run(0, true);

			await checkRevisionsExist(data.teamspace, data.model, data.completedRevs, true);
			await checkRevisionsExist(data.teamspace, data.model, Object.values(data.failedRevs), false);
			expect(rlFn).not.toHaveBeenCalled();
		});
	});
};

describe(determineTestGroup(__filename), () => {
	// initialising data so we have a pointer to pass around
	const data = {};
	beforeAll(async () => {
		resetFileshare();
		await resetDB();
		await setupData(data);
	});
	runTest(data);
});
