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
const { generateComment, generateTicket, generateRandomString } = require('../../../../helper/services');
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
const containerComment = ServiceHelper.generateComment(user.user);
const federationComment = ServiceHelper.generateComment(user.user);

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
	await ServiceHelper.db.createComment(teamspace, project.id, container._id, containerTicket._id,
		containerComment);
	await ServiceHelper.db.createComment(teamspace, project.id, federation._id, federationTicket._id,
		federationComment);
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
						[basePropertyLabels.STATUS]: getRes.body.properties[basePropertyLabels.STATUS],
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
						[basePropertyLabels.STATUS]: getRes.body.properties[basePropertyLabels.STATUS],
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

const commentAddedTest = () => {
	describe('On adding a new comment', () => {
		test(`should trigger a ${EVENTS.CONTAINER_NEW_TICKET_COMMENT} event when a new container ticket comment has been added`, async () => {
			const socket = await ServiceHelper.socket.loginAndGetSocket(agent, user.user, user.password);

			const data = { teamspace, project: project.id, model: container._id };
			await ServiceHelper.socket.joinRoom(socket, data);

			const socketPromise = new Promise((resolve, reject) => {
				socket.on(EVENTS.CONTAINER_NEW_TICKET_COMMENT, resolve);
				setTimeout(reject, 1000);
			});

			const newComment = generateComment();
			const postRes = await agent.post(`/v5/teamspaces/${teamspace}/projects/${project.id}/containers/${container._id}/tickets/${containerTicket._id}/comments?key=${user.apiKey}`)
				.send(newComment)
				.expect(templates.ok.status);

			const commentId = postRes.body._id;
			const getRes = await agent.get(`/v5/teamspaces/${teamspace}/projects/${project.id}/containers/${container._id}/tickets/${containerTicket._id}/comments/${commentId}?key=${user.apiKey}`)
				.expect(templates.ok.status);

			const { createdAt, author, images, message } = getRes.body;
			await expect(socketPromise).resolves.toEqual({
				...data,
				data: { _id: commentId, ticket: containerTicket._id, createdAt, author, images, message },
			});

			socket.close();
		});

		test(`should trigger a ${EVENTS.FEDERATION_NEW_TICKET_COMMENT} event when a new federation ticket comment has been added`, async () => {
			const socket = await ServiceHelper.socket.loginAndGetSocket(agent, user.user, user.password);

			const data = { teamspace, project: project.id, model: federation._id };
			await ServiceHelper.socket.joinRoom(socket, data);

			const socketPromise = new Promise((resolve, reject) => {
				socket.on(EVENTS.FEDERATION_NEW_TICKET_COMMENT, resolve);
				setTimeout(reject, 1000);
			});

			const newComment = generateComment();
			const postRes = await agent.post(`/v5/teamspaces/${teamspace}/projects/${project.id}/federations/${federation._id}/tickets/${federationTicket._id}/comments?key=${user.apiKey}`)
				.send(newComment)
				.expect(templates.ok.status);

			const commentId = postRes.body._id;
			const getRes = await agent.get(`/v5/teamspaces/${teamspace}/projects/${project.id}/federations/${federation._id}/tickets/${federationTicket._id}/comments/${commentId}?key=${user.apiKey}`)
				.expect(templates.ok.status);

			const { createdAt, author, images, message } = getRes.body;
			await expect(socketPromise).resolves.toEqual({
				...data,
				data: { _id: commentId, ticket: federationTicket._id, createdAt, author, images, message },
			});

			socket.close();
		});
	});
};

