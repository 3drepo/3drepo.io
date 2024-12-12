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
const { determineTestGroup, generateRandomString, generateRandomObject } = require('../../../helper/services');

const { events } = require(`${src}/services/eventsManager/eventsManager.constants`);
const { basePropertyLabels } = require(`${src}/schemas/tickets/templates.constants`);

jest.mock('../../../../../src/v5/services/eventsManager/eventsManager');
const EventsManagerMock = require(`${src}/services/eventsManager/eventsManager`);
jest.mock('../../../../../src/v5/models/notifications');
const NotificationModels = require(`${src}/models/notifications`);

jest.mock('../../../../../src/v5/models/tickets');
const TicketsModel = require(`${src}/models/tickets`);

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

const testOnNewTickets = (multipleTickets = false) => {
	describe(`On new ticket ${multipleTickets ? 'import' : ''}`, () => {
		const teamspace = generateRandomString();
		const project = generateRandomString();
		const model = generateRandomString();
		const job = generateRandomString();
		const owner = generateRandomString();
		const nTickets = multipleTickets ? 10 : 1;

		const eventToTrigger = multipleTickets ? events.TICKETS_IMPORTED : events.NEW_TICKET;

		const createEventData = (ticketData) => {
			const res = { teamspace, project, model };
			if (multipleTickets) {
				res.tickets = ticketData;
			} else {
				res.ticket = ticketData;
			}

			return res;
		};

		test(`should not generate notifications if there are no assignees on ${eventToTrigger}`, async () => {
			const ticketData = multipleTickets ? times(nTickets, () => {}) : {};
			await eventCallbacks[eventToTrigger](createEventData(ticketData));

			expect(JobsModels.getJobsToUsers).not.toHaveBeenCalled();
			expect(SettingsProcessor.getUsersWithPermissions).not.toHaveBeenCalled();

			expect(NotificationModels.addTicketAssignedNotifications).not.toHaveBeenCalled();
		});

		test(`should not generate notifications if the owner assigned themselves on ${eventToTrigger}`, async () => {
			const ticketData = multipleTickets ? times(nTickets, () => generateTicket(owner, [owner]))
				: generateTicket(owner, [owner]);
			await eventCallbacks[eventToTrigger](createEventData(ticketData));

			expect(JobsModels.getJobsToUsers).not.toHaveBeenCalled();
			expect(SettingsProcessor.getUsersWithPermissions).not.toHaveBeenCalled();

			expect(NotificationModels.addTicketAssignedNotifications).not.toHaveBeenCalled();
		});

		test(`should not generate notifications if the ticket is assigned to a job with no accessible users on ${eventToTrigger}`, async () => {
			const ticketData = multipleTickets ? times(nTickets, () => generateTicket(owner, [job]))
				: generateTicket(owner, [job]);

			JobsModels.getJobsToUsers.mockResolvedValueOnce({ [job]: [generateRandomString()] });
			SettingsProcessor.getUsersWithPermissions.mockResolvedValueOnce(times(10, () => generateRandomString()));

			await eventCallbacks[eventToTrigger](createEventData(ticketData));

			expect(JobsModels.getJobsToUsers).toHaveBeenCalledTimes(1);
			expect(JobsModels.getJobsToUsers).toHaveBeenCalledWith(teamspace);

			expect(SettingsProcessor.getUsersWithPermissions).toHaveBeenCalledTimes(1);
			expect(SettingsProcessor.getUsersWithPermissions).toHaveBeenCalledWith(teamspace, project, model, false);

			expect(NotificationModels.addTicketAssignedNotifications).not.toHaveBeenCalled();
		});

		test(`should generate notifications for users assigned to the ticket and has permissions on ${eventToTrigger}`, async () => {
			const jobs = {};
			const usersWithPermissions = [];
			const expectedNotifications = [];

			const ticketData = times(nTickets, () => {
				const assignedUsers = times(5, () => generateRandomString());
				const [assignedUser1, assignedUser2, noPermUser1, ...users] = assignedUsers;
				const assignedJob = generateRandomString();
				jobs[assignedJob] = [noPermUser1, ...users];
				const ticketOwner = generateRandomString();
				usersWithPermissions.push(assignedUser1, ...users);

				const ticket = generateTicket(ticketOwner, [assignedJob, assignedUser1, assignedUser2]);

				expectedNotifications.push({
					ticket: ticket._id,
					assignedBy: ticketOwner,
					users: [...users, assignedUser1],
				});

				return ticket;
			});

			JobsModels.getJobsToUsers.mockResolvedValueOnce(jobs);
			SettingsProcessor.getUsersWithPermissions.mockResolvedValueOnce(usersWithPermissions);

			await eventCallbacks[eventToTrigger](createEventData(multipleTickets ? ticketData : ticketData[0]));

			expect(JobsModels.getJobsToUsers).toHaveBeenCalledTimes(1);
			expect(JobsModels.getJobsToUsers).toHaveBeenCalledWith(teamspace);

			expect(SettingsProcessor.getUsersWithPermissions).toHaveBeenCalledTimes(1);
			expect(SettingsProcessor.getUsersWithPermissions).toHaveBeenCalledWith(teamspace, project, model, false);

			expect(NotificationModels.addTicketAssignedNotifications).toHaveBeenCalledTimes(1);

			expect(NotificationModels.addTicketAssignedNotifications).toHaveBeenCalledWith(teamspace, project, model,
				expectedNotifications);
		});
	});
};

