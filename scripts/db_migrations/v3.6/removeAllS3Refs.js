print("Removing all reference bsons to S3...");

db.getSiblingDB("admin").adminCommand({listDatabases:1}).databases.forEach(function(database){
	var myDb = db.getSiblingDB(database.name);
	print('DB: ' + database.name + ' ----------------------------------');
	myDb.getCollectionNames().forEach(function(col) {
		if(col.endsWith(".ref")) {
			myDb.getCollection(col).remove({type: "s3"});
		}
	});

});
