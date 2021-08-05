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

const { src } = require('../../../helper/path');

const Permissions = require(`${src}/utils/permissions/permissions`);
jest.mock('../../../../../src/v5/models/teamspaces');
const Teamspaces = require(`${src}/models/teamspaces`);

const testIsTeamspaceAdmin = () => {
	describe('Is teamspace admin', () => {
		test('should return true if the user is an admin', async () => {
			Teamspaces.getTeamspaceAdmins.mockImplementation(() => (['username']));

			const res = await Permissions.isTeamspaceAdmin('abc', 'username');
			expect(res).toBe(true);
		});
		test('should return false if the user is not an admin', async () => {
			Teamspaces.getTeamspaceAdmins.mockImplementation(() => (['someone else']));

			const res = await Permissions.isTeamspaceAdmin('abc', 'username');
			expect(res).toBe(false);
		});
	});
};

describe('Permissions', () => {
	testIsTeamspaceAdmin();
});
