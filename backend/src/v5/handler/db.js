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

const { DEFAULT: DEFAULT_ROLE, ROLES_COL } = require('../models/roles.constants');
const { GridFSBucket, Long, MongoClient } = require('mongodb');
const { ADMIN_DB } = require('./db.constants');
const { PassThrough } = require('stream');
const config = require('../utils/config');
const { deleteIfUndefined } = require('../utils/helper/objects');
const { templates } = require('../utils/responseCodes');

let dbConn;
let sessionConn;
let defaultRoleProm;
const DBHandler = {};

// not testing coverage for options as anything that fails to connect has a long wait time
const getURL = /* istanbul ignore next */(username, password) => {
	const urlElements = ['mongodb://'];
	const user = username ?? config.db.username;
	const pw = password ?? config.db.password;

	urlElements.push((user && pw) ? `${user}:${encodeURIComponent(pw)}@` : '');

	const hostsAndPorts = config.db.host.map((host, i) => `${host}:${config.db.port[i]}`);

	urlElements.push(hostsAndPorts, '/?');

	urlElements.push(config.db.replicaSet ? `&replicaSet=${config.db.replicaSet}` : '');
	urlElements.push(config.db.authSource ? `&authSource=${config.db.authSource}` : '');

	if (Number.isInteger(config.db.timeout)) {
		urlElements.push(`&socketTimeoutMS=${config.db.timeout}`);
	}
	return urlElements.join('');
};

const connect = (username, password) => MongoClient.connect(
	getURL(username, password),
	{
		useNewUrlParser: true,
		useUnifiedTopology: true,
	},
);

const getDB = async (db) => {
	if (!dbConn) {
		dbConn = connect();
	}

	return (await dbConn).db(db);
};

const getCollection = async (db, col) => {
	try {
		const conn = await getDB(db);
		return conn.collection(col);
	} catch (err) {
		// istanbul ignore next
		await DBHandler.disconnect();
		// istanbul ignore next
		throw err;
	}
};

const runCommand = async (database, cmd) => {
	const conn = await getDB(database);
	try {
		return conn.command(cmd);
	} catch (err) {
		// istanbul ignore next
		await DBHandler.disconnect();
		// istanbul ignore next
		throw err;
	}
};

// This is a temp workaround for v4 and should not be used anywhere!
// eslint-disable-next-line no-underscore-dangle
DBHandler._context = {
	connect, getDB,
};

DBHandler.authenticate = async (user, password) => {
	let conn;
	let success = true;
	try {
		conn = await connect(user, password);
		await conn.db(ADMIN_DB);
	} catch (err) {
		success = false;
	} finally {
		if (conn) {
			conn.close();
		}
	}

	return success;
};

DBHandler.getAuthDB = () => getDB(ADMIN_DB);

const ensureDefaultRoleExists = () => {
	if (!defaultRoleProm) {
		const createDefaultRole = async () => {
			const roleFound = await DBHandler.findOne(ADMIN_DB, ROLES_COL, { _id: `${ADMIN_DB}.${DEFAULT_ROLE}` }, { _id: 1 });

			if (!roleFound) {
				await DBHandler.createRole(ADMIN_DB, DEFAULT_ROLE);
			}
		};

		defaultRoleProm = createDefaultRole();
	}
	return defaultRoleProm;
};

DBHandler.canConnect = () => DBHandler.authenticate();
DBHandler.disconnect = async () => {
	const dummyObj = { close: /* istanbul ignore next */ () => {} };
	if (dbConn) {
		const conn = await dbConn.catch(/* istanbul ignore next */ () => dummyObj);
		await conn.close();
		dbConn = null;
		defaultRoleProm = null;
	}

	if (sessionConn) {
		const conn = await sessionConn.catch(/* istanbul ignore next */ () => dummyObj);
		await conn.close();
		sessionConn = null;
	}
};

DBHandler.createUser = async (username, password, customData, roles = []) => {
	const [db] = await Promise.all([
		DBHandler.getAuthDB(),
		ensureDefaultRoleExists(),
	]);

	await db.addUser(username, password, { customData, roles: [...roles, { db: ADMIN_DB, role: DEFAULT_ROLE }] });
};

const dropAllIndicies = async (database, colName) => {
	const collection = await getCollection(database, colName);
	return collection.dropIndexes();
};

