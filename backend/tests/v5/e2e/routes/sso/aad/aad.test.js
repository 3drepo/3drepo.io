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
const session = require('supertest-session');
const { generateRandomString } = require('../../../../helper/services');

const { templates } = require(`${src}/utils/responseCodes`);

let testSession;
let server;
let agent;

const testAuthenticate = () => {
	describe('Sign Up Authenticate', () => {
		test('should redirect the user to Microsoft authentication page', async () => {
			const res = await agent.get('/v5/sso/aad/authenticate')
				.expect(templates.found.status);

			expect(res.headers.location).toEqual(
				expect.stringContaining('https://login.microsoftonline.com/common/oauth2/v2.0/authorize'),
			);
		});
	});
};

const testAuthenticatePost = () => {
	describe('Sign Up Authenticate Post', () => {
		test('should redirect the user to ', async () => {
			const randomUrl = generateRandomString();
			const res = await agent.get(`/v5/sso/aad/authenticate-post?state=${randomUrl}`)
				.expect(templates.found.status);
			expect(res.headers.location).toEqual(expect.stringMatching(randomUrl));
		});
	});
};

const app = ServiceHelper.app();

describe('E2E routes/sso/aad', () => {
	beforeAll(async () => {
		server = app;
		agent = await SuperTest(server);
		testSession = session(app);
	});

	afterAll(() => ServiceHelper.closeApp(server));

	testAuthenticate();
	testAuthenticatePost();
});
