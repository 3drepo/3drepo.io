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

const { src } = require('../../helper/path');

jest.mock('../../../../src/v5/models/loginRecords');
const LoginRecords = require(`${src}/models/loginRecords`);

jest.mock('../../../../src/v5/models/notifications');
const Notifications = require(`${src}/models/notifications`);

jest.mock('../../../../src/v5/services/journaling');
const JournalingService = require(`${src}/services/journaling`);

jest.mock('../../../../src/v5/services/notifications');
const NotificationService = require(`${src}/services/notifications`);

jest.mock('../../../../src/v5/models/invitations');
const Invitations = require(`${src}/models/invitations`);

const Initialiser = require(`${src}/services/initialiser`);

const testInitialiseSystem = () => {
	describe('Initialise System', () => {
		test('All initialising functions should be called', async () => {
			await Initialiser.initialiseSystem();

			expect(LoginRecords.initialise).toHaveBeenCalledTimes(1);
			expect(Notifications.initialise).toHaveBeenCalledTimes(1);
			expect(Invitations.initialise).toHaveBeenCalledTimes(1);
			expect(JournalingService.init).toHaveBeenCalledTimes(1);
			expect(NotificationService.init).toHaveBeenCalledTimes(1);
		});
	});
};

describe('services/initialiser', () => {
	testInitialiseSystem();
});
