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

const { src } = require('../../../../../helper/path');

jest.mock('../../../../../../../src/v5/models/projects');
const ProjectsModel = require(`${src}/models/projects`);
jest.mock('../../../../../../../src/v5/models/modelSettings');
const ModelSettings = require(`${src}/models/modelSettings`);
jest.mock('../../../../../../../src/v5/models/users');
const Users = require(`${src}/models/users`);
const Federations = require(`${src}/processors/teamspaces/projects/federations/federations`);


const modelList = [
	{ _id: 1, name: 'model1', permissions: [{ user: 'user1', permission: 'collaborator' }, { user: 'user2', permission: 'collaborator' }] },
	{ _id: 2, name: 'model2', permissions: [{ user: 'user2', permission: 'commenter' }] },
	{ _id: 3, name: 'model3', permissions: [{ user: 'user1', permission: 'viewer' }] },
	{ _id: 4, name: 'model4', permissions: [] },
	{ _id: 4, name: 'model4' },
];

let user1Favourites = [1];

const project = { _id: 1, name: 'project', models: modelList.map(({ _id }) => _id) };

ProjectsModel.getProjectById.mockImplementation(() => project);
ModelSettings.getFederations.mockImplementation(() => modelList);
Users.getFavourites.mockImplementation((user) => (user === 'user1' ? user1Favourites : []));
Users.appendFavourites.mockImplementation(function(username, teamspace, favouritesToAdd) {
	for (const favourite of favouritesToAdd) {
		if (user1Favourites.indexOf(favourite) === -1) {
			user1Favourites.push(favourite);
		}
	}
} );

Users.deleteFavourites.mockImplementation(function(username, teamspace, favouritesToAdd) {
	for (const favourite of favouritesToAdd) {
		const index = user1Favourites.indexOf(favourite);
		if (index !== -1) {
			user1Favourites.splice(index,1);
		}
	}
} );

// Permissions mock
jest.mock('../../../../../../../src/v5/utils/permissions/permissions', () => ({
	...jest.requireActual('../../../../../../../src/v5/utils/permissions/permissions'),
	isTeamspaceAdmin: jest.fn().mockImplementation((teamspace, user) => user === 'tsAdmin'),
	hasProjectAdminPermissions: jest.fn().mockImplementation((perm, user) => user === 'projAdmin'),
}));

const testAppendFavourites = () => {
	describe('Add federations to favourites', () => {
		test('user favourites should stay the same if one or more federations is not found', async () => {
			await Federations.appendFavourites('user1', 'teamspace', 'project', [1, -1]);
			expect(user1Favourites).toEqual([1]);
			user1Favourites = [1];
		});

		test('new federations should be added to favourites if user is TS admin', async () => {
			await Federations.appendFavourites('tsAdmin', 'teamspace', 'project', [1, 2, 3]);
			expect(user1Favourites).toEqual([1, 2, 3]);
			user1Favourites = [1];
		});

		test('new federations should be added to favourites if user has permissions', async () => {
			await Federations.appendFavourites('user1', 'teamspace', 'project', [1, 3]);
			expect(user1Favourites).toEqual([1, 3]);
			user1Favourites = [1];
		});

		test('new federations should not be added to favourites if user has no permissions', async () => {
			await Federations.appendFavourites('user1', 'teamspace', 'project', [1, 2]);
			expect(user1Favourites).toEqual([1]);
			user1Favourites = [1];
		});
	});
};

const testDeleteFavourites = () => {
	describe('Remove federations from favourites', () => {
		test('user favourites should stay the same if one or more federations are not already in', async () => {
			await Federations.deleteFavourites('user1', 'teamspace', 'project', [1, 2]);
			expect(user1Favourites).toEqual([1]);
			user1Favourites = [1];
		});

		test('federations should be removed from user favourites if user is TS admin', async () => {
			await Federations.deleteFavourites('tsAdmin', 'teamspace', 'project', [1]);
			expect(user1Favourites).toEqual([]);
			user1Favourites = [1];
		});

		test('federations should be removed from user favourites if user has permission', async () => {
			await Federations.deleteFavourites('user1', 'teamspace', 'project', [1]);
			expect(user1Favourites).toEqual([]);
			user1Favourites = [1];
		});

		test('federations should not be removed from user favourites if user has no permission', async () => {
			await Federations.deleteFavourites('user3', 'teamspace', 'project', [1]);
			expect(user1Favourites).toEqual([1]);
			user1Favourites = [1];
		});
	});
};

describe('processors/teamspaces/projects/federations', () => {
	testAppendFavourites();
	testDeleteFavourites();
});
