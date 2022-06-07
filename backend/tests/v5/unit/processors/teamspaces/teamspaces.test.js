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

const _ = require('lodash');

const { templates } = require('../../../../../src/v5/utils/responseCodes');
const { src } = require('../../../helper/path');
const { generateRandomString, generateRandomNumber } = require('../../../helper/services');

const Teamspaces = require(`${src}/processors/teamspaces/teamspaces`);

jest.mock('../../../../../src/v5/models/users');
const UsersModel = require(`${src}/models/users`);

jest.mock('../../../../../src/v5/models/jobs');
const JobsModel = require(`${src}/models/jobs`);

jest.mock('../../../../../src/v5/models/teamspaces');
const TeamspacesModel = require(`${src}/models/teamspaces`);

jest.mock('../../../../../src/v5/models/roles');
const RolesModel = require(`${src}/models/roles`);

jest.mock('../../../../../src/v5/utils/permissions/permissions');
const Permissions = require(`${src}/utils/permissions/permissions`);

jest.mock('../../../../../src/v5/utils/quota');
const Quota = require(`${src}/utils/quota`);

const invalidUsername = 'invalid';
const createTeamspaceRoleMock = RolesModel.createTeamspaceRole.mockImplementation((username) => {
	if (username === invalidUsername) {
		throw templates.unknown;
	}
});

const testGetTeamspaceListByUser = () => {
	describe('Get Teamspace list by user', () => {
		test('should give the expected list of teamspaces', async () => {
			const goldenData = [
				{ name: 'ts1', isAdmin: false },
				{ name: 'ts2', isAdmin: false },
				{ name: 'ts3', isAdmin: true },
				{ name: 'ts4', isAdmin: true },
				{ name: 'ts5', isAdmin: false },
			];

			UsersModel.getAccessibleTeamspaces.mockImplementation(() => goldenData.map(({ name }) => name));
			Permissions.isTeamspaceAdmin.mockImplementation((ts) => goldenData.find(({ name }) => name === ts).isAdmin);
			const res = await Teamspaces.getTeamspaceListByUser('abc');
			expect(res).toEqual(goldenData);
		});
	});
};

const testGetTeamspaceMembersInfo = () => {
	describe('Get Teamspace members info', () => {
		const tsWithUsers = 'withUsers';
		const tsWithoutUsers = 'withoutUsers';
		const tsWithoutJobs = 'noJobs';
		const goldenData = [
			{ user: 'abc', firstName: 'ab', lastName: 'c', company: 'yy', job: 'jobA' },
			{ user: 'abcd', firstName: 'ab', lastName: 'cd', job: 'jobB' },
			{ user: 'abcd2', firstName: 'ab', lastName: 'cd2', job: 'jobB', company: 'dxfd' },
			{ user: 'abcde', firstName: 'ab', lastName: 'cde', company: 'dsfs' },
		];
		const jobList = [
			{ _id: 'jobA', users: ['abc'] },
			{ _id: 'jobB', users: ['abcd', 'abcd2'] },
		];
		TeamspacesModel.getMembersInfo.mockImplementation((ts) => {
			if (tsWithoutUsers === ts) return Promise.resolve([]);
			return Promise.resolve(goldenData.map((data) => _.omit(data, 'job')));
		});

		JobsModel.getJobsToUsers.mockImplementation((ts) => {
			if (tsWithoutJobs === ts) return Promise.resolve([]);
			return Promise.resolve(jobList);
		});

		test('should give the list of members within the given teamspace with their details', async () => {
			const res = await Teamspaces.getTeamspaceMembersInfo(tsWithUsers);
			expect(res).toEqual(goldenData);
		});

		test('should return empty array if the teamspace had no memebrs', async () => {
			const res = await Teamspaces.getTeamspaceMembersInfo(tsWithoutUsers);
			expect(res).toEqual([]);
		});

		test('should return the list of members with details if the teamspace had no jobs', async () => {
			const res = await Teamspaces.getTeamspaceMembersInfo(tsWithoutJobs);
			expect(res).toEqual(goldenData.map((data) => _.omit(data, 'job')));
		});
	});
};

const testInitTeamspace = () => {
	describe('Initialize teamspace', () => {
		test('should initialize a teamspace', async () => {
			const username = generateRandomString();
			await Teamspaces.initTeamspace(username);
			expect(createTeamspaceRoleMock).toHaveBeenCalledTimes(1);
			expect(createTeamspaceRoleMock).toHaveBeenCalledWith(username);
			expect(RolesModel.grantTeamspaceRoleToUser).toHaveBeenCalledTimes(1);
			expect(RolesModel.grantTeamspaceRoleToUser).toHaveBeenCalledWith(username, username);
			expect(JobsModel.addDefaultJobs).toHaveBeenCalledTimes(1);
			expect(JobsModel.addDefaultJobs).toHaveBeenCalledWith(username);
			expect(TeamspacesModel.createTeamspaceSettings).toHaveBeenCalledTimes(1);
			expect(TeamspacesModel.createTeamspaceSettings).toHaveBeenCalledWith(username);
		});

		test('should initialize a teamspace even if an error is thrown ', async () => {
			await Teamspaces.initTeamspace(invalidUsername);
			expect(createTeamspaceRoleMock).toHaveBeenCalledTimes(1);
			expect(createTeamspaceRoleMock).toHaveBeenCalledWith(invalidUsername);
		});
	});
};

const testGetQuotaInfo = () => {
	describe('Get quota info', () => {
		test('should return quota info', async () => {
			const quotaInfo = {
				quota: generateRandomNumber(),
				collaboratorLimit: generateRandomNumber(0),
			};
			const spaceUsed = generateRandomNumber(0);
			const collabsUsed = generateRandomNumber(0);
			const getQuotaInfoMock = Quota.getQuotaInfo.mockImplementationOnce(() => quotaInfo);
			const spaceUsedMock = Quota.getSpacedUsed.mockImplementationOnce(() => spaceUsed);
			const getCollaboratorsUsedMock = Quota.getCollaboratorsUsed.mockImplementationOnce(() => collabsUsed);
			const teamspace = generateRandomString();
			const res = await Teamspaces.getQuotaInfo(teamspace);
			expect(res).toEqual(
				{
					data: {
						available: quotaInfo.quota,
						used: spaceUsed,
					},
					seats: {
						available: quotaInfo.collaboratorLimit,
						used: collabsUsed,
					},
				},
			);
			expect(getQuotaInfoMock).toHaveBeenCalledTimes(1);
			expect(getQuotaInfoMock).toHaveBeenCalledWith(teamspace, true);
			expect(spaceUsedMock).toHaveBeenCalledTimes(1);
			expect(spaceUsedMock).toHaveBeenCalledWith(teamspace, true);
			expect(getCollaboratorsUsedMock).toHaveBeenCalledTimes(1);
			expect(getCollaboratorsUsedMock).toHaveBeenCalledWith(teamspace);
		});
	});
};

describe('processors/teamspaces', () => {
	testGetTeamspaceListByUser();
	testGetTeamspaceMembersInfo();
	testInitTeamspace();
	testGetQuotaInfo();
});
