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
const { src, objModel } = require('../../../../helper/path');
const SuperTest = require('supertest');

const { EVENTS, ACTIONS } = require(`${src}/services/chat/chat.constants`);
const { templates } = require(`${src}/utils/responseCodes`);
const { queueMessage } = require(`${src}/handler/queue`);
const { cn_queue: queueConfig } = require(`${src}/utils/config`);
const { mkdirSync, writeFileSync } = require('fs');

const user = ServiceHelper.generateUserCredentials();
const teamspace = ServiceHelper.generateRandomString();
const project = ServiceHelper.generateRandomProject();
const container = ServiceHelper.generateRandomModel();
const container2 = ServiceHelper.generateRandomModel();
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
			container2._id,
			container2.name,
			container2.properties,
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
		ServiceHelper.db.createProject(teamspace, project.id, project.name,
			[container._id, container2._id, federation._id]),
	]);
};

const waitForEvent = (socket, event) => new Promise((resolve) => {
	socket.on(event, resolve);
});

const noEventExpected = (socket, event, fn) => new Promise((resolve, reject) => {
	socket.on(event, () => { fn(); reject(); });
	setTimeout(resolve, 500);
});

const modelUploadTest = () => {
	describe('Model uploads', () => {
		const route = (ts = teamspace, proj = project.id, cont = container._id) => `/v5/teamspaces/${ts}/projects/${proj}/containers/${cont}/revisions`;
		const fedRoute = `/v5/teamspaces/${teamspace}/projects/${project.id}/federations/${federation._id}/revisions`;
		test(`should receive a ${EVENTS.CONTAINER_SETTINGS_UPDATE} event after revision upload if the user has joined the room`, async () => {
			const socket = await ServiceHelper.socket.loginAndGetSocket(agent, user.user, user.password);
			const data = { teamspace, project: project.id, model: container._id };

			await expect(ServiceHelper.socket.joinRoom(socket, data)).resolves.toBeUndefined();
			const modelUpdatePromise = waitForEvent(socket, EVENTS.CONTAINER_SETTINGS_UPDATE);

			await agent.post(`${route()}?key=${user.apiKey}`)
				.set('Content-Type', 'multipart/form-data')
				.field('tag', ServiceHelper.generateRandomString())
				.attach('file', objModel)
				.expect(templates.ok.status);

			await expect(modelUpdatePromise).resolves.toEqual({ ...data, data: { status: 'queued' } });
			socket.close();
		});

		test(`should receive a ${EVENTS.FEDERATION_SETTINGS_UPDATE} event after revision upload if the user has joined the room`, async () => {
			const socket = await ServiceHelper.socket.loginAndGetSocket(agent, user.user, user.password);
			const data = { teamspace, project: project.id, model: federation._id };

			const joinPromise = ServiceHelper.socket.joinRoom(socket, data);

			await expect(joinPromise).resolves.toBeUndefined();
			const modelUpdatePromise = waitForEvent(socket, EVENTS.FEDERATION_SETTINGS_UPDATE);

			await agent.post(`${fedRoute}?key=${user.apiKey}`)
				.send({ containers: [container._id] })
				.expect(templates.ok.status);

			await expect(modelUpdatePromise).resolves.toEqual({ ...data, data: { status: 'queued' } });
			socket.close();
		});

		test(`should not receive a ${EVENTS.CONTAINER_SETTINGS_UPDATE} event after revision upload if the user has left the room`, async () => {
			const socket = await ServiceHelper.socket.loginAndGetSocket(agent, user.user, user.password);
			const data = { teamspace, project: project.id, model: container._id };

			await expect(ServiceHelper.socket.joinRoom(socket, data)).resolves.toBeUndefined();

			const fn = jest.fn();
			const modelUpdatePromise = noEventExpected(socket, EVENTS.CONTAINER_SETTINGS_UPDATE, fn);

			const leavePromise = new Promise((resolve, reject) => {
				socket.on(EVENTS.MESSAGE, (msg) => {
					expect(msg).toEqual(expect.objectContaining(
						{ event: EVENTS.SUCCESS, data: { action: ACTIONS.LEAVE, data } },
					));
					resolve();
				});

				socket.on(EVENTS.ERROR, reject);
			});

			socket.emit('leave', data);

			await expect(leavePromise).resolves.toBeUndefined();

			await agent.post(`${route(teamspace, project.id, container2._id)}?key=${user.apiKey}`)
				.set('Content-Type', 'multipart/form-data')
				.field('tag', ServiceHelper.generateRandomString())
				.attach('file', objModel)
				.expect(templates.ok.status);

			await expect(modelUpdatePromise).resolves.toBeUndefined();
			expect(fn).not.toHaveBeenCalled();
			socket.close();
		});
	});
};

