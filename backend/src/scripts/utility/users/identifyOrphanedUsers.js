const Path = require('path');
const { v5Path } = require('../../../interop');

const { logger } = require(`${v5Path}/utils/logger`);
const { getUsersByQuery, removeUsers } = require(`${v5Path}/models/users`);

const run = async () => {
	const query = { 'customData.inactive': true, 'customData.emailVerifyToken.expiredAt': { $lt: new Date() } };
	const projection = { user: 1 };
	const usersToRemove = await getUsersByQuery(query, projection);
	await removeUsers(usersToRemove.map(({ user }) => user));

	logger.logInfo(`${usersToRemove.length} users removed.`);
};

const genYargs = /* istanbul ignore next */ (yargs) => {
	const commandName = Path.basename(__filename, Path.extname(__filename));
	return yargs.command(commandName,
		'Identify orphaned users',
		(subYargs) => subYargs, run);
};

module.exports = {
	run,
	genYargs,
};
