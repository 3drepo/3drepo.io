/**
*	Copyright (C) 2020 3D Repo Ltd
*
*	This program is free software: you can redistribute it and/or modify
*	it under the terms of the GNU Affero General Public License as
*	published by the Free Software Foundation, either version 3 of the
*	License, or (at your option) any later version.
*
*	This program is distributed in the hope that it will be useful,
*	but WITHOUT ANY WARRANTY; without even the implied warranty of
*	MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
*	GNU Affero General Public License for more details.
*
*	You should have received a copy of the GNU Affero General Public License
*	along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/
"use strict";

const NewUsersPerMonth = require("./newUsersPerMonth");
const Teamspace = require("./teamspaceQuota");
const TSActivity = require("./teamspaceActivity");

const DBStats = {};

const createReports = async(dbConn, elasticClient) => {

	await NewUsersPerMonth.createNewUsersReport(dbConn, elasticClient);
	const teamspaces = await Teamspace.createTeamspaceReport(dbConn, elasticClient);
	for(let i = 0; i < teamspaces.length; ++i) {
		const ts = teamspaces[i];
		console.log(`[DB] Creating teamspace activity report for ${ts.teamspace} [${i + 1}/${teamspaces.length}]...`);
		await TSActivity.createTeamspaceActivityReport(dbConn, elasticClient, ts.teamspace, ts.type);
	}
};

DBStats.createDBReport = async (dbConn, elasticClient) => {
	console.log("[DB] Creating DB statistics report...");
	await createReports(dbConn, elasticClient);

};

module.exports = DBStats;
