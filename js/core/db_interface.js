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

var dbConn_js = require('./db.js');
var async = require('async');
var dbConn = new dbConn_js();
var repoGraphScene = require('./repoGraphScene.js');
var uuid = require('node-uuid');
var log_iface = require('./logger.js');
var logger = log_iface.logger;

function stringToUUID(id) {
	var bytes = uuid.parse(id);
	var buf = new Buffer(bytes);
	return dbConn.Binary(buf, 3);
}

function uuidToString(uuidIn) {
	return uuid.unparse(uuidIn.buffer);
}

var rootUUID = stringToUUID("00000000-0000-0000-0000-000000000000");

/*******************************************************************************
 /* Authenticate user against the database
 * @param {Error} err - Error object
 * @param {RepoNodeMesh} mesh - The RepoNodeMesh object containing the mesh
 * @param {string} tex_uuid - A string representing the tex_uuid attached to the mesh
 * @param {boolean} embedded_texture - Determines whether or not the texture data is embedded in the SRC.
 * @param {Object} res - The http response object
 *******************************************************************************/
exports.authenticate = function(username, password, callback) {
	dbConn.authenticateUser(username, password, function(err)
	{
		if(err)
			return callback(new Error("Authentication Error"));

		callback(null, {username: username});
	});
}

exports.getUserDBList = function(username, callback) {
	if (!username) return callback(new Error("Username is not defined"), null);

	var filter = {
		user: username
	};

	this.getUserInfo(username, function(err, user) {
		callback(null, user["projects"].map(
				function(proj){
					return proj;
				}
			)
		);
	});
}

exports.getUserInfo = function(username, callback) {
	if(!username) return callback(new Error("Unspecified username"));

	var filter = {
		user: username
	};

	var projection = {
		customData : 1
	};

	dbConn.filterColl("admin", "system.users", filter, projection, function(err, coll) {
		if(err) return callback(err);

		callback(null, coll[0]["customData"]);
	});
}


exports.hasAccessToProject = function(username, account, project, callback) {
	if (project == null)
		return callback(null);

	this.getUserDBList(username, function(err, dbList) {
		if(dbList.map( function (db)
		{
			return db["account"] + "." + db["project"]
		}).indexOf(account + "." + project) > -1)
			callback(null);
		else
			callback(new Error("Not Authorized to access database"));
	});

}

exports.getDBList = function(callback) {
	dbConn.dbCallback('admin', function(err, db) {
		if (err) return callback(err);

		db.admin().listDatabases(function(err, dbs) {
			if (err) return callback(err);

			var dbList = [];

			for (var i in dbs.databases)
				dbList.push({ name: dbs.databases[i].name});

			dbList.sort();

			callback(null, dbList);
		});
	});
}

exports.getChildren = function(dbName, uuid, callback) {
	var filter = {
		parents : stringToUUID(uuid),
		type: {$in : ['mesh', 'transformation', 'ref']}
	};

	dbConn.filterColl(dbName, 'scene', filter, null, function(err, doc) {
		if (err) return callback(err);

		callback(null, doc);
	});
};

exports.getRevisions = function(dbName, branch, callback) {

	var filter = {
		type: "revision"
	};

	if(branch)
		if (branch == "root")
			filter["shared_id"] = rootUUID;
		else
			filter["shared_id"] = stringToUUID(branch);

	var projection = {
		_id : 1
	};

	dbConn.filterColl(dbName, 'history', filter, projection, function(err, doc) {
			if (err) return callback(err);

			var revisionList = [];

			for (var i in doc)
			{
				var revisionName = uuidToString(doc[i]._id);
				revisionList.push({name : revisionName});
			}

			callback(null, revisionList);
	});

};

exports.getBranches = function(dbName, callback) {
	var filter = {
		type: "revision"
	};

	var projection = {
		shared_id : 1
	};

	dbConn.filterColl(dbName, 'history', filter, projection, function(err, doc) {
			if (err) return callback(err);

			var branchList = [];

			for (var i in doc)
			{
				var branchName = uuidToString(doc[i].shared_id);

				if (branchList.map(function (e) { return e.name; }).indexOf(branchName) == -1)
					branchList.push({ name: uuidToString(doc[i].shared_id)});
			}

			callback(null, branchList);
	});

};

exports.getMetadata = function(dbName, uuid, callback) {
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

	dbConn.filterColl(dbName, 'scene', filter, projection, function(err, doc) {
		callback(null, doc);
	});
};

exports.getObject = function(project, uid, rid, sid, callback) {
	logger.log('debug', 'Requesting object (U, R, S) (' + uid + ',' + rid + ',' + sid + ')');

	if (uid)
	{
		var query = {
			_id: stringToUUID(uid)
		};

		dbConn.filterColl(project, 'scene', query, null, function(err,doc) {
			if(err) return callback(err);

			callback(null, doc[0]["type"], uid, repoGraphScene.decode(doc))
		});

	} else if (rid && sid) {
		var historyQuery = {
			_id : stringToUUID(rid)
		};

		dbConn.getLatest(project, 'history', historyQuery, null, function(err, doc)
		{
			var query = {
				shared_id : stringToUUID(sid),
				_id		  : { $in : docs[0]['current']}
			};

			dbConn.filterColl(project, 'scene', query, null, function(err, obj) {
				if (err) return callback(err);

				callback(null, obj[0]["type"], this.stringToUUID(obj[0]["_id"]), repoGraphScene.decode(obj));
			});

		});
	} else {
		return callback(new Error("Not enough information specified"), null, null);
	}
}

exports.getScene = function(project, revision, callback) {
	var historyQuery = null;

	if (revision != null)
	{
		historyQuery = {
			_id: stringToUUID(revision)
		};
	}

	dbConn.getLatest(project, 'history', historyQuery, null, function(err, docs)
	{
		if(err) return callback(err);

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

		dbConn.filterColl(project, 'scene', query, projection, function(err, coll) {
			if (err) return callback(err);

			callback(null, repoGraphScene.decode(coll));
		});
	});

};

exports.getCache = function(project, uid, getData, level, callback) {
	var projection = null;

	if (!getData)
	{
		projection = {
			idx_buf : 0,
			vert_buf : 0
		};
	}

	var filter = {mesh_id : stringToUUID(uid)};

	if (level)
		filter['level'] = parseInt(level);

	dbConn.filterColl(project, "repo.cache", filter, projection, function(err, coll) {
		if (err) return callback(err);

		callback(null, coll);
	});

};

exports.uuidToString = uuidToString;
exports.dbConn		 = dbConn;
