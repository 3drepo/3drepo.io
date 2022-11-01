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

const TypeChecker = require(`${v5Path}/utils/helper/typeCheck`);

const { deleteMany, find } = require(`${v5Path}/handler/db`);
const { removeFilesWithMeta } = require(`${v5Path}/services/filesManager`);
const { UUIDToString } = require(`${v5Path}/utils/helper/uuids`);

const processFilesAndRefs = async (teamspace, collection, filter) => {
	try {
		await removeFilesWithMeta(teamspace, collection, filter);
	} catch (err) {
		logger.logError(err);
	}
};

const removeRecords = async (teamspace, collection, filter, refAttribute) => {
	if (refAttribute) {
		const projection = { [refAttribute]: 1 };
		const filesFilter = { ...filter, [refAttribute]: { $exists: true } };

		const results = await find(teamspace, collection, filesFilter, projection);
		const filenames = [];

		results.flatMap((record) => {
			const fileRefs = record[refAttribute];
			if (fileRefs) {
				// handle different ref formats
				// record refs currently stored in the following formats:
				// 1) { ref: 'refString' }
				// 2) { ref: {
				//        key1: 'key1RefString',
				//        key2: 'key2RefString',
				//    }
				if (TypeChecker.isString(fileRefs)) {
					filenames.push(fileRefs);
				} else if (TypeChecker.isObject(fileRefs)) {
					// for record removal, we want to remove all refs,
					// i.e. 'key1RefString' and 'key2RefString',
					// do not need to discern between keys
					for (const entry of Object.values(fileRefs)) {
						filenames.push(entry);
					}
				} else {
					logger.logError(`Unsupported record type: ${Object.prototype.toString.call(fileRefs)}`);
				}
			}

			return fileRefs;
		});

		await processFilesAndRefs(teamspace, collection, { _id: { $in: filenames } });
	}

	await deleteMany(teamspace, collection, filter);
};

const processModelStash = async (teamspace, model, revId) => {
	const modelStashPromises = [];

	modelStashPromises.push(processFilesAndRefs(
		teamspace,
		`${model}.stash.json_mpc`,
		{ filename: { $regex: `^/${teamspace}/${model}/revision/${UUIDToString(revId)}/` } },
	));

	modelStashPromises.push(processFilesAndRefs(
		teamspace,
		`${model}.stash.json_mpc.ref`,
		{ _id: { $regex: `^${UUIDToString(revId)}/` } },
	));

	const supermeshIds = (await find(teamspace, `${model}.stash.3drepo`, { rev_id: revId, type: 'mesh' }, { _id: 1 })).map((r) => UUIDToString(r._id));
	supermeshIds.map((supermeshId) => {
		modelStashPromises.push(processFilesAndRefs(teamspace, `${model}.stash.json_mpc.ref`, { _id: { $in: [
			`${supermeshId}.json.mpc`,
			`${supermeshId}_unity.json.mpc`,
		] } }));
		modelStashPromises.push(processFilesAndRefs(teamspace, `${model}.stash.src.ref`, { _id: { $in: [
			`${supermeshId}.src.mpc`,
		] } }));
		modelStashPromises.push(processFilesAndRefs(teamspace, `${model}.stash.unity3d.ref`, { _id: { $in: [
			`${supermeshId}.unity3d`,
		] } }));

		return supermeshId;
	});

	modelStashPromises.push(removeRecords(teamspace, `${model}.stash.unity3d`, { _id: revId }));
	modelStashPromises.push(removeRecords(teamspace, `${model}.stash.3drepo`, { rev_id: revId }, '_extRef'));

	await Promise.all(modelStashPromises);
};

const processModelSequences = async (teamspace, model, revId) => {
	const sequences = await find(teamspace, `${model}.sequences`, { rev_id: revId }, { frames: 1 });
	const stateFilenames = [];

	for (const { _id, frames } of sequences) {
		if (frames) {
			for (const { state } of frames) {
				stateFilenames.push(state);
			}
		}

		// TODO
		// eslint-disable-next-line no-await-in-loop
		await Promise.all([
			removeRecords(teamspace, `${model}.activities`, { sequenceId: _id }, '_extRef'),
			processFilesAndRefs(teamspace, `${model}.activities.ref`, { _id: UUIDToString(_id) }),
		]);
	}

	await processFilesAndRefs(teamspace, `${model}.sequences.ref`, { _id: { $in: stateFilenames } });

	await deleteMany(teamspace, `${model}.sequences`, { rev_id: revId });
};

const processModelScene = async (teamspace, model, revId) => {
	await removeRecords(teamspace, `${model}.scene`, { rev_id: revId }, '_extRef');
};

const removeRevision = async (teamspace, model, revId) => {
	logger.logInfo(`\t\t-${model}::${UUIDToString(revId)}`);

	await Promise.all([
		processModelScene(teamspace, model, revId),
		processModelSequences(teamspace, model, revId),
		processModelStash(teamspace, model, revId),
	]);
};

const processTeamspace = async (teamspace, revisionAge) => {
	const cols = await getCollectionsEndsWith(teamspace, '.history');

	for (const { name } of cols) {
		const expiryTS = new Date();
		const incompleteRevisionFilter = {
			incomplete: { $exists: true },
			timestamp: { $lt: new Date(expiryTS.setDate(expiryTS.getDate() - revisionAge)) },
		};

		// eslint-disable-next-line no-await-in-loop
		const badRevisions = await find(teamspace, name, incompleteRevisionFilter, { rFile: 1 });

		for (const { _id, rFile } of badRevisions) {
			const model = name.slice(0, -('.history'.length));
			// eslint-disable-next-line no-await-in-loop
			await removeRevision(teamspace, model, _id);

			// eslint-disable-next-line no-await-in-loop
			await processFilesAndRefs(teamspace, name, { _id: { $in: rFile } });
		}

		// eslint-disable-next-line no-await-in-loop
		await removeRecords(teamspace, name, incompleteRevisionFilter);
	}
};

const run = async (revisionAge) => {
	logger.logInfo('Finding all members from all teamspaces...');
	const teamspaces = ['charence']; // await getTeamspaceList();
	for (const teamspace of teamspaces) {
		logger.logInfo(`\t-${teamspace}`);
		// eslint-disable-next-line no-await-in-loop
		await processTeamspace(teamspace, revisionAge);
	}
};

const genYargs = (yargs) => {
	const commandName = Path.basename(__filename, Path.extname(__filename));
	const argsSpec = (subYargs) => subYargs.option('revisionAge', {
		describe: 'Days threshold for failed revisions',
		type: 'number',
		default: 14,
	});
	return yargs.command(commandName,
		'Remove any incomplete (failed, not processing) revisions',
		argsSpec,
		(argv) => run(argv.revisionAge));
};

module.exports = {
	run,
	genYargs,
};
