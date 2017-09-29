
db.getSiblingDB('admin').adminCommand({listDatabases:1}).databases.forEach(function(database){
	print('Teamspace: ' + database.name);
	var modelNameCount = {};

	db.getSiblingDB(database.name).getCollection('settings').find({} ).forEach(function(setting){
		if(!modelNameCount[setting.name])
		{
			modelNameCount[setting.name] = 1;
		}
		else
		{	
			modelNameCount[setting.name]++;
		}
	});
	for(var key in modelNameCount)
	{
		if(modelNameCount[key] > 1)
		{
			print("\tDuplicate detected! : " + key);
			db.getSiblingDB(database.name).getCollection('settings').find({name: key}).forEach(function(setting){
				if(setting.timestamp)
				{
					print("\t\tKeeping " + setting._id);
				}
				else
				{
					print("\t\tDropping " + setting._id);
					db.getSiblingDB(database.name).getCollection('settings').remove({_id: setting._id})
					
				}
			});
		}
	}
});
