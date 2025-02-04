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

const DayJS = require('dayjs');
const Path = require('path');
const FS = require('fs');
const { v5Path } = require('../../../interop');

const { logger } = require(`${v5Path}/utils/logger`);

const { getTeamspaceList, parsePath } = require('../../utils');

const { getTeamspaceAggregatesAndLicenses } = require(`${v5Path}/processors/teamspaces/teamspaces`);

const { getTeamspaceExpiredLicenses } = require(`${v5Path}/models/teamspaceSettings`);

const formatDate = (date) => DayJS(date).format('DD/MM/YYYY');

const writeResultsToFile = (results, outFile) => new Promise((resolve) => {
	logger.logInfo(`Writing results to ${outFile}`);
	const writeStream = FS.createWriteStream(outFile);
	writeStream.write('TeamspaceName,LicenseCount,TeamspaceDataTotal(MB),TeamspaceDataUsed(MB),LicenseType,LicenseDataTotal(MB),Collaborators,ExpiryDate\n');
	// for each teamspace, write each expired license along with some teamspace aggregate data
	results.forEach(({ teamspaceName, licenseCount, dataTotalMB, dataUsedMB, licenses }) => {
		Object.entries(licenses).forEach(([licenseType, license]) => {
			const { collaborators, expiryDate, data } = license;
			writeStream.write(`${teamspaceName},${licenseCount},${dataTotalMB},${dataUsedMB},${licenseType},${data},${collaborators},${formatDate(expiryDate)}\n`);
		});
	});

	writeStream.end(resolve);
});

const run = async (outFile) => {
	const teamspaces = await getTeamspaceList();
	const results = await getTeamspaceAggregatesAndLicenses(teamspaces, getTeamspaceExpiredLicenses);
	await writeResultsToFile(results, parsePath(outFile));
};

const genYargs = /* istanbul ignore next */ (yargs) => {
	const commandName = Path.basename(__filename, Path.extname(__filename));
	const argsSpec = (subYargs) => subYargs.option('outFile',
		{
			describe: 'name of output CSV',
			type: 'string',
			default: 'expiredTeamspaces.csv',
		});
	return yargs.command(commandName,
		'Get a list of all teamspaces with expired license',
		argsSpec,
		(argv) => run(argv.outFile));
};

module.exports = {
	run,
	genYargs,
};
