const fs = require('fs');
const Utils = require("./utils");

const getNewIssuesByMonth = async (db, model) => {
	const issues = await db.collection(`${model}.issues`).find({}, {created: 1}).toArray();

	const res = [];
	issues.forEach((issue) => {
		const date = new Date(issue.created);
		const month = date.getMonth() + 1;
		const year = date.getFullYear();

		if(!res[year]) res[year] = {};

		if(!res[year][month]) {
			res[year][month] = 1
		} else {
			++res[year][month];
		}
	});

	return res;
}

const getNewRevisionsByMonth = async (db, model) => {
	const revs = await db.collection(`${model}.history`).find({}, {timestamp: 1}).toArray();

	const res = [];
	revs.forEach((rev) => {
		const date = rev.timestamp;
		const month = date.getMonth() + 1;
		const year = date.getFullYear();

		if(!res[year]) res[year] = {};

		if(!res[year][month]) {
			res[year][month] = 1
		} else {
			++res[year][month];
		}
	});

	return res;
}

const getStatsForModel = (db, model) => {
	return Promise.all([
		getNewIssuesByMonth(db, model),
		getNewRevisionsByMonth(db, model)
	]).then((res) => ({issues: res[0], revisions: res[1]}));
}

const accumulateStats = (total, current) => {
	const toProcess = [current.issues, current.revisions];

	for(let i = 0; i < toProcess.length; ++i) {
		const isIssues = i === 0;
		const data = isIssues? current.issues : current.revisions;
		const type = isIssues? "issues" : "revisions";

		for(let year in data) {
			if(!total[year]) total[year] = {};
			for(let month in data[year]) {
				if(!total[year][month]) {
					total[year][month] = {issues : 0, revisions: 0};
					total[year][month][type] = data[year][month];
				} else {
					total[year][month][type] += data[year][month];
				}
			}
		}
	}

	return total;


}

const printStats = (stream, data) => {
	stream.write("Year,Month,#Issues,#Revisions\n");
	let lastYear = -1, lastMonth = -1;
	Object.keys(data).forEach((_year) => {
		const year = parseInt(_year);
		Object.keys(data[year]).forEach((_month) => {
			const month = parseInt(_month);
			if(lastMonth !== -1) {
				let nextM = lastMonth === 12? 1 : lastMonth +1;
				let nextY = lastMonth === 12? lastYear + 1: lastYear;

				while(nextM !== month && nextY !== year) {
					stream.write(`${nextY},${nextM},0,0\n`);
					nextY = nextM === 12? nextY + 1: nextY;
					nextM = nextM === 12? 1 : nextM +1;
				}
			}
			stream.write(`${year},${month},${data[year][month].issues},${data[year][month].revisions}\n`);
			lastMonth = month;
			lastYear = year;
		});
	});
}

const reportActivity = async (db, stream) => {
	const modelSettings = await db.collection("settings").find({},{_id: 1}).toArray();

	const modelProm = [];
	modelSettings.forEach((model) => {
		modelProm.push(getStatsForModel(db, model._id));
	});

	const stats = await Promise.all(modelProm);

	const finalStats = stats.reduce(accumulateStats, {});
	printStats(stream, finalStats);

}

TS = {};

TS.createTeamspaceActivityReport = (dbConn, ts, licenseType) =>{
	return new Promise((resolve, reject) => {
		const fname = Utils.generateFileName(`${ts}_activity`);
		const writeStream = fs.createWriteStream(fname);
		writeStream.once('open', () => {
			writeStream.write(`${ts},(${licenseType})\n`);
				reportActivity(dbConn.db(ts), writeStream).then(() => {
				console.log("[DB] Generated", fname);
				writeStream.end();
				resolve(fname);
			}).catch((err) => {
				reject(err);
			});
		});
	});
}

module.exports = TS;

