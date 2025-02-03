/**
 *  Copyright (C) 2023 3D Repo Ltd
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

const { cloneDeep, times } = require('lodash');
const SuperTest = require('supertest');
const ServiceHelper = require('../../../../../../helper/services');
const { src } = require('../../../../../../helper/path');

const { modelTypes } = require(`${src}/models/modelSettings.constants`);

const { templates } = require(`${src}/utils/responseCodes`);

let server;
let agent;

const generateBasicData = () => ({
	users: {
		tsAdmin: ServiceHelper.generateUserCredentials(),
		tsAdmin2: ServiceHelper.generateUserCredentials(),
		viewer: ServiceHelper.generateUserCredentials(),
		noProjectAccess: ServiceHelper.generateUserCredentials(),
		nobody: ServiceHelper.generateUserCredentials(),
	},
	teamspace: ServiceHelper.generateRandomString(),
	project: ServiceHelper.generateRandomProject(),
	con: ServiceHelper.generateRandomModel(),
	fed: ServiceHelper.generateRandomModel({ modelType: modelTypes.FEDERATION }),
});

const setupBasicData = async (users, teamspace, project, models) => {
	await ServiceHelper.db.createTeamspace(teamspace, [users.tsAdmin.user, users.tsAdmin2.user]);

	const userProms = Object.keys(users).map((key) => ServiceHelper.db.createUser(users[key], key !== 'nobody' ? [teamspace] : []));
	const modelProms = models.map((model) => ServiceHelper.db.createModel(
		teamspace,
		model._id,
		model.name,
		model.properties,
	));
	await Promise.all([
		...userProms,
		...modelProms,
		ServiceHelper.db.createProject(teamspace, project.id, project.name, models.map(({ _id }) => _id)),
	]);
};

const testGetComment = () => {
	describe('Get comment', () => {
		const { users, teamspace, project, con, fed } = generateBasicData();
		const template = ServiceHelper.generateTemplate(false, false, { comments: true });

		beforeAll(async () => {
			await setupBasicData(users, teamspace, project, [con, fed]);
			await ServiceHelper.db.createTemplates(teamspace, [template]);

			await Promise.all([fed, con].map(async (model) => {
				const ticket = ServiceHelper.generateTicket(template);
				const comment = ServiceHelper.generateComment();

				const modelType = fed === model ? 'federation' : 'container';
				const addTicketRoute = (modelId) => `/v5/teamspaces/${teamspace}/projects/${project.id}/${modelType}s/${modelId}/tickets?key=${users.tsAdmin.apiKey}`;
				const addCommentRoute = (modelId, ticketId) => `/v5/teamspaces/${teamspace}/projects/${project.id}/${modelType}s/${modelId}/tickets/${ticketId}/comments?key=${users.tsAdmin.apiKey}`;
				const ticketRes = await agent.post(addTicketRoute(model._id)).send(ticket);
				ticket._id = ticketRes.body._id;

				// eslint-disable-next-line no-param-reassign
				model.ticket = ticket;

				const commentRes = await agent.post(addCommentRoute(model._id, model.ticket._id)).send(comment);
				comment._id = commentRes.body._id;
				// eslint-disable-next-line no-param-reassign
				model.comment = comment;
			}));
		});

		const generateTestData = (isFed) => {
			const modelType = isFed ? 'federation' : 'container';
			const wrongTypeModel = isFed ? con : fed;
			const model = isFed ? fed : con;
			const modelNotFound = isFed ? templates.federationNotFound : templates.containerNotFound;
			const baseRouteParams = { key: users.tsAdmin.apiKey, projectId: project.id, model, modelType };

			return [
				['the user does not have a valid session', { ...baseRouteParams, key: null }, false, templates.notLoggedIn],
				['the user is not a member of the teamspace', { ...baseRouteParams, key: users.nobody.apiKey }, false, templates.teamspaceNotFound],
				['the project does not exist', { ...baseRouteParams, projectId: ServiceHelper.generateRandomString() }, false, templates.projectNotFound],
				[`the ${modelType} does not exist`, { ...baseRouteParams, model: ServiceHelper.generateRandomModel() }, false, modelNotFound],
				[`the model provided is not a ${modelType}`, { ...baseRouteParams, model: wrongTypeModel }, false, modelNotFound],
				[`the user does not have access to the ${modelType}`, { ...baseRouteParams, key: users.noProjectAccess.apiKey }, false, templates.notAuthorized],
				['the ticket does not exist', { ...baseRouteParams, ticketId: ServiceHelper.generateRandomString() }, false, templates.ticketNotFound],
				['the comment does not exist', { ...baseRouteParams, commentId: ServiceHelper.generateRandomString() }, false, templates.commentNotFound],
				['the comment id is valid', baseRouteParams, true],
			];
		};

		const runTest = (desc, { model, ...routeParams }, success, expectedOutput) => {
			const getRoute = ({ key, projectId, modelId, ticketId, commentId, modelType }) => `/v5/teamspaces/${teamspace}/projects/${projectId}/${modelType}s/${modelId}/tickets/${ticketId}/comments/${commentId}${key ? `?key=${key}` : ''}`;

			test(`should ${success ? 'succeed' : `fail with ${expectedOutput.code}`} if ${desc}`, async () => {
				const endpoint = getRoute({ modelId: model._id,
					ticketId: model.ticket?._id,
					commentId: model.comment?._id,
					...routeParams });
				const expectedStatus = success ? templates.ok.status : expectedOutput.status;

				const res = await agent.get(endpoint).expect(expectedStatus);

				if (success) {
					const expectedComment = cloneDeep(model.comment);
					expectedComment.author = users.tsAdmin.user;
					expectedComment.createdAt = res.body.createdAt;
					expectedComment.updatedAt = res.body.updatedAt;
					expectedComment.images = res.body.images;
					expect(res.body).toEqual(expectedComment);
				} else {
					expect(res.body.code).toEqual(expectedOutput.code);
				}
			});
		};

		describe.each(generateTestData(true))('Federations', runTest);
		describe.each(generateTestData())('Containers', runTest);
	});
};

const testGetCommentsList = () => {
	describe('Get comments list', () => {
		const { users, teamspace, project, con, fed } = generateBasicData();
		const template = ServiceHelper.generateTemplate(false, false, { comments: true });

		beforeAll(async () => {
			await setupBasicData(users, teamspace, project, [con, fed]);
			await ServiceHelper.db.createTemplates(teamspace, [template]);

			await Promise.all([fed, con].map(async (model) => {
				const ticket = ServiceHelper.generateTicket(template);
				const modelType = fed === model ? 'federation' : 'container';
				const addTicketRoute = (modelId) => `/v5/teamspaces/${teamspace}/projects/${project.id}/${modelType}s/${modelId}/tickets?key=${users.tsAdmin.apiKey}`;
				const addCommentRoute = (modelId, ticketId) => `/v5/teamspaces/${teamspace}/projects/${project.id}/${modelType}s/${modelId}/tickets/${ticketId}/comments?key=${users.tsAdmin.apiKey}`;

				const ticketRes = await agent.post(addTicketRoute(model._id)).send(ticket);
				ticket._id = ticketRes.body._id;
				/* eslint-disable no-param-reassign */
				model.ticket = ticket;

				model.comments = await Promise.all(times(10, async () => {
					const comment = ServiceHelper.generateComment();
					const commentRes = await agent.post(addCommentRoute(model._id, model.ticket._id)).send(comment);
					comment._id = commentRes.body._id;
					return comment;
				}));
				/* eslint-enable no-param-reassign */
			}));
		});

		const generateTestData = (isFed) => {
			const orderCheck = (prop, descending) => (comments) => {
				let lastValue;

				comments.forEach((comment) => {
					if (lastValue && lastValue !== comment[prop]) {
						expect(comment[prop] > lastValue).toBe(!descending);
					}

					lastValue = comment[prop];
				});
			};
			const modelType = isFed ? 'federation' : 'container';
			const wrongTypeModel = isFed ? con : fed;
			const model = isFed ? fed : con;
			const modelNotFound = isFed ? templates.federationNotFound : templates.containerNotFound;
			const baseRouteParams = { key: users.tsAdmin.apiKey, projectId: project.id, model, modelType, orderChecker: orderCheck('createdAt', true) };

			return [
				['the user does not have a valid session', { ...baseRouteParams, key: null }, false, templates.notLoggedIn],
				['the user is not a member of the teamspace', { ...baseRouteParams, key: users.nobody.apiKey }, false, templates.teamspaceNotFound],
				['the project does not exist', { ...baseRouteParams, projectId: ServiceHelper.generateRandomString() }, false, templates.projectNotFound],
				[`the ${modelType} does not exist`, { ...baseRouteParams, model: ServiceHelper.generateRandomModel() }, false, modelNotFound],
				[`the model provided is not a ${modelType}`, { ...baseRouteParams, model: wrongTypeModel }, false, modelNotFound],
				[`the user does not have access to the ${modelType}`, { ...baseRouteParams, key: users.noProjectAccess.apiKey }, false, templates.notAuthorized],
				['the ticket does not exist', { ...baseRouteParams, ticketId: ServiceHelper.generateRandomString() }, false, templates.ticketNotFound],
				['the ticket id is valid', baseRouteParams, true],
				['the ticket id is valid and updatedSince is specified to a future date', { ...baseRouteParams, options: { updatedSince: Date.now() + 10000 } }, true, []],
				['the ticket id is valid and comments are sorted by updated date in ascending order', { ...baseRouteParams, options: { sortBy: 'updatedAt', sortDesc: false }, orderChecker: orderCheck('updatedAt', false) }, true],
				['the ticket id is valid and comments are sorted by updated date in descending order', { ...baseRouteParams, options: { sortBy: 'updatedAt', sortDesc: true }, orderChecker: orderCheck('updatedAt', true) }, true],
			];
		};

		const commentsById = (comments) => {
			const res = {};

			comments.forEach((comment) => {
				res[comment._id] = comment;
			});

			return res;
		};

		const runTest = (desc, { model, orderChecker, options = {}, ...routeParams }, success, expectedOutput) => {
			const getRoute = ({ key, projectId, modelId, ticketId, modelType }) => `/v5/teamspaces/${teamspace}/projects/${projectId}/${modelType}s/${modelId}/tickets/${ticketId}/comments${ServiceHelper.createQueryString({ key, ...options })}`;

			test(`should ${success ? 'succeed' : `fail with ${expectedOutput.code}`} if ${desc}`, async () => {
				const endpoint = getRoute({ modelId: model._id, ticketId: model.ticket?._id, ...routeParams });
				const expectedStatus = success ? templates.ok.status : expectedOutput.status;

				const res = await agent.get(endpoint).expect(expectedStatus);

				if (success) {
					const expectedComments = expectedOutput || model.comments;
					expect(res.body.comments.length).toEqual(expectedComments.length);

					if (expectedComments.length) {
						const commentsByIdMap = commentsById(expectedComments);

						res.body.comments.forEach((comment) => {
							const { images, author, createdAt, updatedAt, ...others } = commentsByIdMap[comment._id];

							if (images) {
								expect(images.length).toEqual(comment.images.length);
							}

							expect(comment).toEqual(expect.objectContaining(others));
						});
					}

					orderChecker(res.body.comments);
				} else {
					expect(res.body.code).toEqual(expectedOutput.code);
				}
			});
		};

		describe.each(generateTestData(true))('Federations', runTest);
		describe.each(generateTestData())('Containers', runTest);
	});
};

