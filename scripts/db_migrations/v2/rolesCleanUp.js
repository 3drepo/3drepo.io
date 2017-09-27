print('Removing All legacy roles');

db.getSiblingDB('admin').getCollection('system.roles').find().forEach(function(role){
	if(role.db != "admin")
	{
		print("Removing role: " + role._id);
		db.getSiblingDB(role.db).dropRole(role.role);
	}

});
