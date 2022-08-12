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

const { src } = require('../../../../../../helper/path');
const { generateRandomString } = require('../../../../../../helper/services');

const Tickets = require(`${src}/processors/teamspaces/projects/models/commons/tickets`);

jest.mock('../../../../../../../../src/v5/models/tickets');
const TicketsModel = require(`${src}/models/tickets`);

const testAddTicket = () => {
	describe('Add ticket', () => {
		test('should call addTicket in model and return whatever it returns', async () => {
			const teamspace = generateRandomString();
			const project = generateRandomString();
			const model = generateRandomString();
			const ticket = generateRandomString();

			const expectedOutput = generateRandomString();

			TicketsModel.addTicket.mockResolvedValueOnce(expectedOutput);

			await expect(Tickets.addTicket(teamspace, project, model, ticket)).resolves.toEqual(expectedOutput);

			expect(TicketsModel.addTicket).toHaveBeenCalledTimes(1);
			expect(TicketsModel.addTicket).toHaveBeenCalledWith(teamspace, project, model, ticket);
		});
	});
};

describe('processors/teamspaces/projects/models/commons/tickets', () => {
	testAddTicket();
});
