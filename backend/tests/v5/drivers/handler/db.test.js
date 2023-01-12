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

const { times } = require('lodash');

const { src } = require('../../helper/path');
const { determineTestGroup, generateRandomString, generateUserCredentials, db } = require('../../helper/services');

const DB = require(`${src}/handler/db`);
const { ADMIN_DB } = require(`${src}/handler/db.constants`);
const { USERS_COL } = require(`${src}/models/users.constants`);
const { DEFAULT: DEFAULT_ROLE } = require(`${src}/models/roles.constants`);
const config = require(`${src}/utils/config`);
// const { templates } = require(`${src}/utils/responseCodes`);

const generateBSONData = (nDocs = 1, prop = generateRandomString()) => times(nDocs, (n) => ({
	_id: generateRandomString(), n, [prop]: generateRandomString() }));

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

const testInsertMany = () => {
	describe('Insert Many', () => {
		test('Should insert all documents successfully', async () => {
			const database = generateRandomString();
			const col = generateRandomString();
			const data = generateBSONData(10);

			await expect(DB.insertMany(database, col, data)).resolves.toBeUndefined();
			const res = await DB.find(database, col, {});

			expect(res.length).toEqual(data.length);
			expect(res).toEqual(expect.arrayContaining(data));
		});
		test('Should fail if one of the key is duplicated', async () => {
			const database = generateRandomString();
			const col = generateRandomString();
			const data = generateBSONData(10);

			await DB.insertOne(database, col, data[0]);

			await expect(DB.insertMany(database, col, data)).rejects.not.toBeUndefined();
			const res = await DB.find(database, col, {});

			expect(res).toEqual([data[0]]);
		});
	});
};

const testAggregate = () => {
	describe('Aggregate', () => {
		const data = generateBSONData(10);
		const dbName = generateRandomString();
		const col = generateRandomString();
		beforeAll(async () => {
			await DB.insertMany(dbName, col, data);
		});

		test('Should perform the aggregate pipeline correctly', async () => {
			const pipeline = [
				{ $match: { n: { $lt: 5 } } },
			];
			const res = await DB.aggregate(dbName, col, pipeline);
			const expectedOutput = data.filter(({ n }) => n < 5);
			expect(res.length).toBe(expectedOutput.length);
			expect(res).toEqual(expect.arrayContaining(expectedOutput));
		});

		test('Should return empty array if nothing is found', async () => {
			const pipeline = [
				{ $match: { [generateRandomString()]: { $lt: 5 } } },
			];
			const res = await DB.aggregate(dbName, col, pipeline);
			expect(res).toEqual([]);
		});

		test('Should return empty array if collection doesn\t exist', async () => {
			const pipeline = [
				{ $match: { n: { $lt: 5 } } },
			];
			const res = await DB.aggregate(dbName, generateRandomString(), pipeline);
			expect(res).toEqual([]);
		});

		test('Should return empty array if database doesn\t exist', async () => {
			const pipeline = [
				{ $match: { n: { $lt: 5 } } },
			];
			const res = await DB.aggregate(generateRandomString(), col, pipeline);
			expect(res).toEqual([]);
		});
	});
};

const testFindOne = () => {
	describe('Find One', () => {
		const data = generateBSONData(10);
		const dbName = generateRandomString();
		const col = generateRandomString();
		beforeAll(async () => {
			await DB.insertMany(dbName, col, data);
		});

		test('Should return matching document', async () => {
			await expect(DB.findOne(dbName, col, { _id: data[3]._id })).resolves.toEqual(data[3]);
		});

		test('Should return matching document (sort and projection)', async () => {
			await expect(DB.findOne(dbName, col, { }, { n: 1, _id: 0 }, { n: -1 }))
				.resolves.toEqual({ n: data[9].n });
		});

		test('Should return null if no document is found', async () => {
			await expect(DB.findOne(dbName, col, { [generateRandomString()]: generateRandomString() }))
				.resolves.toEqual(null);
		});

		test('Should return null if collection doesn\'t exist', async () => {
			await expect(DB.findOne(dbName, generateRandomString(), { _id: data[3]._id })).resolves.toEqual(null);
		});

		test('Should return null if database doesn\'t exist', async () => {
			await expect(DB.findOne(generateRandomString(), col, { _id: data[3]._id })).resolves.toEqual(null);
		});
	});
};

const testFind = () => {
	describe('Find Many', () => {
		const data = generateBSONData(10);
		const dbName = generateRandomString();
		const col = generateRandomString();
		beforeAll(async () => {
			await DB.insertMany(dbName, col, data);
		});

		test('Should return matching documents', async () => {
			await expect(DB.find(dbName, col, { _id: data[3]._id })).resolves.toEqual([data[3]]);
		});

		test('Should return matching documents (sort and projection)', async () => {
			await expect(DB.find(dbName, col, { }, { n: 1, _id: 0 }, { n: 1 }))
				.resolves.toEqual(data.map(({ n }) => ({ n })));
		});

		test('Should return matching documents up to the limited amount', async () => {
			await expect(DB.find(dbName, col, { }, { }, { n: 1 }, 2))
				.resolves.toEqual(data.slice(0, 2));
		});

		test('Should return empty array if no document is found', async () => {
			await expect(DB.find(dbName, col, { [generateRandomString()]: generateRandomString() }))
				.resolves.toEqual([]);
		});

		test('Should return empty array if collection doesn\'t exist', async () => {
			await expect(DB.find(dbName, generateRandomString(), { })).resolves.toEqual([]);
		});

		test('Should return empty array if database doesn\'t exist', async () => {
			await expect(DB.find(generateRandomString(), col, { })).resolves.toEqual([]);
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
	testInsertMany();
	testAggregate();
	testFindOne();
	testFind();
});
