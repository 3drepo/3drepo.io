const fs = require('fs');
const NewUsersPerMonth = require("./newUsersPerMonth");
const Teamspace = require("./teamspaceQuota");

"use strict";

DBStats = {};

const createReports = async(dbConn) => {
	const newUserFile = await NewUsersPerMonth.createNewUsersReport(dbConn);
	let files = await Teamspace.createTeamspaceReport(dbConn);

}

DBStats.createDBReport = async (dbConn) => {
	console.log("[DB] Creating DB statistics report...");
	await createReports(dbConn);

}

module.exports = DBStats;
