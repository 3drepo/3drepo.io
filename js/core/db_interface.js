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
var ObjectID = require('mongodb').ObjectID;

var OWNER	= 0;
var GROUP	= 1;
var PUBLIC	= 2;

var READ_BIT	= 4;
var WRITE_BIT	= 2;
var EXECUTE_BIT	= 1;

var responseCodes = require('./response_codes.js');

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
		if(err.value)
			return callback(responseCodes.AUTH_ERROR);

		callback(responseCodes.OK, {username: username});
	});
};


exports.createUser = function(username, password, email, callback) {
	dbConn.dbCallback('admin', function(err, db) {
		if (err.value) return callback(err);

		db.addUser(username, password, function(err, result)
		{
			// TODO: Should move this to db.js
			if (err) return callback(responseCodes.DB_ERROR(err));

			dbConn.collCallback('admin', 'system.users', function(err, coll) {
				if(err.value) return callback(err);

				var selector = { user : username };

				var updateJSON = {
					$set: { "customData.email" : email}
				};

				coll.update(selector, updateJSON, function(err, doc) {
					if (err)
						callback(responseCodes.DB_ERROR(err));
					else
						callback(responseCodes.OK);
				});
			});
		});
	});
};

exports.updateUser = function(username, data, callback) {
	dbConn.dbCallback('admin', function(err, db) {
		if (err.value)
			return callback(err);

		exports.getUserInfo(username, false, function(err, oldCustomData) {
			if(err.value)
				return callback(err);

			var user = { "updateUser" : username };
			var newCustomData = oldCustomData;

			if(data.email)
				newCustomData.email = data.email;

			if(data.firstName)
				newCustomData.firstName = data.firstName;

			if(data.lastName)
				newCustomData.lastName = data.lastName;

			user.customData = newCustomData;

			db.command( user, function(err, result) {
				// TODO: Should move this to db.js
				if (err)
					callback(responseCodes.DB_ERROR(err));
				else
					callback(responseCodes.OK);
			});
		});
	});
};

exports.updatePassword = function(username, passwords, callback) {
	var oldPassword = passwords.oldPassword;
	var newPassword = passwords.newPassword;

	if(!(oldPassword && newPassword))
	{
		return callback(responseCodes.INVALID_INPUTS_TO_PASSWORD_UPDATE);
	}

	this.authenticate(username, oldPassword, function(err) {
		if(err.value)
			return callback(err);

		dbConn.dbCallback('admin', function(err, db) {
			if (err.value)
				return callback(err);

			exports.getUserInfo(username, false, function(err, oldCustomData) {
				if(err.value)
					return callback(err);

				var user = { "updateUser" : username };
				user.pwd = newPassword;
				user.customData = oldCustomData;

				db.command(user, function(err, result) {
					// TODO: Should move this to db.js
					if(err)
						callback(responseCodes.DB_ERROR(err));
					else
						callback(responseCodes.OK);
				});
			});
		});
	});
};

exports.getWayfinderInfo = function(dbName, project, uniqueIDs, callback) {
	if(uniqueIDs) {
		logger.log('debug', 'Getting waypoint information for UIDs ' + JSON.stringify(uniqueIDs));

		var uids = uniqueIDs.map(function(item) { return new ObjectID(item); });
		var filter = {
			_id: {$in : uids}
		};

		logger.log('debug', 'Searching for wayfinding in paths: ' + JSON.stringify(uniqueIDs));

		dbConn.filterColl(dbName, project + ".wayfinder", filter, {}, function(err, docs) {
			if (err.value) return callback(err);

			callback(responseCodes.OK, docs);
		});
	} else {
		logger.log('debug', 'Getting list of all waypoint recordings');

		var projection = {
			user: 1,
			timestamp: 1,
			_id: 1
		};

		dbConn.filterColl(dbName, project + ".wayfinder", {}, projection, function(err, docs) {
			if(err.value) return callback(err);

			callback(responseCodes.OK, docs);
		});
	}
};

exports.storeWayfinderInfo = function(dbName, project, username, sessionID, data, timestamp, callback) {
	logger.log('debug', 'Storing waypoint information for ' + username + ' @ ' + (new Date(timestamp)));

	dbConn.collCallback(dbName, project + ".wayfinder", function(err, coll) {
		if(err.value)
			return callback(err);

		var uniqueID = {
			user: username,
			session: sessionID,
			timestamp: timestamp
		};

		data.user      = username;
		data.session   = sessionID;
		data.timestamp = timestamp;

		coll.update(uniqueID, { $set : data }, {upsert: true}, function(err, count) {
			if (err)
				callback(responseCodes.DB_ERROR(err));

			logger.log('debug', 'Updated ' + count + ' records.');
			callback(responseCodes.OK);
		});
	});
};

