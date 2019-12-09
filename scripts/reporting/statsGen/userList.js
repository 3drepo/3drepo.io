const fs = require('fs');
const Utils = require(`./utils.js`);

"use strict";

UserList = {};

UserList.createUsersReport = async  (dbConn) => {
	console.log("[USERS] Creating users list...");

	const db = dbConn.db("admin");

	const col = await db.collection("system.users")
	const users = await col.find().toArray();

	const fname = Utils.generateFileName("usersList");
	const writeStream = fs.createWriteStream(fname);
	writeStream.once('open', () => {
		writeStream.write("Username,Email,First Name,Last Name,Country,Company,Date Created,Last Login,Mail Optout,Verified\n");
		users.forEach((user) => {
			if(!Utils.skipUser(user.user) && user.customData) {
				writeStream.write(`${user.user},${user.customData.email},${user.customData.firstName},${user.customData.lastName},`);

				const billing = user.customData.billing;
				if(billing && billing.billingInfo) {
					writeStream.write(`${billing.billingInfo.countryCode || ""},${billing.billingInfo.company||""},`);
				}
				else {
					writeStream.write(",,");
				}

				user.customData.createdAt && writeStream.write(Utils.formatDate(user.customData.createdAt));
				writeStream.write(",");

				user.customData.lastLoginAt && writeStream.write(Utils.formatDate(user.customData.lastLoginAt));
				writeStream.write(",");

				user.customData.mailListOptOut && writeStream.write("Yes"),
				user.customData.inactive && writeStream.write(",No"),

				writeStream.write("\n");
			}


		});
		console.log("[USERS] users list generated, written to ", fname);
		writeStream.end();
	});


}

module.exports = UserList;
