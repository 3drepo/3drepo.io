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

const { clashRunStatus, triggerOptions } = require('../../../models/clashes.constants');
const {
	createRun,
	processClashResults: processClashRunResults,
	setLastRevForSelections,
} = require('../../../processors/teamspaces/projects/clashes');
const { getInfoFromCode, modelTypes, processStatuses } = require('../../../models/modelSettings.constants');
const { UUIDToString } = require('../../../utils/helper/uuids');
const { events } = require('../../eventsManager/eventsManager.constants');
const { getFederationById } = require('../../../models/modelSettings');
const { getPlanById, getPlansByQuery } = require('../../../models/clashes.plans');
const { getTemplateById } = require('../../../models/tickets.templates');
const { logger } = require('../../../utils/logger');
const {
	processClashResults: processTicketClashResults,
} = require('../../../processors/teamspaces/projects/models/commons/tickets.clashes');
const { subscribe } = require('../../eventsManager/eventsManager');
const { updateRunStatus } = require('../../../models/clashes.runs');

const startClashRunsAfterNewRev = async ({ teamspace, project, model, user, modelType, data }) => {
	try {
		if (modelType === modelTypes.CONTAINER && data.status === processStatuses.OK) {
			const relatedPlans = await getPlansByQuery(teamspace, project, {
				trigger: triggerOptions.NEW_REVISION,
				$or: [
					{ 'selectionA.container': model },
					{ 'selectionB.container': model },
				],
			}, { project: 0 });

			await Promise.all(
				relatedPlans.map(async (plan) => {
					try {
						await setLastRevForSelections(teamspace, plan.selectionA, plan.selectionB);
						await createRun(teamspace, project, plan, user);
					} catch (err) {
						logger.logError(`Failed to start clash run for plan ${UUIDToString(plan._id)}: ${err?.message}`);
					}
				}),
			);
		}
	} catch (err) {
		logger.logError(`Failed to start clash runs after new revision for container ${UUIDToString(model)}: ${err.message}`);
		if (err.stack) {
			logger.logError(err.stack);
		}
	}
};

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
			await processClashRunResults(teamspace, project, runId, results);
		} else {
			await updateRunStatus(teamspace, project, runId, clashRunStatus.FAILED,
				{ error: { code: resInfo.retVal, reason: resInfo.message } });
		}
	} catch (err) {
		logger.logError(`Failed to process a complete clash run for ${teamspace} `
			+ `with id ${UUIDToString(runId)}: ${err.message}`);
		if (err.stack) {
			logger.logError(err.stack);
		}
	}
};

const clashRunProcessed = async ({ teamspace, project, runId, plan: planFromRun, results }) => {
	try {
		const { tickets } = await getPlanById(teamspace, project, planFromRun._id, { tickets: 1 }).catch(() => ({}));
		if (!tickets?.federation) return;

		const fed = await getFederationById(teamspace,
			tickets.federation, { _id: 1 }).catch(() => undefined);
		if (!fed) return;

		const template = await getTemplateById(teamspace, tickets.template).catch(() => undefined);
		if (!template) return;

		// Use the run's plan details, but keep current ticket settings from the latest plan data.
		const plan = { ...planFromRun, tickets };

		await processTicketClashResults(teamspace, project, fed._id, template, results,
			{ plan, runId });
	} catch (error) {
		logger.logError(`Error processing clash run ${UUIDToString(runId)} `
			+ `for project ${UUIDToString(project)} in teamspace ${teamspace}: ${error.message}`);
	}
};

const ClashEventsListener = {};

ClashEventsListener.init = () => {
	subscribe(events.CLASH_RUN_UPDATE, clashRunStatusUpdate);
	subscribe(events.CLASH_RUN_COMPLETED, clashRunCompleted);
	subscribe(events.MODEL_IMPORT_FINISHED, startClashRunsAfterNewRev);
	subscribe(events.CLASH_RUN_PROCESSED, clashRunProcessed);
};

module.exports = ClashEventsListener;
