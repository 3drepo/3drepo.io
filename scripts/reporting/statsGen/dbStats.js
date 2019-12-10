const fs = require('fs');
const NewUsersPerMonth = require("./newUsersPerMonth");
const Teamspace = require("./teamspaceQuota");
const TSActivity = require("./teamspaceActivity");

"use strict";

DBStats = {};

const createReports = async(dbConn) => {
	const newUserFile = await NewUsersPerMonth.createNewUsersReport(dbConn);
	const {file, teamspaces} = await Teamspace.createTeamspaceReport(dbConn);
	const files = [newUserFile, file];
	for(let i = 0; i < teamspaces.length; ++i) {
		const ts = teamspaces[i];
		console.time(ts.teamspace);
		console.log(`[DB] Creating teamspace activity report for ${ts.teamspace} [${i}/${teamspaces.length}]...`);
		console.timeEnd(ts.teamspace);
		await TSActivity.createTeamspaceActivityReport(dbConn, ts.teamspace, ts.type);
	}

}

DBStats.createDBReport = async (dbConn) => {
	console.log("[DB] Creating DB statistics report...");
	await createReports(dbConn);

}

module.exports = DBStats;