exports.getUserDBList = function(username, callback) {
	var resCode = responseCodes.OK;

	if (!username)
		return callback(responseCodes.USERNAME_NOT_SPECIFIED);

	logger.log('debug', 'Getting database list for ' + username);

	var filter = {
		user: username
	};

	this.getUserInfo(username, false, function(err, user) {
		if(err.value)
			return callback(err);

		if(!user)
			return callback(responseCodes.USER_NOT_FOUND);

		callback(responseCodes.OK, user["projects"]);
	});
};

exports.getUserInfo = function(username, getPublic, callback) {
	if(!username)
		return callback(responseCodes.USERNAME_NOT_SPECIFIED);

	logger.log('debug', 'Getting user info for ' + username);

	var filter = {
		user: username
	};

	var projection = {
		customData : 1,
		"customData.firstName" : 1,
		"customData.lastName" : 1,
		"customData.email" : 1
	};

	// Private user information goes here
	if(!getPublic)
		projection["customData.projects"] = 1;

	dbConn.filterColl("admin", "system.users", filter, projection, function(err, coll) {
		if(err.value) return callback(err);

		if (coll[0])
		{
			var user = coll[0]["customData"];

			callback(responseCodes.OK, user);
		}
		else
			callback(responseCodes.USER_NOT_FOUND, null);
	});
};

exports.getAvatar = function(username, callback) {
	if(!username)
		return callback(responseCodes.USER_NOT_SPECIFIED);

	logger.log('debug', 'Getting user avatar for ' + username);

	var filter = {
		user: username
	};

	var projection = {
		"customData" : 1
	};

	dbConn.filterColl("admin", "system.users", filter, projection, function(err, coll) {
		if(err.value)
			return callback(err);

		if (coll[0])
			callback(responseCodes.OK, coll[0]["customData"]["avatar"]);
		else
			callback(responseCodes.USER_NOT_FOUND, null);
	});
};

exports.getProjectInfo = function(account, project, callback) {
	if(!project)
		return callback(responseCodes.PROJECT_NOT_SPECIFIED);

	logger.log('debug', 'Getting project info for ' + account + '/' + project);

	var filter = {
		_id : project
	};

	var projection = {
		groups: 0
	};

	dbConn.filterColl(account, "settings", filter, projection, function(err, coll) {
		if(err.value)
			return callback(err);

		if(coll[0])
		{
			var projectInfo = {
				owner:			coll[0]["owner"],
				desc:			coll[0]["desc"],
				type:			coll[0]["type"],
				permissions:	coll[0]["permissions"],
				properties:		coll[0]["properties"]
			};

			callback(responseCodes.OK, projectInfo);
		} else {
			callback(responseCodes.PROJECT_INFO_NOT_FOUND);
		}

	});
};

exports.getDatabaseGroups = function(account, callback) {

	var filter = {
		db: account
	};

	var projection = {
		user: 1
	};

	logger.log('debug', 'Getting database groups for ' + account);

	dbConn.filterColl("admin", "system.users", filter, projection, function(err, coll) {
		if(err.value)
			return callback(err);

		callback(responseCodes.OK, coll);
	});
};

exports.getProjectUsers = function(account, project, callback) {
	if(!project)
		return callback(responseCodes.PROJECT_NOT_SPECIFIED);

	logger.log('debug', 'Getting project users for ' + account + '/' + project);

	var filter = {
		_id: project
	};

	var projection = {
		users: 1
	};

	var self = this;

	dbConn.filterColl(account, "settings", filter, projection, function(err, users) {
		if(err.value)
			return callback(err);

		self.getDatabaseGroups(account, function(err, groups) {
			if(err.value)
				return callback(err);

			var projectUsers = users[0]["users"].map(function (user) {
				return {
					user: user,
					type: (groups.indexOf(user["user"]) > 0) ? "group" : "user"
				};
			});

			callback(responseCodes.OK, projectUsers);
		});
	});
};

exports.getAccessToProject = function(username, account, project, callback) {
	if (project == null)
		return callback(responseCodes.PROJECT_NOT_SPECIFIED);

	var self = this;

	self.getProjectInfo(account, project, function(err, info) {
		if(err.value)
			return callback(err);

		logger.log("debug", "Checking access for " + username);

		if(username == info["owner"])
			return callback(responseCodes.OK, info["permissions"][OWNER])

		self.getProjectUsers(account, project, function(err, users) {
			if(err.value)
				return callback(err);

			var usernameList = users.map(function(user) { return user["user"]; });

			if (usernameList.indexOf(username) > -1)
			{
				// Valid user or group
				return callback(responseCodes.OK, info["permissions"][GROUP]);
			} else {
				// Must be a public user ?
				return callback(responseCodes.OK, info["permissions"][PUBLIC]);
			}
		});
	});
};

