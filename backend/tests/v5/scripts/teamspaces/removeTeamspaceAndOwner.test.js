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
	db: { reset: resetDB, createTeamspace, createTeamspaceRole, createUser },
	generateRandomString,
	generateUserCredentials,
} = require('../../helper/services');

const { src, utilScripts } = require('../../helper/path');

const RemoveTeamspace = require(`${utilScripts}/teamspaces/removeTeamspaceAndOwner`);

const { getMembersInfo, getRiskCategories } = require(`${src}/models/teamspaceSettings`);
const { getUserByUsername } = require(`${src}/models/users`);
const { addTeamspaceMember } = require(`${src}/processors/teamspaces`);
const { templates } = require(`${src}/utils/responseCodes`);
const { disconnect } = require(`${src}/handler/db`);

const { times } = require('lodash');

const generateData = () => ({
	normal: times(2, () => ({
		name: generateRandomString(),
		hasTS: true,
		hasUsers: true,
	})),
	partial: times(2, (i) => ({
		name: generateRandomString(),
		hasTS: i % 2 === 0,
		hasUsers: i === 0,
		hasAccount: i === 0,
	})),
	missing: times(2, generateRandomString()),
});

const setupTeamspaces = async ({ normal, partial }) => {
	const randomTS = generateRandomString();
	await createTeamspace(randomTS);
	await Promise.all(
		[...normal, ...partial].map(async ({ name, hasTS, hasUsers }) => {
			if (hasTS) {
				await createTeamspace(name);
				await addTeamspaceMember(name, name);

				if (hasUsers) {
					await Promise.all(times(2, async () => {
						await createUser(generateUserCredentials(), [name]);
					}));
				}
			} else {
				await createTeamspaceRole(name);
				await createUser({ ...generateUserCredentials(), user: name }, [name]);
			}
			await addTeamspaceMember(randomTS, name);
		}),
	);
};

const checkTeamspaces = async (teamspaces, shouldExist, userDeleted) => {
	await Promise.all(teamspaces.map(async ({ name, hasTS }) => {
		if (hasTS) {
			const membersList = await getMembersInfo(name);
			if (shouldExist) {
				await expect(getRiskCategories(name)).resolves.not.toBeUndefined();
				expect(membersList.length).not.toBe(0);
			} else {
				await expect(getRiskCategories(name)).rejects.not.toBeUndefined();
				expect(membersList.length).toBe(0);
			}
		}
		if (shouldExist || !userDeleted) await expect(getUserByUsername(name)).resolves.not.toBeUndefined();
		else await expect(getUserByUsername(name)).rejects.toEqual(templates.userNotFound);
	}));
};

const runTest = () => {
	describe('Remove teamspace and owner', () => {
		const data = generateData();
		const tsList = [
			...data.normal,
			...data.partial,
		];
		beforeEach(async () => {
			resetFileshare();
			await resetDB();
			await setupTeamspaces(data);
		});
		const expectedError = new Error('A list of teamspaces must be provided');

		test('should throw error if teamspaces is undefined', async () => {
			await expect(RemoveTeamspace.run()).rejects.toEqual(expectedError);
			await checkTeamspaces(tsList, true);
		});

		test('should throw error if teamspaces list is empty', async () => {
			await expect(RemoveTeamspace.run('')).rejects.toEqual(expectedError);
			await checkTeamspaces(tsList, true);
		});

		test('should do nothing if all the teamspaces listed does not exist', async () => {
			await RemoveTeamspace.run(data.missing.join(','), true);
			await checkTeamspaces(tsList, true);
		});

		test('should remove teamspace data without removing the user if flag is not set', async () => {
			const [toRemove1, toRemove2, ...toKeep] = tsList;
			await RemoveTeamspace.run([toRemove1.name, toRemove2.name].join(','));
			await checkTeamspaces(toKeep, true);
			await checkTeamspaces([toRemove1, toRemove2], false);
		});
		test('should remove teamspace data and the user if flag is set', async () => {
			const [toRemove1, toKeep1, toRemove2, ...toKeep] = tsList;
			await RemoveTeamspace.run([toRemove1.name, toRemove2.name].join(','), true);
			await checkTeamspaces([...toKeep, toKeep1], true);
			await checkTeamspaces([toRemove1, toRemove2], false, true);
		});
	});
};

describe(determineTestGroup(__filename), () => {
	runTest();
	afterAll(disconnect);
});
