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
	});
};

const testAddTicketAssignedNotifications = () => {
	describe('Ticket assigned notifications', () => {
		test('Should not insert any records if there were no tickets', async () => {
			const fn = jest.spyOn(db, 'insertMany');
			await Notifications.addTicketAssignedNotifications(generateRandomString(),
				generateRandomString(),
				generateRandomString(),
				[],
			);

			expect(fn).not.toHaveBeenCalled();
		});

		test('Multiple toNotifys should produce multiple records', async () => {
			const teamspace = generateRandomString();
			const project = generateRandomString();
			const model = generateRandomString();

			const fn = jest.spyOn(db, 'insertMany').mockResolvedValueOnce();
			const input = [
				{
					toNotify: times(10, () => generateRandomString()),
					ticket: generateRandomString(),
					assignedBy: generateRandomString(),
				},
			];
			await Notifications.addTicketAssignedNotifications(
				teamspace,
				project,
				model,
				input,
			);

			const expectedRecords = input[0].toNotify.map((user) => ({
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
					toNotify: times(10, () => generateRandomString()),
					ticket: generateRandomString(),
					assignedBy: generateRandomString(),
				},
				{
					ticket: generateRandomString(),
					assignedBy: generateRandomString(),
				},
				{
					toNotify: times(10, () => generateRandomString()),
					ticket: generateRandomString(),
				},
				{
					toNotify: times(10, () => generateRandomString()),
					ticket: generateRandomString(),
					assignedBy: generateRandomString(),
				},

			];
			await Notifications.addTicketAssignedNotifications(
				teamspace,
				project,
				model,
				input,
			);

			const expectedRecords = [input[0], input[3]].flatMap(({ toNotify, ticket, assignedBy }) => toNotify.map(
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

const testUpdateTicketNotifications = () => {
	describe('Ticket updated notifications', () => {
		test('Should not insert any records if there were no tickets', async () => {
			const fn = jest.spyOn(db, 'insertMany');
			await Notifications.updateTicketNotifications(generateRandomString(),
				generateRandomString(),
				generateRandomString(),
				[],
			);

			expect(fn).not.toHaveBeenCalled();
		});

		test('Multiple toNotifys should produce multiple records', async () => {
			const teamspace = generateRandomString();
			const project = generateRandomString();
			const model = generateRandomString();

			const fn = jest.spyOn(db, 'insertMany').mockResolvedValueOnce();
			const input = [
				{
					toNotify: times(10, () => generateRandomString()),
					ticket: generateRandomString(),
					author: generateRandomString(),
					changes: generateRandomObject(),
				},
			];
			await Notifications.updateTicketNotifications(
				teamspace,
				project,
				model,
				input,
			);

			const expectedRecords = input[0].toNotify.map((user) => ({
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
					toNotify: times(10, () => generateRandomString()),
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
					toNotify: times(10, () => generateRandomString()),
					author: generateRandomString(),
					changes: generateRandomObject(),
				},
				{
					toNotify: times(10, () => generateRandomString()),
					ticket: generateRandomString(),
					author: generateRandomString(),
					changes: generateRandomObject(),
				},

			];
			await Notifications.updateTicketNotifications(
				teamspace,
				project,
				model,
				input,
			);

			const expectedRecords = [input[0], input[3]].flatMap(({
				toNotify, ticket, author, changes }) => toNotify.map(
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

describe('models/notifications', () => {
	testRemoveAllUserNotifications();
	testAddTicketAssignedNotifications();
	testUpdateTicketNotifications();
	testInitialise();
});
