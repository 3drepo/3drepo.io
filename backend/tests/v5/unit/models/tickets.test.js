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
const { generateRandomString } = require('../../helper/services');

const Ticket = require(`${src}/models/tickets`);
const db = require(`${src}/handler/db`);
// const { templates } = require(`${src}/utils/responseCodes`);

const ticketCol = 'tickets';

const testAddTicket = () => {
	describe('Add ticket', () => {
		test('should add the ticket', async () => {
			const data = { [generateRandomString()]: generateRandomString() };

			const fn = jest.spyOn(db, 'insertOne').mockResolvedValue(data);
			const teamspace = generateRandomString();
			const project = generateRandomString();
			const model = generateRandomString();

			const _id = await Ticket.addTicket(teamspace, project, model);

			expect(fn).toHaveBeenCalledTimes(1);
			expect(fn).toHaveBeenCalledWith(teamspace, ticketCol, { ...data, teamspace, project, model, _id });
		});
	});
};

describe('models/views', () => {
	testAddTicket();
});
