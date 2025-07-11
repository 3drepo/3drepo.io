/**
 *  Copyright (C) 2024 3D Repo Ltd
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

const { src } = require('../../../../../../helper/path');
const {
	determineTestGroup,
	generateRandomString,
} = require('../../../../../../helper/services');

const Settings = require(`${src}/processors/teamspaces/projects/models/commons/settings`);

jest.mock('../../../../../../../../src/v5/models/modelSettings');
const ModelSettings = require(`${src}/models/modelSettings`);

jest.mock('../../../../../../../../src/v5/models/projectSettings');
const ProjectSettings = require(`${src}/models/projectSettings`);

jest.mock('../../../../../../../../src/v5/models/teamspaceSettings');
const TeamspaceSettings = require(`${src}/models/teamspaceSettings`);

jest.mock('../../../../../../../../src/v5/models/roles');
const Roles = require(`${src}/models/roles`);

const testGetUsersWithPermissions = () => {
	describe('Get users with permissions', () => {
		test('should get the users with permissions to a model', async () => {
			const teamspace = generateRandomString();
			const project = generateRandomString();
			const model = generateRandomString();
			const excludeViewers = true;

			const tsAdmins = times(5, () => generateRandomString());
			const projAdmins = times(5, () => generateRandomString());
			const usersWithModelPriv = times(5, () => generateRandomString());

			const tsMembers = [...tsAdmins, ...projAdmins, ...usersWithModelPriv];
			TeamspaceSettings.getAllUsersInTeamspace.mockResolvedValueOnce(tsMembers.map((user) => ({ user })));

			TeamspaceSettings.getTeamspaceAdmins.mockResolvedValueOnce(tsAdmins);
			ProjectSettings.getProjectAdmins.mockResolvedValueOnce(projAdmins);
			ModelSettings.getUsersWithPermissions.mockResolvedValueOnce(usersWithModelPriv);

			await expect(Settings.getUsersWithPermissions(teamspace, project, model, excludeViewers))
				.resolves.toEqual([...tsAdmins, ...projAdmins, ...usersWithModelPriv]);

			expect(TeamspaceSettings.getAllUsersInTeamspace).toHaveBeenCalledTimes(1);
			expect(TeamspaceSettings.getAllUsersInTeamspace).toHaveBeenCalledWith(teamspace);
			expect(TeamspaceSettings.getTeamspaceAdmins).toHaveBeenCalledTimes(1);
			expect(TeamspaceSettings.getTeamspaceAdmins).toHaveBeenCalledWith(teamspace);
			expect(ProjectSettings.getProjectAdmins).toHaveBeenCalledTimes(1);
			expect(ProjectSettings.getProjectAdmins).toHaveBeenCalledWith(teamspace, project);
			expect(ModelSettings.getUsersWithPermissions).toHaveBeenCalledTimes(1);
			expect(ModelSettings.getUsersWithPermissions).toHaveBeenCalledWith(teamspace, model, excludeViewers);
		});

		test('should filter out any users who are not a ts member', async () => {
			const teamspace = generateRandomString();
			const project = generateRandomString();
			const model = generateRandomString();
			const excludeViewers = true;

			const tsAdmins = times(5, () => generateRandomString());
			const projAdmins = times(5, () => generateRandomString());
			const usersWithModelPriv = times(5, () => generateRandomString());

			const tsMembers = [...tsAdmins, ...usersWithModelPriv];
			TeamspaceSettings.getAllUsersInTeamspace.mockResolvedValueOnce(tsMembers.map((user) => ({ user })));

			TeamspaceSettings.getTeamspaceAdmins.mockResolvedValueOnce(tsAdmins);
			ProjectSettings.getProjectAdmins.mockResolvedValueOnce(projAdmins);
			ModelSettings.getUsersWithPermissions.mockResolvedValueOnce(usersWithModelPriv);

			await expect(Settings.getUsersWithPermissions(teamspace, project, model, excludeViewers))
				.resolves.toEqual([...tsAdmins, ...usersWithModelPriv]);

			expect(TeamspaceSettings.getAllUsersInTeamspace).toHaveBeenCalledTimes(1);
			expect(TeamspaceSettings.getAllUsersInTeamspace).toHaveBeenCalledWith(teamspace);
			expect(TeamspaceSettings.getTeamspaceAdmins).toHaveBeenCalledTimes(1);
			expect(TeamspaceSettings.getTeamspaceAdmins).toHaveBeenCalledWith(teamspace);
			expect(ProjectSettings.getProjectAdmins).toHaveBeenCalledTimes(1);
			expect(ProjectSettings.getProjectAdmins).toHaveBeenCalledWith(teamspace, project);
			expect(ModelSettings.getUsersWithPermissions).toHaveBeenCalledTimes(1);
			expect(ModelSettings.getUsersWithPermissions).toHaveBeenCalledWith(teamspace, model, excludeViewers);
		});
	});
};

const testGetRolesWithAccess = () => {
	describe('Get roles with access', () => {
		test('should get the all roles of users who have access to a model', async () => {
			const teamspace = generateRandomString();
			const project = generateRandomString();
			const model = generateRandomString();
			const excludeViewers = true;

			const tsAdmins = times(5, () => generateRandomString());
			const projAdmins = times(5, () => generateRandomString());
			const usersWithModelPriv = times(5, () => generateRandomString());
			const roles = times(5, () => generateRandomString());

			const tsMembers = [...tsAdmins, ...projAdmins, ...usersWithModelPriv];
			TeamspaceSettings.getAllUsersInTeamspace.mockResolvedValueOnce(tsMembers.map((user) => ({ user })));

			TeamspaceSettings.getTeamspaceAdmins.mockResolvedValueOnce(tsAdmins);
			ProjectSettings.getProjectAdmins.mockResolvedValueOnce(projAdmins);
			ModelSettings.getUsersWithPermissions.mockResolvedValueOnce(usersWithModelPriv);
			Roles.getRolesByUsers.mockResolvedValueOnce(roles);

			await expect(Settings.getRolesWithAccess(teamspace, project, model, excludeViewers))
				.resolves.toEqual(roles);

			expect(TeamspaceSettings.getAllUsersInTeamspace).toHaveBeenCalledTimes(1);
			expect(TeamspaceSettings.getAllUsersInTeamspace).toHaveBeenCalledWith(teamspace);
			expect(TeamspaceSettings.getTeamspaceAdmins).toHaveBeenCalledTimes(1);
			expect(TeamspaceSettings.getTeamspaceAdmins).toHaveBeenCalledWith(teamspace);
			expect(ProjectSettings.getProjectAdmins).toHaveBeenCalledTimes(1);
			expect(ProjectSettings.getProjectAdmins).toHaveBeenCalledWith(teamspace, project);
			expect(ModelSettings.getUsersWithPermissions).toHaveBeenCalledTimes(1);
			expect(ModelSettings.getUsersWithPermissions).toHaveBeenCalledWith(teamspace, model, excludeViewers);
			expect(Roles.getRolesByUsers).toHaveBeenCalledTimes(1);
			expect(Roles.getRolesByUsers).toHaveBeenCalledWith(teamspace,
				[...tsAdmins, ...projAdmins, ...usersWithModelPriv]);
		});
	});
};

describe(determineTestGroup(__filename), () => {
	testGetUsersWithPermissions();
	testGetRolesWithAccess();
});
