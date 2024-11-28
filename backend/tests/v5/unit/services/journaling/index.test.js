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

const { MODEL_VIEWER, PROJECT_ADMIN, MODEL_COMMENTER } = require(`${src}/utils/permissions/permissions.constants`);
const { generateRandomString, generateUUID } = require('../../../helper/services');

const { generateUUIDString } = require(`${src}/utils/helper/uuids`);

jest.mock('../../../../../src/v5/models/teamspaces.audits');
const Audits = require(`${src}/models/teamspaces.audits`);

// Need to mock these 2 to ensure we are not trying to create a real session configuration
jest.mock('express-session', () => () => { });
jest.mock('../../../../../src/v5/handler/db', () => ({
	...jest.requireActual('../../../../../src/v5/handler/db'),
	getSessionStore: () => { },
}));

jest.mock('../../../../../src/v5/processors/teamspaces/invitations');
const EventsManager = require(`${src}/services/eventsManager/eventsManager`);
const { events } = require(`${src}/services/eventsManager/eventsManager.constants`);
const Journaling = require(`${src}/services/journaling`);

const eventTriggeredPromise = (event) => new Promise(
	(resolve) => EventsManager.subscribe(event, () => setTimeout(resolve, 10)),
);

const testAuditEvents = () => {
	describe('Audit Events', () => {
		test(`Should trigger userAdded if there is a ${events.USER_ADDED} event`, async () => {
			const waitOnEvent = eventTriggeredPromise(events.USER_ADDED);
			const teamspace = generateRandomString();
			const executor = generateRandomString();
			const user = generateRandomString();
			EventsManager.publish(events.USER_ADDED, { teamspace, executor, user });
			await waitOnEvent;

			expect(Audits.logSeatAllocated).toHaveBeenCalledTimes(1);
			expect(Audits.logSeatAllocated).toHaveBeenCalledWith(teamspace, executor, user);
		});

		test(`Should fail gracefully on error if there is a ${events.USER_ADDED} event`, async () => {
			const waitOnEvent = eventTriggeredPromise(events.USER_ADDED);
			const teamspace = generateRandomString();
			const executor = generateRandomString();
			const user = generateRandomString();

			Audits.logSeatAllocated.mockRejectedValueOnce(generateRandomString());
			EventsManager.publish(events.USER_ADDED, { teamspace, executor, user });

			await waitOnEvent;
			expect(Audits.logSeatAllocated).toHaveBeenCalledTimes(1);
			expect(Audits.logSeatAllocated).toHaveBeenCalledWith(teamspace, executor, user);
		});

		test(`Should trigger userRemoved if there is a ${events.USER_REMOVED} event`, async () => {
			const waitOnEvent = eventTriggeredPromise(events.USER_REMOVED);
			const teamspace = generateRandomString();
			const executor = generateRandomString();
			const user = generateRandomString();
			EventsManager.publish(events.USER_REMOVED, { teamspace, executor, user });
			await waitOnEvent;

			expect(Audits.logSeatDeallocated).toHaveBeenCalledTimes(1);
			expect(Audits.logSeatDeallocated).toHaveBeenCalledWith(teamspace, executor, user);
		});

		test(`Should fail gracefully on error if there is a ${events.USER_REMOVED} event`, async () => {
			const waitOnEvent = eventTriggeredPromise(events.USER_REMOVED);
			const teamspace = generateRandomString();
			const executor = generateRandomString();
			const user = generateRandomString();

			Audits.logSeatDeallocated.mockRejectedValueOnce(generateRandomString());
			EventsManager.publish(events.USER_REMOVED, { teamspace, executor, user });

			await waitOnEvent;
			expect(Audits.logSeatDeallocated).toHaveBeenCalledTimes(1);
			expect(Audits.logSeatDeallocated).toHaveBeenCalledWith(teamspace, executor, user);
		});

		test(`Should trigger invitationAdded if there is an ${events.INVITATION_ADDED} event`, async () => {
			const waitOnEvent = eventTriggeredPromise(events.INVITATION_ADDED);
			const teamspace = generateRandomString();
			const executor = generateRandomString();
			const email = generateRandomString();
			const job = generateRandomString();
			const permissions = generateRandomString();
			EventsManager.publish(events.INVITATION_ADDED, { teamspace, executor, email, job, permissions });
			await waitOnEvent;

			expect(Audits.logUserInvited).toHaveBeenCalledTimes(1);
			expect(Audits.logUserInvited).toHaveBeenCalledWith(teamspace, executor,
				email, job, permissions);
		});

		test(`Should fail gracefully on error if there is an ${events.INVITATION_ADDED} event`, async () => {
			const waitOnEvent = eventTriggeredPromise(events.INVITATION_ADDED);
			const teamspace = generateRandomString();
			const executor = generateRandomString();
			const email = generateRandomString();
			const job = generateRandomString();
			const permissions = generateRandomString();

			Audits.logUserInvited.mockRejectedValueOnce(generateRandomString());
			EventsManager.publish(events.INVITATION_ADDED, { teamspace, executor, email, job, permissions });
			await waitOnEvent;

			expect(Audits.logUserInvited).toHaveBeenCalledTimes(1);
			expect(Audits.logUserInvited).toHaveBeenCalledWith(teamspace, executor,
				email, job, permissions);
		});

		test(`Should trigger invitationRevoked if there is an ${events.INVITATION_REVOKED} event`, async () => {
			const waitOnEvent = eventTriggeredPromise(events.INVITATION_REVOKED);
			const teamspace = generateRandomString();
			const executor = generateRandomString();
			const email = generateRandomString();
			const job = generateRandomString();
			const permissions = generateRandomString();
			EventsManager.publish(events.INVITATION_REVOKED, { teamspace, executor, email, job, permissions });
			await waitOnEvent;

			expect(Audits.logUserUninvited).toHaveBeenCalledTimes(1);
			expect(Audits.logUserUninvited).toHaveBeenCalledWith(teamspace, executor,
				email, job, permissions);
		});

		test(`Should fail gracefully on error if there is an ${events.INVITATION_REVOKED} event`, async () => {
			const waitOnEvent = eventTriggeredPromise(events.INVITATION_REVOKED);
			const teamspace = generateRandomString();
			const executor = generateRandomString();
			const email = generateRandomString();
			const job = generateRandomString();
			const permissions = generateRandomString();

			Audits.logUserUninvited.mockRejectedValueOnce(generateRandomString());
			EventsManager.publish(events.INVITATION_REVOKED, { teamspace, executor, email, job, permissions });
			await waitOnEvent;

			expect(Audits.logUserUninvited).toHaveBeenCalledTimes(1);
			expect(Audits.logUserUninvited).toHaveBeenCalledWith(teamspace, executor,
				email, job, permissions);
		});

		test(`Should trigger teamspacePermissionsUpdated if there is a ${events.TEAMSPACE_PERMISSIONS_UPDATED} event and it is a teamspace permissions update`, async () => {
			const waitOnEvent = eventTriggeredPromise(events.TEAMSPACE_PERMISSIONS_UPDATED);
			const teamspace = generateRandomString();
			const executor = generateRandomString();
			const users = [generateRandomString()];
			const from = null;
			const to = ['teamspace_admin'];

			EventsManager.publish(events.TEAMSPACE_PERMISSIONS_UPDATED, { teamspace, executor, users, from, to });
			await waitOnEvent;

			expect(Audits.logPermissionsUpdated).toHaveBeenCalledTimes(1);
			expect(Audits.logPermissionsUpdated).toHaveBeenCalledWith(teamspace, executor, users, [{ from, to }]);
		});

		test(`Should fail gracefully on error if there is a ${events.TEAMSPACE_PERMISSIONS_UPDATED} event`, async () => {
			const waitOnEvent = eventTriggeredPromise(events.TEAMSPACE_PERMISSIONS_UPDATED);
			const teamspace = generateRandomString();
			const executor = generateRandomString();
			const users = [times(5, () => generateRandomString())];
			const from = null;
			const to = ['teamspace_admin'];

			Audits.logPermissionsUpdated.mockRejectedValueOnce(generateRandomString());
			EventsManager.publish(events.TEAMSPACE_PERMISSIONS_UPDATED, { teamspace, executor, users, from, to });
			await waitOnEvent;

			expect(Audits.logPermissionsUpdated).toHaveBeenCalledTimes(1);
			expect(Audits.logPermissionsUpdated).toHaveBeenCalledWith(teamspace,
				executor, users, [{ from, to }]);
		});

		test(`Should trigger projectPermissionsUpdated if there is a ${events.PROJECT_PERMISSIONS_UPDATED} event and it is a project permissions update`, async () => {
			const waitOnEvent = eventTriggeredPromise(events.PROJECT_PERMISSIONS_UPDATED);
			const teamspace = generateRandomString();
			const executor = generateRandomString();
			const project = generateUUID();
			const users = [times(5, () => generateRandomString())];
			const from = [PROJECT_ADMIN];
			const to = null;

			EventsManager.publish(events.PROJECT_PERMISSIONS_UPDATED,
				{ teamspace, project, users, executor, from, to });
			await waitOnEvent;

			expect(Audits.logPermissionsUpdated).toHaveBeenCalledTimes(1);
			expect(Audits.logPermissionsUpdated).toHaveBeenCalledWith(teamspace, executor,
				users, [{ from, to, project }]);
		});

		test(`Should fail gracefully on error if there is a ${events.PROJECT_PERMISSIONS_UPDATED} event`, async () => {
			const waitOnEvent = eventTriggeredPromise(events.PROJECT_PERMISSIONS_UPDATED);
			const teamspace = generateRandomString();
			const executor = generateRandomString();
			const project = generateUUID();
			const users = [times(5, () => generateRandomString())];
			const from = null;
			const to = [PROJECT_ADMIN];

			Audits.logPermissionsUpdated.mockRejectedValueOnce(generateRandomString());
			EventsManager.publish(events.PROJECT_PERMISSIONS_UPDATED,
				{ teamspace, executor, project, users, from, to });
			await waitOnEvent;

			expect(Audits.logPermissionsUpdated).toHaveBeenCalledTimes(1);
			expect(Audits.logPermissionsUpdated).toHaveBeenCalledWith(teamspace,
				executor, users, [{ project, from, to }]);
		});

		test(`Should trigger modelPermissionsUpdated if there is a ${events.MODEL_PERMISSIONS_UPDATED} event and it is a model permissions update`, async () => {
			const waitOnEvent = eventTriggeredPromise(events.MODEL_PERMISSIONS_UPDATED);
			const teamspace = generateRandomString();
			const executor = generateRandomString();
			const project = generateUUID();
			const users = [times(5, () => generateRandomString())];
			const model1 = generateUUIDString();
			const model2 = generateUUIDString();

			const permissions = [{
				project,
				model: model1,
				from: MODEL_VIEWER,
				to: null,
			}, {
				project,
				model: model2,
				from: MODEL_COMMENTER,
				to: MODEL_VIEWER,
			}];

			EventsManager.publish(events.MODEL_PERMISSIONS_UPDATED,
				{ teamspace, executor, project, users, permissions });
			await waitOnEvent;

			expect(Audits.logPermissionsUpdated).toHaveBeenCalledTimes(1);
			expect(Audits.logPermissionsUpdated).toHaveBeenCalledWith(teamspace,
				executor, users, permissions);
		});

		test(`Should fail gracefully on error if there is a ${events.MODEL_PERMISSIONS_UPDATED} event`, async () => {
			const waitOnEvent = eventTriggeredPromise(events.MODEL_PERMISSIONS_UPDATED);
			const teamspace = generateRandomString();
			const executor = generateRandomString();
			const project = generateUUID();
			const model = generateUUIDString();
			const from = null;
			const to = [MODEL_VIEWER];
			const users = [times(5, () => generateRandomString())];
			const permissions = [{ project, model, from, to }];

			Audits.logPermissionsUpdated.mockRejectedValueOnce(generateRandomString());
			EventsManager.publish(events.MODEL_PERMISSIONS_UPDATED,
				{ teamspace, executor, project, users, permissions });
			await waitOnEvent;

			expect(Audits.logPermissionsUpdated).toHaveBeenCalledTimes(1);
			expect(Audits.logPermissionsUpdated).toHaveBeenCalledWith(teamspace,
				executor, users, [{ project, model, from, to }]);
		});
	});
};

describe('services/journaling', () => {
	Journaling.init();
	testAuditEvents();
});
