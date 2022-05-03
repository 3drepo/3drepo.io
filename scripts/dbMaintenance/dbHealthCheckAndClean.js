var autoFix = false;
log('===== DB Health check [Auto fix: ' + autoFix + '] ======');

var specialDB = ['admin', 'local', 'notifications'];
var indent = 0;

var adminDB = db.getSiblingDB('admin');
var userCol = adminDB.getCollection('system.users');
var TEAM_MEMBER_ROLE = "team_member";

var dbList = null;

function log(msg) {
	var prefix = '';
	for(var i = 0; i < indent; ++i) prefix += '\t';
	print(`${prefix}${msg}`);
}

function enterSubSection() ++indent;
function exitSubSection() --indent;

function getDatabaseList(useCache = true) {
	if(dbList && useCache) return dbList;
	dbList = adminDB.adminCommand({listDatabases: 1}).databases;
	return dbList;
}

function checkDatabaseEntries() {
	log('1. Checking that all databases have an entry in admin.users...');

	enterSubSection();
	var users = {};
	userCol.find({}, {user: 1}).forEach(function(entry) {
		users[entry.user] = 1;
	});

	var msg = autoFix ? 'The following databases have been removed:' : 'The following dbs are unaccounted for:';
	log(`${msg}`);
	databaseList = getDatabaseList().forEach(function(dbEntry) {
		var dbName = dbEntry.name;
		if(specialDB.indexOf(dbName) == -1  && !users[dbName]) {
			if(autoFix) {
				db.getSiblingDB(dbName).dropDatabase();
			}
			log('' + dbName);
		}
	});
	exitSubSection();
}

function checkTeamMemberRole(thisDB, dbName) {
	if(!thisDB.getRole(TEAM_MEMBER_ROLE)) {
		log(`This teamspace has no member role. ${autoFix ? "Adding role..." : ""}`);
		if(autoFix)
			var retVal = thisDB.createRole({
				role: TEAM_MEMBER_ROLE,
				privileges:[
					{
						"resource" : {
							"db" : dbName,
							"collection" : "settings"
						},
						"actions" : [
							"find"
						]
					}
				],
				roles: []
			});
	}
}

function checkTeamMemberCount(dbName) {
	var members = [];
	var foundOwner = false;
	//Get list of teamspace members
	userCol.find({'roles.db' : dbName}, {user : 1 }).forEach(function(entry) {
		foundOwner = foundOwner || entry.user == dbName;
		members.push(entry.user);
	});

	if(!foundOwner) {
		var msg = `This teamspace has no team member. ${autoFix ? 'Adding owner to role' : ''}`;
		log(msg);
		if(autoFix)
			adminDB.grantRolesToUser(dbName, [{ db: dbName, role: TEAM_MEMBER_ROLE}]);
	}

	return members;
}

function checkTeamspacePrivileges(dbName, members) {
	var userEntry = userCol.findOne({user: dbName});

	var updatedPerm = [];
	var permChanged = false;
	if(userEntry) {
		userEntry.customData.permissions.forEach(function(perm) {
			if(members.indexOf(perm.user) == -1) {
				permChanged = true;
				log(`${perm.user} has teamspace privileges but not a member.`);
			}
			else
				updatedPerm.push(perm);
		});
	}

	if (permChanged && autoFix) {
		log("Removing incorrect teamspace permissions...");
		userCol.updateOne({user: dbName}, {$set: { "customData.permissions": updatedPerm }});
	}
}

function checkProjectPrivileges(thisDB, members) {
	var projectCol = thisDB.getCollection("projects");
	projectCol.find().forEach(function(project){
		project.permissions.forEach(function(perm) {
			var updatedPerm = [];
			var needUpdate = false;
			if(members.indexOf(perm.user) > -1) {
				updatedPerm.push(perm);
			} else {
				needUpdate = true;
				log(`[${project.name}]${perm.user} has project permissions but not a member`);
			}

			if(needUpdate && autoFix) {
				log(`[${project.name}]Removing incorrect project permissions...`);
				projectCol.updateOne(project, {$set: { permissions: updatedPerm }});
			}
		});
	});
}

