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

const {v5Path} = require("../../interop");
const {_context, disconnect} = require(`${v5Path}/handler/db`);

(function() {
	const C = require("../constants");
	const GridFSBucket = require("mongodb").GridFSBucket;
	const { PassThrough } = require("stream");
	const responseCodes = require("../response_codes");

	async function getGridFSBucket(database, collection, chunksize = null) {
		try {
			const dbConn = await _context.getDB(database);
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
	const connect =  _context.connect;

	const Handler = {};

	Handler.authenticate = async (user, password) => {
		let conn;
		try {
			conn = await connect(user, password);
			await conn.db("admin");
		} catch (err) {
			throw responseCodes.INCORRECT_USERNAME_OR_PASSWORD;
		} finally {
			if(conn) {
				conn.close();
			}
		}

	};

	Handler.disconnect = disconnect;

	const dropAllIndicies = async (database, colName) => {
		const collection = await Handler.getCollection(database, colName);
		return collection.dropIndexes();
	};

	Handler.dropCollection = async (database, collection) => {
		const colName = collection.name || collection;
		try {
			await dropAllIndicies(database, colName);
			const dbConn = await _context.getDB(database);
			await dbConn.dropCollection(colName);

		} catch(err) {
			if(!err.message.includes("ns not found")) {
				Handler.disconnect();
				throw err;
			}
		}
	};

	Handler.aggregate = async (database, colName, pipelines) => {
		const collection = await Handler.getCollection(database, colName);
		return collection.aggregate(pipelines).toArray();
	};

	/**
	 * @param {string} database
	 * @param {string} colName
	 * @param {object} query
	 * @param {object} projection
	 * @param {object} sort
	 * @returns {Promise<Array<Object>}
	 */
	Handler.find = async function (database, colName, query, projection = {}, sort = {}, limit) {
		const collection = await Handler.getCollection(database, colName);
		const options = { projection };

		if (sort) {
			options.sort = sort;
		}

		const cmd = collection.find(query, options);
		return limit ? cmd.limit(limit).toArray() : cmd.toArray();
	};

	Handler.findOne = async function (database, colName, query, projection = {}, sort) {
		const collection = await Handler.getCollection(database, colName);
		const options = { projection };

		if (sort) {
			options.sort = sort;
		}

		return collection.findOne(query, options);
	};

	Handler.findOneAndUpdate = async function (database, colName, query, action, projection = {}) {
		const collection = await Handler.getCollection(database, colName);
		const findResult = await collection.findOneAndUpdate(query, action, {projection});
		return findResult.value;
	};

	Handler.findOneAndDelete = async function (database, colName, query, projection = {}) {
		const collection = await Handler.getCollection(database, colName);
		const findResult = await collection.findOneAndDelete(query, projection);
		return findResult.value;
	};

	Handler.deleteMany = async function (database, colName, query) {
		const collection = await Handler.getCollection(database, colName);
		return collection.deleteMany(query);
	};

	Handler.deleteOne = async function (database, colName, query) {
		const collection = await Handler.getCollection(database, colName);
		return collection.deleteOne(query);
	};

	Handler.getDB = _context.getDB;

	Handler.getAuthDB = function () {
		return _context.getDB("admin");
	};

	Handler.getCollection = function (database, colName) {
		return _context.getDB(database).then(dbConn => {
			return dbConn.collection(colName);
		}).catch(err => {
			Handler.disconnect();
			return Promise.reject(err);
		});
	};

	Handler.getDatabaseStats = async (database) => {
		const dbConn = await _context.getDB(database);
		return dbConn.stats();
	};

	Handler.getCollectionStats = function (database, colName) {
		return _context.getDB(database).then(dbConn => {
			return dbConn.collection(colName).stats();
		}).catch(err => {
			Handler.disconnect();
			return Promise.reject(err);
		});
	};

	Handler.getFileStreamFromGridFS = function (database, collection, filename) {
		return getGridFSBucket(database,collection).then((bucket) => {
			return bucket.find({filename}).toArray().then(file => {
				if(file.length === 0) {
					return Promise.reject(responseCodes.NO_FILE_FOUND);
				}
				return Promise.resolve({stream: bucket.openDownloadStream(file[0]._id), size: file[0].length});
			});
		});
	};

	Handler.bulkWrite = async function (database, colName, instructions) {
		const collection = await Handler.getCollection(database, colName);
		return collection.bulkWrite(instructions);
	};

	Handler.insertMany = async function (database, colName, data) {
		const collection = await Handler.getCollection(database, colName);
		return collection.insertMany(data);
	};

	Handler.insertOne = async function (database, colName, data) {
		const collection = await Handler.getCollection(database, colName);
		return collection.insertOne(data);
	};

	Handler.getFileFromGridFS = function (database, collection, filename) {
		return Handler.getFileStreamFromGridFS(database, collection, filename).then((file) => {
			const fileStream = file.stream;
			return new Promise((resolve) => {
				const bufs = [];
				fileStream.on("data", function(d) {
					bufs.push(d);
				});

				fileStream.on("end", function() {
					resolve(Buffer.concat(bufs));
				});
			});
		});
	};

	Handler.storeFileInGridFS = function (database, collection, filename, buffer) {
		return getGridFSBucket(database, collection).then(bucket => {
			return new Promise(function(resolve, reject) {
				try {
					const stream = new PassThrough();
					stream
						.pipe(bucket.openUploadStream(filename))
						.on("error", function(error) {
							reject(error);
						})
						.on("finish", function() {
							resolve(filename);
						});

					stream.end(buffer);

				} catch (e) {
					reject(e);
				}
			});
		});
	};

	Handler.indexExists = async (database, colName, index) => {
		const collection = await Handler.getCollection(database, colName);
		return collection.indexExists(index);
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
			const dbConn = await _context.getDB(database);
			const colls = await dbConn.listCollections().toArray();
			return colls.map(({name, options}) => ({name, options}));
		} catch (err) {
			Handler.disconnect();
			throw err;
		}
	};

	Handler.runCommand = function (database, cmd) {
		return _context.getDB(database).then(dbConn => {
			return dbConn.command(cmd);
		}).catch(err => {
			Handler.disconnect();
			return Promise.reject(err);
		});
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
				const dbConn = await _context.getDB(database);
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

