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

const { times } = require('lodash');
const { generateRandomString } = require('../../helper/services');
const { src } = require('../../helper/path');

const Groups = require(`${src}/models/tickets.groups`);

jest.mock('../../../../src/v5/handler/db');
const db = require(`${src}/handler/db`);

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

			const expectedVal = [{ [generateRandomString()]: generateRandomString() }];

			db.find.mockResolvedValueOnce(expectedVal);

			await expect(Groups.getGroupsByIds(teamspace, project, model, ticket, groupIds, projection))
				.resolves.toEqual(expectedVal);

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

describe('models/tickets.groups', () => {
	testAddGroups();
	testDeleteGroups();
	testGetGroupsByIds();
});
