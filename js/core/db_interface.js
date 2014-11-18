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

function uuidToString(uuidIn) {
	return uuid.unparse(uuidIn.buffer);
}

exports.authenticate = function(err, username, password, callback) {
	db_conn.authenticateUser(null, username, password, function(err)
	{
		if(err) 
			return callback(new Error("Authentication Error"), null);
		
		callback(null, {username: username});
	});
}

exports.getUserDBList = function(err, username, callback) {
	if (err) return callback(err, null);
	if (!username) return callback(new Error("Username is not defined"), null);

	var filter = {
		user: username
	};

	this.getUserInfo(err, username, function(err, user) {
		if (err) return callback(err, null);

		callback(null, user["projects"].map(
				function(nm){
					return {name:nm};
				}
			)
		);
	});
}

exports.getUserInfo = function(err, username, callback) {
	if (err) return callback(err, null);
	if(!username) return callback(new Error("Unspecified username"), null);

	var filter = {
		user: username
	};

	var projection = {
		customData : 1
	};

	db_conn.filter_coll(err, "admin", "system.users", filter, {}, function(err, coll) {
		if(err) return callback(err, null);

		callback(null, coll[0]["customData"]);
	});
}

exports.hasAccessToDB = function(err, username, dbName, callback) {
	if (err) return callback(err);

	if (dbName == null)
		return callback(null);

	this.getUserDBList(null, username, function(err, dbList) {
		var dbNameList = dbList.map(function(elem) { return elem.name; });
	
		if(dbNameList.inArray(dbName) > -1)
			callback(null);
		else
			callback(new Error("Not Authorized to access database"));
	});

}

exports.get_db_list = function(err, callback) {
	if (err) return callback(err, null);

    db_conn.db_callback(null, 'admin', function(err, db) {
		if (err) return callback(err, null);

        db.admin().listDatabases(function(err, dbs) {
            if (err) return callback(err, null);

            var db_list = [];

            for (var i in dbs.databases)
                db_list.push({ name: dbs.databases[i].name});

            db_list.sort();

            callback(null, db_list);
        });
    });
}

exports.get_texture = function(err, db_name, uuid, callback) {
	if(err) return callback(err, null);

    var query = {
        _id: stringToUUID(uuid)
    };

    db_conn.filter_coll(err, db_name, 'scene', query, null, function(err, coll) {
        if (err) return callback(err, null);

        callback(null, repoGraphScene.decode(coll));
    });
};

exports.get_children = function(err, db_name, uuid, callback) {
	if (err) return callback(err, null);

	var filter = {
		parents : stringToUUID(uuid),
		type: {$in : ['mesh', 'transformation', 'ref']}
	};

	db_conn.filter_coll(err, db_name, 'scene', filter, null, function(err, doc) {
		if (err) return callback(err, null);

		callback(null, doc);	
	});
};

exports.get_metadata = function(err, db_name, uuid, callback) {
	if (err) return callback(err, null);

	var filter = {
		parents: stringToUUID(uuid),
		type: 'meta'
	};

	var projection = {
		_id: 0,
		shared_id: 0,
		paths: 0,
		type: 0,
		api: 0,
		parents: 0
	};

	db_conn.filter_coll(err, db_name, 'scene', filter, projection, function(err, doc) {
		if(err) return callback(err, null);
		
		callback(null, doc);
	});
};

exports.get_mesh = function(err, db_name, revision, sid, pbf, tex_uuid, callback) {
	if (err) return callback(err, null);

	var history_query = null;

	if (revision != null)
	{
		history_query = {
			_id: stringToUUID(revision)
		};
	}

	db_conn.get_latest(null, db_name, 'history', history_query, null, function(err, docs)
    {
		if(err) return callback(err, null);

		if (sid == null) {

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
			if (pbf) return callback(new Error("PBF currently unsupported"), null);

			var projection = null;

			if (tex_uuid != null) {
				var query = {
					$or: [{
						shared_id: stringToUUID(sid)
					}, {
						_id: stringToUUID(tex_uuid)
					}]
				};
			} else {
				var query = {
					shared_id: stringToUUID(sid)
				};
			}
		}

		db_conn.filter_coll(err, db_name, 'scene', query, projection, function(err, coll) {
			if (err) return callback(err, null);

			callback(null, repoGraphScene.decode(coll));
		});
	});

};

exports.get_cache = function(err, db_name, m_id, get_data, level, callback) {
	if(err) return callback(err, null);

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
        if (err) return callback(err, null);

        callback(null, coll);
    });

};

exports.uuidToString = uuidToString;
