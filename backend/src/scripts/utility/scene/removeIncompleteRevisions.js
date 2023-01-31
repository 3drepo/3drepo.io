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

/**
 * This script is used to remove any incomplete (failed, not processing) revisions.
 * It will go through scenes and remove any revision data associated with revisions
 * that are incomplete and older than 14 days (i.e., unlikely to be queued)
 */

const { v5Path } = require('../../../interop');

const { logger } = require(`${v5Path}/utils/logger`);
const { getTeamspaceList, getCollectionsEndsWith } = require('../../utils');
const Path = require('path');
const readline = require('readline');

const { isString, isObject } = require(`${v5Path}/utils/helper/typeCheck`);

const { deleteMany, count, find } = require(`${v5Path}/handler/db`);
const { removeFilesWithMeta } = require(`${v5Path}/services/filesManager`);
const { UUIDToString } = require(`${v5Path}/utils/helper/uuids`);

const entriesLimit = 500;

const removeFilesHelper = async (ts, col, query) => {
	try {
		await removeFilesWithMeta(ts, col, query);
	} catch (err) /* istanbul ignore next */{
		logger.logError(`Failed to remove files from ${ts}.${col} with query: ${JSON.stringify(query)}`);
		throw err;
	}
};

const removeRecords = async (teamspace, collection, filter, refAttribute) => {
	if (refAttribute) {
		const projection = { [refAttribute]: 1 };
		const filesFilter = { ...filter, [refAttribute]: { $exists: true } };

		const objsWithRefs = await count(teamspace, collection, filesFilter);
		const batch = entriesLimit;
		for (let j = 0; j < objsWithRefs; j += batch) {
			// eslint-disable-next-line no-await-in-loop
			const results = await find(teamspace, collection, filesFilter, projection, undefined, batch);
			const filenames = results.flatMap((record) => {
				const fileRefs = record[refAttribute];
				// handle different ref formats
				// record refs currently stored in the following formats:
				// 1) { ref: 'refString' }
				// 2) { ref: {
				//        key1: 'key1RefString',
				//        key2: 'key2RefString',
				//    }
				if (isString(fileRefs)) {
					return fileRefs;
				}
				/* istanbul ignore else */
				if (isObject(fileRefs)) {
					return Object.values(fileRefs);
				}
				/* istanbul ignore next */
				logger.logError(`Unsupported record type: ${Object.prototype.toString.call(fileRefs)}`);
				/* istanbul ignore next */
				return [];
			});

			for (let i = 0; i <= filenames.length; i += entriesLimit) {
				const group = filenames.slice(i, i + entriesLimit);
				const fileRemoveProms = [];
				fileRemoveProms.push(removeFilesHelper(teamspace, collection, { _id: { $in: group } }));
				// eslint-disable-next-line no-await-in-loop
				await Promise.all(fileRemoveProms);
			}

			// eslint-disable-next-line no-await-in-loop
			await deleteMany(teamspace, collection, { _id: { $in: results.map(({ _id }) => _id) } });
		}
	}
	try {
		await deleteMany(teamspace, collection, filter);
	} catch (err) /* istanbul ignore next */{
		logger.logError(`Failed to remove records from ${teamspace}.${collection} with query: ${JSON.stringify(filter)}`);
		throw err;
	}
};

const processModelStash = async (teamspace, model, revIds) => {
	// eslint-disable-next-line security/detect-non-literal-regexp
	const revIdsRegex = new RegExp(`.*(?:${revIds.map(UUIDToString).join('|')}).*`);

	logger.logInfo('\t\t\t\tRemoving supermesh stashes');
	const supermeshIds = (await find(teamspace, `${model}.stash.3drepo`, { rev_id: { $in: revIds }, type: 'mesh' }, { _id: 1 })).map(({ _id }) => UUIDToString(_id));
	if (supermeshIds.length) {
		for (let i = 0; i <= supermeshIds.length; i += entriesLimit) {
			const meshGroup = supermeshIds.slice(i, i + entriesLimit);
			// eslint-disable-next-line security/detect-non-literal-regexp
			const superMeshRegex = new RegExp(`.*(?:${meshGroup.join('|')}).*`);
			// eslint-disable-next-line no-await-in-loop
			await Promise.all([
				removeFilesHelper(teamspace, `${model}.stash.json_mpc.ref`, { _id: superMeshRegex }),
				removeFilesHelper(teamspace, `${model}.stash.src.ref`, { _id: superMeshRegex }),
				removeFilesHelper(teamspace, `${model}.stash.unity3d.ref`, { _id: superMeshRegex }),
			]);
		}
	}

	logger.logInfo('\t\t\t\tRemoving revision based stashes');

	const proms = [
		removeFilesHelper(teamspace, `${model}.stash.json_mpc.ref`, { _id: revIdsRegex }),
		removeRecords(teamspace, `${model}.stash.unity3d`, { _id: { $in: revIds } }),
		removeRecords(teamspace, `${model}.stash.3drepo`, { rev_id: { $in: revIds } }, '_extRef'),
	];

	await Promise.all(proms);
};