exports.checkPermissionsBit = function(username, account, project, bitMask, callback)
{
	this.getAccessToProject(username, account, project, function(err, permission) {
		if(err.value)
			return callback(err);

		logger.log("debug", "Permission for " + username + " @ " + account + "/" + project + " is " + permission);

		if (permission & bitMask)
		{
			callback(responseCodes.OK);
		} else {
			callback(responseCodes.NOT_AUTHORIZED);
		}
	});
}

exports.hasReadAccessToProject = function(username, account, project, callback) {
	this.checkPermissionsBit(username, account, project, READ_BIT, callback);
};

exports.hasWriteAccessToProject = function(username, account, project, callback) {
	this.checkPermissionsBit(username, account, project, WRITE_BIT, callback);
};

exports.hasExecuteAccessToProject = function(username, account, project, callback) {
	this.checkPermissionsBit(username, account, project, EXECUTE_BIT, callback);
};

exports.getDBList = function(callback) {
	logger.log('debug', 'Getting list of databases');

	dbConn.dbCallback('admin', function(err, db) {
		if (err.value)
			return callback(err);

		db.admin().listDatabases(function(err, dbs) {
			if (err.value)
				return callback(err);

			var dbList = [];

			for (var i in dbs.databases)
				dbList.push({ name: dbs.databases[i].name});

			dbList.sort();

			callback(responseCodes.OK, dbList);
		});
	});
};

exports.getChildren = function(dbName, project, uuid, callback) {
	var filter = {
		parents : stringToUUID(uuid),
		type: {$in : ['mesh', 'transformation', 'ref', 'map']}
	};

	dbConn.filterColl(dbName, project + '.scene', filter, null, function(err, doc) {
		if (err.value) return callback(err);

		callback(responseCodes.OK, doc);
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
		if (err.value)
			return callback(err);

		getFunc(dbName, project, uuidToString(doc[0]["_id"]), function(err, doc) {
			if(err.value)
				return callback(err);

			callback(responseCodes.OK, doc);
		});
	});
};

exports.getRevisionInfo = function(dbName, project, rid, callback) {
	var filter = {
		_id: stringToUUID(rid)
	};

	dbConn.filterColl(dbName, project + '.history', filter, null, function(err, doc) {
		if (err.value)
			return callback(err);

		if (!doc.length)
			return callback(responseCodes.PROJECT_HISTORY_NOT_FOUND);

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

		callback(responseCodes.OK, rev);
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
			if(err.value)
				return callback(err);

			if (!readme.length)
				callback(responseCodes.OK, {readme: "Readme Missing"});
			else
				callback(responseCodes.OK, {readme : readme[0]["metadata"]["text"]});
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
		if (err.value)
			return callback(err);

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

		callback(responseCodes.OK, revisionList);
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
			if (err.value)
				return callback(err);

			var branchList = [];

			for (var i in doc)
			{
				var branchName = uuidToString(doc[i].shared_id);

				if (branchList.map(function (e) { return e.name; }).indexOf(branchName) == -1)
					branchList.push({ name: uuidToString(doc[i].shared_id)});
			}

			callback(responseCodes.OK, branchList);
	});

};

exports.getMetadata = function(dbName, project, uuid, callback) {
	var filter = {
		parents: stringToUUID(uuid),
		type: 'meta'
		//subtype: {$not: "readme"}
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
		callback(responseCodes.OK, doc);
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
			if(err.value)
				return callback(err);

			callback(responseCodes.OK, doc[0]["type"], uid, repoGraphScene.decode(doc))
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
				if (err.value) return callback(err);

				callback(responseCodes.OK, obj[0]["type"], this.stringToUUID(obj[0]["_id"]), repoGraphScene.decode(obj));
			});

		});
	} else {
		return callback(responseCodes.RID_SID_OR_UID_NOT_SPECIFIED, null, null);
	}
}

exports.getScene = function(dbName, project, revision, full, callback) {
	var historyQuery = null;

	if (revision != null)
	{
		historyQuery = {
			_id: stringToUUID(revision)
		};
	}

	dbConn.getLatest(dbName, project + '.history', historyQuery, null, function(err, docs)
	{
		if(err.value) return callback(err);

		if (!full)
		{
			var projection = {
				vertices: 0,
				normals: 0,
				faces: 0,
				data: 0,
				uv_channels: 0
			};
		} else {
			var projection = {};
		}

		var query = {
			_id: { $in: docs[0]['current'] }
		};

		dbConn.filterColl(dbName, project + '.scene', query, projection, function(err, coll) {
			if (err.value) return callback(err);

			callback(responseCodes.OK, repoGraphScene.decode(coll));
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
		if (err.value) return callback(err);

		callback(responseCodes.OK, coll);
	});

};

exports.uuidToString = uuidToString;
exports.dbConn		 = dbConn;
