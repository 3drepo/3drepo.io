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

const { events } = require('../../../../../src/v5/services/eventsManager/eventsManager.constants');
const { src } = require('../../../helper/path');

const { generateRandomString } = require('../../../helper/services');

jest.mock('../../../../../src/v5/models/tickets.templates');
const TemplateModel = require(`${src}/models/tickets.templates`);

jest.mock('../../../../../src/v5/models/teamspaceSettings');
const SettingsModel = require(`${src}/models/teamspaceSettings`);

jest.mock('../../../../../src/v5/services/eventsManager/eventsManager');
const EventsManager = require(`${src}/services/eventsManager/eventsManager`);

const Settings = require(`${src}/processors/teamspaces/settings`);
const { generateUUID } = require(`${src}/utils/helper/uuids`);

const testAddTemplate = () => {
	describe('Add template', () => {
		test('should call addTemplate in the model object', async () => {
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
		test('should call updateTemplate in the model object', async () => {
			const teamspace = generateRandomString();
			const data = { [generateRandomString()]: generateRandomString() };
			const id = generateUUID();
			const expectedOutput = generateRandomString();
			TemplateModel.updateTemplate.mockResolvedValueOnce(expectedOutput);
			await expect(Settings.updateTicketTemplate(teamspace, id, data)).resolves.toEqual(expectedOutput);

			expect(TemplateModel.updateTemplate).toHaveBeenCalledTimes(1);
			expect(TemplateModel.updateTemplate).toHaveBeenCalledWith(teamspace, id, data);

			expect(EventsManager.publish).toHaveBeenCalledTimes(1);
			expect(EventsManager.publish).toHaveBeenCalledWith(events.TICKET_TEMPLATE_UPDATED,
				{ teamspace, template: id, data });
		});
	});
};

const testGetTemplateList = () => {
	describe('Get template list', () => {
		test('should call getAllTemplates with projection', async () => {
			const teamspace = generateRandomString();
			const data = generateRandomString();
			TemplateModel.getAllTemplates.mockResolvedValueOnce(data);
			await expect(Settings.getTemplateList(teamspace)).resolves.toEqual(data);

			expect(TemplateModel.getAllTemplates).toHaveBeenCalledTimes(1);
			expect(TemplateModel.getAllTemplates).toHaveBeenCalledWith(teamspace, true,
				{ _id: 1, name: 1, code: 1, deprecated: 1 });
		});
	});
};

const testGetRiskCategories = () => {
	describe('Get risk cateogires', () => {
		test('should call getRiskCategories in the model object', async () => {
			const teamspace = generateRandomString();
			const data = generateRandomString();
			SettingsModel.getRiskCategories.mockResolvedValueOnce(data);
			await expect(Settings.getRiskCategories(teamspace)).resolves.toEqual(data);

			expect(SettingsModel.getRiskCategories).toHaveBeenCalledTimes(1);
			expect(SettingsModel.getRiskCategories).toHaveBeenCalledWith(teamspace);
		});
	});
};

describe('processors/teamspaces/settings', () => {
	testAddTemplate();
	testUpdateTemplate();
	testGetTemplateList();
	testGetRiskCategories();
});
