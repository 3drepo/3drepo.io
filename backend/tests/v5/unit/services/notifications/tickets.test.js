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
const { basePropertyLabels, statuses } = require(`${src}/schemas/tickets/templates.constants`);

jest.mock('../../../../../src/v5/services/eventsManager/eventsManager');
const EventsManagerMock = require(`${src}/services/eventsManager/eventsManager`);
jest.mock('../../../../../src/v5/models/notifications');
const NotificationModels = require(`${src}/models/notifications`);

jest.mock('../../../../../src/v5/models/tickets');
const TicketsModel = require(`${src}/models/tickets`);

jest.mock('../../../../../src/v5/models/jobs');
const JobsModels = require(`${src}/models/jobs`);

jest.mock('../../../../../src/v5/models/tickets.templates');
const TicketTemplatesModel = require(`${src}/models/tickets.templates`);

jest.mock('../../../../../src/v5/processors/teamspaces/projects/models/commons/settings');
const SettingsProcessor = require(`${src}/processors/teamspaces/projects/models/commons/settings`);

const TicketNotifications = require(`${src}/services/notifications/tickets`);

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

			expect(NotificationModels.insertTicketAssignedNotifications).not.toHaveBeenCalled();
		});

		test(`should not generate notifications if the owner assigned themselves on ${eventToTrigger}`, async () => {
			const ticketData = multipleTickets ? times(nTickets, () => generateTicket(owner, [owner]))
				: generateTicket(owner, [owner]);

			JobsModels.getJobsToUsers.mockResolvedValueOnce([{ _id: job, users: [generateRandomString()] }]);
			SettingsProcessor.getUsersWithPermissions.mockResolvedValueOnce([job, owner]);
			await eventCallbacks[eventToTrigger](createEventData(ticketData));

			expect(JobsModels.getJobsToUsers).toHaveBeenCalledTimes(1);
			expect(JobsModels.getJobsToUsers).toHaveBeenCalledWith(teamspace);

			expect(SettingsProcessor.getUsersWithPermissions).toHaveBeenCalledTimes(1);
			expect(SettingsProcessor.getUsersWithPermissions).toHaveBeenCalledWith(teamspace, project, model, false);

			expect(NotificationModels.insertTicketAssignedNotifications).not.toHaveBeenCalled();
		});

		test(`should not generate notifications if the ticket is assigned to a job with no accessible users on ${eventToTrigger}`, async () => {
			const ticketData = multipleTickets ? times(nTickets, () => generateTicket(owner, [job]))
				: generateTicket(owner, [job]);

			JobsModels.getJobsToUsers.mockResolvedValueOnce([{ _id: job, users: [generateRandomString()] }]);
			SettingsProcessor.getUsersWithPermissions.mockResolvedValueOnce(times(10, () => generateRandomString()));

			await eventCallbacks[eventToTrigger](createEventData(ticketData));

			expect(JobsModels.getJobsToUsers).toHaveBeenCalledTimes(1);
			expect(JobsModels.getJobsToUsers).toHaveBeenCalledWith(teamspace);

			expect(SettingsProcessor.getUsersWithPermissions).toHaveBeenCalledTimes(1);
			expect(SettingsProcessor.getUsersWithPermissions).toHaveBeenCalledWith(teamspace, project, model, false);

			expect(NotificationModels.insertTicketAssignedNotifications).not.toHaveBeenCalled();
		});

		test(`!should generate notifications for users assigned to the ticket and has permissions on ${eventToTrigger}`, async () => {
			const jobs = [];
			const usersWithPermissions = [];
			const expectedNotifications = [];

			const ticketData = times(nTickets, () => {
				const assignedUsers = times(5, () => generateRandomString());
				const [assignedUser1, assignedUser2, noPermUser1, ...users] = assignedUsers;
				const assignedJob = generateRandomString();
				jobs.push({ _id: assignedJob, users: [noPermUser1, ...users] });
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

			expect(NotificationModels.insertTicketAssignedNotifications).toHaveBeenCalledTimes(1);

			expect(NotificationModels.insertTicketAssignedNotifications).toHaveBeenCalledWith(teamspace, project, model,
				expectedNotifications);
		});
	});
};

