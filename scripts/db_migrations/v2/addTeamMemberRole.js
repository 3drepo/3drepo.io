print('Removing All legacy roles');

var adminDB = db.getSiblingDB('admin');
var nonExistentUsers = [];
adminDB.adminCommand({listDatabases:1}).databases.forEach(function(database){
	if(database.name !== "admin" && database.name !== "local")
	{
		var userDB = db.getSiblingDB(database.name);
		adminDB.getCollection('system.users').find({user: database.name}).forEach(function(user){
			print("============== Creating a team member role for: "+database.name+" ====================");
			userDB.createRole({
						role: "team_member", 
						privileges: [
								{resource: {db: database.name, collection: "settings"}, actions: ["find"]}
							],
						roles:[]
					});
			//this role is always granted to the owner of the teamspace
			print("This role is granted to:" );
			print("\t"+user.user);
			adminDB.grantRolesToUser(user.user, [{role:"team_member", db: database.name}]);

			//find other users
			user.customData.billing.subscriptions.forEach(function(sub){
				if(sub.assignedUser && sub.assignedUser != user.user)
				{					
					print("\t"+ sub.assignedUser);
					if(adminDB.getCollection('system.users').findOne({user: sub.assignedUser}) != null)
						adminDB.grantRolesToUser(sub.assignedUser, [{role:"team_member", db: database.name}]);
					else
						nonExistentUsers.push({user: sub.assignedUser, db: database.name});
				}
			});
		});
	}
});

print("The following users does not exist:");
for(var i = 0; i < nonExistentUsers.length; ++i)
{
	print("\t" + nonExistentUsers[i].user + " ["+nonExistentUsers[i].db+"]");
}

