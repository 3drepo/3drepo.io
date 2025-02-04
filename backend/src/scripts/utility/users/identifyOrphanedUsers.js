const Path = require('path');
const { v5Path } = require('../../../interop');
const FS = require('fs');

const { logger } = require(`${v5Path}/utils/logger`);
const { getUsersByQuery } = require(`${v5Path}/models/users`);
const { getLastLoginDate } = require(`${v5Path}/models/loginRecords`);

const DEFAULT_OUT_FILE = 'orphanedUser.csv';

const writeResultsToFile = (results, outFile) => new Promise((resolve) => {
	logger.logInfo(`Writing results to ${outFile}`);
	const writeStream = FS.createWriteStream(outFile);
	writeStream.write('Username,First Name,Last Name,Email,Company,Last Login\n');
	results.forEach(({ user, firstName, lastName, email, company, lastLogin }) => {
		writeStream.write(`${user},${firstName},${lastName},${email},${company},${lastLogin}\n`);
	});

	writeStream.end(resolve);
});

const run = async (outFile = DEFAULT_OUT_FILE) => {
	const query = {
		$expr: {
			$not: {
				$gt: [
					{
						$size: {
							$filter: {
								input: '$roles',
								as: 'role',
								cond: { $ne: ['$$role.db', 'admin'] },
							},
						},
					},
					0,
				],
			},
		},
	};

	const projection = {
		user: 1,
		'customData.firstName': 1,
		'customData.lastName': 1,
		'customData.email': 1,
		'customData.billing.billingInfo.company': 1,
	};

	let orphanedUsers = await getUsersByQuery(query, projection);

	orphanedUsers = await Promise.all(orphanedUsers.map(async ({ user, customData }) => {
		const lastLogin = await getLastLoginDate(user);
		const { firstName, lastName, email, billing: { billingInfo: { company } } } = customData;

		return { user, firstName, lastName, email, company: company ?? '', lastLogin: lastLogin ?? '' };
	}));

	await writeResultsToFile(orphanedUsers, outFile);
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
		(subYargs) => subYargs, run);
};

module.exports = {
	run,
	genYargs,
};
