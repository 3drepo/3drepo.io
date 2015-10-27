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

var dbConn = require("./db.js");
var async = require("async");
var repoGraphScene = require("./repoGraphScene.js");
var uuid = require("node-uuid");

var ObjectID = require("mongodb").ObjectID;
var C = require("./constants");

var mongo = require("mongodb"); // TODO: Remove this

var OWNER	= 0;
var GROUP	= 1;
var PUBLIC	= 2;

var READ_BIT	= 4;
var WRITE_BIT	= 2;
var EXECUTE_BIT	= 1;

var responseCodes = require("./response_codes.js");

var utils = require("./utils.js");

// TODO: Remove these
stringToUUID = utils.stringToUUID;
uuidToString = utils.uuidToString;

var masterUUID = stringToUUID("00000000-0000-0000-0000-000000000000");

var DBInterface = function(logger) {
	"use strict";

	var self = this instanceof DBInterface ? this : Object.create(DBInterface.prototype);

	self.logger = logger;

	return self;
};

/*******************************************************************************
 /* Authenticate user against the database
 * @param {Error} err - Error object
 * @param {RepoNodeMesh} mesh - The RepoNodeMesh object containing the mesh
 * @param {string} tex_uuid - A string representing the tex_uuid attached to the mesh
 * @param {boolean} embedded_texture - Determines whether or not the texture data is embedded in the SRC.
 * @param {Object} res - The http response object
 *******************************************************************************/
DBInterface.prototype.authenticate = function(username, password, callback) {
	"use strict";

	dbConn(this.logger).authenticateUser(username, password, function(err)
	{
		if(err.value) {
			return callback(err);
		}

		callback(responseCodes.OK, {username: username});
	});
};

DBInterface.prototype.createUser = function(username, password, email, callback) {
	"use strict";

	var self = this;

	dbConn(self.logger).dbCallback("admin", function(err, db) {
		if (err.value) {
			return callback(err);
		}

		db.addUser(username, password, function(err, result)
		{
			// TODO: Should move this to db.js
			if (err) {
				return callback(responseCodes.DB_ERROR(err));
			}

			dbConn(self.logger).collCallback("admin", "system.users", true, function(err, coll) {
				if(err.value) {
					return callback(err);
				}

				var selector = { user : username };

				var updateJSON = {
					$set: { "customData.email" : email}
				};

				coll.update(selector, updateJSON, function(err, doc) {
					if (err) {
						callback(responseCodes.DB_ERROR(err));
					} else {
						callback(responseCodes.OK);
					}
				});
			});
		});
	});
};

DBInterface.prototype.updateUser = function(username, data, callback) {
	"use strict";

	var self = this;

	dbConn(self.logger).dbCallback("admin", function(err, db) {
		if (err.value) {
			return callback(err);
		}

		self.getUserInfo(username, false, function(err, oldCustomData) {
			if(err.value) {
				return callback(err);
			}

			var user = { "updateUser" : username };
			var newCustomData = oldCustomData;

			if(data.email) {
				newCustomData.email = data.email;
			}

			if(data.firstName) {
				newCustomData.firstName = data.firstName;
			}

			if(data.lastName) {
				newCustomData.lastName = data.lastName;
			}

			user.customData = newCustomData;

			db.command( user, function(err, result) {
				// TODO: Should move this to db.js
				if (err) {
					callback(responseCodes.DB_ERROR(err));
				} else {
					callback(responseCodes.OK);
				}
			});
		});
	});
};

DBInterface.prototype.updatePassword = function(username, passwords, callback) {
	"use strict";

	var oldPassword = passwords.oldPassword;
	var newPassword = passwords.newPassword;

	var self = this;

	if(!(oldPassword && newPassword))
	{
		return callback(responseCodes.INVALID_INPUTS_TO_PASSWORD_UPDATE);
	}

	self.authenticate(username, oldPassword, function(err) {
		if(err.value) {
			return callback(err);
		}

		dbConn(self.logger).dbCallback("admin", function(err, db) {
			if (err.value) {
				return callback(err);
			}

			DBInterface.prototype.getUserInfo(username, false, function(err, oldCustomData) {
				if(err.value) {
					return callback(err);
				}

				var user = { "updateUser" : username };
				user.pwd = newPassword;
				user.customData = oldCustomData;

				db.command(user, function(err, result) {
					// TODO: Should move this to db.js
					if(err) {
						callback(responseCodes.DB_ERROR(err));
					} else {
						callback(responseCodes.OK);
					}
				});
			});
		});
	});
};

DBInterface.prototype.getWayfinderInfo = function(dbName, project, uniqueIDs, callback) {
	"use strict";

    var self = this;

	if(uniqueIDs) {
		self.logger.logDebug("Getting waypoint information for UIDs " + JSON.stringify(uniqueIDs));

		var uids = uniqueIDs.map(function(item) { return new ObjectID(item); });
		var filter = {
			_id: {$in : uids}
		};

		self.logger.logDebug("Searching for wayfinding in paths: " + JSON.stringify(uniqueIDs));

		dbConn(self.logger).filterColl(dbName, project + ".wayfinder", filter, {}, function(err, docs) {
			if (err.value) {
				return callback(err);
			}

			callback(responseCodes.OK, docs);
		});
	} else {
		self.logger.logDebug("Getting list of all waypoint recordings");

		var projection = {
			user: 1,
			timestamp: 1,
			_id: 1
		};

		dbConn(self.logger).filterColl(dbName, project + ".wayfinder", {}, projection, function(err, docs) {
			if(err.value) {
				return callback(err);
			}

			callback(responseCodes.OK, docs);
		});
	}
};

