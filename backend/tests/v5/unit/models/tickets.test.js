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
const { determineTestGroup, generateRandomString, generateRandomNumber, generateRandomObject } = require('../../helper/services');

const Ticket = require(`${src}/models/tickets`);
const { basePropertyLabels } = require(`${src}/schemas/tickets/templates.constants`);

const db = require(`${src}/handler/db`);
const { Long } = db.dataTypes;
const { templates } = require(`${src}/utils/responseCodes`);
const { UUIDToString } = require(`${src}/utils/helper/uuids`);

const ticketCol = 'tickets';
const ticketCounterCol = 'tickets.counters';

const testAddTicketsWithTemplate = () => {
	describe('Add tickets with template', () => {
		test('Should do nothing if empty array is provided', async () => {
			const teamspace = generateRandomString();
			const project = generateRandomString();
			const model = generateRandomString();
			const templateType = generateRandomString();

			const fn = jest.spyOn(db, 'insertMany');
			const findFn = jest.spyOn(db, 'findOne');

			const res = await Ticket.addTicketsWithTemplate(teamspace, project, model, templateType, []);

			expect(res).toEqual([]);
			expect(fn).not.toHaveBeenCalled();
			expect(findFn).not.toHaveBeenCalled();
		});
		test('Should add the tickets', async () => {
			const teamspace = generateRandomString();
			const project = generateRandomString();
			const model = generateRandomString();
			const templateType = generateRandomString();
			const tickets = times(10, generateRandomObject);
			const number = generateRandomNumber();

			const fn = jest.spyOn(db, 'insertMany').mockImplementation(() => undefined);
			const getLastNumber = jest.spyOn(db, 'findOneAndUpdate').mockResolvedValueOnce({ seq: number - 1 });

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
						number: Long.fromNumber(number + i) })));

			expect(getLastNumber).toHaveBeenCalledTimes(1);
			expect(getLastNumber).toHaveBeenCalledWith(teamspace, ticketCounterCol,
				{ _id: [project, model, templateType].map(UUIDToString).join('_') }, expect.any(Object), { upsert: true });
		});

		test('should add the ticket with number set to 1 if this is the first ticket', async () => {
			const templateType = generateRandomString();
			const data = { [generateRandomString()]: generateRandomString(), type: templateType };

			const fn = jest.spyOn(db, 'insertMany').mockResolvedValueOnce(data);
			const getLastNumber = jest.spyOn(db, 'findOneAndUpdate').mockResolvedValueOnce(undefined);
			const teamspace = generateRandomString();
			const project = generateRandomString();
			const model = generateRandomString();

			const [res] = await Ticket.addTicketsWithTemplate(teamspace, project, model, templateType, [data]);

			expect(fn).toHaveBeenCalledTimes(1);
			expect(fn).toHaveBeenCalledWith(teamspace, ticketCol,
				[{ ...data, teamspace, project, model, _id: res._id, number: Long.fromNumber(1) }]);

			expect(getLastNumber).toHaveBeenCalledTimes(1);
			expect(getLastNumber).toHaveBeenCalledWith(teamspace, ticketCounterCol,
				{ _id: [project, model, templateType].map(UUIDToString).join('_') }, expect.any(Object), { upsert: true });
		});
	});
};

