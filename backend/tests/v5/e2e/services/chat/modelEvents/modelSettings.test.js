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
const { src } = require('../../../../helper/path');
const SuperTest = require('supertest');
const { generateRandomString } = require('../../../../helper/services');

const { EVENTS, SOCKET_HEADER } = require(`${src}/services/chat/chat.constants`);
const { templates } = require(`${src}/utils/responseCodes`);

const user = ServiceHelper.generateUserCredentials();
const teamspace = ServiceHelper.generateRandomString();
const project = ServiceHelper.generateRandomProject();
const container = ServiceHelper.generateRandomModel();
const containerToBeDeleted = ServiceHelper.generateRandomModel();
const federation = ServiceHelper.generateRandomModel({ isFederation: true });
const federationToBeDeleted = ServiceHelper.generateRandomModel({ isFederation: true });

let agent;
const setupData = async () => {
	await ServiceHelper.db.createTeamspace(teamspace, [user.user]);
	await Promise.all([
		ServiceHelper.db.createModel(
			teamspace,
			container._id,
			container.name,
			container.properties,
		),
		ServiceHelper.db.createModel(
			teamspace,
			containerToBeDeleted._id,
			containerToBeDeleted.name,
			containerToBeDeleted.properties,
		),
		ServiceHelper.db.createModel(
			teamspace,
			federation._id,
			federation.name,
			federation.properties,
		),
		ServiceHelper.db.createModel(
			teamspace,
			federationToBeDeleted._id,
			federationToBeDeleted.name,
			federationToBeDeleted.properties,
		),
	]);
	await Promise.all([
		ServiceHelper.db.createUser(user, [teamspace]),
		ServiceHelper.db.createProject(teamspace, project.id, project.name, [container._id, federation._id,
		containerToBeDeleted._id, federationToBeDeleted._id], [user.user]),
	]);
};

const modelSettingsTest = () => {
	describe('On updating model settings', () => {
		test(`should trigger a ${EVENTS.CONTAINER_SETTINGS_UPDATE} event when settings have been updated`, async () => {
			const socket1 = await ServiceHelper.socket.loginAndGetSocket(agent, user.user, user.password);
			const socket2 = await ServiceHelper.socket.loginAndGetSocket(agent, user.user, user.password);

			const data = { teamspace, project: project.id, model: container._id };
			await Promise.all([
				ServiceHelper.socket.joinRoom(socket1, data),
				ServiceHelper.socket.joinRoom(socket2, data),
			]);

			const socket1CB = jest.fn();

			const socket2Promise = new Promise((resolve, reject) => {
				socket2.on(EVENTS.CONTAINER_SETTINGS_UPDATE, resolve);
				setTimeout(reject, 1000);
			});

			// Sender should not get the update
			const socket1Promise = new Promise((resolve, reject) => {
				socket1.on(EVENTS.CONTAINER_SETTINGS_UPDATE, () => { socket1CB(); reject(); });
				setTimeout(resolve, 100);
			});

			const payload = { name: ServiceHelper.generateRandomString() };
			await agent.patch(`/v5/teamspaces/${teamspace}/projects/${project.id}/containers/${container._id}?key=${user.apiKey}`)
				.set({ [SOCKET_HEADER]: socket1.id })
				.send(payload)
				.expect(templates.ok.status);

			await expect(socket2Promise).resolves.toEqual({ ...data, data: payload });

			await expect(socket1Promise).resolves.toBeUndefined();
			expect(socket1CB).not.toHaveBeenCalled();

			socket1.close();
			socket2.close();
		});

		test(`should trigger a ${EVENTS.FEDERATION_SETTINGS_UPDATE} event when settings have been updated`, async () => {
			const socket1 = await ServiceHelper.socket.loginAndGetSocket(agent, user.user, user.password);
			const socket2 = await ServiceHelper.socket.loginAndGetSocket(agent, user.user, user.password);

			const data = { teamspace, project: project.id, model: federation._id };
			await Promise.all([
				ServiceHelper.socket.joinRoom(socket1, data),
				ServiceHelper.socket.joinRoom(socket2, data),
			]);

			const socket1CB = jest.fn();

			const socket2Promise = new Promise((resolve, reject) => {
				socket2.on(EVENTS.FEDERATION_SETTINGS_UPDATE, resolve);
				setTimeout(reject, 1000);
			});

			// Sender should not get the update
			const socket1Promise = new Promise((resolve, reject) => {
				socket1.on(EVENTS.FEDERATION_SETTINGS_UPDATE, () => { socket1CB(); reject(); });
				setTimeout(resolve, 100);
			});

			const payload = { name: ServiceHelper.generateRandomString() };
			await agent.patch(`/v5/teamspaces/${teamspace}/projects/${project.id}/federations/${federation._id}?key=${user.apiKey}`)
				.set({ [SOCKET_HEADER]: socket1.id })
				.send(payload)
				.expect(templates.ok.status);

			await expect(socket2Promise).resolves.toEqual({ ...data, data: payload });

			await expect(socket1Promise).resolves.toBeUndefined();
			expect(socket1CB).not.toHaveBeenCalled();

			socket1.close();
			socket2.close();
		});
	});
};

