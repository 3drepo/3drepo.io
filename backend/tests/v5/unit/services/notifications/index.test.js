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

const { times } = require('lodash');
const { src } = require('../../../helper/path');
const { determineTestGroup, generateRandomString } = require('../../../helper/services');

const { events } = require(`${src}/services/eventsManager/eventsManager.constants`);
const { basePropertyLabels } = require(`${src}/schemas/tickets/templates.constants`);

jest.mock('../../../../../src/v5/services/eventsManager/eventsManager');
const EventsManagerMock = require(`${src}/services/eventsManager/eventsManager`);
jest.mock('../../../../../src/v5/models/notifications');
const NotificationModels = require(`${src}/models/notifications`);

jest.mock('../../../../../src/v5/models/jobs');
const JobsModels = require(`${src}/models/jobs`);

jest.mock('../../../../../src/v5/processors/teamspaces/projects/models/commons/settings');
const SettingsProcessor = require(`${src}/processors/teamspaces/projects/models/commons/settings`);

const NotificationsManager = require(`${src}/services/notifications`);

const eventCallbacks = {};

const generateTicket = (owner, assignees) => ({
	_id: generateRandomString(),
	properties: {
		[basePropertyLabels.ASSIGNEES]: assignees,
		[basePropertyLabels.OWNER]: owner,
	},
});

const testOnNewTickets = () => {
	describe('On new tickets', () => {
		const teamspace = generateRandomString();
		const project = generateRandomString();
		const model = generateRandomString();
		const job = generateRandomString();
		const owner = generateRandomString();

		test(`should not generate notifications if there are no assignees on ${events.NEW_TICKET}`, async () => {
			await eventCallbacks[events.NEW_TICKET]({ teamspace, project, model, ticket: {} });

			expect(JobsModels.getJobsToUsers).not.toHaveBeenCalled();
			expect(SettingsProcessor.getUsersWithPermissions).not.toHaveBeenCalled();

			expect(NotificationModels.addTicketAssignedNotifications).not.toHaveBeenCalled();
		});

		test(`should not generate notifications if the ticket is assigned to a job with no accessible users on ${events.NEW_TICKET}`, async () => {
			JobsModels.getJobsToUsers.mockResolvedValue({ [job]: [generateRandomString()] });
			SettingsProcessor.getUsersWithPermissions.mockResolvedValue(times(10, () => generateRandomString()));

			await eventCallbacks[events.NEW_TICKET]({ teamspace,
				project,
				model,
				ticket: generateTicket(owner, [job]) });

			expect(JobsModels.getJobsToUsers).toHaveBeenCalledTimes(1);
			expect(JobsModels.getJobsToUsers).toHaveBeenCalledWith(teamspace);

			expect(SettingsProcessor.getUsersWithPermissions).toHaveBeenCalledTimes(1);
			expect(SettingsProcessor.getUsersWithPermissions).toHaveBeenCalledWith(teamspace, project, model, false);

			expect(NotificationModels.addTicketAssignedNotifications).not.toHaveBeenCalled();
		});

		test(`should generate notifications for users assigned to the ticket and has permissions on ${events.NEW_TICKET}`, async () => {
			const assignedUsers = times(5, () => generateRandomString());
			const [assignedUser1, assignedUser2, noPermUser1, ...users] = assignedUsers;
			JobsModels.getJobsToUsers.mockResolvedValue({ [job]: [noPermUser1, ...users] });
			SettingsProcessor.getUsersWithPermissions.mockResolvedValue([assignedUser1, ...users]);

			const ticket = generateTicket(owner, [job, assignedUser1, assignedUser2]);

			await eventCallbacks[events.NEW_TICKET]({ teamspace, project, model, ticket });

			expect(JobsModels.getJobsToUsers).toHaveBeenCalledTimes(1);
			expect(JobsModels.getJobsToUsers).toHaveBeenCalledWith(teamspace);

			expect(SettingsProcessor.getUsersWithPermissions).toHaveBeenCalledTimes(1);
			expect(SettingsProcessor.getUsersWithPermissions).toHaveBeenCalledWith(teamspace, project, model, false);

			expect(NotificationModels.addTicketAssignedNotifications).toHaveBeenCalledTimes(1);

			const expectedNotifications = [{
				ticket: ticket._id,
				assignedBy: owner,
				users: [...users, assignedUser1],
			}];

			expect(NotificationModels.addTicketAssignedNotifications).toHaveBeenCalledWith(teamspace, project, model,
				expectedNotifications);
		});
	});
};

describe(determineTestGroup(__filename), () => {
	beforeAll(async () => {
		EventsManagerMock.subscribe.mockImplementation((event, callback) => {
			eventCallbacks[event] = callback;
		});
		await NotificationsManager.init();
	});

	testOnNewTickets();
});
