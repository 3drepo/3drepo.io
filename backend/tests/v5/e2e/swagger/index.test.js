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

const { src } = require('../../helper/path');
const ServiceHelper = require('../../helper/services');
const SuperTest = require('supertest');
const schemaValidator = require('openapi-schema-validator');

//let testSession;
let server;
let agent;

const user = ServiceHelper.generateUserCredentials();

const setupData = async () => {
	await ServiceHelper.db.createUser(user);
};

const testSwaggerDocumentation = () => {
	describe('Check swagger documentation for errors and warnings', () => {
		test('should return error if errors or warnings are found in swagger documentation', async () => {
			const res = await agent.get(`/docs/openapi.json?key=${user.apiKey}`);

			const OpenAPISchemaValidator = schemaValidator.default;
			const validator = new OpenAPISchemaValidator({ version: 3 });
			const validation = validator.validate(res.body);
			expect(validation.errors.length).toEqual(0);
		});
	});
};

describe('swagger', () => {
	beforeAll(async () => {
		server = await ServiceHelper.app();
		agent = await SuperTest(server);
		await setupData();
	});

	afterAll(() => ServiceHelper.closeApp(server));

	testSwaggerDocumentation();
});
