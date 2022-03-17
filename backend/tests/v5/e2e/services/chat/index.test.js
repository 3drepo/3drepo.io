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

const ServiceHelper = require('../../../helper/services');

const setupData = async () => {
};

const runConnectionTests = () => {
	describe('An unauthenticated user', () => {
		test('should be able to connect to the chat service', async () => {
			const promise = new Promise((resolve, reject) => {
				const socket = ServiceHelper.connectToSocket();
				socket.on('connect', resolve);
				socket.on('connect_error', reject);
			});

			await promise;
		});
	});
};

describe('E2E Chat Service', () => {
	let server;
	let chatApp;
	beforeAll(async () => {
		server = ServiceHelper.app();
		chatApp = await ServiceHelper.chatApp();
		//	agent = await SuperTest(server);
		await setupData();
	});
	afterAll(async () => {
		ServiceHelper.closeApp(server);
		await chatApp.close();
	});

	runConnectionTests();
});
