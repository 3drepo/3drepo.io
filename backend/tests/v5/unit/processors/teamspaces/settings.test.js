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

const { src } = require('../../../helper/path');

const { generateRandomString } = require('../../../helper/services');

jest.mock('../../../../../src/v5/models/tickets.templates');
const TemplateModel = require(`${src}/models/tickets.templates`);

const Settings = require(`${src}/processors/teamspaces/settings`);
const { generateUUID } = require(`${src}/utils/helper/uuids`);

const testAddTemplate = () => {
	describe('Add template', () => {
		test('should call addTicketTemplate in the model object', async () => {
			const teamspace = generateRandomString();
			const data = { [generateRandomString()]: generateRandomString() };
			const expectedOutput = generateRandomString();
			TemplateModel.addTemplate.mockResolvedValueOnce(expectedOutput);
			await expect(Settings.addTicketTemplate(teamspace, data)).resolves.toEqual(expectedOutput);

			expect(TemplateModel.addTemplate).toHaveBeenCalledTimes(1);
			expect(TemplateModel.addTemplate).toHaveBeenCalledWith(teamspace, data);
		});
	});
};

const testUpdateTemplate = () => {
	describe('update template', () => {
		test('should call updateTicketTemplate in the model object', async () => {
			const teamspace = generateRandomString();
			const data = { [generateRandomString()]: generateRandomString() };
			const id = generateUUID();
			const expectedOutput = generateRandomString();
			TemplateModel.updateTemplate.mockResolvedValueOnce(expectedOutput);
			await expect(Settings.updateTicketTemplate(teamspace, id, data)).resolves.toEqual(expectedOutput);

			expect(TemplateModel.updateTemplate).toHaveBeenCalledTimes(1);
			expect(TemplateModel.updateTemplate).toHaveBeenCalledWith(teamspace, id, data);
		});
	});
};

describe('processors/teamspaces/settings', () => {
	testAddTemplate();
	testUpdateTemplate();
});
