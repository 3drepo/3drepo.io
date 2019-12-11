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

const fs = require('fs');
const Utils = require(`./utils.js`);

const UserList = {};

UserList.createUsersReport = async  (dbConn, folder) => {
	console.log('[USERS] Creating users list...');

	const db = dbConn.db('admin');

	const col = await db.collection('system.users')
	const users = await col.find().toArray();

	const fname = Utils.generateFileName('usersList');
	const writeStream = fs.createWriteStream(`${folder}/${fname}`);
	writeStream.once('open', () => {
		writeStream.write('Username,Email,First Name,Last Name,Country,Company,Date Created,Last Login,Mail Optout,Verified\n');
		users.forEach((user) => {
			if(!Utils.skipUser(user.user) && user.customData) {
				writeStream.write(`${user.user},${user.customData.email},${user.customData.firstName},${user.customData.lastName},`);

				const billing = user.customData.billing;
				if(billing && billing.billingInfo) {
					writeStream.write(`${billing.billingInfo.countryCode || ''},'${billing.billingInfo.company||''}',`);
				}
				else {
					writeStream.write(',,');
				}

				user.customData.createdAt && writeStream.write(Utils.formatDate(user.customData.createdAt));
				writeStream.write(',');

				user.customData.lastLoginAt && writeStream.write(Utils.formatDate(user.customData.lastLoginAt));
				writeStream.write(',');

				user.customData.mailListOptOut && writeStream.write('Yes'),
				user.customData.inactive && writeStream.write(',No'),

				writeStream.write('\n');
			}


		});
		console.log('[USERS] users list generated, written to ', fname);
		writeStream.end();
	});


}

module.exports = UserList;
