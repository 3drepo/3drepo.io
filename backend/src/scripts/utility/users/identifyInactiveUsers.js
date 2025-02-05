const Path = require('path');
const { v5Path } = require('../../../interop');
const FS = require('fs');
const DBHandler = require('../../../v5/handler/db');

const { logger } = require(`${v5Path}/utils/logger`);
const { getUsersByQuery } = require(`${v5Path}/models/users`);
const { getLastLoginDate } = require(`${v5Path}/models/loginRecords`);

const DEFAULT_OUT_FILE = 'inactiveUsers.csv';

const writeResultsToFile = (results, outFile) => new Promise((resolve) => {
	logger.logInfo(`Writing results to ${outFile}`);
	const writeStream = FS.createWriteStream(outFile);
	writeStream.write('Username,First Name,Last Name,Email,Company,Last Login\n');
	results.forEach(({ user, firstName, lastName, email, company, lastLogin }) => {
		writeStream.write(`${user},${firstName},${lastName},${email},${company},${lastLogin}\n`);
	});

	writeStream.end(resolve);
});

const getFileEntry = async ({ user, customData }) => {
	const lastLogin = await getLastLoginDate(user);
	const { firstName, lastName, email, billing: { billingInfo: { company } } } = customData;

	return { user, firstName, lastName, email, company: company ?? '', lastLogin: lastLogin ?? '' };
};

const run = async (monthsOfInactivity, outFile = DEFAULT_OUT_FILE) => {
	const dateSinceLogin = new Date();
	dateSinceLogin.setMonth(dateSinceLogin.getMonth() - monthsOfInactivity);

	const activeUsernames = await DBHandler.distinct('internal', 'loginRecords', 'user', { loginTime: { $gt: dateSinceLogin } });

	const projection = {
		user: 1,
		'customData.firstName': 1,
		'customData.lastName': 1,
		'customData.email': 1,
		'customData.billing.billingInfo.company': 1,
	};

	const inactiveUsers = await getUsersByQuery({ user: { $not: { $in: activeUsernames } } }, projection);
	const entries = await Promise.all(inactiveUsers.map(getFileEntry));

	await writeResultsToFile(entries, outFile);
};

const genYargs = /* istanbul ignore next */ (yargs) => {
	const commandName = Path.basename(__filename, Path.extname(__filename));

	const argsSpec = (subYargs) => subYargs.option('monthsOfInactivity', {
		describe: 'Months passed since the user last logged in',
		type: 'number',
	});

	return yargs.command(commandName,
		'Identify users that have not logged in a specified number of months',
		argsSpec,
		(subYargs) => subYargs, run);
};

module.exports = {
	run,
	genYargs,
};