const modelAddedTest = () => {
	describe('On adding a new model', () => {
		test(`should trigger a ${EVENTS.NEW_CONTAINER} event when a new container has been added`, async () => {
			const socket1 = await ServiceHelper.socket.loginAndGetSocket(agent, user.user, user.password);
			const socket2 = await ServiceHelper.socket.loginAndGetSocket(agent, user.user, user.password);

			const data = { teamspace, project: project.id };
			await Promise.all([
				ServiceHelper.socket.joinRoom(socket1, data),
				ServiceHelper.socket.joinRoom(socket2, data),
			]);

			const socket1CB = jest.fn();

			const socket2Promise = new Promise((resolve, reject) => {
				socket2.on(EVENTS.NEW_CONTAINER, resolve);
				setTimeout(reject, 1000);
			});

			// Sender should not get the update
			const socket1Promise = new Promise((resolve, reject) => {
				socket1.on(EVENTS.NEW_CONTAINER, () => { socket1CB(); reject(); });
				setTimeout(resolve, 100);
			});

			const payload = { name: ServiceHelper.generateRandomString(), unit: 'mm', type: generateRandomString(), code: generateRandomString(3) };
			const res = await agent.post(`/v5/teamspaces/${teamspace}/projects/${project.id}/containers?key=${user.apiKey}`)
				.set({ [SOCKET_HEADER]: socket1.id })
				.send(payload)
				.expect(templates.ok.status);

			await expect(socket2Promise).resolves.toEqual({
				...data,
				data: {
					_id: res.body._id,
					code: payload.code,
					category: payload.type,
					name: payload.name
				}
			});

			await expect(socket1Promise).resolves.toBeUndefined();
			expect(socket1CB).not.toHaveBeenCalled();

			socket1.close();
			socket2.close();
		});

		test(`should trigger a ${EVENTS.NEW_FEDERATION} event when a new federation has been added`, async () => {
			const socket1 = await ServiceHelper.socket.loginAndGetSocket(agent, user.user, user.password);
			const socket2 = await ServiceHelper.socket.loginAndGetSocket(agent, user.user, user.password);

			const data = { teamspace, project: project.id };
			await Promise.all([
				ServiceHelper.socket.joinRoom(socket1, data),
				ServiceHelper.socket.joinRoom(socket2, data),
			]);

			const socket1CB = jest.fn();

			const socket2Promise = new Promise((resolve, reject) => {
				socket2.on(EVENTS.NEW_FEDERATION, resolve);
				setTimeout(reject, 1000);
			});

			// Sender should not get the update
			const socket1Promise = new Promise((resolve, reject) => {
				socket1.on(EVENTS.NEW_FEDERATION, () => { socket1CB(); reject(); });
				setTimeout(resolve, 100);
			});

			const payload = { name: ServiceHelper.generateRandomString(), unit: 'mm', desc: generateRandomString(), code: generateRandomString(3) };
			const res = await agent.post(`/v5/teamspaces/${teamspace}/projects/${project.id}/federations?key=${user.apiKey}`)
				.set({ [SOCKET_HEADER]: socket1.id })
				.send(payload)
				.expect(templates.ok.status);

			await expect(socket2Promise).resolves.toEqual({
				...data,
				data: {
					_id: res.body._id,
					code: payload.code,
					description: payload.desc,
					name: payload.name
				}
			});

			await expect(socket1Promise).resolves.toBeUndefined();
			expect(socket1CB).not.toHaveBeenCalled();

			socket1.close();
			socket2.close();
		});
	});
};

