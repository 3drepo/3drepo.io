/**
 *  Copyright (C) 2026 3D Repo Ltd
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

const { INTERNAL_DB } = require(`${v5Path}/handler/db.constants`);
const { deleteMany } = require(`${v5Path}/handler/db`);
const { logger } = require(`${v5Path}/utils/logger`);

const NOTIFICATIONS_COL = 'notifications';

const run = async () => {
	// the current date minus 30 days
	const date = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
	logger.logInfo(`Removing notifications older than ${date.toISOString()}`);

	await deleteMany(INTERNAL_DB, NOTIFICATIONS_COL, { timestamp: { $lt: date } });
	logger.logInfo('Notifications older than a month have been removed');
};

const genYargs = /* istanbul ignore next */ (yargs) => {
	const commandName = Path.basename(__filename, Path.extname(__filename));

	return yargs.command(commandName,
		'Remove all notifications older than a month',
		() => {},
		() => run());
};

module.exports = {
	run,
	genYargs,
};
