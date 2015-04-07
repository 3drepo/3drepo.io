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
var mongo	  = require('mongodb');
var logIFace  = require('./logger.js');
var logger	  = logIFace.logger;
onError		  = logIFace.onError;

var responseCodes = require('./response_codes.js');

// Main DB Object constructor
function MongoDB() {
	this.host	  = config.db.host;
	this.port	  = config.db.port;

	this.userAuth = null;
	this.dbConns  = {};
}

/*******************************************************************************
 * Authenticate User against admin database
 *
 * @param {Error} err - err object
 * @param {string} username - username logging in
 * @param {string} password - corresponding password for username
 * @param {function} callback - has parameters (err, user) where
 *								user is the user object
 ******************************************************************************/
MongoDB.prototype.authenticateUser = function(username, password, callback) {
	var self = this;

	// Create a separate admin database connection to avoid
	// constantly switching between auth user and NodeJS
	// user
	if (!self.userAuth)
	{
		var serv = new mongo.Server(self.host, self.port, {
			auto_reconnect: true,
		});

		var db = new mongo.Db('admin', serv, { safe: false });

		// TODO: Merge with code below
		db.open(function(err, dbConn) {
			if (err)
				return callback(responseCodes.DB_ERROR(err));

			self.userAuth = dbConn;

			dbConn.on('close', function(err) {
				self.userAuth = null;
			});

			logger.log('info', 'Authenticating user: ' + username);

			return self.authenticateUser(username, password, callback);
		});
	} else {
		logger.log('info', 'Authenticating user: ' + username);

		self.userAuth.authenticate(username, password, function(err) {
			if(err)
				return callback(responseCodes.DB_ERROR(err));

			callback(responseCodes.OK);
		});
	}
};

/*******************************************************************************
 * Open a database connection and pass it to the callback function
 *
 * @param {Error} err - err object
 * @param {string} dbName - Database name which to open
 * @param {function} callback - has parameters (err, dbConn) where
 *								dbConn is the returned database connection.
 ******************************************************************************/
MongoDB.prototype.dbCallback = function(dbName, callback) {
	var self = this;

	// If we already have a connection, return that rather than
	// opening a new connection
	if (self.dbConns[dbName]) {
		return callback(responseCodes.OK, self.dbConns[dbName]);
	}

	// Check if there is an open server connection
	// if there isn't then open one
	logger.log('info', 'Opening server ' + self.host + ' : ' + self.port);

	var serv = new mongo.Server(self.host, self.port, {
		auto_reconnect: true,
	});

	logger.log('info', 'Opening database ' + dbName);

	var db = new mongo.Db(dbName, serv, {
			safe: false
		});

	// Attempt to open the database connection
	db.open(function(err, dbConn) {
		if (err) {
			return callback(responseCodes.DB_ERROR(err));
		}

		// Authenticate against the NodeJS database user
		var adminDb = db.admin();

		adminDb.authenticate(config.db.username, config.db.password, function(err) {
			if (err)
				return callback(responseCodes.DB_ERROR(err));

			logger.log('debug', 'Authentication successful');
			logger.log('debug', 'Authorized as ' + config.db.username);
			//logger.log('debug', 'DB CONNECTION:' + JSON.stringify(dbConn.serverConfig.auth.toArray()));

			self.dbConns[dbName] = dbConn;

			dbConn.on('close', function(err) {
				logger.log('debug', 'Closing connection to ' + dbName + '. REASON: ' + err);
				delete(self.dbConns[dbName]);
			})

			callback(responseCodes.OK, dbConn);
		});
	});

}

MongoDB.prototype.Binary = mongo.Binary;

/*******************************************************************************
 * Run an aggregation query
 *
 * @param {string} dbName - Database name to run the aggregation on
 * @param {string} collName - Collection to run the aggregation on
 * @param {string} query- aggregation query
 *
 * TODO: Fix this, if not currently working
 ******************************************************************************/
MongoDB.prototype.aggregate = function(dbName, collName, query) {
	var self = this;

	async.waterfall([

	function(callback) {
		self.collCallback(dbName, collName, callback);
	}, function(err, coll) {
		coll.aggregate(query, callback)
	}], function(err, result) {
		setTimeout(function() {
			return result;
		}, 0);
	});

}

/*******************************************************************************
 * Run callback on collection from the database
 *
 * @param {string} dbName - Database name to run the aggregation on
 * @param {string} collName - Collection to run the aggregation on
 * @param {function} callback - get collection from database and pass to
 *								callback as parameter
 ******************************************************************************/
MongoDB.prototype.collCallback = function(dbName, collName, callback) {
	logger.log('debug', 'Loading collection ' + collName + ' on ' + dbName);

	// First get database connection
	this.dbCallback(dbName, function(err, dbConn) {
		if (err.value) return callback(err);

		// Get collection from database to act on
		dbConn.collection(collName, {strict:true}, function(err, coll) {
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
MongoDB.prototype.getLatest = function(dbName, collName, filter, projection, callback) {
	// Run collection callback that first sorts by timestamp
	// and then gets the top row.
	this.collCallback(dbName, collName, function(err, coll) {
		if (err.value) return callback(err);

		projStr = JSON.stringify(projection);
		filtStr = JSON.stringify(filter);

		logger.log('debug', 'Getting latest for collection: ' + dbName + '/' + collName);
		logger.log('debug', 'FILTER: \"' + filtStr + '\"');
		logger.log('debug', 'PROJECTION: \"' + projStr + '\"');

		if (projection != null)
		{
			coll.find(filter, projection).limit(1).sort({timestamp:-1}).toArray(function(err, docs) {
				if (err) return callback(responseCodes.DB_ERROR(err));
				logger.log('debug', 'Found ' + docs.length + ' result(s).');

				callback(responseCodes.OK, docs);
			});
		} else {
			coll.find(filter).limit(1).sort({timestamp:-1}).toArray(function(err, docs) {
				if (err) return callback(responseCodes.DB_ERROR(err));
				logger.log('debug', 'Found ' + docs.length + ' result(s).');

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
MongoDB.prototype.filterColl = function(dbName, collName, filter, projection, callback) {
	this.collCallback(dbName, collName, function(err, coll) {
		if (err.value) return callback(err);

		projStr = JSON.stringify(projection);
		filtStr = JSON.stringify(filter);

		logger.log('debug', 'Filter collection: ' + dbName + '/' + collName);
		logger.log('debug', 'FILTER: \"' + filtStr + '\"');
		logger.log('debug', 'PROJECTION: \"' + projStr + '\"');

		if (projection != null) {
			coll.find(filter, projection).toArray(function(err, docs) {
				if (err) return callback(responseCodes.DB_ERROR(err));
				logger.log('debug', 'Found ' + docs.length + ' result(s).');

				callback(responseCodes.OK, docs);
			});
		} else {
			coll.find(filter).toArray(function(err, docs) {
				if (err) return callback(responseCodes.DB_ERROR(err));
				logger.log('debug', 'Found ' + docs.length + ' result(s).');

				callback(responseCodes.OK, docs);
			});
		}
	});
}

module.exports = MongoDB;

