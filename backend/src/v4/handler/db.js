/**
 *  Copyright (C) 2014 3D Repo Ltd
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

"use strict";
const { v5Path } = require("../../interop");
const HandlerV5 = require(`${v5Path}/handler/db`);
(function() {
	const config	  = require("../config.js");
	const C = require("../constants");
	const MongoClient = require("mongodb").MongoClient;
	const GridFSBucket = require("mongodb").GridFSBucket;
	const { PassThrough } = require("stream");

	async function getGridFSBucket(database, collection, chunksize = null) {
		try {
			const dbConn = await Handler.getDB(database);
			const options = {bucketName: collection};

			if (chunksize) {
				options.chunksize =  chunksize;
			}

			return new GridFSBucket(dbConn, options);
		} catch (err) {
			Handler.disconnect();
			throw err;
		}
	}

	function getHostPorts() {
		const hostPorts = [];

		for (const host in config.db.host) {
			hostPorts.push(`${config.db.host[host]}:${config.db.port[host]}`);
		}

		return hostPorts.join(",");
	}

	function getURL(username, password) {
		// Generate connection string that could include multiple hosts that
		// represent a replica set.

		let authStr = "";
		if(username && password) {
			authStr = `${username}:${encodeURIComponent(password)}@`;
		} else if(config.db.username && config.db.password) {
			authStr = `${config.db.username}:${encodeURIComponent(config.db.password)}@`;
		}

		let connectString = `mongodb://${authStr}${getHostPorts()}/?`;

		connectString += config.db.replicaSet ? "&replicaSet=" + config.db.replicaSet : "";
		connectString += config.db.authSource ? "&authSource=" + config.db.authSource : "";

		if (Number.isInteger(config.db.timeout)) {
			connectString += "&socketTimeoutMS=" + config.db.timeout;
		}
		return connectString;
	}

	const connect = (username, password) => {
		return MongoClient.connect(getURL(username, password), {
			useNewUrlParser: true,
			useUnifiedTopology: true
		});
	};

	const Handler = {...HandlerV5};

	let db;

	Handler.disconnect = function () {
		if(db) {
			db.close();
			db = null;
		}
	};

	const dropAllIndicies = async (database, colName) => {
		const collection = await Handler.getCollection(database, colName);
		return collection.dropIndexes();
	};

	Handler.dropCollection = async (database, collection) => HandlerV5.dropCollection(database, collection.name ?? collection);

	Handler.getDB = async (database) => {
		if (db) {
			return db.db(database);
		} else {
			db = await connect();
			return db.db(database);
		}
	};

	Handler.getAuthDB = function () {
		return Handler.getDB("admin");
	};

	Handler.getCollection = function (database, colName) {
		return Handler.getDB(database).then(dbConn => {
			return dbConn.collection(colName);
		}).catch(err => {
			Handler.disconnect();
			return Promise.reject(err);
		});
	};

	Handler.getDatabaseStats = async (database) => {
		const dbConn = await Handler.getDB(database);
		return dbConn.stats();
	};

	Handler.getCollectionStats = function (database, colName) {
		return Handler.getDB(database).then(dbConn => {
			return dbConn.collection(colName).stats();
		}).catch(err => {
			Handler.disconnect();
			return Promise.reject(err);
		});
	};
	Handler.createIndex = async (database, colName, indexDef, { runInBackground } = {}) => {
		const collection = await Handler.getCollection(database, colName);
		const options = runInBackground ? { background: true } : undefined;
		return collection.createIndex(indexDef, options);
	};

	Handler.createIndices = async (database, colName, indicesDef) => {
		const collection = await Handler.getCollection(database, colName);
		return collection.createIndexes(indicesDef);
	};

	Handler.dropIndex = async (database, colName, indexName) => {
		const collection = await Handler.getCollection(database, colName);
		return collection.dropIndex(indexName);
	};

	Handler.getAllValues = async (database, colName, key) => {
		const collection = await Handler.getCollection(database, colName);
		return collection.distinct(key);
	};

	Handler.listDatabases = async (nameOnly = true) => {
		try {
			const res = await Handler.runCommand("admin", {listDatabases :1, nameOnly });
			return res.databases;
		} catch (err) {
			Handler.disconnect();
			throw err;
		}
	};

	Handler.listCollections = async function (database) {
		try {
			const dbConn = await Handler.getDB(database);
			const colls = await dbConn.listCollections().toArray();
			return colls.map(({name, options}) => ({name, options}));
		} catch (err) {
			Handler.disconnect();
			throw err;
		}
	};

	Handler.runCommand = function (database, cmd) {
		return Handler.getDB(database).then(dbConn => {
			return dbConn.command(cmd);
		}).catch(err => {
			Handler.disconnect();
			return Promise.reject(err);
		});
	};

	Handler.getSessionStore = () => {
		const MongoStore = require("connect-mongo");
		const sessionStore = MongoStore.create({
			clientPromise: connect(),
			dbName: "admin",
			collectionName: "sessions",
			stringify: false
		});
		return Promise.resolve(sessionStore);
	};

	Handler.updateMany = async function (database, colName, query, data, upsert = false) {
		const collection = await Handler.getCollection(database, colName);
		const options = upsert ? { upsert } : undefined;
		return collection.updateMany(query, data, options);
	};

	Handler.updateOne = async function (database, colName, query, data, upsert = false) {
		const collection = await Handler.getCollection(database, colName);
		const options = upsert ? { upsert } : undefined;
		return collection.updateOne(query, data, options);
	};

	Handler.replaceOne = async function (database, colName, query, data) {
		const collection = await Handler.getCollection(database, colName);
		return collection.replaceOne(query, data);
	};

	Handler.count = async function (database, colName, query, options) {
		const collection = await Handler.getCollection(database, colName);
		return collection.countDocuments(query, options);
	};

	let defaultRoleProm;

	const ensureDefaultRoleExists = async () => {
		if(!defaultRoleProm) {

			const createDefaultRole = async () => {

				const roleFound = await Handler.findOne("admin", "system.roles", { _id: `admin.${C.DEFAULT_ROLE_OBJ.role}` });

				if (!roleFound) {
					const createRoleCmd = { createRole: C.DEFAULT_ROLE_OBJ.role, privileges: [], roles: [] };
					await Handler.runCommand("admin", createRoleCmd);
				}
			};

			defaultRoleProm = createDefaultRole();
		}
		return defaultRoleProm;
	};

	Handler.reset = () => {
		defaultRoleProm = null;
	};
	Handler.dropDatabase = async (database) => {
		if(!["config", "admin"].includes(database)) {
			try {
				const dbConn = await Handler.getDB(database);
				const collections = await Handler.listCollections(database);
				await Promise.all(collections.map(({name}) => dropAllIndicies(database,name)));
				await dbConn.dropDatabase();
			} catch (err) {
				if(err.message !== "ns not found") {
					Handler.disconnect();
					throw err;
				}
			}
		}
	};

	Handler.createUser = async function (username, password, customData, roles = []) {
		const [adminDB] = await Promise.all([
			Handler.getAuthDB(),
			ensureDefaultRoleExists()
		]);

		roles.push(C.DEFAULT_ROLE_OBJ);
		await adminDB.addUser(username, password, { customData, roles});
	};

	Handler.dropUser = async (user) => {
		await Handler.deleteOne("admin", "system.users", { user });
	};

	Handler.INTERNAL_DB = "internal";

	module.exports = Handler;
}());

