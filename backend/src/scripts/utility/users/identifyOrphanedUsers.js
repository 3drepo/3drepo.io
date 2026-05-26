/**
 *  Copyright (C) 2025 3D Repo Ltd
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
const { v5Path } = require('../../../interop');
const FS = require('fs');

const { logger } = require(`${v5Path}/utils/logger`);
const { getUsersByQuery } = require(`${v5Path}/models/users`);
const { getLastLoginDate } = require(`${v5Path}/models/loginRecords`);

const DEFAULT_OUT_FILE = 'orphanedUsers.csv';

const formatDate = (date) => (date ? DayJS(date).format('DD/MM/YYYY') : '');

const writeResultsToFile = (results, outFile) => new Promise((resolve) => {
	logger.logInfo(`Writing results to ${outFile}`);
	const writeStream = FS.createWriteStream(outFile);
	writeStream.write('Username,First Name,Last Name,Email,Company,Last Login\n');
	results.forEach(({ user, firstName, lastName, email, company, lastLogin }) => {
		writeStream.write(`${user},${firstName},${lastName},${email},${company},${formatDate(lastLogin)}\n`);
	});

	writeStream.end(resolve);
});

const getFileEntry = async ({ user, customData }) => {
	const lastLogin = await getLastLoginDate(user);
	const { firstName, lastName, email, billing } = customData;

	return { user, firstName, lastName, email, company: billing?.billingInfo?.company ?? '', lastLogin: lastLogin ?? '' };
};

const run = async (outFile) => {
	const projection = {
		user: 1,
		'customData.firstName': 1,
		'customData.lastName': 1,
		'customData.email': 1,
		'customData.billing.billingInfo.company': 1,
	};

	const orphanedUsers = await getUsersByQuery({ roles: [{ role: 'user', db: 'admin' }] }, projection);
	const entries = await Promise.all(orphanedUsers.map(getFileEntry));

	await writeResultsToFile(entries, outFile);
};

const genYargs = /* istanbul ignore next */ (yargs) => {
	const commandName = Path.basename(__filename, Path.extname(__filename));

	const argsSpec = (subYargs) => subYargs.option('outFile', {
		describe: 'Name of output file',
		type: 'string',
		default: DEFAULT_OUT_FILE,
	});

	return yargs.command(commandName,
		'Identify users that do not belong to any teamspace',
		argsSpec,
		({ outFile }) => run(outFile));
};

module.exports = {
	run,
	genYargs,
};
