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

const { times } = require('lodash');
const ServiceHelper = require('../../../../helper/services');
const { src } = require('../../../../helper/path');
const SuperTest = require('supertest');
const { generateComment, generateTicket, generateRandomString } = require('../../../../helper/services');
const { basePropertyLabels, propTypes } = require('../../../../../../src/v5/schemas/tickets/templates.constants');

const { modelTypes } = require(`${src}/models/modelSettings.constants`);

const { EVENTS } = require(`${src}/services/chat/chat.constants`);
const { templates } = require(`${src}/utils/responseCodes`);

let agent;

const generateBasicData = () => {
	const basicData = {
		user: ServiceHelper.generateUserCredentials(),
		teamspace: ServiceHelper.generateRandomString(),
		project: ServiceHelper.generateRandomProject(),
		container: ServiceHelper.generateRandomModel(),
		federation: ServiceHelper.generateRandomModel({ modelType: modelTypes.FEDERATION }),
		template: ServiceHelper.generateTemplate(),
		templateWithComments: ServiceHelper.generateTemplate(false, false, { comments: true }),
	};

	return basicData;
};

const ticketAddedTest = () => {
	describe('On adding a new ticket', () => {
		const { user, teamspace, project, container, federation,
			template, templateWithComments } = generateBasicData();

		const containerTicket = ServiceHelper.generateTicket(template);
		const federationTicket = ServiceHelper.generateTicket(template);
		const containerComment = ServiceHelper.generateComment(user.user);
		const federationComment = ServiceHelper.generateComment(user.user);
		beforeAll(async () => {
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
			await ServiceHelper.db.createTemplates(teamspace, [template, templateWithComments]);
			await ServiceHelper.db.createTicket(teamspace, project.id, container._id, containerTicket);
			await ServiceHelper.db.createTicket(teamspace, project.id, federation._id, federationTicket);
			await ServiceHelper.db.createComment(teamspace, project.id, container._id, containerTicket._id,
				containerComment);
			await ServiceHelper.db.createComment(teamspace, project.id, federation._id, federationTicket._id,
				federationComment);
		},
		);

		test(`should trigger a ${EVENTS.CONTAINER_NEW_TICKET} event when a new container ticket has been added`, async () => {
			const socket = await ServiceHelper.socket.loginAndGetSocket(agent, user);

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
			const socket = await ServiceHelper.socket.loginAndGetSocket(agent, user);

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

const ticketsImportedTest = () => {
	describe('On importing tickets', () => {
		const { user, teamspace, project, container, federation,
			template, templateWithComments } = generateBasicData();

		const containerTicket = ServiceHelper.generateTicket(template);
		const federationTicket = ServiceHelper.generateTicket(template);
		const containerComment = ServiceHelper.generateComment(user.user);
		const federationComment = ServiceHelper.generateComment(user.user);

		beforeAll(async () => {
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
			await ServiceHelper.db.createTemplates(teamspace, [template, templateWithComments]);
			await ServiceHelper.db.createTicket(teamspace, project.id, container._id, containerTicket);
			await ServiceHelper.db.createTicket(teamspace, project.id, federation._id, federationTicket);
			await ServiceHelper.db.createComment(teamspace, project.id, container._id, containerTicket._id,
				containerComment);
			await ServiceHelper.db.createComment(teamspace, project.id, federation._id, federationTicket._id,
				federationComment);
		},
		);

		test(`should trigger ${EVENTS.CONTAINER_NEW_TICKET} events when a list of new container tickets have been added`, async () => {
			const socket = await ServiceHelper.socket.loginAndGetSocket(agent, user);

			const data = { teamspace, project: project.id, model: container._id };
			await ServiceHelper.socket.joinRoom(socket, data);

			const newTickets = times(10, () => generateTicket(template));
			const socketPromise = new Promise((resolve, reject) => {
				const eventsReceived = [];
				socket.on(EVENTS.CONTAINER_NEW_TICKET, (eventData) => {
					eventsReceived.push(eventData);
					if (eventsReceived.length === newTickets.length) resolve(eventsReceived);
				});
				setTimeout(reject, 1000);
			});

			const postRes = await agent.post(`/v5/teamspaces/${teamspace}/projects/${project.id}/containers/${container._id}/tickets/import?key=${user.apiKey}&template=${template._id}`)
				.send({ tickets: newTickets })
				.expect(templates.ok.status);

			const eventData = await socketPromise;

			const expectedData = await Promise.all(postRes.body.tickets.map(async (id, i) => {
				const getRes = await agent.get(`/v5/teamspaces/${teamspace}/projects/${project.id}/containers/${container._id}/tickets/${id}?key=${user.apiKey}`)
					.expect(templates.ok.status);

				return {
					...data,
					data: {
						...newTickets[i],
						_id: id,
						properties: {
							...newTickets[i].properties,
							[basePropertyLabels.OWNER]: getRes.body.properties[basePropertyLabels.OWNER],
							[basePropertyLabels.UPDATED_AT]:
                            new Date(getRes.body.properties[basePropertyLabels.UPDATED_AT]).getTime(),
							[basePropertyLabels.CREATED_AT]:
                            new Date(getRes.body.properties[basePropertyLabels.CREATED_AT]).getTime(),
							[basePropertyLabels.STATUS]: getRes.body.properties[basePropertyLabels.STATUS],
						},
						number: 1 + i,
					},
				};
			}));

			ServiceHelper.outOfOrderArrayEqual(eventData, expectedData);

			socket.close();
		});
		test(`should trigger ${EVENTS.FEDERATION_NEW_TICKET} events when a list of new federation tickets have been added`, async () => {
			const socket = await ServiceHelper.socket.loginAndGetSocket(agent, user);

			const data = { teamspace, project: project.id, model: federation._id };
			await ServiceHelper.socket.joinRoom(socket, data);

			const newTickets = times(10, () => generateTicket(template));
			const socketPromise = new Promise((resolve, reject) => {
				const eventsReceived = [];
				socket.on(EVENTS.FEDERATION_NEW_TICKET, (eventData) => {
					eventsReceived.push(eventData);
					if (eventsReceived.length === newTickets.length) resolve(eventsReceived);
				});
				setTimeout(reject, 1000);
			});

			const postRes = await agent.post(`/v5/teamspaces/${teamspace}/projects/${project.id}/federations/${federation._id}/tickets/import?key=${user.apiKey}&template=${template._id}`)
				.send({ tickets: newTickets })
				.expect(templates.ok.status);

			const eventData = await socketPromise;

			const expectedData = await Promise.all(postRes.body.tickets.map(async (id, i) => {
				const getRes = await agent.get(`/v5/teamspaces/${teamspace}/projects/${project.id}/federations/${federation._id}/tickets/${id}?key=${user.apiKey}`)
					.expect(templates.ok.status);

				return {
					...data,
					data: {
						...newTickets[i],
						_id: id,
						properties: {
							...newTickets[i].properties,
							[basePropertyLabels.OWNER]: getRes.body.properties[basePropertyLabels.OWNER],
							[basePropertyLabels.UPDATED_AT]:
                            new Date(getRes.body.properties[basePropertyLabels.UPDATED_AT]).getTime(),
							[basePropertyLabels.CREATED_AT]:
                            new Date(getRes.body.properties[basePropertyLabels.CREATED_AT]).getTime(),
							[basePropertyLabels.STATUS]: getRes.body.properties[basePropertyLabels.STATUS],
						},
						number: 1 + i,
					},
				};
			}));

			expect(eventData.length).toEqual(expectedData.length);
			expect(eventData).toEqual(expect.arrayContaining(expectedData));

			socket.close();
		});

		test(`should trigger ${EVENTS.CONTAINER_NEW_TICKET_COMMENT} events when a ticket with comments has been imported`, async () => {
			const socket = await ServiceHelper.socket.loginAndGetSocket(agent, user);

			const data = { teamspace, project: project.id, model: container._id };
			await ServiceHelper.socket.joinRoom(socket, data);

			const newTickets = times(1, () => ({ ...generateTicket(templateWithComments),
				comments: times(10, () => ServiceHelper.generateImportedComment(user.user)) }));
			const socketPromise = new Promise((resolve, reject) => {
				const eventsReceived = [];
				socket.on(EVENTS.CONTAINER_NEW_TICKET_COMMENT, (eventData) => {
					eventsReceived.push(eventData);
					if (eventsReceived.length === newTickets[0].comments.length) resolve(eventsReceived);
				});
				setTimeout(reject, 1000);
			});

			const postRes = await agent.post(`/v5/teamspaces/${teamspace}/projects/${project.id}/containers/${container._id}/tickets/import?key=${user.apiKey}&template=${templateWithComments._id}`)
				.send({ tickets: newTickets })
				.expect(templates.ok.status);

			const eventData = await socketPromise;

			const getRes = await agent.get(`/v5/teamspaces/${teamspace}/projects/${project.id}/containers/${container._id}/tickets/${postRes.body.tickets[0]}/comments?key=${user.apiKey}`)
				.expect(templates.ok.status);

			const { comments } = getRes.body;

			expect(comments.length).toEqual(newTickets[0].comments.length);

			const expectedData = newTickets[0].comments.map((comment) => {
				const resComment = comments.find(({ message }) => comment.message === message);

				const expectedComment = {
					...comment,
					_id: expect.any(String),
					images: expect.any(Array),
					createdAt: comment.createdAt.getTime(),
					updatedAt: expect.any(Number),
					importedAt: expect.any(Number),
				};
				expect(resComment).toEqual(expectedComment);

				return {
					...data,
					data: {
						...resComment,
						ticket: postRes.body.tickets[0],
					},
				};
			});

			expect(eventData.length).toEqual(expectedData.length);
			expect(eventData).toEqual(expect.arrayContaining(expectedData));

			socket.close();
		});

		test(`should trigger ${EVENTS.FEDERATION_NEW_TICKET_COMMENT} events when a ticket with comments has been imported`, async () => {
			const socket = await ServiceHelper.socket.loginAndGetSocket(agent, user);

			const data = { teamspace, project: project.id, model: federation._id };
			await ServiceHelper.socket.joinRoom(socket, data);

			const newTickets = times(1, () => ({ ...generateTicket(templateWithComments),
				comments: times(10, () => ServiceHelper.generateImportedComment(user.user)) }));
			const socketPromise = new Promise((resolve, reject) => {
				const eventsReceived = [];
				socket.on(EVENTS.FEDERATION_NEW_TICKET_COMMENT, (eventData) => {
					eventsReceived.push(eventData);
					if (eventsReceived.length === newTickets[0].comments.length) resolve(eventsReceived);
				});
				setTimeout(reject, 1000);
			});

			const postRes = await agent.post(`/v5/teamspaces/${teamspace}/projects/${project.id}/federations/${federation._id}/tickets/import?key=${user.apiKey}&template=${templateWithComments._id}`)
				.send({ tickets: newTickets })
				.expect(templates.ok.status);

			const eventData = await socketPromise;

			const getRes = await agent.get(`/v5/teamspaces/${teamspace}/projects/${project.id}/federations/${federation._id}/tickets/${postRes.body.tickets[0]}/comments?key=${user.apiKey}`)
				.expect(templates.ok.status);

			const { comments } = getRes.body;

			expect(comments.length).toEqual(newTickets[0].comments.length);

			const expectedData = newTickets[0].comments.map((comment) => {
				const resComment = comments.find(({ message }) => comment.message === message);

				const expectedComment = {
					...comment,
					_id: expect.any(String),
					images: expect.any(Array),
					createdAt: comment.createdAt.getTime(),
					updatedAt: expect.any(Number),
					importedAt: expect.any(Number),
				};
				expect(resComment).toEqual(expectedComment);

				return {
					...data,
					data: {
						...resComment,
						ticket: postRes.body.tickets[0],
					},
				};
			});

			expect(eventData.length).toEqual(expectedData.length);
			expect(eventData).toEqual(expect.arrayContaining(expectedData));

			socket.close();
		});
	});
};

const ticketUpdatedTest = () => {
	describe('On updating a ticket', () => {
		const { user, teamspace, project, container, federation,
			template, templateWithComments } = generateBasicData();

		const containerTicket = ServiceHelper.generateTicket(template);
		const federationTicket = ServiceHelper.generateTicket(template);
		const containerComment = ServiceHelper.generateComment(user.user);
		const federationComment = ServiceHelper.generateComment(user.user);

		beforeAll(async () => {
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
			await ServiceHelper.db.createTemplates(teamspace, [template, templateWithComments]);
			await ServiceHelper.db.createTicket(teamspace, project.id, container._id, containerTicket);
			await ServiceHelper.db.createTicket(teamspace, project.id, federation._id, federationTicket);
			await ServiceHelper.db.createComment(teamspace, project.id, container._id, containerTicket._id,
				containerComment);
			await ServiceHelper.db.createComment(teamspace, project.id, federation._id, federationTicket._id,
				federationComment);
		},
		);

		test(`should trigger a ${EVENTS.CONTAINER_UPDATE_TICKET} event when a container ticket has been updated`, async () => {
			const socket = await ServiceHelper.socket.loginAndGetSocket(agent, user);

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

const ticketsUpdatedTest = () => {
	describe('On updating many tickets', () => {
		const nTickets = 10;
		const { user, teamspace, project, container, federation,
			templateWithComments } = generateBasicData();

		const containerTickets = times(nTickets, () => ServiceHelper.generateTicket(templateWithComments));
		const federationTickets = times(nTickets, () => ServiceHelper.generateTicket(templateWithComments));

		beforeAll(async () => {
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
			await ServiceHelper.db.createTemplates(teamspace, [templateWithComments]);

			const addTicketRoute = (modelType, modelId) => `/v5/teamspaces/${teamspace}/projects/${project.id}/${modelType}s/${modelId}/tickets?key=${user.apiKey}`;

			await Promise.all([
				{ type: 'container', model: container._id, tickets: containerTickets },
				{ type: 'federation', model: federation._id, tickets: federationTickets },
			].map(async ({ type, model, tickets }) => {
				await Promise.all(tickets.map(async (ticket) => {
					const { body: { _id } } = await agent.post(addTicketRoute(type, model)).send(ticket);
					// eslint-disable-next-line no-param-reassign
					ticket._id = _id;
				}));
			}));
		});
		[
			{ type: 'container', model: container._id, tickets: containerTickets },
			{ type: 'federation', model: federation._id, tickets: federationTickets },
		].forEach(({ type, model, tickets }) => {
			const updateEvent = type === 'container' ? EVENTS.CONTAINER_UPDATE_TICKET : EVENTS.FEDERATION_UPDATE_TICKET;
			const newCommentEvent = type === 'container' ? EVENTS.CONTAINER_NEW_TICKET_COMMENT : EVENTS.FEDERATION_NEW_TICKET_COMMENT;
			test(`should trigger ${updateEvent} events when ${type} tickets has been updated`, async () => {
				const socket = await ServiceHelper.socket.loginAndGetSocket(agent, user);

				const data = { teamspace, project: project.id, model };
				await ServiceHelper.socket.joinRoom(socket, data);

				const socketPromise = new Promise((resolve, reject) => {
					const eventsReceived = [];
					socket.on(updateEvent, (eventData) => {
						eventsReceived.push(eventData);
						if (eventsReceived.length === nTickets) resolve(eventsReceived);
					});
					setTimeout(reject, 1000);
				});

				const propToUpdate = templateWithComments.properties.find((p) => p.type === propTypes.NUMBER
                && !p.deprecated).name;

				const modToUpdate = templateWithComments.modules.find((m) => m.properties.length > 0);
				const modPropToUpdate = modToUpdate.properties.find((p) => p.type === propTypes.TEXT
                && !p.deprecated).name;
				const modPropToUnset = modToUpdate.properties.find((p) => p.type === propTypes.NUMBER
                && !p.deprecated).name;

				const expectedData = [];

				const updateData = tickets.map(({ _id }) => {
					const newTitle = ServiceHelper.generateRandomString();
					const newPropValue = ServiceHelper.generateRandomNumber();
					const newModPropValue = ServiceHelper.generateRandomString();

					expectedData.push({
						...data,
						data: {
							_id,
							title: newTitle,
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

					return {
						_id,
						title: newTitle,
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
				});

				await agent.patch(`/v5/teamspaces/${teamspace}/projects/${project.id}/${type}s/${model}/tickets${ServiceHelper.createQueryString({ key: user.apiKey, template: templateWithComments._id })}`)
					.send({ tickets: updateData })
					.expect(templates.ok.status);

				const eventData = await socketPromise;

				ServiceHelper.outOfOrderArrayEqual(eventData, expectedData);

				socket.close();
			});

			test(`should NOT trigger ${updateEvent} events when ${type} tickets has been updated with only comments`, async () => {
				const socket = await ServiceHelper.socket.loginAndGetSocket(agent, user);

				const data = { teamspace, project: project.id, model };
				await ServiceHelper.socket.joinRoom(socket, data);

				const nComments = 2;

				const socketPromise = new Promise((resolve, reject) => {
					const updateEvents = [];
					const commentEvents = [];
					const nEventsToWait = nComments * nTickets;
					socket.on(updateEvent, (eventData) => {
						updateEvents.push(eventData);
					});

					socket.on(newCommentEvent, (eventData) => {
						commentEvents.push(eventData);
						if (commentEvents.length === nEventsToWait) resolve({ updateEvents, commentEvents });
					});
					setTimeout(reject, 1000);
				});

				const updateData = tickets.map(({ _id }) => ({
					_id,
					comments: times(nComments, () => ServiceHelper.generateImportedComment(user.user)),
				}));

				await agent.patch(`/v5/teamspaces/${teamspace}/projects/${project.id}/${type}s/${model}/tickets${ServiceHelper.createQueryString({ key: user.apiKey, template: templateWithComments._id })}`)
					.send({ tickets: updateData })
					.expect(templates.ok.status);

				const { updateEvents, commentEvents } = await socketPromise;

				expect(updateEvents.length).toBe(0);
				expect(commentEvents.length).toBe(nTickets * nComments);

				socket.close();
			});
		});
	});
};

const commentAddedTest = () => {
	describe('On adding a new comment', () => {
		const { user, teamspace, project, container, federation,
			template, templateWithComments } = generateBasicData();

		const containerTicket = ServiceHelper.generateTicket(template);
		const federationTicket = ServiceHelper.generateTicket(template);
		const containerComment = ServiceHelper.generateComment(user.user);
		const federationComment = ServiceHelper.generateComment(user.user);

		beforeAll(async () => {
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
			await ServiceHelper.db.createTemplates(teamspace, [template, templateWithComments]);
			await ServiceHelper.db.createTicket(teamspace, project.id, container._id, containerTicket);
			await ServiceHelper.db.createTicket(teamspace, project.id, federation._id, federationTicket);
			await ServiceHelper.db.createComment(teamspace, project.id, container._id, containerTicket._id,
				containerComment);
			await ServiceHelper.db.createComment(teamspace, project.id, federation._id, federationTicket._id,
				federationComment);
		},
		);
		test(`should trigger a ${EVENTS.CONTAINER_NEW_TICKET_COMMENT} event when a new container ticket comment has been added`, async () => {
			const socket = await ServiceHelper.socket.loginAndGetSocket(agent, user);

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
				data: { _id: commentId,
					ticket: containerTicket._id,
					createdAt,
					updatedAt: createdAt,
					author,
					images,
					message },
			});

			socket.close();
		});

		test(`should trigger a ${EVENTS.FEDERATION_NEW_TICKET_COMMENT} event when a new federation ticket comment has been added`, async () => {
			const socket = await ServiceHelper.socket.loginAndGetSocket(agent, user);

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
				data: { _id: commentId,
					ticket: federationTicket._id,
					createdAt,
					updatedAt: createdAt,
					author,
					images,
					message },
			});

			socket.close();
		});
	});
};

const commentUpdatedTest = () => {
	describe('On updating a comment', () => {
		const { user, teamspace, project, container, federation,
			template, templateWithComments } = generateBasicData();

		const containerTicket = ServiceHelper.generateTicket(template);
		const federationTicket = ServiceHelper.generateTicket(template);
		const containerComment = ServiceHelper.generateComment(user.user);
		const federationComment = ServiceHelper.generateComment(user.user);

		beforeAll(async () => {
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
			await ServiceHelper.db.createTemplates(teamspace, [template, templateWithComments]);
			await ServiceHelper.db.createTicket(teamspace, project.id, container._id, containerTicket);
			await ServiceHelper.db.createTicket(teamspace, project.id, federation._id, federationTicket);
			await ServiceHelper.db.createComment(teamspace, project.id, container._id, containerTicket._id,
				containerComment);
			await ServiceHelper.db.createComment(teamspace, project.id, federation._id, federationTicket._id,
				federationComment);
		},
		);
		test(`should trigger a ${EVENTS.CONTAINER_UPDATE_TICKET_COMMENT} event when a container ticket comment has been updated`, async () => {
			const socket = await ServiceHelper.socket.loginAndGetSocket(agent, user);

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
			const socket = await ServiceHelper.socket.loginAndGetSocket(agent, user);

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
			const socket = await ServiceHelper.socket.loginAndGetSocket(agent, user);

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
		const { user, teamspace, project, container, federation } = generateBasicData();

		const templateWithView = ServiceHelper.generateTemplate(false, true);
		const containerTicketWithView = ServiceHelper.generateTicket(templateWithView);
		const federationTicketWithView = ServiceHelper.generateTicket(templateWithView);

		beforeAll(async () => {
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
			const socket = await ServiceHelper.socket.loginAndGetSocket(agent, user);

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
			const socket = await ServiceHelper.socket.loginAndGetSocket(agent, user);

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
	});

	afterAll(() => Promise.all([
		ServiceHelper.db.reset(),
		ServiceHelper.closeApp(server),
		chatApp.close()]));

	ticketAddedTest();
	ticketsImportedTest();
	ticketUpdatedTest();
	ticketsUpdatedTest();
	commentAddedTest();
	commentUpdatedTest();
	groupUpdatedTest();
});
