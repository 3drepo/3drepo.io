/**
 *  Copyright (C) 2021 3D Repo Ltd
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

const { UUIDToString } = require('../../../../../src/v5/utils/helper/uuids');
const { templates } = require('../../../../../src/v5/utils/responseCodes');
const { src } = require('../../../helper/path');
const { generateRandomString, generateUUID, generateRandomDate } = require('../../../helper/services');

jest.mock('../../../../../src/v5/models/modelSettings');
const ModelSettings = require(`${src}/models/modelSettings`);

jest.mock('../../../../../src/v5/models/projectSettings');
const ProjectSettings = require(`${src}/models/projectSettings`);

jest.mock('../../../../../src/v5/models/revisions');
const Revisions = require(`${src}/models/revisions`);

jest.mock('../../../../../src/v5/models/loginRecords');
const LoginRecords = require(`${src}/models/loginRecords`);

jest.mock('../../../../../src/v5/models/tickets.logs');
const TicketLogs = require(`${src}/models/tickets.logs`);

jest.mock('../../../../../src/v5/models/tickets.templates');
const TicketTemplates = require(`${src}/models/tickets.templates`);

jest.mock('../../../../../src/v5/schemas/tickets');
const TicketSchemas = require(`${src}/schemas/tickets`);

jest.mock('../../../../../src/v5/services/chat');
const ChatService = require(`${src}/services/chat`);
const { EVENTS: chatEvents } = require(`${src}/services/chat/chat.constants`);

// Need to mock these 2 to ensure we are not trying to create a real session configuration
jest.mock('express-session', () => () => { });
jest.mock('../../../../../src/v5/handler/db', () => ({
	...jest.requireActual('../../../../../src/v5/handler/db'),
	getSessionStore: () => { },
}));
jest.mock('../../../../../src/v5/services/sessions');
const Sessions = require(`${src}/services/sessions`);
jest.mock('../../../../../src/v5/processors/teamspaces/teamspaces');
const Teamspaces = require(`${src}/processors/teamspaces/teamspaces`);
jest.mock('../../../../../src/v5/processors/teamspaces/invitations');
const Invitations = require(`${src}/processors/teamspaces/invitations`);
const EventsManager = require(`${src}/services/eventsManager/eventsManager`);
const { events } = require(`${src}/services/eventsManager/eventsManager.constants`);
const EventsListener = require(`${src}/services/eventsListener/eventsListener`);

const eventTriggeredPromise = (event) => new Promise(
	(resolve) => EventsManager.subscribe(event, () => setTimeout(resolve, 10)),
);

const testModelEventsListener = () => {
	describe('Model Events', () => {
		test(`Should trigger updateModelStatus if there is a ${events.QUEUED_TASK_UPDATE}`, async () => {
			const project = generateRandomString();
			ProjectSettings.findProjectByModelId.mockResolvedValueOnce({ _id: project });
			const waitOnEvent = eventTriggeredPromise(events.QUEUED_TASK_UPDATE);
			const data = {
				teamspace: generateRandomString(),
				model: generateRandomString(),
				corId: generateRandomString(),
				status: generateRandomString(),
			};
			await EventsManager.publish(events.QUEUED_TASK_UPDATE, data);
			await waitOnEvent;
			expect(ModelSettings.updateModelStatus).toHaveBeenCalledTimes(1);
			expect(ModelSettings.updateModelStatus).toHaveBeenCalledWith(data.teamspace, project,
				data.model, data.status, data.corId);
		});

		test(`Should fail gracefully on error if there is a ${events.QUEUED_TASK_UPDATE}`, async () => {
			ProjectSettings.findProjectByModelId.mockRejectedValueOnce(templates.projectNotFound);
			const waitOnEvent = eventTriggeredPromise(events.QUEUED_TASK_UPDATE);
			const data = {
				teamspace: generateRandomString(),
				model: generateRandomString(),
				corId: generateRandomString(),
				status: generateRandomString(),
			};
			await EventsManager.publish(events.QUEUED_TASK_UPDATE, data);
			await waitOnEvent;
			expect(ProjectSettings.findProjectByModelId).toHaveBeenCalledTimes(1);
			expect(ProjectSettings.findProjectByModelId).toHaveBeenCalledWith(data.teamspace, data.model, { _id: 1 });
			expect(ModelSettings.updateModelStatus).toHaveBeenCalledTimes(0);
		});

		test(`Should trigger newRevisionProcessed if there is a ${events.QUEUED_TASK_COMPLETED} (container)`, async () => {
			const project = generateRandomString();
			ProjectSettings.findProjectByModelId.mockResolvedValueOnce({ _id: project });
			const waitOnEvent = eventTriggeredPromise(events.QUEUED_TASK_COMPLETED);
			const data = {
				teamspace: generateRandomString(),
				model: generateRandomString(),
				corId: generateRandomString(),
				value: generateRandomString(),
				user: generateRandomString(),
				containers: [generateRandomString()],
			};
			EventsManager.publish(events.QUEUED_TASK_COMPLETED, data);

			await waitOnEvent;
			expect(ProjectSettings.findProjectByModelId).toHaveBeenCalledTimes(1);
			expect(ProjectSettings.findProjectByModelId).toHaveBeenCalledWith(data.teamspace, data.model, { _id: 1 });
			expect(ModelSettings.newRevisionProcessed).toHaveBeenCalledTimes(1);
			expect(ModelSettings.newRevisionProcessed).toHaveBeenCalledWith(data.teamspace, project, data.model,
				data.corId, data.value, data.user, data.containers);
		});

		test(`Should fail gracefully on error if there is a ${events.QUEUED_TASK_COMPLETED}`, async () => {
			ProjectSettings.findProjectByModelId.mockRejectedValueOnce(templates.projectNotFound);
			const waitOnEvent = eventTriggeredPromise(events.QUEUED_TASK_COMPLETED);
			const data = {
				teamspace: generateRandomString(),
				model: generateRandomString(),
				corId: generateRandomString(),
				value: generateRandomString(),
				user: generateRandomString(),
				containers: [generateRandomString()],
			};
			EventsManager.publish(events.QUEUED_TASK_COMPLETED, data);

			await waitOnEvent;
			expect(ProjectSettings.findProjectByModelId).toHaveBeenCalledTimes(1);
			expect(ProjectSettings.findProjectByModelId).toHaveBeenCalledWith(data.teamspace, data.model, { _id: 1 });
			expect(ModelSettings.newRevisionProcessed).toHaveBeenCalledTimes(0);
		});

		test(`Should trigger newRevisionProcessed if there is a ${events.QUEUED_TASK_COMPLETED} (federation)`, async () => {
			const project = generateRandomString();
			ProjectSettings.findProjectByModelId.mockResolvedValueOnce({ _id: project });

			const waitOnEvent = eventTriggeredPromise(events.QUEUED_TASK_COMPLETED);
			const data = {
				teamspace: generateRandomString(),
				model: generateRandomString(),
				corId: generateRandomString(),
				value: generateRandomString(),
				user: generateRandomString(),
				containers: [generateRandomString()],
			};
			EventsManager.publish(events.QUEUED_TASK_COMPLETED, data);

			await waitOnEvent;
			expect(ProjectSettings.findProjectByModelId).toHaveBeenCalledTimes(1);
			expect(ProjectSettings.findProjectByModelId).toHaveBeenCalledWith(data.teamspace, data.model, { _id: 1 });
			expect(ModelSettings.newRevisionProcessed).toHaveBeenCalledTimes(1);
			expect(ModelSettings.newRevisionProcessed).toHaveBeenCalledWith(data.teamspace, project, data.model,
				data.corId, data.value, data.user, data.containers);
		});

		test(`Should create a ${chatEvents.FEDERATION_SETTINGS_UPDATE} chat event if there is a ${events.MODEL_SETTINGS_UPDATE} (federation)`, async () => {
			const waitOnEvent = eventTriggeredPromise(events.MODEL_SETTINGS_UPDATE);
			const data = {
				teamspace: generateRandomString(),
				model: generateRandomString(),
				project: generateRandomString(),
				data: { [generateRandomString()]: generateRandomString() },
				isFederation: true,
			};
			EventsManager.publish(events.MODEL_SETTINGS_UPDATE, data);

			await waitOnEvent;
			expect(ChatService.createModelMessage).toHaveBeenCalledTimes(1);
			expect(ChatService.createModelMessage).toHaveBeenCalledWith(
				chatEvents.FEDERATION_SETTINGS_UPDATE,
				data.data,
				data.teamspace,
				data.project,
				data.model,
				undefined,
			);
		});

		test(`Should create a ${chatEvents.CONTAINER_SETTINGS_UPDATE} chat event if there is a ${events.MODEL_SETTINGS_UPDATE} (container)`, async () => {
			const waitOnEvent = eventTriggeredPromise(events.MODEL_SETTINGS_UPDATE);
			const data = {
				teamspace: generateRandomString(),
				model: generateRandomString(),
				project: generateRandomString(),
				data: { [generateRandomString()]: generateRandomString() },
				isFederation: false,
			};
			EventsManager.publish(events.MODEL_SETTINGS_UPDATE, data);

			await waitOnEvent;
			expect(ChatService.createModelMessage).toHaveBeenCalledTimes(1);
			expect(ChatService.createModelMessage).toHaveBeenCalledWith(
				chatEvents.CONTAINER_SETTINGS_UPDATE,
				data.data,
				data.teamspace,
				data.project,
				data.model,
				undefined,
			);
		});

		test(`Should create a ${chatEvents.CONTAINER_REVISION_UPDATE} chat event if there is a ${events.REVISION_UPDATED}`, async () => {
			const waitOnEvent = eventTriggeredPromise(events.REVISION_UPDATED);
			const data = {
				teamspace: generateRandomString(),
				model: generateRandomString(),
				project: generateRandomString(),
				data: { _id: generateUUID() },
			};
			EventsManager.publish(events.REVISION_UPDATED, data);

			await waitOnEvent;
			expect(ChatService.createModelMessage).toHaveBeenCalledTimes(1);
			expect(ChatService.createModelMessage).toHaveBeenCalledWith(
				chatEvents.CONTAINER_REVISION_UPDATE,
				{ ...data.data, _id: UUIDToString(data.data._id) },
				data.teamspace,
				data.project,
				data.model,
				undefined,
			);
		});

		test(`Should create a ${chatEvents.NEW_FEDERATION} chat event if there is a ${events.NEW_MODEL} (federation)`, async () => {
			const data = {
				teamspace: generateRandomString(),
				project: generateRandomString(),
				model: generateRandomString(),
				data: { [generateRandomString()]: generateRandomString() },
				isFederation: true,
			};
			const waitOnEvent = eventTriggeredPromise(events.NEW_MODEL);
			await EventsManager.publish(events.NEW_MODEL, data);
			await waitOnEvent;
			expect(ChatService.createProjectMessage).toHaveBeenCalledTimes(1);
			expect(ChatService.createProjectMessage).toHaveBeenCalledWith(
				chatEvents.NEW_FEDERATION,
				{ ...data.data, _id: data.model },
				data.teamspace,
				data.project,
				undefined,
			);
		});

		test(`Should create a ${chatEvents.NEW_CONTAINER} chat event if there is a ${events.NEW_MODEL} (container)`, async () => {
			const data = {
				teamspace: generateRandomString(),
				project: generateRandomString(),
				model: generateRandomString(),
				data: { [generateRandomString()]: generateRandomString() },
				isFederation: false,
				undefined,
			};
			const waitOnEvent = eventTriggeredPromise(events.NEW_MODEL);
			await EventsManager.publish(events.NEW_MODEL, data);
			await waitOnEvent;
			expect(ChatService.createProjectMessage).toHaveBeenCalledTimes(1);
			expect(ChatService.createProjectMessage).toHaveBeenCalledWith(
				chatEvents.NEW_CONTAINER,
				{ ...data.data, _id: data.model },
				data.teamspace,
				data.project,
				undefined,
			);
		});

		test(`Should create a ${chatEvents.FEDERATION_REMOVED} chat event if there is a ${events.DELETE_MODEL} (federation)`, async () => {
			const waitOnEvent = eventTriggeredPromise(events.DELETE_MODEL);
			const data = {
				teamspace: generateRandomString(),
				model: generateRandomString(),
				project: generateRandomString(),
				isFederation: true,
			};
			EventsManager.publish(events.DELETE_MODEL, data);

			await waitOnEvent;
			expect(ChatService.createModelMessage).toHaveBeenCalledTimes(1);
			expect(ChatService.createModelMessage).toHaveBeenCalledWith(
				chatEvents.FEDERATION_REMOVED,
				{},
				data.teamspace,
				data.project,
				data.model,
				undefined,
			);
		});

		test(`Should create a ${chatEvents.CONTAINER_REMOVED} chat event if there is a ${events.DELETE_MODEL} (container)`, async () => {
			const waitOnEvent = eventTriggeredPromise(events.DELETE_MODEL);
			const data = {
				teamspace: generateRandomString(),
				model: generateRandomString(),
				project: generateRandomString(),
				isFederation: false,
			};
			EventsManager.publish(events.DELETE_MODEL, data);

			await waitOnEvent;
			expect(ChatService.createModelMessage).toHaveBeenCalledTimes(1);
			expect(ChatService.createModelMessage).toHaveBeenCalledWith(
				chatEvents.CONTAINER_REMOVED,
				{},
				data.teamspace,
				data.project,
				data.model,
				undefined,
			);
		});

		test(`Should create a ${chatEvents.CONTAINER_NEW_REVISION} chat event if there is a ${events.NEW_REVISION} (container)`, async () => {
			const tag = generateRandomString();
			const author = generateRandomString();
			const timestamp = generateRandomDate();
			Revisions.getRevisionByIdOrTag.mockResolvedValueOnce({ tag, author, timestamp });

			const waitOnEvent = eventTriggeredPromise(events.NEW_REVISION);
			const data = {
				teamspace: generateRandomString(),
				project: generateRandomString(),
				model: generateRandomString(),
				revision: generateRandomString(),
				isFederation: false,
			};
			EventsManager.publish(events.NEW_REVISION, data);

			await waitOnEvent;

			expect(Revisions.getRevisionByIdOrTag).toHaveBeenCalledTimes(1);
			expect(Revisions.getRevisionByIdOrTag).toHaveBeenCalledWith(data.teamspace, data.model, data.revision,
				{ _id: 0, tag: 1, author: 1, timestamp: 1 });
			expect(ChatService.createModelMessage).toHaveBeenCalledTimes(1);
			expect(ChatService.createModelMessage).toHaveBeenCalledWith(
				chatEvents.CONTAINER_NEW_REVISION,
				{ _id: data.revision, tag, author, timestamp: timestamp.getTime() },
				data.teamspace,
				data.project,
				data.model,
			);
		});

		test(`Should create a ${chatEvents.FEDERATION_NEW_REVISION} chat event if if there is a ${events.NEW_REVISION} (federation)`, async () => {
			const tag = generateRandomString();
			const author = generateRandomString();
			const timestamp = generateRandomDate();
			Revisions.getRevisionByIdOrTag.mockResolvedValueOnce({ tag, author, timestamp });

			const waitOnEvent = eventTriggeredPromise(events.NEW_REVISION);
			const data = {
				teamspace: generateRandomString(),
				project: generateRandomString(),
				model: generateRandomString(),
				revision: generateRandomString(),
				isFederation: true,
			};
			EventsManager.publish(events.NEW_REVISION, data);

			await waitOnEvent;
			expect(Revisions.getRevisionByIdOrTag).toHaveBeenCalledTimes(1);
			expect(Revisions.getRevisionByIdOrTag).toHaveBeenCalledWith(data.teamspace, data.model, data.revision,
				{ _id: 0, tag: 1, author: 1, timestamp: 1 });
			expect(ChatService.createModelMessage).toHaveBeenCalledTimes(1);
			expect(ChatService.createModelMessage).toHaveBeenCalledWith(
				chatEvents.FEDERATION_NEW_REVISION,
				{ _id: data.revision, tag, author, timestamp: timestamp.getTime() },
				data.teamspace,
				data.project,
				data.model,
			);
		});

		test(`Should fail gracefully on error if there is a ${events.NEW_REVISION} (container)`, async () => {
			const waitOnEvent = eventTriggeredPromise(events.NEW_REVISION);

			const data = {
				teamspace: generateRandomString(),
				project: generateRandomString(),
				model: generateRandomString(),
				revision: generateRandomString(),
				isFederation: false,
			};

			Revisions.getRevisionByIdOrTag.mockRejectedValueOnce(templates.revisionNotFound);
			EventsManager.publish(events.NEW_REVISION, data);

			await waitOnEvent;
			expect(Revisions.getRevisionByIdOrTag).toHaveBeenCalledTimes(1);
			expect(Revisions.getRevisionByIdOrTag).toHaveBeenCalledWith(data.teamspace, data.model, data.revision,
				{ _id: 0, tag: 1, author: 1, timestamp: 1 });
			expect(ChatService.createModelMessage).toHaveBeenCalledTimes(0);
		});

		const updateTicketTest = async (isFederation, changes, expectedData) => {
			const waitOnEvent = eventTriggeredPromise(events.UPDATE_TICKET);
			const data = {
				teamspace: generateRandomString(),
				project: generateRandomString(),
				model: generateRandomString(),
				ticket: { _id: generateRandomString(), title: generateRandomString() },
				author: generateRandomString(),
				timestamp: generateRandomDate(),
				changes,
			};

			TicketSchemas.serialiseTicket.mockImplementationOnce(() => ({
				_id: data.ticket._id, ...expectedData }));
			ModelSettings.isFederation.mockResolvedValueOnce(isFederation);
			const event = isFederation ? chatEvents.FEDERATION_UPDATE_TICKET : chatEvents.CONTAINER_UPDATE_TICKET;
			EventsManager.publish(events.UPDATE_TICKET, data);

			await waitOnEvent;
			expect(ModelSettings.isFederation).toHaveBeenCalledTimes(1);
			expect(ModelSettings.isFederation).toHaveBeenCalledWith(data.teamspace, data.model);
			expect(TicketLogs.addTicketLog).toHaveBeenCalledTimes(1);
			expect(TicketLogs.addTicketLog).toHaveBeenCalledWith(data.teamspace, data.project, data.model,
				data.ticket._id, { author: data.author, changes: data.changes, timestamp: data.timestamp });
			expect(ChatService.createModelMessage).toHaveBeenCalledTimes(1);
			expect(ChatService.createModelMessage).toHaveBeenCalledWith(
				event,
				{
					_id: data.ticket._id,
					...expectedData,
				},
				data.teamspace,
				data.project,
				data.model,
			);
		};

		test(`Should fail gracefully on error if there is an ${events.UPDATE_TICKET} event`, async () => {
			const waitOnEvent = eventTriggeredPromise(events.UPDATE_TICKET);
			const data = {
				teamspace: generateRandomString(),
				project: generateRandomString(),
				model: generateRandomString(),
				ticket: { _id: generateRandomString(), title: generateRandomString() },
				author: generateRandomString(),
				timestamp: generateRandomDate(),
				changes: generateRandomString(),
			};

			ModelSettings.isFederation.mockRejectedValueOnce(generateRandomString());
			EventsManager.publish(events.UPDATE_TICKET, data);

			await waitOnEvent;
			expect(ModelSettings.isFederation).toHaveBeenCalledTimes(1);
			expect(ModelSettings.isFederation).toHaveBeenCalledWith(data.teamspace, data.model);
			expect(TicketLogs.addTicketLog).toHaveBeenCalledTimes(1);
			expect(TicketLogs.addTicketLog).toHaveBeenCalledWith(data.teamspace, data.project, data.model,
				data.ticket._id, { author: data.author, changes: data.changes, timestamp: data.timestamp });
			expect(ChatService.createModelMessage).not.toHaveBeenCalled();
		});

		test(`Should trigger addTicketLog and create a ${chatEvents.CONTAINER_UPDATE_TICKET} if there
				is a ${events.UPDATE_TICKET} (Container)`, async () => {
			const changes = { title: { from: generateRandomString(), to: generateRandomString() } };
			const expectedData = { title: changes.title.to };
			await updateTicketTest(false, changes, expectedData);
		});

		test(`Should trigger addTicketLog and create a ${chatEvents.CONTAINER_UPDATE_TICKET} if there
				is a ${events.UPDATE_TICKET} (Container)`, async () => {
			const changes = { properties: { prop: { from: generateRandomString(), to: generateRandomString() } } };
			const expectedData = { properties: { prop: changes.properties.prop.to } };
			await updateTicketTest(false, changes, expectedData);
		});

		test(`Should trigger addTicketLog and create a ${chatEvents.CONTAINER_UPDATE_TICKET} if there
				is a ${events.UPDATE_TICKET} (Container)`, async () => {
			const changes = {
				modules: {
					mod: {
						modProp: { from: generateRandomString(), to: generateRandomString() },
					},
				},
			};
			const expectedData = { modules: { mod: { modProp: changes.modules.mod.modProp.to } } };
			await updateTicketTest(false, changes, expectedData);
		});

		test(`Should trigger addTicketLog and create a ${chatEvents.FEDERATION_UPDATE_TICKET} if there
				is a ${events.UPDATE_TICKET} (Federation)`, async () => {
			const changes = { title: { from: generateRandomString(), to: generateRandomString() } };
			const expectedData = { title: changes.title.to };
			await updateTicketTest(true, changes, expectedData);
		});

		const addTicketTest = async (isFederation) => {
			const waitOnEvent = eventTriggeredPromise(events.NEW_TICKET);
			const template = generateRandomString();
			const data = {
				teamspace: generateRandomString(),
				project: generateRandomString(),
				model: generateRandomString(),
				ticket: {
					type: generateRandomString(),
					[generateRandomString()]: generateRandomString(),
				},
			};

			TicketTemplates.getTemplateById.mockResolvedValueOnce(template);
			TicketSchemas.serialiseTicket.mockImplementationOnce(() => data.ticket);
			ModelSettings.isFederation.mockResolvedValueOnce(isFederation);
			const event = isFederation ? chatEvents.FEDERATION_NEW_TICKET : chatEvents.CONTAINER_NEW_TICKET;
			EventsManager.publish(events.NEW_TICKET, data);
			expect(ModelSettings.isFederation).toHaveBeenCalledTimes(1);
			expect(ModelSettings.isFederation).toHaveBeenCalledWith(data.teamspace, data.model);

			await waitOnEvent;

			expect(TicketTemplates.getTemplateById).toHaveBeenCalledTimes(1);
			expect(TicketTemplates.getTemplateById).toHaveBeenCalledWith(data.teamspace, data.ticket.type);
			expect(TicketSchemas.serialiseTicket).toHaveBeenCalledTimes(1);
			expect(TicketSchemas.serialiseTicket).toHaveBeenCalledWith(data.ticket, template);
			expect(ChatService.createModelMessage).toHaveBeenCalledTimes(1);
			expect(ChatService.createModelMessage).toHaveBeenCalledWith(
				event,
				data.ticket,
				data.teamspace,
				data.project,
				data.model,
			);
		};

		test(`Should create a ${chatEvents.CONTAINER_NEW_TICKET} if there
				is a ${events.NEW_TICKET} (Container)`, async () => {
			await addTicketTest(false);
		});

		test(`Should create a ${chatEvents.FEDERATION_NEW_TICKET} if there
				is a ${events.NEW_TICKET} (Federation)`, async () => {
			await addTicketTest(true);
		});
	});
};

const testAuthEventsListener = () => {
	describe('Auth Events', () => {
		describe(events.SESSION_CREATED, () => {
			test(`Should trigger UserLoggedIn if there is a ${events.SESSION_CREATED}`, async () => {
				const waitOnEvent = eventTriggeredPromise(events.SESSION_CREATED);
				const username = generateRandomString();
				const sessionID = generateRandomString();
				const socketId = generateRandomString();
				const ipAddress = generateRandomString();
				const userAgent = generateRandomString();
				const referer = generateRandomString();
				EventsManager.publish(events.SESSION_CREATED,
					{ username, sessionID, socketId, ipAddress, userAgent, referer });

				await waitOnEvent;
				expect(LoginRecords.saveSuccessfulLoginRecord).toHaveBeenCalledTimes(1);
				expect(LoginRecords.saveSuccessfulLoginRecord).toHaveBeenCalledWith(
					username, sessionID, ipAddress, userAgent, referer,
				);
				expect(Sessions.removeOldSessions).toHaveBeenCalledTimes(1);
				expect(Sessions.removeOldSessions).toHaveBeenCalledWith(username, sessionID, referer);
				expect(ChatService.createInternalMessage).toHaveBeenCalledTimes(1);
				expect(ChatService.createInternalMessage).toHaveBeenCalledWith(chatEvents.LOGGED_IN,
					{ sessionID, socketId });
			});

			test(`Should not create an event message if there is a ${events.SESSION_CREATED} event without socketId`, async () => {
				const waitOnEvent = eventTriggeredPromise(events.SESSION_CREATED);
				const username = generateRandomString();
				const sessionID = generateRandomString();
				const ipAddress = generateRandomString();
				const userAgent = generateRandomString();
				const referer = generateRandomString();
				EventsManager.publish(events.SESSION_CREATED,
					{ username, sessionID, ipAddress, userAgent, referer });

				await waitOnEvent;
				expect(LoginRecords.saveSuccessfulLoginRecord).toHaveBeenCalledTimes(1);
				expect(LoginRecords.saveSuccessfulLoginRecord).toHaveBeenCalledWith(
					username, sessionID, ipAddress, userAgent, referer,
				);
				expect(Sessions.removeOldSessions).toHaveBeenCalledTimes(1);
				expect(Sessions.removeOldSessions).toHaveBeenCalledWith(username, sessionID, referer);
				expect(ChatService.createInternalMessage).not.toHaveBeenCalled();
			});
		});
		describe(events.SESSION_REMOVED, () => {
			test(`Should trigger sessionsRemoved if there is a ${events.SESSIONS_REMOVED}`, async () => {
				const waitOnEvent = eventTriggeredPromise(events.SESSIONS_REMOVED);
				const data = {
					ids: [generateRandomString(), generateRandomString(), generateRandomString()],
				};
				EventsManager.publish(events.SESSIONS_REMOVED, data);

				await waitOnEvent;
				expect(ChatService.createDirectMessage).toHaveBeenCalledTimes(1);
				expect(ChatService.createDirectMessage).toHaveBeenCalledWith(
					chatEvents.LOGGED_OUT,
					{ reason: 'You have logged in else where' },
					data.ids,
				);

				expect(ChatService.createInternalMessage).toHaveBeenCalledTimes(1);
				expect(ChatService.createInternalMessage).toHaveBeenCalledWith(
					chatEvents.LOGGED_OUT,
					{ sessionIds: data.ids },
				);
			});

			test(`Should not send a direct message if the ${events.SESSIONS_REMOVED} was triggered by session owner`, async () => {
				const waitOnEvent = eventTriggeredPromise(events.SESSIONS_REMOVED);
				const data = {
					ids: [generateRandomString(), generateRandomString(), generateRandomString()],
					elective: true,
				};
				EventsManager.publish(events.SESSIONS_REMOVED, data);

				await waitOnEvent;
				expect(ChatService.createDirectMessage).not.toHaveBeenCalled();

				expect(ChatService.createInternalMessage).toHaveBeenCalledTimes(1);
				expect(ChatService.createInternalMessage).toHaveBeenCalledWith(
					chatEvents.LOGGED_OUT,
					{ sessionIds: data.ids },
				);
			});
		});

		describe(events.FAILED_LOGIN_ATTEMPT, () => {
			test(`Should trigger recordFailedAttempt if there is a ${events.FAILED_LOGIN_ATTEMPT}`, async () => {
				const waitOnEvent = eventTriggeredPromise(events.FAILED_LOGIN_ATTEMPT);
				const data = {
					user: generateRandomString(),
					ipAddress: generateRandomString(),
					userAgent: generateRandomString(),
					referer: generateRandomString(),
				};
				EventsManager.publish(events.FAILED_LOGIN_ATTEMPT, data);

				await waitOnEvent;

				expect(LoginRecords.recordFailedAttempt).toHaveBeenCalledTimes(1);
				expect(LoginRecords.recordFailedAttempt).toHaveBeenCalledWith(data.user,
					data.ipAddress, data.userAgent, data.referer);
			});
		});
	});
};

const testUserEventsListener = () => {
	describe('User Events', () => {
		test(`Should trigger userVerified if there is a ${events.USER_VERIFIED}`, async () => {
			const waitOnEvent = eventTriggeredPromise(events.USER_VERIFIED);
			const username = generateRandomString();
			EventsManager.publish(events.USER_VERIFIED, { username });
			await waitOnEvent;
			expect(Teamspaces.initTeamspace).toHaveBeenCalledTimes(1);
			expect(Teamspaces.initTeamspace).toHaveBeenCalledWith(username);
			expect(Invitations.unpack).toHaveBeenCalledTimes(1);
			expect(Invitations.unpack).toHaveBeenCalledWith(username);
		});
	});
};

describe('services/eventsListener/eventsListener', () => {
	EventsListener.init();
	testModelEventsListener();
	testAuthEventsListener();
	testUserEventsListener();
});
