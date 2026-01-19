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

const { times } = require('lodash');
const SuperTest = require('supertest');
const ServiceHelper = require('../../../../helper/services');
const { src } = require('../../../../helper/path');

const { getPlanById } = require(`${src}/models/clashes`);
const { stringToUUID } = require(`${src}/utils/helper/uuids`);
const { templates } = require(`${src}/utils/responseCodes`);

let server;
let agent;

const setupBasicData = async ({ users, teamspace, project, models, plan }) => {
	await ServiceHelper.db.createUser(users.tsAdmin);
	await ServiceHelper.db.createTeamspace(teamspace, [users.tsAdmin.user]);

	await Promise.all([
		ServiceHelper.db.createUser(users.projectAdmin, [teamspace]),
		ServiceHelper.db.createUser(users.nonAdminUser, [teamspace]),
		ServiceHelper.db.createUser(users.unlicencedUser),
	]);

	await Promise.all([
		ServiceHelper.db.createProject(teamspace, project.id, project.name,
			models.map((m) => m._id), [users.projectAdmin.user]),
		...models.map((model) => ServiceHelper.db.createModel(
			teamspace,
			model._id,
			model.name,
			model.properties,
		),
		ServiceHelper.db.createClashPlan(teamspace, plan),
		)]);
};

const generateBasicData = () => {
	const [tsAdmin, nonAdminUser, unlicencedUser, projectAdmin] = times(4,
		() => ServiceHelper.generateUserCredentials());

	const models = times(2, () => ServiceHelper.generateRandomModel());

	return ({
		users: { tsAdmin, nonAdminUser, unlicencedUser, projectAdmin },
		teamspace: ServiceHelper.generateRandomString(),
		project: ServiceHelper.generateRandomProject(),
		models,
		plan: ServiceHelper.generateClashPlan(models[0]._id, models[1]._id),
	});
};

const testCreatePlan = () => {
	describe('Create clash test plan', () => {
		const route = (ts, project, key) => `/v5/teamspaces/${ts}/projects/${project}/clash${key ? `?key=${key}` : ''}`;
		const basicData = generateBasicData();
		const { users, teamspace, project, models, plan: existingPlan } = basicData;

		const generatePlanData = () => ServiceHelper.generateClashPlan(models[0]._id, models[1]._id);

		beforeAll(async () => {
			await setupBasicData(basicData);
		});

		describe.each([
			['teamspace is not found', { ts: ServiceHelper.generateRandomString() }, false, templates.teamspaceNotFound],
			['session is invalid', { key: ServiceHelper.generateRandomString() }, false, templates.notLoggedIn],
			['user is not a member of the teamspace', { key: users.unlicencedUser.apiKey }, false, templates.teamspaceNotFound],
			['the project does not exist', { proj: ServiceHelper.generateRandomString() }, false, templates.projectNotFound],
			['payload is invalid', { planData: { ...generatePlanData(), type: ServiceHelper.generateRandomString() } }, false, templates.invalidArguments],
			['user has access to a project', { key: users.projectAdmin.apiKey }, true],
			['user is teamspace admin', {}, true],
		])('', (desc, { ts = teamspace, proj = project.id, key = users.tsAdmin.apiKey, planData = generatePlanData() }, success, expectedRes) => {
			test(`should ${success ? 'succeed' : 'fail'} if ${desc}`, async () => {
				const res = await agent.post(route(ts, proj, key))
					.send(planData)
					.expect(expectedRes?.status || templates.ok.status);

				if (success) {
					const plan = await getPlanById(ts, stringToUUID(res.body._id));
					expect(plan).toEqual({ ...planData, _id: plan._id });
				} else {
					expect(res.body.code).toEqual(expectedRes.code);
				}
			});
		});
	});
};

const testUpdatePlan = () => {
	describe('Update clash test plan', () => {
		const route = (ts, project, planId, key) => `/v5/teamspaces/${ts}/projects/${project}/clash/${planId}${key ? `?key=${key}` : ''}`;

		const basicData = generateBasicData();
		const { users, teamspace, project, plan: existingPlan } = basicData;

		beforeAll(async () => {
			await setupBasicData(basicData);
		});

		const generateUpdateData = () => ({ ...existingPlan, name: ServiceHelper.generateRandomString() });

		describe.each([
			['teamspace is not found', { ts: ServiceHelper.generateRandomString() }, false, templates.teamspaceNotFound],
			['session is invalid', { key: ServiceHelper.generateRandomString() }, false, templates.notLoggedIn],
			['user is not a member of the teamspace', { key: users.unlicencedUser.apiKey }, false, templates.teamspaceNotFound],
			['the project does not exist', { proj: ServiceHelper.generateRandomString() }, false, templates.projectNotFound],
			['the plan does not exist', { planId: ServiceHelper.generateRandomString() }, false, templates.clashPlanNotFound],
			['payload is invalid', { planData: { ...existingPlan, type: ServiceHelper.generateRandomString() } }, false, templates.invalidArguments],
			['payload is invalid (no changes)', { planData: existingPlan }, false, templates.invalidArguments],
			['user has access to a project', { key: users.projectAdmin.apiKey }, true],
			['user is teamspace admin', {}, true],
		])('', (desc, { ts = teamspace, proj = project.id, key = users.tsAdmin.apiKey, planId = existingPlan._id, planData = generateUpdateData() }, success, expectedRes) => {
			test(`should ${success ? 'succeed' : 'fail'} if ${desc}`, async () => {
				const res = await agent.patch(route(ts, proj, planId, key))
					.send(planData)
					.expect(expectedRes?.status || templates.ok.status);

				if (success) {
					const plan = await getPlanById(ts, stringToUUID(planId));
					expect(plan).toEqual({ ...planData, _id: plan._id });
				} else {
					expect(res.body.code).toEqual(expectedRes.code);
				}
			});
		});
	});
};

const testDeletePlan = () => {
	describe('Delete clash test plan', () => {
		const route = (ts, project, planId, key) => `/v5/teamspaces/${ts}/projects/${project}/clash/${planId}${key ? `?key=${key}` : ''}`;

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
					const planExists = await getPlanById(ts, stringToUUID(planId)).catch(() => false);
					expect(planExists).toBe(false);
				} else {
					expect(res.body.code).toEqual(expectedRes.code);
				}
			});
		});
	});
};

describe(ServiceHelper.determineTestGroup(__filename), () => {
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
});
