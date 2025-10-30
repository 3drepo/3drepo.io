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

const { deleteDrawingCalibrations } = require(`${v5Path}/models/calibrations`);
const { modelTypes } = require(`${v5Path}/models/modelSettings.constants`);
const { deleteModelRevisions } = require(`${v5Path}/models/revisions`);
const { removeFilesWithMeta } = require(`${v5Path}/services/filesManager`);
const { aggregate } = require(`${v5Path}/handler/db`);
const { getProjectById } = require(`${v5Path}/models/projectSettings`);
const { DRAWINGS_HISTORY_COL } = require(`${v5Path}/models/revisions.constants`);
const { logger } = require(`${v5Path}/utils/logger`);

const processDrawingRecords = async (teamspace, project, drawing) => {
	const projectExists = await getProjectById(teamspace, project, { _id: 1 }).catch(() => false);

	if (!projectExists) {
		await removeFilesWithMeta(teamspace, DRAWINGS_HISTORY_COL, { model: drawing });

		await Promise.all([
			deleteModelRevisions(teamspace, project, drawing, modelTypes.DRAWING),
			deleteDrawingCalibrations(teamspace, project, drawing),
		]);
	}
};

const processTeamspace = async (teamspace) => {
	logger.logInfo(`Removing orphaned drawing records for teamspace: ${teamspace}`);
	const drawingRecords = (await aggregate(teamspace, DRAWINGS_HISTORY_COL, [
		{ $group: { _id: { model: '$model', project: '$project' } } },
		{ $project: { _id: 0, model: '$_id.model', project: '$_id.project' } },
	]));

	await Promise.all(drawingRecords.map(({ model, project }) => processDrawingRecords(teamspace, project, model)));
};

const run = async () => {
	const teamspaces = await getTeamspaceList();
	for (const ts of teamspaces) {
		// eslint-disable-next-line no-await-in-loop
		await processTeamspace(ts);
	}
};

module.exports = run;
