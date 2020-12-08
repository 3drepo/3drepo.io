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

/* eslint strict: ["error", "global"]*/

"use strict";
const MongoClient = require("mongodb").MongoClient;
const UserList = require("./userList");
const DBStats = require("./dbStats");
const Elastic = require("./elastic");
const Utils = require("./utils");

if(process.argv.length < 5) {
	console.error("Not enough arguments: \n\tUsage: node genStats.js <mongo host:port> <username> <password>");
	// eslint-disable-next-line no-process-exit
	process.exit(-1);
}
const errors = [];

try {
	if (!Utils.clean(process.env.ELASTIC_CLOUD_AUTH)) {
		errors.push(new Error("ELASTIC_CLOUD_AUTH is not set"));
	}
	if (!Utils.clean(process.env.ELASTIC_CLOUD_ID)) {
		errors.push(new Error("ELASTIC_CLOUD_ID is not set"));
	}
	if (errors.length > 0) {
		throw errors;
	}
} catch (e) {
	for (let i = 0; i < e.length; i++) {
		console.error(e[i].message);
	}
	// eslint-disable-next-line no-process-exit
	process.exit(-1);
}

if (!process.env.ELASTIC_CLOUD_AUTH.split(":").length === 2) {
	console.error("Error: Failed to split ELASTIC_CLOUD_AUTH, check format " + process.env.ELASTIC_CLOUD_AUTH);
	// eslint-disable-next-line no-process-exit
	process.exit(-1);
}

process.on("unhandledRejection", (error) => {
	console.error(error); // This prints error with stack included (as for normal errors)
	throw error; // Following best practices re-throw error and let the process exit with error code
});

async function start() {

	const url = `mongodb://${process.argv[3]}:${process.argv[4]}@${process.argv[2]}/admin`;
	console.log(`Trying to connect to ${url}...`);

	const client = new MongoClient(url, { useUnifiedTopology: true });

	try {
		const db = await client.connect();
		console.log("Connected successfully!");

		const elasticClient = Elastic.createElasticClient();
		await Elastic.createMissingIndicies(elasticClient); // initalise the indicies if we're running for the first time

		// if we're running on a daily basis to keep the stats up to date we don't want to run the full DB Report
		if (Utils.clean(process.env.STATS_RUN_DAILY)) {
			await UserList.createUsersReport(db, elasticClient);
		} else {
			await Promise.all([
				UserList.createUsersReport(db, elasticClient),
				DBStats.createDBReport(db, elasticClient)
			]);
		}
		await elasticClient.close();
		await client.close();

	} catch (err) {
		console.error("Connecting failed", err);
	}
}

start();
