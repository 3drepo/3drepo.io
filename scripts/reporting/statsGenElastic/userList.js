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
const Utils = require(`./utils.js`);

const UserList = {};

UserList.createUsersReport = async (dbConn, ElasticClient) => {
	console.log('[USERS] Creating users list...');

	const db = dbConn.db('admin');
	const col = await db.collection('system.users')
	const users = await col.find().toArray();
	// const teamspacesReady = () => {};
	// const teamspacesCreated = new Promise(teamspacesReady);
	// create Teamspace details document and update if it exists
	for (const index in users) {
		const user = users[index]
		if(!Utils.skipUser(user.user) && user.customData && !Utils.isUndefined(user.user)) {
				const body = {
					"Teamspace" : user.user,
					"Email" : user.customData.email, 
					"First Name" : user.customData.firstName, 
					"Last Name" : user.customData.lastName, 
					"Country" : user.customData.countryCode, 
					"Company" : user.customData.company, 
					"Date Created" : user.customData.createdAt, 
					"Mail Optout" : user.customData.mailListOptOut, 
					"Verified" : user.customData.inactive, 
				}
				await Utils.createElasticRecord( ElasticClient, Utils.teamspaceIndexPrefix + "-users", body, user.user.toLowerCase() );
				if ( !Utils.clean(user.customData.lastLoginAt === undefined )) {
					const lastLogin = {
						"Teamspace" : user.user,
						"Last Login" : user.customData.lastLoginAt,
					}
					await Utils.createElasticRecord( ElasticClient, Utils.teamspaceIndexPrefix + "-login", lastLogin) 
				}
		}
	}
	
	// teamspacesReady()
	// await teamspacesCreated
	console.log('[USERS] users list generated, sent to elastic');
}

module.exports = UserList;
