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

const { src } = require('../../helper/path');
const { generateRandomString } = require('../../helper/services');

const db = require(`${src}/handler/db`);
const { INTERNAL_DB } = require(`${src}/handler/db.constants`);

const Notifications = require(`${src}/models/notifications`);

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

describe('models/notifications', () => {
	testRemoveAllUserNotifications();
	testInitialise();
});
