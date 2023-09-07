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

const { castSchema } = require('../../../../src/v5/schemas/rules');
const { cloneDeep } = require('../../../../src/v5/utils/helper/objects');
const { src } = require('../../helper/path');
const { generateRandomString, generateGroup } = require('../../helper/services');

const Group = require(`${src}/models/groups`);
const db = require(`${src}/handler/db`);
const { templates } = require(`${src}/utils/responseCodes`);

const testGetGroupsByIds = () => {
	describe('Get many groups by Ids', () => {
		test('should return the list of Groups ', async () => {
			const expectedData = [
				generateGroup(true),
				generateGroup(true),
			];

			const fn = jest.spyOn(db, 'find').mockResolvedValueOnce(cloneDeep(expectedData));

			const teamspace = generateRandomString();
			const model = generateRandomString();
			const groupIds = [1, 2, 3];
			const projection = { _id: 0 };

			const res = await Group.getGroupsByIds(teamspace, model, groupIds, projection);

			const convertedExpectedData = expectedData.map((g) => ({ ...g, rules: g.rules.map(castSchema) }));
			expect(res).toEqual(convertedExpectedData);
			expect(fn).toHaveBeenCalledTimes(1);
			expect(fn).toHaveBeenCalledWith(teamspace, `${model}.groups`,
				{ _id: { $in: groupIds } }, projection, undefined);
		});
	});
};

const testGetGroups = () => {
	describe('Get all groups', () => {
		test('should return the list of Groups ', async () => {
			const expectedData = [
				generateGroup(true),
				generateGroup(false),
			];

			const fn = jest.spyOn(db, 'find').mockResolvedValue(cloneDeep(expectedData));

			const teamspace = generateRandomString();
			const model = generateRandomString();
			const projection = { _id: 0 };
			const res = await Group.getGroups(teamspace, model, true, projection);
			const convertedExpectedData = expectedData.map((g) => ({
				...g,
				rules: g.rules?.map(castSchema) || undefined,
			}));
			expect(res).toEqual(convertedExpectedData);
			expect(fn).toHaveBeenCalledTimes(1);
			expect(fn).toHaveBeenCalledWith(teamspace, `${model}.groups`,
				{ }, projection, undefined);
		});

		test('should return the list of Groups without hidden groups', async () => {
			const expectedData = [
				generateGroup(true),
				generateGroup(true),
			];

			const fn = jest.spyOn(db, 'find').mockResolvedValue(expectedData);

			const teamspace = generateRandomString();
			const model = generateRandomString();
			const projection = { _id: 0 };
			const res = await Group.getGroups(teamspace, model, false, projection);
			const convertedExpectedData = expectedData.map((g) => ({ ...g, rules: g.rules.map(castSchema) }));
			expect(res).toEqual(convertedExpectedData);
			expect(fn).toHaveBeenCalledTimes(1);
			expect(fn).toHaveBeenCalledWith(teamspace, `${model}.groups`,
				{
					issue_id: { $exists: false },
					risk_id: { $exists: false },
					sequence_id: { $exists: false },
					view_id: { $exists: false },
				}, projection, undefined);
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
