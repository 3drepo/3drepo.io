/**
 *  Copyright (C) 2026 3D Repo Ltd
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

const { determineTestGroup } = require('../../../helper/utils');
const { events } = require('../../../../../src/v5/services/eventsManager/eventsManager.constants');
const { src } = require('../../../helper/path');

const { generateRandomString } = require('../../../helper/services');

jest.mock('fs/promises');
const FsPromises = require('fs/promises');

jest.mock('../../../../../src/v5/models/tickets.templates');
const TemplateModel = require(`${src}/models/tickets.templates`);

jest.mock('../../../../../src/v5/schemas/tickets/templates.constants', () => {
	const actual = jest.requireActual('../../../../../src/v5/schemas/tickets/templates.constants');
	return { ...actual, getDefaultPinIconsDetails: jest.fn(() => actual.getDefaultPinIconsDetails()) };
});
const TemplateConstants = require(`${src}/schemas/tickets/templates.constants`);

jest.mock('../../../../../src/v5/services/eventsManager/eventsManager');
const EventsManager = require(`${src}/services/eventsManager/eventsManager`);

const TicketSettings = require(`${src}/processors/teamspaces/settings.tickets`);
const { generateUUID } = require(`${src}/utils/helper/uuids`);
const { templates } = require(`${src}/utils/responseCodes`);

const testAddTemplate = () => {
	describe('Add template', () => {
		test('should call addTemplate in the model object', async () => {
			const teamspace = generateRandomString();
			const data = { [generateRandomString()]: generateRandomString() };
			const expectedOutput = generateRandomString();
			TemplateModel.addTemplate.mockResolvedValueOnce(expectedOutput);
			await expect(TicketSettings.addTicketTemplate(teamspace, data)).resolves.toEqual(expectedOutput);

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
			await TicketSettings.updateTicketTemplate(teamspace, id, data);

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
			await expect(TicketSettings.getTemplateList(teamspace)).resolves.toEqual(data);

			expect(TemplateModel.getAllTemplates).toHaveBeenCalledTimes(1);
			expect(TemplateModel.getAllTemplates).toHaveBeenCalledWith(teamspace, true,
				{ _id: 1, name: 1, code: 1, deprecated: 1 });
		});
	});
};

const testGetPinIconNames = () => {
	describe('Get pin icon names', () => {
		test('should call getDefaultPinIconsDetails and return sorted keys', () => {
			const data = { [generateRandomString()]: generateRandomString() };
			TemplateConstants.getDefaultPinIconsDetails.mockReturnValueOnce(data);
			expect(TicketSettings.getPinIconNames()).toEqual(Object.keys(data).sort());

			expect(TemplateConstants.getDefaultPinIconsDetails).toHaveBeenCalledTimes(1);
		});
	});
};

const testGetPinIcon = () => {
	describe('Get pin icon', () => {
		test('should call getDefaultPinIconsDetails and readFile with correct path', async () => {
			const iconName = generateRandomString();
			const variant = generateRandomString();
			const iconPath = generateRandomString();
			const data = Buffer.from(generateRandomString());
			TemplateConstants.getDefaultPinIconsDetails.mockReturnValueOnce({ [iconName]: { [variant]: iconPath } });
			FsPromises.readFile.mockResolvedValueOnce(data);

			await expect(TicketSettings.getPinIcon(iconName, variant)).resolves.toEqual(data);

			expect(TemplateConstants.getDefaultPinIconsDetails).toHaveBeenCalledTimes(1);
			expect(FsPromises.readFile).toHaveBeenCalledTimes(1);
			expect(FsPromises.readFile).toHaveBeenCalledWith(iconPath);
		});

		test('should throw when the iconName or variant is not found', async () => {
			const iconName = generateRandomString();
			const variant = generateRandomString();
			TemplateConstants.getDefaultPinIconsDetails.mockReturnValueOnce({ [iconName]: { } });

			await expect(() => TicketSettings.getPinIcon(iconName, variant)).toThrow(templates.pinIconNotFound);

			expect(TemplateConstants.getDefaultPinIconsDetails).toHaveBeenCalledTimes(1);
			expect(FsPromises.readFile).not.toHaveBeenCalled();
		});
	});
};

describe(determineTestGroup(__filename), () => {
	testAddTemplate();
	testUpdateTemplate();
	testGetTemplateList();
	testGetPinIconNames();
	testGetPinIcon();
});
