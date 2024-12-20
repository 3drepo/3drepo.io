/**
 *  Copyright (C) 2022 3D Repo Ltd
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
const { src } = require('../../helper/path');
const { generateRandomString, generateRandomObject } = require('../../helper/services');

const db = require(`${src}/handler/db`);
const { INTERNAL_DB } = require(`${src}/handler/db.constants`);

const Notifications = require(`${src}/models/notifications`);
const { notificationTypes } = require(`${src}/models/notifications.constants`);

const NOTIFICATIONS_COLL = 'notifications';

const testRemoveAllUserNotifications = () => {
	describe('Remove all user notifications', () => {
		test('Should delete user notifications', async () => {
			const fn = jest.spyOn(db, 'deleteMany').mockResolvedValue(undefined);

			const user = generateRandomString();
			await expect(Notifications.removeAllUserNotifications(user)).resolves.toBeUndefined();

			expect(fn).toHaveBeenCalledTimes(1);
			expect(fn).toHaveBeenCalledWith(INTERNAL_DB, NOTIFICATIONS_COLL, { user });
		});
	});
};

const testInitialise = () => {
	describe('Initialise', () => {
		test('should ensure indices exist', async () => {
			const fn = jest.spyOn(db, 'createIndex').mockResolvedValueOnce(undefined);
			await Notifications.initialise();
			expect(fn).toHaveBeenCalledTimes(1);
			expect(fn).toHaveBeenCalledWith(INTERNAL_DB, NOTIFICATIONS_COLL,
				{ user: 1, timestamp: -1 }, { runInBackground: true });
		});

		test('should not cause issues if this operation failed', async () => {
			const err = { message: generateRandomString() };
			const fn = jest.spyOn(db, 'createIndex').mockRejectedValueOnce(err);
			await Notifications.initialise();
			expect(fn).toHaveBeenCalledTimes(1);
			expect(fn).toHaveBeenCalledWith(INTERNAL_DB, NOTIFICATIONS_COLL,
				{ user: 1, timestamp: -1 }, { runInBackground: true });
		});
	});
};

const testInsertTicketAssignedNotifications = () => {
	describe('Ticket assigned notifications', () => {
		test('Should not insert any records if there is no notifications', async () => {
			const fn = jest.spyOn(db, 'insertMany');
			await Notifications.insertTicketAssignedNotifications(generateRandomString(),
				generateRandomString(),
				generateRandomString(),
				[],
			);

			expect(fn).not.toHaveBeenCalled();
		});

		test('Multiple userss should produce multiple records', async () => {
			const teamspace = generateRandomString();
			const project = generateRandomString();
			const model = generateRandomString();

			const fn = jest.spyOn(db, 'insertMany').mockResolvedValueOnce();
			const input = [
				{
					users: times(10, () => generateRandomString()),
					ticket: generateRandomString(),
					assignedBy: generateRandomString(),
				},
			];
			await Notifications.insertTicketAssignedNotifications(
				teamspace,
				project,
				model,
				input,
			);

			const expectedRecords = input[0].users.map((user) => ({
				_id: expect.anything(),
				type: notificationTypes.TICKET_ASSIGNED,
				timestamp: expect.any(Date),
				user,
				data: {
					teamspace,
					project,
					model,
					ticket: input[0].ticket,
					assignedBy: input[0].assignedBy,
				},
			}));

			expect(fn).toHaveBeenCalledTimes(1);
			expect(fn).toHaveBeenCalledWith(INTERNAL_DB, NOTIFICATIONS_COLL, expectedRecords);
		});

		test('Multiple notifications should work, missing data rows should be ignored', async () => {
			const teamspace = generateRandomString();
			const project = generateRandomString();
			const model = generateRandomString();

			const fn = jest.spyOn(db, 'insertMany').mockResolvedValueOnce();
			const input = [
				{
					users: times(10, () => generateRandomString()),
					ticket: generateRandomString(),
					assignedBy: generateRandomString(),
				},
				{
					ticket: generateRandomString(),
					assignedBy: generateRandomString(),
				},
				{
					users: times(10, () => generateRandomString()),
					ticket: generateRandomString(),
				},
				{
					users: times(10, () => generateRandomString()),
					ticket: generateRandomString(),
					assignedBy: generateRandomString(),
				},

			];
			await Notifications.insertTicketAssignedNotifications(
				teamspace,
				project,
				model,
				input,
			);

			const expectedRecords = [input[0], input[3]].flatMap(({ users, ticket, assignedBy }) => users.map(
				(user) => ({
					_id: expect.anything(),
					type: notificationTypes.TICKET_ASSIGNED,
					timestamp: expect.any(Date),
					user,
					data: {
						teamspace,
						project,
						model,
						ticket,
						assignedBy,
					},
				})));

			expect(fn).toHaveBeenCalledTimes(1);
			expect(fn).toHaveBeenCalledWith(INTERNAL_DB, NOTIFICATIONS_COLL, expectedRecords);
		});
	});
};

const testInsertTicketUpdatedNotifications = () => {
	describe('Ticket updated notifications', () => {
		test('Should not insert any records if there is no notifications', async () => {
			const fn = jest.spyOn(db, 'insertMany');
			await Notifications.insertTicketUpdatedNotifications(generateRandomString(),
				generateRandomString(),
				generateRandomString(),
				[],
			);

			expect(fn).not.toHaveBeenCalled();
		});

		test('Multiple userss should produce multiple records', async () => {
			const teamspace = generateRandomString();
			const project = generateRandomString();
			const model = generateRandomString();

			const fn = jest.spyOn(db, 'insertMany').mockResolvedValueOnce();
			const input = [
				{
					users: times(10, () => generateRandomString()),
					ticket: generateRandomString(),
					author: generateRandomString(),
					changes: generateRandomObject(),
				},
			];
			await Notifications.insertTicketUpdatedNotifications(
				teamspace,
				project,
				model,
				input,
			);

			const expectedRecords = input[0].users.map((user) => ({
				_id: expect.anything(),
				type: notificationTypes.TICKET_UPDATED,
				timestamp: expect.any(Date),
				user,
				data: {
					teamspace,
					project,
					model,
					ticket: input[0].ticket,
					author: input[0].author,
					changes: input[0].changes,
				},
			}));

			expect(fn).toHaveBeenCalledTimes(1);
			expect(fn).toHaveBeenCalledWith(INTERNAL_DB, NOTIFICATIONS_COLL, expectedRecords);
		});

		test('Multiple notifications should work, missing data rows should be ignored', async () => {
			const teamspace = generateRandomString();
			const project = generateRandomString();
			const model = generateRandomString();

			const fn = jest.spyOn(db, 'insertMany').mockResolvedValueOnce();
			const input = [
				{
					users: times(10, () => generateRandomString()),
					ticket: generateRandomString(),
					author: generateRandomString(),
					changes: generateRandomObject(),
				},
				{
					ticket: generateRandomString(),
					author: generateRandomString(),
					changes: generateRandomObject(),
				},
				{
					users: times(10, () => generateRandomString()),
					author: generateRandomString(),
					changes: generateRandomObject(),
				},
				{
					users: times(10, () => generateRandomString()),
					ticket: generateRandomString(),
					author: generateRandomString(),
					changes: generateRandomObject(),
				},

			];
			await Notifications.insertTicketUpdatedNotifications(
				teamspace,
				project,
				model,
				input,
			);

			const expectedRecords = [input[0], input[3]].flatMap(({
				users, ticket, author, changes }) => users.map(
				(user) => ({
					_id: expect.anything(),
					type: notificationTypes.TICKET_UPDATED,
					timestamp: expect.any(Date),
					user,
					data: {
						teamspace,
						project,
						model,
						ticket,
						author,
						changes,
					},
				})));

			expect(fn).toHaveBeenCalledTimes(1);
			expect(fn).toHaveBeenCalledWith(INTERNAL_DB, NOTIFICATIONS_COLL, expectedRecords);
		});
	});
};

const testInsertTicketDeletedNotifications = () => {
	describe('Ticket deleted notifications', () => {
		test('Should not insert any records if there is no notifications', async () => {
			const fn = jest.spyOn(db, 'insertMany');
			await Notifications.insertTicketClosedNotifications(generateRandomString(),
				generateRandomString(),
				generateRandomString(),
				[],
			);

			expect(fn).not.toHaveBeenCalled();
		});

		test('Multiple userss should produce multiple records', async () => {
			const teamspace = generateRandomString();
			const project = generateRandomString();
			const model = generateRandomString();

			const fn = jest.spyOn(db, 'insertMany').mockResolvedValueOnce();
			const input = [
				{
					users: times(10, () => generateRandomString()),
					ticket: generateRandomString(),
					author: generateRandomString(),
					status: generateRandomString(),
				},
			];
			await Notifications.insertTicketClosedNotifications(
				teamspace,
				project,
				model,
				input,
			);

			const expectedRecords = input[0].users.map((user) => ({
				_id: expect.anything(),
				type: notificationTypes.TICKET_CLOSED,
				timestamp: expect.any(Date),
				user,
				data: {
					teamspace,
					project,
					model,
					ticket: input[0].ticket,
					author: input[0].author,
					status: input[0].status,
				},
			}));

			expect(fn).toHaveBeenCalledTimes(1);
			expect(fn).toHaveBeenCalledWith(INTERNAL_DB, NOTIFICATIONS_COLL, expectedRecords);
		});

		test('Multiple notifications should work, missing data rows should be ignored', async () => {
			const teamspace = generateRandomString();
			const project = generateRandomString();
			const model = generateRandomString();

			const fn = jest.spyOn(db, 'insertMany').mockResolvedValueOnce();
			const input = [
				{
					users: times(10, () => generateRandomString()),
					ticket: generateRandomString(),
					author: generateRandomString(),
					status: generateRandomString(),
				},
				{
					ticket: generateRandomString(),
					author: generateRandomString(),
					status: generateRandomString(),
				},
				{
					users: times(10, () => generateRandomString()),
					author: generateRandomString(),
					status: generateRandomString(),
				},
				{
					users: times(10, () => generateRandomString()),
					ticket: generateRandomString(),
					author: generateRandomString(),
					status: generateRandomString(),
				},

			];
			await Notifications.insertTicketClosedNotifications(
				teamspace,
				project,
				model,
				input,
			);

			const expectedRecords = [input[0], input[3]].flatMap(({
				users, ticket, author, status }) => users.map(
				(user) => ({
					_id: expect.anything(),
					type: notificationTypes.TICKET_CLOSED,
					timestamp: expect.any(Date),
					user,
					data: {
						teamspace,
						project,
						model,
						ticket,
						author,
						status,
					},
				})));

			expect(fn).toHaveBeenCalledTimes(1);
			expect(fn).toHaveBeenCalledWith(INTERNAL_DB, NOTIFICATIONS_COLL, expectedRecords);
		});
	});
};

describe('models/notifications', () => {
	testRemoveAllUserNotifications();
	testInsertTicketAssignedNotifications();
	testInsertTicketUpdatedNotifications();
	testInsertTicketDeletedNotifications();
	testInitialise();
});
