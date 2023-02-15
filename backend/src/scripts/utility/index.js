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

const process = require('process');

const Yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');

const { readdirSync } = require('fs');
const Path = require('path');

const { handleErrorBeforeExit } = require('../utils');

const scripts = [];

const findScripts = (dir, ignoreFiles = true) => {
	const data = readdirSync(dir, { withFileTypes: true });
	data.forEach((entry) => {
		const entryPath = Path.join(dir, entry.name);
		if (entry.isDirectory()) {
			findScripts(entryPath, false);
		} else {
			try {
				if (!ignoreFiles && Path.extname(entry.name) === '.js') {
					// eslint-disable-next-line global-require
					const fn = require(entryPath).genYargs;
					if (fn) scripts.push(fn);
				}
			} catch (err) {
				// eslint-disable-next-line no-console
				console.error(err);
			}
		}
	});
};

findScripts(__dirname);
const populateCommands = (yargs) => {
	scripts.forEach((genYargs) => {
		genYargs(yargs);
	});

	return yargs;
};

const parser = populateCommands(Yargs(hideBin(process.argv)))
	.scriptName('yarn run-script')
	.wrap(Yargs().terminalWidth())
	.demandCommand()
	.fail((msg, err) => {
		if (msg) {
			Yargs().showHelp();
		}
		handleErrorBeforeExit(msg ?? err);
	})
	.parse();

Promise.resolve(parser).catch(handleErrorBeforeExit).finally(() => {
	// eslint-disable-next-line no-process-exit
	process.exit();
});
