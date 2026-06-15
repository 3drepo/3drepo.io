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
const { readFile } = require('fs/promises');
const Path = require('path');

const { modelTypes } = require(`${src}/models/modelSettings.constants`);
const { CLASH_RUNS_COL, clashRunStatus } = require(`${src}/models/clashes.constants`);
const DB = require(`${src}/handler/db`);
const { getFileAsStream } = require(`${src}/services/filesManager`);
const { getPlanById } = require(`${src}/models/clashes.plans`);
const { stringToUUID, UUIDToString } = require(`${src}/utils/helper/uuids`);
const { templates } = require(`${src}/utils/responseCodes`);
const { presetModules, propTypes, statuses: defaultStatuses } = require(`${src}/schemas/tickets/templates.constants`);
const { cn_queue: queueConfig } = require(`${src}/utils/config`);
const { nodeTypes } = require(`${src}/models/scenes.constants`);

const { deleteIfUndefined } = require(`${src}/utils/helper/objects`);

let server;
let agent;

const datePropertyTypes = [propTypes.DATE, propTypes.PAST_DATE];

const getPropertyType = (template, { property, module }) => {
	const properties = module
		? template.modules?.find(({ name, type }) => [name, type].includes(module))?.properties
		: template.properties;
	return properties?.find(({ name }) => name === property)?.type;
};

const getExpectedTicketsObject = (ticketObject, template) => {
	if (!ticketObject?.valuesAtCreation) {
		return ticketObject;
	}

	return {
		...ticketObject,
		valuesAtCreation: ticketObject.valuesAtCreation.map((entry) => (
			datePropertyTypes.includes(getPropertyType(template, entry))
				? { ...entry, value: new Date(entry.value) }
				: entry
		)),
	};
};

const setupBasicData = async ({ users, teamspace, project, models, federation, plan, template }) => {
	await ServiceHelper.db.createUser(users.tsAdmin);
	await ServiceHelper.db.createTeamspace(teamspace, [users.tsAdmin.user]);

	await Promise.all([
		ServiceHelper.db.createUser(users.projectAdmin, [teamspace]),
		ServiceHelper.db.createUser(users.nonAdminUser, [teamspace]),
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
		ServiceHelper.db.createClashPlans(teamspace, project.id, [plan]),
		ServiceHelper.db.createTemplates(teamspace, [template]),
	]);
};

const generateBasicData = () => {
	const [tsAdmin, nonAdminUser, unlicencedUser, projectAdmin] = times(4,
		() => ServiceHelper.generateUserCredentials());

	const models = times(2, () => ServiceHelper.generateRandomModel());
	const federation = ServiceHelper.generateRandomModel({ modelType: modelTypes.FEDERATION });
	const template = ServiceHelper.generateTemplate();
	template.modules.push({ type: presetModules.CLOUD_CLASH, properties: [] });

	const plan = ServiceHelper.generateClashPlan(models[0]._id, models[1]._id);
	const project = ServiceHelper.generateRandomProject();

	return ({
		users: { tsAdmin, nonAdminUser, unlicencedUser, projectAdmin },
		teamspace: ServiceHelper.generateRandomString(),
		project,
		models,
		federation,
		plan,
		template,
	});
};

