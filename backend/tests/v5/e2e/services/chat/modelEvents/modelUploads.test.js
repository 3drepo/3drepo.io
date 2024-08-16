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
const { src, objModel, dwgModel } = require('../../../../helper/path');
const SuperTest = require('supertest');

const { EVENTS, ACTIONS } = require(`${src}/services/chat/chat.constants`);
const { templates } = require(`${src}/utils/responseCodes`);
const { queueMessage } = require(`${src}/handler/queue`);
const { cn_queue: queueConfig } = require(`${src}/utils/config`);
const { mkdirSync, writeFileSync } = require('fs');

const { modelTypes, processStatuses, statusCodes } = require(`${src}/models/modelSettings.constants`);

const { getRevisionFormat } = require(`${src}/models/revisions`);

const user = ServiceHelper.generateUserCredentials();
const teamspace = ServiceHelper.generateRandomString();
const project = ServiceHelper.generateRandomProject();
const container = ServiceHelper.generateRandomModel();
const container2 = ServiceHelper.generateRandomModel();
const federation = ServiceHelper.generateRandomModel({ modelType: modelTypes.FEDERATION });
const drawing = ServiceHelper.generateRandomModel({ modelType: modelTypes.DRAWING });
const containerRevision = ServiceHelper.generateRevisionEntry();
const federationRevision = ServiceHelper.generateRevisionEntry();
const drawingRevision = { ...ServiceHelper.generateRevisionEntry(false, true, modelTypes.DRAWING),
	incomplete: true,
	status: processStatuses.PROCESSING };

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
		ServiceHelper.db.createModel(
			teamspace,
			drawing._id,
			drawing.name,
			drawing.properties,
		),
	]);
	await Promise.all([
		ServiceHelper.db.createUser(user, [teamspace]),
		ServiceHelper.db.createProject(teamspace, project.id, project.name,
			[container._id, container2._id, federation._id, drawing._id]),
		ServiceHelper.db.createRevision(teamspace, container._id, { ...containerRevision, author: user.user }),
		ServiceHelper.db.createRevision(teamspace, federation._id, { ...federationRevision, author: user.user }),
		ServiceHelper.db.createRevision(teamspace, drawing._id, { ...drawingRevision, author: user.user },
			modelTypes.DRAWING),
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

		test(`should receive a ${EVENTS.DRAWING_SETTINGS_UPDATE} event after revision upload if the user has joined the room`, async () => {
			const socket = await ServiceHelper.socket.loginAndGetSocket(agent, user.user, user.password);

			const data = { teamspace, project: project.id, model: drawing._id };
			await ServiceHelper.socket.joinRoom(socket, data);

			const socketPromise = new Promise((resolve, reject) => {
				socket.on(EVENTS.DRAWING_SETTINGS_UPDATE, resolve);
				setTimeout(reject, 1000);
			});

			await agent.post(`/v5/teamspaces/${teamspace}/projects/${project.id}/drawings/${drawing._id}/revisions?key=${user.apiKey}`)
				.set('Content-Type', 'multipart/form-data')
				.field('revCode', ServiceHelper.generateRandomString(10))
				.field('statusCode', statusCodes[0].code)
				.field('desc', ServiceHelper.generateRandomString())
				.attach('file', dwgModel)
				.expect(templates.ok.status);

			await agent.get(`/v5/teamspaces/${teamspace}/projects/${project.id}/drawings/${drawing._id}/revisions?key=${user.apiKey}`);

			await expect(socketPromise).resolves.toEqual({ ...data, data: { status: 'queued' } });

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

		test(`should receive a ${EVENTS.DRAWING_SETTINGS_UPDATE} event if a drawing status has been updated`, async () => {
			const socket = await ServiceHelper.socket.loginAndGetSocket(agent, user.user, user.password);
			const data = { teamspace, project: project.id, model: drawing._id };
			await expect(ServiceHelper.socket.joinRoom(socket, data)).resolves.toBeUndefined();

			const modelUpdatePromise = waitForEvent(socket, EVENTS.DRAWING_SETTINGS_UPDATE);

			const content = { status: 'processing', database: teamspace, project: drawing._id };
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
			const newRevisionPromise = waitForEvent(socket, EVENTS.CONTAINER_NEW_REVISION);

			const content = { value: 0, database: teamspace, project: container._id };
			await queueMessage(queueConfig.callback_queue, ServiceHelper.generateRandomString(),
				JSON.stringify(content));
			await queueMessage(queueConfig.callback_queue, containerRevision._id, JSON.stringify(content));

			const modelUpdateResults = await modelUpdatePromise;
			expect(modelUpdateResults?.data?.timestamp).not.toBeUndefined();
			expect(modelUpdateResults).toEqual(expect.objectContaining({ ...data,
				data: { status: 'ok', timestamp: modelUpdateResults.data.timestamp } }));

			const newRevisionResults = await newRevisionPromise;
			expect(newRevisionResults?.data?.timestamp).not.toBeUndefined();
			expect(newRevisionResults).toEqual(expect.objectContaining({ ...data,
				data: {
					_id: containerRevision._id,
					author: user.user,
					tag: containerRevision.tag,
					timestamp: newRevisionResults.data.timestamp,
					format: getRevisionFormat(containerRevision.rFile),
					desc: containerRevision.desc,
				} }));

			socket.close();
		});

		test(`should receive a ${EVENTS.DRAWING_SETTINGS_UPDATE} event if a drawing revision has finished`, async () => {
			const socket = await ServiceHelper.socket.loginAndGetSocket(agent, user.user, user.password);
			const data = { teamspace, project: project.id, model: drawing._id };
			await expect(ServiceHelper.socket.joinRoom(socket, data)).resolves.toBeUndefined();

			const modelUpdatePromise = waitForEvent(socket, EVENTS.DRAWING_SETTINGS_UPDATE);
			const newRevisionPromise = waitForEvent(socket, EVENTS.DRAWING_NEW_REVISION);

			const content = { value: 0, database: teamspace, project: drawing._id };
			await queueMessage(queueConfig.callback_queue, drawingRevision._id, JSON.stringify(content));

			const modelUpdateResults = await modelUpdatePromise;
			expect(modelUpdateResults?.data?.timestamp).not.toBeUndefined();
			expect(modelUpdateResults).toEqual(expect.objectContaining({ ...data,
				data: { status: 'ok', timestamp: modelUpdateResults.data.timestamp } }));

			const newRevisionResults = await newRevisionPromise;
			expect(newRevisionResults?.data?.timestamp).not.toBeUndefined();
			expect(newRevisionResults).toEqual(expect.objectContaining({ ...data,
				data: {
					_id: drawingRevision._id,
					author: user.user,
					statusCode: drawingRevision.statusCode,
					revCode: drawingRevision.revCode,
					timestamp: newRevisionResults.data.timestamp,
					format: drawingRevision.format,
					desc: drawingRevision.desc,
				} }));

			socket.close();
		});

		test(`should receive a ${EVENTS.FEDERATION_SETTINGS_UPDATE} event if a federation revision has finished`, async () => {
			const socket = await ServiceHelper.socket.loginAndGetSocket(agent, user.user, user.password);
			const data = { teamspace, project: project.id, model: federation._id };
			await expect(ServiceHelper.socket.joinRoom(socket, data)).resolves.toBeUndefined();

			const content = { value: 0, database: teamspace, project: federation._id };
			const fileContent = { subProjects: [{ project: container._id }] };
			mkdirSync(`${queueConfig.shared_storage}/${federationRevision._id}`);
			writeFileSync(`${queueConfig.shared_storage}/${federationRevision._id}/obj.json`, JSON.stringify(fileContent));

			const modelUpdatePromise = waitForEvent(socket, EVENTS.FEDERATION_SETTINGS_UPDATE);
			const newRevisionPromise = waitForEvent(socket, EVENTS.FEDERATION_NEW_REVISION);

			await queueMessage(queueConfig.callback_queue, federationRevision._id, JSON.stringify(content));

			const modelUpdateResults = await modelUpdatePromise;
			expect(modelUpdateResults?.data?.timestamp).not.toBeUndefined();
			expect(modelUpdateResults).toEqual({ ...data,
				data: { containers: [{ _id: container._id }], status: 'ok', timestamp: modelUpdateResults.data.timestamp } });

			const newRevisionResults = await newRevisionPromise;
			expect(newRevisionResults?.data?.timestamp).not.toBeUndefined();
			expect(newRevisionResults).toEqual(expect.objectContaining({ ...data,
				data: {
					_id: federationRevision._id,
					author: user.user,
					tag: federationRevision.tag,
					timestamp: newRevisionResults.data.timestamp,
					format: getRevisionFormat(federationRevision.rFile),
					desc: federationRevision.desc,
				} }));

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
	modelUploadTest();
	queueUpdateTest();
	queueFinishedTest();
});
