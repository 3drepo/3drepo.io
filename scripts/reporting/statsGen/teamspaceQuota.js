const fs = require('fs');
const Utils = require("./utils");
const TSActivity = require("./teamspaceActivity");

const getNumUsers = async (col, user) => {
	const nUsers = await col.find({"roles.db": user.user}).count();
	user.numUsers = nUsers;

	return user;
}


const writeQuotaDetails = async(dbConn, col, stream, enterprise) => {
	const type = enterprise? "enterprise" : "discretionary";
	const now = Date.now();

	const query = enterprise?
		{"customData.billing.subscriptions.enterprise": {"$exists" : true}} :
		{"customData.billing.subscriptions.discretionary": {"$exists" : true}};

	const sort = enterprise?
		{"customData.billing.subscriptions.enterprise.expiryDate" : -1} :
		{"customData.billing.subscriptions.discretionary.expiryDate" : -1};

	const ts = await col.find(query, {"customData.billing.subscriptions" : 1, "user" : 1})
		.sort(sort).toArray();

	const reportPromises = [];
	const promises = [];
	ts.forEach((user) => {
		promises.push(getNumUsers(col, user));
		const sub = enterprise? user.customData.billing.subscriptions.enterprise :  user.customData.billing.subscriptions.discretionary;
		const expired = sub.expiryDate && sub.expiryDate < now;

		!expired && reportPromises.push(TSActivity.createTeamspaceActivityReport(dbConn, user.user, type));

	});

	const res = await Promise.all(promises);

	res.forEach((user) => {
		const sub = enterprise? user.customData.billing.subscriptions.enterprise :  user.customData.billing.subscriptions.discretionary;
		const expired = sub.expiryDate && sub.expiryDate < now ? "yes" : "";
		const dateString = sub.expiryDate ? Utils.formatDate(sub.expiryDate) : "";
		stream.write(`${user.user},${type},${user.numUsers},${sub.collaborators},${sub.data/1024},${dateString},${expired}\n`);

	});

	return reportPromises;
}


const reportTeamspaceQuota = async (dbConn, stream) => {
	const col = await dbConn.db("admin").collection("system.users");
	stream.write("Teamspace,type,No. Users,Max Users,Max Data(GB),Expiry Date, expired?\n");
	const enterpriseTSProm = await writeQuotaDetails(dbConn, col, stream, true);
	const discretionaryTSProm = await writeQuotaDetails(dbConn, col, stream, false);
	return Promise.all([...enterpriseTSProm, ...discretionaryTSProm]);
}

TS = {};

TS.createTeamspaceReport = (dbConn) =>{
	return new Promise((resolve, reject) => {
		const fname = Utils.generateFileName("teamspaceQuota");
		const writeStream = fs.createWriteStream(fname);
		writeStream.once('open', () => {
			reportTeamspaceQuota(dbConn, writeStream).then((teamspaceReports) => {
				console.log("[DB] Generated", fname);
				writeStream.end();
				resolve([fname, ...teamspaceReports]);

			}).catch((err) => {
				reject(err);
			});
		});
	});
}

module.exports = TS;

