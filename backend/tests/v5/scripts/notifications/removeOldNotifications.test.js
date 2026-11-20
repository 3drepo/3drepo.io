/**
 *  Copyright (C) 2026 3D Repo Ltd
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

const { determineTestGroup } = require('../../helper/utils');
const {
	db: { reset: resetDB },
	generateRandomString,
} = require('../../helper/services');

const { times } = require('lodash');

const { src, utilScripts } = require('../../helper/path');

const DBHandler = require(`${src}/handler/db`);
const { INTERNAL_DB } = require(`${src}/handler/db.constants`);
const { generateUUID } = require(`${src}/utils/helper/uuids`);

const RemoveOldNotifications = require(`${utilScripts}/notifications/removeOldNotifications`);

const NOTIFICATIONS_COL = 'notifications';

const generateNotification = (daysAgo) => {
	const date = new Date();
	date.setDate(date.getDate() - daysAgo);

	return {
		_id: generateUUID(),
		user: generateRandomString(),
		type: 'TICKET_UPDATED',
		timestamp: date,
		data: { teamspace: generateRandomString() },
	};
};

const setupData = async () => {
	const oldNotifications = [
		...times(5, () => generateNotification(60)),
		...times(5, () => generateNotification(400)),
	];

	const recentNotifications = [
		generateNotification(1),
		generateNotification(10),
		generateNotification(15),
		generateNotification(20),
		generateNotification(25),
	];

	await DBHandler.insertMany(INTERNAL_DB, NOTIFICATIONS_COL, [...oldNotifications, ...recentNotifications]);
	return [oldNotifications, recentNotifications];
};

const runTest = () => {
	describe('Remove old notifications', () => {
		let oldNotifications;
		let recentNotifications;

		beforeAll(async () => {
			await resetDB();
			[oldNotifications, recentNotifications] = await setupData();
		});

		test('should remove notifications older than a month', async () => {
			await RemoveOldNotifications.run();

			const remaining = await DBHandler.find(INTERNAL_DB, NOTIFICATIONS_COL, {}, { _id: 1 });
			const remainingIds = remaining.map(({ _id }) => _id.toString());

			oldNotifications.forEach(({ _id }) => {
				expect(remainingIds).not.toContain(_id.toString());
			});

			recentNotifications.forEach(({ _id }) => {
				expect(remainingIds).toContain(_id.toString());
			});
		});

		test('should not remove any notifications if all of them are recent', async () => {
			await expect(RemoveOldNotifications.run()).resolves.not.toThrow();

			const remaining = await DBHandler.find(INTERNAL_DB, NOTIFICATIONS_COL, {}, { _id: 1 });
			expect(remaining.length).toBe(recentNotifications.length);
		});
	});
};

describe(determineTestGroup(__filename), () => {
	runTest();
	afterAll(DBHandler.disconnect);
});
