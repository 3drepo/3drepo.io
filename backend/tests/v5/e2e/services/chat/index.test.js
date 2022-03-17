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
const { src } = require('../../../helper/path');

const { EVENTS, ERRORS, ACTIONS } = require(`${src}/services/chat/chat.constants`);

const tsAdmin = ServiceHelper.generateUserCredentials();
const nobody = ServiceHelper.generateUserCredentials();

const teamspace = ServiceHelper.generateRandomString();
const project = ServiceHelper.generateRandomProject();
const container = ServiceHelper.generateRandomModel();

const setupData = async () => {
	await ServiceHelper.db.createTeamspace(teamspace, [tsAdmin.user]);
	await ServiceHelper.db.createModel(
		teamspace,
		container._id,
		container.name,
		container.properties,
	);
	return Promise.all([
		ServiceHelper.db.createUser(tsAdmin, [teamspace]),
		ServiceHelper.db.createUser(nobody),
		ServiceHelper.db.createProject(teamspace, project.id, project.name, [container._id]),
	]);
};

const connectToSocket = () => {
	const promise = new Promise((resolve, reject) => {
		const socket = ServiceHelper.connectToSocket();
		socket.on('connect', () => resolve(socket));
		socket.on('connect_error', reject);
	});

	return promise;
};

const runConnectionTests = () => {
	describe('An unauthenticated user', () => {
		const onErrorCheck = async (socket, data) => {
			const untilErrorEvent = new Promise((resolve, reject) => {
				socket.on(EVENTS.ERROR, resolve);
				socket.on(EVENTS.MESSAGE, reject);
			});

			socket.emit('join', data);

			await expect(untilErrorEvent).resolves.toEqual(expect.objectContaining({
				code: ERRORS.UNAUTHORISED,
				details: {
					action: ACTIONS.JOIN,
					data,
				},
			}));
		};
		test('should be able to connect to the chat service', async () => {
			const socket = await connectToSocket();
			socket.close();
		});

		describe.each([
			['should not be able to join a notification room', { notifications: true }],
			['should not be able to join a notification room (v4)', { account: tsAdmin.user }],
			['should not be able to join a model room', { teamspace, project: project.id, model: container._id }],
			['should not be able to join a model room (v4)', { account: teamspace, model: container._id }],
		])('Join room', (desc, data) => {
			test(desc, async () => {
				const socket = await connectToSocket();

				await expect(onErrorCheck(socket, data)).resolves.toBeUndefined();
				socket.close();
			});
		});
	});
};

describe('E2E Chat Service', () => {
	let server;
	let chatApp;
	beforeAll(async () => {
		server = ServiceHelper.app();
		chatApp = await ServiceHelper.chatApp();
		// agent = await SuperTest(server);
		await setupData();
	});
	afterAll(() => Promise.all([
		ServiceHelper.closeApp(server),
		chatApp.close()]));

	runConnectionTests();
});
