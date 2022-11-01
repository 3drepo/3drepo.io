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
const { generateTicket } = require('../../../../helper/services');
const { basePropertyLabels, propTypes } = require('../../../../../../src/v5/schemas/tickets/templates.constants');

const { EVENTS } = require(`${src}/services/chat/chat.constants`);
const { templates } = require(`${src}/utils/responseCodes`);

const user = ServiceHelper.generateUserCredentials();
const teamspace = ServiceHelper.generateRandomString();
const project = ServiceHelper.generateRandomProject();
const container = ServiceHelper.generateRandomModel();
const federation = ServiceHelper.generateRandomModel({ isFederation: true });
const template = ServiceHelper.generateTemplate();
const containerTicket = ServiceHelper.generateTicket(template);
const federationTicket = ServiceHelper.generateTicket(template);

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
		ServiceHelper.db.createProject(teamspace, project.id, project.name, [container._id, federation._id],
			[user.user]),
	]);
	await ServiceHelper.db.createTemplates(teamspace, [template]);
	await ServiceHelper.db.createTicket(teamspace, project.id, container._id, containerTicket);
	await ServiceHelper.db.createTicket(teamspace, project.id, federation._id, federationTicket);
};

const ticketAddedTest = () => {
	describe('On adding a new ticket', () => {
		test(`should trigger a ${EVENTS.CONTAINER_NEW_TICKET} event when a new container ticket has been added`, async () => {
			const socket = await ServiceHelper.socket.loginAndGetSocket(agent, user.user, user.password);

			const data = { teamspace, project: project.id, model: container._id };
			await ServiceHelper.socket.joinRoom(socket, data);

			const socketPromise = new Promise((resolve, reject) => {
				socket.on(EVENTS.CONTAINER_NEW_TICKET, resolve);
				setTimeout(reject, 1000);
			});

			const newTicket = generateTicket(template);
			const postRes = await agent.post(`/v5/teamspaces/${teamspace}/projects/${project.id}/containers/${container._id}/tickets/?key=${user.apiKey}`)
				.send(newTicket)
				.expect(templates.ok.status);

			const getRes = await agent.get(`/v5/teamspaces/${teamspace}/projects/${project.id}/containers/${container._id}/tickets/${postRes.body._id}?key=${user.apiKey}`)
				.expect(templates.ok.status);

			await expect(socketPromise).resolves.toEqual({
				...data,
				data: {
					...newTicket,
					_id: postRes.body._id,
					properties: {
						...newTicket.properties,
						[basePropertyLabels.OWNER]: getRes.body.properties[basePropertyLabels.OWNER],
						[basePropertyLabels.UPDATED_AT]:
                            new Date(getRes.body.properties[basePropertyLabels.UPDATED_AT]).getTime(),
						[basePropertyLabels.CREATED_AT]:
                            new Date(getRes.body.properties[basePropertyLabels.CREATED_AT]).getTime(),
					},
					number: 1,
				},
			});

			socket.close();
		});

		test(`should trigger a ${EVENTS.FEDERATION_NEW_TICKET} event when a new federation ticket has been added`, async () => {
			const socket = await ServiceHelper.socket.loginAndGetSocket(agent, user.user, user.password);

			const data = { teamspace, project: project.id, model: federation._id };
			await ServiceHelper.socket.joinRoom(socket, data);

			const socketPromise = new Promise((resolve, reject) => {
				socket.on(EVENTS.FEDERATION_NEW_TICKET, resolve);
				setTimeout(reject, 1000);
			});

			const newTicket = generateTicket(template);
			const postRes = await agent.post(`/v5/teamspaces/${teamspace}/projects/${project.id}/federations/${federation._id}/tickets/?key=${user.apiKey}`)
				.send(newTicket)
				.expect(templates.ok.status);

			const getRes = await agent.get(`/v5/teamspaces/${teamspace}/projects/${project.id}/federations/${federation._id}/tickets/${postRes.body._id}?key=${user.apiKey}`)
				.expect(templates.ok.status);

			await expect(socketPromise).resolves.toEqual({
				...data,
				data: {
					...newTicket,
					_id: postRes.body._id,
					properties: {
						...newTicket.properties,
						[basePropertyLabels.OWNER]: getRes.body.properties[basePropertyLabels.OWNER],
						[basePropertyLabels.UPDATED_AT]:
                            new Date(getRes.body.properties[basePropertyLabels.UPDATED_AT]).getTime(),
						[basePropertyLabels.CREATED_AT]:
                            new Date(getRes.body.properties[basePropertyLabels.CREATED_AT]).getTime(),
					},
					number: 1,
				},
			});

			socket.close();
		});
	});
};

const ticketUpdatedTest = () => {
	describe('On updating a ticket', () => {
		test(`should trigger a ${EVENTS.CONTAINER_UPDATE_TICKET} event when a container ticket has been updated`, async () => {
			const socket = await ServiceHelper.socket.loginAndGetSocket(agent, user.user, user.password);

			const data = { teamspace, project: project.id, model: container._id };
			await ServiceHelper.socket.joinRoom(socket, data);

			const socketPromise = new Promise((resolve, reject) => {
				socket.on(EVENTS.CONTAINER_UPDATE_TICKET, resolve);
				setTimeout(reject, 1000);
			});

			const propToUpdate = template.properties.find((p) => p.type === propTypes.NUMBER
                && !p.deprecated).name;
			const newPropValue = ServiceHelper.generateRandomNumber();
			const modToUpdate = template.modules.find((m) => m.properties.length > 0);
			const modPropToUpdate = modToUpdate.properties.find((p) => p.type === propTypes.TEXT
                && !p.deprecated).name;
			const modPropToUnset = modToUpdate.properties.find((p) => p.type === propTypes.NUMBER
                && !p.deprecated).name;
			const newModPropValue = ServiceHelper.generateRandomString();

			const updateData = {
				title: ServiceHelper.generateRandomString(),
				properties: {
					[propToUpdate]: newPropValue,
				},
				modules: {
					[modToUpdate.name]: {
						[modPropToUpdate]: newModPropValue,
						[modPropToUnset]: null,
					},
				},
			};

			await agent.patch(`/v5/teamspaces/${teamspace}/projects/${project.id}/containers/${container._id}/tickets/${containerTicket._id}?key=${user.apiKey}`)
				.send(updateData)
				.expect(templates.ok.status);

			await expect(socketPromise).resolves.toEqual({
				...data,
				data: {
					_id: containerTicket._id,
					title: updateData.title,
					properties: {
						[propToUpdate]: newPropValue,
					},
					modules: {
						[modToUpdate.name]: {
							[modPropToUpdate]: newModPropValue,
							[modPropToUnset]: null,
						},
					},
				},
			});

			socket.close();
		});
	});
};

describe('E2E Chat Service (Tickets)', () => {
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

	ticketAddedTest();
	ticketUpdatedTest();
});