const testRemoveAllTickets = () => {
	describe('Remove all tickets', () => {
		test('Should remove all the tickets from the provided model', async () => {
			const teamspace = generateRandomString();
			const project = generateRandomString();
			const model = generateRandomString();
			const fn = jest.spyOn(db, 'deleteMany').mockResolvedValueOnce(undefined).mockImplementation(() => undefined);
			await Ticket.removeAllTicketsInModel(teamspace, project, model);
			expect(fn).toHaveBeenCalledTimes(2);
			expect(fn).toHaveBeenCalledWith(teamspace, ticketCol, { teamspace, project, model });
			expect(fn).toHaveBeenCalledWith(teamspace, ticketCounterCol, { _id: expect.anything() });
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

const testUpdateTickets = () => {
	const teamspace = generateRandomString();
	const project = generateRandomString();
	const model = generateRandomString();
	const author = generateRandomString();
	const propToUpdate = generateRandomString();
	const ticketCount = 10;

	const runTest = async (oldTickets, updateData, expectedCmd, changeSet) => {
		const fn = jest.spyOn(db, 'bulkWrite').mockResolvedValueOnce(undefined);

		await expect(Ticket.updateTickets(teamspace, project, model,
			oldTickets, updateData, author)).resolves.toEqual(changeSet);

		if (changeSet.length) {
			expect(fn).toHaveBeenCalledTimes(1);
			expect(fn).toHaveBeenCalledWith(teamspace, ticketCol, expectedCmd);
		} else {
			expect(fn).not.toHaveBeenCalled();
		}
	};

	test('should update the ticket to set properties', async () => {
		const oldTickets = [];
		const updateData = [];
		const expectedCmd = [];
		const changeSet = [];

		times(ticketCount, () => {
			const date = new Date();
			const oldPropValue = generateRandomString();
			const newPropValue = generateRandomString();
			const _id = generateRandomString();
			const type = generateRandomString();

			oldTickets.push({ _id,
				type,
				properties: { [propToUpdate]: oldPropValue } });

			updateData.push({
				properties: {
					[propToUpdate]: newPropValue,
					[basePropertyLabels.UPDATED_AT]: date,
				},
				modules: {},
			});

			expectedCmd.push({ updateOne: { filter: { _id, teamspace, project, model },
				update: {
					$set: {
						[`properties.${propToUpdate}`]: newPropValue,
						[`properties.${basePropertyLabels.UPDATED_AT}`]: date,
					},
				} } });

			changeSet.push({
				ticket: {
					_id,
					type,
				},
				author,
				timestamp: date,
				changes: { properties: {
					[propToUpdate]: { from: oldPropValue, to: newPropValue } } } });
		});

		await runTest(oldTickets, updateData, expectedCmd, changeSet);
	});

	test('should update the ticket to set modules', async () => {
		const oldTickets = [];
		const updateData = [];
		const expectedCmd = [];
		const changeSet = [];

		times(ticketCount, () => {
			const date = new Date();
			const oldPropValue = generateRandomString();
			const newPropValue = generateRandomString();
			const _id = generateRandomString();
			const type = generateRandomString();
			const moduleName = generateRandomString();

			updateData.push({
				properties: { [basePropertyLabels.UPDATED_AT]: date },
				modules: { [moduleName]: { [propToUpdate]: newPropValue } },
			});

			oldTickets.push({
				_id,
				type,
				modules: { [moduleName]: { [propToUpdate]: oldPropValue } },
			});

			expectedCmd.push({ updateOne: { filter: { _id, teamspace, project, model },
				update: {
					$set: {
						[`modules.${moduleName}.${propToUpdate}`]: newPropValue,
						[`properties.${basePropertyLabels.UPDATED_AT}`]: date,
					},
				} } });

			changeSet.push({
				ticket: { _id, type },
				author,
				timestamp: date,
				changes: {
					modules: { [moduleName]: { [propToUpdate]: { from: oldPropValue, to: newPropValue } } },
				} });
		});
		await runTest(oldTickets, updateData, expectedCmd, changeSet);
	});

	test('should update the ticket to set and unset data', async () => {
		const oldTickets = [];
		const updateData = [];
		const expectedCmd = [];
		const changeSet = [];

		times(ticketCount, () => {
			const date = new Date();
			const oldPropValue = generateRandomString();
			const newPropValue = generateRandomString();
			const _id = generateRandomString();
			const type = generateRandomString();

			oldTickets.push({
				_id,
				type,
				properties: { propToUnset: oldPropValue, numProp: 2 },
				modules: { module: { propToUnset: oldPropValue, numProp: 2 } },
			});

			updateData.push({
				[propToUpdate]: newPropValue,
				properties: { propToUnset: null, numProp: 0, [basePropertyLabels.UPDATED_AT]: date },
				modules: { module: { propToUnset: null, numProp: 0 } },
			});

			expectedCmd.push({ updateOne: { filter: { _id, teamspace, project, model },
				update: {
					$set: { [`properties.${basePropertyLabels.UPDATED_AT}`]: date, 'properties.numProp': 0, [propToUpdate]: newPropValue, 'modules.module.numProp': 0 },
					$unset: { 'modules.module.propToUnset': 1, 'properties.propToUnset': 1 },
				} } });

			changeSet.push({
				ticket: { _id, type },
				author,
				timestamp: date,
				changes: {
					[propToUpdate]: { from: undefined, to: newPropValue },
					properties: { propToUnset: { from: oldPropValue, to: null }, numProp: { from: 2, to: 0 } },
					modules: { module: { propToUnset: { from: oldPropValue, to: null }, numProp: { from: 2, to: 0 } } },
				},
			});
		});

		await runTest(oldTickets, updateData, expectedCmd, changeSet);
	});
	describe('Composite types', () => {
		test('Should retain other properties within the compsite type if the embedded field has been updated', async () => {
			const oldTickets = [];
			const updateData = [];
			const expectedCmd = [];
			const changeSet = [];

			times(ticketCount, () => {
				const date = new Date();
				const propName = generateRandomString();
				const embeddedFieldName = generateRandomString();
				const oldPropValue = {
					[generateRandomString]: generateRandomString(),
					[embeddedFieldName]: generateRandomString(),
				};
				const newPropValue = { [embeddedFieldName]: generateRandomString() };
				const _id = generateRandomString();
				const type = generateRandomString();
				const moduleName = generateRandomString();
				oldTickets.push({
					_id,
					type,
					properties: { [propName]: oldPropValue },
					modules: { [moduleName]: { [propName]: oldPropValue } },
				});

				updateData.push({
					properties: { [propName]: newPropValue, [basePropertyLabels.UPDATED_AT]: date },
					modules: { [moduleName]: { [propName]: newPropValue } },
				});
				const expectedValue = { ...oldPropValue, ...newPropValue };

				expectedCmd.push({ updateOne: { filter: { _id, teamspace, project, model },
					update: {
						$set: {
							[`properties.${basePropertyLabels.UPDATED_AT}`]: date,
							[`properties.${propName}`]: expectedValue,
							[`modules.${moduleName}.${propName}`]: expectedValue,

						},
					} },
				});

				changeSet.push({ ticket: { _id, type },
					author,
					timestamp: date,
					changes: {
						properties: { [propName]: { from: oldPropValue, to: expectedValue } },
						modules: { [moduleName]: { [propName]: { from: oldPropValue, to: expectedValue } } },
					} });
			});

			await runTest(oldTickets, updateData, expectedCmd, changeSet);
		});

		test('Should retain other properties within the compsite type if the embedded field has been removed', async () => {
			const oldTickets = [];
			const updateData = [];
			const expectedCmd = [];
			const changeSet = [];

			times(ticketCount, () => {
				const date = new Date();
				const _id = generateRandomString();
				const type = generateRandomString();
				const moduleName = generateRandomString();

				const propName = generateRandomString();
				const embeddedFieldName = generateRandomString();
				const oldPropValue = {
					[generateRandomString]: generateRandomString(),
					[embeddedFieldName]: generateRandomString(),
				};
				const newPropValue = { [embeddedFieldName]: null };

				oldTickets.push({
					_id,
					type,
					properties: { [propName]: oldPropValue },
					modules: { [moduleName]: { [propName]: oldPropValue } },
				});

				updateData.push({
					properties: { [propName]: newPropValue, [basePropertyLabels.UPDATED_AT]: date },
					modules: { [moduleName]: { [propName]: newPropValue } },
				});

				const expectedValue = { ...oldPropValue, ...newPropValue };
				delete expectedValue[embeddedFieldName];

				expectedCmd.push({ updateOne: { filter: { _id, teamspace, project, model },
					update: {
						$set: {
							[`properties.${basePropertyLabels.UPDATED_AT}`]: date,
							[`properties.${propName}`]: expectedValue,
							[`modules.${moduleName}.${propName}`]: expectedValue,

						},
					} } });

				changeSet.push({
					ticket: { _id, type },
					author,
					timestamp: date,
					changes: {
						properties: { [propName]: { from: oldPropValue, to: expectedValue } },
						modules: { [moduleName]: { [propName]: { from: oldPropValue, to: expectedValue } } },
					},
				});
			});

			await runTest(oldTickets, updateData, expectedCmd, changeSet);
		});
		test('Should update the property correctly if it was undefined before', async () => {
			const oldTickets = [];
			const updateData = [];
			const expectedCmd = [];
			const changeSet = [];

			times(ticketCount, () => {
				const date = new Date();
				const propName = generateRandomString();
				const oldPropValue = null;
				const embeddedFieldName = generateRandomString();
				const newPropValue = { [embeddedFieldName]: generateRandomString() };
				const _id = generateRandomString();
				const type = generateRandomString();
				const moduleName = generateRandomString();

				oldTickets.push({
					_id,
					type,
					properties: { [propName]: oldPropValue },
					modules: { [moduleName]: { [propName]: oldPropValue } },
				});

				updateData.push({
					properties: { [propName]: newPropValue, [basePropertyLabels.UPDATED_AT]: date },
					modules: { [moduleName]: { [propName]: newPropValue } },
				});

				const expectedValue = { ...oldPropValue, ...newPropValue };

				expectedCmd.push({ updateOne: { filter: { _id, teamspace, project, model },
					update: {
						$set: {
							[`properties.${basePropertyLabels.UPDATED_AT}`]: date,
							[`properties.${propName}`]: expectedValue,
							[`modules.${moduleName}.${propName}`]: expectedValue,

						},
					} } });

				changeSet.push({ ticket: { _id, type },
					author,
					timestamp: date,
					changes: {
						properties: { [propName]: { from: oldPropValue, to: expectedValue } },
						modules: { [moduleName]: { [propName]: { from: oldPropValue, to: expectedValue } } },
					},
				});
			});

			await runTest(oldTickets, updateData, expectedCmd, changeSet);
		});

		test('Should remove the property if the removal of embedded field means the property will be {}', async () => {
			const oldTickets = [];
			const updateData = [];
			const expectedCmd = [];
			const changeSet = [];

			times(ticketCount, () => {
				const date = new Date();
				const propName = generateRandomString();
				const embeddedFieldName = generateRandomString();
				const oldPropValue = {
					[embeddedFieldName]: generateRandomString(),
				};
				const newPropValue = { [embeddedFieldName]: null };
				const _id = generateRandomString();
				const type = generateRandomString();
				const moduleName = generateRandomString();

				oldTickets.push({
					_id,
					type,
					properties: { [propName]: oldPropValue },
					modules: { [moduleName]: { [propName]: oldPropValue } },
				});
				updateData.push({
					properties: { [propName]: newPropValue, [basePropertyLabels.UPDATED_AT]: date },
					modules: { [moduleName]: { [propName]: newPropValue } },
				});

				const expectedValue = { ...oldPropValue, ...newPropValue };
				delete expectedValue[embeddedFieldName];

				expectedCmd.push({ updateOne: { filter: { _id, teamspace, project, model },
					update: {
						$set: {
							[`properties.${basePropertyLabels.UPDATED_AT}`]: date,
						},
						$unset: {

							[`properties.${propName}`]: 1,
							[`modules.${moduleName}.${propName}`]: 1,

						},
					} } });

				changeSet.push({
					ticket: { _id, type },
					author,
					timestamp: date,
					changes: {
						properties: { [propName]: { from: oldPropValue, to: null } },
						modules: { [moduleName]: { [propName]: { from: oldPropValue, to: null } } },
					},
				});
			});

			await runTest(oldTickets, updateData, expectedCmd, changeSet);
		});
	});

	test('should not update the ticket if there is nothing to update', async () => {
		const oldTickets = [];
		const updateData = [];
		const expectedCmd = [];
		const changeSet = [];

		times(ticketCount, () => {
			const oldPropValue = generateRandomString();
			const _id = generateRandomString();
			const type = generateRandomString();
			const moduleName = generateRandomString();
			oldTickets.push({
				_id,
				type,
				properties: { [propToUpdate]: oldPropValue },
				modules: { [moduleName]: { [propToUpdate]: oldPropValue } },
			});
			updateData.push({
				properties: {},
				modules: {},
			});
		});

		await runTest(oldTickets, updateData, expectedCmd, changeSet);
	});
};

describe(determineTestGroup(__filename), () => {
	testAddTicketsWithTemplate();
	testRemoveAllTickets();
	testGetTicketById();
	testUpdateTickets();
	testGetAllTickets();
	testGetTicketsByQuery();
});
