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

var async	  = require('async');
var config	  = require('./config.js');

var responseCodes = require('./response_codes.js');

var MongoClient = require('mongodb').MongoClient,
	Server      = require('mongodb').Server,
	GridStore   = require('mongodb').GridStore;

// Create connection to Mongo
// Main DB Object constructor
var MongoDBObject = function()
{
	var self = this;

	this.host = config.db.host;
	this.port = config.db.port;

	this.username = config.db.username;
	this.password = config.db.password;

	this.dbConns  = {};

	this.getURL = function(database)
	{
		return "mongodb://" + this.username + ":" + this.password + "@" + this.host + ":" + this.port + "/" + database;
	}

	this.open = function(database, callback)
	{
		if (dbConns[database])
		{
			callback(null, dbConns[database]);
		} else {
			MongoClient.connect(this.getURL(database), function(err, db) {
				if (err) return callback(err, null);

				dbConns[database] = db;

				callback(null, dbConns[database]);
			}
		}
	}
};

var mongo = new MongoDBObject();

var MongoWrapper = function(logger) {};

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

	mongo.open("admin", function(err, adminDb) {
		if (err) {
			return callback(responseCodes.DB_ERROR(err));
		}

		logger.logInfo('Authenticating user');

		adminDb.authenticate(username, password, function(err) {
			if(err) {
				return callback(responseCodes.DB_ERROR(err));
			}

			callback(responseCodes.OK);
		});

	});
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
	mongo.open(dbName, function(err, db) {
		if (err) {
			return callback(responseCodes.DB_ERROR(err));
		}

		callback(responseCodes.OK, db);
	}
}

MongoWrapper.prototype.Binary = mongo.Binary;

/*******************************************************************************
 * Get a file from the Grid FS store
 *
 * @param {string} dbName     - Database name to get the file from
 * @param {string} collName   - Collection to get the file from
 * @param {string} fileName   - File name to retrieve
 * @param {function} callback - Callback function to return the file data
 *
 ******************************************************************************/
MongoWrapper.prototype.getGridFSFile = function(dbName, collName, fileName, callback)
{
	this.dbCallback(dbName, function (err, dbConn) {
		if (err.value) return callback(err);

		var options = {
			"root" : collName
		};

		var gs = new GridStore(dbConn, fileName, "r", options);

		gs.open(function (err, gs) {
			if (err)
				return callback(responseCodes.DB_ERROR(err));

			gs.seek(0, function() {
				gs.read(function(err, data) {
					if (err)
						return callback(responseCodes.DB_ERROR(err));

					callback(responseCodes.OK, new mongo.Binary(data));
				});
			});
		});
	});
}

/*******************************************************************************
 * Run callback on collection from the database
 *
 * @param {string} dbName - Database name to run the aggregation on
 * @param {string} collName - Collection to run the aggregation on
 * @param {boolean} strict - Enable strict mode or not
 * @param {function} callback - get collection from database and pass to
 *								callback as parameter
 ******************************************************************************/
MongoWrapper.prototype.collCallback = function(dbName, collName, strict, callback) {
	logger.logDebug('Loading collection ' + collName + ' on ' + dbName);

	// First get database connection
	this.dbCallback(dbName, function(err, dbConn) {
		if (err.value) return callback(err);

		// Get collection from database to act on
		dbConn.collection(collName, {strict:strict}, function(err, coll) {
			if (err) return callback(responseCodes.DB_ERROR(err));

			callback(responseCodes.OK, coll);
		});
	});
}

/*******************************************************************************
 * Get top result from query with latest timestamp
 *
 * @param {string} dbName - Database containing the collection for query
 * @param {string} collName - Collection to run the query on
 * @param {string} projection - Projection to use on results
 * @param {function} callback - get collection from database and pass to
 *								callback as parameter
 ******************************************************************************/
MongoWrapper.prototype.getLatest = function(dbName, collName, filter, projection, callback) {
	// Run collection callback that first sorts by timestamp
	// and then gets the top row.
	this.collCallback(dbName, collName, true, function(err, coll) {
		if (err.value) return callback(err);

		projStr = JSON.stringify(projection);
		filtStr = JSON.stringify(filter);

		logger.logDebug('Getting latest for collection: ' + dbName + '/' + collName);
		logger.logDebug('FILTER: \"' + filtStr + '\"');
		logger.logDebug('PROJECTION: \"' + projStr + '\"');

		if (projection != null)
		{
			coll.find(filter, projection).limit(1).sort({timestamp:-1}).toArray(function(err, docs) {
				if (err) return callback(responseCodes.DB_ERROR(err));
				logger.logDebug('Found ' + docs.length + ' result(s).');

				callback(responseCodes.OK, docs);
			});
		} else {
			coll.find(filter).limit(1).sort({timestamp:-1}).toArray(function(err, docs) {
				if (err) return callback(responseCodes.DB_ERROR(err));
				logger.logDebug('Found ' + docs.length + ' result(s).');

				callback(responseCodes.OK, docs);
			});
		}
	});
};

/*******************************************************************************
 * Get filtered collection from the database
 *
 * @param {string} dbName - Database name containing the collection
 * @param {string} collName - Collection to filter from the database
 * @param {JSON} filter - JSON containing filter query to run on collection
 * @param {JSON} projection - JSON containing projection for results
 * @param {function} callback - get filtered collection from database
 *								pass to callback as parameter
 ******************************************************************************/
MongoWrapper.prototype.filterColl = function(dbName, collName, filter, projection, callback) {
	this.collCallback(dbName, collName, true, function(err, coll) {
		if (err.value) return callback(err);

		projStr = JSON.stringify(projection);
		filtStr = JSON.stringify(filter);

		logger.logDebug('Filter collection: ' + dbName + '/' + collName);
		logger.logDebug('FILTER: \"' + filtStr + '\"');
		logger.logDebug('PROJECTION: \"' + projStr + '\"');

		if (projection != null) {
			coll.find(filter, projection).toArray(function(err, docs) {
				if (err) return callback(responseCodes.DB_ERROR(err));
				logger.logDebug('Found ' + docs.length + ' result(s).');

				callback(responseCodes.OK, docs);
			});
		} else {
			coll.find(filter).toArray(function(err, docs) {
				if (err) return callback(responseCodes.DB_ERROR(err));
				logger.logDebug('Found ' + docs.length + ' result(s).');

				callback(responseCodes.OK, docs);
			});
		}
	});
}

module.exports = function(logger) {
	return new MongoWrapper(logger);
};

