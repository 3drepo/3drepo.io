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

const moveTeamspacePermissions = require('./moveTeamspacePermissions');
const moveTeamspaceFlags = require('./moveTeamspaceFlags');

const scripts = [
	// { script: moveTeamspacePermissions, desc: 'Move teamspace permissions to teamspace settings' },
	{ script: moveTeamspaceFlags, desc: 'Move teamspace flags to addOns' },
];

const argsDef = (yargs) => yargs.option('maxParallelSizeMB',
	{
		describe: 'Maximum amount of file size to process in parallel',
		type: 'number',
		default: 2048,
	}).option('maxParallelFiles',
	{
		describe: 'Maximum amount of files to process in parallel',
		type: 'number',
		default: 2000,
	});

module.exports = { scripts, argsDef };
