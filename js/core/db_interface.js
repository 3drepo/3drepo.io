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
var C = require('./constants');

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
var self = exports;

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
			return callback(err);

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

			dbConn.collCallback('admin', 'system.users', true, function(err, coll) {
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

	dbConn.collCallback(dbName, project + ".wayfinder", false, function(err, coll) {
		if(err.value)
			return callback(err);

		var uniqueID = {
			user: username,
			session: sessionID,
			timestamp: timestamp
		};

		var dataObj = {};
		dataObj.user      = username;
		dataObj.session   = sessionID;
		dataObj.timestamp = timestamp;

		for(var idx = 0; idx < data["waypoints"].length; idx++)
		{
			var waypointIdx = data["waypoints"][idx]["idx"];

			dataObj[waypointIdx]			= {};
			dataObj[waypointIdx]["dir"]		= data["waypoints"][idx]["dir"];
			dataObj[waypointIdx]["pos"]		= data["waypoints"][idx]["pos"];
			dataObj[waypointIdx]["time"]	= data["waypoints"][idx]["time"];
		}

		coll.update(uniqueID, { $set : dataObj }, {upsert: true}, function(err, count) {
			if (err) return callback(responseCodes.DB_ERROR(err));

			logger.log('debug', 'Updated ' + count + ' records.');
			callback(responseCodes.OK);
		});
	});
};

// TODO: Remove this, as it shouldn't exist
exports.addToCurrentList = function(dbName, project, branch, objUUID, callback) {
	self.getHeadUUID(dbName, project, branch, function(err, uuid) {
		dbConn.collCallback(dbName, project + '.history', true, function(err, coll) {
			if(err.value) return callback(err);

			var uniqueID = {
				"_id" : uuid.uuid
			};

			coll.update(uniqueID, { $push: {"current" : objUUID} }, {}, function(err, count) {
				if (err) return callback(responseCodes.DB_ERROR(err));

				logger.log('debug', 'Adding ' + uuidToString(objUUID) + ' to current list of ' + uuidToString(uuid.uuid));

				callback(responseCodes.OK);
			});
		});
	});
}

exports.storeViewpoint = function(dbName, project, branch, username, parentSharedID, data, callback) {
	data._id = uuid.v1();

	if (!data.shared_id)
		data.shared_id = uuid.v1();

	logger.log('debug', 'Storing camera ' + data.name + ' for (U,S) => (' + data.shared_id + ',' + data._id + ') @ ' + parentSharedID);

	data._id =			stringToUUID(data._id);
	data.shared_id =	stringToUUID(data.shared_id);

	data.type	= "camera";
	data.api	= "1";

	data.parents = [stringToUUID(parentSharedID)];

	dbConn.collCallback(dbName, project + ".scene", true, function(err, coll) {
		if(err.value) return callback(err);

		var uniqueID = {
			"_id" : data._id
		};

		coll.update(uniqueID, { $set : data }, { upsert: true }, function(err, count) {
			if(err) return callback(responseCodes.DB_ERROR(err));

			logger.log('debug', 'Updated ' + count + ' records.');

			self.addToCurrentList(dbName, project, branch, data._id, function (err) {
				if (err.value) return callback(err);

				callback(responseCodes.OK);
			});
		});
	});
}

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

			if(!users.length)
				return callback(responseCodes.SETTINGS_ERROR);

			if(!users[0]["users"] || !users[0]["users"].length)
				return callback(responseCodes.OK, []);

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

		if(username == info["owner"]) {
			logger.log("debug", username + " has owner permissions");
			return callback(responseCodes.OK, info["permissions"][OWNER])
		}

		self.getProjectUsers(account, project, function(err, users) {
			if(err.value)
				return callback(err);

			var usernameList = users.map(function(user) { return user["user"]; });

			logger.log("debug", project + " has the following users " + JSON.stringify(usernameList));

			if (usernameList.indexOf(username) > -1)
			{
				// Valid user or group
				logger.log("debug", username + " has group permissions");
				return callback(responseCodes.OK, info["permissions"][GROUP]);
			} else {
				// Must be a public user ?
				logger.log("debug", username + " has public permissions");
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
	self.checkPermissionsBit(username, account, project, READ_BIT, callback);
};

exports.hasWriteAccessToProject = function(username, account, project, callback) {
	self.checkPermissionsBit(username, account, project, WRITE_BIT, callback);
};

exports.hasExecuteAccessToProject = function(username, account, project, callback) {
	self.checkPermissionsBit(username, account, project, EXECUTE_BIT, callback);
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

exports.getRootNode = function(dbName, project, branch, revision, callback) {
	var historyQuery = null;

	if (revision != null)
	{
		historyQuery = {
			_id: stringToUUID(revision)
		};
	} else {
		if (branch == 'master')
			var branch_id = masterUUID;
		else
			var branch_id = stringToUUID(branch);

		historyQuery = {
			shared_id:	branch_id
		};
	}

	dbConn.getLatest(dbName, project + '.history', historyQuery, null, function(err, docs)
	{
		var filter = {
			parents : {"$exists" : false},
			_id: {$in: docs[0]['current']}
		};

		dbConn.filterColl(dbName, project + '.scene', filter, null, function(err, doc) {
			if (err.value) return callback(err);

			if (!doc.length)
				return callback(responseCodes.ROOT_NODE_NOT_FOUND);

			callback(responseCodes.OK, doc[0]);
		});
	});
};

exports.getChildren = function(dbName, project, branch, revision, uuid, callback) {
	var historyQuery = null;

	if (revision != null)
	{
		historyQuery = {
			_id: stringToUUID(revision)
		};
	} else {
		if (branch == 'master')
			var branch_id = masterUUID;
		else
			var branch_id = stringToUUID(branch);

		historyQuery = {
			shared_id:	branch_id
		};
	}

	dbConn.getLatest(dbName, project + '.history', historyQuery, null, function(err, docs)
	{
		var filter = {
			parents : stringToUUID(uuid),
			type: {$in : ['mesh', 'transformation', 'ref', 'map']},
			_id: {$in: docs[0]['current']}
		};

		dbConn.filterColl(dbName, project + '.scene', filter, null, function(err, doc) {
			if (err.value) return callback(err);

			callback(responseCodes.OK, doc);
		});
	});
};

exports.getUIDMap = function(dbName, project, uids, callback) {
	var uids = uids.map(function(uid) { return stringToUUID(uid); })

	var query = {
		_id: {$in : uids}
	};

	var projection = {
		shared_id : 1
	};

	dbConn.filterColl(dbName, project + '.scene', query, projection, function(err, doc) {
		if (err.value) return callback(err);

		var UIDMap = {};

		for (var i = 0; i < doc.length; i++)
			UIDMap[uuidToString(doc[i]["_id"])] = uuidToString(doc[i]["shared_id"]);

		callback(responseCodes.OK, UIDMap);
	});
};

exports.getSIDMap = function(dbName, project, branch, revision, callback) {
	var historyQuery = null;

	if (revision != null)
	{
		historyQuery = {
			_id: stringToUUID(revision)
		};
	} else {
		if (branch == 'master')
			var branch_id = masterUUID;
		else
			var branch_id = stringToUUID(branch);

		historyQuery = {
			shared_id:	branch_id
		};
	}

	dbConn.getLatest(dbName, project + '.history', historyQuery, null, function(err, docs)
	{
		var filter = {
			_id: {$in: docs[0]['current']}
		};

		var projection = {
			_id : 1,
			shared_id : 1
		};

		dbConn.filterColl(dbName, project + '.scene', filter, projection, function(err, doc) {
			if (err.value) return callback(err);

			var SIDMap = {};

			for(var i = 0; i < doc.length; i++)
				SIDMap[uuidToString(doc[i]["shared_id"])] = uuidToString(doc[i]["_id"]);

			callback(responseCodes.OK, SIDMap);
		});
	});
};



exports.getHeadRevision = function(dbName, project, branch, callback) {
	if (branch == 'master')
		var branch_id = masterUUID;
	else
		var branch_id = stringToUUID(branch);

	var historyQuery = {
		shared_id : branch_id
	};

	var self = this;

	dbConn.getLatest(dbName, project + '.history', historyQuery, null, function(err, doc) {
		if (err.value) return callback(err);

		callback(responseCodes.OK, doc);
	});
}

exports.getHeadUUID = function(dbName, project, branch, callback) {
	self.getHeadRevision(dbName, project, branch, function(err, doc) {
		if (err.value)
			return callback(err);

		callback(responseCodes.OK, {"uuid" : doc[0]["_id"], "sid" : doc[0]["shared_id"]});
	});
}

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

		if (!doc.length)
			return callback(responseCodes.PROJECT_HISTORY_NOT_FOUND);

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

		rev.revision	= uuidToString(doc["_id"]); // TODO: Input real name
		rev.author		= ("author" in doc) ? doc.author : "unnamed";
		rev.message		= ("message" in doc) ? doc.message : "";
		rev.tag			= ("tag" in doc) ? doc.tag : "";
		rev.branch		= uuidToString(doc["shared_id"]);

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
		if(!doc[0])
			return callback(responseCodes.PROJECT_HISTORY_NOT_FOUND);

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

exports.getFederatedProjectList = function(dbName, project, branch, revision, callback) {

	var historyQuery = null;

	if (revision != null)
	{
		historyQuery = {
			_id: stringToUUID(revision)
		};
	} else {
		if (branch == 'master')
			var branch_id = masterUUID;
		else
			var branch_id = stringToUUID(branch);

		historyQuery = {
			shared_id:	branch_id
		};
	}

	dbConn.getLatest(dbName, project + '.history', historyQuery, null, function(err, docs)
	{
		if (!docs.length)
			return callback(responseCodes.HISTORY_NOT_FOUND);

		var filter = {
			parents: stringToUUID(sid),
			type: 'ref',
			_id: { $in: docs[0]['current']}
		};

		dbConn.filterColl(dbName, project + '.scene', filter, {}, function(err, refs) {
			async.concat(refs, function (item, iter_callback) {
				var childDbName  = item["owner"];
				var childProject = item["project"];

				var unique = ("unique" in item) ? item["unique"] : false;

				if (unique)
				{
					var childRevision = uuidToString(item["_rid"]);
					var childBranch   = null;
				} else {
					var childRevision = null;
					var childBranch   = uuidToString(item["_rid"]);
				}

				self.getFederatedProjectList(childDbName, childProject, childBranch, childRevision, function (err, refs) {
					if (err.value) iter_callback(err);

					iter_callback(null, refs);
				});
			},
			function (err, results) {
				if (err.value) callback(err);

				callback(null, results);
			});
		});
	});
}

exports.getProjectIssues = function(dbName, project, sid, callback) {

	if (sid)
	{
		var filter = {
			parent : stringToUUID(sid)
		};
	} else {
		var filter = {}
	};

	dbConn.filterColl(dbName, project + '.issues', filter, {}, function (err, docs) {
		if (err.value) return callback(err);

		for(var i = 0; i < docs.length; i++) {
			docs[i]["_id"] = uuidToString(docs[i]["_id"]);
			docs[i]["parent"] = uuidToString(docs[i]["parent"]);
		}

		return callback(responseCodes.OK, docs);
	});
}

exports.storeIssue = function(dbName, project, sid, owner, data, callback) {
	dbConn.collCallback(dbName, project + ".issues", false, function(err, coll) {
		if(err.value)
			return callback(err);

		if (!data._id) {
			var newID = uuid.v1();

			logger.log('debug', 'Creating new issue ' + newID);

			// TODO: Implement this using sequence counters
			coll.count(function(err, numIssues) {
				if (err) return responseCodes.DB_ERROR(err);

				// This is a new issue
				data._id = stringToUUID(newID);
				data.parent = stringToUUID(sid);
				data.number = numIssues + 1;

				if (!data.name)
					data.name = 'Issue' + data.number;

				data.owner = owner;

				coll.insert(data, function(err, count) {
					if (err) return callback(responseCodes.DB_ERROR(err));

					logger.log('debug', 'Updated ' + count + ' records.');
					callback(responseCodes.OK);
				});
			});
		} else {
			logger.log('debug', 'Updating issue ' + data._id);

			data._id = stringToUUID(data._id);

			if (data.comment)
			{
				var updateQuery = {
					$push: { comments: { author: owner,  text: data.comment} }
				};
			} else {
				var updateQuery = {
					$set: { complete: data.complete }
				};
			}

			coll.update({ _id : data._id}, updateQuery, function(err, count) {
				if (err) return callback(responseCodes.DB_ERROR(err));

				logger.log('debug', 'Updated ' + count + ' records.');
				callback(responseCodes.OK);
			});
		}
	});
}

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

exports.getMetadata = function(dbName, project, branch, revision, sid, uid, callback) {

	var historyQuery = null;

	if (!uid)
	{
		if (revision != null)
		{
			historyQuery = {
				_id: stringToUUID(revision)
			};
		} else {
			if (branch == 'master')
				var branch_id = masterUUID;
			else
				var branch_id = stringToUUID(branch);

			historyQuery = {
				shared_id:	branch_id
			};
		}

		dbConn.getLatest(dbName, project + '.history', historyQuery, null, function(err, docs)
		{
			if (!docs.length)
				return callback(responseCodes.HISTORY_NOT_FOUND);

			var filter = {
				parents: stringToUUID(sid),
				type: 'meta',
				_id: { $in: docs[0]['current']}
			};

			var projection = {
				shared_id: 0,
				paths: 0,
				type: 0,
				api: 0,
				parents: 0
			};

			dbConn.filterColl(dbName, project + '.scene', filter, projection, function(err, metadocs) {
				if (err.value) return callback(err);

				for(var i = 0; i < metadocs.length; i++)
					metadocs[i]["_id"] = uuidToString(metadocs[i]["_id"]);

				callback(responseCodes.OK, metadocs);
			});
		});
	} else {
		var objQuery = {
			_id: stringToUUID(uid)
		};

		var projection = {
			shared_id : 1
		};

		dbConn.filterColl(dbName, project + '.scene', objQuery, null, function(err, obj) {
			if (err.value) return callback(err);

			if (!obj.length)
				return callback(responseCodes.OBJECT_NOT_FOUND);

			if (err.value) return callback(err);

			var filter = {
				parents: obj[0]["shared_id"],
				type: 'meta'
			};

			var projection = {
				shared_id: 0,
				paths: 0,
				type: 0,
				api: 0,
				parents: 0
			};

			dbConn.filterColl(dbName, project + '.scene', filter, projection, function(err, metadocs) {
				if (err.value) return callback(err);

				for(var i = 0; i < metadocs.length; i++)
					metadocs[i]["_id"] = uuidToString(metadocs[i]["_id"]);

				callback(responseCodes.OK, metadocs);
			});
		});
	}
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

		dbConn.filterColl(dbName, project + '.history', historyQuery, null, function(err, docs)
		{
			if(err.value)
				return callback(err);

			if(!docs.length)
				return callback(responseCodes.PROJECT_HISTORY_NOT_FOUND);

			var query = {
				shared_id : stringToUUID(sid),
				_id		  : { $in : docs[0]['current']}
			};

			dbConn.filterColl(dbName, project + '.scene', query, null, function(err, obj) {
				if (err.value) return callback(err);

				if (!obj.length)
					return callback(responseCodes.OBJECT_NOT_FOUND);

				return callback(responseCodes.OK, obj[0]["type"], uuidToString(obj[0]["_id"]), repoGraphScene.decode(obj));
			});

		});
	} else {
		return callback(responseCodes.RID_SID_OR_UID_NOT_SPECIFIED, null, null);
	}
}

exports.getScene = function(dbName, project, branch, revision, full, callback) {
	var historyQuery = null;

	if (revision != null)
	{
		historyQuery = {
			_id: stringToUUID(revision)
		};
	} else {
		if (branch == 'master')
			var branch_id = masterUUID;
		else
			var branch_id = stringToUUID(branch);

		historyQuery = {
			shared_id:	branch_id
		};
	}

	dbConn.getLatest(dbName, project + '.history', historyQuery, null, function(err, docs)
	{
		if(err.value) return callback(err);

		if(!docs[0])
			return callback(responseCodes.BRANCH_NOT_FOUND);

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

exports.getDiff = function(account, project, branch, revision, otherbranch, otherrevision, callback) {
	var historyQuery = null;

	if (revision != null)
	{
		historyQuery = {
			_id: stringToUUID(revision)
		};
	} else {
		if (branch == 'master')
			var branch_id = masterUUID;
		else
			var branch_id = stringToUUID(branch);

		historyQuery = {
			shared_id:	branch_id
		};
	}

	// TODO: Here we compute the added, modified and deleted
	// should get it directly from the database really.

	/*
	var projection = {
		added: 1,
		modified: 1,
		deleted : 1
	};
	*/

	dbConn.getLatest(account, project + '.history', historyQuery, null, function(err, history)
	{
		if(err.value) return callback(err);

		if(!history[0])
			return callback(responseCodes.BRANCH_NOT_FOUND);

		var otherHistoryQuery = null;

		if (revision != null)
		{
			otherHistoryQuery = {
				_id: stringToUUID(otherrevision)
			};
		} else {
			if (branch == 'master')
				var branch_id = masterUUID;
			else
				var branch_id = stringToUUID(otherbranch);

			otherHistoryQuery = {
				shared_id:	branch_id
			};
		}

		dbConn.getLatest(account, project + '.history', otherHistoryQuery, null, function(err, otherhistory)
		{
			if (err.value) return callback(err);

			if(!otherhistory[0])
				return callback(responseCodes.BRANCH_NOT_FOUND);

			var doc = {};

			var historycurrent      = history[0]['current'];
			var otherhistorycurrent = otherhistory[0]['current'];

			historycurrent      = historycurrent.map(function(uid) { return uuidToString(uid); })
			otherhistorycurrent = otherhistorycurrent.map(function(uid) { return uuidToString(uid); })

			doc['added'] = otherhistorycurrent.filter( function (elem)
				{
					return (historycurrent.indexOf(elem) == -1);
				}
			);

			doc['deleted'] = historycurrent.filter( function (elem)
				{
					return (otherhistorycurrent.indexOf(elem) == -1);
				}
			);

			// TODO: Compute the modified
			//if (doc['modified'])
			//	doc['modified'] = doc['modified'].map(function(uid) { return uuidToString(uid); });

			self.getUIDMap(account, project, doc['added'].concat(doc['deleted']), function (err, map) {
				if (err.value) return callback(err);

				doc['added']   = doc['added'].map(function(elem) { return map[elem]; });
				doc['deleted'] = doc['deleted'].map(function(elem) { return map[elem]; });

				callback(responseCodes.OK, doc);
			});
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
