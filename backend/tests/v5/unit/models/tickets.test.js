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

jest.mock('../../../../src/v5/utils/helper/tickets');
const TicketsHelper = require(`${src}/utils/helper/tickets`);
jest.mock('../../../../src/v5/services/eventsManager/eventsManager');
const EventsManager = require(`${src}/services/eventsManager/eventsManager`);
const { events } = require(`${src}/services/eventsManager/eventsManager.constants`);
const Ticket = require(`${src}/models/tickets`);
const db = require(`${src}/handler/db`);
const { templates } = require(`${src}/utils/responseCodes`);

const ticketCol = 'tickets';

const testAddTicket = () => {
	describe('Add ticket', () => {
		test('should add the ticket (Container)', async () => {
			const templateType = generateRandomString();
			const data = { [generateRandomString()]: generateRandomString(), type: templateType };
			const number = generateRandomNumber();

			const fn = jest.spyOn(db, 'insertOne').mockResolvedValueOnce(data);
			const publishFn = EventsManager.publish.mockResolvedValueOnce(undefined);
			const serialiseTicketMock = TicketsHelper.serialiseTicket.mockImplementationOnce(() => data);
			const getLastNumber = jest.spyOn(db, 'findOne').mockResolvedValueOnce({ number: number - 1 });
			const teamspace = generateRandomString();
			const project = generateRandomString();
			const model = generateRandomString();
			const template = { [generateRandomString()]: generateRandomString() };

			const _id = await Ticket.addTicket(teamspace, project, model, template, data);

			expect(fn).toHaveBeenCalledTimes(1);
			expect(fn).toHaveBeenCalledWith(teamspace, ticketCol, { ...data, teamspace, project, model, _id, number });

			expect(getLastNumber).toHaveBeenCalledTimes(1);
			expect(getLastNumber).toHaveBeenCalledWith(teamspace, ticketCol,
				{ teamspace, project, model, type: templateType }, { number: 1 }, { number: -1 });

			expect(publishFn).toHaveBeenCalledTimes(1);
			expect(publishFn).toHaveBeenCalledWith(events.CONTAINER_NEW_TICKET, 
				{ teamspace, project, model, ...data });

			expect(serialiseTicketMock).toHaveBeenCalledTimes(1);
			expect(serialiseTicketMock).toHaveBeenCalledWith(
				{ teamspace, project, model, number, _id, ...data }, template);
		});

		test('should add the ticket (Federation)', async () => {
			const templateType = generateRandomString();
			const data = { [generateRandomString()]: generateRandomString(), type: templateType };
			const number = generateRandomNumber();

			const fn = jest.spyOn(db, 'insertOne').mockResolvedValueOnce(data);
			const publishFn = EventsManager.publish.mockResolvedValueOnce(undefined);
			const serialiseTicketMock = TicketsHelper.serialiseTicket.mockImplementationOnce(() => data);
			const getLastNumber = jest.spyOn(db, 'findOne').mockResolvedValueOnce({ number: number - 1 });
			const teamspace = generateRandomString();
			const project = generateRandomString();
			const model = generateRandomString();
			const template = { [generateRandomString()]: generateRandomString() };

			const _id = await Ticket.addTicket(teamspace, project, model, template, data, true);

			expect(fn).toHaveBeenCalledTimes(1);
			expect(fn).toHaveBeenCalledWith(teamspace, ticketCol, { ...data, teamspace, project, model, _id, number });

			expect(getLastNumber).toHaveBeenCalledTimes(1);
			expect(getLastNumber).toHaveBeenCalledWith(teamspace, ticketCol,
				{ teamspace, project, model, type: templateType }, { number: 1 }, { number: -1 });

			expect(publishFn).toHaveBeenCalledTimes(1);
			expect(publishFn).toHaveBeenCalledWith(events.FEDERATION_NEW_TICKET, 
				{ teamspace, project, model, ...data });

			expect(serialiseTicketMock).toHaveBeenCalledTimes(1);
			expect(serialiseTicketMock).toHaveBeenCalledWith(
				{ teamspace, project, model, number, _id, ...data }, template);
		});

		test('should add the ticket with number set to 1 if this is the first ticket', async () => {
			const templateType = generateRandomString();
			const data = { [generateRandomString()]: generateRandomString(), type: templateType };

			const fn = jest.spyOn(db, 'insertOne').mockResolvedValueOnce(data);
			const getLastNumber = jest.spyOn(db, 'findOne').mockResolvedValueOnce(undefined);
			const teamspace = generateRandomString();
			const project = generateRandomString();
			const model = generateRandomString();
			const template = { [generateRandomString()]: generateRandomString() };

			const _id = await Ticket.addTicket(teamspace, project, model, template, data);

			expect(fn).toHaveBeenCalledTimes(1);
			expect(fn).toHaveBeenCalledWith(teamspace, ticketCol,
				{ ...data, teamspace, project, model, _id, number: 1 });

			expect(getLastNumber).toHaveBeenCalledTimes(1);
			expect(getLastNumber).toHaveBeenCalledWith(teamspace, ticketCol,
				{ teamspace, project, model, type: templateType }, { number: 1 }, { number: -1 });
		});
	});
};

