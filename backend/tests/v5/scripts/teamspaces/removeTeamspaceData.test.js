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

const {
	determineTestGroup,
	resetFileshare,
	db: { reset: resetDB, createTeamspace, createUser },
	generateRandomString,
	generateUserCredentials,
} = require('../../helper/services');

const { src, utilScripts } = require('../../helper/path');

const RemoveTeamspaceData = require(`${utilScripts}/teamspaces/removeTeamspaceData`);

const { getMembersInfo } = require(`${src}/models/teamspaceSettings`);
const { getUserByUsername } = require(`${src}/models/users`);
const { createProject, getProjectList } = require(`${src}/models/projectSettings`);

const { disconnect } = require(`${src}/handler/db`);

const { times } = require('lodash');

const generateData = () => times(2, () => generateRandomString());
const setupTeamspaces = async (teamspaces) => {
	await Promise.all(
		teamspaces.map(async (name) => {
			await createTeamspace(name);

			const createMembers = Promise.all(times(2, async () => {
				await createUser(generateUserCredentials(), [name]);
			}));

			const createProjects = Promise.all(times(2, async () => {
				await createProject(name, generateRandomString());
			}));

			await Promise.all([
				createMembers,
				createProjects,
			]);
		}),
	);
};

const checkTeamspaces = async (teamspaces, shouldExist) => {
	await Promise.all(teamspaces.map(async (ts) => {
		const membersList = await getMembersInfo(ts);
		const projectList = await getProjectList(ts);
		if (shouldExist) {
			expect(membersList.length).not.toBe(1);
			expect(projectList.length).not.toBe(0);
		} else {
			expect(membersList.length).toBe(1);
			expect(projectList.length).toBe(0);
		}
		await expect(getUserByUsername(ts)).resolves.not.toBeUndefined();
	}));
};

const runTest = () => {
	describe('Remove teamspace data', () => {
		const data = generateData();
		beforeEach(async () => {
			resetFileshare();
			await resetDB();
			await setupTeamspaces(data);
		});
		const expectedError = new Error('A list of teamspaces must be provided');

		test('should throw error if teamspaces is undefined', async () => {
			await expect(RemoveTeamspaceData.run()).rejects.toEqual(expectedError);
			await checkTeamspaces(data, true);
		});

		test('should throw error if teamspaces list is empty', async () => {
			await expect(RemoveTeamspaceData.run('')).rejects.toEqual(expectedError);
			await checkTeamspaces(data, true);
		});

		test('should do nothing if all the teamspaces listed does not exist', async () => {
			await RemoveTeamspaceData.run(times(5, () => generateRandomString()).join(','), true);
			await checkTeamspaces(data, true);
		});

		test('should remove teamspace data of the given teamspaces', async () => {
			const [toRemove1, toRemove2, ...toKeep] = data;
			await RemoveTeamspaceData.run([toRemove1, toRemove2].join(','));
			await checkTeamspaces(toKeep, true);
			await checkTeamspaces([toRemove1, toRemove2], false);
		});
	});
};

describe(determineTestGroup(__filename), () => {
	runTest();
	afterAll(disconnect);
});
