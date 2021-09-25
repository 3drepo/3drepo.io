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

const { src } = require('../../../../../../helper/path');

const Groups = require(`${src}/processors/teamspaces/projects/models/commons/groups`);

jest.mock('../../../../../../../../src/v5/models/groups');
const GroupsModel = require(`${src}/models/groups`);

const fullGroupList = [{ _id: 1 }, { _id: 2 }];
GroupsModel.getGroups.mockImplementation(() => Promise.resolve(fullGroupList));
GroupsModel.getGroupsByIds.mockImplementation((teamspace, model, ids) => Promise.resolve(
	fullGroupList.filter(({ _id }) => ids.includes(_id)),
));
const addGroupsFn = GroupsModel.addGroups.mockResolvedValue(() => {});
const updateGroupFn = GroupsModel.updateGroup.mockResolvedValue(() => {});

const testGetGroups = () => {
	describe('get groups', () => {
		test('should return all groups if ids are not specified', async () => {
			await expect(Groups.getGroups('teamspace', 'model')).resolves.toEqual(fullGroupList);
		});

		test('should return groups with matching ids are not specified', async () => {
			await expect(Groups.getGroups('teamspace', 'model', [1])).resolves.toEqual([fullGroupList[0]]);
		});
	});
};

const testImportGroups = () => {
	describe('import groups', () => {
		const existingGroups = [
			{ _id: 1, val: 2 },
			{ _id: 2, val: 2 },
		];
		const newGroups = [
			{ _id: 3, val: 2 },
			{ _id: 4, val: 2 },
		];
		test('should import successfully if all groups were new', async () => {
			const addGroupsIdx = addGroupsFn.mock.calls.length;
			const updateGroupIdx = updateGroupFn.mock.calls.length;
			await expect(Groups.importGroups('empty', 'model', newGroups)).resolves.toEqual(undefined);
			expect(updateGroupFn.mock.calls.length).toBe(updateGroupIdx);
			expect(addGroupsFn.mock.calls.length).toBe(addGroupsIdx + 1);
		});

		test('should import successfully if all groups were old', async () => {
			const addGroupsIdx = addGroupsFn.mock.calls.length;
			const updateGroupIdx = updateGroupFn.mock.calls.length;
			await expect(Groups.importGroups('teamspace', 'model', existingGroups)).resolves.toEqual(undefined);
			expect(updateGroupFn.mock.calls.length).toBe(updateGroupIdx + existingGroups.length);
			expect(addGroupsFn.mock.calls.length).toBe(addGroupsIdx);
		});

		test('should import successfully if the group list is a combination of both', async () => {
			const addGroupsIdx = addGroupsFn.mock.calls.length;
			const updateGroupIdx = updateGroupFn.mock.calls.length;
			await expect(Groups.importGroups('teamspace', 'model', [...existingGroups, ...newGroups])).resolves.toEqual(undefined);
			expect(updateGroupFn.mock.calls.length).toBe(updateGroupIdx + existingGroups.length);
			expect(addGroupsFn.mock.calls.length).toBe(addGroupsIdx + 1);
		});
	});
};

describe('processors/teamspaces/projects/models/commons/groups', () => {
	testGetGroups();
	testImportGroups();
});
