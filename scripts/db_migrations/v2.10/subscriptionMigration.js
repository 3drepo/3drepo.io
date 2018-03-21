//first move all the jobs to a new collection
print("Moving jobs from subscription entry to it's own collection and update subscription entry...");

var dryRun = false; //if true -> it doesn't write to db

var planNameConvert = { "THE-100-QUID-PLAN" : "hundredQuidPlan"};
var paidUsers = ["CWCL", "VRZH", "BWT", "TRL", "HOK_Teamspace"];
db.getSiblingDB('admin').getCollection('system.users').find({}).forEach(function(user) {
	print("=============== " + user.user + "==================");
	var jobEntrys = {};
	var subscriptions = {};
	if(user.customData.jobs) {
		user.customData.jobs.forEach(function(job){
			jobEntrys[job._id] = job;
			jobEntrys[job._id].users = [];
		});

		delete user.customData.jobs;
	}


	if(user.customData.billing.subscriptions && user.customData.billing.subscriptions.constructor === Array) {
		user.customData.billing.subscriptions.forEach(function(sub) {
			if(sub.plan == "BASIC" || !sub.active) return;
			if(sub.job && sub.assignedUser && jobEntrys[sub.job]) {
				jobEntrys[sub.job].users.push(sub.assignedUser);
			}					
			if(sub.inCurrentAgreement) {
				//this means it's a paypal plan
				if(!subscriptions.paypal) {
					subscriptions.paypal = [];
				}

				var planName =  sub.plan;
				if(planNameConvert[sub.plan]) {
					planName = planNameConvert[sub.plan];
				}
				else {
					print("Unrecognised paypal plan:" + planName);
					return;
				}


				var foundSub = subscriptions.paypal.find(function (item) {
					return item.plan === planName;
				});
				
				if(foundSub) {
					foundSub.quantity++;
				}
				else {
					print(JSON.stringify(sub));
					subscriptions.paypal.push({plan: planName, quantity: 1, expiryDate: sub.expiredAt});
				}
			}
			else if(!sub.expiredAt || sub.expiredAt > Date.now()) {
				sub.expiredAt = sub.expiredAt ? sub.expiredAt : null;
				if(paidUsers.indexOf(user.user) === -1) {
					//discretionary licenses
					if(!subscriptions.discretionary) {
						subscriptions.discretionary = {collaborators: 0, data: 0, expiryDate: sub.expiredAt};
					}
					++subscriptions.discretionary.collaborators;
					subscriptions.discretionary.data += sub.limits.spaceLimit / (1024*1024); //now storedin MiB instead of B
				}
				else {
					//enterprise licenses
					if(!subscriptions.enterprise) {
						subscriptions.enterprise = {collaborators: 0, data: 0, expiryDate: sub.expiredAt};
					}

					++subscriptions.enterprise.collaborators;
					subscriptions.enterprise.data += sub.limits.spaceLimit / (1024*1024); //now storedin MiB instead of B
				}
			}
		});
	}

	var userDB = db.getSiblingDB(user.user);
	if(userDB) {
		print("\tCreating job collection...");
		userDB.createCollection("jobs");
		for(var job in jobEntrys) {
			print("\t\tAdding " + job + "..." + JSON.stringify(jobEntrys[job]));
			if(!dryRun)
				userDB.getCollection("jobs").insert(jobEntrys[job]);
		}
	}

	if(!dryRun) {
		user.customData.billing.subscriptions = subscriptions;
		db.getSiblingDB('admin').getCollection('system.users').update({_id: user._id}, {$set : {customData : user.customData}});
	}
	print("\tUpdated Sub:");
	print("\t\t" + JSON.stringify(subscriptions));


	
});
