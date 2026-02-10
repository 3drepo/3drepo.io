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

const { times } = require('lodash');
const { disconnect } = require('../../../../src/v5/handler/db');
const { determineTestGroup, resetFileshare, db: { reset: resetDB, createTeamspace, createTemplates, createTicket }, generateRandomString, generateTemplate, generateTicket, generateRandomProject, generateRandomModel } = require('../../helper/services');

const { src } = require('../../helper/path');

const RemoveTickets = require(`${src}/scripts/utility/teamspaces/removeTickets`);

const { getTemplateList } = require(`${src}/processors/teamspaces/settings`);
const { getTicketList } = require(`${src}/processors/teamspaces/projects/models/commons/tickets`);
const { UUIDToString, stringToUUID } = require(`${src}/utils/helper/uuids`);

const generateData = () => {
	const model = generateRandomModel();
	const templates = times(3, () => generateTemplate(false));

	return {
		teamspace: generateRandomString(),
		project: generateRandomProject(),
		model,
		templates,
		tickets: templates.map((template) => times(5, () => generateTicket(template, false, model))).flat(),
	};
};
const setupData = async (data) => {
	await createTeamspace(data.teamspace);
	await Promise.all([
		...data.tickets.map((ticket) => createTicket(data.teamspace, data.project, data.model, ticket)),
		createTemplates(data.teamspace, data.templates),
	]);
};

const checkData = async (teamspace, project, model, templates, tickets, shouldExist) => {
	const existingTemplates = await getTemplateList(teamspace);
	const allTickets = await getTicketList(teamspace, stringToUUID(project), model, {});

	if (shouldExist) {
		expect(existingTemplates.length).toBe(templates.length + 1); // +1 for CSH template
		templates.forEach((template) => {
			expect(existingTemplates.some((t) => UUIDToString(t._id) === template._id)).toBe(true);
		});
		expect(allTickets.length).toBe(tickets.length);
		tickets.forEach((ticket) => {
			expect(allTickets.some((t) => UUIDToString(t._id) === ticket._id)).toBe(true);
		});
	} else {
		templates.forEach((template) => {
			expect(existingTemplates.some((t) => UUIDToString(t._id) === template._id)).toBe(false);
		});
		tickets.forEach((ticket) => {
			expect(allTickets.some((t) => UUIDToString(t._id) === ticket._id)).toBe(false);
		});
	}
};

const runTest = () => {
	describe('Remove tickets associated with templates from teamspace', () => {
		const data = generateData();

		beforeEach(async () => {
			resetFileshare();
			await resetDB();
			await setupData(data);
		});

		test('should remove tickets and templates from teamspace', async () => {
			await RemoveTickets.run(data.teamspace, data.templates.map((template) => template._id).join(','));
			await checkData(data.teamspace, data.project, data.model, data.templates, data.tickets, false);
		});

		test('should not remove tickets and templates if the template is not on the list', async () => {
			const targetTemplate = data.templates[0];
			const targetTickets = data.tickets.filter((ticket) => ticket.type === targetTemplate._id);
			const otherTemplates = data.templates.slice(1);
			const otherTickets = data.tickets.filter((ticket) => ticket.type !== targetTemplate[0]._id);

			await RemoveTickets.run(data.teamspace, targetTemplate._id);

			await checkData(data.teamspace, data.project, data.model, targetTemplate, targetTickets, false);
			await checkData(data.teamspace, data.project, data.model, otherTemplates, otherTickets, true);
		});
	});
};

describe(determineTestGroup(__filename), () => {
	runTest();
	afterAll(disconnect);
});