function checkModelPrivileges(thisDB, members) {
	var modelCol = thisDB.getCollection("settings");
	modelCol.find().forEach(function(model){
		model.permissions && model.permissions.forEach(function(perm) {
			var updatedPerm = [];
			var needUpdate = false;
			if(members.indexOf(perm.user) > -1) {
				updatedPerm.push(perm);
			} else {
				needUpdate = true;
				log(`[${model.name}]${perm.user} has model permissions but not a member`);
			}

			if(needUpdate && autoFix) {
				log(`[${model.name}]Removing incorrect model permissions...`);
				modelCol.updateOne(model, {$set: { permissions: updatedPerm }});
			}
		});
	});
}

function checkJobAndPermissions() {
	log('2. Check only team members are assigned to jobs and permissions');
	enterSubSection();
	getDatabaseList().forEach(function(dbEntry) {
		var dbName = dbEntry.name;
		if(specialDB.indexOf(dbName) > -1) return;
		var thisDB = db.getSiblingDB(dbName);
		log(`===${dbName}===`);
		enterSubSection();

		checkTeamMemberRole(thisDB, dbName);
		var members = checkTeamMemberCount(dbName);
		checkTeamspacePrivileges(dbName, members);
		checkProjectPrivileges(thisDB, members);
		checkModelPrivileges(thisDB, members);

		exitSubSection();
	});
	exitSubSection();
}

function findZombieModels() {
	log('3. Find zombie model entries');
	enterSubSection();
	getDatabaseList().forEach(function(dbEntry) {
		var dbName = dbEntry.name;
		if(specialDB.indexOf(dbName) > -1) return;
		log(`===${dbName}===`);
		enterSubSection();
		var thisDB = db.getSiblingDB(dbName);
		var modelSettingsCol = thisDB.getCollection("settings");
		var foundModel = {};
		thisDB.getCollectionNames().forEach(function(colName) {
			var colNameArr = colName.split(".");
			if(colNameArr.length > 1) {
				var modelID = colNameArr[0];
				foundModel[modelID] = foundModel.hasOwnProperty(modelID) ?
					foundModel[modelID] : modelSettingsCol.findOne({_id : modelID});

				if (!foundModel[modelID]) {
					log(`Zombie collection found: ${colName}${autoFix? ". Removing..." : ""}`);
					if(autoFix) {
						thisDB.getCollection(colName).drop();
					}
				}
			}
		});

		exitSubSection();
	});
	exitSubSection();
}

function removeModel(thisDB, modelID, colNames, dropEntry = false) {
	if(!autoFix) return;
	colNames.forEach(function(colName) {
		if(colName.split(".")[0] === modelID) {
			thisDB.getCollection(colName).drop();
		}
	});

	if(dropEntry) {
		thisDB.getCollection("settings").remove({_id: modelID});
	}
}

