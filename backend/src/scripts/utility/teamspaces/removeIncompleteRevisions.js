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

const { v4Path, v5Path } = require('../../../interop');

const { logger } = require(`${v5Path}/utils/logger`);
const { getTeamspaceList, getCollectionsEndsWith } = require('../../common/utils');
const FS = require('fs');
const Path = require('path');

const { bulkWrite, count, find } = require(`${v5Path}/handler/db`);
const { removeFiles } = require(`${v4Path}/handler/externalServices`);
const { UUIDToString } = require(`${v5Path}/utils/helper/uuids`);

const removeRefFile = async (teamspace, collection, filter) => {
	// remove files from .ref
	const refs = await count(teamspace, collection, filter);
	console.log(refs);
};

const removeGridFSFile = async (teamspace, collection, filter) => {
	// remove gridfs from .files
	const files = await count(teamspace, collection, filter);
	console.log(files);
};

const processFilesAndRefs = async (teamspace, collection, filenames = [], filter) => {
	console.log(`process ${teamspace}::${collection}::${filenames.length}`);
	filter = filter || { _id: {$in: filenames} };

	for (type of ['fs', 's3', 'gridfs', 'alluxio']) {
		try {
			console.log(type);
			if ('gridfs' === type && filenames.length > 0) {
				await removeFiles(teamspace, collection, type, filenames);
			} else {
				// retrieve file links
				console.log({ ...filter, type });
				const fileRefs = await find(
					teamspace,
					collection,
					{ ...filter, type },
					{ link: 1 },
				);
				console.log(fileRefs);
				const links = fileRefs.map((ref) => ref.link);
				console.log(links);
				if (links.length > 0) {
					const res = await removeFiles(teamspace, collection, type, links);
					console.log(res);
				}
			}
		} catch (err) {
			console.log(err);
			logger.logError(err);
		}
	}
};

const processCollection = async (teamspace, collection, filter, refAttribute) => {
	const projection = {};
	projection[refAttribute] = 1;

	const results = await find(teamspace, collection, filter, projection);
	const filenames = [];

	for (const record of results) {
		const fileRefs = record[refAttribute];
		if (fileRefs) {
			filenames.push(fileRefs);
		}
	}

	await processFilesAndRefs(teamspace, collection, filenames);

	// await deleteMany(teamspace, collection, filter);
};

const processModelStashMpc = async (teamspace, model, revId) => {
	// await processFilesAndRefs(teamspace, `${model}.stash.json_mpc.ref`, ['58/200/9fd5285c-7a49-4b9c-8878-14101d9fedcd','bf9670e0-b735-11ec-973a-6dcd25debb2e/tree_path.json']);

	// get list of file links
	await processFilesAndRefs(
		teamspace,
		`${model}.stash.json_mpc.ref`,
		undefined,
		{ filename: { $regex: `^/${teamspace}/${model}/revision/${UUIDToString(revId)}/` } },
	);

	await processFilesAndRefs(
		teamspace,
		`${model}.stash.json_mpc.ref`,
		undefined,
		{ _id: { $regex: `^${UUIDToString(revId)}/` } },
	);
};

const processModelStash = async (teamspace, model, revId) => {
	await processCollection(teamspace, `${model}.stash.3drepo`, { rev_id: revId }, '_extRef');
};

const processModelSequences = async (teamspace, model, revId) => {
	// await processCollection(teamspace, `${model}.sequences`, { rev_id: revId }, 'frames');
	const sequences = await find(teamspace, `${model}.sequences`, { rev_id: revId }, { frames: 1 });
	const sequenceFilenames = [];

	for (const { frames } of sequences) {
		if (frames) {
			console.log(frames);
			for (const { state } of Object.values(frames)) {
				console.log(state);
				// remove gridfs from sequences.files
				sequenceFilenames.push(state);
				// maybe remove files from sequences.ref
				// activities?
				// -- based on sequenceId
				// activities.files?
				// activities.ref?
			}
		}
	}

	await processFilesAndRefs(teamspace, `${model}.sequences.ref`, sequenceFilenames);

	// await deleteMany(teamspace, `${model}.sequences`, { rev_id: revId });
};

const processModelScene = async (teamspace, model, revId) => {
	await processCollection(teamspace, `${model}.scene`, { rev_id: revId }, '_extRef');
};

const processTeamspace = async (teamspace) => {
	const cols = await getCollectionsEndsWith(teamspace, '.history');

	for (const { name } of cols) {
		const badRevisions = await find(teamspace, name, {
			incomplete: { $exists: true},
			timestamp: { $lt: new Date(Date.now()-1000*60*60*24*14) },
		}, { rFile: 1 });

		for (const { _id, rFile } of badRevisions) {
			const model = name.slice(0, -('.history'.length));;

			await processFilesAndRefs(teamspace, name, rFile);

			// await processModelScene(teamspace, model, _id);
			// await processModelSequences(teamspace, model, _id);
			// await processModelStash(teamspace, model, _id);
			await processModelStashMpc(teamspace, model, _id);
		}
	}
};

const run = async (outFile) => {
	logger.logInfo('Finding all members from all teamspaces...');
	const teamspaces = ['charence']; // await getTeamspaceList();
	for (const teamspace of teamspaces) {
		logger.logInfo(`\t-${teamspace}`);
		// eslint-disable-next-line no-await-in-loop
		await processTeamspace(teamspace);
	}
};

const genYargs = (yargs) => {
	const commandName = Path.basename(__filename, Path.extname(__filename));
	const argsSpec = (subYargs) => subYargs.option('out', {
		describe: 'file path for the output CSV',
		type: 'string',
		default: './output.csv',
	});
	return yargs.command(commandName,
		'Create a CSV dump of all members from all teamspaces',
		argsSpec,
		(argv) => run(argv.out));
};

module.exports = {
	run,
	genYargs,
};
