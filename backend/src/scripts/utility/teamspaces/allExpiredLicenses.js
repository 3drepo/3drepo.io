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

const { getTeamspaceExpiredLicenses, countLicenses } = require(`${v5Path}/models/teamspaceSettings`);
const { getQuotaInfo, getSpaceUsed } = require(`${v5Path}/utils/quota`);
const { getTeamspaceList, parsePath } = require('../../utils');

const formatDate = (date) => DayJS(date).format('DD/MM/YYYY');

const writeResultsToFile = (results, outFile) => new Promise((resolve) => {
	logger.logInfo(`Writing results to ${outFile}`);
	const writeStream = FS.createWriteStream(outFile);
	writeStream.write('Teamspace,LicenseCount,TeamspaceDataAvailable(MB),TeamspaceDataUsed(MB),Type,LicenseDataUsed(MB),Collabarators,ExpiryDate\n');
	// for each teamspace, write each expired license along with some teamspace aggregate data
	results.forEach(({ teamspaceName, licenseCount, dataAvailableMB, dataUsedMB, expiredLicenses }) => {
		Object.entries(expiredLicenses).forEach(([licenseType, license]) => {
			const { collaborators, expiryDate, data: licenseDataUsedMB } = license;
			writeStream.write(`${teamspaceName},${licenseCount},${dataAvailableMB},${dataUsedMB},${licenseType},${licenseDataUsedMB},${collaborators},${formatDate(expiryDate)}\n`);
		});
	});

	writeStream.end(resolve);
});

const run = async (outFile) => {
	const teamspaces = await getTeamspaceList();
	// map each teamspace to its name, aggregates (license count, quota info), and expired licenses
	const results = await Promise.all(teamspaces.map(async (teamspaceName) => {
		const [licenseCount, quotaInfo, spaceUsed, expiredLicenses] = await Promise.all([countLicenses(teamspaceName), getQuotaInfo(teamspaceName), getSpaceUsed(teamspaceName), getTeamspaceExpiredLicenses(teamspaceName)])
		return {
			teamspaceName,
			licenseCount,
			dataAvailableMB: quotaInfo.data / (1024 * 1024),
			dataUsedMB: spaceUsed,
			expiredLicenses,
		}
	}));
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
