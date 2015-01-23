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

var masterUUID = stringToUUID("00000000-0000-0000-0000-000000000000");

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
};

exports.createUser = function(username, password, email, callback) {
	dbConn.dbCallback('admin', function(err, db) {
		if (err) return callback(err);

		db.addUser(username, password, function(err, result)
		{
			if(err) return callback(err);

			dbConn.collCallback('admin', 'system.users', function(err, coll) {
				if(err) return callback(err);

				var selector = { user : username };

				var updateJSON = {
					$set: { "customData.email" : email}
				};

				coll.update(selector, updateJSON, function(err, doc) {
					if (err) return callback(err);


				});
			});
		});

		var user = {
			user: username,
			pwd:  password,
			customData: {
				email: email
			},
			roles: []
		};

		db.admin().listDatabases(function(err, dbs) {
			if (err) return callback(err);

			var dbList = [];

			for (var i in dbs.databases)
				dbList.push({ name: dbs.databases[i].name});

			dbList.sort();

			callback(null, dbList);
		});
	});
};

exports.updateUser = function(username, password, email, callback) {
	dbConn.dbCallback('admin', function(err, db) {
		if (err) return callback(err);

		this.getUserInfo(username, function(err, user) {
			var oldCustomData = user;

			user["email"] = email;

			var userInfo = {
				user: username.
				pwd:  password,
				customData: { function(err, user) {}
					email: email
				},
				roles: []
			};

			db.updateUser(
				username,
				userInfo
			);
		});
};

exports.getUserDBList = function(username, callback) {
	if (!username) return callback(new Error("Username is not defined"), null);

	logger.log('debug', 'Getting database list for ' + username);

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
};

exports.getUserInfo = function(username, callback) {
	if(!username) return callback(new Error("Unspecified username"));

	logger.log('debug', 'Getting user info for ' + username);

	var filter = {
		user: username
	};

	var projection = {
		customData : 1
	};

	dbConn.filterColl("admin", "system.users", filter, projection, function(err, coll) {
		if(err) return callback(err);

		if (coll[0])
			callback(null, coll[0]["customData"]);
		else
			callback(null, null);
	});
};

exports.getProjectInfo = function(account, project, callback) {
	if(!project) return callback(new Error("Unspecified project"));

	logger.log('debug', 'Getting project info for ' + account + '/' + project);

	dbConn.filterColl(account, project + ".info", {}, {}, function(err, coll) {
		if(err) return callback(err);

		var res = {
			owner:			coll[0]["owner"],
			desc:			coll[0]["desc"],
			type:			coll[0]["type"],
			read_access:	coll[0]["r"],
			write_access:	coll[0]["rw"]
		};

		callback(null, res);
	});
};

exports.getProjectUsers = function(account, project, callback) {
	if(!project) return callback(new Error("Unspecified project"));

	logger.log('debug', 'Getting project info for ' + account + '/' + project);

	dbConn.filterColl(account, project + ".users", {}, {}, function(err, coll) {
		if(err) return callback(err);

		var res = coll.map( function (user) {
			return {
				name: user.user,
				role: user.role
			};
		});

		callback(null, res);
	});
};

exports.isPublicProject = function(account, project, callback)
{
	this.getProjectInfo(account, project, function (err, proj) {
		console.log(JSON.stringify(proj));
		if (proj["read_access"].toLowerCase() == "public")
		{
			callback(null);
		} else {
			callback(new Error("Not a public project"));
		}
	});
};

exports.hasAccessToProject = function(username, account, project, callback) {
	if (project == null)
		return callback(null);

	logger.log('debug', 'Getting access to ' + account + '/' + project + ' for ' + username);

	this.isPublicProject(account, project, function(err) {
		if(err)
		{
			this.dbInterface.getUserDBList(username, function(err, dbList) {
				var dbListStr = dbList.map (function (db) {
					return db["account"] + "." + db["project"];
				});

				if (dbListStr.indexOf(account + "." + project) > -1)
					callback(null);
				else
					callback(new Error("Not Authorized to access database"));
			});
		} else {
			callback(null);
		}
	});
};

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
};

exports.getChildren = function(dbName, project, uuid, callback) {
	var filter = {
		parents : stringToUUID(uuid),
		type: {$in : ['mesh', 'transformation', 'ref']}
	};

	dbConn.filterColl(dbName, project + '.scene', filter, null, function(err, doc) {
		if (err) return callback(err);

		callback(null, doc);
	});
};

exports.getHeadOf = function(dbName, project, branch, getFunc, callback) {
	if (branch == 'master')
		var branch_id = masterUUID;
	else
		var branch_id = stringToUUID(branch);

	var historyQuery = {
		shared_id : branch_id
	};

	var self = this;

	dbConn.getLatest(dbName, project + '.history', historyQuery, null, function(err, doc) {
		if (err) return callback(err);

		console.log("DOC" + JSON.stringify(doc[0]));

		getFunc(dbName, project, uuidToString(doc[0]["_id"]), function(err, doc) {
			if(err) return callback(err);

			callback(null, doc);
		});
	});
};

exports.getRevisionInfo = function(dbName, project, rid, callback) {
	var filter = {
		_id: stringToUUID(rid)
	};

	dbConn.filterColl(dbName, project + '.history', filter, null, function(err, doc) {
		if (err) return callback(err);

		doc = doc[0];

		rev = {};

		rev.name    = uuidToString(doc["_id"]); // TODO: Input real name
		rev.author  = ("author" in doc) ? doc.author : "unnamed";
		rev.message = ("message" in doc) ? doc.message : "";
		rev.tag     = ("tag" in doc) ? doc.tag : "";
		rev.branch  = uuidToString(doc["shared_id"]);

		if ("timestamp" in doc)
		{
			var timestampDate = new Date(doc.timestamp);

			rev.timestamp = timestampDate.toString();
		} else {
			rev.timestamp = "Unknown";
		}

		callback(null, rev);
	});
};

exports.getReadme = function(dbName, project, rid, callback) {
	var historyQuery = {
		_id : stringToUUID(rid)
	};

	dbConn.filterColl(dbName, project + '.history', historyQuery, null, function(err, doc)
	{
		var query = {
			type:    "meta",
			subtype: "readme",
			_id		  : { $in : doc[0]['current']}
		};

		dbConn.filterColl(dbName, project + '.scene', query, null, function(err, readme) {
			if(err) return callback(err);

			callback(null, {readme : readme[0]["metadata"]["text"]});
		});
	});
};

exports.getRevisions = function(dbName, project, branch, from, to, full, callback) {

	var filter = {
		type: "revision"
	};

	if(branch)
		if (branch == "master")
			filter["shared_id"] = masterUUID;
		else
			filter["shared_id"] = stringToUUID(branch);

	var projection = null;

	if (from && to)
	{
		var projection = {
			_id : { $slice: [from, (to - from + 1)]}
		};
	}

	if (!full)
	{
		if(!projection)
			projection = {};

		projection._id = 1;
	}

	dbConn.filterColl(dbName, project + '.history', filter, projection, function(err, doc) {
		if (err) return callback(err);

		var revisionList = [];

		for (var i in doc)
		{
			var revisionName = uuidToString(doc[i]._id);
			var rev = {};

			rev.name = revisionName;

			if (full) {
				if ("author" in doc[i])		rev.author = doc[i].author;
				if ("timestamp" in doc[i])	rev.timestamp = doc[i].timestamp;
				if ("message" in doc[i])	rev.message = doc[i].message;
				if ("branch" in doc[i])		rev.branch = uuidToString(doc[i].shared_id);
			}

			revisionList.push(rev);
		}

		callback(null, revisionList);
	});
};

exports.getBranches = function(dbName, project, callback) {
	var filter = {
		type: "revision"
	};

	var projection = {
		shared_id : 1
	};

	dbConn.filterColl(dbName, project + '.history', filter, projection, function(err, doc) {
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

	dbConn.filterColl(dbName, project + '.scene', filter, projection, function(err, doc) {
		callback(null, doc);
	});
};

exports.getObject = function(dbName, project, uid, rid, sid, callback) {
	logger.log('debug', 'Requesting object (U, R, S) (' + uid + ',' + rid + ',' + sid + ')');

	if (uid)
	{
		var query = {
			_id: stringToUUID(uid)
		};

		dbConn.filterColl(dbName, project + '.scene', query, null, function(err,doc) {
			if(err) return callback(err);

			callback(null, doc[0]["type"], uid, repoGraphScene.decode(doc))
		});

	} else if (rid && sid) {
		var historyQuery = {
			_id : stringToUUID(rid)
		};

		dbConn.filterColl(dbName, project + '.history', historyQuery, null, function(err, doc)
		{
			var query = {
				shared_id : stringToUUID(sid),
				_id		  : { $in : docs[0]['current']}
			};

			dbConn.filterColl(dbName, project + '.scene', query, null, function(err, obj) {
				if (err) return callback(err);

				callback(null, obj[0]["type"], this.stringToUUID(obj[0]["_id"]), repoGraphScene.decode(obj));
			});

		});
	} else {
		return callback(new Error("Not enough information specified"), null, null);
	}
}

exports.getScene = function(dbName, project, revision, callback) {
	var historyQuery = null;

	if (revision != null)
	{
		historyQuery = {
			_id: stringToUUID(revision)
		};
	}

	dbConn.getLatest(dbName, project + '.history', historyQuery, null, function(err, docs)
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

		dbConn.filterColl(dbName, project + '.scene', query, projection, function(err, coll) {
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
