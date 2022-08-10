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

const Notifications = require(`${src}/models/notifications`);

const testRemoveAllUserNotifications = () => {
	describe('Remove all user notifications', () => {
		test('Should just drop the user collection within notifications', async () => {
			const fn = jest.spyOn(db, 'dropCollection').mockResolvedValue(undefined);

			const username = generateRandomString();
			await expect(Notifications.removeAllUserNotifications(username)).resolves.toBeUndefined();

			expect(fn).toHaveBeenCalledTimes(1);
			expect(fn).toHaveBeenCalledWith('notifications', username);
		});
	});
};

describe('models/notifications', () => {
	testRemoveAllUserNotifications();
});
