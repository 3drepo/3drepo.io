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
		const folder = `${Utils.formatDate(Date.now())}`;
		await Utils.mkdir(`${folder}/activity`);
		console.log('Connected successfully!');
		await Promise.all([
			UserList.createUsersReport(db, folder),
			DBStats.createDBReport(db, folder)
		]);
		await client.close();
	} catch (err) {
		console.error('Connecting failed', err);
	}
}
