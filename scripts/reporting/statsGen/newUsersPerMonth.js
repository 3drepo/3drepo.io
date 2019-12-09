const fs = require('fs');

const writeNewUserEntry = (stream, currentY, currentM, count, total, nextM, nextY) => {
	if(currentM !== -1) {
		if(nextY && nextM) {
			let month = currentM;
			let year = currentY;
			let counter = count;
			do{
				stream.write(`${month},${year},${counter},${total}\n`);
				counter = 0;
				year = month == 12? year + 1 : year;
				month = month + 1 > 12? 1 : month+1;
				if(year > 2018) break;
			} while(!(month === nextM && year === nextY));
		} else {
			stream.write(`${currentM},${currentY},${count},${total}\n`);
		}
	}

}

const reportNewUsersPerMonth = async (dbConn, stream) => {
	const col = await dbConn.db("admin").collection("system.users");
	const users = await col.find(
		{"customData.inactive" : {"$ne": true}, "customData.createdAt": {"$exists": true}},
	).sort({"customData.createdAt" : 1}).toArray();

	stream.write("Month, Year, Count, Total\n");
	let currentMonth = -1, currentYear = -1, currentCount = 0, total = 0;
	users.forEach((user) => {
		const createdAt = user.customData.createdAt;
		const month = createdAt.getMonth() + 1;
		const year = createdAt.getFullYear();

		if(currentMonth === month && currentYear === year) {
			++currentCount;
		} else {
			total += currentCount;
			writeNewUserEntry(stream, currentYear, currentMonth, currentCount, total, month, year);

			currentMonth = month;
			currentYear = year;
			currentCount = 1;
		}
	});

	if(currentMonth !== -1) {
		total += currentCount;
		writeNewUserEntry(stream, currentYear, currentMonth, currentCount, total);
	}
}

NewUsers = {};

NewUsers.createNewUsersReport = (dbConn) =>{
	return new Promise((resolve, reject) => {
		const fname = Utils.generateFileName("newUsersPerMonth");
		const writeStream = fs.createWriteStream(fname);
		writeStream.once('open', () => {
			reportNewUsersPerMonth(dbConn, writeStream).then(() => {
				console.log("[DB] Generated", fname);
				writeStream.end();
				resolve(fname);
			}).catch((err) => {
				reject(err);
			});
		});
	});
}

module.exports = NewUsers;