const modelDeletedTest = () => {
	describe('On deleting a model', () => {
		test(`should trigger a ${EVENTS.CONTAINER_REMOVED} event when a container has been deleted`, async () => {
			const socket1 = await ServiceHelper.socket.loginAndGetSocket(agent, user.user, user.password);
			const socket2 = await ServiceHelper.socket.loginAndGetSocket(agent, user.user, user.password);

			const data = { teamspace, project: project.id, model: containerToBeDeleted._id };
			await Promise.all([
				ServiceHelper.socket.joinRoom(socket1, data),
				ServiceHelper.socket.joinRoom(socket2, data),
			]);

			const socket1CB = jest.fn();

			const socket2Promise = new Promise((resolve, reject) => {
				socket2.on(EVENTS.CONTAINER_REMOVED, resolve);
				setTimeout(reject, 1000);
			});

			// Sender should not get the update
			const socket1Promise = new Promise((resolve, reject) => {
				socket1.on(EVENTS.CONTAINER_REMOVED, () => { socket1CB(); reject(); });
				setTimeout(resolve, 100);
			});

			await agent.delete(`/v5/teamspaces/${teamspace}/projects/${project.id}/containers/${containerToBeDeleted._id}?key=${user.apiKey}`)
				.set({ [SOCKET_HEADER]: socket1.id })
				.expect(templates.ok.status);

			await expect(socket2Promise).resolves.toEqual({ ...data, data: {} });

			await expect(socket1Promise).resolves.toBeUndefined();
			expect(socket1CB).not.toHaveBeenCalled();

			socket1.close();
			socket2.close();
		});

		test(`should trigger a ${EVENTS.FEDERATION_REMOVED} event when a federation has been deleted`, async () => {
			const socket1 = await ServiceHelper.socket.loginAndGetSocket(agent, user.user, user.password);
			const socket2 = await ServiceHelper.socket.loginAndGetSocket(agent, user.user, user.password);

			const data = { teamspace, project: project.id, model: federationToBeDeleted._id };
			await Promise.all([
				ServiceHelper.socket.joinRoom(socket1, data),
				ServiceHelper.socket.joinRoom(socket2, data),
			]);

			const socket1CB = jest.fn();

			const socket2Promise = new Promise((resolve, reject) => {
				socket2.on(EVENTS.FEDERATION_REMOVED, resolve);
				setTimeout(reject, 1000);
			});

			// Sender should not get the update
			const socket1Promise = new Promise((resolve, reject) => {
				socket1.on(EVENTS.FEDERATION_REMOVED, () => { socket1CB(); reject(); });
				setTimeout(resolve, 100);
			});

			await agent.delete(`/v5/teamspaces/${teamspace}/projects/${project.id}/federations/${federationToBeDeleted._id}?key=${user.apiKey}`)
				.set({ [SOCKET_HEADER]: socket1.id })
				.expect(templates.ok.status);

			await expect(socket2Promise).resolves.toEqual({ ...data, data: {} });

			await expect(socket1Promise).resolves.toBeUndefined();
			expect(socket1CB).not.toHaveBeenCalled();

			socket1.close();
			socket2.close();
		});
	});
};

describe('E2E Chat Service (Model Settings)', () => {
	let server;
	let chatApp;
	beforeAll(async () => {
		server = ServiceHelper.app();
		chatApp = await ServiceHelper.chatApp();
		agent = await SuperTest(server);
		await setupData();
	});
	afterAll(() => Promise.all([
		ServiceHelper.closeApp(server),
		chatApp.close()]));
	modelSettingsTest();
	modelAddedTest();
	modelDeletedTest();
});
