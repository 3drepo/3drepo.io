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
	generateSequenceEntry,
	fileExists,
	resetFileshare,
	db: { reset: resetDB, createRevision, createSequence },
	generateRandomString,
} = require('../../helper/services');
const readline = require('readline');
const { times } = require('lodash');
const { utilScripts, src } = require('../../helper/path');

const { disconnect } = require(`${src}/handler/db`);

const { getRefsByQuery } = require(`${src}/models/fileRefs`);
const { storeFile } = require(`${src}/services/filesManager`);
const { fs: { path: fileShareRoot } } = require(`${src}/utils/config`);
const { getRevisionByIdOrTag } = require(`${src}/models/revisions`);
const { stringToUUID, UUIDToString, generateUUID } = require(`${src}/utils/helper/uuids`);
const { count, findOne, insertMany } = require(`${src}/handler/db`);
const Path = require('path');

const { modelTypes } = require(`${src}/models/modelSettings.constants`);

const RemoveIncompleteRevisions = require(`${utilScripts}/scene/removeIncompleteRevisions`);

const findRefs = async (teamspace, collection, ids) => {
	const res = await getRefsByQuery(teamspace, collection, { _id: { $in: ids } }, { link: 1 });
	return res.map(({ link }) => link);
};

const generateSequence = async (teamspace, model, rId) => {
	const data = generateSequenceEntry(rId);
	await createSequence(teamspace, model, data);
	const stateLinks = await findRefs(teamspace, `${model}.sequences`, data.states);
	const activityLink = await findRefs(teamspace, `${model}.activities`, [UUIDToString(data.sequence._id)]);
	return {
		id: data.sequence._id,
		states: stateLinks,
		activities: data.activities.map(({ _id }) => _id),
		activityCache: activityLink[0],
	};
};

const generateStashData = async (teamspace, model, rId) => {
	const createObject = (type = 'mesh') => ({
		_id: generateUUID(),
		rev_id: rId,
		type,
	});

	const superMeshes = times(5, () => createObject());
	const otherObjs = times(4, () => createObject(generateRandomString()));

	const allObjs = [...superMeshes, ...otherObjs];

	const refs = times(5, () => generateRandomString());

	const stashCol = `${model}.stash.3drepo`;
	await insertMany(teamspace, stashCol, allObjs);

	await Promise.all(refs.map((ref) => {
		const buffer = Buffer.from(generateRandomString(), 'utf-8');
		return storeFile(teamspace, stashCol, ref, buffer, { rev_id: rId });
	}));

	return { objCount: allObjs.length, links: await findRefs(teamspace, stashCol, refs) };
};

const generateRevision = async (teamspace, project, model, incomplete, timestamp, modelType,
	{ noRFile, hasSequence, stash } = { }) => {
	const rev = { ...generateRevisionEntry(false, !noRFile, modelType), timestamp };
	const rid = stringToUUID(rev._id);

	if (incomplete) {
		rev.incomplete = 2;
	}

	const retVal = { teamspace, model, modelType, revision: { rev: { ...rev, _id: rid } } };

	await createRevision(teamspace, project, model, rev, modelType);

	if (hasSequence) {
		retVal.sequence = await generateSequence(teamspace, model, rid);
	}

	if (stash) {
		retVal.stash = await generateStashData(teamspace, model, rid);
	}

	retVal.revision.links = noRFile ? [] : await findRefs(teamspace, `${model}.history`, rev.rFile);
	return retVal;
};

const setupData = async () => {
	const teamspace = generateRandomString();
	const project = generateRandomString();
	const con = generateRandomString();
	const conNoIncomplete = generateRandomString();
	const conNoSpecialCase = generateRandomString();
	const draw = generateRandomString();
	const drawNoIncomplete = generateRandomString();
	const drawNoSpecialCase = generateRandomString();

	const adjustDate = (dateDiff) => {
		const date = new Date();
		date.setDate(date.getDate() - dateDiff);

		return date;
	};

	const dateSets = [0, 1, 7, 14, 30];

	const failedRevs = {};
	const completedRevs = [];
	dateSets.forEach((val) => { failedRevs[val] = []; });

	await Promise.all(
		dateSets.map(async (dateDiff) => {
			const date = adjustDate(dateDiff);
			const [badConRev1, badConRev2, badConRev3, ...goodConRevs] = await Promise.all([
				generateRevision(teamspace, project, con, true, date, modelTypes.CONTAINER),
				generateRevision(teamspace, project, con, true, date, modelTypes.CONTAINER,
					{ noRFile: true, hasSequence: true, stash: true }),
				generateRevision(teamspace, project, conNoSpecialCase, true, date, modelTypes.CONTAINER),
				generateRevision(teamspace, project, con, false, date, modelTypes.CONTAINER),
				generateRevision(teamspace, project, conNoIncomplete, false, date, modelTypes.CONTAINER),
			]);

			completedRevs.push(...goodConRevs);
			failedRevs[dateDiff].push(badConRev1, badConRev2, badConRev3);

			const [badDrawRev1, badDrawRev2, badDrawRev3, ...goodDrawRevs] = await Promise.all([
				generateRevision(teamspace, project, draw, true, date, modelTypes.DRAWING),
				generateRevision(teamspace, project, draw, true, date, modelTypes.DRAWING, { noRFile: true }),
				generateRevision(teamspace, project, drawNoSpecialCase, true, date, modelTypes.DRAWING),
				generateRevision(teamspace, project, draw, false, date, modelTypes.DRAWING),
				generateRevision(teamspace, project, drawNoIncomplete, false, date, modelTypes.DRAWING),
			]);

			completedRevs.push(...goodDrawRevs);
			failedRevs[dateDiff].push(badDrawRev1, badDrawRev2, badDrawRev3);
		}),
	);

	return {
		completedRevs,
		failedRevs,
	};
};

