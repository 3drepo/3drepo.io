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

const { createAccount } = require('../../helper/fronteggMock');

const { src, utilScripts } = require('../../helper/path');

const CreateTeamspace = require(`${utilScripts}/teamspaces/createTeamspace`);

const { disconnect } = require(`${src}/handler/db`);

const user = generateUserCredentials();
const emailUser = generateUserCredentials();
emailUser.user = 'emailUser';
emailUser.basicData.email = 'test@email.com';
const teamspace = generateRandomString();
const existingAccount = generateRandomString();
let existingAccountId;

const setupData = async () => {
	await createUser(user);
	await createUser(emailUser);
	await createTeamspace(teamspace, [user.user], {
		discretionary: {
			collaborators: 'unlimited',
			data: 1024,
			expiryDate: Date.now() + 10000,
		} });
	existingAccountId = await createAccount(existingAccount);
};

const runTest = () => {
	beforeAll(async () => {
		resetFileshare();
		await resetDB();
		await setupData();
	});

	describe.each([
		['teamspace does not exist but the user exists', true, undefined, generateRandomString(), user.user, undefined],
		['teamspace does not exist but the user exists (using email)', true, undefined, generateRandomString(), emailUser.basicData.email, undefined],
		['teamspace does not exist but the user exists and accountId is provided.', true, undefined, generateRandomString(), user.user, existingAccountId],
		['teamspace does not exist but the user exists and accountId is provided (using email)', true, undefined, generateRandomString(), emailUser.basicData.email, existingAccountId],
		['teamspace does not exist and the user does not exists', true, undefined, generateRandomString(), 'nonExistentUser', undefined],
		['teamspace already exists', false, new Error('Teamspace already exists'), teamspace, user.user, undefined],
	])('Create Teamspace', (desc, success, expectedOutput, teamspaceName, userName, accountId) => {
		test(`Should ${success ? 'succeed' : 'fail with an error'} if ${desc}`, async () => {
			const exe = CreateTeamspace.run(teamspaceName, userName, accountId);
			if (success) {
				await expect(exe).resolves.toBeUndefined();
			} else {
				await expect(exe).rejects.toEqual(expectedOutput);
			}
		});
	});
};

describe(determineTestGroup(__filename), () => {
	runTest();
	afterAll(disconnect);
});