const testRemoveAllTickets = () => {
	describe('Remove all tickets', () => {
		test('Should remove all the tickets from the provided model', async () => {
			const teamspace = generateRandomString();
			const project = generateRandomString();
			const model = generateRandomString();
			const fn = jest.spyOn(db, 'deleteMany').mockResolvedValueOnce(undefined);
			await expect(Ticket.removeAllTicketsInModel(teamspace, project, model)).resolves.toBeUndefined();
			expect(fn).toHaveBeenCalledTimes(1);
			expect(fn).toHaveBeenCalledWith(teamspace, ticketCol, { teamspace, project, model });
		});
	});
};

const testGetTicketById = () => {
	describe('Get ticket by ID', () => {
		const teamspace = generateRandomString();
		const project = generateRandomString();
		const model = generateRandomString();
		const ticket = generateRandomString();
		test('should return whatever the database query returns', async () => {
			const projection = { [generateRandomString()]: generateRandomString() };
			const expectedOutput = { [generateRandomString()]: generateRandomString() };

			const fn = jest.spyOn(db, 'findOne').mockResolvedValueOnce(expectedOutput);

			await expect(Ticket.getTicketById(teamspace, project, model, ticket, projection))
				.resolves.toEqual(expectedOutput);

			expect(fn).toHaveBeenCalledTimes(1);
			expect(fn).toHaveBeenCalledWith(teamspace, ticketCol,
				{ teamspace, project, model, _id: ticket }, projection);
		});

		test('should impose default projection if projection is not provided', async () => {
			const expectedOutput = { [generateRandomString()]: generateRandomString() };

			const fn = jest.spyOn(db, 'findOne').mockResolvedValueOnce(expectedOutput);

			await expect(Ticket.getTicketById(teamspace, project, model, ticket))
				.resolves.toEqual(expectedOutput);

			expect(fn).toHaveBeenCalledTimes(1);
			expect(fn).toHaveBeenCalledWith(teamspace, ticketCol,
				{ teamspace, project, model, _id: ticket }, { teamspace: 0, project: 0, model: 0 });
		});

		test(`should reject with ${templates.ticketNotFound.code} if ticket is not found`, async () => {
			jest.spyOn(db, 'findOne').mockResolvedValueOnce(undefined);

			await expect(Ticket.getTicketById(teamspace, project, model, ticket))
				.rejects.toEqual(templates.ticketNotFound);
		});
	});
};

const testGetAllTickets = () => {
	describe('Get all tickets', () => {
		const teamspace = generateRandomString();
		const project = generateRandomString();
		const model = generateRandomString();
		test('Should return whatever the query returns', async () => {
			const projection = { [generateRandomString()]: generateRandomString() };
			const sort = { [generateRandomString()]: generateRandomString() };
			const expectedOutput = { [generateRandomString()]: generateRandomString() };

			const fn = jest.spyOn(db, 'find').mockResolvedValueOnce(expectedOutput);

			await expect(Ticket.getAllTickets(teamspace, project, model, projection, sort))
				.resolves.toEqual(expectedOutput);

			expect(fn).toHaveBeenCalledTimes(1);
			expect(fn).toHaveBeenCalledWith(teamspace, ticketCol,
				{ teamspace, project, model }, projection, sort);
		});

		test('Should impose default projection if not provided', async () => {
			const expectedOutput = { [generateRandomString()]: generateRandomString() };

			const fn = jest.spyOn(db, 'find').mockResolvedValueOnce(expectedOutput);

			await expect(Ticket.getAllTickets(teamspace, project, model))
				.resolves.toEqual(expectedOutput);

			expect(fn).toHaveBeenCalledTimes(1);
			expect(fn).toHaveBeenCalledWith(teamspace, ticketCol,
				{ teamspace, project, model }, { teamspace: 0, project: 0, model: 0 }, undefined);
		});
	});
};