const testGetPlans = () => {
	describe('Get clash test plans', () => {
		const route = (ts, project, key) => `/v5/teamspaces/${ts}/projects/${project}/clashes${key ? `?key=${key}` : ''}`;
		const basicData = generateBasicData();
		const nonAdminUser = ServiceHelper.generateUserCredentials();
		const anotherPlan = ServiceHelper.generateClashPlan(
			basicData.models[1]._id, basicData.models[0]._id);

		const { users, teamspace, project, plan } = basicData;

		beforeAll(async () => {
			await setupBasicData(basicData);
			await Promise.all([
				ServiceHelper.db.createUser(nonAdminUser, [teamspace]),
				ServiceHelper.db.createClashPlans(teamspace, project.id, [anotherPlan]),
			]);
		});

		describe.each([
			['teamspace is not found', { ts: ServiceHelper.generateRandomString() }, false, templates.teamspaceNotFound],
			['session is invalid', { key: ServiceHelper.generateRandomString() }, false, templates.notLoggedIn],
			['user is not a member of the teamspace', { key: users.unlicencedUser.apiKey }, false, templates.teamspaceNotFound],
			['the project does not exist', { proj: ServiceHelper.generateRandomString() }, false, templates.projectNotFound],
			['the user is not a project admin', { key: nonAdminUser.apiKey }, false, templates.notAuthorized],
			['user has admin access to a project', { key: users.projectAdmin.apiKey }, true],
			['user is teamspace admin', {}, true],
		])('', (desc, { ts = teamspace, proj = project.id, key = users.tsAdmin.apiKey }, success, expectedRes) => {
			test(`should ${success ? 'succeed' : 'fail'} if ${desc}`, async () => {
				const res = await agent.get(route(ts, proj, key))
					.expect(expectedRes?.status || templates.ok.status);

				if (success) {
					ServiceHelper.outOfOrderArrayEqual(res.body.plans, [
						{
							_id: plan._id,
							name: plan.name,
							type: plan.type,
						},
						{
							_id: anotherPlan._id,
							name: anotherPlan.name,
							type: anotherPlan.type,
						},
					]);
				} else {
					expect(res.body.code).toEqual(expectedRes.code);
				}
			});
		});
	});
};

