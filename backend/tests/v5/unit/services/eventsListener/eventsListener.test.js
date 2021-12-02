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

jest.mock('../../../../../src/v5/models/modelSettings');
const ModelSettings = require(`${src}/models/modelSettings`);
jest.mock('../../../../../src/v5/models/loginRecord');
const LoginRecord = require(`${src}/models/loginRecord`);
jest.mock('../../../../../src/v5/models/chatEvent');
const ChatEvent = require(`${src}/models/chatEvent`);
jest.mock('../../../../../src/v5/services/sessions');
const Sessions = require(`${src}/services/sessions`);
jest.mock('../../../../../src/v5/handler/elastic');
const Elastic = require(`${src}/handler/elastic`);
const EventsManager = require(`${src}/services/eventsManager/eventsManager`);
const { events } = require(`${src}/services/eventsManager/eventsManager.constants`);

const EventsListener = require(`${src}/services/eventsListener/eventsListener`);

ModelSettings.updateModelStatus.mockResolvedValue(() => {});
ModelSettings.newRevisionProcessed.mockResolvedValue(() => {});
LoginRecord.saveLoginRecord.mockImplementation(() => ({}));
Elastic.createLoginRecord.mockImplementation(() => {});
Sessions.removeSessions.mockImplementation(() => { });
ChatEvent.loggedOut.mockImplementation(() => { });

const eventTriggeredPromise = (event) => new Promise((resolve) => EventsManager.subscribe(event, resolve));

const testModelEventsListener = () => {
	describe('Model Events', () => {
		test(`Should trigger ModelStatusUpdate if there is a ${events.QUEUED_TASK_UPDATE}`, async () => {
			const waitOnEvent = eventTriggeredPromise(events.QUEUED_TASK_UPDATE);
			const data = { teamspace: '123', model: '345', corId: 1, status: 'happy', user: 'abc' };
			EventsManager.publish(events.QUEUED_TASK_UPDATE, data);

			await waitOnEvent;
			expect(ModelSettings.updateModelStatus.mock.calls.length).toBe(1);
			expect(ModelSettings.updateModelStatus.mock.calls[0]).toEqual(
				[data.teamspace, data.model, data.status, data.corId, data.user],
			);
		});

		test(`Should trigger newRevisionProcessed if there is a ${events.QUEUED_TASK_COMPLETED}`, async () => {
			const waitOnEvent = eventTriggeredPromise(events.QUEUED_TASK_COMPLETED);
			const data = { teamspace: '123', model: '345', corId: 1, value: 'happy', user: 'abc' };
			EventsManager.publish(events.QUEUED_TASK_COMPLETED, data);

			await waitOnEvent;
			expect(ModelSettings.newRevisionProcessed.mock.calls.length).toBe(1);
			expect(ModelSettings.newRevisionProcessed.mock.calls[0]).toEqual(

				[data.teamspace, data.model, data.corId, data.value, data.user],
			);
		});
	});
};

const oldSessions = [
	{
		_id: '1',
		session: {
			user: {
				webSession: true,
				socketId: '1234',
			},
		},
	},
	{
		_id: '2',
		session: {
			user: {
				webSession: true,
				socketId: '5678',
			},
		},
	},
];

const testAuthEventsListener = () => {
	describe('Auth Events', () => {
		test(`Should trigger UserLoggedIn if there is a ${events.USER_LOGGED_IN}`, async () => {
			const waitOnEvent = eventTriggeredPromise(events.USER_LOGGED_IN);
			const data = { username: 'username1',
				sessionID: '123',
				ipAddress: '1.2.3.4',
				userAgent: 'user agent',
				referer: 'www.google.com',
				oldSessions };
			EventsManager.publish(events.USER_LOGGED_IN, data);

			await waitOnEvent;
			expect(LoginRecord.saveLoginRecord.mock.calls.length).toBe(1);
			expect(LoginRecord.saveLoginRecord.mock.calls[0]).toEqual(['username1', '123', '1.2.3.4', 'user agent', 'www.google.com']);
			expect(Elastic.createLoginRecord.mock.calls.length).toBe(1);
			expect(Elastic.createLoginRecord.mock.calls[0]).toEqual(['username1', {}]);
			expect(Sessions.removeSessions.mock.calls.length).toBe(1);
			expect(Sessions.removeSessions.mock.calls[0]).toEqual([['1', '2']]);
			expect(ChatEvent.loggedOut.mock.calls.length).toBe(2);
			expect(ChatEvent.loggedOut.mock.calls[0]).toEqual(['1234']);
			expect(ChatEvent.loggedOut.mock.calls[1]).toEqual(['5678']);
		});

		test(`Should trigger UserLoggedIn if there is a ${events.USER_LOGGED_IN} without removing old sessions`, async () => {
			const waitOnEvent = eventTriggeredPromise(events.USER_LOGGED_IN);
			const data = { username: 'username1',
				sessionID: '123',
				ipAddress: '1.2.3.4',
				userAgent: 'user agent',
				referer: 'www.google.com',
				oldSessions: [{ _id: '1' }] };
			EventsManager.publish(events.USER_LOGGED_IN, data);

			await waitOnEvent;
			expect(LoginRecord.saveLoginRecord.mock.calls.length).toBe(1);
			expect(LoginRecord.saveLoginRecord.mock.calls[0]).toEqual(['username1', '123', '1.2.3.4', 'user agent', 'www.google.com']);
			expect(Elastic.createLoginRecord.mock.calls.length).toBe(1);
			expect(Elastic.createLoginRecord.mock.calls[0]).toEqual(['username1', {}]);
			expect(Sessions.removeSessions.mock.calls.length).toBe(1);
			expect(Sessions.removeSessions.mock.calls[0]).toEqual([[]]);
			expect(ChatEvent.loggedOut.mock.calls.length).toBe(0);
		});

		test(`Should trigger UserLoggedIn if there is a ${events.USER_LOGGED_IN} without any old sessions`, async () => {
			const waitOnEvent = eventTriggeredPromise(events.USER_LOGGED_IN);
			const data = { username: 'username1',
				sessionID: '123',
				ipAddress: '1.2.3.4',
				userAgent: 'user agent',
				referer: 'www.google.com' };
			EventsManager.publish(events.USER_LOGGED_IN, data);

			await waitOnEvent;
			expect(LoginRecord.saveLoginRecord.mock.calls.length).toBe(1);
			expect(LoginRecord.saveLoginRecord.mock.calls[0]).toEqual(['username1', '123', '1.2.3.4', 'user agent', 'www.google.com']);
			expect(Elastic.createLoginRecord.mock.calls.length).toBe(1);
			expect(Elastic.createLoginRecord.mock.calls[0]).toEqual(['username1', {}]);
			expect(Sessions.removeSessions.mock.calls.length).toBe(0);
			expect(ChatEvent.loggedOut.mock.calls.length).toBe(0);
		});
	});
};

describe('services/eventsListener/eventsListener', () => {
	EventsListener.init();
	testModelEventsListener();
	testAuthEventsListener();
});
