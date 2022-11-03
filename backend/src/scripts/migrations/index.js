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

const process = require('process');
const Path = require('path');
const { readdirSync } = require('fs');
const { v5Path } = require('../../interop');

const { logger } = require(`${v5Path}/utils/logger`);

const Yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');

const runScripts = async (version, scripts, { list, ...argv }) => {
	try {
		if (list) {
			logger.logInfo(`Migration script v${version} will perform the followings:`);
			for (let i = 0; i < scripts.length; ++i) {
				const { desc } = scripts[i];
				logger.logInfo(`\t${i + 1}. ${desc}`);
			}
		} else {
			logger.logInfo(`================= Migration scripts v${version} =====================`);
			for (let i = 0; i < scripts.length; ++i) {
				const { script, desc } = scripts[i];
				logger.logInfo(`\t${i}/${scripts.length} ${desc}...`);
				// eslint-disable-next-line no-await-in-loop
				await script(argv);
			}
			logger.logInfo('============================= Done ============================');
		}
	} catch (err) {
		logger.logError(`Failed to run the script: ${err?.message || err}`);
		throw err;
	}
};

const genYargs = (version, yargs) => {
	const versionPath = Path.join(__dirname, version);
	// eslint-disable-next-line global-require
	const migrationPack = require(versionPath);

	// Older scripts do not return an object, they just return the scripts
	const scripts = migrationPack?.scripts ?? migrationPack;

	const fullArgsDef = (subYargs) => {
		const retVal = migrationPack?.argsDef ? migrationPack.argsDef(subYargs) : subYargs;
		return retVal.option('list', {
			describe: 'List the actions that will be performed for this migration',
			type: 'boolean',
			default: false,
		});
	};

	return yargs.command(version,
		`Run migration script for v${version}`,
		fullArgsDef,
		(argv) => runScripts(version, scripts, argv));
};

const getMigrationFolders = (dir) => {
	const data = readdirSync(dir, { withFileTypes: true });
	return data.filter((entry) => entry.isDirectory());
};

const populateCommands = (yargs) => {
	const versionFolders = getMigrationFolders(__dirname);
	versionFolders.forEach(({ name }) => {
		genYargs(name, yargs);
	});

	return yargs;
};

const parser = populateCommands(Yargs(hideBin(process.argv)))
	.scriptName('yarn run-migration')
	.wrap(Yargs().terminalWidth())
	.demandCommand()
	.parse();

const processError = (err) => {
	logger.logError(`Command failed with: ${err?.message || err}`);
	// eslint-disable-next-line no-console
	console.error(err);
};

Promise.resolve(parser).catch(processError).finally(process.exit);
