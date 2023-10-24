/**
 *  Copyright (C) 2023 3D Repo Ltd
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
const { times, cloneDeep } = require('lodash');
const { generateRandomString, generateRandomObject, generateGroup } = require('../../helper/services');

const Groups = require(`${src}/models/tickets.groups`);
const { fieldOperators } = require(`${src}/models/metadata.rules.constants`);

const { templates } = require(`${src}/utils/responseCodes`);

jest.mock('../../../../src/v5/handler/db');
const db = require(`${src}/handler/db`);

jest.mock('../../../../src/v5/services/eventsManager/eventsManager');
const EventsManager = require(`${src}/services/eventsManager/eventsManager`);
const { events } = require(`${src}/services/eventsManager/eventsManager.constants`);

const groupCol = 'tickets.groups';

const testAddGroups = () => {
	describe('Add groups', () => {
		test('Should insert all the groups', async () => {
			const teamspace = generateRandomString();
			const project = generateRandomString();
			const model = generateRandomString();
			const ticket = generateRandomString();
			const data = times(6, {
				[generateRandomString()]: generateRandomString(),
			});

			await Groups.addGroups(teamspace, project, model, ticket, data);

			expect(db.insertMany).toHaveBeenCalledTimes(1);
			expect(db.insertMany).toHaveBeenCalledWith(teamspace, groupCol,
				data.map((entry) => ({ teamspace, project, model, ticket, ...entry })));
		});

		test('Should relay the error if insertMany failed', async () => {
			const teamspace = generateRandomString();
			const project = generateRandomString();
			const model = generateRandomString();
			const ticket = generateRandomString();
			const data = times(6, {
				[generateRandomString()]: generateRandomString(),
			});

			const err = generateRandomString();
			db.insertMany.mockRejectedValueOnce(err);
			await expect(Groups.addGroups(teamspace, project, model, ticket, data)).rejects.toEqual(err);

			expect(db.insertMany).toHaveBeenCalledTimes(1);
			expect(db.insertMany).toHaveBeenCalledWith(teamspace, groupCol,
				data.map((entry) => ({ teamspace, project, model, ticket, ...entry })));
		});
	});
};

const testDeleteGroups = () => {
	describe('Delete groups', () => {
		test('Should insert all the groups', async () => {
			const teamspace = generateRandomString();
			const project = generateRandomString();
			const model = generateRandomString();
			const ticket = generateRandomString();
			const groupIds = times(6, generateRandomString());

			await Groups.deleteGroups(teamspace, project, model, ticket, groupIds);

			expect(db.deleteMany).toHaveBeenCalledTimes(1);
			expect(db.deleteMany).toHaveBeenCalledWith(teamspace, groupCol,
				{ teamspace, project, model, ticket, _id: { $in: groupIds } });
		});

		test('Should relay the error if deleteMany failed', async () => {
			const teamspace = generateRandomString();
			const project = generateRandomString();
			const model = generateRandomString();
			const ticket = generateRandomString();
			const groupIds = times(6, generateRandomString());

			const err = generateRandomString();
			db.deleteMany.mockRejectedValueOnce(err);

			await expect(Groups.deleteGroups(teamspace, project, model, ticket, groupIds)).rejects.toEqual(err);

			expect(db.deleteMany).toHaveBeenCalledTimes(1);
			expect(db.deleteMany).toHaveBeenCalledWith(teamspace, groupCol,
				{ teamspace, project, model, ticket, _id: { $in: groupIds } });
		});
	});
};

const testGetGroupsByIds = () => {
	describe('Get groups by Ids', () => {
		test('Should get all the groups', async () => {
			const teamspace = generateRandomString();
			const project = generateRandomString();
			const model = generateRandomString();
			const ticket = generateRandomString();
			const groupIds = times(6, generateRandomString());
			const projection = { [generateRandomString()]: 1 };

			const expectedVal = [generateGroup(true), generateGroup(false)];

			db.find.mockResolvedValueOnce(expectedVal);

			await expect(Groups.getGroupsByIds(teamspace, project, model, ticket, groupIds, projection))
				.resolves.toEqual(expectedVal);

			expect(db.find).toHaveBeenCalledTimes(1);
			expect(db.find).toHaveBeenCalledWith(teamspace, groupCol,
				{ teamspace, project, model, ticket, _id: { $in: groupIds } }, projection);
		});

		test('Should get all the groups, with legacy schema rules be converted to new schema', async () => {
			const teamspace = generateRandomString();
			const project = generateRandomString();
			const model = generateRandomString();
			const ticket = generateRandomString();
			const groupIds = times(6, generateRandomString());
			const projection = { [generateRandomString()]: 1 };

			const group = generateGroup(true);
			group.rules = group.rules.map(({ name, field, ...rest }) => ({ ...rest, field: generateRandomString() }));

			const groupConverted = cloneDeep(group);
			groupConverted.rules = groupConverted.rules.map(({ field, ...rest }) => ({ ...rest,
				field: {
					values: [field],
					operator: fieldOperators.IS.name,
				} }));

			db.find.mockResolvedValueOnce([group]);

			const result = await Groups.getGroupsByIds(teamspace, project, model, ticket, groupIds, projection);

			expect(result.length).toBe(1);

			for (let i = 0; i < result[0].rules.length; ++i) {
				const resRule = result[0].rules[i];
				const expectedRule = groupConverted.rules[i];

				expect(resRule).toEqual(expect.objectContaining(expectedRule));
			}

			expect(db.find).toHaveBeenCalledTimes(1);
			expect(db.find).toHaveBeenCalledWith(teamspace, groupCol,
				{ teamspace, project, model, ticket, _id: { $in: groupIds } }, projection);
		});

		test('Should relay the error if find failed', async () => {
			const teamspace = generateRandomString();
			const project = generateRandomString();
			const model = generateRandomString();
			const ticket = generateRandomString();
			const groupIds = times(6, generateRandomString());
			const projection = { [generateRandomString()]: 1 };

			const err = generateRandomString();

			db.find.mockRejectedValueOnce(err);

			await expect(Groups.getGroupsByIds(teamspace, project, model, ticket, groupIds, projection))
				.rejects.toEqual(err);

			expect(db.find).toHaveBeenCalledTimes(1);
			expect(db.find).toHaveBeenCalledWith(teamspace, groupCol,
				{ teamspace, project, model, ticket, _id: { $in: groupIds } }, projection);
		});
	});
};

const testUpdateGroup = () => {
	describe('Update Group', () => {
		const teamspace = generateRandomString();
		const project = generateRandomString();
		const model = generateRandomString();
		const ticket = generateRandomString();
		const groupId = generateRandomString();
		const author = generateRandomString();

		test('Should update the group as expected', async () => {
			const data = generateRandomObject();
			await expect(Groups.updateGroup(teamspace, project, model, ticket, groupId, data,
				author)).resolves.toBeUndefined();

			expect(db.updateOne).toHaveBeenCalledTimes(1);
			expect(db.updateOne).toHaveBeenCalledWith(teamspace, groupCol,
				{ teamspace, project, model, ticket, _id: groupId }, { $set: data });

			expect(EventsManager.publish).toHaveBeenCalledTimes(1);
			expect(EventsManager.publish).toHaveBeenCalledWith(events.UPDATE_TICKET_GROUP,
				{ _id: groupId, teamspace, project, model, ticket, changes: data, author });
		});

		test('Should unset objects if rules is being inserted/updated', async () => {
			const data = generateRandomObject();
			data.rules = generateRandomObject();
			await expect(Groups.updateGroup(teamspace, project, model, ticket, groupId, data,
				author)).resolves.toBeUndefined();

			expect(db.updateOne).toHaveBeenCalledTimes(1);
			expect(db.updateOne).toHaveBeenCalledWith(teamspace, groupCol,
				{ teamspace, project, model, ticket, _id: groupId }, { $set: data, $unset: { objects: 1 } });
			expect(EventsManager.publish).toHaveBeenCalledTimes(1);
			expect(EventsManager.publish).toHaveBeenCalledWith(events.UPDATE_TICKET_GROUP,
				{ _id: groupId, teamspace, project, model, ticket, changes: data, author });
		});

		test('Should unset rules if objects is being inserted/updated', async () => {
			const data = generateRandomObject();
			data.objects = generateRandomObject();
			await expect(Groups.updateGroup(teamspace, project, model, ticket, groupId, data,
				author)).resolves.toBeUndefined();

			expect(db.updateOne).toHaveBeenCalledTimes(1);
			expect(db.updateOne).toHaveBeenCalledWith(teamspace, groupCol,
				{ teamspace, project, model, ticket, _id: groupId }, { $set: data, $unset: { rules: 1 } });

			expect(EventsManager.publish).toHaveBeenCalledTimes(1);
			expect(EventsManager.publish).toHaveBeenCalledWith(events.UPDATE_TICKET_GROUP,
				{ _id: groupId, teamspace, project, model, ticket, changes: data, author });
		});
	});
};

const testGetGroupById = () => {
	describe('Get group by Id', () => {
		const teamspace = generateRandomString();
		const project = generateRandomString();
		const model = generateRandomString();
		const ticket = generateRandomString();
		const groupId = generateRandomString();

		test('Should return whatever the query returns', async () => {
			const expectedData = generateGroup(true);

			const projection = generateRandomObject();

			db.findOne.mockResolvedValueOnce(expectedData);

			await expect(Groups.getGroupById(teamspace, project, model, ticket, groupId, projection))
				.resolves.toEqual(expectedData);

			expect(db.findOne).toHaveBeenCalledTimes(1);
			expect(db.findOne).toHaveBeenCalledWith(teamspace, groupCol,
				{ teamspace, project, model, ticket, _id: groupId }, projection);
		});

		test('Should convert legacy schema rules', async () => {
			const group = generateGroup(true);
			group.rules = group.rules.map(({ name, field, ...rest }) => ({ ...rest, field: generateRandomString() }));

			const expectedData = cloneDeep(group);
			expectedData.rules = expectedData.rules.map(({ field, ...rest }) => ({ ...rest,
				field: {
					values: [field],
					operator: fieldOperators.IS.name,
				} }));

			const projection = generateRandomObject();

			db.findOne.mockResolvedValueOnce(expectedData);

			await expect(Groups.getGroupById(teamspace, project, model, ticket, groupId, projection))
				.resolves.toEqual(expectedData);

			expect(db.findOne).toHaveBeenCalledTimes(1);
			expect(db.findOne).toHaveBeenCalledWith(teamspace, groupCol,
				{ teamspace, project, model, ticket, _id: groupId }, projection);
		});

		test('Should apply the default projection if it was not defined', async () => {
			const expectedData = generateRandomObject();

			db.findOne.mockResolvedValueOnce(expectedData);

			await expect(Groups.getGroupById(teamspace, project, model, ticket, groupId))
				.resolves.toEqual(expectedData);

			expect(db.findOne).toHaveBeenCalledTimes(1);
			expect(db.findOne).toHaveBeenCalledWith(teamspace, groupCol,
				{ teamspace, project, model, ticket, _id: groupId },
				{ teamspace: 0, project: 0, model: 0, ticket: 0 });
		});

		test(`Should throw with ${templates.groupNotFound.code} if group was not found`, async () => {
			db.findOne.mockResolvedValueOnce(undefined);

			await expect(Groups.getGroupById(teamspace, project, model, ticket, groupId))
				.rejects.toEqual(templates.groupNotFound);

			expect(db.findOne).toHaveBeenCalledTimes(1);
			expect(db.findOne).toHaveBeenCalledWith(teamspace, groupCol,
				{ teamspace, project, model, ticket, _id: groupId },
				{ teamspace: 0, project: 0, model: 0, ticket: 0 });
		});
	});
};

describe('models/tickets.groups', () => {
	testAddGroups();
	testDeleteGroups();
	testGetGroupsByIds();
	testUpdateGroup();
	testGetGroupById();
});
