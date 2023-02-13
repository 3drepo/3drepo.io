/**
 *  Copyright (C) 2023 3D Repo Ltd
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

const { readFile } = require('fs/promises');
const Path = require('path');

const parser = Yargs(hideBin(process.argv))
	.option('config', {
		type: 'string',
		description: 'Specify the scheduler config file',
		default: Path.join(__dirname, 'scheduler.config.json'),
	})
	.scriptName('yarn run-scheduled-tasks')
	.wrap(Yargs().terminalWidth())
	.parse();

const run = async () => {
	const { config } = await parser;
	const conf = JSON.parse(await readFile(config, 'utf8'));

	console.log(conf);
};

// eslint-disable-next-line no-console
Promise.resolve(run()).catch(console.error).finally(process.exit);
