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
		hasUsers: i < 0,
		hasAccount: i === 0,
	})),
	missing: times(2, generateRandomString()),
});

const setupTeamspaces = async ({ normal, partial }) => {
	await createUser(generateUserCredentials());
	await Promise.all(
		[...normal, ...partial].map(async ({ name, hasTS, hasUsers }) => {
			if (hasTS) {
				await createTeamspace(name);

				if (hasUsers) {
					await Promise.all(times(2, async () => {
						await createUser(generateUserCredentials(), [name]);
					}));
				}
			} else {
				await createTeamspaceRole(name);
				await createUser({ ...generateUserCredentials(), user: name }, [name]);
			}
		}),
	);
};

const runTest = () => {
	describe('Remove teamspace and owner', () => {
		const data = generateData();
		beforeEach(async () => {
			resetFileshare();
			await resetDB();
			await setupTeamspaces(data);
		});
		const expectedError = new Error('A list of teamspaces must be provided');

		test('should throw error if teamspaces is undefined', async () => {
			await expect(RemoveTeamspace.run()).rejects.toEqual(expectedError);
		});

		test('should throw error if teamspaces list is empty', async () => {
			await expect(RemoveTeamspace.run('')).rejects.toEqual(expectedError);
		});
	});
};

describe(determineTestGroup(__filename), () => {
	runTest();
});
