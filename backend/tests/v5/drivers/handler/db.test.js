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
const {
	determineTestGroup,
	generateRandomBuffer,
	generateRandomString,
	generateUserCredentials,
	outOfOrderArrayEqual,
	db: dbHelper,
	generateRandomNumber,
} = require('../../helper/services');
const mongodb = require('mongodb');
const { cloneDeep } = require('../../../../src/v5/utils/helper/objects');

const DB = require(`${src}/handler/db`);
const { ADMIN_DB } = require(`${src}/handler/db.constants`);
const { USERS_COL } = require(`${src}/models/users.constants`);
const { DEFAULT: DEFAULT_ROLE, ROLES_COL } = require(`${src}/models/roles.constants`);
const config = require(`${src}/utils/config`);
const { templates } = require(`${src}/utils/responseCodes`);

const generateBSONData = (nDocs = 1, prop = generateRandomString()) => times(nDocs, (n) => ({
	_id: generateRandomString(), n, [prop]: generateRandomString() }));

const DEFAULT_ROLE_ENTRY = { db: ADMIN_DB, role: DEFAULT_ROLE };

const testAuthenticate = () => {
	describe('Authenticate', () => {
		const user = generateUserCredentials();
		beforeAll(async () => {
			await dbHelper.createUser(user);
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

				const expectedRoles = [...(roles ?? []), DEFAULT_ROLE_ENTRY];
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

const testUpdateMany = () => {
	describe('Update Many', () => {
		const db = generateRandomString();
		const collection = generateRandomString();
		const docs = generateBSONData(10);

		beforeAll(() => DB.insertMany(db, collection, docs));

		test('Should perform an insert if upsert is set to true and the document doesn\'t exist', async () => {
			const database = generateRandomString();
			const col = generateRandomString();
			const update = { [generateRandomString()]: generateRandomString() };

			await expect(DB.updateMany(database, col, {}, { $set: update }, true)).resolves.toBeUndefined();
			const res = await DB.find(database, col, {});

			expect(res.length).toEqual(1);
			expect(res[0]).toEqual(expect.objectContaining(update));
		});

		test('Should update nothing if upsert is not set and the document doesn\'t exist', async () => {
			const database = generateRandomString();
			const col = generateRandomString();
			const update = { [generateRandomString()]: generateRandomString() };

			await expect(DB.updateMany(database, col, {}, { $set: update })).resolves.toBeUndefined();
			await expect(DB.find(database, col, {})).resolves.toEqual([]);
		});

		test('Should update all satisfying documents', async () => {
			const update = { [generateRandomString()]: generateRandomString() };

			await expect(DB.updateMany(db, collection, { n: { $gt: 5 } }, { $set: update })).resolves.toBeUndefined();
			const res = await DB.find(db, collection, {});

			const expectedRes = docs.map((doc) => (doc.n > 5 ? { ...doc, ...update } : doc));

			expect(res.length).toEqual(expectedRes.length);
			expect(res).toEqual(expect.arrayContaining(expectedRes));
		});
	});
};

const testUpdateOne = () => {
	describe('Update One', () => {
		const db = generateRandomString();
		const collection = generateRandomString();
		const docs = generateBSONData(10);

		beforeAll(() => DB.insertMany(db, collection, docs));

		test('Should perform an insert if upsert is set to true and the document doesn\'t exist', async () => {
			const database = generateRandomString();
			const col = generateRandomString();
			const update = { [generateRandomString()]: generateRandomString() };

			await expect(DB.updateOne(database, col, {}, { $set: update }, true)).resolves.toBeFalsy();
			const res = await DB.find(database, col, {});

			expect(res.length).toEqual(1);
			expect(res[0]).toEqual(expect.objectContaining(update));
		});

		test('Should update nothing if upsert is not set and the document doesn\'t exist', async () => {
			const database = generateRandomString();
			const col = generateRandomString();
			const update = { [generateRandomString()]: generateRandomString() };

			await expect(DB.updateOne(database, col, {}, { $set: update })).resolves.toBeFalsy();
			await expect(DB.find(database, col, {})).resolves.toEqual([]);
		});

		test('Should update one satisfying document', async () => {
			const update = { [generateRandomString()]: generateRandomString() };

			await expect(DB.updateOne(db, collection, { n: { $gt: 5 } }, { $set: update })).resolves.toBeTruthy();
			const res = await DB.find(db, collection, update);

			expect(res.length).toBe(1);
		});
	});
};

const testReplaceOne = () => {
	describe('Replace One', () => {
		const db = generateRandomString();
		const collection = generateRandomString();
		const docs = generateBSONData(10);

		beforeAll(() => DB.insertMany(db, collection, docs));

		test('Should replace nothing if matching the document doesn\'t exist', async () => {
			const database = generateRandomString();
			const col = generateRandomString();
			const update = { [generateRandomString()]: generateRandomString() };

			await expect(DB.replaceOne(database, col, {}, update)).resolves.toBeUndefined();
			await expect(DB.find(database, col, {})).resolves.toEqual([]);
		});

		test('Should replace one satisfying document', async () => {
			const update = { [generateRandomString()]: generateRandomString() };

			await expect(DB.replaceOne(db, collection, { n: { $gt: 5 } }, update)).resolves.toBeUndefined();
			const res = await DB.find(db, collection, update);

			expect(res.length).toBe(1);
			expect(Object.keys(res[0]).length).toBe(2); // should've wiped out anything that is not _id or on the update
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

const testDistinct = () => {
	const dbName = generateRandomString();
	const col = generateRandomString();
	const label1 = generateRandomString();
	const label2 = generateRandomString();
	const label3 = generateRandomString();

	const data = [
		{ num: 1, label: label1 },
		{ num: 1, label: label1 },
		{ num: 1, label: label2 },
		{ num: 2, label: label3 },
		{ num: 1, label: label2 },
	];

	describe.each([
		['Should return empty array on an empty collection', generateRandomString(), generateRandomString(), undefined, []],
		['Should return list of distinct values from label', col, 'label', undefined, [label1, label2, label3]],
		['Should return list of distinct values from label that satisfied the query', col, 'label', { num: 2 }, [label3]],

	])('Distinct', (desc, collection, key, query, expectedOutput) => {
		beforeAll(async () => {
			await dbHelper.reset();
			await DB.insertMany(dbName, col, data);
		});
		test(desc, async () => {
			const output = await DB.distinct(dbName, collection, key, query);
			outOfOrderArrayEqual(expectedOutput, output);
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

		test('Should return null if no document is found (sort and projection)', async () => {
			await expect(DB.findOne(dbName, col, { [generateRandomString()]: generateRandomString() },
				{ n: 1, _id: 0 }, { n: -1 })).resolves.toEqual(null);
		});

		test('Should return null if collection doesn\'t exist', async () => {
			await expect(DB.findOne(dbName, generateRandomString(), { _id: data[3]._id })).resolves.toEqual(null);
		});

		test('Should return null if database doesn\'t exist', async () => {
			await expect(DB.findOne(generateRandomString(), col, { _id: data[3]._id })).resolves.toEqual(null);
		});
	});
};

const testFindOneAndUpdate = () => {
	describe('Find One and Update', () => {
		const data = generateBSONData(10);
		const dbName = generateRandomString();
		const col = generateRandomString();
		beforeAll(async () => {
			await DB.insertMany(dbName, col, data);
		});

		test('Should return then update the matchin document', async () => {
			const newProp = generateRandomString();
			await expect(DB.findOneAndUpdate(dbName, col, { _id: data[3]._id }, { $set: { newProp } }))
				.resolves.toEqual(data[3]);

			await expect(DB.findOne(dbName, col, { _id: data[3]._id })).resolves.toEqual({ ...data[3], newProp });
		});

		test('Should return then update matching document (projection)', async () => {
			const newProp = generateRandomString();
			await expect(DB.findOneAndUpdate(dbName, col, { _id: data[2]._id }, { $set: { newProp } },
				{ projection: { n: 0 } }))
				.resolves.toEqual({ ...data[2], n: undefined });

			await expect(DB.findOne(dbName, col, { _id: data[2]._id })).resolves.toEqual({ ...data[2], newProp });
		});

		const action = { $set: { [generateRandomString()]: generateRandomString() } };

		test('Should return null if no document is found', async () => {
			await expect(DB.findOneAndUpdate(dbName, col, { [generateRandomString()]: generateRandomString() }, action))
				.resolves.toEqual(null);
		});

		test('Should return null if collection doesn\'t exist', async () => {
			await expect(DB.findOneAndUpdate(dbName, generateRandomString(), { }, action))
				.resolves.toEqual(null);
		});

		test('Should return null if database doesn\'t exist', async () => {
			await expect(DB.findOneAndUpdate(generateRandomString(), col, { }, action)).resolves.toEqual(null);
		});
	});
};

const testFindOneAndDelete = () => {
	describe('Find One and Delete', () => {
		const data = generateBSONData(10);
		const dbName = generateRandomString();
		const col = generateRandomString();
		beforeAll(async () => {
			await DB.insertMany(dbName, col, data);
		});

		test('Should return and delete matching document', async () => {
			await expect(DB.findOneAndDelete(dbName, col, { _id: data[3]._id }))
				.resolves.toEqual(data[3]);

			await expect(DB.findOne(dbName, col, { _id: data[3]._id })).resolves.toEqual(null);
		});

		test('Should return and delete matching document (projection)', async () => {
			await expect(DB.findOneAndDelete(dbName, col, { _id: data[2]._id }, { n: 0 }))
				.resolves.toEqual({ ...data[2], n: undefined });

			await expect(DB.findOne(dbName, col, { _id: data[2]._id })).resolves.toEqual(null);
		});

		test('Should return null if no document is found', async () => {
			await expect(DB.findOneAndDelete(dbName, col, { [generateRandomString()]: generateRandomString() }))
				.resolves.toEqual(null);
		});

		test('Should return null if collection doesn\'t exist', async () => {
			await expect(DB.findOneAndDelete(dbName, generateRandomString(), { }))
				.resolves.toEqual(null);
		});

		test('Should return null if database doesn\'t exist', async () => {
			await expect(DB.findOneAndDelete(generateRandomString(), col, { })).resolves.toEqual(null);
		});
	});
};

const testDeleteMany = () => {
	describe('Delete Many', () => {
		const data = generateBSONData(10);
		const dbName = generateRandomString();
		const col = generateRandomString();
		beforeAll(async () => {
			await DB.insertMany(dbName, col, data);
		});

		test('Should delete matching documents', async () => {
			await expect(DB.deleteMany(dbName, col, { n: { $lt: 5 } })).resolves.toBeUndefined();
			await expect(DB.find(dbName, col, { n: { $lt: 5 } })).resolves.toEqual([]);
		});

		test('Should return successfully if the document was not found', async () => {
			await expect(DB.deleteMany(dbName, col, { [generateRandomString()]: generateRandomString() }))
				.resolves.toBeUndefined();
		});

		test('Should return empty array if collection doesn\'t exist', async () => {
			await expect(DB.deleteMany(dbName, generateRandomString(), { })).resolves.toBeUndefined();
		});

		test('Should return empty array if database doesn\'t exist', async () => {
			await expect(DB.deleteMany(generateRandomString(), col, { })).resolves.toBeUndefined();
		});
	});
};

const testDeleteOne = () => {
	describe('Delete One', () => {
		const data = generateBSONData(10);
		const dbName = generateRandomString();
		const col = generateRandomString();
		beforeAll(async () => {
			await DB.insertMany(dbName, col, data);
		});

		test('Should delete matching document', async () => {
			await expect(DB.deleteOne(dbName, col, { _id: data[5] })).resolves.toBeUndefined();
			await expect(DB.find(dbName, col, { _id: data[5] })).resolves.toEqual([]);
		});

		test('Should return successfully if the document was not found', async () => {
			await expect(DB.deleteOne(dbName, col, { [generateRandomString()]: generateRandomString() }))
				.resolves.toBeUndefined();
		});

		test('Should return undefined if collection doesn\'t exist', async () => {
			await expect(DB.deleteOne(dbName, generateRandomString(), { })).resolves.toBeUndefined();
		});

		test('Should return undefined if database doesn\'t exist', async () => {
			await expect(DB.deleteOne(generateRandomString(), col, { })).resolves.toBeUndefined();
		});
	});
};

const testCount = () => {
	describe('Count', () => {
		const data = generateBSONData(10);
		const dbName = generateRandomString();
		const col = generateRandomString();
		beforeAll(async () => {
			await DB.insertMany(dbName, col, data);
		});

		test('Should return correct count', async () => {
			await expect(DB.count(dbName, col, { })).resolves.toBe(data.length);
		});

		test('Should return correct count (with query)', async () => {
			await expect(DB.count(dbName, col, { n: { $lt: 5 } })).resolves.toBe(data.length / 2);
		});

		test('Should return 0 if the collection does not exist', async () => {
			await expect(DB.count(dbName, generateRandomString(), { })).resolves.toBe(0);
		});

		test('Should return 0 if the database does not exist', async () => {
			await expect(DB.count(generateRandomString(), generateRandomString(), { })).resolves.toBe(0);
		});
	});
};

const testGridFS = () => {
	describe('GridFS', () => {
		test('Should store and get the file successfully', async () => {
			const buffer = generateRandomBuffer();
			const database = generateRandomString();
			const collection = generateRandomString();
			const filename = generateRandomString();
			await expect(DB.storeFileInGridFS(database, collection, filename, buffer)).resolves.toEqual(filename);
			const resFile = await DB.getFileFromGridFS(database, collection, filename);
			expect(resFile).toEqual(buffer);
		});

		test('Should fail to fetch a file that doesn\'t exist', async () => {
			const database = generateRandomString();
			const collection = generateRandomString();
			const filename = generateRandomString();
			await expect(DB.getFileFromGridFS(database, collection, filename)).rejects.toEqual(templates.fileNotFound);
		});
	});
};

const testBulkWrite = () => {
	describe('Bulk write', () => {
		test('Should write all data successfully', async () => {
			const database = generateRandomString();
			const collection = generateRandomString();

			const [data, data2] = generateBSONData(2);

			await expect(DB.bulkWrite(database, collection, [
				{ insertOne: { document: data } },
				{ insertOne: { document: data2 } },
				{ updateMany: { filter: {}, update: { $set: { a: 1 } } } },
			])).resolves.toBeUndefined();

			const records = await DB.find(database, collection, {});
			expect(records.length).toBe(2);
			expect(records).toEqual(expect.arrayContaining([{ ...data, a: 1 }, { ...data2, a: 1 }]));
		});

		test('Should reject with error if the query failed', async () => {
			const database = generateRandomString();
			const collection = generateRandomString();

			const [data] = generateBSONData(1);

			await expect(DB.bulkWrite(database, collection, [
				{ insertOne: { document: data } },
				{ insertOne: { document: data } },
				{ updateMany: { filter: {}, update: { $set: { a: 1 } } } },
			])).rejects.not.toBeUndefined();

			const records = await DB.find(database, collection, {});

			expect(records.length).toBe(1);
			expect(records).toEqual([data]);
		});
	});
};

const testIndices = () => {
	describe('Indexing', () => {
		test('Should fail on a collection that does not exist', async () => {
			const database = generateRandomString();
			const col = generateRandomString();

			await expect(DB.listIndices(database, col)).rejects.not.toBeUndefined();
		});

		test('Should return with the default index on an unindexed collection', async () => {
			const database = generateRandomString();
			const col = generateRandomString();

			await DB.insertMany(database, col, generateBSONData(10));

			const res = await DB.listIndices(database, col);
			expect(res.length).toBe(1);
			expect(res[0]).toEqual(expect.objectContaining({ key: { _id: 1 } }));
		});

		test('Should be able to remove an index', async () => {
			const database = generateRandomString();
			const col = generateRandomString();

			await DB.insertMany(database, col, generateBSONData(10));

			const newIndex = { n: 1 };
			await expect(DB.createIndex(database, col, newIndex)).resolves.toBeUndefined();

			const res = await DB.listIndices(database, col);
			expect(res.length).toBe(2);

			await expect(DB.dropIndex(database, col, 'n_1')).resolves.toBeUndefined();

			await expect(DB.listIndices(database, col)).resolves.toEqual([{ key: { _id: 1 }, name: '_id_', v: 2 }]);
		});

		test('Should be able to add a new index', async () => {
			const database = generateRandomString();
			const col = generateRandomString();

			await DB.insertMany(database, col, generateBSONData(10));

			const newIndex = { n: 1 };
			await expect(DB.createIndex(database, col, newIndex)).resolves.toBeUndefined();

			const res = await DB.listIndices(database, col);
			const array = res.map(({ key }) => key);
			expect(array.length).toBe(2);
			expect(array).toEqual(expect.arrayContaining([{ _id: 1 }, newIndex]));
		});

		test('Should be able to add multiple indices', async () => {
			const database = generateRandomString();
			const col = generateRandomString();

			await DB.insertMany(database, col, generateBSONData(10));

			const newIndex = [{ key: { n: 1 } }, { key: { n: -1, _id: 1 } }];
			await expect(DB.createIndices(database, col, newIndex)).resolves.toBeUndefined();

			const res = await DB.listIndices(database, col);
			expect(res.length).toBe(newIndex.length + 1);
			const array = res.map(({ key }) => key);
			expect(array).toEqual(expect.arrayContaining([{ _id: 1 }, ...newIndex.map(({ key }) => key)]));
		});

		test('Should be able to create unique index', async () => {
			const database = generateRandomString();
			const col = generateRandomString();

			await DB.insertMany(database, col, [{ n: 2 }, { a: 1 }]);

			const newIndex = { n: 1 };
			await expect(DB.createIndex(database, col, newIndex, { unique: true })).resolves.toBeUndefined();

			await DB.insertOne(database, col, newIndex);
			// Unique index means we shouldn't be able to insert another one with the same value.
			await expect(DB.insertOne(database, col, newIndex)).rejects.not.toBeUndefined();
			// Unique index means we shouldn't be able to insert another one that is empty
			await expect(DB.insertOne(database, col, { b: 1 })).rejects.not.toBeUndefined();
		});
	});
};

const testListDatabases = () => {
	describe('List databases', () => {
		const databaseList = times(10, () => generateRandomString());
		beforeAll(async () => {
			await dbHelper.reset();
			await Promise.all(databaseList.map(
				(dbName) => DB.insertOne(dbName, generateRandomString(), generateBSONData(1)[0]),
			));
		});
		test('Should list all available databases', async () => {
			const expectedList = [...databaseList, ADMIN_DB, 'local', 'config'];
			await expect(DB.listDatabases()).resolves
				.toEqual(expect.arrayContaining(expectedList.map((name) => ({ name }))));
		});
	});
};

const testListCollections = () => {
	describe('List collections', () => {
		const dbName = generateRandomString();
		const collectionList = times(10, () => generateRandomString());
		beforeAll(async () => {
			await dbHelper.reset();
			await Promise.all(collectionList.map(
				(colName) => DB.insertOne(dbName, colName, generateBSONData(1)[0]),
			));
		});
		test('Should list all available collections within a database', async () => {
			const list = await DB.listCollections(dbName);
			expect(list.length).toEqual(collectionList.length);
			expect(list.map(({ name }) => name)).toEqual(expect.arrayContaining(collectionList));
		});

		test('Should return an empty list if the database doesn\'t exist', async () => {
			await expect(DB.listCollections(generateRandomString())).resolves.toEqual([]);
		});
	});
};

const testDropDatabase = () => {
	describe('Drop database', () => {
		const dbName = generateRandomString();
		const colName = generateRandomString();
		beforeAll(() => DB.insertOne(dbName, colName, generateBSONData(1)[0]));

		test('Should remove database specificed', async () => {
			await expect(DB.dropDatabase(dbName)).resolves.toBeUndefined();
			const dbList = await DB.listDatabases();
			expect(dbList.find(({ name }) => name === dbName)).toBeUndefined();
		});

		test('Should return as normal if the database doesn\'t exist', async () => {
			await expect(DB.dropDatabase(generateRandomString())).resolves.toBeUndefined();
		});
	});
};

const testCreateRole = () => {
	describe('Create role', () => {
		const findRole = (db, role) => DB.findOne(ADMIN_DB, ROLES_COL, { role, db });
		test('Should create the role specified', async () => {
			const db = generateRandomString();
			const roleName = generateRandomString();

			await expect(DB.createRole(db, roleName)).resolves.toBeUndefined();

			await expect(findRole(db, roleName)).resolves.toEqual(
				expect.objectContaining({ role: roleName, db, privileges: [], roles: [] }),
			);
		});
	});
};

const testDropRole = () => {
	describe('Drop role', () => {
		const findRole = (db, role) => DB.findOne(ADMIN_DB, ROLES_COL, { role, db });
		const existingRole = { db: generateRandomString(), name: generateRandomString() };
		beforeAll(() => DB.createRole(existingRole.db, existingRole.name));
		test('Should drop the role specified', async () => {
			await expect(DB.dropRole(existingRole.db, existingRole.name)).resolves.toBeUndefined();

			await expect(findRole(existingRole.db, existingRole.name)).resolves.toEqual(null);
		});

		test('Should fail if the role never existed', async () => {
			await expect(DB.dropRole(ADMIN_DB, generateRandomString())).rejects.not.toBeUndefined();
		});
	});
};

const testGrantRole = () => {
	describe('Grant role', () => {
		const role = { db: generateRandomString(), name: generateRandomString() };

		const userWithRole = generateUserCredentials();
		const userWithoutRole = generateUserCredentials();

		const getUser = (user) => DB.findOne(ADMIN_DB, USERS_COL, { user }, { roles: 1, _id: 0 });
		beforeAll(async () => {
			await Promise.all([
				DB.createRole(role.db, role.name),
				dbHelper.createUser(userWithRole),
				dbHelper.createUser(userWithoutRole),
			]);
		});
		test('should grant the role specified to the user', async () => {
			await expect(DB.grantRole(role.db, role.name, userWithoutRole.user)).resolves.toBeUndefined();
			const { roles: resRoles } = await getUser(userWithoutRole.user);
			expect(resRoles).toEqual(expect.arrayContaining([{ db: role.db, role: role.name }, DEFAULT_ROLE_ENTRY]));

			// Doing it again should not cause failure
			await expect(DB.grantRole(role.db, role.name, userWithRole.user)).resolves.toBeUndefined();
		});

		test('should fail if the role doesn\'t exist', async () => {
			await expect(DB.grantRole(role.db, generateRandomString(), userWithoutRole.user))
				.rejects.not.toBeUndefined();
		});
	});
};

const testRevokeRole = () => {
	describe('Revoke role', () => {
		const role = { db: generateRandomString(), name: generateRandomString() };

		const userWithRole = generateUserCredentials();

		const getUser = (user) => DB.findOne(ADMIN_DB, USERS_COL, { user }, { roles: 1, _id: 0 });
		beforeAll(async () => {
			await Promise.all([
				DB.createRole(role.db, role.name),
				dbHelper.createUser(userWithRole),
			]);

			await DB.grantRole(role.db, role.name, userWithRole.user);
		});
		test('should revoke the role from the user', async () => {
			await expect(DB.revokeRole(role.db, role.name, userWithRole.user)).resolves.toBeUndefined();
			const { roles: resRoles } = await getUser(userWithRole.user);
			expect(resRoles).not.toEqual(
				expect.arrayContaining([{ db: role.db, role: role.name }, DEFAULT_ROLE_ENTRY]),
			);

			// Doing it again should not cause failure
			await expect(DB.revokeRole(role.db, role.name, userWithRole.user)).resolves.toBeUndefined();
		});

		test('should fail if the role doesn\'t exist', async () => {
			await expect(DB.revokeRole(role.db, generateRandomString(), userWithRole.user))
				.rejects.not.toBeUndefined();
		});
	});
};

const testSetPassword = () => {
	describe('Set Password', () => {
		const user = generateUserCredentials();
		beforeAll(() => dbHelper.createUser(user));
		test('should change the password of the given user successfully', async () => {
			const newPwd = generateRandomString();
			await expect(DB.setPassword(user.user, newPwd)).resolves.toBeUndefined();

			await expect(DB.authenticate(user.user, newPwd)).resolves.toBeTruthy();
		});

		test('should fail if the user doesn\'t exist', async () => {
			await expect(DB.setPassword(generateRandomString(), generateRandomString()))
				.rejects.not.toBeUndefined();
		});
	});
};

const testConnectionString = () => {
	const oldConfig = cloneDeep(config.db);
	const hosts = times(3, () => generateRandomString());
	const ports = times(3, () => generateRandomNumber(1000, 9999));
	const username = generateRandomString();
	const password = generateRandomString();

	describe.each([
		['config only has a host and port', { host: [hosts[0]], port: [ports[0]] },
			`mongodb://${hosts[0]}:${ports[0]}/`],
		['multiple hosts, multiple ports', { host: [hosts[0], hosts[1], hosts[2]], port: [ports[0], ports[1], ports[2]] },
			`mongodb://${hosts[0]}:${ports[0]},${hosts[1]}:${ports[1]},${hosts[2]}:${ports[2]}/`],
		['with username and password in config', { host: [hosts[0]], port: [ports[0]], username, password },
			`mongodb://${username}:${password}@${hosts[0]}:${ports[0]}/`],
		['with username and password provided externally', { host: [hosts[0]], port: [ports[0]] },
			`mongodb://${username}:${password}@${hosts[0]}:${ports[0]}/`, username, password],
		['with replicaSet', { host: [hosts[0]], port: [ports[0]], replicaSet: 'rs0' },
			`mongodb://${hosts[0]}:${ports[0]}/?replicaSet=rs0`],
		['with authSource', { host: [hosts[0]], port: [ports[0]], authSource: 'admin' },
			`mongodb://${hosts[0]}:${ports[0]}/?authSource=admin`],
		['with socketTimeoutMS', { host: [hosts[0]], port: [ports[0]], timeout: 12345 },
			`mongodb://${hosts[0]}:${ports[0]}/?socketTimeoutMS=12345`],
		['all options', { host: [hosts[0], hosts[1]], port: [ports[0], ports[1]], username: '123', password: '123', replicaSet: 'rs0', authSource: 'admin', timeout: 12345 },
			`mongodb://${username}:${password}@${hosts[0]}:${ports[0]},${hosts[1]}:${ports[1]}/?replicaSet=rs0&authSource=admin&socketTimeoutMS=12345`, username, password],
	])('Connection String', (desc, configOverride, expectedString, user, pass) => {
		test(`Should return the expected connection string if ${desc}`, async () => {
			const fn = jest.spyOn(mongodb.MongoClient, 'connect').mockImplementationOnce(() => Promise.resolve());
			config.db = configOverride;
			// eslint-disable-next-line no-underscore-dangle
			await DB._context.connect(user, pass);
			expect(fn).toHaveBeenCalledWith(expectedString, expect.anything());
			fn.mockRestore();
		});
		afterAll(() => {
			config.db = oldConfig;
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
	testUpdateMany();
	testUpdateOne();
	testReplaceOne();
	testBulkWrite();
	testAggregate();
	testDistinct();
	testFind();
	testFindOne();
	testFindOneAndUpdate();
	testFindOneAndDelete();
	testDeleteMany();
	testDeleteOne();
	testCount();
	testGridFS();
	testIndices();
	testListDatabases();
	testListCollections();
	testDropDatabase();
	testCreateRole();
	testDropRole();
	testGrantRole();
	testRevokeRole();
	testSetPassword();
	testConnectionString();

	afterAll(() => DB.disconnect());
});
