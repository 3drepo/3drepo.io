/**
 *  Copyright (C) 2021 3D Repo Ltd
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
 * This script identifies zombie files and remove them if instructed
 */
const { v5Path } = require('../../../interop');

const Yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');

const { getTeamspaceList, getCollectionsEndsWith } = require('../../common/utils');

const { logger } = require(`${v5Path}/utils/logger`);
const { fs: fsConfig } = require(`${v5Path}/utils/config`);
const { path: fsPath } = fsConfig;
const { find } = require(`${v5Path}/handler/db`);
const { readdirSync } = require('fs');
const { unlink } = require('fs/promises');
const Path = require('path');

const joinPath = (a, b) => (a && b ? Path.posix.join(a, b) : a || b);

const processTeamspace = async (teamspace, files) => {
	const cols = await getCollectionsEndsWith(teamspace, '.ref');
	await Promise.all(cols.map(async ({ name }) => {
		const refs = await find(teamspace, name, { type: 'fs' }, { link: 1 });
		refs.forEach(({ link }) => files.delete(link));
	}));
};

const removeEntriesWithRef = async (files) => {
	const teamspaces = await getTeamspaceList();
	for (const ts of teamspaces) {
		// eslint-disable-next-line no-await-in-loop
		await processTeamspace(ts, files);
	}
};

const gatherFiles = (subPath, set) => {
	const data = readdirSync(joinPath(fsPath, subPath), { withFileTypes: true });
	data.forEach((entry) => {
		const entryPath = joinPath(subPath, entry.name);
		if (entry.isDirectory()) {
			if (!entry.name.startsWith('toy_')) {
				gatherFiles(entryPath, set);
			}
		} else {
			set.add(entryPath);
		}
	});
};

const getFileList = () => {
	const results = new Set();
	gatherFiles(undefined, results);
	return results;
};

const run = async (removeFiles = false) => {
	logger.logInfo('Gathering list of files from fileshare...');
	const fileList = getFileList();
	logger.logInfo(`Total files in fileshare: ${fileList.size}...`);
	await removeEntriesWithRef(fileList);
	logger.logInfo(`${fileList.size} zombie file(s) found`);
	if (fileList.size) {
		const { argv } = Yargs(hideBin(process.argv));
		if (removeFiles || argv.remove) {
			await Promise.all(Array.from(fileList).map((name) => unlink(joinPath(fsPath, name))));
			logger.logInfo(`${fileList.size} file(s) removed.`);
		} else {
			logger.logInfo('Set --removeFiles=true to remove these files.');
		}
	}
};

const genYargs = (yargs) => {
	const commandName = Path.basename(__filename, Path.extname(__filename));
	const argsSpec = (subYargs) => subYargs.option('removeFiles', {
		type: 'boolean',
		default: false,
		description: 'Delete all orphaned files',
	});
	return yargs.command(
		commandName,
		'Identify unreferenced files within the fileshare',
		argsSpec,
		(argv) => run(argv.removeFiles),
	);
};

module.exports = {
	run,
	genYargs,
};
