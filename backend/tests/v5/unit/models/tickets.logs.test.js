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
const { generateRandomString } = require('../../helper/services');

const TicketLogs = require(`${src}/models/tickets.logs`);
const db = require(`${src}/handler/db`);

const testAddTicketLog = () => {
	describe('Add ticket log', () => {
		test('Should add a new ticket log', async () => {
			const teamspace = generateRandomString();
			const project = generateRandomString();
			const model = generateRandomString();
			const ticket = generateRandomString();
			const ticketLog = { from: generateRandomString(), to: generateRandomString() };
			const fn = jest.spyOn(db, 'insertOne').mockResolvedValueOnce(undefined);

			await TicketLogs.addTicketLog(teamspace, project, model, ticket, ticketLog);
			expect(fn).toHaveBeenCalledTimes(1);
			expect(fn).toHaveBeenCalledWith(teamspace, 'tickets.logs',
				{ ...ticketLog, _id: fn.mock.calls[0][2]._id, teamspace, project, model, ticket });
			expect(fn.mock.calls[0][2]).toHaveProperty('_id');
		});
	});
};

describe('models/tickets.logs', () => {
	testAddTicketLog();
});
