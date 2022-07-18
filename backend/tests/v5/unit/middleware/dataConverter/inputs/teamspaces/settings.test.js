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

const { cloneDeep, times } = require('lodash');

const { generateRandomString } = require('../../../../../helper/services');
const { src } = require('../../../../../helper/path');

jest.mock('../../../../../../../src/v5/utils/responder');
const Responder = require(`${src}/utils/responder`);

const { fieldTypes, presetModules } = require(`${src}/schemas/tickets/templates.constants`);
jest.mock('../../../../../../../src/v5/models/tickets.templates');
const TemplateModelSchema = require(`${src}/models/tickets.templates`);

jest.mock('../../../../../../../src/v5/schemas/tickets/templates');
const TicketTemplateSchema = require(`${src}/schemas/tickets/templates`);

const TeamspaceSettings = require(`${src}/middleware/dataConverter/inputs/teamspaces/settings`);
const { templates, createResponseCode } = require(`${src}/utils/responseCodes`);

// Mock respond function to just return the resCode
Responder.respond.mockImplementation((req, res, errCode) => errCode);

const testValidateNewTicketSchema = () => {
	describe('Test new ticket schema', () => {
		test('Should cast the request body and call next if it is valid', async () => {
			const expectedOutput = { [generateRandomString]: generateRandomString() };
			TicketTemplateSchema.validate.mockReturnValueOnce(expectedOutput);
			TemplateModelSchema.getTemplateByName.mockRejectedValueOnce({});
			const name = generateRandomString();
			const teamspace = generateRandomString();
			const req = { body: { name }, params: { teamspace } };
			const res = {};
			const next = jest.fn();

			await TeamspaceSettings.validateNewTicketSchema(req, res, next);

			expect(TemplateModelSchema.getTemplateByName).toHaveBeenCalledWith(teamspace, name, { _id: 1 });

			expect(next).toHaveBeenCalledTimes(1);
			expect(req.body).toEqual(expectedOutput);
			expect(Responder.respond).not.toHaveBeenCalled();
		});

		test(`Should respond with ${templates.invalidArguments.code} if validation failed`, async () => {
			const errMsg = generateRandomString();
			TicketTemplateSchema.validate.mockImplementationOnce(() => { throw new Error(errMsg); });
			const req = { body: {}, params: { teamspace: generateRandomString() } };
			const res = {};
			const next = jest.fn();

			await TeamspaceSettings.validateNewTicketSchema(req, res, next);

			expect(next).not.toHaveBeenCalled();
			expect(Responder.respond).toHaveBeenCalledTimes(1);
			expect(Responder.respond).toHaveBeenCalledWith(
				req, res, createResponseCode(templates.invalidArguments, errMsg),
			);
		});

		test(`Should respond with ${templates.invalidArguments.code} if name is already in use`, async () => {
			TemplateModelSchema.getTemplateByName.mockResolvedValueOnce();
			const req = { body: {}, params: { teamspace: generateRandomString() } };
			const res = {};
			const next = jest.fn();

			await TeamspaceSettings.validateNewTicketSchema(req, res, next);

			expect(next).not.toHaveBeenCalled();
			expect(Responder.respond).toHaveBeenCalledTimes(1);
			expect(Responder.respond).toHaveBeenCalledWith(
				req, res, createResponseCode(templates.invalidArguments, 'Name already in use'),
			);
		});
	});
};

