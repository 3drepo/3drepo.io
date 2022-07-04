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

const { src } = require('../../../helper/path');
const { generateRandomString } = require('../../../helper/services');

jest.mock('../../../../../src/v5/models/modelSettings');
const ModelSettings = require(`${src}/models/modelSettings`);

jest.mock('../../../../../src/v5/models/projectSettings');
const ProjectSettings = require(`${src}/models/projectSettings`);

jest.mock('../../../../../src/v5/models/loginRecord');
const LoginRecord = require(`${src}/models/loginRecord`);

jest.mock('../../../../../src/v5/services/chat');
const ChatService = require(`${src}/services/chat`);
const { EVENTS: chatEvents } = require(`${src}/services/chat/chat.constants`);

// Need to mock these 2 to ensure we are not trying to create a real session configuration
jest.mock('express-session', () => () => {});
jest.mock('../../../../../src/v5/handler/db', () => ({
	...jest.requireActual('../../../../../src/v5/handler/db'),
	getSessionStore: () => {},
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
		test(`Should trigger ModelStatusUpdate if there is a ${events.QUEUED_TASK_UPDATE}`, async () => {
			const project = generateRandomString();
			ProjectSettings.findProjectByModelId.mockResolvedValueOnce({ _id: project });
			const waitOnEvent = eventTriggeredPromise(events.QUEUED_TASK_UPDATE);
			const data = { teamspace: '123', model: '345', corId: 1, status: 'happy' };
			await EventsManager.publish(events.QUEUED_TASK_UPDATE, data);
			await waitOnEvent;
			expect(ModelSettings.updateModelStatus).toHaveBeenCalledTimes(1);
			expect(ModelSettings.updateModelStatus).toHaveBeenCalledWith(data.teamspace, project,
				data.model, data.status, data.corId);
		});

		test(`Should trigger newRevisionProcessed if there is a ${events.QUEUED_TASK_COMPLETED}`, async () => {
			const project = generateRandomString();
			ProjectSettings.findProjectByModelId.mockResolvedValueOnce({ _id: project });
			const waitOnEvent = eventTriggeredPromise(events.QUEUED_TASK_COMPLETED);
			const data = { teamspace: '123', model: '345', corId: 1, value: 'happy', user: 'abc' };
			EventsManager.publish(events.QUEUED_TASK_COMPLETED, data);

			await waitOnEvent;
			expect(ModelSettings.newRevisionProcessed).toHaveBeenCalledTimes(1);
			expect(ModelSettings.newRevisionProcessed).toHaveBeenCalledWith(
				data.teamspace, project, data.model, data.corId, data.value, data.user, undefined,
			);
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
	});
};

const testAuthEventsListener = () => {
	describe('Auth Events', () => {
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
			expect(LoginRecord.saveLoginRecord).toHaveBeenCalledTimes(1);
			expect(LoginRecord.saveLoginRecord).toHaveBeenCalledWith(
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
			expect(LoginRecord.saveLoginRecord).toHaveBeenCalledTimes(1);
			expect(LoginRecord.saveLoginRecord).toHaveBeenCalledWith(
				username, sessionID, ipAddress, userAgent, referer,
			);
			expect(Sessions.removeOldSessions).toHaveBeenCalledTimes(1);
			expect(Sessions.removeOldSessions).toHaveBeenCalledWith(username, sessionID, referer);
			expect(ChatService.createInternalMessage).not.toHaveBeenCalled();
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

		test(`Should fail gracefully on error if there is a ${events.SESSIONS_REMOVED}`, async () => {
			const waitOnEvent = eventTriggeredPromise(events.SESSIONS_REMOVED);
			const data = {
				ids: [generateRandomString(), generateRandomString(), generateRandomString()],
			};
			ChatService.createDirectMessage.mockImplementationOnce(() => { throw new Error(); });
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