const processModelSequences = async (teamspace, model, revIds) => {
	const sequences = await find(teamspace, `${model}.sequences`, { rev_id: { $in: revIds } }, { frames: 1 });
	if (sequences.length) {
		const stateIds = sequences.flatMap(({ frames }) => frames.map(({ state }) => state));

		const sequenceIds = sequences.map(({ _id }) => _id);

		await Promise.all([
			removeRecords(teamspace, `${model}.activities`, { sequenceId: { $in: sequenceIds } }),
			removeFilesHelper(teamspace, `${model}.activities.ref`, { _id: { $in: sequenceIds.map(UUIDToString) } }),
			removeFilesHelper(teamspace, `${model}.sequences.ref`, { _id: { $in: stateIds } }),
			deleteMany(teamspace, `${model}.sequences`, { _id: { $in: sequenceIds } }),
		]);
	}
};

const removeRevisions = async (teamspace, model, revNodes) => {
	const revIds = revNodes.map(({ _id }) => _id);
	const rFiles = revNodes.flatMap(({ rFile }) => rFile ?? []);

	logger.logInfo(`\t\t-${model} - removing ${revIds.length} zombie revisions`);

	logger.logInfo('\t\t\tRemoving stashes');
	await processModelStash(teamspace, model, revIds);

	logger.logInfo('\t\t\tRemoving sequences and model files');
	await Promise.all([
		processModelSequences(teamspace, model, revIds),
		removeFilesHelper(teamspace, `${model}.history.ref`, { _id: { $in: rFiles } }),
	]);

	logger.logInfo('\t\t\tRemoving scene objects');
	// We can't remove mesh nodes until we've processed the stashes
	await removeRecords(teamspace, `${model}.scene`, { rev_id: { $in: revIds } }, '_extRef');
};

const cleanUpRevisions = async (teamspace, colName, filter) => {
	const badRevisions = await find(teamspace, colName, filter, { rFile: 1 });
	if (badRevisions.length) {
		const model = colName.slice(0, -('.history'.length));
		await removeRevisions(teamspace, model, badRevisions);
	}

	await removeRecords(teamspace, colName, filter);
};

const processTeamspace = async (teamspace, revisionAge) => {
	const cols = await getCollectionsEndsWith(teamspace, '.history');
	const threshold = new Date();
	threshold.setDate(threshold.getDate() - revisionAge);

	const query = {
		incomplete: { $exists: true },
		timestamp: { $lt: threshold },
	};

	for (const { name } of cols) {
		// eslint-disable-next-line no-await-in-loop
		await cleanUpRevisions(teamspace, name, query);
	}
};

const run = async (revisionAge, force) => {
	if (revisionAge < 0 || Number.isNaN(Number(revisionAge))) {
		throw new Error('Revision age must be a positive number');
	}

	if (revisionAge < 2) {
		logger.logWarning(`Revision Age is ${revisionAge}; currently processing jobs will be removed when revision age is set to 0.`);

		if (!force) {
			const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
			const response = await new Promise((resolve) => rl.question('Continue? (y/N): ', (ans) => {
				rl.close();
				resolve(ans);
			}));
			if (!response.match(/^y/i)) {
				return;
			}
		}
	}

	logger.logInfo(`Finding unfinished revisions from more than ${revisionAge} days ago...`);
	const teamspaces = await getTeamspaceList();
	for (const teamspace of teamspaces) {
		logger.logInfo(`\t-${teamspace}`);
		// eslint-disable-next-line no-await-in-loop
		await processTeamspace(teamspace, revisionAge);
	}
};

const genYargs = /* istanbul ignore next */(yargs) => {
	const commandName = Path.basename(__filename, Path.extname(__filename));
	const argsSpec = (subYargs) => subYargs.option('revisionAge', {
		describe: 'Days threshold for failed revisions',
		type: 'number',
		default: 14,
	}).option('force', {
		describe: 'Ignore low revision age, never prompt',
		type: 'boolean',
		default: false,
	});
	return yargs.command(commandName,
		'Remove any incomplete (failed, not processing) revisions',
		argsSpec,
		(argv) => run(argv.revisionAge, argv.force));
};

module.exports = {
	run,
	genYargs,
};
