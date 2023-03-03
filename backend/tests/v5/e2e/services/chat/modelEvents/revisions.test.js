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
const containerRevision = ServiceHelper.generateRevisionEntry();

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
	]);
	await Promise.all([
		ServiceHelper.db.createUser(user, [teamspace]),
		ServiceHelper.db.createProject(teamspace, project.id, project.name, [container._id]),
		ServiceHelper.db.createRevision(teamspace, container._id, { ...containerRevision, author: user.user }),
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
