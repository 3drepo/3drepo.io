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
const SuperTest = require('supertest');
const { src } = require('../../../helper/path');

const { EVENTS, ERRORS, ACTIONS, SOCKET_HEADER } = require(`${src}/services/chat/chat.constants`);
const { broadcastMessage } = require(`${src}/handler/queue`);
const { cn_queue: { event_exchange: eventExchange } } = require(`${src}/utils/config`);

const tsAdmin = ServiceHelper.generateUserCredentials();
const nobody = ServiceHelper.generateUserCredentials();

const teamspace = ServiceHelper.generateRandomString();
const project = ServiceHelper.generateRandomProject();
const container = ServiceHelper.generateRandomModel();

let agent;
const setupData = async () => {
	await ServiceHelper.db.createTeamspace(teamspace, [tsAdmin.user]);
	await ServiceHelper.db.createModel(
		teamspace,
		container._id,
		container.name,
		container.properties,
	);
	await Promise.all([
		ServiceHelper.db.createUser(tsAdmin, [teamspace]),
		ServiceHelper.db.createUser(nobody),
		ServiceHelper.db.createProject(teamspace, project.id, project.name, [container._id]),
	]);
};

const onJoinErrorCheck = async (socket, data, error) => {
	const untilErrorEvent = new Promise((resolve, reject) => {
		socket.on(EVENTS.ERROR, resolve);
		socket.on(EVENTS.MESSAGE, reject);
	});

	socket.emit('join', data);
	await expect(untilErrorEvent).resolves.toEqual(expect.objectContaining({
		code: error,
		details: {
			action: ACTIONS.JOIN,
			data,
		},
	}));
};

const onJoinSuccessCheck = async (socket, data) => {
	const untilEvent = new Promise((resolve, reject) => {
		socket.on(EVENTS.ERROR, reject);
		socket.on(EVENTS.MESSAGE, resolve);
	});

	socket.emit('join', data);
	await expect(untilEvent).resolves.toEqual(expect.objectContaining({
		event: EVENTS.SUCCESS,
		data: {
			action: ACTIONS.JOIN,
			data,
		},
	}));
};

const onLeaveErrorCheck = async (socket, data, error) => {
	const untilErrorEvent = new Promise((resolve, reject) => {
		socket.on(EVENTS.ERROR, resolve);
		socket.on(EVENTS.MESSAGE, reject);
	});

	socket.emit('leave', data);
	await expect(untilErrorEvent).resolves.toEqual(expect.objectContaining({
		code: error,
		details: {
			action: ACTIONS.LEAVE,
			data,
		},
	}));
};

const onLeaveSuccessCheck = async (socket, data) => {
	const untilEvent = new Promise((resolve, reject) => {
		socket.on(EVENTS.ERROR, reject);
		socket.on(EVENTS.MESSAGE, resolve);
	});

	socket.emit('leave', data);
	await expect(untilEvent).resolves.toEqual(expect.objectContaining({
		event: EVENTS.SUCCESS,
		data: {
			action: ACTIONS.LEAVE,
			data,
		},
	}));
};

const testUnauthenticatedUser = () => {
	describe('An unauthenticated user', () => {
		test('should be able to connect to the chat service', async () => {
			const socket = await ServiceHelper.socket.connectToSocket();
			socket.close();
		});

		describe.each([
			['should not be able to join a notification room', { notifications: true }],
			['should not be able to join a notification room (v4)', { account: tsAdmin.user }],
			['should not be able to join a model room', { teamspace, project: project.id, model: container._id }],
			['should not be able to join a model room (v4)', { account: teamspace, model: container._id }],
		])('Join room', (desc, data) => {
			test(desc, async () => {
				const socket = await ServiceHelper.socket.connectToSocket();

				await expect(onJoinErrorCheck(socket, data, ERRORS.UNAUTHORISED)).resolves.toBeUndefined();
				socket.close();
			});
		});

		test('should be able to join rooms after login', async () => {
			const socket = await ServiceHelper.socket.connectToSocket();
			await ServiceHelper.loginAndGetCookie(agent, tsAdmin.user, tsAdmin.password,
				{ [SOCKET_HEADER]: socket.id });

			// introduce a delay to let backend sort out their events (i.e. hooking the session with the socket)
			await ServiceHelper.sleepMS(100);
			await expect(onJoinSuccessCheck(socket, { notifications: true })).resolves.toBeUndefined();
			socket.close();
		});
	});
};