const testCreateComment = () => {
	describe('Create comment', () => {
		const { users, teamspace, project, con, fed } = generateBasicData();
		const template = ServiceHelper.generateTemplate(false, false, { comments: true });
		const comment = ServiceHelper.generateComment();

		beforeAll(async () => {
			await setupBasicData(users, teamspace, project, [con, fed]);
			await ServiceHelper.db.createTemplates(teamspace, [template]);

			await Promise.all([fed, con].map(async (model) => {
				const ticket = ServiceHelper.generateTicket(template);

				const modelType = fed === model ? 'federation' : 'container';
				const addTicketRoute = (modelId) => `/v5/teamspaces/${teamspace}/projects/${project.id}/${modelType}s/${modelId}/tickets?key=${users.tsAdmin.apiKey}`;

				const ticketRes = await agent.post(addTicketRoute(model._id)).send(ticket);
				ticket._id = ticketRes.body._id;
				// eslint-disable-next-line no-param-reassign
				model.ticket = ticket;
			}));
		});

		const generateTestData = (isFed) => {
			const modelType = isFed ? 'federation' : 'container';
			const wrongTypeModel = isFed ? con : fed;
			const model = isFed ? fed : con;
			const modelNotFound = isFed ? templates.federationNotFound : templates.containerNotFound;
			const baseRouteParams = { key: users.tsAdmin.apiKey, projectId: project.id, model, modelType };

			return [
				['the user does not have a valid session', { ...baseRouteParams, key: null }, false, templates.notLoggedIn],
				['the user is not a member of the teamspace', { ...baseRouteParams, key: users.nobody.apiKey }, false, templates.teamspaceNotFound],
				['the project does not exist', { ...baseRouteParams, projectId: ServiceHelper.generateRandomString() }, false, templates.projectNotFound],
				[`the ${modelType} does not exist`, { ...baseRouteParams, model: ServiceHelper.generateRandomModel() }, false, modelNotFound],
				[`the model provided is not a ${modelType}`, { ...baseRouteParams, model: wrongTypeModel }, false, modelNotFound],
				[`the user does not have access to the ${modelType}`, { ...baseRouteParams, key: users.noProjectAccess.apiKey }, false, templates.notAuthorized],
				['the ticket does not exist', { ...baseRouteParams, ticketId: ServiceHelper.generateRandomString() }, false, templates.ticketNotFound],
				['the ticket id is valid', baseRouteParams, true],
			];
		};

		const runTest = (desc, { model, ...routeParams }, success, expectedOutput) => {
			const postRoute = ({ key, projectId, modelId, ticketId, modelType }) => `/v5/teamspaces/${teamspace}/projects/${projectId}/${modelType}s/${modelId}/tickets/${ticketId}/comments/${key ? `?key=${key}` : ''}`;

			test(`should ${success ? 'succeed' : `fail with ${expectedOutput.code}`} if ${desc}`, async () => {
				const endpoint = postRoute({ modelId: model._id, ticketId: model.ticket?._id, ...routeParams });
				const expectedStatus = success ? templates.ok.status : expectedOutput.status;

				const res = await agent.post(endpoint).send(comment).expect(expectedStatus);

				if (success) {
					expect(res.body._id).not.toBeUndefined();

					const getEndpoint = `/v5/teamspaces/${teamspace}/projects/${project.id}/${routeParams.modelType}s/${model._id}/tickets/${model.ticket?._id}/comments/${res.body._id}?key=${users.tsAdmin.apiKey}`;
					await agent.get(getEndpoint).expect(templates.ok.status);
				} else {
					expect(res.body.code).toEqual(expectedOutput.code);
				}
			});
		};

		describe.each(generateTestData(true))('Federations', runTest);
		describe.each(generateTestData())('Containers', runTest);
	});
};

