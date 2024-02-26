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

const { src } = require('../../helper/path');
const { generateRandomString, generateUUID } = require('../../helper/services');

const TicketTemplates = require(`${src}/models/tickets.templates`);
const { defaultTemplates } = require(`${src}/models/tickets.templates.constants`);
const { templates } = require(`${src}/utils/responseCodes`);
const db = require(`${src}/handler/db`);

const templatesColName = 'templates';

const testGetTemplateByName = () => {
	describe('Get template by name', () => {
		test('should fetch a template with matching name', async () => {
			const expectedOutput = { [generateRandomString()]: generateRandomString() };
			const teamspace = generateRandomString();
			const name = generateRandomString();
			const projection = { [generateRandomString()]: generateRandomString() };
			const fn = jest.spyOn(db, 'findOne').mockResolvedValueOnce(expectedOutput);
			await expect(TicketTemplates.getTemplateByName(teamspace, name, projection))
				.resolves.toEqual(expectedOutput);

			expect(fn).toHaveBeenCalledTimes(1);
			expect(fn).toHaveBeenCalledWith(teamspace, templatesColName, { name }, projection);
		});

		test(`should error with ${templates.templateNotFound.code} if there's no matching name`, async () => {
			const teamspace = generateRandomString();
			const name = generateRandomString();
			const fn = jest.spyOn(db, 'findOne').mockResolvedValueOnce(undefined);
			await expect(TicketTemplates.getTemplateByName(teamspace, name))
				.rejects.toEqual(templates.templateNotFound);

			expect(fn).toHaveBeenCalledTimes(1);
			expect(fn).toHaveBeenCalledWith(teamspace, templatesColName, { name }, undefined);
		});
	});
};

const testGetTemplateByCode = () => {
	describe('Get template by code', () => {
		test('should fetch a template with matching code', async () => {
			const expectedOutput = { [generateRandomString()]: generateRandomString() };
			const teamspace = generateRandomString();
			const code = generateRandomString();
			const projection = { [generateRandomString()]: generateRandomString() };
			const fn = jest.spyOn(db, 'findOne').mockResolvedValueOnce(expectedOutput);
			await expect(TicketTemplates.getTemplateByCode(teamspace, code, projection))
				.resolves.toEqual(expectedOutput);

			expect(fn).toHaveBeenCalledTimes(1);
			expect(fn).toHaveBeenCalledWith(teamspace, templatesColName, { code }, projection);
		});

		test(`should error with ${templates.templateNotFound.code} if there's no matching code`, async () => {
			const teamspace = generateRandomString();
			const code = generateRandomString();
			const fn = jest.spyOn(db, 'findOne').mockResolvedValueOnce(undefined);
			await expect(TicketTemplates.getTemplateByCode(teamspace, code))
				.rejects.toEqual(templates.templateNotFound);

			expect(fn).toHaveBeenCalledTimes(1);
			expect(fn).toHaveBeenCalledWith(teamspace, templatesColName, { code }, undefined);
		});
	});
};

const testGetTemplateById = () => {
	describe('Get template by ID', () => {
		test('should fetch a template with matching id', async () => {
			const expectedOutput = { [generateRandomString()]: generateRandomString() };
			const teamspace = generateRandomString();
			const _id = generateUUID();
			const projection = { [generateRandomString()]: generateRandomString() };
			const fn = jest.spyOn(db, 'findOne').mockResolvedValueOnce(expectedOutput);
			await expect(TicketTemplates.getTemplateById(teamspace, _id, projection))
				.resolves.toEqual(expectedOutput);

			expect(fn).toHaveBeenCalledTimes(1);
			expect(fn).toHaveBeenCalledWith(teamspace, templatesColName, { _id }, projection);
		});

		test(`should error with ${templates.templateNotFound.code} if there's no matching id`, async () => {
			const teamspace = generateRandomString();
			const _id = generateUUID();
			const fn = jest.spyOn(db, 'findOne').mockResolvedValueOnce(undefined);
			await expect(TicketTemplates.getTemplateById(teamspace, _id))
				.rejects.toEqual(templates.templateNotFound);

			expect(fn).toHaveBeenCalledTimes(1);
			expect(fn).toHaveBeenCalledWith(teamspace, templatesColName, { _id }, undefined);
		});
	});
};

