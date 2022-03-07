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

const { v5Path } = require('../../interop');

const { logger } = require(`${v5Path}/utils/logger`);

if (process.argv.length < 3) {
	logger.logError('Please specify a migration version');
}

const version = process.argv[2];

const runScripts = async (scripts) => {
	logger.logInfo(`================= Migration scripts v${version} =====================`);
	for (const { script, desc } of scripts) {
		logger.logInfo(`\t${desc}...`);
		// eslint-disable-next-line no-await-in-loop
		await script();
	}
	logger.logInfo('============================= Done ============================');
};

let scripts;

try {
	// eslint-disable-next-line global-require
	scripts = require(`./${version}`);
} catch (err) {
	logger.logError(`Could not load migration script for ${version}`);
	throw err;
}

runScripts(scripts).catch((err) => {
	logger.logError(`Script failed with errors: ${err.message}`);
	// eslint-disable-next-line no-console
	console.log(err);
}).finally(process.exit);