const testTSAdmin = () => {
	describe('User with access', () => {
		let cookie;
		beforeAll(async () => {
			const cookieInfo = await ServiceHelper.loginAndGetCookie(agent, tsAdmin.user, tsAdmin.password);
			cookie = cookieInfo.session;
		});
		test('should be able to connect to the chat service', async () => {
			const socket = await ServiceHelper.socket.connectToSocket(cookie);
			socket.close();
		});

		describe.each([
			['should be able to join the notification room', { notifications: true }],
			['should be able to join the notification room (v4)', { account: tsAdmin.user }],
			['should not be able to join someone else\'s notification room (v4)', { account: nobody.user }, ERRORS.UNAUTHORISED],
			['should be able to join a model room', { teamspace, project: project.id, model: container._id }],
			['should be able to join a model room (v4)', { account: teamspace, model: container._id }],
			['should not be able to join a model room that doesn\'t exist', { teamspace, project: project.id, model: ServiceHelper.generateRandomString() }, ERRORS.ROOM_NOT_FOUND],
			['should not be able to join a model room that doesn\'t exist (v4)', { account: teamspace, model: ServiceHelper.generateRandomString() }, ERRORS.ROOM_NOT_FOUND],
			['should be able to join a project room', { teamspace, project: project.id }],
			['should not be able to join a project room that doesn\'t exist', { teamspace, project: ServiceHelper.generateRandomString() }, ERRORS.ROOM_NOT_FOUND],
			['should not be able to join a room with jibberish', { [ServiceHelper.generateRandomString()]: ServiceHelper.generateRandomString() }, ERRORS.ROOM_NOT_FOUND],
		])('Join room', (desc, data, failError) => {
			let socket;
			beforeAll(async () => {
				socket = await ServiceHelper.socket.connectToSocket(cookie);
			});
			afterAll(() => socket.close());
			test(desc, async () => {
				if (failError) {
					await expect(onJoinErrorCheck(socket, data, failError)).resolves.toBeUndefined();
				} else await expect(onJoinSuccessCheck(socket, data)).resolves.toBeUndefined();
			});
		});

		describe.each([
			['should be able to leave the notification room', { notifications: true }],
			['should be able to leave the notification room (v4)', { account: tsAdmin.user }],
			['should be able to leave a model room', { teamspace, project: project.id, model: container._id }],
			['should be able to leave a model room (v4)', { account: teamspace, model: container._id }],
			['should not be be able to leave a model room that doesn\'t exist (v4)', { account: teamspace, model: ServiceHelper.generateRandomString() }, ERRORS.ROOM_NOT_FOUND],
			['should be able to leave a project room', { teamspace, project: project.id }],
			['should not be be able to leave a room with jibberish', { [ServiceHelper.generateRandomString()]: ServiceHelper.generateRandomString() }, ERRORS.ROOM_NOT_FOUND],
		])('Leave room', (desc, data, failError) => {
			let socket;
			beforeAll(async () => {
				socket = await ServiceHelper.socket.connectToSocket(cookie);
			});
			afterAll(() => socket.close());
			test(desc, async () => {
				if (failError) {
					await expect(onLeaveErrorCheck(socket, data, failError)).resolves.toBeUndefined();
				} else await expect(onLeaveSuccessCheck(socket, data)).resolves.toBeUndefined();
			});
		});
	});
};

const testNobody = () => {
	describe('User without a license', () => {
		let cookie;
		beforeAll(async () => {
			const cookieInfo = await ServiceHelper.loginAndGetCookie(agent, nobody.user, nobody.password);
			cookie = cookieInfo.session;
		});
		test('should be able to connect to the chat service', async () => {
			const socket = await ServiceHelper.socket.connectToSocket(cookie);
			socket.close();
		});

		describe.each([
			['should not be not able to join a model room', { teamspace, project: project.id, model: container._id }, ERRORS.ROOM_NOT_FOUND],
			['should not be not able to join a project room', { teamspace, project: project.id }, ERRORS.ROOM_NOT_FOUND],
		])('Join room', (desc, data, failError) => {
			let socket;
			beforeAll(async () => {
				socket = await ServiceHelper.socket.connectToSocket(cookie);
			});
			afterAll(() => socket.close());
			test(desc, async () => {
				if (failError) {
					await expect(onJoinErrorCheck(socket, data, failError)).resolves.toBeUndefined();
				} else await expect(onJoinSuccessCheck(socket, data)).resolves.toBeUndefined();
			});
		});
	});
};

const runConnectionTests = () => {
	testUnauthenticatedUser();
	testTSAdmin();
	testNobody();
};

const broadcastErrorTests = () => {
	describe('Error catching on message processing', () => {
		test('should not crash the service if message processing failed', async () => {
			await Promise.all([
				broadcastMessage(eventExchange, ServiceHelper.generateRandomString()),
				broadcastMessage(eventExchange,
					JSON.stringify({ [ServiceHelper.generateRandomString()]: ServiceHelper.generateRandomString() })),
				broadcastMessage(eventExchange,
					JSON.stringify({
						[ServiceHelper.generateRandomString()]: ServiceHelper.generateRandomString(),
						internal: true,
					})),
			]);
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

	runConnectionTests();
	broadcastErrorTests();
});
