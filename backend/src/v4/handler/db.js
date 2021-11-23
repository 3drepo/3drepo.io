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
(function() {
	const config	  = require("../config.js");
	const MongoClient = require("mongodb").MongoClient;
	const GridFSBucket = require("mongodb").GridFSBucket;
	const { PassThrough } = require("stream");
	const responseCodes = require("../response_codes");

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

	const Handler = {};

	let db;

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

	Handler.disconnect = function () {
		if(db) {
			db.close();
			db = null;
		}
	};

	Handler.dropCollection = function (database, collection) {
		Handler.getDB(database).then(dbConn => {
			dbConn.dropCollection(collection.name);
		}).catch(err => {
			Handler.disconnect();
			return Promise.reject(err);
		});
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
	Handler.find = async function (database, colName, query, projection = {}, sort = {}) {
		const collection = await Handler.getCollection(database, colName);
		const options = { projection };

		if (sort) {
			options.sort = sort;
		}

		return collection.find(query, options).toArray();
	};

	Handler.findOne = async function (database, colName, query, projection = {}, sort) {
		const collection = await Handler.getCollection(database, colName);
		const options = { projection };

		if (sort) {
			options.sort = sort;
		}

		return collection.findOne(query, options);
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

	Handler.getCollectionStats = function (database, colName) {
		return Handler.getDB(database).then(dbConn => {
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

	Handler.getSessionStore = function (session) {
		const MongoDBStore = require("connect-mongodb-session")(session);
		return new MongoDBStore({
			uri: getURL("admin"),
			collection: "sessions"
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

	Handler.count = async function (database, colName, query, options) {
		const collection = await Handler.getCollection(database, colName);
		return collection.countDocuments(query, options);
	};

	module.exports = Handler;
}());

