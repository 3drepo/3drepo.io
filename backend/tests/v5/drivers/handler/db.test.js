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

const { src } = require('../../helper/path');
const { determineTestGroup, generateRandomString, generateUserCredentials, db } = require('../../helper/services');

const DB = require(`${src}/handler/db`);
const config = require(`${src}/utils/config`);
const { templates } = require(`${src}/utils/responseCodes`);

const testAuthenticate = () => {
	describe('Authenticate', () => {
		const user = generateUserCredentials();
		beforeAll(async () => {
			await db.createUser(user);
		});
		test('Should authenticate successfully if username and password are not passed in (using config)', async () => {
			await expect(DB.authenticate()).resolves.toBeTruthy();
		});

		test('Should authenticate successfully if the username and password are correct', async () => {
			await expect(DB.authenticate(user.user, user.password)).resolves.toBeTruthy();
		});

		test('Should fail to authenticate if the username or password are incorrect', async () => {
			await expect(DB.authenticate(generateRandomString(), user.password)).resolves.toBeFalsy();
			await expect(DB.authenticate(user.user, generateRandomString())).resolves.toBeFalsy();
		});
	});
};

describe(determineTestGroup(__filename), () => {
	testAuthenticate();
});
