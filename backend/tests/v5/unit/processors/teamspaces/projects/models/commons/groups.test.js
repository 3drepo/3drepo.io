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
GroupsModel.getGroupsByIds.mockImplementation(() => Promise.resolve([fullGroupList[0]]));

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

describe('processors/teamspaces/projects/models/commons/groups', () => {
	testGetGroups();
});