const testGetAllTemplates = () => {
	describe('Get all templates', () => {
		test('should get all templates that are not deprecated if includeDeprecated is set to false', async () => {
			const teamspace = generateRandomString();
			const expectedOutput = [generateRandomString(), generateRandomString()];
			const fn = jest.spyOn(db, 'find').mockResolvedValueOnce(expectedOutput);
			await expect(TicketTemplates.getAllTemplates(teamspace)).resolves.toEqual(expectedOutput);

			expect(fn).toHaveBeenCalledTimes(1);
			expect(fn).toHaveBeenCalledWith(teamspace, templatesColName, { deprecated: { $ne: true } }, undefined);
		});

		test('should get all templates that are not deprecated if includeDeprecated is set to false', async () => {
			const teamspace = generateRandomString();
			const expectedOutput = [generateRandomString(), generateRandomString()];
			const projection = { [generateRandomString()]: generateRandomString() };
			const fn = jest.spyOn(db, 'find').mockResolvedValueOnce(expectedOutput);
			await expect(TicketTemplates.getAllTemplates(teamspace, true, projection)).resolves.toEqual(expectedOutput);

			expect(fn).toHaveBeenCalledTimes(1);
			expect(fn).toHaveBeenCalledWith(teamspace, templatesColName, { }, projection);
		});
	});
};

const testAddTemplate = () => {
	describe('Add template', () => {
		test('Should return the id if the template is added successfully', async () => {
			const fn = jest.spyOn(db, 'insertOne').mockResolvedValueOnce();
			const data = { [generateRandomString()]: generateRandomString() };
			const teamspace = generateRandomString();

			const result = await TicketTemplates.addTemplate(teamspace, data);

			expect(fn).toHaveBeenCalledTimes(1);
			const id = fn.mock.calls[0][2]._id;

			expect(result).toEqual(id);
			expect(fn).toHaveBeenCalledWith(teamspace, templatesColName, { ...data, _id: id });
		});

		test('Should throw with whatever error insertOne errored with', async () => {
			const errMsg = new Error(generateRandomString());
			jest.spyOn(db, 'insertOne').mockRejectedValueOnce(errMsg);
			const data = { [generateRandomString()]: generateRandomString() };
			const teamspace = generateRandomString();

			await expect(TicketTemplates.addTemplate(teamspace, data)).rejects.toEqual(errMsg);
		});
	});
};

const testAddDefaultTemplate = () => {
	describe('Add default templates', () => {
		test('Should return the id if the template is added successfully', async () => {
			const fn = jest.spyOn(db, 'insertMany').mockResolvedValueOnce();
			const teamspace = generateRandomString();

			await TicketTemplates.addDefaultTemplates(teamspace);

			expect(fn).toHaveBeenCalledTimes(1);
			expect(fn).toHaveBeenCalledWith(teamspace, templatesColName, defaultTemplates);
		});

		test('Should throw with whatever error insertOne errored with', async () => {
			const errMsg = new Error(generateRandomString());
			jest.spyOn(db, 'insertMany').mockRejectedValueOnce(errMsg);
			const teamspace = generateRandomString();

			await expect(TicketTemplates.addDefaultTemplates(teamspace)).rejects.toEqual(errMsg);
		});
	});
};

const testUpdateTemplate = () => {
	describe('Update template', () => {
		test('Should update successfully', async () => {
			const fn = jest.spyOn(db, 'replaceOne').mockResolvedValueOnce();
			const _id = generateUUID();
			const data = { [generateRandomString()]: generateRandomString() };
			const teamspace = generateRandomString();

			await expect(TicketTemplates.updateTemplate(teamspace, _id, data)).resolves.toBeUndefined();

			expect(fn).toHaveBeenCalledTimes(1);
			expect(fn).toHaveBeenCalledWith(teamspace, templatesColName, { _id }, { ...data, _id });
		});

		test('Should throw with whatever error insertOne errored with', async () => {
			const errMsg = new Error(generateRandomString());
			jest.spyOn(db, 'replaceOne').mockRejectedValueOnce(errMsg);
			const data = { [generateRandomString()]: generateRandomString() };
			const teamspace = generateRandomString();

			await expect(TicketTemplates.updateTemplate(teamspace, data)).rejects.toEqual(errMsg);
		});
	});
};

describe('models/tickets.templates', () => {
	testGetTemplateByName();
	testGetTemplateById();
	testGetTemplateByCode();
	testGetAllTemplates();
	testAddTemplate();
	testAddDefaultTemplate();
	testUpdateTemplate();
});
