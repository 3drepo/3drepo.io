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

const { src } = require('../../../helper/path');
const { determineTestGroup } = require('../../../helper/services');

const NotificationService = require(`${src}/services/notifications`);

jest.mock('../../../../../src/v5/services/notifications/tickets');
const TicketsModule = require(`${src}/services/notifications/tickets`);

jest.mock('../../../../../src/v5/models/notifications');
const NotificationsModel = require(`${src}/models/notifications`);

const testInit = () => {
	describe('On initialisation', () => {
		test('Should subscribe to relevant events on init and ensure indices exist', async () => {
			await NotificationService.init();
			expect(TicketsModule.subscribe).toHaveBeenCalledTimes(1);
			expect(NotificationsModel.ensureIndicesExist).toHaveBeenCalledTimes(1);
		});
	});
};

describe(determineTestGroup(__filename), () => {
	testInit();
});
