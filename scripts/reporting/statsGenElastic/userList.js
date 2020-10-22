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


UserList.createIndicies = async (dbConn, ElasticClient) => {
	console.log('[USERS] Creating index list...');

	const db = dbConn.db('admin');
	const col = await db.collection('system.users')
	const users = await col.find().toArray();
	const indicesReady = () => {};
	const indicesCreated = new Promise(indicesReady);

	// create index of Teamspaces if doesn't exist 
		users.forEach((user) => {
			// console.log("1 going to create " + user.user)
			if(!Utils.skipUser(user.user) && user.customData && !Utils.isUndefined(user.user)) { 
				// console.log("2 checking index " + user.user.toLowerCase())
				const indexName = Utils.teamspaceIndexPrefix + user.user.toLowerCase();
				const configured = ElasticClient.indices.exists({
					index: indexName
				  }).then(function (exists) {
					if (!exists) {
					  console.log('Creating index %s ...', indexName)
					  return ElasticClient.indices.create({
						index: indexName
					  }).then(function (r) {
						console.log('Index %s created:', indexName, r)
						return Promise.resolve(r)
					  })
					} else {
						console.log('Index %s exists', indexName)
					  return Promise.resolve()
					}
				  }).catch(function (err) {
					console.log('Unable to create index index %s ...', indexName, err)
					return Promise.reject(err)
				  })
				  configured.then(() => {
					  return Promise.resolve()
				  })

				// let indexExists = false;
				// const indexExistsResult = await ElasticClient.indices.exists({index: Utils.teamspaceIndexPrefix + user.user.toLowerCase()})

				// if(!indexExists) 
				//   { console.log ("4 making the call " + user.user.toLowerCase())
				// 	ElasticClient.indices.create(
				// 			{  
				// 			index: Utils.teamspaceIndexPrefix + user.user.toLowerCase()
				// 			},
				// 		    function(err,resp,status) {
				// 				if(err) {
				// 		  			console.log(err,resp);
				// 				} else {
				// 		  			console.log("created " + user.user + " " + status);
				// 				}	
				// 	  		}
				// 	  );
				// } else { console.log("why are we here?" + !indexExists)}
			}
		})
		console.log("end of the user loop")
	indicesReady()
	await indicesCreated
	console.log('[USERS] indicies list generated, sent to elastic');
}

UserList.createUsersReport = async (dbConn, ElasticClient) => {
	console.log('[USERS] Creating users list...');

	const db = dbConn.db('admin');
	const col = await db.collection('system.users')
	const users = await col.find().toArray();
	const teamspacesReady = () => {};
	const teamspacesCreated = new Promise(teamspacesReady);

	// create Teamspace details document and update if it exists
	users.forEach((user) => {
		if(!Utils.skipUser(user.user) && user.customData) { 
			if( ElasticClient.indices.exists({
				index: Utils.teamspaceIndexPrefix + user.user.toLowerCase(),
			})) { 
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
				Utils.createElasticRecord( ElasticClient, Utils.teamspaceIndexPrefix + user.user.toLowerCase(), user, body); 
			}  else {console.log(user.user + " doesn't exist") }
		}
		})

	// add new lastLogin document
	users.forEach((user) => {
		if(!Utils.skipUser(user.user) && user.customData) { 
			if(ElasticClient.indices.exists({
				index: Utils.teamspaceIndexPrefix + user.user.toLowerCase(),
			})) {
				const body = {
					"Teamspace" : user.user,
					"Last Login" : user.customData.lastLoginAt,
				}
				Utils.createElasticRecord( ElasticClient, Utils.teamspaceIndexPrefix + user.user.toLowerCase(), user, body) 
			}  else {console.log(user.user + " doesn't exist") }
		}
	})
	
	teamspacesReady()
	
	await teamspacesCreated
	console.log('[USERS] users list generated, sent to elastic');
}

module.exports = UserList;
