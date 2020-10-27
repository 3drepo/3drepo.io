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

// const fs = require('fs');
const Utils = require ('./utils');

const writeNewElasticDocument = (ElasticClient, month, year, count, total ) => {
	const elasticBody = {
		"Month" : month,
		"Year" : year, 
		"Count" : count, 
		"Total" : total,
		"DateTime" : new Date(year,month).toISOString(),
	}
	const user = {}
	Utils.createElasticRecord(ElasticClient, Utils.statsIndexPrefix, elasticBody)
} 

const writeNewUserEntry = (ElasticClient, currentY, currentM, count, total, nextM, nextY) => {
	if(currentM !== -1) {
		if(nextY && nextM) {
			let month = currentM;
			let year = currentY;
			let counter = count;
			do{
				writeNewElasticDocument(ElasticClient, month, year, counter, total);
				counter = 0;
				year = month == 12? year + 1 : year;
				month = month + 1 > 12? 1 : month+1;
				if(year > 2018) break;
			} while(!(month === nextM && year === nextY));
		} else {
			writeNewElasticDocument (ElasticClient, currentM, currentY, count, total);
		}
	}

}

const reportNewUsersPerMonth = async (dbConn, ElasticClient) => {
	const col = await dbConn.db('admin').collection('system.users');
	const users = await col.find(
		{'customData.inactive' : {'$ne': true}, 'customData.createdAt': {'$exists': true}},
	).sort({'customData.createdAt' : 1}).toArray();

	// stream.write('New Users Per Month\n');
	// stream.write('Month, Year, Count, Total\n');
	let currentMonth = -1, currentYear = -1, currentCount = 0, total = 0;
	users.forEach((user) => {
		const createdAt = user.customData.createdAt;
		const month = createdAt.getMonth() + 1;
		const year = createdAt.getFullYear();

		if(currentMonth === month && currentYear === year) {
			++currentCount;
		} else {
			total += currentCount;
			writeNewUserEntry(ElasticClient, currentYear, currentMonth, currentCount, total, month, year);

			currentMonth = month;
			currentYear = year;
			currentCount = 1;
		}
	});

	if(currentMonth !== -1) {
		const now = new Date();
		const targetDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);
		total += currentCount;
		writeNewUserEntry(ElasticClient, currentYear, currentMonth, currentCount, total, targetDate.getMonth()+1, targetDate.getFullYear());
	}
}

const NewUsers = {};

NewUsers.createNewUsersReport = (dbConn, ElasticClient) =>{
	return new Promise((resolve, reject) => {
		// const fname = Utils.generateFileName(`${folder}/newUsersPerMonth`);
		// const writeStream = fs.createWriteStream(fname);
		// writeStream.once('open', () => {
			reportNewUsersPerMonth(dbConn, ElasticClient).then(() => {
				console.log('[DB] Generated NewUsersReport');
				// writeStream.write('\n\n\n');
				// writeStream.end();
				resolve("fname");
			}).catch((err) => {
				reject(err);
			});
		// });
	});
}

module.exports = NewUsers;

