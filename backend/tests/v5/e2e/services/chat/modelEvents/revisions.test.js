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

const { modelTypes } = require(`${src}/models/modelSettings.constants`);
const { calibrationStatuses } = require(`${src}/models/calibrations.constants`);

const { EVENTS } = require(`${src}/services/chat/chat.constants`);
const { templates } = require(`${src}/utils/responseCodes`);

const user = ServiceHelper.generateUserCredentials();
const teamspace = ServiceHelper.generateRandomString();
const project = ServiceHelper.generateRandomProject();
const container = ServiceHelper.generateRandomModel();
const drawing = ServiceHelper.generateRandomModel({ modelType: modelTypes.DRAWING });
const containerRevision = ServiceHelper.generateRevisionEntry();
const drawingRevision = ServiceHelper.generateRevisionEntry(false, true, modelTypes.DRAWING);

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
			drawing._id,
			drawing.name,
			drawing.properties,
		),
	]);
	await Promise.all([
		ServiceHelper.db.createUser(user, [teamspace]),
		ServiceHelper.db.createProject(teamspace, project.id, project.name, [container._id, drawing._id]),
		ServiceHelper.db.createRevision(teamspace, project.id, container._id,
			{ ...containerRevision, author: user.user }),
		ServiceHelper.db.createRevision(teamspace, project.id, drawing._id,
			{ ...drawingRevision, author: user.user },
			modelTypes.DRAWING),
	]);
};

const revisionUpdateTest = () => {
	describe('On updating a revision', () => {
		test(`should trigger a ${EVENTS.CONTAINER_REVISION_UPDATE} event when a revision has been updated using revision Id`, async () => {
			const socket = await ServiceHelper.socket.loginAndGetSocket(agent, user.user, user.password);

			const data = { teamspace, project: project.id, model: container._id };
			await ServiceHelper.socket.joinRoom(socket, data);

			const socketPromise = new Promise((resolve, reject) => {
				socket.on(EVENTS.CONTAINER_REVISION_UPDATE, resolve);
				setTimeout(reject, 1000);
			});

			await agent.patch(`/v5/teamspaces/${teamspace}/projects/${project.id}/containers/${container._id}/revisions/${containerRevision._id}?key=${user.apiKey}`)
				.send({ void: true })
				.expect(templates.ok.status);

			await expect(socketPromise).resolves.toEqual({
				...data,
				data: {
					_id: containerRevision._id,
					void: true,
				},
			});

			socket.close();
		});

		test(`should trigger a ${EVENTS.CONTAINER_REVISION_UPDATE} event when a revision has been updated using revision tag`, async () => {
			const socket = await ServiceHelper.socket.loginAndGetSocket(agent, user.user, user.password);

			const data = { teamspace, project: project.id, model: container._id };
			await ServiceHelper.socket.joinRoom(socket, data);

			const socketPromise = new Promise((resolve, reject) => {
				socket.on(EVENTS.CONTAINER_REVISION_UPDATE, resolve);
				setTimeout(reject, 1000);
			});

			await agent.patch(`/v5/teamspaces/${teamspace}/projects/${project.id}/containers/${container._id}/revisions/${containerRevision.tag}?key=${user.apiKey}`)
				.send({ void: true })
				.expect(templates.ok.status);

			await expect(socketPromise).resolves.toEqual({
				...data,
				data: {
					_id: containerRevision._id,
					void: true,
				},
			});

			socket.close();
		});

		test(`should trigger a ${EVENTS.DRAWING_REVISION_UPDATE} event when a calibration has been updated`, async () => {
			const socket = await ServiceHelper.socket.loginAndGetSocket(agent, user.user, user.password);

			const data = { teamspace, project: project.id, model: drawing._id };
			await ServiceHelper.socket.joinRoom(socket, data);

			const socketPromise = new Promise((resolve, reject) => {
				socket.on(EVENTS.DRAWING_REVISION_UPDATE, resolve);
				setTimeout(reject, 1000);
			});

			const modelUpdateSocketPromise = new Promise((resolve, reject) => {
				socket.on(EVENTS.DRAWING_SETTINGS_UPDATE, resolve);
				setTimeout(reject, 1000);
			});

			const calibration = {
				horizontal: {
					model: [[0, 0, 0], [1, 1, 1]],
					drawing: [[0, 0], [1, 1]],
				},
				verticalRange: [ServiceHelper.generateRandomNumber(0, 5), ServiceHelper.generateRandomNumber(6, 10)],
				units: 'mm',
			};

			await agent.post(`/v5/teamspaces/${teamspace}/projects/${project.id}/drawings/${drawing._id}/revisions/${drawingRevision._id}/calibrations?key=${user.apiKey}`)
				.send(calibration)
				.expect(templates.ok.status);

			await expect(socketPromise).resolves.toEqual({
				...data,
				data: {
					_id: drawingRevision._id,
					calibration: calibrationStatuses.CALIBRATED,
				},
			});

			await expect(modelUpdateSocketPromise).resolves.toEqual({
				...data,
				data: {
					calibration: { verticalRange: calibration.verticalRange, units: calibration.units },
				},
			});

			// calibrating an already calibrated drawing should not trigger the event anymore
			const socketPromise2 = new Promise((resolve, reject) => {
				socket.on(EVENTS.DRAWING_REVISION_UPDATE, resolve);
				setTimeout(reject, 1000);
			});

			await agent.post(`/v5/teamspaces/${teamspace}/projects/${project.id}/drawings/${drawing._id}/revisions/${drawingRevision._id}/calibrations?key=${user.apiKey}`)
				.send(calibration)
				.expect(templates.ok.status);

			await expect(socketPromise2).rejects.toBeUndefined();

			socket.close();
		});

		test(`should trigger a ${EVENTS.DRAWING_REVISION_UPDATE} event when a drawing revision has been updated using revision Id`, async () => {
			const socket = await ServiceHelper.socket.loginAndGetSocket(agent, user.user, user.password);

			const data = { teamspace, project: project.id, model: drawing._id };
			await ServiceHelper.socket.joinRoom(socket, data);

			const socketPromise = new Promise((resolve, reject) => {
				socket.on(EVENTS.DRAWING_REVISION_UPDATE, resolve);
				setTimeout(reject, 1000);
			});

			await agent.patch(`/v5/teamspaces/${teamspace}/projects/${project.id}/drawings/${drawing._id}/revisions/${drawingRevision._id}?key=${user.apiKey}`)
				.send({ void: true })
				.expect(templates.ok.status);

			await expect(socketPromise).resolves.toEqual({
				...data,
				data: {
					_id: drawingRevision._id,
					void: true,
				},
			});

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

	revisionUpdateTest();
});
