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
const { readdirSync } = require('fs');
const Path = require('path');

const Yup = require('yup');

const { v5Path } = require('../../interop');

const { logger } = require(`${v5Path}/utils/logger`);

const cmdToRunFn = {};

const logError = (err) => {
	logger.logError(err?.message ?? err);
	// eslint-disable-next-line no-console
	console.error(err);
};

const findCmds = (dir = __dirname, ignoreFiles = true) => {
	const data = readdirSync(dir, { withFileTypes: true });
	data.forEach((entry) => {
		const entryPath = Path.join(dir, entry.name);
		if (entry.isDirectory()) {
			findCmds(entryPath, false);
		} else {
			try {
				const { ext, name } = Path.parse(entry.name);
				if (!ignoreFiles && ext === '.js') {
					// eslint-disable-next-line global-require
					const fn = require(entryPath).run;
					if (fn) {
						cmdToRunFn[name] = fn;
					}
				}
			} catch (err) {
				logError(err);
			}
		}
	});
};

findCmds();
const cmdList = Object.keys(cmdToRunFn);
const parser = Yargs(hideBin(process.argv))
	.option('config', {
		type: 'string',
		description: 'Specify the scheduler config file',
		default: Path.join(__dirname, 'scheduler.config.json'),
	})
	.scriptName('yarn run-scheduled-tasks')
	.wrap(Yargs().terminalWidth())
	.parse();

const taskArrSchema = Yup.array().of(
	Yup.object({
		name: Yup.string().oneOf(cmdList),
		params: Yup.array().of(Yup.mixed()).default([]),
	}),
).default([]);

const schema = Yup.object({
	daily: taskArrSchema,
	weekly: taskArrSchema,
	monthly: taskArrSchema,
});

const runScripts = (scripts) => {
	for (let i = 0; i < scripts.length; ++i) {
		const { name, params } = scripts[i];
		logger.logInfo(`Running ${name} ${params.length ? `with ${JSON.stringify(params)}` : ''}...`);
	}
};

const run = async () => {
	const { config } = await parser;
	const conf = JSON.parse(await readFile(config, 'utf8'));
	const { daily, weekly, monthly } = await schema.validate(conf);
	runScripts(daily);
	runScripts(weekly);
	runScripts(monthly);
};

// eslint-disable-next-line no-console
Promise.resolve(run()).catch(logError).finally(process.exit);
