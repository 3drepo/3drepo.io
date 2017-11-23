print('resetting all processing flags');


db.getSiblingDB('admin').adminCommand({listDatabases:1}).databases.forEach(function(database){
	var myDb = db.getSiblingDB(database.name);
    print('DB: ' + database.name + ' ----------------------------------');
	myDb.getCollection('settings').find().forEach(function(setting){
		if(setting.status && setting.status === "processing")
		{
			var updateObj ={
				'$set':{
					"status" : "ok"
				}
			};
			print("Updating processing flag on " + setting.name);
            myDb.getCollection('settings').update({ _id: setting._id }, updateObj);
		}

	});
});