const generateTicketInfo = (owner, assignees, template = generateRandomString()) => ({
	type: template,
	properties: {
		[basePropertyLabels.ASSIGNEES]: assignees,
		[basePropertyLabels.OWNER]: owner,
	},
});

const testOnUpdatedTicket = () => {
	describe('On ticket updated', () => {
		const teamspace = generateRandomString();
		const project = generateRandomString();
		const model = generateRandomString();
		const job = generateRandomString();
		const ticket = { _id: generateRandomString() };
		const author = generateRandomString();

		const createEventData = (actionedBy = author, changes = generateRandomObject()) => ({
			teamspace, project, model, ticket, author: actionedBy, changes,
		});

		test(`should not generate notifications if there are no assignees and the owner changed the ticket on ${events.UPDATE_TICKET}`, async () => {
			const owner = generateRandomString();

			TicketsModel.getTicketById.mockResolvedValueOnce(generateTicketInfo(owner, []));
			JobsModels.getJobsToUsers.mockResolvedValueOnce([{ _id: job, users: [generateRandomString()] }]);
			SettingsProcessor.getUsersWithPermissions.mockResolvedValueOnce([owner]);

			await eventCallbacks[events.UPDATE_TICKET](createEventData(owner));

			expect(JobsModels.getJobsToUsers).toHaveBeenCalledTimes(1);
			expect(JobsModels.getJobsToUsers).toHaveBeenCalledWith(teamspace);

			expect(SettingsProcessor.getUsersWithPermissions).toHaveBeenCalledTimes(1);
			expect(SettingsProcessor.getUsersWithPermissions).toHaveBeenCalledWith(teamspace, project, model, false);

			expect(NotificationModels.insertTicketUpdatedNotifications).not.toHaveBeenCalled();
		});

		test(`should generate notifications for assignees and owners the ticket on ${events.UPDATE_TICKET}`, async () => {
			const owner = generateRandomString();
			const [assigned1, assignedNoPerm, assignedJobNoPerm, ...jobMembers] = times(
				10, () => generateRandomString());

			TicketsModel.getTicketById.mockResolvedValueOnce(generateTicketInfo(owner,
				[assigned1, assignedNoPerm, job]));
			JobsModels.getJobsToUsers.mockResolvedValueOnce([{ _id: job, users: [assignedJobNoPerm, ...jobMembers] }]);
			SettingsProcessor.getUsersWithPermissions.mockResolvedValueOnce([owner, assigned1, ...jobMembers]);

			const eventData = createEventData();
			await eventCallbacks[events.UPDATE_TICKET](eventData);

			expect(JobsModels.getJobsToUsers).toHaveBeenCalledTimes(1);
			expect(JobsModels.getJobsToUsers).toHaveBeenCalledWith(teamspace);

			expect(SettingsProcessor.getUsersWithPermissions).toHaveBeenCalledTimes(1);
			expect(SettingsProcessor.getUsersWithPermissions).toHaveBeenCalledWith(teamspace, project, model, false);

			const expectedNotifications = [{
				ticket: ticket._id,
				changes: eventData.changes,
				author,
				users: [owner, assigned1, ...jobMembers],
			}];

			expect(NotificationModels.insertTicketUpdatedNotifications).toHaveBeenCalledTimes(1);
			expect(NotificationModels.insertTicketUpdatedNotifications).toHaveBeenCalledWith(teamspace, project, model,
				expectedNotifications);
		});

		describe('When assignees have changed', () => {
			// new assignees should get assigned notification instead
			// No new assignees should not generate new assignmnet notifications
			// no old assignees should not generate additional notifications
			test('should generate ticket assigned notifications for new assignees and ticket update notifications for old assignees', async () => {
				const [removed1, removed2, ...oldAssignees] = times(
					10, () => generateRandomString());
				const newAssignees = times(3, () => generateRandomString());

				TicketsModel.getTicketById.mockResolvedValueOnce(generateTicketInfo(author,
					[...oldAssignees, ...newAssignees]));
				JobsModels.getJobsToUsers.mockResolvedValueOnce([]);
				SettingsProcessor.getUsersWithPermissions.mockResolvedValueOnce([author, ...oldAssignees,
					...newAssignees, removed1, removed2]);

				const changes = {
					properties: {
						[basePropertyLabels.ASSIGNEES]: {
							from: [removed1, removed2, ...oldAssignees],
							to: [...newAssignees, ...oldAssignees],
						},
						...generateRandomObject(),
					},
				};
				const eventData = createEventData(author, changes);
				await eventCallbacks[events.UPDATE_TICKET](eventData);

				expect(JobsModels.getJobsToUsers).toHaveBeenCalledTimes(1);
				expect(JobsModels.getJobsToUsers).toHaveBeenCalledWith(teamspace);

				expect(SettingsProcessor.getUsersWithPermissions).toHaveBeenCalledTimes(1);
				expect(SettingsProcessor.getUsersWithPermissions).toHaveBeenCalledWith(teamspace,
					project, model, false);

				const expectedUpdateNotifications = [{
					ticket: ticket._id,
					changes: eventData.changes,
					author,
					users: [removed1, removed2, ...oldAssignees],
				}];

				const expectedAssignedNotifications = [{
					ticket: ticket._id,
					assignedBy: author,
					users: newAssignees,
				}];

				expect(NotificationModels.insertTicketUpdatedNotifications).toHaveBeenCalledTimes(1);
				expect(NotificationModels.insertTicketUpdatedNotifications).toHaveBeenCalledWith(
					teamspace, project, model, expectedUpdateNotifications);

				expect(NotificationModels.insertTicketAssignedNotifications).toHaveBeenCalledTimes(1);
				expect(NotificationModels.insertTicketAssignedNotifications).toHaveBeenCalledWith(teamspace, project,
					model, expectedAssignedNotifications);
			});

			test('should function if all assignees were removed', async () => {
				const oldAssignees = times(
					10, () => generateRandomString());

				TicketsModel.getTicketById.mockResolvedValueOnce(generateTicketInfo(author,
					undefined));
				JobsModels.getJobsToUsers.mockResolvedValueOnce([]);
				SettingsProcessor.getUsersWithPermissions.mockResolvedValueOnce([author, ...oldAssignees]);

				const changes = {
					properties: {
						[basePropertyLabels.ASSIGNEES]: {
							from: oldAssignees,
							to: null,
						},
						...generateRandomObject(),
					},
				};
				const eventData = createEventData(author, changes);
				await eventCallbacks[events.UPDATE_TICKET](eventData);

				expect(JobsModels.getJobsToUsers).toHaveBeenCalledTimes(1);
				expect(JobsModels.getJobsToUsers).toHaveBeenCalledWith(teamspace);

				expect(SettingsProcessor.getUsersWithPermissions).toHaveBeenCalledTimes(1);
				expect(SettingsProcessor.getUsersWithPermissions).toHaveBeenCalledWith(teamspace,
					project, model, false);

				const expectedUpdateNotifications = [{
					ticket: ticket._id,
					changes: eventData.changes,
					author,
					users: oldAssignees,
				}];

				expect(NotificationModels.insertTicketUpdatedNotifications).toHaveBeenCalledTimes(1);
				expect(NotificationModels.insertTicketUpdatedNotifications).toHaveBeenCalledWith(
					teamspace, project, model, expectedUpdateNotifications);

				expect(NotificationModels.insertTicketAssignedNotifications).not.toHaveBeenCalled();
			});

			test('should not generate assigned notifications if new assignees is a subset of the old', async () => {
				const [removed1, removed2, ...oldAssignees] = times(
					10, () => generateRandomString());

				TicketsModel.getTicketById.mockResolvedValueOnce(generateTicketInfo(author, oldAssignees));
				JobsModels.getJobsToUsers.mockResolvedValueOnce([]);
				SettingsProcessor.getUsersWithPermissions.mockResolvedValueOnce([
					author, removed1, removed2, ...oldAssignees]);

				const changes = {
					properties: {
						[basePropertyLabels.ASSIGNEES]: {
							from: [removed1, removed2, ...oldAssignees],
							to: oldAssignees,
						},
						...generateRandomObject(),
					},
				};
				const eventData = createEventData(author, changes);
				await eventCallbacks[events.UPDATE_TICKET](eventData);

				expect(JobsModels.getJobsToUsers).toHaveBeenCalledTimes(1);
				expect(JobsModels.getJobsToUsers).toHaveBeenCalledWith(teamspace);

				expect(SettingsProcessor.getUsersWithPermissions).toHaveBeenCalledTimes(1);
				expect(SettingsProcessor.getUsersWithPermissions).toHaveBeenCalledWith(teamspace,
					project, model, false);

				const expectedUpdateNotifications = [{
					ticket: ticket._id,
					changes: eventData.changes,
					author,
					users: [removed1, removed2, ...oldAssignees],
				}];

				expect(NotificationModels.insertTicketUpdatedNotifications).toHaveBeenCalledTimes(1);
				expect(NotificationModels.insertTicketUpdatedNotifications).toHaveBeenCalledWith(
					teamspace, project, model, expectedUpdateNotifications);

				expect(NotificationModels.insertTicketAssignedNotifications).not.toHaveBeenCalled();
			});

			test('should function if the ticket did not have assignees', async () => {
				const newAssignees = times(3, () => generateRandomString());

				TicketsModel.getTicketById.mockResolvedValueOnce(generateTicketInfo(author, ...newAssignees));
				JobsModels.getJobsToUsers.mockResolvedValueOnce([]);
				SettingsProcessor.getUsersWithPermissions.mockResolvedValueOnce([author, ...newAssignees]);

				const changes = {
					properties: {
						[basePropertyLabels.ASSIGNEES]: {
							from: null,
							to: newAssignees,
						},
						...generateRandomObject(),
					},
				};
				const eventData = createEventData(author, changes);
				await eventCallbacks[events.UPDATE_TICKET](eventData);

				expect(JobsModels.getJobsToUsers).toHaveBeenCalledTimes(1);
				expect(JobsModels.getJobsToUsers).toHaveBeenCalledWith(teamspace);

				expect(SettingsProcessor.getUsersWithPermissions).toHaveBeenCalledTimes(1);
				expect(SettingsProcessor.getUsersWithPermissions).toHaveBeenCalledWith(teamspace,
					project, model, false);

				const expectedAssignedNotifications = [{
					ticket: ticket._id,
					assignedBy: author,
					users: newAssignees,
				}];

				expect(NotificationModels.insertTicketAssignedNotifications).toHaveBeenCalledTimes(1);
				expect(NotificationModels.insertTicketAssignedNotifications).toHaveBeenCalledWith(teamspace, project,
					model, expectedAssignedNotifications);
			});
		});

		describe('When status has changed', () => {
			const template = generateRandomString();
			const assignees = times(3, () => generateRandomString());

			test('Should generate ticket closed notifications if the ticket is resolved', async () => {
				TicketsModel.getTicketById.mockResolvedValueOnce(generateTicketInfo(author, assignees, template));
				JobsModels.getJobsToUsers.mockResolvedValueOnce([]);
				SettingsProcessor.getUsersWithPermissions.mockResolvedValueOnce([author, ...assignees]);

				TicketTemplatesModel.getTemplateById.mockResolvedValueOnce({});

				const newStatus = statuses.CLOSED;

				const changes = {
					properties: {
						[basePropertyLabels.STATUS]: {
							from: null,
							to: newStatus,
						},
						...generateRandomObject(),
					},
				};
				const eventData = createEventData(author, changes);
				await eventCallbacks[events.UPDATE_TICKET](eventData);

				expect(JobsModels.getJobsToUsers).toHaveBeenCalledTimes(1);
				expect(JobsModels.getJobsToUsers).toHaveBeenCalledWith(teamspace);

				expect(SettingsProcessor.getUsersWithPermissions).toHaveBeenCalledTimes(1);
				expect(SettingsProcessor.getUsersWithPermissions).toHaveBeenCalledWith(teamspace,
					project, model, false);

				const expectedClosedNotifications = [{
					ticket: ticket._id,
					status: newStatus,
					author,
					users: assignees,
				}];

				expect(NotificationModels.insertTicketClosedNotifications).toHaveBeenCalledTimes(1);
				expect(NotificationModels.insertTicketClosedNotifications).toHaveBeenCalledWith(
					teamspace, project, model, expectedClosedNotifications);

				expect(TicketTemplatesModel.getTemplateById).toHaveBeenCalledTimes(1);
				expect(TicketTemplatesModel.getTemplateById).toHaveBeenCalledWith(teamspace, template, { 'config.status': 1 });
			});

			test('Should generate update notifications if the ticket is not resolved', async () => {
				TicketsModel.getTicketById.mockResolvedValueOnce(generateTicketInfo(author, assignees, template));
				JobsModels.getJobsToUsers.mockResolvedValueOnce([]);
				SettingsProcessor.getUsersWithPermissions.mockResolvedValueOnce([author, ...assignees]);

				TicketTemplatesModel.getTemplateById.mockResolvedValueOnce({});

				const newStatus = statuses.OPEN;

				const changes = {
					properties: {
						[basePropertyLabels.STATUS]: {
							from: statuses.CLOSED,
							to: newStatus,
						},
						...generateRandomObject(),
					},
				};
				const eventData = createEventData(author, changes);
				await eventCallbacks[events.UPDATE_TICKET](eventData);

				expect(JobsModels.getJobsToUsers).toHaveBeenCalledTimes(1);
				expect(JobsModels.getJobsToUsers).toHaveBeenCalledWith(teamspace);

				expect(SettingsProcessor.getUsersWithPermissions).toHaveBeenCalledTimes(1);
				expect(SettingsProcessor.getUsersWithPermissions).toHaveBeenCalledWith(teamspace,
					project, model, false);

				const expectedNotifications = [{
					ticket: ticket._id,
					changes,
					author,
					users: assignees,
				}];

				expect(NotificationModels.insertTicketClosedNotifications).not.toHaveBeenCalled();

				expect(NotificationModels.insertTicketUpdatedNotifications).toHaveBeenCalledTimes(1);
				expect(NotificationModels.insertTicketUpdatedNotifications).toHaveBeenCalledWith(
					teamspace, project, model, expectedNotifications);

				expect(TicketTemplatesModel.getTemplateById).toHaveBeenCalledTimes(1);
				expect(TicketTemplatesModel.getTemplateById).toHaveBeenCalledWith(teamspace, template, { 'config.status': 1 });
			});

			test('Should generate update notifications if the ticket status is removed', async () => {
				TicketsModel.getTicketById.mockResolvedValueOnce(generateTicketInfo(author, assignees, template));
				JobsModels.getJobsToUsers.mockResolvedValueOnce([]);
				SettingsProcessor.getUsersWithPermissions.mockResolvedValueOnce([author, ...assignees]);

				TicketTemplatesModel.getTemplateById.mockResolvedValueOnce({});

				const changes = {
					properties: {
						[basePropertyLabels.STATUS]: {
							from: statuses.CLOSED,
							to: null,
						},
						...generateRandomObject(),
					},
				};
				const eventData = createEventData(author, changes);
				await eventCallbacks[events.UPDATE_TICKET](eventData);

				expect(JobsModels.getJobsToUsers).toHaveBeenCalledTimes(1);
				expect(JobsModels.getJobsToUsers).toHaveBeenCalledWith(teamspace);

				expect(SettingsProcessor.getUsersWithPermissions).toHaveBeenCalledTimes(1);
				expect(SettingsProcessor.getUsersWithPermissions).toHaveBeenCalledWith(teamspace,
					project, model, false);

				const expectedNotifications = [{
					ticket: ticket._id,
					changes,
					author,
					users: assignees,
				}];

				expect(NotificationModels.insertTicketClosedNotifications).not.toHaveBeenCalled();

				expect(NotificationModels.insertTicketUpdatedNotifications).toHaveBeenCalledTimes(1);
				expect(NotificationModels.insertTicketUpdatedNotifications).toHaveBeenCalledWith(
					teamspace, project, model, expectedNotifications);

				expect(TicketTemplatesModel.getTemplateById).not.toHaveBeenCalled();
			});
		});
	});
};

