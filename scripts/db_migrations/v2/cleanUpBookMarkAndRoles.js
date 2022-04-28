var adminDB = db.getSiblingDB('admin');
adminDB.getCollection('system.users').find().forEach(function(user){
		print("========== Processing " + user.user+ "============");
		adminDB.getCollection('system.users').updateOne({"user" : user.user}, {$unset: {"customData.models": "", "customData.projects": ""}});

});
