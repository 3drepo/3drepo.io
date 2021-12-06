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

const { templates } = require('../../../../src/v5/utils/responseCodes');
const { src } = require('../../helper/path');

const Users = require(`${src}/processors/users`);

jest.mock('../../../../src/v5/services/eventsManager/eventsManager');
const EventsManager = require(`${src}/services/eventsManager/eventsManager`);
const { events } = require(`${src}/services/eventsManager/eventsManager.constants`);

jest.mock('../../../../src/v5/services/sessions');
const SessionService = require(`${src}/services/sessions`);

jest.mock('../../../../src/v5/models/users');
const UsersModel = require(`${src}/models/users`);

const oldSessions = ['123', '456'];

SessionService.regenerateAuthSession.mockImplementation(() => {});
SessionService.getSessionsByUsername.mockImplementation(() => oldSessions);

const publishFn = EventsManager.publish.mockImplementation(() => { });
const username = 'username1';
const password = '123';

const req = {
	ips: ['1.2.3.4'],
	ip: '1.2.3.4',
	headers: { referer: 'www.google.com', 'user-agent': 'some user agent' },
	sessionID: '12345',
	session: {
		user: {
			webSession: true,
		},
	},
};

const testLogin = () => {
	describe('Login', () => {
		UsersModel.canLogIn.mockResolvedValue(undefined);
		UsersModel.getUserByUsername.mockImplementation(() => ({ user: username }));
		test('should login with username', async () => {
			await Users.login(username, password, req);
			expect(publishFn.mock.calls.length).toBe(1);
			expect(publishFn.mock.calls[0][0]).toEqual(events.USER_LOGGED_IN);
			expect(publishFn.mock.calls[0][1]).toEqual({ username,
				sessionID: req.sessionID,
				ipAddress: req.ip,
				userAgent: req.headers['user-agent'],
				referer: req.headers.referer,
				oldSessions });
		});

		test('should return error if account is locked', async () => {
			UsersModel.canLogIn.mockRejectedValueOnce(templates.tooManyLoginAttempts);
			await expect(Users.login(username, password, req)).rejects.toEqual(templates.tooManyLoginAttempts);
			expect(publishFn.mock.calls.length).toBe(0);
		});

		test('should login if the session is not web session', async () => {
			req.session.user.webSession = false;
			await Users.login(username, password, req);
			expect(publishFn.mock.calls.length).toBe(1);
			expect(publishFn.mock.calls[0][0]).toEqual(events.USER_LOGGED_IN);
			expect(publishFn.mock.calls[0][1]).toEqual({ username,
				sessionID: req.sessionID,
				ipAddress: req.ip,
				userAgent: req.headers['user-agent'],
				referer: req.headers.referer,
				oldSessions: null });
		});

		test('should login if the request has empty ips array', async () => {
			req.ips = [];
			await Users.login(username, password, req);
			expect(publishFn.mock.calls.length).toBe(1);
			expect(publishFn.mock.calls[0][0]).toEqual(events.USER_LOGGED_IN);
			expect(publishFn.mock.calls[0][1]).toEqual({ username,
				sessionID: req.sessionID,
				ipAddress: req.ip,
				userAgent: req.headers['user-agent'],
				referer: req.headers.referer,
				oldSessions: null });
		});
	});
};

describe('processors/users', () => {
	testLogin();
});
