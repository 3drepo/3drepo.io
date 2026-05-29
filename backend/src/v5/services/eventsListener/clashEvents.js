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

const { events } = require('../eventsManager/eventsManager.constants');
const { getFederationById } = require('../../models/modelSettings');
const { getPlanById } = require('../../models/clashes.plans');
const { getTemplateById } = require('../../models/tickets.templates');
const { logger } = require('../../utils/logger');
const { processClashResults } = require('../../processors/teamspaces/projects/models/commons/tickets.clashes');
const { subscribe } = require('../eventsManager/eventsManager');

const processClashRun = async ({ teamspace, project, runId, planId, results }) => {
	try {
		const plan = await getPlanById(teamspace, project, planId).catch(() => undefined);
		if (!plan || !plan?.tickets?.federation) return;
		const fed = await getFederationById(teamspace,
			plan?.tickets?.federation, { _id: 1 }).catch(() => undefined);
		if (!fed) return;
		const template = await getTemplateById(teamspace, plan.tickets.template).catch(() => undefined);
		if (!template) return;

		await processClashResults(teamspace, project, fed._id, template, results, { plan, runId });
	} catch (error) {
		logger.logError(`Error processing clash run ${runId} for project ${project} in teamspace ${teamspace}: ${error.message}`);
	}
};

const ClashEventsListener = {};

ClashEventsListener.init = () => {
	subscribe(events.CLASH_RUN_PROCESSED, processClashRun);
};

module.exports = ClashEventsListener;
