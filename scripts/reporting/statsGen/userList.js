const dateFormat = require('dateformat');
const fs = require('fs');

UserList = {};

const skipUser = (username) => {
	return username === "adminUser" || username === "nodeUser";
}

UserList.createUsersReport = async  (dbConn) => {
	console.log("Creating users list....");
	const db = dbConn.db("admin");
	const date = dateFormat(new Date(), "dd-mm-yy");
	const fname = `usersList_${date}.csv`;
	const col = await db.collection("system.users")
	const users = await col.find().toArray();

	const writeStream = fs.createWriteStream(fname);
	writeStream.once('open', () => {
		writeStream.write("Username,Email,FirstName,Last Name,Country,Company,Date Created,Mail Optout,Verified\n");
		users.forEach((user) => {
			if(!skipUser(user.user) && user.customData) {
				writeStream.write(`${user.user},${user.customData.email},${user.customData.firstName},${user.customData.lastName},`);

				const billing = user.customData.billing;
				if(billing && billing.billingInfo) {
					writeStream.write(`${billing.billingInfo.countryCode || ""},${billing.billingInfo.company||""},`);
				}
				else {
					writeStream.write(",,");
				}
				if(user.customData.createdAt) {
					writeStream.write(dateFormat(user.customData.createdAt, "dd-mm-yy"));
				}

				writeStream.write(",");
				user.customData.mailListOptOut && writeStream.write("Yes"),
				user.customData.inactive && writeStream.write(",No"),

				writeStream.write("\n");
			}


		});
		console.log("Users stats written to", fname);
		writeStream.end();
	});


}

module.exports = UserList;
