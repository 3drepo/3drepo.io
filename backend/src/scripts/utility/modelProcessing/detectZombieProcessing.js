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
 * This script is used to check the processing state of model(s).
 * Model status should be 'ok' or 'failed' unless it is either 'queued' or 'processing'.
 * Models that have a 'queued' or 'processing' status while not present in the queued
 * have in a bad state and resetProcessingFlag can be used to reset it.
 */

const { v5Path } = require('../../../interop');

const { logger } = require(`${v5Path}/utils/logger`);
const { getTeamspaceList } = require('../../utils');

const { find } = require(`${v5Path}/handler/db`);
const { SETTINGS_COL } = require(`${v5Path}/models/modelSettings.constants`);
const { sendSystemEmail } = require(`${v5Path}/services/mailer`);
const { templates: emailTemplates } = require(`${v5Path}/services/mailer/mailer.constants`);
const Path = require('path');

let TIME_LIMIT = 24 * 60 * 60 * 1000; // hours * 1 hour in ms

const processTeamspace = async (teamspace, model) => {
	const expiredTimestamp = new Date((new Date()) - TIME_LIMIT);
	const incompleteStatusQuery = { $or: [{ status: 'processing' }, { status: 'queued' }], timestamp: { $lt: expiredTimestamp } };
	const query = model ? { ...incompleteStatusQuery, _id: model } : incompleteStatusQuery;

	const incompleteModels = await find(teamspace, SETTINGS_COL, query, { status: 1, timestamp: 1 });
	logger.logInfo(`\t-${teamspace}`);

	return incompleteModels.map(({ _id, status, timestamp }) => {
		logger.logInfo(`\t\t${_id} - status: ${status}, timestamp: ${timestamp}`);
		return { teamspace, model: _id, status, timestamp };
	});
};

const run = async (teamspace, model, limit, notify) => {
	if (model && !teamspace) {
		throw new Error('Teamspace must be provided if model is defined');
	}
	logger.logInfo(`Check processing flag(s) in ${teamspace ?? 'all teamspaces'}${model ? `.${model}` : ''}`);

	if (limit) {
		TIME_LIMIT = limit * 60 * 60 * 1000;
	}

	const teamspaces = teamspace ? [teamspace] : await getTeamspaceList();
	const results = (await Promise.all(teamspaces.map((ts) => processTeamspace(ts, model)))).flat();

	if (notify && results.length > 0) {
		const data = {
			err: JSON.stringify(results),
			scope: Path.basename(__filename, Path.extname(__filename)),
			title: 'Unexpected model status found',
			message: `${results.length} unexpected status found`,
		};
		await sendSystemEmail(emailTemplates.ERROR_NOTIFICATION.name, data);
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
	}).option('limit', {
		describe: 'Time limit (hours, default: 24) where models may still be processing',
		type: 'number',
	}).option('notify', {
		describe: 'Send e-mail notification if results are found (default: false)',
		type: 'boolean',
	});
	return yargs.command(commandName,
		'Checks the processing state of a model.',
		argsSpec,
		(argv) => run(argv.teamspace, argv.model, argv.limit, argv.notify));
};

module.exports = {
	run,
	genYargs,
};
