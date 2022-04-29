print('Copying risk viewpoints to viewpoints arrays');

db.getSiblingDB('admin').adminCommand({listDatabases:1}).databases.forEach(function(database) {
	var myDb = db.getSiblingDB(database.name);
	print('DB: ' + database.name + ' ----------------------------------');
	myDb.getCollection('settings').find().forEach(function(setting) {
		var riskCollection = setting._id + '.risks';
		print('\tCollection: ' + riskCollection + ' ----------------------------------');
		myDb.getCollection(riskCollection).find().forEach(function(risk) {
			if(risk.viewpoint && !risk.viewpoints) {
				myDb.getCollection(riskCollection).updateOne({_id: risk._id}, {$set: {viewpoints: [risk.viewpoint]}});
			}
		});
	});
});
