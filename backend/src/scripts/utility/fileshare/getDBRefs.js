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

const { v5Path } = require('../../../interop');

const { getCollectionsEndsWith } = require('../../utils');

const { find } = require(`${v5Path}/handler/db`);
const Path = require('path');

const run = async (dbName) => {
	if (!dbName) {
		throw new Error('Database name must be provided to execute this script');
	}
	const collections = await getCollectionsEndsWith(dbName, '.ref');
	for (let i = 0; i < collections.length; ++i) {
		const coll = await find(dbName, collections[i].name, {}, {link:1});
		for (let j = 0; j < coll.length; ++j) {
			// eslint-disable-next-line no-console
			console.log(coll[j].link);
		}
	}
};

const genYargs = (yargs) => {
	const commandName = Path.basename(__filename, Path.extname(__filename));
	const argsSpec = (subYargs) => subYargs.positional('database', {
		describe: 'Database name',
		type: 'string',
	});
	return yargs.command(
		commandName,
		'Get all ref links from database and output to console',
		argsSpec,
		(argv) => run(argv._[1]),
	);
};

module.exports = {
	run,
	genYargs,
};