const testGetPlan = () => {
	describe('Get clash test plan', () => {
		const route = (ts, project, planId, key) => `/v5/teamspaces/${ts}/projects/${project}/clashes/${planId}${key ? `?key=${key}` : ''}`;
		const basicData = generateBasicData();
		const nonAdminUser = ServiceHelper.generateUserCredentials();
		const projectWithOwnPlan = ServiceHelper.generateRandomProject();
		const { users, teamspace, project, models, federation, template } = basicData;
		const planWithTickets = ServiceHelper.generateClashPlan(
			models[0]._id, models[1]._id, { federation, template, creator: users.tsAdmin.user });
		const planInAnotherProject = ServiceHelper.generateClashPlan(models[1]._id, models[0]._id);

		beforeAll(async () => {
			await setupBasicData(basicData);
			await Promise.all([
				ServiceHelper.db.createUser(nonAdminUser, [teamspace]),
				ServiceHelper.db.createClashPlans(teamspace, project.id, [planWithTickets]),
				ServiceHelper.db.createProject(teamspace, projectWithOwnPlan.id, projectWithOwnPlan.name,
					models.map(({ _id }) => _id)),
				ServiceHelper.db.createClashPlans(teamspace, projectWithOwnPlan.id, [planInAnotherProject]),
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
			['user has access to a project', { key: users.projectAdmin.apiKey }, true],
			['user is teamspace admin', {}, true],
		])('', (desc, { ts = teamspace, proj = project.id, planId = planWithTickets._id, key = users.tsAdmin.apiKey }, success, expectedRes) => {
			test(`should ${success ? 'succeed' : 'fail'} if ${desc}`, async () => {
				const res = await agent.get(route(ts, proj, planId, key))
					.expect(expectedRes?.status || templates.ok.status);

				if (success) {
					const expectedPlan = await getPlanById(ts, stringToUUID(proj), stringToUUID(planId));
					const expectedResponse = {
						...expectedPlan,
						_id: UUIDToString(expectedPlan._id),
					};

					if (expectedResponse.tickets) {
						expectedResponse.tickets = {
							...expectedResponse.tickets,
							template: UUIDToString(expectedResponse.tickets.template),
							federation: UUIDToString(expectedResponse.tickets.federation),
						};
					}

					expect(res.body).toEqual(expectedResponse);
				} else {
					expect(res.body.code).toEqual(expectedRes.code);
				}
			});
		});
	});
};

const formatRun = (run) => deleteIfUndefined({
	_id: run._id,
	status: run.status,
	triggeredBy: run.triggeredBy,
	triggeredAt: run.triggeredAt.getTime(),
	updatedAt: (run.updatedAt ?? run.triggeredAt).getTime(),
	results: run.results,
});

const testGetRuns = () => {
	describe('Get clash test runs', () => {
		const route = (ts, project, planId, key) => `/v5/teamspaces/${ts}/projects/${project}/clashes/${planId}/runs${key ? `?key=${key}` : ''}`;
		const basicData = generateBasicData();
		const nonAdminUser = ServiceHelper.generateUserCredentials();
		const projectWithOwnPlan = ServiceHelper.generateRandomProject();
		const { users, teamspace, project, models, plan: existingPlan } = basicData;
		const planInAnotherProject = ServiceHelper.generateClashPlan(models[1]._id, models[0]._id);
		const planForRuns = {
			...existingPlan,
			selectionA: existingPlan.selectionA.map((selection) => ({
				...selection,
				revision: ServiceHelper.generateUUIDString(),
			})),
			selectionB: existingPlan.selectionB.map((selection) => ({
				...selection,
				revision: ServiceHelper.generateUUIDString(),
			})),
		};
		const planForAnotherRun = {
			...planForRuns,
			_id: ServiceHelper.generateUUIDString(),
		};
		const plannedRun = {
			...ServiceHelper.generateClashRun(planForRuns),
			status: clashRunStatus.PLANNED,
			triggeredAt: ServiceHelper.generateRandomDate(),
		};
		const failedRun = {
			...ServiceHelper.generateClashRun(planForRuns),
			status: clashRunStatus.FAILED,
			triggeredAt: ServiceHelper.generateRandomDate(),
			results: {
				error: { reason: ServiceHelper.generateRandomString() },
			},
		};
		const completedRun = {
			...ServiceHelper.generateClashRun(planForRuns),
			status: clashRunStatus.COMPLETED,
			triggeredAt: ServiceHelper.generateRandomDate(),
			updatedAt: ServiceHelper.generateRandomDate(),
			results: {
				stats: {
					new: ServiceHelper.generateRandomNumber(),
					active: ServiceHelper.generateRandomNumber(),
					resolved: ServiceHelper.generateRandomNumber(),
				},
			},
		};
		const runInAnotherPlan = {
			...ServiceHelper.generateClashRun(planForAnotherRun),
			status: clashRunStatus.COMPLETED,
			triggeredAt: ServiceHelper.generateRandomDate(),
			updatedAt: ServiceHelper.generateRandomDate(),
		};

		beforeAll(async () => {
			await setupBasicData(basicData);
			await Promise.all([
				ServiceHelper.db.createUser(nonAdminUser, [teamspace]),
				ServiceHelper.db.createProject(teamspace, projectWithOwnPlan.id, projectWithOwnPlan.name,
					models.map(({ _id }) => _id)),
				ServiceHelper.db.createClashPlans(teamspace, projectWithOwnPlan.id, [planInAnotherProject]),
				ServiceHelper.db.createClashRuns(teamspace, project.id, planForRuns,
					[plannedRun, failedRun, completedRun]),
				ServiceHelper.db.createClashRuns(teamspace, project.id, planForAnotherRun, [runInAnotherPlan]),
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
			['user has admin access to a project', { key: users.projectAdmin.apiKey }, true],
			['user is teamspace admin', {}, true],
		])('', (desc, { ts = teamspace, proj = project.id, planId = existingPlan._id, key = users.tsAdmin.apiKey }, success, expectedRes) => {
			test(`should ${success ? 'succeed' : 'fail'} if ${desc}`, async () => {
				const res = await agent.get(route(ts, proj, planId, key))
					.expect(expectedRes?.status || templates.ok.status);

				if (success) {
					const expectedRuns = [plannedRun, failedRun, completedRun].map(formatRun);
					expect(res.body.runs).toHaveLength(3);
					ServiceHelper.outOfOrderArrayEqual(res.body.runs, expectedRuns);
				} else {
					expect(res.body.code).toEqual(expectedRes.code);
				}
			});
		});
	});
};

const testGetRun = () => {
	describe('Get clash test run', () => {
		const route = (ts, project, planId, runId, key) => `/v5/teamspaces/${ts}/projects/${project}/clashes/${planId}/runs/${runId}${key ? `?key=${key}` : ''}`;
		const basicData = generateBasicData();
		const nonAdminUser = ServiceHelper.generateUserCredentials();
		const projectWithOwnPlan = ServiceHelper.generateRandomProject();
		const { users, teamspace, project, models, plan: existingPlan } = basicData;
		const planInAnotherProject = ServiceHelper.generateClashPlan(models[1]._id, models[0]._id);
		const planForRuns = {
			...existingPlan,
			selectionA: existingPlan.selectionA.map((selection) => ({
				...selection,
				revision: ServiceHelper.generateUUIDString(),
			})),
			selectionB: existingPlan.selectionB.map((selection) => ({
				...selection,
				revision: ServiceHelper.generateUUIDString(),
			})),
		};
		const planForAnotherRun = {
			...planForRuns,
			_id: ServiceHelper.generateUUIDString(),
		};
		const completedRun = {
			...ServiceHelper.generateClashRun(planForRuns),
			status: clashRunStatus.COMPLETED,
			triggeredAt: ServiceHelper.generateRandomDate(),
			updatedAt: ServiceHelper.generateRandomDate(),
			results: {
				stats: {
					new: ServiceHelper.generateRandomNumber(),
					active: ServiceHelper.generateRandomNumber(),
					resolved: ServiceHelper.generateRandomNumber(),
				},
			},
		};
		const runInAnotherPlan = {
			...ServiceHelper.generateClashRun(planForAnotherRun),
			status: clashRunStatus.COMPLETED,
			triggeredAt: ServiceHelper.generateRandomDate(),
			updatedAt: ServiceHelper.generateRandomDate(),
		};
		const formatRunDetail = (run) => ({
			...formatRun(run),
			plan: planForRuns,
		});

		beforeAll(async () => {
			await setupBasicData(basicData);
			await Promise.all([
				ServiceHelper.db.createUser(nonAdminUser, [teamspace]),
				ServiceHelper.db.createProject(teamspace, projectWithOwnPlan.id, projectWithOwnPlan.name,
					models.map(({ _id }) => _id)),
				ServiceHelper.db.createClashPlans(teamspace, projectWithOwnPlan.id, [planInAnotherProject]),
				ServiceHelper.db.createClashRuns(teamspace, project.id, planForRuns, [completedRun]),
				ServiceHelper.db.createClashRuns(teamspace, project.id, planForAnotherRun, [runInAnotherPlan]),
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
			['the run does not exist', { runId: ServiceHelper.generateRandomString() }, false, templates.clashRunNotFound],
			['the run belongs to a different plan', { runId: runInAnotherPlan._id }, false, templates.clashRunNotFound],
			['user has admin access to a project', { key: users.projectAdmin.apiKey }, true],
			['user is teamspace admin', {}, true],
		])('', (desc, {
			ts = teamspace,
			proj = project.id,
			planId = existingPlan._id,
			runId = completedRun._id,
			key = users.tsAdmin.apiKey,
		}, success, expectedRes) => {
			test(`should ${success ? 'succeed' : 'fail'} if ${desc}`, async () => {
				const res = await agent.get(route(ts, proj, planId, runId, key))
					.expect(expectedRes?.status || templates.ok.status);

				if (success) {
					expect(res.body).toEqual(formatRunDetail(completedRun));
				} else {
					expect(res.body.code).toEqual(expectedRes.code);
				}
			});
		});
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
		templateWithCustomStatuses.modules.push({ type: presetModules.CLOUD_CLASH, properties: [] });
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
					const { tickets: expectedTickets, ...expectedPlanData } = planData;
					expect(plan).toEqual({
						...expectedPlanData,
						_id: plan._id,
						createdBy: user.user,
						createdAt: plan.createdAt,
					});

					if (tickets) {
						tickets.template = UUIDToString(tickets.template);
						const templateForExpectedTickets = [template, templateWithCustomStatuses].find(
							({ _id }) => _id === expectedTickets.template);
						const expectedTicketsObject = getExpectedTicketsObject(
							expectedTickets, templateForExpectedTickets);
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
		templateWithCustomStatuses.modules.push({ type: presetModules.CLOUD_CLASH, properties: [] });

		const clashPlanWithTicketsConfig = ServiceHelper.generateClashPlan(
			models[0]._id, models[1]._id, { federation, template, creator: users.tsAdmin.user });
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
				ServiceHelper.db.createClashPlans(teamspace, project.id, [
					clashPlanWithTicketsConfig,
					clashPlanWithDefaultStatuses,
					clashPlanWithoutDefaultStatuses,
					clashPlanForDefaultStatusUpdate,
					clashPlanForInvalidDefaultStatus,
					clashPlanForTemplateUpdate,
				]),
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
							expectedPlan.tickets = deleteIfUndefined({
								...expectedPlan.tickets,
								...planData.tickets,
							}, true);
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
		const { users, teamspace, project, models, plan: existingPlan } = basicData;
		const planToKeep = ServiceHelper.generateClashPlan(models[0]._id, models[1]._id);
		const clashResults = { new: [], active: [], resolved: [] };
		const runsToDelete = times(2, () => ServiceHelper.generateClashRun(existingPlan, clashResults));
		const runToKeep = ServiceHelper.generateClashRun(planToKeep, clashResults);

		beforeAll(async () => {
			await setupBasicData(basicData);
			await Promise.all([
				ServiceHelper.db.createClashPlans(teamspace, project.id, [planToKeep]),
				ServiceHelper.db.createClashRuns(teamspace, project.id, existingPlan, runsToDelete),
				ServiceHelper.db.createClashRuns(teamspace, project.id, planToKeep, [runToKeep]),
			]);
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

					await Promise.all(runsToDelete.map(async (run) => {
						const clashRun = await DB.findOne(ts, CLASH_RUNS_COL,
							{ _id: stringToUUID(run._id) });
						expect(clashRun).toBe(null);
						await expect(getFileAsStream(ts, CLASH_RUNS_COL, stringToUUID(run._id)))
							.rejects.toEqual(templates.fileNotFound);
					}));

					const clashRun = await DB.findOne(ts, CLASH_RUNS_COL,
						{ _id: stringToUUID(runToKeep._id) });
					expect(clashRun).toBeDefined();
					await expect(getFileAsStream(ts, CLASH_RUNS_COL, stringToUUID(runToKeep._id)))
						.resolves.toBeDefined();
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
		const modelWithNoRev = ServiceHelper.generateRandomModel();
		const modelWithVoidRev = ServiceHelper.generateRandomModel();
		const modelsWithoutScene = times(2, () => ServiceHelper.generateRandomModel());
		const createRunModels = [modelWithNoRev, modelWithVoidRev, ...modelsWithoutScene];
		const projectWithOwnPlan = ServiceHelper.generateRandomProject();
		const projectWithOwnPlanModels = times(2, () => ServiceHelper.generateRandomModel());
		const { users, teamspace, project, models, plan: existingPlan } = basicData;
		const revisions = models.map(() => ServiceHelper.generateRevisionEntry());
		const revisionsWithoutScene = modelsWithoutScene.map(() => ServiceHelper.generateRevisionEntry());
		const [
			planWithMissingContainer, planWithNoRev, planWithVoidRev,
		] = [ServiceHelper.generateUUIDString(), modelWithNoRev._id, modelWithVoidRev._id]
			.map((rid) => ServiceHelper.generateClashPlan(models[0]._id, rid));
		const planWithoutClashCandidates = ServiceHelper.generateClashPlan(
			modelsWithoutScene[0]._id, modelsWithoutScene[1]._id);
		const planInAnotherProject = ServiceHelper.generateClashPlan(
			projectWithOwnPlanModels[0]._id, projectWithOwnPlanModels[1]._id);
		const createScene = (model, revision) => {
			const parent = ServiceHelper.generateUUIDString();
			const parentNode = ServiceHelper.generateBasicNode(nodeTypes.TRANSFORMATION, revision._id, [],
				{ shared_id: stringToUUID(parent) });
			const meshNode = ServiceHelper.generateBasicNode(nodeTypes.MESH, revision._id, [stringToUUID(parent)],
				{ bounding_box: [[0, 0, 0], [1, 1, 1]] });
			return ServiceHelper.db.createScene(teamspace, project.id, model._id, revision, [parentNode, meshNode]);
		};

		beforeAll(async () => {
			await setupBasicData(basicData);
			await Promise.all([
				DB.updateOne(teamspace, 'projects', { _id: stringToUUID(project.id) },
					{ $push: { models: { $each: createRunModels.map(({ _id }) => _id) } } }),
				...createRunModels.map((model) => ServiceHelper.db.createModel(
					teamspace,
					model._id,
					model.name,
					model.properties,
				)),
				...models.map((model, index) => ServiceHelper.db.createRevision(teamspace,
					project.id, model._id, revisions[index], modelTypes.CONTAINER)),
				...modelsWithoutScene.map((model, index) => ServiceHelper.db.createRevision(teamspace,
					project.id, model._id, revisionsWithoutScene[index], modelTypes.CONTAINER)),
				...models.map((model, index) => createScene(model, revisions[index])),
				ServiceHelper.db.createRevision(teamspace,
					project.id, modelWithVoidRev._id, ServiceHelper.generateRevisionEntry(true), modelTypes.CONTAINER),
				ServiceHelper.db.createClashPlans(teamspace, project.id, [
					planWithMissingContainer,
					planWithNoRev,
					planWithVoidRev,
					planWithoutClashCandidates,
				]),
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
				ServiceHelper.db.createClashPlans(teamspace, projectWithOwnPlan.id, [planInAnotherProject]),
			]);
		});

		describe.each([
			['teamspace is not found', { ts: ServiceHelper.generateRandomString() }, false, templates.teamspaceNotFound],
			['session is invalid', { key: ServiceHelper.generateRandomString() }, false, templates.notLoggedIn],
			['user is not a member of the teamspace', { key: users.unlicencedUser.apiKey }, false, templates.teamspaceNotFound],
			['the project does not exist', { proj: ServiceHelper.generateRandomString() }, false, templates.projectNotFound],
			['the user is not a project admin', { key: users.nonAdminUser.apiKey }, false, templates.notAuthorized],
			['the plan does not exist', { planId: ServiceHelper.generateRandomString() }, false, templates.clashPlanNotFound],
			['the plan belongs to a different project', { planId: planInAnotherProject._id }, false, templates.clashPlanNotFound],
			['the plan has a container that does not exist', { planId: planWithMissingContainer._id }, false, templates.containerNotFound],
			['the plan has a container with no revisions', { planId: planWithNoRev._id }, false, templates.revisionNotFound],
			['the plan has a container with void revisions', { planId: planWithVoidRev._id }, false, templates.revisionNotFound],
			['user is teamspace admin', {}, true],
		])('', (desc, { ts = teamspace, proj = project.id, key = users.tsAdmin.apiKey, planId = existingPlan._id }, success, expectedRes) => {
			test(`should ${success ? 'succeed' : 'fail'} if ${desc}`, async () => {
				const res = await agent.post(route(ts, proj, planId, key))
					.expect(expectedRes?.status || templates.ok.status);

				if (success) {
					const id = res.body._id;
					const clashRun = await DB.findOne(ts, CLASH_RUNS_COL, { _id: stringToUUID(id) });
					expect(clashRun).toBeDefined();

					const configPath = Path.join(queueConfig.shared_storage, id, 'clashConfig.json');
					const config = JSON.parse(await readFile(configPath, 'utf8'));
					expect(config.setA).toMatchObject([{
						teamspace: ts,
						container: clashRun.plan.selectionA[0].container,
						revision: UUIDToString(clashRun.plan.selectionA[0].revision),
					}]);
					expect(config.setB).toMatchObject([{
						teamspace: ts,
						container: clashRun.plan.selectionB[0].container,
						revision: UUIDToString(clashRun.plan.selectionB[0].revision),
					}]);
					expect(config.setA[0].objects).toHaveLength(1);
					expect(config.setB[0].objects).toHaveLength(1);
				} else {
					expect(res.body.code).toEqual(expectedRes.code);
				}
			});
		});

		test('should abort the run without queueing if the selections do not resolve to clash candidates', async () => {
			const res = await agent.post(route(teamspace, project.id,
				planWithoutClashCandidates._id, users.tsAdmin.apiKey))
				.expect(templates.ok.status);

			const id = res.body._id;
			const clashRun = await DB.findOne(teamspace, CLASH_RUNS_COL, { _id: stringToUUID(id) });
			expect(clashRun).toEqual(expect.objectContaining({
				status: clashRunStatus.ABORTED,
				results: {
					reason: 'The defined selections do not yield any candidates to execute a clash run.',
				},
			}));

			const configPath = Path.join(queueConfig.shared_storage, id, 'clashConfig.json');
			await expect(readFile(configPath, 'utf8')).rejects.toMatchObject({ code: 'ENOENT' });
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

	testGetPlans();
	testGetPlan();
	testGetRuns();
	testGetRun();
	testCreatePlan();
	testUpdatePlan();
	testDeletePlan();
	testCreateRun();
});
