
db.getSiblingDB('admin').adminCommand({listDatabases:1}).databases.forEach(function(database){
	var myDB = db.getSiblingDB(database.name);
	var size = myDB.stats(1024*1024*1024).storageSize;
	if(size > 10) print(database.name + ": " + size );
});
