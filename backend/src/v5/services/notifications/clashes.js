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

const {
	insertClashAbortedNotifications,
	insertClashFailedNotifications,
	insertClashSucceededNotifications,
} = require('../../models/notifications');
const { clashRunStatus } = require('../../models/clashes.constants');
const { events } = require('../eventsManager/eventsManager.constants');
const { getClashRunById } = require('../../models/clashes.runs');
const { getJobsToUsers } = require('../../models/jobs');
const { getPlanById, getPlansByQuery } = require('../../models/clashes.plans');
const { getUsernamesToNotify } = require('./notificationsHelper');
const { subscribe } = require('../eventsManager/eventsManager');

const ClashesNotifications = {};

const clashRunStatusUpdated = async (teamspace, project, runId, status, results) => {
	const isFinalStatus = [clashRunStatus.COMPLETED, clashRunStatus.FAILED, clashRunStatus.ABORTED].includes(status);

	if (!isFinalStatus) return;

	const { plan: { _id: planId }, triggeredAt } = await getClashRunById(teamspace,
		project, runId, { plan: 1, triggeredAt: 1 });

	const { notify } = await getPlanById(teamspace, project, planId, { notify: 1 })
		.catch(() => ({}));

	if (notify?.length) {
		const jobList = await getJobsToUsers(teamspace);
		const recipients = getUsernamesToNotify(jobList, notify);

		const notificationData = { results, plan: planId, triggeredAt };

		if (status === clashRunStatus.COMPLETED) {
			await insertClashSucceededNotifications(teamspace, project, notificationData, recipients);
		} else if (status === clashRunStatus.FAILED) {
			await insertClashFailedNotifications(teamspace, project, notificationData, recipients);
		} else {
			await insertClashAbortedNotifications(teamspace, project, notificationData, recipients);
		}
	}
};

ClashesNotifications.subscribe = () => {
	subscribe(events.CLASH_RUN_STATUS_UPDATED, ({ teamspace, project, runId, status,
		results }) => clashRunStatusUpdated(teamspace, project, runId, status, results));
};

module.exports = ClashesNotifications;
