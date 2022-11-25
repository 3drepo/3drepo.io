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

const setupData = async () => {
	const teamspace = generateRandomString();
	const model = generateRandomString();
	const modelNoIncomplete = generateRandomString();

	const adjustDate = (dateDiff) => {
		const date = new Date();
		date.setDate(date.getDate() - dateDiff);

		return date;
	};

	const generateRevision = async (ts, modelName, incomplete, timestamp, { noRFile } = { }) => {
		const rev = { ...generateRevisionEntry(false, !noRFile), timestamp };

		if (incomplete) {
			rev.incomplete = 2;
		}

		await createRevision(ts, modelName, rev);
		const links = noRFile ? [] : await findRefs(teamspace, `${model}.history`, rev.rFile);
		return { teamspace: ts, model: modelName, revision: { rev: { ...rev, _id: stringToUUID(rev._id) }, links } };
	};

	const [
		todayRev, oneDayOld, weekOld, thirteenDaysOld, specialCase, twoWeeksOld, monthOld, ...completedRevs
	] = await Promise.all([
		generateRevision(teamspace, model, true, new Date()),
		generateRevision(teamspace, model, true, adjustDate(1)),
		generateRevision(teamspace, model, true, adjustDate(7)),
		generateRevision(teamspace, model, true, adjustDate(13)),
		generateRevision(teamspace, model, true, adjustDate(14), { noRFile: true }),
		generateRevision(teamspace, model, true, adjustDate(14)),
		generateRevision(teamspace, model, true, adjustDate(30)),
		generateRevision(teamspace, model, false, new Date()),
		generateRevision(teamspace, model, false, adjustDate(1)),
		generateRevision(teamspace, model, false, adjustDate(7)),
		generateRevision(teamspace, model, false, adjustDate(13)),
		generateRevision(teamspace, model, false, adjustDate(14)),
		generateRevision(teamspace, model, false, adjustDate(30)),
		generateRevision(teamspace, modelNoIncomplete, false, new Date()),
		generateRevision(teamspace, modelNoIncomplete, false, adjustDate(1)),
		generateRevision(teamspace, modelNoIncomplete, false, adjustDate(7)),
		generateRevision(teamspace, modelNoIncomplete, false, adjustDate(13)),
		generateRevision(teamspace, modelNoIncomplete, false, adjustDate(14)),
		generateRevision(teamspace, modelNoIncomplete, false, adjustDate(30)),
	]);

	return {
		completedRevs,
		failedRevs: { todayRev, oneDayOld, weekOld, thirteenDaysOld, twoWeeksOld, specialCase, monthOld },

	};
};

const checkFileExists = (filePaths, shouldExist) => {
	for (const file of filePaths) {
		expect(fileExists(Path.join(fileShareRoot, file))).toBe(shouldExist);
	}
};

const checkRevisionsExist = async (revisions, shouldExist) => {
	const checkRevision = async ({ teamspace, model, revision: { rev, links } }) => {
		const revFound = await getRevisionByIdOrTag(teamspace, model, rev._id, { _id: 1 }).catch(() => false);
		expect(!!revFound).toEqual(shouldExist);
		if (links.length) checkFileExists(links, shouldExist);
	};

	await Promise.all(revisions.map(checkRevision));
};

const runTest = () => {
	describe('Remove incomplete revisions', () => {
		let data;
		beforeEach(async () => {
			resetFileshare();
			await resetDB();
			data = await setupData();
		});
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
				await checkRevisionsExist(allRevs, true);
			});
		});

		test('Should remove revisions older than 14 days', async () => {
			await RemoveIncompleteRevisions.run(14);
			const { todayRev, oneDayOld, weekOld, thirteenDaysOld, ...deletedRevs } = data.failedRevs;
			const revsToExist = [...data.completedRevs, todayRev, oneDayOld, weekOld, thirteenDaysOld];
			await checkRevisionsExist(revsToExist, true);
			await checkRevisionsExist(Object.values(deletedRevs), false);
		});

		test('Should not remove any revisions if threshold is less than 2 days and stdIn returned no', async () => {
			const fakeLineRder = { question: (str, cb) => cb('n'), close: jest.fn() };
			jest.spyOn(readline, 'createInterface').mockReturnValueOnce(fakeLineRder);

			await RemoveIncompleteRevisions.run(1);
			const allRevs = [...data.completedRevs, ...Object.values(data.failedRevs)];

			await checkRevisionsExist(allRevs, true);
		});

		test('Should remove any revisions if threshold is less than 1 days and stdIn returned y', async () => {
			const fakeLineRder = { question: (str, cb) => cb('y'), close: jest.fn() };
			jest.spyOn(readline, 'createInterface').mockReturnValueOnce(fakeLineRder);

			await RemoveIncompleteRevisions.run(1);

			const { todayRev, ...deletedRevs } = data.failedRevs;
			const revsToExist = [...data.completedRevs, todayRev];
			await checkRevisionsExist(revsToExist, true);
			await checkRevisionsExist(Object.values(deletedRevs), false);
		});

		test('Should remove any revisions if threshold is less than 0 days without prompt if force is flagged', async () => {
			const rlFn = jest.spyOn(readline, 'createInterface');

			await RemoveIncompleteRevisions.run(0, true);

			await checkRevisionsExist(data.completedRevs, true);
			await checkRevisionsExist(Object.values(data.failedRevs), false);
			expect(rlFn).not.toHaveBeenCalled();
		});
	});
};

describe(determineTestGroup(__filename), () => {
	runTest();
});
