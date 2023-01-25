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

const Group = require(`${src}/models/groups`);
const db = require(`${src}/handler/db`);
const { templates } = require(`${src}/utils/responseCodes`);

const testGetGroupsByIds = () => {
	describe('Get many groups by Ids', () => {
		test('should return the list of Groups ', async () => {
			const expectedData = [
				{
					_id: 'abc',
					name: 'Group 1',
				},
				{
					_id: '123',
					name: 'Group 2',
				},
			];

			const fn = jest.spyOn(db, 'find').mockResolvedValue(expectedData);

			const teamspace = 'someTS';
			const model = 'someModel';
			const groupIds = [1, 2, 3];
			const projection = { _id: 0 };
			const res = await Group.getGroupsByIds(teamspace, model, groupIds, projection);
			expect(res).toEqual(expectedData);
			expect(fn.mock.calls.length).toBe(1);
			expect(fn.mock.calls[0][0]).toEqual(teamspace);
			expect(fn.mock.calls[0][1]).toEqual(`${model}.groups`);
			expect(fn.mock.calls[0][2]).toEqual({ _id: { $in: groupIds } });
			expect(fn.mock.calls[0][3]).toEqual(projection);
		});
	});
};

const testGetGroups = () => {
	describe('Get all groups', () => {
		test('should return the list of Groups ', async () => {
			const expectedData = [
				{
					_id: 'abc',
					name: 'Group 1',
				},
				{
					_id: '123',
					name: 'Group 2',
				},
			];

			const fn = jest.spyOn(db, 'find').mockResolvedValue(expectedData);

			const teamspace = 'someTS';
			const model = 'someModel';
			const projection = { _id: 0 };
			const res = await Group.getGroups(teamspace, model, true, projection);
			expect(res).toEqual(expectedData);
			expect(fn.mock.calls.length).toBe(1);
			expect(fn.mock.calls[0][0]).toEqual(teamspace);
			expect(fn.mock.calls[0][1]).toEqual(`${model}.groups`);
			expect(fn.mock.calls[0][2]).toEqual({});
			expect(fn.mock.calls[0][3]).toEqual(projection);
		});

		test('should return the list of Groups without hidden groups', async () => {
			const expectedData = [
				{
					_id: 'abc',
					name: 'Group 1',
				},
				{
					_id: '123',
					name: 'Group 2',
				},
			];

			const fn = jest.spyOn(db, 'find').mockResolvedValue(expectedData);

			const teamspace = 'someTS';
			const model = 'someModel';
			const projection = { _id: 0 };
			const res = await Group.getGroups(teamspace, model, false, projection);
			expect(res).toEqual(expectedData);
			expect(fn.mock.calls.length).toBe(1);
			expect(fn.mock.calls[0][0]).toEqual(teamspace);
			expect(fn.mock.calls[0][1]).toEqual(`${model}.groups`);
			expect(fn.mock.calls[0][2]).toEqual({
				issue_id: { $exists: false },
				risk_id: { $exists: false },
				sequence_id: { $exists: false },
				view_id: { $exists: false },
			});
			expect(fn.mock.calls[0][3]).toEqual(projection);
		});
	});
};

const testUpdateGroup = () => {
	describe('update group', () => {
		const updateObj = { hello: 1 };
		const _id = 1;
		const teamspace = 'someTS';
		const model = 'someModel';
		test('should update successfully if the id is found', async () => {
			const fn = jest.spyOn(db, 'updateOne').mockResolvedValue(true);
			await expect(Group.updateGroup(teamspace, model, _id, updateObj)).resolves.toBe(undefined);
			expect(fn.mock.calls.length).toBe(1);
			expect(fn.mock.calls[0][0]).toEqual(teamspace);
			expect(fn.mock.calls[0][1]).toEqual(`${model}.groups`);
			expect(fn.mock.calls[0][2]).toEqual({ _id });
			expect(fn.mock.calls[0][3]).toEqual({ $set: { ...updateObj } });
		});

		test('should throw an error if the id is not found', async () => {
			jest.spyOn(db, 'updateOne').mockResolvedValue(false);
			await expect(Group.updateGroup(teamspace, model, _id, updateObj)).rejects.toEqual(templates.groupNotFound);
		});
	});
};

const testAddGroups = () => {
	describe('update group', () => {
		test('should add groups successfully', async () => {
			const groups = [
				{ _id: 1 },
				{ _id: 2 },
				{ _id: 3 },
				{ _id: 4 },
				{ _id: 5 },
			];
			const teamspace = 'someTS';
			const model = 'someModel';
			const fn = jest.spyOn(db, 'insertMany').mockResolvedValue(undefined);
			await expect(Group.addGroups(teamspace, model, groups)).resolves.toBe(undefined);
			expect(fn.mock.calls.length).toBe(1);
			expect(fn.mock.calls[0][0]).toEqual(teamspace);
			expect(fn.mock.calls[0][1]).toEqual(`${model}.groups`);
			expect(fn.mock.calls[0][2]).toEqual(groups);
		});
	});
};

describe('models/groups', () => {
	testGetGroups();
	testGetGroupsByIds();
	testUpdateGroup();
	testAddGroups();
});