const testOnNewTicketComment = () => {
	describe('On new ticket comment', () => {
		const teamspace = generateRandomString();
		const project = generateRandomString();
		const model = generateRandomString();
		const job = generateRandomString();
		const ticket = generateRandomString();
		const author = generateRandomString();

		const createEventData = (actionedBy, comment) => ({
			teamspace, project, model, ticket, author: actionedBy, data: comment,
		});

		test('Should create a ticket update notification for everyone but the author', async () => {
			const template = generateRandomString();
			const [assigneeNoPerm, commenter, ...assignees] = times(5, () => generateRandomString());
			const [jobMemNoPerm, ...jobMembers] = times(3, () => generateRandomString());

			TicketsModel.getTicketById.mockResolvedValueOnce(generateTicketInfo(author,
				[job, assigneeNoPerm, commenter, ...assignees], template));
			JobsModels.getJobsToUsers.mockResolvedValueOnce([{ _id: job, users: [jobMemNoPerm, ...jobMembers] }]);
			SettingsProcessor.getUsersWithPermissions.mockResolvedValueOnce([
				author, commenter, ...jobMembers, ...assignees]);

			TicketTemplatesModel.getTemplateById.mockResolvedValueOnce({});

			const comment = {
				_id: generateRandomString(),
				message: generateRandomString(),
				ticket,
				author: commenter,
			};

			const eventData = createEventData(author, comment);
			await eventCallbacks[events.NEW_COMMENT](eventData);

			expect(JobsModels.getJobsToUsers).toHaveBeenCalledTimes(1);
			expect(JobsModels.getJobsToUsers).toHaveBeenCalledWith(teamspace);

			expect(SettingsProcessor.getUsersWithPermissions).toHaveBeenCalledTimes(1);
			expect(SettingsProcessor.getUsersWithPermissions).toHaveBeenCalledWith(teamspace,
				project, model, false);

			const expectedNotifications = [{
				ticket,
				comment: { _id: comment._id, message: comment.message },
				author: commenter,
				users: [author, ...jobMembers, ...assignees],
			}];

			expect(NotificationModels.insertTicketUpdatedNotifications).toHaveBeenCalledTimes(1);
			expect(NotificationModels.insertTicketUpdatedNotifications).toHaveBeenCalledWith(
				teamspace, project, model, expectedNotifications);
		});
	});
};

describe(determineTestGroup(__filename), () => {
	beforeAll(async () => {
		EventsManagerMock.subscribe.mockImplementation((event, callback) => {
			eventCallbacks[event] = callback;
		});
		await TicketNotifications.subscribe();
	});

	testOnNewTickets();
	testOnNewTickets(true);
	testOnUpdatedTicket();
	testOnNewTicketComment();
});
