// No need to run on production, doesn't do anything if db doesn't have projects

print('Project permissions patch');

db.getSiblingDB('admin').adminCommand({listDatabases:1}).databases.forEach(function(database){
	var myDb = db.getSiblingDB(database.name);
	myDb.projects.find({}).forEach(function(project){
		if(project.permissions){
			project.permissions.forEach(function(permission){
				if(permission.permissions.length){
					db.getSiblingDB('admin').system.users.update({ user: permission.user}, { '$addToSet': {
						'customData.projects': {
							account: database.name,
							project: project._id,
						}
					} })
				}
			});
		}

	});
});

print('Done');