const testUpdateComment = () => {
	describe('Update comment', () => {
		const { users, teamspace, project, con, fed } = generateBasicData();
		const template = ServiceHelper.generateTemplate(false, false, { comments: true });

		beforeAll(async () => {
			await setupBasicData(users, teamspace, project, [con, fed]);
			await ServiceHelper.db.createTemplates(teamspace, [template]);

			await Promise.all([fed, con].map(async (model) => {
				const ticket = ServiceHelper.generateTicket(template);
				const comment = ServiceHelper.generateComment();

				const modelType = fed === model ? 'federation' : 'container';
				const addTicketRoute = (modelId) => `/v5/teamspaces/${teamspace}/projects/${project.id}/${modelType}s/${modelId}/tickets?key=${users.tsAdmin.apiKey}`;
				const addCommentRoute = (modelId, ticketId) => `/v5/teamspaces/${teamspace}/projects/${project.id}/${modelType}s/${modelId}/tickets/${ticketId}/comments?key=${users.tsAdmin.apiKey}`;
				const ticketRes = await agent.post(addTicketRoute(model._id)).send(ticket);
				ticket._id = ticketRes.body._id;
				const commentRes = await agent.post(addCommentRoute(model._id, ticket._id)).send(comment);
				comment._id = commentRes.body._id;

				// eslint-disable-next-line no-param-reassign
				model.ticket = ticket;
				// eslint-disable-next-line no-param-reassign
				model.comment = comment;
			}));
		});

		const generateTestData = (isFed) => {
			const modelType = isFed ? 'federation' : 'container';
			const wrongTypeModel = isFed ? con : fed;
			const model = isFed ? fed : con;
			const modelNotFound = isFed ? templates.federationNotFound : templates.containerNotFound;
			const baseRouteParams = { key: users.tsAdmin.apiKey, projectId: project.id, model, modelType };

			return [
				['the user does not have a valid session', { ...baseRouteParams, key: null }, false, templates.notLoggedIn],
				['the user is not a member of the teamspace', { ...baseRouteParams, key: users.nobody.apiKey }, false, templates.teamspaceNotFound],
				['the user is not the author of the comment', { ...baseRouteParams, key: users.tsAdmin2.apiKey }, false, templates.notAuthorized],
				['the project does not exist', { ...baseRouteParams, projectId: ServiceHelper.generateRandomString() }, false, templates.projectNotFound],
				[`the ${modelType} does not exist`, { ...baseRouteParams, model: ServiceHelper.generateRandomModel() }, false, modelNotFound],
				[`the model provided is not a ${modelType}`, { ...baseRouteParams, model: wrongTypeModel }, false, modelNotFound],
				[`the user does not have access to the ${modelType}`, { ...baseRouteParams, key: users.noProjectAccess.apiKey }, false, templates.notAuthorized],
				['the ticket does not exist', { ...baseRouteParams, ticketId: ServiceHelper.generateRandomString() }, false, templates.ticketNotFound],
				['the comment does not exist', { ...baseRouteParams, commentId: ServiceHelper.generateRandomString() }, false, templates.commentNotFound],
				['the comment id is valid', baseRouteParams, true],
			];
		};

		const runTest = (desc, { model, ...routeParams }, success, expectedOutput) => {
			const putRoute = ({ key, projectId, modelId, ticketId, modelType, commentId }) => `/v5/teamspaces/${teamspace}/projects/${projectId}/${modelType}s/${modelId}/tickets/${ticketId}/comments/${commentId}${key ? `?key=${key}` : ''}`;

			test(`should ${success ? 'succeed' : `fail with ${expectedOutput.code}`} if ${desc}`, async () => {
				const endpoint = putRoute({
					modelId: model._id,
					ticketId: model.ticket?._id,
					commentId: model.comment?._id,
					...routeParams,
				});
				const expectedStatus = success ? templates.ok.status : expectedOutput.status;

				const updateData = { message: ServiceHelper.generateRandomString(), images: model.comment?.images };
				const res = await agent.put(endpoint).send(updateData).expect(expectedStatus);

				if (success) {
					const getEndpoint = `/v5/teamspaces/${teamspace}/projects/${project.id}/${routeParams.modelType}s/${model._id}/tickets/${model.ticket._id}/comments/${model.comment._id}?key=${users.tsAdmin.apiKey}`;
					const updatedCommentRes = await agent.get(getEndpoint).expect(templates.ok.status);
					const updatedComment = updatedCommentRes.body;
					const expectedComment = {
						...model.comment,
						...updateData,
						images: updatedComment.images,
						author: users.tsAdmin.user,
						createdAt: updatedComment.createdAt,
						updatedAt: updatedComment.updatedAt,
						history: [{
							message: model.comment.message,
							timestamp: updatedComment.createdAt,
							images: updatedComment.history[0].images,
						}],
					};

					expect(updatedComment).toEqual(expectedComment);
				} else {
					expect(res.body.code).toEqual(expectedOutput.code);
				}
			});
		};

		describe.each(generateTestData(true))('Federations', runTest);
		describe.each(generateTestData())('Containers', runTest);
	});
};