DBHandler.dropCollection = async (database, collection) => {
	try {
		await dropAllIndicies(database, collection);
		const db = await getDB(database);
		await db.dropCollection(collection);
	} catch (err) {
		/* istanbul ignore if */
		if (!err.message.includes('ns not found')) {
			DBHandler.disconnect();
			throw err;
		}
	}
};

DBHandler.aggregate = async (database, colName, pipelines) => {
	const collection = await getCollection(database, colName);
	return collection.aggregate(pipelines).toArray();
};

DBHandler.findOne = async (database, colName, query, projection, sort) => {
	const collection = await getCollection(database, colName);
	const options = deleteIfUndefined({ projection, sort });

	if (sort) {
		return collection.find(query, options).limit(1).next();
	}

	return collection.findOne(query, options);
};

DBHandler.find = async (database, colName, query, projection, sort, limit, skip = 0) => {
	const collection = await getCollection(database, colName);
	const options = deleteIfUndefined({ projection, sort });
	const cmd = collection.find(query, options).skip(skip);
	return limit ? cmd.limit(limit).toArray() : cmd.toArray();
};

DBHandler.distinct = async (database, colName, field, query) => {
	const collection = await getCollection(database, colName);
	return collection.distinct(field, query);
};

DBHandler.insertOne = async (database, colName, data) => {
	const collection = await getCollection(database, colName);
	await collection.insertOne(data);
};

DBHandler.insertMany = async (database, colName, data, ordered) => {
	const collection = await getCollection(database, colName);
	const options = deleteIfUndefined({ ordered });
	await collection.insertMany(data, options);
};

DBHandler.updateMany = async (database, colName, query, data, upsert = false) => {
	const collection = await getCollection(database, colName);
	await collection.updateMany(query, data, { upsert });
};

DBHandler.updateOne = async (database, colName, query, data, upsert = false) => {
	const collection = await getCollection(database, colName);
	const { matchedCount } = await collection.updateOne(query, data, { upsert });
	return matchedCount > 0;
};

DBHandler.replaceOne = async (database, colName, query, data) => {
	const collection = await getCollection(database, colName);
	await collection.replaceOne(query, data);
};

DBHandler.bulkWrite = async (database, colName, instructions) => {
	const collection = await getCollection(database, colName);
	await collection.bulkWrite(instructions);
};

DBHandler.findOneAndUpdate = async (database, colName, query, action, options = {}) => {
	const collection = await getCollection(database, colName);
	const { value } = await collection.findOneAndUpdate(query, action, deleteIfUndefined(options));
	return value;
};

DBHandler.findOneAndDelete = async (database, colName, query, projection) => {
	const collection = await getCollection(database, colName);
	const options = deleteIfUndefined({ projection });
	const { value } = await collection.findOneAndDelete(query, options);
	return value;
};

DBHandler.deleteMany = async (database, colName, query) => {
	const collection = await getCollection(database, colName);
	await collection.deleteMany(query);
};

DBHandler.deleteOne = async (database, colName, query) => {
	const collection = await getCollection(database, colName);
	await collection.deleteOne(query);
};

DBHandler.count = async (database, colName, query, options) => {
	const collection = await getCollection(database, colName);
	return collection.countDocuments(query, options);
};

const getGridFSBucket = async (database, collection, chunksize) => {
	try {
		const db = await getDB(database);
		const options = deleteIfUndefined({ bucketName: collection, chunksize });
		return new GridFSBucket(db, options);
	} catch (err) {
		/* istanbul ignore next */
		DBHandler.disconnect();
		/* istanbul ignore next */
		throw err;
	}
};
DBHandler.getFileStreamFromGridFS = async (database, collection, filename) => {
	const bucket = await getGridFSBucket(database, collection);
	const file = await bucket.find({ filename }).toArray();
	if (file.length === 0) {
		throw templates.fileNotFound;
	}

	return { stream: bucket.openDownloadStream(file[0]._id), size: file[0].length };
};

DBHandler.getFileFromGridFS = async (database, collection, filename) => {
	const { stream } = await DBHandler.getFileStreamFromGridFS(database, collection, filename);
	return new Promise((resolve) => {
		const bufs = [];
		stream.on('data', (d) => {
			bufs.push(d);
		});

		stream.on('end', () => {
			resolve(Buffer.concat(bufs));
		});
	});
};

