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
const { generateRandomString, determineTestGroup } = require('../../helper/services');

const Roles = require(`${src}/models/roles`);
const db = require(`${src}/handler/db`);

const testCreateTeamspaceRole = () => {
	describe('Create teamspace role', () => {
		test('should create a new teamspace role', async () => {
			const teamspace = generateRandomString();

			const fn = jest.spyOn(db, 'createRole').mockImplementationOnce(() => { });
			await Roles.createTeamspaceRole(teamspace);
			expect(fn).toHaveBeenCalledTimes(1);
			expect(fn).toHaveBeenCalledWith(teamspace, TEAM_MEMBER);
		});
	});
};

const testRemoveTeamspaceRole = () => {
	describe('Remove teamspace role', () => {
		test('should remove the teamspace role', async () => {
			const teamspace = generateRandomString();

			const fn = jest.spyOn(db, 'dropRole').mockImplementationOnce(() => { });
			await Roles.removeTeamspaceRole(teamspace);
			expect(fn).toHaveBeenCalledTimes(1);
			expect(fn).toHaveBeenCalledWith(teamspace, TEAM_MEMBER);
		});
	});
};

const testGrantTeamspaceRoleToUser = () => {
	describe('Grant teamspace role to user', () => {
		test('should assign a teamspace role to the user', async () => {
			const teamspace = generateRandomString();
			const username = generateRandomString();

			const fn = jest.spyOn(db, 'grantRole').mockImplementationOnce(() => { });
			await Roles.grantTeamspaceRoleToUser(teamspace, username);
			expect(fn).toHaveBeenCalledTimes(1);
			expect(fn).toHaveBeenCalledWith(teamspace, TEAM_MEMBER, username);
		});
	});
};

const testRevokeTeamspaceRoleFromUser = () => {
	describe('Revoke teamspace role from user', () => {
		test('should revoke teamspace role from the user', async () => {
			const teamspace = generateRandomString();
			const username = generateRandomString();
			const fn = jest.spyOn(db, 'revokeRole').mockImplementationOnce(() => { });
			await Roles.revokeTeamspaceRoleFromUser(teamspace, username);
			expect(fn).toHaveBeenCalledTimes(1);
			expect(fn).toHaveBeenCalledWith(teamspace, TEAM_MEMBER, username);
		});
	});
};

describe(determineTestGroup(__filename), () => {
	testCreateTeamspaceRole();
	testRemoveTeamspaceRole();
	testGrantTeamspaceRoleToUser();
	testRevokeTeamspaceRoleFromUser();
});
