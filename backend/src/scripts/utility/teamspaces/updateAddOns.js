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

const Path = require('path');
const { v5Path } = require('../../../interop');

const { logger } = require(`${v5Path}/utils/logger`);

const { getAddOns, removeAddOns, updateAddOns } = require(`${v5Path}/models/teamspaceSettings`);
const { deleteIfUndefined } = require(`${v5Path}/utils/helper/objects`);
const { ADD_ONS_MODULES } = require(`${v5Path}/models/teamspaces.constants`);

const run = async (teamspace, vrEnabled, srcEnabled, hereEnabled, powerBIEnabled, modulesString, removeAll) => {
	const addOns = await getAddOns(teamspace);
	logger.logInfo(`${teamspace} currently has the following addOns(s): ${JSON.stringify(addOns)}`);

	if (removeAll) {
		await removeAddOns(teamspace);
	} else {
		let modules;

		if (modulesString === 'null') {
			modules = null;
		} else if (modulesString) {
			modules = modulesString?.split(',');

			if (!modules.every((m) => Object.values(ADD_ONS_MODULES).includes(m))) {
				throw new Error(`Modules must be one of the following: ${Object.values(ADD_ONS_MODULES)}`);
			}
		}

		const toUpdate = deleteIfUndefined({
			vrEnabled,
			hereEnabled,
			srcEnabled,
			powerBIEnabled,
			modules,
		});

		if (!Object.keys(toUpdate).length) {
			throw new Error('Must specify at least 1 add on');
		}

		await updateAddOns(teamspace, toUpdate);
	}

	const addOnsUpdated = await getAddOns(teamspace);
	logger.logInfo(`${teamspace} has been updated. Current subscription(s): ${JSON.stringify(addOnsUpdated)}`);
};

const genYargs = /* istanbul ignore next */(yargs) => {
	const commandName = Path.basename(__filename, Path.extname(__filename));
	const argsSpec = (subYargs) => subYargs.option('vrEnabled',
		{
			describe: 'Enable VR support',
			type: 'boolean',
		}).option('srcEnabled',
		{
			describe: 'Enable SRC (unreal) support',
			type: 'boolean',
		}).option('hereEnabled',
		{
			describe: 'Enable HERE maps support',
			type: 'boolean',
		}).option('powerBIEnabled',
		{
			describe: 'Enable PowerBI support',
			type: 'boolean',
		})
		.option('modules',
			{
				describe: 'Comma seperated string of enabled modules',
				type: 'string',
			})
		.option('teamspace',
			{
				describe: 'teamspace to update',
				type: 'string',
				demandOption: true,
			})
		.option('removeAll',
			{
				describe: 'remove all addOns',
				type: 'boolean',
				default: false,
			});
	return yargs.command(commandName,
		'Update addOns configurations on a teamspace',
		argsSpec,
		(argv) => run(argv.teamspace,
			argv.vrEnabled, argv.srcEnabled, argv.hereEnabled, argv.powerBIEnabled, argv.modules, argv.removeAll));
};

module.exports = {
	run,
	genYargs,
};
