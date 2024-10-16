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

const { actions } = require(`${src}/models/teamspaces.audits.constants`);
const { MODEL_VIEWER, PROJECT_ADMIN, MODEL_COMMENTER, MODEL_COLLABORATOR } = require(`${src}/utils/permissions/permissions.constants`);
const { generateRandomString, generateUUID } = require('../../../helper/services');

jest.mock('../../../../../src/v5/models/loginRecords');
const LoginRecords = require(`${src}/models/loginRecords`);
jest.mock('../../../../../src/v5/models/projectSettings');
const ProjectSettings = require(`${src}/models/projectSettings`);

jest.mock('../../../../../src/v5/models/teamspaces.audits');
const Audits = require(`${src}/models/teamspaces.audits`);

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
			expect(Teamspaces.initTeamspace).not.toHaveBeenCalled();
			expect(Invitations.unpack).toHaveBeenCalledTimes(1);
			expect(Invitations.unpack).toHaveBeenCalledWith(username);
		});
	});
};

const testAuditEventsListener = () => {
	describe('Activities Events', () => {
		test(`Should trigger userAdded if there is a ${events.USER_ADDED}`, async () => {
			const waitOnEvent = eventTriggeredPromise(events.USER_ADDED);
			const teamspace = generateRandomString();
			const executor = generateRandomString();
			const user = generateRandomString();
			EventsManager.publish(events.USER_ADDED, { teamspace, executor, user });
			await waitOnEvent;

			expect(Audits.logAction).toHaveBeenCalledTimes(1);
			expect(Audits.logAction).toHaveBeenCalledWith(teamspace, actions.USER_ADDED, executor, { user });
		});

		test(`Should fail gracefully on error if there is an ${events.USER_ADDED} event`, async () => {
			const waitOnEvent = eventTriggeredPromise(events.USER_ADDED);
			const teamspace = generateRandomString();
			const executor = generateRandomString();
			const user = generateRandomString();

			Audits.logAction.mockRejectedValueOnce(generateRandomString());
			EventsManager.publish(events.USER_ADDED, { teamspace, executor, user });

			await waitOnEvent;
			expect(Audits.logAction).toHaveBeenCalledTimes(1);
			expect(Audits.logAction).toHaveBeenCalledWith(teamspace, actions.USER_ADDED, executor, { user });
		});

		test(`Should trigger userRemoved if there is a ${events.USER_REMOVED}`, async () => {
			const waitOnEvent = eventTriggeredPromise(events.USER_REMOVED);
			const teamspace = generateRandomString();
			const executor = generateRandomString();
			const user = generateRandomString();
			EventsManager.publish(events.USER_REMOVED, { teamspace, executor, user });
			await waitOnEvent;
			expect(Teamspaces.initTeamspace).not.toHaveBeenCalled();
			expect(Audits.logAction).toHaveBeenCalledTimes(1);
			expect(Audits.logAction).toHaveBeenCalledWith(teamspace, actions.USER_REMOVED, executor, { user });
		});

		test(`Should fail gracefully on error if there is an ${events.USER_REMOVED} event`, async () => {
			const waitOnEvent = eventTriggeredPromise(events.USER_REMOVED);
			const teamspace = generateRandomString();
			const executor = generateRandomString();
			const user = generateRandomString();

			Audits.logAction.mockRejectedValueOnce(generateRandomString());
			EventsManager.publish(events.USER_REMOVED, { teamspace, executor, user });

			await waitOnEvent;
			expect(Audits.logAction).toHaveBeenCalledTimes(1);
			expect(Audits.logAction).toHaveBeenCalledWith(teamspace, actions.USER_REMOVED, executor, { user });
		});

		test(`Should trigger invitationAdded if there is a ${events.INVITATION_ADDED}`, async () => {
			const waitOnEvent = eventTriggeredPromise(events.INVITATION_ADDED);
			const teamspace = generateRandomString();
			const executor = generateRandomString();
			const email = generateRandomString();
			const job = generateRandomString();
			const permissions = generateRandomString();
			EventsManager.publish(events.INVITATION_ADDED, { teamspace, executor, email, job, permissions });
			await waitOnEvent;

			expect(Audits.logAction).toHaveBeenCalledTimes(1);
			expect(Audits.logAction).toHaveBeenCalledWith(teamspace, actions.INVITATION_ADDED, executor,
				{ email, job, permissions });
		});

		test(`Should fail gracefully on error if there is an ${events.INVITATION_ADDED} event`, async () => {
			const waitOnEvent = eventTriggeredPromise(events.INVITATION_ADDED);
			const teamspace = generateRandomString();
			const executor = generateRandomString();
			const email = generateRandomString();
			const job = generateRandomString();
			const permissions = generateRandomString();

			Audits.logAction.mockRejectedValueOnce(generateRandomString());
			EventsManager.publish(events.INVITATION_ADDED, { teamspace, executor, email, job, permissions });
			await waitOnEvent;

			expect(Audits.logAction).toHaveBeenCalledTimes(1);
			expect(Audits.logAction).toHaveBeenCalledWith(teamspace, actions.INVITATION_ADDED, executor,
				{ email, job, permissions });
		});

		test(`Should trigger invitationRevoked if there is a ${events.INVITATION_REVOKED}`, async () => {
			const waitOnEvent = eventTriggeredPromise(events.INVITATION_REVOKED);
			const teamspace = generateRandomString();
			const executor = generateRandomString();
			const email = generateRandomString();
			const job = generateRandomString();
			const permissions = generateRandomString();
			EventsManager.publish(events.INVITATION_REVOKED, { teamspace, executor, email, job, permissions });
			await waitOnEvent;

			expect(Audits.logAction).toHaveBeenCalledTimes(1);
			expect(Audits.logAction).toHaveBeenCalledWith(teamspace, actions.INVITATION_REVOKED, executor,
				{ email, job, permissions });
		});

		test(`Should fail gracefully on error if there is an ${events.INVITATION_REVOKED} event`, async () => {
			const waitOnEvent = eventTriggeredPromise(events.INVITATION_REVOKED);
			const teamspace = generateRandomString();
			const executor = generateRandomString();
			const email = generateRandomString();
			const job = generateRandomString();
			const permissions = generateRandomString();

			Audits.logAction.mockRejectedValueOnce(generateRandomString());
			EventsManager.publish(events.INVITATION_REVOKED, { teamspace, executor, email, job, permissions });
			await waitOnEvent;

			expect(Audits.logAction).toHaveBeenCalledTimes(1);
			expect(Audits.logAction).toHaveBeenCalledWith(teamspace, actions.INVITATION_REVOKED, executor,
				{ email, job, permissions });
		});

		test(`Should trigger permissionsUpdated if there is a ${events.PERMISSIONS_UPDATED} and it is a teamspace permissions update`, async () => {
			const waitOnEvent = eventTriggeredPromise(events.PERMISSIONS_UPDATED);
			const teamspace = generateRandomString();
			const executor = generateRandomString();
			const initialPermissions = [];
			const updatedPermissions = [{ user: generateRandomString(), permissions: ['teamspace_admin'] }];

			EventsManager.publish(events.PERMISSIONS_UPDATED,
				{ teamspace, executor, isTsUpdate: true, initialPermissions, updatedPermissions });
			await waitOnEvent;

			expect(Audits.logAction).toHaveBeenCalledTimes(1);
			expect(Audits.logAction).toHaveBeenCalledWith(teamspace, actions.PERMISSIONS_UPDATED, executor,
				{ users: updatedPermissions.map((u) => u.user), permissions: [{ from: null, to: 'teamspace_admin' }] });
		});

		test(`Should trigger permissionsUpdated if there is a ${events.PERMISSIONS_UPDATED} and it is a project permissions update`, async () => {
			const waitOnEvent = eventTriggeredPromise(events.PERMISSIONS_UPDATED);
			const teamspace = generateRandomString();
			const executor = generateRandomString();
			const project = generateUUID();
			const user1 = generateRandomString();
			const user2 = generateRandomString();
			const initialPermissions = [{ project,
				permissions: [{ user: user1, permissions: [PROJECT_ADMIN] }] }];
			const updatedPermissions = [{ project,
				permissions: [{ user: user2, permissions: [PROJECT_ADMIN] }] }];

			EventsManager.publish(events.PERMISSIONS_UPDATED,
				{ teamspace, executor, initialPermissions, updatedPermissions });
			await waitOnEvent;

			expect(Audits.logAction).toHaveBeenCalledTimes(2);
			expect(Audits.logAction).toHaveBeenCalledWith(teamspace, actions.PERMISSIONS_UPDATED, executor,
				{ users: [user1], permissions: [{ from: PROJECT_ADMIN, to: null, project }] });
			expect(Audits.logAction).toHaveBeenCalledWith(teamspace, actions.PERMISSIONS_UPDATED, executor,
				{ users: [user2], permissions: [{ from: null, to: PROJECT_ADMIN, project }] });
		});

		test(`Should trigger permissionsUpdated if there is a ${events.PERMISSIONS_UPDATED} and it is a project and model permissions update`, async () => {
			const waitOnEvent = eventTriggeredPromise(events.PERMISSIONS_UPDATED);
			const teamspace = generateRandomString();
			const executor = generateRandomString();
			const project = generateUUID();
			const model1 = generateUUID();
			const model2 = generateUUID();
			const user1 = 'user1';
			const user2 = 'user2';
			const initialPermissions = [
				{
					project,
					permissions: [
						{ user: user1, permissions: [PROJECT_ADMIN] },
					],
				},
				{
					model: model1,
					permissions: [
						{ user: user1, permission: MODEL_VIEWER },
						{ user: user2, permission: MODEL_VIEWER },
					],
				},
				{
					model: model2,
					permissions: [
						{ user: user1, permission: MODEL_VIEWER },
						{ user: user2, permission: MODEL_COMMENTER },
					],
				},
			];

			const updatedPermissions = [
				{
					project,
					permissions: [
						{ user: user2, permissions: [PROJECT_ADMIN] },
					],
				},
				{
					model: model1,
					permissions: [
						{ user: user1, permission: MODEL_COLLABORATOR },
						{ user: user2, permission: MODEL_COLLABORATOR },
					],
				},
				{
					model: model2,
					permissions: [
						{ user: user1, permission: MODEL_VIEWER },
						{ user: user2, permission: MODEL_VIEWER },
					],
				},
			];

			ProjectSettings.getProjectList.mockResolvedValueOnce([{ _id: project, models: [model1, model2] }]);
			EventsManager.publish(events.PERMISSIONS_UPDATED,
				{ teamspace, executor, initialPermissions, updatedPermissions });
			await waitOnEvent;

			expect(Audits.logAction).toHaveBeenCalledTimes(3);
			expect(Audits.logAction).toHaveBeenCalledWith(teamspace, actions.PERMISSIONS_UPDATED, executor,
				{ users: [user1],
					permissions: [
						{ from: PROJECT_ADMIN, to: null, project },
					] });
			expect(Audits.logAction).toHaveBeenCalledWith(teamspace, actions.PERMISSIONS_UPDATED, executor,
				{ users: [user2],
					permissions: [
						{ from: null, to: PROJECT_ADMIN, project },
						{ from: MODEL_COMMENTER, to: MODEL_VIEWER, project, model: model2 },
					] });
			expect(Audits.logAction).toHaveBeenCalledWith(teamspace, actions.PERMISSIONS_UPDATED, executor,
				{ users: [user1, user2],
					permissions: [
						{ from: MODEL_VIEWER, to: MODEL_COLLABORATOR, project, model: model1 },
					] });
		});

		test(`Should fail gracefully on error if there is an ${events.PERMISSIONS_UPDATED} event`, async () => {
			const waitOnEvent = eventTriggeredPromise(events.PERMISSIONS_UPDATED);
			const teamspace = generateRandomString();
			const executor = generateRandomString();
			const initialPermissions = [];
			const updatedPermissions = [{ user: generateRandomString(), permissions: ['teamspace_admin'] }];

			Audits.logAction.mockRejectedValueOnce(generateRandomString());
			EventsManager.publish(events.PERMISSIONS_UPDATED,
				{ teamspace, executor, isTsUpdate: true, initialPermissions, updatedPermissions });
			await waitOnEvent;

			expect(Audits.logAction).toHaveBeenCalledTimes(1);
			expect(Audits.logAction).toHaveBeenCalledWith(teamspace, actions.PERMISSIONS_UPDATED, executor,
				{ users: updatedPermissions.map((u) => u.user), permissions: [{ from: null, to: 'teamspace_admin' }] });
		});
	});
};

describe('services/eventsListener/eventsListener', () => {
	EventsListener.init();
	testAuthEventsListener();
	testUserEventsListener();
	testAuditEventsListener();
});
