/**
 *	Copyright (C) 2014 3D Repo Ltd
 *
 *	This program is free software: you can redistribute it and/or modify
 *	it under the terms of the GNU Affero General Public License as
 *	published by the Free Software Foundation, either version 3 of the
 *	License, or (at your option) any later version.
 *
 *	This program is distributed in the hope that it will be useful,
 *	but WITHOUT ANY WARRANTY; without even the implied warranty of
 *	MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *	GNU Affero General Public License for more details.
 *
 *	You should have received a copy of the GNU Affero General Public License
 *	along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

"use strict";
(function() {

	const config	  = require("../config.js");
	const MongoClient = require("mongodb").MongoClient;
	const connConfig = {
		autoReconnect: true
	};

	let db;

	function disconnect() {
		if(db) {
			db.close();
			db = null;
		}
	}

	function dropCollection(database, collection) {
		getDB(database).then(dbConn => {
			dbConn.dropCollection(collection.name);
		}).catch(err => {
			disconnect();
			return Promise.reject(err);
		});
	}

	function getURL(database) {
		// Generate connection string that could include multiple hosts that
		// represent a replica set.
		let connectString = "mongodb://" + config.db.username + ":" + config.db.password + "@";
		const hostPorts = [];

		for(const host in config.db.host) {
			hostPorts.push(config.db.host[host] + ":" + config.db.port[host]);
		}

		connectString += hostPorts.join(",");
		connectString += "/" + database + "?authSource=admin";
		connectString += config.db.replicaSet ? "&replicaSet=" + config.db.replicaSet : "";

		if(Number.isInteger(config.db.timeout)) {
			connectString += "&socketTimeoutMS=" + config.db.timeout;
		}
		return connectString;
	}

	function getDB(database) {
		if(db) {
			return Promise.resolve(db.db(database));
		} else {
			return MongoClient.connect(getURL(database), connConfig).then(_db => {
				db = _db;
				return db;
			});
		}
	}

	function getAuthDB() {
		return MongoClient.connect(getURL("admin"), connConfig).then(_db => {
			return _db;
		});
	}

	function getCollection(database, colName)	{
		return getDB(database).then(dbConn => {
			return dbConn.collection(colName);
		}).catch(err => {
			disconnect();
			return Promise.reject(err);
		});
	}

	function getCollectionStats(database, colName)	{
		return getDB(database).then(dbConn => {
			return dbConn.collection(colName).stats();
		}).catch(err => {
			disconnect();
			return Promise.reject(err);
		});
	}

	// FIXME: this exist as a (temp) workaround because modelFactory has one call that doesn't expect promise!
	function _getCollection(database, colName)	{
		return db.db(database).collection(colName);
	}

	function listCollections(database) {
		return getDB(database).then(dbConn => {
			return dbConn.listCollections().toArray();
		}).catch(err => {
			disconnect();
			return Promise.reject(err);
		});

	}

	function runCommand(database, cmd) {
		return getDB(database).then(dbConn => {
			return dbConn.command(cmd);
		}).catch(err => {
			disconnect();
			return Promise.reject(err);
		});
	}

	module.exports = {
		disconnect,
		dropCollection,
		getDB,
		getAuthDB,
		getCollection,
		getCollectionStats,
		_getCollection,
		listCollections,
		runCommand
	};

}());

