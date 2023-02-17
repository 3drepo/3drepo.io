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

const { readFile, readdir } = require('fs/promises');
const Path = require('path');

const Yup = require('yup');

const { handleErrorBeforeExit } = require('../utils');

const { v5Path } = require('../../interop');

const { logger } = require(`${v5Path}/utils/logger`);

const cmdToRunFn = {};
const cmdList = [];

const findCmds = async (dir = __dirname, ignoreFiles = true) => {
	const data = await readdir(dir, { withFileTypes: true });
	for (const entry of data) {
		const entryPath = Path.join(dir, entry.name);
		if (entry.isDirectory()) {
			// eslint-disable-next-line no-await-in-loop
			await findCmds(entryPath, false);
		} else {
			try {
				const { ext, name } = Path.parse(entry.name);
				if (!ignoreFiles && ext === '.js') {
					// eslint-disable-next-line global-require
					const { run: fn } = require(entryPath);
					if (fn) {
						cmdToRunFn[name] = fn;
						cmdList.push(name);
					}
				}
			} catch (err) {
				handleErrorBeforeExit(err);
			}
		}
	}
};

const parser = Yargs(hideBin(process.argv))
	.option('config', {
		type: 'string',
		description: 'Specify the scheduler config file',
		default: Path.join(__dirname, 'scheduler.config.json'),
	})
	.scriptName('yarn run-scheduled-tasks')
	.wrap(Yargs().terminalWidth())
	.parse();

const runScripts = async (scripts) => {
	for (let i = 0; i < scripts.length; ++i) {
		const { name, params } = scripts[i];
		logger.logInfo(`[${i + 1}/${scripts.length}] ${name}${params.length ? ` with ${JSON.stringify(params)}` : ''}...`);
		// eslint-disable-next-line no-await-in-loop
		await cmdToRunFn[name](...params);
	}
};

const getSchema = () => {
	// This needs to be a function as cmdList needs to be initialised
	const taskArrSchema = Yup.array().of(
		Yup.object({
			name: Yup.string().oneOf(cmdList),
			params: Yup.array().of(Yup.mixed()).default([]),
		}),
	).default([]);

	return Yup.object({
		daily: taskArrSchema,
		weekly: taskArrSchema,
		monthly: taskArrSchema,
	});
};

/* Weekly tasks are executed on sundays */
const runWeekly = () => new Date().getDay() === 0;

/* Monthly tasks are executed on the first sunday of every month */
const runMonthly = () => {
	const date = new Date();
	return date.getDay() === 0 && date.getDate() <= 7;
};

const run = async () => {
	const { config } = await parser;
	await findCmds();
	const conf = JSON.parse(await readFile(config, 'utf8'));
	const { daily, weekly, monthly } = await getSchema().validate(conf);
	logger.logInfo('======================== Daily tasks ========================');
	await runScripts(daily);

	if (runWeekly()) {
		logger.logInfo('======================== Weekly tasks ========================');
		await runScripts(weekly);
	}
	if (runMonthly()) {
		logger.logInfo('======================== Monthly tasks ========================');
		await runScripts(monthly);
	}
};

Promise.resolve(run()).catch(handleErrorBeforeExit).finally(() => {
	// eslint-disable-next-line no-process-exit
	process.exit();
});
