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

const { UUIDToString } = require('../../../utils/helper/uuids');
const { clashRunStatus } = require('../../../models/clashes.constants');
const { events } = require('../../eventsManager/eventsManager.constants');
const { getInfoFromCode } = require('../../../models/modelSettings.constants');
const { logger } = require('../../../utils/logger');
const { processClashResults } = require('../../../processors/teamspaces/projects/clashes');
const { subscribe } = require('../../eventsManager/eventsManager');
const { updateRunStatus } = require('../../../models/clashes.runs');

const clashRunStatusUpdate = async ({ teamspace, project, runId, status }) => {
	try {
		await updateRunStatus(teamspace, project, runId, status);
	} catch (err) {
		logger.logError(`Failed to update the status of clash run for ${teamspace} `
			+ `with id ${UUIDToString(runId)}: ${err.message}`);
		if (err.stack) {
			logger.logError(err.stack);
		}
	}
};

const clashRunCompleted = async ({ teamspace, project, runId, results, value }) => {
	try {
		const resInfo = getInfoFromCode(value);
		resInfo.retVal = value;

		if (resInfo.success) {
			await processClashResults(teamspace, project, runId, results);
		} else {
			await updateRunStatus(teamspace, project, runId, clashRunStatus.FAILED,
				{ code: resInfo.retVal, reason: resInfo.message });
		}
	} catch (err) {
		logger.logError(`Failed to process a complete clash run for ${teamspace} `
			+ `with id ${UUIDToString(runId)}: ${err.message}`);
		if (err.stack) {
			logger.logError(err.stack);
		}
	}
};

const ClashEventsListener = {};

ClashEventsListener.init = () => {
	subscribe(events.CLASH_RUN_UPDATE, clashRunStatusUpdate);
	subscribe(events.CLASH_RUN_COMPLETED, clashRunCompleted);
};

module.exports = ClashEventsListener;
