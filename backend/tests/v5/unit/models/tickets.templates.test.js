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

		test(`should error with ${templates.resourceNotFound} if there's no matching name`, async () => {
			const teamspace = generateRandomString();
			const name = generateRandomString();
			const fn = jest.spyOn(db, 'findOne').mockResolvedValueOnce(undefined);
			await expect(TicketTemplates.getTemplateByName(teamspace, name))
				.rejects.toEqual(templates.resourceNotFound);

			expect(fn).toHaveBeenCalledTimes(1);
			expect(fn).toHaveBeenCalledWith(teamspace, templatesColName, { name }, undefined);
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

		test(`should error with ${templates.resourceNotFound} if there's no matching name`, async () => {
			const teamspace = generateRandomString();
			const _id = generateUUID();
			const fn = jest.spyOn(db, 'findOne').mockResolvedValueOnce(undefined);
			await expect(TicketTemplates.getTemplateById(teamspace, _id))
				.rejects.toEqual(templates.resourceNotFound);

			expect(fn).toHaveBeenCalledTimes(1);
			expect(fn).toHaveBeenCalledWith(teamspace, templatesColName, { _id }, undefined);
		});
	});
};

describe('models/tickets.templates', () => {
	testGetTemplateByName();
	testGetTemplateById();
});
