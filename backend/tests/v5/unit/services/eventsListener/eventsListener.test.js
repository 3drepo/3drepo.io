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
jest.mock('../../../../../src/v5/services/sessions');
const Sessions = require(`${src}/services/sessions`);
jest.mock('../../../../../src/v5/processors/teamspaces/teamspaces');
const Teamspaces = require(`${src}/processors/teamspaces/teamspaces`);
const EventsManager = require(`${src}/services/eventsManager/eventsManager`);
const { events } = require(`${src}/services/eventsManager/eventsManager.constants`);

const EventsListener = require(`${src}/services/eventsListener/eventsListener`);

ModelSettings.updateModelStatus.mockResolvedValue(() => {});
ModelSettings.newRevisionProcessed.mockResolvedValue(() => {});
LoginRecord.saveLoginRecord.mockImplementation(() => ({}));
Sessions.removeOldSessions.mockImplementation(() => { });
Teamspaces.initializeTeamspace.mockImplementation(()=> {});

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
				[data.teamspace, data.model, data.corId, data.value, data.user, undefined],
			);
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
	});
};

const testUserEventsListener = () => {
	describe('User Events', () => {
		test(`Should trigger userVerified if there is a ${events.USER_VERIFIED}`, async () => {
			const waitOnEvent = eventTriggeredPromise(events.USER_VERIFIED);
			EventsManager.publish(events.USER_VERIFIED,  { username: 'username1'});
			await waitOnEvent;
			expect(Teamspaces.initializeTeamspace.mock.calls.length).toBe(1);
			expect(Teamspaces.initializeTeamspace.mock.calls[0][0]).toEqual( 'username1');
		});
	});
};

describe('services/eventsListener/eventsListener', () => {
	EventsListener.init();
	testModelEventsListener();
	testAuthEventsListener();
	testUserEventsListener();
});
