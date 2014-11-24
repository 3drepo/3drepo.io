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

// Inspired by
// http://stackoverflow.com/questions/12037655/node-js-mongodb-native-driver-connection-sharing
/*global require, module*/

var async = require('async');
var config = require('app-config').config;
var mongo = require('mongodb');

var log_iface = require('./logger.js');
var logger = log_iface.logger;
onError = log_iface.onError;

function MongoDB() {
    this.host = config.db.host;
    this.port = config.db.port;

    this.serv = new mongo.Server(this.host, this.port, {});

	this.userAuth = null;
    this.db_conns = {};
}

// Authenticate User against admin database
MongoDB.prototype.authenticateUser = function(err, username, password, callback) {
	var self = this;

	if (err) return callback(err, null);

	// Create a separate admin database connection to avoid
	// constantly switching between auth user and NodeJS
	// user
	if (!self.userAuth)
	{
		var db = new mongo.Db('admin', this.serv, { safe: false });

		// TODO: Merge with code below
		db.open(function(err, db_conn) {
			if (err) return callback(err);

			self.userAuth = db_conn;

			db_conn.on('close', function(err) {
                self.userAuth = null;
            });

			return self.authenticateUser(null, username, password, callback);
		});
	} else {
		logger.log('info', 'Authenticating user: ' + username);

		self.userAuth.authenticate(username, password, function(err) {
			if(err)
				return callback(err);

			callback(null);
		});
	}
};

// Open a database connection and pass it to the callback function
MongoDB.prototype.db_callback = function(err, dbname, callback) {
	if (err) return callback(err, null);

    var self = this;

	// If we already have a connection, return that rather than
	// opening a new connection
    if (self.db_conns[dbname]) {
        return callback(null, self.db_conns[dbname]);
    }

    logger.log('info', 'Opening server ' + self.host + ' : ' + self.port);

    self.serv = new mongo.Server(self.host, self.port, {
        auto_reconnect: true,
    });

    logger.log('info', 'Opening database ' + dbname);
    var db = new mongo.Db(dbname, self.serv, {
        safe: false
    });

	// Attempt to open the database connection
    db.open(function(err, db_conn) {

        if (err) return callback(err, null);

		// Authenticate against the NodeJS database user
        var adminDb = db.admin();

        adminDb.authenticate(config.db.username, config.db.password, function(err) {
			if (err)
				return callback(err, null);

			logger.log('debug', 'Authentication successful');
			logger.log('debug', 'Authorized as ' + config.db.username);
			logger.log('debug', 'DB CONNECTION:' + JSON.stringify(db_conn.serverConfig.auth.toArray()));

            self.db_conns[dbname] = db_conn;

            db_conn.on('close', function(err) {
                logger.log('debug', 'Closing connection to ' + dbname + '. REASON: ' + err);
                delete(self.db_conns[dbname]);
            })

            callback(null, db_conn);
        });
    });

}

MongoDB.prototype.Binary = mongo.Binary;

// TODO: Fix this, if not currently working
MongoDB.prototype.aggregate = function(dbname, coll_name, query) {
    var self = this;

    async.waterfall([

    function(callback) {
        self.coll_callback(dbname, coll_name, callback);
    }, function(err, coll) {
        coll.aggregate(query, callback)
    }], function(err, result) {
        setTimeout(function() {
            return result;
        }, 0);
    });

}

MongoDB.prototype.coll_callback = function(err, dbname, coll_name, callback) {
	if (err) return callback(err, null);

    logger.log('debug', 'Loading collection ' + coll_name);
    this.db_callback(null, dbname, function(err, db_conn) {
        if (err) return callback(err, null);

        db_conn.collection(coll_name, {strict:true}, function(err, coll) {
			if (err) {
				return callback(err, null);
			}

            callback(null, coll);
        });
    });
}

MongoDB.prototype.get_latest = function(err, dbname, coll_name, filter, projection, callback) {
	if (err) return callback(err, null);

	this.coll_callback(null, dbname, coll_name, function(err, coll) {
		if (err) return callback(err, null);

		if (projection != null)
		{
			coll.find(filter, projection).limit(1).sort({timestamp:-1}).toArray(function(err, docs) {
				if (err) return callback(err, null);

				callback(null, docs);
			});
		} else {
			coll.find(filter).limit(1).sort({timestamp:-1}).toArray(function(err, docs) {
				if (err) return callback(err, null);

				callback(null, docs);
			});
		}
	});
};

MongoDB.prototype.filter_coll = function(err, dbname, coll_name, filter, projection, callback) {
	if (err) return callback(err, null);

    this.coll_callback(null, dbname, coll_name, function(err, coll) {
        if (err) return callback(err, null);

		proj_str = JSON.stringify(projection);
		filt_str = JSON.stringify(filter);

		logger.log('debug', 'Filter collection: ' + dbname + '/' + coll_name);
		logger.log('debug', 'FILTER: \"' + filt_str + '\"');
		logger.log('debug', 'PROJECTION: \"' + proj_str + '\"');

		if (projection != null) {
            coll.find(filter, projection).toArray(function(err, docs) {
                if (err) return callback(err, null);

                callback(null, docs);
            });
        } else {
            coll.find(filter).toArray(function(err, docs) {
                if (err) return callback(err, null);

                callback(null, docs);
            });
        }
	});
}

module.exports = MongoDB;

