var adminDB = db.getSiblingDB('admin');
adminDB.getCollection('system.users').find().forEach(function(user){
		print("========== Processing " + user.user+ "============");
		if(user.user === "adminUser"|| user.user === "nodeUser") return;
		var needUpdate = false;
		var newRoles = [];
		user.roles.forEach(function(role){
			if(role.role !== "team_member")
			{
				needUpdate = true;
				print("Old role found: "  + role.db + ":" + role.role);
			}
			else
				newRoles.push(role);

		});
		if(needUpdate)
		{
			adminDB.getCollection('system.users').update({"user": user.user}, {"$set" : {"roles": newRoles}});
		}
		
});
