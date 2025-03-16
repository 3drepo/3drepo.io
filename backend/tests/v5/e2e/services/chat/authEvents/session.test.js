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

const ServiceHelper = require('../../../../helper/services');
const SuperTest = require('supertest');
const { src } = require('../../../../helper/path');
const SessionTracker = require('../../../../helper/sessionTracker');

const { EVENTS, SOCKET_HEADER } = require(`${src}/services/chat/chat.constants`);

const user = ServiceHelper.generateUserCredentials();
const anotherUser = ServiceHelper.generateUserCredentials();

let agent;
const setupData = () => Promise.all([
	ServiceHelper.db.createUser(user),
	ServiceHelper.db.createUser(anotherUser),
]);

const runSessionsRemovedTests = () => {
	describe('Log out message', () => {
		const referrer = `https://${ServiceHelper.generateRandomString()}.com`;
		const userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/99.0.4844.51 Safari/537.36';
		test('Should log user out if they are logged in else where (login before socket connection)', async () => {
			const headers = { referer: referrer, 'user-agent': userAgent };
			const { session: cookie } = await ServiceHelper.loginAndGetCookie(agent, user, { headers });
			const socket = await ServiceHelper.socket.connectToSocket(cookie);
			const onLogOutMessage = new Promise((resolve) => {
				socket.on(EVENTS.LOGGED_OUT, resolve);
			});

			await ServiceHelper.loginAndGetCookie(agent, user, { headers });
			await expect(onLogOutMessage).resolves.toEqual({ reason: 'You have logged in else where' });
			socket.close();
		});

		test('Should log user out if they are logged in else where (login after socket connection)', async () => {
			const headers = { referer: referrer, 'user-agent': userAgent };
			const socket = await ServiceHelper.socket.connectToSocket();
			await ServiceHelper.loginAndGetCookie(agent, user,
				{ headers: { ...headers, [SOCKET_HEADER]: socket.id } });
			const onLogOutMessage = new Promise((resolve) => {
				socket.on(EVENTS.LOGGED_OUT, resolve);
			});

			await ServiceHelper.loginAndGetCookie(agent, user, { headers });
			await expect(onLogOutMessage).resolves.toEqual({ reason: 'You have logged in else where' });
			socket.close();
		});

		test('Should log user out if the user agent is different', async () => {
			const headers = { referer: referrer, 'user-agent': userAgent };
			const testSession = SessionTracker(agent);
			await testSession.login(user, { headers });
			const socket = await ServiceHelper.socket.connectToSocket(testSession.cookies.session);

			const onLogOutMessage = new Promise((resolve) => {
				socket.on(EVENTS.LOGGED_OUT, resolve);
			});

			await testSession.get('/v5/user/')
				.set('user-agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Edge/91.0.864.67 Safari/537.36');

			await expect(onLogOutMessage).resolves.toEqual({ reason: 'You have logged in else where' });
			socket.close();
		});

		test('Should not log the user out if the referrer is different', async () => {
			const headers = { referer: referrer, 'user-agent': userAgent };
			const { session: cookie } = await ServiceHelper.loginAndGetCookie(agent, user, { headers });
			const socket = await ServiceHelper.socket.connectToSocket(cookie);
			const fn = jest.fn();
			const onLogOutMessage = new Promise((resolve, reject) => {
				socket.on(EVENTS.LOGGED_OUT, () => { reject(); fn(); });
				setTimeout(resolve, 100);
			});

			await ServiceHelper.loginAndGetCookie(agent, user,
				{ headers: { ...headers, referer: `https://${ServiceHelper.generateRandomString()}.com` } });
			await expect(onLogOutMessage).resolves.toBeUndefined();
			expect(fn).not.toHaveBeenCalled();
			socket.close();
		});

		test('Should not affect a different user', async () => {
			const headers = { referer: referrer, 'user-agent': userAgent };
			const { session: cookie } = await ServiceHelper.loginAndGetCookie(agent, user, { headers });
			const socket = await ServiceHelper.socket.connectToSocket(cookie);
			const fn = jest.fn();
			const onLogOutMessage = new Promise((resolve, reject) => {
				socket.on(EVENTS.LOGGED_OUT, () => { reject(); fn(); });
				setTimeout(resolve, 100);
			});

			await ServiceHelper.loginAndGetCookie(agent, anotherUser, { headers });
			await expect(onLogOutMessage).resolves.toBeUndefined();
			expect(fn).not.toHaveBeenCalled();
			socket.close();
		});
	});
};

describe(ServiceHelper.determineTestGroup(__filename), () => {
	let server;
	let chatApp;
	beforeAll(async () => {
		server = await ServiceHelper.app();
		chatApp = await ServiceHelper.chatApp();
		agent = await SuperTest(server);
		await setupData();
	});
	afterAll(() => Promise.all([
		ServiceHelper.closeApp(server),
		chatApp.close()]));

	runSessionsRemovedTests();
});
