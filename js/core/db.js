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

    this.db_conns = {};
}

MongoDB.prototype.db_callback = function(err, dbname, callback) {
	if (err) return onError(err);

    var self = this;

    if (self.db_conns[dbname]) {
		//logger.log('debug', 'Database Connection: ' + JSON.stringify(self.db_conns[dbname]));
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

    db.open(function(err, db_conn) {

        if (err) return onError(err);

        var adminDb = db.admin();

        adminDb.authenticate(config.db.username, config.db.password, function(err) {
            if (err) {
                console.log(err);
                return;
            }
            logger.log('Database user authenticated', err);

            logger.log('debug', err);

            self.db_conns[dbname] = db_conn;

            db_conn.on('close', function(err) {
                logger.log('debug', 'Closing connection to ' + dbname + '. REASON: ' + err);
                delete(self.db_conns[dbname]);
            })

            return callback(err, db_conn);
        });
    });

}

MongoDB.prototype.Binary = mongo.Binary;

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
	if (err) return onError(err);

    logger.log('debug', 'Loading collection ' + coll_name);

    this.db_callback(null, dbname, function(err, db_conn) {
        if (err) return onError(err);

        db_conn.collection(coll_name, function(err, coll) {
            if (err) return onError(err);

            callback(err, coll);
        })
    })
}

MongoDB.prototype.filter_coll = function(err, dbname, coll_name, filter, projection, callback) {
	if (err) return onError(err);

    this.coll_callback(null, dbname, coll_name, function(err, coll) {
        if (err) return onError(err);

		proj_str = JSON.stringify(projection);
		filt_str = JSON.stringify(filter);

		logger.log('debug', 'Filter collection:\nFILTER: ' + filt_str + '\nPROJECTION: ' + proj_str + '\n');

        if (projection != null) {
            coll.find(filter, projection).toArray(function(err, docs) {
                if (err) return onError(err);

				logger.log('debug', 'Result: ' + JSON.stringify(docs) + '\n');

                callback(err, docs);
            })
        } else {
            coll.find(filter).toArray(function(err, docs) {
                if (err) return onError(err);

				logger.log('debug', 'Result: ' + JSON.stringify(docs) + '\n');

                callback(err, docs);
            })

        }
    })
}

module.exports = MongoDB;

