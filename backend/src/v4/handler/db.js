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
	const MongoClient = require("mongodb").MongoClient;

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

	Handler.getAllValues = async (database, colName, key) => {
		const collection = await Handler.getCollection(database, colName);
		return collection.distinct(key);
	};

	Handler.runCommand = function (database, cmd) {
		return Handler.getDB(database).then(dbConn => {
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

	Handler.dropUser = async (user) => {
		await Handler.deleteOne("admin", "system.users", { user });
	};

	Handler.INTERNAL_DB = "internal";

	module.exports = Handler;
}());

