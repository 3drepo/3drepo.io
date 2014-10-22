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

/*
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
*/

exports.get_db_list = function(err, callback) {
	if (err) return onError(err);

    db_conn.db_callback(null, 'admin', function(err, db) {
		if (err) return onError(err);

        var admin_db = db.admin();

        admin_db.listDatabases(function(err, dbs) {
            if (err) return onError(err);

            var db_list = [];

            for (var i in dbs.databases)
                db_list.push({ name: dbs.databases[i].name});

            db_list.sort();

            callback(err, db_list);
        });
    });
}

exports.get_texture = function(err, db_name, uuid, callback) {
	if(err) return onError(err);

    var query = {
        _id: stringToUUID(uuid)
    };

    db_conn.filter_coll(err, db_name, 'scene', query, null, function(err, coll) {
        if (err) return onError(err);

        callback(err, repoGraphScene.decode(coll));
    });
};

exports.get_mesh = function(err, db_name, revision, uuid, pbf, tex_uuid, callback) {
	if (err) return onError(err);

	var history_query = null;

	if (revision != null)
	{
		history_query = {
			_id: stringToUUID(revision)
		};
	}

	db_conn.get_latest(null, db_name, 'history', history_query, null, function(err, docs)
    {
		if (uuid == null) {

			var projection = {
				vertices: 0,
				normals: 0,
				faces: 0,
				data: 0,
				uv_channels: 0
			};

			var query = {
				_id: { $in: docs[0]['current'] }
			};
		} else {
			if (pbf) {
				callback(err, null);
			}

			var projection = null;

			if (tex_uuid != null) {
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

		db_conn.filter_coll(err, db_name, 'scene', query, projection, function(err, coll) {
			if (err) return onError(err);

			callback(err, repoGraphScene.decode(coll));
		});
	});

};

exports.get_cache = function(err, db_name, m_id, get_data, level, callback) {
	if(err) return onError(err);

	var projection = null;

	if (!get_data)
	{
		projection = {
			idx_buf : 0,
			vert_buf : 0
		};
	}

	var filter = {mesh_id : stringToUUID(m_id)};

	if (level)
		filter['level'] = parseInt(level);

    db_conn.filter_coll(err, db_name, "repo.cache", filter, projection, function(err, coll) {
        if (err) return onError(err);

        callback(err, coll);
    });

};

