/**
 *  Copyright (C) 2026 3D Repo Ltd
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

const { isEmpty, times } = require('lodash');
const { determineTestGroup } = require('../../../../helper/utils');
const SuperTest = require('supertest');
const ServiceHelper = require('../../../../helper/services');
const { src } = require('../../../../helper/path');

const { queueMessage } = require(`${src}/handler/queue`);
const { modelTypes } = require(`${src}/models/modelSettings.constants`);
const { CLASH_RUNS_COL } = require(`${src}/models/clashes.constants`);
const DB = require(`${src}/handler/db`);
const { cn_queue: queueConfig } = require(`${src}/utils/config`);
const { callback_queue: callbackq, shared_storage: sharedDir } = queueConfig;
const { getTestRunByQuery } = require(`${src}/models/clashes.runs`);
const { CLASH_RUN_STATUS, RUN_HISTORY_COL } = require(`${src}/models/clashes.constants`);
const { getFileAsStream } = require(`${src}/services/filesManager`);
const { getPlanById } = require(`${src}/models/clashes.plans`);
const { stringToUUID } = require(`${src}/utils/helper/uuids`);
const { templates } = require(`${src}/utils/responseCodes`);
const { statuses: defaultStatuses } = require(`${src}/schemas/tickets/templates.constants`);
const fs = require('fs');
const path = require('path');

const { UUIDToString } = require(`${src}/utils/helper/uuids`);
const { deleteIfUndefined } = require(`${src}/utils/helper/objects`);

const SHARED_SPACE_TAG = '$SHARED_SPACE';

let server;
let agent;

const formatClash = (clash) => ({
	...clash,
	a: { container: clash.a.split('::')[0], idType: clash.a.split('::')[1], id: clash.a.split('::')[2] },
	b: { container: clash.b.split('::')[0], idType: clash.b.split('::')[1], id: clash.b.split('::')[2] },
	index: [clash.a, clash.b].sort().join('-'),
});

const setupBasicData = async ({ users, teamspace, project, models, federation, plan, template }) => {
	await ServiceHelper.db.createUser(users.tsAdmin);
	await ServiceHelper.db.createTeamspace(teamspace, [users.tsAdmin.user]);

	await Promise.all([
		ServiceHelper.db.createUser(users.projectAdmin, [teamspace]),
		ServiceHelper.db.createUser(users.unlicencedUser),
	]);

	await Promise.all([
		ServiceHelper.db.createProject(teamspace, project.id, project.name,
			[...models, federation].map((m) => m._id), [users.projectAdmin.user]),
		...[...models, federation].map((model) => ServiceHelper.db.createModel(
			teamspace,
			model._id,
			model.name,
			model.properties,
		)),
		ServiceHelper.db.createClashPlan(teamspace, project.id, plan),
		ServiceHelper.db.createTemplates(teamspace, [template]),
	]);
};

const generateBasicData = () => {
	const [tsAdmin, unlicencedUser, projectAdmin] = times(3,
		() => ServiceHelper.generateUserCredentials());

	const models = times(2, () => ServiceHelper.generateRandomModel());
	const federation = ServiceHelper.generateRandomModel({ modelType: modelTypes.FEDERATION });
	const template = ServiceHelper.generateTemplate();

	const plan = ServiceHelper.generateClashPlan(models[0]._id, models[1]._id);
	const project = ServiceHelper.generateRandomProject();

	return ({
		users: { tsAdmin, unlicencedUser, projectAdmin },
		teamspace: ServiceHelper.generateRandomString(),
		project,
		models,
		federation,
		plan,
		template,
	});
};

const testCreatePlan = () => {
	describe('Create clash test plan', () => {
		const route = (ts, project, key) => `/v5/teamspaces/${ts}/projects/${project}/clashes${key ? `?key=${key}` : ''}`;
		const basicData = generateBasicData();
		const commenterOnFed = ServiceHelper.generateUserCredentials();
		const viewerOnFed = ServiceHelper.generateUserCredentials();
		const customStatusValues = ServiceHelper.generateCustomStatusValues();
		const { teamspace, project, models, template, federation } = basicData;
		const templateWithCustomStatuses = ServiceHelper.generateTemplate(false, false, {
			status: { values: customStatusValues, default: customStatusValues[0].name },
		});
		const users = { ...basicData.users, commenterOnFed, viewerOnFed };

		federation.properties.permissions = [
			{ user: commenterOnFed.user, permission: 'commenter' },
			{ user: viewerOnFed.user, permission: 'viewer' },
		];

		const generatePlanData = (
			includeTicketObject,
			creator = users.tsAdmin.user,
			templateToUse = template,
			ticketOverrides = {},
		) => {
			const planData = ServiceHelper.generateClashPlan(
				models[0]._id, models[1]._id, includeTicketObject
					? { federation, template: templateToUse, creator } : undefined);
			if (planData.tickets) {
				planData.tickets = { ...planData.tickets, ...ticketOverrides };
			}
			return planData;
		};

		beforeAll(async () => {
			await setupBasicData(basicData);
			await ServiceHelper.db.createTemplates(teamspace, [templateWithCustomStatuses]);
		});

		describe.each([
			['teamspace is not found', { ts: ServiceHelper.generateRandomString() }, false, templates.teamspaceNotFound],
			['session is invalid', { user: { apiKey: ServiceHelper.generateRandomString() } }, false, templates.notLoggedIn],
			['user is not a member of the teamspace', { user: users.unlicencedUser }, false, templates.teamspaceNotFound],
			['the project does not exist', { proj: ServiceHelper.generateRandomString() }, false, templates.projectNotFound],
			['payload is invalid', { planData: { ...generatePlanData(), type: ServiceHelper.generateRandomString() } }, false, templates.invalidArguments],
			['user has access to a project', { user: users.projectAdmin }, true],
			['user is teamspace admin', {}, true],
			['payload contains ticket object', { planData: generatePlanData(true) }, true],
			['payload contains ticket object with built in default statuses', { planData: generatePlanData(true, users.tsAdmin.user, template, { defaultStatuses: { onNew: defaultStatuses.OPEN, onResolved: defaultStatuses.CLOSED, onReopened: defaultStatuses.IN_PROGRESS } }) }, true],
			['payload contains ticket object with custom default statuses', { planData: generatePlanData(true, users.tsAdmin.user, templateWithCustomStatuses, { defaultStatuses: { onNew: customStatusValues[0].name, onResolved: customStatusValues[1].name, onReopened: customStatusValues[2].name } }) }, true],
			['payload contains ticket object with empty default statuses', { planData: generatePlanData(true, users.tsAdmin.user, template, { defaultStatuses: {} }) }, true],
			['payload contains ticket object with invalid default statuses', { planData: generatePlanData(true, users.tsAdmin.user, template, { defaultStatuses: { onNew: ServiceHelper.generateRandomString() } }) }, false, templates.invalidArguments],
			['payload contains ticket object but creator is not specified', { planData: { ...generatePlanData(true), creator: undefined } }, true],
			['creator is a commenter', { planData: generatePlanData(true, users.commenterOnFed.user) }, true],
			['creator is a viewer', { planData: generatePlanData(true, users.viewerOnFed.user) }, false, templates.invalidArguments],
		])('', (desc, { ts = teamspace, proj = project.id, user = users.tsAdmin, planData = generatePlanData() }, success, expectedRes) => {
			test(`should ${success ? 'succeed' : 'fail'} if ${desc}`, async () => {
				const res = await agent.post(route(ts, proj, user.apiKey))
					.send(planData)
					.expect(expectedRes?.status || templates.ok.status);

				if (success) {
					const { tickets, ...plan } = await getPlanById(ts,
						stringToUUID(proj), stringToUUID(res.body._id));
					const { tickets: expectedTicketsObject, ...expectedPlanData } = planData;
					expect(plan).toEqual({
						...expectedPlanData,
						_id: plan._id,
						createdBy: user.user,
						createdAt: plan.createdAt,
					});

					if (tickets) {
						tickets.template = UUIDToString(tickets.template);
						const ticketDefaultStatuses = deleteIfUndefined(
							expectedTicketsObject.defaultStatuses ?? {}, true);
						if (expectedTicketsObject.defaultStatuses && isEmpty(ticketDefaultStatuses)) {
							delete expectedTicketsObject.defaultStatuses;
						} else if (expectedTicketsObject.defaultStatuses) {
							expectedTicketsObject.defaultStatuses = ticketDefaultStatuses;
						}

						expect(tickets).toEqual({
							creator: users.tsAdmin.user,
							...expectedTicketsObject,
						});
					}
				} else {
					expect(res.body.code).toEqual(expectedRes.code);
				}
			});
		});
	});
};

const testUpdatePlan = () => {
	describe('Update clash test plan', () => {
		const route = (ts, project, planId, key) => `/v5/teamspaces/${ts}/projects/${project}/clashes/${planId}${key ? `?key=${key}` : ''}`;

		const basicData = generateBasicData();

		const { users, teamspace, project, plan: existingPlan, federation, template, models } = basicData;
		const customStatusValues = ServiceHelper.generateCustomStatusValues();
		const templateWithCustomStatuses = ServiceHelper.generateTemplate(false, false, {
			status: { values: customStatusValues, default: customStatusValues[0].name },
		});

		const clashPlanWithTicketsConfig = {
			...ServiceHelper.generateClashPlan(
				models[0]._id, models[1]._id, { federation, template, creator: users.tsAdmin.user }),
		};
		const generatePlanWithTickets = (ticketDefaultStatuses) => {
			const plan = ServiceHelper.generateClashPlan(
				models[0]._id, models[1]._id, { federation, template, creator: users.tsAdmin.user });
			if (ticketDefaultStatuses) {
				plan.tickets.defaultStatuses = { ...ticketDefaultStatuses };
			}
			return plan;
		};
		const ticketDefaultStatuses = {
			onNew: defaultStatuses.OPEN,
			onResolved: defaultStatuses.CLOSED,
			onReopened: defaultStatuses.IN_PROGRESS,
		};
		const clashPlanWithDefaultStatuses = generatePlanWithTickets(ticketDefaultStatuses);
		const clashPlanWithoutDefaultStatuses = generatePlanWithTickets(undefined);
		const clashPlanForDefaultStatusUpdate = generatePlanWithTickets(ticketDefaultStatuses);
		const clashPlanForInvalidDefaultStatus = generatePlanWithTickets();
		const clashPlanForTemplateUpdate = generatePlanWithTickets({ onNew: defaultStatuses.OPEN });

		beforeAll(async () => {
			await setupBasicData(basicData);
			await Promise.all([
				ServiceHelper.db.createClashPlan(teamspace, project.id, clashPlanWithTicketsConfig),
				ServiceHelper.db.createClashPlan(teamspace, project.id, clashPlanWithDefaultStatuses),
				ServiceHelper.db.createClashPlan(teamspace, project.id, clashPlanWithoutDefaultStatuses),
				ServiceHelper.db.createClashPlan(teamspace, project.id, clashPlanForDefaultStatusUpdate),
				ServiceHelper.db.createClashPlan(teamspace, project.id, clashPlanForInvalidDefaultStatus),
				ServiceHelper.db.createClashPlan(teamspace, project.id, clashPlanForTemplateUpdate),
				ServiceHelper.db.createTemplates(teamspace, [templateWithCustomStatuses]),
			]);
		});

		const generateUpdateData = () => ({ name: ServiceHelper.generateRandomString() });

		describe.each([
			['teamspace is not found', { ts: ServiceHelper.generateRandomString() }, false, templates.teamspaceNotFound],
			['session is invalid', { user: { apiKey: ServiceHelper.generateRandomString() } }, false, templates.notLoggedIn],
			['user is not a member of the teamspace', { user: users.unlicencedUser }, false, templates.teamspaceNotFound],
			['the project does not exist', { proj: ServiceHelper.generateRandomString() }, false, templates.projectNotFound],
			['the plan does not exist', { planId: ServiceHelper.generateRandomString() }, false, templates.clashPlanNotFound],
			['payload is invalid', { planData: { type: ServiceHelper.generateRandomString() } }, false, templates.invalidArguments],
			['payload is invalid (no changes)', { planData: { name: existingPlan.name } }, false, templates.invalidArguments],
			['cannot remove required fields', { planData: { name: null } }, false, templates.invalidArguments],
			// note: order matters here, this must be done before "the no change test" as it uses the same payload
			['user has access to a project', { user: users.projectAdmin }, true],
			['user is teamspace admin', {}, true],
			['can remove optional field tickets.valuesAtCreation', { orgPlanData: clashPlanWithTicketsConfig, planId: clashPlanWithTicketsConfig._id, planData: { tickets: { valuesAtCreation: null } } }, true, { tickets: { valuesAtCreation: undefined } }],
			['can remove optional ticketsObject', { orgPlanData: clashPlanWithTicketsConfig, planId: clashPlanWithTicketsConfig._id, planData: { tickets: null } }, true, { tickets: undefined }],
			['can add ticket default statuses', { orgPlanData: clashPlanWithoutDefaultStatuses, planId: clashPlanWithoutDefaultStatuses._id, planData: { tickets: { defaultStatuses: ticketDefaultStatuses } } }, true, { tickets: { defaultStatuses: ticketDefaultStatuses } }],
			['can update ticket default statuses', { orgPlanData: clashPlanForDefaultStatusUpdate, planId: clashPlanForDefaultStatusUpdate._id, planData: { tickets: { defaultStatuses: { onNew: defaultStatuses.IN_PROGRESS } } } }, true, { tickets: { defaultStatuses: { ...ticketDefaultStatuses, onNew: defaultStatuses.IN_PROGRESS } } }],
			['can remove ticket default statuses when an update leaves an empty object', { orgPlanData: clashPlanWithDefaultStatuses, planId: clashPlanWithDefaultStatuses._id, planData: { tickets: { defaultStatuses: { onNew: null, onResolved: null, onReopened: null } } } }, true, { tickets: { defaultStatuses: undefined } }],
			['ticket default statuses are invalid', { planId: clashPlanForInvalidDefaultStatus._id, planData: { tickets: { defaultStatuses: { onNew: ServiceHelper.generateRandomString() } } } }, false, templates.invalidArguments],
			['template update invalidates stored ticket default statuses', { planId: clashPlanForTemplateUpdate._id, planData: { tickets: { template: templateWithCustomStatuses._id } } }, false, templates.invalidArguments],
		])('', (desc, { ts = teamspace, proj = project.id, user = users.tsAdmin, planId = existingPlan._id, orgPlanData = existingPlan, planData = generateUpdateData() }, success, expectedRes) => {
			test(`should ${success ? 'succeed' : 'fail'} if ${desc}`, async () => {
				const res = await agent.patch(route(ts, proj, planId, user.apiKey))
					.send(planData)
					.expect(expectedRes?.status || templates.ok.status);

				if (success) {
					const plan = await getPlanById(ts, stringToUUID(proj), stringToUUID(planId));
					const expectedPlan = {
						...orgPlanData,
						...planData,
						_id: plan._id,
						updatedAt: plan.updatedAt,
						updatedBy: user.user,
					};

					if (expectedRes) {
						if (expectedRes.tickets) {
							expectedPlan.tickets = deleteIfUndefined(
								{ ...orgPlanData.tickets, ...expectedRes.tickets }, true);
						} else if (planData.tickets) {
							expectedPlan.tickets = deleteIfUndefined({ ...expectedPlan.tickets,
								...planData.tickets }, true);
						} else {
							delete expectedPlan.tickets;
						}
					}
					expect(plan).toEqual(deleteIfUndefined(expectedPlan, true));
				} else {
					expect(res.body.code).toEqual(expectedRes.code);
				}
			});
		});
	});
};

const testDeletePlan = () => {
	describe('Delete clash test plan', () => {
		const route = (ts, project, planId, key) => `/v5/teamspaces/${ts}/projects/${project}/clashes/${planId}${key ? `?key=${key}` : ''}`;

		const basicData = generateBasicData();
		const { users, teamspace, project, plan: existingPlan } = basicData;

		beforeAll(async () => {
			await setupBasicData(basicData);
		});

		describe.each([
			['teamspace is not found', { ts: ServiceHelper.generateRandomString() }, false, templates.teamspaceNotFound],
			['session is invalid', { key: ServiceHelper.generateRandomString() }, false, templates.notLoggedIn],
			['user is not a member of the teamspace', { key: users.unlicencedUser.apiKey }, false, templates.teamspaceNotFound],
			['the project does not exist', { proj: ServiceHelper.generateRandomString() }, false, templates.projectNotFound],
			['the plan does not exist', { planId: ServiceHelper.generateRandomString() }, false, templates.clashPlanNotFound],
			['user is teamspace admin', {}, true],
		])('', (desc, { ts = teamspace, proj = project.id, key = users.tsAdmin.apiKey, planId = existingPlan._id }, success, expectedRes) => {
			test(`should ${success ? 'succeed' : 'fail'} if ${desc}`, async () => {
				const res = await agent.delete(route(ts, proj, planId, key))
					.expect(expectedRes?.status || templates.ok.status);

				if (success) {
					const planExists = await getPlanById(ts, stringToUUID(proj),
						stringToUUID(planId)).catch(() => false);
					expect(planExists).toBe(false);
				} else {
					expect(res.body.code).toEqual(expectedRes.code);
				}
			});
		});
	});
};

const testCreateRun = () => {
	describe('Create clash run', () => {
		const route = (ts, project, planId, key) => `/v5/teamspaces/${ts}/projects/${project}/clashes/${planId}/runs${key ? `?key=${key}` : ''}`;

		const basicData = generateBasicData();
		const nonAdminUser = ServiceHelper.generateUserCredentials();
		const modelWithNoRev = ServiceHelper.generateRandomModel();
		const modelWithVoidRev = ServiceHelper.generateRandomModel();
		const createRunModels = [modelWithNoRev, modelWithVoidRev];
		const projectWithOwnPlan = ServiceHelper.generateRandomProject();
		const projectWithOwnPlanModels = times(2, () => ServiceHelper.generateRandomModel());
		const { users, teamspace, project, models, plan: existingPlan } = basicData;
		const planWithNoRev = ServiceHelper.generateClashPlan(models[0]._id, modelWithNoRev._id);
		const planWithVoidRev = ServiceHelper.generateClashPlan(models[0]._id, modelWithVoidRev._id);
		const planInAnotherProject = ServiceHelper.generateClashPlan(
			projectWithOwnPlanModels[0]._id, projectWithOwnPlanModels[1]._id);

		beforeAll(async () => {
			await setupBasicData(basicData);
			await Promise.all([
				ServiceHelper.db.createUser(nonAdminUser, [teamspace]),
				DB.updateOne(teamspace, 'projects', { _id: stringToUUID(project.id) },
					{ $push: { models: { $each: createRunModels.map(({ _id }) => _id) } } }),
				...createRunModels.map((model) => ServiceHelper.db.createModel(
					teamspace,
					model._id,
					model.name,
					model.properties,
				)),
				...models.map((model) => ServiceHelper.db.createRevision(teamspace,
					project.id, model._id, ServiceHelper.generateRevisionEntry(), modelTypes.CONTAINER)),
				ServiceHelper.db.createRevision(teamspace,
					project.id, modelWithVoidRev._id, ServiceHelper.generateRevisionEntry(true), modelTypes.CONTAINER),
				ServiceHelper.db.createClashPlan(teamspace, project.id, planWithNoRev),
				ServiceHelper.db.createClashPlan(teamspace, project.id, planWithVoidRev),
				ServiceHelper.db.createProject(teamspace, projectWithOwnPlan.id, projectWithOwnPlan.name,
					projectWithOwnPlanModels.map(({ _id }) => _id)),
				...projectWithOwnPlanModels.map((model) => ServiceHelper.db.createModel(
					teamspace,
					model._id,
					model.name,
					model.properties,
				)),
				...projectWithOwnPlanModels.map((model) => ServiceHelper.db.createRevision(teamspace,
					projectWithOwnPlan.id, model._id, ServiceHelper.generateRevisionEntry(), modelTypes.CONTAINER)),
				ServiceHelper.db.createClashPlan(teamspace, projectWithOwnPlan.id, planInAnotherProject),
			]);
		});

		describe.each([
			['teamspace is not found', { ts: ServiceHelper.generateRandomString() }, false, templates.teamspaceNotFound],
			['session is invalid', { key: ServiceHelper.generateRandomString() }, false, templates.notLoggedIn],
			['user is not a member of the teamspace', { key: users.unlicencedUser.apiKey }, false, templates.teamspaceNotFound],
			['the project does not exist', { proj: ServiceHelper.generateRandomString() }, false, templates.projectNotFound],
			['the user is not a project admin', { key: nonAdminUser.apiKey }, false, templates.notAuthorized],
			['the plan does not exist', { planId: ServiceHelper.generateRandomString() }, false, templates.clashPlanNotFound],
			['the plan belongs to a different project', { planId: planInAnotherProject._id }, false, templates.clashPlanNotFound],
			['the plan has a container with no revisions', { planId: planWithNoRev._id }, false, templates.invalidArguments],
			['the plan has a container with void revisions', { planId: planWithVoidRev._id }, false, templates.invalidArguments],
			['user is teamspace admin', {}, true],
		])('', (desc, { ts = teamspace, proj = project.id, key = users.tsAdmin.apiKey, planId = existingPlan._id }, success, expectedRes) => {
			test(`should ${success ? 'succeed' : 'fail'} if ${desc}`, async () => {
				const res = await agent.post(route(ts, proj, planId, key))
					.expect(expectedRes?.status || templates.ok.status);

				if (success) {
					const id = res.body._id;
					const testRun = await DB.findOne(ts, CLASH_RUNS_COL, { _id: stringToUUID(id) });
					expect(testRun).toBeDefined();
				} else {
					expect(res.body.code).toEqual(expectedRes.code);
				}
			});
		});
	});
};

const testParseClashResults = () => {
	describe('Parse clash results', () => {
		const basicData = generateBasicData();
		const { teamspace, project, plan } = basicData;
		const planWithNoRun = ServiceHelper.generateClashPlan(
			plan.selectionA.container, plan.selectionB.container);
		const plannedClashRun1 = ServiceHelper.generateClashRun(plan);
		const plannedClashRun2 = ServiceHelper.generateClashRun(planWithNoRun);
		const completedClashRun = { ...ServiceHelper.generateClashRun(plan), status: CLASH_RUN_STATUS.COMPLETED };
		const clashes = ServiceHelper.generateClashes(plan);

		beforeAll(async () => {
			await setupBasicData(basicData);
			await Promise.all([
				ServiceHelper.db.createClashPlan(teamspace, project.id, planWithNoRun),
				ServiceHelper.db.createClashRun(teamspace, plannedClashRun1),
				ServiceHelper.db.createClashRun(teamspace, plannedClashRun2),
				ServiceHelper.db.createClashRun(teamspace, completedClashRun,
					{ new: clashes.map(formatClash), active: [], resolved: [] }),
			]);
		});

		beforeEach(() => {
			[plannedClashRun1, plannedClashRun2].forEach((run) => {
				const resultsDir = path.join(sharedDir, `${run._id}`);
				fs.mkdirSync(resultsDir, { recursive: true });
				fs.writeFileSync(path.join(resultsDir, 'results.json'), JSON.stringify({ clashes }), 'utf8');
			});
		});

		afterEach(() => {
			[plannedClashRun1, plannedClashRun2].forEach((run) => {
				const resultsDir = path.join(sharedDir, `${run._id}`);
				fs.rmSync(resultsDir, { recursive: true, force: true });
			});
		});

		const getFileContents = async (fileId) => {
			const { readStream } = await getFileAsStream(teamspace, RUN_HISTORY_COL, fileId);

			return new Promise((resolve, reject) => {
				const chunks = [];

				readStream.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
				readStream.on('error', reject);
				readStream.on('end', () => {
					resolve(Buffer.concat(chunks).toString('utf8'));
				});
			});
		};

		test('should just set the run to failed if there is an error', async () => {
			const results = path.join(SHARED_SPACE_TAG, `${plannedClashRun2._id}`, 'results.json');
			const callbackObj = { type: 'clash', teamspace, project: project.id, results, value: 28 };

			await queueMessage(callbackq, plannedClashRun2._id, JSON.stringify(callbackObj));

			// wait for the queue to process the message
			await ServiceHelper.sleepMS(1000);

			const run = await getTestRunByQuery(teamspace, { _id: stringToUUID(plannedClashRun2._id) },
				{ status: 1, result: 1 });
			expect(run.status).toEqual(CLASH_RUN_STATUS.FAILED);
			expect(run.result).toBeUndefined();
		});

		test('should parse results if there is no previous run', async () => {
			const results = path.join(SHARED_SPACE_TAG, `${plannedClashRun2._id}`, 'results.json');
			const callbackObj = { type: 'clash', teamspace, project: project.id, results, value: 0 };

			await queueMessage(callbackq, plannedClashRun2._id, JSON.stringify(callbackObj));

			// wait for the queue to process the message
			await ServiceHelper.sleepMS(1000);

			const run = await getTestRunByQuery(teamspace, { _id: stringToUUID(plannedClashRun2._id) },
				{ status: 1, result: 1 });
			expect(run.status).toEqual(CLASH_RUN_STATUS.COMPLETED);

			const contents = await getFileContents(run.result);
			const parsedContents = JSON.parse(contents);

			expect(parsedContents).toEqual({ new: clashes.map(formatClash), active: [], resolved: [] });
		});

		test('should parse results if there is previous run', async () => {
			const results = path.join(SHARED_SPACE_TAG, `${plannedClashRun1._id}`, 'results.json');
			const callbackObj = { type: 'clash', teamspace, project: project.id, results, value: 0 };

			await queueMessage(callbackq, plannedClashRun1._id, JSON.stringify(callbackObj));

			// wait for the queue to process the message
			await ServiceHelper.sleepMS(1000);

			const run = await getTestRunByQuery(teamspace, { _id: stringToUUID(plannedClashRun1._id) },
				{ status: 1, result: 1 });
			expect(run.status).toEqual(CLASH_RUN_STATUS.COMPLETED);

			const contents = await getFileContents(run.result);
			const parsedContents = JSON.parse(contents);

			expect(parsedContents).toEqual({ new: [], active: clashes.map(formatClash), resolved: [] });
		});
	});
};

describe(determineTestGroup(__filename), () => {
	beforeAll(async () => {
		server = await ServiceHelper.app();
		agent = await SuperTest(server);
	});

	afterAll(() => Promise.all([
		ServiceHelper.queue.purgeQueues(),
		ServiceHelper.closeApp(server),
	]));

	testCreatePlan();
	testUpdatePlan();
	testDeletePlan();
	testCreateRun();
	testParseClashResults();
});
