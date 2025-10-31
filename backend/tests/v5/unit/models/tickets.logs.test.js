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

const { times } = require('lodash');
const { src } = require('../../helper/path');
const { generateUUID, generateRandomString, determineTestGroup, generateRandomObject } = require('../../helper/services');

const TicketLogs = require(`${src}/models/tickets.logs`);
const db = require(`${src}/handler/db`);

const TICKET_LOGS_COL = 'tickets.logs';

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
			expect(fn).toHaveBeenCalledWith(teamspace, TICKET_LOGS_COL,
				{ ...ticketLog, _id: fn.mock.calls[0][2]._id, teamspace, project, model, ticket });
			expect(fn.mock.calls[0][2]).toHaveProperty('_id');
		});
	});
};

const testAddGroupUpdateLog = () => {
	describe('Add ticket group update log', () => {
		test('Should add group update log', async () => {
			const teamspace = generateRandomString();
			const project = generateRandomString();
			const model = generateRandomString();
			const ticket = generateRandomString();
			const changes = generateRandomObject();
			const author = generateRandomString();
			const timestamp = new Date();
			const groupId = generateRandomString();
			const fn = jest.spyOn(db, 'insertOne').mockResolvedValueOnce(undefined);

			await TicketLogs.addGroupUpdateLog(teamspace, project, model, ticket, groupId,
				{ author, timestamp, changes });

			const expectedDoc = {
				teamspace,
				project,
				model,
				ticket,
				author,
				timestamp,
				changes: {
					group: {
						_id: groupId,
						to: changes,
					},
				},
			};

			expect(fn).toHaveBeenCalledTimes(1);
			expect(fn).toHaveBeenCalledWith(teamspace, TICKET_LOGS_COL,
				{ ...expectedDoc, _id: fn.mock.calls[0][2]._id });
			expect(fn.mock.calls[0][2]).toHaveProperty('_id');
		});
	});
};

const testAddImportedLog = () => {
	describe('Add ticket imported logs', () => {
		test('Should add ticket imported logs', async () => {
			const teamspace = generateRandomString();
			const project = generateRandomString();
			const model = generateRandomString();

			const tickets = times(10, () => ({
				...generateRandomObject(),
				author: generateRandomString(),
				_id: generateUUID(),
			}));
			const fn = jest.spyOn(db, 'insertMany').mockResolvedValueOnce(undefined);

			await TicketLogs.addImportedLogs(teamspace, project, model, tickets);

			const expectedDocs = tickets.map(({ _id, author, ...imported }) => ({
				teamspace,
				project,
				model,
				ticket: _id,
				author,
				timestamp: expect.any(Date),
				imported,
				_id: expect.anything(),
			}));

			expect(fn).toHaveBeenCalledTimes(1);
			expect(fn).toHaveBeenCalledWith(teamspace, TICKET_LOGS_COL,
				expectedDocs);
		});
	});
};

const testGetTicketLogsById = () => {
	describe('Get ticket logs by ID', () => {
		test('Should return ticket logs', async () => {
			const teamspace = generateRandomString();
			const project = generateRandomString();
			const model = generateRandomString();
			const ticketId = generateUUID();

			const mockLogs = times(5, () => generateRandomObject());

			const fn = jest.spyOn(db, 'find').mockResolvedValueOnce(mockLogs);

			const expectedDoc = {
				teamspace, project, model, ticket: ticketId,
			};

			const result = await TicketLogs.getTicketLogsById(teamspace, project, model, ticketId);

			expect(fn).toHaveBeenCalledTimes(1);
			expect(fn).toHaveBeenCalledWith(teamspace, TICKET_LOGS_COL,
				{ ...expectedDoc },
				{ _id: 0, author: 1, changes: 1, timestamp: 1 },
				{ timestamp: 1 });
			expect(result).toEqual(mockLogs);
		});
	});
};

describe(determineTestGroup(__filename), () => {
	testAddTicketLog();
	testAddGroupUpdateLog();
	testAddImportedLog();
	testGetTicketLogsById();
});