const checkMergedData = () => {
	describe('Checking merged template output', () => {
		const runTest = (desc, newData, oldData, succeed, expectedOutput) => {
			test(desc, async () => {
				TemplateModelSchema.getTemplateById.mockResolvedValueOnce(oldData);

				const req = {
					body: newData,
					params: { teamspace: generateRandomString(), template: generateRandomString() },
				};

				TicketTemplateSchema.validate.mockReturnValueOnce(cloneDeep(req.body));

				const res = {};
				const next = jest.fn();

				await TeamspaceSettings.validateUpdateTicketSchema(req, res, next);
				if (succeed) {
					expect(TemplateModelSchema.getTemplateByName).not.toHaveBeenCalled();

					expect(next).toHaveBeenCalledTimes(1);
					expect(req.body).toEqual(expectedOutput);
					expect(Responder.respond).not.toHaveBeenCalled();
				} else {
					expect(next).not.toHaveBeenCalled();
					expect(Responder.respond).toHaveBeenCalledTimes(1);
					expect(Responder.respond).toHaveBeenCalledWith(req, res, expectedOutput);
				}
			});
		};

		const data = { name: generateRandomString(), properties: [], modules: [] };
		const fieldName = generateRandomString();
		const fieldList = [];
		times(3, () => {
			fieldList.push({ name: generateRandomString(), type: fieldTypes.NUMBER });
		});

		const propertyTests = [
			['A field that did not used to exist should just get copied over ',
				{ ...data, properties: [{ name: fieldName, type: fieldTypes.TEXT }] },
				data,
				true,
				{ ...data, properties: [{ name: fieldName, type: fieldTypes.TEXT }] }],
			['A field that used to exist should now be marked deprecated',
				data,
				{ ...data, properties: [{ name: fieldName, type: fieldTypes.TEXT }] },
				true,
				{ ...data, properties: [{ name: fieldName, type: fieldTypes.TEXT, deprecated: true }] }],

			['A field that used to exist but now deprecated should be marked deprecated',
				{ ...data, properties: [{ name: fieldName, type: fieldTypes.TEXT, deprecated: true }] },
				{ ...data, properties: [{ name: fieldName, type: fieldTypes.TEXT }] },
				true,
				{ ...data, properties: [{ name: fieldName, type: fieldTypes.TEXT, deprecated: true }] }],
			['Order of fields should be preserved',
				{ ...data, properties: fieldList },
				{ ...data, properties: [] },
				true,
				{ ...data, properties: fieldList }],
			['A field that used to exist with a different type should throw an error',
				{ ...data, properties: [{ name: fieldName, type: fieldTypes.NUMBER }] },
				{ ...data, properties: [{ name: fieldName, type: fieldTypes.TEXT }] },
				false,
				createResponseCode(templates.invalidArguments, `Cannot change the value type of existing property "${fieldName}"`)],

		];

		propertyTests.forEach((testData) => { runTest(...testData); });

		describe.each([
			['Preset module', { type: presetModules.ISSUE, properties: [] }],
			['Custom module', { name: generateRandomString(), properties: [] }],
		])('Modules', (moduleType, module) => {
			describe(moduleType, () => {
				runTest('Module that used to be in the template should be marked deprecated',
					data,
					{ ...data, modules: [module] },
					true,
					{ ...data, modules: [{ ...module, deprecated: true }] });

				runTest('Module that did not used to exist should just get copied over',
					{ ...data, modules: [module] },
					data,
					true,
					{ ...data, modules: [module] });

				runTest('Module that used to exist but now deprecated should be marked deprecated',
					{ ...data, modules: [{ ...module, deprecated: true }] },
					{ ...data, modules: [module] },
					true,
					{ ...data, modules: [{ ...module, deprecated: true }] });

				propertyTests.forEach(([desc, { properties: propertiesNew, ...newData },
					{ properties: propertiesOld, ...oldData }, success, expectedOutput]) => {
					const moduleNew = { ...module, properties: propertiesNew };
					const moduleOld = { ...moduleNew, properties: propertiesOld };
					const moduleExpected = success
						? { ...moduleNew, properties: expectedOutput.properties } : undefined;
					runTest(desc,
						{ ...newData, properties: [], modules: [moduleNew] },
						{ ...oldData, properties: [], modules: [moduleOld] },
						success,
						success ? { ...expectedOutput, properties: [], modules: [moduleExpected] } : expectedOutput);
				});
			});
		});
	});
};

