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

/*global module*/
var db_conn_js = require('./db.js');
var async = require('async');
var db_conn = new db_conn_js();
var repoGraphScene = require('./repoGraphScene.js');
var uuid = require('node-uuid');

function stringToUUID(id) {
    var bytes = uuid.parse(id);
    var buf = new Buffer(bytes);
    return db_conn.Binary(buf, 3);
}

exports.get_db_list = function(func) {
    async.waterfall([

    function(callback) {
        db_conn.run_db_func("admin", callback);
    }, function(db, callback) {
        db.admin(callback);
    }, function(admin_db, callback) {
        admin_db.listDatabases(callback);
    }, function(dbs, callback) {
        callback(null, dbs);
    }], function(err, results) {
        func(results);
    });

}

exports.console_print_name = function(dbs) {
    for (var i = 0; i < dbs.length; i++) {
        console.log(attr[i]['name']);
    }
}

exports.get_texture = function(db_name, uuid, callback) {
    var query = {
        _id : stringToUUID(uuid)
    };

    db_conn.filter_coll(db_name, 'scene', query, null, function(err, coll) {
        if (err) throw err;

        callback(err, repoGraphScene.decode(coll));
    });
};

exports.get_mesh = function(db_name, uuid, pbf, tex_uuid, callback) {

    if (uuid == null) {

        var projection = {
            vertices: 0,
            normals: 0,
            faces: 0,
            data: 0,
            uv_channels: 0
        };
        var query = {};

        if (pbf)
        {   
            projection = null;
        }
    } else {
       /* 
        // First get latest revision for object
        var revision = {};

        var rev_query = [
           {
               $match: {
                   current: uuid
               }
           }, {
               $sort: {
                   timestamp: -1
               }
           }, {
               $group: {
                   _id: {
                       $first: "$_id"
                   },
                   timestamp: {
                       $first: "$timestamp"
                   },
                   current: {
                       $first: "$current"
                   }
               }
           }
        ];
        console.log(db_conn.aggregate(db_name, 'history', query));
*/
        if(pbf)
        {
            callback(err, null);
        }

        var projection = null;

        if (tex_uuid != null)
        {
            var query = {
                $or: [{
                    _id: stringToUUID(uuid)
                }, {
                    _id: stringToUUID(tex_uuid)
                }]
            };
        } else {
            var query = {
                _id: stringToUUID(uuid)
            };

        }
    }

    db_conn.filter_coll(db_name, 'scene', query, projection, function(err, coll) {
        if (err) throw err;

        callback(err, repoGraphScene.decode(coll));
    });

};

