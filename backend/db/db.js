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

(function() {
	"use strict";

	const config	  = require("../config.js");
	const MongoClient = require("mongodb").MongoClient;

	let db;
	// db object only for authenicate
	// POSSIBLE TO-DO: move all the users data and do not reply on mongo system.users 
	let authDB;

	function getURL(database) {
		// Generate connection string that could include multiple hosts that
		// represent a replica set.
		let connectString = "mongodb://" + config.db.username + ":" + config.db.password + "@";
		let hostPorts = [];

		/* jshint ignore:start */
		for(let host in config.db.host)
		/* jshint ignore:end */
		{
			hostPorts.push(config.db.host[host] + ":" + config.db.port[host]);
		}

		connectString += hostPorts.join(",");
		connectString += "/" + database + "?authSource=admin";
		connectString += config.db.replicaSet ? "&replicaSet=" + config.db.replicaSet : "";

		return connectString;
	}

	function getDB(database){
		if(db){
			return Promise.resolve(db.db(database));
		} else {
			return MongoClient.connect(getURL(database)).then(_db => {
				db = _db;
				return db;
			});
		}
	}

	function getAuthDB(){
		if(authDB){
			return Promise.resolve(authDB);
		} else {
			return MongoClient.connect(getURL('admin')).then(_db => {
				authDB = _db;
				return authDB;
			});
		}
	}

	module.exports = {
		getDB,
		getAuthDB
	};

}());
