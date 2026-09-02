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

const { determineTestGroup } = require('../../../helper/utils');
const { times } = require('lodash');

const { src } = require('../../../helper/path');

const { clashRunStatus } = require(`${src}/models/clashes.constants`);

const { generateRandomString } = require('../../../helper/services');

const { events } = require(`${src}/services/eventsManager/eventsManager.constants`);

jest.mock('../../../../../src/v5/services/eventsManager/eventsManager');
const EventsManagerMock = require(`${src}/services/eventsManager/eventsManager`);

jest.mock('../../../../../src/v5/models/clashes.runs');
const RunsModel = require(`${src}/models/clashes.runs`);

jest.mock('../../../../../src/v5/models/clashes.plans');
const PlansModel = require(`${src}/models/clashes.plans`);

jest.mock('../../../../../src/v5/models/jobs');
const JobsModel = require(`${src}/models/jobs`);

jest.mock('../../../../../src/v5/models/notifications');
const NotificationsModel = require(`${src}/models/notifications`);

jest.mock('../../../../../src/v5/services/notifications/notificationsHelper');
const NotificationsHelper = require(`${src}/services/notifications/notificationsHelper`);

const ClashesNotifications = require(`${src}/services/notifications/clashes`);

const eventCallbacks = {};

const testOnClashRunStatusUpdated = () => {
	describe('On clash run status updated', () => {
		const teamspace = generateRandomString();
		const project = generateRandomString();
		const runId = generateRandomString();
		const status = clashRunStatus.COMPLETED;
		const results = generateRandomString();

		test('Should not insert a notification if status is not final', async () => {
			const eventData = { teamspace, project, runId, status: generateRandomString(), results };
			await eventCallbacks[events.CLASH_RUN_STATUS_UPDATED](eventData);

			expect(RunsModel.getClashRunById).not.toHaveBeenCalled();
			expect(PlansModel.getPlanById).not.toHaveBeenCalled();
			expect(JobsModel.getJobsToUsers).not.toHaveBeenCalled();
			expect(NotificationsHelper.getUsernamesToNotify).not.toHaveBeenCalled();
			expect(NotificationsModel.insertClashSucceededNotifications).not.toHaveBeenCalled();
			expect(NotificationsModel.insertClashFailedNotifications).not.toHaveBeenCalled();
			expect(NotificationsModel.insertClashAbortedNotifications).not.toHaveBeenCalled();
		});

		test('Should not insert a notification if plan.notify is null', async () => {
			const planId = generateRandomString();
			RunsModel.getClashRunById.mockResolvedValueOnce({ plan: { _id: planId } });
			PlansModel.getPlanById.mockResolvedValueOnce({ });

			const eventData = { teamspace, project, runId, status, results };
			await eventCallbacks[events.CLASH_RUN_STATUS_UPDATED](eventData);

			expect(RunsModel.getClashRunById).toHaveBeenCalledTimes(1);
			expect(RunsModel.getClashRunById).toHaveBeenCalledWith(teamspace,
				project, runId, { plan: 1, triggeredAt: 1 });
			expect(PlansModel.getPlanById).toHaveBeenCalledTimes(1);
			expect(PlansModel.getPlanById).toHaveBeenCalledWith(teamspace, project, planId, { notify: 1 });

			expect(JobsModel.getJobsToUsers).not.toHaveBeenCalled();
			expect(NotificationsHelper.getUsernamesToNotify).not.toHaveBeenCalled();
			expect(NotificationsModel.insertClashSucceededNotifications).not.toHaveBeenCalled();
			expect(NotificationsModel.insertClashFailedNotifications).not.toHaveBeenCalled();
			expect(NotificationsModel.insertClashAbortedNotifications).not.toHaveBeenCalled();
		});

		test('Should not insert a notification if plan.notify is empty', async () => {
			const planId = generateRandomString();
			RunsModel.getClashRunById.mockResolvedValueOnce({ plan: { _id: planId } });
			PlansModel.getPlanById.mockResolvedValueOnce({ notify: [] });

			const eventData = { teamspace, project, runId, status, results };
			await eventCallbacks[events.CLASH_RUN_STATUS_UPDATED](eventData);

			expect(RunsModel.getClashRunById).toHaveBeenCalledTimes(1);
			expect(RunsModel.getClashRunById).toHaveBeenCalledWith(teamspace,
				project, runId, { plan: 1, triggeredAt: 1 });
			expect(PlansModel.getPlanById).toHaveBeenCalledTimes(1);
			expect(PlansModel.getPlanById).toHaveBeenCalledWith(teamspace, project, planId, { notify: 1 });

			expect(JobsModel.getJobsToUsers).not.toHaveBeenCalled();
			expect(NotificationsHelper.getUsernamesToNotify).not.toHaveBeenCalled();
			expect(NotificationsModel.insertClashSucceededNotifications).not.toHaveBeenCalled();
			expect(NotificationsModel.insertClashFailedNotifications).not.toHaveBeenCalled();
			expect(NotificationsModel.insertClashAbortedNotifications).not.toHaveBeenCalled();
		});

		describe.each([
			['Should call insertClashSucceededNotifications if status is succeeded', clashRunStatus.COMPLETED, NotificationsModel.insertClashSucceededNotifications],
			['Should call insertClashFailedNotifications if status is failed', clashRunStatus.FAILED, NotificationsModel.insertClashFailedNotifications],
			['Should call insertClashAbortedNotifications if status is aborted', clashRunStatus.ABORTED, NotificationsModel.insertClashAbortedNotifications],
		])('%s', (description, runStatus, insertFn) => {
			test(description, async () => {
				const notify = times(5, () => generateRandomString());
				const planId = generateRandomString();
				const triggeredAt = new Date();
				const recipients = times(5, () => generateRandomString());
				const notificationData = { results, plan: planId, triggeredAt };

				RunsModel.getClashRunById.mockResolvedValueOnce({ plan: { _id: planId }, triggeredAt });
				PlansModel.getPlanById.mockResolvedValueOnce({ notify });
				JobsModel.getJobsToUsers.mockResolvedValueOnce([generateRandomString()]);
				NotificationsHelper.getUsernamesToNotify.mockReturnValueOnce(recipients);

				const eventData = { teamspace, project, runId, status: runStatus, results };
				await eventCallbacks[events.CLASH_RUN_STATUS_UPDATED](eventData);

				expect(RunsModel.getClashRunById).toHaveBeenCalledTimes(1);
				expect(RunsModel.getClashRunById).toHaveBeenCalledWith(teamspace,
					project, runId, { plan: 1, triggeredAt: 1 });
				expect(PlansModel.getPlanById).toHaveBeenCalledTimes(1);
				expect(PlansModel.getPlanById).toHaveBeenCalledWith(teamspace, project, planId, { notify: 1 });

				expect(JobsModel.getJobsToUsers).toHaveBeenCalledTimes(1);
				expect(NotificationsHelper.getUsernamesToNotify).toHaveBeenCalledTimes(1);

				expect(insertFn).toHaveBeenCalledTimes(1);
				expect(insertFn).toHaveBeenCalledWith(teamspace, project, notificationData, recipients);
			});
		});
	});
};

describe(determineTestGroup(__filename), () => {
	beforeAll(async () => {
		EventsManagerMock.subscribe.mockImplementation((event, callback) => {
			eventCallbacks[event] = callback;
		});
		await ClashesNotifications.subscribe();
	});

	testOnClashRunStatusUpdated();
});
