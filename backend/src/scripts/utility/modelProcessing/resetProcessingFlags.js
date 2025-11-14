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
 * This script is used manually overwrite the processing state of model(s).
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

const { DRAWINGS_HISTORY_COL } = require(`${v5Path}/models/revisions.constants`);
const { updateMany } = require(`${v5Path}/handler/db`);
const { SETTINGS_COL } = require(`${v5Path}/models/modelSettings.constants`);
const Path = require('path');

const processTeamspace = async (teamspace, model) => {
	const modelQuery = model ? { _id: model } : {};
	const drawingQuery = model ? { model } : {};

	const modelAction = { $unset: { status: 1 } };
	await updateMany(teamspace, SETTINGS_COL, modelQuery, modelAction);

	const drawingAction = { $set: { status: 'failed' } };
	await updateMany(teamspace, DRAWINGS_HISTORY_COL, { ...drawingQuery, status: 'queued' }, drawingAction);
};

const run = async (teamspace, model) => {
	if (model && !teamspace) {
		throw new Error('Teamspace must be provided if model is defined');
	}
	logger.logInfo(`Reset processing flag(s) in ${teamspace ?? 'all teamspaces'}${model ? `.${model}` : ''}`);

	const teamspaces = teamspace ? [teamspace] : await getTeamspaceList();
	for (const ts of teamspaces) {
		logger.logInfo(`\t-${ts}`);
		// eslint-disable-next-line no-await-in-loop
		await processTeamspace(ts, model);
	}
};

const genYargs = /* istanbul ignore next */(yargs) => {
	const commandName = Path.basename(__filename, Path.extname(__filename));
	const argsSpec = (subYargs) => subYargs.option('teamspace', {
		describe: 'Target a specific teamspace (if unspecified, all teamspaces will be targetted)',
		type: 'string',
	}).option('model', {
		describe: 'Target a specific model (if unspecified, all models will ba targetted)',
		type: 'string',
	});
	return yargs.command(commandName,
		'Manually resets the processing state of a model. (Warning: This may introduce non deterministic behaviour to the application!)',
		argsSpec,
		(argv) => run(argv.teamspace, argv.model));
};

module.exports = {
	run,
	genYargs,
};
