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
const { src } = require('../../../helper/path');
const { generateRandomString, generateUUID } = require('../../../helper/services');

jest.mock('../../../../../src/v5/models/modelSettings');
const ModelSettings = require(`${src}/models/modelSettings`);

jest.mock('../../../../../src/v5/models/projectSettings');
const ProjectSettings = require(`${src}/models/projectSettings`);

jest.mock('../../../../../src/v5/models/revisions');
const Revisions = require(`${src}/models/revisions`);

jest.mock('../../../../../src/v5/models/loginRecord');
const LoginRecord = require(`${src}/models/loginRecord`);

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
const EventsManager = require(`${src}/services/eventsManager/eventsManager`);
const { events } = require(`${src}/services/eventsManager/eventsManager.constants`);
const EventsListener = require(`${src}/services/eventsListener/eventsListener`);

const eventTriggeredPromise = (event) => new Promise(
	(resolve) => EventsManager.subscribe(event, () => setTimeout(resolve, 10)),
);

const testModelEventsListener = () => {
	describe('Model Events', () => {
		test(`Should trigger queueStatusUpdate if there is a ${events.QUEUED_TASK_UPDATE}`, async () => {
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

		test(`Should trigger queueTasksCompleted if there is a ${events.QUEUED_TASK_COMPLETED} (container)`, async () => {
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

		test(`Should trigger queueTasksCompleted if there is a ${events.QUEUED_TASK_COMPLETED} (federation)`, async () => {
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

		test(`Should trigger modelSettingsUpdated if there is a ${events.MODEL_SETTINGS_UPDATE} (federation)`, async () => {
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

		test(`Should trigger modelSettingsUpdated if there is a ${events.MODEL_SETTINGS_UPDATE} (container)`, async () => {
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

		test(`Should fail gracefully on error if there is a ${events.MODEL_SETTINGS_UPDATE} (container)`, async () => {
			const waitOnEvent = eventTriggeredPromise(events.MODEL_SETTINGS_UPDATE);
			const data = {
				teamspace: generateRandomString(),
				model: generateRandomString(),
				project: generateRandomString(),
				data: { [generateRandomString()]: generateRandomString() },
				isFederation: false,
			};
			ChatService.createModelMessage.mockRejectedValueOnce(new Error());
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

		test(`Should trigger revisionUpdated if there is a ${events.REVISION_UPDATED}`, async () => {
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
			);
		});

		test(`Should fail gracefully on error if there is a ${events.REVISION_UPDATED}`, async () => {
			const waitOnEvent = eventTriggeredPromise(events.REVISION_UPDATED);
			const data = {
				teamspace: generateRandomString(),
				model: generateRandomString(),
				project: generateRandomString(),
				data: { _id: generateUUID() },
			};
			ChatService.createModelMessage.mockRejectedValueOnce(new Error());
			EventsManager.publish(events.REVISION_UPDATED, data);

			await waitOnEvent;
			expect(ChatService.createModelMessage).toHaveBeenCalledTimes(1);
			expect(ChatService.createModelMessage).toHaveBeenCalledWith(
				chatEvents.CONTAINER_REVISION_UPDATE,
				{ ...data.data, _id: UUIDToString(data.data._id) },
				data.teamspace,
				data.project,
				data.model,
			);
		});

		test(`Should trigger modelAdded if there is a ${events.NEW_MODEL} (federation)`, async () => {
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
			expect(ChatService.createProjectMessage).toHaveBeenCalledWith(chatEvents.NEW_FEDERATION,
				{ ...data.data, _id: data.model }, data.teamspace, data.project);
		});

		test(`Should trigger modelAdded if there is a ${events.NEW_MODEL} (container)`, async () => {
			const data = {
				teamspace: generateRandomString(),
				project: generateRandomString(),
				model: generateRandomString(),
				data: { [generateRandomString()]: generateRandomString() },
				isFederation: false,
			};
			const waitOnEvent = eventTriggeredPromise(events.NEW_MODEL);
			await EventsManager.publish(events.NEW_MODEL, data);
			await waitOnEvent;
			expect(ChatService.createProjectMessage).toHaveBeenCalledTimes(1);
			expect(ChatService.createProjectMessage).toHaveBeenCalledWith(chatEvents.NEW_CONTAINER,
				{ ...data.data, _id: data.model }, data.teamspace, data.project);
		});

		test(`Should fail gracefully on error if there is a ${events.NEW_MODEL} (container)`, async () => {
			const waitOnEvent = eventTriggeredPromise(events.NEW_MODEL);
			const data = {
				teamspace: generateRandomString(),
				project: generateRandomString(),
				model: generateRandomString(),
				data: { [generateRandomString()]: generateRandomString() },
				isFederation: false,
			};
			ChatService.createProjectMessage.mockRejectedValueOnce(new Error());
			EventsManager.publish(events.NEW_MODEL, data);

			await waitOnEvent;
			expect(ChatService.createProjectMessage).toHaveBeenCalledTimes(1);
			expect(ChatService.createProjectMessage).toHaveBeenCalledWith(chatEvents.NEW_CONTAINER,
				{ ...data.data, _id: data.model }, data.teamspace, data.project);
		});

		test(`Should trigger modelDeleted if there is a ${events.DELETE_MODEL} (federation)`, async () => {
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
			);
		});

		test(`Should trigger modelDeleted if there is a ${events.DELETE_MODEL} (container)`, async () => {
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
			);
		});

		test(`Should fail gracefully on error if there is a ${events.DELETE_MODEL} (container)`, async () => {
			const waitOnEvent = eventTriggeredPromise(events.DELETE_MODEL);
			const data = {
				teamspace: generateRandomString(),
				model: generateRandomString(),
				project: generateRandomString(),
				isFederation: false,
			};
			ChatService.createModelMessage.mockRejectedValueOnce(new Error());
			EventsManager.publish(events.DELETE_MODEL, data);

			await waitOnEvent;
			expect(ChatService.createModelMessage).toHaveBeenCalledTimes(1);
			expect(ChatService.createModelMessage).toHaveBeenCalledWith(
				chatEvents.CONTAINER_REMOVED,
				{},
				data.teamspace,
				data.project,
				data.model,
			);
		});

		test(`Should trigger revisionAdded if there is a ${events.NEW_REVISION} (container)`, async () => {
			const tag = generateRandomString();
			const author = generateRandomString();
			const timestamp = generateRandomString();
			Revisions.getRevisionByIdOrTag.mockResolvedValueOnce({ tag, author, timestamp });

			const waitOnEvent = eventTriggeredPromise(events.NEW_REVISION);
			const data = {
				teamspace: generateRandomString(),
				project: generateRandomString(),
				model: generateRandomString(),
				revision: generateRandomString(),
				isFederation: false
			};
			EventsManager.publish(events.NEW_REVISION, data);

			await waitOnEvent;
			
			expect(Revisions.getRevisionByIdOrTag).toHaveBeenCalledTimes(1);
			expect(Revisions.getRevisionByIdOrTag).toHaveBeenCalledWith(data.teamspace, data.model, data.revision,
				{ _id: 0, tag: 1, author: 1, timestamp: 1 });			
			expect(ChatService.createModelMessage).toHaveBeenCalledTimes(1);
			expect(ChatService.createModelMessage).toHaveBeenCalledWith(chatEvents.CONTAINER_NEW_REVISION,
				{ tag, author, timestamp }, data.teamspace, data.project, data.model);
		});

		test(`Should trigger revisionAdded if there is a ${events.NEW_REVISION} (federation)`, async () => {
			const tag = generateRandomString();
			const author = generateRandomString();
			const timestamp = generateRandomString();
			Revisions.getRevisionByIdOrTag.mockResolvedValueOnce({ tag, author, timestamp });

			const waitOnEvent = eventTriggeredPromise(events.NEW_REVISION);
			const data = {
				teamspace: generateRandomString(),
				project: generateRandomString(),
				model: generateRandomString(),
				revision: generateRandomString(),
				isFederation: true
			};
			EventsManager.publish(events.NEW_REVISION, data);

			await waitOnEvent;
			expect(Revisions.getRevisionByIdOrTag).toHaveBeenCalledTimes(1);
			expect(Revisions.getRevisionByIdOrTag).toHaveBeenCalledWith(data.teamspace, data.model, data.revision,
				{ _id: 0, tag: 1, author: 1, timestamp: 1 });
			expect(ChatService.createModelMessage).toHaveBeenCalledTimes(1);
			expect(ChatService.createModelMessage).toHaveBeenCalledWith(chatEvents.FEDERATION_NEW_REVISION,
				{ tag, author, timestamp }, data.teamspace, data.project, data.model);
		});

		test(`Should fail gracefully on error if there is a ${events.NEW_REVISION} (container)`, async () => {
			const waitOnEvent = eventTriggeredPromise(events.NEW_REVISION);
			const tag = generateRandomString();
			const author = generateRandomString();
			const timestamp = generateRandomString();
			const data = {
				teamspace: generateRandomString(),
				project: generateRandomString(),
				model: generateRandomString(),
				revision: generateRandomString(),
				isFederation: false
			};
			Revisions.getRevisionByIdOrTag.mockResolvedValueOnce({ tag, author, timestamp });

			ChatService.createModelMessage.mockRejectedValueOnce(new Error());
			EventsManager.publish(events.NEW_REVISION, data);

			await waitOnEvent;
			expect(Revisions.getRevisionByIdOrTag).toHaveBeenCalledTimes(1);
			expect(Revisions.getRevisionByIdOrTag).toHaveBeenCalledWith(data.teamspace, data.model, data.revision,
				{ _id: 0, tag: 1, author: 1, timestamp: 1 });
			expect(ChatService.createModelMessage).toHaveBeenCalledTimes(1);
			expect(ChatService.createModelMessage).toHaveBeenCalledWith(chatEvents.CONTAINER_NEW_REVISION,
				{ tag, author, timestamp }, data.teamspace, data.project, data.model);
		});
	});
};

const testAuthEventsListener = () => {
	describe('Auth Events', () => {
		test(`Should trigger UserLoggedIn if there is a ${events.SESSION_CREATED}`, async () => {
			const waitOnEvent = eventTriggeredPromise(events.SESSION_CREATED);
			const data = {
				username: 'username1',
				sessionID: '123',
				ipAddress: '1.2.3.4',
				userAgent: 'user agent',
				referer: 'www.google.com',
			};
			EventsManager.publish(events.SESSION_CREATED, data);

			await waitOnEvent;
			expect(LoginRecord.saveLoginRecord.mock.calls.length).toBe(1);
			expect(LoginRecord.saveLoginRecord.mock.calls[0]).toEqual(['username1', '123', '1.2.3.4', 'user agent', 'www.google.com']);
			expect(Sessions.removeOldSessions.mock.calls.length).toBe(1);
			expect(Sessions.removeOldSessions.mock.calls[0]).toEqual(['username1', '123', 'www.google.com']);
		});

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
		});

		test(`Should fail gracefully on error if there is a ${events.SESSIONS_REMOVED}`, async () => {
			const waitOnEvent = eventTriggeredPromise(events.SESSIONS_REMOVED);
			const data = {
				ids: [generateRandomString(), generateRandomString(), generateRandomString()],
			};
			ChatService.createDirectMessage.mockRejectedValueOnce(new Error());
			EventsManager.publish(events.SESSIONS_REMOVED, data);

			await waitOnEvent;
			expect(ChatService.createDirectMessage).toHaveBeenCalledTimes(1);
			expect(ChatService.createDirectMessage).toHaveBeenCalledWith(
				chatEvents.LOGGED_OUT,
				{ reason: 'You have logged in else where' },
				data.ids,
			);
		});
	});
};

const testUserEventsListener = () => {
	describe('User Events', () => {
		test(`Should trigger userVerified if there is a ${events.USER_VERIFIED}`, async () => {
			const waitOnEvent = eventTriggeredPromise(events.USER_VERIFIED);
			EventsManager.publish(events.USER_VERIFIED, { username: 'username1' });
			await waitOnEvent;
			expect(Teamspaces.initTeamspace.mock.calls.length).toBe(1);
			expect(Teamspaces.initTeamspace.mock.calls[0][0]).toEqual('username1');
		});
	});
};

describe('services/eventsListener/eventsListener', () => {
	EventsListener.init();
	testModelEventsListener();
	testAuthEventsListener();
	testUserEventsListener();
});
