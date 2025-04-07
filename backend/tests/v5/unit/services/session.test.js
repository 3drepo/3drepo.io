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

// Need to mock these 2 to ensure we are not trying to create a real session configuration
jest.mock('express-session', () => () => {});
jest.mock('../../../../src/v5/handler/db');
const db = require(`${src}/handler/db`);
const Sessions = require(`${src}/services/sessions`);
jest.mock('../../../../src/v5/services/eventsManager/eventsManager');
const { events } = require(`${src}/services/eventsManager/eventsManager.constants`);
const EventsManager = require(`${src}/services/eventsManager/eventsManager`);

const testGetSessions = () => {
	describe('Get sessions by username', () => {
		test('Should return sessions by username', async () => {
			jest.spyOn(db, 'find').mockResolvedValueOnce([{ _id: '1' }, { _id: '2' }]);
			await Sessions.getSessions('username1');
		});
	});
};

const testRemoveOldSessions = () => {
	describe('Remove sessions', () => {
		test('Should remove the sessions that have the provided ids', async () => {
			jest.spyOn(db, 'find').mockResolvedValueOnce([{ _id: '1' }, { _id: '2' }]);
			jest.spyOn(db, 'deleteMany').mockResolvedValue(undefined);
			await Sessions.removeOldSessions(['1', '2'], 'a', 'ref');
			expect(EventsManager.publish).toHaveBeenCalledTimes(1);
			expect(EventsManager.publish).toHaveBeenCalledWith(events.SESSIONS_REMOVED, { ids: ['1', '2'] });
		});

		test('Should process correctly if there are no old sessions', async () => {
			jest.spyOn(db, 'find').mockResolvedValueOnce([]);
			await Sessions.removeOldSessions(['1', '2'], 'a', 'ref');
			expect(EventsManager.publish).not.toHaveBeenCalled();
		});

		test('Should not remove the sessions if there is no referrer', async () => {
			await Sessions.removeOldSessions(['1', '2'], 'a');
			expect(EventsManager.publish).not.toHaveBeenCalled();
		});
	});
};

describe('services/sessions', () => {
	testGetSessions();
	testRemoveOldSessions();
});