const testUpdateTicket = () => {
	describe('Update ticket', () => {
		test('should update the ticket to set properties', async () => {
			const teamspace = generateRandomString();
			const ticketId = generateRandomString();
			const propToUpdate = generateRandomString();
			const data = { propToUpdate, properties: { propToUpdate }, modules: { module: { propToUpdate } } };
			const fn = jest.spyOn(db, 'updateOne').mockResolvedValueOnce(undefined);

			await Ticket.updateTicket(teamspace, ticketId, data);

			expect(fn).toHaveBeenCalledTimes(1);
			expect(fn).toHaveBeenCalledWith(teamspace, ticketCol, { _id: ticketId },
				{
					$set: {
						'modules.module.propToUpdate': propToUpdate,
						propToUpdate,
						'properties.propToUpdate': propToUpdate,
					},
				});
		});

		test('should update the ticket to unset properties', async () => {
			const teamspace = generateRandomString();
			const ticketId = generateRandomString();
			const data = {
				propToUnset: null,
				properties: { propToUnset: null },
				modules: { module: { propToUnset: null } },
			};
			const fn = jest.spyOn(db, 'updateOne').mockResolvedValueOnce(undefined);

			await Ticket.updateTicket(teamspace, ticketId, data);

			expect(fn).toHaveBeenCalledTimes(1);

			expect(fn).toHaveBeenCalledWith(teamspace, ticketCol, { _id: ticketId },
				{
					$unset: {
						'modules.module.propToUnset': 1,
						propToUnset: 1,
						'properties.propToUnset': 1,
					},
				});
		});

		test('should update the ticket to both set and unset properties', async () => {
			const teamspace = generateRandomString();
			const ticketId = generateRandomString();
			const propToUpdate = generateRandomString();
			const data = {
				propToUpdate,
				propToUnset: null,
				properties: { propToUpdate, propToUnset: null },
				modules: { module: { propToUpdate, propToUnset: null } },
			};
			const fn = jest.spyOn(db, 'updateOne').mockResolvedValueOnce(undefined);

			await Ticket.updateTicket(teamspace, ticketId, data);

			expect(fn).toHaveBeenCalledTimes(1);
			expect(fn).toHaveBeenCalledWith(teamspace, ticketCol, { _id: ticketId },
				{
					$set: {
						'modules.module.propToUpdate': propToUpdate,
						propToUpdate,
						'properties.propToUpdate': propToUpdate,
					},
					$unset: {
						'modules.module.propToUnset': 1,
						propToUnset: 1,
						'properties.propToUnset': 1,
					},
				});
		});

		test('should update the ticket without updating properties', async () => {
			const teamspace = generateRandomString();
			const ticketId = generateRandomString();
			const propToUpdate = generateRandomString();
			const data = { propToUpdate };
			const fn = jest.spyOn(db, 'updateOne').mockResolvedValueOnce(undefined);

			await Ticket.updateTicket(teamspace, ticketId, data);

			expect(fn).toHaveBeenCalledTimes(1);
			expect(fn).toHaveBeenCalledWith(teamspace, ticketCol, { _id: ticketId },
				{ $set: { propToUpdate } });
		});

		test('should not update the ticket if update data is an empty object', async () => {
			const fn = jest.spyOn(db, 'updateOne').mockResolvedValueOnce(undefined);
			await Ticket.updateTicket(generateRandomString(), generateRandomString(), {});

			expect(fn).not.toHaveBeenCalled();
		});
	});
};

describe('models/tickets', () => {
	testAddTicket();
	testRemoveAllTickets();
	testGetTicketById();
	testUpdateTicket();
	testGetAllTickets();
});
