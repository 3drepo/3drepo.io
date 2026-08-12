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
 * This script checks for models/drawings/clash runs stuck in non-terminal processing states.
 * The utility script `resetProcessingFlags` can be used to reset zombie statuses.
 */

const { v5Path } = require('../../../interop');

const { logger } = require(`${v5Path}/utils/logger`);
const { getTeamspaceList } = require('../../utils');

const { find } = require(`${v5Path}/handler/db`);
const { SETTINGS_COL, processStatuses } = require(`${v5Path}/models/modelSettings.constants`);
const { DRAWINGS_HISTORY_COL } = require(`${v5Path}/models/revisions.constants`);
const { CLASH_RUNS_COL, clashRunStatus } = require(`${v5Path}/models/clashes.constants`);
const { sendSystemEmail } = require(`${v5Path}/services/mailer`);
const { templates: emailTemplates } = require(`${v5Path}/services/mailer/mailer.constants`);
const { UUIDToString } = require(`${v5Path}/utils/helper/uuids`);
const Path = require('path');

let TIME_LIMIT = 24 * 60 * 60 * 1000; // hours * 1 hour in ms

const processTeamspace = async (teamspace, results) => {
	const expiredTimestamp = new Date(new Date() - TIME_LIMIT);
	const zombieQuery = {
		status: { $exists: true, $not: { $regex: `(${processStatuses.OK})|(${processStatuses.FAILED})` } },
		timestamp: { $lt: expiredTimestamp },
	};
	const zombieClashRunQuery = {
		status: { $exists: true, $nin: [clashRunStatus.COMPLETED, clashRunStatus.FAILED, clashRunStatus.ABORTED] },
		updatedAt: { $lt: expiredTimestamp },
	};

	logger.logInfo(`\t-${teamspace}`);

	const zombieModels = await find(teamspace, SETTINGS_COL, zombieQuery, { status: 1, timestamp: 1 });
	const zombieDrawings = await find(teamspace, DRAWINGS_HISTORY_COL, zombieQuery, { status: 1, timestamp: 1 });
	const zombieClashRuns = await find(teamspace, CLASH_RUNS_COL, zombieClashRunQuery, { status: 1, updatedAt: 1 });

	results.models.push(...zombieModels.map(({ _id: id, status, timestamp }) => ({
		teamspace, id, status, timestamp,
	})));
	results.drawings.push(...zombieDrawings.map(({ _id: id, status, timestamp }) => ({
		teamspace,
		id: UUIDToString(id),
		status,
		timestamp,
	})));
	results.clashRuns.push(...zombieClashRuns.map(({ _id: id, status, updatedAt }) => ({
		teamspace,
		id: UUIDToString(id),
		status,
		timestamp: updatedAt,
	})));
};

const run = async (teamspace, limit, notify) => {
	logger.logInfo(`Check processing flag(s) in ${teamspace ?? 'all teamspaces'}`);

	if (limit) {
		TIME_LIMIT = limit * 60 * 60 * 1000;
	}

	const teamspaces = teamspace ? [teamspace] : await getTeamspaceList();
	const results = { models: [], drawings: [], clashRuns: [] };
	await Promise.all(teamspaces.map((ts) => processTeamspace(ts, results)));
	const totalResults = results.models.length + results.drawings.length + results.clashRuns.length;

	if (notify && totalResults > 0) {
		logger.logInfo(`Zombie processing statuses found: ${totalResults}`);
		const data = {
			script: Path.basename(__filename, Path.extname(__filename)),
			title: 'Zombie processing statuses found',
			message: `${totalResults} zombie processing statuses found`,
			zombieEntries: results,
		};
		await sendSystemEmail(emailTemplates.ZOMBIE_PROCESSING_STATUSES.name, data);
	}
};

const genYargs = /* istanbul ignore next */(yargs) => {
	const commandName = Path.basename(__filename, Path.extname(__filename));
	const argsSpec = (subYargs) => subYargs.option('teamspace', {
		describe: 'Target a specific teamspace (if unspecified, all teamspaces will be targeted)',
		type: 'string',
	}).option('limit', {
		describe: 'Time limit (hours, default: 24) where models/drawings/clash runs may still be processing',
		type: 'number',
	}).option('notify', {
		describe: 'Send e-mail notification if results are found (default: false)',
		type: 'boolean',
	});
	return yargs.command(commandName,
		'Checks the processing status of models/drawings/clash runs.',
		argsSpec,
		(argv) => run(argv.teamspace, argv.limit, argv.notify));
};

module.exports = {
	run,
	genYargs,
};
