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
const { ADMIN_DB } = require('./db.constants');
const { MongoClient } = require('mongodb');
const config = require('../utils/config');
const { deleteIfUndefined } = require('../utils/helper/objects');

let dbConn;
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
		dbConn = await connect();
	}

	return dbConn.db(db);
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
		conn.command(cmd);
	} catch (err) {
		// istanbul ignore next
		await DBHandler.disconnect();
		// istanbul ignore next
		throw err;
	}
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
				const createRoleCmd = { createRole: DEFAULT_ROLE, privileges: [], roles: [] };
				await runCommand(ADMIN_DB, createRoleCmd);
			}
		};

		defaultRoleProm = createDefaultRole();
	}
	return defaultRoleProm;
};

DBHandler.canConnect = () => DBHandler.authenticate();
DBHandler.disconnect = async () => {
	if (dbConn) {
		await dbConn.close();
		dbConn = null;
		defaultRoleProm = null;
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

	return collection.findOne(query, options);
};

DBHandler.insertOne = async (database, colName, data) => {
	const collection = await getCollection(database, colName);
	await collection.insertOne(data);
};

module.exports = DBHandler;
