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

const ServiceHelper = require('../../../helper/services');
const SuperTest = require('supertest');
const schemaValidator = require('openapi-schema-validator');

let server;
let agent;

const testSwaggerDocumentation = () => {
	describe('Check swagger documentation for errors and warnings', () => {
		test('All Open API schema should not contain any errors', async () => {
			const { body: { uri } } = await agent.get('/docs-list');
			expect(uri?.length).toBeGreaterThan(0);

			await Promise.all(uri.map(async (docPath) => {
				const res = await agent.get(`${docPath}/openapi.json`);
				const OpenAPISchemaValidator = schemaValidator.default;
				const validator = new OpenAPISchemaValidator({ version: 3 });
				const validation = validator.validate(res.body);
				expect(validation.errors.length).toEqual(0);
			}));
		});
	});
};

describe(ServiceHelper.determineTestGroup(__filename), () => {
	beforeAll(async () => {
		server = await ServiceHelper.frontend();
		agent = await SuperTest(server);
	});

	afterAll(() => server.close());

	testSwaggerDocumentation();
});
