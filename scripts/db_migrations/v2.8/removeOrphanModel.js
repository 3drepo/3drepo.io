print('Remove all orphaned models/collections');

db.getSiblingDB('admin').adminCommand({listDatabases: 1}).databases.forEach(function(database){
	print("=============== " +database.name + "==================");
	myDB = db.getSiblingDB(database.name);
	var validModels = {};
	myDB.getCollection('settings').find({},{_id: 1}).forEach(function(setting) {
		validModels[setting._id]  = 1;
	});

	myDB.getCollectionNames().forEach(function(colName){
		var colNameSplit = colName.split(".");
		if(colName.length > 36 && colNameSplit.length > 1) {
			if(!validModels[colNameSplit[0]]) {
				myDB.getCollection(colName).drop();
				print("Removing " + colName);	
			}
		}
	});

});
