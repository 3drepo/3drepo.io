print("Changing plan name in invoices");

var dryRun = false; //if true -> it doesn't write to db

var planNameConvert = { "THE-100-QUID-PLAN" : "hundredQuidPlan"};
db.getSiblingDB('admin').getCollection('system.users').find({}).forEach(function(user) {
	if(!user.customData || !user.customData.billing) return;
	print("=============== " + user.user + "==================");

	var userDB = db.getSiblingDB(user.user);
	if(userDB) {
		userDB.getCollection("invoices").find({}).forEach(function(invoice){
			invoice.items.forEach(function(item){
				if(planNameConvert[item.name]) {
					item.name = planNameConvert[item.name];
				}
			});

			print("invoice items updated: " + JSON.stringify(invoice.items));

			if(!dryRun) {
				userDB.getCollection("invoices").updateOne({_id: invoice._id}, {$set: {items : invoice.items}});
			}
		});
	}




	
});
