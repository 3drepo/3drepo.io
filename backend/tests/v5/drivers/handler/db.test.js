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
const { ADMIN_DB } = require(`${src}/handler/db.constants`);
const { USERS_COL } = require(`${src}/models/users.constants`);
const { DEFAULT: DEFAULT_ROLE } = require(`${src}/models/roles.constants`);
const config = require(`${src}/utils/config`);
const { templates } = require(`${src}/utils/responseCodes`);

const testAuthenticate = () => {
	describe('Authenticate', () => {
		const user = generateUserCredentials();
		beforeAll(async () => {
			await db.createUser(user);
		});

		const testCases = [
			['using default credentials', true],
			['username and password are correct', true, user.user, user.password],
			['username is incorrect', false, generateRandomString(), user.password],
			['password is incorrect', false, user.user, generateRandomString()],
			['both username and password are incorrect', false, generateRandomString(), generateRandomString()],
		];

		testCases.forEach(([desc, success, username, password]) => {
			test(`Should return ${success} if ${desc}`, async () => {
				await expect(DB.authenticate(username, password)).resolves.toBe(success);
			});
		});
	});
};

const testCanConnect = () => {
	describe('Test connection', () => {
		const dbConfig = { ...config.db };

		afterEach(() => {
			config.db = { ...dbConfig };
		});

		test('Should return true if config is sound', async () => {
			await expect(DB.canConnect()).resolves.toBe(true);
		});

		test('Should return false if credentials are incorrect', async () => {
			config.db.username = generateRandomString();
			config.db.password = generateRandomString();
			await expect(DB.canConnect()).resolves.toBe(false);
		});
	});
};

const testDisconnect = () => {
	describe('Disconnect', () => {
		test('Should function regardless of whether a connection has been established', async () => {
			await expect(DB.disconnect()).resolves.toBeUndefined();

			// Call again to make sure it doesn't fail when we don't have a connection
			await expect(DB.disconnect()).resolves.toBeUndefined();
		});
	});
};

const testCreateUser = () => {
	const findUser = (user) => DB.findOne(ADMIN_DB, USERS_COL, { user });
	let first = true;
	describe.each([
		['correct data is supplied', true, generateRandomString(), generateRandomString(), { [generateRandomString()]: generateRandomString() }],
		['customData is not supplied', true, generateRandomString(), generateRandomString()],
		['roles is an empty array', true, generateRandomString(), generateRandomString(), {}, []],
		['username is not provided', false, undefined, generateRandomString()],
		['password is not provided', false, generateRandomString(), undefined],
		['an unrecognised role is provided in the array', false, generateRandomString(), generateRandomString, {}, [{ db: ADMIN_DB, role: generateRandomString() }]],
		['valid roles are supplied', true, generateRandomString(), generateRandomString(), {}, [{ db: ADMIN_DB, role: 'readWrite' }]],
	])('Create User', (desc, success, username, password, customData = {}, roles) => {
		test(`Should ${success ? '' : 'fail to '}create the user if ${desc}`, async () => {
			// workaround to get code coverage on ensureDefaultRoleExists
			if (first) await DB.disconnect();
			first = false;
			const fn = expect(DB.createUser(username, password, customData, roles));
			if (success) {
				await fn.resolves.toBeUndefined();
				const user = await findUser(username);
				expect(user).toEqual(expect.objectContaining({
					customData, user: username }));

				const expectedRoles = [...(roles ?? []), { db: ADMIN_DB, role: DEFAULT_ROLE }];
				expect(user.roles.length).toEqual(expectedRoles.length);
				expect(user.roles).toEqual(expect.arrayContaining(expectedRoles));
			} else {
				await fn.rejects.not.toBeUndefined();
				if (username) {
					const user = await findUser(username);
					expect(user).toBe(null);
				}
			}
		});
	});
};

const testDropCollection = () => {
	describe('Drop Collection', () => {
		const database = generateRandomString();
		const collection = generateRandomString();

		beforeAll(() => DB.insertOne(database, collection, { _id: generateRandomString() }));

		test('Should function if the collection does not exist', async () => {
			await expect(DB.dropCollection(ADMIN_DB, generateRandomString())).resolves.toBeUndefined();
		});

		test('Should function if the database does not exist', async () => {
			await expect(DB.dropCollection(ADMIN_DB, generateRandomString())).resolves.toBeUndefined();
		});

		test('Should function if the collection exists', async () => {
			// A sanity check to make sure the collection exists
			await expect(DB.findOne(database, collection, { })).resolves.not.toBe(null);

			await expect(DB.dropCollection(database, collection)).resolves.toBeUndefined();

			await expect(DB.findOne(database, collection, { })).resolves.toBe(null);
		});
	});
};

const testInsertOne = () => {
	describe('Insert One', () => {
		test('Should insert document successfully', async () => {
			const database = generateRandomString();
			const col = generateRandomString();
			const key = generateRandomString();

			await expect(DB.insertOne(database, col, { _id: key })).resolves.toBeUndefined();
			await expect(DB.findOne(database, col, { _id: key })).resolves.toEqual({ _id: key });
		});

		test('Should fail if the key already exists', async () => {
			const database = generateRandomString();
			const col = generateRandomString();
			const key = generateRandomString();

			await expect(DB.insertOne(database, col, { _id: key })).resolves.toBeUndefined();
			await expect(DB.findOne(database, col, { _id: key })).resolves.toEqual({ _id: key });

			await expect(DB.insertOne(database, col, { _id: key })).rejects.not.toBeUndefined();
		});
	});
};

describe(determineTestGroup(__filename), () => {
	testAuthenticate();
	testCanConnect();
	testDisconnect();
	testCreateUser();
	testDropCollection();
	testInsertOne();
});
