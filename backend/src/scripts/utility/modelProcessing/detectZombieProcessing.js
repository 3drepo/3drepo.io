/**
 *  Copyright (C) 2024 3D Repo Ltd
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

/**
 * This script is used to check the processing status of models/drawings.
 * Processing status should be 'ok' or 'failed'.
 * The utility script `resetProcessingFlag` can be used to reset zombie statuses for models.
 */

const { v5Path } = require('../../../interop');

const { logger } = require(`${v5Path}/utils/logger`);
const { getTeamspaceList } = require('../../utils');

const { find } = require(`${v5Path}/handler/db`);
const { SETTINGS_COL, processStatuses } = require(`${v5Path}/models/modelSettings.constants`);
const { DRAWINGS_HISTORY_COL } = require(`${v5Path}/models/revisions.constants`);
const { sendSystemEmail } = require(`${v5Path}/services/mailer`);
const { templates: emailTemplates } = require(`${v5Path}/services/mailer/mailer.constants`);
const { UUIDToString } = require(`${v5Path}/utils/helper/uuids`);
const Path = require('path');

let TIME_LIMIT = 24 * 60 * 60 * 1000; // hours * 1 hour in ms

const processTeamspace = async (teamspace) => {
	const expiredTimestamp = new Date(new Date() - TIME_LIMIT);
	const zombieQuery = {
		status: { $exists: true, $not: { $regex: `(${processStatuses.OK})|(${processStatuses.FAILED})` } },
		timestamp: { $lt: expiredTimestamp },
	};

	logger.logInfo(`\t-${teamspace}`);

	const zombieModels = await find(teamspace, SETTINGS_COL, zombieQuery, { status: 1, timestamp: 1 });
	const zombieDrawings = await find(teamspace, DRAWINGS_HISTORY_COL, zombieQuery, { status: 1, timestamp: 1 });

	return [
		...zombieModels.map(({ _id, status, timestamp }) => `${teamspace}, model, ${_id}, ${status}, ${timestamp}`),
		...zombieDrawings.map(({ _id, status, timestamp }) => `${teamspace}, drawing, ${UUIDToString(_id)}, ${status}, ${timestamp}`),
	];
};

const run = async (teamspace, limit, notify) => {
	logger.logInfo(`Check processing flag(s) in ${teamspace ?? 'all teamspaces'}`);

	if (limit) {
		TIME_LIMIT = limit * 60 * 60 * 1000;
	}

	const teamspaces = teamspace ? [teamspace] : await getTeamspaceList();
	const results = (await Promise.all(teamspaces.map((ts) => processTeamspace(ts)))).flat();

	if (notify && results.length > 0) {
		logger.logInfo(`Zombie processing statuses found: ${results.length}`);
		const data = {
			script: Path.basename(__filename, Path.extname(__filename)),
			title: 'Zombie processing statuses found',
			message: `${results.length} zombie processing statuses found`,
			logExcerpt: JSON.stringify(results),
		};
		await sendSystemEmail(emailTemplates.ZOMBIE_PROCESSING_STATUSES.name, data);
	}
};

const genYargs = /* istanbul ignore next */(yargs) => {
	const commandName = Path.basename(__filename, Path.extname(__filename));
	const argsSpec = (subYargs) => subYargs.option('teamspace', {
		describe: 'Target a specific teamspace (if unspecified, all teamspaces will be targetted)',
		type: 'string',
	}).option('limit', {
		describe: 'Time limit (hours, default: 24) where models/drawings may still be processing',
		type: 'number',
	}).option('notify', {
		describe: 'Send e-mail notification if results are found (default: false)',
		type: 'boolean',
	});
	return yargs.command(commandName,
		'Checks the processing status of models/drawings.',
		argsSpec,
		(argv) => run(argv.teamspace, argv.limit, argv.notify));
};

module.exports = {
	run,
	genYargs,
};