const testDeleteComment = () => {
	describe('Delete comment', () => {
		const { users, teamspace, project, con, fed } = generateBasicData();
		const template = ServiceHelper.generateTemplate(false, false, { comments: true });

		beforeAll(async () => {
			await setupBasicData(users, teamspace, project, [con, fed]);
			await ServiceHelper.db.createTemplates(teamspace, [template]);

			await Promise.all([fed, con].map(async (model) => {
				const ticket = ServiceHelper.generateTicket(template);
				const comment = ServiceHelper.generateComment();

				const modelType = fed === model ? 'federation' : 'container';
				const addTicketRoute = (modelId) => `/v5/teamspaces/${teamspace}/projects/${project.id}/${modelType}s/${modelId}/tickets?key=${users.tsAdmin.apiKey}`;
				const addCommentRoute = (modelId, ticketId) => `/v5/teamspaces/${teamspace}/projects/${project.id}/${modelType}s/${modelId}/tickets/${ticketId}/comments?key=${users.tsAdmin.apiKey}`;
				const ticketRes = await agent.post(addTicketRoute(model._id)).send(ticket);
				ticket._id = ticketRes.body._id;
				const commentRes = await agent.post(addCommentRoute(model._id, ticket._id)).send(comment);
				comment._id = commentRes.body._id;
				// eslint-disable-next-line no-param-reassign
				model.ticket = ticket;
				// eslint-disable-next-line no-param-reassign
				model.comment = comment;
			}));
		});

		const generateTestData = (isFed) => {
			const modelType = isFed ? 'federation' : 'container';
			const wrongTypeModel = isFed ? con : fed;
			const model = isFed ? fed : con;
			const modelNotFound = isFed ? templates.federationNotFound : templates.containerNotFound;
			const baseRouteParams = { key: users.tsAdmin.apiKey, projectId: project.id, model, modelType };

			return [
				['the user does not have a valid session', { ...baseRouteParams, key: null }, false, templates.notLoggedIn],
				['the user is not a member of the teamspace', { ...baseRouteParams, key: users.nobody.apiKey }, false, templates.teamspaceNotFound],
				['the user is not the author of the comment', { ...baseRouteParams, key: users.tsAdmin2.apiKey }, false, templates.notAuthorized],
				['the project does not exist', { ...baseRouteParams, projectId: ServiceHelper.generateRandomString() }, false, templates.projectNotFound],
				[`the ${modelType} does not exist`, { ...baseRouteParams, model: ServiceHelper.generateRandomModel() }, false, modelNotFound],
				[`the model provided is not a ${modelType}`, { ...baseRouteParams, model: wrongTypeModel }, false, modelNotFound],
				[`the user does not have access to the ${modelType}`, { ...baseRouteParams, key: users.noProjectAccess.apiKey }, false, templates.notAuthorized],
				['the ticket does not exist', { ...baseRouteParams, ticketId: ServiceHelper.generateRandomString() }, false, templates.ticketNotFound],
				['the comment does not exist', { ...baseRouteParams, commentId: ServiceHelper.generateRandomString() }, false, templates.commentNotFound],
				['the comment id is valid', baseRouteParams, true],
			];
		};

		const runTest = (desc, { model, ...routeParams }, success, expectedOutput) => {
			const deleteRoute = ({ key, projectId, modelId, ticketId, modelType, commentId }) => `/v5/teamspaces/${teamspace}/projects/${projectId}/${modelType}s/${modelId}/tickets/${ticketId}/comments/${commentId}${key ? `?key=${key}` : ''}`;

			test(`should ${success ? 'succeed' : `fail with ${expectedOutput.code}`} if ${desc}`, async () => {
				const endpoint = deleteRoute({ modelId: model._id,
					ticketId: model.ticket?._id,
					commentId: model.comment?._id,
					...routeParams });
				const expectedStatus = success ? templates.ok.status : expectedOutput.status;

				const res = await agent.delete(endpoint).expect(expectedStatus);

				if (success) {
					const getEndpoint = `/v5/teamspaces/${teamspace}/projects/${project.id}/${routeParams.modelType}s/${model._id}/tickets/${model.ticket._id}/comments/${model.comment._id}?key=${users.tsAdmin.apiKey}`;
					const deletedCommentRes = await agent.get(getEndpoint).expect(templates.ok.status);
					const deletedComment = deletedCommentRes.body;
					const expectedComment = {
						...model.comment,
						deleted: true,
						author: users.tsAdmin.user,
						createdAt: deletedComment.createdAt,
						updatedAt: deletedComment.updatedAt,
						history: [{
							message: model.comment.message,
							timestamp: deletedComment.createdAt,
							images: deletedComment.history[0].images,
						}],
					};
					delete expectedComment.message;
					delete expectedComment.images;

					expect(deletedComment).toEqual(expectedComment);
				} else {
					expect(res.body.code).toEqual(expectedOutput.code);
				}
			});
		};

		describe.each(generateTestData(true))('Federations', runTest);
		describe.each(generateTestData())('Containers', runTest);
	});
};

describe(ServiceHelper.determineTestGroup(__filename), () => {
	beforeAll(async () => {
		server = await ServiceHelper.app();
		agent = await SuperTest(server);
	});
	afterAll(() => ServiceHelper.closeApp(server));

	testGetComment();
	testGetCommentsList();
	testCreateComment();
	testUpdateComment();
	testDeleteComment();
});