function checkModelCollections(thisDB, modelID, isFed, colNames) {
	var minExt = isFed? ["history", "scene", "stash.json_mpc.files", "stash.json_mpc.chunks"] :
		["history", "scene", "stash.json_mpc.files", "stash.json_mpc.chunks", "stash.3drepo", "stash.unity3d", "stash.unity3d.files", "stash.unity3d.chunks"]
		;
	var count = 0;
	var colToMatch = {};

	minExt.forEach(function(ext) {
		colToMatch[`${modelID}.${ext}`]  = 1;
	});

	colNames.forEach(function(colName) {
		if(colToMatch[colName]) {
			++count;
			delete colToMatch[colName];
		}
	});
	if(count > 0 && count != minExt.length) {
		log(`Failed to find some essential collections for ${modelID} :`);
		enterSubSection();
		Object.keys(colToMatch).forEach(function(name) log(name));
		exitSubSection();
		if(autoFix) {
			log(`Removing all collections associated with ${modelID}...`);
			removeModel(thisDB, modelID, colNames);
		}
	}
}
function checkGridFSPairs(thisDB, modelID, colNames) {
	colNames.forEach(function(colName) {
		var colSplit = colName.split(".");
		if(colSplit[0] === modelID) {
			if(colSplit[colSplit.length -1] === "files") {
				colSplit[colSplit.length -1] = "chunks";
				var chunkName = colSplit.join(".");
				if(colNames.indexOf(chunkName) === -1) {
					log(`Cannot find chunks col for ${colName}. ${autoFix? "removing..." : ""}`);
					if(autoFix) {
						thisDB.getCollection(colName).drop();
					}
				}
			} else if (colSplit[colSplit.length -1] === "chunks") {
				colSplit[colSplit.length -1] = "files";
				var fileName = colSplit.join(".");
				if(colNames.indexOf(fileName) === -1) {
					log(`Cannot find files col for ${colName}. ${autoFix? "removing..." : ""}`);
					if(autoFix) {
						thisDB.getCollection(colName).drop();
					}
				}
			}
		}
	});
}

function checkModelIDFormat(thisDB, modelID, colNames) {
	var regex = new RegExp(/[a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{12}/i);
	if(!regex.test(modelID)) {
		log(`Incorrect model ID format: ${modelID} ${autoFix? " Removing model... " : ""}`);
		if(autoFix) {
			removeModel(thisDB, modelID, colNames, true);
		}
		return false;
	}
	return true;
}

function checkModelInProject(thisDB, modelID, colNames) {
	if(!thisDB.getCollection("projects").findOne({models: modelID})){
		log(`${modelID} not in a project${autoFix? ". Removing..." : ""}`);
		if(autoFix) {
			removeModel(thisDB, modelID, colNames, true);
		}
		return false;
	}
	return true;
}

function checkModelSanity() {
	log('4. Model health check');
	enterSubSection();
	getDatabaseList().forEach(function(dbEntry) {
		var dbName = dbEntry.name;
		if(specialDB.indexOf(dbName) > -1) return;
		log(`===${dbName}===`);
		enterSubSection();
		var thisDB = db.getSiblingDB(dbName);
		var colList = thisDB.getCollectionNames();
		thisDB.getCollection("settings").find({status: {$ne: "processing"}}).forEach(function(model) {
			if (!checkModelIDFormat(thisDB, model._id, colList)) return;
			if (!checkModelInProject(thisDB, model._id, colList)) return;
			checkGridFSPairs(thisDB, model._id, colList);
			colList = thisDB.getCollectionNames(); //Refresh the list as items may be removed
			checkModelCollections(thisDB, model._id, model.federate, colList);
		});
		exitSubSection();
	});
	exitSubSection();
}

function checkProjectSanity() {
	log('5. Project health check');
	enterSubSection();
	getDatabaseList().forEach(function(dbEntry) {
		var dbName = dbEntry.name;
		if(specialDB.indexOf(dbName) > -1) return;
		log(`===${dbName}===`);
		enterSubSection();
		var thisDB = db.getSiblingDB(dbName);
		var models = {};
		thisDB.getCollection("settings").find({},{_id: 1}).forEach(function(model) {
			models[model._id] = true;
		});

		var projCol = thisDB.getCollection("projects");
		projCol.find({}).forEach(function(project) {
			var newModels = [];
			project.models.forEach(function(entry){
				if(models[entry])
					newModels.push(entry);
				else
					log(`[${project.name}]Non existent model found: ${entry}`);
			});

			if(autoFix && project.models.length !== newModels.length) {
				log(`Updating project entry...`);
			 	projCol.updateOne(project, {$set: {models: newModels}});
			}
		});
		exitSubSection();
	});
	exitSubSection();

}


checkDatabaseEntries();
//Regenerate the db list to prune out removed dbs.
autoFix && getDatabaseList(false);
checkJobAndPermissions();
findZombieModels();
checkModelSanity();
checkProjectSanity();

