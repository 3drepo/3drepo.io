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

'use strict'
const MongoClient = require('mongodb').MongoClient;
const UserList = require('./userList');
const DBStats = require('./dbStats');
const Utils = require('./utils');
const ELASTIC_CLOUD_AUTH = process.env.ELASTIC_CLOUD_AUTH.split(":")

process.on("unhandledRejection", (error) => {
	console.error(error); // This prints error with stack included (as for normal errors)
	throw error; // Following best practices re-throw error and let the process exit with error code
  })

const { Client } = require('@elastic/elasticsearch')
const ElasticClient = new Client({
	cloud: {
	  id: process.env.ELASTIC_CLOUD_ID
	},
	auth: {
	  username: ELASTIC_CLOUD_AUTH[0],
	  password: ELASTIC_CLOUD_AUTH[1]
	}
  });
  
ElasticClient.cluster.health({},function(err,resp,status) {  
	console.log("-- Client Health --",resp);
});

if(process.argv.length < 5) {
	console.error('Not enough arguments: \n\tUsage: node genStats.js <mongo host:port> <username> <password>');
	process.exit(-1);
}

const url = `mongodb://${process.argv[3]}:${process.argv[4]}@${process.argv[2]}/admin`;
const client = new MongoClient(url, { useUnifiedTopology: true });

start();

async function start() {
	console.log(`Trying to connect to ${url}...`);
	try {
		const db = await client.connect();
		// const folder = `${Utils.formatDate(Date.now())}`;
		// await Utils.mkdir(`${folder}/activity`);
		console.log('Connected successfully!');
		await Promise.all([
			UserList.createUsersReport(db, ElasticClient),
		]);
		
		await Promise.all([
			DBStats.createDBReport(db, ElasticClient)
		]);

		await client.close();
	} catch (err) {
		console.error('Connecting failed', err);
	}
}
