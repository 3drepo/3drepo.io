const MongoClient = require("mongodb").MongoClient;
const UserList = require("./userList");
const DBStats = require("./dbStats");


if(process.argv.length < 5) {
	console.error("Not enough arguments: \n\tUsage: node genStats.js <mongo host:port> <username> <password>");
	process.exit(-1);
}

const url = `mongodb://${process.argv[3]}:${process.argv[4]}@${process.argv[2]}/admin`;
const client = new MongoClient(url, { useUnifiedTopology: true });

start();

async function start() {
	console.log(`Trying to connect to ${url}...`);
	try {
		const db = await client.connect();
		console.log("Connected successfully!");
		await Promise.all([
			UserList.createUsersReport(db),
			DBStats.createDBReport(db)
		]);
		await client.close();
	} catch (err) {
		console.error("Connecting failed", err);
	}
}
