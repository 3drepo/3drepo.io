/**
 *  Copyright (C) 2022 3D Repo Ltd
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
const { TEAM_MEMBER } = require('../../../../src/v5/models/roles.constants');
const { generateRandomString } = require('../../helper/services');

const Roles = require(`${src}/models/roles`);
const db = require(`${src}/handler/db`);

const testCreateTeamspaceRole = () => {
	describe('Create teamspace role', () => {
		test('should create a new teamspace role', async () => {
			const teamspace = generateRandomString();
			const expectedCommand = {
				createRole: TEAM_MEMBER,
				privileges: [],
				roles: [],
			};
			const fn = jest.spyOn(db, 'runCommand').mockImplementation(() => { });
			await Roles.createTeamspaceRole(teamspace);
			expect(fn).toHaveBeenCalledTimes(1);
			expect(fn).toHaveBeenCalledWith(teamspace, expectedCommand);
		});
	});
};

const testGrantTeamspaceRoleToUser = () => {
	describe('Grant teamspace role to user', () => {
		test('should assign a teamspace role to the user', async () => {
			const teamspace = generateRandomString();
			const username = generateRandomString();
			const expectedCommand = {
				grantRolesToUser: username,
				roles: [{ role: TEAM_MEMBER, db: teamspace }],
			};

			const fn = jest.spyOn(db, 'runCommand').mockImplementation(() => { });
			await Roles.grantTeamspaceRoleToUser(teamspace, username);
			expect(fn).toHaveBeenCalledTimes(1);
			expect(fn).toHaveBeenCalledWith('admin', expectedCommand);
		});
	});
};

describe('models/roles', () => {
	testCreateTeamspaceRole();
	testGrantTeamspaceRoleToUser();
});
