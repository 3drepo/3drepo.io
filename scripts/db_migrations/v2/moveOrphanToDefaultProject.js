//get list of model ids in project

print('Orphan models migration');

db.getSiblingDB('admin').adminCommand({listDatabases:1}).databases.forEach(function(database){

	print('Teamspace: ' + database.name);
	var myDb = db.getSiblingDB(database.name);

	var modelInProjects = [];

	myDb.getCollection('projects').find({}, { models: 1}).forEach(function(project){
	    project.models && project.models.forEach(function(id){
	        modelInProjects.push(id);
	    });
	});

	var orphanIds = [];

	myDb.getCollection('settings').find({ _id :  { $nin: modelInProjects} }, { _id: 1} ).forEach(function(setting){
		orphanIds.push(setting._id);
	});

	print('number of orphan models to move: ' + orphanIds.length);
	// create a default project if there is any orphan models
	if(orphanIds.length){

		var projectFound = myDb.getCollection('projects').findOne({ name: 'Default'});

		if(!projectFound){
			myDb.getCollection('projects').insert({
				name: 'Default',
				permissions: [],
				models: orphanIds
			});
		} else {
			myDb.getCollection('projects').update({ name: 'Default' }, { '$addToSet' : { models: { '$each' : orphanIds }}});

		}
	}

});


db.getSiblingDB('admin').getCollection('system.users').forEach(function(user){

	print('Clean customData.models');
	var models = db.getSiblingDB('admin').getCollection('system.users').findOne({ _id: user._id}, { 'customData.models': 1}).customData.models;

	if(Array.isArray(models)){
		for(var i=models.length - 1; i >=0; i--){
			if (!isUUID(models[i].model)){
				models.splice(i,1);
			}
		}
	}

	db.getSiblingDB('admin').getCollection('system.users').update({  _id: user._id}, {  '$set': {'customData.models': models}});

});

print('Done');