DBHandler.storeFileInGridFS = async (database, collection, filename, buffer) => {
	const bucket = await getGridFSBucket(database, collection);
	return new Promise((resolve, reject) => {
		try {
			const stream = new PassThrough();
			stream
				.pipe(bucket.openUploadStream(filename))
				.on('error', /* istanbul ignore next */(error) => {
					reject(error);
				})
				.on('finish', () => {
					resolve(filename);
				});

			stream.end(buffer);
		} catch (e) {
		/* istanbul ignore next */
			reject(e);
		}
	});
};

DBHandler.createIndex = async (database, colName, indexDef, { runInBackground: background, unique } = {}) => {
	const collection = await getCollection(database, colName);
	const options = deleteIfUndefined({ background, unique });
	await collection.createIndex(indexDef, options);
};

DBHandler.createIndices = async (database, colName, indicesDef) => {
	const collection = await getCollection(database, colName);
	await collection.createIndexes(indicesDef);
};

DBHandler.dropIndex = async (database, colName, indexName) => {
	const collection = await getCollection(database, colName);
	await collection.dropIndex(indexName);
};

DBHandler.listIndices = async (database, colName) => {
	const collection = await getCollection(database, colName);
	return collection.listIndexes().toArray();
};

DBHandler.listDatabases = async () => {
	try {
		const res = await runCommand('admin', { listDatabases: 1, nameOnly: true });
		return res.databases;
	} catch (err) {
		/* istanbul ignore next */
		await DBHandler.disconnect();
		/* istanbul ignore next */
		throw err;
	}
};

DBHandler.listCollections = async (database) => {
	try {
		const conn = await getDB(database);
		const colls = await conn.listCollections().toArray();
		return colls.map(({ name, options }) => ({ name, options }));
	} catch (err) {
		/* istanbul ignore next */
		await DBHandler.disconnect();
		/* istanbul ignore next */
		throw err;
	}
};

DBHandler.dropDatabase = async (database) => {
	if (!['config', 'admin'].includes(database)) {
		try {
			const conn = await getDB(database);
			const collections = await DBHandler.listCollections(database);
			await Promise.all(collections.map(({ name }) => dropAllIndicies(database, name)));
			await conn.dropDatabase();
		} catch (err) {
			/* istanbul ignore next */
			if (err.message !== 'ns not found') {
				DBHandler.disconnect();
				throw err;
			}
		}
	}
};

DBHandler.createRole = async (database, roleName) => {
	// At application level, roles are only used in a contextual way.
	// We should never be in a situation where we want to create a role
	// that has actual mongo level privileges
	const createRoleCmd = {
		createRole: roleName,
		privileges: [],
		roles: [],
	};

	await runCommand(database, createRoleCmd);
};

DBHandler.dropRole = async (database, roleName) => {
	const dropRoleCmd = {
		dropRole: roleName,
	};

	await runCommand(database, dropRoleCmd);
};

DBHandler.grantRole = async (db, role, user) => {
	const grantRoleCmd = {
		grantRolesToUser: user,
		roles: [{ role, db }],
	};

	await runCommand(ADMIN_DB, grantRoleCmd);
};

DBHandler.revokeRole = async (db, role, user) => {
	const revokeRoleCmd = {
		revokeRolesFromUser: user,
		roles: [{ role, db }],
	};

	await runCommand(ADMIN_DB, revokeRoleCmd);
};

DBHandler.setPassword = async (user, newPassword) => {
	const updateUserCmd = {
		updateUser: user,
		pwd: newPassword,
	};

	await runCommand(ADMIN_DB, updateUserCmd);
};

DBHandler.getSessionStore = /* istanbul ignore next */() => {
	// For some reason this library is very problematic...
	// eslint-disable-next-line global-require
	const MongoStore = require('connect-mongo');
	sessionConn = connect();
	const sessionStore = MongoStore.create({
		clientPromise: sessionConn,
		dbName: 'admin',
		collectionName: 'sessions',
		stringify: false,
	});
	return Promise.resolve(sessionStore);
};

DBHandler.dataTypes = {
	Long,
};

module.exports = DBHandler;