const checkFileExists = (filePaths, shouldExist) => {
	for (const file of filePaths) {
		expect(fileExists(Path.join(fileShareRoot, file))).toBe(shouldExist);
	}
};

const checkRevisionsExist = async (revisions, shouldExist) => {
	const checkRevision = async ({ teamspace, model, modelType, revision: { rev, links }, stash, sequence }) => {
		const revFound = await getRevisionByIdOrTag(teamspace, model, modelType,
			rev._id, { _id: 1 }, { includeIncomplete: true }).catch(() => false);

		expect(!!revFound).toEqual(shouldExist);
		if (links.length) checkFileExists(links, shouldExist);

		if (stash) {
			const stashObjCount = await count(teamspace, `${model}.stash.3drepo`, { rev_id: rev._id });
			expect(stashObjCount).toBe(shouldExist ? stash.objCount : 0);
			checkFileExists(stash.links, shouldExist);
		}

		if (sequence) {
			const seqObj = await findOne(teamspace, `${model}.sequences`, { _id: sequence.id });
			expect(!!seqObj).toEqual(shouldExist);

			const actCount = await count(teamspace, `${model}.activities`, { _id: { $in: sequence.activities } }, { id: 1 });
			expect(actCount).toBe(shouldExist ? sequence.activities.length : 0);

			if (sequence.states.length) checkFileExists(sequence.states, shouldExist);
			if (sequence.activityCache) checkFileExists([sequence.activityCache], shouldExist);
		}
	};

	await Promise.all(revisions.map(checkRevision));
};

const determineExistingRevs = ({ completedRevs, failedRevs }, threshold) => {
	const revsToExist = [...completedRevs];
	const deletedRevs = [];
	Object.keys(failedRevs).forEach((dayCount) => {
		if (threshold !== undefined && dayCount >= threshold) {
			deletedRevs.push(...failedRevs[dayCount]);
		} else {
			revsToExist.push(...failedRevs[dayCount]);
		}
	});

	return { revsToExist, deletedRevs };
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
			['Threshold is not a number and force flag is set', [generateRandomString(), true]],

		])('Should throw an error if:', (desc, params) => {
			const negThresError = new Error('Revision age must be a positive number');
			test(desc, async () => {
				const { revsToExist } = determineExistingRevs(data);
				await expect(RemoveIncompleteRevisions.run(...params)).rejects.toEqual(negThresError);
				await checkRevisionsExist(revsToExist, true);
			});
		});

		test('Should remove revisions older than 14 days if no threshold is provided', async () => {
			await RemoveIncompleteRevisions.run();
			const { revsToExist, deletedRevs } = determineExistingRevs(data, 14);
			await checkRevisionsExist(revsToExist, true);
			await checkRevisionsExist(Object.values(deletedRevs), false);
		});

		test('Should remove revisions older than 5 days if threshold is set to 5', async () => {
			const threshold = 5;
			await RemoveIncompleteRevisions.run(threshold);
			const { revsToExist, deletedRevs } = determineExistingRevs(data, threshold);
			await checkRevisionsExist(revsToExist, true);
			await checkRevisionsExist(Object.values(deletedRevs), false);
		});

		test('Should not remove any revisions if threshold is less than 2 days and stdIn returned no', async () => {
			const fakeLineRder = { question: (str, cb) => cb('n'), close: jest.fn() };
			jest.spyOn(readline, 'createInterface').mockReturnValueOnce(fakeLineRder);

			const { revsToExist } = determineExistingRevs(data);
			await RemoveIncompleteRevisions.run(1);
			await checkRevisionsExist(revsToExist, true);
		});

		test('Should remove incomplete revisions older than 1 day if threshold is less than 1 days and stdIn returned y', async () => {
			const fakeLineRder = { question: (str, cb) => cb('y'), close: jest.fn() };
			jest.spyOn(readline, 'createInterface').mockReturnValueOnce(fakeLineRder);

			await RemoveIncompleteRevisions.run(1);
			const { revsToExist, deletedRevs } = determineExistingRevs(data, 1);
			await checkRevisionsExist(revsToExist, true);
			await checkRevisionsExist(Object.values(deletedRevs), false);
		});

		test('Should remove all incomplete revisions if threshold is less than 0 days without prompt if force is flagged', async () => {
			const rlFn = jest.spyOn(readline, 'createInterface');

			await RemoveIncompleteRevisions.run(0, true);
			const { revsToExist, deletedRevs } = determineExistingRevs(data, 0);
			await checkRevisionsExist(revsToExist, true);
			await checkRevisionsExist(Object.values(deletedRevs), false);
			expect(rlFn).not.toHaveBeenCalled();
		});
	});
};

describe(determineTestGroup(__filename), () => {
	runTest();
	afterAll(disconnect);
});
