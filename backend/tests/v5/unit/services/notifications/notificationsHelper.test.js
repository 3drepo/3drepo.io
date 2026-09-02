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

const { determineTestGroup } = require('../../../helper/utils');
const { generateRandomString } = require('../../../helper/services');

const { src } = require('../../../helper/path');
const { times } = require('lodash');

const NotificationsHelper = require(`${src}/services/notifications/notificationsHelper`);

const testGetUsernamesToNotify = () => {
	describe('Get usernames to notify', () => {
		const userName = generateRandomString();
		const jobList = times(5, () => ({
			_id: generateRandomString(),
			users: [userName, generateRandomString()],
		}));
		const toNotify = [jobList[0]._id, userName, generateRandomString()];

		test('Should return the common elements of job users and notify array', async () => {
			const res = await NotificationsHelper.getUsernamesToNotify(jobList, toNotify);
			expect(res).toEqual([...jobList[0].users, toNotify[2]]);
		});
	});
};

describe(determineTestGroup(__filename), () => {
	testGetUsernamesToNotify();
});