DBInterface.prototype.storeWayfinderInfo = function(dbName, project, username, sessionID, data, timestamp, callback) {
	"use strict";

	this.logger.logDebug("Storing waypoint information for " + username + " @ " + (new Date(timestamp)));

	var self = this;

	dbConn(this.logger).collCallback(dbName, project + ".wayfinder", false, function(err, coll) {
		if(err.value) {
			return callback(err);
		}

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

			self.logger.logDebug("Updated " + count + " records.");
			callback(responseCodes.OK);
		});
	});
};

DBInterface.prototype.getWalkthroughInfo = function(dbName, project, index, callback) {
    "use strict";

    var filter = {};
    if (index !== "all") {
        filter.index = parseInt(index);
    }
    dbConn(this.logger).filterColl(dbName, project + ".walkthrough", filter, {}, function(err, docs) {
        if (err.value) {
            return callback(err);
        }
        callback(responseCodes.OK, docs);
    });
};

DBInterface.prototype.storeWalkthroughInfo = function(dbName, project, data, callback) {
    "use strict";

    dbConn(this.logger).collCallback(dbName, project + ".walkthrough", false, function(err, coll) {
        if (err.value) {
            return callback(err);
        }

        var uniqueID = {
            index : data.index
        };

        coll.update(uniqueID, {$set : data }, {upsert: true}, function(err, count) {
            if (err) {
                return callback(responseCodes.DB_ERROR(err));
            }
            callback(responseCodes.OK);
        });
    });
};

// TODO: Remove this, as it shouldn"t exist
DBInterface.prototype.addToCurrentList = function(dbName, project, branch, objUUID, callback) {
	"use strict";

	var self = this;

	self.getHeadUUID(dbName, project, branch, function(err, uuid) {
		dbConn(self.logger).collCallback(dbName, project + ".history", true, function(err, coll) {
			if(err.value) return callback(err);

			var uniqueID = {
				"_id" : uuid.uuid
			};

			coll.update(uniqueID, { $push: {"current" : objUUID} }, {}, function(err, count) {
				if (err) return callback(responseCodes.DB_ERROR(err));

				self.logger.logDebug("Adding " + uuidToString(objUUID) + " to current list of " + uuidToString(uuid.uuid));

				callback(responseCodes.OK);
			});
		});
	});
}

DBInterface.prototype.storeViewpoint = function(dbName, project, branch, username, parentSharedID, data, callback) {
	"use strict";

	data._id = uuid.v1();

	if (!data.shared_id)
		data.shared_id = uuid.v1();

	this.logger.logDebug("Storing camera " + data.name + " for (U,S) => (" + data.shared_id + "," + data._id + ") @ " + parentSharedID);

	data._id =			stringToUUID(data._id);
	data.shared_id =	stringToUUID(data.shared_id);

	data.type	= "camera";
	data.api	= "1";

	data.parents = [stringToUUID(parentSharedID)];

	var self = this;

	dbConn(this.logger).collCallback(dbName, project + ".scene", true, function(err, coll) {
		if(err.value) return callback(err);

		var uniqueID = {
			"_id" : data._id
		};

		coll.update(uniqueID, { $set : data }, { upsert: true }, function(err, count) {
			if(err) return callback(responseCodes.DB_ERROR(err));

			self.logger.logDebug("Updated " + count + " records.");

			self.addToCurrentList(dbName, project, branch, data._id, function (err) {
				if (err.value) return callback(err);

				callback(responseCodes.OK);
			});
		});
	});
}

