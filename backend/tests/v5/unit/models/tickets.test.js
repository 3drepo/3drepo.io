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

const { times } = require('lodash');
const { src } = require('../../helper/path');
const { generateRandomString, generateRandomNumber, generateRandomObject } = require('../../helper/services');

jest.mock('../../../../src/v5/services/eventsManager/eventsManager');
const EventsManager = require(`${src}/services/eventsManager/eventsManager`);
const { events } = require(`${src}/services/eventsManager/eventsManager.constants`);
const Ticket = require(`${src}/models/tickets`);
const { basePropertyLabels } = require(`${src}/schemas/tickets/templates.constants`);

const db = require(`${src}/handler/db`);
const { templates } = require(`${src}/utils/responseCodes`);

const ticketCol = 'tickets';

const testAddTicketsWithTemplate = () => {
	describe('Add tickets with template', () => {
		test('Should add the tickets', async () => {
			const teamspace = generateRandomString();
			const project = generateRandomString();
			const model = generateRandomString();
			const templateType = generateRandomString();
			const tickets = times(10, generateRandomObject);
			const number = generateRandomNumber();

			const fn = jest.spyOn(db, 'insertMany');
			const getLastNumber = jest.spyOn(db, 'findOne').mockResolvedValueOnce({ number: number - 1 });

			const res = await Ticket.addTicketsWithTemplate(teamspace, project, model, templateType, tickets);

			expect(res.length).toEqual(tickets.length);

			expect(fn).toHaveBeenCalledTimes(1);
			expect(fn).toHaveBeenCalledWith(teamspace, ticketCol,
				tickets.map((ticket, i) => (
					{ ...ticket,
						teamspace,
						project,
						model,
						_id: res[i]._id,
						number: number + i })));

			expect(getLastNumber).toHaveBeenCalledTimes(1);
			expect(getLastNumber).toHaveBeenCalledWith(teamspace, ticketCol,
				{ teamspace, project, model, type: templateType }, { number: 1 }, { number: -1 });
		});

		test('should add the ticket with number set to 1 if this is the first ticket', async () => {
			const templateType = generateRandomString();
			const data = { [generateRandomString()]: generateRandomString(), type: templateType };

			const fn = jest.spyOn(db, 'insertMany').mockResolvedValueOnce(data);
			const getLastNumber = jest.spyOn(db, 'findOne').mockResolvedValueOnce(undefined);
			const teamspace = generateRandomString();
			const project = generateRandomString();
			const model = generateRandomString();

			const [res] = await Ticket.addTicketsWithTemplate(teamspace, project, model, templateType, [data]);

			expect(fn).toHaveBeenCalledTimes(1);
			expect(fn).toHaveBeenCalledWith(teamspace, ticketCol,
				[{ ...data, teamspace, project, model, _id: res._id, number: 1 }]);

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

			await expect(Ticket.getAllTickets(teamspace, project, model, { projection, sort }))
				.resolves.toEqual(expectedOutput);

			expect(fn).toHaveBeenCalledTimes(1);
			expect(fn).toHaveBeenCalledWith(teamspace, ticketCol,
				{ teamspace, project, model }, projection, sort);
		});

		test('Should impose default projection and sort if not provided', async () => {
			const expectedOutput = { [generateRandomString()]: generateRandomString() };

			const fn = jest.spyOn(db, 'find').mockResolvedValueOnce(expectedOutput);

			await expect(Ticket.getAllTickets(teamspace, project, model))
				.resolves.toEqual(expectedOutput);

			expect(fn).toHaveBeenCalledTimes(1);
			expect(fn).toHaveBeenCalledWith(teamspace, ticketCol,
				{ teamspace, project, model }, { teamspace: 0, project: 0, model: 0 }, { [`properties.${basePropertyLabels.Created_AT}`]: -1 });
		});

		test('Should impose query for updated since a certain date if it is provided', async () => {
			const expectedOutput = { [generateRandomString()]: generateRandomString() };

			const fn = jest.spyOn(db, 'find').mockResolvedValueOnce(expectedOutput);

			const date = new Date();
			await expect(Ticket.getAllTickets(teamspace, project, model, { updatedSince: date }))
				.resolves.toEqual(expectedOutput);

			expect(fn).toHaveBeenCalledTimes(1);
			expect(fn).toHaveBeenCalledWith(teamspace, ticketCol,
				{ teamspace, project, model, [`properties.${basePropertyLabels.UPDATED_AT}`]: { $gt: date } },
				{ teamspace: 0, project: 0, model: 0 }, { [`properties.${basePropertyLabels.Created_AT}`]: -1 });
		});
	});
};

