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

const { Key, Helpers } = require('cryptolens');
const { RSA_PUB_KEY, TOKEN, PRODUCT_ID } = require('./licenses.constants');

const { v5Path } = require('../../../interop');

const { logger } = require(`${v5Path}/utils/logger`);
const config = require(`${v5Path}/utils/config`);
const Path = require('path');

const run = async () => {
	try {
		if (!config.repoLicense) throw new Error('No license in configuration');
		const machineCode = Helpers.GetMachineCode();
		const res = await Key.Activate(TOKEN, RSA_PUB_KEY, PRODUCT_ID, config.repoLicense, machineCode);
		logger.logInfo('License verified.');
		logger.logInfo(`Key: ${res.Key}`);
		logger.logInfo(`Created: ${new Date(res.Created * 1000)}`);
		logger.logInfo(`Expires at: ${new Date(res.Expires * 1000)}`);
		logger.logInfo(`Max Number of machines: ${res.MaxNoOfMachines}`);
		logger.logInfo(`Number of machines currently activated: ${res.ActivatedMachines.length}`);

		await Key.Deactivate(TOKEN, PRODUCT_ID, config.repoLicense, machineCode);
	} catch (err) {
		logger.logError(`Verification failed: ${err.message}`);
	}
};

const genYargs = /* istanbul ignore next */(yargs) => {
	const commandName = Path.basename(__filename, Path.extname(__filename));
	const argsSpec = (subYargs) => subYargs;
	return yargs.command(commandName,
		'Check if the 3drepo license provided is valid',
		argsSpec,
		run);
};

module.exports = {
	run,
	genYargs,
};
