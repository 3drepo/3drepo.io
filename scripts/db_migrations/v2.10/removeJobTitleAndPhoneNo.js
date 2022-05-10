// mongo --host hostname --port port -u username -p password --authenticationDatabase db scripts/db_migrations/v2.10/removeJobTitleAndPhoneNo.js

print('removing jobTitle and phoneNo from users');

var dryRun = false; // if true -> it doesn't write to db

db.getSiblingDB('admin').getCollection('system.users').find().forEach(function(user) {
	var msg = 'User: ' + user.user;

	if (!dryRun) {
		var res = db.getSiblingDB('admin').getCollection('system.users').updateOne({ _id: user._id }, { $unset: { "customData.billing.billingInfo.jobTitle": "", "customData.billing.billingInfo.phoneNo": "" } });
		if (res.nModified > 0) {
			msg += ' <== updated';
		}
	}

	print(msg);
});
