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

const { EVENTS } = require(`${src}/services/chat/chat.constants`);
const { templates } = require(`${src}/utils/responseCodes`);

const user = ServiceHelper.generateUserCredentials();
const teamspace = ServiceHelper.generateRandomString();
const project = ServiceHelper.generateRandomProject();
const container = ServiceHelper.generateRandomModel();
const federation = ServiceHelper.generateRandomModel({ isFederation: true });

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
			federation._id,
			federation.name,
			federation.properties,
		),
	]);
	await Promise.all([
		ServiceHelper.db.createUser(user, [teamspace]),
		ServiceHelper.db.createProject(teamspace, project.id, project.name, [container._id, federation._id]),
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
				.set({ 'x-socket-id': socket1.id })
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
				.set({ 'x-socket-id': socket1.id })
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
});
