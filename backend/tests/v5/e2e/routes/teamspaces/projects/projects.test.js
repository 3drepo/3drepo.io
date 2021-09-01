/**
 *  Copyright (C) 2021 3D Repo Ltd
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

const SuperTest = require('supertest');
const ServiceHelper = require('../../../../helper/services');
const { src } = require('../../../../helper/path');

const { templates } = require(`${src}/utils/responseCodes`);

let server;
let agent;

// These are the users being used for tests
const tsAdmin = ServiceHelper.generateUserCredentials();
const unlicencedUser = ServiceHelper.generateUserCredentials();

const testProject = {
	_id: ServiceHelper.generateUUIDString(),
	name: ServiceHelper.generateRandomString(),
};

const teamspace = 'teamspace';

const setupData = async () => {
	await ServiceHelper.db.createTeamspace(teamspace, [tsAdmin.user]);
	await ServiceHelper.db.createUser(tsAdmin, [teamspace]);
	await ServiceHelper.db.createUser(unlicencedUser);
	await ServiceHelper.db.createProject(teamspace, testProject._id, testProject.name, [], testProject.admins);
};

const testGetProjectList = () => {
	describe('Get project list', () => {
		const route = `/v5/teamspaces/${teamspace}/projects`;
		test('should fail without a valid session', async () => {
			const res = await agent.get(route).expect(templates.notLoggedIn.status);
			expect(res.body.code).toEqual(templates.notLoggedIn.code);
		});
		test('should fail without a valid teamspace', async () => {
			const res = await agent.get(`/v5/teamspaces/badTSName/projects?key=${tsAdmin.apiKey}`).expect(templates.teamspaceNotFound.status);
			expect(res.body.code).toEqual(templates.teamspaceNotFound.code);
		});
		test('should fail without a valid teamspace licence', async () => {
			const res = await agent.get(`${route}?key=${unlicencedUser.apiKey}`).expect(templates.teamspaceNotFound.status);
			expect(res.body.code).toEqual(templates.teamspaceNotFound.code);
		});
		test('give return a project list if the user has a valid session and is admin of teamspace', async () => {
			const res = await agent.get(`${route}?key=${tsAdmin.apiKey}`).expect(templates.ok.status);
			expect(res.body).toEqual({ projects: [{ ...testProject, isAdmin: true }] });
		});
	});
};

describe('E2E routes/projects/projects', () => {
	beforeAll(async () => {
		server = await ServiceHelper.app();
		agent = await SuperTest(server);
		await setupData();
	});
	afterAll(() => ServiceHelper.closeApp(server));
	testGetProjectList();
});
