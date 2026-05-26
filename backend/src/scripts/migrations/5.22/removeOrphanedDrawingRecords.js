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

const { v5Path } = require('../../../interop');
const { getTeamspaceList } = require('../../utils');

const { removeFilesWithMeta } = require(`${v5Path}/services/filesManager`);
const { find, deleteMany } = require(`${v5Path}/handler/db`);
const { DRAWINGS_HISTORY_COL } = require(`${v5Path}/models/revisions.constants`);
const { CALIBRATIONS_COL } = require(`${v5Path}/models/calibrations.constants`);
const { logger } = require(`${v5Path}/utils/logger`);

const processTeamspace = async (teamspace) => {
	logger.logInfo(`Removing orphaned drawing records for teamspace: ${teamspace}`);

	const drawings = await find(teamspace, 'settings', { modelType: 'drawing' }, { _id: 1 });
	const drawingIds = drawings.map(({ _id }) => _id);

	await removeFilesWithMeta(teamspace, DRAWINGS_HISTORY_COL, { model: { $nin: drawingIds } });
	await Promise.all([
		deleteMany(teamspace, DRAWINGS_HISTORY_COL, { model: { $nin: drawingIds } }),
		deleteMany(teamspace, CALIBRATIONS_COL, { drawing: { $nin: drawingIds } }),
	]);
};

const run = async () => {
	const teamspaces = await getTeamspaceList();
	for (const ts of teamspaces) {
		// eslint-disable-next-line no-await-in-loop
		await processTeamspace(ts);
	}
};

module.exports = run;
