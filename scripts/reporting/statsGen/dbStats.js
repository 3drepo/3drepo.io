const fs = require('fs');
const NewUsersPerMonth = require("./newUsersPerMonth");
const TeamspaceQuota = require("./teamspaceQuota");

"use strict";

DBStats = {};

const createReports = async(dbConn) => {
	const newUserFile = await NewUsersPerMonth.createNewUsersReport(dbConn);
	const tsQuotaFile = await TeamspaceQuota.createTeamspaceQuotaReport(dbConn);
}

DBStats.createDBReport = async (dbConn) => {
	console.log("[DB] Creating DB statistics report...");
	await createReports(dbConn);

}

module.exports = DBStats;