const commentUpdatedTest = () => {
	describe('On updating a comment', () => {
		test(`should trigger a ${EVENTS.CONTAINER_UPDATE_TICKET_COMMENT} event when a container ticket comment has been updated`, async () => {
			const socket = await ServiceHelper.socket.loginAndGetSocket(agent, user.user, user.password);

			const data = { teamspace, project: project.id, model: container._id };
			await ServiceHelper.socket.joinRoom(socket, data);

			const socketPromise = new Promise((resolve, reject) => {
				socket.on(EVENTS.CONTAINER_UPDATE_TICKET_COMMENT, resolve);
				setTimeout(reject, 1000);
			});

			const updateData = { message: generateRandomString() };
			await agent.put(`/v5/teamspaces/${teamspace}/projects/${project.id}/containers/${container._id}/tickets/${containerTicket._id}/comments/${containerComment._id}?key=${user.apiKey}`)
				.send(updateData)
				.expect(templates.ok.status);

			const getRes = await agent.get(`/v5/teamspaces/${teamspace}/projects/${project.id}/containers/${container._id}/tickets/${containerTicket._id}/comments/${containerComment._id}?key=${user.apiKey}`)
				.expect(templates.ok.status);

			await expect(socketPromise).resolves.toEqual({
				...data,
				data: {
					_id: containerComment._id,
					ticket: containerTicket._id,
					message: updateData.message,
					author: containerComment.author,
					updatedAt: getRes.body.updatedAt,
				},
			});

			socket.close();
		});

		test(`should trigger a ${EVENTS.FEDERATION_UPDATE_TICKET_COMMENT} event when a federation ticket comment has been updated`, async () => {
			const socket = await ServiceHelper.socket.loginAndGetSocket(agent, user.user, user.password);

			const data = { teamspace, project: project.id, model: federation._id };
			await ServiceHelper.socket.joinRoom(socket, data);

			const socketPromise = new Promise((resolve, reject) => {
				socket.on(EVENTS.FEDERATION_UPDATE_TICKET_COMMENT, resolve);
				setTimeout(reject, 1000);
			});

			const updateData = { message: generateRandomString() };
			await agent.put(`/v5/teamspaces/${teamspace}/projects/${project.id}/federations/${federation._id}/tickets/${federationTicket._id}/comments/${federationComment._id}?key=${user.apiKey}`)
				.send(updateData)
				.expect(templates.ok.status);

			const getRes = await agent.get(`/v5/teamspaces/${teamspace}/projects/${project.id}/federations/${federation._id}/tickets/${federationTicket._id}/comments/${federationComment._id}?key=${user.apiKey}`)
				.expect(templates.ok.status);

			await expect(socketPromise).resolves.toEqual({
				...data,
				data: {
					_id: federationComment._id,
					ticket: federationTicket._id,
					message: updateData.message,
					author: federationComment.author,
					updatedAt: getRes.body.updatedAt,
				},
			});

			socket.close();
		});

		test(`should trigger a ${EVENTS.CONTAINER_UPDATE_TICKET_COMMENT} event when a container ticket comment has been deleted`, async () => {
			const socket = await ServiceHelper.socket.loginAndGetSocket(agent, user.user, user.password);

			const data = { teamspace, project: project.id, model: container._id };
			await ServiceHelper.socket.joinRoom(socket, data);

			const socketPromise = new Promise((resolve, reject) => {
				socket.on(EVENTS.CONTAINER_UPDATE_TICKET_COMMENT, resolve);
				setTimeout(reject, 1000);
			});

			await agent.delete(`/v5/teamspaces/${teamspace}/projects/${project.id}/containers/${container._id}/tickets/${containerTicket._id}/comments/${containerComment._id}?key=${user.apiKey}`)
				.expect(templates.ok.status);

			const getRes = await agent.get(`/v5/teamspaces/${teamspace}/projects/${project.id}/containers/${container._id}/tickets/${containerTicket._id}/comments/${containerComment._id}?key=${user.apiKey}`)
				.expect(templates.ok.status);

			await expect(socketPromise).resolves.toEqual({
				...data,
				data: {
					_id: containerComment._id,
					ticket: containerTicket._id,
					deleted: true,
					updatedAt: getRes.body.updatedAt,
				},
			});

			socket.close();
		});
	});
};

