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
const { templates } = require(`${src}/utils/responseCodes`);
const db = require(`${src}/handler/db`);

const testRegenerateAuthSession = () => {
	describe('Regenerate authentication session', () => {
		test('Should regenerate a session with no error', async () => {
			const config = {
				cookie: {
					maxAge: 10,
				},
			};
			const req = {
				headers: {
					'user-agent': 'some user agent',
				},
				session: {
					cookie: {
						domain: 'www.google.com',
					},
					regenerate: () => {},
				},
			};

			await Sessions.regenerateAuthSession(req, config, {});
		});
	});
};

const testGetSessionsByUsername = () => {
	describe('Get sessions by username', () => {
		test('Should return sessions by username', async () => {
			jest.spyOn(db, 'find').mockResolvedValue([{ id: '1' }, { id: '2' }]);
			await Sessions.getSessionsByUsername('username1');
		});
	});
};

const testRemoveSessions = () => {
	describe('Remove sessions', () => {
		test('Should remove the sessions that have the provided ids', async () => {
			jest.spyOn(db, 'deleteMany').mockResolvedValue(undefined);
			await Sessions.removeSessions(['1', '2']);
		});
	});
};

describe('services/sessions', () => {
	// testRegenerateAuthSession();
	testGetSessionsByUsername();
	testRemoveSessions();
});
