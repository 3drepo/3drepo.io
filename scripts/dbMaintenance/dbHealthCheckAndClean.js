var autoFix = false;
log('===== DB Health check [Auto fix: ' + autoFix + '] ======');

var specialDB = ['admin', 'local', 'notifications'];
var indent = 0;

var adminDB = db.getSiblingDB('admin');
var userCol = adminDB.getCollection('system.users');
var TEAM_MEMBER_ROLE = "team_member";

function log(msg) {
	var prefix = '';
	for(var i = 0; i < indent; ++i) prefix += '\t';
	print(`${prefix}${msg}`);
}

function addSubSection() ++indent;
function exitSubSection() --indent;

function checkDatabaseEntries() {
	log('1. Checking that all databases have an entry in admin.users...');

	addSubSection();
	var users = {};
	userCol.find({}, {user: 1}).forEach(function(entry) {
		users[entry.user] = 1;
	});

	var msg = autoFix ? 'The following databases have been removed:' : 'The following dbs are unaccounted for:';
	log(`${msg}`);
	databaseList = adminDB.adminCommand({listDatabases: 1}).databases.forEach(function(dbEntry) {
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
	userEntry.customData.permissions.forEach(function(perm) {
		if(members.indexOf(perm.user) == -1) {
			permChanged = true;
			log(`${perm.user} has teamspace privileges but not a member.`);
		}
		else
			updatedPerm.push(perm);
	});

	if (permChanged && autoFix) {
		log("Removing incorrect teamspace permissions...");
		userCol.update({user: dbName}, {$set: { "customData.permissions": updatedPerm }});
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
				projectCol.update(project, {$set: { permissions: updatedPerm }});
			}
		});
	});
}

function checkJobAndPermissions() {
	log('2. Check only team members are assigned to jobs and permissions');
	addSubSection();
	adminDB.adminCommand({listDatabases: 1}).databases.forEach(function(dbEntry) {
		var dbName = dbEntry.name;
		if(specialDB.indexOf(dbName) > -1) return;
		var thisDB = db.getSiblingDB(dbName);
		log(`===${dbName}===`);
		addSubSection();

		checkTeamMemberRole(thisDB, dbName);
		var members = checkTeamMemberCount(dbName);
		checkTeamspacePrivileges(dbName, members);
		checkProjectPrivileges(thisDB, members);

		exitSubSection();
	});
	exitSubSection();
}


checkDatabaseEntries();
checkJobAndPermissions();