const groupUpdatedTest = () => {
	describe('Updating a group', () => {
		const templateWithView = ServiceHelper.generateTemplate(false, true);
		const containerTicketWithView = ServiceHelper.generateTicket(templateWithView);
		const federationTicketWithView = ServiceHelper.generateTicket(templateWithView);

		beforeAll(async () => {
			await ServiceHelper.db.createTemplates(teamspace, [templateWithView]);
			const addTicketRoute = (modelType, modelId) => `/v5/teamspaces/${teamspace}/projects/${project.id}/${modelType}s/${modelId}/tickets?key=${user.apiKey}`;
			const getTicketRoute = (modelType, modelId, ticketId) => `/v5/teamspaces/${teamspace}/projects/${project.id}/${modelType}s/${modelId}/tickets/${ticketId}?key=${user.apiKey}`;

			const [{ body: { _id: conTickId } }, { body: { _id: fedTickId } }] = await Promise.all([
				agent.post(addTicketRoute('container', container._id)).send(containerTicketWithView),
				agent.post(addTicketRoute('federation', federation._id)).send(federationTicketWithView),
			]);

			const [{ body: conTickRes }, { body: fedTicketRes }] = await Promise.all([
				agent.get(getTicketRoute('container', container._id, conTickId)),
				agent.get(getTicketRoute('federation', federation._id, fedTickId)),
			]);

			containerTicketWithView._id = conTickId;
			federationTicketWithView._id = fedTickId;

			[conTickRes, fedTicketRes].forEach((getRes) => {
				for (const field in getRes.properties) {
					if (getRes.properties[field]?.state) {
						const groupId = getRes.properties[field].state.hidden[1].group;
						const t = getRes === conTickRes ? containerTicketWithView : federationTicketWithView;
						t.group = groupId;
					}
				}
			});
		});

		test(`should trigger a ${EVENTS.CONTAINER_UPDATE_TICKET_GROUP} event when a container ticket group has been updated`, async () => {
			const socket = await ServiceHelper.socket.loginAndGetSocket(agent, user.user, user.password);

			const data = { teamspace, project: project.id, model: container._id };
			await ServiceHelper.socket.joinRoom(socket, data);

			const socketPromise = new Promise((resolve, reject) => {
				socket.on(EVENTS.CONTAINER_UPDATE_TICKET_GROUP, resolve);
				setTimeout(reject, 1000);
			});

			const updateData = { name: generateRandomString() };
			await agent.patch(`/v5/teamspaces/${teamspace}/projects/${project.id}/containers/${container._id}/tickets/${containerTicketWithView._id}/groups/${containerTicketWithView.group}?key=${user.apiKey}`)
				.send(updateData)
				.expect(templates.ok.status);

			await expect(socketPromise).resolves.toEqual({
				...data,
				data: {
					_id: containerTicketWithView.group,
					ticket: containerTicketWithView._id,
					...updateData,
				},
			});

			socket.close();
		});

		test(`should trigger a ${EVENTS.FEDERATION_UPDATE_TICKET_GROUP} event when a federation ticket group has been updated`, async () => {
			const socket = await ServiceHelper.socket.loginAndGetSocket(agent, user.user, user.password);

			const data = { teamspace, project: project.id, model: federation._id };
			await ServiceHelper.socket.joinRoom(socket, data);

			const socketPromise = new Promise((resolve, reject) => {
				socket.on(EVENTS.FEDERATION_UPDATE_TICKET_GROUP, resolve);
				setTimeout(reject, 1000);
			});

			const updateData = { name: generateRandomString() };
			await agent.patch(`/v5/teamspaces/${teamspace}/projects/${project.id}/federations/${federation._id}/tickets/${federationTicketWithView._id}/groups/${federationTicketWithView.group}?key=${user.apiKey}`)
				.send(updateData)
				.expect(templates.ok.status);

			await expect(socketPromise).resolves.toEqual({
				...data,
				data: {
					_id: federationTicketWithView.group,
					ticket: federationTicketWithView._id,
					...updateData,
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

	ticketAddedTest();
	ticketUpdatedTest();
	commentAddedTest();
	commentUpdatedTest();
	groupUpdatedTest();
});