const testOnUpdatedTicket = () => {
	describe('On ticket updated', () => {
		const teamspace = generateRandomString();
		const project = generateRandomString();
		const model = generateRandomString();
		const job = generateRandomString();
		const ticket = generateRandomString();
		const author = generateRandomString();

		const createEventData = (actionedBy = author, changes = generateRandomObject()) => ({
			teamspace, project, model, ticket, author: actionedBy, changes,
		});

		const generateTicketInfo = (owner, assignees) => ({
			properties: {
				[basePropertyLabels.ASSIGNEES]: assignees,
				[basePropertyLabels.OWNER]: owner,
			},
		});

		test(`should not generate notifications if there are no assignees and the owner changed the ticket on ${events.UPDATE_TICKET}`, async () => {
			const owner = generateRandomString();

			TicketsModel.getTicketById.mockResolvedValueOnce(generateTicketInfo(owner, [owner]));
			JobsModels.getJobsToUsers.mockResolvedValueOnce({ [job]: [generateRandomString()] });
			SettingsProcessor.getUsersWithPermissions.mockResolvedValueOnce([owner]);

			await eventCallbacks[events.UPDATE_TICKET](createEventData(owner));

			expect(JobsModels.getJobsToUsers).toHaveBeenCalledTimes(1);
			expect(JobsModels.getJobsToUsers).toHaveBeenCalledWith(teamspace);

			expect(SettingsProcessor.getUsersWithPermissions).toHaveBeenCalledTimes(1);
			expect(SettingsProcessor.getUsersWithPermissions).toHaveBeenCalledWith(teamspace, project, model, false);

			expect(NotificationModels.updateTicketNotifications).not.toHaveBeenCalled();
		});

		test(`should generate notifications for assignees and owners the ticket on ${events.UPDATE_TICKET}`, async () => {
			const owner = generateRandomString();
			const [assigned1, assignedNoPerm, assignedJobNoPerm, ...jobMembers] = times(
				10, () => generateRandomString());

			TicketsModel.getTicketById.mockResolvedValueOnce(generateTicketInfo(owner,
				[assigned1, assignedNoPerm, job]));
			JobsModels.getJobsToUsers.mockResolvedValueOnce({ [job]: [assignedJobNoPerm, ...jobMembers] });
			SettingsProcessor.getUsersWithPermissions.mockResolvedValueOnce([owner, assigned1, ...jobMembers]);

			const eventData = createEventData();
			await eventCallbacks[events.UPDATE_TICKET](eventData);

			expect(JobsModels.getJobsToUsers).toHaveBeenCalledTimes(1);
			expect(JobsModels.getJobsToUsers).toHaveBeenCalledWith(teamspace);

			expect(SettingsProcessor.getUsersWithPermissions).toHaveBeenCalledTimes(1);
			expect(SettingsProcessor.getUsersWithPermissions).toHaveBeenCalledWith(teamspace, project, model, false);

			const expectedNotifications = [{
				ticket,
				changes: eventData.changes,
				author,
				users: [owner, assigned1, ...jobMembers],
			}];

			expect(NotificationModels.updateTicketNotifications).toHaveBeenCalledTimes(1);
			expect(NotificationModels.updateTicketNotifications).toHaveBeenCalledWith(teamspace, project, model,
				expectedNotifications);
		});

		/*
		test(`should not generate notifications if the owner assigned themselves on ${events.UPDATE_TICKET}`, async () => {
			const ticketData = multipleTickets ? times(nTickets, () => generateTicket(owner, [owner]))
				: generateTicket(owner, [owner]);
			await eventCallbacks[events.UPDATE_TICKET](createEventData(ticketData));

			expect(JobsModels.getJobsToUsers).not.toHaveBeenCalled();
			expect(SettingsProcessor.getUsersWithPermissions).not.toHaveBeenCalled();

			expect(NotificationModels.addTicketAssignedNotifications).not.toHaveBeenCalled();
		});

		test(`should not generate notifications if the ticket is assigned to a job with no accessible users on ${events.UPDATE_TICKET}`, async () => {
			const ticketData = multipleTickets ? times(nTickets, () => generateTicket(owner, [job]))
				: generateTicket(owner, [job]);

			JobsModels.getJobsToUsers.mockResolvedValueOnce({ [job]: [generateRandomString()] });
			SettingsProcessor.getUsersWithPermissions.mockResolvedValueOnce(times(10, () => generateRandomString()));

			await eventCallbacks[events.UPDATE_TICKET](createEventData(ticketData));

			expect(JobsModels.getJobsToUsers).toHaveBeenCalledTimes(1);
			expect(JobsModels.getJobsToUsers).toHaveBeenCalledWith(teamspace);

			expect(SettingsProcessor.getUsersWithPermissions).toHaveBeenCalledTimes(1);
			expect(SettingsProcessor.getUsersWithPermissions).toHaveBeenCalledWith(teamspace, project, model, false);

			expect(NotificationModels.addTicketAssignedNotifications).not.toHaveBeenCalled();
		});

		test(`should generate notifications for users assigned to the ticket and has permissions on ${events.UPDATE_TICKET}`, async () => {
			const jobs = {};
			const usersWithPermissions = [];
			const expectedNotifications = [];

			const ticketData = times(nTickets, () => {
				const assignedUsers = times(5, () => generateRandomString());
				const [assignedUser1, assignedUser2, noPermUser1, ...users] = assignedUsers;
				const assignedJob = generateRandomString();
				jobs[assignedJob] = [noPermUser1, ...users];
				const ticketOwner = generateRandomString();
				usersWithPermissions.push(assignedUser1, ...users);

				const ticket = generateTicket(ticketOwner, [assignedJob, assignedUser1, assignedUser2]);

				expectedNotifications.push({
					ticket: ticket._id,
					assignedBy: ticketOwner,
					users: [...users, assignedUser1],
				});

				return ticket;
			});

			JobsModels.getJobsToUsers.mockResolvedValueOnce(jobs);
			SettingsProcessor.getUsersWithPermissions.mockResolvedValueOnce(usersWithPermissions);

			await eventCallbacks[events.UPDATE_TICKET](createEventData(multipleTickets ? ticketData : ticketData[0]));

			expect(JobsModels.getJobsToUsers).toHaveBeenCalledTimes(1);
			expect(JobsModels.getJobsToUsers).toHaveBeenCalledWith(teamspace);

			expect(SettingsProcessor.getUsersWithPermissions).toHaveBeenCalledTimes(1);
			expect(SettingsProcessor.getUsersWithPermissions).toHaveBeenCalledWith(teamspace, project, model, false);

			expect(NotificationModels.addTicketAssignedNotifications).toHaveBeenCalledTimes(1);

			expect(NotificationModels.addTicketAssignedNotifications).toHaveBeenCalledWith(teamspace, project, model,
				expectedNotifications);
		}); */
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
	testOnNewTickets(true);
	testOnUpdatedTicket();
});
