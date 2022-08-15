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
const { generateRandomString, generateRandomNumber } = require('../../helper/services');

const Ticket = require(`${src}/models/tickets`);
const db = require(`${src}/handler/db`);
// const { templates } = require(`${src}/utils/responseCodes`);

const ticketCol = 'tickets';

const testAddTicket = () => {
	describe('Add ticket', () => {
		test('should add the ticket', async () => {
			const templateType = generateRandomString();
			const data = { [generateRandomString()]: generateRandomString(), type: templateType };
			const number = generateRandomNumber();

			const fn = jest.spyOn(db, 'insertOne').mockResolvedValue(data);
			const getLastNumber = jest.spyOn(db, 'findOne').mockResolvedValue({ number: number - 1 });
			const teamspace = generateRandomString();
			const project = generateRandomString();
			const model = generateRandomString();

			const _id = await Ticket.addTicket(teamspace, project, model, data);

			expect(fn).toHaveBeenCalledTimes(1);
			expect(fn).toHaveBeenCalledWith(teamspace, ticketCol, { ...data, teamspace, project, model, _id, number });

			expect(getLastNumber).toHaveBeenCalledTimes(1);
			expect(getLastNumber).toHaveBeenCalledWith(teamspace, ticketCol,
				{ teamspace, project, model, type: templateType }, { number: 1 }, { number: -1 });
		});

		test('should add the ticket with number set to 1 if this is the first ticket', async () => {
			const templateType = generateRandomString();
			const data = { [generateRandomString()]: generateRandomString(), type: templateType };

			const fn = jest.spyOn(db, 'insertOne').mockResolvedValue(data);
			const getLastNumber = jest.spyOn(db, 'findOne').mockResolvedValue(undefined);
			const teamspace = generateRandomString();
			const project = generateRandomString();
			const model = generateRandomString();

			const _id = await Ticket.addTicket(teamspace, project, model, data);

			expect(fn).toHaveBeenCalledTimes(1);
			expect(fn).toHaveBeenCalledWith(teamspace, ticketCol,
				{ ...data, teamspace, project, model, _id, number: 1 });

			expect(getLastNumber).toHaveBeenCalledTimes(1);
			expect(getLastNumber).toHaveBeenCalledWith(teamspace, ticketCol,
				{ teamspace, project, model, type: templateType }, { number: 1 }, { number: -1 });
		});
	});
};

describe('models/tickets', () => {
	testAddTicket();
});
