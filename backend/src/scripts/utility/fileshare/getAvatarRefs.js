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

const { find } = require(`${v5Path}/handler/db`);
const Path = require('path');

const run = async () => {
	const teamspaces = await find('admin', 'avatars.ref', {});
	for (let i = 0; i < teamspaces.length; ++i) {
		// eslint-disable-next-line no-console
		console.log(teamspaces[i].link);
	}
};

const genYargs = (yargs) => {
	const commandName = Path.basename(__filename, Path.extname(__filename));

	return yargs.command(
		commandName,
		'Get all avatar ref links and output to console',
		{},
		(argv) => run(argv._[1], argv._[2], argv._[3], argv.out),
	);
};

module.exports = {
	run,
	genYargs,
};