const testGetTicketsByQuery = () => {
	describe('Get tickets by query', () => {
		test('Should return whatever the query returns', async () => {
			const teamspace = generateRandomString();
			const project = generateRandomString();
			const model = generateRandomString();
			const query = { [generateRandomString()]: generateRandomString() };
			const projection = { [generateRandomString()]: generateRandomString() };
			const expectedOutput = { [generateRandomString()]: generateRandomString() };

			const fn = jest.spyOn(db, 'find').mockResolvedValueOnce(expectedOutput);

			await expect(Ticket.getTicketsByQuery(teamspace, project, model, query, projection))
				.resolves.toEqual(expectedOutput);

			expect(fn).toHaveBeenCalledTimes(1);
			expect(fn).toHaveBeenCalledWith(teamspace, ticketCol,
				{ teamspace, project, model, ...query }, projection);
		});
	});
};

const testUpdateTicket = () => {
	describe('Update ticket', () => {
		const teamspace = generateRandomString();
		const project = generateRandomString();
		const model = generateRandomString();
		const date = new Date();
		const author = generateRandomString();
		const propToUpdate = generateRandomString();

		test('should update the ticket to set properties', async () => {
			const oldPropValue = generateRandomString();
			const newPropValue = generateRandomString();
			const oldTicket = { _id: generateRandomString(),
				type: generateRandomString(),
				properties: { [propToUpdate]: oldPropValue } };
			const updateData = {
				properties: {
					[propToUpdate]: newPropValue,
					[basePropertyLabels.UPDATED_AT]: date,
				},
				modules: {},
			};
			const fn = jest.spyOn(db, 'updateOne').mockResolvedValueOnce(undefined);

			await Ticket.updateTicket(teamspace, project, model, oldTicket, updateData, author);

			expect(fn).toHaveBeenCalledTimes(1);
			expect(fn).toHaveBeenCalledWith(teamspace, ticketCol, { _id: oldTicket._id },
				{
					$set: {
						[`properties.${propToUpdate}`]: newPropValue,
						[`properties.${basePropertyLabels.UPDATED_AT}`]: date,
					},
				});
			expect(EventsManager.publish).toHaveBeenCalledTimes(1);
			expect(EventsManager.publish).toHaveBeenCalledWith(events.UPDATE_TICKET, {
				teamspace,
				project,
				model,
				ticket: { _id: oldTicket._id, type: oldTicket.type },
				author,
				timestamp: date,
				changes: { properties: { [propToUpdate]: { from: oldPropValue, to: newPropValue } } },
			});
		});

		test('should update the ticket to set modules', async () => {
			const oldPropValue = generateRandomString();
			const newPropValue = generateRandomString();
			const moduleName = generateRandomString();
			const updateData = {
				properties: { [basePropertyLabels.UPDATED_AT]: date },
				modules: { [moduleName]: { [propToUpdate]: newPropValue } },
			};
			const oldTicket = {
				_id: generateRandomString(),
				type: generateRandomString(),
				modules: { [moduleName]: { [propToUpdate]: oldPropValue } },
			};
			const fn = jest.spyOn(db, 'updateOne').mockResolvedValueOnce(undefined);

			await Ticket.updateTicket(teamspace, project, model, oldTicket, updateData, author);

			expect(fn).toHaveBeenCalledTimes(1);
			expect(fn).toHaveBeenCalledWith(teamspace, ticketCol, { _id: oldTicket._id },
				{
					$set: {
						[`modules.${moduleName}.${propToUpdate}`]: newPropValue,
						[`properties.${basePropertyLabels.UPDATED_AT}`]: date,
					},
				});
			expect(EventsManager.publish).toHaveBeenCalledTimes(1);
			expect(EventsManager.publish).toHaveBeenCalledWith(events.UPDATE_TICKET, {
				teamspace,
				project,
				model,
				ticket: { _id: oldTicket._id, type: oldTicket.type },
				author,
				timestamp: date,
				changes: {
					modules: { [moduleName]: { [propToUpdate]: { from: oldPropValue, to: newPropValue } } },
				},
			});
		});

		test('should update the ticket to set and unset data', async () => {
			const oldPropValue = generateRandomString();
			const newPropValue = generateRandomString();
			const oldTicket = {
				_id: generateRandomString(),
				type: generateRandomString(),
				properties: { propToUnset: oldPropValue },
				modules: { module: { propToUnset: oldPropValue } },
			};
			const updateData = {
				[propToUpdate]: newPropValue,
				properties: { propToUnset: null, [basePropertyLabels.UPDATED_AT]: date },
				modules: { module: { propToUnset: null } },
			};
			const fn = jest.spyOn(db, 'updateOne').mockResolvedValueOnce(undefined);

			await Ticket.updateTicket(teamspace, project, model, oldTicket, updateData, author);

			expect(fn).toHaveBeenCalledTimes(1);
			expect(fn).toHaveBeenCalledWith(teamspace, ticketCol, { _id: oldTicket._id },
				{
					$set: { [`properties.${basePropertyLabels.UPDATED_AT}`]: date, [propToUpdate]: newPropValue },
					$unset: { 'modules.module.propToUnset': 1, 'properties.propToUnset': 1 },
				});
			expect(EventsManager.publish).toHaveBeenCalledTimes(1);
			expect(EventsManager.publish).toHaveBeenCalledWith(events.UPDATE_TICKET, {
				teamspace,
				project,
				model,
				ticket: { _id: oldTicket._id, type: oldTicket.type },
				author,
				timestamp: date,
				changes: {
					[propToUpdate]: { from: undefined, to: newPropValue },
					properties: { propToUnset: { from: oldPropValue, to: null } },
					modules: { module: { propToUnset: { from: oldPropValue, to: null } } },
				},
			});
		});
		describe('Composite types', () => {
			test('Should retain other properties within the compsite type if the embedded field has been updated', async () => {
				const propName = generateRandomString();
				const embeddedFieldName = generateRandomString();
				const oldPropValue = {
					[generateRandomString]: generateRandomString(),
					[embeddedFieldName]: generateRandomString(),
				};
				const newPropValue = { [embeddedFieldName]: generateRandomString() };
				const oldTicket = {
					_id: generateRandomString(),
					type: generateRandomString(),
					properties: { [propName]: oldPropValue },
					modules: { module: { [propName]: oldPropValue } },
				};
				const updateData = {
					properties: { [propName]: newPropValue, [basePropertyLabels.UPDATED_AT]: date },
					modules: { module: { [propName]: newPropValue } },
				};
				const fn = jest.spyOn(db, 'updateOne').mockResolvedValueOnce(undefined);

				await Ticket.updateTicket(teamspace, project, model, oldTicket, updateData, author);

				const expectedValue = { ...oldPropValue, ...newPropValue };

				expect(fn).toHaveBeenCalledTimes(1);
				expect(fn).toHaveBeenCalledWith(teamspace, ticketCol, { _id: oldTicket._id },
					{
						$set: {
							[`properties.${basePropertyLabels.UPDATED_AT}`]: date,
							[`properties.${propName}`]: expectedValue,
							[`modules.module.${propName}`]: expectedValue,

						},
					});

				expect(EventsManager.publish).toHaveBeenCalledTimes(1);
				expect(EventsManager.publish).toHaveBeenCalledWith(events.UPDATE_TICKET, {
					teamspace,
					project,
					model,
					ticket: { _id: oldTicket._id, type: oldTicket.type },
					author,
					timestamp: date,
					changes: {
						properties: { [propName]: { from: oldPropValue, to: expectedValue } },
						modules: { module: { [propName]: { from: oldPropValue, to: expectedValue } } },
					},
				});
			});

			test('Should retain other properties within the compsite type if the embedded field has been removed', async () => {
				const propName = generateRandomString();
				const embeddedFieldName = generateRandomString();
				const oldPropValue = {
					[generateRandomString]: generateRandomString(),
					[embeddedFieldName]: generateRandomString(),
				};
				const newPropValue = { [embeddedFieldName]: null };
				const oldTicket = {
					_id: generateRandomString(),
					type: generateRandomString(),
					properties: { [propName]: oldPropValue },
					modules: { module: { [propName]: oldPropValue } },
				};
				const updateData = {
					properties: { [propName]: newPropValue, [basePropertyLabels.UPDATED_AT]: date },
					modules: { module: { [propName]: newPropValue } },
				};
				const fn = jest.spyOn(db, 'updateOne').mockResolvedValueOnce(undefined);

				await Ticket.updateTicket(teamspace, project, model, oldTicket, updateData, author);

				const expectedValue = { ...oldPropValue, ...newPropValue };
				delete expectedValue[embeddedFieldName];

				expect(fn).toHaveBeenCalledTimes(1);
				expect(fn).toHaveBeenCalledWith(teamspace, ticketCol, { _id: oldTicket._id },
					{
						$set: {
							[`properties.${basePropertyLabels.UPDATED_AT}`]: date,
							[`properties.${propName}`]: expectedValue,
							[`modules.module.${propName}`]: expectedValue,

						},
					});

				expect(EventsManager.publish).toHaveBeenCalledTimes(1);
				expect(EventsManager.publish).toHaveBeenCalledWith(events.UPDATE_TICKET, {
					teamspace,
					project,
					model,
					ticket: { _id: oldTicket._id, type: oldTicket.type },
					author,
					timestamp: date,
					changes: {
						properties: { [propName]: { from: oldPropValue, to: expectedValue } },
						modules: { module: { [propName]: { from: oldPropValue, to: expectedValue } } },
					},
				});
			});
			test('Should update the property correctly if it was undefined before', async () => {
				const propName = generateRandomString();
				const embeddedFieldName = generateRandomString();
				const oldPropValue = null;
				const newPropValue = { [embeddedFieldName]: generateRandomString() };
				const oldTicket = {
					_id: generateRandomString(),
					type: generateRandomString(),
					properties: { [propName]: oldPropValue },
					modules: { module: { [propName]: oldPropValue } },
				};
				const updateData = {
					properties: { [propName]: newPropValue, [basePropertyLabels.UPDATED_AT]: date },
					modules: { module: { [propName]: newPropValue } },
				};
				const fn = jest.spyOn(db, 'updateOne').mockResolvedValueOnce(undefined);

				await Ticket.updateTicket(teamspace, project, model, oldTicket, updateData, author);

				const expectedValue = { ...oldPropValue, ...newPropValue };

				expect(fn).toHaveBeenCalledTimes(1);
				expect(fn).toHaveBeenCalledWith(teamspace, ticketCol, { _id: oldTicket._id },
					{
						$set: {
							[`properties.${basePropertyLabels.UPDATED_AT}`]: date,
							[`properties.${propName}`]: expectedValue,
							[`modules.module.${propName}`]: expectedValue,

						},
					});

				expect(EventsManager.publish).toHaveBeenCalledTimes(1);
				expect(EventsManager.publish).toHaveBeenCalledWith(events.UPDATE_TICKET, {
					teamspace,
					project,
					model,
					ticket: { _id: oldTicket._id, type: oldTicket.type },
					author,
					timestamp: date,
					changes: {
						properties: { [propName]: { from: oldPropValue, to: expectedValue } },
						modules: { module: { [propName]: { from: oldPropValue, to: expectedValue } } },
					},
				});
			});

			test('Should remove the property if the removal of embedded field means the property will be {}', async () => {
				const propName = generateRandomString();
				const embeddedFieldName = generateRandomString();
				const oldPropValue = {
					[embeddedFieldName]: generateRandomString(),
				};
				const newPropValue = { [embeddedFieldName]: null };
				const oldTicket = {
					_id: generateRandomString(),
					type: generateRandomString(),
					properties: { [propName]: oldPropValue },
					modules: { module: { [propName]: oldPropValue } },
				};
				const updateData = {
					properties: { [propName]: newPropValue, [basePropertyLabels.UPDATED_AT]: date },
					modules: { module: { [propName]: newPropValue } },
				};
				const fn = jest.spyOn(db, 'updateOne').mockResolvedValueOnce(undefined);

				await Ticket.updateTicket(teamspace, project, model, oldTicket, updateData, author);

				const expectedValue = { ...oldPropValue, ...newPropValue };
				delete expectedValue[embeddedFieldName];

				expect(fn).toHaveBeenCalledTimes(1);
				expect(fn).toHaveBeenCalledWith(teamspace, ticketCol, { _id: oldTicket._id },
					{
						$set: {
							[`properties.${basePropertyLabels.UPDATED_AT}`]: date,
						},
						$unset: {

							[`properties.${propName}`]: 1,
							[`modules.module.${propName}`]: 1,

						},
					});

				expect(EventsManager.publish).toHaveBeenCalledTimes(1);
				expect(EventsManager.publish).toHaveBeenCalledWith(events.UPDATE_TICKET, {
					teamspace,
					project,
					model,
					ticket: { _id: oldTicket._id, type: oldTicket.type },
					author,
					timestamp: date,
					changes: {
						properties: { [propName]: { from: oldPropValue, to: null } },
						modules: { module: { [propName]: { from: oldPropValue, to: null } } },
					},
				});
			});
		});

		test('should not trigger UPDATE_TICKET event if update fails', async () => {
			const oldPropValue = generateRandomString();
			const newPropValue = generateRandomString();
			const oldTicket = {
				_id: generateRandomString(),
				type: generateRandomString(),
				properties: { propToUnset: oldPropValue },
				modules: { module: { propToUnset: oldPropValue } },
			};
			const updateData = {
				[propToUpdate]: newPropValue,
				properties: { propToUnset: null, [basePropertyLabels.UPDATED_AT]: date },
				modules: { module: { propToUnset: null } },
			};

			const errMsg = new Error(generateRandomString());
			jest.spyOn(db, 'updateOne').mockRejectedValueOnce(errMsg);
			await expect(Ticket.updateTicket(teamspace, project, model, oldTicket, updateData, author))
				.rejects.toEqual(errMsg);
			expect(EventsManager.publish).not.toHaveBeenCalled();
		});

		test('should not update the ticket if there is nothing to update', async () => {
			const oldPropValue = generateRandomString();
			const oldTicket = {
				_id: generateRandomString(),
				type: generateRandomString(),
				properties: { [propToUpdate]: oldPropValue },
				modules: { module: { [propToUpdate]: oldPropValue } },
			};
			const updateData = {
				properties: {},
				modules: {},
			};

			const fn = jest.spyOn(db, 'updateOne');
			await Ticket.updateTicket(teamspace, project, model, oldTicket, updateData, author);
			expect(fn).not.toHaveBeenCalled();
			expect(EventsManager.publish).not.toHaveBeenCalled();
		});
	});
};

describe('models/tickets', () => {
	testAddTicketsWithTemplate();
	testRemoveAllTickets();
	testGetTicketById();
	testUpdateTicket();
	testGetAllTickets();
	testGetTicketsByQuery();
});
