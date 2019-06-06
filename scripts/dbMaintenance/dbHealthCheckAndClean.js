var autoClean = false;
print('===== DB Health check [Auto clean: ' + autoClean + '] ======');

var specialDB = ['admin', 'local', 'notifications'];

function checkDatabaseEntries() {
	print('1. Checking that all databases have an entry in admin.users...');

	var users = {};
	db.getSiblingDB('admin').getCollection('system.users').find({}, {user: 1}).forEach(function(entry) {
		users[entry.user] = 1;
	});

	var msg = autoClean ? "The following databases have been removed:" : "The following dbs are unaccounted for:";
	print(`\t${msg}`);
	databaseList = db.getSiblingDB('admin').adminCommand({listDatabases: 1}).databases.forEach(function(dbEntry) {
		var dbName = dbEntry.name;
		if(specialDB.indexOf(dbName) == -1  && !users[dbName]) {
			if(autoClean) {
				db.getSiblingDB(dbName).dropDatabase();
			}
			print('\t\t' + dbName);
		}
	});
	print('\tdone.');
}



checkDatabaseEntries();
