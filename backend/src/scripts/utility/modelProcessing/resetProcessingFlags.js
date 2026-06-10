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

/**
 * This script is used manually overwrite the processing state of model(s)/drawing(s)/clash run(s).
 * This is typically used if the queue had an unrecoverable failure and queued
 * processes were purged without being processed (i.e. items stuck in processing/queued state
 * when they no longer physically exists).
 *
 * NOTE: Running this script in any other situation may result in non deterministic behaviour.
 * Make sure you know what you're doing!
 */

const { v5Path } = require('../../../interop');

const { logger } = require(`${v5Path}/utils/logger`);
const { getTeamspaceList } = require('../../utils');

const { deleteIfUndefined } = require(`${v5Path}/utils/helper/objects`);
const { DRAWINGS_HISTORY_COL } = require(`${v5Path}/models/revisions.constants`);
const { updateMany } = require(`${v5Path}/handler/db`);
const { SETTINGS_COL, processStatuses } = require(`${v5Path}/models/modelSettings.constants`);
const { CLASH_RUNS_COL, clashRunStatus } = require(`${v5Path}/models/clashes.constants`);
const { stringToUUID } = require(`${v5Path}/utils/helper/uuids`);
const Path = require('path');

const MANUAL_CANCELLATION_REASON = 'Cancelled manually';
const RESET_TYPES = {
	MODELS: 'models',
	DRAWINGS: 'drawings',
	CLASHES: 'clashes',
};
const RESET_TYPE_OPTIONS = Object.values(RESET_TYPES);

const shouldResetType = (resetType, type) => !type || type === resetType;

const processTeamspace = async (teamspace, id, type) => {
	const drawingStatusQuery = {
		status: {
			$exists: true,
			$nin: [
				processStatuses.OK,
				processStatuses.FAILED,
			],
		},
	};
	const modelQuery = deleteIfUndefined({ _id: id });
	const drawingQuery = deleteIfUndefined({ model: id, ...drawingStatusQuery });
	const clashRunQuery = deleteIfUndefined({
		_id: stringToUUID(id),
		status: {
			$nin: [
				clashRunStatus.COMPLETED,
				clashRunStatus.FAILED,
				clashRunStatus.ABORTED,
			],
		},
	});

	const modelAction = { $unset: { status: 1 } };
	const drawingAction = { $set: { status: processStatuses.FAILED } };
	const clashRunAction = {
		$set: {
			status: clashRunStatus.ABORTED,
			results: { error: { reason: MANUAL_CANCELLATION_REASON } },
			updatedAt: new Date(),
		},
	};

	const updatePromises = [];

	if (shouldResetType(RESET_TYPES.MODELS, type)) {
		updatePromises.push(updateMany(teamspace, SETTINGS_COL, modelQuery, modelAction));
	}

	if (shouldResetType(RESET_TYPES.DRAWINGS, type)) {
		updatePromises.push(updateMany(teamspace, DRAWINGS_HISTORY_COL, drawingQuery, drawingAction));
	}

	if (shouldResetType(RESET_TYPES.CLASHES, type)) {
		updatePromises.push(updateMany(teamspace, CLASH_RUNS_COL, clashRunQuery, clashRunAction));
	}

	await Promise.all(updatePromises);
};

const run = async (teamspace, id, type) => {
	if (id && !teamspace) {
		throw new Error('Teamspace must be provided if id is defined');
	}
	if (type && !RESET_TYPE_OPTIONS.includes(type)) {
		throw new Error(`Type must be one of: ${RESET_TYPE_OPTIONS.join(', ')}`);
	}
	logger.logInfo(`Reset processing flag(s) in ${teamspace ?? 'all teamspaces'}${id ? `.${id}` : ''}${type ? ` (${type})` : ''}`);

	const teamspaces = teamspace ? [teamspace] : await getTeamspaceList();
	for (const ts of teamspaces) {
		logger.logInfo(`\t-${ts}`);
		// eslint-disable-next-line no-await-in-loop
		await processTeamspace(ts, id, type);
	}
};

const genYargs = /* istanbul ignore next */(yargs) => {
	const commandName = Path.basename(__filename, Path.extname(__filename));
	const argsSpec = (subYargs) => subYargs.option('teamspace', {
		describe: 'Target a specific teamspace (if unspecified, all teamspaces will be targetted)',
		type: 'string',
	}).option('id', {
		describe: 'Target a specific item id (if unspecified, all items will be targetted)',
		type: 'string',
	}).option('type', {
		describe: 'Target a specific item type',
		choices: RESET_TYPE_OPTIONS,
		type: 'string',
	});
	return yargs.command(commandName,
		'Manually resets processing state. (Warning: This may introduce non deterministic behaviour to the application!)',
		argsSpec,
		(argv) => run(argv.teamspace, argv.id, argv.type));
};

module.exports = {
	run,
	genYargs,
};
