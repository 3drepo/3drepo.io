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

jest.mock('../../../../../../../../src/v5/models/jobs');
const Jobs = require(`${src}/models/jobs`);

const testGetMembers = () => {
	describe('Get members', () => {
		test('should get the members of a model', async () => {
			const teamspace = generateRandomString();
			const project = generateRandomString();
			const model = generateRandomString();
			const excludeViewers = true;

			const tsAdmins = times(5, () => generateRandomString());
			const projAdmins = times(5, () => generateRandomString());
			const modelMembers = times(5, () => generateRandomString());
			TeamspaceSettings.getTeamspaceAdmins.mockResolvedValueOnce(tsAdmins);
			ProjectSettings.getProjectAdmins.mockResolvedValueOnce(projAdmins);
			ModelSettings.getMembers.mockResolvedValueOnce(modelMembers);

			await expect(Settings.getMembers(teamspace, project, model, excludeViewers))
				.resolves.toEqual([...tsAdmins, ...projAdmins, ...modelMembers]);

			expect(TeamspaceSettings.getTeamspaceAdmins).toHaveBeenCalledTimes(1);
			expect(TeamspaceSettings.getTeamspaceAdmins).toHaveBeenCalledWith(teamspace);
			expect(ProjectSettings.getProjectAdmins).toHaveBeenCalledTimes(1);
			expect(ProjectSettings.getProjectAdmins).toHaveBeenCalledWith(teamspace, project);
			expect(ModelSettings.getMembers).toHaveBeenCalledTimes(1);
			expect(ModelSettings.getMembers).toHaveBeenCalledWith(teamspace, model, excludeViewers);
		});
	});
};

const testGetAccessibleJobs = () => {
	describe('Get accessible jobs', () => {
		test('should get the accessible jobs for a model', async () => {
			const teamspace = generateRandomString();
			const project = generateRandomString();
			const model = generateRandomString();
			const excludeViewers = true;

			const tsAdmins = times(5, () => generateRandomString());
			const projAdmins = times(5, () => generateRandomString());
			const modelMembers = times(5, () => generateRandomString());
			const jobs = times(5, () => generateRandomString());
			TeamspaceSettings.getTeamspaceAdmins.mockResolvedValueOnce(tsAdmins);
			ProjectSettings.getProjectAdmins.mockResolvedValueOnce(projAdmins);
			ModelSettings.getMembers.mockResolvedValueOnce(modelMembers);
			Jobs.getAccessibleJobs.mockResolvedValueOnce(jobs);

			await expect(Settings.getAccessibleJobs(teamspace, project, model, excludeViewers))
				.resolves.toEqual(jobs);

			expect(TeamspaceSettings.getTeamspaceAdmins).toHaveBeenCalledTimes(1);
			expect(TeamspaceSettings.getTeamspaceAdmins).toHaveBeenCalledWith(teamspace);
			expect(ProjectSettings.getProjectAdmins).toHaveBeenCalledTimes(1);
			expect(ProjectSettings.getProjectAdmins).toHaveBeenCalledWith(teamspace, project);
			expect(ModelSettings.getMembers).toHaveBeenCalledTimes(1);
			expect(ModelSettings.getMembers).toHaveBeenCalledWith(teamspace, model, excludeViewers);
			expect(Jobs.getAccessibleJobs).toHaveBeenCalledTimes(1);
			expect(Jobs.getAccessibleJobs).toHaveBeenCalledWith(teamspace,
				[...tsAdmins, ...projAdmins, ...modelMembers]);
		});
	});
};

describe(determineTestGroup(__filename), () => {
	testGetMembers();
	testGetAccessibleJobs();
});
