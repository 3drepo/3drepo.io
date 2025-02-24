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

const SuperTest = require('supertest');
const ServiceHelper = require('../../../../helper/services');
const { src } = require('../../../../helper/path');

const { templates } = require(`${src}/utils/responseCodes`);

let server;
let agent;

const testAuthenticate = () => {
	describe('Authenticate', () => {
		test(`should respond with ${templates.endpointDecommissioned.code}`, async () => {
			const res = await agent.get('/sso/aad/authenticate')
				.expect(templates.endpointDecommissioned.status);
			expect(res.body.code).toEqual(templates.endpointDecommissioned.code);
		});
	});
};

const signup = () => {
	describe('Sign Up', () => {
		test(`should respond with ${templates.endpointDecommissioned.code}`, async () => {
			const res = await agent.post('/v5/sso/aad/signup').send({})
				.expect(templates.endpointDecommissioned.status);
			expect(res.body.code).toEqual(templates.endpointDecommissioned.code);
		});
	});
};

const testLink = () => {
	describe('Link', () => {
		test(`should respond with ${templates.endpointDecommissioned.code}`, async () => {
			const res = await agent.get('/v5/sso/aad/link')
				.expect(templates.endpointDecommissioned.status);
			expect(res.body.code).toEqual(templates.endpointDecommissioned.code);
		});
	});
};

describe(ServiceHelper.determineTestGroup(__filename), () => {
	beforeAll(async () => {
		server = await ServiceHelper.app();
		agent = await SuperTest(server);
	});

	afterAll(() => ServiceHelper.closeApp(server));

	testAuthenticate();
	signup();
	testLink();
});
