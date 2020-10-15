/**
*	Copyright (C) 2019 3D Repo Ltd
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

const NewUsersPerMonth = require('./newUsersPerMonth');
const Teamspace = require('./teamspaceQuota');
const TSActivity = require('./teamspaceActivity');
const Utils = require ('./utils');

'use strict';

const DBStats = {};

const createReports = async(dbConn, ElasticClient) => {
	
	if(!ElasticClient.indices.exists({
		index: Utils.statsIndexPrefix,
	  })) {
		ElasticClient.indices.create({  
			index: Utils.statsIndexPrefix
		  },function(err,resp,status) {
			if(err) {
			  console.log(err);
			}
			else {
			  console.log("created stats index: " + Utils.statsIndexPrefix);
			}
		  });	
	}

	await NewUsersPerMonth.createNewUsersReport(dbConn, ElasticClient);
	const {teamspaces} = await Teamspace.createTeamspaceReport(dbConn, ElasticClient);
	// const files = [newUserFile, file];
	for(let i = 0; i < teamspaces.length; ++i) {
		const ts = teamspaces[i];
		console.log(`[DB] Creating teamspace activity report for ${ts.teamspace} [${i}/${teamspaces.length}]...`);
		await TSActivity.createTeamspaceActivityReport(dbConn, ElasticClient, ts.teamspace, ts.type);
	}

	// await Utils.concat(files, `${ElasticClient}/${Utils.generateFileName('dbStats')}`);

}

DBStats.createDBReport = async (dbConn, ElasticClient) => {
	console.log('[DB] Creating DB statistics report...');
	await createReports(dbConn, ElasticClient);

}

module.exports = DBStats;
