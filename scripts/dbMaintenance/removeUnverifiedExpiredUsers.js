print("Removing unverified users whose token has expired");

db.getSiblingDB('admin').getCollection('system.users').remove({'customData.inactive': true, 'customData.emailVerifyToken.expiredAt': {$lt: new ISODate()}});

print("done.");