const queueUpdateTest = () => {
	describe('On callback queue update', () => {
		test(`should receive a ${EVENTS.CONTAINER_SETTINGS_UPDATE} event if a container status has been updated`, async () => {
			const socket = await ServiceHelper.socket.loginAndGetSocket(agent, user.user, user.password);
			const data = { teamspace, project: project.id, model: container._id };
			await expect(ServiceHelper.socket.joinRoom(socket, data)).resolves.toBeUndefined();

			const modelUpdatePromise = waitForEvent(socket, EVENTS.CONTAINER_SETTINGS_UPDATE);

			const content = { status: 'processing', database: teamspace, project: container._id };
			await queueMessage(queueConfig.callback_queue, ServiceHelper.generateRandomString(),
				JSON.stringify(content));
			await expect(modelUpdatePromise).resolves.toEqual({ ...data, data: { status: content.status } });

			socket.close();
		});

		test(`should receive a ${EVENTS.FEDERATION_SETTINGS_UPDATE} event if a federation status has been updated`, async () => {
			const socket = await ServiceHelper.socket.loginAndGetSocket(agent, user.user, user.password);
			const data = { teamspace, project: project.id, model: federation._id };
			await expect(ServiceHelper.socket.joinRoom(socket, data)).resolves.toBeUndefined();

			const modelUpdatePromise = waitForEvent(socket, EVENTS.FEDERATION_SETTINGS_UPDATE);

			const content = { status: 'processing', database: teamspace, project: federation._id };
			await queueMessage(queueConfig.callback_queue, ServiceHelper.generateRandomString(),
				JSON.stringify(content));
			await expect(modelUpdatePromise).resolves.toEqual({ ...data, data: { status: content.status } });

			socket.close();
		});
	});
};

const queueFinishedTest = () => {
	describe('On callback queue task finished', () => {
		test(`should receive a ${EVENTS.CONTAINER_SETTINGS_UPDATE} event if a container revision has finished`, async () => {
			const socket = await ServiceHelper.socket.loginAndGetSocket(agent, user.user, user.password);
			const data = { teamspace, project: project.id, model: container._id };
			await expect(ServiceHelper.socket.joinRoom(socket, data)).resolves.toBeUndefined();

			const modelUpdatePromise = waitForEvent(socket, EVENTS.CONTAINER_SETTINGS_UPDATE);

			const content = { value: 0, database: teamspace, project: container._id };
			await queueMessage(queueConfig.callback_queue, ServiceHelper.generateRandomString(),
				JSON.stringify(content));
			const results = await modelUpdatePromise;
			expect(results?.data?.timestamp).not.toBeUndefined();
			expect(results).toEqual(expect.objectContaining({ ...data, data: { status: 'ok', timestamp: results.data.timestamp } }));

			socket.close();
		});
		test(`should receive a ${EVENTS.FEDERATION_SETTINGS_UPDATE} event if a federation revision has finished`, async () => {
			const socket = await ServiceHelper.socket.loginAndGetSocket(agent, user.user, user.password);
			const data = { teamspace, project: project.id, model: federation._id };
			await expect(ServiceHelper.socket.joinRoom(socket, data)).resolves.toBeUndefined();

			const content = { value: 0, database: teamspace, project: federation._id };
			const corId = ServiceHelper.generateRandomString();
			const fileContent = { subProjects: [{ project: container._id }] };
			mkdirSync(`${queueConfig.shared_storage}/${corId}`);
			writeFileSync(`${queueConfig.shared_storage}/${corId}/obj.json`, JSON.stringify(fileContent));

			const modelUpdatePromise = waitForEvent(socket, EVENTS.FEDERATION_SETTINGS_UPDATE);

			await queueMessage(queueConfig.callback_queue, corId, JSON.stringify(content));
			const results = await modelUpdatePromise;
			expect(results?.data?.timestamp).not.toBeUndefined();
			expect(results).toEqual({ ...data, data: { containers: [container._id], status: 'ok', timestamp: results.data.timestamp } });

			socket.close();
		});
	});
};

describe('E2E Chat Service (Model Upload Events)', () => {
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
	modelUploadTest();
	queueUpdateTest();
	queueFinishedTest();
});
