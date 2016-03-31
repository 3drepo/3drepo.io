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
var repoGraphScene = require("../repo/repoGraphScene.js");
var uuid = require("node-uuid");

var _ = require("underscore");

var ObjectID = require("mongodb").ObjectID;
var C = require("../constants");

// var mongo = require("mongodb"); // TODO: Remove this

// var OWNER	= 0;
// var GROUP	= 1;
// var PUBLIC	= 2;

var READ_BIT	= 4;
var WRITE_BIT	= 2;
var EXECUTE_BIT	= 1;

var responseCodes = require("../response_codes.js");

var utils = require("../utils.js");

var config       = require("app-config").config;

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
	var self = this;

	dbConn(this.logger).authenticateUser(username, password, function(err)
	{
		if(err.value) {
			return callback(err);
		}

		self.getUserRoles(username, null, function(err, roles) {
			if (err.value) {
				return callback(err);
			}

			callback(responseCodes.OK, {
				username: username,
				roles: roles
			});
		});
	});
};

DBInterface.prototype.createUser = function(username, password, email, callback) {
	"use strict";

	var self = this;

	dbConn(self.logger).dbCallback("admin", function(err, db) {
		if (err.value) {
			return callback(err);
		}

		db.addUser(username, password, function(err)
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

				coll.update(selector, updateJSON, function(err) {
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

		self.getUserInfo(username, function(err, oldCustomData) {
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

			db.command( user, function(err) {
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

// DBInterface.prototype.updatePassword = function(username, passwords, callback) {
// 	"use strict";

// 	var oldPassword = passwords.oldPassword;
// 	var newPassword = passwords.newPassword;

// 	var self = this;

// 	if(!(oldPassword && newPassword))
// 	{
// 		return callback(responseCodes.INVALID_INPUTS_TO_PASSWORD_UPDATE);
// 	}

// 	self.authenticate(username, oldPassword, function(err) {
// 		if(err.value) {
// 			return callback(err);
// 		}

// 		dbConn(self.logger).dbCallback("admin", function(err, db) {
// 			if (err.value) {
// 				return callback(err);
// 			}

// 			self.getUserInfo(username, function(err, oldCustomData) {
// 				if(err.value) {
// 					return callback(err);
// 				}

// 				var user = { "updateUser" : username };
// 				user.pwd = newPassword;
// 				user.customData = oldCustomData;

// 				db.command(user, function(err) {
// 					// TODO: Should move this to db.js
// 					if(err) {
// 						callback(responseCodes.DB_ERROR(err));
// 					} else {
// 						callback(responseCodes.OK);
// 					}
// 				});
// 			});
// 		});
// 	});
// };

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

		for(let idx = 0; idx < data.waypoints.length; idx++)
		{
			var waypointIdx = data.waypoints[idx].idx;

			dataObj[waypointIdx]			= {};
			dataObj[waypointIdx].dir		= data.waypoints[idx].dir;
			dataObj[waypointIdx].pos		= data.waypoints[idx].pos;
			dataObj[waypointIdx].time		= data.waypoints[idx].time;
		}

		coll.update(uniqueID, { $set : dataObj }, {upsert: true}, function(err, count) {
			if (err) { return callback(responseCodes.DB_ERROR(err)); }

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

		coll.update(uniqueID, {$set : data }, {upsert: true}, function(err) {
			if (err) {
				return callback(responseCodes.DB_ERROR(err));
			}
			callback(responseCodes.OK);
		});
	});
};

DBInterface.prototype.searchTree = function(dbName, project, branch, revision, searchstring, callback) {
	"use strict";

	var self = this;

	var i,
		length,
		searchStringChars = searchstring.split(""),
		regexStr = "",
		filter = {};

	// If searchstring is "door" create regex to search for [dD][oO][oO][rR]
	for (i = 0, length = searchStringChars.length; i < length; i += 1) {
		if (searchStringChars[i] === ":") {
			regexStr += "[" + searchStringChars[i] + "]";
		}
		else {
			regexStr += "[" + searchStringChars[i] + searchStringChars[i].toUpperCase() + "]";
		}
	}
	filter = {
		name: new RegExp(regexStr)
	};

	var projection = {
		_id : 1,
		name: 1
	};

	self.filterFederatedProject(dbName, project, branch, revision, filter, projection, true, function(err, docs) {
		if (err.value) {
			return callback(err);
		}
		for (i = 0, length = docs.length; i < length; i += 1) {
			docs[i]._id = uuidToString(docs[i]._id);
		}

		// Now we need to follow any references
		callback(responseCodes.OK, docs);
	});
};

// TODO: Remove this, as it shouldn"t exist
DBInterface.prototype.addToCurrentList = function(dbName, project, branch, objUUID, callback) {
	"use strict";

	var self = this;

	self.getHeadUUID(dbName, project, branch, function(err, uuid) {
		dbConn(self.logger).collCallback(dbName, project + ".history", true, function(err, coll) {
			if(err.value) { return callback(err); }

			var uniqueID = {
				"_id" : uuid.uuid
			};

			coll.update(uniqueID, { $push: {"current" : objUUID} }, {}, function(err) {
				if (err) { return callback(responseCodes.DB_ERROR(err)); }

				self.logger.logDebug("Adding " + uuidToString(objUUID) + " to current list of " + uuidToString(uuid.uuid));

				callback(responseCodes.OK);
			});
		});
	});
};

DBInterface.prototype.storeViewpoint = function(dbName, project, branch, username, parentSharedID, data, callback) {
	"use strict";

	data._id = uuid.v1();

	if (!data.shared_id){
		data.shared_id = uuid.v1();
	}

	this.logger.logDebug("Storing camera " + data.name + " for (U,S) => (" + data.shared_id + "," + data._id + ") @ " + parentSharedID);

	data._id =			stringToUUID(data._id);
	data.shared_id =	stringToUUID(data.shared_id);

	data.type	= "camera";
	data.api	= "1";

	data.parents = [stringToUUID(parentSharedID)];

	var self = this;

	dbConn(this.logger).collCallback(dbName, project + ".scene", true, function(err, coll) {
		if(err.value) { return callback(err); }

		var uniqueID = {
			"_id" : data._id
		};

		coll.update(uniqueID, { $set : data }, { upsert: true }, function(err, count) {
			if(err) { return callback(responseCodes.DB_ERROR(err)); }

			self.logger.logDebug("Updated " + count + " records.");

			self.addToCurrentList(dbName, project, branch, data._id, function (err) {
				if (err.value) { return callback(err); }

				callback(responseCodes.OK);
			});
		});
	});
};

DBInterface.prototype.getUserDBList = function(username, callback) {
	// var resCode = responseCodes.OK;

	if (!username){
		return callback(responseCodes.USERNAME_NOT_SPECIFIED);
	}

	this.logger.logDebug("Getting database list for " + username);

	// var filter = {
	//	user: username
	// };

	this.getUserInfo(username, function(err, user) {
		if(err.value){
			return callback(err);
		}

		if(!user){
			return callback(responseCodes.USER_NOT_FOUND);
		}

		callback(responseCodes.OK, user.projects);
	});
};


DBInterface.prototype.getUserBidInfo = function(username, callback) {
	if(!username) {
		return callback(responseCodes.USERNAME_NOT_SPECIFIED);
	}

	this.logger.logDebug("Getting user info bid for " + username);

	var filter = {
		user: username
	};

	var projection = {
		"customData.bids" : 1
	};

	return new Promise((resolve, reject) => {
		dbConn(this.logger).filterColl("admin", "system.users", filter, projection, function(err, coll) {
			if(err.value) {
				reject(err);
				return callback && callback(err);
			}

			if (coll[0])
			{
				var user = coll[0].customData && coll[0].customData.bids || [];
				callback && callback(responseCodes.OK, user);
				resolve(user);
			} else {
				callback && callback(responseCodes.USER_NOT_FOUND, null);
				reject({ resCode: responseCodes.USER_NOT_FOUND });
			}
		});
	});
};


DBInterface.prototype.getIssueStatsForProjectList = function(projectList, callback) {
	var self = this;

	// Only works for master/head at the moment
	var branch	 = C.MASTER_BRANCH_NAME;

	async.concat(projectList, function (item, iter_callback) {
		var dbName	= item.account;
		var project = item.project;

		self.getFederatedProjectList(dbName, project, branch, null, function(err, childrefs) {
			if (err.value)
			{
				// If there is an error return nothing, so the loop can continue
				//self.logger.logError("Error computing stats for project list [" + JSON.stringify(err) + "]");
				return iter_callback(null, []);
			}

			// Add the project itself to the list
			childrefs = childrefs.concat({
				account: dbName,
				project: project
			});

			async.concat(childrefs, function (childref, ref_callback) {
				var childDbName = childref.owner ? childref.owner : dbName;
				var childProject = childref.project;

				dbConn(this.logger).collAggregation(childDbName, childProject + ".issues",
					[ { $group : { _id: "$closed", count: { $sum : 1 }}} ],
					function (err, result) {
						if (err.value)
						{
							// If there is an error return nothing, so the loop can continue
							//self.logger.logError("Error computing stats for project list [" + JSON.stringify(err) + "]");
							return ref_callback(null, { closed: -100 , open: -100 });
						}

						var issueCount = {
							closed: 0,
							open: 0
						};

						// If the _id is true we have the closed count
						// If the _id is null we have the open count
						for(var i = 0; i < result.length; i++)
						{
							if (result[i]._id)
							{
								issueCount.closed = result[i].count;
							} else {
								issueCount.open = result[i].count;
							}
						}

						issueCount.total = issueCount.open + issueCount.closed;

						ref_callback(null, issueCount);
					});
			}, function (err, ref_results) {
				if (err)
				{
					return iter_callback(err);
				}

				var cumulativeIssueCount = _.clone(item);

				cumulativeIssueCount.closed = 0;
				cumulativeIssueCount.open	= 0;
				cumulativeIssueCount.total	= 0;

				for(var i = 0; i < ref_results.length; i++)
				{
					cumulativeIssueCount.closed += ref_results[i].closed;
					cumulativeIssueCount.open	+= ref_results[i].open;
					cumulativeIssueCount.total	+= ref_results[i].total;
				}

				iter_callback(null, cumulativeIssueCount);
			});
		});
	}, function (err, results) {
		callback(responseCodes.OK, results);
	});
};

DBInterface.prototype.getUserInfo = function(username, callback) {
	var self = this;

	if(!username) {
		return callback(responseCodes.USERNAME_NOT_SPECIFIED);
	}

	this.logger.logDebug("Getting user info for " + username);

	var filter = {
		user: username
	};

	var projection = {
		customData : 1,
		"customData.firstName" : 1,
		"customData.lastName" : 1,
		"customData.email" : 1
	};

	dbConn(self.logger).filterColl("admin", "system.users", filter, projection, function(err, coll) {
		if(err.value) {
			return callback(err);
		}

		if (coll[0])
		{
			self.getUserPrivileges(username, null, function (err, privs) {
				if (err.value)
				{
					return callback(err);
				}

				var user = coll[0].customData;

				// This is the collection that we check for
				// when seeing if a project is viewable
				var filterCollectionType = "history";
				user.projects = [];

				for(var i = 0; i < privs.length; i++)
				{
					if (privs[i].resource.db && privs[i].resource.collection && privs[i].resource.db !== "system")
					{
						if (privs[i].resource.collection.substr(-filterCollectionType.length) === filterCollectionType)
						{
							if (privs[i].actions.indexOf("find") !== -1)
							{
								var baseCollectionName = privs[i].resource.collection.substr(0, privs[i].resource.collection.length - filterCollectionType.length - 1);

								user.projects.push({
									"account" : privs[i].resource.db,
									"project" : baseCollectionName
								});
							}
						}
					}
				}

				/*
				self.getIssueStatsForProjectList(user.projects, function(err, projectStats) {
					if (err.value)
					{
						return callback(err);
					}

					user.projects = projectStats;
					callback(responseCodes.OK, user);
				});
				*/

				callback(responseCodes.OK, user);
			});

		} else {
			callback(responseCodes.USER_NOT_FOUND, null);
		}
	});
};

// DBInterface.prototype.getAvatar = function(username, callback) {
// 	if(!username){
// 		return callback(responseCodes.USER_NOT_SPECIFIED);
// 	}

// 	this.logger.logDebug("Getting user avatar for " + username);

// 	var filter = {
// 		user: username
// 	};

// 	var projection = {
// 		"customData" : 1
// 	};

// 	dbConn(this.logger).filterColl("admin", "system.users", filter, projection, function(err, coll) {
// 		if(err.value) {
// 			return callback(err);
// 		}

// 		if (coll.length) {
// 			callback(responseCodes.OK, coll[0].customData.avatar);
// 		} else {
// 			callback(responseCodes.USER_NOT_FOUND, null);
// 		}
// 	});
// };


/*******************************************************************************
	  * Obtain the revision ID head of a branch
	  * @param {String} account - account name
	  * @param {String} project - project name
      * @param {String} branchID - branch ID in question
      * @param {function} callback(string) - call back function with revision id as a string
      * @param {function} err_callback(err) - callback when error occurs
	  *******************************************************************************/
DBInterface.prototype.getProjectBranchHeadRid = function (account, project, branch, callback, err_callback) {
    var branch_id;
    if (branch === "master") {
        branch_id = masterUUID;
    } else {
        branch_id = stringToUUID(branch);
    }

    historyQuery = {
        shared_id: branch_id
    };

    var historyProjection = {
        _id: 1
    };

    dbConn(this.logger).getLatest(account, project + ".history", historyQuery, historyProjection, function (err, docs) {
        if (err.value) {
            return err_callback(err);
        }
        if (!docs.length) { return err_callback(responseCodes.PROJECT_HISTORY_NOT_FOUND); }
        callback(uuidToString(docs[0]._id));
    });
};
DBInterface.prototype.getProjectInfo = function(account, project, callback) {
	if(!project){
		return callback(responseCodes.PROJECT_NOT_SPECIFIED);

	}

	this.logger.logDebug("Getting project info for " + account + "/" + project);

	var filter = {
		_id : project
	};

	var projection = {
		groups: 0
	};

	dbConn(this.logger).filterColl(account, "settings", filter, projection, function(err, coll) {
		if(err.value){
			return callback(err);
		}

		if(coll[0])
		{
			var projectInfo = {
				owner:			coll[0].owner,
				desc:			coll[0].desc,
				type:			coll[0].type,
				permissions:	coll[0].permissions,
				properties:		coll[0].properties
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
		if(err.value){
			return callback(err);
		}

		callback(responseCodes.OK, coll);
	});
};

DBInterface.prototype.getProjectUsers = function(account, project, callback) {
	if(!project){
		return callback(responseCodes.PROJECT_NOT_SPECIFIED);
	}
	var self = this;
	self.logger.logDebug("Getting project users for " + account + "/" + project);

	var filter = {
		_id: project
	};

	var projection = {
		users: 1
	};

	//var self = this;

	dbConn(this.logger).filterColl(account, "settings", filter, projection, function(err, users) {
		if(err.value){
			return callback(err);
		}

		self.getDatabaseGroups(account, function(err, groups) {
			if(err.value){
				return callback(err);
			}

			if(!users.length){
				return callback(responseCodes.SETTINGS_ERROR);
			}

			if(!users[0].users || !users[0].users.length){
				return callback(responseCodes.OK, []);
			}

			var projectUsers = users[0].users.map(function (user) {
				return {
					user: user,
					type: (groups.indexOf(user.user) > 0) ? "group" : "user"
				};
			});

			callback(responseCodes.OK, projectUsers);
		});
	});
};

DBInterface.prototype.checkUserPermission = function (username, account, project, callback) {
	var self = this;

	self.getUserPrivileges(username, account, function (status, privileges) {
		if (status.value) {
			return callback(status);
		}
		//Determine the access rights of a project via privileges on the history collection
		var collection = project + ".history";
		var writePermission = false;
		var readPermission = false;
		for (i = 0; i < privileges.length; i++) {
			if (privileges[i].resource.db === account) {
				if (privileges[i].resource.collection === "" || privileges[i].resource.collection === collection) {
					readPermission |= privileges[i].actions.indexOf("find") > -1;
					writePermission |= privileges[i].actions.indexOf("insert") > -1;

				}
			}
		}
		var permissionFlag = readPermission? READ_BIT : 0;
		permissionFlag += writePermission? WRITE_BIT : 0;

		callback(responseCodes.OK, permissionFlag);
	});

};

DBInterface.prototype.getAccessToProject = function(username, account, project, callback) {
	if (project === null){
		return callback(responseCodes.PROJECT_NOT_SPECIFIED);
	}

	var self = this;

	self.checkUserPermission(username, account, project, callback);

};

DBInterface.prototype.checkPermissionsBit = function(username, account, project, bitMask, callback)
{
	var self = this;

	this.getAccessToProject(username, account, project, function(err, permission) {
		if(err.value){
			return callback(err);
		}

		self.logger.logDebug("Permission for " + username + " @ " + account + "/" + project + " is " + permission);

		if (permission & bitMask)
		{
			callback(responseCodes.OK);
		} else {
			callback(responseCodes.NOT_AUTHORIZED);
		}
	});
};

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
		if (err.value){
			return callback(err);
		}

		db.admin().listDatabases(function(err, dbs) {
			if (err.value){
				return callback(err);
			}

			var dbList = [];

			dbs.databases.forEach((database) => {
				dbList.push({ name: database.name});
			});

			dbList.sort();

			callback(responseCodes.OK, dbList);
		});
	});
};


DBInterface.prototype.queryStashByRevision = function(dbName, project, revision, filter, projection, callback) {
	// var historyQuery = {
	//	_id: stringToUUID(revision)
	// };

	var self = this;

	dbConn(self.logger).filterColl(dbName, project + ".stash.3drepo", filter, projection, function(err, coll) {
		if (err.value) {
			return callback(err);
		}

		if (!coll.length) { return callback(responseCodes.OBJECT_NOT_FOUND); }

		callback(responseCodes.OK, coll);
	});
};

DBInterface.prototype.queryScene = function(dbName, project, branch, revision, filter, projection, callback) {
	'use strict';

	var historyQuery = null;

	if (revision)
	{
		historyQuery = {
			_id: stringToUUID(revision)
		};
	} else {

		let branch_id;

		if (branch === "master") {
			branch_id = masterUUID;
		} else {
			branch_id = stringToUUID(branch);
		}

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
		if (err.value) { return callback(err); }

		if (!docs.length) { return callback(responseCodes.PROJECT_HISTORY_NOT_FOUND); }

		filter.rev_id = docs[0]._id;

		self.logger.logTrace(JSON.stringify(filter));

		self.logger.logTrace("Looking in stash");

		dbConn(self.logger).filterColl(dbName, project + ".stash.3drepo", filter, projection, function(err, coll) {
			if (err.value || !coll.length)
			{
				// TODO: At this point we should generate send off to generate a stash
				// There is no stash so just pass back the unoptimized scene graph
				delete filter.rev_id;

				filter._id = { $in: docs[0].current };

				self.logger.logTrace("Looking in scene");

				dbConn(self.logger).filterColl(dbName, project + ".scene", filter, projection, function(err, coll) {
					if (err.value) { return callback(err); }

					callback(responseCodes.OK, false, coll);
				});
			} else {
				callback(responseCodes.OK, true, coll);
			}
		});
	});
};

DBInterface.prototype.getRootNode = function(dbName, project, branch, revision, queryStash, callback) {
	'use strict';

	var historyQuery = null;

	if (revision)
	{
		historyQuery = {
			_id: stringToUUID(revision)
		};
	} else {

		let branch_id;

		if (branch === "master") {
			branch_id = masterUUID;
		} else {
			branch_id = stringToUUID(branch);
		}

		historyQuery = {
			shared_id:	branch_id
		};
	}

	var self = this;

	dbConn(this.logger).getLatest(dbName, project + ".history", historyQuery, null, function(err, docs)
	{
		if (err.value) { return callback(err); }

		if (!docs.length) {
			return callback(responseCodes.PROJECT_HISTORY_NOT_FOUND);
		}

		let filter;

		if (queryStash)
		{
			filter = {
				parents : {$exists : false},
				type: "transformation",
				rev_id : stringToUUID(docs[0]._id)
			};

			dbConn(self.logger).filterColl(dbName, project + ".stash.3drepo", filter, null, function(err, doc) {
				if (err.value) { return callback(err); }

				if (!doc.length) {
					return callback(responseCodes.ROOT_NODE_NOT_FOUND);
				}

				callback(responseCodes.OK, doc[0]);
			});
		} else {

			filter = {
				parents : {$exists : false},
				type: "transformation",
				_id: {$in: docs[0].current}
			};

			dbConn(self.logger).filterColl(dbName, project + ".scene", filter, null, function(err, doc) {
				if (err.value) { return callback(err); }

				if (!doc.length) {
					return callback(responseCodes.ROOT_NODE_NOT_FOUND);
				}

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
		if (err.value) { return callback(err); }

		if (obj.all.length > 1) { return callback(responseCodes.OBJECT_NOT_FOUND); }

		var sid    = Object.keys(obj.all)[0];

		var sceneQuery = {
			parents: stringToUUID(sid)
		};

		if (fromStash) // If we got this from the stash
		{
			var rev_id = uuidToString(obj.all[sid][C.REPO_NODE_LABEL_REV_ID]);

			self.logger.logTrace("Querying stash ...");

			self.queryStashByRevision(dbName, project, rev_id, sceneQuery, null, function (err, docs) {
				if (err.value) { return callback(err); }

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
				if (err.value) { return callback(err); }

				if (!docs.length) { return callback(responseCodes.PROJECT_HISTORY_NOT_FOUND); }

				self.logger.logTrace("Querying scene ...");
				self.queryScene(dbName, project, null, uuidToString(docs[0]._id), sceneQuery, null, function (err, fromStash, docs) {
					if (err.value) { return callback(err); }

					if (!docs.length) { return callback(responseCodes.OBJECT_NOT_FOUND); }

					callback(responseCodes.OK, docs);
				});
			});
		}
	});
};

DBInterface.prototype.getChildren = function(dbName, project, branch, revision, sid, callback) {
	'use strict';

	var historyQuery = null;

	if (revision !== null)
	{
		historyQuery = {
			_id: stringToUUID(revision)
		};
	} else {

		let branch_id;

		if (branch === "master") {
			branch_id = masterUUID;
		} else {
			branch_id = stringToUUID(branch);
		}

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
			_id: {$in: docs[0].current}
		};

		dbConn(self.logger).filterColl(dbName, project + ".scene", filter, null, function(err, doc) {
			if (err.value) { return callback(err); }

			callback(responseCodes.OK, doc);
		});
	});
};

DBInterface.prototype.getUIDMap = function(dbName, project, uids, callback) {
	'use strict';

	uids = uids.map(function(uid) { return stringToUUID(uid); });

	var query = {
		_id: {$in : uids}
	};

	var projection = {
		shared_id : 1
	};

	var self = this;

	dbConn(self.logger).filterColl(dbName, project + ".scene", query, projection, function(err, doc) {
		if (err.value) { return callback(err); }

		var UIDMap = {};

		for (let i = 0; i < doc.length; i++){
			UIDMap[uuidToString(doc[i]._id)] = uuidToString(doc[i].shared_id);
		}

		callback(responseCodes.OK, UIDMap);
	});
};

DBInterface.prototype.getSIDMap = function(dbName, project, branch, revision, callback) {
	'use strict';

	var historyQuery = null;

	if (revision !== null)
	{
		historyQuery = {
			_id: stringToUUID(revision)
		};
	} else {

		let branch_id;

		if (branch === "master") {
			branch_id = masterUUID;
		} else {
			branch_id = stringToUUID(branch);
		}

		historyQuery = {
			shared_id:	branch_id
		};
	}

	var self = this;

	dbConn(self.logger).getLatest(dbName, project + ".history", historyQuery, null, function(err, docs)
	{
		if (err.value) { return callback(err); }

		if (!docs.length) { return callback(responseCodes.PROJECT_HISTORY_NOT_FOUND); }

		var filter = {
			_id: {$in: docs[0].current}
		};

		var projection = {
			_id : 1,
			shared_id : 1
		};

		dbConn(self.logger).filterColl(dbName, project + ".scene", filter, projection, function(err, doc) {
			if (err.value) { return callback(err); }

			var SIDMap = {};

			for(let i = 0; i < doc.length; i++) {
				SIDMap[uuidToString(doc[i].shared_id)] = uuidToString(doc[i]._id);
			}

			var invSIDMap = {};

			for(let i = 0; i < doc.length; i++){
				invSIDMap[uuidToString(doc[i]._id)] = uuidToString(doc[i].shared_id);
			}

			callback(responseCodes.OK, SIDMap, invSIDMap);
		});
	});
};

DBInterface.prototype.getHeadRevision = function(dbName, project, branch, callback) {
	'use strict';

	let branch_id;

	if (branch === "master") {
		branch_id = masterUUID;
	} else {
		branch_id = stringToUUID(branch);
	}

	var historyQuery = {
		shared_id : branch_id
	};

	var self = this;

	dbConn(self.logger).getLatest(dbName, project + ".history", historyQuery, null, function(err, doc) {
		if (err.value) { return callback(err); }

		callback(responseCodes.OK, doc);
	});
};

DBInterface.prototype.getHeadUUID = function(dbName, project, branch, callback) {
	var self = this;

	self.getHeadRevision(dbName, project, branch, function(err, doc) {
		if (err.value) {
			return callback(err);
		}

		callback(responseCodes.OK, {"uuid" : doc[0]._id, "sid" : doc[0].shared_id});
	});
};

DBInterface.prototype.getHeadOf = function(dbName, project, branch, getFunc, callback) {
	'use strict';

	var self = this;

	let branch_id;

	if (branch === "master") {
		branch_id = masterUUID;
	} else {
		branch_id = stringToUUID(branch);
	}

	var historyQuery = {
		shared_id : branch_id
	};

	var projection = {
		_id : 1
	};

	dbConn(self.logger).getLatest(dbName, project + ".history", historyQuery, projection, function(err, doc) {
		if (err.value) {
			return callback(err);
		}

		if (!doc.length){
			return callback(responseCodes.PROJECT_HISTORY_NOT_FOUND);
		}


		getFunc.call(self, dbName, project, uuidToString(doc[0]._id), function(err, doc) {
			if(err.value) {
				return callback(err);
			}

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
		_id :	   1,
		shared_id: 1,
		author:    1,
		message:   1,
		tag:	   1,
		timestamp: 1
	};

	dbConn(self.logger).filterColl(dbName, project + ".history", filter, projection, function(err, doc) {
		if (err.value) {
			return callback(err);
		}

		if (!doc.length) {
			return callback(responseCodes.PROJECT_HISTORY_NOT_FOUND);
		}

		doc = doc[0];

		rev = {};

		rev.revision	= uuidToString(doc._id); // TODO: Input real name
		rev.author		= ("author" in doc) ? doc.author : "unnamed";
		rev.message		= ("message" in doc) ? doc.message : "";
		rev.tag			= ("tag" in doc) ? doc.tag : "";
		rev.branch		= uuidToString(doc.shared_id);

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
		if(!doc[0]) {
			return callback(responseCodes.PROJECT_HISTORY_NOT_FOUND);
		}

		var query = {
			type:	 "meta",
			subtype: "readme",
			_id		  : { $in : doc[0].current}
		};

		dbConn(self.logger).filterColl(dbName, project + ".scene", query, null, function(err, readme) {
			if(err.value) {
				return callback(err);
			}

			if (!readme.length) {
				callback(responseCodes.OK, {readme: "Readme Missing"});
			} else {
				callback(responseCodes.OK, {readme : readme[0].metadata.text});
			}
		});
	});
};

DBInterface.prototype.getRevisions = function(dbName, project, branch, from, to, full, callback) {

	var filter = {
		type: "revision"
	};

	if(branch) {
		if (branch === "master") {
			filter.shared_id = masterUUID;
		} else {
			filter.shared_id = stringToUUID(branch);
		}
	}

	var projection = null;

	if (from && to)
	{
		projection = {
			_id : { $slice: [from, (to - from + 1)]}
		};
	}

	if (!full)
	{
		if(!projection) {
			projection = {};
		}

		projection._id = 1;
	}

	dbConn(this.logger).filterColl(dbName, project + ".history", filter, projection, function(err, doc) {
		if (err.value) {
			return callback(err);
		}

		var revisionList = [];

		doc.forEach((item, i) => {
			var revisionName = uuidToString(doc[i]._id);
			var rev = {};

			rev.name = revisionName;

			if (full) {
				if ("author" in doc[i])		{ rev.author = doc[i].author; }
				if ("timestamp" in doc[i])	{ rev.timestamp = doc[i].timestamp; }
				if ("message" in doc[i])	{ rev.message = doc[i].message; }
				if ("branch" in doc[i])		{ rev.branch = uuidToString(doc[i].shared_id); }
			}

			revisionList.push(rev);
		});

		callback(responseCodes.OK, revisionList);
	});
};


DBInterface.prototype.filterFederatedProject = function(dbName, project, branch, revision, filter, projection, populateProjectName, callback) {
	'use strict';

	var historyQuery = null;

	if (revision !== null)
	{
		historyQuery = {
			_id: stringToUUID(revision)
		};
	} else {

		let branch_id;

		if (branch === "master") {
			branch_id = masterUUID;
		} else {
			branch_id = stringToUUID(branch);
		}

		historyQuery = {
			shared_id:	branch_id
		};
	}

	var self = this;

	self.logger.logInfo("Filtering [" + project + " " + branch + " " + revision + "]");

	dbConn(this.logger).getLatest(dbName, project + ".history", historyQuery, null, function(err, docs)
	{
		if (err.value) {
			return callback(err.value);
		}

		if (!docs.length) {
			return callback(responseCodes.PROJECT_HISTORY_NOT_FOUND);
		}

		filter._id = { $in : docs[0].current };

		// First find the list of nodes that match the filter in the project.
		dbConn(self.logger).filterColl(dbName, project + ".scene", filter, projection, function(err, nodes) {
			if (err.value)
			{
				return err;
			}

			// Now get references to the subprojects
			var refFilter = {
				type: "ref",
				_id: { $in: docs[0].current}
			};

			var refProjection = {
				_rid : 1,
				owner: 1,
				project: 1,
				unique: 1
			};

			if (populateProjectName)
			{
				for(var i = 0; i < nodes.length; i++)
				{
					nodes[i].account = dbName;
					nodes[i].project = project;
				}
			}

			dbConn(self.logger).filterColl(dbName, project + ".scene", refFilter, refProjection, function(err, refs) {
				// Asynchronously loop over all references.
				async.concat(refs, function (item, iter_callback) {
					var childDbName  = item.owner ? item.owner : dbName;
					var childProject = item.project;

					var unique = ("unique" in item) ? item.unique : false;

					var childRevision, childBranch;

					if ("_rid" in item)
					{
						if (unique)
						{
							childRevision = uuidToString(item._rid);
							childBranch   = null;
						} else {
							childRevision = null;
							childBranch   = uuidToString(item._rid);
						}
					} else {
						childBranch   = "master";
						childRevision = null;
					}

					item.account = dbName;
					item.name = childProject;

					self.filterFederatedProject(childDbName, childProject, childBranch, childRevision, filter, projection, populateProjectName, function (err, childNodes) {
						if (err.value) {
							return iter_callback(err);
						}

						iter_callback(null, childNodes);
					});
				},
				function (err, results) {
					// TODO: Deal with errors here

					callback(responseCodes.OK, nodes.concat(results));
				});
			});
		});
	});
};

DBInterface.prototype.getFederatedProjectList = function(dbName, project, branch, revision, callback) {
	"use strict";

	return new Promise((resolve, reject) => {

		var historyQuery = null;

		if (revision !== null)
		{
			historyQuery = {
				_id: stringToUUID(revision)
			};
		} else {
			let branch_id;

			if (branch === "master") {
				branch_id = masterUUID;
			} else {
				branch_id = stringToUUID(branch);
			}

			historyQuery = {
				shared_id:	branch_id
			};
		}

		var self = this;

		dbConn(this.logger).getLatest(dbName, project + ".history", historyQuery, null, function(err, docs)
		{
			if (err.value) {
				reject(err);
				return callback && callback(err);
			}

			if (!docs.length) {
				reject(responseCodes.PROJECT_HISTORY_NOT_FOUND);
				return callback && callback(responseCodes.PROJECT_HISTORY_NOT_FOUND);
			}

			var filter = {
				type: "ref",
				_id: { $in: docs[0].current }
			};

			// var projection = {
			//	_rid : 1,
			//	owner: 1,
			//	project: 1,
			//	unique: 1
			// };

			dbConn(self.logger).filterColl(dbName, project + ".scene", filter, {}, function(err, refs) {
				if (err.value) {
					reject(err);
					return callback && callback(err);
				}

				async.concat(refs, function (item, iter_callback) {
					var childDbName  = item.owner ? item.owner : dbName;
					var childProject = item.project;

					var unique = ("unique" in item) ? item.unique : false;

					var childRevision, childBranch ;
					if ("_rid" in item)
					{
						if (unique)
						{
							childRevision = uuidToString(item._rid);
							childBranch   = null;
						} else {
							childRevision = null;
							childBranch   = uuidToString(item._rid);
						}
					} else {
						childBranch   = "master";
						childRevision = null;
					}

					self.getFederatedProjectList(childDbName, childProject, childBranch, childRevision, function (err, childrefs) {
						if (err.value) {
							return iter_callback(err);
						}

						iter_callback(null, childrefs);
					});
				},
				function (err, results) {
					if (err)
					{
						reject(err);
						return callback && callback(err);
					}

					resolve(refs.concat(results));
					callback && callback(responseCodes.OK, refs.concat(results));
				});
			});
		});
	});

};

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
		};
	}

	dbConn(this.logger).filterColl(dbName, project + ".issues", filter, projection, function (err, docs) {
		if (err.value) { return callback(err); }

		for(var i = 0; i < docs.length; i++) {
			docs[i]._id		= uuidToString(docs[i]._id);
			docs[i].parent	= uuidToString(docs[i].parent);
			docs[i].account = dbName;
			docs[i].project = project;
		}

		return callback(responseCodes.OK, docs);
	});
};

DBInterface.prototype.getIssues = function(dbName, project, branch, revision, onlyStubs, callback) {
	var self = this;

	// First get the main project issues
	self.getProjectSettings(dbName, project, function(err, settings) {
		if (err.value)
		{
			return callback(err);
		}

		self.getObjectIssues(dbName, project, null, null, onlyStubs, settings[0].type, function (err, docs) {
			if (err.value) {
				return callback(err);
			}

			var collatedDocs = docs;

			// Now search for all federated issues
			self.getFederatedProjectList(dbName, project, branch, revision, function (err, refs) {
				if (err.value) {
					return callback(err);
				}

				// If there are no federated projects
				if (!refs.length)
				{
					return callback(responseCodes.OK, docs);
				}

				async.concat(refs, function (item, iter_callback) {
					var childDbName  = item.owner ? item.owner : dbName;
					var childProject = item.project;

					var unique = ("unique" in item) ? item.unique : false;

					var childRevision, childBranch;

					//TO-ASK-TIM: childRevision and childBranch defined but never used
					if ("_rid" in item)
					{
						if (unique)
						{
							childRevision = uuidToString(item._rid);
							childBranch   = null;
						} else {
							childRevision = null;
							childBranch   = uuidToString(item._rid);
						}
					} else {
						childBranch   = "master";
				 		childRevision = null;
					}


					self.getProjectSettings(childDbName, childProject, function (err, settings) {
						if (err.value)
						{
							return callback(err);
						}

						var projectType = settings.length ? settings[0].type : undefined;

						// For all federated child projects get a list of shared IDs
						self.getObjectIssues(childDbName, childProject, null, null, onlyStubs, projectType, function (err, objIssues) {
							if (err.value) {
								return iter_callback(err);
							}

							iter_callback(null, objIssues);
						});
					});
				},
				function (err, results) {
					if (err) {
						return callback(err);
					}

					callback(responseCodes.OK, collatedDocs.concat(results));
				});
			});
		});
	});
};

DBInterface.prototype.getObjectIssues = function(dbName, project, sids, number, onlyStubs, typePrefix, callback) {
	if (sids !== null && sids.constructor !== Array) {
		sids = [sids];
	}

	var filter = {};

	if (sids !== null)
	{
		sids = sids.map( function (item) { return stringToUUID(item); } );

		filter = {
			parent : { $in : sids }
		};
	}

	if ( number ) {
		filter.number = number;
	}

	var projection = {};

	//TO-ASK-TIM: projection defined but never use?
	if (onlyStubs)
	{
		projection = {
			comments: 0
		};
	}

	dbConn(this.logger).filterColl(dbName, project + ".issues", filter, {}, function (err, docs) {
		if (err.value) { return callback(err); }

		for(var i = 0; i < docs.length; i++) {
			docs[i]._id		   = uuidToString(docs[i]._id);
			docs[i].typePrefix = typePrefix;
			docs[i].parent	   = docs[i].parent ? uuidToString(docs[i].parent) : undefined;
			docs[i].account    = dbName;
			docs[i].project    = project;
		}

		return callback(responseCodes.OK, docs);
	});
};

DBInterface.prototype.storeIssue = function(dbName, project, id, owner, data, callback) {
	var self = this,
		timeStamp = null,
		updateQuery = {};


	dbConn(this.logger).collCallback(dbName, project + ".issues", false, function(err, coll) {
		if(err.value) {
			return callback(err);
		}

		self.getProjectSettings(dbName, project, function(err, settings) {
			if (err.value)
			{
				return callback(err);
			}

			// Create new issue
			if (!data._id) {
				var newID = uuid.v1();

				self.logger.logDebug("Creating new issue " + newID + " for ID: " + id);

				var projection = {};
				projection[C.REPO_NODE_LABEL_SHARED_ID] = 1;

				self.getObject(dbName, project, id, null, null, false, projection, function(err, type, uid, fromStash, obj) {
					if (err.value && err.value !== responseCodes.OBJECT_NOT_FOUND.value) {
						return callback(err);
					}

					// TODO: Implement this using sequence counters
					coll.count(function(err, numIssues) {
						if (err) {
							return callback(responseCodes.DB_ERROR(err));
						}

						// This is a new issue
						data._id	 = stringToUUID(newID);
						data.created = (new Date()).getTime();

						if (obj)
						{
							data.parent  = obj.meshes[id][C.REPO_NODE_LABEL_SHARED_ID];
						}

						data.number  = numIssues + 1;

						if (!data.name) {
							data.name = "Issue" + data.number;
						}

						data.owner = owner;

						coll.insert(data, function(err, count) {
							if (err) {
								return callback(responseCodes.DB_ERROR(err));
							}

							self.logger.logDebug("Updated " + count + " records.");

							data.typePrefix  = settings.length ? settings[0].type : undefined;

							callback(responseCodes.OK, { account: dbName, project: project, issue_id : uuidToString(data._id), number : data.number, created : data.created, issue: data });
						});
					});
				});
			} else {
				self.logger.logDebug("Updating issue " + data._id);

				data._id = stringToUUID(data._id);

				timeStamp = (new Date()).getTime();
				if (data.hasOwnProperty("comment")) {
					if (data.hasOwnProperty("edit")) {
						updateQuery = {
							$set: {created: timeStamp}
						};
						updateQuery.$set["comments." + data.commentIndex + ".comment"] = data.comment;
					}
					else if (data.hasOwnProperty("delete")) {
						updateQuery = {
							$pull: {comments: {created: data.commentCreated}}
						};
					}
					else if (data.hasOwnProperty("set")) {
						updateQuery = {
							$set: {}
						};
						updateQuery.$set["comments." + data.commentIndex + ".set"] = true;
					}
					else {
						updateQuery = {
							$push: { comments: { owner: owner,	comment: data.comment, created: timeStamp} }
						};
					}
				}
				else if (data.hasOwnProperty("closed")) {
					if (data.closed) {
						updateQuery = {
							$set: { closed: true, closed_time: (new Date()).getTime() }
						};
					}
					else {
						updateQuery = {
							$set: { closed: false },
							$unset: { closed_time: "" }
						};
					}
				}
				else if (data.hasOwnProperty("assigned_roles")) {
					updateQuery = {
						$set: { assigned_roles: data.assigned_roles}
					};
				}
				else {
					updateQuery = {
						$set: { complete: data.complete, created: timeStamp }
					};
				}

				coll.update({ _id : data._id}, updateQuery, function(err, count) {
					if (err) { return callback(responseCodes.DB_ERROR(err)); }

					var typePrefix = settings.length ? settings[0].type : undefined;

					self.logger.logDebug("Updated " + count + " records.");
					callback(
						responseCodes.OK,
						{
							account: dbName,
							project: project,
							issue: data,
							issue_id : uuidToString(data._id),
							number: data.number,
							owner: owner,
							typePrefix: typePrefix,
							created: timeStamp
						}
					);
				});
			}
		});
	});
};

DBInterface.prototype.getBranches = function(dbName, project, callback) {
	var filter = {
		type: "revision"
	};

	var projection = {
		shared_id : 1
	};

	dbConn(this.logger).filterColl(dbName, project + ".history", filter, projection, function(err, doc) {
			if (err.value) {
				return callback(err);
			}

			var branchList = [];

			doc.forEach((item, i) => {
				var branchName = uuidToString(doc[i].shared_id);

				if (branchList.map(function (e) { return e.name; }).indexOf(branchName) === -1){
					branchList.push({ name: uuidToString(doc[i].shared_id)});
				}
			});

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
			if (err.value) { return callback(err); }

			for(var i = 0; i < metadocs.length; i++){
				metadocs[i]._id = uuidToString(metadocs[i]._id);
			}

			callback(responseCodes.OK, metadocs);
		});
	} else {
		// In this case we want an object with a specific uid
		// first we find the revision that it belongs to
		var historyQuery = {
			current : stringToUUID(uid)
		};

		var historyProjection = {
			_id		  : 1,
			shared_id : 1
		};

		dbConn(self.logger).filterColl(dbName, project + ".history", historyQuery, historyProjection, function(err, revisions) {
			if (err.value) { return callback(err); }

			if (!revisions.length) {
				return callback(responseCodes.OBJECT_NOT_FOUND);
			}

			var revision = uuidToString(revisions[0][C.REPO_NODE_LABEL_UNIQUE_ID]);

			self.getObject(dbName, project, uid, null, null, false, { shared_id : 1 }, function(err, type, uid, fromStash, objs) {
				if (err.value) {
					return callback(err);
				}

				var objSID = Object.keys(objs.all)[0];

				var filter = {
					parents: utils.stringToUUID(objSID),
					type:	 C.REPO_NODE_TYPE_META
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
					if (err.value) { return callback(err); }

					for(var i = 0; i < metadocs.length; i++) {
						metadocs[i]._id = uuidToString(metadocs[i]._id);
					}

					callback(responseCodes.OK, metadocs);
				});
			});
		});
	}
};

//TO-ASK-TIM: what is this? and what is _extRef
DBInterface.prototype.appendMeshFiles = function(dbName, project, fromStash, uid, obj, callback)
{
	var self = this;
	var subColl = fromStash ? "stash.3drepo" : "scene";

	self.logger.logTrace("Retrieving mesh files and appending");

	if (obj._extRef !== undefined)
	{
		// TODO: Make this more generic, get filename from field
		async.each(Object.keys(obj._extRef), function (type, callback) {
			var fileName = obj._extRef[type];

			dbConn(self.logger).getGridFSFile(dbName, project + "." + subColl, fileName, function(err, data)
			{
				if (!err.value) {
					obj[type] = data;
				}

				callback();
			});
		}, function () {
			return callback(responseCodes.OK, "mesh", uid, fromStash, repoGraphScene(self.logger).decode([obj]));
		});
	} else {
		return callback(responseCodes.OK, "mesh", uid, fromStash, repoGraphScene(self.logger).decode([obj]));
	}
};

DBInterface.prototype.cacheFunction = function(dbName, collection, url, format, generate, callback)
{
	"use strict";
	var self = this;

	// Get the format of the file
	var stashCollection = collection + "." + C.REPO_COLLECTION_STASH + "." + format;

	if (!config.disableCache)
	{
		dbConn(self.logger).getGridFSFile(dbName, stashCollection, url, function(err, result) {
			if (err.value === responseCodes.FILE_DOESNT_EXIST.value) {
				self.logger.logInfo("Doesn't exist in stash, generating ...");

				generate(function(generateErr, data) {
					if (generateErr.value)
					{
						return callback(generateErr);
					}

					self.logger.logInfo("Storing in " + dbName + " : " + stashCollection);
					dbConn(self.logger).storeGridFSFile(dbName, stashCollection, url, data, false, function(stashErr) {
						if (stashErr.value)
						{
							return callback(stashErr);
						}

						callback(responseCodes.OK, data);
					});
				});
			} else if (err.value) {
				callback(err);
			} else {
				self.logger.logInfo("Retrieved from stash");

				callback(responseCodes.OK, result.buffer);
			}
		});
	} else {
		self.logger.logInfo("Stash disabled, generating ...");

		generate(function(err, data) {
			if (err.value)
			{
				return callback(err);
			}

			callback(responseCodes.OK, data);
		});
	}
};

DBInterface.prototype.getObject = function(dbName, project, uid, rid, sid, needFiles, projection, callback) {
	var self = this;

	self.logger.logDebug("Requesting object (U, R, S) (" + uid + "," + rid + "," + sid + ")");

	// TODO: Get mesh files on demand

	// We need at least these fields for object construction
	if (projection !== null && Object.keys(projection).length)
	{
		projection._id		 = 1;
		projection.shared_id = 1;
		projection.type		 = 1;
	}

	var query;

	if (uid)
	{
		query = {
			_id: stringToUUID(uid)
		};
		//TO-ASK-TIM: what is .stash.3drepo
		dbConn(self.logger).filterColl(dbName, project + ".stash.3drepo", query, projection, function(err, obj) {
			if (err.value || !obj.length)
			{
				// TODO: At this point we should generate the scene graph
				// There is no stash so just pass back the unoptimized scene graph

				dbConn(self.logger).filterColl(dbName, project + ".scene", query, projection, function(err, obj) {
					if (err.value) { return callback(err); }

					if (!obj.length) {
						return callback(responseCodes.OBJECT_NOT_FOUND);
					}

					var type = obj[0].type;
					var uid = uuidToString(obj[0]._id);

					if ((type === "mesh") && needFiles)
					{
						self.appendMeshFiles(dbName, project, false, uid, obj[0], callback);
					} else {
						return callback(responseCodes.OK, type, uid, false, repoGraphScene(self.logger).decode(obj));
					}
				});
			} else {
				var type = obj[0].type;
				var uid = uuidToString(obj[0]._id);

				//var sceneObj = repoGraphScene(self.logger).decode(obj);

				// TODO: Make this more concrete
				// if a mesh load the vertices, indices, colors etc from GridFS
				if ((type === "mesh") && needFiles)
				{
					self.appendMeshFiles(dbName, project, true, uid, obj[0], callback);
				} else {
					return callback(responseCodes.OK, type, uid, true, repoGraphScene(self.logger).decode(obj));
				}
			}
		});

	} else if (rid && sid) {

		query = {
			shared_id : stringToUUID(sid),
		};

		self.queryScene(dbName, project, null, rid, query, {}, function(err, fromStash, obj) {
			if (err.value) { return callback(err); }

			if (!obj.length) {
				return callback(responseCodes.OBJECT_NOT_FOUND);
			}

			var type = obj[0].type;
			var uid = uuidToString(obj[0]._id);

			if ((type === "mesh") && needFiles)
			{
				self.appendMeshFiles(dbName, project, fromStash, uid, obj[0], callback);
			} else {
				return callback(responseCodes.OK, type, uid, fromStash, repoGraphScene(self.logger).decode(obj));
			}
		});
	} else {
		return callback(responseCodes.RID_SID_OR_UID_NOT_SPECIFIED, null, null, null);
	}
};

DBInterface.prototype.getScene = function(dbName, project, branch, revision, full, callback) {

	var projection ;

	if (!full)
	{
		projection = {
			vertices: 0,
			normals: 0,
			faces: 0,
			data: 0,
			uv_channels: 0
		};
	} else {
		projection = {};
	}

	var self = this;

	self.queryScene(dbName, project, branch, revision, {}, projection, function(err, fromStash, coll) {
		callback(responseCodes.OK, repoGraphScene(self.logger).decode(coll));
	});
};

// TODO: Get rid of this function
DBInterface.prototype.queryUnoptimizedScene = function(dbName, project, branch, revision, full, filter, callback)
{
	var historyQuery = null;

	if (!filter) {
		filter = {};
	}

	if (revision)
	{
		historyQuery = {
			_id: stringToUUID(revision)
		};
	} else {
		var branch_id;

		if (branch === 'master') {
			branch_id = masterUUID;
		} else {
			branch_id = stringToUUID(branch);
		}

		historyQuery = {
			shared_id:	branch_id
		};
	}

	var self = this;

	dbConn(self.logger).getLatest(dbName, project + '.history', historyQuery, null, function(err, docs)
	{
		if (err.value) { return callback(err); }

		if (!docs.length) {
			return callback(responseCodes.PROJECT_HISTORY_NOT_FOUND);
		}

		filter[C.REPO_NODE_LABEL_UNIQUE_ID] = { $in: docs[0][C.REPO_NODE_LABEL_CURRENT] };

		dbConn(self.logger).filterColl(dbName, project + '.scene', filter, null, function(err, doc) {
			if (err.value) { return callback(err); }

			if (!doc.length) {
				return callback(responseCodes.ROOT_NODE_NOT_FOUND);
			}

			callback(responseCodes.OK, repoGraphScene(self.logger).decode(doc));
		});
	});
};

DBInterface.prototype.getDiff = function(account, project, branch, revision, otherbranch, otherrevision, callback) {
	var historyQuery = null;

	if (revision !== null)
	{
		historyQuery = {
			_id: stringToUUID(revision)
		};
	} else {

		var branch_id;

		if (branch === "master") {
			branch_id = masterUUID;
		} else {
			branch_id = stringToUUID(branch);
		}

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
		if(err.value) { return callback(err); }

		if(!history[0]) {
			return callback(responseCodes.BRANCH_NOT_FOUND);
		}

		var otherHistoryQuery = null;

		if (revision !== null)
		{
			otherHistoryQuery = {
				_id: stringToUUID(otherrevision)
			};
		} else {

			var branch_id;

			if (branch === "master"){
				branch_id = masterUUID;
			} else {
				branch_id = stringToUUID(otherbranch);
			}

			otherHistoryQuery = {
				shared_id:	branch_id
			};
		}

		dbConn(self.logger).getLatest(account, project + ".history", otherHistoryQuery, null, function(err, otherhistory)
		{
			if (err.value) { return callback(err); }

			if(!otherhistory[0]) {
				return callback(responseCodes.BRANCH_NOT_FOUND);
			}

			var doc = {};

			var historycurrent		= history[0].current;
			var otherhistorycurrent = otherhistory[0].current;

			historycurrent		= historycurrent.map(function(uid) { return uuidToString(uid); });
			otherhistorycurrent = otherhistorycurrent.map(function(uid) { return uuidToString(uid); });

			doc.added = otherhistorycurrent.filter( function (elem)
				{
					return (historycurrent.indexOf(elem) === -1);
				}
			);

			doc.deleted = historycurrent.filter( function (elem)
				{
					return (otherhistorycurrent.indexOf(elem) === -1);
				}
			);

			// TODO: Compute the modified
			//if (doc["modified"])
			//	doc["modified"] = doc["modified"].map(function(uid) { return uuidToString(uid); });

			self.getUIDMap(account, project, doc.added.concat(doc.deleted), function (err, map) {
				if (err.value) { return callback(err); }

				doc.added	= doc.added.map(function(elem) { return map[elem]; });
				doc.deleted = doc.deleted.map(function(elem) { return map[elem]; });

				callback(responseCodes.OK, doc);
			});
		});
	});
};

/*******************************************************************************
 * Get list of roles by database
 *
 * @param {string} dbName - Database name which holds the project
 * @param {number} readWriteAny - Select what permissions the role should have
 * @param {function} callback - function to return the list of roles
 ******************************************************************************/
DBInterface.prototype.getRolesByDatabase = function(dbName, readWriteAny, callback)
{
	"use strict";
	var collection = "system.roles";

	var filter = {};

	self.filterColl(dbName, collection, filter, {}, function (err, docs) {
		if (err.value)
		{
			return callback(err);
		}

		var rolesToReturn = [];

		for (var i = 0; i < docs.length; i++)
		{
			if (docs[i].privileges.length)
			{
				if (readWriteAny !== C.REPO_ANY)
				{
					var validActions= docs[i].privileges[0].actions;
					var privilegeType = 0;

					if (validActions.indexOf("find") !== -1) { privilegeType |= 1; }
					if (validActions.indexOf("insert") !== -1) { privilegeType |= 2; }

					if (privilegeType === readWriteAny)
					{
						rolesToReturn.push(docs[i]);
					}
				}
			}
		}

		return callback(responseCode.OK, rolesToReturn);
	});
};

/*******************************************************************************
 * Get list of roles by project
 *
 * @param {string} dbName - Database name which holds the project
 * @param {string} project - Project to which the permissions apply
 * @param {number} readWriteAny - A permission type filter (see constants.js)
 * @param {function} callback - function to return the list of roles
 ******************************************************************************/
DBInterface.prototype.getRolesByProject = function(dbName, project, readWriteAny, callback)
{
	"use strict";
	var self = this;

	var adminDatabase = "admin";
	var collection = "system.roles";
	var filter = {};

	// Get all roles which have permissions on this project

	filter.db = { $in : ["admin", dbName] };
	filter.privileges = {
		$elemMatch : { "resource.collection" : project + ".history" }
	};

	dbConn(self.logger).filterColl(adminDatabase, collection, filter, {}, function (err, docs) {
		if (err.value)
		{
			return callback(err);
		}

		var rolesToReturn = [];

		for (var i = 0; i < docs.length; i++)
		{
			if (docs[i].privileges.length)
			{
				if (readWriteAny !== C.REPO_ANY)
				{
					var validActions= docs[i].privileges[0].actions;
					var privilegeType = 0;

					if (validActions.indexOf("find") !== -1) { privilegeType |= 1; }
					if (validActions.indexOf("insert") !== -1) { privilegeType |= 2; }

					if (privilegeType === readWriteAny)
					{
						rolesToReturn.push(docs[i]);
					}
				} else {
					 rolesToReturn.push(docs[i]);
				}
			}
		}

		// Add role settings (like role color) to the returned data
		if (rolesToReturn.length > 0) {
			var roles = rolesToReturn.map(function(role) {
				return role.role;
			});
			self.getRoleSettings(dbName, roles, function (err, roleSettings) {
				if (roleSettings.length > 0) {
					var roleSettingsMap = {};

					for(let i = 0; i < roleSettings.length; i++)
					{
						roleSettingsMap[roleSettings[i]._id] = roleSettings[i];
					}

					for (let i = 0; i < rolesToReturn.length; i++) {
						if(roleSettingsMap[rolesToReturn[i].role]){
							rolesToReturn[i].color = roleSettingsMap[rolesToReturn[i].role].color;
						}

					}
				}
				return callback(responseCodes.OK, rolesToReturn);
			});
		}
		else {
			return callback(responseCodes.OK, rolesToReturn);
		}
	});
};

// Get list of roles to check permissions on a project
// Get a user's current role for a project
// Get a list of valid roles for a project and their associated role.

/*******************************************************************************
 * Get settings for a particular role
 *
 * @param {string} dbName - Database name which holds the project
 * @param {array} roles - list of role names
 * @param {function} callback - function to return the list of roles
 ******************************************************************************/
DBInterface.prototype.getRoleSettings = function(dbName, roles, callback)
{
	"use strict";
	var self = this;

	if (roles.constructor !== Array)
	{
		roles = [roles];
	}

	var filter = { _id : { $in : roles}};

	dbConn(self.logger).filterColl(dbName, "settings.roles", filter, {}, function (err, docs) {
		if (err.value)
		{
			return callback(err, []);
		}

		return callback(responseCodes.OK, docs);
	});
};

/*******************************************************************************
 * Get settings for a particular project
 *
 * @param {string} dbName - Database name which holds the project
 * @param {string} projectName - Name of the project you want settings for
 * @param {function} callback - function to return the list of roles
 ******************************************************************************/
DBInterface.prototype.getProjectSettings = function(dbName, projectName, callback)
{
	"use strict";
	var self = this;

	var filter = {
		"_id" : projectName
	};

	dbConn(self.logger).filterColl(dbName, "settings", filter, {}, function (err, settings) {
		if (err.value)
		{
			return callback(err);
		}

		callback(responseCodes.OK, settings);
	});
};

DBInterface.prototype.getUserRolesForProject = function(database, project, username, callback)
{
	"use strict";
	var self = this;

	self.getRolesByProject(database, project, C.REPO_ANY, function(err, projectRoles) {
		if (err.value)
		{
			return callback(err);
		}

		var projectRoleNames = projectRoles.map(function(projectRole) { return projectRole.role; });

		self.getUserRoles(username, database, function(err, userRoles) {
			var userRoleNames = userRoles.map(function(userRole) { return userRole.role; });
			var rolesToReturn = [];

			for(var i = 0; i < userRoleNames.length; i++)
			{
				if(projectRoleNames.indexOf(userRoleNames[i]) !== -1)
				{
					rolesToReturn.push(userRoleNames[i]);
				}
			}

			return callback(responseCodes.OK, rolesToReturn);
		});
	});
};

/******************************************************************************
 * Get roles granted to a user within a specific database
 * The function will find all roles within the specified database and also
 * admin database and return this on the callback
 *
 * @param {string} username - username of the user
 * @param {string} database - database we are interested in
 * @param {function} callback - get filtered roles from database
 *								pass to callback as parameter
 ******************************************************************************/
DBInterface.prototype.getRoles = function (database, username, full, callback) {
	"use strict";
	var self = this;

	var dbName = "admin";
	// var collName = "system.users";
	// var filter = {};
	// var rolesToReturn = [];

	// If the username is supplied, start by getting the roles just for this user
	if (username)
	{
		self.getUserRoles(username, dbName, function (err, userRoles)
		{
			if (err.value)
			{
				return callback(err);
			}

			var roleNames = userRoles.map( function (userRole) {
				return userRole._id.replace(".history", "");
			});

			self.getRoleSettings(database, roleNames, function(err, roleSettings)
			{
				for (var i = 0; i < roleNames.length; i++)
				{
					delete roleSettings[i]._id; // Delete the ID attach to the settings
					_.extend(userRoles[i], roleSettings[i]);
				}

				return callback(responseCodes.OK, userRoles);
			});

		});
	} else {
		self.getRolesByDatabase(database, C.REPO_ANY, function(err, dbRoles) {
			if (err.value)
			{
				return callback(err);
			}

			var roleNames = dbRoles.map( function (dbRole) {
				return dbRole._id.replace(".history", "");
			});

			self.getRoleSettings(database, roleNames, function(err, roleSettings)
			{
				for (var i = 0; i < roleNames.length; i++)
				{
					delete roleSettings[i]._id; // Delete the ID attach to the settings
					_.extend(dbRoles[i], roleSettings[i]);
				}

				return callback(responseCodes.OK, dbRoles);
			});
		});
	}
};

/*******************************************************************************
 * Get roles granted to a user within a specific database
 * The function will find all roles within the specified database and also
 * admin database and return this on the callback
 *
 * @param {string} username - username of the user
 * @param {string} database - database we are interested in
 * @param {function} callback - get filtered roles from database
 *								pass to callback as parameter
 ******************************************************************************/
DBInterface.prototype.getUserRoles = function (username, database, callback) {
	"use strict";

	var self = this;

	var dbName = "admin";
	var collName = "system.users";
	var filter = { "user" : username };

	//only return roles in admin and the specified database, the rest are irrelevant.
	var projection = { "roles" : 1 };

	dbConn(self.logger).filterColl(dbName, collName, filter, projection, function(err, docs) {
		if (err.value) {
			return callback(err);
		}

		if (docs.length !== 1) {
			self.logger.logError("Unexpected number of documents found in getUserRoles() for USER=" + username + " size:" + docs.length);
			return callback(responseCodes.USER_NOT_FOUND, docs);
		}

		var roles;
		if (database)
		{
			roles = [];

			for (let i = 0; i < docs[0].roles.length; i++) {
				if (docs[0].roles[i].db === dbName || docs[0].roles[i].db === database) {
					roles.push(docs[0].roles[i]);
				}
			}
		} else {
			roles = docs[0].roles;
		}

		callback(responseCodes.OK, roles);
	});
};

/*******************************************************************************
 * Get the list of privileges the user has on the database
 *
 * @param {string} username - username of the user
 * @param {string} database - database we are interested in
 * @param {function} callback - get filtered privileges from database
 *								pass to callback as parameter
 ******************************************************************************/
DBInterface.prototype.getUserPrivileges = function (username, database, callback) {
	"use strict";
	var self = this;

	var adminDB = "admin";

	//First get all the roles this user is granted within the databases of interest
	 self.getUserRoles(username, database, function (err, roles) {
		if (err.value) {
			return callback(err);
		}

		if (!roles || roles.length === 0) {
			//no roles under this user, no point trying to find privileges
			return callback(responseCodes.OK, []);
		}

		dbConn(self.logger).dbCallback(adminDB, function (err, dbConn) {
			var command = { rolesInfo : roles, showPrivileges: true };
			//Given the roles, get the privilege information
			dbConn.command(command, function (err, docs) {
				if (err) {
					return callback(responseCodes.DB_ERROR(err));
				}

				if (!docs || docs.roles.length === 0) {
					//No privileges return empty array
					return callback(responseCodes.OK, []);
				}

				var rolesArr = docs.roles;
				var privileges = [];

				for (var i = 0; i < rolesArr.length; i++) {
					privileges = privileges.concat(rolesArr[i].inheritedPrivileges);
				}
				self.logger.logDebug(privileges.length + " privileges found.");
				callback(responseCodes.OK, privileges);
			});
		});
	});

};

DBInterface.prototype.uuidToString = uuidToString;


/* for test helper API */
DBInterface.prototype.createMainContractorRole = function(targetDb, project){

	return dbConn(this.logger).getDB(targetDb).then(db => {
		return db.command({

			createRole: "MainContractor",
			privileges: [{
				resource: {
					db: targetDb, collection:  `${project}.packages`
				},
				actions: [ "find", "update", "insert", "remove" ]
			}],
			roles: []
		});
	});
};

/* for test helper API */
DBInterface.prototype.grantUserMainContractorRole = function(user, targetDb){

	return dbConn(this.logger).getDB('admin').then(db => {
		return db.command({

			grantRolesToUser: user,
			roles: [{ role: 'MainContractor', db: targetDb}]
		});
	});
};

module.exports = function(logger) {
	"use strict";

	return new DBInterface(logger);
};
