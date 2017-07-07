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

// Inspired by
// http://stackoverflow.com/questions/12037655/node-js-mongodb-native-driver-connection-sharing

(function() {
	"use strict";

	var config	  = require("../config.js");

	var responseCodes = require("../response_codes.js");

	var MongoClient = require("mongodb").MongoClient,
		Server      = require("mongodb").Server,
		Db          = require("mongodb").Db,
		ReplSet     = require("mongodb").ReplSet;

	//var C = require("../constants.js");
	var systemLogger = require("../logger.js").systemLogger;

	// Create connection to Mongo
	// Main DB Object constructor
	var MongoDBObject = function()
	{
		var self = this instanceof MongoDBObject ? this : Object.create(MongoDBObject.prototype);

		self.host = config.db.host;
		self.port = config.db.port;
		self.rsName = config.db.replicaSet;

		self.username = config.db.username;
		self.password = config.db.password;

		self.dbConns  = {};

		let serverConfig = {};
		let opts = { auto_reconnect: true };

		if (self.host.length === 1)
		{
			serverConfig = new Server(self.host[0], self.port[0], opts);
		} else {
			let replSet = [];

			/* jshint ignore:start */
			for(let host in self.host)
			/* jshint ignore:end */
			{
				systemLogger.logInfo("Add replica set member " + self.host[host] + ":" + self.port[host]);
				replSet.push(new Server(self.host[host], self.port[host]));
			}

			serverConfig = new ReplSet(replSet, opts);
		}

		var authDBConn = new Db("admin", serverConfig, { safe : false });

		authDBConn.open(function(err, dbConn) {
			if(err) {
				var dbError = responseCodes.DB_ERROR(err);
				systemLogger.logError("ETC: " + JSON.stringify(err.err));
				throw Error(JSON.stringify(dbError));
			}

			self.authDB = dbConn;
		});

		return self;
	};

	MongoDBObject.prototype.getURL = function(database)
	{
		// Generate connection string that could include multiple hosts that
		// represent a replica set.
		let connectString = "mongodb://" + this.username + ":" + this.password + "@";
		let hostPorts = [];

		/* jshint ignore:start */
		for(let host in this.host)
		/* jshint ignore:end */
		{
			hostPorts.push(this.host[host] + ":" + this.port[host]);
		}

		connectString += hostPorts.join(",");
		connectString += "/" + database + "?authSource=admin";
		connectString += this.rsName ? "&replicaSet=" + this.rsName : "";

		return connectString;
	};

	MongoDBObject.prototype.open = function(database, callback, forgetMe)
	{
		var self = this;

		forgetMe = (forgetMe === undefined) ? false : true;

		if (self.dbConns.hasOwnProperty(database))
		{
			callback(null, self.dbConns[database]);
		} else {
			//console.log(this.getURL(database));

			MongoClient.connect(this.getURL(database), function(err, db) {
				if (err) {
					return callback(err, null);
				}

				if (!forgetMe) {
					// Asynchronously another may have got here first
					// if not, then store this connection for later use
					// otherwise close it as a duplication.
					if (!self.dbConns.hasOwnProperty(database)) {
						self.dbConns[database] = db;
					} else {
						db.close();
						db = self.dbConns[database];
					}
				}

				callback(null, db);
			});
		}
	};

	MongoDBObject.prototype.authenticateUser = function(username, password, callback)
	{
		var self = this;

		self.authDB.admin().authenticate(username, password, function(err) {
			if(err) {
				return callback(responseCodes.DB_ERROR(err));
			}

			callback(responseCodes.OK);
		});
	};

	var mongo = new MongoDBObject();

	var MongoWrapper = function(logger) {
		var self = this instanceof MongoWrapper ? this : Object.create(MongoWrapper.prototype);

		self.logger = logger;

		return self;
	};

	/*******************************************************************************
	 * Authenticate User against admin database
	 *
	 * @param {Error} err - err object
	 * @param {string} username - username logging in
	 * @param {string} password - corresponding password for username
	 * @param {function} callback - has parameters (err, user) where
	 *								user is the user object
	 ******************************************************************************/
	MongoWrapper.prototype.authenticateUser = function(username, password, callback) {
		// Create a separate admin database connection to avoid
		// constantly switching between auth user and NodeJS
		// user

		var self = this;

		self.logger.logInfo("Authenticating user");
		mongo.authenticateUser(username, password, callback);
	};

	/*******************************************************************************
	 * Open a database connection and pass it to the callback function
	 *
	 * @param {Error} err - err object
	 * @param {string} dbName - Database name which to open
	 * @param {function} callback - has parameters (err, dbConn) where
	 *								dbConn is the returned database connection.
	 ******************************************************************************/
	MongoWrapper.prototype.dbCallback = function(dbName, callback) {
		// var self = this;
		mongo.open(dbName, function (err, db) {

			if (err) {
				return callback(responseCodes.DB_ERROR(err));
			}

			callback(responseCodes.OK, db);
		});
	};

	/*******************************************************************************
	 * Return signleton db connection
	 *
	 * @param {string} dbName - Database name
	 * @return {promise} promise with db connection as resolved value
	 ******************************************************************************/
	MongoWrapper.prototype.getDB = function(dbName) {

		if(this._db) {
			return Promise.resolve(this._db.db(dbName));
		} else {

			return new Promise((resolve, reject) => {
				mongo.open(dbName, (err, db) => {
					if(err){
						return reject(err);
					} else {
						return resolve(db);
					}
				});
			});

		}
	};

	/*******************************************************************************
	 * Return auth db connection
	 *
	 * @param {string} dbName - Database name
	 * @return {object}  auth db
	 ******************************************************************************/
	MongoWrapper.prototype.getAuthDB = function(){
		return mongo.authDB;
	};


	module.exports = function(logger) {
		return new MongoWrapper(logger);
	};

}());
