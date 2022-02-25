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

const Sessions = require(`${src}/services/sessions`);
const db = require(`${src}/handler/db`);

const testGetSessions = () => {
	describe('Get sessions by username', () => {
		test('Should return sessions by username', async () => {
			jest.spyOn(db, 'find').mockResolvedValue([{ id: '1' }, { id: '2' }]);
			await Sessions.getSessions('username1');
		});
	});
};

const testRemoveOldSessions = () => {
	describe('Remove sessions', () => {
		test('Should remove the sessions that have the provided ids', async () => {
			jest.spyOn(db, 'deleteMany').mockResolvedValue(undefined);
			await Sessions.removeOldSessions(['1', '2'], 'a', 'ref');
		});

		test('Should not remove the sessions if there is no referrer', async () => {
			jest.spyOn(db, 'deleteMany').mockResolvedValue(undefined);
			await Sessions.removeOldSessions(['1', '2'], 'a');
		});
	});
};

describe('services/sessions', () => {
	testGetSessions();
	testRemoveOldSessions();
});