DBInterface.prototype.getUserDBList = function(username, callback) {
	var resCode = responseCodes.OK;

	if (!username)
		return callback(responseCodes.USERNAME_NOT_SPECIFIED);

	this.logger.logDebug("Getting database list for " + username);

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

DBInterface.prototype.getUserInfo = function(username, callback) {
	if(!username)
		return callback(responseCodes.USERNAME_NOT_SPECIFIED);

	this.logger.logDebug("Getting user info for " + username);

	var filter = {
		user: username
	};

	var projection = {
		customData : 1,
		"customData.firstName" : 1,
		"customData.lastName" : 1,
		"customData.email" : 1,
		"customData.projects" : 1
	};

	dbConn(this.logger).filterColl("admin", "system.users", filter, projection, function(err, coll) {
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

DBInterface.prototype.getAvatar = function(username, callback) {
	if(!username)
		return callback(responseCodes.USER_NOT_SPECIFIED);

	this.logger.logDebug("Getting user avatar for " + username);

	var filter = {
		user: username
	};

	var projection = {
		"customData" : 1
	};

	dbConn(this.logger).filterColl("admin", "system.users", filter, projection, function(err, coll) {
		if(err.value)
			return callback(err);

		if (coll[0])
			callback(responseCodes.OK, coll[0]["customData"]["avatar"]);
		else
			callback(responseCodes.USER_NOT_FOUND, null);
	});
};

DBInterface.prototype.getProjectInfo = function(account, project, callback) {
	if(!project)
		return callback(responseCodes.PROJECT_NOT_SPECIFIED);

	this.logger.logDebug("Getting project info for " + account + "/" + project);

	var filter = {
		_id : project
	};

	var projection = {
		groups: 0
	};

	dbConn(this.logger).filterColl(account, "settings", filter, projection, function(err, coll) {
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

DBInterface.prototype.getDatabaseGroups = function(account, callback) {

	var filter = {
		db: account
	};

	var projection = {
		user: 1
	};

	this.logger.logDebug("Getting database groups for " + account);

	dbConn(this.logger).filterColl("admin", "system.users", filter, projection, function(err, coll) {
		if(err.value)
			return callback(err);

		callback(responseCodes.OK, coll);
	});
};

DBInterface.prototype.getProjectUsers = function(account, project, callback) {
	if(!project)
		return callback(responseCodes.PROJECT_NOT_SPECIFIED);

	this.logger.logDebug("Getting project users for " + account + "/" + project);

	var filter = {
		_id: project
	};

	var projection = {
		users: 1
	};

	var self = this;

	dbConn(this.logger).filterColl(account, "settings", filter, projection, function(err, users) {
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

DBInterface.prototype.getAccessToProject = function(username, account, project, callback) {
	if (project == null)
		return callback(responseCodes.PROJECT_NOT_SPECIFIED);

	var self = this;

	self.getProjectInfo(account, project, function(err, info) {
		if(err.value)
			return callback(err);

		if(username == info["owner"]) {
			self.logger.logDebug(username + " has owner permissions");
			return callback(responseCodes.OK, info["permissions"][OWNER])
		}

		self.getProjectUsers(account, project, function(err, users) {
			if(err.value)
				return callback(err);

			var usernameList = users.map(function(user) { return user["user"]; });

			self.logger.logDebug(project + " has the following users " + JSON.stringify(usernameList));

			if (usernameList.indexOf(username) > -1)
			{
				// Valid user or group
				self.logger.logDebug(username + " has group permissions");
				return callback(responseCodes.OK, info["permissions"][GROUP]);
			} else {
				// Must be a public user ?
				self.logger.logDebug(username + " has public permissions");
				return callback(responseCodes.OK, info["permissions"][PUBLIC]);
			}
		});
	});
};

DBInterface.prototype.checkPermissionsBit = function(username, account, project, bitMask, callback)
{
	var self = this;

	this.getAccessToProject(username, account, project, function(err, permission) {
		if(err.value)
			return callback(err);

		self.logger.logDebug("Permission for " + username + " @ " + account + "/" + project + " is " + permission);

		if (permission & bitMask)
		{
			callback(responseCodes.OK);
		} else {
			callback(responseCodes.NOT_AUTHORIZED);
		}
	});
}

DBInterface.prototype.hasReadAccessToProject = function(username, account, project, callback) {
	this.checkPermissionsBit(username, account, project, READ_BIT, callback);
};

DBInterface.prototype.hasWriteAccessToProject = function(username, account, project, callback) {
	this.checkPermissionsBit(username, account, project, WRITE_BIT, callback);
};

DBInterface.prototype.hasExecuteAccessToProject = function(username, account, project, callback) {
	this.checkPermissionsBit(username, account, project, EXECUTE_BIT, callback);
};

DBInterface.prototype.getDBList = function(callback) {
	this.logger.logDebug("Getting list of databases");

	dbConn(this.logger).dbCallback("admin", function(err, db) {
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


DBInterface.prototype.queryStashByRevision = function(dbName, project, revision, filter, projection, callback) {
	var historyQuery = {
		_id: stringToUUID(revision)
	};

	var self = this;

	dbConn(self.logger).filterColl(dbName, project + ".stash.3drepo", filter, projection, function(err, coll) {
		if (err.value) {
			return callback(err);
		}

		if (!coll.length) return callback(responseCodes.OBJECT_NOT_FOUND);

		callback(responseCodes.OK, coll);
	});
}

DBInterface.prototype.queryScene = function(dbName, project, branch, revision, filter, projection, callback) {
	var historyQuery = null;

	if (revision)
	{
		historyQuery = {
			_id: stringToUUID(revision)
		};
	} else {
		if (branch == "master")
			var branch_id = masterUUID;
		else
			var branch_id = stringToUUID(branch);

		historyQuery = {
			shared_id:	branch_id
		};
	}

	var historyProjection = {
		_id: 1,
		current: 1
	};

	var self = this;

	self.logger.logTrace("Querying scene");

	dbConn(self.logger).getLatest(dbName, project + ".history", historyQuery, historyProjection, function(err, docs)
	{
		if (err.value) return callback(err);

		if (!docs.length) return callback(responseCodes.PROJECT_HISTORY_NOT_FOUND);

		filter["rev_id"] = docs[0]["_id"];

		self.logger.logTrace(JSON.stringify(filter));

		self.logger.logTrace("Looking in stash");

		dbConn(self.logger).filterColl(dbName, project + ".stash.3drepo", filter, projection, function(err, coll) {
			if (err.value || !coll.length)
			{
				// TODO: At this point we should generate send off to generate a stash
				// There is no stash so just pass back the unoptimized scene graph
				delete filter["rev_id"];

				filter["_id"] = { $in: docs[0]["current"] };

				self.logger.logTrace("Looking in scene");

				dbConn(self.logger).filterColl(dbName, project + ".scene", filter, projection, function(err, coll) {
					if (err.value) return callback(err);

					callback(responseCodes.OK, false, coll);
				});
			} else {
				callback(responseCodes.OK, true, coll);
			}
		});
	});
}

DBInterface.prototype.getRootNode = function(dbName, project, branch, revision, queryStash, callback) {
	var historyQuery = null;

	if (revision)
	{
		historyQuery = {
			_id: stringToUUID(revision)
		};
	} else {
		if (branch == "master")
			var branch_id = masterUUID;
		else
			var branch_id = stringToUUID(branch);

		historyQuery = {
			shared_id:	branch_id
		};
	}

	var self = this;

	dbConn(this.logger).getLatest(dbName, project + ".history", historyQuery, null, function(err, docs)
	{
		if (err.value) return callback(err);

		if (!docs.length)
			return callback(responseCodes.PROJECT_HISTORY_NOT_FOUND);

		if (queryStash)
		{
			var filter = {
				parents : {$exists : false},
				type: "transformation",
				rev_id : stringToUUID(docs[0]["_id"])
			};

			dbConn(self.logger).filterColl(dbName, project + ".stash.3drepo", filter, null, function(err, doc) {
				if (err.value) return callback(err)

				if (!doc.length)
					return callback(responseCodes.ROOT_NODE_NOT_FOUND);

				callback(responseCodes.OK, doc[0]);
			});
		} else {
			var filter = {
				parents : {$exists : false},
				type: "transformation",
				_id: {$in: docs[0]["current"]}
			};

			dbConn(self.logger).filterColl(dbName, project + ".scene", filter, null, function(err, doc) {
				if (err.value) return callback(err);

				if (!doc.length)
					return callback(responseCodes.ROOT_NODE_NOT_FOUND);

				callback(responseCodes.OK, doc[0]);
			});
		}
	});
};

/*
exports.queryObjectsScene = function(dbName, project, uid, rid, sid, filter, projection, callback) {

	// If the uid is not specified then we are requesting a
	// specific object for a branch and revision
	if (!uid)
	{
		var filter = {
			parents: stringToUUID(sid),
			type: "meta"
		};

		var projection = {
			shared_id: 0,
			paths: 0,
			type: 0,
			api: 0,
			parents: 0
		};

		self.queryScene(dbName, project, branch, revision, filter, projection, function(err, fromStash, docs) {
			if (err.value) return callback(err);

			callback(responseCodes.OK, docs);
		});
	} else {
		// In this case we want an object with a specific uid
		// first we find the revision that it belongs to
		var historyQuery = {
			current : stringToUUID(uid)
		};

		var historyProjection = {
			_id : 1
		}

		dbConn.filterColl(dbName, project + ".history", historyQuery, historyProjection, function(err, obj) {
			if (err.value) return callback(err);

			if (!obj.length)
				return callback(responseCodes.HISTORY_NOT_FOUND);

			var revision = uuidToString(obj[0]["_id"]);

			var f
				parents: obj[0]["shared_id"],
				type: "meta"
			};

			var projection = {
				shared_id: 0,
				paths: 0,
				type: 0,
				api: 0,
				parents: 0
			};

			// TODO: This will query the history collection again, unnecessarily
			self.queryScene(dbName, project, null, revision, filter, projection, function(err, docs) {
				if (err.value) return callback(err);

				callback(responseCodes.OK, docs);
			});
		});
	}
}
*/

DBInterface.prototype.getChildrenByUID = function(dbName, project, uid, needFiles, callback) {
	var self = this;

	self.logger.logTrace("getChildrenByUID " + arguments);
	self.logger.logTrace("Checking whether the UID exists in the stash or not");

	// First lookup the object in either the stash or the scene
	self.getObject(dbName, project, uid, null, null, needFiles, {}, function (err, type, uid, fromStash, obj) {
		if (err.value) return callback(err);

		if (obj["all"].length > 1) return callback(responseCodes.OBJECT_NOT_FOUND);

		var sid    = Object.keys(obj["all"])[0];

		var sceneQuery = {
			parents: stringToUUID(sid)
		};

		if (fromStash) // If we got this from the stash
		{
			var rev_id = uuidToString(obj["all"][sid][C.REPO_NODE_LABEL_REV_ID]);

			self.logger.logTrace("Querying stash ...");

			self.queryStashByRevision(dbName, project, rev_id, sceneQuery, null, function (err, docs) {
				if (err.value) return callback(err);

				callback(responseCodes.OK, docs);
			});
		} else {
			var historyQuery = {
				current: stringToUUID(uid)
			};

			var projection = {
				_id : 1
			};

			self.logger.logTrace("Finding UID in scene");
			dbConn(self.logger).getLatest(dbName, project + ".history", historyQuery, projection, function (err, docs) {
				if (err.value) return callback(err);

				if (!docs.length) return callback(responseCodes.PROJECT_HISTORY_NOT_FOUND);

				self.logger.logTrace("Querying scene ...");
				self.queryScene(dbName, project, null, uuidToString(docs[0]["_id"]), sceneQuery, null, function (err, fromStash, docs) {
					if (err.value) return callback(err);

					if (!docs.length) return callback(responseCodes.OBJECT_NOT_FOUND);

					callback(responseCodes.OK, docs);
				});
			});
		}
	});
}

DBInterface.prototype.getChildren = function(dbName, project, branch, revision, sid, callback) {
	var historyQuery = null;

	if (revision != null)
	{
		historyQuery = {
			_id: stringToUUID(revision)
		};
	} else {
		if (branch == "master")
			var branch_id = masterUUID;
		else
			var branch_id = stringToUUID(branch);

		historyQuery = {
			shared_id:	branch_id
		};
	}

	var self = this;

	dbConn(self.logger).getLatest(dbName, project + ".history", historyQuery, null, function(err, docs)
	{
		var filter = {
			parents : stringToUUID(sid),
			type: {$in : ["mesh", "transformation", "ref", "map"]},
			_id: {$in: docs[0]["current"]}
		};

		dbConn(self.logger).filterColl(dbName, project + ".scene", filter, null, function(err, doc) {
			if (err.value) return callback(err);

			callback(responseCodes.OK, doc);
		});
	});
};

DBInterface.prototype.getUIDMap = function(dbName, project, uids, callback) {
	var uids = uids.map(function(uid) { return stringToUUID(uid); })

	var query = {
		_id: {$in : uids}
	};

	var projection = {
		shared_id : 1
	};

	var self = this;

	dbConn(self.logger).filterColl(dbName, project + ".scene", query, projection, function(err, doc) {
		if (err.value) return callback(err);

		var UIDMap = {};

		for (var i = 0; i < doc.length; i++)
			UIDMap[uuidToString(doc[i]["_id"])] = uuidToString(doc[i]["shared_id"]);

		callback(responseCodes.OK, UIDMap);
	});
};

DBInterface.prototype.getSIDMap = function(dbName, project, branch, revision, callback) {
	var historyQuery = null;

	if (revision != null)
	{
		historyQuery = {
			_id: stringToUUID(revision)
		};
	} else {
		if (branch == "master")
			var branch_id = masterUUID;
		else
			var branch_id = stringToUUID(branch);

		historyQuery = {
			shared_id:	branch_id
		};
	}

	var self = this;

	dbConn(self.logger).getLatest(dbName, project + ".history", historyQuery, null, function(err, docs)
	{
		if (err.value) return callback(err);

		if (!docs.length) return callback(responseCodes.PROJECT_HISTORY_NOT_FOUND);

		var filter = {
			_id: {$in: docs[0]["current"]}
		};

		var projection = {
			_id : 1,
			shared_id : 1
		};

		dbConn(self.logger).filterColl(dbName, project + ".scene", filter, projection, function(err, doc) {
			if (err.value) return callback(err);

			var SIDMap = {};

			for(var i = 0; i < doc.length; i++)
				SIDMap[uuidToString(doc[i]["shared_id"])] = uuidToString(doc[i]["_id"]);

			var invSIDMap = {};

			for(var i = 0; i < doc.length; i++)
				invSIDMap[uuidToString(doc[i]["_id"])] = uuidToString(doc[i]["shared_id"]);

			callback(responseCodes.OK, SIDMap, invSIDMap);
		});
	});
};



DBInterface.prototype.getHeadRevision = function(dbName, project, branch, callback) {
	if (branch == "master")
		var branch_id = masterUUID;
	else
		var branch_id = stringToUUID(branch);

	var historyQuery = {
		shared_id : branch_id
	};

	var self = this;

	dbConn(self.logger).getLatest(dbName, project + ".history", historyQuery, null, function(err, doc) {
		if (err.value) return callback(err);

		callback(responseCodes.OK, doc);
	});
}

DBInterface.prototype.getHeadUUID = function(dbName, project, branch, callback) {
	var self = this;

	self.getHeadRevision(dbName, project, branch, function(err, doc) {
		if (err.value) {
			return callback(err);
		}

		callback(responseCodes.OK, {"uuid" : doc[0]["_id"], "sid" : doc[0]["shared_id"]});
	});
}

DBInterface.prototype.getHeadOf = function(dbName, project, branch, getFunc, callback) {
	var self = this;

	if (branch == "master")
		var branch_id = masterUUID;
	else
		var branch_id = stringToUUID(branch);

	var historyQuery = {
		shared_id : branch_id
	};

	var projection = {
		_id : 1
	};

	dbConn(self.logger).getLatest(dbName, project + ".history", historyQuery, projection, function(err, doc) {
		if (err.value)
			return callback(err);

		if (!doc.length)
			return callback(responseCodes.PROJECT_HISTORY_NOT_FOUND);

			getFunc.call(self, dbName, project, uuidToString(doc[0]["_id"]), function(err, doc) {
				if(err.value)
					return callback(err);

				callback(responseCodes.OK, doc);
			});
	});
};

DBInterface.prototype.getRevisionInfo = function(dbName, project, rid, callback) {
	var self = this;

	var filter = {
		_id: stringToUUID(rid)
	};

	var projection = {
		_id :      1,
		shared_id: 1,
		author:    1,
		message:   1,
		tag:       1,
		timestamp: 1
	};

	dbConn(self.logger).filterColl(dbName, project + ".history", filter, projection, function(err, doc) {
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

DBInterface.prototype.getReadme = function(dbName, project, rid, callback) {
	var historyQuery = {
		_id : stringToUUID(rid)
	};

	var self = this;

	dbConn(this.logger).filterColl(dbName, project + ".history", historyQuery, null, function(err, doc)
	{
		if(!doc[0])
			return callback(responseCodes.PROJECT_HISTORY_NOT_FOUND);

		var query = {
			type:    "meta",
			subtype: "readme",
			_id		  : { $in : doc[0]["current"]}
		};

		dbConn(self.logger).filterColl(dbName, project + ".scene", query, null, function(err, readme) {
			if(err.value)
				return callback(err);

			if (!readme.length)
				callback(responseCodes.OK, {readme: "Readme Missing"});
			else
				callback(responseCodes.OK, {readme : readme[0]["metadata"]["text"]});
		});
	});
};

DBInterface.prototype.getRevisions = function(dbName, project, branch, from, to, full, callback) {

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

	var self = this;

	dbConn(this.logger).filterColl(dbName, project + ".history", filter, projection, function(err, doc) {
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

DBInterface.prototype.getFederatedProjectList = function(dbName, project, branch, revision, callback) {

	var historyQuery = null;

	if (revision != null)
	{
		historyQuery = {
			_id: stringToUUID(revision)
		};
	} else {
		if (branch == "master")
			var branch_id = masterUUID;
		else
			var branch_id = stringToUUID(branch);

		historyQuery = {
			shared_id:	branch_id
		};
	}

	var self = this;

	dbConn(this.logger).getLatest(dbName, project + ".history", historyQuery, null, function(err, docs)
	{
		if (err.value) return callback(err.value);

		if (!docs.length)
			return callback(responseCodes.PROJECT_HISTORY_NOT_FOUND);

		var filter = {
			type: "ref",
			_id: { $in: docs[0]["current"]}
		};

		var projection = {
			_rid : 1,
			owner: 1,
			project: 1,
			unique: 1
		};

		dbConn(self.logger).filterColl(dbName, project + ".scene", filter, {}, function(err, refs) {
			async.concat(refs, function (item, iter_callback) {
				var childDbName  = item["owner"] ? item["owner"] : dbName;
				var childProject = item["project"];

				var unique = ("unique" in item) ? item["unique"] : false;

				if ("_rid" in item)
				{
					if (unique)
					{
						var childRevision = uuidToString(item["_rid"]);
						var childBranch   = null;
					} else {
						var childRevision = null;
						var childBranch   = uuidToString(item["_rid"]);
					}
				} else {
					var childBranch   = "master";
					var childRevision = "head";
				}

				self.getFederatedProjectList(childDbName, childProject, childBranch, childRevision, function (err, childrefs) {
					if (err.value) return iter_callback(err);

					iter_callback(responseCodes.OK, childrefs);
				});
			},
			function (err, results) {
				// TODO: Deal with errors here

				callback(responseCodes.OK, refs.concat(results));
			});
		});
	});
}

DBInterface.prototype.getIssue = function(dbName, project, uid, onlyStubs, callback) {
	var filter = {
		_id : stringToUUID(uid)
	};

	var projection = {};

	if (onlyStubs)
	{
		projection = {
			_id : 1,
			name : 1,
			deadline : 1,
			position: 1,
			parent: 1
		}
	}

	dbConn(this.logger).filterColl(dbName, project + ".issues", filter, projection, function (err, docs) {
		if (err.value) return callback(err);

		for(var i = 0; i < docs.length; i++) {
			docs[i]["_id"]     = uuidToString(docs[i]["_id"]);
			docs[i]["parent"]  = uuidToString(docs[i]["parent"]);
			docs[i]["account"] = dbName;
			docs[i]["project"] = project;
		}

		return callback(responseCodes.OK, docs);
	});
}

DBInterface.prototype.getIssues = function(dbName, project, branch, revision, onlyStubs, callback) {
	var self = this;

	// First get the main project issues
	self.getSIDMap(dbName, project, branch, revision, function (err, SIDMap) {
		if (err.value) return callback(err);

		var sids = Object.keys(SIDMap);

		self.getObjectIssues(dbName, project, sids, null, onlyStubs, function (err, docs) {
			if (err.value) return callback(err);

			var collatedDocs = docs;

			// Now search for all federated issues
			self.getFederatedProjectList(dbName, project, branch, revision, function (err, refs) {
				if (err.value) return callback(err);

				async.concat(refs, function (item, iter_callback) {
					var childDbName  = item["owner"] ? item["owner"] : dbName;
					var childProject = item["project"];

					var unique = ("unique" in item) ? item["unique"] : false;

					if ("_rid" in item)
					{
						if (unique)
						{
							var childRevision = uuidToString(item["_rid"]);
							var childBranch   = null;
						} else {
							var childRevision = null;
							var childBranch   = uuidToString(item["_rid"]);
						}
					} else {
						var childBranch   = "master";
						var childRevision = "head";
					}

					self.getSIDMap(childDbName, childProject, childBranch, childRevision, function (err, SIDMap) {
						if (err.value) return iter_callback(err);

						var sids = Object.keys(SIDMap);

						// For all federated child projects get a list of shared IDs
						self.getObjectIssues(childDbName, childProject, sids, null, onlyStubs, function (err, refs) {
							if (err.value) return iter_callback(err);

							iter_callback(responseCodes.OK, refs);
						});
					});
				},
				function (err, results) {
					// TODO: Deal with errors here

					callback(responseCodes.OK, collatedDocs.concat(results));
				});
			});
		});
	});
}

DBInterface.prototype.getObjectIssues = function(dbName, project, sids, number, onlyStubs, callback) {
	if (sids.constructor !== Array) sids = [sids];

	sids = sids.map( function (item) { return stringToUUID(item); } )

	var filter = {
		parent : { $in : sids }
	};

	if ( number ) filter["number"] = number;

	var projection = {};

	if (onlyStubs)
	{
		projection = {
			comments: 0
		}
	}

	dbConn(this.logger).filterColl(dbName, project + ".issues", filter, {}, function (err, docs) {
		if (err.value) return callback(err);

		for(var i = 0; i < docs.length; i++) {
			docs[i]["_id"]     = uuidToString(docs[i]["_id"]);
			docs[i]["parent"]  = uuidToString(docs[i]["parent"]);
			docs[i]["account"] = dbName;
			docs[i]["project"] = project;
		}

		return callback(responseCodes.OK, docs);
	});
}

DBInterface.prototype.storeIssue = function(dbName, project, sid, owner, data, callback) {
	var self = this;

	dbConn(this.logger).collCallback(dbName, project + ".issues", false, function(err, coll) {
		if(err.value)
			return callback(err);

		if (!data._id) {
			var newID = uuid.v1();

			self.logger.logDebug("Creating new issue " + newID);

			// TODO: Implement this using sequence counters
			coll.count(function(err, numIssues) {
				if (err) return responseCodes.DB_ERROR(err);

				// This is a new issue
				data._id     = stringToUUID(newID);
				data.created = (new Date()).getTime();
				data.parent  = stringToUUID(sid);
				data.number  = numIssues + 1;

				if (!data.name)
					data.name = "Issue" + data.number;

				data.owner = owner;

				coll.insert(data, function(err, count) {
					if (err) return callback(responseCodes.DB_ERROR(err));

					self.logger.logDebug("Updated " + count + " records.");
					callback(responseCodes.OK, { issue_id : uuidToString(data._id), number : data.number });
				});
			});
		} else {
			self.logger.logDebug("Updating issue " + data._id);

			data._id = stringToUUID(data._id);

			if (data.comment)
			{
				var updateQuery = {
					$push: { comments: { owner: owner,  comment: data.comment} }
				};
			} else {
				var updateQuery = {
					$set: { complete: data.complete }
				};
			}

			coll.update({ _id : data._id}, updateQuery, function(err, count) {
				if (err) return callback(responseCodes.DB_ERROR(err));

				self.logger.logDebug("Updated " + count + " records.");
				callback(responseCodes.OK, { issue_id : uuidToString(data._id), number: data.number });
			});
		}
	});
}

DBInterface.prototype.getBranches = function(dbName, project, callback) {
	var filter = {
		type: "revision"
	};

	var projection = {
		shared_id : 1
	};

	dbConn(this.logger).filterColl(dbName, project + ".history", filter, projection, function(err, doc) {
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

DBInterface.prototype.getMetadata = function(dbName, project, branch, revision, sid, uid, callback) {
	var self = this;

	// If the uid is not specified then we are requesting a
	// specific object for a branch and revision
	if (!uid)
	{
		var filter = {
			parents: stringToUUID(sid),
			type: "meta"
		};

		var projection = {
			shared_id: 0,
			paths: 0,
			type: 0,
			api: 0,
			parents: 0
		};

		self.queryScene(dbName, project, branch, revision, filter, projection, function(err, fromStash, metadocs) {
			if (err.value) return callback(err);

			for(var i = 0; i < metadocs.length; i++)
				metadocs[i]["_id"] = uuidToString(metadocs[i]["_id"]);

			callback(responseCodes.OK, metadocs);
		});
	} else {
		// In this case we want an object with a specific uid
		// first we find the revision that it belongs to
		var historyQuery = {
			current : stringToUUID(uid)
		};

		var historyProjection = {
			_id       : 1,
			shared_id : 1
		}

		dbConn(self.logger).filterColl(dbName, project + ".history", historyQuery, historyProjection, function(err, revisions) {
			if (err.value) return callback(err);

			if (!revisions.length)
				return callback(responseCodes.OBJECT_NOT_FOUND);

			var revision = uuidToString(revisions[0][C.REPO_NODE_LABEL_UNIQUE_ID]);

			self.getObject(dbName, project, uid, null, null, false, { shared_id : 1 }, function(err, type, uid, fromStash, objs) {
				if (err.value) {
					return callback(err);
				}

				var objSID = Object.keys(objs.all)[0];

				var filter = {
					parents: utils.stringToUUID(objSID),
					type:    C.REPO_NODE_TYPE_META
				};

				var projection = {
					shared_id: 0,
					paths: 0,
					type: 0,
					api: 0,
					parents: 0
				};

				// TODO: This will query the history collection again, unnecessarily
				self.queryScene(dbName, project, null, revision, filter, projection, function(err, fromStash, metadocs) {
					if (err.value) return callback(err);

					for(var i = 0; i < metadocs.length; i++)
						metadocs[i]["_id"] = uuidToString(metadocs[i]["_id"]);

					callback(responseCodes.OK, metadocs);
				});
			});
		});
	}
};

DBInterface.prototype.appendMeshFiles = function(dbName, project, fromStash, uid, obj, callback)
{
	var self = this;

	var gridfstypes = [
		C.REPO_NODE_LABEL_VERTICES,
		C.REPO_NODE_LABEL_FACES,
		C.REPO_NODE_LABEL_NORMALS,
		//C.REPO_NODE_LABEL_COLORS,
		C.REPO_NODE_LABEL_UV_CHANNELS
	];

	var numTasks = gridfstypes.length;
	var subColl = fromStash ? "stash.3drepo" : "scene";

	self.logger.logTrace("Retrieving mesh files and appending");

	// TODO: Make this more generic, get filename from field
	async.each(gridfstypes, function (fstype, callback) {
		dbConn(self.logger).getGridFSFile(dbName, project + "." + subColl, uid + "_" + fstype, function(err, data)
		{
			if (!err["value"])
				obj[fstype] = data;

			callback();
		});
	}, function (err) {
		return callback(responseCodes.OK, "mesh", uid, fromStash, repoGraphScene(self.logger).decode([obj]));
	});
}

DBInterface.prototype.getObject = function(dbName, project, uid, rid, sid, needFiles, projection, callback) {
	var self = this;

	self.logger.logDebug("Requesting object (U, R, S) (" + uid + "," + rid + "," + sid + ")");

	// TODO: Get mesh files on demand

	// We need at least these fields for object construction
	if (projection !== null && Object.keys(projection).length)
	{
		projection["_id"]       = 1;
		projection["shared_id"] = 1;
		projection["type"]      = 1;
	}

	if (uid)
	{
		var query = {
			_id: stringToUUID(uid)
		};

		dbConn(self.logger).filterColl(dbName, project + ".stash.3drepo", query, projection, function(err, obj) {
			if (err.value || !obj.length)
			{
				// TODO: At this point we should generate the scene graph
				// There is no stash so just pass back the unoptimized scene graph

				dbConn(self.logger).filterColl(dbName, project + ".scene", query, projection, function(err, obj) {
					if (err.value) return callback(err);

					if (!obj.length)
						return callback(responseCodes.OBJECT_NOT_FOUND);

					var type = obj[0]["type"];
					var uid = uuidToString(obj[0]["_id"]);

					if ((type == "mesh") && needFiles)
					{
						self.appendMeshFiles(dbName, project, false, uid, obj[0], callback);
					} else {
						return callback(responseCodes.OK, type, uid, false, repoGraphScene(self.logger).decode(obj));
					}
				});
			} else {
				var type = obj[0]["type"];
				var uid = uuidToString(obj[0]["_id"]);

				var sceneObj = repoGraphScene(self.logger).decode(obj);

				// TODO: Make this more concrete
				// if a mesh load the vertices, indices, colors etc from GridFS
				if ((type == "mesh") && needFiles)
				{
					self.appendMeshFiles(dbName, project, true, uid, obj[0], callback);
				} else {
					return callback(responseCodes.OK, type, uid, true, repoGraphScene(self.logger).decode(obj));
				}
			}
		});

	} else if (rid && sid) {

		var query = {
			shared_id : stringToUUID(sid),
		};

		self.queryScene(dbName, project, null, rid, query, {}, function(err, fromStash, obj) {
			if (err.value) return callback(err);

			if (!obj.length)
				return callback(responseCodes.OBJECT_NOT_FOUND);

			if ((type == "mesh") && needFiles)
			{
				self.appendMeshFiles(dbName, project, fromStash, uid, obj, callback);
			} else {
				return callback(responseCodes.OK, type, uid, fromStash, repoGraphScene(this.logger).decode(obj));
			}
		});
	} else {
		return callback(responseCodes.RID_SID_OR_UID_NOT_SPECIFIED, null, null, null);
	}
}

DBInterface.prototype.getScene = function(dbName, project, branch, revision, full, callback) {

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

	var self = this;

	self.queryScene(dbName, project, branch, revision, {}, projection, function(err, fromStash, coll) {
		callback(responseCodes.OK, repoGraphScene(self.logger).decode(coll));
	});
};

// TODO: Get rid of this function
DBInterface.prototype.getUnoptimizedScene = function(dbName, project, branch, revision, full, callback)
{
	var historyQuery = null;

	if (revision)
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

	dbConn(self.logger).getLatest(dbName, project + '.history', historyQuery, null, function(err, docs)
	{
		if (err.value) return callback(err);

		if (!docs.length) {
			return callback(responseCodes.PROJECT_HISTORY_NOT_FOUND);
		}

		var filter = {
			_id: {$in: docs[0]['current']}
		};

		dbConn(self.logger).filterColl(dbName, project + '.scene', filter, null, function(err, doc) {
			if (err.value) return callback(err);

			if (!doc.length)
				return callback(responseCodes.ROOT_NODE_NOT_FOUND);

			callback(responseCodes.OK, repoGraphScene.decode(doc));
		});
	});
}

DBInterface.prototype.getDiff = function(account, project, branch, revision, otherbranch, otherrevision, callback) {
	var historyQuery = null;

	if (revision != null)
	{
		historyQuery = {
			_id: stringToUUID(revision)
		};
	} else {
		if (branch == "master")
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

	var self = this;

	dbConn(self.logger).getLatest(account, project + ".history", historyQuery, null, function(err, history)
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
			if (branch == "master")
				var branch_id = masterUUID;
			else
				var branch_id = stringToUUID(otherbranch);

			otherHistoryQuery = {
				shared_id:	branch_id
			};
		}

		dbConn(self.logger).getLatest(account, project + ".history", otherHistoryQuery, null, function(err, otherhistory)
		{
			if (err.value) return callback(err);

			if(!otherhistory[0])
				return callback(responseCodes.BRANCH_NOT_FOUND);

			var doc = {};

			var historycurrent      = history[0]["current"];
			var otherhistorycurrent = otherhistory[0]["current"];

			historycurrent      = historycurrent.map(function(uid) { return uuidToString(uid); })
			otherhistorycurrent = otherhistorycurrent.map(function(uid) { return uuidToString(uid); })

			doc["added"] = otherhistorycurrent.filter( function (elem)
				{
					return (historycurrent.indexOf(elem) == -1);
				}
			);

			doc["deleted"] = historycurrent.filter( function (elem)
				{
					return (otherhistorycurrent.indexOf(elem) == -1);
				}
			);

			// TODO: Compute the modified
			//if (doc["modified"])
			//	doc["modified"] = doc["modified"].map(function(uid) { return uuidToString(uid); });

			self.getUIDMap(account, project, doc["added"].concat(doc["deleted"]), function (err, map) {
				if (err.value) return callback(err);

				doc["added"]   = doc["added"].map(function(elem) { return map[elem]; });
				doc["deleted"] = doc["deleted"].map(function(elem) { return map[elem]; });

				callback(responseCodes.OK, doc);
			});
		});
	});
};

DBInterface.prototype.uuidToString = uuidToString;

module.exports = function(logger) {
	"use strict";

	return new DBInterface(logger);
};
