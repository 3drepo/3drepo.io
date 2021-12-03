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

const testRegenerateAuthSession = () => {
	describe('Regenerate authentication session', () => {
		test('Should regenerate a session with no error', async () => {
			const config = {
				cookie: {
					maxAge: 10,
				},
				cookie_domain: 'www.google.com',
			};
			const req = {
				headers: {
					'user-agent': 'some user agent',
					'x-socket-id': 123,
					referer: 'www.google.com',
				},
				session: {
					cookie: {
						domain: undefined,
					},
					regenerate: (callback) => { callback(); },
				},
			};

			const expectedSession = {
				cookie: {
					maxAge: 10,
					domain: 'www.google.com',
				},
				user: {
					referer: 'www.google.com',
					socketId: 123,
					webSession: false,
				},
				regenerate: (callback) => { callback(); },
			};
			const res = await Sessions.regenerateAuthSession(req, config, {});
			expect(res.cookie).toEqual(expectedSession.cookie);
			expect(res.user).toEqual(expectedSession.user);
		});

		test('Should regenerate a session with no error if there are no req.headers', async () => {
			const config = {
				cookie: { },
				cookie_domain: 'www.google.com',
			};
			const req = {
				headers: {},
				session: {
					cookie: {
						domain: 'www.google.com',
					},
					regenerate: (callback) => { callback(); },
				},
			};

			const expectedSession = {
				cookie: {
					domain: 'www.google.com',
				},
				user: {
					socketId: undefined,
					webSession: false,
				},
				regenerate: (callback) => { callback(); },
			};
			const res = await Sessions.regenerateAuthSession(req, config, {});
			expect(res.cookie).toEqual(expectedSession.cookie);
			expect(res.user).toEqual(expectedSession.user);
		});

		test('Should try regenerate a session and throw error', async () => {
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
					regenerate: (callback) => { callback(1); },
				},
			};

			await expect(Sessions.regenerateAuthSession(req, config, {})).rejects.toEqual(1);
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
	testRegenerateAuthSession();
	testGetSessionsByUsername();
	testRemoveSessions();
});