const testValidateUpdateTicketSchema = () => {
	describe('Test update ticket schema', () => {
		test(`Should respond with ${templates.invalidArguments.code} if validation failed`, async () => {
			const errMsg = generateRandomString();
			TicketTemplateSchema.validate.mockImplementationOnce(() => { throw new Error(errMsg); });
			const req = { body: {}, params: { teamspace: generateRandomString(), template: generateRandomString() } };
			const res = {};
			const next = jest.fn();

			await TeamspaceSettings.validateUpdateTicketSchema(req, res, next);

			expect(next).not.toHaveBeenCalled();
			expect(Responder.respond).toHaveBeenCalledTimes(1);
			expect(Responder.respond).toHaveBeenCalledWith(
				req, res, createResponseCode(templates.invalidArguments, errMsg),
			);
		});

		test(`Should respond with ${templates.templateNotFound.code} if template isn't found`, async () => {
			TemplateModelSchema.getTemplateById.mockRejectedValueOnce(templates.templateNotFound);
			const req = { body: {}, params: { teamspace: generateRandomString(), template: generateRandomString() } };
			const res = {};
			const next = jest.fn();

			await TeamspaceSettings.validateUpdateTicketSchema(req, res, next);

			expect(next).not.toHaveBeenCalled();
			expect(Responder.respond).toHaveBeenCalledTimes(1);
			expect(Responder.respond).toHaveBeenCalledWith(req, res, templates.templateNotFound);
		});

		test(`Should respond with ${templates.invalidArguments.code} if the updated name is already taken`, async () => {
			TemplateModelSchema.getTemplateById.mockResolvedValueOnce({ name: generateRandomString() });
			TemplateModelSchema.getTemplateByName.mockResolvedValueOnce({ });

			TicketTemplateSchema.validate.mockReturnValueOnce({ name: generateRandomString() });

			const req = {
				body: { name: generateRandomString() },
				params: { teamspace: generateRandomString(), template: generateRandomString() },
			};
			const res = {};
			const next = jest.fn();

			await TeamspaceSettings.validateUpdateTicketSchema(req, res, next);

			expect(next).not.toHaveBeenCalled();
			expect(Responder.respond).toHaveBeenCalledTimes(1);
			expect(Responder.respond).toHaveBeenCalledWith(
				req, res, createResponseCode(templates.invalidArguments, 'Name already in use'),
			);
		});

		test('Should call next if there is no name clash', async () => {
			TemplateModelSchema.getTemplateById.mockResolvedValueOnce(
				{ name: generateRandomString(), properties: [], modules: [] },
			);
			TemplateModelSchema.getTemplateByName.mockRejectedValueOnce(templates.templateNotFound);

			const expectedOutput = { name: generateRandomString(), properties: [], modules: [] };

			const req = {
				body: { ...expectedOutput },
				params: { teamspace: generateRandomString(), template: generateRandomString() },
			};

			TicketTemplateSchema.validate.mockReturnValueOnce(req.body);

			const res = {};
			const next = jest.fn();

			await TeamspaceSettings.validateUpdateTicketSchema(req, res, next);

			expect(next).toHaveBeenCalledTimes(1);
			expect(req.body).toEqual(expectedOutput);
			expect(Responder.respond).not.toHaveBeenCalled();
		});

		test('Should call next if the name has not been changed', async () => {
			const name = generateRandomString();
			TemplateModelSchema.getTemplateById.mockResolvedValueOnce({ name, properties: [], modules: [] });

			const expectedOutput = { name, properties: [], modules: [] };

			const req = {
				body: { ...expectedOutput },
				params: { teamspace: generateRandomString(), template: generateRandomString() },
			};

			TicketTemplateSchema.validate.mockReturnValueOnce(req.body);

			const res = {};
			const next = jest.fn();

			await TeamspaceSettings.validateUpdateTicketSchema(req, res, next);

			expect(TemplateModelSchema.getTemplateByName).not.toHaveBeenCalled();

			expect(next).toHaveBeenCalledTimes(1);
			expect(req.body).toEqual(expectedOutput);
			expect(Responder.respond).not.toHaveBeenCalled();
		});

		checkMergedData();
	});
};

const testCheckTicketTemplateExists = () => {
	describe('Check if template exists', () => {
		test('Should call next if the ticket exists', async () => {
			const output = {
				name: generateRandomString(),
				[generateRandomString()]: generateRandomString(),
			};
			TemplateModelSchema.getTemplateById.mockResolvedValueOnce(output);

			const req = {
				params: { teamspace: generateRandomString(), template: generateRandomString() },
			};

			const res = {};
			const next = jest.fn();

			await TeamspaceSettings.checkTicketTemplateExists(req, res, next);

			expect(TemplateModelSchema.getTemplateById).toHaveBeenCalledWith(req.params.teamspace, req.params.template);
			expect(next).toHaveBeenCalledTimes(1);
			expect(req.templateData).toEqual(output);
			expect(Responder.respond).not.toHaveBeenCalled();
		});

		test(`Should respond with ${templates.templatesNotFound} if template does not exist`, async () => {
			TemplateModelSchema.getTemplateById.mockRejectedValueOnce(templates.templatesNotfound);

			const req = {
				params: { teamspace: generateRandomString(), template: generateRandomString() },
			};

			const res = {};
			const next = jest.fn();

			await TeamspaceSettings.checkTicketTemplateExists(req, res, next);

			expect(TemplateModelSchema.getTemplateById).toHaveBeenCalledWith(req.params.teamspace, req.params.template);
			expect(next).not.toHaveBeenCalled();
			expect(req.templiateData).toBeUndefined();
			expect(Responder.respond).toHaveBeenCalledWith(
				req, res, templates.templatesNotFound,
			);
		});
	});
};

describe('middleware/dataConverter/inputs/teamspaces', () => {
	testValidateNewTicketSchema();
	testValidateUpdateTicketSchema();
	testCheckTicketTemplateExists();
});
